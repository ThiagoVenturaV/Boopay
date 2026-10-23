export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  priceCents: number;
  originalPriceCents?: number;
  stock: number;
  inStock: boolean;
  imageUrl: string;
  description: string;
  highlights: string[];
  attributes: Record<string, string>;
  geoScore: number;
  geoSignals: string[];
  whyRecommended: string;
  source: 'demo' | 'woocommerce' | 'shopify' | 'vtex';
}

export interface CatalogBundleItem {
  productId: string;
  name: string;
  brand: string;
  priceCents: number;
  qty: number;
  imageUrl: string;
  category: string;
}

export interface CatalogBundle {
  id: string;
  title: string;
  subtitle: string;
  goal: string;
  badge: string;
  discountPct: number;
  originalTotalCents: number;
  bundlePriceCents: number;
  items: CatalogBundleItem[];
  whyRecommended: string;
  source: 'demo' | 'ai_curated';
}

export const DEMO_PRODUCTS: CatalogProduct[] = [
  {
    id: 'boo-prod-01',
    sku: 'BOO-RUN-001',
    name: 'Tênis Boopay Pulse Carbon Pro',
    brand: 'BooLab Athletics',
    category: 'Calçados & Performance',
    priceCents: 44990,
    originalPriceCents: 52990,
    stock: 18,
    inStock: true,
    imageUrl: '/products/pulse-runner.svg',
    description: 'Tênis de corrida e uso diário com entressola de dupla densidade, malha respirável knit e placa estabilizadora leve.',
    highlights: ['Drop 8mm equilibrado', 'Cabedal respirável ultra leve (228g)', 'Solado de borracha de alta tração'],
    attributes: { cor: 'Navy / Verde Pulso', peso: '228g', indicacao: 'Corrida e treino diário', garantia: '12 meses' },
    geoScore: 97,
    geoSignals: ['Schema Product completo', 'GTIN/SKU verificados', 'Política de troca explícita', 'Estoque em tempo real'],
    whyRecommended: 'Atributos técnicos completos no catálogo (peso 228g, drop 8mm) e melhor relação amortecimento/preço da categoria.',
    source: 'demo'
  },
  {
    id: 'boo-prod-02',
    sku: 'BOO-BAG-002',
    name: 'Mochila Impermeável commuter 24L Tech',
    brand: 'KeyCore Gear',
    category: 'Viagem & Rotina',
    priceCents: 31900,
    originalPriceCents: 36900,
    stock: 25,
    inStock: true,
    imageUrl: '/products/commuter-backpack.svg',
    description: 'Mochila urbana impermeável com compartimento acolchoado para notebook até 16", bolso antifurto traseiro e passagem para mala de bordo.',
    highlights: ['Tecido ripstop impermeável IPX4', 'Divisória suspensa para notebook 16"', 'Abertura 180° estilo mala de cabine'],
    attributes: { capacidade: '24 Litros', material: 'Nylon Ballistic Impermeável', notebook: 'Até 16 polegadas' },
    geoScore: 96,
    geoSignals: ['Schema Product + Offer validados', 'Dimensões de cabine especificadas', 'Avaliações estruturadas'],
    whyRecommended: 'Ideal para rotina híbrida e viagens curtas: cabe notebook 16" com proteção impermeável e padrão de bordo.',
    source: 'demo'
  },
  {
    id: 'boo-prod-03',
    sku: 'BOO-AUD-003',
    name: 'Fone Bluetooth ANC Studio Air Pro',
    brand: 'Aura Acoustics',
    category: 'Tech & Setup',
    priceCents: 48900,
    originalPriceCents: 57900,
    stock: 14,
    inStock: true,
    imageUrl: '/products/anc-headphones.svg',
    description: 'Headphone over-ear com cancelamento ativo de ruído híbrido (-42dB), bateria de 45 horas e conexão multiponto para notebook e celular.',
    highlights: ['ANC híbrido de -42dB com modo transparência', '45h de autonomia + carga rápida USB-C', 'Pareamento simultâneo em 2 dispositivos'],
    attributes: { bateria: '45 horas', conectividade: 'Bluetooth 5.4 Multiponto', peso: '255g' },
    geoScore: 95,
    geoSignals: ['Especificações acústicas completas', 'Compatibilidade documentada', 'Preço autoritativo sincronizado'],
    whyRecommended: 'Destaque para foco em trabalho remoto e viagens graças ao ANC de -42dB e conexão multiponto.',
    source: 'demo'
  },
  {
    id: 'boo-prod-04',
    sku: 'BOO-BOT-004',
    name: 'Garrafa Térmica Inox Vacuum 750ml',
    brand: 'BooLab Athletics',
    category: 'Viagem & Rotina',
    priceCents: 11990,
    originalPriceCents: 14990,
    stock: 42,
    inStock: true,
    imageUrl: '/products/thermo-bottle.svg',
    description: 'Garrafa térmica em aço inox 304 com parede dupla isolada a vácuo: mantém líquidos gelados por 24h ou quentes por 12h sem condensar.',
    highlights: ['Inox 304 livre de BPA', 'Tampa hermética com alça de transporte', 'Pintura eletrostática antiderrapante'],
    attributes: { volume: '750ml', conservacao: '24h frio / 12h quente', material: 'Aço Inox 304' },
    geoScore: 94,
    geoSignals: ['Dados de capacidade e material verificados', 'Disponibilidade imediata'],
    whyRecommended: 'Complemento essencial para hidratação em treinos, viagens ou escritório com isolamento térmico real de 24h.',
    source: 'demo'
  },
  {
    id: 'boo-prod-05',
    sku: 'BOO-APP-005',
    name: 'Camiseta Tech Dry UV50+ Performance',
    brand: 'BooLab Athletics',
    category: 'Calçados & Performance',
    priceCents: 12990,
    originalPriceCents: 15990,
    stock: 35,
    inStock: true,
    imageUrl: '/products/tech-tshirt.svg',
    description: 'Camiseta ultraleve em poliamida biodegradável com proteção solar UV50+, secagem rápida e tratamento antiodor.',
    highlights: ['Poliamida com toque gelado', 'Proteção solar permanente UV50+', 'Costuras planas anti-atrito'],
    attributes: { tecido: '92% Poliamida / 8% Elastano', protecao: 'UV50+', modelagem: 'Regular Athletic' },
    geoScore: 93,
    geoSignals: ['Tabela de composição têxtil estruturada', 'Atributos de variação claros'],
    whyRecommended: 'Combina proteção UV50+ e secagem rápida, ideal para parear com tênis de corrida ou mala de viagem compacta.',
    source: 'demo'
  },
  {
    id: 'boo-prod-06',
    sku: 'BOO-PWR-006',
    name: 'Powerbank UltraSlim MagSafe 10.000mAh 30W',
    brand: 'KeyCore Gear',
    category: 'Tech & Setup',
    priceCents: 21900,
    originalPriceCents: 25900,
    stock: 22,
    inStock: true,
    imageUrl: '/products/powerbank-mag.svg',
    description: 'Bateria externa magnética de 10.000mAh com saída USB-C Power Delivery de 30W e carregamento sem fio Qi2 de 15W.',
    highlights: ['Homologado para embarque em voos (37Wh)', 'Carregamento rápido PD 30W bidirectional', 'Display LED de percentual exato'],
    attributes: { capacidade: '10.000mAh (37Wh)', potencia: '30W USB-C + 15W Wireless', peso: '185g' },
    geoScore: 96,
    geoSignals: ['Especificação Wh para aviação presente', 'Potência PD documentada'],
    whyRecommended: 'Homologado para cabine de avião (37Wh) e carrega tanto smartphone quanto acessórios USB-C em alta velocidade.',
    source: 'demo'
  },
  {
    id: 'boo-prod-07',
    sku: 'BOO-ORG-007',
    name: 'Necessaire & Organizador de Cabos Pro',
    brand: 'KeyCore Gear',
    category: 'Viagem & Rotina',
    priceCents: 9900,
    originalPriceCents: 12900,
    stock: 50,
    inStock: true,
    imageUrl: '/products/cable-organizer.svg',
    description: 'Estojo semi-rígido resistente à água com divisórias elásticas moduláveis para carregadores, cabos, SSD, mouse e itens pessoais.',
    highlights: ['Zíper duplo YKK selado', 'Divisórias internas ajustáveis em velcro', 'Bolso com malha para cartões e adaptadores'],
    attributes: { dimensoes: '23 x 15 x 7 cm', material: 'EVA revestido em Oxford 900D', peso: '160g' },
    geoScore: 92,
    geoSignals: ['Dimensões internas e externas estruturadas', 'Estoque validado'],
    whyRecommended: 'Mantém cabos, powerbank e itens de viagem protegidos e fáceis de acessar na mochila.',
    source: 'demo'
  },
  {
    id: 'boo-prod-08',
    sku: 'BOO-KBD-008',
    name: 'Teclado Mecânico Sem Fio Low-Profile 75%',
    brand: 'Aura Acoustics',
    category: 'Tech & Setup',
    priceCents: 54900,
    originalPriceCents: 62900,
    stock: 11,
    inStock: true,
    imageUrl: '/products/mech-keyboard.svg',
    description: 'Teclado mecânico compacto 75% com switches táteis silenciosos, chassi em alumínio anodizado e conexão tri-mode (Bluetooth, 2.4GHz e USB-C).',
    highlights: ['Switches low-profile silenciosos', 'Compatível com Windows, macOS e Linux', 'Keycaps PBT double-shot resistentes a brilho'],
    attributes: { layout: '75% Compacto ABNT/ANSI', conexao: 'Bluetooth 5.3 + Dongle 2.4GHz + USB-C', estrutura: 'Alumínio CNC' },
    geoScore: 95,
    geoSignals: ['Ficha técnica de switches e conectividade completa', 'Garantia e retorno claros'],
    whyRecommended: 'Ergonomia low-profile e digitação silenciosa com baixa latência para setups de produtividade.',
    source: 'demo'
  },
  {
    id: 'boo-prod-09',
    sku: 'BOO-STD-009',
    name: 'Suporte Ergonômico Dobrável em Alumínio p/ Notebook',
    brand: 'KeyCore Gear',
    category: 'Tech & Setup',
    priceCents: 13900,
    originalPriceCents: 16900,
    stock: 30,
    inStock: true,
    imageUrl: '/products/laptop-stand.svg',
    description: 'Suporte articulado em liga de alumínio com 7 níveis de altura, apoios em silicone antiderrapante e bolsa de transporte inclusa.',
    highlights: ['Suporta até 15kg com estabilidade total', 'Aberto favorece dissipação térmica', 'Dobrável: cabe no bolso da mochila'],
    attributes: { material: 'Liga de Alumínio Aeroespacial', ajustes: '7 níveis de inclinação', compatibilidade: 'Notebooks 10" a 17"' },
    geoScore: 94,
    geoSignals: ['Faixa de tamanho e carga máxima especificadas', 'Imagens e atributos completos'],
    whyRecommended: 'Corrige a postura da cervical em qualquer mesa e pesa apenas 240g para levar na mochila.',
    source: 'demo'
  },
  {
    id: 'boo-prod-10',
    sku: 'BOO-WTC-010',
    name: 'Smartband Fitness & Sono Pulse Track GPS',
    brand: 'BooLab Athletics',
    category: 'Calçados & Performance',
    priceCents: 28900,
    originalPriceCents: 33900,
    stock: 19,
    inStock: true,
    imageUrl: '/products/smartband-gps.svg',
    description: 'Pulseira inteligente com GPS integrado, monitor contínuo de frequência cardíaca, SpO2, recuperação de sono e resistência à água 5ATM.',
    highlights: ['GPS autônomo sem depender do celular', 'Bateria para até 12 dias de uso', '120 modos esportivos + resistência 5ATM'],
    attributes: { tela: 'AMOLED 1.64" 60Hz', gps: 'GNSS Dual-Band integrado', resistencia: '5ATM (natação)' },
    geoScore: 95,
    geoSignals: ['Sensores e autonomia detalhados no schema', 'Elegível para canais agênticos'],
    whyRecommended: 'Monitora treinos de corrida com GPS próprio sem precisar carregar o smartphone.',
    source: 'demo'
  },
  {
    id: 'boo-prod-11',
    sku: 'BOO-JKT-011',
    name: 'Jaqueta Corta-Vento Packable Impermeável',
    brand: 'BooLab Athletics',
    category: 'Moda & Urbano',
    priceCents: 24990,
    originalPriceCents: 29990,
    stock: 21,
    inStock: true,
    imageUrl: '/products/windbreaker.svg',
    description: 'Jaqueta corta-vento ultraleve com acabamento hidro-repelente DWR, capuz ajustável, detalhes refletivos e bolso que vira bolsa compacta.',
    highlights: ['Dobra no próprio bolso (packable)', 'Detalhes refletivos 360° para corrida noturna', 'Aberturas estratégicas de ventilação'],
    attributes: { peso: '145g', acabamento: 'DWR Hidro-repelente', detalhes: 'Refletivo noturno' },
    geoScore: 93,
    geoSignals: ['Atributos de uso climático e peso documentados'],
    whyRecommended: 'Versátil para corrida matinal e viagens: não ocupa espaço e protege contra vento e garoa.',
    source: 'demo'
  },
  {
    id: 'boo-prod-12',
    sku: 'BOO-COF-012',
    name: 'Kit Prensa Francesa Inox + Café Especial Moído 250g',
    brand: 'Origem Torra',
    category: 'Casa & Bem-estar',
    priceCents: 16900,
    originalPriceCents: 19900,
    stock: 16,
    inStock: true,
    imageUrl: '/products/coffee-kit.svg',
    description: 'Conjunto com prensa francesa térmica em inox (600ml) de parede dupla e pacote de café especial 100% arábica pontuação 86 SCA com notas de caramelo.',
    highlights: ['Prensa em inox inquebrável com filtro duplo', 'Café 100% Arábica da Mantiqueira (86 pontos)', 'Mantém o café quente por 2x mais tempo'],
    attributes: { capacidade: '600ml (4 xícaras)', grao: '100% Arábica Catuaí Amarelo', torra: 'Média fresca' },
    geoScore: 91,
    geoSignals: ['Origem, torra e capacidade documentadas no catálogo'],
    whyRecommended: 'Excelente opção de presente ou ritual de produtividade em home office sem depender de cápsulas.',
    source: 'demo'
  }
];

