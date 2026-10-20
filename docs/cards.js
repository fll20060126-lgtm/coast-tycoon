/* Strategy cards share the same saved match and turn rules for every player. */
const CARD_TYPES={
 remote:{name:'遥控骰子',icon:'🎲',desc:'选择下一次骰子的点数（1—6），棋子按该点数逐格移动。',color:'#5087bd'},
 waiver:{name:'免租卡',icon:'🛡️',desc:'提前开启防护，下次停在对手地产时免付一次租金，用后消失。',color:'#458b73'},
 barrier:{name:'路障卡',icon:'🚧',desc:'指定一位对手，让他下次掷骰时停走一次。已有路障不能重复设置。',color:'#bc8342'},
 repair:{name:'维修卡',icon:'🛠️',desc:'清除自己的所有停走；没有停走时，抵挡下一次维护支出或风暴封路。不抵租金或盗窃。',color:'#9b71ab'}
};
const CARD_KEYS=Object.keys(CARD_TYPES),HAND_LIMIT=4;
function normalizeCardState(){
 s.players.forEach(p=>{
  if(!Array.isArray(p.cards))p.cards=[];
  else p.cards=p.cards.filter(k=>Object.hasOwn(CARD_TYPES,k)).slice(0,HAND_LIMIT);
  p.cardUsed=p.cardUsed===true;p.rentShield=p.rentShield===true;p.repairShield=p.repairShield===true;p.roadblock=p.roadblock===true;
  if(!Number.isInteger(p.remoteDice)||p.remoteDice<1||p.remoteDice>6)p.remoteDice=0;
 });
}
function cardTurnAllowed(id){return !atHome&&!busy&&s.phase==='roll'&&s.turn===id&&!s.players[id]?.out&&!s.players[id]?.cardUsed}
function cardReason(id,key){
 const p=s.players[id];
 if(!p||!p.cards.includes(key))return '没有这张道具';
 if(s.phase==='over'||p.out)return '本局已经结束';
 if(atHome||s.turn!==id)return '等待自己的回合';
 if(busy)return '棋子移动中';
 if(s.phase!=='roll')return '请在下次掷骰前使用';
 if(p.cardUsed)return '本回合已使用一张卡';
 if(key==='remote'&&(p.skip||p.roadblock))return '先解除停走，再使用遥控骰子';
 if(key==='remote'&&p.remoteDice)return '已有选定的骰子点数';
 if(key==='waiver'&&p.rentShield)return '免租防护已生效';
 if(key==='repair'&&!p.skip&&!p.roadblock&&p.repairShield)return '维修防护已生效';
 if(key==='barrier'&&!s.players.some((q,j)=>j!==id&&!q.out&&!q.roadblock))return '没有可放置路障的对手';
 return '';
}
function useCard(id,key,value){
 normalizeCardState();
 if(!Object.hasOwn(CARD_TYPES,key)||cardReason(id,key)||!cardTurnAllowed(id))return false;
 const p=s.players[id];let detail='';
 if(key==='remote'){
  if(!Number.isInteger(value)||value<1||value>6)return false;
  p.remoteDice=value;detail='，下次掷出 '+value+' 点';
 }else if(key==='waiver')p.rentShield=true;
 else if(key==='barrier'){
  const target=s.players[value];
  if(!Number.isInteger(value)||value===id||!target||target.out||target.roadblock)return false;
  target.roadblock=true;detail='，'+target.name+'下次停走一次';
 }else if(key==='repair'){
  if(p.skip||p.roadblock){p.skip=0;p.roadblock=false;detail='，已清除所有停走'}
  else{p.repairShield=true;detail='，维修防护已生效'}
 }
 // Consume before saving or rendering so repeated clicks cannot spend twice.
 p.cards.splice(p.cards.indexOf(key),1);p.cardUsed=true;
 s.message=p.name+'使用了'+CARD_TYPES[key].name+detail+'。';log(s.message);save();render();return true;
}
function consumeWaiver(id){const p=s.players[id];if(!p.rentShield)return false;p.rentShield=false;return true}
function consumeRepair(id){const p=s.players[id];if(!p.repairShield)return false;p.repairShield=false;return true}
function awardCard(id){
 const p=s.players[id];if(p.cards.length>=HAND_LIMIT){log(p.name+'的道具背包已满（4张），本次不领取。');return false}
 const key=CARD_KEYS[Math.floor(Math.random()*CARD_KEYS.length)];p.cards.push(key);log(p.name+'在道具补给格抽到'+CARD_TYPES[key].name+'。');showCardReward(id,key);return key;
}
function aiRemoteScore(id,n){
 const p=s.players[id],i=(p.pos+n)%tiles.length,t=tiles[i],l=s.lots[i];
 let score=p.pos+n>=tiles.length?chapter().salary*.8:0;
 if(t.type==='land'){
  if(!l)score+=p.cash-purchaseCost(i,id)>aiCashBuffer(id)?95:8;
  else if(l.owner===id)score+=l.level<3?70:18;
  else score-=p.rentShield?0:rent(i)*1.4;
 }else if(t.type==='rest')score+=chapter().rest;
 else if(t.type==='supply')score+=p.cards.length<HAND_LIMIT?105:5;
 else if(t.type==='storm')score-=p.repairShield||s.stage===3&&activeMapPlan(id)?0:120;
 else if(t.type==='tax')score-=p.repairShield?0:tax();
 else if(t.type==='chance')score+=5;
 return score;
}
function aiUseCard(id){
 normalizeCardState();if(!cardTurnAllowed(id))return false;
 const p=s.players[id],can=k=>!cardReason(id,k);
 if((p.skip||p.roadblock)&&can('repair'))return useCard(id,'repair');
 if(p.skip||p.roadblock)return false;
 const threats=Array.from({length:6},(_,i)=>(p.pos+i+1)%24);
 if(can('waiver')&&threats.some(i=>s.lots[i]&&s.lots[i].owner!==id))return useCard(id,'waiver');
 if(can('remote')){
  const options=Array.from({length:6},(_,i)=>({n:i+1,score:aiRemoteScore(id,i+1)})).sort((a,b)=>b.score-a.score);
  if(options[0].score-options[5].score>=50)return useCard(id,'remote',options[0].n);
 }
 if(can('repair')&&threats.some(i=>['tax','storm'].includes(tiles[i].type)))return useCard(id,'repair');
 if(can('barrier')){
  const targets=s.players.map((q,i)=>({id:i,q})).filter(t=>t.id!==id&&!t.q.out&&!t.q.roadblock).sort((a,b)=>net(b.id)-net(a.id));
  if(targets.length)return useCard(id,'barrier',targets[0].id);
 }
 return false;
}
normalizeCardState();
if(hasSavedGame())save();
(function(){
 const panel=document.createElement('dialog');panel.id='cardsPanel';panel.setAttribute('aria-labelledby','cardsTitle');
 panel.innerHTML='<div class="cards-heading"><div><small>COAST STRATEGY</small><h2 id="cardsTitle">我的道具</h2></div><button id="closeCards" aria-label="关闭道具面板">关闭 ✕</button></div><p id="cardsHint" role="status"></p><div id="cardsGrid"></div><div id="cardChoice" hidden></div><p class="cards-rule">掷骰前每回合限用1张 · 不占买地/升级次数 · 停在补给格随机抽1张 · 手牌上限4张</p><div id="cardsEffects"></div>';
 document.body.append(panel);
 let selection='',openedGame=null,openedRound=0;
 function clearChoice(){selection='';panel.classList.remove('choosing');document.getElementById('cardChoice').hidden=true}
 function refresh(){
  normalizeCardState();const p=s.players[0],count=document.getElementById('handCount');
  count.textContent=p.cards.length;document.getElementById('panelCards').setAttribute('aria-label','我的道具，'+p.cards.length+'张');
  if(!panel.open)return;
  if(openedGame!==s||openedRound!==s.round||s.turn!==0){clearChoice();openedGame=s;openedRound=s.round}
  const hint=document.getElementById('cardsHint');hint.textContent=s.phase==='over'?'本局已结束，可以查看道具。':s.turn!==0?'电脑回合中，可以查看道具，轮到你后使用。':p.cardUsed?'本回合道具已使用，仍可正常掷骰、买地或升级。':s.phase!=='roll'?'本回合已掷骰，下回合掷骰前可使用道具。':p.cards.length?'选一张道具，为下一步做好准备。':'背包还没有道具。停在紫色道具补给格可随机抽一张。';
  const grid=document.getElementById('cardsGrid');grid.replaceChildren();
  for(const [key,card] of Object.entries(CARD_TYPES)){
   const n=p.cards.filter(k=>k===key).length,row=document.createElement('article');row.className='strategy-card';row.style.setProperty('--card-accent',card.color);
   const icon=document.createElement('span');icon.className='strategy-icon';icon.textContent=card.icon;
   const title=document.createElement('h3');title.textContent=card.name+' ×'+n;
   const desc=document.createElement('p');desc.textContent=card.desc;
   const reason=cardReason(0,key),action=button(reason||(key==='remote'?'选择点数':key==='barrier'?'选择对手':'使用道具'),()=>choose(key),!!reason);
   action.dataset.card=key;row.append(icon,title,desc,action);grid.append(row);
  }
  const effects=s.players.map((q,i)=>q.out?'':q.name+'：'+[q.rentShield?'免租防护':'',q.repairShield?'维修防护':'',q.roadblock?'路障停走':'',q.skip?'风暴停走':'',q.remoteDice?'下次 '+q.remoteDice+' 点':''].filter(Boolean).join('、')).filter(t=>!t.endsWith('：'));
  document.getElementById('cardsEffects').textContent=effects.join(' ｜ ')||'当前没有生效中的道具。四种道具抽中概率各25%。';
  if(selection&&cardReason(0,selection))clearChoice();
 }
 function play(key,value){
  if(openedGame!==s||openedRound!==s.round)return;
  if(useCard(0,key,value)){clearChoice();panel.close()}
 }
 function choose(key){
  if(cardReason(0,key))return;
  if(key!=='remote'&&key!=='barrier'){play(key);return}
  selection=key;panel.classList.add('choosing');const area=document.getElementById('cardChoice');area.replaceChildren();area.hidden=false;
  const label=document.createElement('strong');label.textContent=key==='remote'?'遥控骰子 · 选择点数后消耗一张：':'路障卡 · 选择对手后消耗一张：';area.append(label);
  if(key==='remote')for(let n=1;n<=6;n++)area.append(button(String(n),()=>play(key,n)));
  else s.players.forEach((q,i)=>{if(i&&!q.out)area.append(button(q.name+(q.roadblock?'（已有路障）':''),()=>play(key,i),q.roadblock))});
  area.append(button('取消选择',clearChoice));
 }
 document.getElementById('panelCards').onclick=()=>{openedGame=s;openedRound=s.round;clearChoice();panel.showModal();refresh()};
 document.getElementById('closeCards').onclick=()=>panel.close();panel.addEventListener('close',clearChoice);
 const originalRender=window.render;window.render=function(){const result=originalRender.apply(this,arguments);refresh();return result};
 refresh();renderHome();
})();

let cardRewardNotice=null,cardRewardTimer;
function showCardReward(id,key){
 if(id!==0)return;
 if(!cardRewardNotice){cardRewardNotice=document.createElement('div');cardRewardNotice.className='card-reward';cardRewardNotice.setAttribute('role','status');document.body.append(cardRewardNotice)}
 clearTimeout(cardRewardTimer);cardRewardNotice.textContent=CARD_TYPES[key].icon+' 抽到'+CARD_TYPES[key].name+' · 已放入背包';cardRewardNotice.hidden=false;
 cardRewardTimer=setTimeout(()=>{cardRewardNotice.hidden=true},2800);
}
