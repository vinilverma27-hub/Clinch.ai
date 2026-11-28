#!/usr/bin/env python3
"""
NEN 300 (IIT Delhi) - Case study deck + word-for-word presentation script.

Topic 08: Dealing with garbage - Singapore, Indore, Delhi
Structure: Six Thinking Hats (Blue -> White -> Red -> Black -> Green -> Blue), 15 minutes.

Run:  python3 build_deck.py
Outputs (same folder):
  Dealing_with_Garbage_Case_Study.pptx   (speaker notes carry the script slide by slide)
  Presentation_Script.docx               (printable word-for-word script + time plan + Q&A prep)
"""
from __future__ import annotations

import re
from pathlib import Path

from lxml import etree
from pptx import Presentation
from pptx.chart.data import CategoryChartData
from pptx.dml.color import RGBColor
from pptx.enum.chart import XL_CHART_TYPE, XL_LABEL_POSITION, XL_LEGEND_POSITION
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, MSO_AUTO_SIZE, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

OUT_DIR = Path(__file__).resolve().parent
PPTX_PATH = OUT_DIR / "Dealing_with_Garbage_Case_Study.pptx"
DOCX_PATH = OUT_DIR / "Presentation_Script.docx"

# --------------------------------------------------------------------------------------
# Design system
# --------------------------------------------------------------------------------------
SLIDE_W, SLIDE_H = 13.333, 7.5
MARGIN = 0.6
CONTENT_W = SLIDE_W - 2 * MARGIN

TITLE_FONT = "Georgia"
BODY_FONT = "Calibri"

CREAM = RGBColor(0xF8, 0xF6, 0xF1)
NAVY = RGBColor(0x1B, 0x2A, 0x41)
INK = RGBColor(0x24, 0x30, 0x3C)
MUTED = RGBColor(0x6B, 0x72, 0x80)
ACCENT = RGBColor(0x0E, 0x7C, 0x7B)
ACCENT_SOFT = RGBColor(0xDD, 0xEE, 0xEC)
CARD = RGBColor(0xFF, 0xFF, 0xFF)
BORDER = RGBColor(0xE2, 0xDF, 0xD7)
SOFT = RGBColor(0xF1, 0xEE, 0xE7)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BRICK = RGBColor(0xC9, 0x6A, 0x5B)

HATS = {
    "blue": ("Blue hat", RGBColor(0x2E, 0x6F, 0xD6), WHITE),
    "white": ("White hat", RGBColor(0xFF, 0xFF, 0xFF), INK),
    "red": ("Red hat", RGBColor(0xD6, 0x45, 0x45), WHITE),
    "black": ("Black hat", RGBColor(0x1F, 0x29, 0x37), WHITE),
    "green": ("Green hat", RGBColor(0x2F, 0x9E, 0x5B), WHITE),
}
HAT_LABEL = {
    "blue": "DEFINE THE CASE",
    "white": "FACTS & FIGURES",
    "red": "EMOTIONS & STAKEHOLDERS",
    "black": "CRITICAL ANALYSIS & LEGAL ISSUES",
    "green": "SUSTAINABILITY & SDGs",
    "blue_close": "CLOSE THE CASE",
}

SDG_COLOURS = {
    3: RGBColor(0x4C, 0x9F, 0x38),
    6: RGBColor(0x26, 0xBD, 0xE2),
    7: RGBColor(0xFC, 0xC3, 0x0B),
    8: RGBColor(0xA2, 0x19, 0x42),
    11: RGBColor(0xFD, 0x69, 0x25),
    12: RGBColor(0xBF, 0x8B, 0x2E),
    13: RGBColor(0x3F, 0x7E, 0x44),
}

FOOTER_TEXT = "NEN 300  ·  IIT Delhi  ·  Case study 08 — Dealing with Garbage: Singapore · Indore · Delhi"


# --------------------------------------------------------------------------------------
# Low-level helpers
# --------------------------------------------------------------------------------------
def _hex(rgb: RGBColor) -> str:
    return str(rgb)


def kill_effects(shape) -> None:
    """Drop the theme style reference so auto-shapes get no shadow, outline or white default text."""
    style = shape._element.find(qn("p:style"))
    if style is not None:
        shape._element.remove(style)
    sp_pr = shape._element.spPr
    if sp_pr.find(qn("a:effectLst")) is None:
        etree.SubElement(sp_pr, qn("a:effectLst"))


def add_rect(slide, x, y, w, h, fill=None, line=None, *, rounded=False, radius=0.06, line_w=0.75):
    shp_type = MSO_SHAPE.ROUNDED_RECTANGLE if rounded else MSO_SHAPE.RECTANGLE
    shp = slide.shapes.add_shape(shp_type, Inches(x), Inches(y), Inches(w), Inches(h))
    if rounded:
        shp.adjustments[0] = radius
    if fill is None:
        shp.fill.background()
    else:
        shp.fill.solid()
        shp.fill.fore_color.rgb = fill
    if line is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = line
        shp.line.width = Pt(line_w)
    kill_effects(shp)
    shp.text_frame.text = ""
    return shp


def add_oval(slide, x, y, d, fill, line=None):
    shp = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x), Inches(y), Inches(d), Inches(d))
    shp.fill.solid()
    shp.fill.fore_color.rgb = fill
    if line is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = line
        shp.line.width = Pt(0.75)
    kill_effects(shp)
    return shp


def _write_runs(para, runs, *, size, color, font, bold, italic, spacing_pts=None):
    for text, opts in runs:
        pieces = text.split("\n")
        for i, piece in enumerate(pieces):
            if i > 0:
                para.add_line_break()
            if piece == "":
                continue
            r = para.add_run()
            r.text = piece
            f = r.font
            f.name = opts.get("font", font)
            f.size = Pt(opts.get("size", size))
            f.bold = opts.get("bold", bold)
            f.italic = opts.get("italic", italic)
            f.color.rgb = opts.get("color", color)
            spc = opts.get("spc", spacing_pts)
            if spc:
                r._r.get_or_add_rPr().set("spc", str(int(spc)))


def add_text(
    slide, x, y, w, h, paras, *, size=14, color=INK, font=BODY_FONT, bold=False, italic=False,
    align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spacing=1.0, space_after=0, wrap=True, margins=0.0,
):
    """paras: str | list[str | list[(text, opts)]]"""
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = wrap
    tf.auto_size = MSO_AUTO_SIZE.NONE
    # a hair of horizontal inset keeps the first glyph from being clipped by some renderers
    tf.margin_left = tf.margin_right = Inches(max(margins, 0.02))
    tf.margin_top = tf.margin_bottom = Inches(margins)
    tf.vertical_anchor = anchor
    if isinstance(paras, str):
        paras = [paras]
    for i, p in enumerate(paras):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.alignment = align
        para.line_spacing = spacing
        para.space_after = Pt(space_after)
        runs = p if isinstance(p, list) else [(p, {})]
        _write_runs(para, runs, size=size, color=color, font=font, bold=bold, italic=italic)
    return tb


def add_bullets(
    slide, x, y, w, h, items, *, size=12.5, color=INK, bullet="•", bullet_color=ACCENT,
    spacing=1.05, space_after=5, font=BODY_FONT, indent=0.18,
):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.NONE
    tf.margin_left = tf.margin_right = Inches(0.02)
    tf.margin_top = tf.margin_bottom = Inches(0)
    for i, item in enumerate(items):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.line_spacing = spacing
        para.space_after = Pt(space_after)
        runs = item if isinstance(item, list) else [(item, {})]
        _write_runs(para, runs, size=size, color=color, font=font, bold=False, italic=False)
        p_pr = para._p.get_or_add_pPr()
        p_pr.set("marL", str(int(Inches(indent))))
        p_pr.set("indent", str(-int(Inches(indent))))
        bu_clr = etree.SubElement(p_pr, qn("a:buClr"))
        etree.SubElement(bu_clr, qn("a:srgbClr")).set("val", _hex(bullet_color))
        etree.SubElement(p_pr, qn("a:buFont")).set("typeface", "Arial")
        etree.SubElement(p_pr, qn("a:buChar")).set("char", bullet)
    return tb


def add_chip(slide, x, y, text, fill, text_color, *, border=None, size=9, h=0.28, pad=0.14, w=None):
    width = w if w is not None else (len(text) * size * 0.0092 + 2 * pad)
    shp = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(width), Inches(h))
    shp.adjustments[0] = 0.5
    shp.fill.solid()
    shp.fill.fore_color.rgb = fill
    if border is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = border
        shp.line.width = Pt(0.75)
    kill_effects(shp)
    tf = shp.text_frame
    tf.margin_left = tf.margin_right = Inches(pad)
    tf.margin_top = tf.margin_bottom = Inches(0)
    tf.word_wrap = False
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    para = tf.paragraphs[0]
    para.alignment = PP_ALIGN.CENTER
    _write_runs(para, [(text, {})], size=size, color=text_color, font=BODY_FONT, bold=True, italic=False,
                spacing_pts=120)
    return shp


def set_cell_border(cell, *, color="E2DFD7", width_pt=0.75, sides=("B",)):
    tc_pr = cell._tc.get_or_add_tcPr()
    order = ["L", "R", "T", "B"]
    for side in sides:
        tag = qn(f"a:ln{side}")
        for e in tc_pr.findall(tag):
            tc_pr.remove(e)
    # a:lnL/R/T/B must precede the fill element inside tcPr
    insert_at = 0
    for side in order:
        if side not in sides:
            continue
        ln = etree.Element(qn(f"a:ln{side}"), w=str(int(Pt(width_pt))), cap="flat", cmpd="sng", algn="ctr")
        solid = etree.SubElement(ln, qn("a:solidFill"))
        etree.SubElement(solid, qn("a:srgbClr")).set("val", color)
        etree.SubElement(ln, qn("a:prstDash")).set("val", "solid")
        tc_pr.insert(insert_at, ln)
        insert_at += 1


