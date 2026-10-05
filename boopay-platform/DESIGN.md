---
name: Boopay Platform
description: Sistema visual operacional Boopay, extraído da implementação web.
colors:
  surface: "#fff9eb"
  ink: "#082c34"
  secondary: "#486061"
  line: "#e3dfd0"
  mint: "#e7efdc"
  orange: "#b94f1c"
  warning: "#ffecd0"
  control-border: "#bbc1b4"
  control-hover: "#e9efdf"
  control-active: "#d5e5cb"
  primary-hover: "#1e534e"
  white: "white"
  text-hover: "#a14319"
  brand-orange: "#fa7c3c"
  badge-bg: "#ffdeaa"
  badge-ink: "#6e360f"
  notice-ink: "#382e20"
  error-bg: "#ffe5d7"
  error-ink: "#772d19"
  paid: "#32965b"
  refunded: "#ef783f"
  pending: "#949d86"
  table-head: "#f1eddf"
  table-hover: "#f6f3e4"
  chart-bar: "#103e3b"
typography:
  headline:
    fontFamily: "Encode Sans Semi Expanded, Archivo, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  section:
    fontFamily: "Archivo, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Archivo, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Archivo, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  metric:
    fontFamily: "Archivo, sans-serif"
    fontSize: "28px"
    fontWeight: 700
rounded:
  panel: "5px"
  control: "6px"
  emphasis: "8px"
  notice: "10px"
  dot: "50%"
spacing:
  tight: "8px"
  compact: "12px"
  comfortable: "16px"
  group: "18px"
  section: "20px"
  form: "24px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "10px 15px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.white}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 15px"
  button-secondary-hover:
    backgroundColor: "{colors.control-hover}"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "4px 0"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 15px"
  navigation-selected:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 17px"
  environment-badge:
    backgroundColor: "{colors.badge-bg}"
    textColor: "{colors.badge-ink}"
    rounded: "{rounded.notice}"
    padding: "7px 16px"
  form-panel:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "{spacing.form}"
  notice:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.notice-ink}"
    rounded: "{rounded.notice}"
    padding: "15px 17px"
  reconciliation-total:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.emphasis}"
    padding: "14px"
---

# Design System: Boopay Platform

## Overview

**Creative North Star: "Compras mais humanas com IA."**

A assinatura já presente ao lado de Boo ancora uma interface B2B clara e próxima. O ambiente usa papel creme, texto petróleo, divisórias finas e tipografia sem serifa. O mascote oferece presença humana sem assumir o protagonismo dos dados. A assinatura é uma expressão da marca; a disponibilidade de IA continua declarada por cada área do produto.

**Key Characteristics:**

- Fundo creme contínuo e contraste em petróleo.
- Menta para seleção e destaque; laranja para marca, ambiente e avisos.
- Contornos discretos, cantos curtos e ausência de sombras.
- Números tabulares, rótulos diretos e contexto de origem visível.
- Boo como assinatura no rodapé lateral de desktop.

## Colors

A paleta combina a sobriedade do petróleo com o calor do creme e acentos suaves de menta e laranja. Os valores do frontmatter são normativos e preservam os literais do CSS.

### Primary

- **Petróleo** (`ink`): texto, títulos, ícones e preenchimento das ações primárias. `primary-hover` aprofunda o estado interativo; `chart-bar` é o tom observado nas barras.

### Secondary

- **Menta suave** (`mint`): seleção na navegação, totais destacados e área de sugestões do catálogo. `control-hover` e `control-active` pertencem aos estados dos controles.

### Tertiary

- **Laranja de foco** (`orange`): contorno de teclado e cursor de texto; `text-hover` colore ações textuais em hover.
- **Laranja da marca** (`brand-orange`): as duas formas do símbolo Boopay.
- **Âmbar de ambiente** (`badge-bg`, `badge-ink`): etiqueta Sandbox. `warning` e `notice-ink` compõem os avisos informativos.
- **Estados explícitos** (`paid`, `refunded`, `pending`): marcadores de situação acompanhados de texto. Erros usam `error-bg` e `error-ink`.

