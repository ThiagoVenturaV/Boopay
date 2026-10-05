# Correções de dependências da ponte VTEX

A revisão **0.2.2** acrescenta uma [correção local do parser multipart](VTEX-MULTIPART.md), com fonte, licença e proveniência preservados. O registro abaixo descreve a revisão 0.2.1 e suas auditorias; suas contagens não devem ser atribuídas automaticamente ao pacote local novo.

O candidato **0.2.1** preserva `@vtex/api@7.5.0`, builder 7.x e telemetria/GraphQL do fornecedor. Substitui duas dependências transitivas por versões corrigidas, com decisão de compatibilidade documentada e testes. **Continua sem liberação de instalação.**

## Alterações

| Dependência | Antes | Agora | Justificativa |
|---|---|---|---|
| systeminformation | 5.23.8 | 5.33.10 | Corrige os avisos de injeção de comandos nas famílias de funções do sistema; mantém a série 5 e a API `networkStats` consumida pelo host-metrics |
| cookie | 0.3.1 | 0.7.2 | Recusa delimitadores inválidos em nome, domínio e caminho; preserva a API CommonJS `parse` usada pelos clientes Session/Segment |

A troca ultrapassa a versão exata/faixa declarada pelos pais. É uma decisão da implementação do Boopay, **não uma homologação dessas substituições pela VTEX**. O manifesto mantém `overrides` npm e `resolutions` Yarn com as mesmas versões; os lockfiles fixam a árvore e integridades. O empacotador inclui ambos. Um override apenas no npm não comprovaria a resolução via Yarn.

O Yarn também fixa o transporte de `stats-lite` no arquivo HTTPS do [commit público a0b5ee9](https://github.com/vtex/node-stats-lite/commit/a0b5ee91861f31b6ec845146b4906faf5172c430), o mesmo commit da tag `v2.2.1` já usada pelo SDK e pelo lockfile npm. Não muda sua versão nem implementação. A primeira [CI 34599780079](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34599780079) aprovou os seis testes por npm em Node 20, mas falhou na instalação limpa Yarn porque o atalho GitHub foi resolvido por SSH sem chave. A fonte HTTPS explícita elimina essa dependência de autenticação; a instalação local foi repetida em pasta e cache novos. O lockfile foi regenerado para registrar a fonte e seu checksum, e a correção deve passar novamente na CI.

Fontes dos mantenedores: [systeminformation — correção de networkInterfaces](https://github.com/sebhildebrandt/systeminformation/security/advisories/GHSA-5xpp-75jx-m839), [cookie — validação de delimitadores](https://github.com/jshttp/cookie/security/advisories/GHSA-pxg6-pf52-xh8x), [resoluções seletivas do Yarn](https://classic.yarnpkg.com/en/docs/selective-version-resolutions/) e [overrides do npm](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#overrides). A família de SDK e a variante IO vêm do [manifesto oficial](https://github.com/vtex/node-vtex-api/blob/v7.5.0/package.json). O [template de serviço da VTEX](https://github.com/vtex-apps/service-example) usa a organização de serviço e dependências de referência; isso não prova que o builder remoto aplicou este lockfile.

## Provas

`npm run vtex:catalog:test` executa seis cenários no pacote isolado. Os três anteriores cobrem minimização, assinatura, desligamento padrão, cliente oficial e perda de resposta. Os três novos verificam:

1. As versões efetivamente resolvidas pelo SDK e pelo host-metrics, sem substituir o diagnóstico IO ou o coletor pai.
2. Recusa de delimitadores malformados pelo cookie corrigido; extração e decodificação de tokens pelos clientes oficiais Session/Segment, resposta sem cookie e fallback de sessão. A rede final é sintética; o cache de segmentos é respeitado no teste.
3. Leitura de contadores de rede locais pela biblioteca corrigida e pelo wrapper de métricas do SDK, conferindo a forma dos resultados sem imprimir interfaces, endereços ou metadados da máquina. Não é ensaio de exploração das vulnerabilidades.

`npm run vtex:catalog:yarn` gera o pacote em pasta efêmera nova e instala por **Yarn 1.22.22**, com `--frozen-lockfile --ignore-scripts`. Compila e repete os seis cenários ali, comprovando que as versões alcançam o pacote gerado e que o lockfile não foi reescrito. A rotina não acessa uma loja nem executa `vtex link`. Avisos de resolução fora da faixa original são esperados e permanecem visíveis.

O ensaio `npm run vtex:catalog:smoke` confere ponte → HTTP loopback → Core, 202/200 após perda de resposta, SKU de 2.431 centavos, zero pedidos, pacote 0.2.1 e os lockfiles. Respostas VTEX e contexto de eventos continuam sintéticos. A execução local desta revisão usou Node 24.18.0 no Windows; o job da ponte na CI usa Node 20. Resultados oficiais ficam em [STATUS.md](ESTADO-ATUAL.md).

## Auditoria e limites restantes

Na verificação local de 11/09/2026, `npm audit --omit=dev` passou de **39 para 36 pacotes afetados**, de 11 para **nove altos**, mantendo 27 moderados e nenhum baixo. A redução de três entradas decorre de duas bibliotecas corrigidas e do efeito transitivo sobre host-metrics; não representa três explorações demonstradas. Os avisos de cookie/systeminformation deixaram de constar.

A árvore Yarn também foi auditada: seu resumo reportou cinco altos e 11 moderados, sem avisos para as duas bibliotecas corrigidas. As contagens de npm e Yarn representam agregações diferentes e não devem ser somadas ou comparadas como medidas de risco do aplicativo. Os dois relatórios continuam com falha de auditoria e são preservados pela CI; suas etapas permitem falha para validar o candidato, sem conceder autorização de instalação.

Continuam os avisos de OpenTelemetry/diagnóstico, dicer/GraphQL upload e uuid/Jaeger/GraphQL tools. A substituição indiscriminada por versões major atuais quebraria interfaces antigas, como `uuid/v4`, ou alteraria a composição de telemetria. Não houve downgrade do SDK, retirada de subsistemas, fork ou supressão de achados para obter auditoria verde.

A validação do worker, proxy, eventos, headers e resolução real do builder exige workspace autorizado. A política de manutenção do Node 20 gerenciado continua a confirmar, conforme [runtime](VTEX-BRIDGE-RUNTIME.md). Os achados restantes, suporte e homologação impedem a instalação; a meta integral do MVP continua aberta.

A correção completa do commit `5c588715ce65d4f28e9c84dc3f41757e30c768ca` passou nos sete jobs da [CI 34600278230](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34600278230): seis testes por npm e seis repetidos em pacote novo por Yarn, ambos em v20.20.2; lockfile congelado preservado e ensaio HTTP aprovado. Auditorias npm/Yarn mantiveram os limites descritos acima. [Evidência oficial](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/vtex-leaf-ci-2026-09-11.json).