def add_table(
    slide, x, y, w, rows, col_widths, *, size=11, header_size=11, pad=0.06, row_heights=0.5,
    zebra=True, first_col_bold=True, header_fill=NAVY,
):
    n_rows, n_cols = len(rows), len(rows[0])
    heights = row_heights if isinstance(row_heights, list) else [row_heights] * n_rows
    gf = slide.shapes.add_table(n_rows, n_cols, Inches(x), Inches(y), Inches(w), Inches(sum(heights)))
    tbl = gf.table
    tbl_pr = tbl._tbl.tblPr
    tbl_pr.set("firstRow", "0")
    tbl_pr.set("bandRow", "0")
    sid = tbl_pr.find(qn("a:tableStyleId"))
    if sid is None:
        sid = etree.SubElement(tbl_pr, qn("a:tableStyleId"))
    sid.text = "{2D5ABB26-0587-4C30-8999-92F81FD0307C}"  # "No Style, No Grid"
    for ci, cw in enumerate(col_widths):
        tbl.columns[ci].width = Inches(cw)
    for ri, row in enumerate(rows):
        tbl.rows[ri].height = Inches(heights[ri])
        for ci, val in enumerate(row):
            cell = tbl.cell(ri, ci)
            cell.margin_left = cell.margin_right = Inches(pad + 0.03)
            cell.margin_top = cell.margin_bottom = Inches(pad)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            is_header = ri == 0
            cell.fill.solid()
            if is_header:
                cell.fill.fore_color.rgb = header_fill
            elif zebra and ri % 2 == 0:
                cell.fill.fore_color.rgb = SOFT
            else:
                cell.fill.fore_color.rgb = CARD
            tf = cell.text_frame
            tf.word_wrap = True
            para = tf.paragraphs[0]
            runs = val if isinstance(val, list) else [(val, {})]
            default_bold = is_header or (first_col_bold and ci == 0)
            default_color = WHITE if is_header else (NAVY if (first_col_bold and ci == 0) else INK)
            _write_runs(para, runs, size=header_size if is_header else size, color=default_color,
                        font=BODY_FONT, bold=default_bold, italic=False)
            set_cell_border(cell, sides=("B",))
    return gf


def card(slide, x, y, w, h, *, fill=CARD, border=BORDER, accent=None, radius=0.04):
    shp = add_rect(slide, x, y, w, h, fill, border, rounded=True, radius=radius)
    if accent is not None:
        add_rect(slide, x + 0.16, y + 0.2, 0.055, h - 0.4, accent, None)
    return shp


def header(slide, hat_key, title, subtitle=None):
    hat = "blue" if hat_key == "blue_close" else hat_key
    name, fill, txt = HATS[hat]
    strip_fill = RGBColor(0xC9, 0xC5, 0xBB) if hat == "white" else fill
    add_rect(slide, 0, 0, SLIDE_W, 0.09, strip_fill, None)
    add_chip(slide, MARGIN, 0.42, f"{name.upper()}   ·   {HAT_LABEL[hat_key]}", fill, txt,
             border=(BORDER if hat == "white" else None))
    add_text(slide, MARGIN, 0.8, CONTENT_W, 0.7, title, size=26, font=TITLE_FONT, color=NAVY)
    add_rect(slide, MARGIN, 1.52, 0.9, 0.035, ACCENT, None)
    if subtitle:
        add_text(slide, MARGIN, 1.62, CONTENT_W, 0.32, subtitle, size=12, color=MUTED, italic=True)


def footer(slide, n, total):
    add_text(slide, MARGIN, 7.08, 10, 0.28, FOOTER_TEXT, size=9, color=MUTED)
    add_text(slide, SLIDE_W - MARGIN - 1.2, 7.08, 1.2, 0.28, f"{n} / {total}", size=9, color=MUTED,
             align=PP_ALIGN.RIGHT)


def set_notes(slide, text):
    slide.notes_slide.notes_text_frame.text = text


