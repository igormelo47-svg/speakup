from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.units import mm


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "Projeto-Cintura-Base-21.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

W, H = A4
M = 18 * mm

NAVY = colors.HexColor("#13293D")
NAVY_2 = colors.HexColor("#203E59")
TEAL = colors.HexColor("#1B998B")
TEAL_DARK = colors.HexColor("#13766C")
CORAL = colors.HexColor("#EF6F61")
GOLD = colors.HexColor("#E8B44F")
CREAM = colors.HexColor("#F7F4EE")
MIST = colors.HexColor("#EDF4F3")
PALE = colors.HexColor("#F3F6F8")
INK = colors.HexColor("#23313D")
MUTED = colors.HexColor("#5E6D78")
LINE = colors.HexColor("#D8E0E5")
WHITE = colors.white


def register_fonts():
    font_dir = Path(r"C:\Windows\Fonts")
    pdfmetrics.registerFont(TTFont("Body", str(font_dir / "arial.ttf")))
    pdfmetrics.registerFont(TTFont("Body-Bold", str(font_dir / "arialbd.ttf")))
    pdfmetrics.registerFont(TTFont("Body-Italic", str(font_dir / "ariali.ttf")))
    pdfmetrics.registerFont(TTFont("Display", str(font_dir / "georgia.ttf")))
    pdfmetrics.registerFont(TTFont("Display-Bold", str(font_dir / "georgiab.ttf")))
    pdfmetrics.registerFontFamily(
        "Body", normal="Body", bold="Body-Bold", italic="Body-Italic", boldItalic="Body-Bold"
    )


register_fonts()


def style(size=10, leading=None, color=INK, font="Body", align=TA_LEFT):
    return ParagraphStyle(
        "x",
        fontName=font,
        fontSize=size,
        leading=leading or size * 1.38,
        textColor=color,
        alignment=align,
        spaceAfter=0,
        spaceBefore=0,
    )


def para(c, text, x, y, width, size=10, leading=None, color=INK, font="Body", align=TA_LEFT):
    p = Paragraph(text, style(size, leading, color, font, align))
    _, ph = p.wrap(width, H)
    p.drawOn(c, x, y - ph)
    return y - ph


def box(c, x, y, w, h, fill=WHITE, stroke=LINE, radius=10, sw=0.8):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(sw)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)


def page_bg(c, page_no, section="BASE 21"):
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(0, H - 7 * mm, W, 7 * mm, fill=1, stroke=0)
    c.setFont("Body-Bold", 7.5)
    c.setFillColor(colors.Color(1, 1, 1, alpha=0.86))
    c.drawString(M, H - 4.8 * mm, section.upper())
    c.setStrokeColor(LINE)
    c.line(M, 13 * mm, W - M, 13 * mm)
    c.setFont("Body", 7.5)
    c.setFillColor(MUTED)
    c.drawString(M, 8.5 * mm, "Material educativo - não substitui avaliação individual")
    c.drawRightString(W - M, 8.5 * mm, f"{page_no:02d}")


