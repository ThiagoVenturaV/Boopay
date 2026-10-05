# Boopay for WooCommerce — support and maintenance plan

> Documento de preparação comercial/operacional. Marcadores e condições externas precisam ser concluídos antes do lançamento; versão técnica corrente do plugin: 0.7.2.

## Public support commitment

Support channel: email routed through the Woo Marketplace support flow.

- Support email: `[[SUPPORT EMAIL]]`
- Support owner: `[[NAME / ROLE]]`
- Supported languages: `[[LANGUAGES]]`
- Operating hours: `[[DAYS / HOURS / TIME ZONE]]`
- Initial response target: `[[SLA, FOR EXAMPLE ONE BUSINESS DAY]]`
- Security contact: `[[SECURITY EMAIL]]`
- Privacy contact: `[[PRIVACY EMAIL]]`

Do not promise 24/7 coverage unless staffing and monitoring actually support it.

## Information to request in a ticket

- WordPress, WooCommerce, PHP, and Boopay plugin versions.
- WooCommerce system status report with secrets removed.
- Relevant sanitized Boopay log excerpt.
- Scheduled Action status and failure message.
- Exact reproduction steps, expected result, and actual result.
- Timestamp with time zone.
- Whether HPOS, Cart/Checkout blocks, caching, or security plugins are enabled.

Never request an access token, signing secret, password, payment data, or complete database export by email.

## Severity model

| Severity | Example | Target handling |
|---|---|---|
| Critical | security issue or plugin causes broad storefront failure | acknowledge urgently, contain, patch, and coordinate disclosure |
| High | connection/catalog sync unavailable for most merchants | prioritize investigation and workaround |
| Normal | isolated sync error, configuration question, compatibility issue | handle in normal support queue |
| Low | documentation feedback or feature request | record, clarify, and triage for roadmap |

Final response targets require owner approval.

## Release cadence

- Security fixes: as soon as safely validated.
- Compatibility releases: aligned with WooCommerce and WordPress major releases.
- Product improvements: as ready, using semantic versioning.
- Minimum maintenance: release or compatibility confirmation at least every six months.
- Documentation and changelog: updated with every release.

## Release checklist

1. Update the plugin header, stable tag, `changelog.txt`, and user documentation.
2. Run the local validator and API tests.
3. Test the two latest major WordPress and WooCommerce releases and supported PHP range.
4. Run all available QIT suites.
5. Review security, privacy, and external API contract changes.
6. Build the production-only ZIP and record its SHA-256.
7. Upload the new version in the Vendor Dashboard.
8. Monitor automated results and vendor email notifications.
9. Publish or update customer-facing release notes.

## Security intake

Publish a monitored security email and a coordinated-disclosure policy. Confirm receipt without asking the reporter to expose sensitive customer data. Track scope, severity, affected versions, mitigation, fix, validation, release, and customer communication.

## Escalation boundaries

- Woo account, refund, coupon, and Marketplace platform issues: route to Woo.
- Boopay service availability, connection codes, API accounts, or retained data: Boopay team.
- Merchant hosting, cron, firewall, and TLS issues: merchant/hosting provider, with Boopay guidance.
- Legal or privacy interpretation: responsible legal/privacy owner.