### Neutral

- **Papel creme** (`surface`): canvas contínuo, também usado como texto sobre o botão primário.
- **Texto secundário** (`secondary`): explicações, metadados e notas de origem.
- **Linha de papel** (`line`): painéis, separadores e linhas de tabela. Controles usam `control-border` para uma borda mais evidente.
- **Camadas de tabela** (`table-head`, `table-hover`): cabeçalho e leitura por linha em hover.
- **Branco** (`white`): texto no hover da ação primária.

**The Estado Legível Rule.** Cor acompanha texto ou símbolo identificado; nunca carrega sozinha o estado de um pedido, erro ou ambiente.

## Typography

**Display Font:** Encode Sans Semi Expanded, com Archivo e sans-serif como fallback.
**Body Font:** Archivo, com sans-serif como fallback.

Fontes locais em `web/public/fonts` fornecem Archivo regular, semibold e bold, e Encode Sans Semi Expanded bold. Títulos de página têm mais presença e menor espaçamento; o restante mantém leitura compacta sem usar caixa alta como recurso de hierarquia.

### Hierarchy

- **Headline** (`headline`): título de página; diminui para 32px até 1350px e 29px até 700px. O título de login usa 32px.
- **Section** (`section`): cabeçalhos de painéis; o painel de receita e tabelas usam ajustes observados entre 20px e 22px.
- **Title** (`title`): subtítulos, como o título do gráfico; no mobile este usa 17px.
- **Body** (`body`): texto corrido. Descrições operacionais e tabelas usam 14px; textos de apoio podem usar 11–13px.
- **Label** (`label`): campos, botões e identificadores curtos.
- **Metric** (`metric`): saldo e taxas de destaque. Valores comuns de conciliação usam 23px; o saldo diminui para 26px até 1350px e 23px até 700px.

Sugestões do catálogo reutilizam o tamanho de `title` para o nome, com entrelinha local de 1.3, e `metric` para o preço unitário. Evidência, disponibilidade e origem usam o corpo operacional de 14px. Essa extensão não cria uma nova escala tipográfica.

Pagamento reutiliza o tamanho de `section` no cabeçalho, com entrelinha local de 1.4, `metric` no valor e o corpo operacional de 14px em identificação, fatos e referências. O valor preserva o tamanho de `metric` no mobile. As mensagens externas à carteira herdam Archivo do corpo; o aviso de erro reutiliza o componente tonal existente. O Payment Element externo recebe Arial, sans-serif em `StripeCard.tsx`; essa configuração local do provedor não amplia a família tipográfica da aplicação, não é aplicada ao Express Checkout Element de `StripeWallet.tsx` e não comprova a aparência dos SDKs reais.

Textos explicativos de formulário ficam em até 65ch; introduções de seção em até 75ch. Identificadores longos quebram entre caracteres. Valores usam `Intl.NumberFormat` em pt-BR; datas usam o fuso de Fortaleza.

**The Colunas Numéricas Rule.** Valores comparáveis usam algarismos tabulares e alinhamento à direita; a unidade e a origem permanecem próximas dos números.

## Layout

O shell de desktop é um grid com coluna lateral fixa de 228px e área principal fluida. A lateral permanece sticky com altura de viewport; o conteúdo recebe 24px de margem interna horizontal. O cabeçalho da loja tem 70px de altura. Painéis e tabelas usam a mesma borda para construir grupos, sem uma camada branca adicional.

O ritmo combina pequenos intervalos de 8–12px entre controles e 16–24px entre grupos. Formulários usam 24px de padding e 18px entre blocos. Checkout tem duas colunas iguais, separadas por 22px. Configurações limitam a largura a 850px; detalhes do pedido a 860px. A composição e as proporções próprias da receita ficam no brief da superfície.

