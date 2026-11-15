/* =========================================================
   HEROES3D.JS · personajes originales en 3D articulado
   - Lince Acróbata: heroína enmascarada (azul y dorado) con cables de luz
   - Pompón: criatura-nube flotante que canta
   ========================================================= */
(function(){
const L=(a,b,u)=>a+(b-a)*u;
function grad(){ const c=document.createElement('canvas'); c.width=4; c.height=1; const x=c.getContext('2d'); ['#5a5a6a','#a0a0b0','#dedee8','#ffffff'].forEach((col,i)=>{x.fillStyle=col;x.fillRect(i,0,1,1);}); const t=new THREE.CanvasTexture(c); t.minFilter=t.magFilter=THREE.NearestFilter; return t; }
let G=null; const MC={};
function M(c,em){ if(!G) G=grad(); const k=c+'_'+(em||0); return MC[k]||(MC[k]=new THREE.MeshToonMaterial({color:c,gradientMap:G,emissive:em||0})); }
const OUT=()=>MC.__out||(MC.__out=new THREE.MeshBasicMaterial({color:0x151024,side:THREE.BackSide}));
function withOutline(mesh,k=0.045){ const o=new THREE.Mesh(mesh.geometry,OUT()); o.scale.setScalar(1+k); mesh.add(o); return mesh; }
function box(w,h,d,c,em){ return withOutline(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c,em)),0.04); }
function sph(r,c,em,seg=14){ return withOutline(new THREE.Mesh(new THREE.SphereGeometry(r,seg,Math.round(seg*0.75)),M(c,em)),0.05); }
function cap(r,len,c,em){ // cápsula (cilindro + esferas) apuntando hacia -Y desde el origen
  const g=new THREE.Group(); const cy=new THREE.Mesh(new THREE.CylinderGeometry(r,r*0.92,len,12),M(c,em)); cy.position.y=-len/2; g.add(withOutline(cy,0.06));
  const a=new THREE.Mesh(new THREE.SphereGeometry(r,12,9),M(c,em)); g.add(a); const b=new THREE.Mesh(new THREE.SphereGeometry(r*0.92,12,9),M(c,em)); b.position.y=-len; g.add(b); return g; }
function cone(r,h,c,em,seg=8){ return withOutline(new THREE.Mesh(new THREE.ConeGeometry(r,h,seg),M(c,em)),0.06); }
function glowTex(){ const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d'); const g=x.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.4,'rgba(255,255,255,.6)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); }
let GL=null;

