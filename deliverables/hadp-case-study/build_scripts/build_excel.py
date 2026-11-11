"""Build the HADP analysis workbook on top of the GDi Excel template (formula-driven)."""
import datetime as dt
import pandas as pd, numpy as np
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as L
from openpyxl.workbook.defined_name import DefinedName
from prep import load, TYPE_RULES, TYPE_OVERRIDES, classify, ASOF, W_EFF, W_INC, W_EMP, MIN_PEER, HIGH_CUT, LOW_CUT

TEMPLATE = '/home/ubuntu/.cursor/projects/workspace/uploads/Format_Excel_Output__b99b.xlsx'
OUT = '/tmp/hadp/out/HADP_Unit_Performance_Analysis.xlsx'

# ---------------------------------------------------------------- styles
FONT = 'Work Sans'
BLUE, DBLUE, ORANGE, RED, GREY, LBLUE, LGREY, GREEN, AMBER = '0B5394', '204B75', 'CB3600', '980000', '595959', 'DCE6F1', 'F2F2F2', 'E2EFDA', 'FFF2CC'
thin = Side(style='thin', color='BFBFBF')
BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)
NOB = Border()

def f(sz=9, b=False, color='000000', i=False):
    return Font(name=FONT, size=sz, bold=b, color=color, italic=i)

def fill(c):
    return PatternFill('solid', fgColor=c)

WRAP = Alignment(wrap_text=True, vertical='top')
CENTER = Alignment(horizontal='center', vertical='center', wrap_text=True)
LEFTC = Alignment(horizontal='left', vertical='center', wrap_text=True)
RIGHTC = Alignment(horizontal='right', vertical='center')

FMT_INT = '#,##0'
FMT_PCT = '0.0%'
FMT_2 = '0.00'
FMT_1 = '0.0'
FMT_CR = '#,##0.00'
FMT_RS = '#,##0'

N_ROWS = None  # set after load

def rng(col, first=2, last=None, sheet='Unit_Data'):
    last = last or N_ROWS + 1
    return f"{sheet}!${col}${first}:${col}${last}"

# ---------------------------------------------------------------- data
df = load()
N_ROWS = len(df)
LAST = N_ROWS + 1
U = lambda col: rng(col)  # full Unit_Data column range

wb = openpyxl.load_workbook(TEMPLATE)
summary = wb['Sheet1']
summary.title = 'Summary'

# Keep the template's candidate block (rows 2-4) untouched; unhide nothing; content stays inside B6:K568.

# ================================================================ Assumptions
wsA = wb.create_sheet('Assumptions')
wsA.sheet_view.showGridLines = False
wsA.column_dimensions['A'].width = 3
wsA.column_dimensions['B'].width = 46
wsA.column_dimensions['C'].width = 18
wsA.column_dimensions['D'].width = 90

def title(ws, cell, text, sub=None):
    ws[cell] = text
    ws[cell].font = f(14, True, BLUE)
    if sub:
        r = ws[cell].row + 1
        ws.cell(r, ws[cell].column, sub).font = f(9, False, GREY, True)

def header_row(ws, row, c1, labels, fill_color=BLUE, font_color='FFFFFF', height=30):
    for i, lab in enumerate(labels):
        c = ws.cell(row, c1 + i, lab)
        c.font = f(9, True, font_color)
        c.fill = fill(fill_color)
        c.alignment = CENTER
        c.border = BORDER
    ws.row_dimensions[row].height = height

def body(ws, row, c1, values, fmts=None, bold=False, fill_color=None, align=None, border=True, sz=9):
    for i, v in enumerate(values):
        c = ws.cell(row, c1 + i, v)
        c.font = f(sz, bold)
        if fmts and fmts[i]:
            c.number_format = fmts[i]
        if fill_color:
            c.fill = fill(fill_color)
        c.alignment = align or (LEFTC if isinstance(v, str) and not str(v).startswith('=') else RIGHTC)
        if border:
            c.border = BORDER

title(wsA, 'B2', 'Assumptions and parameters', 'All parameters below drive the formulas in the workbook. Change a value here and every dependent calculation, table and ranking updates.')
header_row(wsA, 4, 2, ['Parameter', 'Value', 'Rationale / note'])
params = [
    ('Analysis as-of date (for months functional)', ASOF.to_pydatetime(), 'dd-mmm-yyyy', 'AS_OF', 'Latest "Functional since" date in the dataset is Mar-2026; analysis dated Nov-2026 so every unit has at least 7 months of operation.'),
    ('Weight: Subsidy efficiency (profit per Rs 1 of subsidy)', W_EFF, '0%', 'W_EFF', 'Highest weight: the decision problem is allocation of a fixed subsidy budget, so impact relative to public money is the primary lens.'),
    ('Weight: Income generation (annual profit)', W_INC, '0%', 'W_INC', "HADP's primary outcome is farmer income / GSDP. Profit, not revenue, is used because revenue double-counts input cost and pass-through trading."),
    ('Weight: Employment (annual person-days)', W_EMP, '0%', 'W_EMP', 'Explicit programme objective; equal to income so the index does not tilt toward capital-intensive, low-labour units.'),
    ('High-performer cut-off (Unit Performance Index >=)', HIGH_CUT, '0', 'HIGH_CUT', 'UPI 75 = at or above the 75th percentile of peers on the weighted pillars.'),
    ('Low-performer cut-off (Unit Performance Index <=)', LOW_CUT, '0', 'LOW_CUT', 'UPI 25 = at best "positive but below peer median" on every pillar, or zero output on most pillars.'),
    ('Minimum scored units for activity-level benchmarks', MIN_PEER, '0', 'MIN_PEER', 'Below this, the unit is benchmarked against its sector instead of its activity (small peer groups give unstable percentiles).'),
    ('Winsorisation percentile for aggregate ratios', 0.99, '0%', 'WINSOR_P', 'Outputs above the activity P99 are capped only when summing (sector / activity ratios), so single data-entry errors (e.g. 10,00,000 person-days) cannot drive a portfolio conclusion. Unit-level scores use quartiles and need no capping.'),
    ('Size tier cut-off T1 | T2 (Rs)', 10000, FMT_RS, 'TIER1', 'Micro input support (seeds, plots, small kits).'),
    ('Size tier cut-off T2 | T3 (Rs)', 100000, FMT_RS, 'TIER2', 'Small equipment and sheds.'),
    ('Size tier cut-off T3 | T4 (Rs)', 1000000, FMT_RS, 'TIER3', 'Medium vs large asset-based units.'),
    ('Scenario: share of bottom-quartile outlay re-directed', 0.20, '0%', 'SHIFT_PCT', 'Illustrative marginal reallocation; applied within the same unit type so like is compared with like.'),
    ('Gestation / zero-output flag: zero-revenue share >=', 0.40, '0%', 'GEST_CUT', 'Activities where 40%+ of functional, scored units report zero revenue are treated as gestation-lag or non-income assets, not as failures.'),
    ('Rs 1 lakh', 100000, FMT_RS, 'LAKH', 'Unit conversion.'),
    ('Rs 1 crore', 10000000, FMT_RS, 'CRORE', 'Unit conversion.'),
]
r = 5
for lab, val, fmt, name, note in params:
    body(wsA, r, 2, [lab, val, note], [None, fmt, None])
    wb.defined_names[name] = DefinedName(name, attr_text=f"Assumptions!$C${r}")
    wsA.row_dimensions[r].height = 30
    r += 1

r += 1
wsA.cell(r, 2, 'Scoring rule (applied per pillar, against the activity peer group)').font = f(11, True, BLUE); r += 1
header_row(wsA, r, 2, ['Condition', 'Points', 'Interpretation']); r += 1
for cond, pts, interp in [
    ('Output <= 0 (no profit / no employment / no return)', 0, 'Unit is functional but delivering nothing on this dimension.'),
    ('0 < output < peer median (P50)', 1, 'Positive but below half of comparable units.'),
    ('P50 <= output < P75', 2, 'Above the peer median.'),
    ('Output >= P75 (top quartile of peers)', 3, 'Among the best quarter of comparable units.'),
]:
    body(wsA, r, 2, [cond, pts, interp], [None, '0', None]); r += 1
body(wsA, r, 2, ['Unit Performance Index (UPI)', '=W_EFF+W_INC+W_EMP', 'UPI = (W_EFF x Efficiency score + W_INC x Income score + W_EMP x Employment score) / 3 x 100, i.e. 0-100. Weights must sum to 100% (check value to the left).'], [None, '0%', None], bold=True, fill_color=LBLUE); r += 2

wsA.cell(r, 2, 'Analysis universe: rules applied in sequence').font = f(11, True, BLUE); r += 1
header_row(wsA, r, 2, ['Step', 'Unit_Data column', 'Rule']); r += 1
for step, col, rule in [
    ('1. Functional units', 'Q', 'Functional Status = "Unit Functional". Non-functional units have no output fields and are, by definition, zero-performance; they are analysed separately through the functionality rate.'),
    ('2. Complete OTA output record', 'R', 'Employment, Revenue and Profit are all numeric. Partially-filled records cannot be scored on three pillars and are reported as a monitoring gap.'),
    ('3. Scored unit', 'S', 'Sanctioned subsidy is numeric and > 0, so subsidy efficiency is defined. Units with no subsidy recorded (mostly varietal demonstration plots and fodder activities) are excluded from the index.'),
    ('Flag (retained, not excluded): Subsidy > Unit cost', 'AI', 'Subsidy is linked to the benchmark unit cost and cannot exceed it; the record is kept (the subsidy is what was actually sanctioned) and flagged for field verification.'),
    ('Flag (retained): Profit > Revenue', 'AJ', 'Logically inconsistent; profit is still used as the income measure because it is the field the OTA asks functionaries to verify. Excluded from the "top units" list.'),
    ('Flag (retained): Functional since before 2023', 'AK', 'Pre-dates HADP; likely a data-entry error in the date field.'),
    ('Flag (retained): Zero output on all three fields', 'AL', 'Functional, tracked and subsidised but producing nothing - priority for field follow-up.'),
    ('Treatment of non-numeric entries', 'N, O, P', 'Text values such as "1.75.500" or "." in Unit cost / Subsidy / Employment are kept in the raw columns and treated as blank in the numeric columns.'),
]:
    body(wsA, r, 2, [step, col, rule]); wsA.row_dimensions[r].height = 42; r += 1