Os breakpoints implementados são `max-width: 1350px`, `1050px` e `700px`. No primeiro, a lateral passa a 204px e o conteúdo a 20px de padding. Até 1050px, a lateral usa 180px, títulos e filtros se empilham e checkout passa a uma coluna. Até 700px, a lateral torna-se navegação horizontal rolável no topo; Boo sai desse espaço, o conteúdo usa 16px de padding e o contexto da loja pode quebrar linha. O identificador Sandbox permanece visível.

No mobile, os dois filtros ocupam colunas iguais e a exportação ocupa a linha inteira. Tabelas preservam cabeçalhos e conteúdo em uma região com rolagem horizontal própria, acessível por teclado. Botões primários de formulário e botões de confirmação de estorno ocupam a largura disponível. Não achatar tabelas em textos sem relações de coluna.

Agentes e Privacidade usam uma coluna principal e uma de apoio; até 1050px, a principal precede o apoio. Audiência mantém busca e segmento acima da tabela e abre o detalhe abaixo dela. Até 700px, seus filtros e as colunas internas do perfil se empilham; as tabelas mantêm a rolagem própria. As proporções e medidas locais ficam no brief de IA, sem impor essa composição às demais áreas.

Pagamento e conciliação são subseções lineares dentro do resumo da compra e do detalhe do pedido. Uma divisória superior separa a etapa; valor e estado precedem fatos, consentimento e ações. Cabeçalho e identificação podem quebrar linha. Até 700px, cada fato passa a rótulo sobre valor alinhado à esquerda, e cada ação ocupa a largura disponível. A confirmação permanece inline, sem criar uma rota, painel de métricas ou modal adicional. A carteira e o cartão compartilham essa coluna e os intervalos existentes; o bloco hospedado não ganha outra superfície ou largura fixa da aplicação.

## Elevation & Depth

O sistema é plano: não há `box-shadow`, blur nem camada translúcida nos componentes implementados. A profundidade vem de bordas finas, separadores, fundo menta para ênfase e superfícies âmbar para avisos. O estado de foco é um contorno laranja de 3px, afastado 3px; formulários usam afastamento de 4px nos botões e a região de tabela móvel mantém o contorno no limite.

**The Profundidade por Tom Rule.** Usar contorno e mudança tonal para agrupar ou destacar, preservando o canvas creme contínuo.

## Shapes

Painéis usam cantos discretos de `rounded.panel`; controles usam `rounded.control`. A ênfase de total é um pouco mais macia (`rounded.emphasis`), e avisos e etiquetas usam `rounded.notice`. Pontos de status são círculos de 10px. O wordmark fica em minúsculas, acompanhado das duas pequenas formas laranja inclinadas em sentidos opostos. Não trocar esse símbolo ou Boo por ícones genéricos de IA.

## Components

### Buttons

Controles firmes e discretos, com texto semibold, borda de 1px e altura mínima geral de 42px. Ações principais de formulário têm pelo menos 44px.

- **Primary:** petróleo com texto creme, cantos de controle e padding de `button-primary`. Hover usa o par de tokens específico; disabled usa opacidade 0.6 e cursor de espera, conforme o CSS atual.
- **Secondary:** fundo transparente e borda visível. Hover e active mudam o fundo para os tons de controle.
- **Text:** sem borda, padding curto, altura mínima de 36px. Hover colore e sublinha; ações específicas de tabela usam dimensões mais compactas.
- **Hover / Focus:** transições de cor e fundo de 180ms em `ease`; foco segue o contorno global. Nenhuma entrada animada de página.

### Chips

A etiqueta Sandbox é informativa, sem interação, com fundo âmbar e texto escuro. O mobile reduz seu padding e tamanho tipográfico. Estados de pedido usam ponto colorido e nome, sem cápsula adicional. Não apresentar a etiqueta de ambiente como filtro clicável.

