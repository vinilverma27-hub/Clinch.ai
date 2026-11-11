"""Compute every number used on the slide from the scored dataframe (mirrors the Excel formulas)."""
import pandas as pd, numpy as np, json
from prep import load, benchmarks, score, MIN_PEER

def compute():
    df = load()
    act, sec, eff = benchmarks(df)
    s = score(df, eff)
    sc = s[s.scored]
    F = {}
    F['n_all'] = len(s); F['n_func'] = int(s.functional.sum()); F['n_complete'] = int((s.functional & s.complete).sum()); F['n_scored'] = int(s.scored.sum())
    F['n_high'] = int((sc.band == 'High').sum()); F['n_mod'] = int((sc.band == 'Moderate').sum()); F['n_low'] = int((sc.band == 'Low').sum())
    F['pct_func'] = F['n_func'] / F['n_all']; F['pct_nonfunc'] = 1 - F['pct_func']
    F['n_unscoreable_func'] = F['n_func'] - F['n_scored']; F['pct_unscoreable_func'] = F['n_unscoreable_func'] / F['n_func']
    F['n_sub_gt_cost'] = int(s.f_sub_gt_cost.sum()); F['n_profit_gt_rev'] = int(s.f_profit_gt_rev.sum()); F['pct_profit_gt_rev'] = F['n_profit_gt_rev'] / F['n_func']
    F['n_zero_rev'] = int((sc.rev == 0).sum()); F['pct_zero_rev'] = F['n_zero_rev'] / F['n_scored']
    F['sub_zero_rev_cr'] = sc[sc.rev == 0].subsidy.sum() / 1e7; F['sub_low_cr'] = sc[sc.band == 'Low'].subsidy.sum() / 1e7
    F['tot_sub_cr'] = sc.subsidy.sum() / 1e7; F['tot_profit_cr'] = sc.profit_w.sum() / 1e7; F['tot_emp_lakh'] = sc.emp_w.sum() / 1e5
    F['tot_ret'] = sc.profit_w.sum() / sc.subsidy.sum(); F['tot_pdl'] = sc.emp_w.sum() / sc.subsidy.sum() * 1e5

    def seg(col):
        out = {}
        for k, g in s.groupby(col):
            d = g[g.scored]
            out[k] = dict(units=len(g), func=g.functional.mean(), scored=len(d),
                          high=(d.band == 'High').mean() if len(d) else np.nan, low=(d.band == 'Low').mean() if len(d) else np.nan,
                          mod=(d.band == 'Moderate').mean() if len(d) else np.nan,
                          sub_cr=d.subsidy.sum() / 1e7, ret=d.profit_w.sum() / d.subsidy.sum() if d.subsidy.sum() else np.nan,
                          pdl=d.emp_w.sum() / d.subsidy.sum() * 1e5 if d.subsidy.sum() else np.nan,
                          zero_rev=(d.rev == 0).mean() if len(d) else np.nan, upi=d.upi.mean() if len(d) else np.nan,
                          med_emp=d.emp.median() if len(d) else np.nan, med_profit=d.profit.median() if len(d) else np.nan,
                          share_units=len(d) / len(sc), share_sub=d.subsidy.sum() / sc.subsidy.sum(),
                          share_profit=d.profit_w.sum() / sc.profit_w.sum(), share_emp=d.emp_w.sum() / sc.emp_w.sum())
        return out
    F['sector'] = seg('sector'); F['unit_type'] = seg('unit_type'); F['size_tier'] = seg('size_tier'); F['division'] = seg('division'); F['district'] = seg('district')
    F['training'] = seg(s.training.fillna('Not recorded').rename('training'))
    # trade-offs
    F['to_inc_not_emp'] = ((sc.sc_prof == 3) & (sc.sc_emp <= 1)).mean()
    F['to_emp_not_inc'] = ((sc.sc_emp == 3) & (sc.sc_prof <= 1)).mean()
    hi = sc[sc.band == 'High']; F['to_high_both'] = ((hi.sc_prof >= 2) & (hi.sc_emp >= 2)).mean()
    # activities
    def asumm(g):
        return pd.Series({'sector': g.sector.iloc[0], 'unit_type': g.unit_type.iloc[0], 'scored': len(g), 'sub_cr': g.subsidy.sum() / 1e7, 'profit_cr': g.profit_w.sum() / 1e7,
                          'ret': g.profit_w.sum() / g.subsidy.sum(), 'pdl': g.emp_w.sum() / g.subsidy.sum() * 1e5, 'zero_rev': (g.rev == 0).mean(),
                          'low': (g.band == 'Low').mean(), 'med_months': g.months.median(), 'med_sub': g.subsidy.median(), 'med_profit': g.profit.median()})
    A = sc.groupby('activity').apply(asumm)
    A['units'] = s.groupby('activity').size(); A['nonfunc'] = 1 - s.groupby('activity').functional.mean()
    A = A[A.scored >= MIN_PEER].sort_values('ret', ascending=False)
    A['rank'] = range(1, len(A) + 1)
    F['n_eligible'] = len(A)
    F['act_top'] = A.head(10).reset_index().to_dict('records'); F['act_bottom'] = A.tail(10).iloc[::-1].reset_index().to_dict('records')
    F['act_all'] = A.reset_index().to_dict('records')
    # scenario within unit type
    scen = {}
    for t, g in A.groupby('unit_type'):
        q1, q3 = g.ret.quantile([.25, .75])
        bot = g[g.ret <= q1]; top = g[g.ret >= q3]
        rb = bot.profit_cr.sum() / bot.sub_cr.sum(); rt = top.profit_cr.sum() / top.sub_cr.sum()
        pb = (sc[sc.activity.isin(bot.index)].emp_w.sum()) / (bot.sub_cr.sum() * 1e7) * 1e5
        pt = (sc[sc.activity.isin(top.index)].emp_w.sum()) / (top.sub_cr.sum() * 1e7) * 1e5
        shift = 0.2 * bot.sub_cr.sum()
        scen[t] = dict(n_bot=len(bot), out_bot=bot.sub_cr.sum(), ret_bot=rb, pdl_bot=pb, n_top=len(top), out_top=top.sub_cr.sum(), ret_top=rt, pdl_top=pt,
                       shift=shift, d_profit=shift * (rt - rb), d_emp=shift * 1e7 * (pt - pb) / 1e5 / 1e5, bot_acts=list(bot.index), top_acts=list(top.index))
    F['scenario'] = scen
    cd = [scen[t] for t in scen if t[0] in 'CD']
    F['scen_cd'] = dict(shift=sum(x['shift'] for x in cd), d_profit=sum(x['d_profit'] for x in cd), d_emp=sum(x['d_emp'] for x in cd),
                        n_bot=sum(x['n_bot'] for x in cd), n_top=sum(x['n_top'] for x in cd), out_bot=sum(x['out_bot'] for x in cd))
    F['scen_cd']['pct_profit'] = F['scen_cd']['d_profit'] / F['tot_profit_cr']; F['scen_cd']['pct_emp'] = F['scen_cd']['d_emp'] / F['tot_emp_lakh']
    # payback by tier
    F['payback'] = {k: v['sub_cr'] / (v['ret'] * v['sub_cr']) if v['ret'] else np.nan for k, v in F['size_tier'].items() if v['scored']}
    # sector x division functionality
    F['seri_func'] = s[s.sector == 'Sericulture'].groupby('division').functional.mean().to_dict()
    F['ah_func'] = s[s.sector == 'Animal Husbandry'].groupby('division').functional.mean().to_dict()
    # non-functional activities
    nf = s.groupby('activity').agg(n=('unit', 'size'), nf=('functional', lambda x: 1 - x.mean())).query('n>=500').sort_values('nf', ascending=False)
    F['nonfunc_acts'] = nf.head(6).reset_index().to_dict('records')
    # T3+T4 outlay share
    F['t34_outlay_share'] = sum(F['size_tier'][k]['share_sub'] for k in F['size_tier'] if k.startswith(('T3', 'T4')))
    F['t34_unit_share'] = sum(F['size_tier'][k]['share_units'] for k in F['size_tier'] if k.startswith(('T3', 'T4')))
    # district spread
    d = pd.DataFrame(F['district']).T
    F['district_upi_min'] = d.upi.min(); F['district_upi_max'] = d.upi.max(); F['district_func_min'] = d.func.min(); F['district_func_max'] = d.func.max()
    F['district_ret_min'] = d.ret.min(); F['district_ret_max'] = d.ret.max()
    return F, s, A

if __name__ == '__main__':
    F, s, A = compute()
    def conv(o):
        if isinstance(o, (np.integer,)): return int(o)
        if isinstance(o, (np.floating,)): return float(o)
        if isinstance(o, dict): return {str(k): conv(v) for k, v in o.items()}
        if isinstance(o, (list, tuple)): return [conv(v) for v in o]
        return o
    json.dump(conv(F), open('/tmp/hadp/out/figures.json', 'w'), indent=1, default=str)
    import pprint
    pprint.pprint({k: v for k, v in conv(F).items() if k not in ('act_all', 'district', 'act_top', 'act_bottom')}, width=160)
