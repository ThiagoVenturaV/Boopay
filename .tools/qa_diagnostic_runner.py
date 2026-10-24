import os
import sys
import json
import time
import shutil
import subprocess
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

REPO_DIR = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = REPO_DIR / ".test-artifacts" / "qa_audit"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

findings = {
    "console_errors": [],
    "console_warns": [],
    "page_errors": [],
    "failed_requests": [],
    "http_error_responses": [],
    "wallet_audit": {},
    "asset_audit": [],
    "tests_run": [],
}

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

def setup_page_listeners(page, context_label="desktop"):
    def on_console(msg):
        entry = {
            "context": context_label,
            "type": msg.type,
            "text": msg.text,
            "location": msg.location,
        }
        if msg.type == "error":
            findings["console_errors"].append(entry)
            print(f"[{context_label.upper()} CONSOLE ERROR] {msg.text}")
        elif msg.type == "warning":
            findings["console_warns"].append(entry)
            print(f"[{context_label.upper()} CONSOLE WARN] {msg.text}")

    def on_pageerror(err):
        entry = {
            "context": context_label,
            "message": str(err),
            "stack": getattr(err, "stack", None),
        }
        findings["page_errors"].append(entry)
        print(f"[{context_label.upper()} PAGE ERROR] {err}")

    def on_requestfailed(req):
        entry = {
            "context": context_label,
            "url": req.url,
            "method": req.method,
            "failure": req.failure,
            "resource_type": req.resource_type,
        }
        findings["failed_requests"].append(entry)
        print(f"[{context_label.upper()} REQUEST FAILED] {req.method} {req.url} - {req.failure}")

    def on_response(res):
        if res.status >= 400:
            entry = {
                "context": context_label,
                "url": res.url,
                "status": res.status,
                "status_text": res.status_text,
            }
            findings["http_error_responses"].append(entry)
            print(f"[{context_label.upper()} HTTP {res.status}] {res.url}")

    page.on("console", on_console)
    page.on("pageerror", on_pageerror)
    page.on("requestfailed", on_requestfailed)
    page.on("response", on_response)