def title(c, kicker, heading, subtitle=None, page_no=1):
    page_bg(c, page_no, kicker)
    y = H - 22 * mm
    c.setFillColor(TEAL)
    c.roundRect(M, y - 5 * mm, 31 * mm, 5.8 * mm, 2.8 * mm, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Body-Bold", 7.6)
    c.drawCentredString(M + 15.5 * mm, y - 3.35 * mm, kicker.upper())
    y -= 11 * mm
    y = para(c, heading, M, y, W - 2 * M, 25, 29, NAVY, "Display-Bold")
    if subtitle:
        y -= 3 * mm
        y = para(c, subtitle, M, y, W - 2 * M, 10.2, 14.2, MUTED)
    return y - 7 * mm


def callout(c, text, x, y, w, kind="teal", label=None):
    palette = {
        "teal": (MIST, TEAL, TEAL_DARK),
        "coral": (colors.HexColor("#FFF0ED"), CORAL, colors.HexColor("#9D3F35")),
        "gold": (colors.HexColor("#FFF7E3"), GOLD, colors.HexColor("#77570F")),
        "navy": (colors.HexColor("#EAF0F5"), NAVY, NAVY),
    }
    fill, accent, txt = palette[kind]
    p = Paragraph(text, style(9.2, 12.8, txt))
    _, ph = p.wrap(w - 18 * mm, H)
    lh = 0
    if label:
        lh = 7 * mm
    h = ph + 11 * mm + lh
    box(c, x, y - h, w, h, fill, fill, 9, 0)
    c.setFillColor(accent)
    c.roundRect(x, y - h, 4 * mm, h, 4 * mm, fill=1, stroke=0)
    ty = y - 5.5 * mm
    if label:
        c.setFont("Body-Bold", 8)
        c.setFillColor(accent)
        c.drawString(x + 9 * mm, ty, label.upper())
        ty -= 6 * mm
    p.drawOn(c, x + 9 * mm, ty - ph)
    return y - h


def card(c, x, y, w, title_text, body, accent=TEAL, number=None, h=None, body_size=9):
    tp = Paragraph(title_text, style(11, 13, NAVY, "Body-Bold"))
    tw, th = tp.wrap(w - 16 * mm, H)
    bp = Paragraph(body, style(body_size, body_size * 1.38, INK))
    bw, bh = bp.wrap(w - 16 * mm, H)
    need = th + bh + 16 * mm
    if h is None:
        h = need
    box(c, x, y - h, w, h, WHITE, LINE, 9)
    c.setFillColor(accent)
    c.roundRect(x, y - h, 3.5 * mm, h, 4 * mm, fill=1, stroke=0)
    tx = x + 8 * mm
    if number is not None:
        c.setFillColor(accent)
        c.circle(x + 12 * mm, y - 11 * mm, 5 * mm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Body-Bold", 9)
        c.drawCentredString(x + 12 * mm, y - 13.7 * mm, str(number))
        tx = x + 21 * mm
        twidth = w - 29 * mm
        tp = Paragraph(title_text, style(11, 13, NAVY, "Body-Bold"))
        _, th = tp.wrap(twidth, H)
        tp.drawOn(c, tx, y - 7 * mm - th)
        bp = Paragraph(body, style(body_size, body_size * 1.38, INK))
        _, bh = bp.wrap(w - 16 * mm, H)
        bp.drawOn(c, x + 8 * mm, y - 10 * mm - th - bh)
    else:
        tp.drawOn(c, tx, y - 6 * mm - th)
        bp.drawOn(c, tx, y - 9 * mm - th - bh)
    return y - h


def checkbox(c, x, y, text, width, checked=False, size=9.2):
    c.setStrokeColor(TEAL)
    c.setLineWidth(1)
    c.roundRect(x, y - 3.2 * mm, 3.4 * mm, 3.4 * mm, 1, fill=0, stroke=1)
    if checked:
        c.setStrokeColor(TEAL_DARK)
        c.line(x + 0.7 * mm, y - 1.6 * mm, x + 1.5 * mm, y - 2.5 * mm)
        c.line(x + 1.5 * mm, y - 2.5 * mm, x + 3 * mm, y - 0.6 * mm)
    return para(c, text, x + 6 * mm, y, width - 6 * mm, size, size * 1.35, INK)


def section_divider(c, page_no, number, heading, subtitle, bullets):
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(NAVY_2)
    c.circle(W - 8 * mm, H - 30 * mm, 48 * mm, fill=1, stroke=0)
    c.setFillColor(TEAL)
    c.circle(W - 22 * mm, 18 * mm, 34 * mm, fill=1, stroke=0)
    c.setFillColor(CORAL)
    c.circle(7 * mm, H - 5 * mm, 22 * mm, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Body-Bold", 11)
    c.drawString(M, H - 28 * mm, f"ETAPA {number}")
    c.setFont("Display-Bold", 31)
    lines = heading.split("\n")
    yy = H - 52 * mm
    for line in lines:
        c.drawString(M, yy, line)
        yy -= 13 * mm
    yy -= 3 * mm
    para(c, subtitle, M, yy, W - 2 * M - 10 * mm, 12, 17, colors.HexColor("#D9E6EE"))
    y = 90 * mm
    for i, item in enumerate(bullets, 1):
        c.setFillColor(GOLD)
        c.circle(M + 4 * mm, y + 1.5 * mm, 3.4 * mm, fill=1, stroke=0)
        c.setFillColor(NAVY)
        c.setFont("Body-Bold", 8)
        c.drawCentredString(M + 4 * mm, y - 1.2 * mm, str(i))
        y = para(c, item, M + 12 * mm, y + 4 * mm, W - 2 * M - 15 * mm, 10.5, 14.5, WHITE)
        y -= 6 * mm
    c.setFont("Body", 8)
    c.setFillColor(colors.HexColor("#BFCED8"))
    c.drawRightString(W - M, 12 * mm, f"{page_no:02d}")


def cover(c):
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(0, 0, W, 112 * mm, fill=1, stroke=0)
    c.setFillColor(TEAL)
    c.circle(W - 8 * mm, H - 30 * mm, 52 * mm, fill=1, stroke=0)
    c.setFillColor(CORAL)
    c.circle(W - 10 * mm, 95 * mm, 27 * mm, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.circle(18 * mm, 102 * mm, 9 * mm, fill=1, stroke=0)
    c.setFillColor(TEAL)
    c.roundRect(M, H - 28 * mm, 36 * mm, 7 * mm, 3.5 * mm, fill=1, stroke=0)
    c.setFont("Body-Bold", 8.5)
    c.setFillColor(WHITE)
    c.drawCentredString(M + 18 * mm, H - 25.7 * mm, "EDIÇÃO 2026")
    c.setFillColor(NAVY)
    c.setFont("Body-Bold", 13)
    c.drawString(M, H - 50 * mm, "PROJETO CINTURA")
    c.setFont("Display-Bold", 52)
    c.drawString(M, H - 77 * mm, "BASE 21")
    c.setFillColor(TEAL_DARK)
    c.setFont("Body-Bold", 12)
    c.drawString(M, H - 92 * mm, "MENOS PROMESSA. MAIS MÉTODO.")
    para(
        c,
        "Um plano prático de 21 dias para reduzir gordura corporal, fortalecer o core e construir hábitos que cabem na vida real.",
        M,
        H - 110 * mm,
        122 * mm,
        14,
        20,
        INK,
    )
    y = 91 * mm
    for label in ["Alimentação flexível", "Treinos progressivos", "Checklists imprimíveis"]:
        c.setFillColor(WHITE)
        c.circle(M + 3 * mm, y + 1.5 * mm, 2.2 * mm, fill=1, stroke=0)
        c.setFont("Body-Bold", 10.5)
        c.drawString(M + 10 * mm, y - 1.5 * mm, label)
        y -= 12 * mm
    c.setFillColor(colors.HexColor("#B8CAD7"))
    c.setFont("Body", 8.5)
    c.drawString(M, 18 * mm, "Material educativo para adultos - versão revisada")


def page_intro(c, n):
    y = title(c, "COMECE AQUI", "O que este guia entrega", "Clareza antes de intensidade: um sistema simples para agir por 21 dias.", n)
    w = (W - 2 * M - 8 * mm) / 2
    y1 = card(c, M, y, w, "Você vai aprender", "Como organizar refeições sem cardápio rígido, treinar com progressão e acompanhar sinais que realmente mostram evolução.", TEAL, 1, 42 * mm)
    card(c, M + w + 8 * mm, y, w, "Você não vai encontrar", "Promessas de perda localizada, alimentos que 'derretem' gordura, detox, punição alimentar ou resultado garantido em centímetros.", CORAL, 2, 42 * mm)
    y = y1 - 8 * mm
    callout(c, "A região da cintura muda quando o conjunto muda: ingestão de energia, movimento, treino de força, sono, estresse e aderência. Exercícios de core fortalecem e melhoram a função, mas não controlam sozinhos o local de perda de gordura.", M, y, W - 2 * M, "teal", "A ideia central")
    y -= 40 * mm
    para(c, "Como usar", M, y, W - 2 * M, 16, 19, NAVY, "Display-Bold")
    y -= 9 * mm
    steps = [
        "Faça a avaliação inicial nas páginas 6 e 7.",
        "Escolha o nível de treino que permite técnica segura.",
        "Monte refeições com o método da página 10.",
        "Siga o calendário de 21 dias e registre apenas o essencial.",
        "Ao final, compare tendências, não um único número.",
    ]
    for i, s in enumerate(steps):
        y = checkbox(c, M, y, s, W - 2 * M)
        y -= 4 * mm


def page_safety(c, n):
    y = title(c, "SEGURANÇA", "Antes de começar", "Este guia é geral. Sua saúde e seu contexto vêm antes de qualquer protocolo.", n)
    callout(c, "Procure avaliação profissional antes de mudar alimentação ou iniciar exercícios se você estiver grávida ou no pós-parto, tiver menos de 18 anos, histórico de transtorno alimentar, doença cardiovascular, renal, hepática ou metabólica, usar medicamentos que afetam peso/glicemia/pressão, ou sentir dor, falta de ar incomum, tontura ou desmaio.", M, y, W - 2 * M, "coral", "Importante")
    y -= 55 * mm
    para(c, "Regras de uso responsável", M, y, W - 2 * M, 16, 19, NAVY, "Display-Bold")
    y -= 10 * mm
    rules = [
        ("Sem dieta mínima universal", "Necessidades energéticas variam. Evite cortes agressivos e não use este material para prescrever calorias a terceiros."),
        ("Dor não é progresso", "Interrompa exercícios que provoquem dor aguda, pressão no peito, tontura ou perda de controle do movimento."),
        ("Proteína não é igual para todos", "Pessoas com condições renais ou outras restrições precisam de orientação individual."),
        ("Suplemento não é atalho", "Produtos para emagrecimento têm evidência limitada e podem interagir com medicamentos [6]."),
    ]
    for i, (h, b) in enumerate(rules):
        card(c, M, y, W - 2 * M, h, b, [TEAL, GOLD, CORAL, NAVY][i], i + 1, 31 * mm, 8.7)
        y -= 35 * mm


def page_truth(c, n):
    y = title(c, "FUNDAMENTO", "O que realmente muda a cintura", "Fortalecer uma região e perder gordura são processos relacionados, mas diferentes.", n)
    w = (W - 2 * M - 8 * mm) / 2
    card(c, M, y, w, "Gordura subcutânea", "Fica sob a pele e compõe boa parte do volume visível nos flancos. Sua distribuição depende de genética, sexo, idade e composição corporal.", TEAL, h=45 * mm)
    card(c, M + w + 8 * mm, y, w, "Gordura visceral", "Fica ao redor dos órgãos. Não é a mesma coisa que o 'pneuzinho' visível e possui relação mais forte com risco metabólico.", CORAL, h=45 * mm)
    y -= 55 * mm
    para(c, "O que cada estratégia faz", M, y, W - 2 * M, 16, 19, NAVY, "Display-Bold")
    y -= 10 * mm
    data = [
        ["Estratégia", "Efeito principal", "O que não garante"],
        ["Déficit energético sustentável", "Favorece redução de gordura total", "Escolher a região que emagrece primeiro"],
        ["Treino de força", "Preserva/ganha força e massa magra", "Derreter gordura ao redor do músculo"],
        ["Cardio e passos", "Aumentam gasto e condicionamento", "Compensar qualquer ingestão"],
        ["Exercícios de core", "Fortalecem tronco e estabilidade", "Afinar a cintura isoladamente"],
        ["Sono e rotina", "Apoiam apetite, recuperação e adesão", "Resultado sem alimentação e movimento"],
    ]
    t = Table(data, colWidths=[44 * mm, 61 * mm, 60 * mm], rowHeights=[11 * mm] + [18 * mm] * 5)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Body-Bold"), ("FONTNAME", (0, 1), (-1, -1), "Body"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.2), ("LEADING", (0, 0), (-1, -1), 10.5),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("BACKGROUND", (0, 1), (-1, -1), WHITE), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PALE]),
        ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ]))
    t.wrapOn(c, W, H)
    t.drawOn(c, M, y - 101 * mm)
    callout(c, "A evidência sobre redução localizada por exercícios específicos não é totalmente uniforme. Para o público geral, a orientação mais segura é: treine o corpo todo, fortaleça o core e avalie a redução de gordura como um processo global [7-9].", M, y - 110 * mm, W - 2 * M, "gold", "Leitura honesta")


def page_success(c, n):
    y = title(c, "FUNDAMENTO", "Como definir sucesso", "A balança é um dado. Seu progresso é um conjunto de tendências.", n)
    cards = [
        ("Cintura", "Meça no mesmo ponto, horário e condição, no máximo 1 vez por semana."),
        ("Peso", "Use média de 3 a 7 pesagens, se isso não provocar ansiedade."),
        ("Força", "Registre repetições, carga ou facilidade de execução."),
        ("Energia", "Observe disposição, sono, fome e recuperação."),
    ]
    w = (W - 2 * M - 8 * mm) / 2
    for i, (h, b) in enumerate(cards):
        row, col = divmod(i, 2)
        card(c, M + col * (w + 8 * mm), y - row * 43 * mm, w, h, b, [TEAL, CORAL, GOLD, NAVY][i], i + 1, 36 * mm)
    y -= 94 * mm
    callout(c, "Perdas graduais tendem a ser mais sustentáveis. O CDC usa aproximadamente 0,45 a 0,9 kg por semana como referência geral, mas isso não é uma meta obrigatória e pode não servir para todos [3].", M, y, W - 2 * M, "teal", "Ritmo")
    y -= 40 * mm
    para(c, "Meta de comportamento para 21 dias", M, y, W - 2 * M, 16, 19, NAVY, "Display-Bold")
    y -= 10 * mm
    for s in [
        "Realizar 6 sessões de força no total.",
        "Acumular movimento aeróbico em pelo menos 5 dias por semana.",
        "Montar a maioria das refeições com alimentos in natura ou minimamente processados.",
        "Dormir e acordar em horários consistentes na maioria dos dias.",
    ]:
        y = checkbox(c, M, y, s, W - 2 * M)
        y -= 5 * mm


def page_baseline(c, n):
    y = title(c, "AVALIAÇÃO", "Sua linha de base", "Registre sem julgamento. Você está criando um ponto de comparação.", n)
    labels = [
        "Data", "Peso (opcional)", "Cintura no umbigo", "Quadril", "Horas médias de sono", "Passos ou minutos ativos"
    ]
    w = (W - 2 * M - 8 * mm) / 2
    for i, lab in enumerate(labels):
        row, col = divmod(i, 2)
        x = M + col * (w + 8 * mm)
        yy = y - row * 29 * mm
        c.setFont("Body-Bold", 8.5)
        c.setFillColor(MUTED)
        c.drawString(x, yy, lab.upper())
        c.setStrokeColor(LINE)
        c.line(x, yy - 10 * mm, x + w, yy - 10 * mm)
    y -= 94 * mm
    para(c, "Como medir a cintura", M, y, W - 2 * M, 16, 19, NAVY, "Display-Bold")
    y -= 9 * mm
    steps = [
        "Fique em pé, relaxe o abdômen e respire normalmente.",
        "Posicione a fita horizontalmente, sem comprimir a pele.",
        "Use sempre o mesmo ponto anatômico e registre a condição.",
        "Compare semanas, não manhãs consecutivas: hidratação e digestão variam.",
    ]
    for i, s in enumerate(steps, 1):
        card(c, M, y, W - 2 * M, f"Passo {i}", s, TEAL if i % 2 else NAVY, h=24 * mm, body_size=8.5)
        y -= 27 * mm
    callout(c, "Se medir ou pesar-se piora sua relação com o corpo, acompanhe energia, força, roupas e consistência. O melhor indicador é aquele que informa sem controlar sua vida.", M, y, W - 2 * M, "coral", "Bem-estar")


def page_goal(c, n):
    y = title(c, "AVALIAÇÃO", "Transforme desejo em direção", "Uma meta útil descreve ações sob seu controle.", n)
    prompts = [
        ("Meu motivo", "Quero cuidar da cintura porque..."),
        ("Minha ação mínima", "Mesmo num dia difícil, consigo..."),
        ("Meu obstáculo provável", "A situação que mais me tira do plano é..."),
        ("Minha resposta", "Quando isso acontecer, eu vou..."),
    ]
    for i, (h, q) in enumerate(prompts):
        c.setFont("Body-Bold", 11)
        c.setFillColor([TEAL_DARK, CORAL, NAVY, GOLD][i])
        c.drawString(M, y, h)
        c.setFont("Body-Italic", 9)
        c.setFillColor(MUTED)
        c.drawString(M, y - 6 * mm, q)
        c.setStrokeColor(LINE)
        for k in range(3):
            c.line(M, y - (13 + k * 8) * mm, W - M, y - (13 + k * 8) * mm)
        y -= 40 * mm
    callout(c, "Exemplo: 'Durante 21 dias, farei dois treinos curtos de força por semana e caminharei 20 minutos após o almoço em quatro dias da semana.'", M, y, W - 2 * M, "teal", "Meta bem formulada")


def page_plate(c, n):
    y = title(c, "ALIMENTAÇÃO", "O prato que se adapta", "Use proporções como ponto de partida, não como regra rígida.", n)
    cx, cy, r = W / 2, y - 55 * mm, 48 * mm
    c.setFillColor(WHITE)
    c.setStrokeColor(LINE)
    c.setLineWidth(2)
    c.circle(cx, cy, r, fill=1, stroke=1)
    c.setFillColor(TEAL)
    c.wedge(cx - r, cy - r, cx + r, cy + r, 90, 180, fill=1, stroke=0)
    c.wedge(cx - r, cy - r, cx + r, cy + r, 270, 180, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.wedge(cx - r, cy - r, cx + r, cy + r, 0, 90, fill=1, stroke=0)
    c.setFillColor(CORAL)
    c.wedge(cx - r, cy - r, cx + r, cy + r, 270, 90, fill=1, stroke=0)
    c.setStrokeColor(WHITE)
    c.setLineWidth(3)
    c.line(cx, cy - r, cx, cy + r)
    c.line(cx, cy, cx + r, cy)
    c.setFillColor(WHITE)
    c.setFont("Body-Bold", 10)
    c.drawCentredString(cx - 23 * mm, cy + 1 * mm, "1/2 vegetais")
    c.drawCentredString(cx + 23 * mm, cy + 24 * mm, "1/4 proteína")
    c.drawCentredString(cx + 23 * mm, cy - 25 * mm, "1/4 energia")
    y = cy - r - 11 * mm
    callout(c, "Complete com água e uma pequena porção de gordura culinária ou alimento fonte de gordura. Ajuste volume conforme fome, treino, preferências e orientação profissional.", M, y, W - 2 * M, "navy", "Estrutura visual")
    y -= 42 * mm
    data = [
        ["Grupo", "Exemplos brasileiros"],
        ["Vegetais", "folhas, tomate, cenoura, abóbora, brócolis, quiabo"],
        ["Proteína", "ovos, feijão + cereal, frango, peixe, carne, tofu"],
        ["Energia", "arroz, mandioca, batata, milho, macarrão, aveia"],
        ["Gorduras", "azeite, castanhas, sementes, abacate"],
    ]
    t = Table(data, colWidths=[38 * mm, 127 * mm], rowHeights=[9 * mm] + [12 * mm] * 4)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Body-Bold"), ("FONTNAME", (0, 1), (-1, -1), "Body"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PALE]),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
    ]))
    t.wrapOn(c, W, H)
    t.drawOn(c, M, y - 57 * mm)


