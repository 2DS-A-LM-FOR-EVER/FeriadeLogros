// (El fondo ahora es el GIF fondo.gif; se quitaron las capas animadas de la imagen anterior)
(function(){ // menú lateral del celular
 const d=document.getElementById('drawer'),bg=document.getElementById('drawerBg'),b=document.getElementById('burger');
 const set=o=>{d.classList.toggle('open',o);bg.classList.toggle('open',o);d.setAttribute('aria-hidden',String(!o));b.setAttribute('aria-expanded',String(o));document.body.style.overflow=o?'hidden':''};
 b.addEventListener('click',()=>set(true));
 document.getElementById('drawerClose').addEventListener('click',()=>set(false));
 bg.addEventListener('click',()=>set(false));
 d.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>set(false)));
 addEventListener('keydown',e=>{if(e.key==='Escape')set(false)});
 matchMedia('(min-width:861px)').addEventListener('change',e=>{if(e.matches)set(false)});
})();

(function(){ // cambiar tema claro / oscuro (se recuerda la elección)
 const root=document.documentElement,mt=document.querySelector('meta[name=theme-color]'),btns=document.querySelectorAll('[data-theme-toggle]');
 const light=()=>root.getAttribute('data-theme')==='light';
 const paint=()=>{if(mt)mt.setAttribute('content',light()?'#f4f6ff':'#050a24');btns.forEach(b=>b.setAttribute('aria-pressed',String(light())))};
 btns.forEach(b=>b.addEventListener('click',()=>{
  if(light())root.removeAttribute('data-theme');else root.setAttribute('data-theme','light');
  try{localStorage.setItem('tema',light()?'light':'dark')}catch(e){}
  paint();
 }));
 paint();
})();