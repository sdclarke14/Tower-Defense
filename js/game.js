(()=>{
const W=960,H=540,INK='#2a1810',TAU=Math.PI*2;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const RES=Math.min(2,Math.max(1,window.devicePixelRatio||1));
const COARSE=matchMedia('(pointer:coarse)').matches;
cv.width=Math.round(W*RES);cv.height=Math.round(H*RES);
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const dist=(a,b,c,d)=>Math.hypot(a-c,b-d);
function rng(s){return()=>(s=(s*1664525+1013904223)>>>0)/4294967296}

/* ---------- map ---------- */
const PATH=[[-40,110],[200,110],[200,280],[430,280],[430,130],[680,130],[680,400],[790,400]];
const CUM=[0];for(let i=1;i<PATH.length;i++)CUM.push(CUM[i-1]+dist(PATH[i][0],PATH[i][1],PATH[i-1][0],PATH[i-1][1]));
const PLEN=CUM[CUM.length-1];
const CASTLE={x:865,y:405};
const FSTART=[-40,50],FLEN=dist(FSTART[0],FSTART[1],CASTLE.x-60,CASTLE.y-30);
function pathAt(d){d=clamp(d,0,PLEN);let i=1;while(i<CUM.length-1&&CUM[i]<d)i++;const t=(d-CUM[i-1])/(CUM[i]-CUM[i-1]||1);return[lerp(PATH[i-1][0],PATH[i][0],t),lerp(PATH[i-1][1],PATH[i][1],t)]}
function flyAt(d){const t=clamp(d/FLEN,0,1);return[lerp(FSTART[0],CASTLE.x-60,t),lerp(FSTART[1],CASTLE.y-30,t)]}
const PS=[];for(let d=0;d<=PLEN;d+=6)PS.push(pathAt(d));
function nearestPath(x,y){let b=1e9,bp=PS[0];for(const p of PS){const q=dist(x,y,p[0],p[1]);if(q<b){b=q;bp=p}}return{d:b,p:bp}}
const SLOTS=[[112,196],[312,200],[322,362],[122,356],[540,206],[560,58],[596,338],[772,252],[742,472]];

/* ---------- static background ---------- */
const bg=document.createElement('canvas');bg.width=Math.round(W*RES);bg.height=Math.round(H*RES);
function tree(b,x,y,s,r){b.save();b.translate(x,y);b.lineWidth=2.5;b.strokeStyle=INK;b.fillStyle='rgba(0,0,0,.18)';b.beginPath();b.ellipse(0,4,22*s,8*s,0,0,TAU);b.fill();
  b.fillStyle='#6b4423';b.beginPath();b.roundRect(-5*s,-18*s,10*s,22*s,3);b.fill();b.stroke();
  const cols=['#3f8a34','#4c9e3c','#5db346'];
  [[-12,-30,17],[12,-30,17],[0,-44,19]].forEach((c,i)=>{b.fillStyle=cols[i%3];b.beginPath();b.arc(c[0]*s,c[1]*s,c[2]*s,0,TAU);b.fill();b.stroke()});
  b.fillStyle='rgba(255,255,255,.18)';b.beginPath();b.arc(-6*s,-48*s,7*s,0,TAU);b.fill();b.restore()}
function buildBG(){const b=bg.getContext('2d');b.scale(RES,RES);const r=rng(11);
  const g=b.createLinearGradient(0,0,0,H);g.addColorStop(0,'#74b34a');g.addColorStop(1,'#5a9a3a');b.fillStyle=g;b.fillRect(0,0,W,H);
  for(let i=0;i<90;i++){b.fillStyle=r()<.5?'rgba(40,110,40,.16)':'rgba(190,230,110,.14)';b.beginPath();b.ellipse(r()*W,r()*H,20+r()*60,12+r()*30,0,0,TAU);b.fill()}
  b.lineCap='round';b.lineJoin='round';
  const stroke=(w,c)=>{b.lineWidth=w;b.strokeStyle=c;b.beginPath();PATH.forEach((p,i)=>i?b.lineTo(p[0],p[1]):b.moveTo(p[0],p[1]));b.stroke()};
  stroke(66,INK);stroke(58,'#a47c48');stroke(50,'#cfa96e');stroke(34,'#dcb97d');
  for(let i=0;i<260;i++){const p=PS[Math.floor(r()*PS.length)];const x=p[0]+(r()-.5)*44,y=p[1]+(r()-.5)*44;b.fillStyle=r()<.5?'#b38c56':'#e8cd97';b.beginPath();b.ellipse(x,y,1.5+r()*3,1+r()*2,0,0,TAU);b.fill()}
  for(let i=0;i<400;i++){const x=r()*W,y=r()*H;if(nearestPath(x,y).d<40)continue;b.strokeStyle='#3d8434';b.lineWidth=1.6;b.beginPath();b.moveTo(x,y);b.lineTo(x-3,y-6);b.moveTo(x,y);b.lineTo(x+3,y-7);b.stroke()}
  for(let i=0;i<70;i++){const x=r()*W,y=r()*H;if(nearestPath(x,y).d<38)continue;b.fillStyle=['#fff','#ffd94a','#ff8fb0'][i%3];b.beginPath();b.arc(x,y,2.2,0,TAU);b.fill()}
  const trees=[];let tries=0;
  while(trees.length<26&&tries++<800){const x=r()*W,y=40+r()*(H-30);if(nearestPath(x,y).d<62)continue;if(SLOTS.some(s=>dist(x,y,s[0],s[1])<58))continue;if(dist(x,y,CASTLE.x,CASTLE.y)<120)continue;if(trees.some(t=>dist(x,y,t[0],t[1])<40))continue;trees.push([x,y])}
  trees.sort((a,b)=>a[1]-b[1]).forEach(t=>tree(b,t[0],t[1],.8+r()*.4));
  for(let i=0;i<14;i++){const x=r()*W,y=r()*H;if(nearestPath(x,y).d<48||SLOTS.some(s=>dist(x,y,s[0],s[1])<44))continue;b.lineWidth=2.5;b.strokeStyle=INK;b.fillStyle='#9a9a94';b.beginPath();b.ellipse(x,y,10,7,0,0,TAU);b.fill();b.stroke();b.fillStyle='#bdbdb6';b.beginPath();b.ellipse(x-3,y-2,4,2.5,0,0,TAU);b.fill()}
  const v=b.createRadialGradient(W/2,H/2,H*.4,W/2,H/2,H*.95);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(20,10,0,.35)');b.fillStyle=v;b.fillRect(0,0,W,H)}
buildBG();

/* ---------- data ---------- */
const ET={
  goblin:{hp:32,spd:58,armor:0,mres:0,gold:6,lives:1,atk:3,s:1},
  wolf:{hp:28,spd:100,armor:0,mres:0,gold:7,lives:1,atk:4,s:1},
  orc:{hp:120,spd:38,armor:.45,mres:0,gold:14,lives:2,atk:9,s:1},
  bat:{hp:42,spd:72,armor:0,mres:0,gold:10,lives:1,atk:0,s:1,fly:1},
  shaman:{hp:70,spd:42,armor:0,mres:.5,gold:16,lives:2,atk:3,s:1},
  troll:{hp:1100,spd:27,armor:.35,mres:.2,gold:120,lives:10,atk:28,s:1.9}
};
const WAVES=[
  [['goblin',8,.9]],
  [['goblin',9,.8],['wolf',4,.7]],
  [['goblin',6,.8],['orc',4,1.6]],
  [['wolf',9,.6],['bat',5,.9]],
  [['goblin',8,.7],['orc',5,1.5],['shaman',2,2]],
  [['bat',9,.7],['wolf',8,.6],['orc',4,1.4]],
  [['goblin',12,.5],['orc',7,1.3],['shaman',4,1.8]],
  [['bat',12,.6],['wolf',12,.5],['orc',6,1.2]],
  [['orc',9,1.1],['shaman',5,1.6],['wolf',10,.5],['bat',8,.7]],
  [['goblin',16,.4],['shaman',4,1.5],['orc',8,1],['troll',1,1]]
];
const TS={
  archer:{name:'Archer',col:'#9a6b3a',cost:[100,90,130],dmg:[7,12,20],rng:[140,155,172],cd:[.7,.6,.5]},
  mage:{name:'Mage',col:'#7a52c8',cost:[150,130,170],dmg:[18,32,56],rng:[128,142,158],cd:[1.3,1.2,1.1]},
  cannon:{name:'Cannon',col:'#6b707a',cost:[170,150,190],dmg:[22,38,62],rng:[150,164,178],cd:[2.1,1.95,1.8],splash:55},
  barracks:{name:'Barracks',col:'#c64b3b',cost:[120,100,130],hp:[45,70,105],dmg:[3,5,8],rng:[0,0,0]}
};

/* ---------- state ---------- */
let G,mouse={x:0,y:0};
function reset(){G={gold:280,lives:20,wave:0,timer:12,t:0,enemies:[],soldiers:[],towers:[],proj:[],parts:[],texts:[],spawnQ:[],sel:null,spell:null,cd:{fire:0,reinf:0},shake:0,hitFlash:0,speed:1,paused:false,over:null,running:false}}
reset();
const toast=(x,y,txt,col='#f4b73a')=>G.texts.push({x,y,txt,col,life:1.1});
function puff(x,y,n,col,sp=60,life=.5,r=4,grav=0){for(let i=0;i<n;i++){const a=Math.random()*TAU,s=Math.random()*sp;G.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-20,life:life*(.6+Math.random()*.6),max:life,r:r*(.6+Math.random()*.8),col,grav})}}

/* ---------- logic ---------- */
function startWave(early){
  if(G.wave>=10)return;
  if(early){const b=Math.max(2,Math.floor(G.timer/2));G.gold+=b;toast(120,H-20,'+'+b+' early bonus')}
  const groups=WAVES[G.wave];G.wave++;let t=G.t+.4;
  for(const [type,n,gap] of groups){for(let i=0;i<n;i++){G.spawnQ.push({t,type});t+=gap}t+=1.4}
  G.spawnQ.sort((a,b)=>a.t-b.t);G.timer=G.wave<10?30:1e9;
}
function spawn(type){const T=ET[type];const fly=!!T.fly;const p=fly?flyAt(0):pathAt(0);
  G.enemies.push({type,fly,hp:T.hp,max:T.hp,d:0,x:p[0],y:p[1],face:1,phase:Math.random()*6,flash:0,blocker:null,atkT:.6,dead:false,deadT:0,healT:2,stopped:false,hov:Math.random()*6})}
function hurt(e,amt,magic){if(e.dead)return;const T=ET[e.type];amt*=1-(magic?T.mres:T.armor);e.hp-=amt;e.flash=.09;
  if(e.hp<=0){e.dead=true;e.deadT=0;G.gold+=T.gold;toast(e.x,e.y-30,'+'+T.gold);puff(e.x,e.y-12,10,'#e9e2d0',70,.5,5)}}
function addTower(slot,type){const t={slot,type,lvl:1,cd:.3,recoil:0,ang:0,spent:TS[type].cost[0],pulse:Math.random()*6,soldiers:[]};
  G.towers.push(t);if(type==='barracks')setupBarracks(t);return t}
function setupBarracks(t){const s=SLOTS[t.slot];const n=nearestPath(s[0],s[1]).p;
  const offs=[[-16,8],[16,8],[0,-12]];
  if(!t.soldiers.length){for(let i=0;i<3;i++){const so={x:s[0],y:s[1]+8,hx:n[0]+offs[i][0],hy:n[1]+offs[i][1],hp:1,max:1,dmg:3,tower:t,target:null,atkT:0,phase:Math.random()*6,face:1,dead:true,respawn:.4+i*.5,flash:0,swing:0,life:1e9,spd:75};t.soldiers.push(so);G.soldiers.push(so)}}
  for(const so of t.soldiers){const hp=TS.barracks.hp[t.lvl-1];so.max=hp;so.dmg=TS.barracks.dmg[t.lvl-1];if(!so.dead)so.hp=hp}}
function castFire(x,y){if(G.cd.fire>0)return;G.cd.fire=30;for(let i=0;i<7;i++){const a=Math.random()*TAU,r=Math.random()*60;G.proj.push({k:'meteor',tx:x+Math.cos(a)*r,ty:y+Math.sin(a)*r*.7,delay:i*.18,t:0,dur:.55,sx:0,sy:0})}}
function castReinf(x,y){if(G.cd.reinf>0)return;G.cd.reinf=16;const n=nearestPath(x,y).p;
  for(let i=0;i<2;i++){G.soldiers.push({x:n[0]+(i?30:-30),y:n[1]-60,hx:n[0]+(i?14:-14),hy:n[1]+4,hp:55,max:55,dmg:6,tower:null,target:null,atkT:0,phase:Math.random()*6,face:1,dead:false,respawn:0,flash:0,swing:0,life:22,spd:90,pop:.3});}
  puff(n[0],n[1],14,'#cfe8ff',80,.5,4)}

function update(dt){
  const g=G;g.t+=dt;
  for(const k in g.cd)g.cd[k]=Math.max(0,g.cd[k]-dt);
  g.shake=Math.max(0,g.shake-dt);g.hitFlash=Math.max(0,g.hitFlash-dt);
  if(g.wave<10){g.timer-=dt;if(g.timer<=0)startWave(false)}
  while(g.spawnQ.length&&g.spawnQ[0].t<=g.t)spawn(g.spawnQ.shift().type);
  // enemies
  for(const e of g.enemies){
    if(e.dead){e.deadT+=dt;continue}
    const T=ET[e.type];e.flash=Math.max(0,e.flash-dt);
    if(e.blocker&&(e.blocker.dead||e.blocker.target!==e))e.blocker=null;
    let stopped=false;
    if(e.blocker){const b=e.blocker;if(dist(b.x,b.y,e.x,e.y)<34){stopped=true;e.atkT-=dt;if(e.atkT<=0){e.atkT=1.1;b.hp-=T.atk;b.flash=.1;puff(b.x,b.y-14,3,'#ffd27a',50,.25,2)}}}
    e.stopped=stopped;
    if(!stopped){const ox=e.x;e.d+=T.spd*dt;const p=e.fly?flyAt(e.d):pathAt(e.d);e.x=p[0];e.y=p[1];if(Math.abs(e.x-ox)>.01)e.face=e.x>=ox?1:-1;e.phase+=dt*T.spd*.14}
    else e.phase+=dt*9;
    e.hov+=dt*7;
    if(e.type==='shaman'){e.healT-=dt;if(e.healT<=0){e.healT=2.2;let any=false;for(const o of g.enemies){if(!o.dead&&o!==e&&o.hp<o.max&&dist(o.x,o.y,e.x,e.y)<95){o.hp=Math.min(o.max,o.hp+14);any=true;puff(o.x,o.y-20,3,'#8dff7a',25,.6,2.5)}}if(any)puff(e.x,e.y-30,8,'#8dff7a',45,.7,3)}}
    if((e.fly?e.d>=FLEN:e.d>=PLEN)){e.dead=true;e.deadT=9;e.reached=true;g.lives-=T.lives;g.shake=.4;g.hitFlash=.35;try{navigator.vibrate&&navigator.vibrate(45)}catch(_){}toast(CASTLE.x-40,CASTLE.y-70,'-'+T.lives,'#ff6a55');puff(CASTLE.x-50,CASTLE.y-20,12,'#d8c9a8',80,.5,5);
      if(g.lives<=0){g.lives=0;endGame(false)}}
  }
  g.enemies=g.enemies.filter(e=>!(e.dead&&e.deadT>.45));
  // soldiers
  for(const s of g.soldiers){
    s.flash=Math.max(0,s.flash-dt);s.swing=Math.max(0,s.swing-dt*3);if(s.pop)s.pop=Math.max(0,s.pop-dt);
    if(s.dead){if(s.tower){s.respawn-=dt;if(s.respawn<=0){s.dead=false;s.hp=s.max;const sl=SLOTS[s.tower.slot];s.x=sl[0];s.y=sl[1]+8;puff(s.x,s.y,5,'#e8e0cc',40,.3,3)}}continue}
    s.life-=dt;if(s.hp<=0||s.life<=0){s.dead=true;s.target=null;s.respawn=9;puff(s.x,s.y-10,8,'#e9e2d0',60,.4,4);continue}
    if(s.target&&(s.target.dead||s.target.fly))s.target=null;
    if(!s.target){let best=null,bd=95;for(const e of g.enemies){if(e.dead||e.fly||(e.blocker&&e.blocker!==s))continue;const q=dist(e.x,e.y,s.hx,s.hy);if(q<bd){bd=q;best=e}}
      if(best){s.target=best;best.blocker=s}}
    let tx=s.hx,ty=s.hy,moving=false;
    if(s.target){tx=s.target.x-s.target.face*18;ty=s.target.y+2}
    const dd=dist(s.x,s.y,tx,ty);
    if(dd>3){const sp=s.spd*dt;s.x+=(tx-s.x)/dd*Math.min(sp,dd);s.y+=(ty-s.y)/dd*Math.min(sp,dd);moving=true;s.phase+=dt*10;if(Math.abs(tx-s.x)>1)s.face=tx>s.x?1:-1}
    if(s.target&&dist(s.x,s.y,s.target.x,s.target.y)<30){s.face=s.target.x>=s.x?1:-1;s.atkT-=dt;if(s.atkT<=0){s.atkT=.9;s.swing=1;hurt(s.target,s.dmg,false);puff(s.target.x,s.target.y-16,3,'#fff6c8',50,.2,2)}}
    if(!moving)s.phase*=.9;
  }
  g.soldiers=g.soldiers.filter(s=>s.tower||(!s.dead&&s.life>0));
  // towers
  for(const t of g.towers){t.cd-=dt;t.recoil=Math.max(0,t.recoil-dt*4);t.pulse+=dt*3;
    if(t.type==='barracks')continue;
    const S=TS[t.type],sl=SLOTS[t.slot],R=S.rng[t.lvl-1];let tg=null;
    for(const e of g.enemies){if(e.dead)continue;if(t.type==='cannon'&&e.fly)continue;if(dist(sl[0],sl[1]-20,e.x,e.y)<=R&&(!tg||e.d>tg.d))tg=e}
    if(tg){t.ang=Math.atan2(tg.y-(sl[1]-30),tg.x-sl[0]);
      if(t.cd<=0){t.cd=S.cd[t.lvl-1];t.recoil=1;const dmg=S.dmg[t.lvl-1];
        if(t.type==='archer')g.proj.push({k:'arrow',x:sl[0],y:sl[1]-48,tg,dmg,sp:520,px:tg.x,py:tg.y});
        else if(t.type==='mage'){g.proj.push({k:'bolt',x:sl[0],y:sl[1]-64,tg,dmg,sp:340,px:tg.x,py:tg.y});puff(sl[0],sl[1]-64,6,'#c9a6ff',40,.3,3)}
        else{const lead=tg.fly?0:.5;const px=tg.x+tg.face*ET[tg.type].spd*lead*(tg.stopped?0:1),py=tg.y;const dd=dist(sl[0],sl[1]-30,px,py);
          g.proj.push({k:'ball',sx:sl[0],sy:sl[1]-34,tx:px,ty:py,t:0,dur:clamp(dd/260,.4,1),dmg});puff(sl[0]+Math.cos(t.ang)*26,sl[1]-34+Math.sin(t.ang)*26,8,'#8a8a8a',50,.5,5)}}}}
  // projectiles
  for(const p of g.proj){
    if(p.k==='arrow'||p.k==='bolt'){const tx=p.tg.dead?p.px:p.tg.x,ty=p.tg.dead?p.py:p.tg.y-(p.tg.fly?44:16);if(!p.tg.dead){p.px=p.tg.x;p.py=p.tg.y}
      const dd=dist(p.x,p.y,tx,ty),st=p.sp*dt;p.a=Math.atan2(ty-p.y,tx-p.x);
      if(dd<=st+6){p.done=true;if(!p.tg.dead){hurt(p.tg,p.dmg,p.k==='bolt');puff(tx,ty,p.k==='bolt'?8:4,p.k==='bolt'?'#c9a6ff':'#fff2c0',50,.3,3)}}
      else{p.x+=Math.cos(p.a)*st;p.y+=Math.sin(p.a)*st;if(p.k==='bolt')g.parts.push({x:p.x,y:p.y,vx:0,vy:0,life:.3,max:.3,r:4,col:'#b48bff',grav:0})}}
    else if(p.k==='ball'){p.t+=dt;const k=Math.min(1,p.t/p.dur);p.x=lerp(p.sx,p.tx,k);p.y=lerp(p.sy,p.ty,k)-Math.sin(k*Math.PI)*70;p.gy=lerp(p.sy,p.ty,k);
      if(k>=1){p.done=true;g.shake=Math.max(g.shake,.08);puff(p.tx,p.ty,16,'#ffb347',110,.45,6);puff(p.tx,p.ty,10,'#6a5a4a',70,.6,6);
        g.parts.push({x:p.tx,y:p.ty,vx:0,vy:0,life:.3,max:.3,r:TS.cannon.splash,col:'ring',grav:0});
        for(const e of g.enemies)if(!e.dead&&!e.fly&&dist(e.x,e.y,p.tx,p.ty)<TS.cannon.splash)hurt(e,p.dmg,false)}}
    else if(p.k==='meteor'){p.delay-=dt;if(p.delay>0)continue;p.t+=dt;const k=Math.min(1,p.t/p.dur);p.x=lerp(p.tx+260,p.tx,k);p.y=lerp(p.ty-420,p.ty,k);
      if(k>=1){p.done=true;g.shake=Math.max(g.shake,.12);puff(p.tx,p.ty,22,'#ff9a2e',130,.6,7);puff(p.tx,p.ty,12,'#ffe27a',90,.4,5);puff(p.tx,p.ty,8,'#3a2a22',60,.8,7);
        g.parts.push({x:p.tx,y:p.ty,vx:0,vy:0,life:.35,max:.35,r:48,col:'ring',grav:0});
        for(const e of g.enemies)if(!e.dead&&dist(e.x,e.y,p.tx,p.ty)<48)hurt(e,48,true)}}
  }
  g.proj=g.proj.filter(p=>!p.done);
  for(const p of g.parts){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.grav||0)*dt;p.vx*=.96}
  g.parts=g.parts.filter(p=>p.life>0);
  for(const x of g.texts){x.life-=dt;x.y-=22*dt}g.texts=g.texts.filter(x=>x.life>0);
  if(g.wave>=10&&!g.spawnQ.length&&!g.enemies.some(e=>!e.dead)&&!g.over)endGame(true);
}

