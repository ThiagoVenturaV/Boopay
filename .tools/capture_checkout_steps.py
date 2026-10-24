import os
import subprocess
import time
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

REPO_DIR = Path(__file__).resolve().parent.parent
EVIDENCE_DIR = REPO_DIR / "docs" / "evidencias"

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

def main():
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
        print("Waiting for servers...")
        wait_for_url("http://127.0.0.1:3333/health", 30)
        wait_for_url("http://127.0.0.1:3000", 30)

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            page.goto("http://127.0.0.1:3000", wait_until="networkidle")
            page.wait_for_timeout(1000)

            # Add combo to bag
            page.locator(".intent-card").first.click()
            page.wait_for_selector(".kit-card", timeout=15000)
            page.wait_for_timeout(1000)
            page.locator(".kit-card .button-primary").first.click()
            page.wait_for_selector(".kit-lines .kit-line", timeout=10000)
            page.wait_for_timeout(800)

            # Open checkout modal
            page.locator(".panel-cta").click()
            page.wait_for_selector(".checkout-steps", timeout=10000)
            page.wait_for_timeout(700)

            # Advance to Step 2: Payment (Digital Wallets)
            page.locator(".checkout-actions .button-primary").click()
            page.wait_for_selector(".wallet-options-grid", timeout=5000)
            page.locator(".wallet-card", has_text="Pay").click()
            page.wait_for_timeout(600)
            page.screenshot(path=str(EVIDENCE_DIR / "mvp-06-checkout-digital-wallets.png"))
            print("Saved mvp-06-checkout-digital-wallets.png")

            # Advance to Step 3: Upsell Offers
            page.locator(".checkout-actions .button-primary").click()
            page.wait_for_selector(".upsell-items-stack", timeout=5000)
            page.locator(".upsell-add-btn").first.click()
            page.wait_for_timeout(600)
            page.screenshot(path=str(EVIDENCE_DIR / "mvp-07-checkout-upsell-offers.png"))
            print("Saved mvp-07-checkout-upsell-offers.png")

            browser.close()
    finally:
        api_proc.terminate()
        web_proc.terminate()

if __name__ == "__main__":
    main()
