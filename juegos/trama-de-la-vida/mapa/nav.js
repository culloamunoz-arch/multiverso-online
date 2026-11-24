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
    {s:'recorridos',p:'recorridos/',n:'Recorridos 3D guiados',d:'La cámara te lleva de cerca a cada pieza, de un mundo a otro.'},
    {s:'preguntas',p:'preguntas/',n:'Preguntas que cambian',d:'Rondas nuevas en cada visita: lo que fallas vuelve, lo que sabes se espacia.'},
    {s:'patrones',p:'patrones/',n:'Los seis patrones en detalle',d:'Cada hilo, visto en los cinco mundos a la vez.'},
    {s:'panel',p:'panel/',n:'Tu panel',d:'Lo que llevas descubierto.'}];
  /* Formas de viajar: cuatro caminos por las mismas paradas. La persona elige uno y la guía
     siempre le propone el siguiente paso de ESE camino, para no perderse entre modos. */
  var F={
    guiada:{n:'Guiada',d:'Paso a paso, con un solo botón para avanzar.',c:'#6fd3b8',path:['expedicion','preguntas','recorridos','aprende','viaje']},
    visual:{n:'Visual en 3D',d:'Mirar y tocar: cuerpos, máquinas y mentes en 3D.',c:'#9ad7ff',path:['tresd','recorridos','viaje','ciencia','pienso','percibo']},
    lectura:{n:'Leer y pensar',d:'Textos, historia e ideas, a tu ritmo.',c:'#c9a3ff',path:['aprende','psique','tradiciones','biomimetica','puente','espejo']},
    libre:{n:'Libre',d:'Las doce paradas en el orden del mapa.',c:'#ffb35c',path:ST.map(function(x){return x.s})}};
  var ALL={};ST.concat(D).forEach(function(x){ALL[x.s]=x});
  ALL.inicio={s:'inicio',p:'inicio/',n:'Inicio'};ALL.mapa={s:'mapa',p:'mapa/',n:'El mapa de la Trama'};
  var get=function(k){try{return localStorage.getItem(k)}catch(e){return null}};
  var seen=function(x){return get('trama-visto-'+x)==='1'};
  var forma=function(){var f=get('trama-forma');return F[f]?f:null};
  var setForma=function(f){try{localStorage.setItem('trama-forma',f)}catch(e){}};
  var next=function(f,from){var P=F[f||forma()||'libre'].path,i=P.indexOf(from),k;
    for(k=i+1;k<P.length;k++)if(!seen(P[k]))return ALL[P[k]];
    for(k=0;k<P.length;k++)if(!seen(P[k])&&P[k]!==from)return ALL[P[k]];
    return i>=0&&i<P.length-1?ALL[P[i+1]]:null};
  window.TRAMA_MAPA={M:M,ST:ST,D:D,F:F,ALL:ALL,base:base,seen:seen,forma:forma,setForma:setForma,next:next};
  try{if(slug)localStorage.setItem('trama-visto-'+slug,'1')}catch(e){}
  var ready=function(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn);else fn()};
  var btn='display:inline-flex;align-items:center;min-height:44px;padding:8px 16px;border-radius:12px;border:1.5px solid #25305a;color:#f3eee2;text-decoration:none;font-weight:700;background:transparent;font-size:15px;cursor:pointer';
  var nextCard=function(nx,f){var c=f?F[f].c:'#ffb35c';return '<a href="'+base+nx.p+'" style="display:block;text-decoration:none;color:inherit;background:#111833;border:1.5px solid '+c+';border-radius:16px;padding:14px 16px;margin:10px 0">'+
    '<span style="font-size:13.5px;color:'+c+';font-weight:700">Siguiente'+(f?' en tu forma de viajar · '+F[f].n:' parada')+'</span>'+
    '<span style="display:block;font:700 19px/1.2 Sora,system-ui,sans-serif;margin:4px 0">'+nx.n+' →</span>'+
    (nx.d?'<span style="color:#a9b0c8;font-size:15px">'+nx.d+'</span>':'')+'</a>'};
  /* Guía: botón fijo en las páginas de lectura que dice dónde estás y cuál es tu siguiente paso */
  if(s.getAttribute('data-home')!=='0'&&!document.querySelector('script[src*="/_next/static/"]')){
    var hb=document.createElement('button');hb.type='button';hb.setAttribute('aria-label','Guía: dónde estoy y qué sigue');hb.setAttribute('aria-expanded','false');
    hb.style.cssText='position:fixed;top:calc(10px + env(safe-area-inset-top,0px));right:10px;z-index:60;width:48px;height:48px;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:rgba(11,16,36,.86);border:1px solid #25305a;color:#cfe9ff;font:9px/1 system-ui,sans-serif;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);cursor:pointer;padding:0';
    hb.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6fd8ff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6z"/></svg><span aria-hidden="true">Guía</span>';
    var pn=document.createElement('div');pn.setAttribute('role','dialog');pn.setAttribute('aria-label','Guía de navegación');
    pn.style.cssText='display:none;position:fixed;top:calc(64px + env(safe-area-inset-top,0px));right:10px;left:10px;margin-left:auto;max-width:380px;z-index:61;background:#0b1024;border:1px solid #25305a;border-radius:20px;padding:16px;box-shadow:0 18px 50px rgba(0,0,0,.6);font:16px/1.45 "Atkinson Hyperlegible",system-ui,sans-serif;color:#f3eee2;max-height:calc(100dvh - 90px);overflow:auto';
    var draw=function(){var f=forma(),here=ALL[slug],nx=next(f,slug),h='';
      h+='<p style="margin:0;color:#a9b0c8;font-size:14px">Estás en</p><p style="margin:0 0 10px;font:700 19px/1.2 Sora,system-ui,sans-serif">'+(here?here.n:document.title)+'</p>';
      if(f){h+='<p style="margin:0;color:#a9b0c8;font-size:14px">Tu forma de viajar: <b style="color:'+F[f].c+'">'+F[f].n+'</b> <button data-cambiar style="background:none;border:0;color:#ffb35c;text-decoration:underline;font:inherit;cursor:pointer;min-height:32px">cambiar</button></p>';
        if(nx)h+=nextCard(nx,f);}
      if(!f||pn.dataset.elige){h+='<p style="margin:8px 0 6px;font-weight:700">¿Cómo te gusta viajar?</p>';
        Object.keys(F).forEach(function(k){h+='<button data-forma="'+k+'" style="display:block;width:100%;text-align:left;margin:6px 0;padding:10px 12px;border-radius:12px;border:1.5px solid '+(k===f?F[k].c:'#25305a')+';background:#111833;color:#f3eee2;font:inherit;cursor:pointer"><b style="color:'+F[k].c+'">'+F[k].n+'</b><span style="display:block;color:#a9b0c8;font-size:14px">'+F[k].d+'</span></button>'});}
      h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><a href="'+base+'inicio/" style="'+btn+'">Ir al Inicio</a><a href="'+base+'mapa/" style="'+btn+'">Ver el mapa</a></div>';
      pn.innerHTML=h;
      pn.querySelectorAll('[data-forma]').forEach(function(b){b.onclick=function(){setForma(b.getAttribute('data-forma'));delete pn.dataset.elige;draw()}});
      var cb=pn.querySelector('[data-cambiar]');if(cb)cb.onclick=function(){pn.dataset.elige='1';draw()};};
    hb.onclick=function(){var o=pn.style.display==='none';if(o)draw();pn.style.display=o?'block':'none';hb.setAttribute('aria-expanded',o?'true':'false')};
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&pn.style.display!=='none'){pn.style.display='none';hb.setAttribute('aria-expanded','false');hb.focus()}});
    document.addEventListener('click',function(e){if(pn.style.display!=='none'&&!pn.contains(e.target)&&!hb.contains(e.target)){pn.style.display='none';hb.setAttribute('aria-expanded','false')}});
    ready(function(){document.body.appendChild(hb);document.body.appendChild(pn)});
  }
  if(!card)return;
  var i=-1;for(var k=0;k<ST.length;k++)if(ST[k].s===slug)i=k;if(i<0)return;
  var cur=ST[i],mv=M[cur.m],f=forma(),nx=f?next(f,slug):ST[i+1];
  var el=document.createElement('nav');el.setAttribute('aria-label','Siguiente paso');
  el.style.cssText='padding:28px max(5vw,16px) 40px;background:#0b1024;border-top:1px solid #25305a;font:17px/1.5 "Atkinson Hyperlegible",system-ui,sans-serif;color:#f3eee2';
  var h='<div style="max-width:1000px;margin:0 auto">'+
    '<p style="margin:0 0 6px;color:#a9b0c8;font-size:15px">Estás en <b style="color:'+mv.c+'">'+mv.n+'</b> · parada '+(i+1)+' de '+ST.length+(f?' · forma <b style="color:'+F[f].c+'">'+F[f].n+'</b>':'')+'</p>';
  if(nx)h+=nextCard(nx,f);
  else h+='<p style="margin:10px 0">Llegaste al final de este camino. Vuelve al mapa para ver la trama completa que recorriste.</p>';
  h+='<a href="'+base+'mapa/" style="'+btn+'">Ver el mapa de la Trama</a> <a href="'+base+'inicio/" style="'+btn+';margin-left:6px">Volver al inicio</a></div>';
  el.innerHTML=h;
  ready(function(){document.body.appendChild(el)});
})();
