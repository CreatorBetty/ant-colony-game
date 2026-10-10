(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const foodCountEl = document.getElementById('foodCount');
  const antCountEl = document.getElementById('antCount');
  const toast = document.getElementById('toast');
  const antImg = new Image(); antImg.src = 'images/ant.png';
  const keys = new Set();
  let W=800,H=450,dpr=1,stored=0, ants=[], berries=[], particles=[], time=0, toastTimer=0;
  const nest={x:0,y:0,r:43};
  const colors=['#e94f55','#d7a52e','#b65a99','#6a92d7','#8bba63'];
  function resize(){const rect=canvas.getBoundingClientRect();dpr=Math.min(window.devicePixelRatio||1,2);W=rect.width;H=rect.height;canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);nest.x=W*.19;nest.y=H*.58; if(!ants.length) resetAnts();}
  function resetAnts(){ants=[{x:nest.x+18,y:nest.y,vx:0,vy:0,carry:false,color:colors[0],player:true,phase:0}];for(let i=0;i<2;i++)ants.push({x:nest.x+(Math.random()-.5)*35,y:nest.y+(Math.random()-.5)*35,vx:0,vy:0,carry:false,color:colors[i+1],player:false,phase:Math.random()*8});}
  function spawnBerries(n=15){berries=[];for(let i=0;i<n;i++){berries.push({x:W*.48+Math.random()*W*.45,y:35+Math.random()*(H-70),r:6+Math.random()*3,got:false,phase:Math.random()*6});}}
  function showToast(s){toast.textContent=s;toast.style.opacity='1';toastTimer=2.5;}
  function reset(){stored=0;resetAnts();spawnBerries();updateStats();showToast('Find a berry! 🍓');}
  function updateStats(){foodCountEl.textContent=stored;antCountEl.textContent=ants.length;document.getElementById('addAnt').disabled=stored<5;}
  function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
  function nearestBerry(a){let best=null,bd=Infinity;for(const b of berries){if(!b.got){let d=dist(a,b);if(d<bd){bd=d;best=b;}}}return best;}
  function stepAnt(a,dt){a.phase+=dt*8;if(a.player){let dx=0,dy=0;if(keys.has('arrowleft')||keys.has('a'))dx--;if(keys.has('arrowright')||keys.has('d'))dx++;if(keys.has('arrowup')||keys.has('w'))dy--;if(keys.has('arrowdown')||keys.has('s'))dy++;const m=Math.hypot(dx,dy)||1;a.vx=dx/m*145;a.vy=dy/m*145;a.x+=a.vx*dt;a.y+=a.vy*dt;}else{let target=a.carry?nest:nearestBerry(a);if(target){let dx=target.x-a.x,dy=target.y-a.y,d=Math.hypot(dx,dy)||1;a.vx=dx/d*49;a.vy=dy/d*49;a.x+=a.vx*dt;a.y+=a.vy*dt;if(!a.carry&&d<13){target.got=true;a.carry=true;}if(a.carry&&dist(a,nest)<nest.r+8){a.carry=false;stored++;updateStats();showToast('Your ants brought home food! 🍓');}}}
    a.x=Math.max(12,Math.min(W-12,a.x));a.y=Math.max(30,Math.min(H-12,a.y));
    if(a.player&&!a.carry){for(const b of berries){if(!b.got&&dist(a,b)<b.r+13){b.got=true;a.carry=true;showToast('Berry collected! Return to the nest.');break;}}}
    if(a.player&&a.carry&&dist(a,nest)<nest.r+10){a.carry=false;stored++;updateStats();showToast('Food stored! Nice work!');}
  }
  function ellipse(x,y,rx,ry,fill,stroke){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
  function drawBackground(){ctx.fillStyle='#b8dca0';ctx.fillRect(0,0,W,H);for(let i=0;i<170;i++){let x=(i*83.17+23)%W,y=(i*47.73+19)%H;ctx.strokeStyle=i%2?'#8fc57e':'#cde6b7';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+2,y-4);ctx.stroke();} // winding path
    ctx.beginPath();ctx.moveTo(nest.x+20,nest.y+8);ctx.bezierCurveTo(W*.37,H*.42,W*.39,H*.75,W*.52,H*.48);ctx.bezierCurveTo(W*.65,H*.2,W*.69,H*.7,W*.83,H*.52);ctx.strokeStyle='#d8d6a0';ctx.lineWidth=30;ctx.lineCap='round';ctx.stroke();ctx.strokeStyle='#e6e0b0';ctx.lineWidth=22;ctx.stroke();}
  function drawNest(){ellipse(nest.x,nest.y+10,52,36,'#a56c48');ellipse(nest.x,nest.y+3,44,30,'#c88b5b');ellipse(nest.x,nest.y-4,32,22,'#70472f');ellipse(nest.x,nest.y-7,22,13,'#50372b');ctx.fillStyle='#f7d58b';ctx.font='900 18px Nunito, sans-serif';ctx.textAlign='center';ctx.fillText('👑',nest.x,nest.y-27);}
  function drawBerry(b){let bob=Math.sin(time*2+b.phase)*2;ctx.save();ctx.translate(b.x,b.y+bob);ctx.fillStyle='#df5361';ctx.beginPath();ctx.moveTo(0,-b.r);ctx.bezierCurveTo(b.r*1.5,-b.r*1.2,b.r*1.5,b.r*.5,0,b.r*1.4);ctx.bezierCurveTo(-b.r*1.4,b.r*.4,-b.r*1.4,-b.r,0,-b.r);ctx.fill();ctx.fillStyle='#4f9850';ctx.beginPath();ctx.ellipse(-3,-b.r,4,2,-.5,0,Math.PI*2);ctx.ellipse(3,-b.r,4,2,.5,0,Math.PI*2);ctx.fill();ctx.restore();}
  function drawAnt(a){ctx.save();ctx.translate(a.x,a.y);let angle=Math.atan2(a.vy,a.vx);if(Math.hypot(a.vx,a.vy)>3)ctx.rotate(angle+Math.PI/2);const bob=Math.sin(a.phase)*1.4; // simple illustrated ant
    ctx.strokeStyle='#8b3436';ctx.lineWidth=2;ctx.lineCap='round';for(let s of [-1,1]){for(let j=0;j<3;j++){ctx.beginPath();ctx.moveTo(s*4,2+j*3);ctx.lineTo(s*(10+j),6+j*4+bob);ctx.lineTo(s*(13+j),3+j*4);ctx.stroke();}}
    ctx.strokeStyle='#a73a40';ctx.beginPath();ctx.moveTo(-4,-7);ctx.quadraticCurveTo(-12,-18,-13,-17);ctx.moveTo(4,-7);ctx.quadraticCurveTo(12,-18,13,-17);ctx.stroke();
    if(antImg.complete&&antImg.naturalWidth){ctx.drawImage(antImg,-17,-25,34,50);}else{ellipse(0,10,8,11,'#5b302b');ellipse(0,-2,9,10,a.color);ellipse(0,-14,10,10,a.color);ellipse(-3,-15,1.8,2.5,'#272322');ellipse(3,-15,1.8,2.5,'#272322');}
    if(a.carry){ctx.rotate(-angle-Math.PI/2);ctx.font='15px serif';ctx.fillText('🍓',9,-19);}if(a.player){ctx.rotate(-angle-Math.PI/2);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.stroke();}
    ctx.restore();}
  function frame(ts){if(!frame.last)frame.last=ts;let dt=Math.min((ts-frame.last)/1000,.04);frame.last=ts;time+=dt;for(const a of ants)stepAnt(a,dt);if(berries.filter(b=>!b.got).length<4){for(let i=0;i<4;i++)berries.push({x:W*.5+Math.random()*W*.43,y:35+Math.random()*(H-70),r:7,got:false,phase:Math.random()*6});}drawBackground();drawNest();berries.forEach(b=>!b.got&&drawBerry(b));ants.forEach(drawAnt);if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)toast.style.opacity='.0';}requestAnimationFrame(frame);}
  window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();keys.add(k);});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());window.addEventListener('resize',()=>{resize();spawnBerries();});
  document.getElementById('addAnt').addEventListener('click',()=>{if(stored>=5){stored-=5;ants.push({x:nest.x,y:nest.y,vx:0,vy:0,carry:false,color:colors[ants.length%colors.length],player:false,phase:Math.random()*8});updateStats();showToast('A new worker joined the colony! 🐜');}});
  document.getElementById('reset').addEventListener('click',reset);
  // Optional click-to-move, useful on touchscreens
  canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect(),a=ants.find(x=>x.player);if(!a)return;const tx=e.clientX-r.left,ty=e.clientY-r.top;keys.clear();const dx=tx-a.x,dy=ty-a.y,d=Math.hypot(dx,dy)||1;a.x+=dx/d*Math.min(d,35);a.y+=dy/d*Math.min(d,35);});
  resize();spawnBerries();updateStats();requestAnimationFrame(frame);
})();
