# ACP/UCP — fundação REST de teste

Estado em 10/09/2026: descoberta, autorização delegada, assinaturas, criação/leitura/atualização/conclusão/cancelamento de checkout, revisão pelo comprador, conciliação por leitura e retenção temporária implementados. ACP e UCP passaram também na jornada HTTP com WooCommerce/PHP/MySQL nativos. **O marco completo de protocolos permanece parcial:** rastreamento físico, recuperação assistida e homologação externa ainda precisam ser concluídos. O [cadastro e consentimento visual](PROTOCOL-ACCESS.md) está implementado em Configurações e `/protocol-access`. Consulta de pedidos e notificações assinadas estão implementadas e verificadas conforme [PROTOCOL-ORDERS.md](PROTOCOL-ORDERS.md).

As versões fixadas são ACP **2026-04-17** e UCP **2026-08-25**. Fonte e licenças estão em [vendor/protocols](PROTOCOLOS-FONTES.md). Contratos e testes locais não representam disponibilidade no ChatGPT, Gemini ou outra superfície oficial.

O runtime compilado resolve `vendor/protocols` a partir de `dist/src/protocols/contracts.js`, independentemente da pasta de execução. Distribuir `dist` junto de `vendor`, preservando essa estrutura. Um teste inicia o carregador em processo filho com diretório temporário fora do projeto; a verificação dos 133 hashes cobre os bytes originais e a cópia preparada para Git.

## Arquitetura e fronteiras

`src/protocols` traduz contratos para `CheckoutService`. Produtos, preço, estoque, descontos, impostos, frete e confirmação pertencem ao mesmo Core utilizado pelo simulador e WooCommerce. O adaptador não aceita preço enviado como autoridade. A prévia sandbox usa a política fixa do Core sem inventar endereço; a cotação confirmável exige destino. Atribuição registra `acp/<versão>` ou `ucp/<versão>`, com evidência **simulated** enquanto não existir observação externa verificada.

O perfil é bilateral e de teste: a loja cadastra um perfil público e suas chaves; o servidor não busca URLs arbitrárias nem presume que o domínio foi homologado pelo operador do protocolo. UCP negocia checkout, entrega simples e handlers pela versão cadastrada. Extensões, meios de pagamento ou campos não implementados são recusados, nunca silenciosamente convertidos em capacidade ativa.

## Autorização

1. Administrador cadastra o cliente em `POST /v1/admin/protocol-clients`, enviando `name`, `profileUrl` HTTPS, `protocols` e `profile` UCP com `ucp.version`, `services`, `capabilities`, `payment_handlers` e `keys` públicos.
2. Comprador, em sua sessão própria, concede acesso com `POST /v1/buyer/protocol-grants`: `{ "clientId": "...", "protocols": ["ucp"], "accepted": true }`.
3. O resultado entrega uma credencial delegada de no máximo 30 minutos, limitada ao cliente, comprador, tenant e protocolos. Ela não é uma sessão de comprador e não pode chamar `/confirm`, APIs administrativas ou dados de outro comprador.
4. Todas as chamadas de protocolo usam `Authorization: Bearer <credencial delegada>` e assinatura da chave privada do cliente. Chamadas com cookies ou `Origin` são recusadas nesses endpoints de servidor. O navegador usa exclusivamente as APIs de comprador.

Revogação: `DELETE /v1/admin/protocol-clients/:id` desativa o cliente imediatamente; `DELETE /v1/buyer/protocol-grants/:id` revoga a autorização do comprador. Não há cadastro público anônimo de plataformas. Chave privada de cliente é proibida no perfil. Segredos, tokens e cookies não devem ir para arquivos versionados, URL ou logs.

## Endpoints

