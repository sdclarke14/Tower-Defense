(()=>{
/* Hollowgate Clash: vertical two-sided lane battler. Canvas only, no assets. */
const W=540,H=960,AH=790,RIV=395,RW=46,BW=84,BR=[135,405],INK='#1c1a2b',TAU=Math.PI*2;
const HAND_Y=846,CW=100,CH=106,CX0=78,CGAP=6,MATCH=180,OT=60,ALT=34;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const RES=Math.min(2,Math.max(1,window.devicePixelRatio||1));
cv.width=Math.round(W*RES);cv.height=Math.round(H*RES);
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const dist=(a,b,c,d)=>Math.hypot(a-c,b-d);
const rnd=(a,b)=>a+Math.random()*(b-a);
function rng(s){return()=>(s=(s*1664525+1013904223)>>>0)/4294967296}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const TC=[{main:'#2a8aa6',dark:'#1b5a70',light:'#8fd0e0'},{main:'#d2562b',dark:'#8e3517',light:'#f2b08a'}];

/* ---------- data ---------- */
// rng = gap between surfaces (px). air: can hit flyers. bld: building. bldOnly: ignores troops.
const UT={
  brawler:{name:'Brawler',hp:340,dmg:42,cd:1.1,rng:6,spd:56,r:13,n:1,air:0,sc:1,h:66,col:'#5d7a8c'},
  rifle:{name:'Riflemen',hp:105,dmg:22,cd:1,rng:112,spd:58,r:9,n:2,air:1,sc:1,h:64,proj:'arrow',col:'#6f7f50'},
  scrap:{name:'Scrappers',hp:72,dmg:24,cd:.8,rng:4,spd:98,r:8,n:3,air:0,sc:.86,h:64,col:'#8a7a5c'},
  bruiser:{name:'Bruiser',hp:980,dmg:74,cd:1.6,rng:6,spd:38,r:19,n:1,air:0,sc:1.25,h:66,bldOnly:1,col:'#8b8f98'},
  molo:{name:'Molotov',hp:200,dmg:64,cd:1.4,rng:96,spd:50,r:11,n:1,air:1,sc:1,h:66,proj:'magic',splash:44,col:'#b5622f'},
  drone:{name:'Drone',hp:250,dmg:46,cd:1.2,rng:72,spd:66,r:14,n:1,air:1,sc:1,h:34,fly:1,proj:'flame',splash:40,col:'#5a6470'},
  nest:{name:'Gun Nest',hp:330,dmg:36,cd:.8,rng:136,spd:0,r:17,n:1,air:0,sc:1,h:44,bld:1,life:30,proj:'ball',col:'#a89468'}
};
const CARDS={
  brawler:{cost:3,info:'Riot shield and a bat. Soaks up hits'},rifle:{cost:3,info:'Two shooters. They hit air too'},scrap:{cost:2,info:'Three fast kids with crowbars'},
  bruiser:{cost:5,info:'Sledgehammer. Only goes for buildings'},molo:{cost:5,info:'Fire splash. Hits drones'},drone:{cost:4,info:'Flies over the canal'},
  nest:{cost:3,info:'Sandbag gun nest. Fades in 30s'},strike:{cost:4,spell:1,info:'Mortar barrage on a spot',col:'#b5622f'}
};
for(const k in UT)CARDS[k].col=UT[k].col;
const DIFF={easy:{mult:.8,delay:1.5,name:'Easy'},normal:{mult:1,delay:1,name:'Normal'},hard:{mult:1.2,delay:.7,name:'Hard'}};
const TOWER={p:{hp:1000,dmg:46,cd:.9,rng:178,r:27},k:{hp:1900,dmg:58,cd:1,rng:168,r:36}};

/* ---------- arena background: cracked asphalt, flat cel colors ---------- */
const bg=document.createElement('canvas');bg.width=Math.round(W*RES);bg.height=Math.round(H*RES);
function prop(b,type,x,y){b.save();b.translate(x,y);b.lineWidth=1.8;b.strokeStyle=INK;b.lineJoin='round';b.fillStyle='rgba(0,0,0,.22)';b.beginPath();b.ellipse(0,3,20,6,0,0,TAU);b.fill();
  const rect=(rx,ry,w,h,f,r=2)=>{b.fillStyle=f;b.beginPath();b.roundRect(rx,ry,w,h,r);b.fill();b.stroke()};
  const ell=(ex,ey,rx,ry,f)=>{b.fillStyle=f;b.beginPath();b.ellipse(ex,ey,rx,ry,0,0,TAU);b.fill();b.stroke()};
  if(type==='dumpster'){rect(-18,-20,36,20,'#3f6b4f');rect(-20,-24,40,6,'#2f5440');b.fillStyle='rgba(10,10,40,.2)';b.fillRect(-18,-20,10,20)}
  else if(type==='barrel'){rect(-8,-20,16,20,'#a8553d',3);b.strokeStyle='#5a2a20';b.beginPath();b.moveTo(-8,-14);b.lineTo(8,-14);b.moveTo(-8,-6);b.lineTo(8,-6);b.stroke();ell(0,-20,8,3,'#6b3a2c')}
  else if(type==='tires'){ell(0,-4,12,5,'#25262b');ell(0,-10,12,5,'#2d2e34');ell(0,-16,12,5,'#25262b');ell(0,-16,5,2,'#6b6f76')}
  else if(type==='crate'){rect(-12,-22,24,22,'#9b7a4a');b.beginPath();b.moveTo(-12,-22);b.lineTo(12,0);b.moveTo(12,-22);b.lineTo(-12,0);b.stroke()}
  else if(type==='cone'){b.fillStyle='#e0702a';b.beginPath();b.moveTo(-7,0);b.lineTo(-3,-18);b.lineTo(3,-18);b.lineTo(7,0);b.closePath();b.fill();b.stroke();rect(-9,-2,18,3,'#c85a1c',1);rect(-4,-11,8,3,'#f2f2ee',1)}
  else if(type==='car'){ell(-16,-4,6,6,'#1d1e22');ell(16,-4,6,6,'#1d1e22');rect(-26,-18,52,14,'#6e7f8c',4);rect(-14,-30,28,14,'#5a6a77',4);rect(-11,-28,10,9,'#2a2f3a',1);rect(2,-28,9,9,'#2a2f3a',1);b.fillStyle='rgba(10,10,40,.2)';b.fillRect(-26,-18,16,14);b.fillStyle='#a8553d';b.fillRect(8,-17,14,3)}
  else{for(let i=0;i<5;i++)ell(-12+i*6,-3-(i%2)*3,5+(i%3),3.5,'#8a8780')}
  b.restore()}
function buildBG(){const b=bg.getContext('2d');b.scale(RES,RES);const r=rng(7);
  const g=b.createLinearGradient(0,0,0,AH);g.addColorStop(0,'#6c7452');g.addColorStop(.5,'#788056');g.addColorStop(1,'#697049');b.fillStyle=g;b.fillRect(0,0,W,H);
  for(let i=0;i<110;i++){b.fillStyle=r()<.5?'rgba(110,86,56,.2)':'rgba(70,92,44,.2)';b.beginPath();b.ellipse(r()*W,r()*AH,14+r()*44,8+r()*22,0,0,TAU);b.fill()}
  b.lineJoin='round';b.lineCap='round';
  const road=(x,y,w,h)=>{b.fillStyle='#9b9a92';b.fillRect(x-6,y-6,w+12,h+12);b.fillStyle='#4b4f56';b.fillRect(x,y,w,h);b.strokeStyle=INK;b.lineWidth=1.8;b.strokeRect(x-6,y-6,w+12,h+12)};
  for(const bx of BR)road(bx-BW/2,100,BW,AH-200);
  for(const y of [225,AH-225])road(BR[0],y-26,BR[1]-BR[0],52);
  for(const bx of BR)for(const y of [225,AH-225]){b.fillStyle='#4b4f56';b.fillRect(bx-BW/2,y-26,BW,52)}
  b.setLineDash([14,12]);b.strokeStyle='#d6b64a';b.lineWidth=3;for(const bx of BR){b.beginPath();b.moveTo(bx,100);b.lineTo(bx,RIV-RW/2-10);b.moveTo(bx,RIV+RW/2+10);b.lineTo(bx,AH-100);b.stroke()}
  for(const y of [225,AH-225]){b.beginPath();b.moveTo(BR[0]+BW/2,y);b.lineTo(BR[1]-BW/2,y);b.stroke()}b.setLineDash([]);
  b.strokeStyle='rgba(20,22,28,.55)';b.lineWidth=1.3;for(let i=0;i<46;i++){const bx=BR[i%2]+(r()-.5)*70,y=110+r()*(AH-220);if(Math.abs(y-RIV)<46)continue;b.beginPath();b.moveTo(bx,y);let cx=bx,cy=y;for(let k=0;k<4;k++){cx+=(r()-.5)*16;cy+=r()*10;b.lineTo(cx,cy)}b.stroke()}
  for(const [x,y] of [[BR[0]+18,270],[BR[1]-18,520],[BR[0]-16,560],[BR[1]+16,250]]){b.fillStyle='#3c3f45';b.beginPath();b.ellipse(x,y,9,5,0,0,TAU);b.fill();b.stroke()}
  // drainage canal
  const rg=b.createLinearGradient(0,RIV-RW/2,0,RIV+RW/2);rg.addColorStop(0,'#3e5b50');rg.addColorStop(.5,'#587a68');rg.addColorStop(1,'#3e5b50');
  b.fillStyle='#a5a49b';b.fillRect(0,RIV-RW/2-9,W,9);b.fillRect(0,RIV+RW/2,W,9);
  b.strokeStyle='rgba(40,40,40,.4)';b.lineWidth=1;for(let x=0;x<W;x+=34){b.beginPath();b.moveTo(x,RIV-RW/2-9);b.lineTo(x,RIV-RW/2);b.moveTo(x+17,RIV+RW/2);b.lineTo(x+17,RIV+RW/2+9);b.stroke()}
  b.fillStyle=rg;b.fillRect(0,RIV-RW/2,W,RW);b.lineWidth=2;b.strokeStyle=INK;b.beginPath();b.moveTo(0,RIV-RW/2);b.lineTo(W,RIV-RW/2);b.moveTo(0,RIV+RW/2);b.lineTo(W,RIV+RW/2);b.stroke();
  for(let i=0;i<10;i++){b.fillStyle=['#c9c4a8','#7a3b2c','#3a6f9a'][i%3];b.beginPath();b.ellipse(r()*W,RIV+(r()-.5)*24,3+r()*3,2,0,0,TAU);b.fill()}
  // bridges: asphalt slab with guard rails
  for(const bx of BR){const x=bx-BW/2,y=RIV-RW/2-9,h=RW+18;b.fillStyle='#4b4f56';b.fillRect(x,y,BW,h);b.strokeStyle=INK;b.lineWidth=2;b.strokeRect(x,y,BW,h);
    b.setLineDash([10,8]);b.strokeStyle='#d6b64a';b.lineWidth=3;b.beginPath();b.moveTo(bx,y+3);b.lineTo(bx,y+h-3);b.stroke();b.setLineDash([]);
    for(const sx of [x-5,x+BW-1]){b.fillStyle='#b8bcc2';b.strokeStyle=INK;b.lineWidth=1.8;b.beginPath();b.roundRect(sx,y-3,6,h+6,2);b.fill();b.stroke();b.fillStyle='#a8553d';for(let k=0;k<4;k++)b.fillRect(sx,y+2+k*(h/4),6,4)}}
  // props and junk, kept off the roads
  const ps=[],types=['dumpster','barrel','tires','crate','cone','rubble','car'];let tries=0;
  while(ps.length<22&&tries++<600){const x=r()<.5?24+r()*(BR[0]-BW/2-40):BR[1]+BW/2+24+r()*(W-BR[1]-BW/2-48);let xx=r()<.35?W/2+(r()-.5)*70:x;const y=36+r()*(AH-72);
    if(Math.abs(y-RIV)<RW/2+26||Math.abs(y-225)<46||Math.abs(y-(AH-225))<46)continue;if(BR.some(bx=>Math.abs(xx-bx)<BW/2+22))continue;if(Math.abs(xx-W/2)<46&&(y<255||y>AH-255))continue;if(ps.some(p=>Math.hypot(p[0]-xx,p[1]-y)<46))continue;
    ps.push([xx,y,types[Math.floor(r()*types.length)]])}
  ps.sort((a,c)=>a[1]-c[1]).forEach(p=>prop(b,p[2],p[0],p[1]));
  // chain-link fence on both sides
  for(const fx of [4,W-4]){b.strokeStyle='rgba(190,198,206,.55)';b.lineWidth=1;for(let y=0;y<AH;y+=9){b.beginPath();b.moveTo(fx-5,y);b.lineTo(fx+5,y+9);b.moveTo(fx+5,y);b.lineTo(fx-5,y+9);b.stroke()}
    b.strokeStyle=INK;b.lineWidth=1.6;b.fillStyle='#8d939b';for(let y=0;y<=AH;y+=44){b.beginPath();b.roundRect(fx-2.5,y-5,5,12,1);b.fill();b.stroke()}
    b.strokeStyle='#8d939b';b.lineWidth=2;b.beginPath();b.moveTo(fx,0);b.lineTo(fx,AH);b.stroke()}
  // turf tint: blue at the bottom (Eastside Watch), rust at the top (Rust Road)
  const t0=b.createLinearGradient(0,RIV,0,AH);t0.addColorStop(0,'rgba(40,130,166,0)');t0.addColorStop(1,'rgba(40,130,166,.16)');b.fillStyle=t0;b.fillRect(0,RIV,W,AH-RIV);
  const t1=b.createLinearGradient(0,0,0,RIV);t1.addColorStop(0,'rgba(210,86,43,.16)');t1.addColorStop(1,'rgba(210,86,43,0)');b.fillStyle=t1;b.fillRect(0,0,W,RIV);
  const v=b.createRadialGradient(W/2,AH/2,AH*.35,W/2,AH/2,AH*.8);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(10,10,20,.32)');b.fillStyle=v;b.fillRect(0,0,W,AH);
  const pg=b.createLinearGradient(0,AH,0,H);pg.addColorStop(0,'#2e3238');pg.addColorStop(1,'#1b1e23');b.fillStyle=pg;b.fillRect(0,AH,W,H-AH);b.fillStyle=INK;b.fillRect(0,AH,W,4);b.fillStyle='#e0813a';b.fillRect(0,AH+4,W,2)}
buildBG();

/* ---------- state ---------- */
let G,mouse={x:W/2,y:AH-120,in:false};
function mkTower(team,kind,x,y){const T=TOWER[kind];return{team,kind,x,y,hp:T.hp,max:T.hp,r:T.r,cd:.5,dead:false,active:kind==='p',flash:0,ang:0,rc:0}}
function makeTowers(){const t=[];
  for(const team of [0,1]){const f=y=>team?y:AH-y;
    t.push(mkTower(team,'p',BR[0],f(272)),mkTower(team,'p',BR[1],f(272)),mkTower(team,'k',W/2,f(178)))}
  return t}
function reset(diff){const d=shuffle(Object.keys(CARDS)),e=shuffle(Object.keys(CARDS));
  G={t:0,el:[5,5],units:[],towers:makeTowers(),proj:[],parts:[],texts:[],crowns:[0,0],hand:d.slice(0,4),queue:d.slice(4),sel:-1,drag:false,
    ai:{t:3.5,hand:e.slice(0,4),queue:e.slice(4)},diff:diff||'normal',over:null,running:false,paused:false,shake:0,uid:1,ot:false,banner:0,hurt:0}}
reset();
const toast=(x,y,txt,col='#f4b73a',big)=>G.texts.push({x,y,txt,col,life:big?1.6:1,big});
function puff(x,y,n,col,sp=60,life=.5,r=4,grav=0){for(let i=0;i<n;i++){const a=Math.random()*TAU,s=Math.random()*sp;G.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-20,life:life*(.6+Math.random()*.6),max:life,r:r*(.6+Math.random()*.8),col,grav})}}