/* ---------- drawing helpers ---------- */
let FL=false;const C=c=>FL?'#fff':c;
function P(){ctx.lineWidth=2.5;ctx.strokeStyle=INK;ctx.lineJoin='round';ctx.lineCap='round'}
function E(x,y,rx,ry,f,rot=0){ctx.beginPath();ctx.ellipse(x,y,Math.abs(rx),Math.abs(ry),rot,0,TAU);ctx.fillStyle=C(f);ctx.fill();ctx.stroke()}
function Ci(x,y,r,f){E(x,y,r,r,f)}
function Poly(pts,f){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=C(f);ctx.fill();ctx.stroke()}
function R(x,y,w,h,f,r=3){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=C(f);ctx.fill();ctx.stroke()}
function Ln(x1,y1,x2,y2,w,c){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineWidth=w+3;ctx.strokeStyle=INK;ctx.stroke();ctx.lineWidth=w;ctx.strokeStyle=C(c);ctx.stroke();P()}
function eyes(x,y,sp=4,r=3.2,angry=1){for(const s of[-1,1]){E(x+s*sp,y,r,r*1.25,'#fff');ctx.fillStyle=FL?'#fff':INK;ctx.beginPath();ctx.arc(x+s*sp+1,y+.6,1.4,0,TAU);ctx.fill()}
  if(angry){ctx.lineWidth=2.2;ctx.strokeStyle=FL?'#fff':INK;ctx.beginPath();ctx.moveTo(x-sp-r-1,y-r-2.5);ctx.lineTo(x-1,y-r+.5);ctx.moveTo(x+sp+r+1,y-r-2.5);ctx.lineTo(x+1,y-r+.5);ctx.stroke();P()}}
