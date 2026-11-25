/* Contador de visitas de Multiverso: una persona = un identificador anónimo guardado en este navegador */
(function(){
  var U='https://bsbufxnyrtggsaqwttau.supabase.co/rest/v1/rpc/', K='sb_publishable_9QTNNbjLdlWSs45EBu2VNA_futa1Mkg';
  var s=document.currentScript, game=(s&&s.getAttribute('data-game'))||'sala', v='anon-visitor';
  try{ v=localStorage.getItem('mvo_vid'); if(!v){ v='v'+Math.random().toString(36).slice(2,12)+Date.now().toString(36); localStorage.setItem('mvo_vid',v); } }catch(e){ v='anon-'+Math.random().toString(36).slice(2,12); }
  function rpc(fn,body){ return fetch(U+fn,{method:'POST',headers:{'apikey':K,'Content-Type':'application/json'},body:JSON.stringify(body||{})}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }); }
  window.MVO_VISIT=rpc('mvo_visit',{p_game:game,p_visitor:v});
  window.MVO_STATS=function(){ return rpc('mvo_visit_stats',{}); };
  /* Geo-referencia aproximada (ciudad/país), 1 vez por semana. No se guarda la IP. */
  var GEO=null;
  try{ var gt=+localStorage.getItem('mvo_geo_t')||0; if(Date.now()-gt>7*864e5) GEO=geoLookup(); }catch(e){}
  function tmo(p,ms){ return Promise.race([p,new Promise(function(_,r){ setTimeout(function(){ r('t'); },ms); })]); }
  function getJ(u){ return tmo(fetch(u,{cache:'no-store'}).then(function(r){ if(!r.ok) throw 0; return r.json(); }),5000); }
  function geoLookup(){
    return getJ('https://ipwho.is/?fields=success,country_code,country,region,city,latitude,longitude')
      .then(function(j){ if(!j||j.success===false) throw 0; return {cc:j.country_code,co:j.country,re:j.region,ci:j.city,la:j.latitude,lo:j.longitude}; })
      .catch(function(){ return getJ('https://get.geojs.io/v1/ip/geo.json').then(function(j){ return {cc:j.country_code,co:j.country,re:j.region,ci:j.city,la:+j.latitude,lo:+j.longitude}; }); })
      .then(function(g){ if(!g||g.la==null||isNaN(g.la)) return null;
        return rpc('mvo_geo',{p_visitor:v,p_cc:g.cc||'',p_country:g.co||'',p_region:g.re||'',p_city:g.ci||'',p_lat:Math.round(g.la*10)/10,p_lon:Math.round(g.lo*10)/10})
          .then(function(){ try{ localStorage.setItem('mvo_geo_t',Date.now()); }catch(e){} }); })
      .catch(function(){ return null; });
  }
  if(GEO) window.MVO_VISIT=Promise.all([window.MVO_VISIT,tmo(GEO,6000).catch(function(){})]).then(function(a){ return a[0]; });
})();

/* Modo sin internet + autoarreglo: si el sitio publicado es más nuevo que lo que tiene este teléfono, limpia la copia guardada y recarga */
(function(){ var BUILD='2026.11.24b'; window.MVO_BUILD=BUILD; var cs=document.currentScript, BASE=new URL('.',(cs&&cs.src)||location.href).href;
  function heal(){ try{ if(sessionStorage.getItem('mvo_heal')===BUILD) return; sessionStorage.setItem('mvo_heal',BUILD); }catch(e){}
    var jobs=[]; try{ if(window.caches) jobs.push(caches.keys().then(function(ks){ return Promise.all(ks.map(function(k){ return caches.delete(k); })); })); }catch(e){}
    try{ if(navigator.serviceWorker) jobs.push(navigator.serviceWorker.getRegistrations().then(function(rs){ return Promise.all(rs.map(function(r){ return r.unregister(); })); })); }catch(e){}
    Promise.all(jobs).catch(function(){}).then(function(){ location.reload(); }); }
  try{ fetch(BASE+'version.json?t='+Date.now(),{cache:'no-store'}).then(function(r){ return r.ok?r.json():null; }).then(function(d){ if(d&&d.v&&d.v!==BUILD) heal(); }).catch(function(){}); }catch(e){}
  try{ if('serviceWorker' in navigator && location.protocol.indexOf('http')===0){ window.addEventListener('load',function(){ navigator.serviceWorker.register(BASE+'sw.js',{updateViaCache:'none'}).then(function(r){ try{ r.update(); }catch(e){} }).catch(function(){}); }); } }catch(e){}
})();