# ================================================================ Unit_Data
wsU = wb.create_sheet('Unit_Data')
raw_headers = ['Unit Number', 'Support provided for (Activity)', 'Sector', 'Division', 'District Name', 'Functional Status',
               'Functional Since (Date)', 'Unit cost (Rs.)', 'Sanctioned subsidy (Rs.)', 'Annual Employment Generated (Person Days)',
               'Revenue (Rs.)', 'Profit (Rs.)', 'Training Completed (Online LMS)']
der_headers = ['Unit cost (numeric)', 'Subsidy (numeric)', 'Employment (numeric)', 'Functional (1/0)', 'Complete OTA record (1/0)',
               'Scored unit (1/0)', 'Unit type', 'Subsidy size tier', 'Months functional', 'Profit per Rs 1 subsidy',
               'Person-days per Rs 1 lakh subsidy', 'Subsidy share of unit cost', 'Benchmark row', 'Income score (0-3)',
               'Employment score (0-3)', 'Efficiency score (0-3)', 'Unit Performance Index (0-100)', 'Performance band',
               'Profit (winsorised at P99)', 'Employment (winsorised at P99)', 'Revenue (winsorised at P99)',
               'Flag: subsidy > unit cost', 'Flag: profit > revenue', 'Flag: functional before 2023', 'Flag: zero output',
               'Helper: High-performer profit (consistent records: profit <= revenue, subsidy 5-100% of unit cost)', 'Helper: Low-performer subsidy']
headers = raw_headers + der_headers
for i, h in enumerate(headers, start=1):
    c = wsU.cell(1, i, h)
    c.font = f(9, True, 'FFFFFF')
    c.fill = fill(BLUE if i <= 13 else DBLUE)
    c.alignment = CENTER
    c.border = BORDER
wsU.row_dimensions[1].height = 48
wsU.freeze_panes = 'C2'

raw_src = pd.read_excel(TEMPLATE.replace('Format_Excel_Output__b99b.xlsx', 'HADP_Unit-wise_data_a594.xlsx'), header=3)
raw_src = raw_src.loc[:, [c for c in raw_src.columns if not str(c).startswith('Unnamed')]]
raw_src.columns = ['unit', 'activity', 'sector', 'division', 'district', 'status', 'since', 'ucost', 'subsidy', 'emp', 'rev', 'profit', 'training']
assert len(raw_src) == N_ROWS

def clean(v):
    if v is None or (isinstance(v, float) and np.isnan(v)):
        return None
    if isinstance(v, pd.Timestamp):
        return v.to_pydatetime()
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating,)):
        return float(v)
    return v

tier_lbls = ['T1 Micro (< Rs 10k)', 'T2 Small (Rs 10k - 1 lakh)', 'T3 Medium (Rs 1 - 10 lakh)', 'T4 Large (> Rs 10 lakh)']
BM_FIRST, BM_LAST = 6, 6 + 200  # benchmark rows reserved
BM_NAMES = {'B': 'BM_ACT', 'P': 'BM_P50_PROF', 'Q': 'BM_P75_PROF', 'R': 'BM_P99_PROF', 'S': 'BM_P50_EMP', 'T': 'BM_P75_EMP', 'U': 'BM_P99_EMP',
            'V': 'BM_P50_EFF', 'W': 'BM_P75_EFF', 'X': 'BM_P99_REV'}
for col, nm in BM_NAMES.items():
    wb.defined_names[nm] = DefinedName(nm, attr_text=f"Benchmarks!${col}${BM_FIRST}:${col}${BM_LAST}")
B = lambda col: BM_NAMES[col]
# size-tier lookup table (Assumptions G5:H8)
wsA['G4'] = 'Tier lower bound (Rs)'; wsA['H4'] = 'Tier label'
for c in ('G4', 'H4'):
    wsA[c].font = f(9, True, 'FFFFFF'); wsA[c].fill = fill(BLUE); wsA[c].alignment = CENTER; wsA[c].border = BORDER
for i, (lb, lab) in enumerate([('=0', 'T1 Micro (< Rs 10k)'), ('=TIER1', 'T2 Small (Rs 10k - 1 lakh)'), ('=TIER2', 'T3 Medium (Rs 1 - 10 lakh)'), ('=TIER3', 'T4 Large (> Rs 10 lakh)')]):
    body(wsA, 5 + i, 7, [lb, lab], [FMT_RS, None])
wsA.column_dimensions['F'].width = 3; wsA.column_dimensions['G'].width = 20; wsA.column_dimensions['H'].width = 26
wb.defined_names['TIER_LB'] = DefinedName('TIER_LB', attr_text="Assumptions!$G$5:$G$8")
wb.defined_names['TIER_LBL'] = DefinedName('TIER_LBL', attr_text="Assumptions!$H$5:$H$8")

def unit_formulas(r):
    return {
        'N': f'=IF(ISNUMBER(H{r}),H{r},"")',
        'O': f'=IF(ISNUMBER(I{r}),I{r},"")',
        'P': f'=IF(ISNUMBER(J{r}),J{r},"")',
        'Q': f'=IF(F{r}="Unit Functional",1,0)',
        'R': f'=IF(AND(Q{r}=1,ISNUMBER(P{r}),ISNUMBER(K{r}),ISNUMBER(L{r})),1,0)',
        'S': f'=IF(AND(R{r}=1,ISNUMBER(O{r})),IF(O{r}>0,1,0),0)',
        'T': f'=IFERROR(INDEX(Activity_Map!$C$2:$C$200,MATCH(B{r},Activity_Map!$A$2:$A$200,0)),"Unclassified")',
        'U': f'=IF(NOT(ISNUMBER(O{r})),"Not recorded",IF(O{r}<=0,"Not recorded",LOOKUP(O{r},TIER_LB,TIER_LBL)))',
        'V': f'=IF(ISNUMBER(G{r}),(AS_OF-G{r})/30.4375,"")',
        'W': f'=IF(S{r}=1,L{r}/O{r},"")',
        'X': f'=IF(S{r}=1,P{r}/O{r}*LAKH,"")',
        'Y': f'=IF(AND(Q{r}=1,ISNUMBER(N{r}),ISNUMBER(O{r})),IF(N{r}>0,O{r}/N{r},""),"")',
        'Z': f'=IFERROR(MATCH(B{r},{B("B")},0),"")',
        'AA': f'=IF(S{r}=1,IF(L{r}<=0,0,IF(L{r}>=INDEX({B("Q")},Z{r}),3,IF(L{r}>=INDEX({B("P")},Z{r}),2,1))),"")',
        'AB': f'=IF(S{r}=1,IF(P{r}<=0,0,IF(P{r}>=INDEX({B("T")},Z{r}),3,IF(P{r}>=INDEX({B("S")},Z{r}),2,1))),"")',
        'AC': f'=IF(S{r}=1,IF(W{r}<=0,0,IF(W{r}>=INDEX({B("W")},Z{r}),3,IF(W{r}>=INDEX({B("V")},Z{r}),2,1))),"")',
        'AD': f'=IF(S{r}=1,(W_EFF*AC{r}+W_INC*AA{r}+W_EMP*AB{r})/3*100,"")',
        'AE': f'=IF(Q{r}=0,"Non-functional",IF(S{r}=0,"Not scored (data gap)",IF(AD{r}>=HIGH_CUT,"High",IF(AD{r}<=LOW_CUT,"Low","Moderate"))))',
        'AF': f'=IF(S{r}=1,MIN(L{r},INDEX({B("R")},Z{r})),"")',
        'AG': f'=IF(S{r}=1,MIN(P{r},INDEX({B("U")},Z{r})),"")',
        'AH': f'=IF(S{r}=1,MIN(K{r},INDEX({B("X")},Z{r})),"")',
        'AI': f'=IF(AND(Q{r}=1,ISNUMBER(N{r}),ISNUMBER(O{r})),IF(AND(N{r}>0,O{r}>N{r}),1,0),0)',
        'AJ': f'=IF(AND(Q{r}=1,ISNUMBER(L{r}),ISNUMBER(K{r})),IF(L{r}>K{r},1,0),0)',
        'AK': f'=IF(AND(Q{r}=1,ISNUMBER(G{r})),IF(G{r}<DATE(2023,1,1),1,0),0)',
        'AL': f'=IF(S{r}=1,IF(AND(K{r}=0,L{r}=0,P{r}=0),1,0),0)',
        'AM': f'=IF(AND(AE{r}="High",AJ{r}=0,AI{r}=0,IF(ISNUMBER(N{r}),O{r}>=0.05*N{r},TRUE)),AF{r}+A{r}/1000000000,"")',
        'AN': f'=IF(AE{r}="Low",O{r}+A{r}/1000000000,"")',
    }

fmt_by_col = {'G': 'dd-mmm-yyyy', 'H': FMT_RS, 'I': FMT_RS, 'J': FMT_RS, 'K': FMT_RS, 'L': FMT_RS, 'N': FMT_RS, 'O': FMT_RS, 'P': FMT_RS,
              'V': FMT_1, 'W': FMT_2, 'X': FMT_INT, 'Y': FMT_PCT, 'AD': FMT_1, 'AF': FMT_RS, 'AG': FMT_RS, 'AH': FMT_RS, 'AM': FMT_RS, 'AN': FMT_RS}
