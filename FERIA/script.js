// Todas las coordenadas están en píxeles de la imagen original (1376x768) y se convierten a %
const IW=1376,IH=768,stage=document.getElementById('stage');
const pc=(v,t)=>(v/t*100)+'%';
function box(cls,x,y,w,h,parent=stage,extra=''){
  const e=document.createElement('div');e.className=cls;
  const [W,H]=parent===stage?[IW,IH]:[parent._w,parent._h];
  e.style.cssText=`left:${pc(x,W)};top:${pc(y,H)};width:${pc(w,W)};height:${pc(h,H)};${extra}`;
  parent.appendChild(e);return e;
}
let s=7;const rnd=()=>(s=s*16807%2147483647)/2147483647;

box('glow',470,320,420,360);                       // brillo detrás de la mascota
box('sh',560,622,280,28);                          // sombra que se achica al saltar
const m=box('mascot',520,360,360,290);m._w=360;m._h=290; // mascota (cara + 67) como sprite aparte
box('spr',0,0,360,290,m);box('shine',0,0,360,290,m);box('wink',172,157,16,24,m);box('hap',172,157,16,24,m);box('hap',123,163,16,24,m); // guiño del ojo derecho
for(let i=0;i<14;i++){                              // partículas verdes
  const sz=6+Math.round(rnd()*4);
  box('px',540+rnd()*310,430+rnd()*190,sz,sz,stage,`--dx:${Math.round((rnd()-.5)*300)}%;animation-duration:${3+rnd()*3}s;animation-delay:-${rnd()*6}s`);
}
[[292,140,190,70],[520,168,320,56],[985,150,215,60]].forEach(([x,y,w,h],i)=>{ // nubes en ventanas
  const win=box('win',x,y,w,h);win._w=w;win._h=h;
  box('cloud',0,10,30,48,win,`animation-duration:${42+i*9}s;animation-delay:-${i*14}s`);
  box('cloud',0,38,20,36,win,`animation-duration:${60+i*7}s;animation-delay:-${22+i*9}s`);
});
[[709,343],[455,318]].forEach(([x,y],k)=>{for(let i=0;i<3;i++)box('puff',x,y,6,6,stage,`animation-delay:-${i*1.1+k*.5}s`)}); // vapor
box('joy',826,330,6,6);box('bt',810,339,5,3,stage,'background:#7dffa0');box('bt',850,342,5,3,stage,'background:#fff;animation-delay:-.3s');   // palanca y botones del arcade
box('screen',1278,224,92,22,stage,'background:#ffd89a;animation-duration:2.4s');box('mini',1312,297,5,7);box('mini',1323,297,5,7);box('glow',1262,250,110,90,stage,'animation-delay:-1s'); // cartel GAME
(function(){ // minijuego en la pantalla del arcade
 const host=box('game',810,271,67,55),c=document.createElement('canvas');c.width=56;c.height=46;host.appendChild(c);
 const x=c.getContext('2d'),GW=56,GH=46,COL=['#ff4fd8','#ffd43b','#4dff88'],SP=[10,31,21,27];
 const stars=Array.from({length:14},()=>[Math.random()*GW|0,Math.random()*GH|0]);
 let al,ox,oy,dir,ship=28,bul,boom=[],tick=0,wait=0;
 const reset=()=>{al=[];for(let r=0;r<3;r++)for(let q=0;q<5;q++)al.push({r,q,on:true});ox=3;oy=5;dir=1;bul=null;wait=0};
 reset();
 function step(){
  tick++;
  if(wait){if(--wait===0)reset();return}
  if(tick%3===0){ox+=dir;if(ox>GW-2-37||ox<2){dir=-dir;oy++;ox+=dir}if(oy>16)reset()}
  const live=al.filter(a=>a.on);
  if(!live.length){wait=8;return}
  const cx=a=>ox+a.q*8+2,tg=live.reduce((a,b)=>Math.abs(cx(b)-ship)<Math.abs(cx(a)-ship)?b:a),tx=cx(tg);
  ship+=Math.sign(tx-ship)*Math.min(2,Math.abs(tx-ship));
  if(!bul&&Math.abs(tx-ship)<2)bul={x:Math.round(ship),y:GH-7};
  if(bul){
   bul.y-=4;
   const hit=live.filter(a=>{const ax=ox+a.q*8,ay=oy+a.r*7;return bul.x>=ax&&bul.x<ax+5&&bul.y>=ay&&bul.y<ay+4}).sort((a,b)=>b.r-a.r)[0];
   if(hit){hit.on=false;boom.push({x:cx(hit),y:oy+hit.r*7+2,t:4});bul=null}else if(bul.y<0)bul=null;
  }
 }
 function draw(){
  x.fillStyle='#0a0f2e';x.fillRect(0,0,GW,GH);
  x.fillStyle='#6b78c9';stars.forEach(([a,b])=>x.fillRect(a,(b+(tick>>2))%GH,1,1));
  al.forEach(a=>{if(!a.on)return;x.fillStyle=COL[a.r];SP.forEach((row,j)=>{for(let i=0;i<5;i++)if(row>>(4-i)&1)x.fillRect(ox+a.q*8+i,oy+a.r*7+j,1,1)})});
  x.fillStyle='#fff';[[2,0],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[3,2],[4,2]].forEach(([i,j])=>x.fillRect(Math.round(ship)-2+i,GH-5+j,1,1));
  if(bul){x.fillStyle='#ffe66b';x.fillRect(bul.x,bul.y,1,3)}
  boom=boom.filter(e=>e.t-->0);boom.forEach(e=>{x.fillStyle=e.t%2?'#fff':'#ff9a3c';x.fillRect(e.x-2,e.y-1,5,1);x.fillRect(e.x-1,e.y-2,3,3)});
 }
 draw();
 setInterval(()=>{step();draw()},110);
})();
[[372,100],[497,152],[880,152],[1052,98]].forEach(([x,y],i)=>box('lamp',x-90,y-60,180,150,stage,`animation-delay:-${i*1.3}s`)); // lámparas
[[905,425],[928,458],[872,482],[952,470],[890,448]].forEach(([x,y],i)=>box('spark',x,y,14,14,stage,`animation-delay:-${i*.55}s`)); // monedas

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