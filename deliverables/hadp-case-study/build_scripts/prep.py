"""Shared data prep for the HADP analysis: load, coerce, classify, score (mirror of the Excel logic)."""
import pandas as pd, numpy as np, re

SRC = '/home/ubuntu/.cursor/projects/workspace/uploads/HADP_Unit-wise_data_a594.xlsx'
ASOF = pd.Timestamp('2026-11-11')

W_EFF, W_INC, W_EMP = 0.40, 0.30, 0.30
MIN_PEER = 30           # min scored units in an activity to use activity-level benchmarks
HIGH_CUT, LOW_CUT = 75, 25

TYPE_RULES = [
    # (unit type, regex) – first match wins; evaluated on lower-cased activity name
    ('D. Aggregation & value-chain institutions',
     r'fpo|shg|wshg|rural business|rbsh|custom hiring|chc|machinery bank|common facilitation|cfc|'
     r'honey collection|village seed bank|milk value addition|startup|skill|collection'),
    ('D. Aggregation & value-chain institutions',
     r'processing|canning|mill|oil|extractor|grading|reefer|refrigeration|cold stor|ca/cold|'
     r'packaging|storage structure|solar dryer|feed manufactur|fodder depot|hatchery|lit mother|'
     r'soil testing|spawn production|compost making|pasteurized compost making'),
    ('B. Machinery & equipment',
     r'machinery|mechaniz|equipment|csp'),
    ('C. Production & farm infrastructure',
     r'establish|unit|farm|shed|polyhouse|protected cultivation|hydroponic|heifer|free range|'
     r'nursery|mother block|root stock|rearing|irrigation infra|water storage|rain water|bore well|'
     r'poly|restaurant|ewes|poultry|vermicompost unit|compost'),
    ('A. Input & cultivation support', r'.*'),
]
TYPE_OVERRIDES = {
    'Application form for low Cost portable for vermicompost infra. (Farm waste recycling with microbial consortium for enhancing decomposition': 'A. Input & cultivation support',
    'Application form for spawn of mushroom': 'A. Input & cultivation support',
    'Application form for Bee hives with colonies': 'A. Input & cultivation support',
    'Application for availing Bee Colonies  ( one unit comprises 35 bee colonies @ 4000/colony)': 'C. Production & farm infrastructure',
    'Application for availing Pasteurized Compost Bags': 'A. Input & cultivation support',
    'Application form for Fodder slips/perennial grasses and legumes round the year': 'A. Input & cultivation support',
    'Application form for mineral mixture': 'A. Input & cultivation support',
    'Application form for poultry birds': 'A. Input & cultivation support',
    'Application form for repair of poultry sheds': 'A. Input & cultivation support',
    'Application forms for requirements for AI': 'A. Input & cultivation support',
    'Application form for Animal health camps': 'A. Input & cultivation support',
    'Application for establishment of MAP cultivation units': 'A. Input & cultivation support',
    'Application form for Construction of Infrastructure at Highland Pastures': 'A. Input & cultivation support',
    'Application for Fodder Production in orchards': 'A. Input & cultivation support',
    'Application for Establishment of fodder processing unit': 'C. Production & farm infrastructure',
    'Application for of varietal demonstration plot': 'A. Input & cultivation support',
    'Adoption & promotion of integrate farming system (IFS)/Integrated Livelihood systems (ILS) in UT of J&K: Project no.13': 'A. Input & cultivation support',
    'DEVELOMENT OF RAIN FED AREAS OF J&K:Project No.14': 'A. Input & cultivation support',
    'Application for rejuvinatnation of existing orchards': 'A. Input & cultivation support',
    'Post Covid Revival of Sick floriculture units': 'A. Input & cultivation support',
    'Application form for micro irrigation/water harvesting/inter linking roads, Ponds and Biogas': 'C. Production & farm infrastructure',
    'Application for Smart Agri Startup Skilling': 'A. Input & cultivation support',
    'Application Form for Skill Development in Bio-Pesticide': 'A. Input & cultivation support',
    'Application for FPO Registration': 'D. Aggregation & value-chain institutions',
    'Application for Registration of CSP - Individual': 'B. Machinery & equipment',
    'Application for Registration of CSP - Organizational': 'B. Machinery & equipment',
    'Application for Goat,Sheep and Backyard Poultry Units': 'C. Production & farm infrastructure',
    'Application for Establishment of Millet Restaurant': 'D. Aggregation & value-chain institutions',
    'Application for Establishment of Commercial Layer Farm': 'C. Production & farm infrastructure',
    'Application for Establishment of Composite Broiler Parent  Farm cum Hatchery and Feed Mill': 'C. Production & farm infrastructure',
    'Application for establishment of LIT Mother Unit': 'C. Production & farm infrastructure',
    'Application for Establishing  Apiculture Equipment Manufacturing Unit': 'D. Aggregation & value-chain institutions',
    'Application for Establishment of Mushroom Sheds (16*25*12 ft)': 'C. Production & farm infrastructure',
    'Application form for Revolving Fund for promotion of WSHG': 'D. Aggregation & value-chain institutions',
    'Application for Establishment of Pasteurized Compost Making Unit (15 MT)': 'D. Aggregation & value-chain institutions',
    'Establishment of Commercial vermicompost Unit': 'C. Production & farm infrastructure',
    'Application for Establishment of Spawn Production Labs 2 MT': 'D. Aggregation & value-chain institutions',
    'Application for Grain Storage Structures': 'D. Aggregation & value-chain institutions',
    'Application for Water Storage Structures(Storage Tanks,Portable Geo Tanks,Poly Tanks,Flexi Water Tanks': 'C. Production & farm infrastructure',
    'Application for Establishment of Fodder Depots': 'D. Aggregation & value-chain institutions',
    'Application for establishment of Feed Manufacturing Unit': 'D. Aggregation & value-chain institutions',
    'Application for Establishment of Cold Storage/ Ice Plant (Individual)': 'D. Aggregation & value-chain institutions',
    'Strengthening of existing nurseries': 'C. Production & farm infrastructure',
    'Construction of   Rearing  house  (460 Sq. Ft. Floor area) & supply of improved rearing equipments to farmers.': 'C. Production & farm infrastructure',
    'Application for Small Agro-procesiing(post-harvest handling & value addition) Units': 'D. Aggregation & value-chain institutions',
    'Establishment of Cold Storage/ Ice Plant (Individual)': 'D. Aggregation & value-chain institutions',
}