/* ---------- rules ---------- */
const elRate=()=>(G.t>=MATCH-60?2:1)/2.8;
const zoneOK=(team,x,y)=>x>14&&x<W-14&&(team===0?y>RIV+RW/2+14&&y<AH-14:y<RIV-RW/2-14&&y>14);
function playCard(team,idx,x,y){const hand=team?G.ai.hand:G.hand,q=team?G.ai.queue:G.queue,k=hand[idx],C_=CARDS[k];
  if(!C_||G.el[team]<C_.cost)return false;
  if(C_.spell){x=clamp(x,10,W-10);y=clamp(y,10,AH-10)}else if(!zoneOK(team,x,y))return false;
  G.el[team]-=C_.cost;
  if(C_.spell)G.proj.push({k:'fire',team,tx:x,ty:y,t:0,dur:.75});else spawnUnits(team,k,x,y);
  hand[idx]=q.shift();q.push(k);return true}
function spawnUnits(team,k,x,y){const S=UT[k];const offs=S.n===1?[[0,0]]:S.n===2?[[-15,0],[15,4]]:[[-16,4],[16,4],[0,-14]];
  for(const o of offs){const px=clamp(x+o[0],14,W-14),py=y+o[1];
    G.units.push({id:G.uid++,team,type:k,x:px,y:py,py,hp:S.hp,max:S.hp,cd:.3,tg:null,rt:0,fly:!!S.fly,bld:!!S.bld,r:S.r,alt:S.fly?ALT:0,h:S.h,flash:0,phase:Math.random()*6,swing:0,face:team?-1:1,dep:.85,dead:false,deadT:0,ang:team?Math.PI/2:-Math.PI/2})}
  puff(x,y,10,TC[team].light,50,.5,3)}