col_idx = {L(i): i for i in range(1, 41)}
base_font = f(9)
print('writing Unit_Data ...')
vals = raw_src.values.tolist()
for i, row in enumerate(vals):
    r = i + 2
    for j, v in enumerate(row, start=1):
        c = wsU.cell(r, j, clean(v))
        c.font = base_font
        colL = L(j)
        if colL in fmt_by_col:
            c.number_format = fmt_by_col[colL]
    for colL, fx in unit_formulas(r).items():
        c = wsU.cell(r, col_idx[colL], fx)
        c.font = base_font
        if colL in fmt_by_col:
            c.number_format = fmt_by_col[colL]
    if i % 20000 == 0:
        print('  row', r)
widths = {'A': 8, 'B': 44, 'C': 14, 'D': 10, 'E': 12, 'F': 16, 'G': 12, 'H': 12, 'I': 12, 'J': 12, 'K': 12, 'L': 12, 'M': 10,
          'N': 12, 'O': 12, 'P': 12, 'Q': 9, 'R': 9, 'S': 9, 'T': 30, 'U': 22, 'V': 10, 'W': 11, 'X': 12, 'Y': 11, 'Z': 9,
          'AA': 9, 'AB': 9, 'AC': 9, 'AD': 11, 'AE': 18, 'AF': 13, 'AG': 13, 'AH': 13, 'AI': 9, 'AJ': 9, 'AK': 9, 'AL': 9, 'AM': 14, 'AN': 14}
for k, w in widths.items():
    wsU.column_dimensions[k].width = w
wsU.auto_filter.ref = f"A1:AN{LAST}"

# ================================================================ Activity_Map
wsM = wb.create_sheet('Activity_Map')
wsM.sheet_view.showGridLines = False
acts = df.groupby('activity').agg(sector=('sector', 'first'), n=('unit', 'size')).reset_index().sort_values(['sector', 'n'], ascending=[True, False])
for i, h in enumerate(['Activity (as in dataset)', 'Sector', 'Unit type (analyst classification)', 'Units in dataset', 'Basis of classification'], start=1):
    c = wsM.cell(1, i, h); c.font = f(9, True, 'FFFFFF'); c.fill = fill(BLUE); c.alignment = CENTER; c.border = BORDER
wsM.row_dimensions[1].height = 30
basis = {
    'A': 'Recurring input / cultivation support: seeds, planting material, demonstration plots, plantation, fodder, small kits. Subsidy is a small share of the farm investment.',
    'B': 'Machinery and equipment owned by an individual beneficiary or service provider.',
    'C': 'Asset-based production unit or on-farm infrastructure (sheds, farms, ponds, polyhouses, nurseries, irrigation, water storage).',
    'D': 'Aggregation, processing, storage, marketing or collective institutions (FPO/SHG/CHC/RBSH, mills, cold chain, grading, machinery banks).',
}
for i, (_, a) in enumerate(acts.iterrows(), start=2):
    t = classify(a.activity)
    body(wsM, i, 1, [a.activity, a.sector, t, f'=COUNTIF({U("B")},A{i})', basis[t[0]]], [None, None, None, FMT_INT, None])
    wsM.row_dimensions[i].height = 24
for k, w in {'A': 70, 'B': 16, 'C': 38, 'D': 12, 'E': 80}.items():
    wsM.column_dimensions[k].width = w
wsM.freeze_panes = 'A2'
n_acts = len(acts)
act_list = acts.activity.tolist()
sectors = sorted(df.sector.unique())
unit_types = sorted(df.unit_type.unique())
districts_order = None  # set later from pandas

# ================================================================ Benchmarks
wsB = wb.create_sheet('Benchmarks')
wsB.sheet_view.showGridLines = False
title(wsB, 'B2', 'Peer-group benchmarks (scored units only)',
      'Percentiles are computed over scored units of the same activity. Where an activity has fewer than MIN_PEER scored units, the sector benchmark is used ("effective" columns, which feed Unit_Data).')
hdr = ['#', 'Activity', 'Sector', 'Unit type', 'Scored units', 'Peer group used',
       'Act. P50 profit', 'Act. P75 profit', 'Act. P99 profit', 'Act. P50 person-days', 'Act. P75 person-days', 'Act. P99 person-days',
       'Act. P50 profit/Rs', 'Act. P75 profit/Rs', 'Act. P99 revenue',
       'Eff. P50 profit', 'Eff. P75 profit', 'Eff. P99 profit', 'Eff. P50 person-days', 'Eff. P75 person-days', 'Eff. P99 person-days',
       'Eff. P50 profit/Rs', 'Eff. P75 profit/Rs', 'Eff. P99 revenue']
header_row(wsB, 5, 1, hdr, height=42)
for j in range(16, 25):
    wsB.cell(5, j).fill = fill(DBLUE)
SEC_HDR = BM_FIRST + n_acts + 3          # sector block header row
SEC_FIRST = SEC_HDR + 1
SEC_LAST = SEC_FIRST + len(sectors) - 1

def agg(col_src, cond_col, cond_cell, k, func=16):
    return f'=IFERROR(_xlfn.AGGREGATE({func},6,{U(col_src)}/(({U(cond_col)}={cond_cell})*({U("S")}=1)),{k}),"")'

stat_cols = [('L', 0.5), ('L', 0.75), ('L', 'WINSOR_P'), ('P', 0.5), ('P', 0.75), ('P', 'WINSOR_P'), ('W', 0.5), ('W', 0.75), ('K', 'WINSOR_P')]
for i, a in enumerate(act_list):
    r = BM_FIRST + i
    body(wsB, r, 1, [i + 1, a, f'=INDEX(Activity_Map!$B$2:$B$200,MATCH(B{r},Activity_Map!$A$2:$A$200,0))',
                     f'=INDEX(Activity_Map!$C$2:$C$200,MATCH(B{r},Activity_Map!$A$2:$A$200,0))',
                     f'=COUNTIFS({U("B")},B{r},{U("S")},1)', f'=IF(E{r}>=MIN_PEER,"Activity","Sector")'],
         ['0', None, None, None, FMT_INT, None])
    for j, (src, k) in enumerate(stat_cols):
        c = wsB.cell(r, 7 + j, agg(src, 'B', f'$B{r}', k))
        c.font = f(9); c.border = BORDER; c.number_format = FMT_2 if src == 'W' else FMT_INT
    for j in range(9):
        actcol = L(7 + j); seccol = L(7 + j)
        c = wsB.cell(r, 16 + j, f'=IF($F{r}="Activity",{actcol}{r},INDEX(${seccol}${SEC_FIRST}:${seccol}${SEC_LAST},MATCH($C{r},$C${SEC_FIRST}:$C${SEC_LAST},0)))')
        c.font = f(9); c.border = BORDER; c.fill = fill(LBLUE); c.number_format = FMT_2 if j in (6, 7) else FMT_INT
wsB.cell(SEC_HDR, 2, 'Sector-level benchmarks (fallback peer group)').font = f(11, True, BLUE)
header_row(wsB, SEC_HDR, 3, ['Sector'], height=18)
for j, h in enumerate(hdr[4:15]):
    c = wsB.cell(SEC_HDR, 5 + j, h.replace('Act. ', 'Sector ')); c.font = f(9, True, 'FFFFFF'); c.fill = fill(BLUE); c.alignment = CENTER; c.border = BORDER
for i, s in enumerate(sectors):
    r = SEC_FIRST + i
    body(wsB, r, 3, [s, f'=COUNTIFS({U("C")},C{r},{U("S")},1)', 'Sector'], [None, FMT_INT, None])
    for j, (src, k) in enumerate(stat_cols):
        c = wsB.cell(r, 7 + j, agg(src, 'C', f'$C{r}', k))
        c.font = f(9); c.border = BORDER; c.number_format = FMT_2 if src == 'W' else FMT_INT
for k, w in {'A': 4, 'B': 52, 'C': 15, 'D': 30, 'E': 9, 'F': 10}.items():
    wsB.column_dimensions[k].width = w
for j in range(7, 25):
    wsB.column_dimensions[L(j)].width = 11
wsB.freeze_panes = 'C6'

# ================================================================ Activity_Analysis
wsX = wb.create_sheet('Activity_Analysis')
wsX.sheet_view.showGridLines = False
title(wsX, 'B2', 'Activity-level performance (all 121 activities)',
      'Portfolio metrics use winsorised outputs. Rankings and the reallocation scenario consider only activities with at least MIN_PEER scored units ("eligible").')
xh = ['#', 'Activity', 'Sector', 'Unit type', 'Units', 'Non-functional %', 'Scored units', 'High %', 'Low %', 'Zero-revenue %',
      'Subsidy (Rs cr)', 'Profit, winsorised (Rs cr)', 'Profit per Rs 1 subsidy', 'Subsidy payback (years)', 'Person-days, winsorised (lakh)',
      'Person-days per Rs 1 lakh', 'Median months functional', 'Eligible (scored >= MIN_PEER)', 'Rank by return (eligible)',
      'Return quartile within unit type', 'Gestation / zero-output flag']