| Operação | ACP | UCP |
|---|---|---|
| Descoberta | `GET /.well-known/acp` | `GET /.well-known/ucp` |
| Base | `/v1/protocols/acp` | `/v1/protocols/ucp` |
| Criar | `POST /checkout_sessions` | `POST /checkout-sessions` |
| Ler | `GET /checkout_sessions/:id` | `GET /checkout-sessions/:id` |
| Atualizar | `POST /checkout_sessions/:id` | `PUT /checkout-sessions/:id` |
| Concluir | `POST /checkout_sessions/:id/complete` | `POST /checkout-sessions/:id/complete` |
| Cancelar | `POST /checkout_sessions/:id/cancel` | `POST /checkout-sessions/:id/cancel` |

ACP exige `API-Version: 2026-04-17`. UCP exige `UCP-Agent: profile="https://perfil-cadastrado/..."`, exatamente o perfil associado à credencial. Alterações exigem `Idempotency-Key`; o exemplo e o cliente de teste usam UUID v4. Limite de corpo: 128 KiB. Limites adicionais: 50 linhas, 99 unidades por produto e endereço brasileiro nesta implementação.

O perfil anuncia checkout/entrega e a capacidade de pedidos documentada em [PROTOCOL-ORDERS.md](PROTOCOL-ORDERS.md); não anuncia AP2, WBA, MCP, A2A, split payment, cupons ou 3DS de protocolo. A implementação Stripe/cartão/Google Pay da aplicação é independente deste transporte e ainda não é um handler ACP/UCP delegado.

## Assinatura e repetições

RFC 9421 com ES256/P-256 e assinatura `r||s` de 64 bytes. `Content-Digest` usa SHA-256 dos bytes originais (RFC 9530). Cobertura: método, autoridade, caminho, query quando presente, autorização delegada, versão/perfil, chave de idempotência e tipo/digest do corpo. Cobrir `authorization` também é requisito bilateral do boopay. `src/protocols/signatures.ts` oferece `signRequest` para o cliente de teste.

O verificador aceita rótulos válidos e outras ordens de componentes, ignora chaves de algoritmos desconhecidos quando uma assinatura ES256 válida está presente e não confunde DER com a representação exigida. UCP não exige `created` na assinatura padrão; se houver `created`/`expires`, o servidor rejeita datas inválidas, assinatura futura e expiração. A credencial delegada tem sua própria expiração verificada a cada chamada. WBA e `Signature-Agent` não estão ativos.

Respostas de operações autenticadas são assinadas com chave de comerciante persistida sob AES-GCM. A chave pública está em `/.well-known/ucp`. Isso inclui a representação exata dos bytes devolvidos ao cliente. Erros anteriores à autenticação podem não ter assinatura.

O registro de idempotência usa tenant + comprador + cliente + protocolo + método/caminho/chave. Registra SHA-256 do corpo bruto, reserva antes do efeito e cifra a resposta. Repetição igual devolve a resposta guardada (`Idempotent-Replayed: true`). Outros bytes, até mudanças só de espaçamento JSON, geram conflito: 422 no ACP, 409 no UCP.

Uma reserva em execução retorna 409 e `Retry-After`. Depois de 45 segundos sem resultado registrado, retorna 503 `operation_uncertain`. **Não existe retomada automática de um efeito não observado**: consultar o checkout e conciliar é necessário. Reiniciar o processo não remove a reserva. Não trocar a chave para contornar um resultado desconhecido. Quando a sessão Core está em `reconciliation_required`, o GET ACP/UCP consulta a tentativa comercial original e projeta o resultado observado; não reenvia a compra. Se a consulta continuar indisponível, mantém `complete_in_progress`. A reserva de protocolo sem resposta e sem identificador de checkout recuperável ainda exige recuperação assistida.

## Retenção dos dados temporários

`ProtocolRetention` limita rascunhos cifrados e corpos de resposta idempotente a **48 horas desde a criação**, sem ampliar o prazo a cada consulta ou atualização. A autenticação das autorizações continua limitada a no máximo 30 minutos. Credenciais expiradas ou revogadas são removidas do registro; consultas de autorização verificam a validade independentemente do ciclo de limpeza.

