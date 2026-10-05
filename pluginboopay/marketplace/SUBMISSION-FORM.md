# Boopay for WooCommerce — submission form draft

> Documento de preparação comercial/operacional. Marcadores e condições externas precisam ser concluídos antes do lançamento; versão técnica corrente do plugin: 0.7.2.

Use this document to fill the Woo Marketplace submission form. Text between `[[...]]` requires an owner decision or external evidence before submission.

## Submission classification

- Product: Boopay for WooCommerce
- Recommended submission type: SaaS / integration
- Plugin version: 0.2.0
- Plugin slug: `boopay-woocommerce`
- Vendor: `[[LEGAL COMPANY OR APPROVED VENDOR NAME]]`
- Product owner: `[[NAME AND ROLE]]`
- Support email: `[[SUPPORT EMAIL]]`
- Product website: `[[PUBLIC HTTPS PRODUCT URL]]`
- Privacy policy: `[[PUBLIC HTTPS PRIVACY URL]]`
- Terms of service: `[[PUBLIC HTTPS TERMS URL]]`
- Demo: `[[PUBLIC HTTPS DEMO URL]]`

The final classification must be confirmed with the Marketplace team because the plugin connects WooCommerce to the externally operated Boopay service.

## Product upload

- Candidate ZIP: `output/wordpress/boopay-woocommerce-0.7.2.zip`
- Main folder: `boopay-woocommerce/`
- Main file: `boopay-woocommerce.php`
- Current version header: 0.2.0
- Required `changelog.txt`: included
- Testing instructions: `marketplace/REVIEWER-INSTRUCTIONS.md`
- Validation report: `marketplace/VALIDATION-REPORT.md`

Replace the checksum here after the final package is rebuilt:

- SHA-256: `[[GENERATED DURING FINAL PACKAGING]]`

## Business rationale

WooCommerce merchants need an accurate, continuously updated bridge between their store catalog and the Boopay commerce service. Manual imports become stale when prices, stock, variations, or product availability change. Boopay for WooCommerce makes this connection native to the WooCommerce settings area and updates the Boopay catalog in the background.

The integration also gives merchants an optional, consent-aware way to send pseudonymous storefront activity to Boopay. This helps the service understand product interest without transmitting payment card data or direct customer identity.

## Target merchants

- WooCommerce stores that use the Boopay SaaS service.
- Merchants that need automated product, price, stock, and variation synchronization.
- Teams that want optional pseudonymous product-interest events under their own consent policy.
- Stores that prefer native WooCommerce settings and Action Scheduler operations.

## Core value

- Reduces manual catalog maintenance.
- Keeps Boopay aligned with the source WooCommerce catalog.
- Uses short-lived connection codes instead of asking merchants to copy permanent API secrets.
- Signs outbound payloads and retries temporary failures in the background.
- Keeps storefront events disabled until the merchant explicitly enables them.

## Product differentiation

The extension combines native WooCommerce administration, a canonical catalog payload, incremental synchronization, consent-aware event collection, HMAC request signing, idempotency, bounded retries, and health diagnostics in one focused integration. It does not replace WooCommerce checkout and does not access payment card data.

## Company and developer history

`[[Provide 2-4 factual paragraphs covering: legal company name, founding year, location, ownership of the Boopay service, relevant commerce/software experience, team size, and long-term maintenance responsibility. Do not submit unverifiable claims.]]`

## Competitive context

The primary alternatives are manual catalog export/import, generic feed tools, custom one-off integrations, or operating Boopay without a native WooCommerce connector. This extension is specific to the Boopay service and is maintained alongside its API contract.

`[[Add named competitors only after a current Marketplace search and a factual feature/price comparison.]]`

## Monetization decision

Woo's current rules for integration plugins provide two relevant paths:

1. Billing API — recommended when Woo should manage the merchant subscription and revenue share.
2. Partnership Agreement — the plugin is listed free while the external service bills the merchant; this requires discretionary approval and a formal agreement.

Externally billed integrations cannot use the normal paid-plugin license model.

Selected path: `[[BILLING API OR PARTNERSHIP AGREEMENT]]`

- Currency: `[[CURRENCY]]`
- Billing cadence: `[[MONTHLY / ANNUAL / OTHER]]`
- Public price: `[[PRICE]]`
- Trial: `[[NONE OR TERMS]]`
- Existing price elsewhere: `[[PRICE AND URL, OR NOT SOLD ELSEWHERE]]`

## Data and privacy summary

The plugin contacts the configured Boopay API only after a store administrator enables the integration and completes the short-lived code exchange. It synchronizes catalog data. Optional storefront events remain disabled by default and are gated by merchant configuration and a compatible analytics-consent signal when available.

The plugin does not send customer names, email addresses, postal addresses, IP addresses, passwords, payment card numbers, or card security codes. See `marketplace/PRIVACY-DISCLOSURE.md` for the complete field-level description.

## Compatibility and quality summary

- PHP 7.4 through 8.3 tested in the local matrix.
- WordPress 6.9 and 7.0 tested.
- WooCommerce 10.9.4 and 11.0.1 tested.
- HPOS compatibility declared.
- No shortcode dependency.
- No custom checkout replacement.
- Plugin Check 2.1.0 completed locally with exit code 0.
- Managed QIT remains required in the vendor submission environment.

## Testing access

- Staging API URL: `[[STAGING API URL]]`
- One-time connection code: `[[GENERATE IMMEDIATELY BEFORE REVIEW]]`
- Code expiry: `[[UTC TIMESTAMP]]`
- Demo store URL: `[[DEMO STORE URL]]`
- WordPress admin URL: `[[REVIEW ADMIN URL]]`
- Reviewer username: `[[REVIEW USERNAME]]`
- Reviewer password delivery method: `[[SECURE CHANNEL; DO NOT PUT PASSWORD IN THIS FILE]]`
- Review support contact: `[[NAME, EMAIL, TIME ZONE]]`

## Launch ownership

- Engineering owner: `[[NAME]]`
- Security contact: `[[NAME / EMAIL]]`
- Privacy contact: `[[NAME / EMAIL]]`
- Customer support owner: `[[NAME / EMAIL]]`
- Release approver: `[[NAME / ROLE]]`
