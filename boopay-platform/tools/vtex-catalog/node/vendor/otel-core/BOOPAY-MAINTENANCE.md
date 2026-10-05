# Boopay maintained OpenTelemetry Core

Version 1.30.1-boopay.1 preserves the 1.30.1 API required by the VTEX IO diagnostics stack. Its 51 TypeScript sources were recovered from official npm source maps. Two files, `baggage/utils.ts` and `baggage/propagation/W3CBaggagePropagator.ts`, use the unmodified official 2.9.0 source to enforce inbound baggage limits and handle malformed percent escapes. `version.ts` identifies this local build. All other sources retain their original hashes.

The original Apache-2.0 license and README are preserved. `BOOPAY-PROVENANCE.json` records both published package integrities, all source hashes, changed files and the original export list. TypeScript 5.5.3 builds CommonJS, ESM and ESNext outputs; Node integration tests exercise CommonJS. Browser and bundler execution is not validated.

The Boopay repository owns this backport. It is not an official OpenTelemetry release or VTEX approval. Version audits do not certify it. SDK/runtime support and authorized store homologation remain pending.