header_row(wsX, 5, 1, xh, height=42)
AX_FIRST = 6
AX_LAST = AX_FIRST + n_acts - 1
X = lambda col: f"Activity_Analysis!${col}${AX_FIRST}:${col}${AX_LAST}"
for i, a in enumerate(act_list):
    r = AX_FIRST + i
    rowvals = [i + 1, a,
               f'=INDEX(Activity_Map!$B$2:$B$200,MATCH(B{r},Activity_Map!$A$2:$A$200,0))',
               f'=INDEX(Activity_Map!$C$2:$C$200,MATCH(B{r},Activity_Map!$A$2:$A$200,0))',
               f'=COUNTIF({U("B")},B{r})',
               f'=1-COUNTIFS({U("B")},B{r},{U("Q")},1)/E{r}',
               f'=COUNTIFS({U("B")},B{r},{U("S")},1)',
               f'=IF(G{r}=0,"",COUNTIFS({U("B")},B{r},{U("AE")},"High")/G{r})',
               f'=IF(G{r}=0,"",COUNTIFS({U("B")},B{r},{U("AE")},"Low")/G{r})',
               f'=IF(G{r}=0,"",COUNTIFS({U("B")},B{r},{U("S")},1,{U("K")},0)/G{r})',
               f'=SUMIFS({U("O")},{U("B")},B{r},{U("S")},1)/CRORE',
               f'=SUMIFS({U("AF")},{U("B")},B{r},{U("S")},1)/CRORE',
               f'=IF(K{r}=0,"",L{r}/K{r})',
               f'=IF(OR(L{r}=0,K{r}=0),"",K{r}/L{r})',
               f'=SUMIFS({U("AG")},{U("B")},B{r},{U("S")},1)/LAKH',
               f'=IF(K{r}=0,"",O{r}*LAKH/(K{r}*CRORE)*LAKH)',
               f'=IFERROR(_xlfn.AGGREGATE(17,6,{U("V")}/(({U("B")}=$B{r})*({U("S")}=1)),2),"")',
               f'=IF(G{r}>=MIN_PEER,1,0)',
               f'=IF(R{r}=1,1+COUNTIFS({X("R")},1,{X("M")},">"&M{r}),"")',
               f'=IF(R{r}=1,IF(M{r}<=INDEX(Scenario!$D$6:$D$9,MATCH(D{r},Scenario!$B$6:$B$9,0)),"Bottom quartile",IF(M{r}>=INDEX(Scenario!$E$6:$E$9,MATCH(D{r},Scenario!$B$6:$B$9,0)),"Top quartile","Middle")),"")',
               f'=IF(G{r}=0,"",IF(J{r}>=GEST_CUT,"Yes",""))']
    body(wsX, r, 1, rowvals, ['0', None, None, None, FMT_INT, FMT_PCT, FMT_INT, FMT_PCT, FMT_PCT, FMT_PCT, FMT_CR, FMT_CR, FMT_2, FMT_1, FMT_CR, FMT_INT, FMT_1, '0', '0', None, None])
for k, w in {'A': 4, 'B': 52, 'C': 15, 'D': 30, 'E': 8, 'F': 10, 'G': 8, 'H': 8, 'I': 8, 'J': 10, 'K': 10, 'L': 11, 'M': 10, 'N': 10, 'O': 11, 'P': 11, 'Q': 10, 'R': 10, 'S': 9, 'T': 16, 'U': 12}.items():
    wsX.column_dimensions[k].width = w
wsX.freeze_panes = 'C6'
wsX.auto_filter.ref = f"A5:U{AX_LAST}"

# ================================================================ Scenario
wsS = wb.create_sheet('Scenario')
wsS.sheet_view.showGridLines = False
title(wsS, 'B2', 'Illustrative reallocation scenario: shift SHIFT_PCT of bottom-quartile outlay to top-quartile activities of the same unit type',
      'Return quartiles are computed across eligible activities within each unit type (Activity_Analysis column T). Like-for-like: a polyhouse is compared with other asset-based units, not with seed kits.')
sh = ['Unit type', 'Eligible activities', 'Q1 return (profit per Rs)', 'Q3 return (profit per Rs)',
      'Bottom-quartile activities', 'Bottom outlay (Rs cr)', 'Bottom profit (Rs cr)', 'Bottom person-days (lakh)', 'Bottom return', 'Bottom person-days per Rs lakh',
      'Top-quartile activities', 'Top outlay (Rs cr)', 'Top profit (Rs cr)', 'Top person-days (lakh)', 'Top return', 'Top person-days per Rs lakh',
      'Outlay shifted (Rs cr)', 'Change in annual profit (Rs cr)', 'Change in annual person-days (lakh)']
header_row(wsS, 5, 2, sh, height=48)
for i, t in enumerate(unit_types):
    r = 6 + i
    vals = [t,
            f'=COUNTIFS({X("D")},B{r},{X("R")},1)',
            f'=IFERROR(_xlfn.AGGREGATE(16,6,{X("M")}/(({X("D")}=B{r})*({X("R")}=1)),0.25),"")',
            f'=IFERROR(_xlfn.AGGREGATE(16,6,{X("M")}/(({X("D")}=B{r})*({X("R")}=1)),0.75),"")',
            f'=COUNTIFS({X("D")},B{r},{X("T")},"Bottom quartile")',
            f'=SUMIFS({X("K")},{X("D")},B{r},{X("T")},"Bottom quartile")',
            f'=SUMIFS({X("L")},{X("D")},B{r},{X("T")},"Bottom quartile")',
            f'=SUMIFS({X("O")},{X("D")},B{r},{X("T")},"Bottom quartile")',
            f'=IF(G{r}=0,"",H{r}/G{r})',
            f'=IF(G{r}=0,"",I{r}*LAKH/(G{r}*CRORE)*LAKH)',
            f'=COUNTIFS({X("D")},B{r},{X("T")},"Top quartile")',
            f'=SUMIFS({X("K")},{X("D")},B{r},{X("T")},"Top quartile")',
            f'=SUMIFS({X("L")},{X("D")},B{r},{X("T")},"Top quartile")',
            f'=SUMIFS({X("O")},{X("D")},B{r},{X("T")},"Top quartile")',
            f'=IF(M{r}=0,"",N{r}/M{r})',
            f'=IF(M{r}=0,"",O{r}*LAKH/(M{r}*CRORE)*LAKH)',
            f'=SHIFT_PCT*G{r}',
            f'=R{r}*(P{r}-J{r})',
            f'=R{r}*CRORE*(Q{r}-K{r})/LAKH/LAKH']
    body(wsS, r, 2, vals, [None, '0', FMT_2, FMT_2, '0', FMT_CR, FMT_CR, FMT_CR, FMT_2, FMT_INT, '0', FMT_CR, FMT_CR, FMT_CR, FMT_2, FMT_INT, FMT_CR, FMT_CR, FMT_CR])
r = 6 + len(unit_types)
body(wsS, r, 2, ['Asset-based units only (types C + D)', f'=C8+C9', '', '', f'=F8+F9', f'=G8+G9', f'=H8+H9', f'=I8+I9', f'=IF(G{r}=0,"",H{r}/G{r})', f'=IF(G{r}=0,"",I{r}*LAKH/(G{r}*CRORE)*LAKH)',
                 f'=L8+L9', f'=M8+M9', f'=N8+N9', f'=O8+O9', f'=IF(M{r}=0,"",N{r}/M{r})', f'=IF(M{r}=0,"",O{r}*LAKH/(M{r}*CRORE)*LAKH)', f'=R8+R9', f'=S8+S9', f'=T8+T9'],
     [None, '0', None, None, '0', FMT_CR, FMT_CR, FMT_CR, FMT_2, FMT_INT, '0', FMT_CR, FMT_CR, FMT_CR, FMT_2, FMT_INT, FMT_CR, FMT_CR, FMT_CR], bold=True, fill_color=LBLUE)
SC_CD = r
r += 1
body(wsS, r, 2, ['All unit types', f'=SUM(C6:C9)', '', '', f'=SUM(F6:F9)', f'=SUM(G6:G9)', f'=SUM(H6:H9)', f'=SUM(I6:I9)', f'=IF(G{r}=0,"",H{r}/G{r})', f'=IF(G{r}=0,"",I{r}*LAKH/(G{r}*CRORE)*LAKH)',
                 f'=SUM(L6:L9)', f'=SUM(M6:M9)', f'=SUM(N6:N9)', f'=SUM(O6:O9)', f'=IF(M{r}=0,"",N{r}/M{r})', f'=IF(M{r}=0,"",O{r}*LAKH/(M{r}*CRORE)*LAKH)', f'=SUM(R6:R9)', f'=SUM(S6:S9)', f'=SUM(T6:T9)'],
     [None, '0', None, None, '0', FMT_CR, FMT_CR, FMT_CR, FMT_2, FMT_INT, '0', FMT_CR, FMT_CR, FMT_CR, FMT_2, FMT_INT, FMT_CR, FMT_CR, FMT_CR], bold=True, fill_color=LGREY)
SC_ALL = r
r += 2
wsS.cell(r, 2, 'Context totals (scored units)').font = f(11, True, BLUE); r += 1
body(wsS, r, 2, ['Total subsidy to scored units (Rs cr)', f'=SUMIFS({U("O")},{U("S")},1)/CRORE'], [None, FMT_CR]); SC_TOT_SUB = r; r += 1
body(wsS, r, 2, ['Total annual profit, winsorised (Rs cr)', f'=SUM({U("AF")})/CRORE'], [None, FMT_CR]); SC_TOT_PROF = r; r += 1
body(wsS, r, 2, ['Total annual person-days, winsorised (lakh)', f'=SUM({U("AG")})/LAKH'], [None, FMT_CR]); SC_TOT_EMP = r; r += 1
body(wsS, r, 2, ['Scenario (C + D): change in profit as % of total', f'=S{SC_CD}/C{SC_TOT_PROF}'], [None, FMT_PCT]); SC_PCT_PROF = r; r += 1
body(wsS, r, 2, ['Scenario (C + D): change in person-days as % of total', f'=T{SC_CD}/C{SC_TOT_EMP}'], [None, FMT_PCT]); SC_PCT_EMP = r; r += 2
wsS.cell(r, 2, 'Reading the scenario').font = f(11, True, BLUE); r += 1
for note in [
    'The scenario is a marginal, illustrative shift: it assumes the receiving activities can absorb more units at their current average return, and that activities flagged as gestation-lag (Activity_Analysis column U) are re-assessed on milestone metrics before any funds are withdrawn.',
    'Types A and B are shown for completeness but the headline uses C + D only: in input-support and machinery activities the subsidy is a small share of the real investment, so return ratios are inflated and not comparable across activities.',
    'A positive change in both profit and person-days means the shift does not trade employment for income; a negative person-day figure would flag the trade-off explicitly.',
]:
    wsS.cell(r, 2, note).font = f(9); wsS.merge_cells(start_row=r, start_column=2, end_row=r, end_column=12); wsS.cell(r, 2).alignment = WRAP; wsS.row_dimensions[r].height = 30; r += 1
