# Plugin Boopay para WooCommerce

Versão atual: **0.7.2**, conferida no cabeçalho do plugin e na documentação do pacote. O conector liga a loja WooCommerce à plataforma Boopay, com catálogo, operações assinadas, coleta/reenvio de eventos e perfil consentido na sessão nativa.

[Documentação completa do pacote](boopay-woocommerce/README.md) · [Contrato da API](boopay-woocommerce/docs/API-CONTRACT.md) · [Perfil consentido](boopay-woocommerce/docs/PROFILE-LINK.md) · [Estado validado e pendências](../boopay-platform/docs/ESTADO-ATUAL.md)

## Uso e componentes

- `boopay-woocommerce`: plugin PHP, integrações nativas, cotação/confirmacão, tentativas duráveis e operações financeiras opt-in.
- `boopay-api-demo`: gateway local de revisão; não é um serviço SaaS em produção.
- `marketplace`: documentos comerciais/legais e instruções de submissão ainda dependentes de decisões do responsável pelo produto.

Consulte instalação, requisitos, privacidade e validação no [README do pacote](boopay-woocommerce/README.md). O ZIP corrente e o código ficam no repositório privado de implementação; a central não duplica binários ou aplicação.

## Limites atuais

Há ensaio nativo com WordPress/PHP/MySQL reais; Stripe é sintético nessa prova. Instalação em loja autorizada, credenciais reais, operação pública, dados comerciais/legais e aprovação no Woo Marketplace continuam pendentes. Nenhum pacote publicado significa homologação. Analytics e vínculo ao perfil são consentimentos distintos.

[Decisões comerciais](marketplace/DECISIONS-NEEDED.md) · [Processo externo](marketplace/EXTERNAL-PROCESS.md) · [Privacidade](marketplace/PRIVACY-DISCLOSURE.md)