function hit(t,dmg){if(t.dead)return;t.hp-=dmg;t.flash=.1;
  if(t.kind){if(t.kind==='k'&&!t.active)t.active=true;if(t.team===0)G.hurt=Math.max(G.hurt,.1)}
  if(t.hp<=0){t.hp=0;t.dead=true;t.deadT=0;
    if(t.kind)towerDown(t);else puff(t.x,t.y-(t.alt||0)-10,12,'#e9e2d0',70,.5,5)}}
function towerDown(t){const by=1-t.team;G.shake=.5;puff(t.x,t.y-20,34,'#d8c9a8',130,.8,8);puff(t.x,t.y-20,18,'#ff9a2e',100,.6,6);
  if(t.kind==='k'){G.crowns[by]=3}else{G.crowns[by]=Math.min(3,G.crowns[by]+1);const k=G.towers.find(o=>o.team===t.team&&o.kind==='k');if(k)k.active=true}
  toast(t.x,t.y-40,t.kind==='k'?'HQ DOWN!':'OUTPOST DOWN!',by===0?'#7fc8ff':'#ff7a6a',true);
  if(t.kind==='k'||G.ot)endGame()}
function enemyTowerGoal(u){let best=null,bd=1e9;for(const t of G.towers){if(t.dead||t.team===u.team)continue;const d=dist(u.x,u.y,t.x,t.y)+(t.kind==='k'?70:0);if(d<bd){bd=d;best=t}}return best}
function findTarget(u){const S=UT[u.type];let best=null,bd=S.bldOnly?240:165;const cur=u.tg;
  for(const o of G.units){if(o.dead||o.team===u.team)continue;if(o.fly&&!S.air)continue;if(S.bldOnly&&!o.bld)continue;
    const d=dist(u.x,u.y,o.x,o.y)-o.r-(o===cur?28:0);if(d<bd){bd=d;best=o}}
  for(const o of G.towers){if(o.dead||o.team===u.team)continue;const d=dist(u.x,u.y,o.x,o.y)-o.r-(o===cur?28:0);if(d<bd){bd=d;best=o}}
  return best||enemyTowerGoal(u)}
const bridgeX=x=>Math.abs(x-BR[0])<Math.abs(x-BR[1])?BR[0]:BR[1];
function waypoint(u,gx,gy){if(u.fly)return[gx,gy];
  const us=u.y<RIV-RW/2?-1:u.y>RIV+RW/2?1:0,gs=gy<RIV?-1:1;
  if(us===0)return[u.x,u.y+gs*40];
  if(us!==gs){const bx=bridgeX(u.x);return Math.abs(u.x-bx)>BW/2-26?[bx,RIV+us*(RW/2+30)]:[bx,RIV]}
  return[gx,gy]}
function constrain(u){if(u.fly||u.bld)return;
  const bx=bridgeX(u.x),onB=Math.abs(u.x-bx)<=BW/2-4,lo=RIV-RW/2-u.r*.4,hi=RIV+RW/2+u.r*.4;
  if(!onB&&u.y>lo&&u.y<hi)u.y=u.py<RIV?lo:hi;
  u.x=clamp(u.x,u.r,W-u.r);u.y=clamp(u.y,u.r,AH-u.r);
  for(const t of G.towers){if(t.dead)continue;const d=dist(u.x,u.y,t.x,t.y),m=t.r+u.r*.7;if(d<m&&d>.01){u.x=t.x+(u.x-t.x)/d*m;u.y=t.y+(u.y-t.y)/d*m}}}
function separate(){const us=G.units;for(let i=0;i<us.length;i++){const a=us[i];if(a.dead||a.dep>0)continue;
  for(let j=i+1;j<us.length;j++){const b=us[j];if(b.dead||b.dep>0||a.fly!==b.fly)continue;
    const d=dist(a.x,a.y,b.x,b.y),m=(a.r+b.r)*.85;if(d<m&&d>.01){const k=(m-d)/d*.5,dx=(b.x-a.x)*k,dy=(b.y-a.y)*k;
      const wa=a.bld?0:b.bld?2:1,wb=b.bld?0:a.bld?2:1;a.x-=dx*wa;a.y-=dy*wa;b.x+=dx*wb;b.y+=dy*wb}}}}
function fire(from,t,dmg,kind,splash){
  G.proj.push({k:kind,team:from.team,x:from.x,y:from.y-(from.alt||0)-(from.h||30)*.7,tg:t,dmg,splash:splash||0,sp:kind==='arrow'?520:kind==='ball'?420:kind==='magic'?330:300,px:t.x,py:t.y})}
function splashAt(team,x,y,rad,dmg,tdmg){for(const o of G.units)if(!o.dead&&o.team!==team&&dist(o.x,o.y,x,y)<rad+o.r*.5)hit(o,dmg);
  if(tdmg)for(const t of G.towers)if(!t.dead&&t.team!==team&&dist(t.x,t.y,x,y)<rad+t.r)hit(t,tdmg)}

function update(dt){
  const g=G;g.t+=dt;g.shake=Math.max(0,g.shake-dt);g.hurt=Math.max(0,g.hurt-dt);g.banner=Math.max(0,g.banner-dt);
  if(!g.ot&&g.t>=MATCH){if(g.crowns[0]!==g.crowns[1])return endGame();g.ot=true;g.banner=2.2}
  if(g.ot&&g.t>=MATCH+OT)return endGame();
  if(!g.doubled&&g.t>=MATCH-60){g.doubled=true;g.banner=2.2}
  const D=DIFF[g.diff];g.el[0]=Math.min(10,g.el[0]+elRate()*dt);g.el[1]=Math.min(10,g.el[1]+elRate()*D.mult*dt);
  aiThink(dt);
  for(const u of g.units){
    if(u.dead){u.deadT+=dt;continue}
    const S=UT[u.type];u.flash=Math.max(0,u.flash-dt);u.swing=Math.max(0,u.swing-dt*3.2);u.cd-=dt;
    if(u.dep>0){u.dep-=dt;continue}
    if(u.bld){u.hp-=u.max/S.life*dt;if(u.hp<=0){hit(u,1e9);continue}}
    u.rt-=dt;if(!u.tg||u.tg.dead||u.rt<=0){u.tg=findTarget(u);u.rt=.3}
    const t=u.tg;if(!t)continue;
    const d=dist(u.x,u.y,t.x,t.y)-t.r-u.r;
    if(Math.abs(t.x-u.x)>Math.abs(t.y-u.y)*.35)u.face=t.x>u.x?1:-1;
    if(d<=S.rng){u.ang=Math.atan2(t.y-u.y,t.x-u.x);
      if(u.cd<=0){u.cd=S.cd;u.swing=1;
        if(S.proj)fire(u,t,S.dmg,S.proj,S.splash);else{hit(t,S.dmg);puff(t.x,t.y-(t.alt||0)-14,4,'#fff6c8',60,.2,2.5)}}
      u.phase+=dt*2}
    else if(!u.bld){const w=waypoint(u,t.x,t.y),dd=dist(u.x,u.y,w[0],w[1]);u.py=u.y;
      if(dd>1){const st=Math.min(S.spd*dt,dd);u.x+=(w[0]-u.x)/dd*st;u.y+=(w[1]-u.y)/dd*st;u.phase+=dt*S.spd*.15}}
    else u.ang=Math.atan2(t.y-u.y,t.x-u.x)}
  separate();for(const u of g.units)if(!u.dead&&u.dep<=0)constrain(u);
  g.units=g.units.filter(u=>!(u.dead&&u.deadT>.45));
  // towers shoot
  for(const t of g.towers){t.flash=Math.max(0,t.flash-dt);t.rc=Math.max(0,t.rc-dt*4);t.cd-=dt;if(t.dead||!t.active)continue;
    const T=TOWER[t.kind];let tg=null,bd=1e9;
    for(const u of g.units){if(u.dead||u.team===t.team)continue;const d=dist(t.x,t.y,u.x,u.y)-u.r;if(d<=T.rng&&d<bd){bd=d;tg=u}}
    if(tg){t.ang=Math.atan2(tg.y-t.y,tg.x-t.x);if(t.cd<=0){t.cd=T.cd;t.rc=1;fire({x:t.x,y:t.y,team:t.team,h:90,alt:0},tg,T.dmg,'arrow')}}}
  // projectiles
  for(const p of g.proj){
    if(p.k==='fire'){p.t+=dt;if(p.t>=p.dur){p.done=true;g.shake=Math.max(g.shake,.25);splashAt(p.team,p.tx,p.ty,72,210,90);
        puff(p.tx,p.ty,34,'#ff9a2e',150,.7,8);puff(p.tx,p.ty,16,'#ffe27a',100,.45,6);puff(p.tx,p.ty,12,'#3a2a22',70,.9,8);g.parts.push({x:p.tx,y:p.ty,vx:0,vy:0,life:.4,max:.4,r:72,col:'ring',grav:0})}continue}
    const tg=p.tg;if(!tg.dead){p.px=tg.x;p.py=tg.y}
    const tx=p.px,ty=p.py-(tg.alt||0)-(tg.kind?30:12),dd=dist(p.x,p.y,tx,ty),st=p.sp*dt;p.a=Math.atan2(ty-p.y,tx-p.x);
    if(dd<=st+4){p.done=true;
      if(p.splash){splashAt(p.team,p.px,p.py,p.splash,p.dmg,p.dmg*.6);puff(p.px,p.py-10,12,p.k==='flame'?'#ff8a2a':'#c9a6ff',70,.4,4);g.parts.push({x:p.px,y:p.py,vx:0,vy:0,life:.3,max:.3,r:p.splash,col:'ring',grav:0})}
      else if(!tg.dead){hit(tg,p.dmg);puff(tx,ty,p.k==='ball'?8:4,p.k==='ball'?'#aaa':'#fff2c0',50,.3,3)}}
    else{p.x+=Math.cos(p.a)*st;p.y+=Math.sin(p.a)*st;if(p.k==='magic')g.parts.push({x:p.x,y:p.y,vx:0,vy:0,life:.3,max:.3,r:4,col:'#b48bff',grav:0});if(p.k==='flame')g.parts.push({x:p.x,y:p.y,vx:rnd(-10,10),vy:-12,life:.3,max:.3,r:5,col:'#ffb040',grav:0})}}
  g.proj=g.proj.filter(p=>!p.done);
  for(const p of g.parts){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.grav||0)*dt;p.vx*=.96}
  g.parts=g.parts.filter(p=>p.life>0);
  for(const x of g.texts){x.life-=dt;x.y-=24*dt}g.texts=g.texts.filter(x=>x.life>0);
}

