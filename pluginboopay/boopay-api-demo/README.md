# Boopay review gateway

API local de revisão para provar o fluxo ponta a ponta do plugin `Boopay for WooCommerce` antes de existir um ambiente SaaS público.

## Executar

Requer Node.js 20 ou superior e não possui dependências externas.

```powershell
npm.cmd test
npm.cmd start
```

O painel abre em `http://127.0.0.1:9500`. Ele mostra um código descartável de conexão, integrações, produtos sincronizados e eventos recebidos.

No WooCommerce, configure:

- API URL: `http://127.0.0.1:9500`;
- integração habilitada;
- código exibido no painel local;
- tracking somente depois da configuração do consentimento e do aviso de privacidade.

## Garantias implementadas

- código de uso único armazenado somente como SHA-256;
- token opaco armazenado somente como SHA-256;
- assinatura HMAC-SHA-256 sobre os bytes JSON originais;
- comparação em tempo constante;
- janela antirreplay de cinco minutos;
- autorização cruzada de token, integração e tenant;
- idempotência por tenant e `eventId`;
- limite de 2 MiB por requisição;
- serviço restrito ao loopback;
- painel sem exposição de tokens ou segredos.

## Limite

Este gateway é um ambiente local de revisão, não um backend de produção. A submissão à WooCommerce Marketplace ainda exigirá um endpoint HTTPS público de staging, termos de uso, política de privacidade, conta vendor aprovada e credenciais de teste para os revisores.
