# Boopay for WooCommerce

> Documento de preparação comercial/operacional. Marcadores e condições externas precisam ser concluídos antes do lançamento; versão técnica corrente do plugin: 0.7.2.

Boopay for WooCommerce connects a WooCommerce store to the Boopay service. It synchronizes product data in the background and can optionally send consented, pseudonymous storefront events.

## Requirements

- WordPress 6.4 or newer.
- WooCommerce 8.2 or newer.
- PHP 7.4 or newer.
- An active Boopay service account.
- HTTPS for production connections.
- WordPress cron or Action Scheduler processing enabled.

## Install the extension

1. Purchase or obtain the extension from the Woo Marketplace.
2. In WordPress, open **Plugins > Add Plugin**.
3. Install the extension through your WooCommerce.com connection or upload the supplied ZIP.
4. Activate **Boopay for WooCommerce**.
5. Open **WooCommerce > Settings > Integrations > Boopay**.

Activating the extension does not connect to Boopay and does not enable storefront events.

## Connect your store

1. Obtain a short-lived connection code from your Boopay account.
2. Open **WooCommerce > Settings > Integrations > Boopay**.
3. Enable the integration.
4. Enter the HTTPS Boopay API URL supplied with your account.
5. Paste the connection code.
6. Select **Save changes**.

The code is exchanged for scoped credentials and then removed from the WordPress settings. Access tokens and signing secrets are not displayed in the administration screen.

## Settings reference

| Setting | Purpose | Default |
|---|---|---|
| Enable integration | Allows catalog jobs and API communication after a valid connection exists | Disabled |
| Boopay API URL | HTTPS base URL for the Boopay service | Empty |
| Connection code | One-time code used to establish scoped credentials | Empty and never retained |
| Storefront events | Enables product-view, add-to-cart, and exit-intent events | Disabled |
| Catalog batch size | Number of products processed by each background job | 25 |
| Debug logging | Writes sanitized diagnostics to WooCommerce logs | Disabled |

## Initial catalog synchronization

After the first successful connection, the extension queues a complete catalog synchronization. Products are processed in batches so that large catalogs do not need to finish in one web request.

The synchronized catalog includes product and variation identifiers, SKU, name, descriptions, status, visibility, permalink, prices, sale dates, stock, categories, tags, attributes, images, dimensions, tax class, and relevant product flags.

## Incremental updates

The extension queues an update when a product or variation changes. Price and stock changes therefore reach Boopay without requiring another full import. Product deletion queues a removal event.

Use **Synchronize catalog now** when you need to request another full synchronization.

## Storefront events and consent

Storefront events are optional and disabled by default. Before enabling them:

1. Determine the lawful basis that applies to your store and jurisdiction.
2. Configure an analytics-consent mechanism.
3. Update your store privacy notice using the suggested Boopay text.
4. Verify that the consent manager exposes the WordPress consent signal, or use the provided filter to integrate a custom decision.

When enabled and allowed, the extension can send:

- Product view: pseudonymous session ID, optional pseudonymous customer ID, product ID, and page path without query parameters.
- Add to cart: pseudonymous session/customer/cart identifiers, product and variation IDs, quantity, and a hash of the cart item key.
- Exit intent: pseudonymous session/customer/cart identifiers and product/variation IDs with quantities.

The extension does not send customer names, email addresses, postal addresses, IP addresses, or payment card data.

## Connection and health status

The Boopay settings screen displays:

- connection status and integration ID;
- catalog synchronization status and product count;
- the most recent API health result;
- buttons to test the connection, request a full synchronization, or disconnect locally.

## Background jobs

When Action Scheduler is available, jobs appear under **WooCommerce > Status > Scheduled Actions**. The extension falls back to WP-Cron when Action Scheduler is unavailable.

Temporary failures are retried up to five times with increasing delays. Authentication failures require a new connection code.

## Logs

Enable debug logging only while troubleshooting. Open **WooCommerce > Status > Logs** and select the Boopay source. Logs are sanitized and must not contain access tokens, signing secrets, or complete catalog/event payloads.

## Disconnect the store

Select **Disconnect locally** in the Boopay settings. This removes local connection credentials and stops new synchronization work. Disconnecting locally does not delete data already retained by the Boopay service.

Contact `[[SUPPORT EMAIL]]` for server-side account closure or data requests.

## Uninstall behavior

Deactivation cancels scheduled Boopay jobs while preserving settings for a later reactivation. Deleting the plugin removes its local settings, connection credentials, health status, and scheduled work.

## Troubleshooting

### Connection code rejected

Request a new code. Codes are short-lived and single-use. Confirm that the store clock is accurate and that the API URL belongs to the Boopay service.

### API URL rejected

Production URLs must use HTTPS. Plain HTTP is accepted only for local development hosts.

### Catalog remains queued

Check **WooCommerce > Status > Scheduled Actions**. Confirm that Action Scheduler or WP-Cron runs normally and that outbound HTTPS requests are allowed by the host.

### Authentication failed after a previously working connection

The token may have expired or been revoked. Disconnect locally and connect again with a new one-time code.

### Storefront events do not appear

Confirm that the feature is enabled, the store is connected, analytics consent is granted, and the relevant page/cart action is being tested. Tracking failures never interrupt the storefront.

### Checkout behavior changed

Version 0.2.0 does not replace WooCommerce checkout. Disable the extension and contact support with the WooCommerce status report and reproduction steps.

## Support

- Email: `[[SUPPORT EMAIL]]`
- Supported language(s): `[[LANGUAGES]]`
- Support hours and time zone: `[[HOURS / TIME ZONE]]`
- Initial-response target: `[[SLA]]`
- Privacy contact: `[[PRIVACY EMAIL]]`
