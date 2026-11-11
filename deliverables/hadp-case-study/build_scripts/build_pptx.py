"""Build the one-slide HADP deck on the GDi template (title + content + closing slide)."""
import json, copy
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION, XL_LABEL_POSITION, XL_TICK_LABEL_POSITION
from pptx.oxml.ns import qn
from lxml import etree

TEMPLATE = '/home/ubuntu/.cursor/projects/workspace/uploads/Format_Slide_7a72.pptx'
OUT = '/tmp/hadp/out/HADP_Unit_Performance_Assessment.pptx'
F = json.load(open('/tmp/hadp/out/figures.json'))
M = json.load(open('/tmp/hadp/out/meta.json'))
XL = 'HADP_Unit_Performance_Analysis.xlsx'

DB = RGBColor(0x20, 0x4B, 0x75); OR = RGBColor(0xCB, 0x36, 0x00); MB = RGBColor(0x5F, 0x89, 0xC3); TEAL = RGBColor(0x02, 0x71, 0x67)
AMB = RGBColor(0xEA, 0xB1, 0x43); GREY = RGBColor(0x59, 0x59, 0x59); LGREY = RGBColor(0xF2, 0xF2, 0xF2); LBLUE = RGBColor(0xEA, 0xF0, 0xF7)
WHITE = RGBColor(0xFF, 0xFF, 0xFF); BLACK = RGBColor(0x1A, 0x1A, 0x1A); MGREY = RGBColor(0xBF, 0xBF, 0xBF); LORANGE = RGBColor(0xFB, 0xEA, 0xE3)
FONT = 'Calibri'

prs = Presentation(TEMPLATE)
title_slide, content = prs.slides[0], prs.slides[1]

# ------------------------------------------------------------------ helpers
def rgb_fill(shape, color):
    shape.fill.solid(); shape.fill.fore_color.rgb = color

def no_line(shape):
    shape.line.fill.background()

def box(slide, x, y, w, h, fill=None, line=None, shape=MSO_SHAPE.RECTANGLE, lw=0.5):
    s = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    if fill is None:
        s.fill.background()
    else:
        rgb_fill(s, fill)
    if line is None:
        no_line(s)
    else:
        s.line.color.rgb = line; s.line.width = Pt(lw)
    s.shadow.inherit = False
    s.text_frame.text = ''
    return s

def set_text(tf, paras, size=7, color=BLACK, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, margins=(0.04, 0.02, 0.04, 0.02), line_spacing=1.0, space_after=0):
    """paras: list of paragraphs; each paragraph is a list of runs (text, {bold, color, size, italic}) or a plain string."""
    tf.word_wrap = True
    tf.margin_left, tf.margin_top, tf.margin_right, tf.margin_bottom = [Inches(m) for m in margins]
    tf.vertical_anchor = anchor
    first = True
    for para in paras:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = align
        p.line_spacing = line_spacing
        p.space_after = Pt(space_after)
        p.space_before = Pt(0)
        runs = [(para, {})] if isinstance(para, str) else para
        for text, fmt in runs:
            r = p.add_run(); r.text = text
            r.font.name = FONT; r.font.size = Pt(fmt.get('size', size)); r.font.bold = fmt.get('bold', False); r.font.italic = fmt.get('italic', False)
            r.font.color.rgb = fmt.get('color', color)
    return tf

def text(slide, x, y, w, h, paras, **kw):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    set_text(tb.text_frame, paras, **kw)
    return tb

def col_header(slide, x, y, w, num, title):
    b = box(slide, x, y, w, 0.21, fill=DB)
    set_text(b.text_frame, [[(f'{num}  ', {'bold': True, 'color': AMB, 'size': 9}), (title, {'bold': True, 'color': WHITE, 'size': 8.5})]], anchor=MSO_ANCHOR.MIDDLE, margins=(0.06, 0, 0.04, 0))
    return b