Depois do prazo, o acesso ao rascunho retorna 410 `protocol_session_expired`; uma repetição cuja resposta expirou retorna 410 `protocol_result_expired`, sem novo efeito. O ciclo remove os corpos cifrados e conserva somente vínculo mínimo de sessão ou reserva de operação, hash, estado e datas. Reservas sem resultado permanecem incertas e não se tornam uma autorização para repetir a compra. Repetir uma chave antiga com outro corpo continua causando conflito. Uma conclusão ou atualização que chega depois do prazo não pode restaurar o corpo removido.

O acesso é recusado no instante do limite; a remoção lógica ocorre no próximo ciclo bem-sucedido ou na próxima inicialização. O processo principal executa a limpeza no início e a cada minuto junto do ciclo de privacidade. `POST /v1/admin/protocol-retention` com `{}` permite executar a política no tenant do administrador e retorna apenas contagens. Não aceita substituição de tenant. O ciclo global também remove autorizações expiradas de tenants que já não constem do catálogo administrativo. Registros legados usam a criação do Checkout como prazo; rascunhos órfãos sem data confiável são removidos.

Checkout, pedido, evidências financeiras e seus dados comerciais originais continuam sob a finalidade operacional declarada pela aplicação. Apagar o perfil de personalização não cancela pedidos nem equivale ao expurgo dessas cópias operacionais. A remoção verificada aqui é lógica no banco ativo; compactação de SQLite/WAL, backups e eliminação em serviços externos ainda precisam da política operacional do ambiente.

## Jornada WooCommerce pelo protocolo

`scripts/woocommerce-protocols.ts` integra o ensaio nativo da CI. Para ACP e UCP, cadastra cliente/chave de teste por HTTP, delega pela sessão de comprador, cria e atualiza a compra assinada e exige nova confirmação após mudar itens/endereço. Um preço de catálogo deliberadamente desatualizado não substitui o preço calculado pelo Woo. O ensaio interrompe a resposta após o pedido ser gravado e a primeira consulta; replay devolve o resultado original e GET concilia a mesma tentativa. Confere no Woo um pedido BACS pendente, endereço revisado, estoque de três para uma unidade e ausência de nova receita paga. Assinaturas de resposta são verificadas sobre os bytes HTTP recebidos. Cliente de protocolo e falha de rede são sintéticos; a execução nativa em CI é a prova necessária desta jornada.

## Comprador no controle

`continue_url` aponta para `/protocol-review?checkout=<id>`, sem token. A página exige a mesma sessão do comprador; não cria outra identidade nem exige acesso administrativo. Reutiliza o Checkout, carrega a compra existente e mantém o checkbox desmarcado. O estado pronto só surge após confirmação do resumo pelo comprador. Mudança de preço/endereço/carrinho ou expiração de cotação exige nova confirmação no Core.

O pedido de conclusão enviado pelo agente não confirma automaticamente nada. Quando falta revisão, a resposta traz `requires_escalation` e a instrução de abrir `continue_url`. O navegador também pode concluir a simulação usando o fluxo manual existente.

## Corpos de exemplo

UCP, criação com quantidade e destino único:

```json
{
  "line_items": [{ "item": { "id": "camiseta-areia-m" }, "quantity": 1 }],
  "fulfillment": { "methods": [{
    "type": "shipping",
    "destinations": [{ "address_country": "BR", "postal_code": "50000000" }]
  }] }
}
```

ACP, uma unidade por entrada (restrição do esquema fixado):

```json
{
  "line_items": [{ "id": "camiseta-areia-m" }],
  "currency": "brl",
  "capabilities": {}
}
```

Depois da confirmação do comprador, UCP pode enviar:

