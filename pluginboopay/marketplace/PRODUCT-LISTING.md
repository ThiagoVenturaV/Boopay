# Boopay for WooCommerce — product listing draft

> Documento de preparação comercial/operacional. Marcadores e condições externas precisam ser concluídos antes do lançamento; versão técnica corrente do plugin: 0.7.2.

Draft for the Woo Marketplace vendor portal. The final price, support contact, public legal URLs, and brand approval must be supplied before submission.

## Product type

SaaS integration / extension.

## Product name

Boopay for WooCommerce

## Short description

Keep your WooCommerce catalog and consented storefront activity securely synchronized with Boopay.

## Suggested highlight color

`#063E3B`

## Product description

Keep Boopay aligned with what your store actually sells.

Boopay for WooCommerce securely connects your store to the Boopay service, synchronizes products in the background, and can share consented storefront activity without exposing payment details or customer identity.

### Keep product data current

Start with a complete catalog sync, then send incremental updates whenever products, variations, prices, or stock change. Deleted products are also removed from the connected catalog.

### Connect without copying permanent secrets

Enter a short-lived connection code in WooCommerce. The plugin exchanges it for scoped credentials, signs API payloads with HMAC-SHA-256, and never displays the token or signing secret in the administration screen.

### Respect merchant and shopper choices

Storefront events are disabled by default. Merchants must enable them separately, and the plugin respects analytics consent when a compatible consent manager is available. Event identifiers are pseudonymous, and this version does not send names, email addresses, postal addresses, IP addresses, or payment card data.

### Operate from the WooCommerce dashboard

Configure Boopay under WooCommerce settings, monitor connection and catalog status, trigger a resynchronization, and test API health without leaving WordPress.

## Key features

- Native WooCommerce integration settings.
- Full and incremental product catalog synchronization.
- Product, variation, price, stock, and deletion updates.
- Optional consent-aware product view, add-to-cart, and exit-intent events.
- Short-lived connection-code exchange.
- Signed requests, idempotency keys, and bounded retries.
- Background processing with Action Scheduler and WP-Cron fallback.
- Sanitized WooCommerce logs and built-in connection diagnostics.
- High-Performance Order Storage compatibility declaration.

## Requirements

[box]This extension requires WooCommerce 8.2 or higher, WordPress 6.4 or higher, PHP 7.4 or higher, and an active Boopay service account.[/box]

Production connections require HTTPS. The Boopay service terms and privacy policy will be linked from the final Marketplace documentation.

## Frequently asked questions

### Does the extension process payments?

No. Version 0.2.0 synchronizes catalog data and optional consented storefront events. It does not access or transmit payment card information.

### Does tracking start automatically?

No. Storefront events are disabled by default and require separate activation by the merchant after consent and privacy requirements are addressed.

### What happens when the API is temporarily unavailable?

Background jobs use bounded retries. Administrators can inspect sanitized logs, test the connection, and manually request a catalog resynchronization.

### Is HPOS supported?

Yes. The extension declares HPOS compatibility and uses WooCommerce CRUD objects.

### Will synchronization slow down the storefront?

Catalog work runs in background jobs. Storefront event failures are isolated and never interrupt product pages, cart actions, or checkout.

### What do I need before connecting?

You need an active Boopay service account, the HTTPS API URL supplied by Boopay, and a short-lived connection code.

### Where can I get help?

Use the support request option on this product page. Requests are routed to the Boopay support team at `[[SUPPORT EMAIL]]`.

## Search terms

catalog synchronization, product feed, consented analytics, storefront events, SaaS integration, agentic commerce

## Product data features

- Full catalog synchronization.
- Incremental product updates.
- Price and stock updates.
- Product and variation support.
- Product deletion events.
- Consent-aware storefront events.
- Background retries and idempotency.
- Connection and API health diagnostics.
- HPOS compatibility.

## Compatibility fields

- WordPress: 6.4 or newer.
- WooCommerce: 8.2 or newer.
- PHP: 7.4 or newer.
- HPOS: compatible.
- Cart and Checkout blocks: no checkout replacement or shortcode dependency.
- External account: active Boopay service account required.

## Gallery

Upload in this order:

1. `assets/gallery/01-featured.png`
   - Alt text: Boo beside a summary of Boopay for WooCommerce catalog synchronization, connection-code security, and default-disabled storefront events.
2. `assets/gallery/02-native-setup.png`
   - Alt text: Illustrated WooCommerce Boopay settings showing the integration enabled, one-time connection code, and storefront events disabled by default.
3. `assets/gallery/03-live-catalog.png`
   - Alt text: Boopay review dashboard showing one connected WooCommerce store, a synchronized product, and two received storefront events.
4. `assets/gallery/04-privacy-controls.png`
   - Alt text: Privacy overview showing storefront events disabled by default and listing customer and payment data the plugin never sends.
5. `assets/gallery/05-reliable-sync.png`
   - Alt text: Flow from WooCommerce through the background queue to the signed Boopay API with retries and sanitized diagnostics.

Every gallery image is 1792x1100 PNG, exceeds the Marketplace minimum of 896x550, and contains no access token or signing secret.

## Product icon

Three 160x160 PNG options are available under `assets/icon-options/`:

- `boopay-product-icon-amigo.png` — recommended; friendly Boo mascot and current gallery palette.
- `boopay-product-icon-pulso.png` — higher-energy lime signal.
- `boopay-product-icon-agente.png` — more technical B2B agent direction.

All three avoid baked-in corner radii and keep the symbol legible at the 80x80 display size. `assets/boopay-product-icon.png` currently mirrors the recommended Amigo option. Brand-owner approval is pending.

## Fields still requiring an owner decision

- Suggested retail price and billing model.
- Vendor support email and response owner.
- Public privacy policy and terms of service URLs.
- Public HTTPS demo URL.
- Final product icon / brand-route approval.
- Trial, refund, and renewal policy, if applicable.