/* ---------------- LINCE ACRÓBATA ---------------- */
function buildLince(){
  const C={suit:0x1f4fa8,dark:0x152a5a,gold:0xf2b632,gold2:0xc98a1a,skin:0x1f4fa8,visor:0x7ff4ff,scarf:0xff7a2a,cord:0x6ff0ff};
  const R={g:new THREE.Group()}; const g=R.g;
  const hip=new THREE.Group(); hip.position.y=1.02; g.add(hip); R.hip=hip;
  const pelvis=box(0.42,0.2,0.26,C.dark); hip.add(pelvis);
  const belt=box(0.46,0.07,0.3,C.gold); belt.position.y=0.11; hip.add(belt);
  const buckle=new THREE.Mesh(new THREE.OctahedronGeometry(0.06),M(C.visor,0x2a8aa0)); buckle.position.set(0,0.11,0.16); hip.add(buckle);
  const torso=new THREE.Group(); torso.position.y=0.14; hip.add(torso); R.torso=torso;
  const abd=box(0.36,0.26,0.24,C.suit); abd.position.y=0.14; torso.add(abd);
  const chest=new THREE.Mesh(new THREE.CylinderGeometry(0.27,0.2,0.4,10),M(C.suit)); chest.scale.z=0.72; chest.position.y=0.46; torso.add(withOutline(chest,0.05));
  // emblema: huella de lince dorada
  const pad=new THREE.Mesh(new THREE.SphereGeometry(0.065,10,8),M(C.gold,0x332200)); pad.scale.set(1.2,0.9,0.4); pad.position.set(0,0.44,0.2); torso.add(pad);
  for(let i=0;i<4;i++){ const t=new THREE.Mesh(new THREE.SphereGeometry(0.028,8,6),M(C.gold,0x332200)); const a=-0.75+i*0.5; t.position.set(Math.sin(a)*0.1,0.52+Math.cos(a)*0.03,0.19); t.scale.z=0.5; torso.add(t); }
  // hombreras doradas
  for(const s of [-1,1]){ const sh=new THREE.Mesh(new THREE.SphereGeometry(0.11,10,8),M(C.gold)); sh.scale.set(1.1,0.75,1); sh.position.set(s*0.27,0.62,0); torso.add(withOutline(sh,0.06)); }
  // bufanda
  const scarf=new THREE.Group(); scarf.position.set(0,0.68,-0.06); torso.add(scarf); const ring=new THREE.Mesh(new THREE.TorusGeometry(0.13,0.045,6,16),M(C.scarf)); ring.rotation.x=Math.PI/2; scarf.add(ring);
  R.tails=[]; for(const s of [-1,1]){ const tail=new THREE.Group(); tail.position.set(s*0.05,0,-0.12); scarf.add(tail); let par=tail; for(let k=0;k<4;k++){ const seg=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.03,0.16),M(C.scarf)); seg.position.z=-0.08; const j=new THREE.Group(); j.position.z=k?-0.16:0; par.add(j); j.add(seg); par=j; R.tails.push({j,k,s}); } }
  // cabeza
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.08,0.1,8),M(C.suit)); neck.position.y=0.71; torso.add(neck);
  const head=new THREE.Group(); head.position.y=0.78; torso.add(head); R.head=head;
  const skull=new THREE.Mesh(new THREE.SphereGeometry(0.17,16,12),M(C.suit)); skull.scale.set(0.95,1.08,1); skull.position.y=0.15; head.add(withOutline(skull,0.05));
  const jaw=new THREE.Mesh(new THREE.SphereGeometry(0.12,12,9),M(C.dark)); jaw.scale.set(1,0.7,1); jaw.position.set(0,0.06,0.05); head.add(jaw);
  // visor dorado con lentes cian (gafas de aviador)
  const band=new THREE.Mesh(new THREE.TorusGeometry(0.168,0.03,6,24,Math.PI*1.2),M(C.gold)); band.rotation.set(0,Math.PI,0); band.rotation.z=-0.1*0; band.position.y=0.18; band.rotation.x=Math.PI/2; band.rotation.z=Math.PI*0.4; head.add(band);
  for(const s of [-1,1]){ const rim=new THREE.Mesh(new THREE.TorusGeometry(0.052,0.016,6,16),M(C.gold)); rim.position.set(s*0.065,0.19,0.15); rim.rotation.y=s*0.25; head.add(rim);
    const lens=new THREE.Mesh(new THREE.CircleGeometry(0.048,16),new THREE.MeshBasicMaterial({color:C.visor})); lens.position.set(s*0.066,0.19,0.156); lens.rotation.y=s*0.25; head.add(lens); }
  // orejas de lince con penachos
  for(const s of [-1,1]){ const ear=cone(0.06,0.17,C.suit,0,4); ear.position.set(s*0.1,0.33,-0.01); ear.rotation.z=s*-0.28; head.add(ear);
    const inner=new THREE.Mesh(new THREE.ConeGeometry(0.035,0.11,4),M(C.gold)); inner.position.set(s*0.1,0.32,0.02); inner.rotation.z=s*-0.28; head.add(inner);
    const tuft=new THREE.Mesh(new THREE.ConeGeometry(0.012,0.08,4),M(0x111111)); tuft.position.set(s*0.125,0.44,-0.01); tuft.rotation.z=s*-0.28; head.add(tuft); }
  // brazos
  R.arms=[]; for(const s of [1,-1]){ const sh=new THREE.Group(); sh.position.set(s*0.29,0.6,0); torso.add(sh);
    const ua=cap(0.065,0.26,C.suit); sh.add(ua); const el=new THREE.Group(); el.position.y=-0.3; sh.add(el);
    const fa=cap(0.058,0.22,C.suit); el.add(fa); const gaunt=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.065,0.14,10),M(C.gold)); gaunt.position.y=-0.17; el.add(withOutline(gaunt,0.06));
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(0.03),new THREE.MeshBasicMaterial({color:C.cord})); gem.position.set(0,-0.17,0.07); el.add(gem);
    const hand=new THREE.Mesh(new THREE.SphereGeometry(0.06,10,8),M(C.dark)); hand.scale.set(0.8,1.1,0.9); hand.position.y=-0.29; el.add(hand);
    R.arms.push({sh,el,s,hand}); }
  // piernas
  R.legs=[]; for(const s of [1,-1]){ const th=new THREE.Group(); th.position.set(s*0.11,-0.06,0); hip.add(th);
    const tg=cap(0.085,0.36,C.dark); th.add(tg); const kn=new THREE.Group(); kn.position.y=-0.42; th.add(kn);
    const kp=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,6),M(C.gold)); kp.position.set(0,0,0.06); kp.scale.z=0.6; kn.add(kp);
    const sn=cap(0.07,0.32,C.dark); kn.add(sn); const boot=new THREE.Mesh(new THREE.CylinderGeometry(0.085,0.08,0.2,10),M(C.gold)); boot.position.y=-0.3; kn.add(withOutline(boot,0.05));
    const ft=box(0.13,0.07,0.24,C.gold2); ft.position.set(0,-0.42,0.05); kn.add(ft); R.legs.push({th,kn,s}); }
  // cable de luz
  if(!GL) GL=glowTex();
  const cordMat=new THREE.LineBasicMaterial({color:C.cord,transparent:true,opacity:0.95});
  const cordGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,1,0)]); const cord=new THREE.Line(cordGeo,cordMat); cord.visible=false; g.add(cord); R.cord=cord;
  const spark=new THREE.Sprite(new THREE.SpriteMaterial({map:GL,color:C.cord,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})); spark.scale.set(0.5,0.5,1); spark.visible=false; g.add(spark); R.spark=spark;
  g.scale.setScalar(1.12);
  const pos=new THREE.Vector3();
  R.animate=(st,dt,t)=>{ const ph=t*(st.speed||10)*0.58;
    if(st.sit){ hip.position.y=0.62; torso.rotation.x=0.1; R.legs.forEach(l=>{l.th.rotation.x=-1.45; l.kn.rotation.x=1.35;}); R.arms.forEach(a=>{a.sh.rotation.x=-0.9; a.sh.rotation.z=a.s*0.15; a.el.rotation.x=-0.6;}); scarfAnim(1); R.cord.visible=false; R.spark.visible=false; return; }
    if(st.slide>0){ hip.position.y=L(hip.position.y,0.42,0.4); torso.rotation.x=L(torso.rotation.x,-1.1,0.4); R.legs.forEach((l,i)=>{l.th.rotation.x=L(l.th.rotation.x,-1.4+i*0.2,0.4); l.kn.rotation.x=L(l.kn.rotation.x,0.2+i*0.6,0.4);}); R.arms.forEach(a=>{a.sh.rotation.x=L(a.sh.rotation.x,-2.8,0.4); a.el.rotation.x=0;}); scarfAnim(2); cordOff(); return; }
    if(st.fly){ torso.rotation.x=L(torso.rotation.x,0.95,0.12); R.legs.forEach((l,i)=>{l.th.rotation.x=L(l.th.rotation.x,0.35+i*0.25,0.2); l.kn.rotation.x=L(l.kn.rotation.x,0.3+i*0.5,0.2);}); R.arms[0].sh.rotation.x=L(R.arms[0].sh.rotation.x,-3.0,0.2); R.arms[0].el.rotation.x=0; R.arms[1].sh.rotation.x=L(R.arms[1].sh.rotation.x,0.5,0.2); R.arms[1].el.rotation.x=-0.6; scarfAnim(2.5); cordOn(t); return; }
    if(!st.ground){ // salto acrobático: mortal hacia adelante mientras sube
      torso.rotation.x=L(torso.rotation.x,0.3,0.2); R.legs.forEach((l,i)=>{l.th.rotation.x=L(l.th.rotation.x,-1.5,0.3); l.kn.rotation.x=L(l.kn.rotation.x,1.9,0.3);});
      R.arms[0].sh.rotation.x=L(R.arms[0].sh.rotation.x,-2.9,0.3); R.arms[0].el.rotation.x=0; R.arms[1].sh.rotation.x=L(R.arms[1].sh.rotation.x,-0.6,0.3); R.arms[1].sh.rotation.z=L(R.arms[1].sh.rotation.z,-0.6,0.3);
      scarfAnim(2); if(st.vy>0) cordOn(t); else cordOff(); return; }
    cordOff();
    hip.position.y=L(hip.position.y,1.02+Math.abs(Math.sin(ph))*0.07,0.5); torso.rotation.x=L(torso.rotation.x,0.25,0.3); torso.rotation.y=Math.sin(ph)*0.18;
    R.legs.forEach((l,i)=>{ const p=Math.sin(ph+(i?Math.PI:0)); l.th.rotation.x=p*1.0; l.kn.rotation.x=Math.max(0,-Math.cos(ph+(i?Math.PI:0)))*1.6+0.1; });
    R.arms.forEach((a,i)=>{ const p=Math.sin(ph+(i?0:Math.PI)); a.sh.rotation.x=p*1.0; a.sh.rotation.z=a.s*0.1; a.el.rotation.x=-1.1; });
    head.rotation.y=-torso.rotation.y*0.6; scarfAnim(1.5);
    function scarfAnim(k){ R.tails.forEach(({j,k:n,s})=>{ j.rotation.x=-(n===0?0.9:0.12)+Math.sin(t*9+n*0.9+s)*0.12*k; j.rotation.y=Math.sin(t*7+n)*0.1*k; }); }
  };
  function scarfAnim(){}
  function cordOn(t){ const h=R.arms[0].hand; h.getWorldPosition(pos); R.g.worldToLocal(pos); const arr=R.cord.geometry.attributes.position; arr.setXYZ(0,pos.x,pos.y,pos.z); arr.setXYZ(1,pos.x+0.3,pos.y+9,pos.z-6); arr.needsUpdate=true; R.cord.visible=true; R.cord.material.opacity=0.6+0.4*Math.sin(t*40); R.spark.visible=true; R.spark.position.copy(pos); R.spark.scale.setScalar(0.35+0.2*Math.random()); }
  function cordOff(){ R.cord.visible=false; R.spark.visible=false; }
  R.setThrust=()=>{}; return R;
}