def sub_title(slide, x, y, w, title, src=None, color=DB):
    paras = [[(title, {'bold': True, 'color': color, 'size': 7.5})]]
    if src:
        paras[0].append(('   ' + src, {'italic': True, 'color': GREY, 'size': 5.5}))
    return text(slide, x, y, w, 0.16, paras, margins=(0.02, 0, 0.02, 0), anchor=MSO_ANCHOR.MIDDLE)

def src_tag(slide, x, y, w, src, align=PP_ALIGN.RIGHT):
    return text(slide, x, y, w, 0.12, [[(src, {'italic': True, 'color': GREY, 'size': 5.5})]], align=align, margins=(0.02, 0, 0.02, 0), anchor=MSO_ANCHOR.MIDDLE)

def bullet_paras(items, size=6.5, lead_color=DB, bullet='\u25AA'):
    out = []
    for lead, body_text in items:
        runs = [(f'{bullet} ', {'color': OR, 'size': size, 'bold': True})]
        if lead:
            runs.append((lead + ' ', {'bold': True, 'color': lead_color, 'size': size}))
        runs.append((body_text, {'size': size}))
        out.append(runs)
    return out

def table(slide, x, y, w, h, data, col_w, header_fill=DB, font=6.3, row_h=None, header_h=0.17, fills=None, bold_first_col=True, align_cols=None):
    rows, cols = len(data), len(data[0])
    gt = slide.shapes.add_table(rows, cols, Inches(x), Inches(y), Inches(w), Inches(h))
    tbl = gt.table
    # remove built-in style banding
    tblPr = tbl._tbl.tblPr
    tblPr.set('firstRow', '1'); tblPr.set('bandRow', '0')
    style_id = tblPr.find(qn('a:tableStyleId'))
    if style_id is not None:
        style_id.text = '{5940675A-B579-460E-94D1-54222C63F5DA}'  # "No Style, Table Grid"
    for j, cw in enumerate(col_w):
        tbl.columns[j].width = Inches(cw)
    for i in range(rows):
        tbl.rows[i].height = Inches(header_h if i == 0 else (row_h or (h - header_h) / (rows - 1)))
        for j in range(cols):
            cell = tbl.cell(i, j)
            cell.margin_left = cell.margin_right = Inches(0.03); cell.margin_top = cell.margin_bottom = Inches(0.01)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            val = data[i][j]
            paras = [val] if isinstance(val, list) else [[(line, {})] for line in str(val).split('\n')]
            tf = cell.text_frame; tf.word_wrap = True
            for pi, runs in enumerate(paras):
                p = tf.paragraphs[0] if pi == 0 else tf.add_paragraph()
                p.alignment = (align_cols[j] if align_cols else PP_ALIGN.LEFT) if i > 0 else PP_ALIGN.LEFT
                for t, fmt in runs:
                    r = p.add_run(); r.text = t; r.font.name = FONT
                    r.font.size = Pt(fmt.get('size', font)); r.font.italic = fmt.get('italic', False)
                    if i == 0:
                        r.font.bold = True; r.font.color.rgb = WHITE
                    else:
                        r.font.bold = fmt.get('bold', bold_first_col and j == 0); r.font.color.rgb = fmt.get('color', DB if (bold_first_col and j == 0) else BLACK)
            cell.fill.solid()
            if i == 0:
                cell.fill.fore_color.rgb = header_fill
            else:
                cell.fill.fore_color.rgb = (fills[i] if fills and fills[i] else (WHITE if i % 2 else LGREY))
    # thin borders
    for i in range(rows):
        for j in range(cols):
            tc = tbl.cell(i, j)._tc
            tcPr = tc.get_or_add_tcPr()
            for tag in ('a:lnL', 'a:lnR', 'a:lnT', 'a:lnB'):
                ln = etree.SubElement(tcPr, qn(tag), w='3175', cap='flat', cmpd='sng', algn='ctr')
                sf = etree.SubElement(ln, qn('a:solidFill')); clr = etree.SubElement(sf, qn('a:srgbClr'), val='BFBFBF')
                etree.SubElement(ln, qn('a:prstDash'), val='solid')
    return gt