function shadow(x,y,rx,ry){ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill()}

/* ---------- enemies ---------- */
function drawEnemy(e){
  const T=ET[e.type];ctx.save();ctx.translate(e.x,e.y);
  let a=1,sx=1,sy=1;
  if(e.dead){const k=Math.min(1,e.deadT/.45);a=1-k;sx=1+k*.35;sy=1-k*.6}
  ctx.globalAlpha=a;
  shadow(0,0,(e.fly?10:13)*T.s*(e.fly?.8:1),4.5*T.s*(e.fly?.8:1));
  ctx.scale(e.face*sx,sy);FL=e.flash>0&&!e.dead;P();
  const ph=e.phase,bob=Math.abs(Math.sin(ph))*3,sw=Math.sin(ph)*6;
  const atk=e.stopped?Math.sin(e.phase)*.9:sw*.05;
  ctx.scale(T.s,T.s);
  switch(e.type){
  case 'goblin':{
    E(-5+sw*.6,-4,4,5,'#5a8a2c');E(5-sw*.6,-4,4,5,'#5a8a2c');ctx.translate(0,-bob);
    E(0,-14,8,9,'#7bbf3a');R(-8,-12,16,4,'#6b4a2b',2);
    ctx.save();ctx.translate(7,-16);ctx.rotate(-.7+atk);Ln(0,0,9,0,3.5,'#7bbf3a');Poly([[9,-2.5],[20,0],[9,2.5]],'#d4dde2');ctx.restore();
    Poly([[-8,-29],[-21,-34+Math.sin(ph*2)*1.5],[-8,-22]],'#7bbf3a');Poly([[8,-29],[21,-34+Math.sin(ph*2)*1.5],[8,-22]],'#7bbf3a');
    Ci(0,-27,10,'#90d34c');eyes(1,-28,4,3);ctx.beginPath();ctx.moveTo(-3,-21);ctx.lineTo(4,-21);ctx.stroke();break}
  case 'wolf':{
    const g=Math.sin(ph*1.6)*7;
    E(-12+g,-4,3.5,6,'#6e7480');E(12-g,-4,3.5,6,'#6e7480');
    ctx.save();ctx.translate(0,-bob*.8);
    Poly([[-15,-14],[-30,-22+Math.sin(ph)*3],[-16,-8]],'#8b919c');
    E(0,-14,17,9,'#9aa1ad');E(-3,-11,9,4,'#c3c8d0');
    E(-8-g*.5,-4,3.5,6,'#7c828e');E(8+g*.5,-4,3.5,6,'#7c828e');
    Poly([[12,-27],[16,-37],[20,-27]],'#9aa1ad');Ci(16,-21,9,'#a9afba');E(25,-18,6,4,'#8b919c');Ci(30,-19,1.8,'#222');eyes(15,-23,3,2.4);
    if(e.stopped){ctx.beginPath();ctx.moveTo(24,-15);ctx.lineTo(30,-13);ctx.stroke()}
    ctx.restore();break}
  case 'orc':case 'troll':{
    const tr=e.type==='troll',skin=tr?'#8a6a4a':'#5e9a3a',dk=tr?'#6e5238':'#4a7d2d';
    E(-7+sw*.5,-5,5.5,6,dk);E(7-sw*.5,-5,5.5,6,dk);ctx.translate(0,-bob);
    E(0,-22,14,15,skin);R(-14,-18,28,6,'#5b3b20',2);if(!tr){Poly([[-12,-30],[0,-24],[12,-30],[10,-14],[-10,-14]],'#8b8f99')}else{E(0,-14,5,3,dk)}
    ctx.save();ctx.translate(12,-26);ctx.rotate(-.9+atk*1.1);Ln(0,0,14,0,4.5,skin);R(12,-6,16,12,'#6b4423',4);ctx.restore();
    E(-14,-22+sw*.15,5,6,skin);
    Ci(0,-41,11,skin);Poly([[-5,-36],[-4,-30],[-1,-36]],'#f4efe0');Poly([[5,-36],[4,-30],[1,-36]],'#f4efe0');eyes(0,-42,4.5,3,1);
    if(tr){Poly([[-9,-49],[-15,-60],[-4,-51]],'#e8dfc8');Poly([[9,-49],[15,-60],[4,-51]],'#e8dfc8')}
    else R(-10,-52,20,5,'#8b8f99',2);break}
  case 'bat':{
    ctx.translate(0,-46+Math.sin(e.hov)*5);const f=Math.sin(e.phase*2.2);
    for(const s of[-1,1]){ctx.save();ctx.scale(s,1);ctx.rotate(-.15);ctx.scale(1,.35+Math.abs(f)*.75);Poly([[4,-2],[20,-14],[34,-6],[28,0],[20,-3],[14,4],[8,2]],'#6a4a8c');ctx.restore()}
    E(0,0,8,9,'#7d5aa3');Poly([[-6,-7],[-6,-16],[-1,-9]],'#7d5aa3');Poly([[6,-7],[6,-16],[1,-9]],'#7d5aa3');
    for(const s of[-1,1]){E(s*3.2,-2,2.4,3,'#fff');ctx.fillStyle=FL?'#fff':'#d22';ctx.beginPath();ctx.arc(s*3.2,-1.5,1.3,0,TAU);ctx.fill()}
    ctx.beginPath();ctx.moveTo(-3,4);ctx.lineTo(0,6);ctx.lineTo(3,4);ctx.stroke();break}
  case 'shaman':{
    E(-4+sw*.4,-3,4,4,'#3a2a50');E(4-sw*.4,-3,4,4,'#3a2a50');ctx.translate(0,-bob*.6);
    Poly([[-12,-3],[-8,-27],[8,-27],[12,-3]],'#8a4fc2');R(-9,-17,18,3,'#e5c15a',1);
    ctx.save();ctx.translate(12,-14);ctx.rotate(.15+Math.sin(ph*.5)*.05);Ln(0,8,0,-24,3,'#7a5230');
    const pl=.5+.5*Math.sin(e.hov*.8);ctx.fillStyle='rgba(120,255,110,'+(.25+.25*pl)+')';ctx.beginPath();ctx.arc(0,-28,10+pl*3,0,TAU);ctx.fill();Ci(0,-28,5,'#8dff7a');ctx.restore();
    Ci(0,-33,10,'#8fc25a');Poly([[-12,-30],[-10,-46],[0,-50],[10,-46],[12,-30],[0,-36]],'#6a3a9a');
    for(const s of[-1,1]){E(s*3.5,-33,2.5,3.2,'#fff');ctx.fillStyle=FL?'#fff':INK;ctx.beginPath();ctx.arc(s*3.5+.8,-32.5,1.2,0,TAU);ctx.fill()}
    break}
  }
  FL=false;ctx.restore();
  if(!e.dead&&e.hp<e.max){const w=(e.type==='troll'?54:26),y=e.fly?-72:-(e.type==='orc'?64:e.type==='shaman'?58:e.type==='wolf'?44:44)*(e.type==='troll'?1.9:1);
    const x=e.x-w/2,yy=e.y+y;ctx.fillStyle=INK;ctx.fillRect(x-1.5,yy-1.5,w+3,7);ctx.fillStyle='#5a1a14';ctx.fillRect(x,yy,w,4);ctx.fillStyle=e.hp/e.max>.4?'#7fd04a':'#f0a030';ctx.fillRect(x,yy,w*Math.max(0,e.hp/e.max),4)}
}