/* ---------- opponent ---------- */
function aiThink(dt){const a=G.ai;a.t-=dt;if(a.t>0||G.over)return;const D=DIFF[G.diff],el=G.el[1];
  const cost=i=>CARDS[a.hand[i]].cost,find=(...ks)=>{for(const k of ks){const i=a.hand.indexOf(k);if(i>=0&&cost(i)<=el)return i}return -1};
  const foes=G.units.filter(u=>!u.dead&&u.team===0&&u.y<RIV+30);
  const fi=a.hand.indexOf('strike');
  if(fi>=0&&cost(fi)<=el){let best=null,bn=0;for(const u of G.units){if(u.dead||u.team!==0)continue;let n=0;for(const o of G.units)if(!o.dead&&o.team===0&&dist(o.x,o.y,u.x,u.y)<70)n++;if(n>bn){bn=n;best=u}}
    if(best&&bn>=3&&playCard(1,fi,best.x,best.y)){a.t=rnd(1,2)*D.delay;return}}
  if(foes.length){const f=foes.reduce((m,u)=>u.y>m.y?u:m,foes[0]);
    const heavy=foes.some(u=>u.type==='bruiser'||u.type==='brawler');
    const i=heavy?find('nest','brawler','molo','rifle','scrap'):f.fly?find('rifle','molo','drone'):find('brawler','molo','nest','rifle','scrap','drone');
    if(i>=0){const k=a.hand[i];const y=k==='nest'?clamp(f.y-100,300,335):clamp(f.y-70,235,345);
      if(playCard(1,i,clamp(f.x+rnd(-20,20),40,W-40),y)){a.t=rnd(.8,1.6)*D.delay;return}}}
  if(el>=7.3||(el>=4&&Math.random()<.01+.004*G.t/10)){
    let i=-1;for(const k of ['bruiser','molo','drone','brawler','rifle','scrap']){const j=a.hand.indexOf(k);if(j>=0&&cost(j)<=el){i=j;break}}
    if(i>=0){const k=a.hand[i],lane=Math.random()<.5?0:1,y=k==='bruiser'?245:k==='molo'||k==='rifle'?290:335;
      if(playCard(1,i,BR[lane]+rnd(-14,14),y)){a.t=rnd(1.4,2.8)*D.delay;return}}}
  a.t=.4}

/* ---------- flow ---------- */
function endGame(){if(G.over)return;const c=G.crowns,res=c[0]>c[1]?'win':c[0]<c[1]?'lose':'draw';G.over=res;G.running=false;setTimeout(()=>showEnd(res),900)}

/* ---------- drawing helpers ---------- */
let FL=false;const C=c=>FL?'#fff':c;
function P(){ctx.lineWidth=1.8;ctx.strokeStyle=INK;ctx.lineJoin='round';ctx.lineCap='round'}
function E(x,y,rx,ry,f,rot=0){ctx.beginPath();ctx.ellipse(x,y,Math.abs(rx),Math.abs(ry),rot,0,TAU);ctx.fillStyle=C(f);ctx.fill();ctx.stroke()}
function Ci(x,y,r,f){E(x,y,r,r,f)}
function Poly(pts,f){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=C(f);ctx.fill();ctx.stroke()}
function R(x,y,w,h,f,r=3){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=C(f);ctx.fill();ctx.stroke()}
function Ln(x1,y1,x2,y2,w,c){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineWidth=w+2.4;ctx.strokeStyle=INK;ctx.stroke();ctx.lineWidth=w;ctx.strokeStyle=C(c);ctx.stroke();P()}
function shadow(x,y,rx,ry){ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill()}
function eyes(x,y,sp=4,r=3.2,angry=1){for(const s of[-1,1]){E(x+s*sp,y,r,r*1.25,'#fff');ctx.fillStyle=FL?'#fff':INK;ctx.beginPath();ctx.arc(x+s*sp+1,y+.6,1.4,0,TAU);ctx.fill()}
  if(angry){ctx.lineWidth=2.2;ctx.strokeStyle=FL?'#fff':INK;ctx.beginPath();ctx.moveTo(x-sp-r-1,y-r-2.5);ctx.lineTo(x-1,y-r+.5);ctx.moveTo(x+sp+r+1,y-r-2.5);ctx.lineTo(x+1,y-r+.5);ctx.stroke();P()}}

/* ---------- people: flat cel colors, one hard shadow shape, realistic adult proportions ---------- */
const SK=['#e8b896','#c98e63','#8d5a3b','#f0c8a4'],HC=['#2b2220','#5a3a22','#c9a050','#1a1a1a','#8a3a22'];
function arm(x1,y1,x2,y2,o){Ln(x1,y1,x2,y2,o.armW||5.4,o.sleeve||o.top);E(x2,y2,2.8,2.8,o.skin)}
function head(x,y,o){
  if(o.hair==='long')Poly([[x-6,y-5],[x-9.5,y+10],[x-2,y+11],[x+1,y]],o.hc);
  E(x,y,6.2,7.4,o.skin);
  if(o.beard)Poly([[x-5.8,y+1],[x+6,y+1],[x+5,y+8],[x,y+10],[x-4.5,y+7]],o.hc);
  switch(o.hair){
    case 'short':case 'long':Poly([[x-6.8,y-1],[x-6.2,y-6.5],[x-1,y-9.3],[x+5,y-7.6],[x+6.5,y-2.5],[x+3.5,y-4.4],[x-3.5,y-5.4]],o.hc);break;
    case 'buzz':Poly([[x-6.3,y-2],[x-5,y-6.8],[x,y-8],[x+5,y-6.8],[x+6.3,y-2],[x,y-5.2]],o.hc);break;
    case 'cap':Poly([[x-6.8,y-3],[x-6,y-8],[x,y-10],[x+6,y-8],[x+7,y-3]],o.cap);R(x+2,y-4.8,9,2.6,o.cap,1);break;
    case 'beanie':Poly([[x-7,y-2],[x-6.5,y-8.5],[x,y-11],[x+6.5,y-8.5],[x+7,y-2]],o.cap);R(x-7.2,y-5,14.4,3.6,'#2b2d33',1);break;
    case 'bandana':Poly([[x-6.8,y-1],[x-6.2,y-6.5],[x-1,y-9.3],[x+5,y-7.6],[x+6.5,y-2.5],[x+3.5,y-4.4],[x-3.5,y-5.4]],o.hc);R(x-7,y-6,14,3,o.cap,1);Poly([[x-7,y-5],[x-12,y-2.5],[x-8,y-.5]],o.cap);break;
    case 'helmet':Poly([[x-7,y-1],[x-6.8,y-8],[x,y-10.5],[x+6.8,y-8],[x+7,y-1]],'#6f7a63');break}
  if(o.goggles){R(x-6.6,y-6.6,13.2,3,'#d09a30',1.2);Ci(x+3.4,y-5,2.7,'#a6d6e4')}
  ctx.lineWidth=1.2;for(const s of[-1,1]){const ex=x+1.8+s*2.9;E(ex,y-.2,1.6,1.9,'#fff');ctx.fillStyle=FL?'#fff':(o.eye||'#4f8fa8');ctx.beginPath();ctx.arc(ex+.7,y-.1,.95,0,TAU);ctx.fill()}
  ctx.strokeStyle=FL?'#fff':o.hc;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-2.4,y-3.5);ctx.lineTo(x+.6,y-3.9);ctx.moveTo(x+2.2,y-3.9);ctx.lineTo(x+6.2,y-3.2);ctx.stroke();
  P();
  if(o.glasses){R(x-1,y-2.8,8,3.4,'#15151c',1)}
  if(o.mask)R(x-5.8,y+.4,12,7,o.mask,2);
  else if(!o.beard){ctx.strokeStyle=FL?'#fff':'#7a4a3a';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x+.5,y+4.4);ctx.lineTo(x+4,y+4.2);ctx.stroke();P()}
}
function person(u,o){
  const id=u.id||0,ph=u.phase,sw=Math.sin(ph)*5,bob=Math.abs(Math.sin(ph))*1.6,bw=o.bw||10;
  o.skin=o.skin||SK[id%4];o.hc=o.hc||HC[(id*3+1)%5];
  for(const s of[-1,1]){const fx=s*3.6+s*sw*.9;Ln(s*3.2,-22,fx,-4.5,o.legW||6.5,o.pants);E(fx+2.2,-2.6,5.2,2.9,o.shoe||'#2b2b33')}
  ctx.translate(0,-bob);
  Poly([[-bw,-42],[bw,-42],[bw*.84,-21],[-bw*.84,-21]],o.top);
  if(!FL){ctx.fillStyle='rgba(10,10,40,.2)';ctx.beginPath();ctx.moveTo(-bw,-42);ctx.lineTo(-bw*.1,-42);ctx.lineTo(-bw*.08,-21);ctx.lineTo(-bw*.84,-21);ctx.closePath();ctx.fill()}
  if(o.torso)o.torso(bw);
  R(-bw*.86,-24.5,bw*1.72,3.6,o.belt||'#34343c',1);
  Ln(1,-42,1,-45.5,5.5,o.skin);
  head(1.5,-52,o);
  o.arms(bw);
  R(bw-9,-41,6,5,o.tc,1)
}

