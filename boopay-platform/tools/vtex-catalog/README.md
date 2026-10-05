# Boopay Catalog Bridge — candidato VTEX IO

Este pacote contém a ponte de eventos `vtex.broadcaster` para a fila incremental do Core. **Não está liberado para instalação:** o SDK oficial `@vtex/api@7.5.0` traz vulnerabilidades transitivas registradas em `docs/VTEX-CATALOG-UPDATES.md`. Compilação e testes sintéticos não homologam o runtime VTEX nem resolvem essa auditoria. Nenhuma loja foi instalada, vinculada ou ativada.

O candidato 0.2.6 usa **Node builder 7.x**, com TypeScript **5.5.3** e tipos Node **20.0.0**. Inclui o Core local `1.30.1-boopay.1`, com os dois fontes oficiais de baggage corrigido, preservando a API 1.x e o Core 2.9.0 separado do Jaeger. Mantém a camada privada `@boopay/uuid-compat@0.1.0`, que preserva `uuid/v4` e delega os algoritmos ao pacote oficial `uuid@11.1.1`. Mantém o backport HTTP local `@opentelemetry/exporter-prometheus@0.57.2-boopay.1`, com TypeScript, compilados, licença e proveniência, preservando as agregações do provedor 1.x. Mantém o propagador oficial Jaeger **2.9.0**, as correções de systeminformation/cookie e o parser local `dicer@0.3.0-boopay.1`. Os pacotes locais são mantidos pelo Boopay, sem homologação pelo fornecedor. Consulte `docs/VTEX-BAGGAGE.md`, `docs/VTEX-UUID.md`, `docs/VTEX-PROMETHEUS.md`, `docs/VTEX-JAEGER.md`, `docs/VTEX-MULTIPART.md` e `docs/VTEX-BRIDGE-DEPENDENCIES.md` no repositório da plataforma. Auditorias de versões não certificam esses patches; os achados e a homologação restantes ainda impedem instalação. O Core e o ensaio HTTP continuam em Node 24; a CI testa a ponte em Node 20, cujo suporte gerenciado precisa ser confirmado com a VTEX.

As configurações são privadas (o manifesto omite `settingsSchema.access`), com `enabled=false`. A chave deve ser criada fora do Git e configurada nos dois servidores, nunca no storefront. O evento transporta apenas conta, SKU e data da alteração. O Core relê Search e preferências nativas; preço/estoque do evento não são aceitos. O Broadcaster não cobre alterações nas contas dos sellers.

Na raiz do repositório:

```sh
npm ci --ignore-scripts --prefix tools/vtex-catalog/node
npm run vtex:catalog:test
npm run vtex:catalog:yarn
npm run build
npm run vtex:catalog:smoke
node tools/vtex-catalog/build.mjs --vendor authorizedvendor --account authorized-test-account --origin https://boopay.example --connection vtex-test --out artifacts/runtime/vtex-catalog-candidate
```

O empacotador exige uma pasta nova, limita a permissão de saída à origem/rota exatas e não inclui chave, node_modules, testes ou a compilação da ponte. As dependências mantidas incluem seus fontes e arquivos de execução pela lista explícita. O resultado é fonte para revisão, com `installationReady=false`; não é instalador. Consulte o contrato completo no repositório privado em `docs/VTEX-CATALOG-UPDATES.md` antes de configurar qualquer ambiente. A liberação requer resolver a auditoria do SDK com versões suportadas pela VTEX e testar em workspace/conta autorizados.
