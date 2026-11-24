/* ================= PULSE AI COACH · módulo ================= */
(function(){
'use strict';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const T=()=>performance.now()/1000;
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;};
const pct=v=>Math.round(v*100);
const ready=()=>!!(ctx&&A.xg&&MX.A&&MX.A.fader!=null);
const bothLoaded=()=>A.loaded&&B.loaded&&A.bpm&&B.bpm;

/* ---------- TEMAS DEMO ADICIONALES ---------- */
const NEWD=[
 {id:'d5',title:'Chiloé',artist:'Demo Escuela DJ · Deep house',bpm:118,root:43,key:'Sol menor · 6A',seed:3,col:'#7bd389',genre:'Deep House'},
 {id:'d6',title:'Elqui',artist:'Demo Escuela DJ · Nu-disco',bpm:112,root:40,key:'Mi menor · 9A',seed:2,col:'#ff8fb1',genre:'Disco'},
 {id:'d7',title:'Rapa Nui',artist:'Demo Escuela DJ · Progressive',bpm:122,root:47,key:'Si menor · 10A',seed:4,col:'#9b8cff',genre:'Progressive'},
 {id:'d8',title:'Antofagasta',artist:'Demo Escuela DJ · EDM',bpm:128,root:44,key:'Sol# menor · 1A',seed:1,col:'#ffd166',genre:'EDM'},
 {id:'d9',title:'Magallanes',artist:'Demo Escuela DJ · Trance',bpm:136,root:42,key:'Fa# menor · 11A',seed:3,col:'#5ec8ff',genre:'Trance'},
];
NEWD.forEach(d=>{if(!DEMOS.find(x=>x.id===d.id))DEMOS.push(d);});
const DEMO_GENRE={d1:'House',d2:'House',d3:'Tech House',d4:'Techno'};
DEMOS.forEach(d=>{if(!d.genre)d.genre=DEMO_GENRE[d.id]||'House';});
const GENRES=['House','Deep House','Tech House','Techno','Progressive','EDM','Trance','Disco','Hip-Hop','Open Format'];
const SUB={'House':'House clásico','Deep House':'Deep / melódico','Tech House':'Tech house groovero','Techno':'Techno de pista','Progressive':'Progressive melódico','EDM':'Big room / electro','Trance':'Uplifting trance','Disco':'Nu-disco / funk','Hip-Hop':'Hip-hop','Open Format':'Formato abierto'};

/* ---------- TONALIDAD / CAMELOT ---------- */
const NOTE=['Do','Do#','Re','Re#','Mi','Fa','Fa#','Sol','Sol#','La','La#','Si'];
function camFromPc(pc,minor){let n=((minor?8+7*(pc-9):8+7*pc)%12+12)%12;if(n===0)n=12;return n+(minor?'A':'B');}
function parseCam(s){const m=/(^|[^\d])(\d{1,2})\s*([AB])(?![a-z])/i.exec(String(s||''));if(!m)return null;const n=+m[2];if(n<1||n>12)return null;return n+m[3].toUpperCase();}
const NN={c:0,'c#':1,db:1,d:2,'d#':3,eb:3,e:4,f:5,'f#':6,gb:6,g:7,'g#':8,ab:8,a:9,'a#':10,bb:10,b:11};
function parseMusicalKey(s){const m=/^\s*([a-g])([#b]?)\s*(m|min|minor|menor)?\s*$/i.exec(String(s||''));if(!m)return null;const pc=NN[(m[1]+m[2]).toLowerCase()];if(pc==null)return null;return camFromPc(pc,!!m[3]);}
function camScore(a,b){
 if(!a||!b)return{s:50,txt:'Tonalidad desconocida en uno de los temas'};
 const na=parseInt(a,10),nb=parseInt(b,10),la=a.slice(-1),lb=b.slice(-1),d=((nb-na)%12+12)%12,dist=Math.min(d,12-d);
 if(dist===0&&la===lb)return{s:100,txt:'Misma tonalidad'};
 if(dist===0)return{s:85,txt:'Relativas mayor/menor (mismo número)'};
 if(dist===1&&la===lb)return{s:92,txt:'Vecinas en la rueda Camelot (±1)'};
 if(dist===1)return{s:62,txt:'Cambio diagonal: funciona si la mezcla es corta'};
 if(dist===2&&la===lb)return{s:60,txt:'Salto de ±2: sube la tensión (energy boost)'};
 if(d===7&&la===lb)return{s:55,txt:'+7 en Camelot: sube un semitono, efecto de “levantada”'};
 return{s:20,txt:'Tonalidades que chocan'};
}
const KMAJ=[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88],KMIN=[6.33,2.68,3.52,5.38,2.6,3.53,2.54,4.75,3.98,2.69,3.34,3.17];
function corr(x,y){const mx=avg(x),my=avg(y);let a=0,b=0,c=0;for(let i=0;i<12;i++){const dx=x[i]-mx,dy=y[i]-my;a+=dx*dy;b+=dx*dx;c+=dy*dy;}return a/Math.sqrt(b*c+1e-12);}
function detectKey(buf){
 const sr=buf.sampleRate,L=buf.getChannelData(0),R=buf.numberOfChannels>1?buf.getChannelData(1):L,N=8192,F=36,len=L.length;
 if(len<N*6)return null;
 const win=new Float32Array(N);for(let i=0;i<N;i++)win[i]=0.5-0.5*Math.cos(2*Math.PI*i/(N-1));
 const notes=[];for(let m=48;m<96;m++){const f=440*Math.pow(2,(m-69)/12);notes.push({pc:m%12,c:2*Math.cos(2*Math.PI*f/sr)});}
 const chroma=new Array(12).fill(0),x=new Float32Array(N);
 for(let k=0;k<F;k++){const st=Math.floor(len*(0.1+0.8*k/F));if(st+N>len)break;
  for(let i=0;i<N;i++)x[i]=(L[st+i]+R[st+i])*0.5*win[i];
  const fr=new Array(12).fill(0);
  for(const n of notes){let s1=0,s2=0;const c=n.c;for(let i=0;i<N;i++){const s0=x[i]+c*s1-s2;s2=s1;s1=s0;}fr[n.pc]+=Math.sqrt(Math.max(0,s1*s1+s2*s2-c*s1*s2));}
  let mx=1e-9;for(let i=0;i<12;i++)if(fr[i]>mx)mx=fr[i];for(let i=0;i<12;i++)chroma[i]+=fr[i]/mx;}
 let best=-2,bk=0,bm=true;
 for(let r=0;r<12;r++){const v=[];for(let i=0;i<12;i++)v.push(chroma[(i+r)%12]);const cM=corr(v,KMAJ),cm=corr(v,KMIN);if(cM>best){best=cM;bk=r;bm=false;}if(cm>best){best=cm;bk=r;bm=true;}}
 return{cam:camFromPc(bk,bm),name:NOTE[bk]+(bm?' menor':' mayor'),strength:clamp(best,0,1)};
}

/* ---------- ANÁLISIS MUSICAL ---------- */
function guessGenre(bpm,f){
 if(!bpm)return['Open Format','—'];
 if(bpm<100)return['Hip-Hop',bpm<88?'Boom bap / lo-fi':'Hip-hop moderno'];
 if(bpm<115)return['Disco',f.dens>0.55?'Nu-disco':'Disco / funk'];
 if(bpm<121)return f.bass>0.45?['House','House clásico']:['Deep House','Deep / melódico'];
 if(bpm<127)return f.dens>0.55&&f.bass>0.4?['Tech House','Tech house groovero']:['House','House'];
 if(bpm<131)return f.harm>0.55?['Progressive','Progressive melódico']:['Techno','Techno de pista'];
 if(bpm<142)return['Trance','Uplifting / progressive trance'];
 return['EDM','Hard dance (o doble tiempo)'];
}
function roleOf(e,harm,dens){if(e>=8)return'Peak Time';if(e>=6)return'Build-Up';if(e>=4)return harm>0.55&&dens<0.5?'Recovery':'Warm-Up';return harm>0.5?'Closing':'Warm-Up';}
function analyzeBuf(buf,pk,bpm,fb,meta){
 meta=meta||{};const sr=buf.sampleRate,fps=sr/pk.hop;
 const L=buf.getChannelData(0);let s=0,c=0;for(let i=0;i<L.length;i+=64){s+=L[i]*L[i];c++;}
 const rmsDb=10*Math.log10(s/Math.max(1,c)+1e-12);
 let mf=0,ml=0,n=0;for(let i=0;i<pk.n;i++){if(pk.full[i]>0.04){mf+=pk.full[i];ml+=pk.low[i];n++;}}mf/=n||1;ml/=n||1;
 let on=0;for(let i=2;i<pk.n;i++){if(pk.full[i]-pk.full[i-1]>0.1&&pk.full[i-1]-pk.full[i-2]<=0.1)on++;}
 const dur=buf.length/sr,beats=bpm?dur*bpm/60:dur*2,dens=clamp(on/Math.max(1,beats)/3,0,1);
 let cam=parseCam(meta.key),keyName=meta.key?String(meta.key).split('·')[0].trim():'',ks=0.6,keyEst=false;
 if(!cam){const k=detectKey(buf);if(k){cam=k.cam;keyName=k.name;ks=k.strength;keyEst=true;}}
 const harm=clamp(0.55*ks+0.45*clamp((mf-ml*0.5)*1.8,0,1),0,1);
 let drops=[],changes=[],intro=0,outro=0,nb=0,reg=0.5;
 if(bpm){
  const bl=4*60/bpm*fps,f0=(fb||0)*fps;nb=Math.max(0,Math.floor((pk.n-f0)/bl));const bv=[];
  for(let b=0;b<nb;b++){let a=0,m=0;const s0=Math.floor(f0+b*bl),e0=Math.floor(f0+(b+1)*bl);for(let i=s0;i<e0&&i<pk.n;i++){a+=pk.low[i]+0.5*pk.full[i];m++;}bv.push(a/Math.max(1,m));}
  const dif=[];for(let b=0;b<nb;b++){if(b<2||b>nb-2){dif.push(0);continue;}const w=Math.min(4,b,nb-b);let x=0,y=0;for(let k=1;k<=w;k++){x+=bv[b-k];y+=bv[b+k-1];}dif.push((y-x)/w);}
  for(let b=1;b<nb-1;b++){const v=dif[b];if(Math.abs(v)>0.08&&Math.abs(v)>=Math.abs(dif[b-1])&&Math.abs(v)>=Math.abs(dif[b+1])){const last=changes[changes.length-1];if(last&&b-last.b<4){if(Math.abs(v)>Math.abs(last.v))changes[changes.length-1]={b,v};}else changes.push({b,v});}}
  drops=changes.filter(x=>x.v>0.12&&x.b>8).map(x=>x.b);
  const rises=changes.filter(x=>x.v>0),falls=changes.filter(x=>x.v<0);
  intro=rises.length?Math.min(rises[0].b,32):0;outro=falls.length?Math.max(0,nb-falls[falls.length-1].b):0;
  reg=changes.length?changes.filter(x=>{const m=x.b%8;return m<=1||m>=7;}).length/changes.length:0.5;
 }
 const bpmN=bpm?clamp((bpm-95)/40,0,1):0.5,loudN=clamp((rmsDb+28)/20,0,1);
 const e=0.5*bpmN+0.2*clamp(ml*1.3,0,1)+0.2*dens+0.1*loudN,energy=clamp(Math.round(1+e*9),1,10);
 const g=meta.genre?[meta.genre,SUB[meta.genre]||meta.genre]:guessGenre(bpm,{dens,bass:ml,harm});
 const complexity=clamp(Math.round(1+9*(0.35*dens+0.25*(1-reg)+0.2*harm+0.2*clamp(changes.length/10,0,1))),1,10);
 const diff=clamp(Math.round(1+complexity/10*3+((bpm&&(bpm<110||bpm>132))?1:0)),1,5);
 return{bpm,cam,keyName,keyEst,energy,bass:clamp(ml*1.2,0,1),harm,dens,complexity,genre:g[0],sub:g[1],role:roleOf(energy,harm,dens),reg,drops,intro,outro,nb,diff};
}

/* ---------- COMPATIBILIDAD ---------- */
function compat(a,b,da,db){
 if(!a||!b||!a.bpm||!b.bpm)return null;
 let r=b.bpm/a.bpm,half='';if(r>1.4){r/=2;half=' (doble tiempo)';}else if(r<0.71){r*=2;half=' (medio tiempo)';}
 const dp=Math.abs(r-1)*100,sB=clamp(100-Math.max(0,dp-2)*12.5,0,100),need=(1/r-1)*100;
 const H=camScore(a.cam,b.cam),dE=b.energy-a.energy;
 const sE=dE>=0&&dE<=2?100:dE===-1?85:dE===3?60:dE===-2?65:30;
 let sP,live=false;
 if(da&&db&&da.playing&&db.playing&&da.bpm&&db.bpm){live=true;const pa=da.beatsF()/4,pb=db.beatsF()/4;let d=((pb-pa)%8+8)%8;d=Math.min(d,8-d);sP=clamp(100-d*22,0,100);}
 else sP=Math.round(50+50*Math.min(a.reg,b.reg));
 const dropsAl=a.drops.length&&b.drops.length&&((b.drops[0]-a.drops[0])%8+8)%8===0;
 const sS=clamp(40+(b.intro>=8?25:0)+(a.outro>=8?20:0)+(dropsAl?15:0),0,100);
 const score=Math.round(0.25*sB+0.25*H.s+0.2*sE+0.15*sP+0.15*sS);
 const cat=score>=85?['Excelente','c-ex']:score>=70?['Muy buena','c-mb']:score>=55?['Buena','c-bu']:['Riesgosa','c-ri'];
 const L=[];
 L.push(dp<=2?['✅',`BPM cercano (${dp.toFixed(1)}%)${half}: un toque de pitch basta.`]:dp<=6?['⚠️',`Diferencia de ${dp.toFixed(1)}%${half}: el tema que entra necesita ${need>0?'+':'−'}${Math.abs(need).toFixed(1)}% de pitch.`]:['❌',`Diferencia de ${dp.toFixed(1)}%${half}: demasiado para un blend; mejor corte en frase o loop.`]);
 L.push([H.s>=85?'✅':H.s>=55?'⚠️':'❌',`${H.txt} (${a.cam||'?'} → ${b.cam||'?'}).`]);
 L.push(dE>=0&&dE<=2?['✅',`Energía progresiva (E${a.energy} → E${b.energy}).`]:dE<0?['⚠️',`Baja la energía (E${a.energy} → E${b.energy}): sirve como respiro o Recovery.`]:['⚠️',`Salto de energía fuerte (E${a.energy} → E${b.energy}): prepáralo con un break.`]);
 L.push([sP>=80?'✅':'⚠️',live?(sP>=80?'Frases alineadas ahora mismo.':'Las frases no están alineadas: el “1” de cada tema no coincide.'):(sP>=80?'Fraseo regular en ambos temas (cada 8 compases).':'Fraseo poco regular: cuenta los compases antes de entrar.')]);
 L.push([sS>=75?'✅':'⚠️',dropsAl?'Drops compatibles: caen en la misma posición de frase.':(b.intro>=8?`El tema que entra tiene intro mezclable (${b.intro} compases).`:'Intro corta: tendrás poco tiempo para mezclar.')]);
 let rec;
 if(sB<40)rec='Corte en el “1” de una frase, o un loop/echo-out del tema que sale. No intentes un blend largo.';
 else if(H.s>=85&&sB>=80)rec='Mezcla larga de 16 a 32 compases con intercambio de graves en un cambio de frase.';
 else if(H.s<55)rec='Mezcla corta (8 compases) usando filtro o EQ para esconder el choque tonal.';
 else if(dE>=3)rec='Usa el break del tema que sale para resetear la energía antes de soltar el nuevo.';
 else rec='Blend de 8 a 16 compases: entra en frase y cambia los graves en el siguiente “1”.';
 return{score,cat:cat[0],cls:cat[1],lines:L,rec,h:H.s,sB,sE,sP,sS,dE};
}

/* ---------- ESTADO ---------- */
const C={tPlay:0,tBoth:0,tPhase:0,bpmErr:0,jog:0,pitch:0,eq:0,loop:0,hot:0,xf:0,sync:0,swaps:0,loopWraps:0,loopExit:0,xp:0,err:{beatmatch:0,fase:0,sync:0,eq:0,brusca:0,fraseo:0,energia:0},trans:[]};
const S={mute:false,streak:0,grace:0,mile:0,streaks:[],flamT:0,bmT:0,accT:0,lastNudgeT:-99,nudgePre:0,nudgeEval:false,
 lastPitch:{A:0,B:0},pDir:{A:0,B:0},pTravel:{A:0,B:0},pitchRev:[],epT:{},prevMX:{},lowSt:{A:'o',B:'o'},lowT:{A:{k:-99,o:-99},B:{k:-99,o:-99}},
 trans:null,dom:null,lastSyncT:-99,obsQ:[],cur:null,lastShown:-99,said:{},hist:[],lastPos:{A:0,B:0},lastRec:{},detOpen:false,detT:0,hubT:0};
let SETLOG=[];
const ERR_TXT={beatmatch:'Beatmatching (tempo)',fase:'Fase (bombos desfasados)',sync:'Uso excesivo de SYNC',eq:'Uso de EQ (graves acumulados)',brusca:'Transiciones bruscas',fraseo:'Fraseo',energia:'Saltos de energía'};
let STATS=LS.get('dj_pulse_stats',{err:{}});
let XPd=LS.get('dj_pulse_xp',{xp:0,log:[]});
let BEST=LS.get('dj_pulse_best',{});
let QZ=LS.get('dj_pulse_quiz',{ok:0,n:0});
const RANKS=[['Principiante',0],['Selector',250],['Mezclador',800],['DJ de Club',2000],['DJ Profesional',4500],['Maestro de la Cabina',9000]];
function rankIdx(x){let i=0;for(let k=0;k<RANKS.length;k++)if(x>=RANKS[k][1])i=k;return i;}
let xpFlash=null;
function xp(n,why){const b=rankIdx(XPd.xp);XPd.xp+=n;C.xp+=n;XPd.log.unshift([Date.now(),n,why]);if(XPd.log.length>40)XPd.log.length=40;LS.set('dj_pulse_xp',XPd);xpFlash={t:T(),txt:`+${n} XP · ${why}`};
 const a=rankIdx(XPd.xp);if(a>b)toast(`🏆 Nuevo rango: <b>${RANKS[a][0]}</b>`,3500);}
function epi(k){const t=T();if(t-(S.epT[k]||-9)>0.7)C[k]++;S.epT[k]=t;}

/* ---------- OBSERVACIONES DEL COACH ---------- */
function obs(txt,prio=1,action){
 if(!SET.coach&&!action)return;const t=T();if(S.said[txt]&&t-S.said[txt]<60)return;
 if(S.obsQ.find(o=>o.txt===txt))return;S.obsQ.push({txt,prio,action});S.obsQ.sort((a,b)=>b.prio-a.prio);if(S.obsQ.length>4)S.obsQ.length=4;
}
function obsTick(){
 const t=T(),el=$('#pbObs');if(!el)return;
 if(S.cur&&t>S.cur.until){S.cur=null;el.innerHTML='';el.className='';}
 if(!S.cur&&S.obsQ.length&&t-S.lastShown>(S.obsQ[0].prio>=2?4:8)){
  const o=S.obsQ.shift();S.cur={...o,until:t+(o.action?16:7)};S.lastShown=t;S.said[o.txt]=t;S.hist.unshift([new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'}),o.txt]);if(S.hist.length>20)S.hist.length=20;
  el.className=o.action?'rec':'';
  el.innerHTML=`<span class="ob">🧠 ${esc(o.txt)}</span>`+(o.action?`<button id="obGo">${esc(o.action.label)}</button><button class="gh" id="obNo">Ahora no</button>`:'');
  if(o.action){$('#obGo').onclick=()=>{S.cur.until=0;o.action.fn();};$('#obNo').onclick=()=>{S.cur.until=0;};}
 }
}
const RECS={
 beatmatch:['Hemos detectado dificultades igualando el tempo. ¿Deseas hacer una práctica específica de beatmatching?','sinSync'],
 fase:['Hemos detectado dificultades manteniendo la sincronía. ¿Deseas hacer una práctica de fase de 16 beats?','fase16'],
 sync:['Estás usando SYNC en casi todas las mezclas. ¿Probamos una práctica sin SYNC para entrenar el oído?','sinSync'],
 eq:['Los graves se acumulan seguido en tus mezclas. ¿Hacemos una práctica de intercambio de graves?','graves'],
 brusca:['Varias transiciones fueron bruscas. ¿Practicamos una mezcla larga con intercambio de graves?','graves'],
 fraseo:['Tus entradas suelen caer fuera de frase. ¿Hacemos una práctica de fraseo?','fraseo'],
 energia:['Hay saltos de energía bruscos entre temas. ¿Entrenamos criterio con la pista virtual?','__criterio']
};
function err(type){
 C.err[type]++;STATS.err[type]=(STATS.err[type]||0)+1;LS.set('dj_pulse_stats',STATS);
 const n=C.err[type]-(SES.base?SES.base.err[type]:0),t=T();
 if(n>0&&n%3===0&&t-(S.lastRec[type]||-999)>240){S.lastRec[type]=t;const r=RECS[type];
  obs(r[0],3,{label:'Practicar',fn:()=>{if(r[1]==='__criterio')openHub('criterio');else startDrill(DRILLS.find(d=>d.id===r[1]));}});}
}

/* ---------- SESIÓN / INFORME ---------- */
const SES={active:false,base:null,last:null};
function snap(){const o={};for(const k in C){if(k==='trans')continue;o[k]=typeof C[k]==='object'?{...C[k]}:C[k];}o.transN=C.trans.length;o.setN=SETLOG.length;o.t=T();return o;}
function startSession(quiet){SES.active=true;SES.base=snap();if(!quiet)toast('Sesión de práctica iniciada',1400);}
function endSession(){if(!SES.active)return;const r=buildReport(SES.base,'Informe de la sesión');SES.last=r;SES.active=false;SES.base=null;openReport(r);}
function buildReport(base,title){
 const d=k=>C[k]-(base[k]||0),de=k=>C.err[k]-(base.err[k]||0),tr=C.trans.slice(base.transN),sl=SETLOG.slice(base.setN);
 const dur=T()-base.t,tB=d('tBoth'),tP=d('tPhase'),phasePct=tB>3?tP/tB*100:null,bpmAcc=tB>3?d('bpmErr')/tB:null;
 const streak=Math.round(Math.max(S.streak,0,...S.streaks.filter(s=>s[0]>=base.t).map(s=>s[1])));
 const harmL=tr.map(x=>x.harm).filter(x=>x!=null),harm=harmL.length?avg(harmL):null;
 const enC=tr.length?clamp(100-avg(tr.map(x=>Math.max(0,Math.abs(x.dE||0)-1)*25)),0,100):null;
 const flow=tr.length?clamp(avg(tr.map(x=>(x.score!=null?x.score:60)*0.5+x.phRatio*30+(x.phraseOk?20:0)-(x.abrupt?25:0))),0,100):null;
 const titles=new Set(sl.map(x=>x.title).concat(tr.map(x=>x.toT))),cams=new Set(sl.map(x=>x.cam).filter(Boolean)),gens=new Set(sl.map(x=>x.genre).filter(Boolean));
 const variety=titles.size?clamp(titles.size*15+cams.size*10+gens.size*10,0,100):null;
 const riskV=tr.length?avg(tr.map(x=>100-(x.score!=null?x.score:60))):null;
 const risk=riskV==null?'—':riskV<25?'Bajo':riskV<45?'Medio':'Alto';
 const phraseR=tr.length?tr.filter(x=>x.phraseOk).length/tr.length:null;
 const tech=[['Precisión BPM (desvío medio)',bpmAcc==null?'—':'±'+bpmAcc.toFixed(2)+' BPM'],['Tiempo en fase',phasePct==null?'—':Math.round(phasePct)+'%'],['Mejor racha en fase',streak+' beats'],['Uso de jog / nudge',d('jog')+' veces'],['Uso de pitch',d('pitch')+' ajustes'],['Uso de EQ y filtro',d('eq')+' ajustes'],['Intercambios de graves',d('swaps')],['Loops',d('loop')],['Hot cues',d('hot')],['Movimientos de crossfader',d('xf')],['SYNC',d('sync')+' veces'],['Transiciones completas',tr.length]];
 const mus=[['Coherencia armónica',harm==null?'—':Math.round(harm)+'/100'],['Coherencia energética',enC==null?'—':Math.round(enC)+'/100'],['Calidad del flujo',flow==null?'—':Math.round(flow)+'/100'],['Variedad',variety==null?'—':Math.round(variety)+'/100'],['Riesgo asumido',risk]];
 const good=[],bad=[];
 if(phasePct!=null){if(phasePct>=70)good.push('Sostienes bien la fase cuando ambos temas suenan.');else if(phasePct<50)bad.push(['Pasaste mucho tiempo con los bombos desfasados.','fase16']);}
 if(bpmAcc!=null){if(bpmAcc<=0.15)good.push('Tu ajuste de tempo es preciso.');else if(bpmAcc>0.4)bad.push(['El tempo quedó desigualado varios segundos: afina el pitch antes de subir el fader.','sinSync']);}
 if(tr.length){if(d('sync')===0)good.push('Mezclaste sin SYNC: estás entrenando el oído.');else if(d('sync')>=Math.max(2,tr.length))bad.push(['Dependes del SYNC: intenta igualar a oído.','sinSync']);}
 if(d('swaps')>0)good.push('Usas el intercambio de graves como un profesional.');if(de('eq')>=2)bad.push(['Los graves se acumularon en varias mezclas.','graves']);
 if(phraseR!=null){if(phraseR>=0.7)good.push('Entras en frase: tus mezclas respetan la estructura.');else if(phraseR<0.4)bad.push(['Varias entradas cayeron fuera de frase.','fraseo']);}
 if(harm!=null){if(harm>=80)good.push('Eliges temas armónicamente compatibles.');else if(harm<60)bad.push(['Hubo choques tonales: revisa la rueda Camelot antes de elegir.','armonica']);}
 if(enC!=null){if(enC>=80)good.push('Manejas la energía de forma progresiva.');else if(enC<60)bad.push(['La energía dio saltos bruscos entre temas.','__criterio']);}
 if(de('brusca')>=2)bad.push(['Transiciones demasiado rápidas: alarga la mezcla a 8 o 16 compases.','graves']);
 if(!good.length)good.push('Completaste la práctica: la constancia es la base de todo.');
 if(!bad.length)bad.push(['Sin errores importantes: sube la dificultad (BPM ocultos, sin SYNC).','sinSync']);
 return{title,date:new Date(),dur,tech,mus,good:good.slice(0,3),bad:bad.slice(0,3),next:bad[0][1],xp:d('xp'),errs:Object.keys(ERR_TXT).map(k=>[ERR_TXT[k],de(k)]).filter(x=>x[1]>0),trans:tr};
}
function reportText(r){
 const L=[`DECKS · ${r.title} (${r.date.toLocaleString('es-CL')})`,`Duración: ${fmt(r.dur)} · XP ganada: ${r.xp}`,'','INFORME TÉCNICO'];
 r.tech.forEach(x=>L.push(`- ${x[0]}: ${x[1]}`));L.push('','INFORME MUSICAL');r.mus.forEach(x=>L.push(`- ${x[0]}: ${x[1]}`));
 L.push('','FORTALEZAS');r.good.forEach(x=>L.push('- '+x));L.push('','ÁREAS A MEJORAR');r.bad.forEach(x=>L.push('- '+x[0]));
 const nd=DRILLS.find(d=>d.id===r.next);L.push('','PRÓXIMO OBJETIVO: '+(nd?nd.t:'Entrenar criterio en la pista virtual'));return L.join('\n');
}
function openReport(r){
 const nd=DRILLS.find(d=>d.id===r.next);
 $('#repBody').innerHTML=`<p class="mut" style="margin-top:0">${r.date.toLocaleString('es-CL')} · duración ${fmt(r.dur)} · <span class="xpf">+${r.xp} XP</span></p>
 <h3>Informe técnico</h3><table>${r.tech.map(x=>`<tr><td>${x[0]}</td><td>${esc(x[1])}</td></tr>`).join('')}</table>
 <h3>Informe musical</h3><table>${r.mus.map(x=>`<tr><td>${x[0]}</td><td>${esc(x[1])}</td></tr>`).join('')}</table>
 ${r.trans.length?`<h3>Transiciones</h3><table>${r.trans.map(x=>`<tr><td>${esc(x.fromT)} → ${esc(x.toT)}<br><small class="mut">${x.phraseOk?'en frase':'fuera de frase'} · ${Math.round(x.phRatio*100)}% en fase${x.swap?' · cambio de graves':''}${x.sync?' · SYNC':''}${x.abrupt?' · brusca':''}</small></td><td>${x.score!=null?x.score+'%':'—'}</td></tr>`).join('')}</table>`:''}
 ${r.errs.length?`<h3>Errores detectados</h3><table>${r.errs.map(x=>`<tr><td>${x[0]}</td><td>${x[1]}</td></tr>`).join('')}</table>`:''}
 <h3>Fortalezas</h3><ul>${r.good.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
 <h3>Áreas a mejorar</h3><ul>${r.bad.map(x=>`<li>${esc(x[0])}</li>`).join('')}</ul>
 <h3>Próximo objetivo</h3><p>${nd?esc(nd.t)+': '+esc(nd.d):'Entrenar criterio de energía en la pista virtual.'}</p>
 <div class="brow"><button class="btn acc" id="repGo">🎯 Practicar el objetivo</button><button class="btn ai" id="repAI">🧠 Análisis del coach IA</button><button class="btn" id="repCopy">Copiar informe</button></div>
 <div class="aiout" id="repOut"></div>`;
 $('#mRep').classList.add('open');
 $('#repGo').onclick=()=>{$('#mRep').classList.remove('open');if(nd)startDrill(nd);else openHub('criterio');};
 $('#repCopy').onclick=()=>copyText(reportText(r),$('#repCopy'));
 $('#repAI').onclick=()=>askAI(aiPrompt('Analiza este informe de práctica y dame: 1) lo que hice bien, 2) el error más importante y por qué pasa, 3) un ejercicio concreto para la próxima sesión.',{informe:reportText(r)}),$('#repOut'),$('#repAI'));
}
function copyText(t,btn){const done=()=>{if(btn){const o=btn.textContent;btn.textContent='✔ Copiado';setTimeout(()=>btn.textContent=o,1500);}};
 try{navigator.clipboard.writeText(t).then(done,()=>fallback());}catch(e){fallback();}
 function fallback(){const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done();}catch(e){toast('Selecciona y copia el texto manualmente',2000);}ta.remove();}}

/* ---------- IA (Claude) ---------- */
let SAMPLE=null;
let aiTry=0;function initAI(){if(SAMPLE||aiTry>3)return;aiTry++;try{if(window.claude&&typeof window.claude.use==='function'){window.claude.use('sample').then(s=>{if(s){SAMPLE=s;document.body.classList.add('has-ai');}}).catch(()=>{});return;}}catch(e){}setTimeout(initAI,1500*aiTry);}
initAI();
function aiPrompt(task,ctxData){
 return `Eres "Pulse AI Coach", el instructor de la app DECKS · Escuela DJ. Responde en español de Chile, tuteando, sin voseo argentino. Tu rol es enseñar: explica el porqué y propone ejercicios concretos dentro de la app (lecciones, prácticas guiadas, pista virtual). Nunca decides por el estudiante ni ofreces mezclar por él. Sé claro y breve (máximo 170 palabras), en texto simple sin tablas.\n\nCONTEXTO (JSON):\n${JSON.stringify(ctxData)}\n\nTAREA: ${task}`;
}
async function askAI(prompt,out,btn){
 if(!SAMPLE){out.textContent='La IA no está disponible en esta vista.';return;}
 if(btn)btn.disabled=true;out.textContent='Pensando…';
 try{const r=await SAMPLE(prompt,{cache:false,onText:({text})=>{out.textContent=text;}});out.textContent=r.text;}
 catch(e){out.textContent=e&&e.code==='rate_limited'?'Demasiadas consultas seguidas: espera un momento.':e&&e.code==='not_granted'?'No diste permiso para usar la IA en esta página.':'No pude obtener respuesta.';}
 if(btn)btn.disabled=false;
}
function coachContext(){
 const dk=d=>d.loaded&&d.pa?{tema:d.meta.title,bpm:+d.effBpm().toFixed(1),camelot:d.pa.cam,energia:d.pa.energy,genero:d.pa.genre,rol:d.pa.role,sonando:d.playing}:null;
 const cp=A.pa&&B.pa?compat(A.pa,B.pa,A,B):null;
 return{rango:RANKS[rankIdx(XPd.xp)][0],xp:XPd.xp,deckA:dk(A),deckB:dk(B),compatibilidad:cp?{puntaje:cp.score,categoria:cp.cat}:null,errores_historicos:STATS.err,lecciones_completadas:Object.keys(PROG).length,pista_virtual:CROWD.on?{escenario:SCN[CROWD.sc].n,participacion:Math.round(CROWD.P),energia:+CROWD.E.toFixed(1)}:null,playlist:PLP?{bpm_prom:PLP.bpm,energia_prom:PLP.energy,dificultad:PLP.diff}:null,ultimas_observaciones:S.hist.slice(0,5).map(x=>x[1])};
}

/* ---------- EVENTOS DESDE LA APP ---------- */
function onEv(k){
 if(S.mute)return;
 if(k==='pitchA'||k==='pitchB')epi('pitch');
 else if(/^nudge/.test(k)){epi('jog');if(!S.nudgeEval&&bothLoaded()&&A.playing&&B.playing){S.nudgePre=phaseErr();}S.nudgeEval=true;S.lastNudgeT=T();if(S.trans)S.trans.jog=true;}
 else if(k==='syncA'||k==='syncB'){C.sync++;S.lastSyncT=T();}
 else if(/^loop[1248]$/.test(k)){C.loop++;if(S.trans)S.trans.loop=true;}
 else if(k==='loopExit')C.loopExit++;
 else if(k==='hotSet'||k==='hotJump')C.hot++;
}
function onLoad(d){
 d.pa=null;const meta=d.meta||{};
 setTimeout(()=>{
  try{d.pa=analyzeBuf(d.buf,d.peaks,d.bpm,d.firstBeat,meta);}catch(e){d.pa=null;}
  if(d.pa){
   if(DEMOS.find(x=>x.id===meta.id)){DEMO_AN[meta.id]={energy:d.pa.energy,diff:d.pa.diff};LS.set('dj_demo_an',DEMO_AN);}
   if(meta.file)addUserFile(meta.file,{bpm:d.bpm,fb:d.firstBeat,an:d.pa});
   else if(meta.libId)updUser(meta.libId,{bpm:d.bpm,fb:d.firstBeat,cam:d.pa.cam,energy:d.pa.energy,diff:d.pa.diff});
  }
  renderBar(true);if(HUB.open&&HUB.tab==='coach')renderTab();
 },60);
}

/* ---------- TICK PRINCIPAL ---------- */
let barT=0,lastProgN=null,lastLES=null;
function tick(){
 if(!ready())return;
 const dt=FDT,t=T();
 const aA=A.playing&&A.loaded?audible(A):0,aB=B.playing&&B.loaded?audible(B):0;
 const both=bothLoaded()&&A.playing&&B.playing&&aA>0.12&&aB>0.12;
 if(!SES.active&&(A.playing||B.playing))startSession(true);
 if(A.playing||B.playing)C.tPlay+=dt;
 pollControls(t);
 // loops
 for(const d of [A,B]){const p=d.posEst();if(d.loop&&d.playing&&p<S.lastPos[d.id]-d.beatLen()*0.5)C.loopWraps++;S.lastPos[d.id]=p;}
 if(both){
  C.tBoth+=dt;const diff=Math.abs(A.effBpm()-B.effBpm()),pe=phaseErr(),ok=diff<0.12&&pe<0.05;
  C.bpmErr+=Math.min(diff,5)*dt;
  if(ok){C.tPhase+=dt;S.grace=0;const ref=aA>=aB?A:B;S.streak+=dt*ref.effBpm()/60;
   const m=Math.floor(S.streak/16);if(m>S.mile){S.mile=m;xp(4,'Fase sostenida');
    if(m===1)obs('Excelente. Llevas 16 beats perfectamente en fase.',2);else if(m===2)obs('32 beats en fase: así se sostiene una mezcla larga.',2);else if(m===4)obs('64 beats en fase. Mezcla sólida.',2);}}
  else{S.grace+=dt;if(S.grace>0.4)endStreak();}
  S.flamT=diff<0.3&&pe>0.1?S.flamT+dt:0;if(S.flamT>2.5){S.flamT=0;err('fase');obs('Los bombos están desfasados (“flam”): corrige con el jog o con ◀ ▶.',1);}
  S.bmT=diff>=0.3?S.bmT+dt:0;if(S.bmT>4){S.bmT=-6;err('beatmatch');obs(`Los tempos no coinciden (${diff.toFixed(1)} BPM de diferencia): ajusta el pitch del que entra.`,1);}
  const acc=MX.A.low>-0.3&&MX.B.low>-0.3&&aA>0.3&&aB>0.3;S.accT=acc?S.accT+dt:0;
  if(S.accT>4){S.accT=-10;err('eq');obs('Los graves se están acumulando: baja el LOW de uno de los dos temas.',2);}
 }else{endStreak();S.flamT=0;S.bmT=Math.min(S.bmT,0);S.accT=Math.min(S.accT,0);}
 if(S.nudgeEval&&t-S.lastNudgeT>1.2){S.nudgeEval=false;if(both&&S.nudgePre>0.06&&phaseErr()<0.035){obs('Buena corrección con el jog.',2);xp(5,'Corrección con jog');}}
 // graves
 for(const id of ['A','B']){const v=MX[id].low,st=v<-0.7?'k':v>-0.25?'o':S.lowSt[id];if(st!==S.lowSt[id]){S.lowSt[id]=st;S.lowT[id][st]=t;}}
 if(S.trans&&!S.trans.swap&&both){const f=S.trans.from,to=S.trans.to,t0=S.trans.t0;
  if(S.lowT[f].k>t0&&S.lowT[to].o>t0&&Math.abs(S.lowT[f].k-S.lowT[to].o)<6){S.trans.swap=true;C.swaps++;obs('Buen intercambio de frecuencias bajas.',2);xp(30,'EQ: intercambio de graves');}}
 transTick(dt,aA,aB,both,t);
 crowdTick(dt);
 drillTick();
 // lecciones completadas / cambio de lección
 const pn=Object.keys(PROG).length;if(lastProgN==null)lastProgN=pn;if(pn>lastProgN){xp(60*(pn-lastProgN),'Lección completada');lastProgN=pn;}
 if(LES!==lastLES){lastLES=LES;LB=snap();LB.qz=QZ.ok;}
 obsTick();
 if(t-barT>0.3){barT=t;renderBar(false);if(HUB.open&&(HUB.tab!=='coach'||t-S.hubT>1)){S.hubT=t;liveHub();}}
 if(HUB.open&&HUB.tab==='pista')drawCrowd();
}
function endStreak(){if(S.streak>=8)S.streaks.push([T(),S.streak]);if(S.streaks.length>60)S.streaks.shift();S.streak=0;S.mile=0;S.grace=0;}
function pollControls(t){
 for(const d of [A,B]){const id=d.id,v=d.pitchVal,dv=v-S.lastPitch[id];
  if(Math.abs(dv)>1e-5){const dir=Math.sign(dv);if(dir===S.pDir[id])S.pTravel[id]+=Math.abs(dv);else{if(S.pDir[id]!==0&&S.pTravel[id]>0.01)S.pitchRev.push(t);S.pDir[id]=dir;S.pTravel[id]=Math.abs(dv);}S.lastPitch[id]=v;}}
 S.pitchRev=S.pitchRev.filter(x=>t-x<12);
 if(S.pitchRev.length>=6){S.pitchRev=[];obs('Estás corrigiendo demasiado con el pitch: haz pasos pequeños, escucha 4 beats y corrige la fase con el jog.',2);err('beatmatch');}
 for(const id of ['A','B'])for(const k of ['hi','mid','low','filter']){const key=id+k,v=MX[id][k];if(S.prevMX[key]!=null&&Math.abs(v-S.prevMX[key])>0.01)epi('eq');S.prevMX[key]=v;}
 if(S.prevMX.xf!=null&&Math.abs(MX.xf-S.prevMX.xf)>0.01)epi('xf');S.prevMX.xf=MX.xf;
}
function setEntry(d){if(!d.loaded)return;const last=SETLOG[SETLOG.length-1];if(last&&last.title===d.meta.title&&T()-last.t<20)return;
 SETLOG.push({title:d.meta.title,bpm:d.effBpm(),energy:d.pa?d.pa.energy:null,cam:d.pa?d.pa.cam:null,genre:d.pa?d.pa.genre:null,role:d.pa?d.pa.role:null,t:T()});if(SETLOG.length>80)SETLOG.shift();}
function transTick(dt,aA,aB,both,t){
 if(!S.trans){
  if(both){const from=S.dom||(aA>=aB?A:B),to=from===A?B:A;
   S.trans={from:from.id,to:to.id,t0:t,beatPos:from.beatsF(),phaseOk:0,tot:0,syncs:C.sync,swap:false,cs:from.pa&&to.pa?compat(from.pa,to.pa,from,to):null};
   if(!SETLOG.length)setEntry(from);}
  else{const lead=aA>0.12&&aA>=aB?A:aB>0.12?B:null;if(lead&&lead!==S.dom){S.dom=lead;setEntry(lead);}}
  return;}
 const tr=S.trans,fD=decks[tr.from],tD=decks[tr.to];tr.tot+=dt;
 if(both&&Math.abs(A.effBpm()-B.effBpm())<0.15&&phaseErr()<0.06)tr.phaseOk+=dt;
 const af=fD.playing?audible(fD):0,at=tD.playing?audible(tD):0;
 if(af<0.05&&at>0.12){finishTrans(tr,fD,tD);S.dom=tD;S.trans=null;}
 else if(at<0.05&&af>0.12){if(tr.tot>2)obs('Volviste al tema anterior: si no estabas listo, usa un loop para ganar tiempo.',1);S.trans=null;}
 else if(af<0.05&&at<0.05)S.trans=null;
}
function finishTrans(tr,fD,tD){
 const beats=tr.tot*(tD.bpm?tD.effBpm():120)/60,m=((tr.beatPos%32)+32)%32,off=Math.min(m,32-m),phraseOk=off<=1.5;
 const phR=clamp(tr.phaseOk/Math.max(0.01,tr.tot),0,1),abrupt=beats<8&&(phR<0.6||!phraseOk);
 const usedSync=C.sync>tr.syncs||S.lastSyncT>tr.t0-30,cs=tr.cs,dE=fD.pa&&tD.pa?tD.pa.energy-fD.pa.energy:0;
 const rec={fromT:fD.meta.title,toT:tD.meta.title,t:T(),dur:tr.tot,beats,phRatio:phR,phraseOk,abrupt,swap:tr.swap,sync:usedSync,loop:!!tr.loop,score:cs?cs.score:null,harm:cs?cs.h:null,dE};
 C.trans.push(rec);setEntry(tD);
 if(abrupt){err('brusca');obs('Transición brusca: alarga la mezcla a 8 o 16 compases, o corta justo en el “1” de una frase.',2);}
 else if(!phraseOk){err('fraseo');obs('La mezcla es técnicamente correcta. Podrías mejorar el fraseo: entra en el “1” de una frase (compás 9, 17, 25…).',2);}
 else if(phR>0.8)obs('Excelente transición: en frase y en fase.',2);
 else obs('La mezcla es técnicamente correcta.',1);
 xp(15,'Transición completa');
 if(cs&&cs.h>=85&&phR>=0.5)xp(40,'Mezcla armónica');
 if(!usedSync&&phR>=0.5)xp(25,'Mezcla sin SYNC');
 if(phraseOk)xp(10,'Entrada en frase');
 const last3=C.trans.slice(-3);if(last3.length===3&&last3.every(x=>x.sync)&&usedSync)err('sync');
 if(Math.abs(dE)>=3){err('energia');obs(`Salto de energía de ${dE>0?'+':''}${dE} puntos: ${dE>0?'la pista puede sentirlo forzado':'puede bajar la pista'}. Prefiere pasos de 1 o 2.`,1);}
 readingAdvice();
}
function readingAdvice(){
 const L=SETLOG.slice(-4).filter(x=>x.bpm);if(L.length<3)return;
 const dB=Math.round(L[L.length-1].bpm-L[0].bpm),n=L.length,hi=CROWD.on?curveAt(CROWD.hour)>=7:null;
 if(dB>=8)obs(`Has aumentado ${dB} BPM en ${n} canciones. `+(hi==null?'Podría ser adecuado para un Peak Time; sería arriesgado durante un Warm-Up.':hi?'Calza con el momento alto de esta pista.':'Para esta hora de la noche podría ser demasiado rápido.'),1);
 else if(dB<=-8)obs(`Bajaste ${-dB} BPM en ${n} canciones: buen recurso para Recovery o Closing; en Peak Time puede vaciar la pista.`,1);
 const E=SETLOG.slice(-5).map(x=>x.energy).filter(x=>x!=null);
 if(E.length===5&&Math.max(...E)===Math.min(...E))obs('Llevas 5 temas en la misma energía: la pista puede aburrirse. Prueba un cambio de 1 o 2 puntos.',1);
}

/* ---------- PISTA VIRTUAL ---------- */
const SCN={
 matrimonio:{n:'Matrimonio',age:42,size:120,h0:21,bpm:[100,124],g:['Disco','Open Format','House','Hip-Hop'],curve:[[21,4],[23,7],[25,8],[27,5],[28,3]]},
 club:{n:'Club',age:27,size:350,h0:23,bpm:[120,130],g:['House','Tech House','Deep House','Techno','Progressive'],curve:[[23,4],[25,7],[27,9],[29,6],[30,4]]},
 bar:{n:'Bar',age:32,size:60,h0:21,bpm:[98,122],g:['Disco','Deep House','Open Format','House'],curve:[[21,3],[23,5],[25,6],[26,4]]},
 festival:{n:'Festival',age:25,size:3000,h0:20,bpm:[124,140],g:['EDM','Tech House','Trance','Techno','Progressive'],curve:[[18,5],[20,7],[22,9],[24,9],[25,7]]},
 cumple:{n:'Cumpleaños',age:35,size:40,h0:22,bpm:[95,126],g:['Open Format','Disco','House','Hip-Hop'],curve:[[22,4],[24,7],[26,6],[27,4]]},
 u:{n:'Fiesta universitaria',age:21,size:200,h0:23,bpm:[118,132],g:['EDM','Tech House','Hip-Hop','House','Techno'],curve:[[22,5],[24,8],[26,9],[28,6]]},
};
const CROWD={on:false,sc:'club',age:27,size:350,e0:4,hour:23,E:4,P:30,flow:50,conf:50,ppl:[],msgT:0,desire:4};
function curveAt(h){const sc=SCN[CROWD.sc],c=sc.curve;let x=h<12?h+24:h;if(x<=c[0][0])return c[0][1];for(let i=1;i<c.length;i++){if(x<=c[i][0]){const a=c[i-1],b=c[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}}return c[c.length-1][1];}
function hourStr(h){h=((h%24)+24)%24;const H=Math.floor(h),M=Math.floor((h-H)*60);return String(H).padStart(2,'0')+':'+String(M).padStart(2,'0');}
function setScenario(k){const s=SCN[k];CROWD.sc=k;CROWD.age=s.age;CROWD.size=s.size;CROWD.hour=s.h0;CROWD.e0=Math.round(curveAt(s.h0));CROWD.E=CROWD.e0;CROWD.P=30;CROWD.flow=50;CROWD.conf=50;buildPeople();}
function buildPeople(){const N=clamp(Math.round(Math.sqrt(CROWD.size)*4),12,140);CROWD.ppl=[];for(let i=0;i<N;i++){CROWD.ppl.push({x:Math.random(),y:0.25+Math.random()*0.7,aff:Math.random(),ph:Math.random()*6.28,h:Math.floor(Math.random()*360),tx:-1,ty:-1});}}
function currentMix(){
 if(!ready())return{silent:true};
 const aA=A.playing&&A.loaded?audible(A):0,aB=B.playing&&B.loaded?audible(B):0,s=aA+aB;if(s<0.08)return{silent:true};
 const eA=A.pa?A.pa.energy:5,eB=B.pa?B.pa.energy:5,lead=aA>=aB?A:B;
 const flam=aA>0.12&&aB>0.12&&bothLoaded()&&(Math.abs(A.effBpm()-B.effBpm())>0.3||phaseErr()>0.1);
 const cut=(MX[lead.id].low<-0.7?1.5:0)+(Math.abs(MX[lead.id].filter)>0.5?1:0);
 return{silent:false,E:clamp((eA*aA+eB*aB)/s-cut,1,10),bpm:lead.bpm?lead.effBpm():120,genre:lead.pa?lead.pa.genre:'House',flam,lead};
}
function genreFit(g){const sc=SCN[CROWD.sc];let f=sc.g.includes(g)?1:0.55;const a=CROWD.age;
 if(a<27&&['EDM','Hip-Hop','Tech House','Techno','Trance'].includes(g))f+=0.15;if(a>40&&['Disco','Open Format','House','Deep House'].includes(g))f+=0.15;if(a>45&&['Techno','Trance','EDM'].includes(g))f-=0.2;return clamp(f,0.2,1);}
function crowdTick(dt){
 if(!CROWD.on)return;const sc=SCN[CROWD.sc],m=currentMix();
 CROWD.hour+=dt*6/3600;if(CROWD.hour>=48)CROWD.hour-=24;
 const target=clamp(curveAt(CROWD.hour)+(CROWD.e0-curveAt(sc.h0))*0.3,1,10);
 CROWD.desire=clamp(Math.min(target,CROWD.E+2),1,10);
 let q=0;
 if(m.silent){CROWD.P+=(5-CROWD.P)*dt*0.12;CROWD.flow+=(0-CROWD.flow)*dt*0.1;CROWD.E+=(1-CROWD.E)*dt*0.05;}
 else{
  const eFit=1-Math.min(1,Math.abs(m.E-CROWD.desire)/4),r=sc.bpm,bd=m.bpm<r[0]?r[0]-m.bpm:m.bpm>r[1]?m.bpm-r[1]:0,bFit=Math.max(0,1-bd/12),gFit=genreFit(m.genre);
  q=0.5*eFit+0.25*bFit+0.25*gFit;if(m.flam)q*=0.4;
  CROWD.P+=(15+85*q-CROWD.P)*dt*0.08;
  CROWD.E+=(m.E*(0.4+0.6*CROWD.P/100)-CROWD.E)*dt*0.05;
  const lt=C.trans[C.trans.length-1],tq=lt&&T()-lt.t<120?((lt.score!=null?lt.score:60)/100*0.6+lt.phRatio*0.4):0.7;
  CROWD.flow+=((m.flam?20:55+45*tq)-CROWD.flow)*dt*0.05;
  const t=T();
  if(t-CROWD.msgT>25){
   let msg=null;
   if(m.flam)msg='La pista nota el desfase: la gente pierde el paso.';
   else if(m.E<CROWD.desire-2)msg='La pista pide más energía.';
   else if(m.E>CROWD.desire+2)msg='Vas demasiado arriba para esta hora: la gente se cansa y va a la barra.';
   else if(gFit<0.6)msg=`Este público (${CROWD.age} años promedio) no conecta mucho con ${m.genre}.`;
   else if(bFit<0.6)msg=`${Math.round(m.bpm)} BPM está fuera del rango cómodo de este evento (${r[0]}–${r[1]}).`;
   else if(CROWD.P>80)msg='¡La pista está llena! Mantén el flow y evita cambios bruscos.';
   if(msg){CROWD.msgT=t;obs(msg,1);}
  }
 }
 CROWD.P=clamp(CROWD.P,0,100);CROWD.E=clamp(CROWD.E,0,10);CROWD.flow=clamp(CROWD.flow,0,100);
 const ph=C.tBoth>0?C.tPhase/C.tBoth:0.5;CROWD.conf+=((0.4*CROWD.P+0.3*CROWD.flow+0.3*ph*100)-CROWD.conf)*dt*0.03;CROWD.conf=clamp(CROWD.conf,0,100);
}
function drawCrowd(){
 const c=$('#crowdC');if(!c||!c.offsetParent)return;sizeCanvas(c);const g=c.getContext('2d'),W=c.width,H=c.height,dpr=DPR();
 g.fillStyle='#0b0c0f';g.fillRect(0,0,W,H);
 const m=currentMix(),lead=m.lead,ph=lead&&lead.bpm?lead.phase():0,E=CROWD.on?CROWD.E:0,col=lead===B?'41,182,255':'255,122,26';
 for(let i=0;i<3;i++){const x=W*(0.15+0.3*i),gr=g.createRadialGradient(x,0,0,x,0,H*1.1);gr.addColorStop(0,`rgba(${col},${m.silent?0.03:0.06+0.22*(1-ph)*E/10})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);}
 g.fillStyle='#1d1e23';g.fillRect(W*0.3,0,W*0.4,H*0.09);g.fillStyle='#9a9ca6';g.font=`600 ${11*dpr}px Chakra Petch`;g.textAlign='center';g.textBaseline='middle';g.fillText('CABINA DJ',W*0.5,H*0.045);
 g.fillStyle='#15161a';g.fillRect(W*0.86,H*0.12,W*0.14,H*0.88);g.fillStyle='#6d6f78';g.fillText('BARRA',W*0.93,H*0.18);
 if(!CROWD.on){g.fillStyle='#aeb0b9';g.font=`${13*dpr}px Chakra Petch`;g.fillText('Elige un escenario y abre la pista',W*0.43,H*0.6);return;}
 const k=Math.round(CROWD.ppl.length*CROWD.P/100),sorted=CROWD.ppl.slice().sort((a,b)=>b.aff-a.aff),beat=lead&&lead.bpm&&lead.playing?lead.beatsF():T()*2;
 sorted.forEach((p,i)=>{const dance=i<k;const tx=dance?0.04+p.x*0.78:0.87+(p.x*0.11),ty=dance?0.22+(p.y-0.25)*0.95:0.25+p.y*0.7;
  if(p.tx<0){p.tx=tx;p.ty=ty;}p.tx+=(tx-p.tx)*0.04;p.ty+=(ty-p.ty)*0.04;
  const bob=dance&&!m.silent?Math.abs(Math.sin(Math.PI*(beat+p.ph/6.28)))*(2+E*0.9)*dpr:0,x=p.tx*W,y=p.ty*H-bob,r=3.2*dpr;
  g.fillStyle=`hsl(${p.h},${dance?55:15}%,${dance?62:40}%)`;g.beginPath();g.arc(x,y-r*2.2,r,0,7);g.fill();g.fillRect(x-r*0.9,y-r*1.1,r*1.8,r*2.6);
  if(dance&&E>6&&!m.silent&&i%3===0){g.fillRect(x-r*2,y-r*2.6-bob*0.3,r*0.7,r*1.6);g.fillRect(x+r*1.3,y-r*2.6-bob*0.3,r*0.7,r*1.6);}
 });
}

/* ---------- BIBLIOTECA (IndexedDB) ---------- */
let DEMO_AN=LS.get('dj_demo_an',{});let USER=[];let DBH=null;
function idb(){return new Promise(res=>{if(DBH)return res(DBH);try{const r=indexedDB.open('decks_lib',1);r.onupgradeneeded=()=>{r.result.createObjectStore('tracks',{keyPath:'id'});};r.onsuccess=()=>{DBH=r.result;res(DBH);};r.onerror=()=>res(null);}catch(e){res(null);}});}
async function idbAll(){const db=await idb();if(!db)return[];return new Promise(res=>{try{const q=db.transaction('tracks').objectStore('tracks').getAll();q.onsuccess=()=>res(q.result||[]);q.onerror=()=>res([]);}catch(e){res([]);}});}
async function idbPut(o){const db=await idb();if(!db)return;return new Promise(res=>{try{const tx=db.transaction('tracks','readwrite');tx.objectStore('tracks').put(o);tx.oncomplete=()=>res();tx.onerror=()=>res();}catch(e){res();}});}
async function idbDel(id){const db=await idb();if(!db)return;return new Promise(res=>{try{const tx=db.transaction('tracks','readwrite');tx.objectStore('tracks').delete(id);tx.oncomplete=()=>res();tx.onerror=()=>res();}catch(e){res();}});}
idbAll().then(r=>{USER=r;if(HUB.open)renderTab();renderLoaderLib();});
function estEnergy(b){return clamp(Math.round(1+(0.5*clamp((b-95)/40,0,1)+0.25)*9),1,10);}
function demoItem(d){const an=DEMO_AN[d.id]||{};return{id:d.id,demo:true,title:d.title,artist:d.artist,genre:d.genre,bpm:d.bpm,cam:parseCam(d.key),energy:an.energy||estEnergy(d.bpm),diff:an.diff||(d.bpm<115||d.bpm>132?3:2),license:'Demo DECKS · sintetizado en tu navegador',hasAudio:true,col:d.col};}
function LIB(){return DEMOS.map(demoItem).concat(USER);}
function slugT(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\.[a-z0-9]{2,4}$/,'').replace(/[^a-z0-9]+/g,' ').trim();}
async function addUserFile(file,info){
 const name=file.name.replace(/\.[^.]+$/,''),sl=slugT(name);
 let rec=USER.find(u=>!u.hasAudio&&(slugT(u.file)===sl||slugT(u.artist+' - '+u.title)===sl||slugT(u.title)===sl))||USER.find(u=>u.hasAudio&&u.fname===file.name&&u.size===file.size);
 if(!rec){const pts=name.split(/\s[-–]\s/);rec={id:'u'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),title:pts.length>1?pts.slice(1).join(' - '):name,artist:pts.length>1?pts[0]:'Archivo propio',genre:null,license:'Archivo propio (uso personal)',source:'Tu dispositivo',col:'hsl('+Math.floor(Math.random()*360)+',70%,65%)'};USER.push(rec);}
 rec.blob=file;rec.hasAudio=true;rec.fname=file.name;rec.size=file.size;
 if(info){rec.bpm=info.bpm;rec.fb=info.fb;if(info.an){rec.cam=rec.cam||info.an.cam;rec.energy=info.an.energy;rec.diff=info.an.diff;if(!rec.genre)rec.genre=info.an.genre;}}
 await idbPut(rec);if(HUB.open&&HUB.tab==='biblio')renderTab();renderLoaderLib();return rec;
}
async function updUser(id,o){const r=USER.find(u=>u.id===id);if(!r)return;Object.assign(r,o);if(!r.genre&&o.genre)r.genre=o.genre;await idbPut(r);}
async function analyzeItem(rec){
 if(!ctx||!rec.blob)return false;
 try{const buf=await decode(await rec.blob.arrayBuffer());const pk=computePeaks(buf),b=detectBPM(pk,buf.sampleRate),an=analyzeBuf(buf,pk,b.bpm,b.firstBeat,{key:rec.cam,genre:rec.genre});
  Object.assign(rec,{bpm:b.bpm,fb:b.firstBeat,cam:rec.cam||an.cam,energy:an.energy,diff:an.diff,genre:rec.genre||an.genre});await idbPut(rec);return true;}catch(e){return false;}
}
function decode(ab){return new Promise((res,rej)=>{const p=ctx.decodeAudioData(ab,res,rej);if(p&&p.then)p.then(res,rej);});}
async function libLoad(d,it){
 if(!ctx){toast('Primero toca ENCENDER');return;}
 if(it.demo)return loadDemo(d,it.id);
 if(!it.hasAudio||!it.blob){toast('Esta pista aún no tiene audio: agrega el archivo en 🧠 Pulse → Biblioteca.',3000);return;}
 toast(`<span class="spinner"></span> Cargando “${esc(it.title)}”…`,15000);
 try{const buf=await decode(await it.blob.arrayBuffer());
  await d.loadBuffer(buf,{id:it.id,libId:it.id,title:it.title,artist:it.artist||'Biblioteca',bpm:it.bpm||0,firstBeat:it.fb||0,key:it.cam||'',genre:it.genre||null,col:it.col||(d.id==='A'?'#ffb26b':'#7fd3ff')});
  toast(`“${esc(it.title)}” cargado en ${d.id}`,1400);}catch(e){toast('No pude abrir esa pista.',2500);}
}
const LICOK=/(cc0|public\s*domain|dominio\s*p[uú]blico|creativecommons\.org\/(licenses|publicdomain)|^\s*cc[\s-]*by|creative\s*commons)/i;
async function importCatalog(arr){
 let ok=0,bad=0;for(const x of arr){if(!x||!x.title){bad++;continue;}const lic=String(x.license||x.licencia||'')+' '+String(x.licenseUrl||x.license_url||'');
  if(!LICOK.test(lic)){bad++;continue;}
  const id='c'+slugT((x.artist||'')+' '+x.title).replace(/ /g,'-').slice(0,60);let rec=USER.find(u=>u.id===id);
  if(!rec){rec={id,hasAudio:false,col:'hsl('+Math.floor(Math.random()*360)+',60%,62%)'};USER.push(rec);}
  const cam=parseCam(x.camelot||x.key||'')||parseMusicalKey(x.key||'');
  Object.assign(rec,{title:String(x.title),artist:String(x.artist||'—'),genre:GENRES.includes(x.genre)?x.genre:(x.genre?String(x.genre):null),bpm:+x.bpm||rec.bpm||0,fb:rec.fb||0,cam:cam||rec.cam||null,energy:+x.energy||rec.energy||null,diff:+x.difficulty||+x.dificultad||rec.diff||null,license:String(x.license||x.licencia||'CC'),licenseUrl:/^https:\/\//.test(x.licenseUrl||'')?x.licenseUrl:'',source:String(x.source||x.fuente||''),url:/^https:\/\//.test(x.url||'')?x.url:'',file:String(x.file||x.archivo||'')});
  await idbPut(rec);ok++;}
 return[ok,bad];
}

/* ---------- PLAYLISTS ---------- */
let PL=LS.get('dj_pulse_pl',[]),PLP=null;
function csvSplit(line,sep){const out=[];let cur='',q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(q){if(ch==='"'){if(line[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=ch;}else if(ch==='"')q=true;else if(ch===sep){out.push(cur);cur='';}else cur+=ch;}out.push(cur);return out.map(s=>s.trim());}
function parsePlaylist(txt){
 const lines=String(txt||'').split(/\r?\n/).filter(l=>l.trim());if(!lines.length)return[];
 const sep=(lines[0].match(/;/g)||[]).length>(lines[0].match(/,/g)||[]).length?';':',';
 const hd=csvSplit(lines[0],sep).map(h=>h.toLowerCase());
 const fi=re=>hd.findIndex(h=>re.test(h));
 const iT=/\s[-–—]\s/.test(lines[0])?-1:fi(/track name|^name$|title|^tema|canci/);let iA=fi(/artist name|artista/);if(iA<0)iA=fi(/artist/);
 const rows=[];
 if(iT>=0&&hd.length>1){
  const iB=fi(/tempo|bpm/),iK=fi(/^key$|tonalidad|camelot|^clave/),iM=fi(/^mode$|modo/),iE=fi(/energy|energ/),iG=fi(/genre|g[eé]nero/);
  for(const l of lines.slice(1)){const c=csvSplit(l,sep);if(!c[iT])continue;let cam=null;
   if(iK>=0){const kv=c[iK];cam=parseCam(kv)||parseMusicalKey(kv);if(!cam&&/^\d{1,2}$/.test(kv)&&iM>=0)cam=camFromPc(+kv,c[iM]==='0');}
   let e=iE>=0?parseFloat(c[iE]):NaN;if(!isNaN(e))e=e<=1?Math.round(1+e*9):Math.round(e);
   rows.push({title:c[iT],artist:iA>=0?c[iA]:'',bpm:iB>=0?Math.round(parseFloat(c[iB])*10)/10||null:null,cam,energy:isNaN(e)?null:clamp(e,1,10),genre:iG>=0&&c[iG]?c[iG].split(/[,;|]/)[0].trim():null,est:false});}
 }else{
  for(const l of lines){const t=l.replace(/^\s*\d+[.)]\s*/,'').trim();if(!t||/^https?:\/\//.test(t))continue;
   const pts=t.split(/\s[-–—]\s/);const tail=t;
   const bm=/(\d{2,3}(?:\.\d+)?)\s*bpm/i.exec(tail)||/[,|]\s*(\d{2,3}(?:\.\d+)?)\s*(?=[,|]|$)/.exec(tail);
   const cam=parseCam(tail),em=/\bE\s*(\d{1,2})\b|energ[ií]a\s*(\d{1,2})/i.exec(tail);
   const clean=s=>s.split(/[,|(]/)[0].trim();
   rows.push({artist:pts.length>1?clean(pts[0]):'',title:pts.length>1?clean(pts.slice(1).join(' - ')):clean(t),bpm:bm?parseFloat(bm[1]):null,cam,energy:em?clamp(+(em[1]||em[2]),1,10):null,genre:null,est:false});}
 }
 return rows.slice(0,300);
}
function analyzePlaylist(rows){
 if(!rows.length)return null;
 const bp=rows.map(r=>r.bpm).filter(Boolean),en=rows.map(r=>r.energy).filter(Boolean);
 const dist={};rows.forEach(r=>{if(r.cam)dist[r.cam]=(dist[r.cam]||0)+1;});
 const gc={};rows.forEach(r=>{if(r.genre)gc[r.genre]=(gc[r.genre]||0)+1;});
 const gens=Object.entries(gc).sort((a,b)=>b[1]-a[1]).slice(0,4);
 const sd=bp.length>1?Math.sqrt(avg(bp.map(x=>(x-avg(bp))**2))):0;
 let clash=0,pairs=0;for(let i=1;i<rows.length;i++){if(rows[i].cam&&rows[i-1].cam){pairs++;if(camScore(rows[i-1].cam,rows[i].cam).s<60)clash++;}}
 const out=bp.length?bp.filter(b=>b<115||b>132).length/bp.length:0;
 const dv=clamp(Math.round(1+Math.min(3,sd/4)+(pairs?clash/pairs*3:1.5)+Math.min(2,Object.keys(gc).length/3)+out*2),1,10);
 const known=rows.filter(r=>r.bpm&&r.cam&&r.energy);
 let order=[];if(known.length>=3){const rest=known.slice();let cur=rest.sort((a,b)=>a.energy-b.energy).shift();order.push(cur);
  while(rest.length&&order.length<12){let bi=0,bs=-1;rest.forEach((r,i)=>{const sc=camScore(cur.cam,r.cam).s*0.5+(100-Math.min(100,Math.abs(r.bpm-cur.bpm)*10))*0.3+(r.energy>=cur.energy?100:60)*0.2;if(sc>bs){bs=sc;bi=i;}});cur=rest.splice(bi,1)[0];order.push(cur);}}
 const recs=[];const ab=bp.length?Math.round(avg(bp)):null;
 if(ab)recs.push(`Tu playlist promedia ${ab} BPM: practica beatmatching con temas de ${ab-3} a ${ab+3} BPM.`);
 const topCam=Object.entries(dist).sort((a,b)=>b[1]-a[1])[0];if(topCam)recs.push(`La tonalidad más frecuente es ${topCam[0]}: entrena mezclas hacia sus vecinas en la rueda Camelot.`);
 if(sd>8)recs.push(`Rango de tempo amplio (${Math.round(Math.min(...bp))}–${Math.round(Math.max(...bp))} BPM): practica cortes en frase y loops para cambiar de tempo.`);
 if(pairs&&clash/pairs>0.4)recs.push('En el orden actual hay muchos choques tonales: prueba el orden sugerido como ejercicio.');
 if(dv>=7)recs.push('Playlist exigente: empieza con pares de compatibilidad Excelente antes de los cambios grandes.');
 return{n:rows.length,bpm:ab,energy:en.length?Math.round(avg(en)*10)/10:null,dist,gens,diff:dv,diffL:dv<=3?'Fácil':dv<=6?'Moderada':'Exigente',order,recs,missing:rows.filter(r=>!r.bpm||!r.cam||!r.energy).length,est:rows.some(r=>r.est)};
}
PLP=analyzePlaylist(PL);
async function aiComplete(btn,out){
 if(!SAMPLE){out.textContent='La IA no está disponible en esta vista.';return;}
 const miss=PL.map((r,i)=>({i,r})).filter(x=>!x.r.bpm||!x.r.cam||!x.r.energy).slice(0,60);
 if(!miss.length){out.textContent='No hay datos faltantes.';return;}
 btn.disabled=true;out.textContent='Consultando a la IA…';
 const list=miss.map(x=>`${x.i}. ${x.r.artist?x.r.artist+' - ':''}${x.r.title}`).join('\n');
 const prompt=`Para cada canción, estima BPM, tonalidad en notación Camelot (ej. 8A), energía 1-10 y género principal (uno de: ${GENRES.join(', ')}). Si no conoces la canción con razonable seguridad, usa null. Responde SOLO con un arreglo JSON: [{"i":número,"bpm":número|null,"cam":"8A"|null,"energy":número|null,"genre":texto|null}].\n\n${list}`;
 try{const r=await SAMPLE(prompt,{cache:false});const m=/\[[\s\S]*\]/.exec(r.text||'');const arr=m?JSON.parse(m[0]):[];let n=0;
  arr.forEach(o=>{const row=PL[o.i];if(!row)return;let ch=false;if(!row.bpm&&+o.bpm>50&&+o.bpm<220){row.bpm=+o.bpm;ch=true;}const c=parseCam(o.cam);if(!row.cam&&c){row.cam=c;ch=true;}if(!row.energy&&+o.energy>=1){row.energy=clamp(Math.round(+o.energy),1,10);ch=true;}if(!row.genre&&o.genre){row.genre=String(o.genre);ch=true;}if(ch){row.est=true;n++;}});
  LS.set('dj_pulse_pl',PL);PLP=analyzePlaylist(PL);out.textContent=`La IA completó ${n} temas. Son estimaciones: verifícalas con tu software o tu oído.`;renderTab();}
 catch(e){out.textContent=e&&e.code==='not_granted'?'No diste permiso para usar la IA.':'No pude completar los datos con IA.';}
 btn.disabled=false;
}

/* ---------- SPOTIFY (conector de claude.ai) ---------- */
const SPN='Spotify';let SPOTHER=[];let MCP=null,SPST={state:'cargando',msg:'Buscando el conector…'},SPRES=[],SPRAW='';
let mcpTry=0;async function initMCP(){try{if(!(window.claude&&typeof window.claude.use==='function')){if(++mcpTry<4){setTimeout(initMCP,2000);return;}SPST={state:'off',msg:'Spotify y la IA funcionan cuando abres DECKS desde claude.ai (artifact “DECKS · Escuela DJ”). En esta versión web usa la lista pegada o un CSV.'};if(HUB.open&&HUB.tab==='playlist')renderTab();return;}MCP=await window.claude.use('mcp');}catch(e){MCP=null;}
 if(!MCP){SPST={state:'off',msg:'Los conectores no están disponibles en esta vista. Abre la app desde claude.ai.'};}else await spCheck();if(HUB.open&&HUB.tab==='playlist')renderTab();}
setTimeout(initMCP,300);
async function spCheck(){
 try{const r=await MCP.listTools(SPN),s=r.servers.find(x=>x.server===SPN);
  if(!s||!s.tools.length)SPST={state:'nocon',msg:'Spotify no está conectado. Agrégalo en claude.ai → Configuración → Conectores y vuelve a abrir la app.'};
  else if(s.authStatus==='needs_reauth')SPST={state:'reauth',msg:'Tu sesión de Spotify venció. Reconéctalo en claude.ai → Configuración → Conectores.'};
  else SPST={state:'ok',msg:s.authStatus==='connected'?'Spotify conectado.':'Spotify disponible: la primera consulta te pedirá permiso.'};}
 catch(e){SPST=spErr(e);}
}
function spErr(e){const c=e&&e.code;
 const M={server_not_connected:['nocon','Spotify no está conectado. Agrégalo en claude.ai → Configuración → Conectores.'],needs_reauth:['reauth','Tu sesión de Spotify venció. Reconéctalo en claude.ai → Configuración → Conectores.'],
  not_in_manifest:['denied','No permitiste Spotify en esta página. Puedes activarlo de nuevo desde la app en claude.ai.'],approval_required:['ok','La consulta necesita tu aprobación: vuelve a tocar el botón y acepta.'],
  selection_required:['nocon','Tienes más de un conector de Spotify: elige uno cuando claude.ai te lo pregunte.'],blocked_by_policy:['denied','Tu organización bloquea esta herramienta de Spotify.'],
  server_unavailable:['ok','Spotify no responde en este momento. Intenta de nuevo en unos segundos.'],tool_error:['ok','Spotify respondió con un error: '+(e&&e.message||'sin detalle')],
  not_granted:['off','Los conectores no están habilitados en esta vista.'],capability_disabled:['off','Los conectores no están disponibles en esta vista.']};
 const m=M[c]||['ok','No se pudo completar la consulta a Spotify.'];return{state:m[0],msg:m[1]};}
function spExtract(payload){
 const out=[],seen=new Set();SPOTHER=[];
 if(payload&&typeof payload==='object'&&Array.isArray(payload.entities)){
  for(const e of payload.entities){const isT=e.entity_type==='MUSIC'||/^spotify:track:/.test(e.uri||'');const url=/^https:\/\//.test(e.url||'')?e.url:'';
   const artist=Array.isArray(e.creators)?e.creators.map(c=>c&&c.name).filter(Boolean).join(', '):'';
   if(isT&&e.name){const key=(artist+'|'+e.name).toLowerCase();if(seen.has(key))continue;seen.add(key);
    out.push({title:String(e.name),artist,bpm:null,cam:null,energy:null,genre:null,est:false,src:'spotify',url,album:e.parent&&e.parent.name?String(e.parent.name):'',dur:e.playback&&+e.playback.duration_ms?Math.round(+e.playback.duration_ms/1000):null});}
   else if(e.name)SPOTHER.push({name:String(e.name),type:e.display&&e.display.type_label?String(e.display.type_label):'',by:artist,url});}
  if(out.length||SPOTHER.length)return out;}
 const num=v=>typeof v==='number'?v:typeof v==='string'&&v.trim()&&!isNaN(+v)?+v:null;
 const walk=(o,d)=>{if(!o||d>8||out.length>=300)return;if(Array.isArray(o)){o.forEach(x=>walk(x,d+1));return;}if(typeof o!=='object')return;
  const title=typeof o.name==='string'?o.name:typeof o.title==='string'?o.title:null;
  let artist=null;if(Array.isArray(o.artists))artist=o.artists.map(a=>typeof a==='string'?a:a&&a.name).filter(Boolean).join(', ');else if(typeof o.artist==='string')artist=o.artist;else if(o.artist&&typeof o.artist.name==='string')artist=o.artist.name;
  const isTrack=title&&artist&&(!o.type||/track|song/i.test(String(o.type)));
  if(isTrack){const key=(artist+'|'+title).toLowerCase();if(!seen.has(key)){seen.add(key);
   const bpm=num(o.tempo!=null?o.tempo:o.bpm),k=num(o.key),md=num(o.mode);let en=num(o.energy);if(en!=null)en=en<=1?Math.round(1+en*9):Math.round(en);
   const cam=parseCam(o.camelot||'')||(k!=null&&k>=0&&k<12&&md!=null?camFromPc(k,md===0):null)||parseMusicalKey(typeof o.key==='string'?o.key:'');
   const g=Array.isArray(o.genres)&&o.genres.length?String(o.genres[0]):null;
   out.push({title,artist,bpm:bpm?Math.round(bpm*10)/10:null,cam,energy:en!=null?clamp(en,1,10):null,genre:g,est:false,src:'spotify'});}}
  for(const k in o){if(k==='album'&&isTrack)continue;const v=o[k];if(v&&typeof v==='object')walk(v,d+1);}};
 if(typeof payload==='string'){
  payload.split(/\r?\n/).forEach(l=>{const t=l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/,'').replace(/\*\*/g,'').trim();const m=/^["“]?(.+?)["”]?\s+(?:by|de|—|–|-)\s+(.+?)(?:\s*[([].*)?$/i.exec(t);
   if(m&&m[1].length<120&&m[2].length<120&&!/^https?:/.test(t)){const key=(m[2]+'|'+m[1]).toLowerCase();if(!seen.has(key)){seen.add(key);out.push({title:m[1].trim(),artist:m[2].trim(),bpm:null,cam:null,energy:null,genre:null,est:false,src:'spotify'});}}});
 }else walk(payload,0);
 return out;
}
async function spCall(tool,kind,val,btn,status){
 if(!MCP){status.textContent=SPST.msg;return;}btn.disabled=true;status.textContent='Consultando Spotify…';SPRAW='';
 try{const input=kind==='q'?{prompt:String(val).slice(0,1000),language:'es-419',limit:20}:{};
  const r=await MCP.callTool(SPN,tool,input,{cache:{staleTime:60000,gcTime:300000}});
  const pl=r.payload!==undefined?r.payload:(r.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('\n');
  SPRES=spExtract(pl);if(!SPRES.length)SPRAW=typeof pl==='string'?pl:JSON.stringify(pl,null,1);
  SPST={state:'ok',msg:'Spotify conectado.'};status.textContent=SPRES.length?`${SPRES.length} tema(s) encontrados.`:'Spotify respondió, pero no reconocí temas en la respuesta. Revisa el texto abajo.';}
 catch(e){SPST=spErr(e);status.textContent=SPST.msg;}
 btn.disabled=false;renderTab();
}
function spotifyCardHTML(){
 const ok=SPST.state==='ok'||SPST.state==='cargando';
 return`<div class="card"><h4>🟢 Spotify (conector)</h4><p style="font-size:13px" class="${SPST.state==='ok'?'':'mut'}" id="spMsg">${esc(SPST.msg)}</p>
 <p class="mut" style="font-size:12.5px;line-height:1.5">Trae temas desde tu cuenta para analizarlos aquí. DECKS no reproduce audio de Spotify: solo lee los datos del tema.</p>
 ${ok?`<div class="brow" style="margin-top:4px"><input class="in" id="spQ" placeholder="Busca un tema, artista o playlist" style="flex:1;min-width:180px"><button class="btn acc" id="spSearch">Buscar</button></div>
 <div class="chips" style="margin-top:8px"><button data-spq="mis canciones que me gustan">❤️ Mis favoritas</button><button data-spq="lo que escuché recientemente">🕘 Escuchado hace poco</button><button data-spq="mis canciones más escuchadas">🔥 Mis más escuchadas</button>${A.loaded&&A.meta&&!/^Demo/.test(A.meta.artist||'')?`<button data-spq="canciones similares a ${esc(A.meta.title)}">≈ Parecidas al deck A</button>`:''}<button id="spNow">▶ Lo que suena ahora</button></div>
 <p class="mut" style="font-size:12px">Busca temas por nombre, artista, género o ánimo (ej: “tech house 125 bpm”, “disco para matrimonio”). El conector entrega temas sueltos, no el contenido de una playlist.</p>`:`<div class="brow"><button class="btn" id="spRetry">Volver a revisar</button></div>`}
 ${SPRES.length?`<div class="slog" style="margin-top:8px">${SPRES.slice(0,50).map((r,i)=>`<div><span>${esc(r.artist)} - ${r.url?`<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a>`:esc(r.title)}</span><span class="mono">${r.dur?fmt(r.dur)+' ':''}${r.bpm?Math.round(r.bpm)+' BPM ':''}${r.cam?esc(r.cam)+' ':''}<button class="btn sm" data-sp="${i}">＋</button></span></div>`).join('')}</div><div class="brow"><button class="btn acc" id="spAll">Agregar todos a la playlist</button></div><p class="mut" style="font-size:12px">Spotify no entrega BPM ni tonalidad: después de agregarlos usa “🧠 Completar datos con IA”.</p>`:''}
 ${SPOTHER.length?`<div class="slog" style="margin-top:8px">${SPOTHER.slice(0,10).map(o=>`<div><span>${esc(o.type)}: ${o.url?`<a href="${esc(o.url)}" target="_blank" rel="noopener">${esc(o.name)}</a>`:esc(o.name)}</span><span class="mono">${esc(o.by)}</span></div>`).join('')}</div>`:''}
 ${SPRAW?`<pre class="aiout" style="font-size:12px;max-height:200px;overflow:auto" id="spRaw"></pre>`:''}</div>`;
}
function bindSpotify(){
 const st=$('#spMsg');if(!st)return;
 if($('#spRetry'))$('#spRetry').onclick=async()=>{SPST={state:'cargando',msg:'Revisando…'};renderTab();if(MCP)await spCheck();else await initMCP();renderTab();};
 if($('#spSearch')){const go=()=>{const q=$('#spQ').value.trim();if(q)spCall('search','q',q,$('#spSearch'),st);};$('#spSearch').onclick=go;$('#spQ').onkeydown=e=>{if(e.key==='Enter')go();};}
 if($('#spNow'))$('#spNow').onclick=()=>spCall('get_currently_playing',null,null,$('#spNow'),st);
 $$('[data-spq]').forEach(b=>b.onclick=()=>spCall('search','q',b.dataset.spq,b,st));
 if($('#spRaw'))$('#spRaw').textContent=SPRAW.slice(0,4000);
 const add=rows=>{const have=new Set(PL.map(r=>(r.artist+'|'+r.title).toLowerCase()));let n=0;rows.forEach(r=>{const k=(r.artist+'|'+r.title).toLowerCase();if(!have.has(k)){PL.push({...r});have.add(k);n++;}});
  LS.set('dj_pulse_pl',PL);PLP=analyzePlaylist(PL);GEN=[];toast(`${n} tema(s) agregados a la playlist`,1600);renderTab();};
 $$('[data-sp]').forEach(b=>b.onclick=()=>add([SPRES[+b.dataset.sp]]));
 if($('#spAll'))$('#spAll').onclick=()=>add(SPRES);
}

/* ---------- PRÁCTICAS GUIADAS ---------- */
let RUN=null;
const dC=k=>C[k]-(RUN?RUN.base[k]:0);
const transSince=()=>RUN?C.trans.slice(RUN.base.transN):[];
const synced=()=>bothLoaded()&&A.playing&&B.playing&&Math.abs(A.effBpm()-B.effBpm())<0.12;
async function prep(fn){S.mute=true;try{await fn();}catch(e){}setTimeout(()=>{S.mute=false;},300);}
async function prepPair(ia,ib,o={}){
 if(!ctx)return toast('Primero toca ENCENDER');
 const la=typeof ia==='string'?demoItem(DEMOS.find(d=>d.id===ia)):ia,lb=typeof ib==='string'?demoItem(DEMOS.find(d=>d.id===ib)):ib;
 if(A.playing)A.togglePlay();if(B.playing)B.togglePlay();
 await libLoad(A,la);await libLoad(B,lb);A.setPct(0);B.setPct(0);XF.set(o.xf!=null?o.xf:0);
 if(!A.playing)A.togglePlay();
 if(o.both){if(!B.playing)B.togglePlay();B.sync();if(o.offset)B.seek(B.posEst()+B.beatLen()*o.offset);}
 if(o.jog){B.mode='jog';B.ui();}
}
const DRILLS=[
 {id:'fase16',t:'Fase durante 16 beats',d:'Iguala B con A a oído y sostén la fase 16 beats seguidos.',par:90,nosync:true,prep:()=>prepPair('d2','d3',{xf:0}),
  goals:[{t:'Lanza B justo en un bombo de A e iguala su tempo con el pitch.',ok:()=>synced()},{t:'Mantén 16 beats seguidos en fase.',ok:()=>S.streak>=16}]},
 {id:'fase32',t:'Fase durante 32 beats',d:'Lo mismo, pero el doble de largo: la base de una mezcla larga.',par:120,nosync:true,prep:()=>prepPair('d7','d2',{xf:0}),
  goals:[{t:'Iguala el tempo de B con A.',ok:()=>synced()},{t:'Mantén 32 beats seguidos en fase.',ok:()=>S.streak>=32}]},
 {id:'jog',t:'Corregir con jog',d:'Ambos decks van a igual tempo pero desfasados. Corrige solo con el disco.',par:45,prep:()=>prepPair('d2','d3',{both:true,offset:0.22,xf:0,jog:true}),
  goals:[{t:'Gira el disco de B (modo JOG) o usa ◀ ▶ hasta que los bombos suenen como uno.',ok:()=>dC('jog')>0&&synced()&&phaseErr()<0.035},{t:'Sostén 8 beats en fase.',ok:()=>S.streak>=8}]},
 {id:'sinSync',t:'Mezclar sin SYNC',d:'Cordillera (A) y Patagonia (B) tienen 8 BPM de diferencia. Iguala a oído y haz la transición completa.',par:180,nosync:true,prep:()=>prepPair('d1','d4',{xf:-1}),
  goals:[{t:'Iguala B con A sin SYNC (pitch + jog).',ok:()=>synced()&&phaseErr()<0.06},{t:'Sostén 16 beats en fase.',ok:()=>S.streak>=16},{t:'Completa la transición hasta que solo suene B.',ok:()=>transSince().some(x=>x.toT===B.meta.title)}]},
 {id:'loop',t:'Crear un loop',d:'Alarga una parte del tema con un loop y sal limpio.',par:60,prep:()=>prepPair('d2','d3',{xf:-1}),
  goals:[{t:'Con un tema sonando, activa un LOOP de 4 u 8 beats.',ok:()=>!!(A.loop||B.loop)},{t:'Déjalo repetir al menos 2 veces.',ok:()=>dC('loopWraps')>=2},{t:'Sal del loop tocando el mismo botón.',ok:()=>dC('loopExit')>0}]},
 {id:'graves',t:'Intercambiar graves',d:'Los dos temas suenan en fase. Haz el cambio de graves en un “1”.',par:60,prep:()=>prepPair('d2','d3',{both:true,xf:0}),
  goals:[{t:'Baja el LOW de B a cero (kill).',ok:()=>MX.B.low<-0.7},{t:'En el “1” de un compás, baja el LOW de A y sube el de B a la vez.',ok:()=>dC('swaps')>0}]},
 {id:'armonica',t:'Transición armónica',d:'Valparaíso (5A) → Atacama (4A): vecinas en la rueda Camelot. Mezcla larga y limpia.',par:180,prep:()=>prepPair('d2','d3',{xf:-1}),
  goals:[{t:'Iguala B con A y lánzalo en frase.',ok:()=>synced()&&phaseErr()<0.06},{t:'Completa la transición con al menos 60% del tiempo en fase.',ok:()=>transSince().some(x=>x.phRatio>=0.6&&(x.harm||0)>=85)}]},
 {id:'fraseo',t:'Entrar en frase',d:'Sube B exactamente en el compás 9, 17, 25 o 33 de A.',par:120,prep:()=>prepPair('d2','d7',{xf:-1}),
  goals:[{t:'Prepara B con CUE en su primer bombo y súbelo en el “1” de una frase de A.',ok:()=>transSince().some(x=>x.phraseOk)}]},
];
function startDrill(dr){
 if(!dr)return;HUB.open&&closeHub();$('#lessonCard').hidden=true;LES=null;
 RUN={d:dr,step:0,t0:T(),base:snap(),done:false,syncUsed:false};renderRun();$('#pracCard').hidden=false;$('#pracCard').classList.remove('min');
}
function renderRun(){
 if(!RUN)return;const d=RUN.d,g=d.goals,done=RUN.step>=g.length;
 $('#pcTitle').textContent='🎯 '+d.t.toUpperCase();$('#pcDesc').textContent=d.d+(d.nosync?' (Sin SYNC.)':'');
 $('#pcGoals').innerHTML=g.map((x,i)=>`<li class="${i<RUN.step?'done':i===RUN.step?'cur':''}">${esc(x.t)}</li>`).join('');
 if(!done)$('#pcStep').innerHTML=`<span>${RUN.step+1}. ${esc(g[RUN.step].t)}</span>`;
 $('#pcPrep').style.display=d.prep&&!done?'':'none';
}
function drillTick(){
 if(!RUN||RUN.done)return;
 if(RUN.d.nosync&&dC('sync')>0&&!RUN.syncUsed){RUN.syncUsed=true;obs('Esta práctica es sin SYNC: cuenta, pero con menos estrellas.',3);}
 let ok=false;try{ok=RUN.d.goals[RUN.step].ok();}catch(e){}
 if(ok){RUN.step++;const c=$('#pracCard');c.classList.remove('win');void c.offsetWidth;c.classList.add('win');if(RUN.step>=RUN.d.goals.length)finishDrill();else renderRun();}
 $('#pcTime').textContent=fmt(T()-RUN.t0);
}
function finishDrill(){
 const time=T()-RUN.t0,errs=Object.keys(C.err).reduce((s,k)=>s+C.err[k]-RUN.base.err[k],0);
 const stars=clamp(3-(time>RUN.d.par?1:0)-(errs>2?1:0)-(RUN.syncUsed?1:0),1,3),gain=40+20*stars;
 RUN.done=true;const id=RUN.d.id,prev=BEST[id];if(!prev||stars>prev.s||(stars===prev.s&&time<prev.t))BEST[id]={s:stars,t:Math.round(time)};LS.set('dj_pulse_best',BEST);
 xp(gain,'Práctica completada');const rep=buildReport(RUN.base,'Práctica: '+RUN.d.t);
 renderRun();$('#pcStep').innerHTML=`<b style="color:var(--acc)">🏆 Completada en ${fmt(time)}</b> <span class="stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</span> <span class="xpf">+${gain} XP</span> <button class="btn sm" id="pcRep">Ver informe</button>`;
 $('#pcRep').onclick=()=>openReport(rep);toast('🎯 ¡Práctica completada!',1800);
}

/* ---------- GENERADOR DE EJERCICIOS ---------- */
let GEN=[];
function loadable(){return LIB().filter(i=>i.hasAudio&&i.bpm&&i.cam&&i.energy);}
function generateExercises(){
 const L=loadable(),out=[],near=PLP&&PLP.bpm?PLP.bpm:null;
 const pairs=[];for(const a of L)for(const b of L)if(a.id!==b.id)pairs.push({a,b,h:camScore(a.cam,b.cam).s,db:Math.abs(a.bpm-b.bpm),dE:b.energy-a.energy});
 const byNear=arr=>near?arr.sort((x,y)=>Math.abs((x.a.bpm+x.b.bpm)/2-near)-Math.abs((y.a.bpm+y.b.bpm)/2-near)):shuffle(arr);
 const pick=f=>{const c=byNear(pairs.filter(f));return c.length?(near?c[0]:rnd(c)):null;};
 const tag=near?` (basado en tu playlist: ~${near} BPM)`:'';
 const tr=p=>`${p.a.title} (${p.a.cam} · ${Math.round(p.a.bpm)}) → ${p.b.title} (${p.b.cam} · ${Math.round(p.b.bpm)})`;
 const mk=(t,d,p,goals,o={})=>({id:'g'+out.length,t,d,par:o.par||150,nosync:!!o.nosync,prep:()=>prepPair(p.a,p.b,{xf:-1}),goals});
 let p;
 if((p=pick(x=>x.h>=85&&x.db<=6)))out.push(mk('Mezcla armónica',`${tr(p)}. Tonalidades compatibles: haz una mezcla larga${tag}.`,p,[{t:'Iguala B con A.',ok:()=>synced()},{t:'Completa la transición con 60% del tiempo en fase.',ok:()=>transSince().some(x=>x.phRatio>=0.6)}]));
 if((p=pick(x=>x.dE>=2&&x.dE<=3&&x.db<=8)))out.push(mk('Subir la energía',`${tr(p)}: sube de E${p.a.energy} a E${p.b.energy} en un cambio de frase.`,p,[{t:'Iguala B con A.',ok:()=>synced()},{t:'Entra en frase y completa la transición.',ok:()=>transSince().some(x=>x.phraseOk)}]));
 if((p=pick(x=>x.dE<=-1&&x.dE>=-3&&x.h>=85)))out.push(mk('Recovery',`${tr(p)}: baja la energía sin perder la pista, con un tema armónico.`,p,[{t:'Iguala B con A.',ok:()=>synced()},{t:'Completa una transición que baje la energía 1 a 3 puntos.',ok:()=>transSince().some(x=>x.dE<=-1&&x.dE>=-3)}]));
 if((p=pick(x=>x.db>=4&&x.db<=10)))out.push(mk('Beatmatching exigente',`${tr(p)}: ${Math.round(p.db)} BPM de diferencia, sin SYNC.`,p,[{t:'Iguala el tempo sin SYNC.',ok:()=>synced()&&phaseErr()<0.06},{t:'Sostén 16 beats en fase.',ok:()=>S.streak>=16}],{nosync:true}));
 if((p=pick(x=>x.db<=6)))out.push(mk('Fraseo: compás 17',`${tr(p)}: entra exactamente en el compás 17 de A.`,p,[{t:'Lanza y sube B en el “1” del compás 17 (o 25, 33…).',ok:()=>transSince().some(x=>x.phraseOk)}]));
 if((p=pick(x=>x.db<=6)))out.push(mk('Loop de salida',`${tr(p)}: activa un loop de 8 en A mientras entra B, para ganar tiempo.`,p,[{t:'Durante la mezcla, activa un LOOP de 8 en A.',ok:()=>!!A.loop&&A.loop.n===8},{t:'Completa la transición a B.',ok:()=>transSince().some(x=>x.loop)}]));
 const wu=L.filter(i=>i.energy<=7).sort((a,b)=>a.bpm-b.bpm);
 if(wu.length>=3){const s=[wu[0],wu[Math.floor(wu.length/2)],wu[wu.length-1]];out.push({id:'gwu',t:'Warm-Up de 3 temas',d:`${s.map(x=>x.title+' ('+Math.round(x.bpm)+')').join(' → ')}. Sube de a poco: sin saltos de más de 2 puntos de energía. Carga el tercero cuando termines la primera mezcla.`,par:420,prep:()=>prepPair(s[0],s[1],{xf:-1}),goals:[{t:'Primera transición, sin saltos fuertes de energía.',ok:()=>transSince().filter(x=>Math.abs(x.dE)<=2).length>=1},{t:'Segunda transición con el tercer tema.',ok:()=>transSince().filter(x=>Math.abs(x.dE)<=2).length>=2}]});}
 const pk=L.filter(i=>i.energy>=7);
 if(pk.length>=2){const a=pk[0],b=pk[1];out.push({id:'gpk',t:'Peak Time',d:`${a.title} → ${b.title}: mantén la energía arriba (E7 o más) y la fase limpia.`,par:200,prep:()=>prepPair(a,b,{xf:-1}),goals:[{t:'Completa la transición con 60% en fase.',ok:()=>transSince().some(x=>x.phRatio>=0.6)},{t:'Mantén el flujo 16 beats más en fase o con un solo tema sonando.',ok:()=>S.streak>=16||(transSince().length>0&&!(A.playing&&B.playing))}]});}
 const cl=L.slice().sort((a,b)=>a.energy-b.energy);
 if(cl.length>=2){const a=cl[1],b=cl[0];out.push({id:'gcl',t:'Closing',d:`${a.title} → ${b.title}: cierra con el tema más tranquilo y termina con un “echo-out” de filtro.`,par:240,prep:()=>prepPair(a,b,{xf:-1}),goals:[{t:'Completa la transición al tema de cierre.',ok:()=>transSince().length>0},{t:'Gira el FILTER de B a la izquierda y baja su fader hasta cero.',ok:()=>MX.B.filter<-0.6&&(MX.B.fader<0.05||!B.playing)}]});}
 GEN=shuffle(out).slice(0,6);
}

/* ---------- CRITERIO (QUIZ) ---------- */
let Q=null;
function newQuestion(){
 const L=LIB().filter(i=>i.bpm&&i.cam&&i.energy);if(L.length<4){Q=null;return;}
 const sk=CROWD.on?CROWD.sc:rnd(Object.keys(SCN)),sc=SCN[sk],h=CROWD.on?CROWD.hour:sc.curve[Math.floor(Math.random()*sc.curve.length)][0]+Math.random();
 const saved={sc:CROWD.sc};CROWD.sc=sk;const desire=Math.round(curveAt(h));CROWD.sc=saved.sc;
 const cur=rnd(L),opts=shuffle(L.filter(i=>i.id!==cur.id)).slice(0,3);
 const score=o=>{const eF=1-Math.min(1,Math.abs(o.energy-desire)/4),h2=camScore(cur.cam,o.cam).s/100,r=sc.bpm,bd=o.bpm<r[0]?r[0]-o.bpm:o.bpm>r[1]?o.bpm-r[1]:0,bF=Math.max(0,1-bd/12)*Math.max(0,1-Math.abs(o.bpm-cur.bpm)/16);return 0.4*eF+0.35*h2+0.25*bF;};
 const why=o=>{const R=[],hs=camScore(cur.cam,o.cam);R.push(hs.s>=85?'armónico ('+o.cam+')':hs.s>=55?'armonía aceptable ('+o.cam+')':'choca tonalmente ('+o.cam+')');
  const de=o.energy-desire;R.push(Math.abs(de)<=1?'energía adecuada para la hora':de>1?'demasiada energía para el momento':'le falta energía');
  const r=sc.bpm;R.push(o.bpm<r[0]||o.bpm>r[1]?`${Math.round(o.bpm)} BPM fuera del rango del evento`:`${Math.round(o.bpm)} BPM dentro del rango`);return R.join(' · ');};
 const best=opts.map(o=>[o,score(o)]).sort((a,b)=>b[1]-a[1])[0][0];
 Q={sc:sc.n,h,desire,cur,opts,best:best.id,why,answered:null};
}

/* ---------- LECCIONES NUEVAS ---------- */
let LB=snap();LB.qz=QZ.ok;
const trSinceL=()=>C.trans.slice(LB.transN);
LESSONS.push(
 {t:'Leer la pista',d:'Pista virtual y criterio musical',intro:'Un DJ toca para personas. En la pista virtual el público reacciona a la energía, al tempo, al género y a la calidad técnica de tus mezclas, según el evento, la edad y la hora.',
  prep:async()=>{setScenario('club');CROWD.on=true;openHub('pista');},
  steps:[{t:'Abre 🧠 Pulse → Pista virtual y activa el escenario “Club”.',ok:()=>CROWD.on&&CROWD.sc==='club'},
   {t:'Pon música y lleva la participación sobre 60%.',ok:()=>CROWD.on&&CROWD.P>=60},
   {t:'Responde bien 2 preguntas en la pestaña Criterio.',ok:()=>QZ.ok-(LB.qz||0)>=2}],
  tip:'Mira la hora simulada: a las 23:00 la gente recién llega; a las 03:00 espera el peak. La misma canción funciona distinto según el momento.'},
 {t:'Gestión de energía',d:'Subir y bajar sin perder la pista',intro:'La energía se administra como una curva: se sube de a poco, se sostiene y se da respiro. Los saltos de más de 2 puntos se sienten forzados.',
  prep:async()=>{if(!CROWD.on){setScenario('club');CROWD.on=true;}openHub('biblio');},
  steps:[{t:'Haz 3 transiciones seguidas sin saltos de energía mayores a 2 puntos.',ok:()=>trSinceL().length>=3&&trSinceL().slice(-3).every(x=>Math.abs(x.dE)<=2)},
   {t:'Con la pista virtual activa, mantén la participación sobre 60% durante 30 segundos.',ok:()=>H('pl12',CROWD.on&&CROWD.P>=60,30)}],
  tip:'Mira la E de cada tema en la barra de análisis (E1 a E10). Ordena tus temas antes de empezar.'},
 {t:'Construir un set',d:'Warm-up → peak → recovery',intro:'Un set cuenta una historia: preparas, llevas al punto alto y das un respiro. Vas a armar un mini set de 4 temas con esa forma.',
  prep:async()=>{openHub('practica');},
  steps:[{t:'Toca 4 temas seguidos (3 transiciones).',ok:()=>trSinceL().length>=3},
   {t:'La energía debe subir y luego bajar: el punto más alto no puede ser el primero ni el último tema.',ok:()=>{const s=SETLOG.slice(LB.setN).map(x=>x.energy).filter(x=>x!=null);if(s.length<4)return false;const mx=Math.max(...s),i=s.indexOf(mx);return i>0&&i<s.length-1&&s[s.length-1]<mx;}},
   {t:'Compatibilidad promedio de tus transiciones de 70% o más.',ok:()=>{const t=trSinceL().filter(x=>x.score!=null);return t.length>=3&&avg(t.map(x=>x.score))>=70;}}],
  tip:'Usa la pestaña Biblioteca para ver energía y Camelot de cada tema, y la tarjeta de compatibilidad antes de cada mezcla.'}
);
buildAcad();

/* ---------- UI: BARRA, HUB, TARJETAS ---------- */
const kv=(k,v)=>`<div class="kv"><small>${k}</small><b>${esc(v)}</b></div>`;
const mt=(k,v,lbl)=>`<div class="mt"><span>${k}</span><i><b style="width:${clamp(v,0,1)*100}%"></b></i><em>${lbl!=null?lbl:pct(v)}</em></div>`;
function anHTML(d){
 if(!d.loaded)return`<div class="anc" style="--c:${d.color}"><div class="anh"><b>Deck ${d.id}</b></div><small class="mut">Sin tema cargado.</small></div>`;
 const a=d.pa;if(!a)return`<div class="anc" style="--c:${d.color}"><div class="anh"><b>${esc(d.meta.title)}</b></div><small class="mut"><span class="spinner"></span> Analizando…</small></div>`;
 const hb=SET.hideBpm;
 return`<div class="anc" style="--c:${d.color}"><div class="anh"><b>${d.id} · ${esc(d.meta.title)}</b><span class="role">${a.role}</span></div>
 <div class="ang">${kv('BPM',hb?'•••':a.bpm.toFixed(1))}${kv('BPM efectivo',hb?'•••':d.effBpm().toFixed(1))}${kv('Camelot',(a.cam||'?')+(a.keyEst?'*':''))}${kv('Energía',a.energy+'/10')}${kv('Género',a.genre)}${kv('Subgénero',a.sub)}</div>
 ${mt('Energía',a.energy/10,a.energy)}${mt('Graves',a.bass)}${mt('Armonía',a.harm)}${mt('Densidad rítmica',a.dens)}${mt('Complejidad',a.complexity/10,a.complexity)}
 <small class="mut">Intro ${a.intro} compases · ${a.drops.length} entrada(s) fuerte(s) · fraseo ${a.reg>=0.7?'regular':'irregular'}${a.keyEst?' · *tonalidad estimada':''}</small></div>`;
}
function cmpHTML(){
 if(!(A.pa&&B.pa))return`<div class="anc cmp"><div class="anh"><b>Compatibilidad</b></div><small class="mut">Carga y analiza un tema en cada deck.</small></div>`;
 const out=S.dom===B?B:A,inn=out===A?B:A,c=compat(out.pa,inn.pa,out,inn);if(!c)return'';
 return`<div class="anc cmp"><div class="anh"><b>${out.id} → ${inn.id} · ${c.cat}</b><span class="big ${c.cls}" style="border:none">${c.score}%</span></div>
 <ul>${c.lines.map(l=>`<li>${l[0]} ${esc(l[1])}</li>`).join('')}</ul><div class="rec2">💡 Transición recomendada: ${esc(c.rec)}</div></div>`;
}
function renderDet(){const el=$('#pbDet');if(el)el.innerHTML=anHTML(A)+cmpHTML()+anHTML(B);}
function chipDeck(d){if(!d.loaded)return`${d.id} · vacío`;const a=d.pa;if(!a)return`${d.id} · analizando…`;return`${d.id} · ${SET.hideBpm?'•••':d.effBpm().toFixed(1)} · ${a.cam||'?'} · E${a.energy} · ${a.role}`;}
function renderBar(force){
 if(!$('#pulseBar'))return;
 $('#pbA').textContent=chipDeck(A);$('#pbB').textContent=chipDeck(B);
 const cc=$('#pbC');if(A.pa&&B.pa){const out=S.dom===B?B:A,inn=out===A?B:A,c=compat(out.pa,inn.pa,out,inn);cc.className='pbChip '+c.cls;cc.textContent=`⚡ ${c.score}% ${c.cat}`;}else{cc.className='pbChip';cc.textContent='⚡ Compatibilidad —';}
 const ri=rankIdx(XPd.xp),nx=RANKS[ri+1],pr=nx?(XPd.xp-RANKS[ri][1])/(nx[1]-RANKS[ri][1]):1;
 const fl=xpFlash&&T()-xpFlash.t<3?`<span class="xpf">${esc(xpFlash.txt)}</span>`:'';
 $('#pbX').innerHTML=`🎧 ${RANKS[ri][0]} <i><b style="width:${pr*100}%"></b></i> ${XPd.xp} XP ${fl}`;
 const s=$('#pbS');s.classList.toggle('on',SES.active);s.textContent=SES.active?`● Sesión ${fmt(T()-SES.base.t)} · Terminar`:'▶ Iniciar sesión';
 const pv=$('#pbP');pv.hidden=!CROWD.on;if(CROWD.on)pv.textContent=`🕺 ${Math.round(CROWD.P)}% · E${CROWD.E.toFixed(1)} · ${hourStr(CROWD.hour)}`;
 if(S.detOpen&&(force||T()-S.detT>1)){S.detT=T();renderDet();}
}
const HUB={open:false,tab:'coach',sub:'Todas'};
const TABS=[['coach','🧠 Coach'],['practica','🎯 Práctica'],['pista','🕺 Pista virtual'],['criterio','🧭 Criterio'],['biblio','🎵 Biblioteca'],['playlist','📋 Playlists'],['progreso','🏆 Progreso']];
function openHub(tab){if(tab)HUB.tab=tab;HUB.open=true;$('#mPulse').classList.add('open');renderTabs();renderTab();}
function closeHub(){HUB.open=false;$('#mPulse').classList.remove('open');}
function renderTabs(){$('#hubTabs').innerHTML=TABS.map(t=>`<button data-t="${t[0]}" class="${t[0]===HUB.tab?'on':''}">${t[1]}</button>`).join('');$$('#hubTabs button').forEach(b=>b.onclick=()=>{HUB.tab=b.dataset.t;renderTabs();renderTab();});}
function liveHub(){
 if(HUB.tab==='coach'){const el=$('#hcAn');if(el)el.innerHTML=`<div class="grid2">${anHTML(A)}${anHTML(B)}</div>${cmpHTML()}`;const h=$('#hcHist');if(h)h.innerHTML=histHTML();}
 if(HUB.tab==='pista')pistaMeters();
}
const histHTML=()=>S.hist.length?S.hist.slice(0,10).map(x=>`<div><span>${esc(x[1])}</span><span class="mono">${x[0]}</span></div>`).join(''):'<p class="mut">Aún no hay observaciones. Mezcla y el coach te irá comentando.</p>';
function errBars(src,title){const ks=Object.keys(ERR_TXT),mx=Math.max(1,...ks.map(k=>src[k]||0));return`<h4>${title}</h4>`+ks.map(k=>`<div class="ebar"><span>${ERR_TXT[k]}</span><i><b style="width:${(src[k]||0)/mx*100}%"></b></i><em>${src[k]||0}</em></div>`).join('');}
function renderTab(){
 const b=$('#hubBody');if(!b)return;const t=HUB.tab;
 if(t==='coach'){
  const se=SES.base?Object.fromEntries(Object.keys(ERR_TXT).map(k=>[k,C.err[k]-SES.base.err[k]])):{};
  b.innerHTML=`<div id="hcAn"></div>
  <div class="card"><h4>Observaciones recientes</h4><div class="slog" id="hcHist"></div></div>
  <div class="grid2"><div class="card">${errBars(se,'Errores en esta sesión')}</div><div class="card">${errBars(STATS.err,'Historial de errores')}<p class="mut" style="font-size:12px">Si un error se repite, el coach te propone una práctica específica.</p></div></div>
  <div class="card ai"><h4>🧠 Pregúntale al coach (IA)</h4><p class="mut" style="font-size:13px">Usa Claude con el contexto de tus decks, errores y progreso. Te explica y te propone ejercicios; nunca mezcla por ti.</p>
  <textarea id="aiQ" placeholder="Ej: ¿Por qué se me desfasan los bombos después de 8 compases?"></textarea><div class="brow"><button class="btn acc" id="aiGo">Preguntar</button><button class="btn" id="aiSet">¿Cómo voy?</button></div><div class="aiout" id="aiOut"></div></div>`;
  liveHub();
  const go=q=>askAI(aiPrompt(q,coachContext()),$('#aiOut'),$('#aiGo'));
  $('#aiGo').onclick=()=>{const q=$('#aiQ').value.trim();if(q)go(q);};
  $('#aiSet').onclick=()=>go('Evalúa cómo voy según mi contexto y dime qué practicar ahora y por qué.');
 }
 else if(t==='practica'){
  if(!GEN.length)generateExercises();
  b.innerHTML=`<div class="card"><h4>🎯 Práctica guiada</h4><p class="mut" style="font-size:13px">Objetivos con evaluación automática. Cada práctica prepara los decks, mide tu tiempo y tus errores, y entrega estrellas y XP.</p>
  ${DRILLS.map(d=>{const bs=BEST[d.id];return`<div class="lrow"><span class="ti"><b>${esc(d.t)}</b><small>${esc(d.d)}</small></span><span class="mut" style="font-size:12px;white-space:nowrap">${bs?`<span class="stars">${'★'.repeat(bs.s)}</span> ${fmt(bs.t)}`:''}</span><button class="btn sm acc" data-dr="${d.id}">Empezar</button></div>`;}).join('')}</div>
  <div class="card"><h4>🎲 Ejercicios generados</h4><p class="mut" style="font-size:13px">Creados a partir de tu biblioteca (demos, pistas propias y música libre importada)${PLP&&PLP.bpm?` y del perfil de tu playlist (~${PLP.bpm} BPM)`:''}.</p>
  ${GEN.length?GEN.map((g,i)=>`<div class="lrow"><span class="ti"><b>${esc(g.t)}</b><small>${esc(g.d)}</small></span><button class="btn sm acc" data-gen="${i}">Empezar</button></div>`).join(''):'<p class="mut">Agrega más pistas analizadas a la biblioteca para generar ejercicios.</p>'}
  <div class="brow"><button class="btn" id="genNew">🎲 Generar otros</button></div></div>`;
  $$('[data-dr]',b).forEach(x=>x.onclick=()=>startDrill(DRILLS.find(d=>d.id===x.dataset.dr)));
  $$('[data-gen]',b).forEach(x=>x.onclick=()=>startDrill(GEN[+x.dataset.gen]));
  $('#genNew').onclick=()=>{generateExercises();renderTab();};
 }
 else if(t==='pista'){
  b.innerHTML=`<div class="chips" id="scnC">${Object.keys(SCN).map(k=>`<button data-s="${k}" class="${k===CROWD.sc?'on':''}">${SCN[k].n}</button>`).join('')}</div>
  <div class="card"><div class="sl"><span>Edad promedio</span><input type="range" id="crAge" min="18" max="70" value="${CROWD.age}"><b id="crAgeV">${CROWD.age}</b></div>
  <div class="sl"><span>Tamaño</span><input type="range" id="crSize" min="10" max="5000" step="10" value="${CROWD.size}"><b id="crSizeV">${CROWD.size}</b></div>
  <div class="sl"><span>Energía inicial</span><input type="range" id="crE" min="1" max="10" value="${CROWD.e0}"><b id="crEV">${CROWD.e0}</b></div>
  <div class="sl"><span>Hora de inicio</span><input type="range" id="crH" min="18" max="29" value="${Math.round(CROWD.hour<12?CROWD.hour+24:CROWD.hour)}"><b id="crHV">${hourStr(CROWD.hour)}</b></div>
  <div class="brow"><button class="btn acc" id="crOn">${CROWD.on?'■ Cerrar la pista':'▶ Abrir la pista'}</button></div></div>
  <canvas id="crowdC"></canvas><div class="m4" id="crM"></div>
  <div class="card" style="margin-top:10px"><h4>Lectura de tu set</h4><div class="slog" id="crLog"></div></div>
  <p class="mut" style="font-size:12px">Simulación heurística: el público reacciona a la energía según la hora, al rango de BPM del evento, al género según la edad y a la limpieza técnica (fase, silencios). El reloj avanza 6 veces más rápido.</p>`;
  $$('#scnC button').forEach(x=>x.onclick=()=>{setScenario(x.dataset.s);renderTab();});
  const bind=(id,fn)=>{$('#'+id).oninput=e=>{fn(+e.target.value);$('#'+id+'V').textContent=id==='crH'?hourStr(CROWD.hour):e.target.value;};};
  bind('crAge',v=>CROWD.age=v);bind('crSize',v=>{CROWD.size=v;buildPeople();});bind('crE',v=>{CROWD.e0=v;if(!CROWD.on)CROWD.E=v;});bind('crH',v=>{CROWD.hour=v;});
  $('#crOn').onclick=()=>{CROWD.on=!CROWD.on;if(CROWD.on){if(!CROWD.ppl.length)buildPeople();CROWD.E=CROWD.e0;CROWD.P=30;}renderTab();};
  pistaMeters();
 }
 else if(t==='criterio'){
  if(!Q)newQuestion();
  const TH=[['Lectura de público','Observa a quién tienes enfrente antes de decidir: edad, ánimo, cuánta gente baila y qué pasa cuando cambias algo. Si al bajar los graves la gente levanta las manos, está enganchada; si se va a la barra, algo no calza.'],
   ['Gestión de energía','Piensa en la noche como una curva. Sube de a uno o dos puntos, sostén cuando la pista responde y da respiros cortos para que el siguiente punto alto se sienta más fuerte.'],
   ['Construcción de sets','Agrupa temas por función: abrir, construir, peak, respiro y cierre. Dentro de cada bloque busca vecinos en Camelot y tempos cercanos; entre bloques, usa breaks y cambios de frase.'],
   ['Recuperación de pista','Si la pista se vacía, no subas la energía a la fuerza: vuelve a algo reconocible, con buen groove y tempo cómodo, y reconstruye desde ahí.'],
   ['Warm-Up','El trabajo del warm-up es preparar, no ganar la noche. Energía 3 a 5, tempos moderados y temas que dejen espacio al DJ que viene.'],
   ['Peak Time','Energía 7 a 10, mezclas más cortas y precisas, y drops que coincidan. Aquí un error técnico se nota más: la fase tiene que estar limpia.'],
   ['Closing','Baja de a poco, con temas emotivos o reconocibles. El último tema debe sentirse como un final: un echo-out o un filtro largo ayudan.']];
  b.innerHTML=`<div class="card" id="qzC"></div><div class="st" style="margin-bottom:10px"><div><small>Respuestas correctas</small><b>${QZ.ok}/${QZ.n}</b></div><div><small>Precisión</small><b>${QZ.n?Math.round(QZ.ok/QZ.n*100):0}%</b></div></div>
  <h4 style="margin:12px 0 6px">Fundamentos para pensar como DJ</h4>${TH.map(x=>`<details class="th"><summary>${x[0]}</summary><p>${x[1]}</p></details>`).join('')}`;
  renderQuiz();
 }
 else if(t==='biblio'){
  const L=LIB(),cats=['Todas',...GENRES],f=HUB.sub,list=f==='Todas'?L:L.filter(i=>i.genre===f);
  b.innerHTML=`<div class="chips" id="lbC">${cats.map(c=>`<button data-c="${c}" class="${c===f?'on':''}">${c} <small>${c==='Todas'?L.length:L.filter(i=>i.genre===c).length}</small></button>`).join('')}</div>
  <div class="card">${list.length?list.map(i=>`<div class="lrow"><span class="dot" style="--sw:${esc(i.col||'#888')}"></span><span class="ti"><b>${esc(i.title)}</b><small>${esc(i.artist||'')} · ${i.bpm?Math.round(i.bpm)+' BPM':'BPM ?'} · ${esc(i.cam||'?')} · E${i.energy||'?'} · <span class="diff">${'●'.repeat(i.diff||1)}${'○'.repeat(5-(i.diff||1))}</span>${i.hasAudio?'':' · <b style="color:var(--warn);display:inline">sin audio</b>'}</small><small>${esc(i.license||'')}${i.source?' · '+esc(i.source):''}</small></span>
   ${i.demo?'':`<select data-g="${esc(i.id)}"><option value="">Género…</option>${GENRES.map(g=>`<option ${g===i.genre?'selected':''}>${g}</option>`).join('')}</select>`}
   <span class="ld"><button class="a" data-la="${esc(i.id)}">A</button><button class="b" data-lb="${esc(i.id)}">B</button>${i.demo?'':`<button data-del="${esc(i.id)}" aria-label="Quitar">✕</button>`}</span></div>`).join(''):`<p class="mut">No hay pistas en “${esc(f)}” todavía. Importa música libre o agrega tus archivos.</p>`}</div>
  <div class="card"><h4>➕ Agregar tus archivos</h4><p class="mut" style="font-size:13px">Se guardan solo en este navegador (no salen de tu dispositivo). Se analizan BPM, Camelot, energía y dificultad.</p>
  <div class="brow"><label class="btn acc">Elegir archivos de audio<input type="file" id="lbFiles" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac" multiple hidden></label><button class="btn" id="lbAn">Analizar pendientes</button></div><p class="mut" id="lbMsg" style="font-size:12px"></p></div>
  <div class="card"><h4>🌐 Música libre y educativa</h4>
  <p style="font-size:13.5px;line-height:1.5">Usa solo música con licencia abierta (Creative Commons o dominio público). Fuentes recomendadas: <a href="https://www.jamendo.com" target="_blank" rel="noopener">Jamendo</a>, <a href="https://freemusicarchive.org" target="_blank" rel="noopener">Free Music Archive</a>, <a href="https://ccmixter.org" target="_blank" rel="noopener">ccMixter</a>, <a href="https://archive.org/details/audio" target="_blank" rel="noopener">Internet Archive</a> y <a href="https://musopen.org" target="_blank" rel="noopener">Musopen</a>.</p>
  <p class="mut" style="font-size:12.5px;line-height:1.5">Por seguridad del navegador, esta página no puede descargar desde esos sitios. El flujo es: 1) descargas los temas con licencia abierta, 2) importas un catálogo JSON con sus datos y licencias, 3) agregas los archivos: se emparejan por nombre, se analizan y quedan disponibles para la Academia y el generador de ejercicios. Las licencias que no sean CC o dominio público se rechazan.</p>
  <div class="brow"><label class="btn">Importar catálogo (JSON)<input type="file" id="lbCat" accept=".json,application/json" hidden></label><button class="btn" id="lbExp">Copiar catálogo</button></div>
  <details class="th" style="margin-top:8px"><summary>Formato del catálogo</summary><pre class="aiout" id="lbSchema" style="font-size:12px"></pre><button class="btn sm" id="lbCopyS">Copiar ejemplo</button></details></div>`;
  const schema=JSON.stringify([{title:'Nombre del tema',artist:'Artista',genre:'Deep House',bpm:120,key:'8A',energy:5,difficulty:2,license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',source:'Jamendo',url:'https://www.jamendo.com/track/...',file:'Artista - Nombre del tema.mp3'}],null,2);
  $('#lbSchema').textContent=schema;$('#lbCopyS').onclick=()=>copyText(schema,$('#lbCopyS'));
  $$('#lbC button').forEach(x=>x.onclick=()=>{HUB.sub=x.dataset.c;renderTab();});
  const find=id=>LIB().find(i=>i.id===id);
  $$('[data-la]',b).forEach(x=>x.onclick=()=>{closeHub();libLoad(A,find(x.dataset.la));});
  $$('[data-lb]',b).forEach(x=>x.onclick=()=>{closeHub();libLoad(B,find(x.dataset.lb));});
  $$('[data-del]',b).forEach(x=>x.onclick=async()=>{if(x.dataset.c!=='1'){x.dataset.c='1';x.textContent='¿?';setTimeout(()=>{x.dataset.c='';x.textContent='✕';},2500);return;}USER=USER.filter(u=>u.id!==x.dataset.del);await idbDel(x.dataset.del);renderTab();renderLoaderLib();});
  $$('[data-g]',b).forEach(x=>x.onchange=()=>updUser(x.dataset.g,{genre:x.value||null}).then(()=>{renderTab();renderLoaderLib();}));
  $('#lbFiles').onchange=async e=>{const fs=[...e.target.files];e.target.value='';const m=$('#lbMsg');let n=0;for(const f of fs){m.textContent=`Agregando ${++n}/${fs.length}: ${f.name}`;const r=await addUserFile(f,null);if(ctx){m.textContent=`Analizando ${n}/${fs.length}: ${f.name}`;await analyzeItem(r);}}m.textContent=ctx?`Listo: ${fs.length} pista(s) agregadas y analizadas.`:`Agregadas ${fs.length}. Toca ENCENDER y luego “Analizar pendientes”.`;GEN=[];renderTab();renderLoaderLib();};
  $('#lbAn').onclick=async()=>{if(!ctx)return toast('Primero toca ENCENDER');const p=USER.filter(u=>u.hasAudio&&(!u.bpm||!u.energy));const m=$('#lbMsg');let n=0;for(const r of p){m.textContent=`Analizando ${++n}/${p.length}: ${r.title}`;await analyzeItem(r);}m.textContent=p.length?`Análisis listo (${p.length}).`:'No hay pistas pendientes.';GEN=[];renderTab();renderLoaderLib();};
  $('#lbCat').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{const j=JSON.parse(await f.text());const arr=Array.isArray(j)?j:(j.tracks||[]);const r=await importCatalog(arr);toast(`Catálogo: ${r[0]} importadas, ${r[1]} rechazadas (sin licencia abierta o sin título)`,3500);renderTab();renderLoaderLib();}catch(err2){toast('El archivo no es un JSON válido.',2500);}};
  $('#lbExp').onclick=()=>copyText(JSON.stringify(USER.map(u=>({title:u.title,artist:u.artist,genre:u.genre,bpm:u.bpm,key:u.cam,energy:u.energy,difficulty:u.diff,license:u.license,licenseUrl:u.licenseUrl,source:u.source,url:u.url,file:u.file||u.fname})),null,2),$('#lbExp'));
 }
 else if(t==='playlist'){
  const P=PLP;
  b.innerHTML=`<div class="card"><h4>🎵 Analizar playlist (Spotify u otra)</h4>
  <p style="font-size:13px;line-height:1.5" class="mut">Pega la lista (una por línea: <b>Artista - Tema</b>, opcionalmente con BPM, Camelot o E1–E10), importa un CSV o trae temas desde Spotify (abajo). DECKS nunca reproduce audio de Spotify: solo analiza los datos.</p>
  <textarea id="plT" placeholder="Fred again.. - Delilah, 140 BPM, 5A\nPeggy Gou - (It Goes Like) Nanana\n…"></textarea>
  <div class="brow"><button class="btn acc" id="plGo">Analizar</button><label class="btn">Importar CSV<input type="file" id="plF" accept=".csv,.txt,text/csv,text/plain" hidden></label><button class="btn ai" id="plAI">🧠 Completar datos con IA</button>${PL.length?'<button class="btn" id="plClr">Borrar</button>':''}</div><div class="aiout" id="plOut"></div></div>
  ${spotifyCardHTML()}
  ${P?`<div class="card"><h4>Resultado · ${P.n} temas</h4><div class="st"><div><small>BPM promedio</small><b>${P.bpm||'—'}</b></div><div><small>Energía promedio</small><b>${P.energy||'—'}</b></div><div><small>Dificultad para mezclar</small><b>${P.diff}/10</b><small>${P.diffL}</small></div><div><small>Géneros predominantes</small><b style="font-size:13px">${P.gens.length?P.gens.map(g=>esc(g[0])).join(', '):'—'}</b></div></div>
  <h4 style="margin-top:12px">Distribución Camelot</h4>${camHTML(P.dist)}
  ${P.missing?`<p class="mut" style="font-size:12px">${P.missing} tema(s) sin BPM, tonalidad o energía.${P.est?' Hay datos estimados por IA: verifícalos.':''}</p>`:''}</div>
  <div class="card"><h4>🧠 Recomendaciones del coach</h4><ul style="margin:0;padding-left:18px">${P.recs.map(r=>`<li style="font-size:13.5px;line-height:1.5">${esc(r)}</li>`).join('')}</ul><div class="brow"><button class="btn acc" id="plEx">Crear ejercicios con este perfil</button></div></div>
  ${P.order.length?`<div class="card"><h4>Orden sugerido para practicar</h4><p class="mut" style="font-size:12.5px">Una propuesta para entrenar transiciones armónicas y de energía. Tú decides si la sigues.</p><div class="slog">${P.order.map((r,i)=>`<div><span>${i+1}. ${esc(r.artist?r.artist+' - ':'')}${esc(r.title)}</span><span class="mono">${Math.round(r.bpm)} · ${esc(r.cam)} · E${r.energy}${r.est?'*':''}</span></div>`).join('')}</div></div>`:''}`:''}
  <details class="th"><summary>¿Por qué Spotify no trae BPM ni tonalidad?</summary><p>Spotify se conecta a través del conector de claude.ai, que entrega los datos del tema (título, artista, álbum). Desde noviembre de 2024 Spotify ya no entrega BPM, tonalidad ni energía (Audio Features) a aplicaciones nuevas. Si el conector los trae, DECKS los usa; si no, puedes completarlos con IA (quedan marcados con *) o importar un CSV que ya los tenga.</p></details>`;
  $('#plT').value=PL.map(r=>`${r.artist?r.artist+' - ':''}${r.title}${r.bpm?', '+r.bpm+' BPM':''}${r.cam?', '+r.cam:''}${r.energy?', E'+r.energy:''}`).join('\n');
  const run=txt=>{PL=parsePlaylist(txt);LS.set('dj_pulse_pl',PL);PLP=analyzePlaylist(PL);GEN=[];renderTab();if(!PL.length)toast('No encontré temas en el texto.',2000);};
  $('#plGo').onclick=()=>run($('#plT').value);
  $('#plF').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(f)run(await f.text());};
  $('#plAI').onclick=()=>{if(!PL.length)PL=parsePlaylist($('#plT').value);aiComplete($('#plAI'),$('#plOut'));};
  if($('#plClr'))$('#plClr').onclick=()=>{PL=[];PLP=null;LS.set('dj_pulse_pl',PL);renderTab();};
  bindSpotify();
  if($('#plEx'))$('#plEx').onclick=()=>{generateExercises();HUB.tab='practica';renderTabs();renderTab();};
 }
 else if(t==='progreso'){
  const ri=rankIdx(XPd.xp),nx=RANKS[ri+1],pr=nx?(XPd.xp-RANKS[ri][1])/(nx[1]-RANKS[ri][1]):1,nl=LESSONS.length,dl=Object.keys(PROG).length,db=Object.keys(BEST).length;
  b.innerHTML=`<div class="card"><h4>🎧 ${RANKS[ri][0]}</h4><div class="big">${XPd.xp} XP</div><div class="mt" style="margin-top:8px"><span>${nx?'Hacia '+nx[0]:'Rango máximo'}</span><i><b style="width:${pr*100}%"></b></i><em>${nx?nx[1]-XPd.xp:''}</em></div>
  <div class="chips" style="margin-top:10px">${RANKS.map((r,i)=>`<button class="${i<=ri?'on':''}" disabled>${r[0]} · ${r[1]}</button>`).join('')}</div>
  <p class="mut" style="font-size:12.5px">Ganas XP por mezclas armónicas, fase sostenida, intercambio de graves, entradas en frase, mezclas sin SYNC, lecciones y prácticas completadas.</p></div>
  <div class="st" style="margin-bottom:10px"><div><small>Lecciones</small><b>${dl}/${nl}</b></div><div><small>Prácticas dominadas</small><b>${db}/${DRILLS.length}</b></div><div><small>Transiciones (sesión actual)</small><b>${SES.base?C.trans.length-SES.base.transN:0}</b></div><div><small>Criterio</small><b>${QZ.ok}/${QZ.n}</b></div></div>
  <div class="card"><h4>📋 Sesión de práctica</h4><p class="mut" style="font-size:13px">La sesión empieza sola al dar PLAY. Al terminarla recibes el informe técnico y musical.</p><div class="brow">${SES.active?'<button class="btn acc" id="prEnd">■ Terminar y ver informe</button>':'<button class="btn acc" id="prStart">▶ Iniciar sesión</button>'}${SES.last?'<button class="btn" id="prLast">Ver último informe</button>':''}</div></div>
  <div class="card"><h4>Últimas recompensas</h4><div class="slog">${XPd.log.length?XPd.log.slice(0,12).map(x=>`<div><span>${esc(x[2])}</span><span class="mono">+${x[1]}</span></div>`).join(''):'<p class="mut">Todavía no ganas XP.</p>'}</div></div>
  <div class="brow"><button class="btn" id="prReset">Reiniciar progreso Pulse</button></div>`;
  if($('#prEnd'))$('#prEnd').onclick=()=>{closeHub();endSession();};
  if($('#prStart'))$('#prStart').onclick=()=>{startSession();renderTab();};
  if($('#prLast'))$('#prLast').onclick=()=>{closeHub();openReport(SES.last);};
  $('#prReset').onclick=e=>{const x=e.target;if(x.dataset.c!=='1'){x.dataset.c='1';x.textContent='Toca de nuevo para confirmar';setTimeout(()=>{x.dataset.c='';x.textContent='Reiniciar progreso Pulse';},3000);return;}
   XPd={xp:0,log:[]};STATS={err:{}};BEST={};QZ={ok:0,n:0};['dj_pulse_xp','dj_pulse_stats','dj_pulse_best','dj_pulse_quiz'].forEach(k=>LS.set(k,k==='dj_pulse_xp'?XPd:k==='dj_pulse_stats'?STATS:k==='dj_pulse_quiz'?QZ:{}));renderTab();};
 }
}
function camHTML(dist){const mx=Math.max(1,...Object.values(dist));let h='<div class="camw">';for(let n=1;n<=12;n++){const a=dist[n+'A']||0,b2=dist[n+'B']||0;h+=`<div title="${n}A: ${a} · ${n}B: ${b2}"><span class="b" style="height:${b2/mx*48}%"></span><span class="a" style="height:${a/mx*48}%"></span></div>`;}
 h+='</div><div class="caml">'+Array.from({length:12},(_,i)=>`<span>${i+1}</span>`).join('')+'</div><p class="mut" style="font-size:11.5px">Azul = menores (A) · naranja = mayores (B)</p>';return h;}
function pistaMeters(){
 const m=$('#crM');if(!m)return;const f=(k,v,mx,txt)=>`<div><small>${k}</small><b>${txt}</b><i><b style="width:${clamp(v/mx,0,1)*100}%"></b></i></div>`;
 m.innerHTML=f('Energía de la pista',CROWD.E,10,CROWD.E.toFixed(1))+f('Participación',CROWD.P,100,Math.round(CROWD.P)+'%')+f('Flow',CROWD.flow,100,Math.round(CROWD.flow))+f('Confianza del DJ',CROWD.conf,100,Math.round(CROWD.conf))+
  `<div><small>Hora simulada</small><b>${hourStr(CROWD.hour)}</b></div><div><small>La pista pide</small><b>E${CROWD.desire.toFixed(1)}</b></div><div><small>Público</small><b>${CROWD.size}</b></div><div><small>Edad promedio</small><b>${CROWD.age}</b></div>`;
 const lg=$('#crLog');if(lg)lg.innerHTML=SETLOG.length?SETLOG.slice(-8).reverse().map(x=>`<div><span>${esc(x.title)}</span><span class="mono">${Math.round(x.bpm)} BPM · ${esc(x.cam||'?')} · E${x.energy||'?'} · ${esc(x.role||'')}</span></div>`).join(''):'<p class="mut">Aún no hay temas en tu set.</p>';
}
function renderQuiz(){
 const c=$('#qzC');if(!c)return;
 if(!Q){c.innerHTML='<p class="mut">Se necesitan al menos 4 pistas con datos en la biblioteca.</p>';return;}
 c.innerHTML=`<h4>🧭 ¿Qué tema pones ahora?</h4><p style="font-size:14px;line-height:1.5">${esc(Q.sc)}, ${hourStr(Q.h)}. La pista pide energía ${Q.desire}/10 y suena <b>“${esc(Q.cur.title)}”</b> (${Math.round(Q.cur.bpm)} BPM · ${esc(Q.cur.cam)} · E${Q.cur.energy}).</p>
 ${Q.opts.map(o=>`<button class="qopt ${Q.answered?(o.id===Q.best?'ok':o.id===Q.answered?'no':''):''}" data-q="${esc(o.id)}" ${Q.answered?'disabled':''}>${esc(o.title)} <span class="mut">· ${Math.round(o.bpm)} BPM · ${esc(o.cam)} · E${o.energy} · ${esc(o.genre||'')}</span>${Q.answered?`<small>${esc(Q.why(o))}</small>`:''}</button>`).join('')}
 ${Q.answered?`<p style="font-size:14px">${Q.answered===Q.best?'✅ Bien leído. <span class="xpf">+15 XP</span>':'❌ No era la mejor opción. Revisa las razones de cada tema.'}</p><button class="btn acc" id="qzN">Siguiente pregunta</button>`:''}`;
 $$('[data-q]',c).forEach(x=>x.onclick=()=>{Q.answered=x.dataset.q;QZ.n++;if(Q.answered===Q.best){QZ.ok++;xp(15,'Criterio musical');}LS.set('dj_pulse_quiz',QZ);renderTab();});
 if($('#qzN'))$('#qzN').onclick=()=>{newQuestion();renderTab();};
}
function renderLoaderLib(){
 const el=$('#demoList');if(!el)return;const L=LIB(),f=HUB.ldf||'Todas',cats=['Todas',...GENRES.filter(g=>L.some(i=>i.genre===g))],list=f==='Todas'?L:L.filter(i=>i.genre===f);
 el.innerHTML=`<div class="chips">${cats.map(c=>`<button data-lc="${c}" class="${c===f?'on':''}">${c}</button>`).join('')}</div>`+list.map(i=>`<button class="trk" data-li="${esc(i.id)}" style="--sw:${esc(i.col||'#888')}"><span class="sw"></span><span><b>${esc(i.title)}</b><small>${i.bpm?Math.round(i.bpm)+' BPM':'BPM ?'} · ${esc(i.cam||'?')} · E${i.energy||'?'} · ${esc(i.genre||'Sin género')}${i.hasAudio?'':' · sin audio'}</small></span></button>`).join('');
 $$('[data-lc]',el).forEach(b=>b.onclick=()=>{HUB.ldf=b.dataset.lc;renderLoaderLib();});
 $$('[data-li]',el).forEach(b=>b.onclick=()=>{$('#mLoad').classList.remove('open');libLoad(loadTarget,L.find(i=>i.id===b.dataset.li));});
}

/* ---------- MONTAJE DEL DOM ---------- */
function mount(){
 const bar=document.createElement('section');bar.id='pulseBar';
 bar.innerHTML=`<div class="pbRow"><button class="pbChip" id="pbA" data-d="A"></button><button class="pbChip" id="pbC"></button><button class="pbChip" id="pbB" data-d="B"></button><button class="pbChip" id="pbP" hidden></button><button class="pbChip" id="pbSp">🟢 Spotify</button><button class="pbChip" id="pbX"></button><button class="pbChip pbS" id="pbS"></button></div><div id="pbDet" hidden></div><div id="pbObs"></div>`;
 $('#coach').after(bar);
 const tg=()=>{S.detOpen=!S.detOpen;$('#pbDet').hidden=!S.detOpen;renderDet();};
 $('#pbA').onclick=tg;$('#pbB').onclick=tg;$('#pbC').onclick=tg;$('#pbX').onclick=()=>openHub('progreso');$('#pbSp').onclick=()=>openHub('playlist');$('#pbP').onclick=()=>openHub('pista');
 $('#pbS').onclick=()=>{if(SES.active)endSession();else startSession();};
 const hb=document.createElement('button');hb.className='hb';hb.id='btnPulse';hb.textContent='🧠 Pulse';hb.onclick=()=>openHub();$('.hbtns').prepend(hb);
 const ap=document.createElement('button');ap.className='acadPulse';ap.innerHTML='🧠 Pulse AI Coach<small>Análisis de temas, prácticas guiadas, pista virtual, criterio musical y tu progreso.</small>';ap.onclick=()=>{$('#mAcad').classList.remove('open');openHub();};
 $('#lesList').before(ap);
 const m=document.createElement('div');m.className='modal';m.id='mPulse';
 m.innerHTML=`<div class="mbox hub"><div class="hubH"><h2>🧠 Pulse AI Coach<button class="x" id="hubX" aria-label="Cerrar">✕</button></h2><div class="tabs" id="hubTabs"></div></div><div class="hubB" id="hubBody"></div></div>`;
 document.body.appendChild(m);
 m.addEventListener('click',e=>{if(e.target===m)closeHub();});$('#hubX').onclick=closeHub;
 const r=document.createElement('div');r.className='modal';r.id='mRep';
 r.innerHTML=`<div class="mbox rep"><h2>📋 Informe post-set<button class="x" data-close aria-label="Cerrar">✕</button></h2><div id="repBody"></div></div>`;
 document.body.appendChild(r);r.addEventListener('click',e=>{if(e.target===r||e.target.hasAttribute('data-close'))r.classList.remove('open');});
 const pc=document.createElement('div');pc.id='pracCard';pc.hidden=true;
 pc.innerHTML=`<div class="lch"><span id="pcTitle"></span><span id="pcTime">0:00</span><button id="pcToggle" aria-label="Expandir">▾</button><button id="pcClose" aria-label="Cerrar">✕</button></div><div id="pcStep"></div><div id="pcBody"><p id="pcDesc"></p><ol id="pcGoals"></ol><div class="lcBtns"><button id="pcPrep">Preparar decks</button><button id="pcRestart">Reiniciar</button><button id="pcList">Prácticas</button></div></div>`;
 document.body.appendChild(pc);
 $('#pcToggle').onclick=()=>pc.classList.toggle('min');$('#pcStep').addEventListener('click',e=>{if(e.target.tagName!=='BUTTON')pc.classList.toggle('min');});
 $('#pcClose').onclick=()=>{pc.hidden=true;RUN=null;};
 $('#pcPrep').onclick=async()=>{const b=$('#pcPrep');b.disabled=true;await prep(RUN.d.prep);b.disabled=false;if(RUN){RUN.t0=T();RUN.base=snap();}pc.classList.add('min');};
 $('#pcRestart').onclick=()=>{if(RUN)startDrill(RUN.d);};
 $('#pcList').onclick=()=>openHub('practica');
 // ocultar práctica si se abre una lección
 const lc=$('#lessonCard');new MutationObserver(()=>{if(!lc.hidden&&RUN){pc.hidden=true;RUN=null;}}).observe(lc,{attributes:true,attributeFilter:['hidden']});
 renderLoaderLib();renderBar(true);
}
mount();
['keydown','keyup'].forEach(t=>document.addEventListener(t,e=>{if(/^(TEXTAREA|SELECT|INPUT)$/.test(e.target.tagName))e.stopImmediatePropagation();},true));
window.PULSE={ev:onEv,onLoad,tick,openHub,analyzeBuf,compat,camScore,parsePlaylist,analyzePlaylist,_C:C,_S:S};
})();