/* ---------- troops: every avatar is drawn in code, facing right, feet at 0,0 ---------- */
function drawUnit(u,icon){
  const S=UT[u.type],tc=TC[u.team],id=u.id||0;ctx.save();ctx.translate(u.x,u.y);
  let a=1,pop=1;if(u.dead)a=1-Math.min(1,u.deadT/.4);
  if(u.dep>0&&!icon){a=.55+.45*(1-u.dep/.85);pop=.8+.2*(1-u.dep/.85)}
  ctx.globalAlpha=a;
  if(!icon){shadow(0,0,(S.r+3)*(u.fly?.8:1),(S.r+3)*.4);
    ctx.strokeStyle=tc.main;ctx.globalAlpha=a*.85;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,S.r+3,(S.r+3)*.42,0,0,TAU);ctx.stroke();ctx.globalAlpha=a;
    if(u.dep>0){ctx.strokeStyle=tc.light;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,(S.r+10)*(1+u.dep*.3),(S.r+10)*.42*(1+u.dep*.3),0,0,TAU);ctx.stroke()}}
  ctx.translate(0,-(u.alt||0)-(u.fly?Math.sin(u.phase*1.3)*3:0));
  ctx.scale(u.face*S.sc*pop,S.sc*pop);FL=u.flash>0&&!u.dead;P();
  const ph=u.phase,at=u.swing;
  switch(u.type){
  case 'brawler':{const o={bw:11,top:'#566450',pants:'#3b4350',tc:tc.main,hair:'buzz',legW:7,
    torso:b=>{R(-b+2,-41,2*b-4,17,'#3f4a3b',2);R(b-7,-35,6,6,'#2f382d',1)},
    arms:b=>{const A=at>0?-1.9+(1-at)*3.2:-1.55,hx=-b+3+Math.cos(A)*13,hy=-39+Math.sin(A)*13;
      arm(-b+3,-39,hx,hy,o);ctx.save();ctx.translate(hx,hy);ctx.rotate(A);Ln(-4,0,24,0,3.2,'#a8773f');Ln(18,0,27,0,5,'#a8773f');ctx.restore();
      arm(b-3,-38,b+7,-29,o);R(b+4,-48,9,38,'rgba(170,205,225,.62)',3);R(b+4,-33,9,5,tc.main,1)}};
    person(u,o);break}
  case 'rifle':{const k=at>0?at*3:0,o={bw:9,top:'#5c6a45',pants:'#4a4a3a',tc:tc.main,hair:id%2?'cap':'beanie',cap:id%2?'#3f4a35':'#8a8a92',
    arms:b=>{Ln(-9-k,-29,b+26-k,-32,3.4,'#2d2d33');Ln(-10-k,-29,-1-k,-30.5,5.5,'#6b4a2e');
      arm(b-3,-38,b+8-k,-31,o);arm(-b+4,-38,3-k,-30,o);if(at>.7)Poly([[b+27,-32],[b+37,-38],[b+34,-32],[b+39,-29],[b+27,-30]],'#ffd35a')}};
    person(u,o);break}
  case 'scrap':{const o={bw:8.5,top:['#6b6b78','#8a5a44','#4b5d6e'][id%3],pants:'#3b4a6b',tc:tc.main,hair:'bandana',cap:tc.main,mask:tc.main,legW:5.5,
    arms:b=>{const A=at>0?-1.7+(1-at)*3:-.6+Math.sin(u.phase)*.2,hx=b-2+Math.cos(A)*12,hy=-38+Math.sin(A)*12;
      arm(-b+3,-38,-b-1+Math.sin(u.phase+3)*3,-26,o);ctx.save();ctx.translate(hx,hy);ctx.rotate(A);Ln(-3,0,22,0,2.8,'#8f949c');Ln(20,0,26,-5,2.8,'#8f949c');ctx.restore();arm(b-2,-38,hx,hy,o)}};
    person(u,o);break}
  case 'bruiser':{const sk=SK[(id+1)%4],o={bw:15,top:'#d8d2c4',pants:'#3a3f4a',tc:tc.main,hair:'bald',beard:1,hc:'#2b2220',skin:sk,sleeve:sk,armW:8,glasses:1,legW:9,belt:'#5a3b24',
    torso:b=>{R(-b+1,-41,6,20,tc.dark,2);R(b-7,-41,6,20,tc.dark,2)},
    arms:b=>{const A=at>0?-1.3+(1-at)*2.4:-1,hx=b-2+Math.cos(A)*10,hy=-37+Math.sin(A)*10;
      ctx.save();ctx.translate(hx,hy);ctx.rotate(A);Ln(-8,0,34,0,3.8,'#8a6a42');R(28,-8,14,16,'#80858f',2);ctx.restore();
      arm(-b+4,-37,hx-3,hy+3,o);arm(b-2,-37,hx,hy,o)}};
    person(u,o);break}
  case 'molo':{const o={bw:8.5,top:'#5a3a2a',pants:'#2f3340',tc:tc.main,hair:'long',hc:'#b5482a',skin:SK[3],goggles:1,legW:5.5,
    arms:b=>{const A=at>0?-1+(1-at)*1.5:-1.05,hx=b-1+Math.cos(A)*14,hy=-38+Math.sin(A)*14;
      arm(-b+3,-38,-b-1+Math.sin(u.phase+3)*3,-26,o);arm(b-2,-38,hx,hy,o);
      if(at<.06){ctx.save();ctx.translate(hx,hy);ctx.rotate(.5);Poly([[-3,-9],[3,-9],[4,1],[-4,1]],'#4f8f5a');R(-1.6,-13,3.2,5,'#3d7a49',1);const f=Math.sin(G.t*18+id);Poly([[-2.6,-13],[0,-21+f*2],[2.6,-13]],'#f08a2a');Poly([[-1.2,-13],[0,-18+f],[1.2,-13]],'#ffe27a');ctx.restore()}}};
    person(u,o);break}
  case 'drone':{const t=u.phase*9;
    for(const s of[-1,1]){Ln(s*8,-22,s*20,-26,2.4,'#2b2f35');ctx.fillStyle=FL?'#fff':'rgba(215,225,235,.62)';ctx.beginPath();ctx.ellipse(s*20,-28,12*(.6+.4*Math.abs(Math.sin(t+s))),2.6,0,0,TAU);ctx.fill();ctx.stroke()}
    E(0,-20,13,4.8,'#3d434b');E(0,-24,8,3.2,'#4d545d');R(-5,-21.5,10,2.2,tc.main,1);Ci(0,-14.5,3.6,'#1d2026');Ci(0,-14.5,1.3,tc.main);
    E(0,-8.5,3,4.2,'#59605a');if(at>.2){ctx.fillStyle='rgba(255,180,60,'+at+')';ctx.beginPath();ctx.arc(0,-6,7*at,0,TAU);ctx.fill()}
    break}
  case 'nest':{
    const aa=Math.atan2(Math.sin(u.ang),Math.cos(u.ang)*u.face);
    Ln(-20,-12,-20,-40,2,'#555');Poly([[-20,-40],[-6,-36],[-20,-30]],tc.main);
    ctx.save();ctx.translate(0,-22);Ln(0,0,-7,16,2.2,'#2d2d33');Ln(0,0,7,16,2.2,'#2d2d33');ctx.rotate(clamp(aa,-.8,.8));ctx.translate(-at*4,0);
    Ln(-6,0,26,0,3.8,'#2d2d33');Ln(22,0,31,0,2.4,'#1d1d22');R(-9,-6,12,11,'#41454c',1);if(at>.65)Poly([[31,0],[42,-6],[38,0],[43,4],[31,2]],'#ffd35a');ctx.restore();
    E(-9,-30,5.6,6.4,SK[id%4]);Poly([[-15,-31],[-14,-37],[-9,-39],[-3,-37],[-3,-31]],'#6f7a63');
    R(-26,-12,10,8,'#5c6a45',1);
    for(let k=-2;k<=2;k++)E(k*10,-4,7.5,5,'#c2a878');for(let k=-1;k<=1;k++)E(k*10+0,-11,7.5,5,'#b79c6c');
    break}
  }
  FL=false;ctx.restore();
  if(!icon&&!u.dead&&u.dep<=0&&(u.hp<u.max||u.bld)){const w=u.type==='bruiser'?40:u.bld?34:26,x=u.x-w/2,yy=u.y-(u.alt||0)-u.h*S.sc-8;
    ctx.fillStyle=INK;ctx.fillRect(x-1.5,yy-1.5,w+3,7);ctx.fillStyle='#1b1e23';ctx.fillRect(x,yy,w,4);ctx.fillStyle=tc.main;ctx.fillRect(x,yy,w*Math.max(0,u.hp/u.max),4)}
}
function drawIcon(type,cx,cy,sc){ctx.save();ctx.translate(cx,cy);ctx.scale(sc,sc);
  const mk=(dx,dy,id)=>drawUnit({type,team:0,x:dx,y:dy,alt:0,face:1,phase:0,swing:0,flash:0,dead:false,dep:0,hp:1,max:1,fly:false,id,ang:-.6,h:UT[type].h},true);
  if(type==='rifle'){mk(-12,4,1);mk(12,-4,2)}else if(type==='scrap'){mk(-16,6,0);mk(16,6,1);mk(0,-4,2)}else mk(0,0,type==='bruiser'?0:3);ctx.restore()}

