/* Optional dice duels, with persisted rolls and exactly-once settlement. */
let duelView={start(){},finish(){}};
function duelStake(a,b){return Math.max(0,Math.min(40,Math.floor(s.players[a]?.cash||0),Math.floor(s.players[b]?.cash||0)))}
function duelVisitAllowed(id){
 const offer=s.duelOffer;
 return !busy&&!atHome&&s.phase==='end'&&s.turn===id&&!s.players[id]?.out&&tiles[s.players[id].pos]?.type==='duel'&&offer?.player===id&&offer.round===s.round&&!offer.used;
}
function duelTargets(id){return s.players.map((p,i)=>i).filter(i=>i!==id&&!s.players[i].out&&duelStake(id,i)>0)}
function duelCanStart(id,target){return duelVisitAllowed(id)&&Number.isInteger(target)&&duelTargets(id).includes(target)}
function settleDuel(game=s){
 if(s!==game)return false;const d=s.duel;
 if(!d||d.status!=='pending')return false;
 // Results are persisted before animation; reload resumes this result, never rerolls.
 if(!Number.isInteger(d.a)||d.a<1||d.a>6||!Number.isInteger(d.b)||d.b<1||d.b>6||d.attacker===d.defender||!s.players[d.attacker]||!s.players[d.defender])return false;
 d.status='done';d.winner=d.a===d.b?null:d.a>d.b?d.attacker:d.defender;
 const a=s.players[d.attacker],b=s.players[d.defender];
 if(d.winner===null){d.paid=0;s.message=a.name+'与'+b.name+'决斗，'+d.a+' : '+d.b+'，平局，不扣金币。'}
 else{
  const loser=d.winner===d.attacker?d.defender:d.attacker;
  d.paid=Math.max(0,Math.min(d.stake,s.players[loser].cash));
  s.players[loser].cash-=d.paid;s.players[d.winner].cash+=d.paid;
  s.message=a.name+' '+d.a+'点 对 '+b.name+' '+d.b+'点：'+s.players[d.winner].name+'获胜，获得 '+d.paid+' 金币。';
 }
 log('⚔ '+s.message);save();return true;
}
async function beginDuel(id,target){
 if(!duelCanStart(id,target))return false;
 const game=s;
 game.duelOffer.used=true;
 game.duel={attacker:id,defender:target,a:1+Math.floor(Math.random()*6),b:1+Math.floor(Math.random()*6),stake:duelStake(id,target),round:s.round,status:'pending'};
 busy=true;save();render();
 try{duelView.start(game.duel);await pause(1050)}
 finally{
  if(s===game){settleDuel(game);busy=false;save();render();duelView.finish(game.duel)}
 }
 return s===game;
}
function declineDuel(id){if(!duelVisitAllowed(id))return false;s.duelOffer.used=true;s.message=s.players[id].name+'选择离开决斗场，没有扣除金币。';log(s.message);save();render();return true}
async function aiDuelStep(id){
 if(!duelVisitAllowed(id))return false;
 const targets=duelTargets(id);
 const willing=s.players[id].cash>=100&&Math.random()<(aiStyle(id)===AI_STYLES.bold?.7:.35);
 if(!willing||!targets.length){declineDuel(id);return false}
 targets.sort((a,b)=>s.players[b].cash-s.players[a].cash);
 await beginDuel(id,targets[0]);return true;
}
(function(){
 const panel=document.createElement('dialog');panel.id='duelPanel';panel.setAttribute('aria-labelledby','duelTitle');
 panel.innerHTML='<div class="duel-heading"><div><small>DICE ARENA</small><h2 id="duelTitle">海岸决斗场</h2></div><button id="duelClose">关闭 ✕</button></div><p id="duelHint" role="status"></p><div id="duelOpponents"></div><div id="duelBattle" hidden><div class="duel-fighter"><div id="duelPortraitA"></div><strong id="duelNameA"></strong><div id="duelDieA" class="duel-die"></div><b id="duelScoreA">?</b></div><div class="duel-versus">VS</div><div class="duel-fighter"><div id="duelPortraitB"></div><strong id="duelNameB"></strong><div id="duelDieB" class="duel-die"></div><b id="duelScoreB">?</b></div></div><div id="duelResult" role="status" aria-live="polite"></div><button id="duelLeave">不决斗 · 免费离开</button><p class="duel-rules">双方各掷一次 · 大点获胜 · 平局不转账 · 每次到场限一次 · 遥控骰子不影响决斗</p>';
 document.body.append(panel);
 const el=id=>document.getElementById(id);let dice=[],frame=0,selectedGame=null,selectedRound=0;
 function ensureDice(){
  if(dice.length)return;
  for(const id of ['duelDieA','duelDieB']){
   let die;try{die=window.createCoastDice?.()}catch{}
   if(die){el(id).append(die.canvas);dice.push(die)}
   else{const fallback=document.createElement('span');fallback.className='duel-die-fallback';el(id).append(fallback);dice.push({draw(value,progress){fallback.textContent=progress<1?'🎲':['⚀','⚁','⚂','⚃','⚄','⚅'][value-1]}})}
  }
 }
 function showBattle(d){
  el('duelOpponents').hidden=true;el('duelBattle').hidden=false;el('duelLeave').hidden=true;
  el('duelPortraitA').innerHTML=playerArt(d.attacker);el('duelPortraitB').innerHTML=playerArt(d.defender);
  el('duelNameA').textContent=s.players[d.attacker].name;el('duelNameB').textContent=s.players[d.defender].name;
  ensureDice();
 }
 function drawResult(d){
  if(!d||d.status!=='done')return;cancelAnimationFrame(frame);showBattle(d);
  dice[0].draw(d.a,1);dice[1].draw(d.b,1);el('duelScoreA').textContent=d.a+' 点';el('duelScoreB').textContent=d.b+' 点';
  el('duelHint').textContent='本次决斗已结算，双方点数显示在骰子下方。';
  el('duelResult').textContent=d.winner===null?'势均力敌！平局，不扣金币。':s.players[d.winner].name+'获胜！ +'+d.paid+' 金币';
  el('duelClose').disabled=false;el('duelClose').textContent='返回棋盘';
 }
 duelView={
  start(d){
   selectedGame=s;selectedRound=s.round;if(!panel.open)panel.showModal();showBattle(d);
   el('duelHint').textContent='双方正在掷骰，点数大者获胜。本次胜负转移 '+d.stake+' 金币。';
   el('duelResult').textContent='骰子滚动中…';el('duelClose').disabled=true;el('duelScoreA').textContent='?';el('duelScoreB').textContent='?';
   window.playCoastDiceSound?.();
   const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,started=performance.now();
   function tick(){const t=Math.min(.98,(performance.now()-started)/1000);dice[0].draw(d.a,reduced?1:t);dice[1].draw(d.b,reduced?1:t);if(d.status==='pending')frame=requestAnimationFrame(tick)}
   tick();
  },
  finish(d){if(selectedGame===s)drawResult(d)}
 };
 function openDuel(){
  if(!duelVisitAllowed(0))return;
  selectedGame=s;selectedRound=s.round;el('duelBattle').hidden=true;el('duelOpponents').hidden=false;el('duelResult').textContent='';el('duelLeave').hidden=false;el('duelClose').textContent='稍后决定';
  el('duelHint').textContent='选择小橙或阿蓝挑战。赢家从输家获得至多40游戏金币；不会超过双方现金。也可以免费离开。';
  const opponents=el('duelOpponents');opponents.replaceChildren();
  s.players.forEach((p,id)=>{
   if(!id||p.out)return;
   const row=document.createElement('article'),portrait=document.createElement('div'),name=document.createElement('strong'),summary=document.createElement('p');
   portrait.className='duel-opponent-art';portrait.innerHTML=playerArt(id);name.textContent=p.name+' · '+role(id).name;
   const stake=duelStake(0,id);summary.textContent='现金 '+p.cash+' · 本次胜负 '+stake+' 金币';
   const action=button(stake?'挑战 '+p.name:'现金不足，无法决斗',()=>{if(selectedGame!==s||selectedRound!==s.round)return;beginDuel(0,id)},!stake);action.dataset.duelTarget=id;
   row.append(portrait,name,summary,action);opponents.append(row);
  });
  panel.showModal();
 }
 el('duelClose').onclick=()=>{if(s.duel?.status!=='pending')panel.close()};
 el('duelLeave').onclick=()=>{if(declineDuel(0))panel.close()};
 panel.addEventListener('cancel',event=>{if(s.duel?.status==='pending')event.preventDefault()});
 const oldRender=window.render;window.render=function(){
  const result=oldRender.apply(this,arguments);
  if(duelVisitAllowed(0)){
   const actions=document.getElementById('actions');
   const end=Array.from(actions.children);if(end[0])end[0].textContent='跳过决斗 · 结束回合';
   actions.replaceChildren(button('⚔ 发起决斗',openDuel,!duelTargets(0).length),...end);
  }
  return result;
 };
 // A page closed during the animation settles the previously saved rolls once.
 if(s.duel?.status==='pending'){settleDuel();save()}
})();