def style_chart_common(chart, size=6):
    chart.font.name = FONT; chart.font.size = Pt(size); chart.font.color.rgb = BLACK
    chart.has_title = False

def kill_axis_line(axis):
    axis.format.line.fill.background()

# ------------------------------------------------------------------ title slide
for sh in title_slide.shapes:
    if sh.has_text_frame and '<Prompt Title>' in sh.text_frame.text:
        p = sh.text_frame.paragraphs[0]
        p.runs[0].text = 'HADP Unit Performance'
        r2 = p.add_run(); r2.text = ''
        # second line as a new paragraph, smaller
        p2 = sh.text_frame.add_paragraph()
        r = p2.add_run(); r.text = 'Assessing performance to maximize impact'
        r.font.name = 'Georgia'; r.font.size = Pt(14); r.font.bold = False; r.font.color.rgb = WHITE
        p2.alignment = p.alignment
        sh.top = Inches(1.05); sh.height = Inches(0.95)
    # "Name:" is left exactly as in the template for the candidate to fill.

# ------------------------------------------------------------------ content slide
s = content
for sh in s.shapes:
    if sh.is_placeholder and sh.placeholder_format.type is not None:
        t = sh.text_frame.text
        if 'Main heading' in t:
            sh.text_frame.paragraphs[0].runs[0].text = 'HADP units: performance tracks unit type and gestation, not geography - link subsidy to verified output'
        elif 'Subheading' in t:
            sh.text_frame.paragraphs[0].runs[0].text = f"{F['n_all']:,} HADP units assessed on OTA data  |  every figure formula-linked to annexure {XL}"
    elif sh.has_text_frame and sh.text_frame.text.strip() == '8':
        sh.text_frame.paragraphs[0].runs[0].text = '2'

C1X, C1W = 0.22, 3.02
C2X, C2W = 3.36, 3.36
C3X, C3W = 6.84, 2.96
HY = 0.76

col_header(s, C1X, HY, C1W, '1', 'Defining "performance" and the metrics behind it')
col_header(s, C2X, HY, C2W, '2', 'Who performs: patterns by sector, district and unit type')
col_header(s, C3X, HY, C3W, '3', 'Redesigning allocation and supporting weak units')

# ---------------- column 1
b = box(s, C1X, 1.01, C1W, 0.56, fill=LBLUE)
set_text(b.text_frame, [[('Definition. ', {'bold': True, 'color': DB, 'size': 6.8}),
                         ('A unit performs when it is ', {'size': 6.8}), ('functional', {'bold': True, 'size': 6.8}), (', earns ', {'size': 6.8}), ('income', {'bold': True, 'size': 6.8}),
                         (', creates ', {'size': 6.8}), ('employment', {'bold': True, 'size': 6.8}), (' and does so ', {'size': 6.8}), ('efficiently against the subsidy received', {'bold': True, 'size': 6.8}),
                         ('. Functionality is a gate (non-functional = zero); the other three are weighted pillars of one Unit Performance Index (UPI, 0-100), scored against each unit\'s own activity peers.', {'size': 6.8})]],
         margins=(0.06, 0.02, 0.06, 0.02), anchor=MSO_ANCHOR.MIDDLE, line_spacing=0.97)
src_tag(s, C1X, 1.57, C1W, f'Summary §1-2  |  Assumptions')

w_eff, w_inc, w_emp = 0.40, 0.30, 0.30
mt = [['Pillar', 'Unit metric', 'Wt', 'Why prioritised this way'],
      [[('Subsidy efficiency', {'bold': True, 'color': DB})], 'Profit per Rs 1 subsidy', f'{w_eff:.0%}', 'Impact relative to support under a fixed budget; comparable across unlike units'],
      [[('Income', {'bold': True, 'color': DB})], 'Annual profit (Rs)', f'{w_inc:.0%}', 'GSDP goal runs through farmer income; profit, not revenue, which trading inflates'],
      [[('Employment', {'bold': True, 'color': DB})], 'Annual person-days', f'{w_emp:.0%}', 'Explicit objective; equal weight so capital-heavy, low-labour units are not favoured']]