```json
{
  "payment": { "instruments": [{
    "id": "sandbox-instrument-1",
    "handler_id": "br.com.boopay.sandbox",
    "type": "boopay_test",
    "selected": true,
    "credential": { "type": "token", "token": "boopay-sandbox-success" }
  }] }
}
```

ACP usa `payment_data.handler_id` e `payment_data.instrument` com o mesmo tipo e credencial. Os tokens desse handler são seletores públicos da simulação; não são dados de cartão nem credenciais PSP. `boopay-sandbox-declined` ensaia recusa sem baixar estoque. Handler `br.com.boopay.pending_order` e seletor `boopay-pending-order` permitem WooCommerce BACS, Shopify pendente e promissória VTEX de teste, com endereço completo e contato exigidos pelo Core. Na VTEX, CPF/número/bairro são coletados somente na revisão do comprador, antes da cotação e confirmação. Nenhum pedido pendente entra como receita paga. Se o comprador mudar a forma de pagamento para Stripe no checkout, esse handler recusa a conclusão. A resposta de entrega/contato consulta os dados atuais revisados pelo comprador, inclusive quando a rua muda e o CEP permanece igual. ACP publica esquemas separados de configuração e instrumento; a configuração é validada em teste. Capacidades, estimativas iniciais, perda de resposta e limites por adaptador estão em [PROTOCOL-COMMERCE.md](PROTOCOL-COMMERCE.md).

Campos de comprador não estabelecem identidade verificada. UCP PUT substitui os campos graváveis; o cliente deve reenviar os que quer preservar. Campos de apresentação recebidos do GET não se tornam preço autoritativo. Endereço único abrange todos os itens; entrega dividida, seleção de múltiplas tarifas e remoção do último destino durante PUT são limitações atuais, explicitamente recusadas.

## Validação e trabalho restante

A extensão de retenção e jornada nativa no commit `fb5f174158ec173a083a2e5ec23c8146b49b8df8` passou nos cinco jobs da [CI 34447662216](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34447662216). PostgreSQL executou **145/145 testes, sem omissões**; navegador: **29/29**. Cada protocolo criou e conciliou um pedido BACS nativo de **R$ 114,80**, com **um único envio comercial** e estoque **3 → 1** para seu produto. Repetir a operação não criou outro pedido e nenhum dos pedidos pendentes acrescentou receita paga. O transporte HTTP, plugin, WooCommerce, PHP e MySQL foram reais no ambiente isolado; cliente e perda de resposta foram fixtures explícitas, sem homologação de parceiro ou HTTPS externo.

A [primeira execução desse lote](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34447287870) aprovou quatro jobs e interrompeu o cliente ACP nativo porque ele incluía campos de criação em uma atualização. O cliente foi corrigido segundo o esquema original e um teste confirma tanto a recusa desses campos quanto a atualização válida com nova confirmação. Os mecanismos do servidor não foram relaxados para aceitar o corpo inválido. O preview foi reiniciado com a extensão: health/discovery 200, UCP 2026-08-25 e retenção administrativa sem sessão 401.

Evidência anterior, preservada para rastreabilidade:

O commit `b668119cdf83e7c22d6993a8d371b74129392fc6` passou nos cinco jobs da [CI 34445652059](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34445652059): Linux, Windows, PostgreSQL, navegador e WooCommerce nativo. PostgreSQL executou **137 testes, 137 aprovados, zero omissões**. Navegador: **29 cenários aprovados**. O ensaio Woo existente confirmou HTTP/worker, captura, estorno, estoque e receita com Stripe sintético; não é uma jornada ACP/UCP nativa da loja.

A [primeira CI](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34445280299) passou em quatro jobs e falhou antes do ensaio Woo por localizar os contratos relativamente ao diretório de execução. A resolução pelo módulo compilado e o teste em processo filho fora do projeto corrigiram a falha. O preview local foi reiniciado no build corrigido: health, descobertas com as versões fixadas e HTML de revisão responderam 200; administração de clientes sem sessão respondeu 401.

