import os
import shutil
import subprocess
import time
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

REPO_DIR = Path(__file__).resolve().parent.parent
EVIDENCE_DIR = REPO_DIR / "docs" / "evidencias"
TMP_VIDEO_DIR = REPO_DIR / ".test-artifacts" / "videos"


def wait_for_url(url: str, timeout: float = 30.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=2) as resp:
                if resp.status < 500:
                    return True
        except Exception:
            time.sleep(0.5)
    raise RuntimeError(f"Timeout waiting for {url}")


def convert_video_assets(webm_path: Path, base_name: str) -> None:
    mp4_path = EVIDENCE_DIR / f"{base_name}.mp4"
    gif_path = EVIDENCE_DIR / f"{base_name}.gif"
    target_webm = EVIDENCE_DIR / f"{base_name}.webm"

    shutil.copy2(webm_path, target_webm)
    print(f"Saved WebM video: {target_webm.relative_to(REPO_DIR)}")

    ffmpeg_bin = shutil.which("ffmpeg")
    if not ffmpeg_bin:
        print("ffmpeg not found in PATH, skipping mp4/gif conversion")
        return

    # Convert to H.264 MP4
    subprocess.run(
        [
            ffmpeg_bin,
            "-y",
            "-i",
            str(target_webm),
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-preset",
            "fast",
            "-crf",
            "23",
            str(mp4_path),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True,
    )
    print(f"Saved MP4 video:  {mp4_path.relative_to(REPO_DIR)}")

    # Convert to optimized GIF for inline GitHub PR rendering
    scale_w = 960 if "pc" in base_name else 360
    subprocess.run(
        [
            ffmpeg_bin,
            "-y",
            "-i",
            str(target_webm),
            "-vf",
            f"fps=10,scale={scale_w}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer",
            str(gif_path),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True,
    )
    print(f"Saved GIF video:  {gif_path.relative_to(REPO_DIR)}")


def run_desktop_e2e(playwright) -> Path:
    print("\n--- [1/2] Running Desktop (1440x900) E2E Flow ---")
    desktop_video_dir = TMP_VIDEO_DIR / "pc"
    desktop_video_dir.mkdir(parents=True, exist_ok=True)

    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={"width": 1440, "height": 900},
        record_video_dir=str(desktop_video_dir),
        record_video_size={"width": 1440, "height": 900},
    )
    page = context.new_page()

    # 1. Welcome Screen & Brand Verification
    page.goto("http://127.0.0.1:3000", wait_until="networkidle")
    page.wait_for_timeout(1000)
    assert page.locator(".brand-plate img").is_visible(), "Boopay vector logo must be visible"
    assert page.locator(".intent-card").count() == 4, "Must render 4 intent cards"
    page.screenshot(path=str(EVIDENCE_DIR / "mvp-01-welcome-desktop.png"))

    # 2. Switch connectors briefly to demonstrate multi-store adapter readiness
    page.locator(".connector-btn", has_text="WooCommerce").click()
    page.wait_for_timeout(500)
    page.locator(".connector-btn", has_text="Boopay Demo").click()
    page.wait_for_timeout(500)

    # 3. Conversational Discovery + AI Curated Kit
    page.locator(".intent-card").first.click()
    page.wait_for_selector(".kit-card", timeout=15000)
    page.wait_for_timeout(1000)

    # 4. Add 4-item Bundle to Bag
    page.locator(".kit-card .button-primary").first.click()
    page.wait_for_selector(".kit-lines .kit-line", timeout=10000)
    page.wait_for_timeout(900)
    assert page.locator(".kit-lines .kit-line").count() == 4, "4 bundle items must be in bag"
    page.screenshot(path=str(EVIDENCE_DIR / "mvp-02-discovery-and-kit.png"))

    # 5. Run GEO Readiness Audit in chat
    page.locator("button", has_text="Auditar sinais GEO no chat").click()
    page.locator(".agent-widget", has_text="Auditoria de Prontidão Agêntica").wait_for(timeout=15000)
    page.wait_for_timeout(1000)

    # 6. Open 3-Step Invisible Checkout Modal
    page.locator(".panel-cta").click()
    page.wait_for_selector(".checkout-steps", timeout=10000)
    page.wait_for_timeout(800)

    # Step 1 (Delivery) -> Step 2 (Payment)
    page.locator(".checkout-actions .button-primary").click()
    page.wait_for_timeout(800)

    # Step 2 (Payment) -> Step 3 (Review)
    page.locator(".checkout-actions .button-primary").click()
    page.wait_for_timeout(800)

    # Guard-rail test: attempt confirm without explicit checkbox
    page.locator(".checkout-actions .button-primary").click()
    page.wait_for_selector(".input-error", timeout=5000)
    page.wait_for_timeout(700)

    # Check explicit human confirmation checkbox
    page.locator(".dialog input[type='checkbox']").check()
    page.wait_for_timeout(700)
    page.screenshot(path=str(EVIDENCE_DIR / "mvp-03-invisible-checkout-review.png"))

    # Confirm order
    page.locator(".checkout-actions .button-primary").click()
    page.wait_for_selector(".tracking-events", timeout=10000)
    page.wait_for_timeout(900)

    # Advance post-sale order status through stages
    for _ in range(3):
        page.locator(".order-tracking-widget .button-secondary").last.click()
        page.wait_for_timeout(700)

    page.screenshot(path=str(EVIDENCE_DIR / "mvp-04-order-confirmed-tracking.png"))
    page.wait_for_timeout(1000)

    video_path = Path(page.video.path())
    context.close()
    browser.close()
    print("[OK] Desktop E2E assertions passed!")
    return video_path


def run_mobile_e2e(playwright) -> Path:
    print("\n--- [2/2] Running Mobile (390x844) E2E Flow ---")
    mobile_video_dir = TMP_VIDEO_DIR / "mobile"
    mobile_video_dir.mkdir(parents=True, exist_ok=True)

    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={"width": 390, "height": 844},
        is_mobile=True,
        has_touch=True,
        record_video_dir=str(mobile_video_dir),
        record_video_size={"width": 390, "height": 844},
    )
    page = context.new_page()

    # 1. Load Mobile Welcome Screen
    page.goto("http://127.0.0.1:3000", wait_until="networkidle")
    page.wait_for_timeout(900)

    # 2. Open Mobile Menu Modal briefly
    page.locator(".mobile-menu").click()
    page.wait_for_selector(".dialog", timeout=5000)
    page.wait_for_timeout(600)
    page.locator(".dialog-header .icon-button").click()
    page.wait_for_timeout(500)

    # 3. Select 2nd Intent Card (Kit Nômade Digital & Viagem)
    page.locator(".intent-card").nth(1).click()
    page.wait_for_selector(".kit-card", timeout=15000)
    page.wait_for_timeout(900)

    # 4. Add Combo to Bag on Mobile
    page.locator(".kit-card .button-primary").first.click()
    page.wait_for_selector(".mobile-kit-btn .kit-badge", timeout=10000)
    page.wait_for_timeout(800)

    # 5. Open Mobile Bag Modal & Start Invisible Checkout
    page.locator(".mobile-kit-btn").click()
    page.wait_for_selector(".dialog", timeout=5000)
    page.wait_for_timeout(700)
    page.locator(".dialog .primary", has_text="Fechar pedido").click()
    page.wait_for_selector(".checkout-steps", timeout=10000)
    page.wait_for_timeout(700)

    # Step 1 -> Step 2 -> Step 3
    page.locator(".checkout-actions .button-primary").click()
    page.wait_for_timeout(700)
    page.locator(".checkout-actions .button-primary").click()
    page.wait_for_timeout(700)

    # Check explicit confirmation & complete order on mobile
    page.locator(".dialog input[type='checkbox']").check()
    page.wait_for_timeout(600)
    page.locator(".checkout-actions .button-primary").click()
    page.wait_for_selector(".tracking-events", timeout=10000)
    page.wait_for_timeout(800)

    # Advance logistics stage on mobile
    page.locator(".order-tracking-widget .button-secondary").last.click()
    page.wait_for_timeout(800)
    page.screenshot(path=str(EVIDENCE_DIR / "mvp-05-mobile-responsive.png"))
    page.wait_for_timeout(1000)

    video_path = Path(page.video.path())
    context.close()
    browser.close()
    print("[OK] Mobile E2E assertions passed!")
    return video_path