/* ---------- soldiers ---------- */
function drawSoldier(s){
  ctx.save();ctx.translate(s.x,s.y);
  let sc=1;if(s.pop)sc=1+s.pop*1.2;
  shadow(0,0,9,3.5);ctx.scale(s.face*sc,sc);FL=s.flash>0;P();
  const ph=s.phase,sw=Math.sin(ph)*4,bob=Math.abs(Math.sin(ph))*1.6;
  E(-3+sw,-3,3,4,'#6a6f78');E(3-sw,-3,3,4,'#6a6f78');ctx.translate(0,-bob);
  E(0,-11,7,8,s.tower?'#3f7fd0':'#3fae6a');R(-6,-9,12,3,'#5b3b20',1);
  ctx.save();ctx.translate(5,-13);ctx.rotate(-.9+(s.swing>0?(1-s.swing)*2.2:0));Ln(0,0,4,0,3,'#e6c4a0');Ln(4,0,15,0,2.5,'#dfe6ea');Ln(4,-3.5,4,3.5,2.5,'#a67c3a');ctx.restore();
  Poly([[-9,-17],[-3,-17],[-2,-5],[-6,-2],[-10,-5]],s.tower?'#e05a46':'#e2b53a');
  Ci(0,-22,7,'#f2caa0');ctx.beginPath();ctx.arc(0,-23,7.4,Math.PI,TAU);ctx.fillStyle=C('#9aa3ad');ctx.fill();ctx.stroke();
  Poly([[-1.5,-30],[1.5,-30],[1,-36],[-1,-36]],'#e05a46');
  ctx.fillStyle=FL?'#fff':INK;ctx.beginPath();ctx.arc(3,-21,1.1,0,TAU);ctx.fill();
  FL=false;ctx.restore();
  if(s.hp<s.max){const w=18,x=s.x-w/2,y=s.y-42;ctx.fillStyle=INK;ctx.fillRect(x-1.5,y-1.5,w+3,6);ctx.fillStyle='#5a1a14';ctx.fillRect(x,y,w,3);ctx.fillStyle='#5ab3ff';ctx.fillRect(x,y,w*Math.max(0,s.hp/s.max),3)}
}

