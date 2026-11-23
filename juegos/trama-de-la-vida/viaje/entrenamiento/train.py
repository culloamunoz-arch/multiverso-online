import re,json,base64,collections,numpy as np,jax,jax.numpy as jnp,time
txt=open('corpus.txt').read()
sents=re.split(r'(?<=[.!?])\s+',txt)
sents=[s for s in sents if not re.search(r'et al|\d{3,}[–-]\d{2,}|J |Nature|PNAS|Physiol|Biol|ISCA|IEEE|vol\.|ed\.\)|\(19|\(20',s)]
txt=' '.join(sents)
def tok(s): return re.findall(r"[a-záéíóúüñ]+|[0-9]+(?:[.,][0-9]+)?|[.,:;¿?¡!()]",s.lower())
T=tok(txt);c=collections.Counter(T)
V=['<unk>']+sorted([w for w,n in c.items() if n>=2],key=lambda w:-c[w])
ix={w:i for i,w in enumerate(V)};data=np.array([ix.get(w,0) for w in T],dtype=np.int32)
print('tokens',len(T),'vocab',len(V),'unk%',round((data==0).mean()*100,1))
D,H,L,C,F=48,3,2,24,192;hd=D//H
k=jax.random.PRNGKey(0)
def init(k):
  ks=iter(jax.random.split(k,40));n=lambda *s,sc=.02:jax.random.normal(next(ks),s)*sc
  p={'wte':n(len(V),D),'wpe':n(C,D),'lnf_g':jnp.ones(D),'lnf_b':jnp.zeros(D)}
  for l in range(L):
    p[f'l{l}']={'ln1_g':jnp.ones(D),'ln1_b':jnp.zeros(D),'qkv':n(D,3*D),'qkv_b':jnp.zeros(3*D),'proj':n(D,D,sc=.02/np.sqrt(2*L)),'proj_b':jnp.zeros(D),
     'ln2_g':jnp.ones(D),'ln2_b':jnp.zeros(D),'fc':n(D,F),'fc_b':jnp.zeros(F),'fc2':n(F,D,sc=.02/np.sqrt(2*L)),'fc2_b':jnp.zeros(D)}
  return p
def ln(x,g,b): m=x.mean(-1,keepdims=True);v=((x-m)**2).mean(-1,keepdims=True);return (x-m)/jnp.sqrt(v+1e-5)*g+b
def fwd(p,x):
  t=x.shape[-1];h=p['wte'][x]+p['wpe'][:t];mask=jnp.tril(jnp.ones((t,t)))
  for l in range(L):
    q=p[f'l{l}'];a=ln(h,q['ln1_g'],q['ln1_b'])@q['qkv']+q['qkv_b'];Q,K,Vv=jnp.split(a,3,-1)
    sp=lambda z:z.reshape(z.shape[:-1]+(H,hd)).swapaxes(-2,-3)
    Q,K,Vv=sp(Q),sp(K),sp(Vv);att=Q@K.swapaxes(-1,-2)/np.sqrt(hd);att=jnp.where(mask,att,-1e9);att=jax.nn.softmax(att,-1)
    o=(att@Vv).swapaxes(-2,-3).reshape(h.shape);h=h+o@q['proj']+q['proj_b']
    m=ln(h,q['ln2_g'],q['ln2_b'])@q['fc']+q['fc_b'];h=h+jax.nn.gelu(m,approximate=True)@q['fc2']+q['fc2_b']
  return ln(h,p['lnf_g'],p['lnf_b'])@p['wte'].T
def loss(p,x,y): lg=fwd(p,x);return -jnp.mean(jnp.take_along_axis(jax.nn.log_softmax(lg),y[...,None],-1))
p=init(k);m=jax.tree.map(jnp.zeros_like,p);v=jax.tree.map(jnp.zeros_like,p)
n=int(len(data)*float(__import__("os").environ.get("SPLIT",".92")));tr,va=data[:n],data[n:]
@jax.jit
def step(p,m,v,x,y,t,lr):
  l,g=jax.value_and_grad(loss)(p,x,y)
  m=jax.tree.map(lambda a,b:.9*a+.1*b,m,g);v=jax.tree.map(lambda a,b:.99*a+.01*b*b,v,g)
  p=jax.tree.map(lambda w,a,b:w-lr*((a/(1-.9**t))/(jnp.sqrt(b/(1-.99**t))+1e-8)+0.01*w*(w.ndim>1)),p,m,v);return p,m,v,l
rng=np.random.default_rng(0);B=32;S=int(__import__("os").environ.get("S","900"));t0=time.time()
def batch(d):
  i=rng.integers(0,len(d)-C-1,B);return np.stack([d[j:j+C] for j in i]),np.stack([d[j+1:j+C+1] for j in i])
vl=jax.jit(loss)
for s in range(1,S+1):
  lr=3e-3*min(1,s/200)*(.1+.9*.5*(1+np.cos(np.pi*s/S)))
  x,y=batch(tr);p,m,v,l=step(p,m,v,x,y,s,lr)
  if s%300==0:
    xv,yv=batch(va);print(s,round(float(l),3),'val',round(float(vl(p,xv,yv)),3),round(time.time()-t0))
np.save('params.npy',jax.tree.map(np.asarray,p),allow_pickle=True);json.dump(V,open('vocab.json','w'),ensure_ascii=False)
cnt=sum(x.size for x in jax.tree.leaves(p));print('params',cnt)