/* ---------- buildings ---------- */
function shooter(t,tc,y){const fl=Math.cos(t.ang)<0?-1:1;ctx.save();ctx.translate(0,y-t.rc*1.5);
  R(-5,-2,10,8,'#4a5a40',2);E(0,-8,5.4,6.2,SK[(t.x|0)%4]);ctx.beginPath();ctx.arc(0,-9,5.9,Math.PI,TAU);ctx.fillStyle=C(tc.main);ctx.fill();ctx.stroke();
  ctx.scale(fl,1);Ln(-4,0,22,-3,3,'#2d2d33');if(t.rc>.6)Poly([[22,-3],[32,-9],[29,-3],[33,0],[22,-1]],'#ffd35a');ctx.restore()}
function drawTower(t){
  const tc=TC[t.team];ctx.save();ctx.translate(t.x,t.y);P();
  if(t.dead){shadow(0,6,34,12);for(let i=0;i<8;i++){const a=i*1.3;Poly([[Math.cos(a)*20-8,Math.sin(a)*8-4],[Math.cos(a)*20+8,Math.sin(a)*8-6],[Math.cos(a)*20+4,Math.sin(a)*8+4]],i%2?'#8c877f':'#7a3f30')}
    const f=Math.sin(G.t*9+t.x);Poly([[-8,0],[-4,-14+f*3],[0,-6],[4,-18-f*2],[8,0]],'#e8792a');Poly([[-4,0],[0,-9+f*2],[4,0]],'#ffd35a');ctx.restore();return}
  FL=t.flash>0;const k=t.kind==='k';
  shadow(0,10,38*(k?1.2:1),13*(k?1.2:1));
  const shade=(x,y,w,h)=>{if(!FL){ctx.fillStyle='rgba(10,10,40,.2)';ctx.fillRect(x,y,w,h)}};
  if(!k){
    R(-26,-58,52,64,'#9b4f3a',2);ctx.strokeStyle='rgba(60,25,20,.4)';ctx.lineWidth=1;for(let r=0;r<7;r++){const y=-54+r*9;ctx.beginPath();ctx.moveTo(-26,y);ctx.lineTo(26,y);ctx.stroke();for(let c=0;c<5;c++){const x=-22+c*11+(r%2)*5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+9);ctx.stroke()}}P();
    shade(-26,-58,14,64);
    for(const [x,y,lit] of [[-18,-48,0],[6,-48,1],[-18,-30,1],[6,-30,0]]){R(x,y,12,14,lit?'#e8c660':'#2a2f3a',1);if(!lit){ctx.strokeStyle='#8a6a42';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y+4);ctx.lineTo(x+12,y+4);ctx.moveTo(x,y+10);ctx.lineTo(x+12,y+10);ctx.stroke();P()}}
    R(-6,-22,12,28,'#3a2b24',2);
    R(-30,-66,60,9,'#6b6f76',2);for(let c=-3;c<=3;c++)E(c*8,-70,5.6,3.6,'#b99f70');
    R(11,-90,14,18,'#6b4a3a',2);Ln(13,-72,13,-66,2,'#444');Ln(23,-72,23,-66,2,'#444');
    R(-33,-56,9,26,tc.main,1);ctx.strokeStyle='#f2f2ee';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-31,-50);ctx.lineTo(-26,-38);ctx.moveTo(-26,-50);ctx.lineTo(-31,-38);ctx.stroke();P();
    shooter(t,tc,-76);
  }else{
    R(-44,-64,88,76,'#7c8189',3);ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1.5;for(let x=-40;x<44;x+=8){ctx.beginPath();ctx.moveTo(x,-62);ctx.lineTo(x,10);ctx.stroke()}P();
    shade(-44,-64,22,76);
    Poly([[-48,-64],[48,-64],[44,-76],[-44,-76]],'#4c5058');
    R(-18,-34,36,46,'#4b5058',2);ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.5;for(let y=-28;y<12;y+=7){ctx.beginPath();ctx.moveTo(-17,y);ctx.lineTo(17,y);ctx.stroke()}P();
    R(-32,-62,64,20,tc.main,2);ctx.font='20px Oswald,"Arial Narrow",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=C('#f4f1e6');ctx.fillText('HQ',0,-51);
    Ln(34,-76,34,-116,2.5,'#444');Poly([[28,-110],[40,-110],[34,-100]],'#b8bcc2');const bl=.5+.5*Math.sin(G.t*4);Ci(34,-118,3,'rgba('+(t.team?'236,90,60':'70,160,210')+','+(.4+.6*bl)+')');
    for(const sx of[-1,1])R(sx*36-5,-84,10,7,'#e8e0a0',1);
    for(let c=-5;c<=5;c++)E(c*9,13,6.4,4.2,'#c2a878');for(let c=-4;c<=4;c++)E(c*9+4,6,6.4,4.2,'#b79c6c');
    if(t.active)shooter(t,tc,-82);
    else{ctx.font='18px Oswald,"Arial Narrow",sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(255,255,255,.9)';ctx.strokeStyle=INK;ctx.lineWidth=3;const z=Math.sin(G.t*2)*3;ctx.strokeText('Zz',30,-92+z);ctx.fillText('Zz',30,-92+z)}
  }
  FL=false;ctx.restore();
  const w=k?64:50,x=t.x-w/2,y=t.y-(k?128:100);
  ctx.fillStyle=INK;ctx.fillRect(x-2,y-2,w+4,12);ctx.fillStyle='#1b1e23';ctx.fillRect(x,y,w,8);ctx.fillStyle=tc.main;ctx.fillRect(x,y,w*t.hp/t.max,8);
  ctx.font='14px Oswald,"Arial Narrow",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=3;ctx.strokeStyle=INK;ctx.fillStyle='#fff';const tx=''+Math.ceil(t.hp);ctx.strokeText(tx,t.x,y-9);ctx.fillText(tx,t.x,y-9)
}

