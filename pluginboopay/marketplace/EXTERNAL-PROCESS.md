# Como colocar o Boopay for WooCommerce no Woo Marketplace

> Documento de preparação comercial/operacional. Marcadores e condições externas precisam ser concluídos antes do lançamento; versão técnica corrente do plugin: 0.7.2.

Este roteiro cobre os passos que dependem de conta, empresa, contratos, infraestrutura pública e revisão da Woo. O código local não consegue concluí-los sozinho.

## 1. Definir quem é o vendor e dono do serviço

Reúna:

- razão social e nome comercial;
- país, endereço e dados fiscais;
- site oficial e domínio de e-mail;
- responsável comercial, técnico, suporte, segurança e privacidade;
- evidência de que a empresa opera ou está autorizada a representar o serviço Boopay.

A Woo declara preferência por integrações mantidas pela empresa que opera o sistema externo. Se o vendor não for o operador do Boopay, converse com a equipe do Marketplace antes de investir na submissão.

## 2. Escolher o modelo comercial antes da submissão

O Boopay é uma integração com serviço externo. Pelas regras atuais, há duas rotas adequadas:

### Rota A — Billing API

- recomendada pela Woo para SaaS;
- a Woo gerencia a cobrança da assinatura;
- requer integração da Billing API;
- chaves e sandbox são liberados manualmente depois que o produto entra em consideração no Marketplace.

### Rota B — Partnership Agreement

- o plugin aparece gratuitamente no Marketplace;
- o serviço externo cobra o cliente;
- exige acordo específico e aprovação discricionária da Woo.

O modelo comum de plugin pago não pode ser usado para uma integração faturada externamente. Defina também moeda, preço, periodicidade, trial, cancelamento e igualdade de preço com outros canais.

## 3. Publicar a base legal e operacional

No domínio oficial, publique em HTTPS:

- política de privacidade;
- termos de serviço;
- política de retenção e exclusão;
- subprocessadores e transferências internacionais, se aplicável;
- contato de privacidade e segurança;
- política de suporte;
- documentação pública básica.

Use `PRIVACY-DISCLOSURE.md` como inventário técnico, mas obtenha revisão jurídica antes de publicar os documentos legais.

## 4. Preparar staging e demonstração públicos

Publique:

- API Boopay de staging em HTTPS;
- painel de revisão sem segredos visíveis;
- loja WooCommerce demonstrativa;
- visão administrativa e visão da vitrine;
- usuário de revisão com privilégio mínimo necessário;
- gerador de código de conexão de uso único;
- monitoramento e suporte durante a revisão.

Nunca coloque senha, token ou segredo HMAC no formulário de submissão. Entregue a senha por canal seguro e gere o código descartável próximo ao teste.

## 5. Candidatar-se a Marketplace Partner

1. Acesse a página oficial de parceiros da WooCommerce.
2. Selecione **Become a partner**.
3. Preencha os dados da empresa, produto, equipe e modelo comercial.
4. Aguarde a aprovação da conta vendor antes de tentar enviar o produto.
5. Guarde o e-mail de aprovação e identifique os administradores do vendor.

## 6. Abrir a submissão

No Vendor Dashboard:

1. Abra **Submissions > Submit Product**.
2. Confirme com a Woo se a classificação final será **SaaS** ou **Extension/integration**.
3. Envie o ZIP candidato.
4. Preencha os dados comerciais usando `SUBMISSION-FORM.md`.
5. Cole as instruções de teste de `REVIEWER-INSTRUCTIONS.md`.
6. Informe URLs públicas de demo, termos, privacidade, documentação e suporte.
7. Envie para análise.

## 7. Acompanhar testes e revisão

A submissão precisa passar pelos testes QIT de API, E2E, Activation, Security, PHPCompatibility, Malware e Validation. Depois vêm as revisões comercial, de código, UX e preparação de lançamento.

Se o status for **Changes required**:

1. abra cada resultado de teste;
2. corrija a causa no código ou documentação;
3. gere e valide um novo ZIP;
4. use **Replace** para reenviar.

Se o status não permitir troca do ZIP, escreva no diálogo da submissão pedindo mudança de status. A Woo informa que a decisão formal da revisão comercial costuma ocorrer em até 30 dias após essa etapa começar, podendo haver novas solicitações.

## 8. Finalizar a página do produto

No produto aprovado, configure:

- ícone PNG/JPG 160x160;
- highlight color;
- descrição curta;
- descrição longa;
- imagem destacada e galeria de no mínimo 896x550;
- alt text acessível;
- FAQs;
- requisitos, features, termos de busca e compatibilidade;
- documentação;
- demo HTTPS;
- preço aprovado.

Use os arquivos em `marketplace/assets/` e `PRODUCT-LISTING.md`.

## 9. Lançar e manter

Para cada atualização:

1. mantenha `changelog.txt` no formato Woo;
2. use versionamento semântico;
3. execute QIT antes do upload;
4. abra **Versions > Add version**;
5. envie o ZIP e a versão correspondente;
6. acompanhe os e-mails de confirmação, rejeição ou publicação.

A Woo recomenda atualizações no mínimo a cada seis meses e pode sinalizar para remoção produtos que não acompanham o WooCommerce.

## Evidências que devem existir antes do clique final

- [ ] conta vendor aprovada;
- [ ] empresa e responsáveis definidos;
- [ ] rota Billing API ou Partnership Agreement acordada;
- [ ] preço e política comercial aprovados;
- [ ] termos e privacidade publicados;
- [ ] suporte e SLA operacionais;
- [ ] API e demo em HTTPS;
- [ ] credenciais de revisão testadas;
- [ ] ícone e galeria aprovados pela marca;
- [ ] ZIP final e SHA-256 registrados;
- [ ] QIT verde ou plano de correção ativo;
- [ ] autorização do responsável legal/comercial para aceitar o acordo e enviar.

## Links oficiais

- Candidatura a parceiro: https://woocommerce.com/partners/
- Regras de monetização: https://developer.woocommerce.com/docs/woo-marketplace/monetization-expectations/
- Processo de submissão: https://developer.woocommerce.com/docs/woo-marketplace/submitting-your-product
- Conteúdo e assets da página: https://developer.woocommerce.com/docs/woo-marketplace/product-page-content-and-assets/
- Atualizações e novos ZIPs: https://developer.woocommerce.com/docs/woo-marketplace/product-update-guidelines/
- Formato obrigatório de `changelog.txt`: https://developer.woocommerce.com/docs/extensions/core-concepts/changelog-txt/
- Quality Insights Toolkit: https://qit.woo.com/docs/
- Suporte e documentação: https://developer.woocommerce.com/docs/extensions/best-practices-extensions/support-and-documentation/
