import os, numpy as np, json
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')+os.sep
from PIL import Image
from scipy import ndimage as nd
A=Image.open(ROOT+'art/sheet-a-rugs-furniture.png').convert('RGB')
B=Image.open(ROOT+'art/sheet-b-toys.jpg').convert('RGB')
cw,ch=512/6,279/4
def boxA(r,c): return (round(c*cw)+1,round(r*ch)+1,round((c+1)*cw)-1,round((r+1)*ch)-1)
ITEMS=[ # id, sheet, box
('dollhouse','A',boxA(0,0)),('wardrobe','A',boxA(0,1)),('wardrobe2','A',boxA(0,2)),('chair','A',boxA(0,3)),('slide','A',boxA(0,4)),('chair2','A',boxA(0,5)),
('slide2','A',boxA(1,0)),('slide3','A',boxA(1,1)),('track','A',boxA(1,2)),('track2','A',boxA(1,3)),('table','A',boxA(1,4)),
('rug_sq','A',boxA(2,0)),('rug_sq2','A',boxA(2,1)),('rug_rd','A',boxA(2,2)),('rug_rd2','A',boxA(2,3)),('rug_fluffy','A',boxA(2,4)),('globe','A',boxA(2,5)),
('guitar','A',boxA(3,0)),('guitar2','A',boxA(3,1)),('sax','A',boxA(3,2)),('mat','A',boxA(3,3)),('tictac','A',boxA(3,4)),('chess','A',boxA(3,5)),
('trainset','B',(10,10,460,225)),('blocks','B',(612,10,800,185)),('soccer','B',(818,15,1002,175)),('soccer2','B',(1018,15,1202,175)),('basketball','B',(1215,15,1400,175)),
('car','B',(30,240,215,380)),('car2','B',(225,235,410,380)),('books','B',(430,205,595,380)),('books2','B',(620,215,795,380)),('bookshelf','B',(825,195,1000,385)),('dressbox','B',(1012,200,1200,385)),
('easel','B',(1212,200,1400,575)),('puzzle','B',(10,400,280,560)),('puzzle2','B',(282,400,555,565)),('laptop','B',(595,390,805,570)),('laptop2','B',(817,390,1005,570)),
('easel2','B',(1017,390,1200,750)),('lego','B',(25,580,350,750)),('monkey','B',(370,580,560,765)),('ladybug','B',(580,580,800,730)),('bunny','B',(817,580,1000,765)),('bunny2','B',(1217,580,1400,765))]
HOLLOW={'track','track2','trainset'}   # their enclosed white is the floor seen through the loop
def cut(im,box,hollow=False,thr=0.015):
    sub=np.array(im.crop(box)).astype(float)
    mn=sub.min(2); gray=(np.abs(sub[...,0]-sub[...,1])<7)&(np.abs(sub[...,1]-sub[...,2])<7)&(mn>165)
    white=(mn>226)|gray
    lab,k=nd.label(white)
    edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    bg=np.isin(lab,list(edge)) if not hollow else white; fg=~bg
    fg=nd.binary_opening(fg,iterations=1)
    l2,k2=nd.label(fg)
    if k2>1:
        sz=nd.sum(fg,l2,range(1,k2+1)); keep=[j+1 for j,s in enumerate(sz) if s>thr*sz.max()]; fg=np.isin(l2,keep)
    if not hollow: fg=nd.binary_fill_holes(fg)
    a=np.clip(nd.gaussian_filter(fg.astype(float),0.7)*1.6-0.3,0,1)
    out=np.dstack([sub,a*255]).astype('uint8'); ys,xs=np.where(a>0.1)
    return Image.fromarray(out[ys.min():ys.max()+1,xs.min():xs.max()+1])
if __name__=='__main__':
    os.makedirs('/tmp/it2',exist_ok=True)
    M=Image.new('RGBA',(1500,1300),(235,225,215,255))
    for i,(n,s,b) in enumerate(ITEMS):
        t=cut(A if s=='A' else B,b,n in HOLLOW,0.25 if s=='A' else 0.015); t.save(f'/tmp/it2/{n}.png'); print(n,t.size)
        v=t.copy(); v.thumbnail((140,110)); r,c=divmod(i,10); M.alpha_composite(v,(c*150,r*130))
    M.save('/tmp/it2/prev.png')
