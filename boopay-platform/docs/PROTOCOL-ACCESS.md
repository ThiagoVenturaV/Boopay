# Cadastro e autorização de clientes ACP/UCP

Implementado em 10/09/2026. A interface usa o cadastro e a delegação bilateral de teste descritos em [PROTOCOLS.md](PROTOCOLS.md). Não representa OAuth, verificação do domínio ou homologação de uma plataforma externa.

## Operação

1. Em **Configurações → Clientes ACP/UCP**, o administrador informa nome, endereço HTTPS do perfil, protocolos e perfil público em JSON. A loja recebe esse documento do cliente pelo processo bilateral de integração. A chave privada permanece com o cliente.
2. **Conferir perfil** valida o mesmo contrato utilizado no cadastro, sem consultar a URL nem persistir um cliente. O resumo mostra nome, endereço, protocolos e identificadores das chaves. **Confirmar cadastro** grava o cliente; é possível editar ou cancelar antes disso. Chaves privadas são recusadas no navegador e no servidor.
3. O comprador abre **Gerenciar acesso de clientes e notificações**, em Privacidade ou na revisão de compra, usando sua sessão existente. A rota `/protocol-access` não cria identidades. Sem sessão, orienta a retornar ao navegador da compra.
4. O comprador escolhe cliente e protocolos e marca o aceite explícito. A opção de notificações é independente e começa desmarcada. A autorização dura até 30 minutos e não permite confirmar compras em nome do comprador.
5. A credencial retornada aparece mascarada, somente nessa emissão. Mostrar, copiar e remover são ações explícitas. O token fica em memória da página; não é escrito em WebStorage nem na URL. O handoff ao cliente é manual pelo canal seguro da integração de teste. Recarregar a página ou atingir a expiração remove sua exibição.
6. **Revogar acesso** bloqueia novas chamadas com aquela autorização. **Interromper notificações desta compra** retira separadamente o consentimento vinculado ao checkout. Nenhuma dessas ações cancela pedidos. O administrador também pode revogar o cliente inteiro.

Notificações já consentidas podem continuar após a autorização de 30 minutos. Dependem do destino previamente permitido/configurado pelo operador; a tela não ativa destinos externos. A revogação global do cliente impede o envio; o comprador ainda pode retirar a preferência registrada. A fila e seus limites estão em [PROTOCOL-ORDERS.md](PROTOCOL-ORDERS.md).

## APIs e proteção

| Operação | Rota | Sessão |
| --- | --- | --- |
| Conferir perfil, sem gravar | `POST /v1/admin/protocol-clients/validate` | Administrador |
| Listar/cadastrar clientes | `GET/POST /v1/admin/protocol-clients` | Administrador |
| Revogar cliente | `DELETE /v1/admin/protocol-clients/:id` | Administrador |
| Consultar clientes ativos, autorizações e notificações próprias | `GET /v1/buyer/protocol-access` | Comprador |
| Emitir autorização explícita | `POST /v1/buyer/protocol-grants` | Comprador |
| Revogar autorização própria | `DELETE /v1/buyer/protocol-grants/:id` | Comprador |
| Interromper notificações do checkout próprio | `DELETE /v1/buyer/protocol-sessions/:id/order-updates` | Comprador |

A consulta expõe somente o identificador público da autorização, cliente, protocolos, validade e estado. Não devolve token, hash de token, identidade do comprador ou permissões de outra sessão/loja. As rotas mantêm `no-store` e as proteções de sessão/origem existentes. Autorizações expiradas ou revogadas deixam a lista após a limpeza periódica; ela não é um histórico de auditoria permanente.

Se a emissão for gravada mas sua resposta se perder, a interface não repete o POST. Ela consulta a lista real e orienta revogar a autorização desconhecida antes de emitir outra. O token perdido não pode ser recuperado pela consulta. Falha de atualização da lista após uma resposta de emissão bem-sucedida preserva a credencial recebida e apresenta orientação de recuperação.

## Evidência e limites

`test/protocol-access.test.ts` cobre validação sem escrita, recusa de chave privada, isolamento, ausência de tokens nas consultas, revogação, expiração/limpeza e independência do consentimento de notificações. `e2e/protocol-access.spec.ts` percorre cadastro, aceite por teclado, emissão, chamada UCP assinada, revogação e interrupção em 1440/390 px, além de sessão ausente, JSON inválido, chave privada recusada antes da rede e perda da resposta de emissão.

Recuperação de identidade, OAuth/handoff automatizado, configuração visual de destinos, handlers PSP delegados e homologação externa continuam pendentes. A consulta atual filtra registros da loja/sistema no armazenamento; paginação e índices dedicados para grandes volumes ainda não foram implementados.
