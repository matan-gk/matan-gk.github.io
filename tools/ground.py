"""Grounding generator: fits every floor sprite (catalog items, bed levels) to its footprint.
NOTE: written against the pre-grounding metadata (w,h,ax,ay per item, ft per bed level), so it documents the method and was run once to produce r/fp; the lasting guarantee is tests/groundtest.js.
Usage: python3 tools/ground.py   (rewrites the r / fp metadata inside math-quest.html)
Method: find each sprite's contact points (leg tips, else silhouette corners), least-squares fit a separate x and y scale + translation
to the inset footprint diamond, store r=[dx,dy,w,h] relative to gx2s(x,y). See docs/GROUNDING.md."""
import os,sys
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')+os.sep
OUT=ROOT+'math-quest.html'
import re,json,numpy as np
from PIL import Image
from scipy.signal import find_peaks
import re,json,numpy as np
from PIL import Image
s=open('/home/claude/matan-gk.github.io/math-quest.html',encoding='utf-8').read()
def sil(src):
    im=np.array(Image.open('/home/claude/matan-gk.github.io/'+src).convert('RGBA'));a=im[...,3]>100
    cols=np.where(a.any(0))[0]; bot=np.array([np.where(a[:,x])[0].max() for x in cols])
    return a,cols,bot
def contact(src):
    a,cols,bot=sil(src); H,W=a.shape
    xmin,xmax=cols[0],cols[-1]; i=np.argmax(bot)
    return dict(W=W,H=H,xmin=int(xmin),xmax=int(xmax),yl=int(bot[0]),yr=int(bot[-1]),xf=int(cols[i]),yf=int(bot[i]))

def g2s(x,y): return np.array([500+(x-y)*50,400+(x+y)*25.])
def legs(src,prom=4,dist=6):
    a,cols,bot=sil(src); b=np.convolve(bot,np.ones(5)/5,'same')
    pk,_=find_peaks(b,prominence=prom,distance=dist); return [(int(cols[p]),int(bot[p])) for p in pk]
def fit(P,fw,fd,eps=.12):
    # P: dict back,right,left,front -> sprite px ; targets in screen units rel. nothing
    T={'back':g2s(eps,eps),'right':g2s(fw-eps,eps),'left':g2s(eps,fd-eps),'front':g2s(fw-eps,fd-eps)}
    ks=list(P); A=np.array([P[k] for k in ks],float); B=np.array([T[k] for k in ks])
    sx,tx=np.polyfit(A[:,0],B[:,0],1); sy,ty=np.polyfit(A[:,1],B[:,1],1)
    res=[(k,float(np.hypot(sx*P[k][0]+tx-T[k][0],sy*P[k][1]+ty-T[k][1]))) for k in ks]
    return sx,sy,tx,ty,res

import re,json,numpy as np
def line_y(xs,ys,x0):
    p=np.polyfit(xs,ys,1); return float(np.polyval(p,x0)),float(p[0])
def sil_pts(src):
    a,cols,bot=sil(src); b=bot.astype(float); i=int(np.argmax(b)); xf=cols[i]; yf=b[i]
    xmin,xmax=cols[0],cols[-1]
    L=slice(int(i*0.25),int(i*0.8)); R=slice(int(i+(len(b)-i)*0.2),int(i+(len(b)-i)*0.75))
    yl,sl=line_y(cols[L],b[L],xmin); yr,sr=line_y(cols[R],b[R],xmax)
    return {'left':(float(xmin),yl),'front':(float(xf),float(yf)),'right':(float(xmax),yr)},(sl,sr)
import re,json,numpy as np
from PIL import Image
def wfit(P,fw,fd,eps,wts):
    T={'back':g2s(eps,eps),'right':g2s(fw-eps,eps),'left':g2s(eps,fd-eps),'front':g2s(fw-eps,fd-eps)}
    ks=list(P); A=np.array([P[k] for k in ks],float); B=np.array([T[k] for k in ks]); w=np.array([wts.get(k,1) for k in ks],float)
    sx,tx=np.polyfit(A[:,0],B[:,0],1,w=w); sy,ty=np.polyfit(A[:,1],B[:,1],1,w=w)
    res={k:float(np.hypot(sx*P[k][0]+tx-T[k][0],sy*P[k][1]+ty-T[k][1])) for k in ks}
    return sx,sy,tx,ty,res