def main() -> None:
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    if TMP_VIDEO_DIR.exists():
        shutil.rmtree(TMP_VIDEO_DIR, ignore_errors=True)
    TMP_VIDEO_DIR.mkdir(parents=True, exist_ok=True)

    env = os.environ.copy()
    env.setdefault("DATABASE_URL", "file:./local.db")

    npx_cmd = "npx.cmd" if os.name == "nt" else "npx"
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"

    api_proc = subprocess.Popen(
        [npx_cmd, "tsx", "src/server.ts"],
        cwd=str(REPO_DIR),
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    web_proc = subprocess.Popen(
        [npm_cmd, "--prefix", "web", "run", "start"],
        cwd=str(REPO_DIR),
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    try:
        print("Starting Fastify API (:3333) and Next.js Web (:3000)...")
        wait_for_url("http://127.0.0.1:3333/health", 30)
        wait_for_url("http://127.0.0.1:3000", 30)
        print("Servers online!")

        with sync_playwright() as p:
            pc_webm = run_desktop_e2e(p)
            mobile_webm = run_mobile_e2e(p)

        convert_video_assets(pc_webm, "e2e-pc-desktop")
        convert_video_assets(mobile_webm, "e2e-mobile")
        print("\n[OK] All E2E Playwright tests and video recordings completed successfully!")
    finally:
        api_proc.terminate()
        web_proc.terminate()


if __name__ == "__main__":
    main()