def classify(activity):
    if activity in TYPE_OVERRIDES:
        return TYPE_OVERRIDES[activity]
    a = activity.lower()
    for t, rx in TYPE_RULES:
        if re.search(rx, a):
            return t
    return 'A. Input & cultivation support'


def size_tier(sub):
    if pd.isna(sub) or sub <= 0:
        return 'Not recorded'
    if sub < 10_000:
        return 'T1 Micro (< Rs 10k)'
    if sub < 100_000:
        return 'T2 Small (Rs 10k - 1 lakh)'
    if sub < 1_000_000:
        return 'T3 Medium (Rs 1 - 10 lakh)'
    return 'T4 Large (> Rs 10 lakh)'


def load():
    df = pd.read_excel(SRC, header=3)
    df = df.loc[:, [c for c in df.columns if not str(c).startswith('Unnamed')]]
    df.columns = ['unit', 'activity', 'sector', 'division', 'district', 'status', 'since',
                  'ucost', 'subsidy', 'emp', 'rev', 'profit', 'training']
    raw_text = {}
    for c in ['ucost', 'subsidy', 'emp']:
        raw_text[c] = df[c].copy()
        df[c] = pd.to_numeric(df[c], errors='coerce')
    df['activity'] = df['activity'].str.strip()
    df['functional'] = df.status.eq('Unit Functional')
    df['complete'] = df.rev.notna() & df.profit.notna() & df.emp.notna()
    df['scored'] = df.functional & df.complete & (df.subsidy > 0)
    df['unit_type'] = df.activity.map(classify)
    df['size_tier'] = df.subsidy.map(size_tier)
    df['months'] = np.where(df.since.notna(), (ASOF - df.since).dt.days / 30.4375, np.nan)
    # flags
    df['f_sub_gt_cost'] = df.functional & (df.ucost > 0) & (df.subsidy > df.ucost)
    df['f_profit_gt_rev'] = df.functional & (df.profit > df.rev)
    df['f_old_date'] = df.functional & (df.since < '2023-01-01')
    df['f_zero_output'] = df.scored & (df.rev == 0) & (df.profit == 0) & (df.emp == 0)
    df['eff'] = np.where(df.scored, df.profit / df.subsidy, np.nan)
    df['emp_per_lakh'] = np.where(df.scored, df.emp / df.subsidy * 1e5, np.nan)
    df['sub_share'] = np.where(df.functional & (df.ucost > 0), df.subsidy / df.ucost, np.nan)
    return df