/* ---------- UI drawing ---------- */
function crownIcon(x,y,s,on,col){ctx.save();ctx.translate(x,y);ctx.scale(s,s);P();Poly([[-12,6],[-14,-10],[-6,-3],[0,-14],[6,-3],[14,-10],[12,6]],on?col:'#4a4038');ctx.restore()}
function cardRect(i){return{x:CX0+i*(CW+CGAP),y:HAND_Y+(G.sel===i?-12:0),w:CW,h:CH}}
function drawElixirDrop(x,y,r,txt){ctx.save();ctx.translate(x,y);P();ctx.beginPath();ctx.arc(0,0,r*1.15,0,TAU);ctx.fillStyle='#e0b53a';ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.arc(0,0,r*.88,0,TAU);ctx.strokeStyle='#a8801f';ctx.lineWidth=1.4;ctx.stroke();ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.ellipse(-r*.35,-r*.4,r*.3,r*.16,-.6,0,TAU);ctx.fill();
  if(txt!=null){ctx.font=(r*1.15)+'px Oswald,"Arial Narrow",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=3.2;ctx.strokeStyle=INK;ctx.fillStyle='#fff';ctx.strokeText(txt,0,r*.1);ctx.fillText(txt,0,r*.1)}ctx.restore()}
function shellShape(){Poly([[-16,-5],[8,-5],[18,0],[8,5],[-16,5]],'#6b705f');Poly([[8,-5],[18,0],[8,5]],'#b5622f');Poly([[-16,-5],[-22,-10],[-12,-5]],'#4d5246');Poly([[-16,5],[-22,10],[-12,5]],'#4d5246');R(-4,-5,3,10,'#d6b64a',0)}
function drawFireballIcon(cx,cy,s){ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);P();ctx.strokeStyle='rgba(200,200,200,.5)';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-14,-20);ctx.lineTo(-30,-44);ctx.stroke();P();ctx.rotate(1.0);shellShape();ctx.restore()}
function drawCard(i){const k=G.hand[i],C_=CARDS[k],r=cardRect(i),can=G.el[0]>=C_.cost,sel=G.sel===i;
  ctx.save();P();
  const g=ctx.createLinearGradient(0,r.y,0,r.y+r.h);g.addColorStop(0,'#eceadf');g.addColorStop(1,'#cfcabb');
  ctx.beginPath();ctx.roundRect(r.x,r.y,r.w,r.h,10);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=sel?'#ffe38a':INK;ctx.lineWidth=sel?5:3.5;ctx.stroke();
  ctx.save();ctx.beginPath();ctx.roundRect(r.x+6,r.y+6,r.w-12,r.h-34,7);ctx.fillStyle=C_.spell?'#4a4038':'#59636d';ctx.fill();P();ctx.lineWidth=2;ctx.stroke();ctx.clip();
  if(C_.spell)drawFireballIcon(r.x+r.w/2,r.y+r.h*.48,1.3);else drawIcon(k,r.x+r.w/2,r.y+r.h*.67,{brawler:1,rifle:.95,scrap:.9,bruiser:.7,molo:1,drone:1.5,nest:1.3}[k]);ctx.restore();
  ctx.font='15px Oswald,"Arial Narrow",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=INK;ctx.fillText(C_.spell?'Airstrike':UT[k].name,r.x+r.w/2,r.y+r.h-14);
  if(!can){ctx.fillStyle='rgba(20,10,0,.5)';ctx.beginPath();ctx.roundRect(r.x,r.y,r.w,r.h,10);ctx.fill()}
  drawElixirDrop(r.x+14,r.y+16,11,C_.cost);ctx.restore()}
function drawHUD(){
  const ey=AH+14,ex=14,ew=W-28;ctx.save();P();
  ctx.fillStyle='#1a1008';ctx.beginPath();ctx.roundRect(ex+22,ey,ew-22,26,13);ctx.fill();ctx.stroke();
  const fw=(ew-34)*(G.el[0]/10);const eg=ctx.createLinearGradient(0,ey,0,ey+26);eg.addColorStop(0,'#86d86e');eg.addColorStop(1,'#3f9a3a');
  if(fw>1){ctx.beginPath();ctx.roundRect(ex+26,ey+3,Math.max(10,fw),20,10);ctx.fillStyle=eg;ctx.fill()}
  ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=2;for(let i=1;i<10;i++){const x=ex+26+(ew-34)*i/10;ctx.beginPath();ctx.moveTo(x,ey+4);ctx.lineTo(x,ey+22);ctx.stroke()}
  drawElixirDrop(ex+12,ey+13,12,Math.floor(G.el[0]));ctx.restore();
  const nk=G.queue[0],nc=CARDS[nk];ctx.save();P();ctx.lineWidth=3;
  ctx.font='12px Oswald,"Arial Narrow",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#d8c39a';ctx.fillText('NEXT',40,HAND_Y+4);
  ctx.beginPath();ctx.roundRect(12,HAND_Y+12,56,74,8);ctx.fillStyle='#d8d4c6';ctx.fill();ctx.stroke();
  ctx.save();ctx.beginPath();ctx.roundRect(12,HAND_Y+12,56,74,8);ctx.clip();if(nc.spell)drawFireballIcon(40,HAND_Y+54,.8);else drawIcon(nk,40,HAND_Y+78,{brawler:.62,rifle:.58,scrap:.52,bruiser:.45,molo:.62,drone:.9,nest:.8}[nk]);ctx.restore();
  drawElixirDrop(24,HAND_Y+28,8,nc.cost);ctx.restore();
  for(let i=0;i<4;i++)drawCard(i);
  const m=Math.max(0,(G.ot?MATCH+OT:MATCH)-G.t),mm=Math.floor(m/60),ss=Math.floor(m%60);
  ctx.save();P();ctx.beginPath();ctx.roundRect(W/2-52,8,104,34,10);ctx.fillStyle='rgba(30,20,12,.82)';ctx.fill();ctx.stroke();
  ctx.font='24px Oswald,"Arial Narrow",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=m<20?'#ff8a7a':'#fff';ctx.fillText(mm+':'+String(ss).padStart(2,'0'),W/2,26);
  if(G.t>=MATCH-60||G.ot){ctx.font='12px Oswald,"Arial Narrow",sans-serif';ctx.lineWidth=3;ctx.strokeStyle=INK;ctx.strokeText(G.ot?'OVERTIME 2x':'DOUBLE PAYDAY',W/2,54);ctx.fillStyle='#86d86e';ctx.fillText(G.ot?'OVERTIME 2x':'DOUBLE PAYDAY',W/2,54)}
  // crowns: left = enemy crowns won against you (red), right = yours
  for(const [x,team] of [[14,1],[W-14-106,0]]){ctx.beginPath();ctx.roundRect(x,8,106,34,10);ctx.fillStyle='rgba(30,20,12,.82)';ctx.fill();ctx.stroke();
    for(let i=0;i<3;i++)crownIcon(x+22+i*31,26,1.05,i<G.crowns[team],team?'#ff7a6a':'#7fb2ff')}
  ctx.restore()}

