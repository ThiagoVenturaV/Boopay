# Boopay for WooCommerce — privacy and data disclosure

> Documento de preparação comercial/operacional. Marcadores e condições externas precisam ser concluídos antes do lançamento; versão técnica corrente do plugin: 0.7.2.

This is a technical disclosure and suggested merchant copy. It is not a substitute for legal review of Boopay's public privacy policy, terms, data-processing agreement, retention schedule, or the merchant's obligations in each jurisdiction.

## When the external service is contacted

The plugin does not contact Boopay merely because it is installed or activated. API communication begins after a store administrator enables the integration, configures the service URL, and submits a short-lived connection code.

Catalog synchronization occurs while the integration is enabled and connected. Storefront events require a second setting and remain disabled by default.

## Catalog fields sent

- WooCommerce product and parent identifiers.
- SKU, product type, name, slug, status, visibility, permalink, descriptions, and featured/purchasable/downloadable flags.
- Currency, current/regular/sale prices, sale status, and sale dates.
- Stock management, quantity, stock status, and backorder settings.
- Tax status/class and shipping dimensions/units.
- Categories, tags, attributes, variations, image URLs, image alternative text, and create/update timestamps.

Catalog data describes the merchant's products. It does not include order, payment, or customer profile records.

## Optional storefront-event fields

| Event | Fields |
|---|---|
| Product view | random session UUID, pseudonymous customer ID when logged in, product ID, same-origin page URL without query parameters |
| Add to cart | random session UUID, pseudonymous customer ID, product/variation IDs, quantity, pseudonymous cart ID, SHA-256 cart-item-key hash |
| Exit intent | random session UUID, pseudonymous customer ID, same-origin page URL, pseudonymous cart ID, product/variation IDs, quantities |

The customer and cart pseudonyms are one-way HMAC values derived with secrets from the WordPress installation. The API does not receive the underlying WordPress user ID or WooCommerce session identifier.

## Data explicitly excluded

- Customer name and username.
- Email address and phone number.
- Billing and shipping address.
- IP address.
- Passwords and authentication cookies.
- Order notes.
- Payment card number, expiration date, security code, or payment token.
- URL query strings.

## Local cookie

When storefront events are enabled and consent allows the tracker to load, the plugin creates `boopay_session_id`, a random UUID used to associate events from the same browser.

- Lifetime: 30 days.
- Scope: `/` on the merchant store.
- SameSite: `Lax`.
- Secure: enabled on HTTPS stores.
- Purpose: analytics/event correlation for the Boopay service.

## Security controls

- Credentials are issued through a short-lived, single-use connection code.
- API payloads are signed with HMAC-SHA-256.
- Idempotency keys prevent duplicate processing.
- Tokens and signing secrets are not rendered in the administration interface or written to sanitized logs.
- Browser events are accepted only from the store origin and are rate-limited without storing IP addresses.
- Temporary API failures use bounded retries.

## Retention and deletion decisions still required

The Boopay service owner must publish exact answers for:

- catalog retention after disconnection;
- storefront-event retention;
- log and backup retention;
- account deletion and data-subject request procedure;
- subprocessors and international transfers;
- controller/processor roles;
- security incident contact and breach procedure.

These values cannot be inferred from the plugin code.

## Suggested text for the merchant's privacy policy

### Boopay

We use Boopay to synchronize our product catalog with the Boopay service. When analytics consent is granted and storefront events are enabled, Boopay may also receive pseudonymous product-view, add-to-cart, and exit-intent events. These events may contain a random session identifier, one-way pseudonymous customer or cart identifiers, product and variation identifiers, quantities, and the page path without query parameters.

The Boopay integration does not send customer names, email addresses, postal addresses, IP addresses, or payment card data. A first-party cookie named `boopay_session_id` may be stored for up to 30 days to associate consented events from the same browser.

Data is sent to `[[BOOPAY LEGAL ENTITY AND SERVICE LOCATION]]`. See `[[BOOPAY PRIVACY POLICY URL]]` for retention, legal basis, data-subject rights, subprocessors, and international-transfer information. Contact `[[PRIVACY CONTACT]]` for privacy requests.

The merchant must adapt this text to its jurisdiction, actual consent configuration, lawful basis, and public Boopay policies before publication.
