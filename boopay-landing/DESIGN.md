---
name: Boopay Landing
description: Uma passagem autoral entre catálogo, decisão e confirmação, conduzida por Boo sem clichês visuais de IA.
colors:
  cream: '#f4ecd9'
  cream-light: '#fff9eb'
  petrol: '#123f3b'
  petrol-deep: '#082d2e'
  ink: '#0b3331'
  mint: '#a8ddbf'
  mint-bright: '#c9efd7'
  orange: '#b54818'
  orange-bright: '#d86126'
  orange-light: '#f28b4b'
  line: 'rgba(11, 51, 49, 0.24)'
  muted: '#596b64'
  boo-ivory: '#f4edcf'
  boo-mint: '#76cbb4'
  boo-gold: '#eacb76'
typography:
  display:
    fontFamily: 'Archivo, Arial, sans-serif'
    fontSize: 'clamp(3.3rem, 5.65vw, 6rem)'
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: '-0.04em'
  headline:
    fontFamily: 'Archivo, Arial, sans-serif'
    fontSize: 'clamp(3rem, 5.2vw, 6.3rem)'
    fontWeight: 600
    lineHeight: 0.96
    letterSpacing: '-0.04em'
  body:
    fontFamily: 'Archivo, Arial, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.6
  expressive:
    fontFamily: 'Medula One, serif'
    fontWeight: 400
    lineHeight: 1
  label:
    fontFamily: 'Azeret Mono, monospace'
    fontSize: '0.68rem'
    fontWeight: 700
    letterSpacing: '0.12em'
  control:
    fontFamily: 'Archivo, Arial, sans-serif'
    fontSize: '0.84rem'
    fontWeight: 700
rounded:
  sharp: '0px'
  circle: '50%'
spacing:
  mobile-gutter: '1rem'
  tablet-gutter: '1.75rem'
  desktop-gutter: '3.5rem'
  control-x: '1.35rem'
  section-min: '7rem'
components:
  primary-cta:
    backgroundColor: '{colors.petrol}'
    textColor: '{colors.cream-light}'
    typography: '{typography.control}'
    rounded: '{rounded.sharp}'
    padding: '0 1.35rem'
    height: '3.35rem'
  primary-cta-hover:
    backgroundColor: '{colors.orange-bright}'
    textColor: '{colors.petrol-deep}'
    typography: '{typography.control}'
    rounded: '{rounded.sharp}'
  confirm-order:
    backgroundColor: '{colors.petrol}'
    textColor: '{colors.cream-light}'
    typography: '{typography.control}'
    rounded: '{rounded.sharp}'
    padding: '0.8rem 1rem'
    height: '3.4rem'
    width: '100%'
  confirm-order-done:
    backgroundColor: '{colors.mint}'
    textColor: '{colors.petrol-deep}'
    typography: '{typography.control}'
    rounded: '{rounded.sharp}'
  section-marker:
    textColor: '{colors.muted}'
    typography: '{typography.label}'
    rounded: '{rounded.sharp}'
    padding: '0.8rem 0 0'
---

# Design System: Boopay Landing

## Overview

**Creative North Star: "A operação ganha passagem"**

A landing traduz uma operação de comércio orientado por agentes em uma experiência aberta, cinética e inequívoca. A direção foi informada pelo ritmo, pela confiança tipográfica e pelos momentos memoráveis de sites premiados, sem copiar uma referência e sem cair na aparência previsível de conteúdo gerado por IA. O canvas marfim permanece quase inteiro, enquanto tinta petróleo, menta e ouro queimado organizam atenção, estado e ação.

Boo é parte do mecanismo: os olhos aparecem na fenda e o personagem sai conforme o scroll, atravessa as seções e retorna ao subir. O novo modelo v2 tem skinning suave, corpo e cauda deformáveis e nadadeiras articuladas. O fallback usa uma imagem estática desse mesmo modelo, sem prometer deformação 3D. Produto em escala, linhas estruturais e alternância entre capítulos claros e escuros organizam a narrativa.

A copy visível trata o Boopay como produto em produção, sem MVP, teste ou demonstração. Isso não autoriza inventar clientes, métricas, homologações, integrações ou resultados. As fontes de autoridade visual continuam sendo os quatro storyboards aprovados em `../boopay-landing-conceito-2026-08-28/assets/01-hero-storyboard.png` a `04-proof-cta-storyboard.png`, junto do Boo fornecido pelo usuário, `assets/blender/boo-v2.blend` e `public/models/boo-v2.glb`.

**Key Characteristics:**

- Campo flat de marfim, tinta, menta e ouro queimado.
- Fenda horizontal, olhos primeiro e Boo saindo no scroll.
- Boo 3D rigado com acabamento toon aquarelado e fallback raster equivalente.
- Produto em escala, linhas e círculos como estrutura; nunca mosaico de cards.
- Hierarquia tipográfica compacta, com tracking de títulos limitado a `-0.04em`.
- Marcadores de seção que numeram e orientam a narrativa, nunca kickers decorativos.