table(s, C1X, 1.69, C1W, 0.93, mt, [0.58, 0.62, 0.24, 1.58], font=6, header_h=0.15, row_h=0.26, align_cols=[PP_ALIGN.LEFT, PP_ALIGN.LEFT, PP_ALIGN.CENTER, PP_ALIGN.LEFT])

b = box(s, C1X, 2.72, C1W, 0.36, fill=LGREY)
set_text(b.text_frame, [[('Scoring. ', {'bold': True, 'color': DB, 'size': 6.2}),
                         ('Each pillar 0-3 vs activity peers (0 none | 1 < P50 | 2 P50-P75 | 3 >= P75). UPI = weighted score / 3 x 100; ', {'size': 6.2}),
                         ('High >= 75, Low <= 25', {'bold': True, 'size': 6.2}),
                         ('. Sector benchmark if < 30 peers; outputs capped at activity P99 in aggregate ratios.', {'size': 6.2})]],
         margins=(0.06, 0.01, 0.06, 0.01), anchor=MSO_ANCHOR.MIDDLE, line_spacing=0.97)

sub_title(s, C1X, 3.1, C1W, 'Analysis universe: records at each step', src=f'Summary §3  |  Unit_Data Q-S')
cd = CategoryChartData()
cd.categories = [f"All unit records  {F['n_all']:,}", f"Functional ({F['pct_func']:.0%})  {F['n_func']:,}", f"Complete OTA output record  {F['n_complete']:,}", f"Scored, subsidy > 0  {F['n_scored']:,}"]
cd.add_series('Records', [F['n_all'], F['n_func'], F['n_complete'], F['n_scored']])
gf = s.shapes.add_chart(XL_CHART_TYPE.BAR_CLUSTERED, Inches(C1X - 0.02), Inches(3.24), Inches(C1W + 0.02), Inches(0.66), cd)
ch = gf.chart; style_chart_common(ch, 6)
ch.has_legend = False
pl = ch.plots[0]; pl.gap_width = 35; pl.vary_by_categories = False
pl.has_data_labels = False
ser = pl.series[0]; ser.format.fill.solid(); ser.format.fill.fore_color.rgb = DB
for i, c in enumerate([DB, MB, MB, OR]):
    pt = ser.points[i]; pt.format.fill.solid(); pt.format.fill.fore_color.rgb = c
ca = ch.category_axis; ca.reverse_order = True; ca.tick_labels.font.size = Pt(6); ca.tick_labels.font.bold = True; ca.has_major_gridlines = False; ca.format.line.color.rgb = MGREY
va = ch.value_axis; va.visible = False; va.has_major_gridlines = False; va.maximum_scale = F['n_all'] * 1.02; va.minimum_scale = 0

sub_title(s, C1X, 3.91, C1W, 'Trade-offs made explicit in the definition', src='Summary §6, §10')
items = [
    ('Income vs employment.', f"{F['to_inc_not_emp']:.0%} of scored units are top-quartile on income but at or below peer median on employment, {F['to_emp_not_inc']:.0%} the reverse; only {F['to_high_both']:.0%} of High performers clear both. Weights, not a single metric, carry the policy choice."),
    ('Ratio vs scale.', f"Return falls from Rs {F['size_tier']['T1 Micro (< Rs 10k)']['ret']:.1f} per Rs 1 (micro, < Rs 10k) to Rs {F['size_tier']['T4 Large (> Rs 10 lakh)']['ret']:.2f} (> Rs 10 lakh) because the ratio ignores the farmer's own capital - so units are scored within peers and portfolio choices use absolute metrics."),
    ('Annual output vs gestation.', "Orchard, mother-block and heifer units show 56-80% zero revenue at ~21 months: a measurement lag, not failure; they need milestone metrics."),
]
text(s, C1X, 4.06, C1W, 0.95, bullet_paras(items, size=6.0), margins=(0.03, 0.0, 0.03, 0.0), line_spacing=0.96, space_after=1.2)

