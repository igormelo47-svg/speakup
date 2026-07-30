from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "guide-v2"
OUT = ROOT / "output" / "pdf" / "Guia-Completo-Gorduras-Laterais-V2-Premium.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

W, H = A4
M = 18 * mm

PLUM = colors.HexColor("#2C1727")
PLUM_2 = colors.HexColor("#4C3143")
ROSE = colors.HexColor("#C87987")
BLUSH = colors.HexColor("#E8C2C8")
SAGE = colors.HexColor("#7E927D")
GOLD = colors.HexColor("#B7924B")
IVORY = colors.HexColor("#F7F1EA")
PAPER = colors.HexColor("#FCFAF7")
PALE_ROSE = colors.HexColor("#F5E7E8")
PALE_SAGE = colors.HexColor("#E9EFE9")
INK = colors.HexColor("#2E292D")
MUTED = colors.HexColor("#6D6269")
LINE = colors.HexColor("#DED4D7")
WHITE = colors.white


def register_fonts():
    fonts = Path(r"C:\Windows\Fonts")
    pdfmetrics.registerFont(TTFont("Sans", str(fonts / "arial.ttf")))
    pdfmetrics.registerFont(TTFont("Sans-Bold", str(fonts / "arialbd.ttf")))
    pdfmetrics.registerFont(TTFont("Sans-Italic", str(fonts / "ariali.ttf")))
    pdfmetrics.registerFont(TTFont("Serif", str(fonts / "georgia.ttf")))
    pdfmetrics.registerFont(TTFont("Serif-Bold", str(fonts / "georgiab.ttf")))
    pdfmetrics.registerFontFamily("Sans", normal="Sans", bold="Sans-Bold", italic="Sans-Italic", boldItalic="Sans-Bold")


register_fonts()


def st(size=9.5, leading=None, color=INK, font="Sans", align=TA_LEFT):
    return ParagraphStyle(
        "s", fontName=font, fontSize=size, leading=leading or size * 1.42,
        textColor=color, alignment=align, spaceAfter=0, spaceBefore=0,
    )


def p(c, text, x, y, width, size=9.5, leading=None, color=INK, font="Sans", align=TA_LEFT):
    flow = Paragraph(text, st(size, leading, color, font, align))
    _, ph = flow.wrap(width, H)
    flow.drawOn(c, x, y - ph)
    return y - ph


def rounded(c, x, y, w, h, fill=PAPER, stroke=LINE, radius=8, sw=0.7):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(sw)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)