def page_build_meals(c, n):
    y = title(c, "ALIMENTAÇÃO", "Monte refeições sem cardápio-prisão", "Escolha uma opção de cada coluna e varie ao longo da semana.", n)
    data = [
        ["Momento", "Proteína / base", "Vegetal ou fruta", "Energia / complemento"],
        ["Café", "ovos; iogurte natural; queijo; leite", "banana; mamão; maçã", "aveia; pão; cuscuz; tapioca"],
        ["Almoço", "feijão + arroz; frango; peixe; carne; tofu", "salada + legume cozido", "arroz; mandioca; batata; farofa pequena"],
        ["Lanche", "iogurte; leite; ovo; homus", "fruta inteira", "aveia; castanhas; pão"],
        ["Jantar", "repita o almoço; omelete; sopa com proteína", "verduras e legumes", "ajuste à fome e ao treino"],
    ]
    t = Table(data, colWidths=[24 * mm, 53 * mm, 46 * mm, 42 * mm], rowHeights=[12 * mm, 28 * mm, 33 * mm, 25 * mm, 28 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Body-Bold"), ("FONTNAME", (0, 1), (0, -1), "Body-Bold"),
        ("FONTNAME", (1, 1), (-1, -1), "Body"), ("FONTSIZE", (0, 0), (-1, -1), 8.2),
        ("LEADING", (0, 0), (-1, -1), 10.5), ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PALE]),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 7),
    ]))
    t.wrapOn(c, W, H)
    t.drawOn(c, M, y - 126 * mm)
    y -= 137 * mm
    callout(c, "O Guia Alimentar para a População Brasileira recomenda fazer de alimentos in natura ou minimamente processados a base da alimentação e evitar ultraprocessados [1]. Isso importa mais do que procurar um alimento 'termogênico'.", M, y, W - 2 * M, "teal", "Prioridade")
    y -= 43 * mm
    para(c, "Três ajustes antes de cortar mais comida", M, y, W - 2 * M, 15, 18, NAVY, "Display-Bold")
    y -= 9 * mm
    for s in ["Reduza calorias líquidas frequentes.", "Inclua uma fonte de proteína e fibra nas refeições principais.", "Planeje o lanche do horário em que você costuma perder o controle."]:
        y = checkbox(c, M, y, s, W - 2 * M)
        y -= 4 * mm