def benchmarks(df):
    """Activity-level P50/P75/P99 among scored units, with sector fallback when n < MIN_PEER."""
    s = df[df.scored]
    q = lambda p: (lambda x: x.quantile(p))
    act = s.groupby('activity').agg(sector=('sector', 'first'), n=('unit', 'size'),
                                    prof_p50=('profit', q(.5)), prof_p75=('profit', q(.75)), prof_p99=('profit', q(.99)),
                                    emp_p50=('emp', q(.5)), emp_p75=('emp', q(.75)), emp_p99=('emp', q(.99)),
                                    eff_p50=('eff', q(.5)), eff_p75=('eff', q(.75)),
                                    rev_p99=('rev', q(.99)))
    sec = s.groupby('sector').agg(n=('unit', 'size'),
                                  prof_p50=('profit', q(.5)), prof_p75=('profit', q(.75)), prof_p99=('profit', q(.99)),
                                  emp_p50=('emp', q(.5)), emp_p75=('emp', q(.75)), emp_p99=('emp', q(.99)),
                                  eff_p50=('eff', q(.5)), eff_p75=('eff', q(.75)),
                                  rev_p99=('rev', q(.99)))
    cols = ['prof_p50', 'prof_p75', 'prof_p99', 'emp_p50', 'emp_p75', 'emp_p99', 'eff_p50', 'eff_p75', 'rev_p99']
    eff = act.copy()
    use_sector = act.n < MIN_PEER
    for c in cols:
        eff[c] = np.where(use_sector, act.sector.map(sec[c]), act[c])
    eff['peer_group'] = np.where(use_sector, 'Sector', 'Activity')
    return act, sec, eff


def pillar_score(x, p50, p75):
    return np.select([x <= 0, x >= p75, x >= p50], [0, 3, 2], 1)


def score(df, eff):
    s = df.copy()
    b = eff.reindex(s.activity)
    for src, pre in [('profit', 'prof'), ('emp', 'emp'), ('eff', 'eff')]:
        s[f'sc_{pre}'] = np.where(s.scored, pillar_score(s[src].values, b[f'{pre}_p50'].values, b[f'{pre}_p75'].values), np.nan)
    s['upi'] = np.where(s.scored, (W_EFF * s.sc_eff + W_INC * s.sc_prof + W_EMP * s.sc_emp) / 3 * 100, np.nan)
    s['band'] = np.select([~s.functional, ~s.scored, s.upi >= HIGH_CUT, s.upi <= LOW_CUT],
                          ['Non-functional', 'Not scored (data gap)', 'High', 'Low'], 'Moderate')
    # winsorised outputs for aggregate ratios
    s['profit_w'] = np.where(s.scored, np.minimum(s.profit, b.prof_p99.values), np.nan)
    s['emp_w'] = np.where(s.scored, np.minimum(s.emp, b.emp_p99.values), np.nan)
    s['rev_w'] = np.where(s.scored, np.minimum(s.rev, b.rev_p99.values), np.nan)
    return s