Verificados localmente: build/typecheck e 137 testes de backend, 131 aprovados e seis PostgreSQL omitidos por ausência de `TEST_DATABASE_URL`; dois cenários novos de navegador em 1440/390. Incluem descoberta, esquemas originais, confirmação isolada, estoque único, repetição exata, adulteração, revogação, SQLite reaberto, resposta cifrada e assinatura de resposta verificada independentemente. Os contratos adicionam 16 testes ao backend, incluindo dois testes ACP/UCP sobre o Core remoto com autoridade comercial sintética. O novo teste PostgreSQL roda na CI com as demais provas. Evidência visual em [PROTOCOL-REVIEW.md](PROTOCOLO-CONFIRMACAO.md).

A suíte completa de navegador passou com 29 cenários: 13 operações, 12 pagamentos/carteira e quatro IA/perfil, em três servidores/bases efêmeros separados.

Reproduzir a verificação focada após `npm run build`:

```powershell
node --test dist/test/protocols.test.js dist/test/protocol-security.test.js dist/test/protocol-sources.test.js dist/test/protocol-retention.test.js dist/test/remote-checkout.test.js
npx playwright test e2e/protocols.spec.ts --project=operations
```

Nesta extensão: 145 testes de backend, 138 aprovados localmente e sete PostgreSQL também aprovados na CI. Oito casos novos cobrem a atualização ACP, retenção, reinício, limites exatos, respostas/atualizações atrasadas, migração de registros legados, isolamento e execução concorrente PostgreSQL. O ensaio nativo ACP/UCP foi validado na CI registrada acima.

Extensão implementada em 10/09: [Pedidos e notificações](PROTOCOL-ORDERS.md). Consulta UCP Orders, consulta ACP bilateral, objetos Order dos contratos originais, estorno integral sem inferência de entrega, preferência explícita do comprador, destinos fixados, fila transacional e HMAC/ES256. O permalink do pedido concluído independe do payload temporário, mantendo autenticação e propriedade. O envio é opt-in. Verificação local: 153 testes, 145 aprovados, oito PostgreSQL reservados à CI. O receptor HTTP de testes comprovou assinatura, reenvio dos mesmos bytes/UUID, ordenação, cancelamento e expiração. O status da CI e os limites de cada prova estão em [STATUS.md](ESTADO-ATUAL.md).

Pendente: rastreamento físico e estornos parciais; recuperação assistida de reservas desconhecidas e identidade do comprador; handlers reais de tokens delegados; avaliação em HTTPS/TLS 1.3 e parceiro externo. HTTP local é ambiente de desenvolvimento, não comprovação de transporte UCP de produção. Termos e aviso atuais são de teste; comunicação comercial/políticas e confirmação por e-mail exigem integração antes do uso externo.

A extensão de pedidos/notificações no commit `e9b22fda9213218a9179eb7ea5d4b01706f0f9ea` passou nos cinco jobs da [CI 34449988239](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34449988239): 153 testes de backend no job PostgreSQL sem omissões, 29 cenários de navegador e jornadas ACP/UCP com WooCommerce/PHP/MySQL nativos, incluindo a consulta assinada do pedido pendente. As notificações foram comprovadas contra receptor HTTP local sintético; domínio, parceiro e TLS externos não foram homologados.

Correção final de isolamento no commit `3b025550180bdeb726decbf6e6139bdb72d9007b`, aprovada nos cinco jobs da [CI 34450785103](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34450785103): **154 testes de backend no job PostgreSQL, zero omissões**, e **29 cenários de navegador**. A regressão comprova que um pedido sem representação válida em uma loja não interrompe a entrega das demais; a fila afetada é preservada e o ciclo sinaliza falha sanitizada. Localmente: 146 aprovados e oito PostgreSQL também aprovados na CI. O ensaio nativo ACP/UCP e o preview atualizado mantiveram as evidências de pedidos pendentes, estoque e autorização.