def page_menu(c, n):
    y = title(c, "ALIMENTAÇÃO", "Semana-modelo flexível", "Não é prescrição: troque alimentos equivalentes e ajuste quantidades ao seu contexto.", n)
    data = [
        ["Dia", "Café da manhã", "Almoço", "Lanche", "Jantar"],
        ["Seg", "Ovos + fruta + pão", "Arroz, feijão, frango e salada", "Iogurte + aveia", "Sopa de legumes com carne"],
        ["Ter", "Cuscuz + queijo + mamão", "Peixe, batata e legumes", "Fruta + castanhas", "Omelete + salada + mandioca"],
        ["Qua", "Iogurte + banana + aveia", "Arroz, feijão, carne e couve", "Pão + ovo", "Repita o almoço em menor/igual porção"],
        ["Qui", "Tapioca + ovos + fruta", "Frango, abóbora, arroz e salada", "Iogurte + fruta", "Sanduíche caseiro + salada"],
        ["Sex", "Pão + queijo + fruta", "Peixe, feijão, arroz e legumes", "Milho ou fruta", "Omelete + legumes"],
        ["Sáb", "Escolha habitual com atenção", "Prato feito pelo método visual", "Conforme fome", "Refeição social planejada"],
        ["Dom", "Cuscuz + ovos + café", "Comida de família com vegetais", "Fruta", "Sopa ou sobras organizadas"],
    ]
    t = Table(data, colWidths=[12 * mm, 38 * mm, 52 * mm, 31 * mm, 40 * mm], rowHeights=[11 * mm] + [23 * mm] * 7)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Body-Bold"), ("FONTNAME", (0, 1), (0, -1), "Body-Bold"),
        ("FONTNAME", (1, 1), (-1, -1), "Body"), ("FONTSIZE", (0, 0), (-1, -1), 7.35),
        ("LEADING", (0, 0), (-1, -1), 9.5), ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PALE]),
        ("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
    ]))
    t.wrapOn(c, W, H)
    t.drawOn(c, M - 4 * mm, y - 172 * mm)
    y -= 182 * mm
    callout(c, "Se houver fome persistente, queda de rendimento, irritabilidade, episódios de compulsão ou obsessão com comida, não aperte o plano. Reavalie a estratégia com um profissional.", M, y, W - 2 * M, "coral", "Sinal de ajuste")


