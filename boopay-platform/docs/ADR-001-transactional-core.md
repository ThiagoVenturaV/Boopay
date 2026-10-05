# ADR 001 — Núcleo transacional e ambientes

Estado: adotado para implementação em 09/09/2026.

O repositório contém TypeScript com contratos independentes do servidor HTTP. PostgreSQL continua sendo o banco transacional previsto para staging. SQLite é um adaptador adicional para demonstração e testes locais sem provisionamento, não substitui PostgreSQL, Firestore ou BigQuery no escopo.

Todo registro possui tenant explícito. Todas as operações do repositório exigem tenant, inclusive leituras e idempotência. A execução local usa transações e serialização de acesso à conexão; PostgreSQL usa bloqueio transacional por tenant para evitar disputas entre processos durante alterações comerciais. Chamadas de rede não devem ocorrer dentro dessas transações.

Valores monetários são inteiros na menor unidade da moeda. Uma cotação imutável contém revisão, prazo e hash. A confirmação vincula o comprador à cotação exata. Mudança de preço, disponibilidade ou entrega exige nova revisão e confirmação.

Integrações externas precisam de idempotência e recuperação explícitas. Uma resposta desconhecida após timeout não autoriza repetir uma cobrança com outra chave. O simulador é identificado como tal; não usa logos ou nomes de PSPs para disfarçar pagamentos locais.

Referências técnicas consultadas: [Node SQLite](https://nodejs.org/api/sqlite.html), [PostgreSQL transaction locks](https://www.postgresql.org/docs/16/explicit-locking.html), [Fastify TypeScript](https://fastify.dev/docs/latest/Reference/TypeScript/).