export const DEMO_BUNDLES: CatalogBundle[] = [
  {
    id: 'kit-viagem-smart',
    title: 'Combo Viagem & Rotina Smart (4 itens)',
    subtitle: 'Mochila Impermeável 24L + Powerbank MagSafe 30W + Organizador de Cabos + Garrafa Térmica 750ml',
    goal: 'viagem, embarque de bordo, rotina híbrida e organização',
    badge: '12% OFF no combo sugerido pela IA',
    discountPct: 12,
    originalTotalCents: 75690,
    bundlePriceCents: 66600,
    items: [
      {
        productId: 'boo-prod-02',
        name: 'Mochila Impermeável commuter 24L Tech',
        brand: 'KeyCore Gear',
        priceCents: 28070,
        qty: 1,
        imageUrl: '/products/commuter-backpack.svg',
        category: 'Viagem & Rotina'
      },
      {
        productId: 'boo-prod-06',
        name: 'Powerbank UltraSlim MagSafe 10.000mAh 30W',
        brand: 'KeyCore Gear',
        priceCents: 19270,
        qty: 1,
        imageUrl: '/products/powerbank-mag.svg',
        category: 'Tech & Setup'
      },
      {
        productId: 'boo-prod-04',
        name: 'Garrafa Térmica Inox Vacuum 750ml',
        brand: 'BooLab Athletics',
        priceCents: 10550,
        qty: 1,
        imageUrl: '/products/thermo-bottle.svg',
        category: 'Viagem & Rotina'
      },
      {
        productId: 'boo-prod-07',
        name: 'Necessaire & Organizador de Cabos Pro',
        brand: 'KeyCore Gear',
        priceCents: 8710,
        qty: 1,
        imageUrl: '/products/cable-organizer.svg',
        category: 'Viagem & Rotina'
      }
    ],
    whyRecommended: 'Seleção completa compatível com normas de cabine aérea (mochila 24L + powerbank 37Wh) com 12% de desconto progressivo.',
    source: 'demo'
  },
  {
    id: 'kit-setup-produtividade',
    title: 'Combo Setup Home Office & Foco (3 itens)',
    subtitle: 'Fone Bluetooth ANC Studio + Teclado Mecânico Low-Profile 75% + Suporte Ergonômico em Alumínio',
    goal: 'home office, trabalho remoto, foco, programação e ergonomia',
    badge: '10% OFF no combo sugerido pela IA',
    discountPct: 10,
    originalTotalCents: 117700,
    bundlePriceCents: 105930,
    items: [
      {
        productId: 'boo-prod-03',
        name: 'Fone Bluetooth ANC Studio Air Pro',
        brand: 'Aura Acoustics',
        priceCents: 44010,
        qty: 1,
        imageUrl: '/products/anc-headphones.svg',
        category: 'Tech & Setup'
      },
      {
        productId: 'boo-prod-08',
        name: 'Teclado Mecânico Sem Fio Low-Profile 75%',
        brand: 'Aura Acoustics',
        priceCents: 49410,
        qty: 1,
        imageUrl: '/products/mech-keyboard.svg',
        category: 'Tech & Setup'
      },
      {
        productId: 'boo-prod-09',
        name: 'Suporte Ergonômico Dobrável em Alumínio p/ Notebook',
        brand: 'KeyCore Gear',
        priceCents: 12510,
        qty: 1,
        imageUrl: '/products/laptop-stand.svg',
        category: 'Tech & Setup'
      }
    ],
    whyRecommended: 'Ergonomia completa + isolamento acústico de -42dB para produtividade máxima no trabalho remoto.',
    source: 'demo'
  },
  {
    id: 'kit-corrida-performance',
    title: 'Combo Corrida & Performance Completa (4 itens)',
    subtitle: 'Tênis Boopay Pulse Carbon + Smartband GPS + Camiseta Tech Dry UV50+ + Garrafa Térmica 750ml',
    goal: 'corrida, treino, academia, esporte e saúde',
    badge: '12% OFF no combo sugerido pela IA',
    discountPct: 12,
    originalTotalCents: 98870,
    bundlePriceCents: 87000,
    items: [
      {
        productId: 'boo-prod-01',
        name: 'Tênis Boopay Pulse Carbon Pro',
        brand: 'BooLab Athletics',
        priceCents: 39590,
        qty: 1,
        imageUrl: '/products/pulse-runner.svg',
        category: 'Calçados & Performance'
      },
      {
        productId: 'boo-prod-10',
        name: 'Smartband Fitness & Sono Pulse Track GPS',
        brand: 'BooLab Athletics',
        priceCents: 25430,
        qty: 1,
        imageUrl: '/products/smartband-gps.svg',
        category: 'Calçados & Performance'
      },
      {
        productId: 'boo-prod-05',
        name: 'Camiseta Tech Dry UV50+ Performance',
        brand: 'BooLab Athletics',
        priceCents: 11430,
        qty: 1,
        imageUrl: '/products/tech-tshirt.svg',
        category: 'Calçados & Performance'
      },
      {
        productId: 'boo-prod-04',
        name: 'Garrafa Térmica Inox Vacuum 750ml',
        brand: 'BooLab Athletics',
        priceCents: 10550,
        qty: 1,
        imageUrl: '/products/thermo-bottle.svg',
        category: 'Viagem & Rotina'
      }
    ],
    whyRecommended: 'Kit pronto para corrida de rua com monitoramento GPS autônomo, proteção solar UV50+ e amortecimento responsivo.',
    source: 'demo'
  }
];