def crop_image(c, path, x, y, w, h, anchor_x=0.5, anchor_y=0.5, radius=0):
    img = ImageReader(str(path))
    iw, ih = img.getSize()
    scale = max(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    dx = x - (dw - w) * anchor_x
    dy = y - (dh - h) * anchor_y
    c.saveState()
    clip = c.beginPath()
    if radius:
        clip.roundRect(x, y, w, h, radius)
    else:
        clip.rect(x, y, w, h)
    c.clipPath(clip, stroke=0, fill=0)
    c.drawImage(img, dx, dy, dw, dh, mask="auto")
    c.restoreState()


def overlay(c, x, y, w, h, color=PLUM, alpha=0.56):
    c.saveState()
    c.setFillColor(colors.Color(color.red, color.green, color.blue, alpha=alpha))
    c.rect(x, y, w, h, fill=1, stroke=0)
    c.restoreState()


def base(c, page, section="GUIA COMPLETO"):
    c.setFillColor(IVORY)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(PLUM)
    c.setLineWidth(1.2)
    c.line(M, H - 12 * mm, W - M, H - 12 * mm)
    c.setFont("Sans-Bold", 7.1)
    c.setFillColor(PLUM)
    c.drawString(M, H - 9 * mm, section.upper())
    c.setFont("Sans", 7.1)
    c.setFillColor(MUTED)
    c.drawRightString(W - M, H - 9 * mm, "GORDURAS LATERAIS")
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(M, 13 * mm, W - M, 13 * mm)
    c.setFont("Sans", 7)
    c.setFillColor(MUTED)
    c.drawString(M, 8.5 * mm, "Material educativo - versão editorial revisada")
    c.setFont("Serif-Bold", 8)
    c.setFillColor(PLUM)
    c.drawRightString(W - M, 8.5 * mm, f"{page:02d}")


def page_title(c, page, section, title, dek=None):
    base(c, page, section)
    y = H - 23 * mm
    c.setFont("Sans-Bold", 7.2)
    c.setFillColor(ROSE)
    c.drawString(M, y, section.upper())
    y -= 8 * mm
    y = p(c, title, M, y, W - 2 * M, 24, 28, PLUM, "Serif-Bold")
    if dek:
        y -= 3 * mm
        y = p(c, dek, M, y, W - 2 * M, 10.1, 14.3, MUTED)
    return y - 7 * mm


def bullets(c, items, x, y, width, size=9.3, gap=4 * mm, color=ROSE):
    for item in items:
        c.setFillColor(color)
        c.circle(x + 2 * mm, y - 1.5 * mm, 1.45 * mm, fill=1, stroke=0)
        y = p(c, item, x + 7 * mm, y + 2 * mm, width - 7 * mm, size, size * 1.43, INK)
        y -= gap
    return y


def numbered(c, items, x, y, width, size=9.1, accent=ROSE, box_h=28 * mm):
    for i, (head, body) in enumerate(items, 1):
        rounded(c, x, y - box_h, width, box_h, PAPER, LINE, 8)
        c.setFillColor(accent)
        c.circle(x + 10 * mm, y - 11 * mm, 5.2 * mm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Sans-Bold", 8.5)
        c.drawCentredString(x + 10 * mm, y - 13.5 * mm, str(i))
        p(c, head, x + 20 * mm, y - 6 * mm, width - 27 * mm, 10.2, 12.5, PLUM, "Sans-Bold")
        p(c, body, x + 20 * mm, y - 14 * mm, width - 27 * mm, size, size * 1.35, INK)
        y -= box_h + 5 * mm
    return y


def callout(c, title, text, x, y, width, kind="rose"):
    palette = {
        "rose": (PALE_ROSE, ROSE, PLUM),
        "sage": (PALE_SAGE, SAGE, PLUM_2),
        "gold": (colors.HexColor("#F5EEDC"), GOLD, colors.HexColor("#654F24")),
        "plum": (colors.HexColor("#EEE8EC"), PLUM, PLUM),
    }
    fill, accent, txt = palette[kind]
    bp = Paragraph(text, st(8.8, 12.3, txt))
    _, bh = bp.wrap(width - 20 * mm, H)
    h = bh + 21 * mm
    rounded(c, x, y - h, width, h, fill, fill, 9, 0)
    c.setFillColor(accent)
    c.roundRect(x, y - h, 4 * mm, h, 4 * mm, fill=1, stroke=0)
    c.setFont("Sans-Bold", 7.4)
    c.setFillColor(accent)
    c.drawString(x + 10 * mm, y - 8 * mm, title.upper())
    bp.drawOn(c, x + 10 * mm, y - 14 * mm - bh)
    return y - h


def card_grid(c, cards, x, y, width, cols=2, h=42 * mm):
    gap = 7 * mm
    cw = (width - gap * (cols - 1)) / cols
    for i, (head, body, accent) in enumerate(cards):
        row, col = divmod(i, cols)
        xx = x + col * (cw + gap)
        yy = y - row * (h + gap)
        rounded(c, xx, yy - h, cw, h, PAPER, LINE, 9)
        c.setFillColor(accent)
        c.rect(xx, yy - 4 * mm, cw, 4 * mm, fill=1, stroke=0)
        p(c, head, xx + 7 * mm, yy - 10 * mm, cw - 14 * mm, 11, 13.2, PLUM, "Sans-Bold")
        p(c, body, xx + 7 * mm, yy - 22 * mm, cw - 14 * mm, 8.6, 11.5, INK)
    rows = (len(cards) + cols - 1) // cols
    return y - rows * (h + gap)


def rich_table(c, data, x, y, widths, heights, font=7.8):
    converted = []
    for r, row in enumerate(data):
        converted.append([Paragraph(str(cell), st(font, font * 1.34, WHITE if r == 0 else INK, "Sans-Bold" if r == 0 else "Sans")) for cell in row])
    t = Table(converted, colWidths=widths, rowHeights=heights)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PLUM),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [PAPER, colors.HexColor("#F1ECE8")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    t.wrapOn(c, W, H)
    t.drawOn(c, x, y - sum(heights))
    return y - sum(heights)


def photo_banner(c, path, y, h, anchor_x=0.5, anchor_y=0.5):
    crop_image(c, path, M, y - h, W - 2 * M, h, anchor_x, anchor_y, 9)
    return y - h


def section_page(c, page, number, title, subtitle, image, anchor_x=0.5, anchor_y=0.5):
    crop_image(c, image, 0, 0, W, H, anchor_x, anchor_y)
    overlay(c, 0, 0, W, H, PLUM, 0.54)
    c.setFillColor(GOLD)
    c.setFont("Sans-Bold", 9)
    c.drawString(M, H - 28 * mm, f"CAPÍTULO {number}")
    y = H - 58 * mm
    y = p(c, title, M, y, 145 * mm, 35, 39, WHITE, "Serif-Bold")
    y -= 6 * mm
    p(c, subtitle, M, y, 135 * mm, 12, 17, colors.HexColor("#F1E9E3"))
    c.setFillColor(GOLD)
    c.rect(M, 34 * mm, 34 * mm, 2 * mm, fill=1, stroke=0)
    c.setFont("Sans", 8)
    c.setFillColor(WHITE)
    c.drawString(M, 25 * mm, "GUIA COMPLETO")
    c.drawRightString(W - M, 12 * mm, f"{page:02d}")


def cover(c):
    crop_image(c, ASSETS / "cover.jpg", 0, 0, W, H, 0.62, 0.5)
    overlay(c, 0, 0, W, H, PLUM, 0.34)
    c.saveState()
    grad = colors.Color(0.10, 0.03, 0.08, alpha=0.62)
    c.setFillColor(grad)
    c.rect(0, 0, 116 * mm, H, fill=1, stroke=0)
    c.restoreState()
    c.setFillColor(GOLD)
    c.setFont("Sans-Bold", 8.5)
    c.drawString(M, H - 28 * mm, "EDIÇÃO PREMIUM 2026")
    c.setFillColor(WHITE)
    c.setFont("Serif-Bold", 23)
    c.drawString(M, H - 61 * mm, "GUIA COMPLETO")
    c.setFont("Serif-Bold", 39)
    c.drawString(M, H - 84 * mm, "GORDURAS")
    c.drawString(M, H - 103 * mm, "LATERAIS")
    c.setFillColor(BLUSH)
    c.setFont("Sans-Bold", 9.5)
    c.drawString(M, H - 118 * mm, "CIÊNCIA, ESTRATÉGIA E PRÁTICA")
    p(c, "Entenda o que influencia a cintura e aplique um plano de 21 dias com alimentação flexível, treino e hábitos sustentáveis.", M, H - 136 * mm, 78 * mm, 11.5, 16, WHITE)
    c.setFillColor(GOLD)
    c.rect(M, 31 * mm, 28 * mm, 1.8 * mm, fill=1, stroke=0)
    c.setFont("Sans", 8)
    c.setFillColor(WHITE)
    c.drawString(M, 22 * mm, "Material educativo para adultos")


def intro_page(c, page):
    base(c, page, "ABERTURA")
    crop_image(c, ASSETS / "cover.jpg", W - 79 * mm, 20 * mm, 79 * mm, H - 32 * mm, 0.80, 0.48)
    overlay(c, W - 79 * mm, 20 * mm, 79 * mm, H - 32 * mm, PLUM, 0.12)
    y = H - 31 * mm
    c.setFillColor(GOLD)
    c.setFont("Sans-Bold", 8)
    c.drawString(M, y, "UMA NOTA AO LEITOR")
    y -= 13 * mm
    y = p(c, "Você não precisa declarar guerra ao próprio corpo.", M, y, 99 * mm, 25, 30, PLUM, "Serif-Bold")
    y -= 6 * mm
    body = [
        "As gorduras laterais são uma região de armazenamento comum. Elas não indicam falta de disciplina e não obedecem a um único exercício.",
        "Este guia mantém o olhar estético, mas o coloca dentro de um processo maior: reduzir gordura corporal quando necessário, fortalecer o tronco, melhorar condicionamento e criar uma rotina possível.",
        "Você encontrará explicações, fotografias, tabelas, cardápios, treinos e páginas de acompanhamento. Use tudo como orientação geral e adapte com profissionais quando sua saúde exigir.",
    ]
    for text in body:
        y = p(c, text, M, y, 95 * mm, 10.2, 15.2, INK)
        y -= 6 * mm
    callout(c, "PROMESSA HONESTA", "O plano não escolhe de onde seu corpo perderá gordura. Ele melhora os fatores que você pode controlar e fortalece a região que deseja valorizar.", M, y, 96 * mm, "rose")


def contents_page(c, page):
    y = page_title(c, page, "SUMÁRIO", "Seu mapa de leitura", "Cinco capítulos, um plano de 21 dias e ferramentas para continuar.")
    chapters = [
        ("01", "Entender", "gordura lateral, risco, mitos e fisiologia", "05"),
        ("02", "Avaliar", "medidas, composição e metas", "12"),
        ("03", "Alimentar", "prato, nutrientes, cardápios e compras", "16"),
        ("04", "Treinar", "força, core, cardio e movimento diário", "30"),
        ("05", "Sustentar", "sono, platôs, manutenção e 21 dias", "44"),
    ]
    for num, head, desc, pg in chapters:
        c.setFillColor([ROSE, SAGE, GOLD, PLUM_2, ROSE][int(num) - 1])
        c.circle(M + 10 * mm, y - 8 * mm, 9 * mm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Serif-Bold", 12)
        c.drawCentredString(M + 10 * mm, y - 12 * mm, num)
        p(c, head, M + 27 * mm, y - 1 * mm, 53 * mm, 15, 18, PLUM, "Serif-Bold")
        p(c, desc, M + 27 * mm, y - 11 * mm, 100 * mm, 8.8, 12, MUTED)
        c.setFont("Serif-Bold", 13)
        c.setFillColor(PLUM)
        c.drawRightString(W - M, y - 10 * mm, pg)
        c.setStrokeColor(LINE)
        c.line(M + 27 * mm, y - 25 * mm, W - M, y - 25 * mm)
        y -= 36 * mm
    callout(c, "COMO NAVEGAR", "Leia os capítulos 1 e 2 primeiro. Depois, avance na ordem que mais ajuda sua rotina. O calendário começa na página 48.", M, y, W - 2 * M, "sage")


def safety_page(c, page):
    y = page_title(c, page, "SEGURANÇA", "Antes de qualquer plano", "Informação geral não substitui avaliação clínica, nutricional ou de exercício.")
    callout(c, "PROCURE ORIENTAÇÃO", "Converse com um profissional antes de iniciar se estiver grávida ou no pós-parto; tiver menos de 18 anos; histórico de transtorno alimentar; doença cardiovascular, renal, hepática ou metabólica; lesão; ou usar medicamentos que alteram peso, pressão ou glicemia.", M, y, W - 2 * M, "rose")
    y -= 51 * mm
    items = [
        ("Dor não é progresso", "Interrompa o exercício diante de dor aguda, tontura, desmaio, pressão no peito ou falta de ar incomum."),
        ("Dieta não deve dominar", "Fome extrema, culpa, compulsão e obsessão são sinais para rever a estratégia, não para apertá-la."),
        ("Números têm contexto", "Peso, cintura e calorias são ferramentas. Não definem saúde, caráter ou valor pessoal."),
        ("Individualização importa", "Necessidades de energia, proteína, hidratação e recuperação variam bastante."),
    ]
    numbered(c, items, M, y, W - 2 * M, 8.6, ROSE, 31 * mm)


def article(c, page, section, title, dek, blocks, image=None, image_h=68 * mm, image_anchor=(0.5, 0.5), call=None):
    y = page_title(c, page, section, title, dek)
    if image:
        y = photo_banner(c, image, y, image_h, image_anchor[0], image_anchor[1]) - 8 * mm
    for head, body in blocks:
        y = p(c, head, M, y, W - 2 * M, 13.5, 17, PLUM, "Serif-Bold")
        y -= 2 * mm
        y = p(c, body, M, y, W - 2 * M, 9.3, 13.5, INK)
        y -= 7 * mm
    if call:
        callout(c, call[0], call[1], M, y, W - 2 * M, call[2])


def cards(c, page, section, title, dek, items, footer_call=None, cols=2, h=42 * mm):
    y = page_title(c, page, section, title, dek)
    y = card_grid(c, items, M, y, W - 2 * M, cols, h)
    if footer_call:
        callout(c, footer_call[0], footer_call[1], M, y + 2 * mm, W - 2 * M, footer_call[2])


def fat_types_page(c, page):
    y = page_title(c, page, "ENTENDER", "Subcutânea não é visceral", "Duas gorduras próximas no mapa, mas diferentes em localização e significado.")
    cx1, cx2, cy = M + 43 * mm, W - M - 43 * mm, y - 45 * mm
    for cx, outer, inner, label in [(cx1, BLUSH, IVORY, "SUBCUTÂNEA"), (cx2, SAGE, ROSE, "VISCERAL")]:
        c.setFillColor(outer)
        c.circle(cx, cy, 31 * mm, fill=1, stroke=0)
        c.setFillColor(inner)
        c.circle(cx, cy, 19 * mm, fill=1, stroke=0)
        c.setFillColor(PLUM)
        c.setFont("Sans-Bold", 8)
        c.drawCentredString(cx, cy - 2.5 * mm, label)
    y = cy - 40 * mm
    left = "Fica sob a pele e forma boa parte do volume que conseguimos pinçar. Os flancos visíveis costumam ser predominantemente subcutâneos."
    right = "Fica mais profundamente, ao redor dos órgãos. Tem relação mais consistente com risco cardiometabólico quando em excesso."
    p(c, left, M, y, 78 * mm, 9.2, 13.3, INK, "Sans", TA_CENTER)
    p(c, right, W - M - 78 * mm, y, 78 * mm, 9.2, 13.3, INK, "Sans", TA_CENTER)
    y -= 45 * mm
    callout(c, "POR QUE A DISTINÇÃO IMPORTA", "Aparência externa e risco interno não são sinônimos. A cintura é um indicador útil de tendência, mas diagnóstico exige contexto clínico.", M, y, W - 2 * M, "gold")
    y -= 40 * mm
    bullets(c, [
        "A distribuição de gordura varia com genética, sexo, idade e histórico de peso.",
        "O corpo não perde gordura em uma ordem escolhida conscientemente.",
        "Mudanças de hábitos podem melhorar saúde antes de uma grande mudança visual.",
    ], M, y, W - 2 * M)


def balance_page(c, page):
    y = page_title(c, page, "ENTENDER", "O balanço de energia, sem simplismo", "A perda de gordura exige uma tendência de gasto maior que ingestão, mas comportamento e biologia modulam o caminho.")
    cx, cy = W / 2, y - 45 * mm
    c.setStrokeColor(PLUM)
    c.setLineWidth(3)
    c.line(cx, cy + 25 * mm, cx, cy - 7 * mm)
    c.line(cx - 46 * mm, cy + 15 * mm, cx + 46 * mm, cy + 15 * mm)
    c.setFillColor(GOLD)
    c.circle(cx, cy + 22 * mm, 6 * mm, fill=1, stroke=0)
    for xx, col, lab in [(cx - 46 * mm, ROSE, "INGESTÃO"), (cx + 46 * mm, SAGE, "GASTO")]:
        c.setStrokeColor(PLUM)
        c.setLineWidth(1.4)
        c.line(xx, cy + 15 * mm, xx, cy - 4 * mm)
        c.setFillColor(col)
        c.roundRect(xx - 28 * mm, cy - 21 * mm, 56 * mm, 17 * mm, 7, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Sans-Bold", 9)
        c.drawCentredString(xx, cy - 15 * mm, lab)
    y = cy - 34 * mm
    cards_data = [
        ("Ingestão", "Porções, bebidas, densidade calórica, fome, ambiente e frequência.", ROSE),
        ("Gasto", "Metabolismo, massa corporal, treino, passos, trabalho e adaptação.", SAGE),
        ("Aderência", "O plano precisa ser tolerável por tempo suficiente para formar uma tendência.", GOLD),
        ("Contexto", "Medicamentos, doenças, sono, estresse e acesso a alimentos influenciam decisões.", PLUM_2),
    ]
    y = card_grid(c, cards_data, M, y, W - 2 * M, 2, 39 * mm)
    callout(c, "O QUE EVITAR", "Transformar a equação em culpa. Saber que energia importa não significa que emagrecer seja fácil, linear ou igualmente acessível para todos.", M, y + 2 * mm, W - 2 * M, "rose")


def measurement_page(c, page):
    y = page_title(c, page, "AVALIAR", "Como medir a cintura", "Padronização importa mais do que medir muitas vezes.")
    cx, cy = W / 2, y - 55 * mm
    c.setFillColor(PALE_ROSE)
    c.ellipse(cx - 28 * mm, cy - 46 * mm, cx + 28 * mm, cy + 46 * mm, fill=1, stroke=0)
    c.setFillColor(BLUSH)
    c.circle(cx, cy + 51 * mm, 11 * mm, fill=1, stroke=0)
    c.setStrokeColor(ROSE)
    c.setLineWidth(4)
    c.line(cx - 31 * mm, cy, cx + 31 * mm, cy)
    c.setFillColor(PLUM)
    c.setFont("Sans-Bold", 8)
    c.drawCentredString(cx, cy + 4 * mm, "FITA HORIZONTAL")
    c.setStrokeColor(LINE)
    c.setLineWidth(1)
    c.line(cx - 47 * mm, cy + 32 * mm, cx - 80 * mm, cy + 32 * mm)
    c.line(cx + 47 * mm, cy - 27 * mm, cx + 80 * mm, cy - 27 * mm)
    p(c, "Respiração normal<br/>abdômen relaxado", M, cy + 38 * mm, 48 * mm, 8.5, 11.5, MUTED)
    p(c, "Sem apertar a pele<br/>mesmo ponto sempre", W - M - 48 * mm, cy - 20 * mm, 48 * mm, 8.5, 11.5, MUTED, "Sans", TA_RIGHT)
    y = cy - 59 * mm
    steps = [
        ("Condição", "Mesmo horário aproximado, antes ou depois de comer de forma consistente."),
        ("Frequência", "Uma vez por semana costuma ser suficiente para observar tendência."),
        ("Registro", "Anote ponto anatômico, data e qualquer fator incomum, como ciclo menstrual ou viagem."),
    ]
    numbered(c, steps, M, y, W - 2 * M, 8.5, SAGE, 27 * mm)


def plate_page(c, page):
    y = page_title(c, page, "ALIMENTAR", "O prato brasileiro que funciona", "Um modelo visual, flexível e culturalmente familiar.")
    y = photo_banner(c, ASSETS / "nutrition.jpg", y, 83 * mm, 0.55, 0.5) - 7 * mm
    cards_data = [
        ("Metade", "Verduras e legumes variados, crus ou cozidos.", SAGE),
        ("Um quarto", "Fonte de proteína: feijão, ovos, frango, peixe, carne ou tofu.", ROSE),
        ("Um quarto", "Arroz, mandioca, batata, milho, massa ou outro alimento energético.", GOLD),
        ("Complemente", "Água, temperos e uma pequena fonte de gordura culinária.", PLUM_2),
    ]
    y = card_grid(c, cards_data, M, y, W - 2 * M, 2, 34 * mm)
    callout(c, "AJUSTE, NÃO OBEDIÊNCIA", "Treino, fome, tamanho corporal e objetivo mudam quantidades. O desenho organiza; ele não prescreve gramas.", M, y + 2 * mm, W - 2 * M, "sage")


def portions_page(c, page):
    y = page_title(c, page, "ALIMENTAR", "Porções usando as mãos", "Uma referência prática para começar sem balança de cozinha.")
    data = [
        ("Palma", "proteína", "1 porção nas refeições principais", ROSE),
        ("Punho", "vegetais", "1 a 2 porções", SAGE),
        ("Mão em concha", "carboidrato", "1 porção; ajuste ao treino e à fome", GOLD),
        ("Polegar", "gordura", "1 porção pequena", PLUM_2),
    ]
    for i, (shape, food, note, col) in enumerate(data):
        yy = y - i * 43 * mm
        rounded(c, M, yy - 35 * mm, W - 2 * M, 35 * mm, PAPER, LINE, 9)
        c.setFillColor(col)
        c.circle(M + 16 * mm, yy - 17 * mm, 11 * mm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Sans-Bold", 8)
        c.drawCentredString(M + 16 * mm, yy - 20 * mm, shape.upper())
        p(c, food.capitalize(), M + 35 * mm, yy - 8 * mm, 42 * mm, 12, 15, PLUM, "Serif-Bold")
        p(c, note, M + 79 * mm, yy - 8 * mm, 82 * mm, 9, 12.5, INK)
    y -= len(data) * 43 * mm + 4 * mm
    callout(c, "LIMITAÇÃO DO MÉTODO", "Mãos variam e preparações mistas não cabem perfeitamente nas categorias. Use a referência para montar, observar saciedade e ajustar.", M, y, W - 2 * M, "gold")


def menu_page(c, page, part):
    title = "Semana-modelo: dias 1 a 4" if part == 1 else "Semana-modelo: dias 5 a 7"
    dek = "Sugestões brasileiras, sem quantidade fixa. Troque itens equivalentes e respeite preferências."
    y = page_title(c, page, "ALIMENTAR", title, dek)
    if part == 1:
        data = [
            ["Dia", "Café", "Almoço", "Lanche", "Jantar"],
            ["1", "Ovos, pão e fruta", "Arroz, feijão, frango, salada", "Iogurte e aveia", "Sopa de legumes com carne"],
            ["2", "Cuscuz, queijo e mamão", "Peixe, batata e legumes", "Fruta e castanhas", "Omelete, salada e mandioca"],
            ["3", "Iogurte, banana e aveia", "Arroz, feijão, carne e couve", "Pão e ovo", "Repetir o almoço"],
            ["4", "Tapioca, ovos e fruta", "Frango, abóbora, arroz e salada", "Iogurte e fruta", "Sanduíche caseiro e salada"],
        ]
        heights = [12 * mm] + [32 * mm] * 4
    else:
        data = [
            ["Dia", "Café", "Almoço", "Lanche", "Jantar"],
            ["5", "Pão, queijo e fruta", "Peixe, feijão, arroz e legumes", "Milho ou fruta", "Omelete e legumes"],
            ["6", "Ovos, fruta e cuscuz", "Prato pelo método visual", "Conforme fome", "Refeição social planejada"],
            ["7", "Iogurte, fruta e aveia", "Comida de família com vegetais", "Fruta e castanhas", "Sopa ou sobras organizadas"],
        ]
        heights = [12 * mm] + [36 * mm] * 3
    y = rich_table(c, data, M - 3 * mm, y, [12 * mm, 38 * mm, 52 * mm, 31 * mm, 40 * mm], heights, 7.4)
    y -= 10 * mm
    if part == 1:
        callout(c, "PARA QUEM TREINA", "Carboidratos antes ou depois podem apoiar desempenho e recuperação, mas o horário perfeito é menos importante que o padrão alimentar total.", M, y, W - 2 * M, "sage")
        y -= 44 * mm
        bullets(c, ["Use água como bebida habitual.", "Inclua opções sem carne quando desejar.", "Repita refeições: praticidade também é estratégia."], M, y, W - 2 * M)
    else:
        callout(c, "REFEIÇÃO SOCIAL", "Escolher algo por prazer não 'estraga a dieta'. Planeje, coma com atenção e volte ao padrão normal na próxima refeição.", M, y, W - 2 * M, "rose")
        y -= 44 * mm
        p(c, "Trocas rápidas", M, y, W - 2 * M, 14, 17, PLUM, "Serif-Bold")
        y -= 8 * mm
        bullets(c, ["Peixe por frango, ovos, carne magra ou tofu.", "Arroz por batata, mandioca, milho ou massa.", "Feijão por lentilha, grão-de-bico ou ervilha.", "Iogurte por leite ou alternativa adequada ao seu contexto."], M, y, W - 2 * M)


def prep_page(c, page):
    y = page_title(c, page, "ALIMENTAR", "Preparo inteligente, não perfeito", "Uma hora de organização pode reduzir decisões difíceis durante vários dias.")
    y = photo_banner(c, ASSETS / "meal-prep.jpg", y, 86 * mm, 0.58, 0.52) - 7 * mm
    items = [
        ("0-15 min", "Inicie arroz, feijão, tubérculos ou outra base."),
        ("15-35 min", "Prepare uma proteína e leve legumes ao forno ou panela."),
        ("35-50 min", "Lave folhas, corte frutas e monte lanches simples."),
        ("50-60 min", "Guarde, identifique e deixe as opções mais úteis visíveis."),
    ]
    numbered(c, items, M, y, W - 2 * M, 8.4, GOLD, 28 * mm)


def workout_page(c, page, label, title, rows, note):
    y = page_title(c, page, "TREINAR", title, "Aquecimento: 5 a 8 minutos de movimento leve e ensaio dos exercícios.")
    data = [["Exercício", "Opção inicial", "Dose", "Ponto técnico"]] + rows
    y = rich_table(c, data, M, y, [40 * mm, 42 * mm, 31 * mm, 52 * mm], [12 * mm] + [25 * mm] * len(rows), 7.7)
    y -= 9 * mm
    callout(c, label, note, M, y, W - 2 * M, "sage")
    y -= 45 * mm
    p(c, "Como progredir", M, y, W - 2 * M, 14, 17, PLUM, "Serif-Bold")
    y -= 9 * mm
    bullets(c, ["Primeiro, melhore técnica e controle.", "Depois, acrescente repetições dentro da faixa.", "Quando completar a faixa com folga, aumente carga ou dificuldade.", "Pare com 2 a 4 repetições possíveis em reserva."], M, y, W - 2 * M)


def squat_detail(c, page):
    y = page_title(c, page, "TREINAR", "Agachamento: leitura visual", "Use a fotografia como referência geral; corpos diferentes encontram amplitudes diferentes.")
    y = photo_banner(c, ASSETS / "squat.jpg", y, 105 * mm, 0.48, 0.48) - 8 * mm
    items = [
        ("Pés", "Apoio inteiro no chão e base estável.", SAGE),
        ("Joelhos", "Acompanham a direção dos pés.", ROSE),
        ("Tronco", "Inclinação natural sem perder controle.", GOLD),
        ("Carga", "Próxima ao corpo e compatível com técnica.", PLUM_2),
    ]
    y = card_grid(c, items, M, y, W - 2 * M, 2, 31 * mm)
    callout(c, "REGRESSÃO", "Comece sentando e levantando de uma cadeira. Aumente amplitude antes de adicionar peso.", M, y + 2 * mm, W - 2 * M, "rose")


def side_plank_detail(c, page):
    y = page_title(c, page, "TREINAR", "Prancha lateral: clareza técnica", "A versão com joelho apoiado é exercício completo, não uma versão 'inferior'.")
    y = photo_banner(c, ASSETS / "side-plank.jpg", y, 103 * mm, 0.50, 0.52) - 8 * mm
    items = [
        ("Cotovelo", "Diretamente abaixo do ombro.", ROSE),
        ("Quadril", "Elevado e alinhado ao tronco.", SAGE),
        ("Respiração", "Contínua; não prenda o ar.", GOLD),
        ("Dose", "15-30 segundos por lado, 2-3 séries.", PLUM_2),
    ]
    y = card_grid(c, items, M, y, W - 2 * M, 2, 31 * mm)
    callout(c, "PARE SE", "Houver dor aguda no ombro, cotovelo ou lombar. Reduza o tempo, ajuste o apoio ou escolha outro exercício.", M, y + 2 * mm, W - 2 * M, "rose")


def cardio_page(c, page):
    y = page_title(c, page, "MOVER", "Cardio: três intensidades úteis", "O teste da fala ajuda a regular esforço sem depender de relógio.")
    y = photo_banner(c, ASSETS / "walking.jpg", y, 80 * mm, 0.52, 0.48) - 8 * mm
    items = [
        ("Leve", "Conversa confortável. Bom para começar, recuperar e somar minutos.", SAGE),
        ("Moderado", "Frases completas com esforço. Base principal para muitas pessoas.", GOLD),
        ("Vigoroso", "Poucas palavras. Opcional, progressivo e não necessário para iniciantes.", ROSE),
    ]
    y = card_grid(c, items, M, y, W - 2 * M, 3, 43 * mm)
    callout(c, "REFERÊNCIA SEMANAL", "A OMS recomenda para adultos 150 a 300 minutos moderados ou 75 a 150 vigorosos, além de fortalecimento em 2 ou mais dias. Quem está inativo pode começar com menos [2].", M, y + 2 * mm, W - 2 * M, "sage")


def recovery_page(c, page):
    y = page_title(c, page, "SUSTENTAR", "Recuperação também é estratégia", "Sono e estresse não queimam gordura sozinhos; eles influenciam decisões, fome, desempenho e adesão.")
    y = photo_banner(c, ASSETS / "recovery.jpg", y, 94 * mm, 0.48, 0.50) - 8 * mm
    items = [
        ("Desacelerar", "Crie uma transição de 15 a 30 minutos antes de dormir.", PLUM_2),
        ("Preparar", "Deixe roupa, água e primeira refeição do dia seguinte organizadas.", SAGE),
        ("Reduzir estímulo", "Afaste notificações e luz intensa quando elas atrapalharem.", ROSE),
        ("Regular", "Mantenha horários aproximados na maioria dos dias.", GOLD),
    ]
    card_grid(c, items, M, y, W - 2 * M, 2, 35 * mm)


def week_page(c, page, week, title, color, days):
    y = page_title(c, page, "PLANO DE 21 DIAS", f"Semana {week}: {title}", "Marque o que realizou. Adaptação conta; perfeição não.")
    for idx, tasks in enumerate(days, 1):
        h = 23 * mm
        rounded(c, M, y - h, W - 2 * M, h, PAPER, LINE, 8)
        c.setFillColor(color)
        c.roundRect(M, y - h, 18 * mm, h, 8, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Sans-Bold", 7.7)
        c.drawCentredString(M + 9 * mm, y - 12 * mm, f"DIA {(week - 1) * 7 + idx}")
        yy = y - 5.5 * mm
        for task in tasks:
            c.setStrokeColor(color)
            c.rect(M + 24 * mm, yy - 2.8 * mm, 3 * mm, 3 * mm, fill=0, stroke=1)
            p(c, task, M + 30 * mm, yy + 1.5 * mm, W - 2 * M - 35 * mm, 8.1, 10.5, INK)
            yy -= 5.8 * mm
        y -= 26 * mm
    callout(c, "CONTINUIDADE", "Se perder um dia, não reinicie e não compense. Continue no próximo espaço possível.", M, y, W - 2 * M, "gold")


def tracker_page(c, page):
    y = page_title(c, page, "IMPRIMÍVEL", "Rastreador semanal", "Use: feito, adaptado ou não feito. Registre sem julgamento.")
    data = [["Hábito", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]]
    for habit in ["Prato estruturado", "Vegetais/frutas", "Movimento", "Treino", "Pausa sem tela", "Rotina de sono"]:
        data.append([habit] + ["□"] * 7)
    rich_table(c, data, M, y, [49 * mm] + [16.5 * mm] * 7, [12 * mm] + [18 * mm] * 6, 8)
    y -= 133 * mm
    p(c, "Revisão em quatro perguntas", M, y, W - 2 * M, 15, 18, PLUM, "Serif-Bold")
    y -= 10 * mm
    prompts = ["O que funcionou?", "O que dificultou?", "Qual ajuste mínimo farei?", "Do que me orgulho?"]
    for i, prompt in enumerate(prompts):
        c.setFont("Sans-Bold", 8.2)
        c.setFillColor([SAGE, ROSE, GOLD, PLUM_2][i])
        c.drawString(M, y, prompt)
        c.setStrokeColor(LINE)
        c.line(M, y - 8 * mm, W - M, y - 8 * mm)
        c.line(M, y - 16 * mm, W - M, y - 16 * mm)
        y -= 22 * mm


def faq_page(c, page):
    y = page_title(c, page, "DÚVIDAS", "Perguntas frequentes", "Respostas diretas para não transformar detalhes em obstáculos.")
    qs = [
        ("Preciso cortar carboidrato?", "Não. Ajuste o total e prefira alimentos que favoreçam saciedade e treino."),
        ("Abdominais afinam a cintura?", "Fortalecem o tronco. A mudança de gordura depende do processo global."),
        ("Jejum é obrigatório?", "Não. Pode ser apenas uma forma de organizar horários para algumas pessoas."),
        ("Preciso treinar todos os dias?", "Não. Duas boas sessões de força e movimento frequente já formam uma base."),
        ("E se o peso não cair?", "Veja cintura, média de peso, aderência e 2 a 4 semanas de tendência antes de ajustar."),
        ("Posso ter refeição livre?", "Prefira flexibilidade planejada sem transformar comida em prêmio ou castigo."),
    ]
    numbered(c, qs, M, y, W - 2 * M, 8.4, ROSE, 32 * mm)


def references_page(c, page):
    y = page_title(c, page, "REFERÊNCIAS", "Fontes principais", "Documentos oficiais e estudos consultados. A ciência evolui; revise atualizações.")
    refs = [
        ("1", "Ministério da Saúde. Guia Alimentar para a População Brasileira, 2ª ed.", "gov.br/saude - Guia Alimentar"),
        ("2", "Organização Mundial da Saúde. Diretrizes sobre atividade física e comportamento sedentário.", "who.int/publications/i/item/9789240014886"),
        ("3", "CDC. Steps for Losing Weight.", "cdc.gov/healthy-weight-growth/losing-weight"),
        ("4", "NIDDK. Eating & Physical Activity to Lose or Maintain Weight.", "niddk.nih.gov/health-information/weight-management"),
        ("5", "Anvisa. Cuidado com propaganda enganosa de suplementos.", "gov.br/anvisa - suplementos alimentares"),
        ("6", "NIH ODS. Dietary Supplements for Weight Loss.", "ods.od.nih.gov/factsheets/WeightLoss-Consumer"),
        ("7", "Kordi et al. Abdominal resistance exercise and subcutaneous fat. RCT.", "pubmed.ncbi.nlm.nih.gov/25766455"),
        ("8", "Kostek et al. Upper-body resistance training and regional fat.", "pubmed.ncbi.nlm.nih.gov/17596787"),
        ("9", "Krogsæter et al. Abdominal aerobic endurance exercise. RCT.", "pmc.ncbi.nlm.nih.gov/articles/PMC10680576"),
        ("10", "Jäger et al. ISSN position stand: protein and exercise.", "pubmed.ncbi.nlm.nih.gov/28642676"),
    ]
    for num, name, link in refs:
        c.setFillColor(SAGE)
        c.circle(M + 4 * mm, y - 1.5 * mm, 3.7 * mm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Sans-Bold", 7)
        c.drawCentredString(M + 4 * mm, y - 3.8 * mm, num)
        y = p(c, f"<b>{name}</b><br/><font color='#6D6269'>{link}</font>", M + 12 * mm, y + 3 * mm, W - 2 * M - 12 * mm, 7.6, 10, INK)
        y -= 4 * mm
    callout(c, "ESCOPO", "Este guia não promete perda localizada, não prescreve calorias individuais e não recomenda suplementos como solução de emagrecimento.", M, y, W - 2 * M, "plum")


def final_page(c, page):
    crop_image(c, ASSETS / "cover.jpg", 0, 0, W, H, 0.67, 0.52)
    overlay(c, 0, 0, W, H, PLUM, 0.63)
    c.setFillColor(GOLD)
    c.rect(M, H - 40 * mm, 34 * mm, 2 * mm, fill=1, stroke=0)
    y = H - 64 * mm
    y = p(c, "O objetivo não é vencer o corpo.", M, y, 145 * mm, 30, 35, WHITE, "Serif-Bold")
    y -= 5 * mm
    y = p(c, "É construir uma rotina que trabalhe com ele.", M, y, 145 * mm, 30, 35, BLUSH, "Serif-Bold")
    y -= 13 * mm
    p(c, "Leve consigo a base: comida de verdade, força com progressão, movimento frequente, recuperação e ajustes sem punição.", M, y, 122 * mm, 12, 18, WHITE)
    c.setFillColor(GOLD)
    c.circle(M + 4 * mm, 40 * mm, 4 * mm, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Sans-Bold", 9)
    c.drawString(M + 13 * mm, 37 * mm, "CONTINUE POR MAIS 21 DIAS")
    c.setFont("Sans", 7.5)
    c.drawRightString(W - M, 12 * mm, f"{page:02d}")


def build():
    c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
    c.setTitle("Guia Completo - Gorduras Laterais - Versão Premium")
    c.setAuthor("Material educativo - versão editorial revisada")
    pages = []
    pages.append(lambda c, n: cover(c))
    pages.append(intro_page)
    pages.append(contents_page)
    pages.append(safety_page)
    pages.append(lambda c, n: section_page(c, n, 1, "ENTENDER\nANTES DE AGIR", "O que são as gorduras laterais, por que aparecem e o que a ciência realmente permite afirmar.", ASSETS / "cover.jpg", 0.72, 0.48))
    pages.append(lambda c, n: article(c, n, "ENTENDER", "O que são os flancos", "A gordura lateral é uma região de armazenamento, não uma falha isolada.", [
        ("Anatomia simples", "Os flancos ficam entre as últimas costelas e a parte superior do quadril. O volume visível combina tecido adiposo subcutâneo, pele, músculos e estrutura óssea."),
        ("Por que chama atenção", "Roupas, postura, iluminação e distribuição individual podem tornar a região mais aparente mesmo quando o peso corporal não é elevado."),
        ("Por que é persistente", "A ordem de mobilização de gordura varia entre pessoas. Para muitas, abdômen e flancos mudam mais tarde que outras áreas."),
    ], call=("PONTO-CHAVE", "Não existe um diagnóstico chamado 'gordura lateral'. A questão pode ser estética, funcional ou parte de um quadro de excesso de gordura corporal.", "gold")))
    pages.append(fat_types_page)
    pages.append(lambda c, n: cards(c, n, "ENTENDER", "Por que o corpo armazena ali", "Nenhum fator explica tudo sozinho.", [
        ("Genética", "Influencia formato corporal e padrão de distribuição de gordura.", ROSE),
        ("Sexo e idade", "Hormônios e envelhecimento alteram onde o corpo tende a acumular.", SAGE),
        ("Balanço energético", "Excesso de energia ao longo do tempo favorece armazenamento.", GOLD),
        ("Rotina", "Sono, estresse, álcool, sedentarismo e ambiente afetam decisões e gasto.", PLUM_2),
        ("Histórico", "Perdas e ganhos anteriores influenciam fome, gasto e expectativas.", ROSE),
        ("Condições clínicas", "Medicamentos e doenças podem exigir avaliação individual.", SAGE),
    ], ("SEM SOMATOTIPOS", "Rótulos como ectomorfo, mesomorfo e endomorfo não devem determinar sua dieta ou treino.", "rose"), 2, 38 * mm))
    pages.append(lambda c, n: article(c, n, "ENTENDER", "Redução localizada: o que sabemos", "Exercitar uma área e escolher de onde perder gordura não são a mesma coisa.", [
        ("O consenso prático", "Exercícios localizados melhoram força e resistência dos músculos treinados. A redução de gordura ocorre principalmente como resposta global ao balanço energético e ao exercício total."),
        ("A evidência não é absolutamente uniforme", "Alguns estudos recentes observaram diferenças regionais em protocolos específicos; outros ensaios não encontraram redução localizada relevante [7-9]."),
        ("A decisão segura", "Não venda um exercício como 'derretedor de pneuzinho'. Treine o corpo todo, fortaleça o core e avalie mudanças na composição corporal."),
    ], call=("LINGUAGEM HONESTA", "Diga 'fortalecer e definir a região conforme a gordura corporal diminui', não 'queimar a gordura daquele ponto'.", "rose")))
    pages.append(balance_page)
    pages.append(lambda c, n: cards(c, n, "ENTENDER", "Como a gordura é mobilizada", "Um processo em cinco atos, sem alimentos mágicos.", [
        ("1. Demanda", "O organismo precisa de energia para viver e se movimentar.", ROSE),
        ("2. Sinalização", "Hormônios ajudam a liberar energia armazenada conforme o contexto.", GOLD),
        ("3. Lipólise", "Triglicerídeos são quebrados em componentes utilizáveis.", SAGE),
        ("4. Transporte", "Ácidos graxos circulam até tecidos que precisam de energia.", PLUM_2),
        ("5. Oxidação", "As células utilizam esses substratos na produção de energia.", ROSE),
        ("6. Tendência", "Perda visível exige repetição do processo ao longo do tempo.", SAGE),
    ], ("SEM ATALHO", "Chás, cremes, cintas e suor não substituem a tendência energética e comportamental.", "gold"), 2, 37 * mm))
    pages.append(lambda c, n: article(c, n, "ENTENDER", "Ritmo, expectativas e tempo", "Resultados sustentáveis raramente obedecem ao calendário de um anúncio.", [
        ("O ritmo é individual", "O CDC usa aproximadamente 0,45 a 0,9 kg por semana como referência geral para perda gradual, mas isso não é obrigação nem serve para todas as pessoas [3]."),
        ("A cintura oscila", "Digestão, retenção de líquido, ciclo menstrual, álcool e treino podem alterar medidas sem representar ganho de gordura."),
        ("A aparência chega em etapas", "Primeiro podem melhorar energia, força, sono ou roupas. Mudanças visuais nos flancos podem surgir depois."),
    ], call=("PRAZO DE 21 DIAS", "É tempo suficiente para testar um sistema e iniciar hábitos, não para garantir um corpo final.", "sage")))
    pages.append(lambda c, n: section_page(c, n, 2, "AVALIAR\nSEM SE JULGAR", "Crie uma linha de base, escolha indicadores úteis e transforme desejo em ações observáveis.", ASSETS / "cover.jpg", 0.72, 0.52))
    pages.append(measurement_page)
    pages.append(lambda c, n: cards(c, n, "AVALIAR", "Quatro lentes de progresso", "Nenhum indicador conta a história sozinho.", [
        ("Medidas", "Cintura e roupas mostram tendência regional.", ROSE),
        ("Peso médio", "Média de vários dias reduz ruído, se pesar-se for confortável.", GOLD),
        ("Desempenho", "Carga, repetições, caminhada e disposição revelam adaptação.", SAGE),
        ("Bem-estar", "Sono, fome, humor e energia ajudam a avaliar sustentabilidade.", PLUM_2),
    ], ("FOTOGRAFIAS", "Se usar fotos, mantenha roupa, distância, postura e iluminação. Compare mensalmente, não diariamente.", "gold"), 2, 46 * mm))
    pages.append(lambda c, n: article(c, n, "AVALIAR", "Composição corporal: útil, não absoluta", "Métodos diferentes carregam erros diferentes.", [
        ("Bioimpedância", "É prática, mas hidratação, refeição, treino e equipamento alteram o resultado. Compare no mesmo aparelho e condição."),
        ("Dobras cutâneas", "Dependem bastante da técnica do avaliador e são melhores para observar tendência."),
        ("Imagem e exames", "DEXA e outros métodos oferecem mais detalhe, mas também não eliminam toda incerteza e raramente são necessários para começar."),
    ], call=("NÃO PERSEGUIR DECIMAIS", "Uma medida menos precisa, feita de modo consistente, pode orientar melhor que avaliações sofisticadas em condições diferentes.", "sage")))
    pages.append(lambda c, n: article(c, n, "AVALIAR", "Metas que orientam comportamento", "Troque 'quero perder pneuzinho' por compromissos sob seu controle.", [
        ("Resultado desejado", "Reduzir medidas pode continuar sendo sua motivação. Apenas não deixe que seja o único marcador."),
        ("Processo mínimo", "Defina duas sessões de força, movimento frequente e uma estrutura alimentar viável."),
        ("Plano de resposta", "Antecipe o que fará diante de viagem, cansaço, evento social ou semana difícil."),
    ], call=("EXEMPLO", "Durante 21 dias, farei dois treinos curtos por semana, caminharei em quatro dias e montarei duas refeições estruturadas por dia.", "rose")))
    pages.append(lambda c, n: section_page(c, n, 3, "ALIMENTAR\nCOM FLEXIBILIDADE", "Comida brasileira, estrutura visual, saciedade e planejamento sem cardápio-prisão.", ASSETS / "nutrition.jpg", 0.52, 0.5))
    pages.append(lambda c, n: cards(c, n, "ALIMENTAR", "Sete princípios que valem mais", "Priorize o que produz mais impacto e menos confusão.", [
        ("Base in natura", "Faça de alimentos in natura ou minimamente processados a base [1].", SAGE),
        ("Proteína suficiente", "Distribua fontes proteicas ao longo do dia.", ROSE),
        ("Vegetais e frutas", "Variedade ajuda fibra, micronutrientes e volume.", SAGE),
        ("Energia ajustada", "Porções precisam combinar objetivo, fome e atividade.", GOLD),
        ("Água habitual", "Beba conforme sede e condições individuais.", PLUM_2),
        ("Ambiente preparado", "Deixe opções úteis visíveis e acessíveis.", ROSE),
        ("Flexibilidade", "Planeje exceções sem culpa nem compensação.", GOLD),
        ("Consistência", "Repita refeições simples quando isso facilitar.", SAGE),
    ], None, 2, 38 * mm))
    pages.append(plate_page)
    pages.append(portions_page)
    pages.append(lambda c, n: article(c, n, "ALIMENTAR", "Proteína: função e contexto", "Ela apoia saciedade e preservação de massa magra, mas não precisa dominar o prato.", [
        ("Fontes", "Feijão e outros legumes, ovos, leite e derivados, frango, peixe, carne e tofu podem compor o dia."),
        ("Quanto", "Para pessoas ativas, referências esportivas frequentemente citam 1,4 a 2,0 g/kg/dia [10]. Isso não é uma prescrição universal."),
        ("Distribuição", "Incluir uma fonte nas refeições principais costuma ser mais prático que concentrar tudo no jantar."),
        ("Condições clínicas", "Doença renal e outras situações exigem orientação individual antes de elevar proteína."),
    ], call=("WHEY", "Proteína em pó pode ser conveniência, não necessidade e não é suplemento de emagrecimento.", "gold")))
    pages.append(lambda c, n: cards(c, n, "ALIMENTAR", "Carboidratos sem medo", "Eles fornecem energia, fibra e prazer; a qualidade e a quantidade importam.", [
        ("Arroz e feijão", "Combinação acessível, cultural e nutricionalmente valiosa.", SAGE),
        ("Tubérculos", "Batata, mandioca, inhame e batata-doce variam a rotina.", GOLD),
        ("Grãos", "Aveia, milho e pães podem compor refeições práticas.", ROSE),
        ("Ao redor do treino", "Podem apoiar desempenho, mas não existe janela obrigatória para a maioria.", PLUM_2),
    ], ("ÍNDICE GLICÊMICO", "Não julgue uma refeição por um alimento isolado. Proteína, fibra, gordura e porção alteram a resposta.", "sage"), 2, 48 * mm))
    pages.append(lambda c, n: article(c, n, "ALIMENTAR", "Gorduras, fibras e água", "Três elementos importantes que não precisam virar obsessão.", [
        ("Gorduras", "Azeite, castanhas, sementes, abacate e peixes podem enriquecer o padrão alimentar. São energéticos; pequenas porções já contam."),
        ("Fibras", "Feijão, verduras, frutas, aveia e sementes ajudam saciedade e saúde intestinal. Aumente gradualmente."),
        ("Água", "Necessidades variam com clima, tamanho corporal, atividade e alimentação. Use sede, cor da urina e orientação clínica como contexto."),
    ], call=("EVITE FÓRMULA ÚNICA", "Não existe uma quantidade de água por quilo adequada para todas as pessoas e condições.", "rose")))
    pages.append(lambda c, n: cards(c, n, "ALIMENTAR", "Alimentos 'termogênicos': tamanho do efeito", "Eles podem fazer parte da alimentação, mas não são motores principais.", [
        ("Café", "Pode alterar alerta e desempenho; não compensa excesso de energia.", PLUM_2),
        ("Chá verde", "Efeitos sobre peso são pequenos e variáveis.", SAGE),
        ("Pimenta", "Pode aumentar discretamente termogênese, sem resultado milagroso.", ROSE),
        ("Canela e gengibre", "São temperos úteis; não 'ativam' gordura lateral.", GOLD),
    ], ("MELHOR TROCA", "Use temperos pelo sabor. Invista esforço em refeições, movimento, sono e aderência.", "gold"), 2, 46 * mm))
    pages.append(lambda c, n: article(c, n, "ALIMENTAR", "Fome, saciedade e vontade", "Comer não responde apenas à necessidade biológica.", [
        ("Fome física", "Tende a crescer gradualmente e aceita diferentes alimentos."),
        ("Vontade específica", "Pode surgir por cheiro, memória, emoção, hábito ou oportunidade."),
        ("Saciedade", "É influenciada por volume, proteína, fibra, velocidade e satisfação."),
        ("Estratégia", "Pausar e identificar o que está presente amplia escolha; não serve para proibir comida."),
    ], call=("SEM MORALIZAR", "Comida não é limpa ou suja, e você não precisa merecer uma refeição.", "rose")))
    pages.append(lambda c, n: menu_page(c, n, 1))
    pages.append(lambda c, n: menu_page(c, n, 2))
    pages.append(prep_page)
    pages.append(lambda c, n: cards(c, n, "ALIMENTAR", "Lista de compras essencial", "Compre para combinações, não para receitas perfeitas.", [
        ("Proteínas", "ovos; feijão/lentilha; frango; peixe; iogurte natural", ROSE),
        ("Vegetais", "folhas; tomate; cenoura; abóbora; legumes congelados", SAGE),
        ("Energia", "arroz; aveia; pão; batata/mandioca; cuscuz", GOLD),
        ("Práticos", "frutas; castanhas; atum/sardinha; milho; temperos", PLUM_2),
        ("Emergência", "ovos; congelados simples; feijão pronto; pão; fruta", ROSE),
        ("Prazer", "um ou dois alimentos escolhidos sem rótulo de 'proibido'", SAGE),
    ], ("ORÇAMENTO", "Feijão, ovos, sardinha, frango, frutas da estação e legumes congelados podem reduzir custo sem empobrecer o plano.", "sage"), 2, 38 * mm))
    pages.append(lambda c, n: article(c, n, "ALIMENTAR", "Restaurante, viagem e dia corrido", "O plano precisa sobreviver fora da cozinha ideal.", [
        ("Restaurante", "Escolha primeiro uma fonte proteica e vegetais; adicione o acompanhamento que deseja e coma até conforto."),
        ("Evento social", "Não chegue com fome extrema. Aproveite conscientemente e volte ao padrão normal depois."),
        ("Viagem", "Preserve uma âncora: café da manhã, caminhada ou horário de sono."),
        ("Emergência", "Arroz e feijão congelados com ovos; sanduíche com proteína e fruta; iogurte com aveia e fruta."),
    ], call=("SEM COMPENSAÇÃO", "Uma refeição diferente não exige jejum punitivo nem treino extra.", "rose")))
    pages.append(lambda c, n: section_page(c, n, 4, "TREINAR\nCOM PROGRESSÃO", "Força para o corpo todo, core funcional e cardio em doses que cabem na rotina.", ASSETS / "squat.jpg", 0.48, 0.52))
    pages.append(lambda c, n: cards(c, n, "TREINAR", "Os seis princípios do treino", "A qualidade do estímulo importa mais que a aparência de sofrimento.", [
        ("Frequência", "Duas sessões semanais já formam uma base.", ROSE),
        ("Esforço", "Termine séries com alguma reserva e técnica preservada.", GOLD),
        ("Progressão", "Aumente repetições, carga ou dificuldade aos poucos.", SAGE),
        ("Amplitude", "Use a maior amplitude confortável e controlada.", PLUM_2),
        ("Recuperação", "Alterne estímulo e descanso conforme fadiga.", ROSE),
        ("Registro", "Anote dose e percepção para saber quando evoluir.", SAGE),
    ], ("CONSISTÊNCIA", "Um treino curto repetido por meses vale mais que uma semana extrema.", "gold"), 2, 38 * mm))
    pages.append(lambda c, n: article(c, n, "TREINAR", "Aquecimento que prepara", "Cinco a oito minutos bastam para a maioria das sessões.", [
        ("Eleve a temperatura", "Caminhe, pedale ou faça movimentos leves por 2 a 3 minutos."),
        ("Mobilize o necessário", "Faça movimentos dinâmicos para tornozelos, quadril, coluna torácica e ombros conforme o treino."),
        ("Ensaie", "Execute o primeiro exercício sem carga ou com carga baixa."),
        ("Aproxime", "Faça uma ou duas séries preparatórias antes da carga principal."),
    ], call=("ALONGAR?", "Alongamento estático pode ser usado quando ajuda conforto, mas não precisa dominar o aquecimento.", "sage")))
    rows_a = [
        ["Agachamento", "Sentar e levantar", "2-3 x 8-12", "Pés estáveis; joelhos acompanham"],
        ["Empurrar", "Flexão na parede", "2-3 x 6-12", "Corpo alinhado"],
        ["Remada", "Elástico ou mochila", "2-3 x 8-12", "Cotovelos para trás"],
        ["Ponte", "Ponte no chão", "2-3 x 10-15", "Glúteos, sem arquear lombar"],
        ["Dead bug", "Braços/pernas alternados", "2 x 6-10/lado", "Respiração e controle"],
    ]
    pages.append(lambda c, n: workout_page(c, n, "FINALIZAÇÃO OPCIONAL", "Treino A - corpo inteiro", rows_a, "Caminhe 5 a 10 minutos em ritmo confortável. Pule se estiver começando ou cansado."))
    pages.append(squat_detail)
    rows_b = [
        ["Afundo assistido", "Apoio em cadeira", "2-3 x 6-10/lado", "Base estável"],
        ["Dobradiça", "Mochila junto ao corpo", "2-3 x 8-12", "Quadril para trás"],
        ["Desenvolvimento", "Garrafas ou halteres", "2-3 x 8-12", "Costelas controladas"],
        ["Elevação de quadril", "Ponte unilateral assistida", "2-3 x 6-10/lado", "Quadril nivelado"],
        ["Bird dog", "Braço/perna isolados", "2 x 6-10/lado", "Sem girar o tronco"],
    ]
    pages.append(lambda c, n: workout_page(c, n, "FINALIZAÇÃO OPCIONAL", "Treino B - força e estabilidade", rows_b, "Faça 4 ciclos: 40 segundos de caminhada rápida e 80 segundos leves, se já tolerar atividade moderada."))
    pages.append(lambda c, n: cards(c, n, "TREINAR", "Biblioteca de movimentos", "Use as opções para adaptar equipamento, força e conforto.", [
        ("Agachar", "cadeira; livre; goblet squat", ROSE),
        ("Empurrar", "parede; banco; chão", GOLD),
        ("Puxar", "elástico; mochila; halter", SAGE),
        ("Dobradiça", "vassoura; mochila; peso", PLUM_2),
        ("Unilateral", "degrau; afundo assistido; avanço", ROSE),
        ("Carregar", "sacola; mochila; halteres", SAGE),
        ("Anti-rotação", "Pallof press; prancha", GOLD),
        ("Locomover", "caminhar; pedalar; nadar; dançar", PLUM_2),
    ], None, 2, 41 * mm))
    pages.append(lambda c, n: article(c, n, "TREINAR", "Core: mais que abdominais", "O tronco transmite força, controla movimento e protege posições.", [
        ("Anti-extensão", "Evitar que a lombar arqueie excessivamente, como no dead bug e na prancha."),
        ("Anti-rotação", "Resistir à torção, como no Pallof press e no bird dog."),
        ("Estabilidade lateral", "Controlar inclinação, como na prancha lateral e carregadas."),
        ("Movimento", "Flexão e rotação também podem ser treinadas, mas com dose e técnica adequadas."),
    ], call=("OBJETIVO", "Treinar o core fortalece e pode melhorar aparência muscular, mas não escolhe de onde a gordura será usada.", "gold")))
    pages.append(lambda c, n: cards(c, n, "TREINAR", "Rotina de core em 10 minutos", "Faça após o treino ou em dia separado.", [
        ("Dead bug", "2 x 6-10 por lado; lombar confortável.", ROSE),
        ("Prancha lateral", "2 x 15-30 s por lado; joelho apoiado se necessário.", SAGE),
        ("Bird dog", "2 x 6-10 por lado; quadril estável.", GOLD),
        ("Pallof press", "2 x 8-12 por lado; resista à rotação.", PLUM_2),
        ("Ponte", "2 x 10-15; contraia glúteos.", ROSE),
        ("Respiração", "3 ciclos lentos entre exercícios.", SAGE),
    ], ("DOSE", "Pare antes de perder alinhamento. Aumente tempo ou repetições aos poucos.", "sage"), 2, 39 * mm))
    pages.append(side_plank_detail)
    pages.append(lambda c, n: section_page(c, n, 5, "MOVER\nE SUSTENTAR", "Cardio, passos, sono, platôs e um plano de 21 dias para consolidar a base.", ASSETS / "walking.jpg", 0.52, 0.48))
    pages.append(cardio_page)
    pages.append(lambda c, n: article(c, n, "MOVER", "Progressão aeróbica em três semanas", "Aumente duração antes de buscar intensidade.", [
        ("Semana 1", "Quatro sessões de 15 a 25 minutos, leves a moderadas."),
        ("Semana 2", "Quatro ou cinco sessões de 20 a 30 minutos, maioria moderada."),
        ("Semana 3", "Cinco sessões de 25 a 35 minutos; uma pode incluir blocos mais rápidos se você estiver apto."),
        ("Como ajustar", "Se a recuperação piorar, reduza duração ou intensidade. Dor e exaustão não são metas."),
    ], call=("MODALIDADE", "Caminhada, bicicleta, dança, natação e esportes contam. Escolha algo repetível.", "sage")))
    pages.append(lambda c, n: cards(c, n, "MOVER", "Movimento fora do treino", "Atividade cotidiana ajuda gasto, saúde e quebra do sedentarismo.", [
        ("Após refeições", "Caminhe 5 a 10 minutos quando possível.", SAGE),
        ("Trabalho", "Alterne posições e faça pausas de movimento.", PLUM_2),
        ("Deslocamento", "Estacione mais longe, use escadas ou caminhe trechos.", GOLD),
        ("Casa", "Limpeza, compras e jardinagem também contam.", ROSE),
    ], ("PASSOS", "Use contagem como informação, não obrigação. Aumentar gradualmente sua média atual costuma ser mais realista que perseguir um número universal.", "gold"), 2, 48 * mm))
    pages.append(lambda c, n: cards(c, n, "MOVER", "HIIT ou cardio contínuo?", "Ambos podem melhorar condicionamento; a melhor escolha depende de preferência e tolerância.", [
        ("Contínuo moderado", "Mais fácil de regular e acumular; útil para iniciantes.", SAGE),
        ("Intervalado", "Alterna esforço e recuperação; economiza tempo, mas exige mais tolerância.", ROSE),
        ("HIIT", "Intenso de verdade; não precisa aparecer toda semana.", GOLD),
        ("Combinação", "Uma base moderada com pequenos blocos rápidos atende muitas pessoas.", PLUM_2),
    ], ("NÃO É SUPERIOR POR DEFINIÇÃO", "Mais suor ou falta de ar não garantem maior perda de gordura se a estratégia não for sustentável.", "rose"), 2, 49 * mm))
    pages.append(recovery_page)
    pages.append(lambda c, n: article(c, n, "SUSTENTAR", "Quando o progresso parece parar", "Um platô não se confirma em dois dias.", [
        ("1. Confirme", "Observe 2 a 4 semanas de tendência e mais de um indicador."),
        ("2. Revise", "Bebidas, beliscos, porções e fins de semana podem mudar sem perceber."),
        ("3. Proteja o básico", "Sono, alimentação estruturada, treino e movimento vêm antes de táticas avançadas."),
        ("4. Ajuste uma variável", "Acrescente caminhada ou reduza discretamente porções energéticas."),
        ("5. Reavalie", "Dê tempo ao ajuste e procure ajuda se houver sintomas ou dificuldade persistente."),
    ], call=("NÃO FAÇA", "Jejum punitivo, laxantes, desidratação, cortar grupos inteiros ou dobrar o cardio de uma vez.", "rose")))
    pages.append(lambda c, n: article(c, n, "SUSTENTAR", "Manutenção e retorno", "O melhor plano inclui o que fazer quando a vida sair do roteiro.", [
        ("Limites de alerta", "Defina antecipadamente o que merece revisão: aumento persistente da cintura, queda de força ou perda de rotina."),
        ("Protocolo curto", "Retome por 7 a 14 dias as âncoras: compras, dois treinos, caminhada e refeições estruturadas."),
        ("Sem identidade de fracasso", "Desvio é informação sobre ambiente, carga e estratégia; não prova incapacidade."),
        ("Suplementos", "Produtos de emagrecimento têm evidência limitada e podem interagir com medicamentos [5-6]."),
    ], call=("CONTINUAR", "Manutenção não é estagnação: é aprender a sustentar e ajustar sem extremos.", "sage")))
    pages.append(lambda c, n: article(c, n, "PLANO DE 21 DIAS", "Visão geral", "Três semanas com objetivos diferentes.", [
        ("Semana 1 - organizar", "Avaliação inicial, compras, dois treinos e movimento leve."),
        ("Semana 2 - consolidar", "Aumentar repetição dos comportamentos e ajustar ambiente."),
        ("Semana 3 - progredir", "Adicionar pequena progressão e decidir o próximo ciclo."),
    ], call=("O QUE MEDIR", "Registre consistência, energia, treino e uma medida semanal. O plano é um experimento, não uma sentença.", "gold")))
    w1 = [
        ["Avaliação inicial", "Caminhada 15-20 min", "1 prato estruturado"],
        ["Treino A", "Separar água e lanche", "Rotina de sono"],
        ["Caminhada 20 min", "Vegetais em 2 refeições", "Pausa breve"],
        ["Descanso ativo", "Planejar compras", "Sem compensação"],
        ["Treino B", "Prato estruturado", "Registrar energia"],
        ["Movimento prazeroso", "Refeição social consciente", "Preparar bases"],
        ["Caminhada leve", "Revisão semanal", "Escolher ajuste"],
    ]
    pages.append(lambda c, n: week_page(c, n, 1, "organizar", SAGE, w1))
    w2 = [
        ["Caminhada 25 min", "Prato estruturado 2x", "Sono consistente"],
        ["Treino A + progressão", "Fruta/vegetal 3x", "Registrar esforço"],
        ["Caminhada moderada", "Comer sem tela", "Pausa de 5 min"],
        ["Descanso ativo", "Organizar lanche", "Revisar fome"],
        ["Treino B + progressão", "Água habitual", "Rotina de sono"],
        ["30 min de movimento", "Flexibilidade planejada", "Sem culpa"],
        ["Caminhada leve", "Medida semanal", "Revisão e ajuste"],
    ]
    pages.append(lambda c, n: week_page(c, n, 2, "consolidar", GOLD, w2))
    w3 = [
        ["Caminhada 30 min", "Prato estruturado", "Planejar semana"],
        ["Treino A + série opcional", "Proteína nas principais", "Registrar força"],
        ["Cardio moderado", "Comer devagar", "Pausa sem tela"],
        ["Descanso ativo", "Rever ambiente", "Sono consistente"],
        ["Treino B + série opcional", "Vegetais variados", "Registrar energia"],
        ["Movimento escolhido", "Refeição social", "Retorno normal"],
        ["Avaliação final", "Caminhada leve", "Plano dos próximos 21 dias"],
    ]
    pages.append(lambda c, n: week_page(c, n, 3, "progredir", ROSE, w3))
    pages.append(tracker_page)
    pages.append(faq_page)
    pages.append(references_page)
    pages.append(final_page)

    for i, fn in enumerate(pages, 1):
        fn(c, i)
        c.showPage()
    c.save()
    print(f"{OUT}\nPAGES={len(pages)}")


if __name__ == "__main__":
    build()
