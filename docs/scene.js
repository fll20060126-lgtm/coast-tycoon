(()=>{
 const zone=document.querySelector('.board-zone');
 const lagoon=document.querySelector('.center-lagoon');
 const scenery=document.createElement('div');scenery.className='island-scenery';scenery.setAttribute('aria-hidden','true');
 scenery.innerHTML='<div class="sea-light"></div><div class="sea-ripple ripple-one"></div><div class="sea-ripple ripple-two"></div>';
 zone.prepend(scenery);
 const boat=document.createElement('div');boat.className='lagoon-boat';boat.setAttribute('aria-hidden','true');
 boat.innerHTML='<svg viewBox="0 0 100 100"><ellipse cx="50" cy="88" rx="34" ry="5" fill="#fff" opacity=".5"/><path d="M20 76H83L69 87H35Z" fill="#935c36" stroke="#fff2ce" stroke-width="3"/><path d="M53 12V77" stroke="#775336" stroke-width="3"/><path d="M48 17L17 69H48Z" fill="#fff6d5" stroke="#d9b477" stroke-width="2"/><path d="M57 26L80 67H57Z" fill="#35a8b5" stroke="#e9f5e1" stroke-width="2"/></svg>';
 lagoon.append(boat);
 const garden=document.createElement('div');garden.className='town-garden';garden.setAttribute('aria-hidden','true');garden.innerHTML='<span></span><span></span><span></span>';
 lagoon.append(garden);
 function fit(){const v=window.visualViewport;document.documentElement.style.setProperty('--scene-height',(v?v.height:innerHeight)+'px')}
 window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);fit();


 const mapHud=document.createElement('div');mapHud.className='map-condition';
 const forecast=document.createElement('span');forecast.id='mapForecast';
 const manage=document.createElement('button');manage.textContent='经营策略';manage.onclick=requestMapPlan;
 const preview=document.createElement('button');preview.textContent='四季地图';
 mapHud.append(forecast,manage,preview);zone.append(mapHud);
 const atmosphere=document.createElement('div');atmosphere.className='map-atmosphere';atmosphere.setAttribute('aria-hidden','true');
 for(let i=0;i<12;i++){const particle=document.createElement('i');particle.style.setProperty('--n',i);atmosphere.append(particle)}zone.append(atmosphere);
 const gallery=document.createElement('dialog');gallery.id='mapGallery';
 const galleryHead=document.createElement('div');galleryHead.className='gallery-heading';const title=document.createElement('h2');title.textContent='四季经营之旅';const close=document.createElement('button');close.textContent='返回游戏';close.onclick=()=>gallery.close();galleryHead.append(title,close);gallery.append(galleryHead);
 const galleryCards=document.createElement('div');galleryCards.className='map-gallery-cards';
 MAPS.forEach((map,i)=>{const card=document.createElement('article');const image=document.createElement('img');image.src='assets/'+map.scene;image.alt=CHAPTERS[i].name+'场景';image.loading='lazy';const heading=document.createElement('h3');heading.textContent=CHAPTERS[i].icon+' '+CHAPTERS[i].name;const text=document.createElement('p');text.textContent=map.tip;const lock=document.createElement('small');lock.dataset.stage=i;card.append(image,heading,text,lock);galleryCards.append(card)});gallery.append(galleryCards);document.body.append(gallery);
 preview.onclick=()=>{gallery.querySelectorAll('small[data-stage]').forEach(el=>{const i=Number(el.dataset.stage);el.textContent=i<=progress.unlocked?'已解锁 · 从“关卡”菜单开始':'通关上一关后解锁 · 当前仅预览场景'});gallery.showModal()};
 function renderMapWorld(){
  const map=mapData(),screen=document.getElementById('gameScreen');screen.dataset.map=map.key;
  screen.style.setProperty('--world-image','url("assets/'+map.scene+'")');
  screen.style.setProperty('--world-accent',map.accent);screen.style.setProperty('--world-paper',map.paper);screen.style.setProperty('--world-ink',map.ink);
  screen.classList.toggle('weather-active',s.stage===3&&s.round%4===0);
  forecast.textContent=mapForecast()+(activeMapPlan(0)?' · '+map.plan.name+'生效中':'');
  manage.textContent=map.plan?(activeMapPlan(0)?'经营计划 ✓':map.plan.name):'经营提示';
  manage.title=map.plan?map.plan.desc:map.tip;
 }
 const illustrations={
 start:'<ellipse cx="50" cy="65" rx="43" ry="13" fill="#6ac6ce"/><ellipse cx="51" cy="60" rx="33" ry="12" fill="#f5dc96"/><path d="M49 60Q55 35 45 19" fill="none" stroke="#a77a43" stroke-width="7"/><path d="M46 24Q20 7 13 31Q32 22 46 28M46 24Q63 0 83 22Q63 17 47 28M46 24Q17 27 22 45Q35 31 47 29M47 24Q72 22 76 43Q60 30 47 29" fill="#549951"/><path d="M38 68h27l-6-5m6 5-6 5" fill="none" stroke="#dc6750" stroke-width="4"/>',
 chance:'<g transform="rotate(-13 36 42)"><rect x="13" y="14" width="39" height="56" rx="6" fill="#d65e52" stroke="#fff1da" stroke-width="3"/><text x="32" y="54" fill="white" font-size="39" text-anchor="middle" font-family="sans-serif" font-weight="bold">?</text></g><g transform="rotate(13 66 42)"><rect x="47" y="13" width="39" height="56" rx="6" fill="#4d90bf" stroke="#fff1da" stroke-width="3"/><text x="66" y="53" fill="white" font-size="39" text-anchor="middle" font-family="sans-serif" font-weight="bold">?</text></g>',
 rest:'<ellipse cx="50" cy="66" rx="43" ry="11" fill="#76ab60"/><ellipse cx="52" cy="61" rx="29" ry="11" fill="#e4d5a3"/><ellipse cx="52" cy="58" rx="23" ry="8" fill="#66c6d5"/><path d="M48 56V35h8v21" fill="#cbe1d8"/><ellipse cx="52" cy="34" rx="16" ry="6" fill="#d8e7d4"/><path d="M39 32Q41 12 52 20Q64 10 66 33M52 19V42" fill="none" stroke="#9ce2ed" stroke-width="4"/><path d="M16 60V37" stroke="#8d6841" stroke-width="4"/><circle cx="16" cy="31" r="12" fill="#4c945b"/>',
 storm:'<ellipse cx="50" cy="66" rx="40" ry="10" fill="#4d657a"/><path d="M15 47Q8 26 30 25Q39 5 56 22Q80 14 85 39Q95 56 69 56H30Q15 56 15 47" fill="#b7c9d4" stroke="#dfe9ec" stroke-width="2"/><path d="M51 36L36 56H49L43 77L67 49H53L62 36Z" fill="#ffd264"/><path d="M22 60l-5 7m60-7-5 7" stroke="#82c8e1" stroke-width="3"/>',
 tax:'<path d="M13 30L50 10L88 30Z" fill="#e1bc78"/><path d="M20 34H80V63H20Z" fill="#f6e8c6"/><path d="M26 34V62M43 34V62M60 34V62M75 34V62" stroke="#c2a168" stroke-width="6"/><path d="M12 67H88" stroke="#d8bd86" stroke-width="9"/><circle cx="50" cy="23" r="5" fill="#fff1ba"/>'
 };

 const buildingNames=['海边小屋','双层住宅','花园公寓','海湾酒店'];
 function propertyBuilding(level,color){
  const high=[23,34,43,50][level],roof=62-high;
  let windows='';for(let y=roof+10;y<60;y+=11)for(let x=21;x<52;x+=12)windows+='<rect x="'+x+'" y="'+y+'" width="6" height="7" rx="1" fill="#ffe5a0" stroke="#8b9b9233"/>';
  const cap=level===0?'<path d="M7 '+(roof+6)+'L33 '+(roof-10)+'L69 '+(roof+5)+'L45 '+(roof+18)+'Z" fill="#da8865"/><path d="M33 '+(roof-10)+'L69 '+(roof+5)+'L69 '+(roof+10)+'L33 '+(roof-5)+'Z" fill="#a85c47"/>':'<path d="M10 '+roof+'L32 '+(roof-8)+'L68 '+roof+'L48 '+(roof+9)+'Z" fill="#e9d9b0" stroke="#baad91"/>';
  return '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="41" cy="70" rx="34" ry="7" fill="#25493a22"/><path d="M13 '+roof+'H48V66H13Z" fill="'+color+'"/><path d="M48 '+roof+'L67 '+(roof-7)+'V57L48 66Z" fill="'+color+'"/><path d="M48 '+roof+'L67 '+(roof-7)+'V57L48 66Z" fill="#133e4a" opacity=".3"/>'+windows+'<path d="M28 66V54H39V66" fill="#765f49"/>'+cap+(level===3?'<rect x="19" y="15" width="24" height="12" rx="2" fill="#fff5cb"/><text x="31" y="24" text-anchor="middle" font-size="10" fill="#b1813e" font-weight="bold">H</text>':'')+'</svg>';
 }

 function fitPieces(){
  document.querySelectorAll('#board .tile').forEach(tile=>{
   const count=tile.querySelectorAll('.token').length;
   tile.classList.toggle('has-pawn',count>0);
   if(count){const h=tile.clientHeight,w=tile.clientWidth;const width=Math.min(34,w*.29/Math.max(1,count),h*.65*.77);tile.style.setProperty('--piece-width',width+'px');tile.style.setProperty('--piece-height',(width/.77)+'px');tile.style.setProperty('--piece-label-size',Math.max(6,Math.min(12,w*.68/4.5))+'px');tile.style.setProperty('--piece-price-size',Math.max(6,Math.min(10,w*.68/5.5))+'px')}
  })
 }
 new ResizeObserver(fitPieces).observe(document.getElementById('board'));
 window.addEventListener('resize',fitPieces);
 function decorateTiles(){
  const nodes=document.querySelectorAll('#board .tile');
  nodes.forEach((tile,i)=>{
   const info=tiles[i];if(!info)return;
   if(!tile.querySelector('.tile-caption')){
    const caption=document.createElement('div');caption.className='tile-caption';
    caption.append(tile.querySelector('.label'),tile.querySelector('.price'));tile.append(caption);
    const edge=document.createElement('div');edge.className='tile-front-edge';edge.setAttribute('aria-hidden','true');tile.append(edge);
   }
   if(info.type!=='land'&&!tile.querySelector('.special-art')){
    const art=document.createElement('div');art.className='special-art';art.setAttribute('aria-hidden','true');
    art.innerHTML='<svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">'+(info.type==='duel'?'<ellipse cx="50" cy="74" rx="35" ry="7" fill="#744c2922"/><path d="M22 62L68 15L79 26L32 72Z" fill="#d5e4e5" stroke="#6d8a8b" stroke-width="2"/><path d="M28 18L76 64L65 75L18 29Z" fill="#e7eef0" stroke="#6d8a8b" stroke-width="2"/><path d="M17 55L39 77M57 74L81 49" stroke="#e5b24f" stroke-width="8" stroke-linecap="round"/><path d="M15 76L26 64M69 65L82 78" stroke="#84613d" stroke-width="8" stroke-linecap="round"/>':info.type==='supply'?'<ellipse cx="50" cy="74" rx="36" ry="7" fill="#5c397233"/><path d="M18 35L75 29L86 39V69L30 78L18 65Z" fill="#9266bc"/><path d="M18 35L74 26L86 39L30 49Z" fill="#e7c5ff"/><path d="M30 49L86 39V69L30 78Z" fill="#b48ad6"/><path d="M47 45L60 43V73L47 75Z" fill="#ffdc79"/><rect x="49" y="50" width="14" height="13" rx="3" fill="#ffedaf"/><path d="M49 20l6-9 7 7-7 10zM25 17l3-6 3 6 6 3-6 3-3 6-3-6-6-3z" fill="#f7cb58"/>':illustrations[info.type]||'')+'</svg>';tile.prepend(art);if(s.stage){const symbols=[null,{start:'🍁',rest:'♨️',storm:'⛰️',tax:'🚡'},{start:'🌃',rest:'🌳',storm:'🚧',tax:'⚓'},{start:'🏔️',rest:'🔥',storm:'❄️',tax:'🪵'}];if(symbols[s.stage][info.type]){art.textContent=symbols[s.stage][info.type];art.classList.add('themed-symbol')}}
   }
   if(info.type==='land'){
    const price=tile.querySelector('.price');const lot=s.lots[i];price.replaceChildren();
    const values=lot?[['租金',rent(i)],['等级',lot.level+'/3']]:[['买地',purchaseCost(i)],['租金',rentPreview(i)]];
    values.forEach(([label,value])=>{const row=document.createElement('span');const amount=document.createElement('b');row.append(label+' ');amount.textContent=value;row.append(amount);price.append(row)});
    tile.classList.toggle('owned',!!lot);
    if(lot){
     tile.style.setProperty('--owner-color',COLORS[lot.owner]);
     const badge=document.createElement('span');badge.className='owner-label';badge.textContent=s.players[lot.owner].name+' · '+lot.level+'级';tile.append(badge);
     const building=tile.querySelector('.mini-building');if(building){building.innerHTML=propertyBuilding(lot.level,COLORS[lot.owner]);building.setAttribute('aria-label',buildingNames[lot.level]);building.removeAttribute('aria-hidden');building.setAttribute('role','img')}
    }
    tile.setAttribute('aria-label',info.name+'，'+(lot?'业主 '+s.players[lot.owner].name+'，租金 '+rent(i):'购买 '+purchaseCost(i)+'，租金 '+rentPreview(i)));
   }
   tile.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tile.click()}};
  });
 }

 let characterState=null;
 function animatePeople(oldRects){
  const sameGame=characterState&&characterState.game===s;
  s.players.forEach((person,id)=>{
   const pawn=document.querySelector('#board .token[data-player="'+id+'"]');
   const card=document.getElementById('players').children[id];
   const previous=sameGame?characterState.people[id]:null;
   const active=s.turn===id&&s.phase!=='over'&&!person.out;
   if(card){card.classList.toggle('current-turn',active);card.setAttribute('aria-label',person.name+'，'+role(id).name+(active?'，当前回合':''));}
   if(pawn){
    pawn.classList.toggle('current-turn',active);
    if(previous&&previous.pos!==person.pos){
     pawn.classList.add('is-walking');
     const before=oldRects?.[id],after=pawn.getBoundingClientRect();
     if(before&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      const board=document.getElementById('board');const scale=board.getBoundingClientRect().width/board.offsetWidth;
      pawn.animate([{translate:((before.left-after.left)/scale)+'px '+((before.top-after.top)/(scale*.94))+'px'},{translate:'0px 0px'}],{duration:175,easing:'ease-out'});
     }
    }
   }
   if(previous&&person.cash!==previous.cash){
    const mood=person.cash>previous.cash?'is-happy':'is-sad';
    for(const el of [pawn,card])if(el){el.classList.add(mood);el.addEventListener('animationend',()=>el.classList.remove(mood),{once:true})}
   }
  });
  characterState={game:s,people:s.players.map(p=>({pos:p.pos,cash:p.cash}))};
 }

 let propertySnapshot={game:s,lots:Object.fromEntries(Object.entries(s.lots).map(([i,l])=>[i,{owner:l.owner,level:l.level}]))};
 function constructionEffects(){
  if(propertySnapshot.game===s){
   document.querySelectorAll('#board .tile').forEach((tile,i)=>{
    const lot=s.lots[i],before=propertySnapshot.lots[i];
    if(lot&&(!before||before.owner!==lot.owner||before.level!==lot.level)){
     tile.classList.add('under-construction');
     const sign=document.createElement('span');sign.className='construction-sign';sign.textContent=before?'升级完成':'新建地产';tile.append(sign);
     setTimeout(()=>{tile.classList.remove('under-construction');sign.remove()},1100);
    }
   });
  }
  propertySnapshot={game:s,lots:Object.fromEntries(Object.entries(s.lots).map(([i,l])=>[i,{owner:l.owner,level:l.level}]))};
 }
 const renderBeforeTiles=window.render;window.render=function(){
  const rects={};document.querySelectorAll('#board .token[data-player]').forEach(el=>rects[el.dataset.player]=el.getBoundingClientRect());
  const result=renderBeforeTiles.apply(this,arguments);decorateTiles();fitPieces();animatePeople(rects);constructionEffects();renderMapWorld();return result
 };
 decorateTiles();fitPieces();animatePeople();renderMapWorld();

 // Real six-face cube; one game roll drives both the face and movement.
 const diceHost=document.getElementById('dice');
 const cubeView=document.createElement('div');cubeView.className='dice-view';


 function makeSolidDice(){
  const canvas=document.createElement('canvas');canvas.className='solid-dice-canvas';canvas.setAttribute('aria-hidden','true');
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});
  if(!gl)return null;
  const vertex=`attribute vec3 aP;attribute vec3 aN;attribute vec2 aUV;attribute float aF;uniform mat4 uM;uniform mat4 uVP;varying vec3 vN;varying vec3 vP;varying vec2 vUV;varying float vF;void main(){vec4 p=uM*vec4(aP,1.);vP=p.xyz;vN=mat3(uM)*aN;vUV=aUV;vF=aF;gl_Position=uVP*p;}`;
  const fragment=`precision mediump float;varying vec3 vN;varying vec3 vP;varying vec2 vUV;varying float vF;
  float faceNumber(float f){if(f<.5)return 1.;if(f<1.5)return 6.;if(f<2.5)return 3.;if(f<3.5)return 4.;if(f<4.5)return 2.;return 5.;}
  void main(){float number=faceNumber(vF);float distance=1.;for(int x=-1;x<=1;x++){for(int y=-1;y<=1;y++){float ax=abs(float(x)),ay=abs(float(y));bool center=x==0&&y==0;bool corners=ax>.5&&ay>.5;bool diagonal=x==y&&ax>.5;bool on=false;if(number<1.5)on=center;else if(number<2.5)on=diagonal;else if(number<3.5)on=diagonal||center;else if(number<4.5)on=corners;else if(number<5.5)on=corners||center;else on=ax>.5;if(on)distance=min(distance,length(vUV-(vec2(float(x),float(y))*.26+.5)));}}
  float hole=1.-smoothstep(.068,.078,distance);vec3 normal=normalize(vN);vec3 light=normalize(vec3(-3.,6.,5.));float diffuse=max(0.,dot(normal,light));vec3 view=normalize(vec3(3.4,3.6,5.)-vP);float spec=pow(max(0.,dot(normal,normalize(light+view))),38.);vec3 ivory=vec3(.98,.95,.87)*(.53+.47*diffuse)+vec3(.20)*spec;
  float pit=clamp(distance/.073,0.,1.);vec3 black=vec3(.07,.085,.08)+vec3(.10)*pit*pit+vec3(.07)*spec;vec3 color=mix(ivory,black,hole);gl_FragColor=vec4(color,1.);}`;
  function shader(type,src){const obj=gl.createShader(type);gl.shaderSource(obj,src);gl.compileShader(obj);if(!gl.getShaderParameter(obj,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(obj));return obj}
  const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Dice shader link failed');gl.useProgram(program);
  const data=[],steps=22;
  const bases=[[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[-1,0,0],[0,1,0]],[[1,0,0],[0,0,-1],[0,1,0]],[[-1,0,0],[0,0,1],[0,1,0]],[[0,1,0],[1,0,0],[0,0,-1]],[[0,-1,0],[1,0,0],[0,0,1]]];
  function point(f,u,v){const [n,t,b]=bases[f],raw=n.map((c,i)=>c+t[i]*(u*2-1)+b[i]*(v*2-1)),core=raw.map(c=>Math.max(-.81,Math.min(.81,c))),delta=raw.map((c,i)=>c-core[i]),len=Math.hypot(...delta),normal=delta.map(c=>c/len);return [...core.map((c,i)=>c+normal[i]*.19),...normal,u,v,f]}
  bases.forEach((_,f)=>{for(let y=0;y<steps;y++)for(let x=0;x<steps;x++){const a=point(f,x/steps,y/steps),b=point(f,(x+1)/steps,y/steps),c=point(f,(x+1)/steps,(y+1)/steps),d=point(f,x/steps,(y+1)/steps);data.push(...a,...b,...c,...a,...c,...d)}});
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
  for(const [name,size,offset] of [['aP',3,0],['aN',3,3],['aUV',2,6],['aF',1,8]]){const index=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(index);gl.vertexAttribPointer(index,size,gl.FLOAT,false,36,offset*4)}
  function multiply(a,b){const r=new Float32Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let i=0;i<4;i++)r[c*4+row]+=a[i*4+row]*b[c*4+i];return r}
  const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  function rx(a){const m=identity();m[5]=m[10]=Math.cos(a);m[6]=Math.sin(a);m[9]=-Math.sin(a);return m}
  function rz(a){const m=identity();m[0]=m[5]=Math.cos(a);m[1]=Math.sin(a);m[4]=-Math.sin(a);return m}
  const normalize=a=>{const l=Math.hypot(...a);return a.map(x=>x/l)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const eye=[3.4,3.6,5],z=normalize(eye),x=normalize(cross([0,1,0],z)),y=cross(z,x),view=identity();
  for(let i=0;i<3;i++){view[i*4]=x[i];view[i*4+1]=y[i];view[i*4+2]=z[i]}view[12]=-x.reduce((a,c,i)=>a+c*eye[i],0);view[13]=-y.reduce((a,c,i)=>a+c*eye[i],0);view[14]=-z.reduce((a,c,i)=>a+c*eye[i],0);
  const mLoc=gl.getUniformLocation(program,'uM'),vpLoc=gl.getUniformLocation(program,'uVP');gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  let angles=[0,0];
  function draw(ax,az){angles=[ax,az];const box=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);const w=Math.max(1,Math.round(box.width*ratio)),h=Math.max(1,Math.round(box.height*ratio));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);const f=1/Math.tan(34*Math.PI/360),near=.1,far=30,projection=new Float32Array([f/(w/h),0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);gl.uniformMatrix4fv(mLoc,false,multiply(rz(az),rx(ax)));gl.uniformMatrix4fv(vpLoc,false,multiply(projection,view));gl.drawArrays(gl.TRIANGLES,0,data.length/9)}
  new ResizeObserver(()=>draw(...angles)).observe(canvas);
  return {canvas,draw};
 }

 let solidDice=null;
 try{solidDice=makeSolidDice()}catch(error){console.error('Dice renderer:',error.message)}
 if(solidDice)cubeView.append(solidDice.canvas);
 const topRotations={1:[-Math.PI/2,0],2:[0,0],3:[0,Math.PI/2],4:[0,-Math.PI/2],5:[Math.PI,0],6:[Math.PI/2,0]};
 window.createCoastDice=function(){const die=makeSolidDice();if(!die)return null;return {canvas:die.canvas,draw(value,progress=1){const [x,z]=topRotations[value],extra=(1-progress)*Math.PI*4;die.draw(x+extra,z+extra*.75)}}};
 window.playCoastDiceSound=diceSound;
 function drawSolid(value,progress=1){
  if(!solidDice){cubeView.textContent=['⚀','⚁','⚂','⚃','⚄','⚅'][value-1];return}
  const [x,z]=topRotations[value],extra=(1-progress)*Math.PI*4;
  solidDice.draw(x+extra,z+extra*.75);
 }
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 let cubeMotion=null,lastBusy=busy,rollingUntil=0,effectsState={game:s,cash:s.players.map(p=>p.cash)};
 function tone(frequency,at,duration,volume,type='sine'){
  if(!soundOn||!audioContext||audioContext.state!=='running')return;
  const oscillator=audioContext.createOscillator(),envelope=audioContext.createGain();
  oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,at);oscillator.frequency.exponentialRampToValueAtTime(frequency*.65,at+duration);
  envelope.gain.setValueAtTime(volume,at);envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);
  oscillator.connect(envelope);envelope.connect(audioContext.destination);oscillator.start(at);oscillator.stop(at+duration+.01);oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect()};
 }
 function diceSound(){
  unlockAudio();if(!soundOn||!audioContext||audioContext.state!=='running')return;
  [0,.08,.17,.29,.43,.51].forEach((offset,i)=>tone(220+i%3*65,audioContext.currentTime+offset,.065,.045*(1-i*.09),'triangle'));
 }
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled||b.id==='sound'||!soundOn)return;unlockAudio();if(audioContext)tone(650,audioContext.currentTime,.035,.012,'sine')});
 document.getElementById('sound').addEventListener('click',()=>{if(!soundOn&&audioContext)audioContext.suspend().catch(()=>{})});

 let rollFrame=0;

 function updateCube(start){
  diceHost.classList.remove('rolling');diceHost.replaceChildren(cubeView);
  const canRoll=!busy&&s.turn===0&&s.phase==='roll'&&!atHome;
  diceHost.setAttribute('aria-disabled',String(!canRoll));
  diceHost.title=canRoll?'点击掷骰子':busy?'正在移动，请稍候':s.turn!==0?'等待电脑回合':s.phase==='end'?'请先点击结束回合':'请先完成当前操作';
  const value=s.dice||5;
  function settle(){drawSolid(value);document.getElementById('diceNumber').textContent=s.dice||'—';diceHost.setAttribute('aria-label','顶部点数 '+value+'，本次走 '+value+' 格')}
  if(start){
   cancelAnimationFrame(rollFrame);rollingUntil=performance.now()+(reduced()?0:540);diceSound();
   if(reduced()){settle();return}
   const began=performance.now();
   function frame(){const progress=Math.min(1,(performance.now()-began)/540);if(progress>=1){settle();return}drawSolid(value,1-Math.pow(1-progress,2));document.getElementById('diceNumber').textContent='…';diceHost.setAttribute('aria-label','骰子滚动中');rollFrame=requestAnimationFrame(frame)}frame();
  }else if(performance.now()>=rollingUntil)settle();
 }
 diceHost.setAttribute('role','button');diceHost.tabIndex=0;
 function clickDice(){
 if(!busy&&!atHome&&s.turn===0&&s.phase==='roll'){roll();return}
 if(!busy&&s.turn===0&&s.phase==='end')document.getElementById('status').textContent=s.acted?'本回合行动已用完，请点击“结束回合”继续。':'本回合已走完，请先点击“结束回合”，轮到你后可再次掷骰子。';
 if(!busy&&s.turn===0&&s.phase==='land')document.getElementById('status').textContent='请先选择购买或暂不购买，再结束回合。';
 }
 diceHost.addEventListener('click',clickDice);
 diceHost.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();clickDice()}});
 const coinLayer=document.createElement('div');coinLayer.className='coin-flight-layer';coinLayer.setAttribute('aria-hidden','true');document.body.append(coinLayer);
 function flyCoins(id,delta){
  if(reduced()||document.getElementById('gameScreen').hidden)return;
  const card=document.getElementById('players').children[id];if(!card)return;
  const cash=card.querySelector('.cash').getBoundingClientRect(),source=document.getElementById('tradeQuote').getBoundingClientRect();
  const point={x:cash.left+cash.width*.5,y:cash.top+cash.height*.5};
  const fallback={x:Math.max(20,point.x-110),y:Math.min(innerHeight-20,point.y+150)};
  const bank=source.width&&source.height?{x:source.left+source.width*.5,y:source.top+source.height*.5}:fallback;
  const from=delta>0?bank:point,to=delta>0?point:bank;
  for(let i=0;i<6;i++){
   const coin=document.createElement('span');coin.className='flying-coin '+(delta>0?'coin-gain':'coin-loss');coin.textContent='¥';coin.style.left=from.x+'px';coin.style.top=from.y+'px';coinLayer.append(coin);
   const dx=to.x-from.x,dy=to.y-from.y,spread=(i-2.5)*9;
   const animation=coin.animate([{transform:'translate(-50%,-50%) scale(.6) rotateY(0deg)',opacity:0},{transform:'translate('+ (dx*.4+spread)+'px,'+(dy*.4-35)+'px) scale(1) rotateY(180deg)',opacity:1,offset:.45},{transform:'translate('+dx+'px,'+dy+'px) scale(.45) rotateY(360deg)',opacity:0}],{delay:i*48,duration:650,easing:'ease-in-out'});
   animation.onfinish=()=>coin.remove();animation.oncancel=()=>coin.remove();
  }
 }
 const renderBeforeEffects=window.render;
 window.render=function(){
  // The menu refresh rebuilds dice contents: retain our cube between renders.
  cubeView.remove();const result=renderBeforeEffects.apply(this,arguments);
  const starts=busy&&!lastBusy&&s.duel?.status!=='pending';updateCube(starts);lastBusy=busy;
  if(effectsState.game===s)s.players.forEach((p,i)=>{const delta=p.cash-effectsState.cash[i];if(delta)flyCoins(i,delta)});
  effectsState={game:s,cash:s.players.map(p=>p.cash)};return result;
 };
 updateCube(false);
})();
