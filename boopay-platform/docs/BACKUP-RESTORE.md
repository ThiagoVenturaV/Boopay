# Backup e restauração isolada

Implementado em 11/09/2026. `npm run backup` cria um backup lógico cifrado da tabela canônica `records`, verifica o arquivo autenticado e restaura em destino vazio. Preserva todos os tenants, tipos de registro, revisões, pedidos, reservas de idempotência, dados privados cifrados e marcas de exclusão existentes no instante da cópia. Não seleciona apenas os tipos conhecidos hoje.

**A base restaurada fica em quarentena.** A API recusa inicializar antes de construir serviços e integrações. Não há liberação automática: uma cópia anterior pode conter consentimentos revogados ou tentativas comerciais superadas depois dela. Este incremento entrega cópia e recuperação verificável; retomada operacional, retenção física e homologação do ambiente continuam abertas.

## Formato e consistência

- `boopay-records-v1`, arquivo `.bpb`, AES-256-GCM com nonce aleatório de 96 bits, tag de 128 bits e cabeçalho versionado autenticado. UUID, datas e registros ficam cifrados. A chave vem de `BOOPAY_BACKUP_KEY`: 32 bytes aleatórios em 64 caracteres hexadecimais.
- Autenticação integral antes de interpretar ou gravar conteúdo. Chave incorreta, truncamento, adulteração, versão desconhecida, registros duplicados e revisão inválida são recusados.
- SQLite: conexão somente de leitura e transação consistente com WAL, esquema versão 1. PostgreSQL: `REPEATABLE READ READ ONLY`, tabela `public.records`.
- É um backup lógico da aplicação, não um dump de papéis, permissões, extensões e funções do servidor. Tabelas adicionais no mesmo esquema ou colunas desconhecidas causam recusa, evitando cópia silenciosamente incompleta. Outros esquemas e serviços externos estão fora do contrato.
- Limite da demonstração: 100 mil registros, 64 MiB de JSON e 64 níveis de aninhamento por corpo; falha sem truncar. Serialização e verificação usam memória. Não há streaming para grandes bases. Chaves JSON como `__proto__` são preservadas como dados, sem reconstrução de objetos que as descarte.
- O relatório contém somente ID do backup, formato, origem, datas, contagens e SHA-256 dos registros ordenados. Não imprime conteúdo, IDs de tenants, credenciais ou URL de conexão. `snapshotStartedAt` delimita o início da leitura; `createdAt` identifica a montagem do arquivo, não garante recuperar alterações até esse segundo.

