(()=>{
 // 海岸大亨 · 按效果图还原 v-island5
 // 构建关卡/角色/地产/记录信息弹窗
 const dialog=document.createElement('dialog');dialog.id='infoPanel';
 dialog.innerHTML='<div class="panel-heading"><h2 id="infoTitle"></h2><button id="closeInfo">关闭 ✕</button></div><div id="infoContent"></div><div class="page-controls"><button id="prevInfo">上一页</button><span id="infoPage"></span><button id="nextInfo">下一页</button></div>';
 document.body.append(dialog);
 const sections={Map:document.querySelector('#gameScreen .campaign'),Role:document.querySelector('#gameScreen .roles'),Estate:document.getElementById('properties').closest('.card'),Log:document.getElementById('logs').closest('.card')};
 Object.values(sections).forEach(el=>{el.hidden=true;document.getElementById('infoContent').append(el)});
 let active='Map',page=0;
 function paginate(){const list=active==='Estate'?document.querySelectorAll('#properties .estate'):active==='Log'?document.querySelectorAll('#logs p'):[];const size=active==='Estate'?4:3,total=Math.max(1,Math.ceil(list.length/size));page=Math.min(page,total-1);list.forEach((el,i)=>el.hidden=i<page*size||i>=(page+1)*size);dialog.querySelector('.page-controls').hidden=!list.length;document.getElementById('infoPage').textContent=(page+1)+' / '+total;document.getElementById('prevInfo').disabled=page===0;document.getElementById('nextInfo').disabled=page>=total-1;}
 Object.keys(sections).forEach(key=>document.getElementById('panel'+key).onclick=()=>{active=key;page=0;Object.entries(sections).forEach(([k,el])=>el.hidden=k!==key);document.getElementById('infoTitle').textContent={Map:'关卡与目标',Role:'人物与技能',Estate:'地产管理',Log:'本局记录'}[key];paginate();dialog.showModal()});
 document.getElementById('closeInfo').onclick=()=>dialog.close();document.getElementById('prevInfo').onclick=()=>{page--;paginate()};document.getElementById('nextInfo').onclick=()=>{page++;paginate()};
 // 最近动态图标
 function eventIcon(t){if(/购买|买下/.test(t))return '🏠';if(/起点/.test(t))return '🚩';if(/租金/.test(t))return '🪙';if(/风暴/.test(t))return '⛈️';if(/升级/.test(t))return '🏗️';if(/破产/.test(t))return '💸';if(/通关|★/.test(t))return '🏆';if(/庆典|好评|补贴|工资/.test(t))return '🎉';return '📢'}
 function refreshSummary(){
  const recent=document.getElementById('recentEvents');
  recent.replaceChildren(...Array.from(document.querySelectorAll('#logs p')).slice(0,2).map(row=>{const item=document.createElement('p');const ic=document.createElement('i');ic.textContent=eventIcon(row.textContent);item.append(ic,document.createTextNode(row.textContent));return item}));
  document.getElementById('compactGoal').textContent='目标：总资产达到 '+chapter().target+(chapter().first?' · 排名第一':'');
  const dice=document.getElementById('dice');dice.textContent='';
  const faces=[[5],[1,9],[1,5,9],[1,3,7,9],[1,3,5,7,9],[1,3,4,6,7,9]];
  for(let i=1;i<=9;i++){const dot=document.createElement('i');dot.className=faces[(s.dice||5)-1].includes(i)?'pip':'empty';dice.append(dot)}
  dice.setAttribute('aria-label',s.dice?'骰子 '+s.dice+' 点':'等待掷骰子');
  document.getElementById('diceNumber').textContent=s.dice||'–';
  document.getElementById('turn').textContent=s.phase==='over'?'本局结束':s.turn===0?'轮到你了！':s.players[s.turn].name+'的回合';
  const quote=document.getElementById('tradeQuote');quote.replaceChildren();
  const pos=s.players[s.turn].pos;
  const buying=s.phase==='land'&&tiles[pos].type==='land'&&!s.lots[pos]&&!(s.turn===0&&s.acted);
  const status=document.getElementById('status');
  if(buying&&s.turn===0&&s.acted){
   status.textContent='本回合行动已用完（已购地或已升级），不能再买地，请结束回合。';
  }else if(buying){   const name=document.createElement('span');name.className='hl';name.textContent=tiles[pos].name;
   status.replaceChildren('抵达',name,'，是否购买？');
   for(const [icon,label,val] of [['🏠','买地',purchaseCost(pos)],['🪙','租金',rentPreview(pos)]]){const chip=document.createElement('span');const b=document.createElement('b');b.textContent=val;chip.append(icon+' '+label+' ',b);quote.append(chip)}
  }else status.textContent=s.message;
  quote.hidden=!(buying&&!(s.turn===0&&s.acted));
  const actionButtons=document.querySelectorAll('#actions button');
  if(buying&&s.turn===0&&actionButtons.length===2){actionButtons[0].textContent=actionButtons[0].disabled?'金币不足':'购买地产';actionButtons[1].textContent='暂不购买'}
 }
 document.getElementById('allEvents').onclick=()=>document.getElementById('panelLog').click();
 // 在章节确认弹窗打开前先关掉信息面板
 dialog.addEventListener('click',e=>{if(e.target.closest('.chapter-card'))dialog.close()});
 const original=window.render;window.render=function(){const result=original.apply(this,arguments);paginate();refreshSummary();return result};
 refreshSummary();
})();