# ---------------- column 2
sub_title(s, C2X, 1.01, C2W, 'Performance bands by sector  |  profit per Rs 1 subsidy', src=f'Summary §4')
order = sorted(F['sector'], key=lambda k: F['sector'][k]['low'])
cd = CategoryChartData()
cd.categories = [f"{k if k != 'Animal Husbandry' else 'Animal Husb.'}  |  Rs {F['sector'][k]['ret']:.2f}" for k in order]
cd.add_series('High', [F['sector'][k]['high'] for k in order])
cd.add_series('Moderate', [F['sector'][k]['mod'] for k in order])
cd.add_series('Low', [F['sector'][k]['low'] for k in order])
gf = s.shapes.add_chart(XL_CHART_TYPE.BAR_STACKED_100, Inches(C2X - 0.03), Inches(1.15), Inches(C2W + 0.05), Inches(1.16), cd)
ch = gf.chart; style_chart_common(ch, 6)
ch.has_legend = True; ch.legend.position = XL_LEGEND_POSITION.BOTTOM; ch.legend.include_in_layout = False; ch.legend.font.size = Pt(6)
pl = ch.plots[0]; pl.gap_width = 40; pl.overlap = 100
for ser, c in zip(pl.series, [TEAL, MB, OR]):
    ser.format.fill.solid(); ser.format.fill.fore_color.rgb = c
    ser.data_labels.show_value = True; ser.data_labels.number_format = '0%;;'; ser.data_labels.number_format_is_linked = False
    ser.data_labels.font.size = Pt(5.5); ser.data_labels.font.color.rgb = WHITE; ser.data_labels.font.bold = True; ser.data_labels.position = XL_LABEL_POSITION.CENTER
ca = ch.category_axis; ca.reverse_order = True; ca.tick_labels.font.size = Pt(6); ca.format.line.color.rgb = MGREY; ca.has_major_gridlines = False
va = ch.value_axis; va.visible = False; va.has_major_gridlines = False
# hide small Low labels (0%) for HP&M handled by chart; fine.

sub_title(s, C2X, 2.33, C2W, f"Best and worst five activities by return on subsidy ({F['n_eligible']} eligible)", src='Summary §11')
short = {
    'Application form for Area expansion of Niche Crops -Hill Garlic (Rabi)': 'Niche crop area expansion - hill garlic',
    'Application Form for Open Field Vegetable Production': 'Open-field vegetable production',
    'Area expansion in Loose flowers': 'Loose-flower area expansion',
    'Application form for Area expansion of Niche Crops -Kashmiri Lal Chilli (Kharif)': 'Niche crop area expansion - Kashmiri chilli',
    'Application form for vegetable seeds': 'Vegetable seed kits',
    'Application form for Area expansion of Niche Crops': 'Niche crop area expansion (general)',
    'Application for establishment of Mother Block Unit': 'Mother block unit (hort.)',
    'Application for Hi-Tech Protected Cultivation of Vegetable Crops': 'Hi-tech protected cultivation',
    'Satellite Heifer Rearing Unit': 'Satellite heifer rearing unit',
    'Application for Establishment of Farm Machinery Banks': 'Farm machinery bank',
    'DEVELOMENT OF RAIN FED AREAS OF J&K:Project No.14': 'Rain-fed area development',
    'Application for Assistance to FPOs dealing with aggregation, value processing and marketing for wool & pelt': 'Wool & pelt FPO assistance',
    'Application for Roof-top Rain Water Harvesting Structures': 'Roof-top rain-water harvesting',
    'Application for Establishment of Custom Hiring Center': 'Custom hiring centre',
    'Establishment  of Fisheries units (Individual)': 'Fisheries unit (individual)',
}
top5 = F['act_top'][:5]; bot5 = F['act_bottom'][:5][::-1]
cats = [f"{short.get(a['activity'], a['activity'][:34])}  ({a['zero_rev']:.0%} zero rev.)" for a in top5 + bot5]
vals = [a['ret'] for a in top5 + bot5]
cd = CategoryChartData(); cd.categories = cats; cd.add_series('Profit per Rs 1 subsidy', vals)
gf = s.shapes.add_chart(XL_CHART_TYPE.BAR_CLUSTERED, Inches(C2X - 0.03), Inches(2.47), Inches(C2W + 0.05), Inches(1.12), cd)
ch = gf.chart; style_chart_common(ch, 6); ch.has_legend = False
pl = ch.plots[0]; pl.gap_width = 30; pl.vary_by_categories = False
pl.has_data_labels = True; pl.data_labels.number_format = '0.00'; pl.data_labels.number_format_is_linked = False
pl.data_labels.position = XL_LABEL_POSITION.OUTSIDE_END; pl.data_labels.font.size = Pt(5.5); pl.data_labels.font.bold = True
ser = pl.series[0]
for i in range(len(vals)):
    pt = ser.points[i]; pt.format.fill.solid(); pt.format.fill.fore_color.rgb = TEAL if i < 5 else OR