Referências: [isolamento PostgreSQL 17](https://www.postgresql.org/docs/17/transaction-iso.html), [SQLite/WAL](https://sqlite.org/isolation.html) e [autenticação GCM no Node 24](https://nodejs.org/download/release/latest-v24.x/docs/api/crypto.html).

## Criar e verificar

Compile o projeto e configure `BOOPAY_BACKUP_KEY` na sessão pelo gerenciador de segredos, independente da chave de criptografia da aplicação. O comando não carrega `.env`, `data/local-secrets.json` ou a API; não adota o banco local nem `DATABASE_URL` implicitamente. Crie previamente uma pasta privada, fora do Git, e use um nome novo para cada cópia:

```powershell
npm run build
npm run backup -- create --engine sqlite --source ./data/boopay.sqlite --file ./backups/boopay-2026-09-11.bpb
npm run backup -- verify --file ./backups/boopay-2026-09-11.bpb
```

Para PostgreSQL, configure `BOOPAY_BACKUP_DATABASE_URL` para a origem autorizada. A conta precisa ler tabela e metadados; a origem não é migrada ou alterada:

```powershell
npm run backup -- create --engine postgres --file ./backups/boopay-2026-09-11.bpb
npm run backup -- verify --file ./backups/boopay-2026-09-11.bpb
```

O temporário cifrado tem criação exclusiva e modo `0600`, é sincronizado e publicado por link sem substituir destino existente. O volume deve suportar hard links no mesmo diretório; não há fallback que sobrescreva. Em POSIX o diretório também é sincronizado. No Windows, permissões dependem das ACLs herdadas, e a durabilidade depende do volume; não houve ensaio de falha física. `.bpb` e `.partial` ficam ignorados pelo Git.

## Restaurar e conferir

Use máquina/banco isolado, sem tráfego da aplicação e sem saída para provedores. Preserve as chaves originais da aplicação por canal separado: segredos de ambiente não fazem parte da cópia, e uma chave nova não abre os campos cifrados antigos.

```powershell
npm run backup -- restore --engine sqlite --target ./recovery/boopay.sqlite --file ./backups/boopay-2026-09-11.bpb --accept-quarantine
```

A pasta precisa existir, e o destino deve ser um arquivo novo. SQLite é reconstruído em temporário privado, confere o hash dos registros e executa `PRAGMA integrity_check`. Dados e marca de quarentena são confirmados juntos; só depois o caminho final é publicado de forma exclusiva. Nenhum arquivo existente, inclusive a origem, é substituído.

Para PostgreSQL, crie um banco separado e vazio pelo processo administrativo do ambiente. Configure `BOOPAY_RESTORE_DATABASE_URL` com esse destino:

```powershell
npm run backup -- restore --engine postgres --file ./backups/boopay-2026-09-11.bpb --accept-quarantine
```

O comando exige `public` vazio e ausência de outras conexões naquele momento. Criação da tabela, inserções com revisões originais, conferência do hash e marca de quarentena pertencem à mesma transação; falhas causam rollback. O comando não executa `TRUNCATE`, `DROP DATABASE`, substituição de dados ou troca da configuração da aplicação. A marca adicional `system/recovery_quarantine/active` não entra no hash original.

O arquivo pode ser restaurado nos dois mecanismos se os valores forem representáveis. PostgreSQL JSONB, por exemplo, rejeita NUL admitido por JSON; nesse caso a tabela restaurada inteira é revertida. Não se usa `Store.put`: a restauração não incrementa revisões nem recria eventos/outbox por observação de cada linha.

## Revisão antes de retomar

O destino deve permanecer em quarentena até existir evidência de:

1. Reaplicação das exclusões e revogações posteriores à cópia por fonte mais recente confiável. A [conciliação de privacidade](RECOVERY-PRIVACY.md) implementa essa etapa para perfis/IA por comparação com outro backup completo autenticado da mesma origem operacional, até o início de sua leitura. Sem essa fonte, consentimentos antigos não podem ser presumidos válidos.
2. Revisão da retenção de perfis, conversas, payloads temporários e dados comerciais. Expurgo lógico não comprova eliminação em páginas livres, WAL, snapshots, backups antigos ou provedores.
3. Recuperação e validação das chaves; revisão de sessões, capacidades delegadas e credenciais antes de reconectar.
4. Conciliação de pedidos, pagamentos e tentativas externas. Uma tentativa ausente na cópia pode ter sido enviada depois dela; não despachar outbox, criação, captura, estorno ou notificações automaticamente.
5. Comparação de contagens, estados comerciais e receita por moeda, com evidência e aprovação da retomada no ambiente autorizado.

Além da comparação de privacidade documentada no item 1, essas etapas não estão automatizadas. Remover a marca apenas para iniciar o servidor não equivale a cumpri-las. Não há bypass por ambiente ou rota HTTP de liberação. Ferramentas administrativas com acesso direto ao banco continuam sob responsabilidade do operador; o bloqueio da aplicação não substitui controle de acesso ao banco.

## Política e prova

Frequência, destino, imutabilidade, prazo de guarda, expurgo físico, custódia das chaves, RPO e RTO devem ser definidos para o ambiente autorizado. Nenhum agendamento, armazenamento remoto ou chave de produção foi ativado. A cópia perde alterações posteriores à leitura; não há PITR nem restauração de Firestore, BigQuery, lojas ou PSP. Não é uma certificação legal ou de disaster recovery.

`npm run backup:demo` usa chaves novas e bancos efêmeros: compra sintética no Core → exclusão do perfil → cópia cifrada → autenticação → restauração SQLite → prova de pedido, revisões, tenant, exclusão e campo cifrado → recusa de inicialização. Não toca o banco de trabalho.

Testes locais cobrem WAL durante escrita, publicação concorrente, recusa de sobrescrita, adulteração/chave errada, esquema incompatível e CLI sem ambiente implícito. Os dois testes PostgreSQL verificam banco isolado, restauração nos dois sentidos entre mecanismos, recusa de destino conectado/existente e rollback integral por incompatibilidade JSONB.

Os sete cenários novos passaram na [CI 34587631222](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34587631222), commit `d1f4b009d2c707f96c53543677ba79a2a615a5b7`: seis jobs aprovados, 367 cenários distintos de backend (364 PostgreSQL + três Firestore), 51 percursos do painel e quatro dos pixels. Demos em Linux/Windows, regressão Woo nativa e auditoria de execução com zero vulnerabilidades. A demo recuperou 20 registros em quarentena nos dois sistemas operacionais; a prova não inclui falha física, armazenamento remoto ou retomada em conta externa. [Evidência verificável](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/backup-ci-2026-09-11.json), [histórico](ESTADO-ATUAL.md) e [matriz de entrega](CRITERIOS-DE-ACEITE.md).