def new_slide(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    bg = slide.background.fill
    bg.solid()
    bg.fore_color.rgb = CREAM
    return slide


# --------------------------------------------------------------------------------------
# Word-for-word script (single source for the speaker notes and the DOCX)
# --------------------------------------------------------------------------------------
SCRIPT = [
    {
        "slide": 1, "hat": "Blue hat", "title": "Title slide", "speaker": "Speaker 1", "minutes": 0.5,
        "text": (
            "[Stand centre-stage; smile; wait for silence.]\n"
            "Good morning, everyone. We are Group [number], and our case study is topic eight: "
            "Dealing with Garbage — Singapore, Indore and Delhi. Every city produces garbage; very few manage it well. "
            "We chose three cities with very different budgets, very different technologies and — most importantly — "
            "very different results. Over the next fifteen minutes we will take you through this case using the "
            "Six Thinking Hats, in the order you see on the next slide."
        ),
    },
    {
        "slide": 2, "hat": "Blue hat", "title": "How we will think about it", "speaker": "Speaker 1", "minutes": 0.5,
        "text": (
            "Here is our route. Blue hat: we define the problem. White hat: facts and figures. Red hat: the emotions "
            "of the people affected. Black hat: critical and legal analysis. Green hat: sustainability and the SDGs. "
            "And we return to the Blue hat to close with our opinion, our learnings, and what can actually be done — "
            "or sold. Each of us takes one hat, and every number we quote comes from an official or institutional "
            "source — UNEP, the World Bank, CPCB, the ministries, NEA Singapore, the courts — not from media reports."
        ),
    },
    {
        "slide": 3, "hat": "Blue hat", "title": "The case and the problem statement", "speaker": "Speaker 1", "minutes": 1.25,
        "text": (
            "Let us define the case. Garbage is the most visible failure of a city — and also the most fixable. "
            "Urban India generates about one lakh sixty thousand tonnes of municipal solid waste every day. "
            "Ninety-five per cent of it is collected, but only about half is scientifically treated; the rest is "
            "landfilled or simply unaccounted for. The result: garbage mountains, landfill fires, leachate in "
            "groundwater and methane in the air.\n"
            "So our problem statement is this: why do some cities solve garbage, while others with more money and "
            "more technology do not? To answer it, we compare three different answers to the same problem. "
            "Singapore — the engineered answer: incinerate almost everything, landfill only the ash, enforce the law "
            "strictly. Indore — the behavioural answer: segregate at every doorstep, process locally, keep the system "
            "low-tech and highly disciplined. And Delhi — the unfinished answer: four waste-to-energy plants, and yet "
            "three of the tallest garbage mountains in the country. "
            "[Turn to Speaker 2.] {Speaker 2}, the facts, please."
        ),
    },
    {
        "slide": 4, "hat": "White hat", "title": "The big picture", "speaker": "Speaker 2", "minutes": 1.0,
        "text": (
            "Thank you. Four numbers set the scale. First, the world generated about 2.1 billion tonnes of municipal "
            "solid waste in 2023, and UNEP projects 3.8 billion tonnes by 2050. The World Bank estimates at least a "
            "third of it is mismanaged.\n"
            "Second, India. According to CPCB's 2020–21 report, urban India generates about 1.6 lakh tonnes a day, "
            "and 95 per cent of it is collected. Collection is not our problem.\n"
            "Third, treatment. Only 50 per cent is scientifically treated; 18 per cent goes to landfills; and nearly "
            "32 per cent is unaccounted for — it is lying somewhere.\n"
            "Fourth, the legacy. The Ministry of Housing and Urban Affairs counts about 2,400 old dumpsites holding "
            "16 crore tonnes of waste on 15,000 acres of land. And note the climate link at the bottom: waste is about "
            "five per cent of global greenhouse emissions, but about one-fifth of all human-caused methane."
        ),
    },
    {
        "slide": 5, "hat": "White hat", "title": "Three cities, side by side", "speaker": "Speaker 2", "minutes": 1.25,
        "text": (
            "Now the three cities, side by side. [Point to each column as you go.]\n"
            "Singapore: six million people, about 6.9 million tonnes of waste a year across all streams. 52 per cent "
            "is recycled; everything else is incinerated in four waste-to-energy plants, and only the ash — about two "
            "thousand tonnes a day — goes to Semakau, an engineered offshore landfill. Nothing is dumped in the open, "
            "and one agency, the NEA, runs the whole system.\n"
            "Indore: about 3.5 million people, roughly 1,200 tonnes a day. One hundred per cent door-to-door "
            "collection, six-way segregation at the doorstep, and almost nothing reaches a dumpsite. Indore was "
            "India's cleanest city seven years in a row.\n"
            "Delhi: over two crore people, about 11,000 tonnes a day. Processing capacity, as the MCD told the "
            "Supreme Court in 2024, is about 8,000 tonnes — so roughly 3,000 tonnes a day still goes to Ghazipur, "
            "Bhalswa and Okhla, which hold about 280 lakh tonnes of legacy waste. Ghazipur peaked at about 65 metres "
            "— nearly the height of the Qutub Minar. Delhi ranked 90th in Swachh Survekshan 2023."
        ),
    },
    {
        "slide": 6, "hat": "White hat", "title": "Where the waste ends up", "speaker": "Speaker 2", "minutes": 0.5,
        "text": (
            "One picture summarises it: the share of waste that is scientifically processed versus dumped. Singapore "
            "and Indore are both near one hundred per cent — by completely different routes: Singapore through "
            "incineration, Indore through segregation and composting. Delhi processes about three-quarters; India as "
            "a whole, about half. The point to carry forward: Indore reaches Singapore's outcome at a fraction of the "
            "cost and the technology. [Turn to Speaker 3.] Over to {Speaker 3} for the people behind these numbers."
        ),
    },
    {
        "slide": 7, "hat": "Red hat", "title": "Stakeholder impact mapping", "speaker": "Speaker 3", "minutes": 2.0,
        "text": (
            "Thank you. Numbers do not burn; people do. The Red hat asks: who feels this, and what do they feel?\n"
            "First, the residents around Delhi's landfills. In September 2017 a section of the Ghazipur mountain "
            "collapsed and killed two people. In 2022, and again in 2024, Ghazipur and Bhalswa burned for days. For "
            "families living a few hundred metres away the emotion is fear — and after years of missed deadlines, "
            "anger and helplessness.\n"
            "Second, the informal waste pickers — an estimated 1.5 to 4 million people in India. They do the "
            "recycling nobody pays for, and they feel invisible. Indore actually integrated them — identity cards, "
            "safety gear and jobs at the dry-waste facility. There, the emotion is dignity.\n"
            "Third, the sanitation workers. Indore celebrated its safai mitras publicly, and 'Indore Number One' "
            "became a civic identity — pride. In Delhi the same job carries stigma and exhaustion.\n"
            "Fourth, households. Singaporeans feel trust and convenience — the chute takes the bag away — but also "
            "complacency: domestic recycling is only 12 per cent. Delhi households feel fatigue: 'why segregate if "
            "the truck mixes it anyway?'\n"
            "And the officials and courts: frustration in Delhi, where the same deadlines return every year; "
            "ownership in Indore and Singapore, where one agency is clearly accountable.\n"
            "The pattern is simple. Where the system works, the dominant emotions are pride and trust. Where it "
            "fails, fear and fatigue. That is the real lever. [Turn to Speaker 4.] {Speaker 4} now puts on the Black hat."
        ),
    },
    {
        "slide": 8, "hat": "Black hat", "title": "Critical analysis", "speaker": "Speaker 4", "minutes": 1.5,
        "text": (
            "Thank you. The Black hat is the sceptic, so let us be critical of all three.\n"
            "Delhi first. The core failure is arithmetic: 11,000 tonnes in, 8,000 tonnes of capacity. Second, "
            "segregation is low, so the waste-to-energy plants burn mixed, wet, low-calorific waste — inefficient, "
            "and a source of emission concerns. Delhi's very first plant, at Timarpur in 1987, failed within weeks "
            "for this very reason. Third, governance is fragmented — the MCD, the NDMC, the Cantonment Board, the DDA, "
            "the Delhi government and the Centre each own a piece of the problem, so nobody owns the outcome.\n"
            "Indore, honestly. The model depends on sustained administrative will — a strong commissioner, daily "
            "monitoring and spot fines. Six-stream collection costs money, and part of the economics rests on "
            "carbon credits and PPP premiums that depend on markets. And it is unproven at megacity scale.\n"
            "Singapore. Incineration is a lock-in: the plants need a steady supply of garbage, and they emit CO2. "
            "Domestic recycling is stuck near 12 per cent. Semakau will be full by 2035. And the whole model costs "
            "what only a rich city-state can afford."
        ),
    },
    {
        "slide": 9, "hat": "Black hat", "title": "Legal issues", "speaker": "Speaker 4", "minutes": 1.5,
        "text": (
            "Now the law. India does not lack law; it lacks enforcement. The 74th Amendment makes solid waste a "
            "municipal function. In the Almitra Patel case, filed in 1996, the Supreme Court treated clean "
            "surroundings as part of the right to life under Article 21, and that case produced the first Municipal "
            "Solid Waste Rules in 2000. Today we have the Solid Waste Management Rules, 2016: segregation at source, "
            "user fees and spot fines, on-site processing by bulk generators, integration of waste pickers, and "
            "landfills only for inert residue. The compliance deadline was 2018. The Plastic Waste Rules added the "
            "2022 single-use plastic ban and extended producer responsibility.\n"
            "What happens when the law is ignored? In October 2022 the National Green Tribunal imposed 900 crore "
            "rupees of environmental compensation on the Delhi government for the three landfills. In 2024 the "
            "Supreme Court recorded that 3,000 tonnes a day still goes untreated.\n"
            "Singapore's law is shorter — but enforced. Littering fines of up to 2,000 dollars, Corrective Work "
            "Orders since 1992, and the Resource Sustainability Act of 2019: e-waste producer responsibility, "
            "packaging reporting, food-waste segregation, a bag charge and, from 2026, a bottle deposit. A rule that "
            "is not enforced is only a suggestion. [Turn to Speaker 5.] Over to {Speaker 5} for the Green hat."
        ),
    },
    {
        "slide": 10, "hat": "Green hat", "title": "Sustainability and the SDGs", "speaker": "Speaker 5", "minutes": 2.0,
        "text": (
            "Thank you. The Green hat asks: what is the sustainable path, and how does it map to the SDGs?\n"
            "Garbage touches at least seven goals. SDG 11.6 is the direct one — its indicator is literally the share "
            "of waste managed in controlled facilities. SDG 12 covers food waste and recycling. SDG 13, climate — the "
            "waste sector is about one-fifth of human-caused methane, and methane is roughly eighty times more potent "
            "than CO2 over twenty years. SDGs 3 and 6 — health and water — through fires and leachate. SDG 7 through "
            "bio-CNG. SDG 8 — decent work for waste pickers.\n"
            "Each city also has a genuinely green story. Indore's bio-CNG plant at Devguradia takes 550 tonnes of "
            "wet waste a day and turns it into about 17,000 kilograms of bio-CNG and 100 tonnes of compost. Built as a "
            "PPP for about 150 crore rupees, it pays the city a premium, fuels buses at five rupees below market, and "
            "avoids about 1.3 lakh tonnes of CO2 a year. Indore also bio-mined its 100-acre legacy dump — 13 to 15 "
            "lakh tonnes — in about six months, for about 10 crore rupees.\n"
            "Singapore turns incineration ash into a construction material called NEWSand; Semakau is a mangrove and "
            "coral habitat open to the public; and the Zero Waste Masterplan targets 70 per cent recycling by 2030.\n"
            "Delhi's green opportunity is the largest of all: three landfills on roughly 200 acres. Bio-mining under "
            "Swachh Bharat Mission Urban 2.0 can return that land and stop the methane — if it is actually done. "
            "[Turn to Speaker 6.] {Speaker 6} will close the case."
        ),
    },
    {
        "slide": 11, "hat": "Blue hat", "title": "Our opinion and five learnings", "speaker": "Speaker 6", "minutes": 1.25,
        "text": (
            "Thank you. Let me put the Blue hat back on and close the case.\n"
            "Our group's opinion in one line: garbage is not a technology problem; it is a habit-and-governance "
            "problem with a technology component. Delhi has more plants than Indore and worse results. Indore reaches "
            "Singapore's outcome without a single incinerator.\n"
            "Five learnings. One: segregation at source is the hinge — everything downstream depends on it. Two: one "
            "accountable agency with daily data beats six agencies with annual reports. Three: enforcement must be "
            "credible and consistent, and it works best when paired with pride, not just penalties. Four: "
            "decentralise processing, centralise standards — treat wet waste close to where it is produced, and "
            "reserve landfills for inert residue. Five: legacy is fixable — and the cost of inaction, 900 crore in "
            "penalties, fires and lives, is far higher than the cost of action."
        ),
    },
    {
        "slide": 12, "hat": "Blue hat", "title": "Interventions and commercialisation", "speaker": "Speaker 6", "minutes": 1.5,
        "text": (
            "So, what can be done — and what can be sold?\n"
            "Three interventions. First, an 'Indore-in-a-box' kit for mid-sized cities, funded under SBM-Urban 2.0: "
            "SOPs, a GPS-tracked fleet, six-bin collection and a bio-methanation unit. Second, a methane-first legacy "
            "programme — bio-mine the dumpsites, capture the gas, and finance it partly with carbon credits. Third, "
            "for Delhi: ward-level enforcement of segregation, decentralised bio-CNG at mandis and hotels, "
            "waste-to-energy only for genuinely non-recyclable residue, and one empowered waste authority.\n"
            "Four ways to commercialise this knowledge — ideas our batch could actually start. Biogas-as-a-service "
            "for hostels, hotels and mandis — the bulk generators the law already obligates. A digital "
            "material-recovery platform that formalises waste pickers and generates EPR credits for brands. A "
            "carbon-credit advisory for municipal corporations, modelled on Indore. And a campus pilot — three-bin "
            "segregation and a mess-waste biogas unit at IIT Delhi — measurable within one semester.\n"
            "To close: three cities, one lesson. Singapore shows what engineering and enforcement can buy. Delhi "
            "shows that hardware without habits fails. And Indore shows that an Indian city, on an Indian budget, "
            "can get it right. [Pause.] Thank you — we are happy to take questions."
        ),
    },
    {
        "slide": 13, "hat": "—", "title": "Thank you / references", "speaker": "All", "minutes": 0.0,
        "text": "[No narration. Stay on this slide during questions; the reference list is visible to the panel.]",
    },
]

QA_PREP = [
    ("Isn't waste-to-energy the obvious solution for a megacity like Delhi?",
     "Only for dry, non-recyclable residue after segregation. Indian waste is wet and low-calorific, so burning "
     "mixed waste is inefficient and polluting — Delhi's Timarpur plant failed in 1987 for exactly this reason, and "
     "CPCB and NITI Aayog both place WTE below composting and recycling in the waste hierarchy."),
    ("Can the Indore model really scale to Delhi?",
     "The principles scale — segregation, one accountable owner, daily data, credible enforcement. The implementation "
     "has to be ward-wise: treat Delhi as 250 Indores, not one. The binding constraint is governance, not size."),
    ("Why compare with Singapore at all? It is a rich city-state.",
     "Because it is the benchmark for enforcement and single-agency accountability, and because it shows the limits "
     "of pure engineering: 12% domestic recycling and a landfill that fills up by 2035."),
    ("Where would the money come from?",
     "SBM-Urban 2.0 has an outlay of about ₹1.41 lakh crore (2021–26); user charges; PPP concessions — Indore's "
     "bio-CNG plant was built with private capital and pays the city a premium; carbon finance; and the land value "
     "of remediated dumpsites."),
    ("What is worse: landfill methane or incinerator CO2?",
     "In the short term methane, about 80 times more potent than CO2 over 20 years, so open dumping is the worst "
     "option. But incineration locks in emissions and feedstock demand. The hierarchy is: reduce, segregate, "
     "compost or bio-methanate, recycle, and only then waste-to-energy, with landfill for inert residue."),
]

CUT_LIST = [
    "Slide 5 (Speaker 2): drop the Qutub Minar comparison and the Swachh Survekshan rank (saves ~15 s).",
    "Slide 7 (Speaker 3): drop the 'households' paragraph — the slide table still shows it (saves ~20 s).",
    "Slide 9 (Speaker 4): shorten the Singapore paragraph to 'Singapore's law is shorter — but enforced: littering "
    "fines, Corrective Work Orders and the Resource Sustainability Act of 2019' (saves ~20 s).",
    "Slide 10 (Speaker 5): drop the Singapore paragraph; it is on the slide (saves ~15 s).",
    "Slide 12 (Speaker 6): drop the Delhi-specific intervention sentence (saves ~15 s).",
]


def spoken_words(text: str) -> int:
    clean = re.sub(r"\[[^\]]*\]", " ", text)
    return len(re.findall(r"[A-Za-z0-9₹%'’\-\.]+", clean))


# --------------------------------------------------------------------------------------
# Slides
# --------------------------------------------------------------------------------------
TOTAL = len(SCRIPT)


def slide_01_title(prs):
    s = new_slide(prs)
    panel_x = 8.75
    add_rect(s, panel_x, 0, SLIDE_W - panel_x, SLIDE_H, NAVY, None)
    add_rect(s, 0, 0, panel_x, 0.09, ACCENT, None)

    add_chip(s, 0.8, 1.55, "NEN 300   ·   CASE STUDY   ·   TOPIC 08", NAVY, WHITE)
    add_text(s, 0.8, 2.1, 7.6, 1.6, "Dealing with\nGarbage", size=54, font=TITLE_FONT, color=NAVY, spacing=0.95)
    add_text(s, 0.8, 4.05, 7.6, 0.5, "Singapore  ·  Indore  ·  Delhi", size=24, font=TITLE_FONT, color=ACCENT)
    add_text(s, 0.8, 4.6, 7.4, 0.5, "Three cities, three answers to the same problem", size=17, color=MUTED,
             italic=True)
    add_rect(s, 0.8, 5.45, 0.9, 0.035, ACCENT, None)
    add_text(s, 0.8, 5.6, 7.6, 1.0, [
        [("Group [ __ ]  ·  [ Member names ]", {"bold": True, "color": INK})],
        [("Indian Institute of Technology Delhi  ·  NEN 300  ·  [ Date ]", {"color": MUTED})],
    ], size=12.5, spacing=1.2)

    blocks = [
        ("SINGAPORE", "The engineered answer", "Burn almost everything, landfill only the ash,\nenforce the law."),
        ("INDORE", "The behavioural answer", "Segregate at every doorstep, process locally,\nkeep it low-tech and disciplined."),
        ("DELHI", "The unfinished answer", "Four waste-to-energy plants, three garbage\nmountains, 3,000 tonnes a day untreated."),
    ]
    y = 1.55
    for i, (city, head, line) in enumerate(blocks):
        add_text(s, panel_x + 0.55, y, 3.6, 0.3, [[(city, {"spc": 200})]], size=10, color=RGBColor(0x9F, 0xD6, 0xD3),
                 bold=True)
        add_text(s, panel_x + 0.55, y + 0.32, 3.7, 0.45, head, size=18, font=TITLE_FONT, color=WHITE)
        add_text(s, panel_x + 0.55, y + 0.82, 3.7, 0.7, line, size=11.5, color=RGBColor(0xC9, 0xD1, 0xDB), spacing=1.1)
        if i < 2:
            add_rect(s, panel_x + 0.55, y + 1.62, 3.4, 0.01, RGBColor(0x3A, 0x4A, 0x62), None)
        y += 1.85
    set_notes(s, SCRIPT[0]["text"])
    return s


def slide_02_roadmap(prs):
    s = new_slide(prs)
    header(s, "blue", "How we will think about it",
           "Six Thinking Hats · six speakers · 15 minutes — the same order the course brief asks for")
    hats = [
        ("blue", "Define the case", "Problem statement and the three cities", "Speaker 1", "2 min"),
        ("white", "Facts & figures", "Global, Indian and city-level data", "Speaker 2", "3 min"),
        ("red", "Emotions", "Stakeholder impact mapping", "Speaker 3", "2 min"),
        ("black", "Critical analysis", "What fails, and the legal issues", "Speaker 4", "3 min"),
        ("green", "Sustainability", "SDG mapping and circular-economy wins", "Speaker 5", "2 min"),
        ("blue", "Close the case", "Opinion, learnings, interventions, commercialisation", "Speaker 6", "3 min"),
    ]
    gap = 0.12
    w = (CONTENT_W - gap * 5) / 6
    y, h = 2.2, 3.55
    inset = 0.24
    for i, (key, name, desc, who, mins) in enumerate(hats):
        x = MARGIN + i * (w + gap)
        _, fill, _ = HATS[key]
        card(s, x, y, w, h)
        add_oval(s, x + inset, y + 0.35, 0.5, fill, line=(BORDER if key == "white" else None))
        add_text(s, x + inset, y + 1.05, w - 2 * inset, 0.35, f"0{i + 1}", size=10, color=MUTED, bold=True)
        add_text(s, x + inset, y + 1.32, w - 2 * inset + 0.08, 0.5, name, size=14, font=TITLE_FONT, color=NAVY)
        add_text(s, x + inset, y + 1.9, w - 2 * inset, 0.9, desc, size=11.5, color=INK, spacing=1.1)
        add_rect(s, x + inset, y + 2.8, w - 2 * inset, 0.01, BORDER, None)
        add_text(s, x + inset, y + 2.9, w - 2 * inset, 0.5,
                 [[(who, {"bold": True, "color": ACCENT})], [(mins, {"color": MUTED})]], size=11, spacing=1.15)
    add_text(s, MARGIN, 6.15, CONTENT_W, 0.7,
             "Evidence rule: every figure comes from UNEP, the World Bank, CPCB, MoHUA, MoEFCC, PIB, NITI Aayog–CSE, "
             "NEA Singapore, or Supreme Court / NGT records. Media reports are used only to date events.",
             size=11, color=MUTED, italic=True)
    footer(s, 2, TOTAL)
    set_notes(s, SCRIPT[1]["text"])


def slide_03_case(prs):
    s = new_slide(prs)
    header(s, "blue", "The case: why do some cities solve garbage, and others do not?")
    # Problem statement card
    x, y, w, h = MARGIN, 2.0, 6.3, 4.05
    card(s, x, y, w, h, accent=HATS["blue"][1])
    add_text(s, x + 0.45, y + 0.3, w - 0.8, 0.3, [[("PROBLEM STATEMENT", {"spc": 160})]], size=10, color=ACCENT, bold=True)
    add_text(s, x + 0.45, y + 0.65, w - 0.8, 1.9, [
        "Urban India generates ≈ 1.6 lakh tonnes of municipal solid waste a day. About 95% is collected, but only "
        "≈ 50% is scientifically treated — the rest is landfilled or unaccounted for.",
        "The result is visible from any flyover: garbage mountains, landfill fires, leachate in groundwater, "
        "methane in the air.",
    ], size=13, color=INK, spacing=1.12, space_after=8)
    add_rect(s, x + 0.45, y + 2.6, w - 0.9, 0.01, BORDER, None)
    add_text(s, x + 0.45, y + 2.75, w - 0.8, 0.3, [[("THE QUESTION WE ANSWER", {"spc": 160})]], size=10, color=ACCENT, bold=True)
    add_text(s, x + 0.45, y + 3.08, w - 0.8, 0.9,
             "What actually makes a city's waste system work — technology, money, or behaviour and governance?",
             size=14.5, font=TITLE_FONT, color=NAVY, spacing=1.1)

    # City cards
    cx = MARGIN + 6.3 + 0.3
    cw = SLIDE_W - MARGIN - cx
    cities = [
        ("Singapore", "The engineered answer",
         "Recycle 52%, incinerate the rest in four waste-to-energy plants, landfill only the ash offshore. "
         "One agency (NEA), strict enforcement."),
        ("Indore", "The behavioural answer",
         "100% door-to-door collection, six-way segregation at the doorstep, compost and bio-CNG. "
         "Low-tech, high discipline, one municipal owner."),
        ("Delhi", "The unfinished answer",
         "Four waste-to-energy plants, yet ≈ 3,000 t/day still dumped on three legacy landfills. "
         "Six agencies share the job."),
    ]
    ch = 1.25
    for i, (city, tag, desc) in enumerate(cities):
        cy = 2.0 + i * (ch + 0.15)
        card(s, cx, cy, cw, ch)
        add_text(s, cx + 0.3, cy + 0.18, 1.6, 0.4, city, size=15, font=TITLE_FONT, color=NAVY)
        add_text(s, cx + 0.3, cy + 0.58, 1.7, 0.5, tag, size=10, color=ACCENT, bold=True, spacing=1.1)
        add_text(s, cx + 2.0, cy + 0.16, cw - 2.3, ch - 0.25, desc, size=11.5, color=INK, spacing=1.1)
    add_text(s, MARGIN, 6.25, CONTENT_W, 0.5,
             "Why these three? Same problem — three budgets, three governance models, three outcomes.",
             size=12, color=MUTED, italic=True)
    footer(s, 3, TOTAL)
    set_notes(s, SCRIPT[2]["text"])


def slide_04_big_picture(prs):
    s = new_slide(prs)
    header(s, "white", "The big picture: almost everything is collected, only half is treated")
    cards = [
        ("2.1 bn", "tonnes of municipal waste a year, worldwide",
         "Generated in 2023 — heading to 3.8 bn tonnes by 2050.",
         "UNEP, Global Waste Management Outlook 2024"),
        ("1.6 lakh", "tonnes a day, urban India",
         "≈ 95% of it is collected — collection is not the problem.",
         "CPCB, Annual Report on SWM Rules 2020–21"),
        ("50%", "scientifically treated",
         "18% is landfilled and ≈ 32% is unaccounted for.",
         "CPCB, 2020–21"),
        ("16 crore", "tonnes of legacy waste",
         "Lying in ≈ 2,400 old dumpsites on ≈ 15,000 acres of land.",
         "MoHUA, Swachh Bharat Mission-Urban 2.0"),
    ]
    gap = 0.22
    w = (CONTENT_W - gap * 3) / 4
    y, h = 2.05, 3.3
    for i, (num, unit, desc, src) in enumerate(cards):
        x = MARGIN + i * (w + gap)
        card(s, x, y, w, h)
        add_text(s, x + 0.32, y + 0.3, w - 0.5, 0.75, num, size=36, font=TITLE_FONT, color=ACCENT)
        add_text(s, x + 0.32, y + 1.05, w - 0.6, 0.5, unit, size=11, color=MUTED, spacing=1.05)
        add_rect(s, x + 0.32, y + 1.62, 0.5, 0.03, NAVY, None)
        add_text(s, x + 0.32, y + 1.78, w - 0.6, 0.9, desc, size=12.5, color=INK, spacing=1.12)
        add_text(s, x + 0.32, y + 2.7, w - 0.6, 0.5, src, size=9.5, color=MUTED, italic=True, spacing=1.05)
    # climate strip
    add_rect(s, MARGIN, 5.55, CONTENT_W, 0.95, ACCENT_SOFT, None, rounded=True, radius=0.12)
    add_text(s, MARGIN + 0.35, 5.55, CONTENT_W - 0.7, 0.95, [[
        ("The climate link.  ", {"bold": True, "color": NAVY}),
        ("Waste is ≈ 5% of global greenhouse-gas emissions (World Bank, What a Waste 2.0, 2018) but ≈ 20% of "
         "human-caused methane (UNEP / CCAC Global Methane Assessment, 2021) — and methane is ≈ 80× more potent "
         "than CO₂ over 20 years.", {}),
    ]], size=12.5, color=INK, anchor=MSO_ANCHOR.MIDDLE, spacing=1.12)
    footer(s, 4, TOTAL)
    set_notes(s, SCRIPT[3]["text"])


def slide_05_table(prs):
    s = new_slide(prs)
    header(s, "white", "Three cities, side by side")
    rows = [
        ["", "Singapore", "Indore", "Delhi"],
        ["People", "≈ 6.0 million (2024)", "≈ 3.5 million (est.)", "≈ 2 crore+ (NCT)"],
        ["Waste generated", "≈ 6.9 million t / year, all streams (≈ 18,800 t / day)", "≈ 1,200 t / day", "≈ 11,000 t / day"],
        ["Segregation at source", "Commingled recycling bins; domestic recycling rate only 12%",
         "100% door-to-door; six-stream segregation at the doorstep", "Low and inconsistent; mostly mixed waste"],
        ["Main processing route", "52% recycled; the rest incinerated in 4 waste-to-energy plants",
         "Compost + bio-CNG (wet); material recovery facility (dry)",
         "4 waste-to-energy plants (≈ 7,250 t / day) + limited composting"],
        ["What reaches the landfill", "≈ 2,000 t / day of ash and non-incinerables → Semakau (engineered, offshore)",
         "Near zero; 100-acre legacy dump remediated in 2018–19",
         "≈ 3,000 t / day untreated + ≈ 280 lakh t legacy at 3 sites (2019)"],
        ["Who is accountable", "One agency: National Environment Agency", "One body: Indore Municipal Corporation",
         "MCD, NDMC, Cantonment Board, DDA, Delhi Govt, Centre"],
        ["Headline", "Only landfill full by ≈ 2035",
         "Cleanest city 7× in a row (2017–23); Super Swachh League 2024–25",
         "Rank 90 of 446, Swachh Survekshan 2023; ₹900 crore NGT compensation (2022)"],
    ]
    add_table(s, MARGIN, 1.9, CONTENT_W, rows, [2.05, 3.36, 3.36, 3.36], size=11, header_size=12,
              row_heights=[0.42] + [0.54] * 7)
    add_text(s, MARGIN, 6.3, CONTENT_W, 0.6,
             "Sources: NEA Singapore, Waste Statistics 2023; Indore Municipal Corporation and NITI Aayog–CSE, "
             "Waste-Wise Cities (2021); MCD figures recorded by the Supreme Court (M.C. Mehta, 2024); MoHUA Swachh "
             "Survekshan; NGT order, Oct 2022. Singapore's total covers all waste streams, so it is not directly "
             "comparable with Indian municipal figures.",
             size=9.5, color=MUTED, italic=True, spacing=1.1)
    footer(s, 5, TOTAL)
    set_notes(s, SCRIPT[4]["text"])


def slide_06_chart(prs):
    s = new_slide(prs)
    header(s, "white", "Where the waste ends up",
           "Share of waste scientifically processed (recycled, composted, bio-methanated or incinerated) versus dumped or unaccounted for")
    cd = CategoryChartData()
    cd.categories = ["Singapore (NEA, 2023)", "Indore (IMC, 2023)", "Delhi (MCD to SC, 2024)", "India average (CPCB, 2020–21)"]
    cd.add_series("Scientifically processed", (100, 100, 73, 50))
    cd.add_series("Dumped / unaccounted", (None, None, 27, 50))
    gf = s.shapes.add_chart(XL_CHART_TYPE.BAR_STACKED_100, Inches(MARGIN), Inches(2.1), Inches(7.4), Inches(4.0), cd)
    ch = gf.chart
    ch.has_title = False
    ch.font.name = BODY_FONT
    ch.font.size = Pt(11)
    ch.font.color.rgb = INK
    ch.has_legend = True
    ch.legend.position = XL_LEGEND_POSITION.BOTTOM
    ch.legend.include_in_layout = False
    ch.legend.font.size = Pt(11)
    plot = ch.plots[0]
    plot.gap_width = 55
    plot.overlap = 100
    plot.has_data_labels = True
    dl = plot.data_labels
    dl.show_value = True
    dl.number_format = '0"%"'
    dl.number_format_is_linked = False
    dl.position = XL_LABEL_POSITION.CENTER
    dl.font.size = Pt(12)
    dl.font.bold = True
    dl.font.color.rgb = WHITE
    for ser, colour in zip(plot.series, (ACCENT, BRICK)):
        ser.format.fill.solid()
        ser.format.fill.fore_color.rgb = colour
        ser.format.line.fill.background()
    cat = ch.category_axis
    cat.reverse_order = True
    cat.has_major_gridlines = False
    cat.format.line.fill.background()
    cat.tick_labels.font.size = Pt(12)
    cat.tick_labels.font.color.rgb = NAVY
    val = ch.value_axis
    val.visible = False
    val.has_major_gridlines = False

    # Callouts
    cx = MARGIN + 7.4 + 0.35
    cw = SLIDE_W - MARGIN - cx
    notes = [
        ("Singapore", "52% recycled + 48% incinerated; the ash goes to an engineered offshore landfill. Zero open dumping."),
        ("Indore", "Compost, bio-CNG and dry-waste recovery; only inert residue to a sanitary landfill. Zero open dumping."),
        ("Delhi", "≈ 8,000 of ≈ 11,000 t / day processed (mostly incinerated); ≈ 3,000 t / day still dumped on legacy sites."),
    ]
    ch_h = 1.12
    for i, (city, txt) in enumerate(notes):
        cy = 2.1 + i * (ch_h + 0.14)
        card(s, cx, cy, cw, ch_h)
        add_text(s, cx + 0.3, cy + 0.15, cw - 0.5, 0.35, city, size=13, font=TITLE_FONT, color=NAVY)
        add_text(s, cx + 0.3, cy + 0.5, cw - 0.55, ch_h - 0.55, txt, size=10.5, color=INK, spacing=1.08)
    add_rect(s, MARGIN, 6.22, CONTENT_W, 0.6, ACCENT_SOFT, None, rounded=True, radius=0.15)
    add_text(s, MARGIN + 0.35, 6.22, CONTENT_W - 0.7, 0.6, [[
        ("Same outcome, very different price tag:  ", {"bold": True, "color": NAVY}),
        ("Indore reaches Singapore's result without a single incinerator.", {}),
    ]], size=12.5, color=INK, anchor=MSO_ANCHOR.MIDDLE)
    footer(s, 6, TOTAL)
    set_notes(s, SCRIPT[5]["text"])


def slide_07_stakeholders(prs):
    s = new_slide(prs)
    header(s, "red", "Stakeholder impact mapping: who feels this, and what do they feel?")
    rows = [
        ["Stakeholder", "How they are affected", "Dominant emotion"],
        ["Residents near landfills",
         "Ghazipur collapse (2017, two deaths); fires at Ghazipur and Bhalswa (2022, 2024); leachate, smell, "
         "respiratory illness, falling land value", "Fear → anger, helplessness"],
        ["Informal waste pickers\n(≈ 1.5–4 million in India)",
         "Do the real recycling, unpaid and unprotected; displaced by incineration. Indore gave ID cards, safety "
         "gear and jobs at its dry-waste facility", "Invisibility (Delhi) · Dignity (Indore)"],
        ["Sanitation workers", "Celebrated as 'safai mitras' in Indore; stigma, risk and exhaustion elsewhere",
         "Pride (Indore) · Neglect (Delhi)"],
        ["Households", "Singapore: chute convenience, yet only 12% domestic recycling. Delhi: 'why segregate if the "
         "truck mixes it anyway?'", "Trust / complacency · Fatigue"],
        ["Bulk generators & businesses", "Hotels, malls and RWAs above 100 kg / day must process on site; brands "
         "face extended producer responsibility", "Reluctance → opportunity"],
        ["Officials, courts & regulators", "Repeated deadlines; ₹900 crore NGT compensation; Supreme Court "
         "monitoring in Delhi", "Frustration (Delhi) · Ownership (Indore, Singapore)"],
    ]
    tw = 9.45
    add_table(s, MARGIN, 1.95, tw, rows, [2.15, 4.9, 2.4], size=10.5, header_size=11.5,
              row_heights=[0.4] + [0.74] * 6, header_fill=HATS["red"][1])
    # emotional read panel
    px = MARGIN + tw + 0.3
    pw = SLIDE_W - MARGIN - px
    add_text(s, px, 1.95, pw, 0.3, [[("EMOTIONAL READ", {"spc": 160})]], size=10, color=HATS["red"][1], bold=True)
    reads = [
        ("Delhi", "Fear & fatigue"),
        ("Indore", "Pride & ownership"),
        ("Singapore", "Trust & complacency"),
    ]
    for i, (city, feel) in enumerate(reads):
        cy = 2.35 + i * 1.02
        card(s, px, cy, pw, 0.88)
        add_text(s, px + 0.25, cy + 0.12, pw - 0.4, 0.3, city.upper(), size=9.5, color=MUTED, bold=True)
        add_text(s, px + 0.25, cy + 0.38, pw - 0.4, 0.45, feel, size=13.5, font=TITLE_FONT, color=NAVY)
    card(s, px, 5.5, pw, 1.3, fill=NAVY, border=None)
    add_text(s, px + 0.25, 5.5, pw - 0.45, 1.3,
             "Pattern: where the system works, people feel pride and trust. Where it fails, fear and fatigue.",
             size=11.5, color=WHITE, anchor=MSO_ANCHOR.MIDDLE, spacing=1.12)
    footer(s, 7, TOTAL)
    set_notes(s, SCRIPT[6]["text"])


def slide_08_critical(prs):
    s = new_slide(prs)
    header(s, "black", "Critical analysis: what is not working — in all three cities")
    cols = [
        ("Delhi", "The unfinished answer", [
            "Arithmetic: ≈ 11,000 t / day in, ≈ 8,000 t / day of capacity → ≈ 3,000 t / day dumped (Supreme Court, 2024).",
            "Low segregation: waste-to-energy plants burn wet, mixed, low-calorific waste — inefficient, emission "
            "concerns. Timarpur (1987) failed within weeks for this reason.",
            "Six agencies own a piece of the problem; nobody owns the outcome.",
            "Legacy-clearance deadlines missed repeatedly; ₹900 crore compensation (NGT, Oct 2022).",
        ]),
        ("Indore", "The behavioural answer", [
            "Rests on sustained administrative will: a strong commissioner, daily monitoring, spot fines.",
            "Six-stream collection is costly; the economics lean on PPP premiums and carbon-credit sales.",
            "Unproven at megacity scale, with large informal settlements.",
            "Risk for imitators: copying the campaign (jingles, rankings) rather than the system.",
        ]),
        ("Singapore", "The engineered answer", [
            "Incineration lock-in: plants need steady feedstock and emit CO₂.",
            "Domestic recycling stuck at ≈ 12%; recyclables largely exported, so exposed to import bans (China, 2018).",
            "Semakau — the only landfill — full by ≈ 2035.",
            "Affordable only for a rich city-state; not a template for Indian budgets.",
        ]),
    ]
    gap = 0.25
    w = (CONTENT_W - 2 * gap) / 3
    y, h = 2.0, 4.05
    for i, (city, tag, bullets) in enumerate(cols):
        x = MARGIN + i * (w + gap)
        card(s, x, y, w, h)
        add_text(s, x + 0.3, y + 0.25, w - 0.6, 0.4, city, size=17, font=TITLE_FONT, color=NAVY)
        add_text(s, x + 0.3, y + 0.65, w - 0.6, 0.3, tag, size=10, color=MUTED, italic=True)
        add_rect(s, x + 0.3, y + 1.0, w - 0.6, 0.01, BORDER, None)
        add_bullets(s, x + 0.3, y + 1.15, w - 0.6, h - 1.3, bullets, size=11.5, bullet_color=HATS["black"][1],
                    space_after=7)
    add_rect(s, MARGIN, 6.25, CONTENT_W, 0.6, NAVY, None, rounded=True, radius=0.15)
    add_text(s, MARGIN + 0.35, 6.25, CONTENT_W - 0.7, 0.6, [[
        ("Common thread:  ", {"bold": True}),
        ("the hardware is rarely the bottleneck — habits, incentives and institutions are.", {}),
    ]], size=12.5, color=WHITE, anchor=MSO_ANCHOR.MIDDLE)
    footer(s, 8, TOTAL)
    set_notes(s, SCRIPT[7]["text"])


def slide_09_legal(prs):
    s = new_slide(prs)
    header(s, "black", "Legal issues: India has the law — the gap is enforcement")
    # India timeline (left)
    lx, ly, lw, lh = MARGIN, 2.0, 6.15, 4.1
    card(s, lx, ly, lw, lh)
    add_text(s, lx + 0.3, ly + 0.22, lw - 0.6, 0.3, [[("INDIA — THE LAW EXISTS", {"spc": 160})]], size=10, color=ACCENT, bold=True)
    events = [
        ("1992", "74th Amendment: solid waste management becomes a municipal function (12th Schedule)."),
        ("1996", "Almitra H. Patel v. Union of India — Supreme Court reads clean surroundings into Article 21."),
        ("2000", "First Municipal Solid Waste Rules, a direct outcome of that case."),
        ("2016", "SWM Rules and Plastic Waste Rules under the Environment (Protection) Act 1986; compliance due 2018."),
        ("2021", "SBM-Urban 2.0: 'garbage-free cities', remediate every legacy dumpsite."),
        ("2022", "Single-use plastic ban; EPR for plastic packaging; NGT imposes ₹900 crore on Delhi (Oct)."),
        ("2024", "Supreme Court (M.C. Mehta): ≈ 3,000 t / day still untreated in Delhi."),
    ]
    line_x = lx + 0.95
    add_rect(s, line_x, ly + 0.72, 0.02, 3.1, RGBColor(0xC9, 0xC5, 0xBB), None)
    step = 0.49
    for i, (yr, txt) in enumerate(events):
        ey = ly + 0.62 + i * step
        add_text(s, lx + 0.3, ey, 0.55, 0.3, yr, size=11, color=NAVY, bold=True)
        add_oval(s, line_x - 0.055, ey + 0.08, 0.12, ACCENT)
        add_text(s, line_x + 0.25, ey, lw - 1.35, 0.45, txt, size=10.5, color=INK, spacing=1.05)

    # Right column: what the rules require + Singapore
    rx = lx + lw + 0.28
    rw = SLIDE_W - MARGIN - rx
    card(s, rx, ly, rw, 1.95)
    add_text(s, rx + 0.3, ly + 0.22, rw - 0.6, 0.3, [[("WHAT THE SWM RULES 2016 REQUIRE", {"spc": 160})]], size=10,
             color=ACCENT, bold=True)
    add_bullets(s, rx + 0.3, ly + 0.58, rw - 0.6, 1.3, [
        "Three-stream segregation at source; user fees and spot fines.",
        "Bulk generators (≥ 100 kg / day) process waste on site; waste pickers to be integrated.",
        "No open burning; landfills only for inert, non-recyclable residue.",
    ], size=10.5, space_after=3, bullet_color=HATS["black"][1])

    sy = ly + 1.95 + 0.2
    sh = lh - 1.95 - 0.2
    card(s, rx, sy, rw, sh)
    add_text(s, rx + 0.3, sy + 0.22, rw - 0.6, 0.3, [[("SINGAPORE — THE LAW IS ENFORCED", {"spc": 160})]], size=10,
             color=ACCENT, bold=True)
    add_bullets(s, rx + 0.3, sy + 0.58, rw - 0.6, sh - 0.7, [
        "Environmental Public Health Act: littering fines up to S$2,000 on first conviction; Corrective Work Orders since 1992.",
        "Resource Sustainability Act 2019: e-waste EPR (2021), packaging reporting (2021), food-waste segregation for "
        "large premises (2024).",
        "Disposable carrier-bag charge (2023); beverage-container deposit scheme (2026).",
    ], size=10.5, space_after=3, bullet_color=HATS["black"][1])

    add_rect(s, MARGIN, 6.28, CONTENT_W, 0.58, NAVY, None, rounded=True, radius=0.15)
    add_text(s, MARGIN + 0.35, 6.28, CONTENT_W - 0.7, 0.58, [[
        ("Law is not the gap.  ", {"bold": True}),
        ("Enforcement, institutional capacity and a single accountable owner are.", {}),
    ]], size=12.5, color=WHITE, anchor=MSO_ANCHOR.MIDDLE)
    footer(s, 9, TOTAL)
    set_notes(s, SCRIPT[8]["text"])


def slide_10_green(prs):
    s = new_slide(prs)
    header(s, "green", "Sustainability: the SDG map and three circular-economy wins")
    tiles = [
        (3, "Good health", "3.9 — deaths from pollution; landfill fires, leachate"),
        (6, "Clean water", "6.3 — leachate contaminates groundwater"),
        (7, "Clean energy", "7.2 — bio-CNG and waste-to-energy"),
        (8, "Decent work", "8.8 — safe, formal work for waste pickers"),
        (11, "Sustainable cities", "11.6 — waste managed in controlled facilities"),
        (12, "Responsible use", "12.3 food waste · 12.5 recycling"),
        (13, "Climate action", "Waste ≈ 20% of human-caused methane"),
    ]
    gap = 0.14
    w = (CONTENT_W - gap * 6) / 7
    y = 1.95
    for i, (num, name, link) in enumerate(tiles):
        x = MARGIN + i * (w + gap)
        colour = SDG_COLOURS[num]
        add_rect(s, x, y, w, 0.5, colour, None, rounded=True, radius=0.12)
        add_text(s, x + 0.15, y, w - 0.3, 0.5, f"SDG {num}", size=12, color=WHITE, bold=True, anchor=MSO_ANCHOR.MIDDLE)
        add_text(s, x + 0.02, y + 0.58, w - 0.04, 0.3, name, size=10.5, color=NAVY, bold=True)
        add_text(s, x + 0.02, y + 0.86, w - 0.04, 0.75, link, size=9.5, color=INK, spacing=1.05)

    wins = [
        ("Indore — waste to wealth", HATS["green"][1], [
            "Asia's largest bio-CNG plant (Devguradia, 2022): 550 t / day wet waste → ≈ 17,000 kg bio-CNG + 100 t compost daily.",
            "PPP of ≈ ₹150 crore; city earns a premium; buses fuelled at ₹5 / kg below market; ≈ 1.3 lakh t CO₂ avoided a year.",
            "100-acre legacy dump bio-mined (13–15 lakh t) in ≈ 6 months for ≈ ₹10 crore; now a city forest.",
        ], "PIB, Feb 2022; MoHUA"),
        ("Singapore — circular by design", ACCENT, [
            "Incineration ash processed into 'NEWSand' for construction.",
            "Semakau: mangroves and coral habitat, open to the public.",
            "Zero Waste Masterplan: 70% recycling and 30% less waste to landfill by 2030; Tuas Nexus (2026) pairs "
            "waste and used-water treatment, energy self-sufficient.",
        ], "NEA Singapore"),
        ("Delhi — the biggest opportunity", BRICK, [
            "Three landfills ≈ 200 acres of prime land; bio-mining under SBM-U 2.0 returns land and stops methane and fires.",
            "Four waste-to-energy plants (≈ 7,250 t / day) should burn only non-recyclable residue.",
            "Informal recyclers already divert a large share — formalise and protect them.",
        ], "MCD / Supreme Court records, 2024"),
    ]
    gap2 = 0.25
    cw = (CONTENT_W - 2 * gap2) / 3
    cy, chh = 3.72, 3.15
    for i, (title, colour, bullets, src) in enumerate(wins):
        x = MARGIN + i * (cw + gap2)
        card(s, x, cy, cw, chh, accent=colour)
        add_text(s, x + 0.45, cy + 0.22, cw - 0.75, 0.4, title, size=14, font=TITLE_FONT, color=NAVY)
        add_bullets(s, x + 0.45, cy + 0.68, cw - 0.75, chh - 1.05, bullets, size=10.5, space_after=4, bullet_color=colour)
        add_text(s, x + 0.45, cy + chh - 0.38, cw - 0.75, 0.3, f"Source: {src}", size=9, color=MUTED, italic=True)
    footer(s, 10, TOTAL)
    set_notes(s, SCRIPT[9]["text"])


def slide_11_opinion(prs):
    s = new_slide(prs)
    header(s, "blue_close", "Our opinion, and five learnings")
    add_rect(s, MARGIN, 1.95, CONTENT_W, 1.25, NAVY, None, rounded=True, radius=0.08)
    add_text(s, MARGIN + 0.5, 1.95, CONTENT_W - 1.0, 1.25, [
        [("Garbage is not a technology problem. ", {"color": WHITE}),
         ("It is a habit-and-governance problem with a technology component.", {"color": RGBColor(0x9F, 0xD6, 0xD3)})],
        [("Delhi has more plants than Indore and worse results. Indore reaches Singapore's outcome without a single incinerator.",
          {"size": 12, "color": RGBColor(0xC9, 0xD1, 0xDB), "font": BODY_FONT})],
    ], size=20, font=TITLE_FONT, anchor=MSO_ANCHOR.MIDDLE, spacing=1.15, space_after=6)

    learnings = [
        ("Segregation at source is the hinge",
         "Compost, bio-CNG, recycling and even incinerator efficiency all depend on it. Indore ≈ 100%; Delhi low."),
        ("One owner, daily data",
         "NEA and IMC own outcomes with GPS fleets, dashboards and citizen apps. Delhi has six agencies."),
        ("Enforcement, paired with pride",
         "Spot fines and littering laws work when tied to identity: 'Indore Number One', 'Keep Singapore Clean'."),
        ("Decentralise processing",
         "Centralise standards. Treat wet waste near its source; landfill only inert residue; waste-to-energy last, not first."),
        ("Legacy is fixable; inaction costs more",
         "Indore: 100 acres in 6 months for ≈ ₹10 crore. Delhi: ₹900 crore in compensation, fires, two lives."),
    ]
    gap = 0.16
    w = (CONTENT_W - gap * 4) / 5
    y, h = 3.5, 3.3
    for i, (head, body) in enumerate(learnings):
        x = MARGIN + i * (w + gap)
        card(s, x, y, w, h)
        add_text(s, x + 0.28, y + 0.25, 0.8, 0.6, f"0{i + 1}", size=26, font=TITLE_FONT, color=ACCENT)
        add_rect(s, x + 0.28, y + 0.95, 0.45, 0.03, NAVY, None)
        add_text(s, x + 0.28, y + 1.1, w - 0.45, 0.85, head, size=12.5, font=TITLE_FONT, color=NAVY, spacing=1.08)
        add_text(s, x + 0.28, y + 1.9, w - 0.45, 1.3, body, size=10.5, color=INK, spacing=1.1)
    footer(s, 11, TOTAL)
    set_notes(s, SCRIPT[10]["text"])


def slide_12_options(prs):
    s = new_slide(prs)
    header(s, "blue_close", "What can be done — and what can be sold")
    gap = 0.3
    w = (CONTENT_W - gap) / 2
    y, h = 2.0, 3.75
    # Interventions
    x = MARGIN
    card(s, x, y, w, h, accent=HATS["blue"][1])
    add_text(s, x + 0.45, y + 0.25, w - 0.8, 0.3, [[("OPTIONS FOR INTERVENTION — POLICY & PROGRAMMES", {"spc": 140})]],
             size=10, color=ACCENT, bold=True)
    add_bullets(s, x + 0.45, y + 0.7, w - 0.8, h - 0.9, [
        [("'Indore-in-a-box' for mid-sized cities. ", {"bold": True, "color": NAVY}),
         ("A replication kit funded under SBM-Urban 2.0: SOPs, GPS-tracked fleet, six-bin collection, a bio-methanation unit, a user-charge app.", {})],
        [("Methane-first legacy programme. ", {"bold": True, "color": NAVY}),
         ("Bio-mine the ≈ 2,400 dumpsites and capture gas, part-financed by carbon credits; land returned to the city.", {})],
        [("Delhi specifically. ", {"bold": True, "color": NAVY}),
         ("Ward-level segregation enforcement; decentralised bio-CNG at mandis and hotels; waste-to-energy only for "
          "non-recyclable residue; one empowered waste authority.", {})],
    ], size=12, space_after=10, spacing=1.1)
    # Commercialisation
    x = MARGIN + w + gap
    card(s, x, y, w, h, accent=ACCENT)
    add_text(s, x + 0.45, y + 0.25, w - 0.8, 0.3, [[("COMMERCIALISATION OF KNOWLEDGE — VENTURES", {"spc": 140})]],
             size=10, color=ACCENT, bold=True)
    add_bullets(s, x + 0.45, y + 0.7, w - 0.8, h - 0.9, [
        [("Biogas-as-a-service. ", {"bold": True, "color": NAVY}),
         ("Build-own-operate units for hostels, hotels and mandis — the bulk generators the law already obligates.", {})],
        [("Digital material-recovery platform. ", {"bold": True, "color": NAVY}),
         ("Formalises waste pickers; traceable EPR credits sold to brands.", {})],
        [("Carbon-credit advisory for municipal corporations. ", {"bold": True, "color": NAVY}),
         ("Modelled on Indore, the first Indian city to sell carbon credits from its waste operations (2023).", {})],
        [("Campus pilot at IIT Delhi. ", {"bold": True, "color": NAVY}),
         ("Three-bin segregation plus a mess-waste biogas unit — measurable within one semester.", {})],
    ], size=12, space_after=8, spacing=1.1)

    add_rect(s, MARGIN, 6.0, CONTENT_W, 0.8, NAVY, None, rounded=True, radius=0.12)
    add_text(s, MARGIN + 0.4, 6.0, CONTENT_W - 0.8, 0.8,
             "Singapore shows what engineering and enforcement can buy. Delhi shows that hardware without habits fails. "
             "Indore shows that an Indian city, on an Indian budget, can get it right.",
             size=12.5, font=TITLE_FONT, color=WHITE, anchor=MSO_ANCHOR.MIDDLE, spacing=1.1)
    footer(s, 12, TOTAL)
    set_notes(s, SCRIPT[11]["text"])


def slide_13_thanks(prs):
    s = new_slide(prs)
    panel_w = 5.4
    add_rect(s, 0, 0, panel_w, SLIDE_H, NAVY, None)
    add_rect(s, panel_w, 0, SLIDE_W - panel_w, 0.09, ACCENT, None)
    add_text(s, 0.8, 1.5, panel_w - 1.2, 1.0, "Thank you.", size=44, font=TITLE_FONT, color=WHITE)
    add_text(s, 0.8, 2.55, panel_w - 1.2, 0.5, "Questions and discussion", size=16, color=RGBColor(0x9F, 0xD6, 0xD3))
    add_rect(s, 0.8, 3.25, 0.9, 0.035, ACCENT, None)
    add_text(s, 0.8, 3.5, panel_w - 1.4, 1.3, [
        [("Group [ __ ]  ·  [ Member names ]", {"bold": True, "color": WHITE})],
        [("Indian Institute of Technology Delhi  ·  NEN 300", {"color": RGBColor(0xC9, 0xD1, 0xDB)})],
        [("Case study 08 — Dealing with Garbage", {"color": RGBColor(0xC9, 0xD1, 0xDB)})],
    ], size=12, spacing=1.3)
    add_text(s, 0.8, 5.6, panel_w - 1.4, 1.2,
             "Singapore engineers it. Indore organises it. Delhi is still deciding who owns it.",
             size=13, font=TITLE_FONT, color=RGBColor(0x9F, 0xD6, 0xD3), italic=True, spacing=1.15)

    refs = [
        "UNEP (2024). Global Waste Management Outlook 2024.",
        "World Bank (2018). What a Waste 2.0: A Global Snapshot of Solid Waste Management to 2050.",
        "CPCB (2022). Annual Report on Implementation of Solid Waste Management Rules, 2016 — 2020–21.",
        "MoEFCC. Solid Waste Management Rules, 2016; Plastic Waste Management (Amendment) Rules, 2021 and 2022.",
        "MoHUA. Swachh Bharat Mission-Urban 2.0 Guidelines (2021); Swachh Survekshan results 2017–2025.",
        "NITI Aayog and CSE (2021). Waste-Wise Cities: Best Practices in Municipal Solid Waste Management.",
        "PIB (Feb 2022). Inauguration of the Gobar-Dhan (Bio-CNG) plant, Indore.",
        "National Green Tribunal, order of October 2022 on compliance of SWM Rules in NCT of Delhi.",
        "Supreme Court of India. M.C. Mehta v. Union of India — orders of May 2024 on solid waste in Delhi; "
        "Almitra H. Patel v. Union of India, W.P.(C) 888/1996.",
        "NEA Singapore (2024). Waste Statistics and Overall Recycling 2023; Zero Waste Masterplan (2019); Semakau Landfill.",
        "UNEP and CCAC (2021). Global Methane Assessment.",
        "Planning Commission (2014). Report of the Task Force on Waste to Energy.",
    ]
    rx = panel_w + 0.7
    rw = SLIDE_W - MARGIN - rx
    add_text(s, rx, 1.0, rw, 0.3, [[("KEY REFERENCES", {"spc": 160})]], size=10, color=ACCENT, bold=True)
    add_rect(s, rx, 1.35, rw, 0.01, BORDER, None)
    add_bullets(s, rx, 1.5, rw, 5.4, refs, size=10, color=INK, space_after=5, spacing=1.05, bullet="–",
                bullet_color=MUTED, indent=0.15)
    add_text(s, rx, 7.08, rw, 0.28, f"{TOTAL} / {TOTAL}", size=9, color=MUTED, align=PP_ALIGN.RIGHT)
    set_notes(s, SCRIPT[12]["text"])


def build_pptx():
    prs = Presentation()
    prs.slide_width = Inches(SLIDE_W)
    prs.slide_height = Inches(SLIDE_H)
    slide_01_title(prs)
    slide_02_roadmap(prs)
    slide_03_case(prs)
    slide_04_big_picture(prs)
    slide_05_table(prs)
    slide_06_chart(prs)
    slide_07_stakeholders(prs)
    slide_08_critical(prs)
    slide_09_legal(prs)
    slide_10_green(prs)
    slide_11_opinion(prs)
    slide_12_options(prs)
    slide_13_thanks(prs)
    prs.save(PPTX_PATH)


# --------------------------------------------------------------------------------------
# Script document (DOCX)
# --------------------------------------------------------------------------------------
def build_docx():
    from docx import Document
    from docx.enum.table import WD_TABLE_ALIGNMENT
    from docx.oxml.ns import qn as dqn
    from docx.shared import Pt as DPt, RGBColor as DRGB, Inches as DIn

    navy = DRGB(0x1B, 0x2A, 0x41)
    accent = DRGB(0x0E, 0x7C, 0x7B)
    muted = DRGB(0x6B, 0x72, 0x80)

    doc = Document()
    for section in doc.sections:
        section.left_margin = section.right_margin = DIn(1.0)
        section.top_margin = section.bottom_margin = DIn(0.9)

    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = DPt(11.5)
    normal.element.rPr.rFonts.set(dqn("w:eastAsia"), "Calibri")
    normal.paragraph_format.space_after = DPt(6)
    normal.paragraph_format.line_spacing = 1.15
    for name, size in (("Title", 26), ("Heading 1", 16), ("Heading 2", 13)):
        st = doc.styles[name]
        st.font.name = "Georgia"
        st.font.size = DPt(size)
        st.font.color.rgb = navy
        st.font.bold = name != "Title"
        st.element.rPr.rFonts.set(dqn("w:eastAsia"), "Georgia")

    def para(text="", *, italic=False, bold=False, color=None, size=None, align=None, after=None):
        p = doc.add_paragraph()
        r = p.add_run(text)
        r.italic, r.bold = italic, bold
        if color is not None:
            r.font.color.rgb = color
        if size is not None:
            r.font.size = DPt(size)
        if align is not None:
            p.alignment = align
        if after is not None:
            p.paragraph_format.space_after = DPt(after)
        return p

    def script_paragraph(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = DPt(8)
        for seg in re.split(r"(\[[^\]]*\]|\{[^}]*\})", text):
            if not seg:
                continue
            r = p.add_run(seg)
            if seg.startswith("["):      # stage direction
                r.italic = True
                r.font.color.rgb = muted
            elif seg.startswith("{"):    # name placeholder
                r.bold = True
                r.font.color.rgb = accent
        return p

    total_words = sum(spoken_words(x["text"]) for x in SCRIPT)
    total_minutes = sum(x["minutes"] for x in SCRIPT)

    doc.add_paragraph("Dealing with Garbage: Singapore · Indore · Delhi", style="Title")
    para("NEN 300 · IIT Delhi · Case study 08 · Word-for-word presentation script", color=accent, size=13, after=2)
    para("Structure: Six Thinking Hats (Blue → White → Red → Black → Green → Blue) · 13 slides · 6 speakers · "
         "15 minutes maximum", color=muted, size=10.5)

    doc.add_paragraph("Before you start", style="Heading 1")
    for line in [
        f"The script is about {total_words:,} spoken words. At a steady presentation pace of ≈ 150 words per minute "
        f"that is ≈ {total_words / 150:.0f}–{total_words / 140:.0f} minutes, leaving one to two minutes of buffer for "
        "handovers and the first question. Rehearse once with a timer.",
        "Replace every {Speaker n} placeholder with the actual name, and fill in the group number, names and date on "
        "slides 1 and 13.",
        "One hat per speaker. If the group has fewer than six members, merge Speaker 1 and Speaker 6 (both Blue hat) "
        "first, then Speaker 2 and Speaker 3.",
        "Text in [square brackets] is a stage direction, not to be read aloud.",
        "The same script is embedded slide by slide in the PowerPoint speaker notes (View → Notes Page, or Presenter View).",
        "Only one chart and one table carry numbers; everything else is said, not read. Do not read the slides.",
    ]:
        doc.add_paragraph(line, style="List Bullet")

    doc.add_paragraph("Time plan", style="Heading 1")
    tbl = doc.add_table(rows=1, cols=5)
    tbl.style = "Table Grid"
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, head in enumerate(["Slide", "Hat", "Speaker", "Words", "Target time"]):
        cell = tbl.rows[0].cells[i]
        cell.text = ""
        run = cell.paragraphs[0].add_run(head)
        run.bold = True
        run.font.color.rgb = navy
    running = 0.0
    for item in SCRIPT:
        running += item["minutes"]
        row = tbl.add_row().cells
        row[0].text = f"{item['slide']} — {item['title']}"
        row[1].text = item["hat"]
        row[2].text = item["speaker"]
        row[3].text = str(spoken_words(item["text"])) if item["minutes"] else "—"
        row[4].text = f"{item['minutes']:g} min  (cum. {running:g})" if item["minutes"] else "Q&A"
    for row in tbl.rows:
        for cell in row.cells:
            for p in cell.paragraphs:
                p.paragraph_format.space_after = DPt(2)
                for r in p.runs:
                    r.font.size = DPt(10)
    para(f"Total speaking time budgeted: {total_minutes:.0f} minutes of the 15-minute slot.", italic=True, color=muted,
         size=10)

    doc.add_paragraph("The script", style="Heading 1")
    for item in SCRIPT:
        doc.add_paragraph(f"Slide {item['slide']} · {item['hat']} — {item['title']}", style="Heading 2")
        timing = f"{item['speaker']} · ≈ {item['minutes']:g} min · {spoken_words(item['text'])} words" if item["minutes"] \
            else item["speaker"]
        para(timing, italic=True, color=accent, size=10, after=4)
        for chunk in item["text"].split("\n"):
            script_paragraph(chunk)

    doc.add_paragraph("If you are running long", style="Heading 1")
    para("Check the clock when Speaker 4 starts (target: 6 minutes elapsed). If you are behind, cut in this order:",
         after=4)
    for line in CUT_LIST:
        doc.add_paragraph(line, style="List Number")

    doc.add_paragraph("Likely questions, short answers", style="Heading 1")
    for q, a in QA_PREP:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = DPt(2)
        r = p.add_run(q)
        r.bold = True
        r.font.color.rgb = navy
        para(a, after=10)

    doc.add_paragraph("Delivery notes", style="Heading 1")
    for line in [
        "Hand over by name and by hat ('[Name] now puts on the Black hat') — it shows the panel you followed the brief.",
        "Speaker 2 should point at the table columns while speaking; Speaker 3 should slow down on the Ghazipur line.",
        "When you say a number, say its source in the same breath ('CPCB says…', 'as the MCD told the Supreme Court…').",
        "Keep the last slide up during questions; the reference list answers the 'where is this from?' question for you.",
    ]:
        doc.add_paragraph(line, style="List Bullet")

    doc.save(DOCX_PATH)


if __name__ == "__main__":
    build_pptx()
    build_docx()
    words = [(x["slide"], x["speaker"], spoken_words(x["text"]), x["minutes"]) for x in SCRIPT]
    total = sum(w for _, _, w, _ in words)
    print(f"Wrote {PPTX_PATH.name} ({TOTAL} slides) and {DOCX_PATH.name}")
    for slide_no, speaker, n, mins in words:
        print(f"  slide {slide_no:>2}  {speaker:<10} {n:>4} words  (budget {mins:g} min)")
    print(f"  total {total} words  ≈ {total / 150:.1f} min @150 wpm, {total / 140:.1f} min @140 wpm")
