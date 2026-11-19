/* Multiverso · modo sin internet. Sube VERSION cuando quieras forzar una recarga completa. */
const VERSION='mvo-v5';
const THREE='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const SUPA='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
const LOCAL=['/','/index.html','/visit.js','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png','/icons/apple-touch-icon.png',
 '/juegos/','/juegos/dj/','/juegos/guitarra/','/juegos/rap/','/juegos/kart/','/juegos/runner/','/juegos/pompon/','/juegos/vuelo/','/juegos/vuelo/escuadron.html','/juegos/mega-robot/','/juegos/mega-robot-3d/','/juegos/obras/',
 ...['dj-1','dj-2','guitarra-1','guitarra-2','kart-1','kart-2','kart-3','mega-robot-1','mega-robot-2','mega-robot-3','mega-robot-3d-1','mega-robot-3d-2','mega-robot-3d-3','mega-robot-3d-4','mmo-1','mmo-2','mmo-3','obras-1','obras-2','obras-3','obras-4','obras-5','obras-6','pompon-1','pompon-2'].map(n=>'/juegos/img/'+n+'.webp')];
const FONTHOSTS=['fonts.googleapis.com','fonts.gstatic.com'];

self.addEventListener('install',e=>{
 e.waitUntil((async()=>{
  const c=await caches.open(VERSION);
  await Promise.allSettled([
   ...LOCAL.map(u=>c.add(new Request(u,{cache:'reload'}))),
   c.add(new Request(THREE,{mode:'no-cors'})),
   c.add(new Request(SUPA,{mode:'no-cors'}))
  ]);
  self.skipWaiting();
 })());
});
self.addEventListener('activate',e=>{
 e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k!==VERSION)await caches.delete(k);
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url);
 const same=u.origin===location.origin;
 const lib=u.href===THREE||u.href===SUPA||FONTHOSTS.includes(u.hostname);
 if(!same&&!lib)return; // Supabase (datos) y demás: siempre a la red
 if(same&&(r.mode==='navigate'||/\.(html|js|webmanifest)$/.test(u.pathname)||u.pathname.endsWith('/'))){
  // páginas: primero la red (siempre lo más nuevo); sin internet, la copia guardada
  e.respondWith((async()=>{
   const c=await caches.open(VERSION);
   try{
    const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),9000);
    // Ojo: no se puede copiar una petición de navegación con opciones (Safari/iPhone lanza error); se pide por URL
    const res=await fetch(u.href,{signal:ctl.signal,cache:'no-cache',credentials:'same-origin',redirect:'follow'});clearTimeout(t);
    if(res&&res.ok&&!res.redirected)c.put(u.pathname+u.search,res.clone());
    return res;
   }catch(err){
    const hit=await c.match(u.pathname+u.search,{ignoreSearch:true})||await c.match(r,{ignoreSearch:true})||(r.mode==='navigate'?await c.match('/juegos/'):null);
    return hit||new Response('Sin conexión',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
   }
  })());
  return;
 }
 // imágenes, iconos, librerías y fuentes: copia guardada primero
 e.respondWith((async()=>{
  const c=await caches.open(VERSION);
  const hit=await c.match(r);if(hit)return hit;
  try{const res=await fetch(r);if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res;}
  catch(err){return new Response('',{status:504});}
 })());
});