/* ---------------- POMPÓN ---------------- */
function buildPompon(){
  const C={body:0x9ff0e0,puff:0xc8fff4,shade:0x6ad8c8,eye:0x1b2440,cheek:0xffd45a,moon:0xf5c542,foot:0x5ac0b8};
  const R={g:new THREE.Group()}; const g=R.g;
  const root=new THREE.Group(); g.add(root); R.root=root;
  const body=new THREE.Group(); body.position.y=0.6; root.add(body); R.body=body;
  const core=sph(0.48,C.body,0x0a2a26,20); body.add(core);
  const puffs=[[0.38,0.18,0.12,0.24],[-0.38,0.18,0.12,0.24],[0.3,0.36,-0.12,0.22],[-0.3,0.36,-0.12,0.22],[0,0.44,-0.05,0.25],[0.42,-0.12,-0.05,0.2],[-0.42,-0.12,-0.05,0.2],[0,-0.05,-0.42,0.28],[0.22,0.2,-0.36,0.2],[-0.22,0.2,-0.36,0.2]];
  R.puffs=[]; for(const [x,y,z,r] of puffs){ const p=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),M(C.puff,0x103a34)); p.position.set(x,y,z); body.add(withOutline(p,0.06)); R.puffs.push({p,y,ph:Math.random()*6}); }
  // cara
  const face=new THREE.Group(); face.position.set(0,0.02,0.44); body.add(face); R.face=face;
  R.eyes=[]; for(const s of [-1,1]){ const e=new THREE.Mesh(new THREE.SphereGeometry(0.075,12,10),M(C.eye)); e.scale.set(0.85,1.15,0.5); e.position.set(s*0.15,0.06,0); face.add(e);
    const hl=new THREE.Mesh(new THREE.SphereGeometry(0.022,8,6),new THREE.MeshBasicMaterial({color:0xffffff})); hl.position.set(s*0.15+0.02,0.1,0.035); face.add(hl); R.eyes.push(e);
    const ch=new THREE.Mesh(new THREE.OctahedronGeometry(0.045),M(C.cheek,0x442200)); ch.position.set(s*0.27,-0.05,-0.03); ch.scale.z=0.4; face.add(ch); }
  const mouth=new THREE.Mesh(new THREE.TorusGeometry(0.05,0.012,6,12,Math.PI),M(C.eye)); mouth.rotation.z=Math.PI; mouth.position.set(0,-0.06,0.01); face.add(mouth); R.mouth=mouth;
  const sing=new THREE.Mesh(new THREE.CircleGeometry(0.045,14),M(0x7a2a4a)); sing.position.set(0,-0.07,0.015); sing.visible=false; face.add(sing); R.sing=sing;
  // antena con luna creciente
  const ant=new THREE.Group(); ant.position.set(0,0.6,0); body.add(ant); R.ant=ant;
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.022,0.3,6),M(C.shade)); stem.position.y=0.12; stem.rotation.z=0.25; ant.add(stem);
  const moon=new THREE.Mesh(new THREE.TorusGeometry(0.09,0.035,8,16,Math.PI*1.3),M(C.moon,0x553300)); moon.position.set(0.06,0.32,0); moon.rotation.z=-0.6; ant.add(withOutline(moon,0.08));
  // bracitos y patitas
  R.arms=[]; for(const s of [-1,1]){ const a=new THREE.Group(); a.position.set(s*0.47,-0.05,0.08); body.add(a); const hand=new THREE.Mesh(new THREE.SphereGeometry(0.1,10,8),M(C.body)); hand.position.set(s*0.08,-0.06,0); hand.scale.set(1,0.8,0.9); a.add(withOutline(hand,0.07)); R.arms.push({a,s}); }
  R.feet=[]; for(const s of [-1,1]){ const f=new THREE.Mesh(new THREE.SphereGeometry(0.11,10,8),M(C.foot)); f.scale.set(1,0.6,1.3); f.position.set(s*0.2,0.17,0.12); root.add(withOutline(f,0.07)); R.feet.push(f); }
  // notas musicales (sprites)
  const notes=[]; const nc=document.createElement('canvas'); nc.width=nc.height=64; const nx=nc.getContext('2d'); nx.fillStyle='#fff'; nx.strokeStyle='#1b2440'; nx.lineWidth=4; nx.beginPath(); nx.ellipse(22,46,11,8,-0.4,0,7); nx.fill(); nx.stroke(); nx.fillRect(30,8,6,38); nx.strokeRect(30,8,6,38); nx.beginPath(); nx.moveTo(36,8); nx.quadraticCurveTo(52,16,48,30); nx.lineTo(44,28); nx.quadraticCurveTo(46,20,36,18); nx.closePath(); nx.fill(); nx.stroke(); const ntex=new THREE.CanvasTexture(nc);
  for(let i=0;i<3;i++){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:ntex,color:[0x9ff0e0,0xffd45a,0xc8a0ff][i],transparent:true,depthWrite:false})); s.scale.set(0.3,0.3,1); s.visible=false; g.add(s); notes.push(s); }
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(0.45,20),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:0.25,depthWrite:false})); shadow.rotation.x=-Math.PI/2; shadow.position.y=0.02; g.add(shadow); R.shadow=shadow;
  g.scale.setScalar(1.2);
  let blinkT=2;
  R.animate=(st,dt,t)=>{ const ph=t*(st.speed||10)*0.5;
    R.puffs.forEach(({p,y,ph:o})=>{ p.position.y=y+Math.sin(t*3+o)*0.025; });
    blinkT-=dt; const blink=blinkT<0.12; if(blinkT<0) blinkT=2+Math.random()*3; R.eyes.forEach(e=>e.scale.y=blink?0.15:1.15);
    const singing=!!st.fly||(!st.ground&&st.vy>0); R.sing.visible=singing; R.mouth.visible=!singing;
    notes.forEach((n,i)=>{ n.visible=singing; if(singing){ const k=((t*0.9+i/3)%1); n.position.set(Math.sin(t*2+i*2)*0.5,1.2+k*1.2,-0.2+Math.cos(i)*0.2); n.material.opacity=1-k; } });
    R.ant.rotation.z=Math.sin(t*5)*0.15+(st.ground?0:-0.3);
    if(st.sit){ body.position.y=0.5; root.position.y=0; body.scale.set(1,1,1); R.arms.forEach(a=>a.a.rotation.z=a.s*-0.6); R.feet.forEach(f=>f.position.z=0.3); return; }
    if(st.slide>0){ body.scale.set(L(body.scale.x,1.35,0.4),L(body.scale.y,0.55,0.4),L(body.scale.z,1.3,0.4)); body.position.y=L(body.position.y,0.42,0.4); return; }
    if(st.fly){ body.scale.set(1,1,1); body.position.y=L(body.position.y,0.95+Math.sin(t*3)*0.1,0.2); body.rotation.x=L(body.rotation.x,0.35,0.1); R.arms.forEach(a=>a.a.rotation.z=a.s*(1.2+Math.sin(t*12)*0.4)); return; }
    body.rotation.x=L(body.rotation.x,0.12,0.2);
    if(!st.ground){ const k=st.vy>0?1.18:0.92; body.scale.set(L(body.scale.x,2-k,0.3),L(body.scale.y,k,0.3),L(body.scale.z,2-k,0.3)); R.arms.forEach(a=>a.a.rotation.z=L(a.a.rotation.z,a.s*1.4,0.3)); return; }
    // carrera saltarina con aplastar-estirar
    const hop=Math.abs(Math.sin(ph)); const sq=1-Math.pow(1-hop,4)*0.22;
    body.position.y=0.58+hop*0.32; body.scale.set(2-sq*1.0-0.0+(1-sq)*0.3,sq,2-sq*1.0+(1-sq)*0.3); body.scale.x=1+(1-sq)*0.5; body.scale.z=1+(1-sq)*0.5;
    body.rotation.z=Math.sin(ph)*0.08;
    R.arms.forEach(a=>a.a.rotation.z=a.s*(0.3+hop*0.8));
    R.feet.forEach((f,i)=>{ f.position.z=0.12+Math.sin(ph*2+(i?Math.PI:0))*0.12; f.position.y=0.17+Math.max(0,Math.sin(ph*2+(i?Math.PI:0)))*0.06; });
    R.shadow.scale.setScalar(1-hop*0.25);
  };
  R.setThrust=()=>{}; return R;
}