def page_shopping(c, n):
    y = title(c, "ALIMENTAÇÃO", "Compras e preparo em 60 minutos", "Organização reduz decisões impulsivas sem exigir marmitas perfeitas.", n)
    cols = [
        ("Proteínas", ["ovos", "feijão/lentilha", "frango", "peixe", "iogurte natural"]),
        ("Vegetais", ["folhas", "tomate", "cenoura", "abóbora", "legume congelado"]),
        ("Energia", ["arroz", "aveia", "pão", "batata/mandioca", "cuscuz"]),
        ("Práticos", ["frutas", "castanhas", "atum/sardinha", "milho", "temperos"]),
    ]
    w = (W - 2 * M - 12 * mm) / 4
    for i, (h, items) in enumerate(cols):
        x = M + i * (w + 4 * mm)
        box(c, x, y - 83 * mm, w, 83 * mm, WHITE, LINE, 8)
        c.setFillColor([TEAL, CORAL, GOLD, NAVY][i])
        c.roundRect(x, y - 14 * mm, w, 14 * mm, 8, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Body-Bold", 9)
        c.drawCentredString(x + w / 2, y - 9 * mm, h)
        yy = y - 23 * mm
        for item in items:
            yy = checkbox(c, x + 5 * mm, yy, item, w - 10 * mm, size=8.2)
            yy -= 5 * mm
    y -= 96 * mm
    para(c, "Roteiro de preparo", M, y, W - 2 * M, 16, 19, NAVY, "Display-Bold")
    y -= 10 * mm
    prep = [
        ("0-15 min", "Coloque grãos ou tubérculos para cozinhar. Higienize vegetais."),
        ("15-35 min", "Prepare uma proteína principal e ovos cozidos ou outra opção rápida."),
        ("35-50 min", "Corte frutas/vegetais e distribua bases em recipientes."),
        ("50-60 min", "Organize lanches visíveis e deixe opções ultraprocessadas fora do alcance imediato."),
    ]
    for i, (h, b) in enumerate(prep):
        card(c, M, y, W - 2 * M, h, b, [TEAL, CORAL, GOLD, NAVY][i], h=25 * mm, body_size=8.4)
        y -= 28 * mm


def page_hunger(c, n):
    y = title(c, "ALIMENTAÇÃO", "Fome, saciedade e ambiente", "Consistência fica mais fácil quando o ambiente trabalha a seu favor.", n)
    para(c, "Escala rápida antes de comer", M, y, W - 2 * M, 16, 19, NAVY, "Display-Bold")
    y -= 13 * mm
    x0, x1 = M + 7 * mm, W - M - 7 * mm
    c.setStrokeColor(LINE)
    c.setLineWidth(5)
    c.line(x0, y, x1, y)
    for i in range(1, 6):
        x = x0 + (i - 1) * (x1 - x0) / 4
        c.setFillColor([CORAL, GOLD, TEAL, GOLD, CORAL][i - 1])
        c.circle(x, y, 5.5 * mm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Body-Bold", 10)
        c.drawCentredString(x, y - 3 * mm, str(i))
    labels = ["muita fome", "fome clara", "neutro", "satisfeito", "desconfortável"]
    for i, lab in enumerate(labels):
        x = x0 + i * (x1 - x0) / 4
        c.setFillColor(MUTED)
        c.setFont("Body", 7.5)
        c.drawCentredString(x, y - 10 * mm, lab)
    y -= 26 * mm
    callout(c, "A escala não serve para proibir comida. Ela ajuda a distinguir fome física, vontade, hábito e contexto social. Todas podem existir; a diferença é escolher conscientemente.", M, y, W - 2 * M, "teal", "Sem moralizar")
    y -= 43 * mm
    para(c, "Arquitetura do ambiente", M, y, W - 2 * M, 16, 19, NAVY, "Display-Bold")
    y -= 10 * mm
    actions = [
        ("Torne fácil", "Água à vista; frutas lavadas; proteína pronta; tênis acessível."),
        ("Crie atrito", "Porções individuais; aplicativos fora da tela inicial; não comer direto da embalagem."),
        ("Planeje o social", "Escolha o que quer aproveitar, coma devagar e retome a rotina na refeição seguinte."),
        ("Evite compensar", "Uma refeição diferente não exige jejum punitivo nem treino extra."),
    ]
    for i, (h, b) in enumerate(actions):
        card(c, M, y, W - 2 * M, h, b, [TEAL, NAVY, GOLD, CORAL][i], i + 1, 29 * mm, 8.7)
        y -= 32 * mm


def page_training_principles(c, n):
    y = title(c, "MOVIMENTO", "Treino que evolui com você", "Duas sessões bem executadas vencem cinco sessões abandonadas.", n)
    principles = [
        ("Frequência", "Comece com 2 treinos de força por semana, em dias não consecutivos."),
        ("Esforço", "Termine a série sentindo que ainda faria 2 a 4 repetições com boa técnica."),
        ("Progressão", "Aumente primeiro a qualidade; depois repetições, séries, carga ou dificuldade."),
        ("Recuperação", "Repita um grupo muscular quando dor e fadiga estiverem controladas."),
    ]
    w = (W - 2 * M - 8 * mm) / 2
    for i, (h, b) in enumerate(principles):
        row, col = divmod(i, 2)
        card(c, M + col * (w + 8 * mm), y - row * 46 * mm, w, h, b, [TEAL, CORAL, GOLD, NAVY][i], i + 1, 39 * mm)
    y -= 100 * mm
    callout(c, "Para adultos, a OMS recomenda 150 a 300 minutos semanais de atividade aeróbica moderada, ou 75 a 150 minutos vigorosos, além de fortalecimento muscular em 2 ou mais dias. Quem está parado pode começar abaixo disso: algum movimento é melhor do que nenhum [2].", M, y, W - 2 * M, "navy", "Referência, não cobrança")
    y -= 49 * mm
    para(c, "Sinais técnicos", M, y, W - 2 * M, 16, 19, NAVY, "Display-Bold")
    y -= 10 * mm
    for s in ["Consigo respirar sem prender o ar o tempo todo.", "A última repetição se parece com a primeira.", "Sinto esforço muscular, não dor articular aguda.", "Consigo repetir o treino sem ficar incapacitado por vários dias."]:
        y = checkbox(c, M, y, s, W - 2 * M)
        y -= 5 * mm


def workout_table(c, n, label, heading, subtitle, rows, finisher):
    y = title(c, label, heading, subtitle, n)
    data = [["Exercício", "Opção inicial", "Séries x repetições", "Ponto técnico"]] + rows
    t = Table(data, colWidths=[39 * mm, 42 * mm, 35 * mm, 49 * mm], rowHeights=[11 * mm] + [24 * mm] * len(rows))
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Body-Bold"), ("FONTNAME", (0, 1), (0, -1), "Body-Bold"),
        ("FONTNAME", (1, 1), (-1, -1), "Body"), ("FONTSIZE", (0, 0), (-1, -1), 7.9),
        ("LEADING", (0, 0), (-1, -1), 10.2), ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PALE]),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 7),
    ]))
    th = 11 * mm + 24 * mm * len(rows)
    t.wrapOn(c, W, H)
    t.drawOn(c, M, y - th)
    y -= th + 10 * mm
    callout(c, finisher, M, y, W - 2 * M, "teal", "Finalização opcional")
    y -= 42 * mm
    para(c, "Progressão", M, y, W - 2 * M, 15, 18, NAVY, "Display-Bold")
    y -= 9 * mm
    for s in [
        "Semana 1: aprenda a técnica e pare com folga.",
        "Semana 2: acrescente 1 a 2 repetições por série.",
        "Semana 3: acrescente uma série em 1 ou 2 exercícios, se recuperado.",
    ]:
        y = checkbox(c, M, y, s, W - 2 * M)
        y -= 5 * mm


def page_core(c, n):
    y = title(c, "MOVIMENTO", "Core: estabilidade antes de velocidade", "Faça após o treino ou em um dia separado. Duração: 8 a 12 minutos.", n)
    exercises = [
        ("Dead bug", "2 x 6-10 por lado", "Lombar confortável; mova devagar."),
        ("Prancha lateral", "2 x 15-30 s por lado", "Quadril alinhado; opção com joelhos apoiados."),
        ("Bird dog", "2 x 6-10 por lado", "Evite girar o quadril."),
        ("Pallof press com elástico", "2 x 8-12 por lado", "Resista à rotação; costelas baixas."),
        ("Ponte de glúteos", "2 x 10-15", "Suba sem hiperestender a lombar."),
    ]
    for i, (h, dose, cue) in enumerate(exercises):
        body = f"<b>Dose:</b> {dose}<br/><b>Técnica:</b> {cue}"
        card(c, M, y, W - 2 * M, h, body, [TEAL, CORAL, GOLD, NAVY, TEAL][i], i + 1, 31 * mm, 8.7)
        y -= 35 * mm
    callout(c, "Abdominais e rotações não precisam ser feitos em centenas de repetições. Controle, amplitude tolerável e progressão produzem um estímulo melhor do que pressa.", M, y, W - 2 * M, "gold", "Qualidade")