/* ---------- render ---------- */
function render(){
  ctx.setTransform(RES,0,0,RES,0,0);
  ctx.save();if(G.shake>0)ctx.translate((Math.random()-.5)*G.shake*16,(Math.random()-.5)*G.shake*16);
  ctx.drawImage(bg,0,0,W,H);
  ctx.strokeStyle='rgba(210,235,220,.35)';ctx.lineWidth=2.5;ctx.lineCap='round';for(let i=0;i<14;i++){const x=((i*83+G.t*22)%(W+60))-30,y=RIV+Math.sin(i*2.1+G.t*1.6)*13;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+16,y);ctx.stroke()}
  ctx.fillStyle='rgba(20,40,10,.08)';for(let i=0;i<3;i++){const cx=((G.t*8+i*260)%(W+300))-150;ctx.beginPath();ctx.ellipse(cx,160+i*250,120,34,0,0,TAU);ctx.fill()}
  const card=G.sel>=0?CARDS[G.hand[G.sel]]:null;
  if(card&&G.running){const ok=G.el[0]>=card.cost;
    if(card.spell){if(mouse.in&&mouse.y<AH){ctx.strokeStyle='#ff9a3e';ctx.fillStyle='rgba(255,120,40,.2)';ctx.lineWidth=3;ctx.setLineDash([8,5]);ctx.beginPath();ctx.arc(clamp(mouse.x,10,W-10),clamp(mouse.y,10,AH-10),72,0,TAU);ctx.fill();ctx.stroke();ctx.setLineDash([])}}
    else{ctx.fillStyle=ok?'rgba(255,255,255,.14)':'rgba(255,60,40,.12)';ctx.fillRect(0,RIV+RW/2+6,W,AH-RIV-RW/2-6);ctx.fillStyle='rgba(255,40,30,.12)';ctx.fillRect(0,0,W,RIV-RW/2-6)}}
  const items=[];
  for(const t of G.towers)items.push([t.dead?t.y-100:t.y+10,()=>drawTower(t)]);
  for(const u of G.units)items.push([u.fly?u.y+1200:u.y,()=>drawUnit(u)]);
  items.sort((a,b)=>a[0]-b[0]);for(const it of items)it[1]();
  if(card&&G.running&&mouse.in&&mouse.y<AH&&!card.spell){const k=G.hand[G.sel],ok=zoneOK(0,mouse.x,mouse.y)&&G.el[0]>=card.cost,S=UT[k];ctx.save();ctx.globalAlpha=ok?.7:.3;
    const offs=S.n===1?[[0,0]]:S.n===2?[[-15,0],[15,4]]:[[-16,4],[16,4],[0,-14]];
    for(const o of offs)drawUnit({type:k,team:0,x:mouse.x+o[0],y:mouse.y+o[1],alt:S.fly?ALT:0,face:1,phase:0,swing:0,flash:0,dead:false,dep:0,hp:1,max:1,fly:!!S.fly,id:3,ang:-1,h:S.h},true);
    ctx.restore()}
  for(const p of G.proj){
    if(p.k==='arrow'||p.k==='ball'){const L=p.k==='ball'?12:18;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a||0);ctx.lineCap='round';ctx.strokeStyle=TC[p.team].light;ctx.globalAlpha=.55;ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(-L,0);ctx.lineTo(0,0);ctx.stroke();ctx.globalAlpha=1;ctx.strokeStyle='#fff3b0';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-L*.6,0);ctx.lineTo(3,0);ctx.stroke();ctx.restore()}
    else if(p.k==='magic'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(G.t*14);P();Poly([[-3,-8],[3,-8],[4,2],[-4,2]],'#4f8f5a');R(-1.6,-12,3.2,5,'#3d7a49',1);Poly([[-2.4,-12],[0,-19],[2.4,-12]],'#f08a2a');ctx.restore()}
    else if(p.k==='flame'){ctx.save();P();Ci(p.x,p.y,5,'#59605a');Poly([[p.x-2,p.y-4],[p.x,p.y-10+Math.sin(G.t*30)*2],[p.x+2,p.y-4]],'#f08a2a');ctx.restore()}
    else if(p.k==='fire'){const k=Math.min(1,p.t/p.dur),x=lerp(p.tx+240,p.tx,k),y=lerp(p.ty-520,p.ty,k);
      ctx.strokeStyle='rgba(255,120,40,.6)';ctx.lineWidth=2.5;ctx.setLineDash([6,5]);ctx.beginPath();ctx.arc(p.tx,p.ty,72,0,TAU);ctx.stroke();ctx.setLineDash([]);
      ctx.strokeStyle='rgba(205,205,205,.5)';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+110,y-150);ctx.stroke();ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(150,-110));ctx.scale(1.4,1.4);P();shellShape();ctx.restore()}
  }
  for(const p of G.parts){const k=p.life/p.max;
    if(p.col==='ring'){ctx.strokeStyle='rgba(255,230,160,'+k+')';ctx.lineWidth=5*k;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*(1-k*.5),p.r*(1-k*.5)*.7,0,0,TAU);ctx.stroke();continue}
    ctx.globalAlpha=Math.min(1,k*1.4);ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(p.x,p.y,p.r*(.5+k*.5),0,TAU);ctx.fill();ctx.globalAlpha=1}
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
  for(const x of G.texts){ctx.font=(x.big?26:20)+'px Oswald,"Arial Narrow",sans-serif';ctx.globalAlpha=Math.min(1,x.life*2);ctx.lineWidth=5;ctx.strokeStyle=INK;ctx.strokeText(x.txt,x.x,x.y);ctx.fillStyle=x.col;ctx.fillText(x.txt,x.x,x.y);ctx.globalAlpha=1}
  if(G.banner>0){ctx.globalAlpha=Math.min(1,G.banner);ctx.font='44px Oswald,"Arial Narrow",sans-serif';ctx.lineWidth=7;ctx.strokeStyle=INK;const m=G.ot?'OVERTIME!':'DOUBLE PAYDAY!';ctx.strokeText(m,W/2,AH/2-120);ctx.fillStyle='#86d86e';ctx.fillText(m,W/2,AH/2-120);ctx.globalAlpha=1}
  if(G.hurt>0){ctx.fillStyle='rgba(220,40,30,'+G.hurt*1.2+')';ctx.fillRect(0,0,W,AH)}
  ctx.restore();
  drawHUD();
  if(G.paused){ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,0,W,H);ctx.font='64px Oswald,"Arial Narrow",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=8;ctx.strokeStyle=INK;ctx.strokeText('Paused',W/2,H/2);ctx.fillStyle='#f4b73a';ctx.fillText('Paused',W/2,H/2)}
}

/* ---------- input ---------- */
function pos(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
function cardAt(x,y){for(let i=0;i<4;i++){const r=cardRect(i);if(x>=r.x&&x<=r.x+r.w&&y>=HAND_Y-14&&y<=HAND_Y+CH+6)return i}return -1}
function tryPlay(x,y){if(G.sel<0)return;const k=G.hand[G.sel],C_=CARDS[k];
  if(G.el[0]<C_.cost){toast(W/2,AH-40,'Not enough cash','#ff9a8a');return}
  if(!C_.spell&&!zoneOK(0,x,y)){toast(x,y,'Deploy on your side','#ff9a8a');return}
  if(playCard(0,G.sel,x,y))G.sel=-1}
cv.addEventListener('pointerdown',e=>{if(!G.running||G.paused)return;const p=pos(e);mouse.x=p.x;mouse.y=p.y;mouse.in=true;
  const ci=cardAt(p.x,p.y);
  if(ci>=0){const same=G.sel===ci;G.sel=same?-1:ci;G.drag=!same;G.dragMoved=false;G.downX=p.x;G.downY=p.y;try{cv.setPointerCapture(e.pointerId)}catch(_){}return}
  if(G.sel>=0&&p.y<AH)tryPlay(p.x,p.y)});
cv.addEventListener('pointermove',e=>{const p=pos(e);mouse.x=p.x;mouse.y=p.y;mouse.in=true;if(G.drag&&dist(p.x,p.y,G.downX,G.downY)>16)G.dragMoved=true});
cv.addEventListener('pointerup',e=>{const p=pos(e);if(G.drag){G.drag=false;if(G.dragMoved&&p.y<AH)tryPlay(p.x,p.y)}});
cv.addEventListener('pointerleave',()=>{mouse.in=false});
cv.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{if(!G.running)return;if(e.key>='1'&&e.key<='4'){const i=+e.key-1;G.sel=G.sel===i?-1:i}else if(e.key==='Escape')G.sel=-1;else if(e.key==='p'||e.key===' '){e.preventDefault();togglePause()}});

/* ---------- screens ---------- */
const ov=$('ov'),ovc=$('ovcard'),bPause=$('bPause');
function showMenu(){ovc.innerHTML='<h1>Hollowgate<br>Block War</h1><p class="tip">Two crews, one dead-end neighborhood. Eastside Watch (you, blue) against Rust Road Militia (red). Push across the canal, take out their outposts, and burn down their HQ.</p>'+
  '<ul>'+Object.keys(CARDS).map(k=>'<li><b>'+(CARDS[k].spell?'Airstrike':UT[k].name)+'</b> $'+CARDS[k].cost+'. '+CARDS[k].info+'</li>').join('')+'</ul>'+
  '<p class="tip small">Tap a card, then tap your side of the street. Or drag a card onto it.</p>'+
  '<div class="row">'+Object.keys(DIFF).map(d=>'<button class="btn go'+(d==='normal'?' on':'')+'" data-d="'+d+'" type="button">'+DIFF[d].name+'</button>').join('')+'</div>';
  ov.hidden=false;bPause.hidden=true}
function showEnd(res){const t={win:'Block secured',lose:'Overrun',draw:'Stalemate'}[res];
  ovc.innerHTML='<h1 class="'+res+'">'+t+'</h1><p>'+{win:'Rust Road has packed it in. For tonight.',lose:'Eastside has seen better days.',draw:'Nobody wins. Everybody has a headache.'}[res]+' Outposts: you '+G.crowns[0]+', them '+G.crowns[1]+'.</p><div class="row"><button class="btn go on" data-d="'+G.diff+'" type="button">Rematch</button><button class="btn" id="bMenu" type="button">Menu</button></div>';
  ov.hidden=false;bPause.hidden=true}
ov.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.id==='bMenu'){showMenu();return}
  if(b.dataset.d)start(b.dataset.d)});
function start(d){reset(d);G.running=true;ov.hidden=true;bPause.hidden=false;bPause.textContent='Pause'}
function togglePause(){if(!G.running)return;G.paused=!G.paused;bPause.textContent=G.paused?'Resume':'Pause'}
bPause.addEventListener('click',togglePause);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.running&&!G.paused)togglePause()});

/* ---------- loop ---------- */
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;
  if(G.running&&!G.paused)update(dt);else G.t+=dt*.5;
  render();requestAnimationFrame(frame)}
showMenu();requestAnimationFrame(frame);
if(location.search.includes('debug'))window.__hg={G:()=>G,update,start,playCard,hit,endGame};
})();