wsS.column_dimensions['A'].width = 3
wsS.column_dimensions['B'].width = 40
for j in range(3, 21):
    wsS.column_dimensions[L(j)].width = 12

# ================================================================ Summary (template sheet)
ws = summary
# Sheet columns B..K are the visible template columns.
def sec_header(r, text):
    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=11)
    c = ws.cell(r, 2, text); c.font = f(11, True, 'FFFFFF'); c.fill = fill(BLUE); c.alignment = LEFTC
    for j in range(2, 12):
        ws.cell(r, j).fill = fill(BLUE); ws.cell(r, j).border = BORDER
    ws.row_dimensions[r].height = 22

def text_row(r, text, c1=2, c2=11, height=30, bold=False, color='000000', sz=9, fill_color=None, italic=False):
    ws.merge_cells(start_row=r, start_column=c1, end_row=r, end_column=c2)
    c = ws.cell(r, c1, text); c.font = f(sz, bold, color, italic); c.alignment = WRAP
    for j in range(c1, c2 + 1):
        ws.cell(r, j).border = NOB
        if fill_color:
            ws.cell(r, j).fill = fill(fill_color)
    ws.row_dimensions[r].height = height

def tbl_header(r, labels, spans=None):
    """labels across B..K; spans = list of (start_col, end_col) per label."""
    spans = spans or [(2 + i, 2 + i) for i in range(len(labels))]
    for lab, (a, b) in zip(labels, spans):
        if b > a:
            ws.merge_cells(start_row=r, start_column=a, end_row=r, end_column=b)
        for j in range(a, b + 1):
            ws.cell(r, j).fill = fill(DBLUE); ws.cell(r, j).border = BORDER
        c = ws.cell(r, a, lab); c.font = f(8.5, True, 'FFFFFF'); c.alignment = CENTER
    ws.row_dimensions[r].height = 32

