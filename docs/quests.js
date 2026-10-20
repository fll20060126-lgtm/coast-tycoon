/* Optional city commissions: fixed targets at acceptance, finite attempts, saved rewards. */
const QUESTS={
 expand:{name:'小镇拓荒者',icon:'🏡',desc:'扩充你持有的地产数量。',reward:45},
 build:{name:'焕新工程',icon:'🏗️',desc:'把自己地产的建筑总等级提高一级。',reward:55},
 reserve:{name:'现金管家',icon:'🪙',desc:'在回合停稳后，比接单时多留250金币现金。',reward:50},
 district:{name:'街区收藏家',icon:'🏘️',desc:'扩大同色街区，至少集齐两块。',reward:100}
};
function questBook(id){
 if(!Array.isArray(s.commissions))s.commissions=[];
 let book=s.commissions[id];
 if(!book||!Array.isArray(book.history))book=s.commissions[id]={history:[],lastRound:0};
 return book;
}
function questMetric(id,key){
 const lots=Object.entries(s.lots).filter(([i,l])=>l.owner===id);
 if(key==='expand')return lots.length;
 if(key==='build')return lots.reduce((sum,[i,l])=>sum+l.level,0);
 if(key==='reserve')return s.players[id].cash;
 const colors={};lots.forEach(([i])=>{const band=tiles[i].band;colors[band]=(colors[band]||0)+1});return Math.max(0,...Object.values(colors));
}
function questOffer(id,key){
 const current=questMetric(id,key),owned=Object.values(s.lots).filter(l=>l.owner===id);
 const goal=key==='reserve'?current+250:key==='district'?Math.max(2,current+1):current+1;
 let possible=true;
 if(key==='expand')possible=tiles.some((t,i)=>t.type==='land'&&!s.lots[i]);
 if(key==='build')possible=owned.some(l=>l.level<3);
 if(key==='district'){
  const groups={};tiles.forEach((t,i)=>{if(t.type==='land'&&(!s.lots[i]||s.lots[i].owner===id))groups[t.band]=(groups[t.band]||0)+1});
  possible=Object.values(groups).some(n=>n>=goal);
 }
 return {key,goal,baseline:current,reward:Math.round(QUESTS[key].reward*(1+s.stage*.15)),until:s.round+[6,5,5,4][s.stage]-1,possible};
}
function activeQuest(id){return questBook(id).history.find(q=>q.status==='active'||q.status==='ready')}
function questAllowed(id){return !atHome&&!busy&&s.turn===id&&!s.players[id]?.out&&s.phase!=='over'}
function acceptQuest(id,key){
 if(!Object.hasOwn(QUESTS,key)||!questAllowed(id))return false;
 const book=questBook(id);if(activeQuest(id)||book.history.length>=3||book.lastRound===s.round)return false;
 const offer=questOffer(id,key);if(!offer.possible)return false;
 book.history.push({...offer,status:'active',acceptedRound:s.round});book.lastRound=s.round;
 log(s.players[id].name+'接下委托「'+QUESTS[key].name+'」，第'+offer.until+'轮结束前完成可得 '+offer.reward+' 金币。');save();render();return true;
}
function updateQuests(){
 // Cash received during movement must survive the landing payment before qualifying.
 if(busy||s.phase==='over')return;
 s.players.forEach((p,id)=>{
  const q=activeQuest(id);if(!q||q.status==='ready')return;
  if(p.out||s.round>q.until){q.status='failed';log(p.name+'的委托「'+QUESTS[q.key].name+'」已结束，未完成不扣钱。');return}
  if(questMetric(id,q.key)>=q.goal){q.status='ready';log(p.name+'完成了「'+QUESTS[q.key].name+'」，可在自己的回合领取奖励。')}
 });
}
function claimQuest(id){
 if(!questAllowed(id))return false;updateQuests();const q=activeQuest(id);if(!q||q.status!=='ready')return false;
 q.status='claimed';s.players[id].cash+=q.reward;s.message=s.players[id].name+'领取委托奖励 +'+q.reward+' 金币！';log(s.message);save();render();return true;
}
function aiQuestStep(id){
 if(!questAllowed(id))return;updateQuests();
 const q=activeQuest(id);if(q){if(q.status==='ready')claimQuest(id);return}
 const book=questBook(id);if(book.history.length>=3||book.lastRound===s.round)return;
 const p=s.players[id];
 const preference=s.lots[p.pos]?.owner===id&&s.lots[p.pos].level<3?['build','district','expand','reserve']:aiStyle(id)===AI_STYLES.steady?['reserve','expand','district','build']:['expand','district','build','reserve'];
 for(const key of preference)if(questOffer(id,key).possible){acceptQuest(id,key);break}
}
(function(){
 const panel=document.createElement('dialog');panel.id='questPanel';panel.setAttribute('aria-labelledby','questTitle');
 panel.innerHTML='<div class="quest-heading"><div><small>TOWN COMMISSIONS</small><h2 id="questTitle">城市委托</h2></div><button id="closeQuests">关闭 ✕</button></div><p id="questHint" role="status"></p><div id="questActive"></div><div id="questOffers"></div><p class="quest-footnote">自愿接单 · 每次只能进行一份 · 每局最多接3份 · 每轮最多接1份 · 失败不扣钱 · 电脑同样参与</p><div id="questHistory"></div>';
 document.body.append(panel);
 function objectiveText(q){return q.key==='reserve'?'现金达到 '+q.goal+' 金币':q.key==='build'?'建筑总等级达到 '+q.goal:q.key==='district'?'同一颜色地产达到 '+q.goal+' 块':'持有地产达到 '+q.goal+' 块'}
 function refresh(){
  const q=activeQuest(0),book=questBook(0),badge=document.getElementById('questBadge');
  badge.textContent=q?.status==='ready'?'可领奖':q?'进行中':'';badge.hidden=!q;
  if(!panel.open)return;
  const hint=document.getElementById('questHint');hint.textContent=q?.status==='ready'?'委托已完成，轮到你时即可领取奖励。':q?'朝目标经营，也要留意周转资金。':book.history.length>=3?'本局接单次数已用完，下局再来挑战。':'选择一份委托，目标在接单时确定。新接的任务需要继续经营才能完成。';
  const active=document.getElementById('questActive'),offers=document.getElementById('questOffers');active.replaceChildren();offers.replaceChildren();
  if(q){
   const name=document.createElement('h3');name.textContent=QUESTS[q.key].icon+' '+QUESTS[q.key].name;
   const goal=document.createElement('p');goal.textContent=objectiveText(q)+' ｜ 当前 '+questMetric(0,q.key);
   const progress=document.createElement('progress');progress.max=Math.max(1,q.goal-q.baseline);progress.value=q.status==='ready'?progress.max:Math.max(0,questMetric(0,q.key)-q.baseline);
   progress.setAttribute('aria-label','委托完成进度');
   const terms=document.createElement('p');terms.textContent='奖励 '+q.reward+' 金币 · '+(q.status==='ready'?'已完成，待领取':'剩余 '+Math.max(0,q.until-s.round+1)+' 轮（第'+q.until+'轮结束前）');
   active.append(name,goal,progress,terms);
   if(q.status==='ready')active.append(button(questAllowed(0)?'领取奖励 +'+q.reward+' 金币':'等待你的回合领奖',()=>claimQuest(0),!questAllowed(0)));
  }else if(book.history.length<3){
   for(const [key,def] of Object.entries(QUESTS)){
    const offer=questOffer(0,key),card=document.createElement('article'),name=document.createElement('h3'),desc=document.createElement('p'),terms=document.createElement('small');
    name.textContent=def.icon+' '+def.name;desc.textContent=objectiveText(offer);terms.textContent='+'+offer.reward+' 金币 · '+[6,5,5,4][s.stage]+'轮期限';
    const reason=!offer.possible?(key==='build'?'先买地，再接工程':'暂无可扩展的空地'):!questAllowed(0)?'自己的回合可接单':book.lastRound===s.round?'下一轮再接单':'接受委托';
    const action=button(reason,()=>acceptQuest(0,key),reason!=='接受委托');action.dataset.quest=key;card.append(name,desc,terms,action);offers.append(card);
   }
  }
  document.getElementById('questHistory').textContent='本局已接 '+book.history.length+'/3 份'+(book.history.length?' · '+book.history.filter(q=>['claimed','failed'].includes(q.status)).map(q=>QUESTS[q.key].name+'：'+(q.status==='claimed'?'已领奖':'未完成')).join(' ｜ '):'');
 }
 document.getElementById('panelQuest').onclick=()=>{updateQuests();panel.showModal();refresh()};document.getElementById('closeQuests').onclick=()=>panel.close();
 const oldSave=window.save;window.save=function(){updateQuests();return oldSave.apply(this,arguments)};
 const oldRender=window.render;window.render=function(){updateQuests();const result=oldRender.apply(this,arguments);refresh();return result};
 refresh();
})();