def page_cardio(c, n):
    y = title(c, "MOVIMENTO", "Cardio e movimento diário", "Escolha a modalidade que você consegue repetir: caminhada, bicicleta, dança, natação ou outra.", n)
    zones = [
        ("Leve", "Conversa normal", "Recuperação e início", TEAL),
        ("Moderado", "Frases completas, com esforço", "Base principal", GOLD),
        ("Vigoroso", "Poucas palavras", "Opcional e progressivo", CORAL),
    ]
    w = (W - 2 * M - 10 * mm) / 3
    for i, (h, talk, use, col) in enumerate(zones):
        x = M + i * (w + 5 * mm)
        box(c, x, y - 54 * mm, w, 54 * mm, WHITE, LINE, 9)
        c.setFillColor(col)
        c.circle(x + w / 2, y - 13 * mm, 7 * mm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Body-Bold", 9)
        c.drawCentredString(x + w / 2, y - 16 * mm, str(i + 1))
        para(c, h, x + 5 * mm, y - 25 * mm, w - 10 * mm, 11, 13, NAVY, "Body-Bold", TA_CENTER)
        para(c, f"{talk}<br/><b>Uso:</b> {use}", x + 5 * mm, y - 34 * mm, w - 10 * mm, 8.1, 10.5, INK, "Body", TA_CENTER)
    y -= 66 * mm
    para(c, "Plano de progressão", M, y, W - 2 * M, 16, 19, NAVY, "Display-Bold")
    y -= 10 * mm
    data = [
        ["Semana", "Sessões", "Duração", "Intensidade"],
        ["1", "4 a 5", "15-25 min", "Leve a moderada"],
        ["2", "4 a 5", "20-30 min", "Maioria moderada"],
        ["3", "5", "25-35 min", "Moderada; 1 sessão com blocos mais rápidos se apto"],
    ]
    t = Table(data, colWidths=[26 * mm, 35 * mm, 48 * mm, 56 * mm], rowHeights=[11 * mm] + [18 * mm] * 3)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Body-Bold"), ("FONTNAME", (0, 1), (-1, -1), "Body"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5), ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PALE]), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
    ]))
    t.wrapOn(c, W, H)
    t.drawOn(c, M, y - 65 * mm)
    y -= 76 * mm
    callout(c, "Atalhos úteis: caminhe 5-10 minutos após refeições, use escadas quando viável, faça ligações em pé e interrompa longos períodos sentado. Movimento cotidiano também conta.", M, y, W - 2 * M, "teal", "Mais movimento")


def page_recovery(c, n):
    y = title(c, "RECUPERAÇÃO", "Sono e estresse sem misticismo", "Eles não anulam as leis da energia, mas influenciam fome, decisões, desempenho e recuperação.", n)
    w = (W - 2 * M - 8 * mm) / 2
    card(c, M, y, w, "Rotina de sono", "Mantenha horário aproximado; reduza luz e estímulo antes de dormir; evite cafeína tarde se ela prejudica seu sono; deixe o quarto escuro e confortável.", TEAL, h=58 * mm)
    card(c, M + w + 8 * mm, y, w, "Regulação do estresse", "Faça pausas curtas, respiração lenta, caminhada, escrita ou conversa. O objetivo não é 'baixar cortisol para queimar gordura', e sim recuperar capacidade de escolha.", CORAL, h=58 * mm)
    y -= 69 * mm
    para(c, "Rotina de 10 minutos", M, y, W - 2 * M, 16, 19, NAVY, "Display-Bold")
    y -= 10 * mm
    routine = [
        ("2 min", "Anote o que precisa ficar para amanhã."),
        ("3 min", "Alongue suavemente ou caminhe dentro de casa."),
        ("3 min", "Respire com expiração um pouco mais longa que a inspiração."),
        ("2 min", "Prepare água, roupa e a primeira refeição do dia seguinte."),
    ]
    for i, (h, b) in enumerate(routine):
        card(c, M, y, W - 2 * M, h, b, [TEAL, NAVY, GOLD, CORAL][i], h=25 * mm, body_size=8.6)
        y -= 28 * mm
    callout(c, "Se ansiedade, humor deprimido, compulsão alimentar ou insônia forem persistentes, procure cuidado profissional. Um plano corporal não deve substituir atenção à saúde mental.", M, y, W - 2 * M, "coral", "Peça ajuda")


def plan_week(c, n, week, focus, days, accent):
    y = title(c, "PLANO DE 21 DIAS", f"Semana {week}: {focus}", "Marque o que fez. Adaptação conta; perfeição não.", n)
    for idx, day in enumerate(days, 1):
        h = 23 * mm
        box(c, M, y - h, W - 2 * M, h, WHITE, LINE, 8)
        c.setFillColor(accent)
        c.roundRect(M, y - h, 18 * mm, h, 8, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Body-Bold", 9)
        c.drawCentredString(M + 9 * mm, y - 11 * mm, f"DIA {idx + (week - 1) * 7}")
        py = y - 5 * mm
        for item in day:
            py = checkbox(c, M + 23 * mm, py, item, W - 2 * M - 28 * mm, size=8.25)
            py -= 1.5 * mm
        y -= h + 3 * mm
    callout(c, "Se perder um dia, não reinicie. Continue no próximo espaço disponível e preserve a ordem dos treinos de força.", M, y, W - 2 * M, "gold", "Regra de continuidade")


def page_plateau(c, n):
    y = title(c, "AJUSTES", "Quando o progresso parece parar", "Um platô não se diagnostica com dois dias de balança.", n)
    steps = [
        ("1. Confirme a tendência", "Observe 2 a 4 semanas, cintura e média de peso. Retenção de líquido pode esconder mudanças."),
        ("2. Revise aderência", "Refeições líquidas, beliscos, fins de semana e porções podem ter mudado sem perceber."),
        ("3. Proteja o básico", "Sono, proteína adequada, vegetais, treino de força e movimento diário vêm antes de táticas avançadas."),
        ("4. Ajuste uma variável", "Acrescente caminhada ou reduza discretamente porções energéticas. Não mude tudo de uma vez."),
        ("5. Reavalie", "Dê 10 a 14 dias ao ajuste. Se houver sintomas, dificuldade persistente ou condição clínica, procure um profissional."),
    ]
    for i, (h, b) in enumerate(steps):
        card(c, M, y, W - 2 * M, h, b, [TEAL, NAVY, GOLD, CORAL, TEAL][i], h=33 * mm, body_size=8.5)
        if i < len(steps) - 1:
            c.setStrokeColor(LINE)
            c.setLineWidth(1.5)
            c.line(W / 2, y - 33 * mm, W / 2, y - 37 * mm)
        y -= 37 * mm
    callout(c, "Não use como 'solução de platô': jejum punitivo, laxantes, desidratação, dobrar o cardio de uma vez ou cortar grupos alimentares inteiros.", M, y, W - 2 * M, "coral", "Evite")


def page_social(c, n):
    y = title(c, "VIDA REAL", "Restaurante, viagem e fim de semana", "Flexibilidade planejada mantém o processo vivo.", n)
    situations = [
        ("Restaurante", "Comece escolhendo proteína e vegetais. Adicione o acompanhamento que realmente quer. Coma devagar e pare confortável."),
        ("Festa", "Não chegue com fome extrema. Escolha conscientemente o que vale a pena e não transforme uma ocasião em um fim de semana inteiro."),
        ("Viagem", "Leve lanches simples, caminhe quando possível e preserve uma âncora: café da manhã, treino curto ou horário de sono."),
        ("Dia corrido", "Use uma refeição de emergência: arroz e feijão congelados + ovos; sanduíche com proteína + fruta; iogurte + aveia + fruta."),
    ]
    for i, (h, b) in enumerate(situations):
        card(c, M, y, W - 2 * M, h, b, [TEAL, CORAL, GOLD, NAVY][i], i + 1, 36 * mm, 8.8)
        y -= 41 * mm
    y -= 3 * mm
    para(c, "Plano de retorno", M, y, W - 2 * M, 16, 19, NAVY, "Display-Bold")
    y -= 10 * mm
    for s in ["Próxima refeição normal, sem compensação.", "Água conforme sede e rotina.", "Movimento leve se fizer bem.", "Retome o calendário no ponto em que parou."]:
        y = checkbox(c, M, y, s, W - 2 * M)
        y -= 5 * mm


def page_supplements(c, n):
    y = title(c, "DECISÕES", "Suplementos: o filtro antes da compra", "Nenhum suplemento corrige um plano que você não consegue sustentar.", n)
    questions = [
        "Existe necessidade real ou deficiência identificada?",
        "A alegação é permitida e apoiada por evidência relevante?",
        "Há risco de interação com medicamentos ou condições de saúde?",
        "O produto é regularizado e a composição é transparente?",
        "O mesmo dinheiro teria mais impacto em comida, sono, academia ou acompanhamento?",
    ]
    for i, q in enumerate(questions):
        card(c, M, y, W - 2 * M, f"Pergunta {i + 1}", q, [TEAL, NAVY, GOLD, CORAL, TEAL][i], h=26 * mm, body_size=8.6)
        y -= 30 * mm
    callout(c, "O NIH informa que a evidência para suplementos de emagrecimento é, em geral, limitada ou pouco convincente; alguns podem interagir com medicamentos e causar danos [6]. A Anvisa também alerta contra publicidade que promete emagrecimento com suplementos [5].", M, y, W - 2 * M, "coral", "Resumo")
    y -= 48 * mm
    para(c, "O que pode ter função específica", M, y, W - 2 * M, 15, 18, NAVY, "Display-Bold")
    y -= 9 * mm
    para(c, "Proteína em pó pode ser apenas uma conveniência alimentar; creatina pode apoiar desempenho de força em contextos apropriados; cafeína pode alterar percepção de esforço. Nenhum deles escolhe onde a gordura será perdida. Use orientação profissional quando houver dúvida.", M, y, W - 2 * M, 9.2, 13, INK)


def page_tracker(c, n):
    y = title(c, "IMPRIMÍVEL", "Rastreador semanal", "Use um símbolo simples: feito, adaptado ou não feito.", n)
    data = [["Hábito", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]]
    habits = ["Prato estruturado", "Vegetais/frutas", "Movimento", "Treino", "Pausa de tela", "Rotina de sono"]
    for h in habits:
        data.append([h] + ["□"] * 7)
    t = Table(data, colWidths=[49 * mm] + [16.5 * mm] * 7, rowHeights=[12 * mm] + [19 * mm] * len(habits))
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Body-Bold"), ("FONTNAME", (0, 1), (0, -1), "Body-Bold"),
        ("FONTNAME", (1, 1), (-1, -1), "Body"), ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.6, LINE), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PALE]),
    ]))
    t.wrapOn(c, W, H)
    t.drawOn(c, M, y - 126 * mm)
    y -= 139 * mm
    para(c, "Revisão de 5 minutos", M, y, W - 2 * M, 16, 19, NAVY, "Display-Bold")
    y -= 10 * mm
    prompts = ["O que funcionou?", "O que dificultou?", "Qual ajuste mínimo farei?", "Do que me orgulho?"]
    w = (W - 2 * M - 8 * mm) / 2
    for i, p in enumerate(prompts):
        row, col = divmod(i, 2)
        x = M + col * (w + 8 * mm)
        yy = y - row * 40 * mm
        c.setFont("Body-Bold", 9)
        c.setFillColor([TEAL, CORAL, NAVY, GOLD][i])
        c.drawString(x, yy, p)
        c.setStrokeColor(LINE)
        c.line(x, yy - 9 * mm, x + w, yy - 9 * mm)
        c.line(x, yy - 18 * mm, x + w, yy - 18 * mm)