/* ---------------- piezas de vehículo ---------------- */
function wheel(r,w,tire,rim,knobby){
  const g=new THREE.Group(); const spin=new THREE.Group(); g.add(spin);
  const t=new THREE.Mesh(new THREE.CylinderGeometry(r,r,w,20),M(tire)); t.rotation.z=Math.PI/2; spin.add(withOutline(t,0.04));
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(r*0.55,r*0.55,w*1.04,12),M(rim)); hub.rotation.z=Math.PI/2; spin.add(hub);
  for(let i=0;i<5;i++){ const sp=new THREE.Mesh(new THREE.BoxGeometry(w*1.06,r*0.12,r*0.9),M(tire)); sp.rotation.x=i*Math.PI/5; spin.add(sp); }
  if(knobby) for(let i=0;i<14;i++){ const k=new THREE.Mesh(new THREE.BoxGeometry(w*1.02,r*0.16,r*0.22),M(tire)); const a=i/14*Math.PI*2; k.position.set(0,Math.cos(a)*r*1.02,Math.sin(a)*r*1.02); k.rotation.x=-a; spin.add(k); }
  g.spin=spin; return g; }
function smokeTex(){ const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d'); const g=x.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'rgba(220,220,230,.9)'); g.addColorStop(1,'rgba(220,220,230,0)'); x.fillStyle=g; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); }
let SM=null;

/* ---------------- ROMPE-ROCAS (camión monstruo) ---------------- */
function buildTruck(){
  const C={body:0x6a3ad0,body2:0x4a24a0,trim:0xb8f040,tire:0x26242e,rim:0xd8d8e0,cage:0x30303a,gem:0x6ff0ff,spring:0xff8a2a};
  const R={g:new THREE.Group(),veh:true}; const g=R.g;
  const sus=new THREE.Group(); sus.position.y=0.95; g.add(sus); R.sus=sus;
  const chassis=box(0.7,0.18,1.9,C.cage); chassis.position.y=-0.12; sus.add(chassis);
  const bed=box(1.25,0.42,1.9,C.body); bed.position.y=0.25; sus.add(bed);
  const hood=box(1.2,0.22,0.7,C.body2); hood.position.set(0,0.52,0.55); hood.rotation.x=0.08; sus.add(hood);
  const cab=box(1.0,0.48,0.75,C.body); cab.position.set(0,0.72,-0.15); sus.add(cab);
  const win=new THREE.Mesh(new THREE.BoxGeometry(0.86,0.3,0.05),M(0x203048,0x0a1830)); win.position.set(0,0.76,0.23); win.rotation.x=-0.25; sus.add(win);
  const swin=new THREE.Mesh(new THREE.BoxGeometry(1.02,0.26,0.5),M(0x203048,0x0a1830)); swin.position.set(0,0.78,-0.18); sus.add(swin);
  // jaula antivuelco
  for(const s of [-1,1]){ const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,1.1,6),M(C.cage)); bar.rotation.x=Math.PI/2; bar.position.set(s*0.5,1.0,-0.2); sus.add(bar);
    const up=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,0.5,6),M(C.cage)); up.position.set(s*0.5,0.78,-0.72); sus.add(up); }
  const top=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,1.0,6),M(C.cage)); top.rotation.z=Math.PI/2; top.position.set(0,1.0,-0.72); sus.add(top);
  // franjas y cristales
  for(const s of [-1,1]){ const st=box(0.04,0.1,1.7,C.trim); st.position.set(s*0.64,0.3,0); sus.add(st);
    const hl=new THREE.Mesh(new THREE.OctahedronGeometry(0.09),new THREE.MeshBasicMaterial({color:C.gem})); hl.position.set(s*0.4,0.42,0.96); sus.add(hl);
    const ex=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.06,0.5,8),M(0xb0b0b8)); ex.position.set(s*0.42,0.85,-0.7); sus.add(ex); }
  const bump=box(1.3,0.16,0.14,C.trim); bump.position.set(0,0.12,1.0); sus.add(bump);
  for(let i=0;i<3;i++){ const sp=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.18,4),M(C.trim)); sp.position.set(-0.3+i*0.3,0.68,0.85); sp.rotation.x=0.5; sus.add(sp); }
  // ruedas y resortes
  R.wheels=[]; for(const [x,z] of [[-0.78,0.68],[0.78,0.68],[-0.78,-0.68],[0.78,-0.68]]){ const w=wheel(0.52,0.42,C.tire,C.rim,true); w.position.set(x,0.52,z); g.add(w); R.wheels.push(w);
    const spr=new THREE.Mesh(new THREE.TorusGeometry(0.07,0.02,6,10),M(C.spring)); const coil=new THREE.Group(); for(let k=0;k<4;k++){ const c=spr.clone(); c.rotation.x=Math.PI/2; c.position.y=k*0.07; coil.add(c); } coil.position.set(x*0.6,0.62,z); g.add(coil); (R.coils=R.coils||[]).push(coil); }
  if(!SM) SM=smokeTex(); R.smoke=[]; for(let i=0;i<6;i++){ const p=new THREE.Sprite(new THREE.SpriteMaterial({map:SM,transparent:true,depthWrite:false})); p.scale.setScalar(0.3); g.add(p); R.smoke.push({p,o:i/6}); }
  R.animate=(st,dt,t)=>vehAnim(R,st,dt,t,0.95,0.52);
  R.setThrust=()=>{}; return R;
}
/* ---------------- COMETA (auto de carreras) ---------------- */
function buildRacer(){
  const C={body:0x14b8b0,body2:0x0c7a80,white:0xf2f6ff,glow:0x9ffff4,tire:0x22222a,rim:0xc0c8d0,canopy:0x1a2a50};
  const R={g:new THREE.Group(),veh:true}; const g=R.g;
  const sus=new THREE.Group(); sus.position.y=0.34; g.add(sus); R.sus=sus;
  const floor=box(1.0,0.12,2.3,C.body2); floor.position.y=-0.02; sus.add(floor);
  const tub=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.42,1.5,10),M(C.body)); tub.rotation.x=Math.PI/2; tub.scale.set(1.25,0.6,1); tub.position.set(0,0.18,0.1); sus.add(withOutline(tub,0.04));
  const nose=new THREE.Mesh(new THREE.ConeGeometry(0.34,0.75,10),M(C.body)); nose.rotation.x=Math.PI/2; nose.scale.set(1.25,0.55,1); nose.position.set(0,0.12,1.2); sus.add(withOutline(nose,0.04));
  const canopy=new THREE.Mesh(new THREE.SphereGeometry(0.26,14,10,0,Math.PI*2,0,Math.PI/2),M(C.canopy,0x0a1430)); canopy.scale.set(1,0.8,1.8); canopy.position.set(0,0.34,-0.05); sus.add(withOutline(canopy,0.04));
  const glint=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,6),new THREE.MeshBasicMaterial({color:0xffffff})); glint.position.set(-0.1,0.5,0.15); sus.add(glint);
  for(const s of [-1,1]){ const pod=box(0.28,0.22,1.0,C.white); pod.position.set(s*0.5,0.1,-0.2); sus.add(pod);
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.06,1.0),new THREE.MeshBasicMaterial({color:C.glow})); stripe.position.set(s*0.65,0.1,-0.2); sus.add(stripe);
    const hl=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.05,0.04),new THREE.MeshBasicMaterial({color:0xffffe0})); hl.position.set(s*0.2,0.16,1.52); hl.rotation.y=s*0.3; sus.add(hl); }
  const fin=box(0.05,0.36,0.6,C.white); fin.position.set(0,0.45,-0.75); sus.add(fin);
  const wing=box(1.2,0.05,0.3,C.body2); wing.position.set(0,0.62,-1.0); sus.add(wing); for(const s of [-1,1]){ const ep=box(0.04,0.2,0.36,C.white); ep.position.set(s*0.6,0.56,-1.0); sus.add(ep); }
  const fw=box(1.1,0.04,0.22,C.white); fw.position.set(0,0.0,1.45); sus.add(fw);
  // estrella decorativa
  const starS=new THREE.Shape(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, r=i%2?0.05:0.12; i?starS.lineTo(Math.cos(a)*r,Math.sin(a)*r):starS.moveTo(Math.cos(a)*r,Math.sin(a)*r); }
  for(const s of [-1,1]){ const st=new THREE.Mesh(new THREE.ShapeGeometry(starS),new THREE.MeshBasicMaterial({color:0xffd84a,side:THREE.DoubleSide})); st.position.set(s*0.645,0.13,0.3); st.rotation.y=s*Math.PI/2; sus.add(st); }
  R.wheels=[]; for(const [x,z,r] of [[-0.62,0.85,0.26],[0.62,0.85,0.26],[-0.64,-0.8,0.32],[0.64,-0.8,0.32]]){ const w=wheel(r,0.26,C.tire,C.rim,false); w.position.set(x,r,z); g.add(w); R.wheels.push(w); }
  if(!GL) GL=glowTex(); const fl=new THREE.Sprite(new THREE.SpriteMaterial({map:GL,color:0x6ff0ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false})); fl.position.set(0,0.35,-1.35); g.add(fl); R.flame=fl;
  R.animate=(st,dt,t)=>vehAnim(R,st,dt,t,0.34,0.29);
  R.setThrust=v=>{ fl.material.opacity=v*(0.6+0.4*Math.random()); fl.scale.setScalar(0.6+v*0.8*Math.random()); };
  return R;
}
function vehAnim(R,st,dt,t,susY,wr){
  const sp=st.veh?st.speed:(st.speed||10); R.wr=(R.wr||0)+sp*dt/wr; R.wheels.forEach(w=>w.spin.rotation.x=R.wr);
  const s=R.sus;
  if(st.slide>0){ s.position.y=L(s.position.y,susY*0.55,0.4); s.scale.y=L(s.scale.y,0.7,0.4); }
  else { s.scale.y=L(s.scale.y,1,0.3); const bump=st.ground===false?0.12:Math.abs(Math.sin(t*sp*0.9))*0.035; s.position.y=L(s.position.y,susY+bump,0.4); }
  const pitch=st.ground===false?(st.vy>0?-0.18:0.12):0; R.g.rotation.x=L(R.g.rotation.x,st.fly?-0.1:pitch,0.12);
  s.rotation.z=Math.sin(t*7)*0.015*Math.min(1,sp/10);
  if(R.coils) R.coils.forEach(c=>c.scale.y=0.8+(s.position.y-susY)*3);
  if(R.smoke) R.smoke.forEach(o=>{ const k=(t*1.2+o.o)%1; o.p.position.set((o.o<0.5?-1:1)*0.42,1.15+k*1.2,-0.75-k*1.5); o.p.material.opacity=(1-k)*0.6; o.p.scale.setScalar(0.25+k*0.6); });
}
/* ---------------- CAPITANA AURORA (heroína con capa) ---------------- */
function buildAurora(){
  const C={suit:0xff6a5a,suit2:0xd8443c,white:0xf4f6fb,teal:0x18b8b0,teal2:0x0e8a86,gold:0xf5c542,visor:0x2a3a6a};
  const R={g:new THREE.Group()}; const g=R.g;
  const hip=new THREE.Group(); hip.position.y=1.02; g.add(hip); R.hip=hip;
  const pel=box(0.4,0.2,0.26,C.white); hip.add(pel);
  const belt=box(0.44,0.06,0.3,C.teal); belt.position.y=0.11; hip.add(belt);
  const torso=new THREE.Group(); torso.position.y=0.14; hip.add(torso); R.torso=torso;
  const abd=box(0.34,0.26,0.24,C.suit); abd.position.y=0.14; torso.add(abd);
  const chest=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.2,0.4,10),M(C.suit)); chest.scale.z=0.72; chest.position.y=0.46; torso.add(withOutline(chest,0.05));
  // emblema solar
  const sun=new THREE.Mesh(new THREE.CircleGeometry(0.07,16),M(C.gold,0x553300)); sun.position.set(0,0.48,0.196); torso.add(sun);
  for(let i=0;i<8;i++){ const ray=new THREE.Mesh(new THREE.ConeGeometry(0.02,0.07,3),M(C.gold,0x553300)); const a=i/8*Math.PI*2; ray.position.set(Math.cos(a)*0.1,0.48+Math.sin(a)*0.1,0.19); ray.rotation.z=a-Math.PI/2; torso.add(ray); }
  for(const s of [-1,1]){ const pad=new THREE.Mesh(new THREE.SphereGeometry(0.1,10,8),M(C.white)); pad.scale.set(1.15,0.75,1); pad.position.set(s*0.27,0.62,0); torso.add(withOutline(pad,0.06)); }
  const collar=new THREE.Mesh(new THREE.TorusGeometry(0.12,0.035,6,16),M(C.gold)); collar.rotation.x=Math.PI/2; collar.position.y=0.68; torso.add(collar);
  // capa por segmentos
  const cape=new THREE.Group(); cape.position.set(0,0.66,-0.15); torso.add(cape); R.cape=[];
  let par=cape; for(let k=0;k<5;k++){ const j=new THREE.Group(); j.position.y=k?-0.2:0; par.add(j); const w=0.5+k*0.06; const pnl=new THREE.Mesh(new THREE.BoxGeometry(w,0.21,0.02),M(k%2?C.teal2:C.teal)); pnl.position.y=-0.1; j.add(pnl); R.cape.push(j); par=j; }
  const hem=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.03,16,1,false,0,Math.PI),M(C.gold)); hem.rotation.set(0,Math.PI/2,Math.PI/2); hem.scale.set(0.9,1,0.15); hem.position.y=-0.21; par.add(hem);
  // cabeza: casco redondo con visor y cresta
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.08,0.1,8),M(C.white)); neck.position.y=0.71; torso.add(neck);
  const head=new THREE.Group(); head.position.y=0.78; torso.add(head); R.head=head;
  const helm=new THREE.Mesh(new THREE.SphereGeometry(0.18,16,12),M(C.white)); helm.position.y=0.16; head.add(withOutline(helm,0.05));
  const visor=new THREE.Mesh(new THREE.SphereGeometry(0.165,16,8,-Math.PI*0.42,Math.PI*0.84,Math.PI*0.36,Math.PI*0.26),M(C.visor,0x0a1430)); visor.position.set(0,0.16,0.025); head.add(visor);
  const shine=new THREE.Mesh(new THREE.SphereGeometry(0.025,8,6),new THREE.MeshBasicMaterial({color:0xffffff})); shine.position.set(-0.06,0.2,0.175); head.add(shine);
  const crest=new THREE.Mesh(new THREE.BoxGeometry(0.035,0.12,0.3),M(C.suit)); crest.position.set(0,0.33,-0.02); crest.rotation.x=-0.2; head.add(withOutline(crest,0.08));
  for(const s of [-1,1]){ const ear=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.04,12),M(C.gold)); ear.rotation.z=Math.PI/2; ear.position.set(s*0.18,0.16,0); head.add(ear); }
  R.arms=[]; for(const s of [1,-1]){ const sh=new THREE.Group(); sh.position.set(s*0.28,0.6,0); torso.add(sh); const ua=cap(0.06,0.26,C.suit); sh.add(ua); const el=new THREE.Group(); el.position.y=-0.3; sh.add(el);
    const fa=cap(0.055,0.2,C.white); el.add(fa); const cuff=new THREE.Mesh(new THREE.TorusGeometry(0.06,0.018,6,12),M(C.gold)); cuff.rotation.x=Math.PI/2; cuff.position.y=-0.12; el.add(cuff);
    const hand=new THREE.Mesh(new THREE.SphereGeometry(0.06,10,8),M(C.white)); hand.position.y=-0.27; el.add(hand); R.arms.push({sh,el,s}); }
  R.legs=[]; for(const s of [1,-1]){ const th=new THREE.Group(); th.position.set(s*0.11,-0.06,0); hip.add(th); const tg=cap(0.08,0.36,C.suit2); th.add(tg);
    const kn=new THREE.Group(); kn.position.y=-0.42; th.add(kn); const sn=cap(0.068,0.3,C.white); kn.add(sn); const ft=box(0.13,0.08,0.24,C.teal); ft.position.set(0,-0.38,0.05); kn.add(ft); R.legs.push({th,kn}); }
  g.scale.setScalar(1.12);
  R.animate=(st,dt,t)=>{ const ph=t*(st.speed||10)*0.58; const capeWave=(k)=>R.cape.forEach((j,n)=>{ j.rotation.x=(n===0?k*0.55:k*0.12)+Math.sin(t*8-n*0.8)*0.06*(0.4+k); });
    if(st.sit){ hip.position.y=0.62; torso.rotation.x=0.1; R.legs.forEach(l=>{l.th.rotation.x=-1.45; l.kn.rotation.x=1.35;}); R.arms.forEach(a=>{a.sh.rotation.x=-0.9; a.el.rotation.x=-0.6;}); capeWave(0.6); return; }
    if(st.slide>0){ hip.position.y=L(hip.position.y,0.42,0.4); torso.rotation.x=L(torso.rotation.x,-1.1,0.4); R.legs.forEach((l,i)=>{l.th.rotation.x=L(l.th.rotation.x,-1.4+i*0.2,0.4); l.kn.rotation.x=L(l.kn.rotation.x,0.2+i*0.6,0.4);}); R.arms.forEach(a=>{a.sh.rotation.x=L(a.sh.rotation.x,-2.8,0.4); a.el.rotation.x=0;}); capeWave(0.2); return; }
    if(st.fly){ torso.rotation.x=L(torso.rotation.x,1.25,0.12); R.legs.forEach((l,i)=>{l.th.rotation.x=L(l.th.rotation.x,0.2+i*0.1,0.2); l.kn.rotation.x=L(l.kn.rotation.x,0.15,0.2);}); R.arms[0].sh.rotation.x=L(R.arms[0].sh.rotation.x,-3.0,0.2); R.arms[0].el.rotation.x=0; R.arms[1].sh.rotation.x=L(R.arms[1].sh.rotation.x,0.3,0.2); R.arms[1].el.rotation.x=-0.3; capeWave(1.6); return; }
    if(!st.ground){ torso.rotation.x=L(torso.rotation.x,0.2,0.2); R.legs.forEach((l,i)=>{l.th.rotation.x=L(l.th.rotation.x,i?0.4:-1.2,0.3); l.kn.rotation.x=L(l.kn.rotation.x,i?0.3:1.5,0.3);}); R.arms.forEach(a=>{a.sh.rotation.x=L(a.sh.rotation.x,-2.6,0.3); a.sh.rotation.z=L(a.sh.rotation.z,a.s*0.35,0.3);}); capeWave(1.3); return; }
    hip.position.y=L(hip.position.y,1.02+Math.abs(Math.sin(ph))*0.07,0.5); torso.rotation.x=L(torso.rotation.x,0.22,0.3); torso.rotation.y=Math.sin(ph)*0.16;
    R.legs.forEach((l,i)=>{ const p=Math.sin(ph+(i?Math.PI:0)); l.th.rotation.x=p*1.0; l.kn.rotation.x=Math.max(0,-Math.cos(ph+(i?Math.PI:0)))*1.6+0.1; });
    R.arms.forEach((a,i)=>{ const p=Math.sin(ph+(i?0:Math.PI)); a.sh.rotation.x=p*0.95; a.sh.rotation.z=a.s*0.1; a.el.rotation.x=-1.0; });
    head.rotation.y=-torso.rotation.y*0.6; capeWave(0.15+Math.min(1,(st.speed||0)/16)*0.9); };
  R.setThrust=()=>{}; return R;
}

