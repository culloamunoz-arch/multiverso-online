/* Contador de visitas de Multiverso: una persona = un identificador anónimo guardado en este navegador */
(function(){
  var U='https://bsbufxnyrtggsaqwttau.supabase.co/rest/v1/rpc/', K='sb_publishable_9QTNNbjLdlWSs45EBu2VNA_futa1Mkg';
  var s=document.currentScript, game=(s&&s.getAttribute('data-game'))||'sala', v='anon-visitor';
  try{ v=localStorage.getItem('mvo_vid'); if(!v){ v='v'+Math.random().toString(36).slice(2,12)+Date.now().toString(36); localStorage.setItem('mvo_vid',v); } }catch(e){ v='anon-'+Math.random().toString(36).slice(2,12); }
  function rpc(fn,body){ return fetch(U+fn,{method:'POST',headers:{'apikey':K,'Content-Type':'application/json'},body:JSON.stringify(body||{})}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }); }
  window.MVO_VISIT=rpc('mvo_visit',{p_game:game,p_visitor:v});
  window.MVO_STATS=function(){ return rpc('mvo_visit_stats',{}); };
})();

/* Modo sin internet + autoarreglo: si el sitio publicado es más nuevo que lo que tiene este teléfono, limpia la copia guardada y recarga */
(function(){ var BUILD='2026.11.18c'; window.MVO_BUILD=BUILD;
  function heal(){ try{ if(sessionStorage.getItem('mvo_heal')===BUILD) return; sessionStorage.setItem('mvo_heal',BUILD); }catch(e){}
    var jobs=[]; try{ if(window.caches) jobs.push(caches.keys().then(function(ks){ return Promise.all(ks.map(function(k){ return caches.delete(k); })); })); }catch(e){}
    try{ if(navigator.serviceWorker) jobs.push(navigator.serviceWorker.getRegistrations().then(function(rs){ return Promise.all(rs.map(function(r){ return r.unregister(); })); })); }catch(e){}
    Promise.all(jobs).catch(function(){}).then(function(){ location.reload(); }); }
  try{ fetch('/version.json?t='+Date.now(),{cache:'no-store'}).then(function(r){ return r.ok?r.json():null; }).then(function(d){ if(d&&d.v&&d.v!==BUILD) heal(); }).catch(function(){}); }catch(e){}
  try{ if('serviceWorker' in navigator && location.protocol.indexOf('http')===0){ window.addEventListener('load',function(){ navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(function(r){ try{ r.update(); }catch(e){} }).catch(function(){}); }); } }catch(e){}
})();