/* ---------- towers & castle ---------- */
function drawPad(i,hot){const s=SLOTS[i];ctx.save();ctx.translate(s[0],s[1]);P();shadow(0,6,26,9);
  E(0,2,24,11,'#8c877f');E(0,-1,22,9.5,'#b7b1a6');
  for(let k=0;k<6;k++){const a=k/6*TAU;ctx.fillStyle='#9d978c';ctx.beginPath();ctx.arc(Math.cos(a)*16,Math.sin(a)*6.5-1,2.4,0,TAU);ctx.fill()}
  if(hot){const p=.5+.5*Math.sin(G.t*4);ctx.globalAlpha=.55+.4*p;ctx.strokeStyle='#ffe38a';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(0,-1,15,6,0,0,TAU);ctx.stroke();ctx.fillStyle='#ffe38a';ctx.fillRect(-1.5,-5,3,8);ctx.fillRect(-4,-2.5,8,3)}
  ctx.restore()}
function drawTower(t){
  const s=SLOTS[t.slot],L=t.lvl;ctx.save();ctx.translate(s[0],s[1]);P();shadow(0,6,28,10);
  E(0,2,23,10,'#8c877f');R(-18,-12,36,16,'#b7b1a6',4);
  ctx.strokeStyle='#8c877f';ctx.lineWidth=1.5;for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(k*10,-12);ctx.lineTo(k*10,4);ctx.stroke()}P();
  const rc=t.recoil;
  if(t.type==='archer'){
    const h=26+L*8;R(-14,-12-h,28,h,'#a8773f',3);ctx.strokeStyle='#7a5128';ctx.lineWidth=1.5;for(let k=-1;k<=1;k+=1){ctx.beginPath();ctx.moveTo(k*7,-12-h);ctx.lineTo(k*7,-12);ctx.stroke()}P();
    R(-18,-20-h,36,9,'#7a5128',2);for(let k=-1;k<=1;k++)R(k*12-4,-27-h,8,8,'#8a6232',1);
    Poly([[-20,-24-h],[0,-48-h-L*2],[20,-24-h]],L>1?'#c64b3b':'#b4552f');if(L>2){Ci(0,-52-h,3,'#f4b73a')}
    const ay=-12-h-8;ctx.save();ctx.translate(0,ay+rc*2);Ci(0,-6,6,'#f2caa0');ctx.beginPath();ctx.arc(0,-7,6.4,Math.PI,TAU);ctx.fillStyle='#4a9a3a';ctx.fill();ctx.stroke();Poly([[-5,-7],[0,-14],[5,-7]],'#4a9a3a');
    ctx.rotate(Math.cos(t.ang)<0?Math.PI-0:0);const bx=Math.cos(t.ang)<0?-1:1;ctx.restore();
    ctx.save();ctx.translate(Math.cos(t.ang)<0?-8:8,ay);ctx.scale(Math.cos(t.ang)<0?-1:1,1);ctx.strokeStyle=INK;ctx.lineWidth=5.5;ctx.beginPath();ctx.arc(-2-rc*3,0,10,-1.2,1.2);ctx.stroke();ctx.strokeStyle='#c98e4a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(-2-rc*3,0,10,-1.2,1.2);ctx.stroke();ctx.restore();P();
  }else if(t.type==='mage'){
    const h=34+L*9;Poly([[-15,-12],[-11,-12-h],[11,-12-h],[15,-12]],'#7f6fb0');ctx.strokeStyle='#5d4e8c';ctx.lineWidth=1.5;for(let k=1;k<=3;k++){const y=-12-h*k/4;ctx.beginPath();ctx.moveTo(-13+k,y);ctx.lineTo(13-k,y);ctx.stroke()}P();
    R(-5,-28,10,16,'#3a2a50',4);E(0,-28,5,3,'#3a2a50');
    Poly([[-17,-12-h],[17,-12-h],[0,-12-h-18]],'#5a3ea0');Poly([[-19,-12-h],[19,-12-h],[14,-9-h],[-14,-9-h]],'#6f50bd');
    if(L>1)for(const sx of[-1,1])Poly([[sx*11,-12-h],[sx*21,-18-h],[sx*14,-8-h]],'#5a3ea0');
    const oy=-12-h-34-Math.sin(t.pulse)*3-rc*3,gl=.5+.5*Math.sin(t.pulse*1.3)+rc;ctx.fillStyle='rgba(180,130,255,'+(.2+.2*gl)+')';ctx.beginPath();ctx.arc(0,oy,11+gl*3,0,TAU);ctx.fill();Ci(0,oy,6+L*.6,rc>.3?'#fff':'#c9a6ff');
    for(let k=0;k<L;k++){const a=t.pulse*.9+k*TAU/L;Ci(Math.cos(a)*14,oy+Math.sin(a)*4,2,'#fff')}
  }else if(t.type==='cannon'){
    const h=18+L*6;R(-17,-12-h,34,h,'#7d828c',5);ctx.strokeStyle='#5a5f68';ctx.lineWidth=1.5;for(let k=0;k<3;k++){const y=-12-h*(k+1)/4;ctx.beginPath();ctx.moveTo(-16,y);ctx.lineTo(16,y);ctx.stroke()}P();
    R(-20,-18-h,40,8,'#5a5f68',2);for(let k=-2;k<=2;k++)R(k*8-3,-24-h,6,7,'#6b707a',1);
    ctx.save();ctx.translate(0,-24-h);const ang=t.ang;ctx.rotate(Math.cos(ang)<0?Math.PI-Math.atan2(Math.sin(ang),-Math.cos(ang)):Math.atan2(Math.sin(ang),Math.cos(ang)));
    if(Math.cos(ang)<0){ctx.restore();ctx.save();ctx.translate(0,-24-h);ctx.rotate(ang)}
    ctx.translate(-rc*6,0);R(-4,-7,26+L*3,14,'#3d4047',5);R(18+L*3,-9,8,18,'#2b2d33',3);ctx.restore();
    Ci(0,-24-h,7,'#3d4047');
    if(L>1)for(const sx of[-1,1])Ci(sx*14,-12-h*.4,3,'#f4b73a');
  }else{
    const w=24+L*3;R(-w,-34-L*4,w*2,26+L*4,'#c8b79a',4);ctx.strokeStyle='#9d8e74';ctx.lineWidth=1.5;for(let k=0;k<4;k++){const y=-34-L*4+k*(26+L*4)/4;ctx.beginPath();ctx.moveTo(-w+1,y);ctx.lineTo(w-1,y);ctx.stroke()}P();
    Poly([[-w-5,-34-L*4],[0,-56-L*5],[w+5,-34-L*4]],'#c64b3b');ctx.strokeStyle='#8c2f24';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,-56-L*5);ctx.lineTo(0,-34-L*4);ctx.moveTo(-w/2,-45-L*4);ctx.lineTo(-w/2-2,-34-L*4);ctx.moveTo(w/2,-45-L*4);ctx.lineTo(w/2+2,-34-L*4);ctx.stroke();P();
    ctx.beginPath();ctx.moveTo(-8,-8);ctx.lineTo(-8,-22);ctx.arc(0,-22,8,Math.PI,TAU);ctx.lineTo(8,-8);ctx.closePath();ctx.fillStyle='#4a2f1a';ctx.fill();ctx.stroke();
    ctx.save();ctx.translate(w-4,-56-L*5);Ln(0,0,0,-18,2.5,'#7a5230');const wv=Math.sin(G.t*5);Poly([[0,-18],[16+wv*2,-15+wv*2],[0,-8]],'#e2b53a');ctx.restore();
    for(let k=0;k<L;k++)Ci(-w+8+k*9,-34-L*4+8,2.5,'#f4b73a');
  }
  ctx.restore()}