## Colors

A paleta é flat, quente e legível: marfins sustentam o campo; petróleo e tinta definem texto e estrutura; menta comunica conexão e confirmação; laranjas funcionam como ouro queimado para ênfase e ação. Boo acrescenta variações próprias de marfim, menta e ouro por shader de pigmento, sem ampliar a paleta da interface.

### Primary

- **Petróleo estrutural:** texto forte, fenda, linhas, botões e capítulos escuros.
- **Tinta profunda:** texto corrente e contornos do personagem.

### Secondary

- **Menta de confirmação:** estados concluídos, sinais de conexão e CTA final.
- **Menta clara:** variação luminosa reservada a superfícies e sinais suaves.

### Tertiary

- **Ouro queimado:** ênfase tipográfica, hover, foco e numeração de etapas.
- **Aquarela de Boo:** marfim, menta e ouro são misturados no shader do corpo; não representam novos acentos de UI.

### Neutral

- **Marfim de campo:** fundo dominante da hero e das seções abertas.
- **Marfim claro:** superfície de leitura e texto sobre capítulos escuros.
- **Linha translúcida:** divisórias que estruturam sem formar caixas.
- **Muted:** texto secundário e metadados.

### Named Rules

**The Flat Palette Rule.** Use cor sólida e contraste; não use roxo, violeta, magenta, lavanda, índigo, gradientes, glassmorphism ou glow.

**The Boo Surface Rule.** Boo usa marfim, tinta, menta e ouro aquarelados, sem blush e sem bolinhas nas bochechas.

## Typography

**Display Font:** Archivo (com Arial e sans-serif como fallback)

**Body Font:** Archivo (com Arial e sans-serif como fallback)

**Label/Mono Font:** Azeret Mono (com monospace como fallback)

**Expressive Font:** Medula One (com serif como fallback)

**Character:** Archivo cria autoridade contemporânea sem assumir o tom de uma interface SaaS. Azeret Mono sinaliza etapa, origem e estado; Medula One aparece apenas em fala humana e readouts expressivos.

### Hierarchy

- **Display** (600, escala fluida, entrelinha `0.98`): oferta principal da hero.
- **Headline** (600, escala fluida, entrelinha `0.96`): títulos de capítulo e CTA final.
- **Title** (600, escala contextual, entrelinha próxima de `1`): recomendação e princípios.
- **Body** (400, base `1rem`, entrelinha `1.6`): explicação e evidência.
- **Label** (700, base `0.68rem`, tracking positivo): categorias, números, etapas e estados; caixa alta só quando o papel é estrutural.
- **Expressive** (400, entrelinha `1`): intenção do comprador e “Rastreável”.

### Named Rules

**The Tight, Not Crushed Rule.** O tracking negativo dos títulos para em `-0.04em`; não comprimir além disso.

**The Label Has a Job Rule.** Azeret Mono e caixa alta devem indicar categoria, sequência, origem ou estado; não criar kickers só para preencher espaço.

## Layout

A hero usa `220svh` com palco sticky de `100svh`. Oferta e CTAs ocupam a esquerda; sinais operacionais ficam à direita; fenda, Boo e produto compartilham o campo central aberto. O container máximo é `1400px`, com gutter de `3.5rem` no desktop, `1.75rem` no tablet e `1rem` no mobile.

Depois da hero, a página organiza catálogo compreensível, intenção → recomendação → revisão → confirmação, cinco estados auditáveis, quatro princípios de confiança e contato final. Os `.section-marker` são cabeçalhos estruturais numerados “01 / 02 / 03”: abrem o capítulo, informam posição na narrativa e usam uma linha superior; não são badges nem decoração.

Até `1040px`, a navegação central some e os grids compactam. Até `760px`, a hero usa `210svh`, contexto e produto lateral são removidos, a fenda e Boo ganham presença e as seções passam a fluxo vertical. Controles acionáveis preservam pelo menos `44px` de altura no mobile; o CTA principal mede no mínimo `48px` nessa faixa.

**The Open Field Rule.** Estruture com alinhamento, linha, escala, órbita e alternância tonal; não envolva cada ideia em um card.

## Elevation & Depth

O sistema de interface é plano. Profundidade vem de escala, sobreposição, recorte da fenda, círculos orbitais e alternância marfim/petróleo. A sombra difusa sob a abertura pertence apenas à fenda; o anel do status é um indicador estrutural, não um glow. Não há glass, transparência decorativa ou sombra genérica de card.

O volume 3D é exclusivo de Boo. Contorno skinned, pigmento unlit e câmera ortográfica aproximam o GLB do personagem ilustrado e evitam o aspecto de render 3D genérico.

**The Flat Interface, Dimensional Character Rule.** A interface continua flat; somente Boo recebe volume e rig, sem iluminação especular.

## Shapes

Controles, divisórias e blocos operacionais são retos, com cantos de `0px` e bordas finas. Círculos representam órbita, status, conexão e os olhos da assinatura. A forma orgânica e assimétrica pertence ao Boo e à fenda; não deve contaminar superfícies utilitárias.