### Cards / Containers

Painéis preservam o fundo da página e se delimitam por uma borda de papel. O container de formulário usa o token `form-panel`; os espaços de tabela dispensam padding externo para alinhar o cabeçalho ao contorno. Vazios usam título e explicação centralizados, sem métricas de exemplo para preencher a tela.

### Inputs / Fields

Campos e selects são transparentes, com borda de controle e os mesmos cantos dos botões. Rótulos visíveis ficam acima do campo; filtros e busca mantêm nomes acessíveis mesmo quando visualmente ocultos. Caret é laranja. Selects preservam comportamento nativo. O checkbox de confirmação tem 20px e usa o acento petróleo observado no CSS. Erros aparecem em avisos com `role="alert"`; avisos comuns usam `role="status"`.

O campo de mensagem preserva rótulo visível, borda e cantos dos controles, admite redimensionamento vertical e fica desabilitado durante envio, mensagem ativa ou ausência de provedor. Finalidades de privacidade reutilizam checkboxes nativos com título e explicação adjacentes; o uso dos interesses pela IA fica desabilitado quando a coleta do perfil está desligada. O aceite de exclusão é separado das escolhas de personalização.

### Navigation

A navegação lateral combina ícones SVG de traço fino com rótulos de 14px. A seleção usa menta, peso bold e `aria-current="page"`. A barra horizontal móvel mantém as palavras e os ícones, com rolagem própria. A marca liga à visão da receita; o link de salto leva ao conteúdo principal.

A navegação local de Catálogo e Agentes usa botões que quebram linha, separados por 8px, com 24px antes do conteúdo. A área ativa expõe `aria-pressed="true"`, fundo menta e borda petróleo. Os rótulos completos permanecem no mobile; esse controle não implementa o padrão ARIA de abas.

### Conciliação e tabela de pedidos

A conciliação usa rótulos à esquerda, valores tabulares à direita, separadores entre parcelas e uma faixa menta para o resultado. O gráfico usa barras petróleo, grade discreta e uma lista textual expansível dos valores. Tabelas mantêm cabeçalho tonal, destaque de linha em hover e ações com nome acessível.

Selecionar um pedido abre detalhes inline, move o foco para a seção identificada e rola essa seção ao início da área visível. Fechar detalhes devolve foco e rolagem à seção da lista. O estorno sandbox mostra valor e confirmação explícita antes de executar. Não há modal de detalhes implementado.

### Pagamento e confirmação financeira

A subseção usa os controles, contornos e espaçamentos existentes. A etiqueta menta “Teste” é informativa; o texto adjacente distingue provedor simulado de Stripe em modo de teste. Valor e moeda vêm da tentativa retornada pelo serviço; a identificação mostra a loja ou, na ausência do nome, “Pedido” com o identificador. Essa identificação não afirma confirmação comercial. Estado do provedor, valor capturado e recibo da loja são linhas distintas; “Atualizado em” acompanha a data da tentativa. Autorização ainda não representa receita paga, e captura no provedor ainda pode aguardar conciliação na loja.

O aceite da autorização integral é separado da revisão do pedido e abre o cartão hospedado somente após ser marcado. Captura, cancelamento, estorno integral e repetição abrem um grupo inline com operação e valor explícitos. A abertura foca o grupo e usa rolagem `nearest`; “Voltar sem confirmar” devolve o foco ao acionador, sem enviar comando. Ao terminar uma ação explícita, a interface foca a linha de estado, quando presente, e a traz à área visível. Falhas são avisos anunciados. A atualização periódica não aciona essa mudança de foco.