function drawCastle(){const x=CASTLE.x,y=CASTLE.y;ctx.save();ctx.translate(x,y);
  if(G.shake>0)ctx.translate((Math.random()-.5)*5,0);P();shadow(0,32,70,14);
  FL=G.hitFlash>.2;
  const stone='#b9b2a4',stone2='#a39c8e';
  R(-62,-56,124,86,stone,4);ctx.strokeStyle=stone2;ctx.lineWidth=1.5;for(let r=0;r<5;r++){const yy=-50+r*16;ctx.beginPath();ctx.moveTo(-61,yy);ctx.lineTo(61,yy);ctx.stroke();for(let c=0;c<6;c++){const xx=-55+c*22+(r%2)*11;ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx,yy+16);ctx.stroke()}}P();
  for(const sx of[-1,1]){R(sx*58-18,-96,36,126,stone2,4);for(let k=0;k<3;k++)R(sx*58-18+k*13.5-0.5,-106,10,12,stone2,1);Poly([[sx*58-22,-96],[sx*58,-136],[sx*58+22,-96]],'#4a7fd0');
    R(sx*58-4,-76,8,16,'#2b1d12',3)}
  for(let k=0;k<5;k++)R(-40+k*17-2,-64,12,10,stone,1);
  ctx.beginPath();ctx.moveTo(-18,30);ctx.lineTo(-18,-6);ctx.arc(0,-6,18,Math.PI,TAU);ctx.lineTo(18,30);ctx.closePath();ctx.fillStyle=C('#5b3b20');ctx.fill();ctx.stroke();
  ctx.strokeStyle='#3a2410';ctx.lineWidth=1.5;for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(k*9,-22);ctx.lineTo(k*9,30);ctx.stroke()}P();
  FL=false;
  for(const sx of[-1,1]){ctx.save();ctx.translate(sx*58,-136);Ln(0,0,0,-22,2.5,'#7a5230');const wv=Math.sin(G.t*4+sx);Poly([[0,-22],[20+wv*3,-18+wv*2],[0,-8]],'#e05a46');ctx.restore()}
  ctx.restore()}