ca = ch.category_axis; ca.reverse_order = True; ca.tick_labels.font.size = Pt(5.5); ca.format.line.color.rgb = MGREY; ca.has_major_gridlines = False
va = ch.value_axis; va.visible = False; va.has_major_gridlines = False; va.minimum_scale = 0; va.maximum_scale = max(vals) * 1.15

sub_title(s, C2X, 3.61, C2W, 'What the patterns say', src='Summary §4-9')
ut = F['unit_type']; A_ = ut['A. Input & cultivation support']; C_ = ut['C. Production & farm infrastructure']; D_ = ut['D. Aggregation & value-chain institutions']
fis = F['sector']['Fisheries']; hor = F['sector']['Horticulture']; agr = F['sector']['Agri']; hpm = F['sector']['HP&M']
items = [
    ('Unit type and ticket size, not place, drive results.', f"Micro input support is {A_['share_units']:.0%} of scored units and {A_['share_sub']:.0%} of outlay yet {A_['share_profit']:.0%} of profit and {A_['share_emp']:.0%} of employment; asset units take {C_['share_sub']:.0%} of outlay at Rs {C_['ret']:.2f} per Rs 1. Value-chain institutions have the fewest Low performers ({D_['low']:.0%}) and the most employment per unit (median {D_['med_emp']:.0f} person-days)."),
    ('Low performers sit where units are not yet producing:', f"Fisheries {fis['low']:.0%} Low ({fis['zero_rev']:.0%} zero revenue), Horticulture {hor['low']:.0%} ({hor['zero_rev']:.0%}), against Agri {agr['low']:.0%} and HP&M {hpm['low']:.0%}."),
    ('District explains little.', f"Mean UPI spans only {F['district_upi_min']:.1f}-{F['district_upi_max']:.1f} across 20 districts and functionality {F['district_func_min']:.0%}-{F['district_func_max']:.0%}; Kashmir Rs {F['division']['KASHMIR']['ret']:.2f} vs Jammu Rs {F['division']['JAMMU']['ret']:.2f} per Rs 1. The sharp signal is activity x division: Sericulture is {F['seri_func']['KASHMIR']:.0%} functional in Kashmir, {F['seri_func']['JAMMU']:.0%} in Jammu."),
    ('Non-functionality and training.', f"{F['pct_nonfunc']:.0%} of units never started, mostly micro schemes (fodder in orchards {F['nonfunc_acts'][0]['nf']:.0%}, mulberry {F['nonfunc_acts'][1]['nf']:.0%}, compost bags {F['nonfunc_acts'][2]['nf']:.0%}, seed kits 20-25%); LMS completion shows no UPI gap ({F['training']['Yes']['upi']:.1f} vs {F['training']['No']['upi']:.1f})."),
]
text(s, C2X, 3.76, C2W, 1.24, bullet_paras(items, size=6.0), margins=(0.03, 0.0, 0.03, 0.0), line_spacing=0.96, space_after=1.2)