const BUILD={lince:buildLince,pompon:buildPompon,truck:buildTruck,racer:buildRacer,aurora:buildAurora};
function build(id){ return BUILD[id](); }
// miniatura para menús (render offscreen una vez)
const thumbs={};
function thumb(id){ if(thumbs[id]) return thumbs[id]; try{
  const r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true}); r.setSize(160,160); r.setPixelRatio(1);
  const s=new THREE.Scene(); s.add(new THREE.HemisphereLight(0xffffff,0x555577,0.9)); const d=new THREE.DirectionalLight(0xffffff,0.8); d.position.set(2,4,5); s.add(d);
  const R=build(id); R.animate({ground:true,speed:0,slide:0},0.016,0.5); s.add(R.g); R.g.rotation.y=0.35;
  const cam=new THREE.PerspectiveCamera(32,1,0.1,50); const h={lince:2.4,aurora:2.4,pompon:1.9,truck:2.2,racer:1.6}[id]; if(R.veh){ R.g.rotation.y=0.8; cam.position.set(0,h*0.9,h*2.6); cam.lookAt(0,h*0.3,0); } else { cam.position.set(0,h*0.55,h*2.4); cam.lookAt(0,h*0.48,0); }
  r.render(s,cam); thumbs[id]=r.domElement.toDataURL('image/png'); r.dispose(); }catch(e){ thumbs[id]=''; } return thumbs[id]; }
window.HEROES3D={build,thumb};
})();