def run_audit():
    env = os.environ.copy()
    env.setdefault("DATABASE_URL", "file:./local.db")
    npx_cmd = "npx.cmd" if os.name == "nt" else "npx"
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"

    print("Launching Fastify API (:3333)...")
    api_proc = subprocess.Popen(
        [npx_cmd, "tsx", "src/server.ts"],
        cwd=str(REPO_DIR),
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    print("Launching Next.js Web (:3000)...")
    web_proc = subprocess.Popen(
        [npm_cmd, "--prefix", "web", "run", "start"],
        cwd=str(REPO_DIR),
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    try:
        wait_for_url("http://127.0.0.1:3333/health", 30)
        wait_for_url("http://127.0.0.1:3000", 30)
        print("Both servers healthy and responding!")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            # ==========================================
            # DESKTOP TESTS
            # ==========================================
            print("\n=== STARTING DESKTOP AUDIT (1440x900) ===")
            ctx = browser.new_context(viewport={"width": 1440, "height": 900})
            page = ctx.new_page()
            setup_page_listeners(page, "desktop")

            # Test 1: Page Load & Session Init
            print("[Test 1] Page Load & Session Init...")
            page.goto("http://127.0.0.1:3000", wait_until="networkidle")
            page.wait_for_timeout(1000)
            page.screenshot(path=str(ARTIFACTS_DIR / "01_desktop_loaded.png"))
            findings["tests_run"].append("Desktop Page Load & Session Init")

            # Check all images on initial screen
            images = page.locator("img").all()
            print(f"Found {len(images)} images on initial page load.")
            for img in images:
                src = img.get_attribute("src")
                natural_w = img.evaluate("el => el.naturalWidth")
                natural_h = img.evaluate("el => el.naturalHeight")
                findings["asset_audit"].append({
                    "src": src,
                    "naturalWidth": natural_w,
                    "naturalHeight": natural_h,
                    "broken": natural_w == 0 or natural_h == 0,
                })
                if natural_w == 0 or natural_h == 0:
                    print(f"[ASSET DEFECT] Broken image rendering: {src}")

            # Test 2: Sidebar collapse / expand
            print("[Test 2] Sidebar Ctrl+B and toggle button...")
            page.keyboard.press("Control+b")
            page.wait_for_timeout(500)
            collapsed = "sidebar-collapsed" in (page.locator(".workspace.app").get_attribute("class") or "")
            assert collapsed, "Sidebar should be collapsed after Ctrl+B"
            page.keyboard.press("Control+b")
            page.wait_for_timeout(500)
            collapsed2 = "sidebar-collapsed" in (page.locator(".workspace.app").get_attribute("class") or "")
            assert not collapsed2, "Sidebar should be expanded after second Ctrl+B"
            findings["tests_run"].append("Sidebar Toggle (Ctrl+B)")

            # Test 3: Chat Interaction & Streaming
            print("[Test 3] Chat Interaction & Streaming via Intent Card...")
            page.locator(".intent-card").first.click()
            page.wait_for_selector(".kit-card", timeout=15000)
            page.wait_for_timeout(1000)
            page.screenshot(path=str(ARTIFACTS_DIR / "02_chat_kit_rendered.png"))
            findings["tests_run"].append("Chat Discovery & Kit Rendering")

            # Test 4: Composer text input & submit
            print("[Test 4] Composer text message...")
            page.locator("#chat-prompt").fill("Tem fone de ouvido para corrida?")
            page.locator(".send-button").click()
            page.wait_for_timeout(3000)
            findings["tests_run"].append("Chat Composer Typing & Submit")

            # Test 5: Quick suggestions
            print("[Test 5] Quick Suggestion Chip...")
            page.locator(".quick-chip").nth(1).click()
            page.wait_for_timeout(3000)
            findings["tests_run"].append("Quick Suggestion Chip Click")

            # Test 6: Cart Actions (Add bundle, add product, change qty, remove)
            print("[Test 6] Cart Actions...")
            # Add bundle
            if page.locator(".kit-card .button-primary").count() > 0:
                page.locator(".kit-card .button-primary").first.click()
                page.wait_for_timeout(1000)

            # Add individual product from rail if present
            if page.locator(".product-add").count() > 0:
                page.locator(".product-add").first.click()
                page.wait_for_timeout(1000)

            page.screenshot(path=str(ARTIFACTS_DIR / "03_cart_items_added.png"))

            # Test qty increment (+) in right panel
            initial_count_text = page.locator(".panel-count").text_content()
            print(f"Current cart item count badge: {initial_count_text}")
            if page.locator(".qty button").count() > 0:
                plus_btn = page.locator(".qty button", has_text="+").first
                plus_btn.click()
                page.wait_for_timeout(1000)
                minus_btn = page.locator(".qty button", has_text="−").first
                minus_btn.click()
                page.wait_for_timeout(1000)

            findings["tests_run"].append("Cart Add, Qty Increment/Decrement")

            # Test 7: Coupon input in right cart panel
            print("[Test 7] Coupon input in right cart panel...")
            # Try empty via Enter key
            page.locator(".panel-card .coupon-input").press("Enter")
            page.wait_for_timeout(300)
            empty_err = page.locator(".panel-card .coupon-error-text").text_content()
            print(f"Empty coupon error via Enter: {empty_err}")

            # Try invalid
            page.locator(".panel-card .coupon-input").fill("INVALID_CODE")
            page.locator(".panel-card .coupon-btn").click()
            page.wait_for_timeout(300)
            inv_err = page.locator(".panel-card .coupon-error-text").text_content()
            print(f"Invalid coupon error: {inv_err}")

            # Try valid BOOPAY10
            page.locator(".panel-card .coupon-input").fill("BOOPAY10")
            page.locator(".panel-card .coupon-btn").click()
            page.wait_for_timeout(500)
            badge_present = page.locator(".panel-card .coupon-applied-badge").is_visible()
            print(f"Coupon BOOPAY10 applied badge visible: {badge_present}")
            page.screenshot(path=str(ARTIFACTS_DIR / "04_cart_coupon_applied.png"))

            # Remove coupon
            page.locator(".panel-card .coupon-remove-btn").click()
            page.wait_for_timeout(300)

            # Re-apply coupon KEYCORE (20%)
            page.locator(".panel-card .coupon-input").fill("KEYCORE")
            page.locator(".panel-card .coupon-btn").click()
            page.wait_for_timeout(500)
            findings["tests_run"].append("Cart Panel Coupon Validation & Removal")

            # Test 8: Dialog Modals (Profile, Help, Voice, New Session)
            print("[Test 8] Modals: Help, Profile, Voice, New...")
            # Help dialog
            page.locator(".rail-help-btn").click()
            page.wait_for_selector(".dialog", timeout=3000)
            page.wait_for_timeout(400)
            page.screenshot(path=str(ARTIFACTS_DIR / "05_modal_help.png"))
            page.locator(".dialog-header .icon-button").click()
            page.wait_for_timeout(400)

            # Profile dialog
            page.locator(".profile.rail-user").click()
            page.wait_for_selector(".dialog", timeout=3000)
            page.wait_for_timeout(400)
            page.locator("#customer-name").fill("Marina Silva QA")
            page.locator(".profile-form .primary").click()
            page.wait_for_timeout(400)

            # New Care / Conversation button in sidebar
            page.locator(".new-care").click()
            page.wait_for_timeout(1000)
            findings["tests_run"].append("Dialog Modals (Help, Profile, New Conversation)")

            # Re-add items to cart for checkout flow
            page.locator(".intent-card").first.click()
            page.wait_for_selector(".kit-card", timeout=15000)
            page.locator(".kit-card .button-primary").first.click()
            page.wait_for_selector(".kit-lines .kit-line", timeout=10000)
            page.wait_for_timeout(500)

            # Test 9: Checkout Flow across all steps and payment methods
            print("[Test 9] Checkout Flow Step 1 (Delivery)...")
            page.locator(".panel-cta").click()
            page.wait_for_selector(".checkout-steps", timeout=10000)
            page.wait_for_timeout(500)
            page.screenshot(path=str(ARTIFACTS_DIR / "06_checkout_step1_delivery.png"))

            # Delivery options: click standard, then express
            page.locator(".option-card", has_text="Entrega Padrão").click()
            page.wait_for_timeout(300)
            page.locator(".option-card", has_text="Entrega Expressa").click()
            page.wait_for_timeout(300)

            # Advance to Step 2 (Payment)
            page.locator(".checkout-actions .button-primary").click()
            page.wait_for_timeout(1000)
            page.screenshot(path=str(ARTIFACTS_DIR / "07_checkout_step2_payment.png"))

            # Audit Payment Methods and Wallet Representation
            print("[Test 10] Auditing Payment Wallets rendering...")
            wallet_cards = page.locator(".wallet-card").all()
            print(f"Found {len(wallet_cards)} wallet cards.")
            for wc in wallet_cards:
                head_text = wc.locator(".wallet-card-head").text_content()
                has_img = wc.locator("img").count() > 0
                has_svg = wc.locator("svg").count() > 0
                findings["wallet_audit"][head_text.strip()] = {
                    "has_img": has_img,
                    "has_svg": has_svg,
                    "raw_html": wc.inner_html(),
                }
                print(f"Wallet: '{head_text.strip()}' -> img={has_img}, svg={has_svg}")

            # Test selecting EACH payment method
            print("Selecting Pix...")
            page.locator(".option-card", has_text="Pix Instantâneo").click()
            page.wait_for_timeout(300)

            print("Selecting Credit Card...")
            page.locator(".option-card", has_text="Cartão de Crédito").click()
            page.wait_for_timeout(300)

            print("Selecting Apple Pay...")
            page.locator(".wallet-card", has_text="Touch / Face ID").click()
            page.wait_for_timeout(300)

            print("Selecting Google Pay...")
            page.locator(".wallet-card", has_text="1 Toque").click()
            page.wait_for_timeout(300)

            print("Selecting Samsung Pay...")
            page.locator(".wallet-card", has_text="Knox Secure").click()
            page.wait_for_timeout(300)

            print("Selecting Mercado Pago...")
            page.locator(".wallet-card", has_text="Saldo / Cartão").click()
            page.wait_for_timeout(300)

            findings["tests_run"].append("All 6 Payment Methods Click/Selection")

            # Step 2 -> Step 3 (Upsell)
            print("[Test 11] Step 2 -> Step 3 (Upsell Offers)...")
            page.locator(".checkout-actions .button-primary").click()
            page.wait_for_timeout(800)
            page.screenshot(path=str(ARTIFACTS_DIR / "08_checkout_step3_upsell.png"))

            # Toggle upsell items
            upsell_btns = page.locator(".upsell-add-btn").all()
            print(f"Found {len(upsell_btns)} upsell offer buttons.")
            if len(upsell_btns) > 0:
                upsell_btns[0].click()
                page.wait_for_timeout(500)
                if len(upsell_btns) > 1:
                    upsell_btns[1].click()
                    page.wait_for_timeout(500)
                    # Toggle off the second one
                    upsell_btns[1].click()
                    page.wait_for_timeout(500)

            findings["tests_run"].append("Step 3 Upsell Selection & Toggle")

            # Step 3 -> Step 4 (Review)
            print("[Test 12] Step 3 -> Step 4 (Review)...")
            page.locator(".checkout-actions .button-primary").click()
            page.wait_for_timeout(800)
            page.screenshot(path=str(ARTIFACTS_DIR / "09_checkout_step4_review.png"))

            # Coupon input inside Checkout modal
            print("[Test 13] Coupon in checkout review modal...")
            # If coupon is already applied from cart panel, remove it first
            if page.locator(".dialog .coupon-remove-btn").is_visible():
                print("Coupon was already applied from cart panel. Testing removal in modal...")
                page.locator(".dialog .coupon-remove-btn").click()
                page.wait_for_timeout(500)

            # Test empty coupon via Enter in modal
            page.locator(".dialog .coupon-input").press("Enter")
            page.wait_for_timeout(300)
            modal_empty_err = page.locator(".dialog .coupon-error-text").text_content()
            print(f"Modal empty coupon error: {modal_empty_err}")

            page.locator(".dialog .coupon-input").fill("BOOPAY10")
            page.locator(".dialog .coupon-btn").click()
            page.wait_for_timeout(500)
            modal_coupon_ok = page.locator(".dialog .coupon-applied-badge").is_visible()
            print(f"Modal coupon BOOPAY10 applied: {modal_coupon_ok}")

            # Guardrail test: Submit without checkbox
            print("[Test 14] Guardrail: submit without explicit checkbox...")
            page.locator(".checkout-actions .button-primary").click()
            page.wait_for_timeout(500)
            guard_err = page.locator(".input-error").is_visible()
            print(f"Guardrail error visible: {guard_err}")
            assert guard_err, "Guardrail error must be shown when submitting without explicit checkbox"

            # Check explicit confirmation checkbox
            print("[Test 15] Order Confirmation...")
            page.locator(".dialog input[type='checkbox']").check()
            page.wait_for_timeout(500)
            page.screenshot(path=str(ARTIFACTS_DIR / "10_checkout_ready_to_confirm.png"))

            # Confirm order
            page.locator(".checkout-actions .button-primary").click()
            page.wait_for_selector(".tracking-events", timeout=12000)
            page.wait_for_timeout(1000)
            page.screenshot(path=str(ARTIFACTS_DIR / "11_order_confirmed_tracking.png"))
            findings["tests_run"].append("Order Confirmation & Tracking Events")

            # Advance logistics stages
            for i in range(3):
                adv_btn = page.locator(".order-tracking-widget .button-secondary").last
                if adv_btn.is_visible():
                    adv_btn.click()
                    page.wait_for_timeout(700)

            ctx.close()

            # ==========================================
            # MOBILE TESTS
            # ==========================================
            print("\n=== STARTING MOBILE AUDIT (390x844) ===")
            m_ctx = browser.new_context(
                viewport={"width": 390, "height": 844},
                is_mobile=True,
                has_touch=True,
            )
            m_page = m_ctx.new_page()
            setup_page_listeners(m_page, "mobile")

            print("[Mobile Test 1] Mobile Home Load...")
            m_page.goto("http://127.0.0.1:3000", wait_until="networkidle")
            m_page.wait_for_timeout(1000)
            m_page.screenshot(path=str(ARTIFACTS_DIR / "12_mobile_home.png"))

            print("[Mobile Test 2] Mobile Navigation Menu Dialog...")
            m_page.locator(".mobile-menu").click()
            m_page.wait_for_selector(".dialog", timeout=5000)
            m_page.wait_for_timeout(500)
            m_page.screenshot(path=str(ARTIFACTS_DIR / "13_mobile_menu_dialog.png"))
            m_page.locator(".dialog-header .icon-button").click()
            m_page.wait_for_timeout(500)

            print("[Mobile Test 3] Mobile Intent Discovery & Kit...")
            m_page.locator(".intent-card").nth(1).click()
            m_page.wait_for_selector(".kit-card", timeout=15000)
            m_page.locator(".kit-card .button-primary").first.click()
            m_page.wait_for_timeout(1000)

            print("[Mobile Test 4] Mobile Bag Modal...")
            m_page.locator(".mobile-kit-btn").click()
            m_page.wait_for_selector(".dialog", timeout=5000)
            m_page.wait_for_timeout(500)
            m_page.screenshot(path=str(ARTIFACTS_DIR / "14_mobile_bag_dialog.png"))

            # Start checkout on mobile
            m_page.locator(".dialog .primary").click()
            m_page.wait_for_selector(".checkout-steps", timeout=10000)
            m_page.wait_for_timeout(500)

            # Mobile checkout: Delivery -> Payment -> Upsell -> Review
            m_page.locator(".checkout-actions .button-primary").click()
            m_page.wait_for_timeout(600)
            m_page.locator(".checkout-actions .button-primary").click()
            m_page.wait_for_timeout(600)
            m_page.locator(".checkout-actions .button-primary").click()
            m_page.wait_for_timeout(600)

            # Check explicit box and complete
            m_page.locator(".dialog input[type='checkbox']").check()
            m_page.wait_for_timeout(500)
            m_page.screenshot(path=str(ARTIFACTS_DIR / "15_mobile_checkout_review.png"))
            m_page.locator(".checkout-actions .button-primary").click()
            m_page.wait_for_selector(".tracking-events", timeout=12000)
            m_page.wait_for_timeout(1000)
            m_page.screenshot(path=str(ARTIFACTS_DIR / "16_mobile_order_confirmed.png"))

            # ==========================================
            # FAILURE & RESILIENCE TESTS
            # ==========================================
            print("\n=== STARTING FAILURE & RESILIENCE AUDIT ===")
            fail_ctx = browser.new_context()
            fail_page = fail_ctx.new_page()
            setup_page_listeners(fail_page, "failure_test")

            # Test Failure 1: /api/conversations returns 500
            print("[Failure Test 1] Mocking /api/conversations 500 error...")
            fail_page.route("**/api/conversations", lambda route: route.fulfill(
                status=500,
                content_type="application/json",
                body=json.dumps({"error": "internal_server_error"})
            ))

            fail_page.goto("http://127.0.0.1:3000", wait_until="networkidle")
            fail_page.wait_for_timeout(1000)
            fail_page.screenshot(path=str(ARTIFACTS_DIR / "17_conversations_500_failure.png"))
            findings["tests_run"].append("Conversations 500 Failure Resilience")

            # Test Wallet Asset URLs on disk & network
            print("\n[Asset Audit] Checking Wallet SVG Assets on http://127.0.0.1:3000...")
            wallet_assets = [
                "/brand/wallets/apple-pay.svg",
                "/brand/wallets/google-pay.svg",
                "/brand/wallets/pix.svg",
                "/brand/wallets/samsung-pay.svg",
                "/brand/wallets/mercado-pago.svg",
            ]
            wallet_file_audit = []
            for path in wallet_assets:
                file_on_disk = (REPO_DIR / "web" / "public" / path.lstrip("/")).resolve()
                exists = file_on_disk.exists()
                status_code = None
                try:
                    req = urllib.request.Request(f"http://127.0.0.1:3000{path}", headers={"User-Agent": "BoopayQA"})
                    with urllib.request.urlopen(req, timeout=3) as resp:
                        status_code = resp.status
                except urllib.error.HTTPError as he:
                    status_code = he.code
                except Exception as ex:
                    status_code = str(ex)

                wallet_file_audit.append({
                    "path": path,
                    "exists_on_disk": exists,
                    "disk_path": str(file_on_disk),
                    "http_status": status_code,
                })
                print(f"Asset: {path} -> on_disk={exists}, HTTP={status_code}")
            findings["wallet_asset_urls"] = wallet_file_audit

            fail_ctx.close()
            m_ctx.close()
            browser.close()

        # Save findings
        findings_path = ARTIFACTS_DIR / "audit_results.json"
        with open(findings_path, "w", encoding="utf-8") as f:
            json.dump(findings, f, indent=2, ensure_ascii=False)
        print(f"\n[OK] Diagnostic run completed. Results saved to {findings_path}")

    finally:
        print("Terminating Fastify API and Next.js Web servers...")
        api_proc.terminate()
        web_proc.terminate()
        try:
            api_proc.wait(timeout=5)
            web_proc.wait(timeout=5)
        except Exception:
            api_proc.kill()
            web_proc.kill()

if __name__ == "__main__":
    run_audit()