A silhueta de Boo é canônica. Não substituir por fantasma de lençol, robô ou mascote genérico; não adicionar blush, cheek dots, acessórios gratuitos ou feições infantis.

## Components

### Hero, fenda e Boo

`app/page.tsx` reúne header, oferta, CTAs, sinais “Catálogo estruturado / Decisão revisável / Pedido confirmado”, produto em foco e `HeroMotion`. A entrada é uma sequência específica: a fenda horizontal se abre, os olhos isolados aparecem primeiro, o scroll afasta os lábios e só então Boo sai.

`BooJourney` mantém um único personagem em toda a página. `mountBooScene` carrega somente `public/models/boo-v2.glb`, criado do zero em `assets/blender/boo-v2.blend`. Quatro ações — `Boo_Emerge`, `Boo_Float`, `Boo_Swim`, `Boo_Greet` — deformam o rig de 11 ossos. O shader de pigmento é unlit; o contorno usa uma malha invertida com o mesmo esqueleto. Não há brilho plástico ou iluminação especular.

`BooIllustration` usa `public/boo-v2-still.png`, renderizado do novo modelo. Em falha de WebGL, acompanha o trajeto sem articulação. Em movimento reduzido, fica estático na hero. O modelo e os frames antigos não são importados pelo site.

### Buttons and links

- **Primary CTA:** retangular, petróleo sobre marfim, altura mínima de `3.35rem`; no hover passa a ouro queimado e sobe `2px`.
- **Mint CTA:** menta sobre petróleo profundo no capítulo final; mantém a mesma geometria.
- **Order confirmation:** ocupa toda a largura, altura mínima de `3.4rem`; menta e texto petróleo representam o estado confirmado. Mantém `aria-pressed` e resultado em `aria-live`.
- **Text and navigation links:** sublinhado cresce da direita para a esquerda no hover/foco. Links de header mantêm pelo menos `44px` de altura.
- **Focus:** todo controle visível recebe outline ouro queimado de `3px`, com offset de `4px`.

### Section markers and operational flows

Marcadores de seção combinam número, nome do capítulo e linha superior. Atributos de catálogo, caminho de decisão e prova usam linhas, listas, círculos e mudanças de estado; não usam cards, badges decorativos ou contêineres glass.

### Motion, accessibility and lifecycle

Um diretor de scroll via requestAnimationFrame controla entrada e percurso bidirecional. As seções reservam espaços alternados; desvios e uma máscara SVG protegem leitura e controles. O mouse só influencia espaços livres próximos do Boo. Pausa explícita interrompe movimentos autônomos. Em `reduce`, o personagem fica estático na hero. Há skip link, navegação por teclado e alvos móveis de pelo menos `44px`.

O renderer usa preferência de baixo consumo, limita DPR a `1.5`, suspende frames quando o documento fica oculto e ativa fallback em perda de contexto. No unmount, cancela o fetch, remove listeners e observers e descarta skeletons, texturas, materiais, geometrias e renderer. O canvas não desenha enquanto apenas os olhos CSS estão visíveis.

**The WebGL Budget Rule.** Um GLB abaixo de 1 MB, um canvas, pigmento unlit e contorno skinned; DPR até `1.5`, suspensão em aba oculta e descarte no unmount. Storyboard e mapa do rig: `docs/boo-v2.md`.

### CTA and contact

Os CTAs da hero levam a `#contato`. O CTA final usa `NEXT_PUBLIC_CONTACT_URL?.trim()` e o fallback confirmado `https://keycore.com.br/`. Preservar a copy de produção; qualquer nova alegação exige evidência.

## Do's and Don'ts

### Do:

- **Do** preservar os quatro storyboards, Boo central e produto em escala.
- **Do** preservar fenda horizontal, olhos primeiro e Boo saindo conforme o scroll.
- **Do** usar o modelo v2 e seu próprio render de segurança, sem reintroduzir o modelo antigo.
- **Do** manter a interface flat e o acabamento 3D toon/aquarelado exclusivo de Boo.
- **Do** usar marcadores de seção como estrutura numerada da narrativa.
- **Do** manter tracking de títulos em no mínimo `-0.04em`, foco visível e alvos móveis de pelo menos `44px`.
- **Do** preservar confirmação humana explícita, copy de produção e afirmações sustentadas por evidência.

### Don't:

- **Don't** transformar a landing em dashboard SaaS, mosaico de cards, dossiê ou vitrine de métricas.
- **Don't** usar kickers, chips ou badges sem função estrutural.
- **Don't** usar roxo, gradientes, glass, glow, brilhos de IA ou sombra genérica de card.
- **Don't** adicionar blush ou bolinhas nas bochechas de Boo, nem trocar sua silhueta por 3D genérico.
- **Don't** reintroduzir papel, fichário, carimbo, pôster editorial ou estética de carrossel social.
- **Don't** alterar copy para fabricar clientes, números, integrações, homologações ou resultados.
