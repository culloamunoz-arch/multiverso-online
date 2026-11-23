import numpy as np,json,base64
p=np.load('params.npy',allow_pickle=True).item();V=json.load(open('vocab.json'))
out={'cfg':{'D':48,'H':3,'L':2,'C':24,'F':192},'vocab':V,'t':{}}
def q(name,a):
  a=np.asarray(a,dtype=np.float32);s=float(np.abs(a).max()/127) or 1.0
  out['t'][name]={'s':a.shape,'k':s,'b':base64.b64encode(np.clip(np.round(a/s),-127,127).astype(np.int8).tobytes()).decode()}
for k,v in p.items():
  if isinstance(v,dict):
    for kk,vv in v.items(): q(k+'.'+kk,vv)
  else: q(k,v)
json.dump(out,open('modelo.json','w'),ensure_ascii=False,separators=(',',':'))
# referencia: logits de una frase con pesos cuantizados
import re
def deq(n):t=out['t'][n];return (np.frombuffer(base64.b64decode(t['b']),dtype=np.int8).astype(np.float32)*t['k']).reshape(t['s'])
ix={w:i for i,w in enumerate(V)};x=[ix.get(w,0) for w in 'el micelio conecta los árboles del'.split()]
def ln(h,g,b):m=h.mean(-1,keepdims=True);v=((h-m)**2).mean(-1,keepdims=True);return (h-m)/np.sqrt(v+1e-5)*g+b
h=deq('wte')[x]+deq('wpe')[:len(x)];t=len(x)
for l in range(2):
  g=lambda n:deq(f'l{l}.{n}');a=ln(h,g('ln1_g'),g('ln1_b'))@g('qkv')+g('qkv_b');Q,K,Vv=np.split(a,3,-1)
  o=np.zeros_like(h)
  for hh in range(3):
    sl=slice(hh*16,hh*16+16);s=Q[:,sl]@K[:,sl].T/4;s=np.where(np.tril(np.ones((t,t))),s,-1e9);s=np.exp(s-s.max(-1,keepdims=True));s/=s.sum(-1,keepdims=True);o[:,sl]=s@Vv[:,sl]
  h=h+o@g('proj')+g('proj_b');m=ln(h,g('ln2_g'),g('ln2_b'))@g('fc')+g('fc_b');gl=0.5*m*(1+np.tanh(np.sqrt(2/np.pi)*(m+0.044715*m**3)));h=h+gl@g('fc2')+g('fc2_b')
lg=ln(h,deq('lnf_g'),deq('lnf_b'))@deq('wte').T
top=np.argsort(-lg[-1])[:5];print('REF',[V[i] for i in top],[round(float(lg[-1][i]),3) for i in top])
