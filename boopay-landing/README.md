# Boopay Landing

Landing do Boopay construída com Next.js, TypeScript, CSS e Three.js. Um único Boo 3D, com acabamento ilustrado, sai de uma fenda e percorre a página nos dois sentidos do scroll.

## Rodar localmente

```bash
npm install
npm run dev
```

O projeto abre em `http://localhost:3000`.

## Validar

```bash
npm test
npm run lint
npm run build
npm run typecheck
```

## Hospedagem

O projeto não está publicado. Na hospedagem escolhida, configure `SITE_URL` com a URL pública completa para que os metadados Open Graph apontem para o domínio correto.

```env
SITE_URL=https://seu-dominio.com.br
NEXT_PUBLIC_CONTACT_URL=https://seu-formulario-ou-calendario.com
```

`NEXT_PUBLIC_CONTACT_URL` conecta o CTA final ao canal comercial escolhido. Sem ele, o CTA usa o site institucional da KeyCore como destino seguro.

Os comandos esperados pela maioria das plataformas são:

```bash
npm install
npm run build
npm run start
```

## Movimento e assets

- `assets/blender/boo-v2.blend`: modelo novo, criado do zero, com 11 ossos e skinning suave do corpo, cauda e nadadeiras. Não importa geometria da versão antiga.
- `public/models/boo-v2.glb`: 792 kB, quatro ações (`Boo_Emerge`, `Boo_Float`, `Boo_Swim`, `Boo_Greet`). É o único modelo carregado pela página.
- `app/boo-webgl.tsx`: shader de pigmento sem iluminação especular, câmera ortográfica e contorno que compartilha o esqueleto da malha.
- `app/boo-journey.tsx`: um canvas acompanha os espaços reservados nas seções; coordenadas e emergência derivam do scroll, inclusive na volta.
- `app/boo-path.ts`: percurso reversível e desvio de áreas de leitura. Uma máscara SVG protege textos e controles durante as transições.
- O mouse tem influência local somente fora de texto e controles. Em touch, não há perseguição do ponteiro.
- Pausa explícita interrompe movimentos autônomos; o scroll continua permitindo percorrer a página. A aba oculta suspende os frames.
- Sem WebGL ou em falha de carregamento, a mesma composição usa `boo-v2-still.png`, renderizado do novo modelo. Esse fallback não tem deformação 3D.
- `prefers-reduced-motion` apresenta o personagem estático na hero, sem perseguição do mouse ou viagem entre seções.
- Os assets v1 permanecem como histórico editável, mas não são usados pelo site.

### Regerar o Boo no Blender

Com Blender 5.2 LTS ou compatível disponível no `PATH`:

```bash
blender --background --factory-startup --python tools/blender/build_boo_v2.py
```

O script recria `.blend`, `.glb`, manifesto, seis prévias de poses e a imagem de segurança. `-- --skip-render` exporta sem renderizar as prévias. Veja o rig, as poses e o storyboard técnico em [docs/boo-v2.md](docs/boo-v2.md).

### Storyboard da entrada da hero

1. No topo: somente os olhos dentro de uma fenda horizontal localizada.
2. Primeiro scroll: a abertura alarga; cabeça, nadadeiras e corpo surgem com recorte na borda.
3. Ao completar a saída: o corpo flexiona e a cauda acompanha o movimento.
4. Catálogo à direita → decisão à esquerda → evidência à direita → princípios à esquerda → contato à direita.
5. Ao subir: a mesma trajetória é percorrida em sentido inverso até restarem apenas os olhos na fenda.
6. Com movimento reduzido: imagem estática, conteúdo e navegação disponíveis normalmente.

## Direção do produto

A página apresenta o fluxo do Boopay: auditoria GEO, catálogo agêntico, recomendação, revisão e confirmação do checkout e atribuição auditável de receita.

O site não deve afirmar homologação oficial dentro de ChatGPT ou Gemini sem evidência específica. Checkout “invisível” significa sem redirecionamento, mas sempre com revisão e confirmação explícita do comprador.
