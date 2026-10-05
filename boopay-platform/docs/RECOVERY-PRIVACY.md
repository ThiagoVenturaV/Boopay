# Privacidade na recuperação de backups

A restauração pode comparar a cópia antiga com um backup operacional completo mais recente e autenticado. Ela remove dados históricos de perfil e IA que já não constam com o mesmo conteúdo nessa fonte e exige novo consentimento quando a autorização mudou. Pedidos, valores, revisões comerciais e idempotência permanecem na versão da cópia antiga. **O destino continua em quarentena; esta etapa não libera a operação.**

## Fonte e limites de confiança

As duas cópias `.bpb` precisam passar pela autenticação AES-GCM com `BOOPAY_BACKUP_KEY`, conter a mesma identidade `system/recovery_lineage/active` e ter intervalos de leitura separados: a fonte recente deve começar depois de `createdAt` da cópia antiga. A API cria essa identidade uma única vez em transação, antes de construir serviços. Processos concorrentes reutilizam o mesmo UUID; um banco em quarentena não pode criá-lo.

A identidade detecta mistura acidental entre bases; não é atestado de origem externa. Uma clonagem administrativa também copia o UUID. O operador precisa escolher a cópia completa e autoritativa da mesma operação. Relógios, custódia da chave e integridade do ambiente continuam necessários. Nenhum ID é inferido por nome da loja, tenant ou e-mail.

Backups legados sem essa identidade continuam aceitos pela restauração comum, em quarentena; a conciliação de privacidade é recusada. Não injete a identidade retrospectivamente para contornar a recusa. Cópias já transformadas por esta etapa ou originadas de restauração em quarentena também são recusadas como fontes operacionais.

`privacyObservedThrough` é o início da leitura da fonte recente. Não comprova exclusões posteriores nem atualização de serviços externos. Se essa fonte não estiver disponível, os consentimentos antigos não podem ser presumidos válidos.

## Decisões da comparação

- Perfil ausente, excluído ou com geração, versão, política ou finalidades diferentes: apaga identidade, interesses e histórico vinculado; grava marca de exclusão com nova geração e versão. Mesmo um consentimento retirado e concedido novamente exige novo aceite no destino. Isso pode descartar dados ainda autorizados na fonte recente: é uma decisão conservadora de recuperação, não uma reprodução exata de todas as ações do comprador.
- Identidade cifrada diferente, sem mudança de consentimento: limpa a identidade antiga e não importa a nova. Uma recifragem também pode provocar essa limpeza.
- Atividades, evidências de consentimento, vínculos/tokens da loja, conversas, turnos, seleções e vetores/jobs do perfil: preserva somente registros com o mesmo conteúdo na fonte recente. Diferenças apenas na revisão ou na ordem das chaves JSON não alteram essa comparação. Dependentes de conversas, turnos ou vínculos descartados são removidos.
- Chamadas de IA alteradas, ausentes ou relacionadas a conteúdo removido: limpa solicitação/resposta e interrompe chamadas pendentes. Eventos de IA e cópias pendentes na outbox são removidos quando alterados, ausentes ou vinculados a conteúdo removido. Uma outbox de IA sem evento correspondente também é descartada.
- Nenhum conteúdo pessoal novo da fonte é importado. Compradores e IDs iguais em tenants distintos continuam separados. Registros comerciais, eventos comerciais, credenciais de provedores e tipos futuros fora dos prefixos de perfil/IA são preservados e continuam sujeitos à revisão operacional. Tipos desconhecidos com prefixo `profile_` ou `ai_`, perfis incompatíveis e vínculos sem os campos necessários causam recusa.

A rotina compartilha as primitivas de exclusão do serviço de perfis. A comparação ocorre em memória, sem abrir a API, decifrar campos da aplicação, chamar provedores ou gerar eventos de projeção. Somente após autenticar e validar as duas cópias a restauração grava um destino novo/vazio, confere seu hash e acrescenta a quarentena. As revisões dos registros alterados aumentam; as demais permanecem iguais. Aplicam-se os limites de memória/tamanho do [formato de backup](BACKUP-RESTORE.md).

O recibo `system/recovery_privacy/active` conserva IDs e hashes das duas cópias, limite temporal, contagens e `operationalRelease: false`. Não contém IDs de compradores, tenants, mensagens ou chaves. O recibo e a quarentena são publicados junto com o destino. Não há rota de liberação ou bypass de ambiente.

## Executar

Compile o projeto e configure a chave por canal de segredos, conforme [backup e restauração](BACKUP-RESTORE.md). A CLI não carrega `.env`, banco padrão nem credenciais da aplicação. Os dois arquivos precisam usar a mesma chave de backup nesta versão.

Primeiro, obtenha o relatório sem escrever arquivos ou abrir banco:

```powershell
npm run backup -- privacy-plan --file ./backups/antigo.bpb --privacy-from ./backups/recente.bpb
```

Para SQLite, use pasta existente e arquivo de destino novo:

```powershell
npm run backup -- restore --engine sqlite --target ./recovery/boopay.sqlite --file ./backups/antigo.bpb --privacy-from ./backups/recente.bpb --accept-quarantine
```

Para PostgreSQL, configure `BOOPAY_RESTORE_DATABASE_URL` para um banco separado, vazio e sem outras conexões:

```powershell
npm run backup -- restore --engine postgres --file ./backups/antigo.bpb --privacy-from ./backups/recente.bpb --accept-quarantine
```

O relatório não cria um arquivo transformado reutilizável: a restauração repete a comparação e registra suas decisões. Com os mesmos arquivos, as contagens e hashes de origem coincidem; o ID da recuperação é novo. A cópia original e a fonte recente permanecem intactas. Sem `--privacy-from`, mantém-se o contrato anterior de restauração comum em quarentena.

## Prova e trabalho restante

`npm run backup:privacy:demo` usa chaves e bancos efêmeros: consentimento e compra no Core → primeira cópia autenticada → exclusão pelo serviço real de perfis → segunda cópia → comparação → restauração → conferência do pedido, dados apagados e bloqueio da aplicação. O histórico de IA e a compra são sintéticos; nenhum provedor é chamado.

Os dez testes novos cobrem exclusão posterior, nova geração após expurgo de evidências, revogação seguida de novo consentimento, identidade alterada, retenção seletiva, outbox órfã, isolamento entre tenants, fonte estrangeira/legada/adulterada, falha antes de publicar destino e relatório sem conteúdo pessoal. PostgreSQL acrescenta dois pools disputando a criação da identidade e restauração com recibo/quarentena persistidos. Resultados executados constam em [STATUS.md](ESTADO-ATUAL.md).

Continuam fora desta etapa: expurgo físico de SQLite/WAL/backups, custódia e rotação das chaves, agendamento e armazenamento remoto, exclusões em Firestore/BigQuery/provedores, revisão de sessões/credenciais e conciliação de pedidos, pagamentos e outbox comercial. Não se deve iniciar a aplicação apenas removendo a quarentena. A revisão antes da retomada no [procedimento de recuperação](BACKUP-RESTORE.md) e a demonstração no ambiente autorizado continuam necessárias.

Validação do commit `4166e857a661291769a6375f9076e8df8f09b85b`: dez cenários novos aprovados e sete jobs concluídos na [CI 34598028279](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34598028279). Demos Linux/Windows confirmaram um perfil desativado, 14 registros removidos, dois alterados, pedido preservado e API bloqueada. [Evidência e regressões](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/recovery-privacy-ci-2026-09-11.json).