def tbl_row(r, values, fmts, spans=None, bold=False, fill_color=None, height=16):
    spans = spans or [(2 + i, 2 + i) for i in range(len(values))]
    for v, fm, (a, b) in zip(values, fmts, spans):
        if b > a:
            ws.merge_cells(start_row=r, start_column=a, end_row=r, end_column=b)
        for j in range(a, b + 1):
            ws.cell(r, j).border = BORDER
            if fill_color:
                ws.cell(r, j).fill = fill(fill_color)
        c = ws.cell(r, a, v); c.font = f(8.5, bold)
        if fm:
            c.number_format = fm
        is_label = (isinstance(v, str) and not v.startswith('=')) or fm is None
        c.alignment = LEFTC if is_label else RIGHTC
        if is_label and isinstance(v, str) and not v.startswith('='):
            width = sum((ws.column_dimensions[L(j)].width or 10) for j in range(a, b + 1))
            lines = -(-len(v) // max(int(width * 1.15), 1))
            if lines > 1:
                c.alignment = Alignment(horizontal='left', vertical='center', wrap_text=True)
                height = max(height, 12 * lines + 4)
    ws.row_dimensions[r].height = height

# --- row 6: title band (template header row)
ws.merge_cells('B6:K6')
ws['B6'] = 'HADP Unit Performance Assessment  |  Summary of analysis (every figure is formula-linked to Unit_Data)'
ws['B6'].font = f(12, True, 'FFFFFF'); ws['B6'].alignment = LEFTC
for j in range(2, 12):
    ws.cell(6, j).fill = fill(BLUE)
ws.row_dimensions[6].height = 26
ws['B7'] = (f'="Source: HADP Kisan Sathi Output Tracking App unit-level dataset  |  "&TEXT(COUNTA({U("A")}),"#,##0")&" unit records  |  "'
            f'&COUNTA(Activity_Map!$A$2:$A$200)&" activities  |  7 sectors  |  20 districts  |  2 divisions  |  Analysis as of "&TEXT(AS_OF,"dd mmm yyyy")')
text_row(7, ws['B7'].value, height=16, color=GREY, italic=True)
text_row(8, 'Workbook map:  Summary (this sheet, all results)  >  Assumptions (weights, cut-offs, cleaning rules)  >  Unit_Data (86,674 rows: raw fields A-M, derived fields N-AN)  >  Activity_Map (unit-type classification)  >  Benchmarks (peer-group percentiles)  >  Activity_Analysis (121 activities)  >  Scenario (reallocation).', height=28, color=GREY)

r = 10
sec_header(r, '1.  What "performance" means for an HADP unit'); r += 1
text_row(r, 'A unit performs when it (a) is actually functional, (b) generates income for the beneficiary, (c) creates employment, and (d) does so efficiently relative to the public subsidy it received. Functionality is a gate (a non-functional unit has zero performance); the other three are weighted pillars of a single Unit Performance Index (UPI, 0-100). Because the 121 activities range from a Rs 250 seed kit to a Rs 12.5 crore CA store, every unit is scored against its own activity peer group, so the UPI identifies strong and weak units within like-for-like comparisons.', height=54); r += 1
text_row(r, 'Two lenses are therefore used: (1) UPI - relative, within peer group - to identify high and low performing units for recognition, support or recovery; (2) portfolio metrics - absolute profit and person-days per rupee of subsidy, functionality and zero-output rates - to compare activities, sectors and districts and to redesign allocation.', height=40); r += 2

sec_header(r, '2.  Metric framework, weights and rationale for prioritisation'); r += 1
tbl_header(r, ['Pillar', 'Unit-level metric', 'Unit_Data col.', 'Weight', 'Why it is prioritised this way'], [(2, 2), (3, 4), (5, 5), (6, 6), (7, 11)]); r += 1
for vals in [
    ['Subsidy efficiency', 'Annual profit per Rs 1 of sanctioned subsidy', 'W', '=W_EFF', 'The programme question is impact "relative to subsidy support". A fixed budget is being allocated, so return per rupee is the only metric that makes a Rs 500 seed kit and a Rs 16 lakh polyhouse comparable within their peer group, and it is the lens an allocation decision needs.'],
    ['Income generation', 'Annual profit (Rs)', 'L', '=W_INC', "HADP's stated outcome is a higher agriculture GSDP share, which flows from beneficiary income. Profit is preferred to revenue: revenue is inflated by pass-through trading (milk SHGs/FPOs report a median Rs 7 lakh revenue but Rs 1.4 lakh profit) and double-counts input cost."],
    ['Employment', 'Annual employment generated (person-days)', 'P', '=W_EMP', 'An explicit programme objective and the social-return dimension that profit misses (e.g. sheep/goat farms create 180+ person-days on modest profit). Weighted equal to income so the index does not reward capital-intensive, low-labour units by default.'],
    ['Gate: functionality', 'Functional Status', 'Q', 'Gate', 'A non-functional unit scores nothing; it is analysed through the functionality rate by sector, activity and district rather than inside the index.'],
    ['Not in the index', 'Revenue, profit margin, LMS training', 'K, M', '-', 'Margin is unreliable here (29% of functional records report profit above revenue) and revenue is a gross measure; training completion is a driver to be tested against performance, not an outcome.'],
]:
    tbl_row(r, vals, [None, None, None, '0%', None], [(2, 2), (3, 4), (5, 5), (6, 6), (7, 11)], height=44); r += 1
text_row(r, 'Scoring: each pillar is scored 0-3 against the unit\'s activity peer group (0 = no output; 1 = below peer median; 2 = median to 75th percentile; 3 = top quartile). UPI = (weighted score / 3) x 100. High performer: UPI >= 75; Low performer: UPI <= 25 (Assumptions). Activities with fewer than 30 scored units are benchmarked against their sector. Aggregate ratios cap each output at the activity 99th percentile so single data-entry errors cannot drive a conclusion.', height=44, fill_color=LGREY); r += 2

# --- Section 3: funnel
sec_header(r, '3.  Analysis universe and data quality'); r += 1
tbl_header(r, ['Step', 'Rule applied', 'Records', '% of all records', '% of previous step', 'Reading'], [(2, 2), (3, 5), (6, 6), (7, 7), (8, 8), (9, 11)]); r += 1
FUN0 = r
funnel = [
    ['All unit records', 'Rows in the OTA extract', f'=COUNTA({U("A")})', 'Complete beneficiary-unit universe across 7 sectors and 20 districts.'],
    ['Functional units', 'Functional Status = "Unit Functional"', f'=SUM({U("Q")})', 'Non-functional units carry no output fields; the gap to 100% is the functionality problem.'],
    ['Complete OTA output record', 'Employment, revenue and profit all reported', f'=SUM({U("R")})', 'Functional units with a partial OTA record are a monitoring gap, not a performance verdict.'],
    ['Scored units', 'Subsidy recorded and > 0, so efficiency is defined', f'=SUM({U("S")})', 'Universe for the Unit Performance Index and all portfolio ratios.'],
    ['   of which High performers', 'UPI >= HIGH_CUT', f'=COUNTIF({U("AE")},"High")', 'Top-quartile-type performance on the weighted pillars.'],
    ['   of which Moderate', 'LOW_CUT < UPI < HIGH_CUT', f'=COUNTIF({U("AE")},"Moderate")', ''],
    ['   of which Low performers', 'UPI <= LOW_CUT', f'=COUNTIF({U("AE")},"Low")', 'Zero or below-median output on most pillars; priority for support or recovery.'],
]
for i, (step, rule, formula, note) in enumerate(funnel):
    rr = r + i
    prev = f'=F{rr}/F{rr-1}' if 0 < i < 4 else (f'=F{rr}/F{FUN0+3}' if i >= 4 else '')
    tbl_row(rr, [step, rule, formula, f'=F{rr}/F{FUN0}', prev, note], [None, None, FMT_INT, FMT_PCT, FMT_PCT, None], [(2, 2), (3, 5), (6, 6), (7, 7), (8, 8), (9, 11)], height=24, bold=(i == 3), fill_color=(LBLUE if i == 3 else None))
FUN_ALL, FUN_FUNC, FUN_COMP, FUN_SCORED, FUN_HIGH, FUN_MOD, FUN_LOW = [FUN0 + i for i in range(7)]
r += len(funnel)
tbl_header(r, ['Data-quality flag (retained, not deleted)', 'Records', '% of functional', 'Implication'], [(2, 5), (6, 6), (7, 7), (8, 11)]); r += 1
flags = [
    ['Sanctioned subsidy exceeds unit cost', f'=SUM({U("AI")})', 'Subsidy is pegged to the benchmark cost and cannot exceed it; indicates data entry in either field. Keep subsidy as sanctioned, verify in the field.'],
    ['Profit exceeds revenue', f'=SUM({U("AJ")})', 'Logically impossible; makes margin unusable and argues for a validation rule in the OTA form.'],
    ['Functional-since date before 2023 (pre-dates HADP)', f'=SUM({U("AK")})', 'Date-field entry error; affects "months functional" for a few hundred units only.'],
    ['Scored units with zero output on all three fields', f'=SUM({U("AL")})', 'Functional and subsidised but producing nothing: first list for field follow-up.'],
    ['Non-numeric text in cost / subsidy / employment fields', f'=SUMPRODUCT(ISTEXT({U("H")})*1)+SUMPRODUCT(ISTEXT({U("I")})*1)+SUMPRODUCT(ISTEXT({U("J")})*1)', 'Values like "1.75.500" are treated as blank in the numeric columns.'],
    ['Functional units not scoreable (incomplete record or no subsidy)', f'=F{FUN_FUNC}-F{FUN_SCORED}', 'Roughly a third of functional units cannot be assessed: the single largest constraint on evidence-based allocation.'],
]
for lab, fx, note in flags:
    tbl_row(r, [lab, fx, f'=F{r}/F{FUN_FUNC}', note], [None, FMT_INT, FMT_PCT, None], [(2, 5), (6, 6), (7, 7), (8, 11)], height=28); r += 1
r += 1

# --- generic segment block
SEG_COLS = ['Segment', 'Units', 'Functional %', 'Scored units', 'High %', 'Low %', 'Subsidy, scored (Rs cr)', 'Profit per Rs 1 subsidy', 'Person-days per Rs 1 lakh', 'Zero-revenue % (scored)']
SEG_FMTS = [None, FMT_INT, FMT_PCT, FMT_INT, FMT_PCT, FMT_PCT, FMT_CR, FMT_2, FMT_INT, FMT_PCT]

def seg_formulas(col, label_cell, rr, last_col_kind='zero'):
    c = f'{U(col)}'
    if label_cell == '""':
        blank = f'({c}="")'
        base = [f'=SUMPRODUCT({blank}*1)',
                f'=SUMPRODUCT({blank}*({U("Q")}=1))/C{rr}',
                f'=SUMPRODUCT({blank}*({U("S")}=1))',
                f'=IF(E{rr}=0,"",SUMPRODUCT({blank}*({U("AE")}="High"))/E{rr})',
                f'=IF(E{rr}=0,"",SUMPRODUCT({blank}*({U("AE")}="Low"))/E{rr})',
                f'=SUMPRODUCT({blank}*({U("S")}=1),{U("O")})/CRORE',
                f'=IF(H{rr}=0,"",SUMPRODUCT({blank}*({U("S")}=1),{U("AF")})/CRORE/H{rr})',
                f'=IF(H{rr}=0,"",SUMPRODUCT({blank}*({U("S")}=1),{U("AG")})/(H{rr}*CRORE)*LAKH)']
        if last_col_kind == 'zero':
            base.append(f'=IF(E{rr}=0,"",SUMPRODUCT({blank}*({U("S")}=1)*({U("K")}=0))/E{rr})')
        elif last_col_kind == 'payback':
            base.append(f'=IF(OR(H{rr}=0,I{rr}=""),"",1/I{rr})')
        else:
            base.append(f'=IF(E{rr}=0,"",SUMPRODUCT({blank}*({U("S")}=1),{U("AD")})/E{rr})')
        return base
    if label_cell is None:
        label_cell = f'$B{rr}'
    base = [f'=COUNTIF({c},{label_cell})',
            f'=COUNTIFS({c},{label_cell},{U("Q")},1)/C{rr}',
            f'=COUNTIFS({c},{label_cell},{U("S")},1)',
            f'=IF(E{rr}=0,"",COUNTIFS({c},{label_cell},{U("AE")},"High")/E{rr})',
            f'=IF(E{rr}=0,"",COUNTIFS({c},{label_cell},{U("AE")},"Low")/E{rr})',
            f'=SUMIFS({U("O")},{c},{label_cell},{U("S")},1)/CRORE',
            f'=IF(H{rr}=0,"",SUMIFS({U("AF")},{c},{label_cell},{U("S")},1)/CRORE/H{rr})',
            f'=IF(H{rr}=0,"",SUMIFS({U("AG")},{c},{label_cell},{U("S")},1)/(H{rr}*CRORE)*LAKH)']
    if last_col_kind == 'zero':
        base.append(f'=IF(E{rr}=0,"",COUNTIFS({c},{label_cell},{U("S")},1,{U("K")},0)/E{rr})')
    elif last_col_kind == 'payback':
        base.append(f'=IF(OR(H{rr}=0,I{rr}=""),"",1/I{rr})')
    elif last_col_kind == 'upi':
        base.append(f'=IF(E{rr}=0,"",AVERAGEIFS({U("AD")},{c},{label_cell},{U("S")},1))')
    return base

def total_row(rr, first, last, last_col_kind='zero'):
    vals = ['Total',
            f'=SUM(C{first}:C{last})',
            f'=SUMPRODUCT(C{first}:C{last},D{first}:D{last})/C{rr}',
            f'=SUM(E{first}:E{last})',
            f'=COUNTIF({U("AE")},"High")/E{rr}',
            f'=COUNTIF({U("AE")},"Low")/E{rr}',
            f'=SUM(H{first}:H{last})',
            f'=SUM({U("AF")})/CRORE/H{rr}',
            f'=SUM({U("AG")})/(H{rr}*CRORE)*LAKH']
    if last_col_kind == 'zero':
        vals.append(f'=COUNTIFS({U("S")},1,{U("K")},0)/E{rr}')
    elif last_col_kind == 'payback':
        vals.append(f'=1/I{rr}')
    elif last_col_kind == 'upi':
        vals.append(f'=AVERAGEIFS({U("AD")},{U("S")},1)')
    tbl_row(rr, vals, SEG_FMTS[:-1] + ([FMT_1] if last_col_kind in ('payback', 'upi') else [FMT_PCT]), bold=True, fill_color=LBLUE)

def segment_block(r, title_text, col, labels, last_col_kind='zero', last_label='Zero-revenue % (scored)', note=None):
    sec_header(r, title_text); r += 1
    hdr = SEG_COLS[:-1] + [last_label]
    tbl_header(r, hdr); r += 1
    first = r
    for lab in labels:
        crit = None
        if isinstance(lab, tuple):
            lab, crit = lab
        tbl_row(r, [lab] + seg_formulas(col, crit, r, last_col_kind), SEG_FMTS[:-1] + ([FMT_1] if last_col_kind in ('payback', 'upi') else [FMT_PCT]), height=18)
        r += 1
    total_row(r, first, r - 1, last_col_kind); r += 1
    if note:
        text_row(r, note, height=30, color=GREY, italic=True); r += 1
    return r, first

SEC4 = r
r, SEC4_FIRST = segment_block(r, '4.  Performance by sector', 'C', sectors, note='Reading: High/Low shares are relative to each unit\'s own activity peers, so sector differences in "Low %" reflect zero-output units (Fisheries, Horticulture) rather than scale. Profit and person-days per rupee are absolute and shaped by the sector\'s activity mix: Agri is dominated by micro input support with high ratios.')
r += 1
SEC5 = r
r, SEC5_FIRST = segment_block(r, '5.  Performance by unit type (analyst classification of the 121 activities - see Activity_Map)', 'T', unit_types, note='Reading: input support is 58% of scored units but 5% of outlay and still a quarter of profit and employment; asset-based units (C) absorb 56% of outlay. Value-chain institutions (D) have the lowest Low-performer share and the highest median employment per unit.')
r += 1
SEC6 = r
r, SEC6_FIRST = segment_block(r, '6.  Performance by subsidy size tier', 'U', tier_lbls + ['Not recorded'], last_col_kind='payback', last_label='Subsidy payback (years = subsidy / annual profit)', note='Reading: return per rupee falls steeply with ticket size because micro subsidies leverage the farmer\'s own land, labour and capital (which the ratio ignores). This is the central trade-off: per-rupee efficiency favours small tickets; absolute impact and value-chain goals need large ones. The UPI neutralises it by scoring within peer groups.')
r += 1
SEC7 = r
r, SEC7_FIRST = segment_block(r, '7.  Performance by division', 'D', sorted(df.division.unique()))
r += 1

# --- Section 8: district
s_tmp = pd.read_pickle('/tmp/hadp/scored.pkl')
districts_order = s_tmp[s_tmp.scored].groupby('district').upi.mean().sort_values(ascending=False).index.tolist()
sec_header(r, '8.  Performance by district (sorted by mean UPI of scored units)'); r += 1
tbl_header(r, ['District', 'Division', 'Units', 'Functional %', 'Scored units', 'High %', 'Low %', 'Mean UPI (scored)', 'Profit per Rs 1 subsidy', 'Person-days per Rs 1 lakh']); r += 1
SEC8_FIRST = r
for d in districts_order:
    c = U('E')
    vals = [d, f'=INDEX({U("D")},MATCH(B{r},{c},0))', f'=COUNTIF({c},$B{r})', f'=COUNTIFS({c},$B{r},{U("Q")},1)/D{r}', f'=COUNTIFS({c},$B{r},{U("S")},1)',
            f'=IF(F{r}=0,"",COUNTIFS({c},$B{r},{U("AE")},"High")/F{r})', f'=IF(F{r}=0,"",COUNTIFS({c},$B{r},{U("AE")},"Low")/F{r})',
            f'=IF(F{r}=0,"",AVERAGEIFS({U("AD")},{c},$B{r},{U("S")},1))',
            f'=IF(SUMIFS({U("O")},{c},$B{r},{U("S")},1)=0,"",SUMIFS({U("AF")},{c},$B{r},{U("S")},1)/SUMIFS({U("O")},{c},$B{r},{U("S")},1))',
            f'=IF(SUMIFS({U("O")},{c},$B{r},{U("S")},1)=0,"",SUMIFS({U("AG")},{c},$B{r},{U("S")},1)/SUMIFS({U("O")},{c},$B{r},{U("S")},1)*LAKH)']
    tbl_row(r, vals, [None, None, FMT_INT, FMT_PCT, FMT_INT, FMT_PCT, FMT_PCT, FMT_1, FMT_2, FMT_INT], height=16); r += 1
SEC8_LAST = r - 1
tbl_row(r, ['Spread across districts (max - min)', '', f'=MAX(D{SEC8_FIRST}:D{SEC8_LAST})-MIN(D{SEC8_FIRST}:D{SEC8_LAST})', f'=MAX(E{SEC8_FIRST}:E{SEC8_LAST})-MIN(E{SEC8_FIRST}:E{SEC8_LAST})', '',
            f'=MAX(G{SEC8_FIRST}:G{SEC8_LAST})-MIN(G{SEC8_FIRST}:G{SEC8_LAST})', f'=MAX(H{SEC8_FIRST}:H{SEC8_LAST})-MIN(H{SEC8_FIRST}:H{SEC8_LAST})', f'=MAX(I{SEC8_FIRST}:I{SEC8_LAST})-MIN(I{SEC8_FIRST}:I{SEC8_LAST})',
            f'=MAX(J{SEC8_FIRST}:J{SEC8_LAST})-MIN(J{SEC8_FIRST}:J{SEC8_LAST})', f'=MAX(K{SEC8_FIRST}:K{SEC8_LAST})-MIN(K{SEC8_FIRST}:K{SEC8_LAST})'],
        [None, None, FMT_INT, FMT_PCT, None, FMT_PCT, FMT_PCT, FMT_1, FMT_2, FMT_INT], bold=True, fill_color=LBLUE)
SEC8_SPREAD = r; r += 1
text_row(r, 'Reading: district is a weak explanatory dimension - mean UPI sits in a narrow band and functionality varies by about four percentage points. Kashmir division shows a slightly higher return per rupee and a lower Low-performer share, driven by activity mix; the real geographic signal is in activity x division (e.g. Sericulture is 37% functional in Kashmir against 91% in Jammu - see Unit_Data filters).', height=40, color=GREY, italic=True); r += 2

# --- Section 9: training
SEC9 = r
r, SEC9_FIRST = segment_block(r, '9.  LMS training completion and performance', 'M', ['Yes', 'No', ('Not recorded', '""')], last_col_kind='upi', last_label='Mean UPI (scored)', note='Reading: training completion shows no measurable difference in UPI, return per rupee or functionality. Either the course is not the binding constraint or completion is not translating into practice; content and targeting need review before training is made a condition for more units.')
r += 1

# --- Section 10: trade-offs crosstab
sec_header(r, '10.  Trade-off evidence: income vs employment (scored units, pillar scores 0-3)'); r += 1
tbl_header(r, ['Income score  \u2193   /   Employment score  \u2192', '0 (none)', '1 (< P50)', '2 (P50-P75)', '3 (>= P75)', 'Row total', 'Row share of scored'], [(2, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 11)]); r += 1
XT_FIRST = r
for inc in range(4):
    vals = [f'Income score {inc}'] + [f'=COUNTIFS({U("AA")},{inc},{U("AB")},{emp})' for emp in range(4)] + [f'=SUM(E{r}:H{r})', f'=I{r}/F${FUN_SCORED}']
    tbl_row(r, vals, [None, FMT_INT, FMT_INT, FMT_INT, FMT_INT, FMT_INT, FMT_PCT], [(2, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 11)], height=16); r += 1
XT_LAST = r - 1
tbl_row(r, ['Column total'] + [f'=SUM({L(5+j)}{XT_FIRST}:{L(5+j)}{XT_LAST})' for j in range(4)] + [f'=SUM(I{XT_FIRST}:I{XT_LAST})', f'=I{r}/F${FUN_SCORED}'],
        [None, FMT_INT, FMT_INT, FMT_INT, FMT_INT, FMT_INT, FMT_PCT], [(2, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 11)], bold=True, fill_color=LBLUE); r += 1
TO1 = r
tbl_row(r, ['Top-quartile income but at or below peer-median employment (income score 3, employment score <= 1)', f'=(E{XT_FIRST+3}+F{XT_FIRST+3})/F{FUN_SCORED}'], [None, FMT_PCT], [(2, 9), (10, 11)], height=20); r += 1
TO2 = r
tbl_row(r, ['Top-quartile employment but at or below peer-median income (employment score 3, income score <= 1)', f'=(H{XT_FIRST}+H{XT_FIRST+1})/F{FUN_SCORED}'], [None, FMT_PCT], [(2, 9), (10, 11)], height=20); r += 1
TO3 = r
tbl_row(r, ['High performers that are above peer median on BOTH income and employment', f'=COUNTIFS({U("AE")},"High",{U("AA")},">=2",{U("AB")},">=2")/F{FUN_HIGH}'], [None, FMT_PCT], [(2, 9), (10, 11)], height=20); r += 1
TO4 = r
tbl_row(r, ['Subsidy held by Low performers (Rs cr)  |  Subsidy held by scored units with zero revenue (Rs cr)', f'=SUMIFS({U("O")},{U("AE")},"Low")/CRORE', f'=SUMIFS({U("O")},{U("S")},1,{U("K")},0)/CRORE'], [None, FMT_CR, FMT_CR], [(2, 9), (10, 10), (11, 11)], height=20); r += 1
text_row(r, 'Reading: income and employment rank different units - roughly one in eight scored units is top-quartile on income while below median on employment, and a similar share the reverse. A single "best" metric would hide one of the two; the weighted index keeps both visible, and the choice of weights (Assumptions) is where the policy trade-off is made explicit.', height=40, color=GREY, italic=True); r += 2

# --- Section 11: activity ranking
sec_header(r, '11.  Activities ranked by return on subsidy (activities with at least 30 scored units; winsorised outputs)'); r += 1
act_hdr = ['Rank', 'Activity', 'Sector', 'Unit type', 'Scored units', 'Subsidy (Rs cr)', 'Profit per Rs 1 subsidy', 'Person-days per Rs 1 lakh', 'Zero-revenue %']
act_spans = [(2, 2), (3, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10), (11, 11)]
act_fmts = ['0', None, None, None, FMT_INT, FMT_CR, FMT_2, FMT_INT, FMT_PCT]
N_ELIG = f'SUM({X("R")})'
tbl_header(r, act_hdr, act_spans); r += 1
text_row(r, 'Top 10 by return', height=14, bold=True, color=BLUE); r += 1
ACT_TOP = r
def act_row(rr, rank_expr):
    m = f'MATCH({rank_expr},{X("S")},0)'
    return [f'={rank_expr}', f'=INDEX({X("B")},{m})', f'=INDEX({X("C")},{m})', f'=INDEX({X("D")},{m})', f'=INDEX({X("G")},{m})',
            f'=INDEX({X("K")},{m})', f'=INDEX({X("M")},{m})', f'=INDEX({X("P")},{m})', f'=INDEX({X("J")},{m})']
for k in range(1, 11):
    tbl_row(r, act_row(r, k), act_fmts, act_spans, height=30); r += 1
text_row(r, 'Bottom 10 by return (rank counted from the lowest)', height=14, bold=True, color=ORANGE); r += 1
ACT_BOT = r
for k in range(1, 11):
    vals = act_row(r, f'{N_ELIG}-{k-1}')
    tbl_row(r, vals, act_fmts, act_spans, height=30); r += 1
text_row(r, 'Reading: the top of the table is micro input support (seed, niche-crop area expansion, garlic), where the subsidy is a sliver of the farm investment, so ratios are high by construction. The bottom is dominated by large asset units with long gestation or no direct income (mother blocks, heifer rearing, fisheries ponds, roof-top water harvesting) and by hi-tech protected cultivation, where a Rs 16 lakh median subsidy earns a Rs 60,000 median profit. Column K separates "not yet producing" from "producing little".', height=52, color=GREY, italic=True); r += 2

# --- Section 12: top / bottom units
sec_header(r, '12.  Unit level: strongest High performers and the Low performers holding the most subsidy'); r += 1
unit_hdr = ['Unit no.', 'Activity', 'Sector', 'District', 'Subsidy (Rs)', 'Annual profit (Rs)', 'Person-days', 'UPI', 'Months functional']
unit_spans = [(2, 2), (3, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10), (11, 11)]
unit_fmts = ['0', None, None, None, FMT_RS, FMT_RS, FMT_INT, FMT_1, FMT_1]
tbl_header(r, unit_hdr, unit_spans); r += 1
text_row(r, 'Top 10 High performers by annual profit (internally consistent records only: profit <= revenue, subsidy between 5% and 100% of unit cost)', height=14, bold=True, color=BLUE); r += 1
UNIT_TOP = r
def unit_row(rr, helper_col, k):
    m = f'MATCH(LARGE({U(helper_col)},{k}),{U(helper_col)},0)'
    return [f'=INDEX({U("A")},{m})', f'=INDEX({U("B")},{m})', f'=INDEX({U("C")},{m})', f'=INDEX({U("E")},{m})', f'=INDEX({U("O")},{m})',
            f'=INDEX({U("L")},{m})', f'=INDEX({U("P")},{m})', f'=INDEX({U("AD")},{m})', f'=INDEX({U("V")},{m})']
for k in range(1, 11):
    tbl_row(r, unit_row(r, 'AM', k), unit_fmts, unit_spans, height=30); r += 1
text_row(r, 'Low performers with the largest sanctioned subsidy (recovery / verification list)', height=14, bold=True, color=ORANGE); r += 1
UNIT_BOT = r
for k in range(1, 11):
    tbl_row(r, unit_row(r, 'AN', k), unit_fmts, unit_spans, height=30); r += 1
r += 1

# --- Section 13: scenario
sec_header(r, '13.  Reallocation scenario: move 20% of bottom-quartile outlay to top-quartile activities within the same unit type (Scenario sheet)'); r += 1
tbl_header(r, ['Unit type', 'Bottom-quartile activities', 'Bottom outlay (Rs cr)', 'Bottom return', 'Top-quartile activities', 'Top outlay (Rs cr)', 'Top return', 'Outlay shifted (Rs cr)', 'Change in annual profit (Rs cr)', 'Change in annual person-days (lakh)']); r += 1
SCN_FIRST = r
for i in range(4):
    sr = 6 + i
    tbl_row(r, [f'=Scenario!B{sr}', f'=Scenario!F{sr}', f'=Scenario!G{sr}', f'=Scenario!J{sr}', f'=Scenario!L{sr}', f'=Scenario!M{sr}', f'=Scenario!P{sr}', f'=Scenario!R{sr}', f'=Scenario!S{sr}', f'=Scenario!T{sr}'],
            [None, '0', FMT_CR, FMT_2, '0', FMT_CR, FMT_2, FMT_CR, FMT_CR, FMT_CR], height=18); r += 1
tbl_row(r, ['Asset-based units (C + D) - headline', f'=Scenario!F{SC_CD}', f'=Scenario!G{SC_CD}', f'=Scenario!J{SC_CD}', f'=Scenario!L{SC_CD}', f'=Scenario!M{SC_CD}', f'=Scenario!P{SC_CD}', f'=Scenario!R{SC_CD}', f'=Scenario!S{SC_CD}', f'=Scenario!T{SC_CD}'],
        [None, '0', FMT_CR, FMT_2, '0', FMT_CR, FMT_2, FMT_CR, FMT_CR, FMT_CR], bold=True, fill_color=LBLUE); SCN_CD = r; r += 1
tbl_row(r, ['Headline as % of total annual profit and person-days of scored units', '', '', '', '', '', '', '', f'=Scenario!C{SC_PCT_PROF}', f'=Scenario!C{SC_PCT_EMP}'],
        [None, None, None, None, None, None, None, None, FMT_PCT, FMT_PCT], bold=True); SCN_PCT = r; r += 1
text_row(r, 'Reading: a modest, like-for-like shift inside asset-based unit types raises both profit and employment, so the reallocation does not trade one objective for the other. Gestation-flagged activities (Activity_Analysis col. U) should be moved to milestone metrics before funds are withdrawn; the scenario is a direction of travel, not a budget.', height=40, color=GREY, italic=True); r += 2

# --- Section 14: recommendations
sec_header(r, '14.  Recommendations'); r += 1
tbl_header(r, ['Area', 'Recommendation', 'Evidence in this workbook'], [(2, 3), (4, 8), (9, 11)]); r += 1
recs = [
    ['Allocation design', 'Link the back-ended tranche to verified output: release 70% on establishment and 30% on OTA-verified output at 12 months for medium and large units (tiers T3-T4, which hold 85% of outlay).', 'Section 6: return falls from Rs 4.9 to Rs 0.07 per rupee across tiers; payback for T4 is ~15 years.'],
    ['Allocation design', 'Re-direct the marginal rupee within each unit type towards activities in the top half of return with functionality above 90%; cap expansion of bottom-quartile activities until a milestone framework exists.', 'Section 11 and 13: moving 20% of bottom-quartile outlay in types C+D lifts profit and person-days together.'],
    ['Allocation design', 'Measure long-gestation assets (orchards, mother blocks, root-stock banks, heifer units) on milestones - plant survival, establishment, first calving - not annual revenue, and release the final tranche on milestone evidence.', 'Activity_Analysis col. U: 56-80% of these units report zero revenue at ~21 months.'],
    ['Allocation design', 'Protect and scale the low-ticket input portfolio (58% of units, 5% of outlay, ~25% of profit and employment) but tie it to a functionality screen: seed, compost-bag and fodder-in-orchard schemes lose 20-37% of units before they start.', 'Section 5 and Activity_Analysis col. F.'],
    ['Support to underperformers', 'Non-functional units (12% overall; Sericulture-Kashmir 63%, AH 20%): joint field verification and a time-bound revival or formal closure, so budgets are not held by dormant sanctions.', 'Section 4 and 7; Unit_Data filter Q = 0.'],
    ['Support to underperformers', 'Zero-output but functional units (~12% of scored, Rs 45 cr of subsidy): handholding by sector functionaries, market linkage through the nearest value-chain institution (RBSH, FPO, CFC) and a 6-month review.', 'Section 10 last row; Unit_Data flag AL and K = 0.'],
    ['Support to underperformers', 'Low performers with the largest subsidy (Section 12) - mostly fisheries ponds and large livestock units: technical audit (stocking, feed, water), input credit linkage and peer-mentoring from High performers of the same activity in the same district.', 'Section 12; Unit_Data band = Low sorted by subsidy.'],
    ['Support to underperformers', 'Re-design LMS training as outcome-linked modules per activity (there is no measurable performance gap between trained and untrained units today) and target it at units in the Low band.', 'Section 9.'],
    ['Measurement', 'Add OTA validation rules: subsidy <= unit cost, profit <= revenue, date >= sanction date, mandatory output fields; and a quarterly "scoreable share" KPI for every district.', 'Section 3: about a third of functional units cannot be scored; 29% report profit above revenue.'],
    ['Measurement', 'Publish the UPI and the peer-group benchmarks back to field functionaries so that every visit compares the unit with its own activity median.', 'Benchmarks sheet.'],
]
for a, rec, ev in recs:
    tbl_row(r, [a, rec, ev], [None, None, None], [(2, 3), (4, 8), (9, 11)], height=42); r += 1
LAST_ROW = r
print('Summary last row', LAST_ROW)
assert LAST_ROW < 560

# Hide the template's extra helper columns are already hidden; keep hidden rows as-is.
ws.sheet_view.showGridLines = False

# workbook-level
wb.calculation.fullCalcOnLoad = True
wb.active = 0
for _ws in (summary, wsA, wsM, wsB, wsX, wsS):
    _ws.page_setup.orientation = 'landscape'
    _ws.page_setup.fitToWidth = 1
    _ws.page_setup.fitToHeight = 0
    _ws.sheet_properties.pageSetUpPr.fitToPage = True
summary.print_area = f'B1:K{LAST_ROW}'
wsA.sheet_properties.tabColor = GREY
wsU.sheet_properties.tabColor = BLUE
wsM.sheet_properties.tabColor = GREY
wsB.sheet_properties.tabColor = GREY
wsX.sheet_properties.tabColor = ORANGE
wsS.sheet_properties.tabColor = ORANGE
summary.sheet_properties.tabColor = BLUE

import json, os
os.makedirs('/tmp/hadp/out', exist_ok=True)
meta = dict(FUN0=FUN0, FUN_ALL=FUN_ALL, FUN_FUNC=FUN_FUNC, FUN_COMP=FUN_COMP, FUN_SCORED=FUN_SCORED, FUN_HIGH=FUN_HIGH, FUN_MOD=FUN_MOD, FUN_LOW=FUN_LOW,
            SEC4_FIRST=SEC4_FIRST, SEC5_FIRST=SEC5_FIRST, SEC6_FIRST=SEC6_FIRST, SEC7_FIRST=SEC7_FIRST, SEC8_FIRST=SEC8_FIRST, SEC8_LAST=SEC8_LAST, SEC8_SPREAD=SEC8_SPREAD,
            SEC9_FIRST=SEC9_FIRST, XT_FIRST=XT_FIRST, TO1=TO1, TO2=TO2, TO3=TO3, TO4=TO4, ACT_TOP=ACT_TOP, ACT_BOT=ACT_BOT, UNIT_TOP=UNIT_TOP, UNIT_BOT=UNIT_BOT,
            SCN_FIRST=SCN_FIRST, SCN_CD=SCN_CD, SCN_PCT=SCN_PCT, SC_CD=SC_CD, SC_ALL=SC_ALL, SC_TOT_SUB=SC_TOT_SUB, SC_TOT_PROF=SC_TOT_PROF, SC_TOT_EMP=SC_TOT_EMP,
            SC_PCT_PROF=SC_PCT_PROF, SC_PCT_EMP=SC_PCT_EMP, AX_FIRST=AX_FIRST, AX_LAST=AX_LAST, LAST_ROW=LAST_ROW, districts_order=districts_order, sectors=sectors, unit_types=unit_types, tier_lbls=tier_lbls)
json.dump(meta, open('/tmp/hadp/out/meta.json', 'w'), indent=1)
print('saving ...')
wb.save(OUT)
print('saved', OUT, os.path.getsize(OUT) / 1e6, 'MB')
