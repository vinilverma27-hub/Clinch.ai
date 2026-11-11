import re, zipfile, os, time, math
from xml.sax.saxutils import escape
import openpyxl
t=time.time()
SRC='out/HADP_Unit_Performance_Analysis_final.xlsx'
VAL='recalc2/HADP_Unit_Performance_Analysis_final.xlsx'
OUT='out/HADP_Unit_Performance_Analysis_cached.xlsx'
z=zipfile.ZipFile(SRC)
wbx=z.read('xl/workbook.xml').decode(); rels=z.read('xl/_rels/workbook.xml.rels').decode()
rid2target=dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"',rels)) | {b:a for a,b in re.findall(r'Target="([^"]+)"[^>]*Id="(rId\d+)"',rels)}
sheets=re.findall(r'<sheet [^>]*name="([^"]+)"[^>]*r:id="(rId\d+)"',wbx)
name2xml={n:'xl/'+rid2target[r].lstrip('/').replace('xl/','') for n,r in sheets}
print(name2xml)
vwb=openpyxl.load_workbook(VAL,data_only=True,read_only=True)
cell_re=re.compile(r'<c r="([A-Z]+)(\d+)"((?: s="\d+")?)(?: t="\w+")?>(<f[^>]*/>|<f[^>]*>[^<]*</f>)(?:<v></v>)?</c>')
def fmt(v):
    if v is None: return ' t="str"','<v></v>'
    if isinstance(v,bool): return ' t="b"','<v>%d</v>'%v
    if isinstance(v,(int,float)):
        if isinstance(v,float) and (math.isnan(v) or math.isinf(v)): return ' t="e"','<v>#NUM!</v>'
        return '', '<v>%s</v>'%repr(v) if isinstance(v,float) else '<v>%d</v>'%v
    if hasattr(v,'year'):  # datetime -> serial
        from openpyxl.utils.datetime import to_excel
        return '', '<v>%s</v>'%to_excel(v)
    s=str(v)
    if s.startswith('#'): return ' t="e"','<v>%s</v>'%escape(s)
    return ' t="str"','<v>%s</v>'%escape(s)
out={}
for name,xml in name2xml.items():
    d=z.read(xml).decode()
    if '<f' not in d: continue
    ws=vwb[name]
    vals={}
    for row in ws.iter_rows():
        for c in row:
            if c.value is not None: vals[(c.column_letter,c.row)]=c.value
    n=[0]
    def repl(m):
        col,row,s,f=m.group(1),int(m.group(2)),m.group(3),m.group(4)
        tattr,v=fmt(vals.get((col,row)))
        n[0]+=1
        return f'<c r="{col}{row}"{s}{tattr}>{f}{v}</c>'
    out[xml]=cell_re.sub(repl,d)
    print(name,'formula cells',n[0],round(time.time()-t))
zo=zipfile.ZipFile(OUT,'w',zipfile.ZIP_DEFLATED,compresslevel=9)
for item in z.infolist():
    buf=out[item.filename].encode() if item.filename in out else z.read(item.filename)
    zo.writestr(item,buf,compress_type=zipfile.ZIP_DEFLATED)
zo.close()
print('written',os.path.getsize(OUT)/1e6,'MB',round(time.time()-t))
