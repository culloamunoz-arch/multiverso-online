/* Contador de visitas de Multiverso: una persona = un identificador anónimo guardado en este navegador */
(function(){
  var U='https://bsbufxnyrtggsaqwttau.supabase.co/rest/v1/rpc/', K='sb_publishable_9QTNNbjLdlWSs45EBu2VNA_futa1Mkg';
  var s=document.currentScript, game=(s&&s.getAttribute('data-game'))||'sala', v='anon-visitor';
  try{ v=localStorage.getItem('mvo_vid'); if(!v){ v='v'+Math.random().toString(36).slice(2,12)+Date.now().toString(36); localStorage.setItem('mvo_vid',v); } }catch(e){ v='anon-'+Math.random().toString(36).slice(2,12); }
  function rpc(fn,body){ return fetch(U+fn,{method:'POST',headers:{'apikey':K,'Content-Type':'application/json'},body:JSON.stringify(body||{})}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }); }
  window.MVO_VISIT=rpc('mvo_visit',{p_game:game,p_visitor:v});
  window.MVO_STATS=function(){ return rpc('mvo_visit_stats',{}); };
})();

/* Modo sin internet: registra el service worker (permite instalar y abrir sin conexión) */
try{ if('serviceWorker' in navigator && location.protocol.indexOf('http')===0){ window.addEventListener('load',function(){ navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(function(r){ try{ r.update(); }catch(e){} }).catch(function(){}); var rl=false; navigator.serviceWorker.addEventListener('controllerchange',function(){ if(rl) return; rl=true; location.reload(); }); }); } }catch(e){}