Consultas periódicas leem o estado persistido; comandos e consulta explícita ao provedor têm controles separados. Mudanças dos recibos comerciais acionam a atualização da lista/detalhe e do recibo do comprador. A lista conserva os dados anteriores enquanto atualiza, mantendo o detalhe e a subseção montados; falhas de atualização são declaradas junto dos dados preservados. O checkout consulta a sessão canônica e aplica o resultado apenas à mesma sessão. Resultado incerto mantém a tentativa e pede acompanhamento, sem repetir automaticamente uma operação financeira.

### Carteira hospedada e alternativa por cartão

Google Pay TEST é uma opção após o mesmo consentimento de valor e pedido. `StripeCard.tsx` monta a carteira quando o cartão está pronto, acima do formulário, em um grupo Elements independente. Apenas o Express Checkout Element desenha o botão Google Pay conforme disponibilidade do SDK; o formulário Payment Element mantém suas próprias wallets desabilitadas. Não há botão Google Pay desenhado com CSS Boopay nem reprodução de marca no sidecar.

A disponibilidade usa mensagem com `role="status"`. Carregamento reserva a altura do controle; indisponibilidade oculta o host e orienta o uso do cartão. Erro de tokenização preserva consentimento e alternativa, anuncia o aviso e foca seu parágrafo com `preventScroll`. Abrir a carteira desabilita consentimento, cartão e comandos concorrentes. Cancelar antes da confirmação libera os controles e chama o foco do elemento hospedado, sem cancelar o pedido. Depois do envio, o resultado segue o estado da mesma tentativa; a interface informa incerteza e exige acompanhamento, sem repetir autorização automaticamente.

Iniciar a coleta invalida a geração das leituras periódicas. Tanto sucesso quanto erro verificam atividade, geração e bloqueios antes de atualizar a interface, inclusive se a carteira já foi fechada. A atualização periódica não desloca o foco. Ao concluir um comando explícito, o foco segue a linha de estado do pagamento. Captura e conciliação continuam separadas da autorização da carteira.

Medidas locais e os sete cenários capturados estão no brief da carteira. `docs/GOOGLE-PAY-REVIEW.md` preserva a revisão inicial `fix` e registra F1 resolved, com `ship` restrito à correção do polling atrasado. As 14 imagens são SDK/HTTP sintéticos: sustentam a composição externa, não botão, folha, acessibilidade ou integração reais do Google Pay. Este registro documental não reexecuta testes ou detector, não verifica CI/publicação nem certifica o serviço externo. A extensão não introduz paleta, fonte global ou raster de produto.

### Feedback e continuidade

Avisos unem ícone de informação, texto e superfície tonal. Carregamento usa três blocos com alternância tonal de 1.5s; `prefers-reduced-motion: reduce` desliga animação e transições. O resumo do checkout usa região `aria-live="polite"` e só disponibiliza a ação comercial após revisão e confirmação do resumo.

Agentes e Audiência estão implementados, com disponibilidade e origem declaradas pelos dados do ambiente. Sem provedor configurado, a conversa mostra aviso e impede envio. Carregamento, vazios, falhas, conteúdo anterior e sucesso têm mensagens próprias; não preencher a ausência de dados com respostas ou métricas inventadas. O botão Atualizar recarrega configuração e perfil sem apagar rascunho, filtros ou conversa.

### Revisão de compra iniciada por protocolo

A entrada do comprador reutiliza marca, cabeçalho, campos, resumo e avisos do Checkout. O resumo conserva itens, parcelas e total tabular; o aceite começa desmarcado, habilita **Confirmar resumo** e permanece separado da ação posterior de pagamento ou envio do pedido. O resumo carregado recebe foco e rolagem, com a região `aria-live="polite"` existente. A identificação da loja e o contexto de teste ficam próximos da tarefa, sem adotar a navegação administrativa.

Falha de acesso mostra um aviso com orientação para o mesmo navegador e sessão e a ação **Tentar novamente**. Se o acesso foi reconhecido, mas o carregamento interno não obteve a compra, **Carregar compra novamente** repete a leitura do checkout vinculado. Expiração orienta voltar à conversa com o agente para solicitar outra compra; a rota não oferece **Iniciar outra compra**. Esses estados usam os controles e avisos existentes, sem novas cores, fontes ou componentes visuais.