# ---------------- column 3
sub_title(s, C3X, 1.01, C3W, 'Redesign subsidy allocation', src='Summary §6, §11, §13  |  Scenario')
sc = F['scen_cd']; t4 = F['size_tier']['T4 Large (> Rs 10 lakh)']; t3 = F['size_tier']['T3 Medium (Rs 1 - 10 lakh)']
items = [
    ('Pay for verified output.', f"Split the back-ended subsidy: 70% on establishment, 30% on OTA-verified output at 12 months for units above Rs 1 lakh (tiers T3-T4: {F['t34_outlay_share']:.0%} of outlay on {F['t34_unit_share']:.0%} of units; payback {F['payback']['T3 Medium (Rs 1 - 10 lakh)']:.0f}-{F['payback']['T4 Large (> Rs 10 lakh)']:.0f} years)."),
    ('Reallocate inside each unit type.', f"Move the marginal rupee to top-half-return activities with > 90% functionality; cap bottom-quartile ones until milestones exist. A 20% shift of bottom-quartile outlay (Rs {sc['shift']:.0f} cr) in asset types adds ~Rs {sc['d_profit']:.1f} cr profit (+{sc['pct_profit']:.0%}) and {sc['d_emp']:.1f} lakh person-days (+{sc['pct_emp']:.0%}) a year - both goals move together."),
    ('Milestone metrics for long-gestation assets.', 'Survival, establishment, first calving or first harvest replace annual revenue for orchards, mother blocks, heifer and fish units; final tranche on milestone evidence.'),
    ('Protect the micro portfolio, add a start-up screen.', 'Seed, compost and fodder schemes yield a quarter of profit on 5% of outlay but lose 20-37% of units before they start: bundle with extension, verify establishment first.'),
]
text(s, C3X, 1.16, C3W, 1.38, bullet_paras(items, size=6.0), margins=(0.03, 0.0, 0.03, 0.0), line_spacing=0.96, space_after=1.2)

sub_title(s, C3X, 2.56, C3W, 'Interventions for underperforming units', src='Summary §3, §10, §12')
it = [['Segment', 'Scale', 'Intervention'],
      [[('Non-functional', {'bold': True, 'color': OR})], f"{F['n_all'] - F['n_func']:,} units\n{F['pct_nonfunc']:.0%} of all", 'Field verification, then time-bound revive-or-close so dormant sanctions release budget.'],
      [[('Functional, zero output', {'bold': True, 'color': OR})], f"{F['n_zero_rev']:,} units\nRs {F['sub_zero_rev_cr']:.0f} cr subsidy", 'Sector-staff handholding, linkage to nearest RBSH/FPO/CFC, 6-month review; gestation units on milestones.'],
      [[('Low performers (UPI <= 25)', {'bold': True, 'color': OR})], f"{F['n_low']:,} units\nRs {F['sub_low_cr']:.0f} cr subsidy", 'Technical audit (stocking, feed, water), credit linkage, peer mentoring by nearby High performers.'],
      [[('Unscoreable records', {'bold': True, 'color': OR})], f"{F['n_unscoreable_func']:,} units\n{F['pct_unscoreable_func']:.0%} of functional", 'OTA validation rules (subsidy <= cost, profit <= revenue, outputs mandatory); quarterly scoreable-share KPI.']]
table(s, C3X, 2.7, C3W, 1.43, it, [0.7, 0.76, 1.5], font=5.8, header_h=0.15, row_h=0.32, align_cols=[PP_ALIGN.LEFT, PP_ALIGN.CENTER, PP_ALIGN.LEFT])

