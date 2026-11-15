/* =========================================================
   VOL.JS · convierte la foto recortada de un juguete en una
   figura 3D con volumen ("inflado" desde la silueta)
   ========================================================= */
(function(){
const cache={};
// nose: hacia dónde mira el vehículo en la foto (1 = derecha, -1 = izquierda)
const NOSE={rayo:1,toro:1,dino:-1,shark:-1,grave:1,fire:1,police:1,tow:1,plane:1};
function buildInflated(img,res,depthFrac,round){
  const ar=img.naturalWidth/img.naturalHeight;
  const gw=ar>=1?res:Math.max(8,Math.round(res*ar)), gh=ar>=1?Math.max(8,Math.round(res/ar)):res;
  const c=document.createElement('canvas'); c.width=gw; c.height=gh; const x=c.getContext('2d'); x.drawImage(img,0,0,gw,gh);
  const a=x.getImageData(0,0,gw,gh).data;
  const N=gw*gh, inside=new Uint8Array(N); for(let i=0;i<N;i++) inside[i]=a[i*4+3]>110?1:0;
  // transformada de distancia (chamfer 3-4) desde el borde exterior
  const INF=1e9, d=new Float32Array(N);
  for(let i=0;i<N;i++) d[i]=inside[i]?INF:0;
  const at=(xx,yy)=>(xx<0||yy<0||xx>=gw||yy>=gh)?0:d[yy*gw+xx];
  for(let y=0;y<gh;y++) for(let xx=0;xx<gw;xx++){ const i=y*gw+xx; if(!d[i]) continue;
    d[i]=Math.min(d[i],at(xx-1,y)+3,at(xx,y-1)+3,at(xx-1,y-1)+4,at(xx+1,y-1)+4); }
  for(let y=gh-1;y>=0;y--) for(let xx=gw-1;xx>=0;xx--){ const i=y*gw+xx; if(!d[i]) continue;
    d[i]=Math.min(d[i],at(xx+1,y)+3,at(xx,y+1)+3,at(xx+1,y+1)+4,at(xx-1,y+1)+4); }
  let dmax=1; for(let i=0;i<N;i++) if(d[i]>dmax) dmax=d[i];
  const R=dmax*round; // radio de redondeo: partes delgadas también ganan curva
  const W=1, H=gh/gw; // ancho unitario
  const pos=[],uv=[],idx=[]; const fId=new Int32Array(N).fill(-1), bId=new Int32Array(N).fill(-1);
  const zOf=i=>{ const u=Math.min(1,Math.max(0,(d[i]-3))/R); return Math.sqrt(1-(1-u)*(1-u))*depthFrac*W; };
  // vértices en esquinas de píxel: usamos centros de píxel por simplicidad
  let v=0;
  for(let y=0;y<gh;y++) for(let xx=0;xx<gw;xx++){ const i=y*gw+xx; if(!inside[i]) continue;
    const X=(xx+0.5)/gw*W-W/2, Y=(gh-y-0.5)/gw, z=zOf(i);
    pos.push(X,Y,z); uv.push((xx+0.5)/gw,1-(y+0.5)/gh); fId[i]=v++;
    pos.push(X,Y,-z); uv.push((xx+0.5)/gw,1-(y+0.5)/gh); bId[i]=v++; }
  const front=[],back=[],side=[];
  for(let y=0;y<gh-1;y++) for(let xx=0;xx<gw-1;xx++){
    const i0=y*gw+xx,i1=i0+1,i2=i0+gw,i3=i2+1; const ins=[inside[i0],inside[i1],inside[i2],inside[i3]]; const n=ins[0]+ins[1]+ins[2]+ins[3];
    if(n===4){ front.push(fId[i0],fId[i2],fId[i1], fId[i1],fId[i2],fId[i3]); back.push(bId[i0],bId[i1],bId[i2], bId[i1],bId[i3],bId[i2]); }
    else if(n===3){ const t=[i0,i1,i3,i2].filter(k=>inside[k]); // triángulo restante (orden horario consistente)
      const [p,q,r]=t; front.push(fId[p],fId[r],fId[q]); back.push(bId[p],bId[q],bId[r]); }
  }
  // costura lateral: une frente y espalda a lo largo del contorno
  const edge=(p,q)=>{ side.push(fId[p],bId[p],fId[q], fId[q],bId[p],bId[q]); };
  for(let y=0;y<gh;y++) for(let xx=0;xx<gw;xx++){ const i=y*gw+xx; if(!inside[i]) continue;
    const r=xx+1<gw?i+1:-1, dn=y+1<gh?i+gw:-1;
    if(r>=0&&inside[r]){ const up=y>0?inside[i-gw]&&inside[r-gw]:0, dw=dn>=0?inside[dn]&&inside[dn+1]:0; if(!up||!dw) edge(i,r); }
    if(dn>=0&&inside[dn]){ const lf=xx>0?inside[i-1]&&inside[dn-1]:0, rt=r>=0?inside[r]&&inside[dn+1]:0; if(!lf||!rt) edge(dn,i); }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex([...front,...back,...side]);
  g.addGroup(0,front.length,0); g.addGroup(front.length,back.length,1); g.addGroup(front.length+back.length,side.length,1);
  g.computeVertexNormals();
  return {geo:g,ar:gw/gh,H};
}
const loader={};
function texFor(img){ const t=new THREE.Texture(img); t.minFilter=THREE.LinearFilter; t.needsUpdate=true; return t; }
// Crea un grupo que se llena con la figura 3D cuando la imagen carga.
// opts: {height | length, depth (fracción del ancho), round, kind:'figure'|'vehicle', backTint}
window.makeVolume=function(id,img,opts){
  const grp=new THREE.Group(); grp.userData.ready=false;
  const go=()=>{
    const key=id+'|'+(opts.depth||0.2)+'|'+(opts.round||0.6)+'|'+(opts.res||96);
    if(!cache[key]) cache[key]=buildInflated(img,opts.res||96,opts.depth||0.2,opts.round||0.6);
    const {geo,H}=cache[key]; const tex=texFor(img);
    // textura de espalda: colores del traje sin rasgos (silueta difuminada, rellena hasta el borde)
    const bc=document.createElement('canvas'); bc.width=img.naturalWidth; bc.height=img.naturalHeight; const bx=bc.getContext('2d');
    const sm=document.createElement('canvas'); sm.width=10; sm.height=Math.max(6,Math.round(10*img.naturalHeight/img.naturalWidth)); const sx=sm.getContext('2d');
    sx.drawImage(img,0,0,sm.width,sm.height);
    const dd=sx.getImageData(0,0,sm.width,sm.height); const P=dd.data; // dilata color a píxeles transparentes
    for(let pass=0;pass<4;pass++) for(let i=0;i<sm.width*sm.height;i++){ if(P[i*4+3]>40) continue; const xx=i%sm.width, yy=(i/sm.width)|0; let r=0,g=0,b=0,n=0;
      for(const [ox,oy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X=xx+ox,Y=yy+oy; if(X<0||Y<0||X>=sm.width||Y>=sm.height) continue; const j=(Y*sm.width+X)*4; if(P[j+3]>40){ r+=P[j];g+=P[j+1];b+=P[j+2];n++; } }
      if(n){ P[i*4]=r/n;P[i*4+1]=g/n;P[i*4+2]=b/n;P[i*4+3]=255; } }
    sx.putImageData(dd,0,0); bx.imageSmoothingEnabled=true; bx.filter='blur(2px)'; bx.drawImage(sm,0,0,bc.width,bc.height);
    const btex=new THREE.CanvasTexture(bc); btex.minFilter=THREE.LinearFilter;
    const front=new THREE.MeshPhongMaterial({map:tex,shininess:55,specular:0x3a3a3a,side:THREE.FrontSide});
    const back=new THREE.MeshPhongMaterial({map:opts.kind==='vehicle'?tex:btex,color:opts.backTint||0x8a8aa0,shininess:40,specular:0x222222,side:THREE.FrontSide});
    const m=new THREE.Mesh(geo,[front,back]);
    if(opts.kind==='vehicle'){
      const L=opts.length||2.4; m.scale.set(L,L,L); // largo = 1 unidad
      const nose=NOSE[id]||1; // nariz hacia -Z (adelante)
      m.rotation.y=nose>0?Math.PI/2:-Math.PI/2;
      m.position.y=0;
    } else {
      const h=opts.height||2.2; const s=h/H; m.scale.set(s,s,s);
    }
    grp.add(m); grp.userData.mesh=m; grp.userData.ready=true; grp.userData.size=(opts.kind==='vehicle')?{L:opts.length||2.4,H:(opts.length||2.4)*H}:{H:opts.height||2.2,W:(opts.height||2.2)/H};
    if(opts.onReady) opts.onReady(grp);
  };
  if(img.complete&&img.naturalWidth) go(); else img.addEventListener('load',go,{once:true});
  return grp;
};
window.VOL_NOSE=NOSE;
})();