def page_measurements(c, n):
    y = title(c, "IMPRIMÍVEL", "Registro de evolução", "Compare o início com o dia 21 usando as mesmas condições.", n)
    data = [
        ["Indicador", "Início", "Dia 7", "Dia 14", "Dia 21", "Observação"],
        ["Cintura", "", "", "", "", ""],
        ["Peso (opcional)", "", "", "", "", ""],
        ["Treinos feitos", "", "", "", "", ""],
        ["Minutos ativos", "", "", "", "", ""],
        ["Sono (1-5)", "", "", "", "", ""],
        ["Energia (1-5)", "", "", "", "", ""],
    ]
    t = Table(data, colWidths=[36 * mm, 23 * mm, 23 * mm, 23 * mm, 23 * mm, 37 * mm], rowHeights=[12 * mm] + [20 * mm] * 6)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Body-Bold"), ("FONTNAME", (0, 1), (0, -1), "Body-Bold"),
        ("FONTNAME", (1, 1), (-1, -1), "Body"), ("FONTSIZE", (0, 0), (-1, -1), 8.3),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.6, LINE), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PALE]),
    ]))
    t.wrapOn(c, W, H)
    t.drawOn(c, M, y - 132 * mm)
    y -= 145 * mm
    para(c, "Minha decisão para os próximos 21 dias", M, y, W - 2 * M, 16, 19, NAVY, "Display-Bold")
    y -= 10 * mm
    for prompt in ["Vou manter...", "Vou simplificar...", "Vou pedir ajuda para...", "Minha próxima revisão será em..."]:
        c.setFont("Body-Bold", 9)
        c.setFillColor(MUTED)
        c.drawString(M, y, prompt)
        c.setStrokeColor(LINE)
        c.line(M, y - 7 * mm, W - M, y - 7 * mm)
        y -= 18 * mm