/* ---------- render ---------- */
function drawMenu(){
  const btns=menuButtons();if(!btns)return;const s=SLOTS[G.sel],t=towerAt(G.sel);
  if(t&&t.type!=='barracks'){const R_=TS[t.type].rng[t.lvl-1];ctx.save();ctx.strokeStyle='rgba(255,255,255,.75)';ctx.fillStyle='rgba(255,255,255,.12)';ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.beginPath();ctx.ellipse(s[0],s[1]-20,R_,R_*.82,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore()}
  if(t&&t.type==='barracks'){const n=nearestPath(s[0],s[1]).p;ctx.save();ctx.strokeStyle='#5ab3ff';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.arc(n[0],n[1],20,0,TAU);ctx.stroke();ctx.restore()}
  for(const b of btns){ctx.save();ctx.translate(b.x,b.y);const hov=!COARSE&&dist(mouse.x,mouse.y,b.x,b.y)<b.r;const sc=hov?1.12:1;ctx.scale(sc,sc);P();
    ctx.globalAlpha=b.en?1:.5;ctx.beginPath();ctx.arc(0,0,b.r,0,TAU);ctx.fillStyle=b.col;ctx.fill();ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.arc(-4,-6,b.r*.55,Math.PI*1.1,Math.PI*1.9);ctx.fill();
    ctx.font=(COARSE?17:15)+'px "Lilita One","Trebuchet MS",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.lineWidth=3;ctx.strokeStyle=INK;ctx.strokeText(b.icon,0,1);ctx.fillText(b.icon,0,1);
    ctx.font=(COARSE?15:13)+'px "Lilita One","Trebuchet MS",sans-serif';ctx.lineWidth=4;ctx.strokeText(b.label,0,b.r+12);ctx.fillStyle='#fff';ctx.fillText(b.label,0,b.r+12);if(b.cost!=null){const c=''+b.cost;ctx.strokeText(c,0,b.r+27);ctx.fillStyle=b.en?'#ffe38a':'#ff9a8a';ctx.fillText(c,0,b.r+27)}ctx.restore()}
}
function render(){
  ctx.setTransform(RES,0,0,RES,0,0);
  ctx.save();if(G.shake>0)ctx.translate((Math.random()-.5)*G.shake*14,(Math.random()-.5)*G.shake*14);
  ctx.drawImage(bg,0,0,W,H);
  // drifting cloud shadows
  ctx.fillStyle='rgba(20,40,10,.10)';for(let i=0;i<3;i++){const cx=((G.t*9+i*380)%(W+300))-150;ctx.beginPath();ctx.ellipse(cx,120+i*160,120,36,0,0,TAU);ctx.fill()}
  const canBuild=G.gold>=100;
  SLOTS.forEach((s,i)=>{if(!towerAt(i))drawPad(i,canBuild&&!G.sel&&G.running)});
  const items=[];
  for(const t of G.towers)items.push([SLOTS[t.slot][1]+8,()=>drawTower(t)]);
  for(const s of G.soldiers)if(!s.dead)items.push([s.y,()=>drawSoldier(s)]);
  for(const e of G.enemies)items.push([e.fly?e.y+300:e.y,()=>drawEnemy(e)]);
  items.push([CASTLE.y+30,drawCastle]);
  items.sort((a,b)=>a[0]-b[0]);for(const it of items)it[1]();
  // projectiles
  for(const p of G.proj){
    if(p.k==='arrow'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a||0);P();Ln(-14,0,6,0,2.2,'#d9b27a');Poly([[6,-3],[13,0],[6,3]],'#cfd8dc');Poly([[-14,0],[-18,-3],[-11,0],[-18,3]],'#e05a46');ctx.restore()}
    else if(p.k==='bolt'){ctx.fillStyle='rgba(190,140,255,.35)';ctx.beginPath();ctx.arc(p.x,p.y,10,0,TAU);ctx.fill();ctx.fillStyle='#e8d6ff';ctx.beginPath();ctx.arc(p.x,p.y,5,0,TAU);ctx.fill();ctx.strokeStyle='#8f5be0';ctx.lineWidth=1.5;ctx.stroke()}
    else if(p.k==='ball'){ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(p.x,p.gy,6,2.5,0,0,TAU);ctx.fill();ctx.save();P();Ci(p.x,p.y,6,'#33363c');ctx.fillStyle='rgba(255,255,255,.4)';ctx.beginPath();ctx.arc(p.x-2,p.y-2,1.8,0,TAU);ctx.fill();ctx.restore()}
    else if(p.k==='meteor'){if(p.delay>0){ctx.strokeStyle='rgba(255,120,40,.5)';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.ellipse(p.tx,p.ty,16,7,0,0,TAU);ctx.stroke();ctx.setLineDash([]);continue}
      ctx.strokeStyle='rgba(255,170,60,.55)';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+70,p.y-110);ctx.stroke();
      ctx.save();P();Ci(p.x,p.y,11,'#ff7a2a');Ci(p.x-2,p.y-2,6,'#ffd35a');ctx.restore();
      ctx.strokeStyle='rgba(255,120,40,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.tx,p.ty,16,7,0,0,TAU);ctx.stroke()}
  }
  for(const p of G.parts){const k=p.life/p.max;
    if(p.col==='ring'){ctx.strokeStyle='rgba(255,230,160,'+k+')';ctx.lineWidth=4*k;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*(1-k*.5),p.r*(1-k*.5)*.6,0,0,TAU);ctx.stroke();continue}
    ctx.globalAlpha=Math.min(1,k*1.4);ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(p.x,p.y,p.r*(.5+k*.5),0,TAU);ctx.fill();ctx.globalAlpha=1}
  ctx.font='20px "Lilita One","Trebuchet MS",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
  for(const x of G.texts){ctx.globalAlpha=Math.min(1,x.life*2);ctx.lineWidth=5;ctx.strokeStyle=INK;ctx.strokeText(x.txt,x.x,x.y);ctx.fillStyle=x.col;ctx.fillText(x.txt,x.x,x.y);ctx.globalAlpha=1}
  drawMenu();
  if(G.spell){const r=G.spell==='fire'?64:26;ctx.save();ctx.strokeStyle=G.spell==='fire'?'#ff9a3e':'#7fc8ff';ctx.fillStyle=G.spell==='fire'?'rgba(255,120,40,.18)':'rgba(120,200,255,.2)';ctx.lineWidth=3;ctx.setLineDash([8,5]);ctx.beginPath();ctx.ellipse(mouse.x,mouse.y,r,r*.7,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore();
    ctx.font='16px "Lilita One",sans-serif';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle=INK;const m=G.spell==='fire'?'Tap to call down fire':'Tap a spot on the road';ctx.strokeText(m,W/2,24);ctx.fillStyle='#fff';ctx.fillText(m,W/2,24)}
  if(G.hitFlash>0){ctx.fillStyle='rgba(220,40,30,'+G.hitFlash*.35+')';ctx.fillRect(0,0,W,H)}
  if(G.paused){ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(0,0,W,H);ctx.font='56px "Lilita One",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=7;ctx.strokeStyle=INK;ctx.strokeText('Paused',W/2,H/2);ctx.fillStyle='#f4b73a';ctx.fillText('Paused',W/2,H/2)}
  ctx.restore();
}

/* ---------- input & menus ---------- */
function towerAt(i){return G.towers.find(t=>t.slot===i)}
function menuButtons(){
  if(G.sel==null)return null;const s=SLOTS[G.sel],t=towerAt(G.sel),out=[];
  const BR=COARSE?27:21,DX=BR*2+36,DY=BR*2+40;
  const toC=Math.atan2(H/2-(s[1]-14),W/2-s[0]);
  const place=(i,n)=>{const rows=n>2?2:1,cx=s[0]+Math.cos(toC)*84,cy=s[1]-14+Math.sin(toC)*84;
    const gx=clamp(cx,DX/2+BR+8,W-DX/2-BR-8),gy=clamp(cy,(rows>1?DY/2:0)+BR+8,H-(rows>1?DY/2:0)-BR-30);
    const col=i%2,row=rows>1?Math.floor(i/2):0;return[gx+(col?DX/2:-DX/2),gy+(rows>1?(row?DY/2:-DY/2):0)]};
  if(!t){const defs=[['archer','A','#a8773f'],['mage','M','#7a52c8'],['barracks','B','#c64b3b'],['cannon','C','#6b707a']];
    defs.forEach((d,i)=>{const p=place(i,4);const c=TS[d[0]].cost[0];out.push({x:p[0],y:p[1],r:BR,icon:d[1],label:TS[d[0]].name,cost:c,col:d[2],en:G.gold>=c,act:()=>build(G.sel,d[0])})})}
  else{const up=t.lvl<3?TS[t.type].cost[t.lvl]:null;
    const p1=place(0,2),p2=place(1,2);
    if(up!=null)out.push({x:p1[0],y:p1[1],r:BR,icon:'Up',label:'Level '+(t.lvl+1),cost:up,col:'#3f9a4a',en:G.gold>=up,act:()=>upgrade(t)});
    else out.push({x:p1[0],y:p1[1],r:BR,icon:'Max',label:'Max level',cost:null,col:'#7a7a7a',en:false,act:()=>{}});
    out.push({x:p2[0],y:p2[1],r:BR,icon:'$',label:'Sell',cost:Math.floor(t.spent*.6),col:'#b8452f',en:true,act:()=>sell(t)})}
  return out}
function build(slot,type){const c=TS[type].cost[0];if(G.gold<c)return;G.gold-=c;const t=addTower(slot,type);const s=SLOTS[slot];puff(s[0],s[1],14,'#e8dcc0',70,.45,5);toast(s[0],s[1]-60,'-'+c,'#ffb0a0');G.sel=null;return t}
function upgrade(t){if(t.lvl>=3)return;const c=TS[t.type].cost[t.lvl];if(G.gold<c)return;G.gold-=c;t.spent+=c;t.lvl++;const s=SLOTS[t.slot];puff(s[0],s[1]-30,16,'#ffe38a',80,.5,4);toast(s[0],s[1]-70,'Level '+t.lvl,'#9dff8a');if(t.type==='barracks')setupBarracks(t);G.sel=null}
function sell(t){const v=Math.floor(t.spent*.6);G.gold+=v;const s=SLOTS[t.slot];toast(s[0],s[1]-50,'+'+v);puff(s[0],s[1],12,'#cfc7b5',60,.4,4);
  if(t.type==='barracks'){for(const so of t.soldiers){so.dead=true;so.life=0;if(so.target&&so.target.blocker===so)so.target.blocker=null}G.soldiers=G.soldiers.filter(x=>x.tower!==t)}
  G.towers=G.towers.filter(x=>x!==t);G.sel=null}
function pos(ev){const r=cv.getBoundingClientRect();return{x:(ev.clientX-r.left)/r.width*W,y:(ev.clientY-r.top)/r.height*H}}
let aiming=false;
function aimPos(ev){const p=pos(ev);if(ev.pointerType==='touch'&&G.spell)p.y-=46;return p}
cv.addEventListener('pointermove',ev=>{const p=aimPos(ev);mouse.x=p.x;mouse.y=p.y});
cv.addEventListener('pointerdown',ev=>{
  if(!G.running||G.over||G.paused)return;
  try{cv.setPointerCapture(ev.pointerId)}catch(_){}
  const p=aimPos(ev);mouse.x=p.x;mouse.y=p.y;
  if(G.spell){aiming=true;return}
  const btns=menuButtons();
  if(btns){for(const b of btns)if(dist(p.x,p.y,b.x,b.y)<b.r+(COARSE?10:4)){if(b.en)b.act();else toast(b.x,b.y-30,'Not enough gold','#ff9a8a');return}}
  let hit=null,bd=1e9;SLOTS.forEach((s,i)=>{const d=dist(p.x,p.y,s[0],s[1]-14);if(d<(towerAt(i)?(COARSE?42:34):(COARSE?36:26))&&d<bd){bd=d;hit=i}});
  G.sel=hit===G.sel?null:hit});
cv.addEventListener('pointerup',ev=>{
  if(!aiming)return;aiming=false;if(!G.spell||G.over)return;
  const p=aimPos(ev),sp=G.spell;G.spell=null;if(sp==='fire')castFire(p.x,p.y);else castReinf(p.x,p.y)});
cv.addEventListener('pointercancel',()=>{aiming=false});
cv.addEventListener('contextmenu',ev=>ev.preventDefault());

/* ---------- HUD ---------- */
const bFire=$('bFire'),bReinf=$('bReinf'),bCall=$('bCall'),bSpeed=$('bSpeed'),bPause=$('bPause');
function setCd(btn,cd,max,label){const bar=btn.querySelector('.cd');bar.style.width=(cd>0?cd/max*100:0)+'%';btn.disabled=cd>0||!G.running||!!G.over}
function hud(){
  $('lives').textContent=G.lives;$('gold').textContent=Math.floor(G.gold);$('wave').textContent=Math.min(G.wave,10)+'/10';$('next').textContent=(G.running&&!G.over&&G.wave<10&&G.timer<1e8)?'next '+Math.ceil(Math.max(0,G.timer))+'s':'';
  setCd(bFire,G.cd.fire,30);setCd(bReinf,G.cd.reinf,16);
  bFire.classList.toggle('on',G.spell==='fire');bReinf.classList.toggle('on',G.spell==='reinf');
  bCall.disabled=!G.running||!!G.over||G.wave>=10;bPause.textContent=G.paused?'Resume':'Pause';bSpeed.textContent=G.speed+'x'}
function arm(s){if(!G.running||G.over)return;if((s==='fire'&&G.cd.fire>0)||(s==='reinf'&&G.cd.reinf>0))return;G.spell=G.spell===s?null:s;G.sel=null}
bFire.onclick=()=>arm('fire');bReinf.onclick=()=>arm('reinf');
bCall.onclick=()=>{if(G.running&&!G.over)startWave(true)};
bSpeed.onclick=()=>{G.speed=G.speed===1?2:1};
bPause.onclick=()=>{if(G.running&&!G.over)G.paused=!G.paused};
addEventListener('keydown',ev=>{if(ev.key==='1')arm('fire');else if(ev.key==='2')arm('reinf');else if(ev.key===' '&&G.running&&!G.over){ev.preventDefault();G.paused=!G.paused}else if(ev.key==='Escape'){G.sel=null;G.spell=null}});

/* ---------- overlay / flow ---------- */
const ov=$('ov'),card=$('ovcard');
const mqPortrait=matchMedia('(orientation:portrait) and (pointer:coarse)');
const rotShown=()=>mqPortrait.matches&&!document.body.classList.contains('pp');
$('playAnyway').onclick=()=>document.body.classList.add('pp');
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.running&&!G.over)G.paused=true});
function showIntro(){ov.hidden=false;card.innerHTML='<h1>Hollowgate</h1><p>Goblins, wolves, orcs and bats are marching on your castle. Build towers on the stone pads, hold the road for 10 waves.</p><ul><li><b>Archers</b> are cheap and hit air and ground.</li><li><b>Mages</b> ignore armor. Use them on orcs.</li><li><b>Cannons</b> splash packs of ground units.</li><li><b>Barracks</b> soldiers block the road so towers keep firing.</li><li>Shamans heal, so kill them first.</li></ul><p class="tip">Tap a pad to build. Tap a tower to upgrade or sell. For spells, tap the button, then drag and release on the road.</p><button class="btn" id="go" type="button">Defend the gate</button>';$('go').onclick=()=>{reset();G.running=true;ov.hidden=true};$('go').focus()}
function endGame(win){G.over=win?'win':'lose';setTimeout(()=>{ov.hidden=false;card.innerHTML='<h1>'+(win?'The gate holds':'The gate has fallen')+'</h1><p>'+(win?'All 10 waves are down with '+G.lives+' lives to spare.':'You reached wave '+G.wave+' of 10.')+'</p><button class="btn" id="again" type="button">'+(win?'Play again':'Try again')+'</button>';$('again').onclick=()=>{reset();G.running=true;ov.hidden=true};$('again').focus()},win?600:900)}

let last=performance.now();
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(G.running&&!G.paused&&!G.over&&!rotShown()){const steps=G.speed;for(let i=0;i<steps;i++)update(dt)}
  else if(G.over){G.t+=dt;for(const p of G.parts){p.life-=dt}}
  else G.t+=dt;
  render();hud();requestAnimationFrame(frame)}
requestAnimationFrame(frame);
showIntro();
window.__hg={rotShown,get G(){return G},build,upgrade,startWave,castFire};
})();