# KPI tiles
sub_title(s, C3X, 4.24, C3W, 'What changes if adopted (annual, scored units)', src='Scenario  |  Summary §10')
tiles = [(f"+Rs {sc['d_profit']:.1f} cr", f"profit from a 20% like-for-like shift (+{sc['pct_profit']:.0%} on Rs {F['tot_profit_cr']:.0f} cr)", DB),
         (f"+{sc['d_emp']:.1f} lakh", f"person-days from the same shift (+{sc['pct_emp']:.0%} on {F['tot_emp_lakh']:.0f} lakh)", TEAL),
         (f"Rs {F['sub_zero_rev_cr']:.0f} cr", f"subsidy in zero-revenue units brought under milestone or recovery tracking", OR)]
tw = (C3W - 0.08) / 3
for i, (big, small, colr) in enumerate(tiles):
    x = C3X + i * (tw + 0.04)
    b = box(s, x, 4.39, tw, 0.61, fill=LGREY)
    set_text(b.text_frame, [[(big, {'bold': True, 'color': colr, 'size': 10.5})], [(small, {'size': 5.6, 'color': GREY})]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, margins=(0.03, 0.01, 0.03, 0.01), line_spacing=0.95)

# footnote
text(s, C1X, 5.05, 9.58, 0.18,
     [[('Source: HADP Kisan Sathi Output Tracking App unit-level dataset (n = {:,}; analysis as of Nov-2026). '.format(F['n_all']), {'size': 5.3, 'color': GREY}),
       (f'Every figure is computed by formula in the annexure {XL} - grey tags give the sheet / Summary section; charts carry the same data. ', {'size': 5.3, 'color': GREY}),
       ('Scored units = functional, complete OTA record, subsidy > 0. Aggregate ratios use outputs capped at the activity P99. Rs 1 lakh = 100,000; Rs 1 cr = 10 million. Unit types A-D are an analyst classification of the 121 activities (Activity_Map).', {'size': 5.3, 'color': GREY})]],
     margins=(0.02, 0, 0.02, 0), line_spacing=0.95)

# ------------------------------------------------------------------ closing slide
layout = [l for l in prs.slide_layouts if l.name == '1_Title and Content'][0]
end = prs.slides.add_slide(layout)
for ph in end.placeholders:
    if ph.placeholder_format.type is not None and ph.placeholder_format.idx == 0:
        ph.text_frame.text = 'Thank you'
    elif ph.placeholder_format.idx == 1:
        ph.text_frame.text = f'Annexure: {XL}'
# Left panel: short reading guide to the annexure so the closing slide is not blank.
text(end, 0.45, 1.3, 4.3, 0.3, [[('Annexure workbook: how the analysis is organised', {'bold': True, 'color': DB, 'size': 12})]], margins=(0, 0, 0, 0))
guide = [
    ('Summary', 'All results in 14 sections; every cell is a live formula on Unit_Data.'),
    ('Assumptions', 'Weights, cut-offs, peer-group and winsorisation rules, cleaning steps.'),
    ('Unit_Data', f"{F['n_all']:,} records; raw fields A-M, derived fields N-AN (scores, UPI, band, flags)."),
    ('Activity_Map', 'Analyst classification of the 121 activities into unit types A-D.'),
    ('Benchmarks', 'Peer-group percentiles (P50 / P75 / P99) by activity with sector fallback.'),
    ('Activity_Analysis', 'All activities: functionality, bands, return, payback, gestation flag.'),
    ('Scenario', 'Like-for-like reallocation within unit types with profit and employment effects.'),
]
text(end, 0.45, 1.7, 4.3, 2.6, [[(f'{k}  ', {'bold': True, 'color': OR, 'size': 9}), (v, {'size': 9, 'color': BLACK})] for k, v in guide], margins=(0, 0, 0, 0), space_after=4, line_spacing=1.05)

prs.save(OUT)
print('saved', OUT)