def page_references(c, n):
    y = title(c, "REFERÊNCIAS", "Fontes e limites", "Links consultados em julho de 2026. Este material resume recomendações gerais.", n)
    refs = [
        ("1", "Ministério da Saúde. Guia Alimentar para a População Brasileira, 2ª ed.", "https://www.gov.br/saude/pt-br/assuntos/saude-brasil/publicacoes-para-promocao-a-saude/guia_alimentar_populacao_brasileira_2ed.pdf"),
        ("2", "Organização Mundial da Saúde. Diretrizes sobre atividade física e comportamento sedentário.", "https://www.who.int/publications/i/item/9789240014886"),
        ("3", "CDC. Steps for Losing Weight.", "https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html"),
        ("4", "NIDDK. Eating & Physical Activity to Lose or Maintain Weight.", "https://www.niddk.nih.gov/health-information/weight-management/adult-overweight-obesity/eating-physical-activity"),
        ("5", "Anvisa. Cuidado com a propaganda enganosa de suplementos.", "https://www.gov.br/anvisa/pt-br/assuntos/alimentos/suplementos-alimentares/cuidado-com-a-propaganda-enganosa"),
        ("6", "NIH Office of Dietary Supplements. Dietary Supplements for Weight Loss.", "https://ods.od.nih.gov/factsheets/WeightLoss-Consumer/"),
        ("7", "Kordi et al. Abdominal resistance exercise and subcutaneous fat. Randomized trial.", "https://pubmed.ncbi.nlm.nih.gov/25766455/"),
        ("8", "Kostek et al. Subcutaneous fat changes after upper-body resistance training.", "https://pubmed.ncbi.nlm.nih.gov/17596787/"),
        ("9", "Krogsæter et al. Abdominal aerobic endurance exercise and regional fat. RCT.", "https://pmc.ncbi.nlm.nih.gov/articles/PMC10680576/"),
        ("10", "Jäger et al. ISSN position stand: protein and exercise.", "https://pubmed.ncbi.nlm.nih.gov/28642676/"),
    ]
    for num, name, url in refs:
        c.setFillColor(TEAL)
        c.circle(M + 4 * mm, y - 1 * mm, 3.8 * mm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Body-Bold", 7.5)
        c.drawCentredString(M + 4 * mm, y - 3.4 * mm, num)
        y = para(c, f"<b>{name}</b><br/><font color='#5E6D78'>{url}</font>", M + 12 * mm, y + 4 * mm, W - 2 * M - 12 * mm, 7.6, 10.2, INK)
        c.linkURL(url, (M + 12 * mm, y, W - M, y + 12 * mm), relative=0)
        y -= 5 * mm
    callout(c, "Ciência muda e respostas individuais variam. O guia foi propositalmente construído para não prometer perda localizada, não prescrever ingestão calórica individual e não apresentar suplementos como solução.", M, y, W - 2 * M, "navy", "Escopo")


def page_final(c, n):
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(TEAL)
    c.circle(W - 10 * mm, H - 25 * mm, 48 * mm, fill=1, stroke=0)
    c.setFillColor(CORAL)
    c.circle(2 * mm, 25 * mm, 32 * mm, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.circle(W - 22 * mm, 35 * mm, 11 * mm, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Display-Bold", 34)
    c.drawString(M, H - 60 * mm, "O plano termina.")
    c.drawString(M, H - 76 * mm, "A base permanece.")
    para(c, "Em 21 dias, o objetivo não é chegar a um corpo final. É provar que você consegue construir um sistema simples, observar respostas e continuar com mais clareza.", M, H - 100 * mm, 150 * mm, 13, 19, colors.HexColor("#DCE8EF"))
    y = H - 145 * mm
    for item in ["Comida de verdade na maior parte do tempo", "Força com progressão", "Movimento que cabe na rotina", "Recuperação sem culpa", "Ajustes baseados em tendências"]:
        c.setFillColor(TEAL)
        c.circle(M + 3 * mm, y + 1.5 * mm, 2.4 * mm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Body-Bold", 10.5)
        c.drawString(M + 10 * mm, y - 1.5 * mm, item)
        y -= 12 * mm
    c.setFillColor(colors.HexColor("#BFCED8"))
    c.setFont("Body", 8)
    c.drawRightString(W - M, 12 * mm, f"{n:02d}")


def build():
    c = canvas.Canvas(str(OUT), pagesize=A4)
    c.setTitle("Projeto Cintura BASE 21")
    c.setAuthor("Material educativo - edição revisada")
    pages = []

    pages.append(lambda c, n: cover(c))
    pages.append(page_intro)
    pages.append(page_safety)
    pages.append(page_truth)
    pages.append(page_success)
    pages.append(page_baseline)
    pages.append(page_goal)
    pages.append(lambda c, n: section_divider(c, n, 1, "ALIMENTAÇÃO\nQUE SUSTENTA", "Estrutura, flexibilidade e decisões práticas para comer melhor sem cardápio rígido.", ["Monte refeições completas", "Organize o ambiente", "Evite atalhos frágeis"]))
    pages.append(page_plate)
    pages.append(page_build_meals)
    pages.append(page_menu)
    pages.append(page_shopping)
    pages.append(page_hunger)
    pages.append(lambda c, n: section_divider(c, n, 2, "MOVIMENTO\nQUE PROGRIDE", "Força, cardio e core em doses que você consegue repetir e evoluir.", ["Comece abaixo do máximo", "Treine o corpo todo", "Progrida com técnica"]))
    pages.append(page_training_principles)
    rows_a = [
        ["Agachamento", "Sentar e levantar", "2-3 x 8-12", "Joelhos acompanham os pés"],
        ["Empurrar", "Flexão na parede", "2-3 x 6-12", "Corpo alinhado"],
        ["Remada", "Elástico ou mochila", "2-3 x 8-12", "Puxe cotovelos sem elevar ombros"],
        ["Ponte", "Ponte no chão", "2-3 x 10-15", "Contraia glúteos, não a lombar"],
        ["Dead bug", "Braços/pernas alternados", "2 x 6-10/lado", "Respire e controle"],
    ]
    pages.append(lambda c, n: workout_table(c, n, "TREINO A", "Força de corpo inteiro", "Aquecimento: 5 minutos de caminhada e movimentos leves.", rows_a, "Caminhe 5 a 10 minutos em ritmo confortável. Pule a finalização se estiver começando ou cansado."))
    rows_b = [
        ["Afundo assistido", "Apoio numa cadeira", "2-3 x 6-10/lado", "Passo estável e amplitude confortável"],
        ["Elevação de quadril", "Ponte unilateral assistida", "2-3 x 6-10/lado", "Quadril nivelado"],
        ["Desenvolvimento", "Garrafas ou halteres", "2-3 x 8-12", "Sem arquear a lombar"],
        ["Dobradiça", "Mochila junto ao corpo", "2-3 x 8-12", "Quadril para trás, coluna neutra"],
        ["Bird dog", "Braço ou perna isolados", "2 x 6-10/lado", "Evite rodar o tronco"],
    ]
    pages.append(lambda c, n: workout_table(c, n, "TREINO B", "Força e estabilidade", "Faça 48 horas após o Treino A quando possível.", rows_b, "Faça 4 ciclos: 40 segundos de caminhada rápida + 80 segundos leves. Opcional para quem já tolera atividade moderada."))
    pages.append(page_core)
    pages.append(page_cardio)
    pages.append(page_recovery)
    pages.append(lambda c, n: section_divider(c, n, 3, "21 DIAS\nDE PRÁTICA", "Agora o conhecimento vira agenda. Faça, registre, ajuste e continue.", ["Semana 1: organizar", "Semana 2: consolidar", "Semana 3: progredir"]))
    w1 = [
        ["Avaliação inicial", "Caminhada leve 15-20 min", "Montar 1 prato estruturado"],
        ["Treino A", "Separar água e lanche", "Rotina curta de sono"],
        ["Caminhada 20 min", "Vegetais em 2 refeições", "Pausa de respiração"],
        ["Descanso ativo", "Planejar compras", "Sem compensação alimentar"],
        ["Treino B", "Prato estruturado", "Registrar energia"],
        ["Movimento prazeroso", "Refeição social consciente", "Preparar bases"],
        ["Caminhada leve", "Revisão semanal", "Escolher um ajuste"],
    ]
    pages.append(lambda c, n: plan_week(c, n, 1, "organizar", w1, TEAL))
    w2 = [
        ["Caminhada 25 min", "Prato estruturado 2x", "Dormir em horário-alvo"],
        ["Treino A + progressão", "Fruta/vegetal 3x", "Registrar esforço"],
        ["Caminhada moderada", "Comer sem tela 1x", "Pausa de 5 min"],
        ["Descanso ativo", "Organizar lanche", "Revisar fome"],
        ["Treino B + progressão", "Água conforme sede", "Rotina de sono"],
        ["30 min de movimento", "Flexibilidade planejada", "Sem culpa"],
        ["Caminhada leve", "Medida semanal", "Revisão e ajuste"],
    ]
    pages.append(lambda c, n: plan_week(c, n, 2, "consolidar", w2, GOLD))
    w3 = [
        ["Caminhada 30 min", "Prato estruturado", "Planejar semana"],
        ["Treino A + série opcional", "Proteína nas principais", "Registrar força"],
        ["Cardio moderado", "Comer devagar", "Pausa sem tela"],
        ["Descanso ativo", "Rever ambiente", "Sono consistente"],
        ["Treino B + série opcional", "Vegetais variados", "Registrar energia"],
        ["Movimento escolhido", "Refeição social", "Retorno normal"],
        ["Avaliação final", "Caminhada leve", "Plano dos próximos 21 dias"],
    ]
    pages.append(lambda c, n: plan_week(c, n, 3, "progredir", w3, CORAL))
    pages.append(page_plateau)
    pages.append(page_social)
    pages.append(page_supplements)
    pages.append(page_tracker)
    pages.append(page_measurements)
    pages.append(page_references)
    pages.append(page_final)

    for i, fn in enumerate(pages, 1):
        fn(c, i)
        c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
