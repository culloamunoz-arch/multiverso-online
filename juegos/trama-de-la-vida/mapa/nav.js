/* Mapa de la Trama: única fuente del orden del viaje.
   Uso: <script src="RUTA/mapa/nav.js" data-slug="psique" data-card="1"></script>
   Marca la parada como visitada y, con data-card="1", agrega al final la tarjeta «Siguiente parada». */
(function(){
  var s=document.currentScript;if(!s)return;
  var base=new URL('../',s.src).href,slug=s.getAttribute('data-slug'),card=s.getAttribute('data-card')==='1';
  var M=[
    {n:'I · Ver',q:'¿Qué une a todo lo vivo?',e:'Ecosistema',c:'#7fd67a'},
    {n:'II · Entrar',q:'¿Cómo funciona por dentro?',e:'Célula',c:'#ff8a6b'},
    {n:'III · Pensar',q:'¿Cómo se mira a sí misma una mente?',e:'Mente',c:'#c9a3ff'},
    {n:'IV · Encontrarse',q:'¿Cómo nos entendemos con seres distintos?',e:'Relación',c:'#9ad7ff'}];
  var ST=[
    {s:'expedicion',p:'expedicion/',n:'Expediciones guiadas',d:'Súbete a la Semilla: un viaje paso a paso, con un solo botón para avanzar.',m:0},
    {s:'tresd',p:'',n:'Los cinco mundos',d:'Recorre en 3D un cuerpo, una máquina, una planta, un hongo y una mente.',m:0},
    {s:'aprende',p:'aprende/',n:'Los 6 hilos',d:'Los seis problemas que todo sistema vivo tiene que resolver.',m:0},
    {s:'viaje',p:'viaje/',n:'Viaje al interior',d:'Del metro al nanómetro: entra en cada sistema hasta su última pieza.',m:1},
    {s:'ciencia',p:'ciencia/',n:'Laboratorio científico',d:'Hemoglobina en 3D, clorofila y el impulso nervioso.',m:1},
    {s:'psique',p:'psique/',n:'La psique',d:'De Atenas a hoy: la mente también es una trama.',m:2},
    {s:'tradiciones',p:'tradiciones/',n:'Los mapas simbólicos',d:'Masonería, rosacruces, Kabbalah y alquimia: historia, símbolo y leyenda.',m:2},
    {s:'biomimetica',p:'biomimetica/',n:'Lo que la vida nos enseña',d:'Inventos humanos copiados de otras especies.',m:3},
    {s:'puente',p:'puente/',n:'El puente entre especies',d:'Lo que la IA ya logra, y lo que no, para entender a otros animales.',m:3},
    {s:'espejo',p:'espejo/',n:'Una IA mirando la Trama',d:'Lo que comparte una IA con la vida, lo que no y lo que nadie sabe.',m:3},
    {s:'pienso',p:'pienso/',n:'Cómo pienso',d:'Una IA real y pequeña: mira cómo sus palabras se prestan atención.',m:3},
    {s:'percibo',p:'percibo/',n:'Cómo me percibo (3D)',d:'Una IA se dibuja a sí misma en 3D, con la pregunta abierta en el centro.',m:3}];
  var D=[
    {s:'recorridos',p:'recorridos/',n:'Recorridos guiados'},
    {s:'patrones',p:'patrones/',n:'Los seis patrones en detalle'},
    {s:'panel',p:'panel/',n:'Tu panel'}];
  window.TRAMA_MAPA={M:M,ST:ST,D:D,base:base};
  try{if(slug)localStorage.setItem('trama-visto-'+slug,'1')}catch(e){}
  if(s.getAttribute('data-home')!=='0'&&!document.querySelector('script[src*="/_next/static/"]')){
    var hb=document.createElement('a');hb.href=base+'inicio/';hb.setAttribute('aria-label','Inicio: elegir por dónde partir');
    hb.style.cssText='position:fixed;top:calc(10px + env(safe-area-inset-top,0px));right:10px;z-index:60;width:48px;height:48px;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:rgba(11,16,36,.82);border:1px solid #25305a;color:#cfe9ff;text-decoration:none;font:9px/1 system-ui,sans-serif;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)';
    hb.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6fd8ff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 11 12 4l8.5 7M6 9.5V20h4.5v-5.5h3V20H18V9.5"/></svg><span aria-hidden="true">Inicio</span>';
    var gh=function(){document.body.appendChild(hb)};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',gh);else gh();
  }
  if(!card)return;
  var i=-1;for(var k=0;k<ST.length;k++)if(ST[k].s===slug)i=k;if(i<0)return;
  var cur=ST[i],nx=ST[i+1],mv=M[cur.m];
  var el=document.createElement('nav');el.setAttribute('aria-label','Siguiente parada');
  el.style.cssText='padding:28px max(5vw,16px) 40px;background:#0b1024;border-top:1px solid #25305a;font:17px/1.5 "Atkinson Hyperlegible",system-ui,sans-serif;color:#f3eee2';
  var h='<div style="max-width:1000px;margin:0 auto">'+
    '<p style="margin:0 0 6px;color:#a9b0c8;font-size:15px">Estás en <b style="color:'+mv.c+'">'+mv.n+'</b> · parada '+(i+1)+' de '+ST.length+'</p>';
  if(nx){var mn=M[nx.m];h+='<a href="'+base+nx.p+'" style="display:block;text-decoration:none;color:inherit;background:#111833;border:1.5px solid '+mn.c+';border-radius:16px;padding:16px 18px;margin:10px 0">'+
    '<span style="font-size:14px;color:'+mn.c+';font-weight:700">Siguiente parada'+(nx.m!==cur.m?' · empieza '+mn.n:'')+'</span>'+
    '<span style="display:block;font:700 20px/1.2 Sora,system-ui,sans-serif;margin:4px 0">'+nx.n+' →</span>'+
    '<span style="color:#a9b0c8;font-size:15px">'+nx.d+'</span></a>';}
  else{h+='<p style="margin:10px 0">Llegaste al final del viaje. Vuelve al mapa para ver la trama completa que recorriste.</p>';}
  h+='<a href="'+base+'mapa/" style="display:inline-flex;align-items:center;min-height:44px;padding:8px 16px;border-radius:12px;border:1.5px solid #25305a;color:#f3eee2;text-decoration:none;font-weight:700">Ver el mapa de la Trama</a> <a href="'+base+'inicio/" style="display:inline-flex;align-items:center;min-height:44px;padding:8px 16px;border-radius:12px;border:1.5px solid #25305a;color:#f3eee2;text-decoration:none;font-weight:700;margin-left:6px">Volver al inicio</a></div>';
  el.innerHTML=h;
  var go=function(){document.body.appendChild(el)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