/* Pantalla completa: en Android/PC se activa al primer toque en horizontal; en iPhone (Safari no lo permite) se explica cómo instalarlo */
(function(){
  try{
    var ua=navigator.userAgent||'', iOS=/iPhone|iPod/.test(ua)||(/iPad/.test(ua)), touch=('ontouchstart' in window)||navigator.maxTouchPoints>0;
    var standalone=window.navigator.standalone===true||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||(window.matchMedia&&matchMedia('(display-mode: fullscreen)').matches);
    if(standalone||!touch) return;
    var land=function(){ return window.innerWidth>window.innerHeight; };
    var de=document.documentElement, canFS=!!(de.requestFullscreen||de.webkitRequestFullscreen);
    if(canFS&&!iOS){
      var tryFS=function(){ if(!land()||document.fullscreenElement||document.webkitFullscreenElement) return; var f=de.requestFullscreen||de.webkitRequestFullscreen; try{ var p=f.call(de,{navigationUI:'hide'}); if(p&&p.catch) p.catch(function(){}); }catch(e){} };
      window.addEventListener('pointerup',tryFS,true); window.addEventListener('touchend',tryFS,true);
      return;
    }
    if(!iOS) return;
    var KEY='mvo_fs_tip';
    var off=function(){ try{ return localStorage.getItem(KEY)==='no'; }catch(e){ return false; } };
    var shown=false, box=null;
    var show=function(){ if(shown||off()||!land()||!document.body) return; shown=true;
      box=document.createElement('div');
      box.setAttribute('style','position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:99999;max-width:min(560px,92vw);background:rgba(18,11,34,.96);color:#fff;border:2px solid #f5c542;border-radius:14px;padding:10px 14px;font:14px/1.45 system-ui,-apple-system,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.6);display:flex;gap:10px;align-items:center');
      box.innerHTML='<div style="font-size:26px">📲</div><div style="flex:1"><b style="color:#f5c542">Juega en pantalla completa</b><br>En Safari toca <b>Compartir ⬆️</b> → <b>«Agregar a inicio»</b> y abre Multiverso desde ese ícono: se verá sin barras. <span style="opacity:.75">(Ahora mismo: toca <b>aA</b> en la barra → «Ocultar barra de herramientas».)</span></div><div style="display:flex;flex-direction:column;gap:6px"><button data-k="ok" style="background:#f5c542;color:#2a1800;border:0;border-radius:10px;padding:6px 10px;font-weight:700">Entendido</button><button data-k="no" style="background:none;color:#ccc;border:1px solid #777;border-radius:10px;padding:4px 8px;font-size:12px">No mostrar más</button></div>';
      box.addEventListener('click',function(e){ var k=e.target&&e.target.getAttribute('data-k'); if(!k) return; e.stopPropagation(); if(k==='no'){ try{ localStorage.setItem(KEY,'no'); }catch(_){} } box.remove(); },true);
      box.addEventListener('pointerdown',function(e){ e.stopPropagation(); });
      document.body.appendChild(box); setTimeout(function(){ if(box&&box.parentNode) box.remove(); },16000); };
    window.addEventListener('orientationchange',function(){ setTimeout(show,500); });
    window.addEventListener('resize',function(){ setTimeout(show,300); });
    window.addEventListener('load',function(){ setTimeout(show,1200); });
  }catch(e){}
})();