def rect(src,sx,sy,tx,ty):
    W,H=Image.open(ROOT+src).size
    return [round(tx-500,1),round(ty-400,1),round(W*sx,1),round(H*sy,1)]
report=[]
# ---- catalog
m=re.search(r'const ROOM_CATALOG = \[\n(.*?)\n\];',s,re.S)
ents=[json.loads(re.sub(r'([{,])([a-z]+):',r'\1"\2":',l.strip().rstrip(','))) for l in m.group(1).split('\n') if l.strip().startswith('{')]
FILL={'toybox1','toybox2','toybox3','desk','desk_turn','cloud','armchair','piano'}
out=[]
for e in ents:
    fw,fd=e.get('fw',1),e.get('fd',1)
    if e['id'] in FILL:
        P,sl=sil_pts(e['src'])
        if e['id'] in('desk','desk_turn'):
            L,F,R=legs(e['src'],4,6); P={'left':L,'front':F,'right':R,'back':(L[0]+R[0]-F[0],L[1]+R[1]-F[1])}
            sx,sy,tx,ty,res=wfit(P,fw,fd,.12,{'front':3}); how='legs'
        else:
            a_,cols,bot=sil(e['src']); xmin,xmax=cols[0],cols[-1]+1
            sx=(fw+fd)*50*0.92/(xmax-xmin); ratio=min(1.2,max(0.8,0.5/((abs(sl[0])+abs(sl[1]))/2))); sy=sx*ratio
            ctr=g2s(fw/2,fd/2); fr=g2s(fw-.04,fd-.04)
            tx=ctr[0]-sx*(xmin+xmax)/2; ty=fr[1]-sy*P['front'][1]
            res={k:float(np.hypot(sx*P[k][0]+tx-g2s(*{'left':(.04,fd-.04),'right':(fw-.04,.04),'front':(fw-.04,fd-.04)}[k])[0],sy*P[k][1]+ty-g2s(*{'left':(.04,fd-.04),'right':(fw-.04,.04),'front':(fw-.04,fd-.04)}[k])[1])) for k in P}; how='solid'
        r=rect(e['src'],sx,sy,tx,ty); report.append((e['id'],how,round(sy/sx,2),{k:round(v,1) for k,v in res.items()}))
    else:
        r=[round(-e['ax'],1),round(25+4-e['ay'],1),e['w'],e['h']]
    n={k:v for k,v in e.items() if k not in('w','h','ax','ay')}; n['r']=r; out.append(n)
for r_ in report: print(r_)
cat='\n'.join('  '+json.dumps(n,ensure_ascii=False,separators=(',',':'))+(',' if i<len(out)-1 else '') for i,n in enumerate(out))
s2=s[:m.start(1)]+cat+s[m.end(1):]
# ---- bed
i=s2.index('bed:[');j=s2.index('window:[',i); seg=s2[i:j]
FP=[[3,4],[3,4],[3,4],[3,3],[3,3]]
k=[0]
def bed(mm):
    lv=k[0]; k[0]+=1; L,F,R=legs(mm.group(1)); Bk=(L[0]+R[0]-F[0],L[1]+R[1]-F[1]); fw,fd=FP[lv]
    sx,sy,tx,ty,res=wfit({'left':L,'front':F,'right':R,'back':Bk},fw,fd,.12,{'front':3})
    r=rect(mm.group(1),sx,sy,tx,ty); print('bed',lv+1,fw,fd,'ratio %.2f'%(sy/sx),{q:round(v,1) for q,v in res.items()},r)
    return "src:'%s',fp:[%d,%d],r:%s"%(mm.group(1),fw,fd,json.dumps(r,separators=(',',':')))
seg2=re.sub(r"src:'(assets/[^']+)',w:[\d.]+,h:[\d.]+,ax:[\d.]+,ay:[\d.]+,ft:\[\[[^\]]*\],\[[^\]]*\],\[[^\]]*\]\]",bed,seg)
s2=s2[:i]+seg2+s2[j:]
open(OUT,'w',encoding='utf-8').write(s2)