Medidas locais e proveniência ficam no brief da superfície. `docs/PROTOCOL-REVIEW.md` registra dez capturas em 1440/390px e F1/F2 resolvidos, com `ship` restrito às duas correções de recuperação. As imagens sustentam composição e estados locais; a expiração foi injetada por fixture. Não constituem homologação ACP/UCP, ensaio de produção ou validação externa de pagamentos. A extensão não embarca novo raster de produto.

### Sugestões e revisão da compra

O histórico é uma sequência de mensagens com autor e horário, separadas por linhas. A área menta reúne produtos com nome, preço unitário tabular, variante, disponibilidade, origem, quantidade e ação de revisão. Detalhes expansíveis expõem descrição, trecho do catálogo e data da fonte; `aria-expanded` informa a abertura. Nenhum produto é selecionado automaticamente.

Uma resposta concluída leva foco e rolagem às sugestões, ou à última mensagem quando só há esclarecimento. Falhas levam ao aviso; se a resposta anterior permanece, o título muda para “Sugestões anteriores” e explica sua origem. Revisar compra abre o checkout existente sem confirmar ou pagar. Após o carregamento, o checkout sem cotação foca seu título; com cotação, foca o resumo.

### Perfis e privacidade

Audiência identifica os perfis autorizados da loja e a janela iniciada no aceite. Busca e segmento filtram a lista; a seleção abre uma seção inline com identidade declarada, compras, totais por moeda, interesses e atividade. O foco e a rolagem acompanham a abertura do detalhe e retornam à lista ao fechar. O perfil indisponível exibe erro com a possibilidade de revogação ou exclusão.

Privacidade se identifica como área do comprador de teste e foca seu título após carregar o perfil. As finalidades têm explicações próprias, estado registrado visível e aviso antes de salvar uma revogação. Em conflito de versão, o formulário mostra as escolhas atualizadas para nova revisão. Nome e e-mail opcionais são declarados, sem verificação. Exportação e exclusão operam sobre o comprador autenticado; a confirmação de exclusão é inline e o recibo declara checkouts e pedidos preservados. O prazo de mensagens na base ativa Boopay aparece separado das condições de retenção do provedor, inclusive depois da exclusão.

Consumo e catálogo pertence à operação da loja: identifica provedor, modelo, origem, quota e prazo por chamada antes da indexação explícita. A tabela mostra o histórico de metadados retido, estados de chamada, tokens conhecidos e latência. Tokens ausentes e custos não configurados continuam declarados; não significam consumo ou custo zero. Esses padrões de interface não comprovam qualidade do modelo, homologação de canal, identidade verificada ou integração externa disponível.

### Controles de perfil no tema WooCommerce

O shortcode `[boopay_profile]` é uma extensão mínima da página de privacidade do lojista. Os dois botões portugueses herdam a aparência e a tipografia do tema; a folha local só organiza a quebra de linha, o intervalo, a altura mínima de toque e o feedback textual. A paleta e a tipografia observadas em Twenty Twenty-Five pertencem ao tema de teste e não ampliam os tokens Boopay. O popup `/store-profile` e a composição B do dashboard permanecem inalterados.

## Do's and Don'ts

### Extensão Shopify de desenvolvimento

### Do:

### Don't:

- **Don't** introduzir roxo, gradientes, horror, tratamento infantil ou imagens genéricas de IA.
- **Don't** adicionar sombras ou transparência para substituir a hierarquia tonal existente.
- **Don't** usar apenas cor para comunicar estado ou esconder contexto de simulação.
- **Don't** transformar dados da composição visual em métricas comerciais observadas.
- **Don't** promover a composição específica do painel a uma regra obrigatória para todas as telas.
