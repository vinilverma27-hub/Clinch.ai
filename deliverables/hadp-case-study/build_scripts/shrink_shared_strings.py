import re, time, zipfile, os
from xml.sax.saxutils import escape
t=time.time()
IN='out/HADP_Unit_Performance_Analysis_small.xlsx'; OUT='out/HADP_Unit_Performance_Analysis_final.xlsx'
z=zipfile.ZipFile(IN)
names=z.namelist()
assert 'xl/sharedStrings.xml' not in names
strings={}; order=[]
is_re=re.compile(r'<c r="([A-Z]+\d+)"( s="\d+")? t="inlineStr"><is><t(?: xml:space="preserve")?>(.*?)</t></is></c>', re.S)
def repl(m):
    txt=m.group(3)
    if txt not in strings:
        strings[txt]=len(order); order.append(txt)
    return f'<c r="{m.group(1)}"{m.group(2) or ""} t="s"><v>{strings[txt]}</v></c>'
sheets={}
for n in names:
    if n.startswith('xl/worksheets/sheet') and n.endswith('.xml'):
        d=z.read(n).decode('utf-8'); sheets[n]=is_re.sub(repl,d)
print('unique strings',len(order), time.time()-t)
sst='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" uniqueCount="%d">'%len(order)
sst+=''.join(f'<si><t xml:space="preserve">{s}</t></si>' for s in order)+'</sst>'
rels=z.read('xl/_rels/workbook.xml.rels').decode()
ids=[int(x) for x in re.findall(r'Id="rId(\d+)"',rels)]
rid=max(ids)+1
rels=rels.replace('</Relationships>',f'<Relationship Id="rId{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>')
ct=z.read('[Content_Types].xml').decode()
ct=ct.replace('</Types>','<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/></Types>')
zo=zipfile.ZipFile(OUT,'w',zipfile.ZIP_DEFLATED,compresslevel=9)
for item in z.infolist():
    n=item.filename
    if n in sheets: buf=sheets[n].encode()
    elif n=='xl/_rels/workbook.xml.rels': buf=rels.encode()
    elif n=='[Content_Types].xml': buf=ct.encode()
    else: buf=z.read(n)
    zo.writestr(item,buf,compress_type=zipfile.ZIP_DEFLATED)
zo.writestr('xl/sharedStrings.xml',sst.encode(),compress_type=zipfile.ZIP_DEFLATED)
zo.close()
print('written',os.path.getsize(OUT)/1e6,'MB',time.time()-t)
