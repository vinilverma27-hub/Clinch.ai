import re, time, zipfile, shutil, os, sys
t=time.time()
IN='out/HADP_Unit_Performance_Analysis.xlsx'; OUT='out/HADP_Unit_Performance_Analysis_small.xlsx'
z=zipfile.ZipFile(IN)
data=z.read('xl/worksheets/sheet3.xml').decode('utf-8')
FIRST, LAST = 2, 86675
cell_re=re.compile(r'<c r="([A-Z]+)(\d+)"( s="\d+")?><f>(.*?)</f><v></v></c>')
si_map={}   # column letter -> si index
templates={}
def rowify(formula, row):
    # replace the row number of self-row references with a placeholder to confirm template consistency
    return re.sub(r'(?<![A-Za-z_])(\$?[A-Z]{1,2})'+str(row)+r'(?!\d)', r'\1#', formula)
def repl(m):
    col,row,s,f=m.group(1),int(m.group(2)),m.group(3) or '',m.group(4)
    if row<FIRST or row>LAST: return m.group(0)
    tpl=rowify(f,row)
    if col not in si_map:
        si_map[col]=len(si_map); templates[col]=tpl
        return f'<c r="{col}{row}"{s}><f t="shared" ref="{col}{row}:{col}{LAST}" si="{si_map[col]}">{f}</f></c>'
    if templates[col]!=tpl:
        sys.exit(f'template mismatch {col}{row}: {tpl} vs {templates[col]}')
    return f'<c r="{col}{row}"{s}><f t="shared" si="{si_map[col]}"/></c>'
new=cell_re.sub(repl,data)
print('cols shared:',len(si_map),'size',len(data),'->',len(new), time.time()-t)
zo=zipfile.ZipFile(OUT,'w',zipfile.ZIP_DEFLATED,compresslevel=9)
for item in z.infolist():
    buf = new.encode('utf-8') if item.filename=='xl/worksheets/sheet3.xml' else z.read(item.filename)
    zo.writestr(item, buf, compress_type=zipfile.ZIP_DEFLATED)
zo.close()
print('written', os.path.getsize(OUT)/1e6,'MB', time.time()-t)
