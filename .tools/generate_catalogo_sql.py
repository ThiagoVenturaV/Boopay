import json
import os

def generate():
    sql = """-- =========================================================================
-- Boopay - Dump Oficial do Catálogo de Produtos e Combos para o MVP
-- Compatível com: PostgreSQL 14+, SQLite, MySQL 8+
-- =========================================================================

CREATE TABLE IF NOT EXISTS produtos (
    id VARCHAR(64) PRIMARY KEY,
    sku VARCHAR(64) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    marca VARCHAR(128) NOT NULL,
    categoria VARCHAR(128) NOT NULL,
    preco_centavos INTEGER NOT NULL,
    preco_original_centavos INTEGER NOT NULL,
    estoque INTEGER NOT NULL DEFAULT 10,
    disponivel BOOLEAN NOT NULL DEFAULT TRUE,
    imagem_url VARCHAR(512) NOT NULL,
    descricao TEXT,
    por_que_recomendamos TEXT,
    atributos JSON,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS combos_promocionais (
    id VARCHAR(64) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    subtitulo TEXT,
    objetivo TEXT,
    badge VARCHAR(128),
    desconto_percentual INTEGER NOT NULL,
    preco_original_centavos INTEGER NOT NULL,
    preco_combo_centavos INTEGER NOT NULL,
    motivo_recomendacao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- Inserção dos 12 Produtos de Alta Conversão
-- =========================================================================

INSERT INTO produtos (id, sku, nome, marca, categoria, preco_centavos, preco_original_centavos, estoque, disponivel, imagem_url, descricao, por_que_recomendamos, atributos)
VALUES
('boo-prod-01', 'BOO-RUN-001', 'Tênis Boopay Pulse Carbon Pro', 'BooLab Athletics', 'Calçados & Performance', 44990, 52990, 18, true, '/products/pulse-runner.png', 'Tênis de corrida e uso diário com entressola de dupla densidade, malha respirável knit e placa estabilizadora leve.', 'Atributos técnicos completos no catálogo (peso 228g, drop 8mm) e melhor relação amortecimento/preço da categoria.', '{"cor":"Navy / Verde Pulso","peso":"228g","indicacao":"Corrida e treino diário","garantia":"12 meses"}'),
('boo-prod-02', 'BOO-BAG-002', 'Mochila Impermeável commuter 24L Tech', 'KeyCore Gear', 'Viagem & Rotina', 31900, 36900, 25, true, '/products/commuter-backpack.png', 'Mochila ergonômica com tecido hidro-repelente Oxford 900D, compartimento acolchoado para notebook até 16", porta USB externa e fita para mala de bordo.', 'Volume ideal de 24L compatível com normas IATA de bagagem de mão e proteção contra chuvas moderadas.', '{"capacidade":"24L","compartimento_laptop":"Até 16 polegadas","material":"Oxford 900D Hidro-repelente"}'),
('boo-prod-03', 'BOO-HDP-003', 'Fone Bluetooth ANC Studio Air Pro', 'Aura Acoustics', 'Tech & Setup', 38900, 46900, 14, true, '/products/anc-headphones.png', 'Headphone circumaural sem fio com cancelamento ativo de ruído híbrido de 38dB, drivers dinâmicos de 40mm e bateria para até 45h de reprodução contínua.', 'Isolamento de 38dB ideal para foco em trabalho remoto, voos e chamadas em ambientes com ruído constante.', '{"autonomia":"45 horas (ANC desligado) / 32 horas (ANC ligado)","anc":"Híbrido -38dB","conectividade":"Bluetooth 5.3 + P2 (3.5mm)"}'),
('boo-prod-04', 'BOO-BOT-004', 'Garrafa Térmica Inox Vacuum 750ml', 'BooLab Athletics', 'Casa & Bem-estar', 11990, 14990, 42, true, '/products/thermo-bottle.png', 'Garrafa térmica em aço inox 304 com parede dupla isolada a vácuo: mantém líquidos gelados por 24h ou quentes por 12h sem condensar.', 'Complemento essencial para hidratação em treinos, viagens ou escritório com isolamento térmico real de 24h.', '{"volume":"750ml","conservacao":"24h frio / 12h quente","material":"Aço Inox 304"}'),
('boo-prod-05', 'BOO-APP-005', 'Camiseta Tech Dry UV50+ Performance', 'BooLab Athletics', 'Calçados & Performance', 12990, 15990, 35, true, '/products/tech-tshirt.png', 'Camiseta ultraleve em poliamida biodegradável com proteção solar UV50+, secagem rápida e tratamento antiodor.', 'Combina proteção UV50+ e secagem rápida, ideal para parear com tênis de corrida ou mala de viagem compacta.', '{"tecido":"92% Poliamida / 8% Elastano","protecao":"UV50+","modelagem":"Regular Athletic"}'),
('boo-prod-06', 'BOO-PWR-006', 'Powerbank UltraSlim MagSafe 10.000mAh 30W', 'KeyCore Gear', 'Tech & Setup', 21900, 25900, 22, true, '/products/powerbank-mag.png', 'Bateria externa magnética de 10.000mAh com saída USB-C Power Delivery de 30W e carregamento sem fio Qi2 de 15W.', 'Homologado para cabine de avião (37Wh) e carrega tanto smartphone quanto acessórios USB-C em alta velocidade.', '{"capacidade":"10.000mAh (37Wh)","potencia":"30W USB-C + 15W Wireless","peso":"185g"}'),
('boo-prod-07', 'BOO-ORG-007', 'Necessaire & Organizador de Cabos Pro', 'KeyCore Gear', 'Viagem & Rotina', 9900, 12900, 50, true, '/products/cable-organizer.png', 'Estojo semi-rígido resistente à água com divisórias elásticas moduláveis para carregadores, cabos, SSD, mouse e itens pessoais.', 'Mantém cabos, powerbank e itens de viagem protegidos e fáceis de acessar na mochila.', '{"dimensoes":"23 x 15 x 7 cm","material":"EVA revestido em Oxford 900D","peso":"160g"}'),
('boo-prod-08', 'BOO-KBD-008', 'Teclado Mecânico Sem Fio Low-Profile 75%', 'Aura Acoustics', 'Tech & Setup', 54900, 62900, 11, true, '/products/mech-keyboard.png', 'Teclado mecânico compacto 75% com switches táteis silenciosos, chassi em alumínio anodizado e conexão tri-mode (Bluetooth, 2.4GHz e USB-C).', 'Ergonomia low-profile e digitação silenciosa com baixa latência para setups de produtividade.', '{"layout":"75% Compacto ABNT/ANSI","conexao":"Bluetooth 5.3 + Dongle 2.4GHz + USB-C","estrutura":"Alumínio CNC"}'),
('boo-prod-09', 'BOO-STD-009', 'Suporte Ergonômico Dobrável em Alumínio p/ Notebook', 'KeyCore Gear', 'Tech & Setup', 13900, 16900, 30, true, '/products/laptop-stand.png', 'Suporte articulado em liga de alumínio com 7 níveis de altura, apoios em silicone antiderrapante e bolsa de transporte inclusa.', 'Corrige a postura da cervical em qualquer mesa e pesa apenas 240g para levar na mochila.', '{"material":"Liga de Alumínio Aeroespacial","ajustes":"7 níveis de inclinação","compatibilidade":"Notebooks 10 a 17 polegadas"}'),
('boo-prod-10', 'BOO-WTC-010', 'Smartband Fitness & Sono Pulse Track GPS', 'BooLab Athletics', 'Calçados & Performance', 28900, 33900, 19, true, '/products/smartband-gps.png', 'Pulseira inteligente com GPS integrado, monitor contínuo de frequência cardíaca, SpO2, recuperação de sono e resistência à água 5ATM.', 'Monitora treinos de corrida com GPS próprio sem precisar carregar o smartphone.', '{"tela":"AMOLED 1.64 60Hz","gps":"GNSS Dual-Band integrado","resistencia":"5ATM (natação)"}'),
('boo-prod-11', 'BOO-JKT-011', 'Jaqueta Corta-Vento Packable Impermeável', 'BooLab Athletics', 'Moda & Urbano', 24990, 29990, 21, true, '/products/windbreaker.png', 'Jaqueta corta-vento ultraleve com acabamento hidro-repelente DWR, capuz ajustável, detalhes refletivos e bolso que vira bolsa compacta.', 'Versátil para corrida matinal e viagens: não ocupa espaço e protege contra vento e garoa.', '{"peso":"145g","acabamento":"DWR Hidro-repelente","detalhes":"Refletivo noturno"}'),
('boo-prod-12', 'BOO-COF-012', 'Kit Prensa Francesa Inox + Café Especial Moído 250g', 'Origem Torra', 'Casa & Bem-estar', 16900, 19900, 16, true, '/products/coffee-kit.png', 'Conjunto com prensa francesa térmica em inox (600ml) de parede dupla e pacote de café especial 100% arábica pontuação 86 SCA com notas de caramelo.', 'Excelente opção de presente ou ritual de produtividade em home office sem depender de cápsulas.', '{"capacidade":"600ml (4 xícaras)","grao":"100% Arábica Catuaí Amarelo","torra":"Média fresca"}')
ON CONFLICT (id) DO UPDATE SET
    preco_centavos = EXCLUDED.preco_centavos,
    preco_original_centavos = EXCLUDED.preco_original_centavos,
    imagem_url = EXCLUDED.imagem_url,
    descricao = EXCLUDED.descricao;

-- =========================================================================
-- Inserção dos Combos Promocionais
-- =========================================================================

INSERT INTO combos_promocionais (id, titulo, subtitulo, objetivo, badge, desconto_percentual, preco_original_centavos, preco_combo_centavos, motivo_recomendacao)
VALUES
('kit-viagem-smart', 'Combo Viagem & Rotina Smart (4 itens)', 'Mochila Impermeável 24L + Powerbank MagSafe 30W + Organizador de Cabos + Garrafa Térmica 750ml', 'viagem, embarque de bordo, rotina híbrida e organização', '13% OFF no combo sugerido pela IA', 13, 75690, 65900, 'Seleção completa compatível com normas de cabine aérea (mochila 24L + powerbank 37Wh) com 13% de desconto progressivo.'),
('kit-setup-produtividade', 'Combo Setup Home Office & Foco (3 itens)', 'Fone Bluetooth ANC Studio + Teclado Mecânico Low-Profile 75% + Suporte Ergonômico em Alumínio', 'home office, conforto postural, foco e ergonomia no computador', '10% OFF no setup completo', 10, 107700, 96900, 'Solução ergonômica completa: postura cervical correta, digitação silenciosa e fone com cancelamento de ruído para chamadas.'),
('kit-corrida-completo', 'Combo Corrida & Performance Completa (4 itens)', 'Tênis Boopay Pulse Carbon + Smartband GPS + Camiseta Tech Dry UV50+ + Garrafa Térmica 750ml', 'treino diário, corrida de rua, hidratação e métricas de ritmo cardíaco', '12% OFF no combo sugerido pela IA', 12, 98870, 87000, 'Tênis com placa estabilizadora pareado com relógio GPS autônomo, camiseta com proteção UV50+ e garrafa térmica para hidratação.')
ON CONFLICT (id) DO UPDATE SET
    preco_combo_centavos = EXCLUDED.preco_combo_centavos,
    desconto_percentual = EXCLUDED.desconto_percentual;
"""
    dest = r"c:\Users\thiag\Downloads\Squad 45 - KeyCore Tech Hub\boopay-time\catalogo.sql"
    with open(dest, "w", encoding="utf-8") as f:
        f.write(sql)
    print("Wrote catalogo.sql successfully, size:", len(sql))

if __name__ == "__main__":
    generate()
