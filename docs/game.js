const ROLE_ART_PATHS={"landlord": "assets/role-landlord.6e201a767d.webp", "builder": "assets/role-builder.66df06da6a.webp", "merchant": "assets/role-merchant.cc091518d7.webp", "traveler": "assets/role-traveler.34b998180d.webp", "thief": "assets/role-thief.6eafa8b309.webp"};
const $=id=>document.getElementById(id),KEY='coast-tycoon-v1',COLORS=['#35816f','#d98459','#7087b5'];
const ROLES={landlord:{name:'地主',icon:'🎩',skill:'丰收租约',desc:'自己地产收取的租金增加 10%。'},builder:{name:'建筑师',icon:'👷',skill:'精打细算',desc:'升级地产费用减少 15%。'},merchant:{name:'商人',icon:'💼',skill:'议价高手',desc:'购买空地费用减少 10%。'},traveler:{name:'旅行家',icon:'🎒',skill:'旅途津贴',desc:'经过起点领取的工资增加 20%。'},thief:{name:'盗贼',icon:'🦹',skill:'顺手牵羊',desc:'除开局外，与其他玩家停在同一格时，偷走每人现有金币的 10%。'},resident:{name:'普通居民',icon:'🙂',skill:'旧版角色',desc:'无专属技能；下一局可选择新角色。'}};
let selectedRole='landlord';try{const r=localStorage.getItem('coast-selected-role');if(ROLES[r]&&r!=='resident')selectedRole=r}catch{}
const AI_STYLES={bold:{label:'进取型',icon:'🔥',reserve:.5,upgradeReserve:.55,extraUpgrades:1,think:650,desc:'抢地快手：留底少，能买就买，现金常压到见底。'},steady:{label:'稳健型',icon:'⚖️',reserve:1.35,upgradeReserve:1.25,extraUpgrades:0,think:1500,desc:'先保现金再扩张：宁可少买一块地，也不逼自己变卖。'}};
const AI_SEATS=[null,'bold','steady'];
function aiStyle(id){return AI_STYLES[s.players[id]?.style]||AI_STYLES[AI_SEATS[id]]||AI_STYLES.steady}
function role(id){return ROLES[s.players[id]?.role]||ROLES.resident}
function purchaseCost(i,id=s.turn){return Math.ceil(tiles[i].price*(s.players[id]?.role==='merchant'?.9:1))}
function upgradeCost(i,id=s.turn){return Math.ceil(Math.ceil(tiles[i].price*.6)*(s.players[id]?.role==='builder'?.85:1))}
function investment(i){const l=s.lots[i];return l.invested??(tiles[i].price+l.level*Math.ceil(tiles[i].price*.6))}
function vectorCharacterArt(key){
 const palettes={landlord:['#62517d','#e7c77a','#eee5f4'],builder:['#d28244','#f7cd58','#fff0d6'],merchant:['#365e79','#dca473','#dfedf4'],traveler:['#568477','#cf8462','#e2f0e4'],thief:['#3d4759','#d9b45a','#e6e2ee'],resident:['#7b8f91','#afc6bc','#e9efed']};
 const k=palettes[key]?key:'resident',[coat,accent,bg]=palettes[k];
 const hat=k==='landlord'?'<path d="M39 44h50v7H39zM47 21h34l3 24H44z" fill="#3c354e"/><path d="M46 36h36v8H46z" fill="#e2b951"/>':k==='builder'?'<path d="M40 47a24 24 0 0 1 48 0v5H40z" fill="#f4bd38"/><path d="M60 23h8v26h-8zM36 46h56v7H36z" fill="#ffdb63"/>':k==='traveler'?'<path d="M39 47q4-25 25-25t25 25z" fill="#547968"/><path d="M34 45h61v8H34z" fill="#729c7e"/><path d="M48 39h33v7H48z" fill="#d8b28a"/>':k==='thief'?'<path d="M38 60V45q1-28 30-20 24 2 20 33l-12-13q-16 3-27-6l-6 21z" fill="#2b3245"/><path d="M42 59h44v12H42z" fill="#222939"/><path d="M44 65h40v3H44z" fill="#d9b45a"/>':'<path d="M41 54V42q2-23 28-17 21 1 18 29l-9-11q-15 3-26-5l-5 17z" fill="#3d424b"/>';
 const outfit=k==='landlord'?'<path d="M55 87l9 12 9-12-3 39H58z" fill="#f5e3af"/><path d="M58 86l6 5 6-5v10l-6-4-6 4z" fill="#82575b"/><path d="M78 106q14 12 3 19" fill="none" stroke="#eac969" stroke-width="2"/>':k==='builder'?'<path d="M49 87h7v17h16V87h7v43H49z" fill="#49677b"/><path d="M55 107h18v14H55z" fill="#6b8aa0"/><circle cx="53" cy="102" r="2" fill="#f8d36d"/><circle cx="76" cy="102" r="2" fill="#f8d36d"/>':k==='merchant'?'<path d="M53 85l11 13 11-13-6 39H59z" fill="#f5f1e5"/><path d="M60 92h8l-2 6 4 20-6 7-5-7 3-20z" fill="#b96d59"/><path d="M49 85l-6 19 11 2-4 8 12 13-6-37M79 85l6 19-11 2 4 8-12 13 6-37" fill="#25465e"/>':k==='thief'?'<path d="M49 86h7v18h16V86h7v44H49z" fill="#333c4e"/><path d="M52 90h24v4H52z" fill="#d9b45a"/><path d="M57 108h15v14H57z" fill="#48546a"/><circle cx="53" cy="104" r="2.5" fill="#d9b45a"/><circle cx="76" cy="104" r="2.5" fill="#d9b45a"/>':'<path d="M48 88l5-2v42h-5zM76 86l5 2v40h-5z" fill="#d3b081"/><path d="M57 105h15v13H57z" fill="#d8dfb1"/><path d="M61 109l4-3 5 8-8 1z" fill="#708b75"/>';
 const accessory=k==='landlord'?'<circle cx="94" cy="110" r="5" fill="none" stroke="#ebc55e" stroke-width="4"/><path d="M94 115v16h7v-5h-7" fill="none" stroke="#ebc55e" stroke-width="4"/>':k==='builder'?'<g transform="rotate(-12 96 116)"><rect x="88" y="98" width="19" height="31" rx="3" fill="#d8e8e9"/><path d="M93 104h9m-9 5h9m-9 5h6m-6 5h9" stroke="#6b94a2" stroke-width="2"/></g>':k==='merchant'?'<rect x="83" y="110" width="29" height="23" rx="4" fill="#885b44"/><path d="M91 111v-6h12v6" fill="none" stroke="#885b44" stroke-width="4"/><path d="M84 119h27" stroke="#bc8b60" stroke-width="2"/><rect x="96" y="117" width="5" height="5" rx="1" fill="#e9be72"/>':k==='thief'?'<path d="M87 112q9-13 19 0" fill="none" stroke="#8b7238" stroke-width="3"/><rect x="82" y="112" width="29" height="22" rx="5" fill="#6f5a2e"/><path d="M82 119h29" stroke="#d9b45a" stroke-width="2"/><circle cx="96" cy="126" r="4" fill="#e9ce8b"/><circle cx="105" cy="107" r="3" fill="#d9b45a"/>':'<circle cx="96" cy="115" r="11" fill="#e9ce8b"/><circle cx="96" cy="115" r="8" fill="#f5efda"/><path d="M96 108l4 11-4-2-4 2z" fill="#b86255"/>';
 return `<svg class="character-art" viewBox="0 0 128 166" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="64" cy="74" r="54" fill="${bg}"/><circle cx="107" cy="28" r="4" fill="${accent}" opacity=".6"/><path d="M20 47h8m-4-4v8" stroke="${accent}" stroke-width="2"/><ellipse cx="65" cy="155" rx="33" ry="6" fill="#294b4420"/><g class="character-body">${k==='traveler'?'<rect x="36" y="87" width="57" height="43" rx="13" fill="#b27a50"/>':''}<path d="M49 123h14v28H48zM67 123h14v28H67z" fill="#364d5a"/><path d="M48 146h15v10H42q-2-7 6-10M67 146h14q9 3 6 10H67z" fill="#31424a"/><path d="M45 88q19-12 38 0l5 40q-24 11-48 0z" fill="${coat}"/><path d="M44 92l-9 24M84 92l9 20" stroke="${coat}" stroke-width="13" stroke-linecap="round"/><circle cx="34" cy="120" r="6" fill="#e9b38b"/><circle cx="94" cy="114" r="6" fill="#e9b38b"/>${outfit}<rect x="58" y="73" width="13" height="16" rx="5" fill="#e1a47b"/><circle cx="42" cy="61" r="5" fill="#eab38c"/><circle cx="86" cy="61" r="5" fill="#eab38c"/><rect x="43" y="34" width="43" height="46" rx="19" fill="#f1c29b"/><path d="M48 65q4 9 12 10" fill="none" stroke="#f7d1ad" stroke-width="4"/><g class="character-eyes"><circle cx="55" cy="57" r="2.5" fill="#3d4148"/><circle cx="75" cy="57" r="2.5" fill="#3d4148"/></g><path d="M61 67q5 4 10-1" fill="none" stroke="#a76c5d" stroke-width="2" stroke-linecap="round"/><circle cx="51" cy="65" r="4" fill="#e7a08c" opacity=".6"/><circle cx="79" cy="65" r="4" fill="#e7a08c" opacity=".6"/>${hat}${k==='landlord'?'<circle cx="75" cy="58" r="7" fill="none" stroke="#b58c45" stroke-width="1.5"/><path d="M82 58l3 19" stroke="#b58c45" fill="none"/>':''}${accessory}</g></svg>`;
}
function characterArt(key){
 if(!['landlord','builder','merchant','traveler','thief'].includes(key))return vectorCharacterArt(key);
 return `<svg class="character-art player-character role-figurine" viewBox="0 0 128 166" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="64" cy="158" rx="29" ry="5" fill="#20465422"/><g class="figure-motion"><image href="${ROLE_ART_PATHS[key]}" x="0" y="0" width="128" height="161" preserveAspectRatio="xMidYMax meet"/></g></svg>`;
}
function playerArt(id){return characterArt(s.players[id]?.role||'resident')}

function renderRoles(){const box=$('roleCards');box.replaceChildren();Object.entries(ROLES).filter(([k])=>k!=='resident').forEach(([k,r])=>{const b=button(r.icon+' '+r.name+' · '+r.desc,()=>{selectedRole=k;try{localStorage.setItem('coast-selected-role',k)}catch{}renderRoles()});b.innerHTML=characterArt(k)+'<span class="character-info"><strong>'+r.name+'</strong><small>'+r.skill+'</small><span>'+r.desc+'</span></span>';b.setAttribute('aria-pressed',String(selectedRole===k));b.className='role-card'+(selectedRole===k?' selected':'');box.append(b)});$('roleNote').textContent='本局：'+role(0).name+'（'+role(0).desc+'）｜下次开局：'+ROLES[selectedRole].name+'。切换选择不会改变当前棋局。'}
const CHAPTERS=[
 {name:'晴湾起步',tag:'01 · 海风练习曲',icon:'⛵',color:'#b4dcd0',cash:1000,aiCash:1000,scale:1,tax:80,salary:200,rounds:18,target:1800,first:false,reserve:380,upgradeReserve:650,upgrades:1,rest:60,eventRisk:80,desc:'轻松起步，学会留出周转资金。',rule:'度假广场奖励 60 金币；小橙抢地快，阿蓝先攒钱。',streets:['金沙街','椰风路','望海街','渔港路','帆船港','蓝湾路','椰林路','海景大道','潮汐路','星海街','月牙湾','银滩路','灯塔路','白浪街','珊瑚湾','海滨路']},
 {name:'枫叶山城',tag:'02 · 山间经营课',icon:'🍁',color:'#edc49a',cash:1000,aiCash:1000,scale:1.2,tax:130,salary:200,rounds:22,target:2200,first:true,reserve:260,upgradeReserve:480,upgrades:1,rest:80,eventRisk:130,desc:'土地更贵，争夺山城最好的街区。',rule:'每 4 轮旅游旺季：所有地产租金上涨 25%。',streets:['红枫小路','松果街','山泉路','缆车总站','银杏巷','栗子街','温泉大道','枫林别院','云雾路','山顶栈道','秋叶港','观景酒店','梯田街','山月大道','云顶山庄','枫叶城堡']},
 {name:'霓虹港都',tag:'03 · 商业争夺战',icon:'🌃',color:'#b9b4df',cash:1000,aiCash:1000,scale:1.45,tax:180,salary:220,rounds:26,target:2800,first:true,reserve:180,upgradeReserve:350,upgrades:2,rest:100,eventRisk:180,desc:'强劲对手积极扩建，现金流决定胜负。',rule:'每 3 轮商业展会：过路工资额外增加 100 金币。',streets:['电光小径','唱片街','霓虹路','地铁总站','创客巷','银幕街','金融大道','空中花园','星河路','跨海大桥','集装箱港','摩天酒店','不夜街','极光大道','环宇中心','都市王座']},
 {name:'极光之巅',tag:'04 · 终极地产家',icon:'🏔️',color:'#9fc8df',cash:1000,aiCash:1000,scale:1.7,tax:220,salary:240,rounds:30,target:3400,first:true,reserve:120,upgradeReserve:280,upgrades:2,rest:120,eventRisk:240,desc:'高成本与暴雪考验，挑战最后的冠军。',rule:'每 4 轮暴雪：税费增加 100 金币；租金上涨 20%。',streets:['冰晶小径','雪松街','极地路','雪橇总站','霜花巷','琥珀街','冰川大道','暖炉花园','极光路','悬崖栈道','破冰港','雪峰酒店','晶砂街','北辰大道','天穹雪堡','极光宫殿']}
];

const MAPS=[
 {key:'coast',scene:'coast-island.199374fa09.webp',accent:'#208a82',paper:'#fff7e4',ink:'#16484a',rest:'休闲广场',storm:'风暴滞留',tax:'城市税',tip:'先保留周转金，再决定买地或升级。',events:[['参加海滩庆典',200],['民宿收到好评',120],['维护海滨设施',-80],['清理码头',-100]]},
 {key:'maple',scene:'map-maple.50f8f45f0f.webp',accent:'#ae653d',paper:'#fff1d7',ink:'#623d31',rest:'温泉驿站',storm:'山路封闭',tax:'景区维护',tip:'旺季前布局地产，温泉推广可增加收租收益。',events:[['红枫节带来游客',180],['温泉旅馆收到好评',140],['检修观光缆车',-90],['维护山间步道',-110]],plan:{key:'tourism',name:'温泉推广',cost:90,rounds:3,desc:'持续3轮：自己的地产租金增加15%，可与旅游旺季叠加。'}},
 {key:'neon',scene:'map-neon.809c75764e.webp',accent:'#6071c2',paper:'#e9edf9',ink:'#303e6b',rest:'空中花园',storm:'港口管制',tax:'港口服务',tip:'同色街区持有至少2块，每块租金增加15%；电脑也遵守此规则。',events:[['承接港口订单',200],['创客展览获得奖金',160],['检修仓储设备',-100],['维护码头航道',-140]],plan:{key:'promotion',name:'港都招商',cost:120,rounds:3,desc:'持续3轮：自己的地产租金增加20%，可与同色街区收益叠加。'}},
 {key:'aurora',scene:'map-aurora.abaa981463.webp',accent:'#4c89ab',paper:'#e7f4fa',ink:'#254d6d',rest:'暖炉营地',storm:'暴雪封路',tax:'供暖维护',tip:'每4轮暴雪。提前防寒可免暴雪附加费并防止封路停走。',events:[['极光观景团到访',200],['雪乡旅馆获得好评',160],['检修雪地设备',-120],['维护冰川栈道',-140]],plan:{key:'winter',name:'防寒改造',cost:100,rounds:4,desc:'持续4轮：免除暴雪的100金币附加维护费，免封路停走，维修事件少付80金币。'}}
];
CHAPTERS[1].rule+=' 可选温泉推广：90金币，持续3轮租金+15%。';
CHAPTERS[2].rule+=' 同色至少2块租金+15%；可选招商计划。';
CHAPTERS[3].rule+=' 可选防寒改造：100金币，有效4轮免暴雪附加费和封路停走。';
function mapData(){return MAPS[s.stage]}
function activeMapPlan(id){const plan=s.plans?.[id];return !!plan&&plan.key===mapData().plan?.key&&plan.until>=s.round}
function mapPlanAllowed(id){const plan=mapData().plan;return !!plan&&!busy&&!s.players[id].out&&s.turn===id&&s.phase!=='over'&&!activeMapPlan(id)&&s.planRounds?.[id]!==s.round&&s.players[id].cash>=plan.cost}
function activateMapPlan(id){if(!mapPlanAllowed(id))return false;const plan=mapData().plan;s.players[id].cash-=plan.cost;(s.plans??={})[id]={key:plan.key,until:s.round+plan.rounds-1};(s.planRounds??={})[id]=s.round;log(s.players[id].name+'投入 '+plan.cost+' 金币开启'+plan.name+'，有效至第 '+s.plans[id].until+' 轮。');return true}
function requestMapPlan(){
 const map=mapData(),plan=map.plan;
 if(!plan){modal('晴湾经营提示','空地停留免费，购买由你决定。\n先留够一次维护费与可能支付的租金，再考虑扩大地产。\n'+map.tip);return}
 const active=activeMapPlan(0);
 modal(plan.name,plan.desc+'\n费用：'+plan.cost+' 金币\n当前余额：'+s.players[0].cash+' 金币\n'+(active?'当前已生效，有效至第 '+s.plans[0].until+' 轮。':'投入后余额：'+(s.players[0].cash-plan.cost)+' 金币')+'\n\n'+map.tip);
 if(mapPlanAllowed(0)){const game=s;const confirm=button('确认投入 · '+plan.cost+' 金币',()=>{if(s!==game)return;if(activateMapPlan(0)){save();render();$('dialog').close()}});confirm.id='restartConfirm';$('dialog').append(confirm)}
 else if(!active)$('modalText').textContent+='\n请在自己的回合、金币足够时投入。';
}
function districtCount(i,id){return Object.entries(s.lots).filter(([k,l])=>l.owner===id&&tiles[k].band===tiles[i].band).length}
function districtBonus(i,id){const count=districtCount(i,id)+(s.lots[i]?.owner===id?0:1);return s.stage===2&&count>=2?1.15:1}
function mapRentMultiplier(i,id){let value=s.stage===1&&s.round%4===0?1.25:s.stage===3&&s.round%4===0?1.2:1;value*=districtBonus(i,id);if(activeMapPlan(id)&&s.stage===1)value*=1.15;if(activeMapPlan(id)&&s.stage===2)value*=1.2;return value}
function mapForecast(){if(!s.stage)return '晴朗海风 · 新手经营';const period=s.stage===2?3:4;const current=s.round%period===0;const next=period-s.round%period;return current?marketEffect():marketEffect()+' · '+next+'轮后'+(['','旅游旺季','商业展会','暴雪'][s.stage])}
function mapEvent(){const id=s.turn,p=s.players[id],event=mapData().events[Math.floor(Math.random()*mapData().events.length)];let amount=event[1];if(amount<0&&s.stage===3&&activeMapPlan(id))amount=Math.min(0,amount+80);s.message=p.name+event[0]+(amount>=0?'，获得 '+amount:'，支付 '+(-amount))+' 金币。';if(amount<0&&consumeRepair(id)){s.message=p.name+'用维修防护抵挡了'+(-amount)+'金币支出。';amount=0}log(s.message);if(amount>=0)p.cash+=amount;else charge(id,-amount)}
let progress={unlocked:0,stars:{}};try{const p=JSON.parse(localStorage.getItem('coast-campaign-v1'));if(p&&Number.isInteger(p.unlocked))progress={unlocked:Math.max(0,Math.min(3,p.unlocked)),stars:p.stars||{}}}catch{}
const STAGE0_TILES=[['起点','start',0,'#8fd0c2'],['金沙街','land',180,'#f2c94c'],['椰风路','land',160,'#f2c94c'],['城市事件','chance',0,'#9aa5b1'],['望海街','land',140,'#7fb3e8'],['渔港路','land',160,'#7fb3e8'],['风暴滞留','storm',0,'#2b3a55'],['帆船港','land',180,'#7fb3e8'],['蓝湾路','land',120,'#7fb3e8'],['道具补给','supply',0,'#c9a7e8'],['椰林路','land',160,'#8fd0a0'],['海景大道','land',140,'#8fd0a0'],['休闲广场','rest',0,'#8fd0a0'],['潮汐路','land',160,'#7fb3e8'],['星海街','land',120,'#7fb3e8'],['海岸决斗场','duel',0,'#e6b369'],['月牙湾','land',140,'#f2c94c'],['银滩路','land',180,'#f2c94c'],['风暴滞留','storm',0,'#2b3a55'],['灯塔路','land',160,'#e07856'],['白浪街','land',140,'#e07856'],['休闲广场','rest',0,'#8fd0a0'],['珊瑚湾','land',120,'#7fb3e8'],['海滨路','land',140,'#7fb3e8']];
function makeTiles(stage){if(stage===0)return STAGE0_TILES.map(a=>({name:a[0],type:a[1],price:a[2],band:a[3]}));const c=CHAPTERS[stage];let k=0;return Array.from({length:24},(_,i)=>{const type=i===15?'duel':i===9?'supply':i===0?'start':i===6?'tax':i===12?'rest':i===18?'storm':i%6===3?'chance':'land';return {name:type==='land'?c.streets[k++]:({start:'起点',tax:MAPS[stage].tax,rest:MAPS[stage].rest,storm:MAPS[stage].storm,chance:'城市事件',supply:'道具补给',duel:'海岸决斗场'})[type],type,price:Math.round((100+Math.floor(i/6)*65+(i%6)*15)*c.scale),band:['#87bca6','#d9b77c','#91baca','#bb9bc6'][Math.floor(i/6)]}})}
let tiles=makeTiles(0);
function fresh(stage=0){const c=CHAPTERS[stage];return {stage,players:['你','小橙','阿蓝'].map((name,i)=>({name,role:i?['builder','merchant','traveler','landlord'][(stage+i-1)%4]:selectedRole,style:i?AI_SEATS[i]:undefined,cash:i?c.aiCash:c.cash,pos:0,out:false,skip:0,cards:[],cardUsed:false,remoteDice:0,rentShield:false,repairShield:false,roadblock:false})),lots:{},turn:0,round:1,phase:'roll',dice:0,acted:false,propertyAction:null,message:'欢迎来到'+c.name+'！停在道具补给格可随机抽卡，掷骰前使用。',logs:[c.rule],winner:null}}
let s=fresh();try{const raw=JSON.parse(localStorage.getItem(KEY));if(raw&&raw.players?.length===3&&['roll','land','end','over'].includes(raw.phase)){s={...raw,stage:Number.isInteger(raw.stage)&&raw.stage>=0&&raw.stage<4?raw.stage:0};tiles=makeTiles(s.stage)}}catch{}let busy=false,aiTimer,aiGeneration=0;let atHome=true;
function chapter(){return CHAPTERS[s.stage]}
function objective(){return '通关：'+(chapter().first?'总资产第一名且':'存活且')+'总资产 ≥ '+chapter().target+'；或淘汰所有对手'}
function marketEffect(){return s.stage===1&&s.round%4===0?'旅游旺季 · 租金 +25%':s.stage===2&&s.round%3===0?'商业展会 · 工资 +100':s.stage===3&&s.round%4===0?'暴雪来袭 · 税费 +100 / 租金 +20%':'平稳经营期'}
function salary(){return Math.round((chapter().salary+(s.stage===2&&s.round%3===0?100:0))*(s.players[s.turn]?.role==='traveler'?1.2:1))}
function tax(){return chapter().tax+(s.stage===3&&s.round%4===0&&!activeMapPlan(s.turn)?100:0)}
function renderCampaign(){const c=chapter();$('mapName').textContent=c.name;$('mapIcon').textContent=c.icon;$('board').style.setProperty('--map-color',c.color);$('campaignGoal').textContent=objective();$('marketEffect').textContent=marketEffect();$('campaignCards').replaceChildren();CHAPTERS.forEach((m,i)=>{const card=document.createElement('button');card.className='chapter-card'+(i===s.stage?' selected':'');card.disabled=busy||i>progress.unlocked;card.textContent=m.icon+' '+m.tag+' / '+m.name+' '+(i>progress.unlocked?'🔒':progress.stars[i]?'★'.repeat(progress.stars[i]):'未通关');card.onclick=()=>chooseChapter(i);$('campaignCards').append(card)});$('chapterBrief').textContent=c.desc+' '+c.rule;$('goalProgress').textContent='你的总资产 '+net(0)+' / '+c.target+' · 排名 '+(1+s.players.filter((p,i)=>i&&!p.out&&net(i)>net(0)).length);}
function startChapter(i){if(busy||i<0||i>progress.unlocked)return;cancelAI();s=fresh(i);tiles=makeTiles(i);$('dialog').close();enterGame();save();render()}
function chooseChapter(i){if(busy||i>progress.unlocked)return;modal('进入'+CHAPTERS[i].name+'？','出战角色：'+ROLES[selectedRole].name+'（'+ROLES[selectedRole].desc+'）\n将开始新的关卡对局，替换当前棋局。已经获得的通关星级会保留。\n'+CHAPTERS[i].desc+'\n'+CHAPTERS[i].rule);const b=button('以'+ROLES[selectedRole].name+'开始挑战',()=>startChapter(i));b.id='restartConfirm';$('dialog').append(b)}
let previousCash=null,previousGame=null,audioContext=null,soundOn=true;
try{soundOn=localStorage.getItem('coast-sound')!=='off'}catch{}
function unlockAudio(){if(!soundOn)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(Audio){audioContext??=new Audio();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{})}}catch{}}
function moneySound(gain){
 if(!soundOn||!audioContext||audioContext.state!=='running')return;
 try{
  const now=audioContext.currentTime,impacts=gain?[0,.075,.17,.28,.41,.52]:[0,.09,.21,.34];
  impacts.forEach((delay,i)=>{
   const at=now+delay,base=(gain?2150:1850)*(1+(i%3)*.09),strength=.035*Math.pow(.76,i);
   // Inharmonic metal resonances and a brief impact create bouncing coins.
   [1,1.47,2.09,2.73].forEach((ratio,j)=>{
    const oscillator=audioContext.createOscillator(),envelope=audioContext.createGain();
    oscillator.type='sine';oscillator.frequency.setValueAtTime(base*ratio,at);
    oscillator.frequency.exponentialRampToValueAtTime(base*ratio*.98,at+.18);
    envelope.gain.setValueAtTime(.0001,at);envelope.gain.linearRampToValueAtTime(strength/(j+1),at+.002);
    envelope.gain.exponentialRampToValueAtTime(.0001,at+.24-j*.035);
    oscillator.connect(envelope);envelope.connect(audioContext.destination);oscillator.start(at);oscillator.stop(at+.27);
    oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect()};
   });
   const length=Math.ceil(audioContext.sampleRate*.018),buffer=audioContext.createBuffer(1,length,audioContext.sampleRate),samples=buffer.getChannelData(0);
   for(let n=0;n<length;n++)samples[n]=(Math.random()*2-1)*Math.pow(1-n/length,3);
   const impact=audioContext.createBufferSource(),filter=audioContext.createBiquadFilter(),volume=audioContext.createGain();
   impact.buffer=buffer;filter.type='highpass';filter.frequency.value=2800;volume.gain.value=strength*.9;
   impact.connect(filter);filter.connect(volume);volume.connect(audioContext.destination);impact.start(at);
   impact.onended=()=>{impact.disconnect();filter.disconnect();volume.disconnect()};
  });
 }catch{}
}
function moneyEffects(){const values=s.players.map(p=>p.cash);if(previousGame===s&&previousCash){let soundDelta=0;values.forEach((cash,i)=>{const change=cash-previousCash[i];if(!change)return;const card=$('players').children[i];if(!card)return;card.classList.add(change>0?'money-gain':'money-loss');const label=document.createElement('span');label.className='money-float '+(change>0?'positive':'negative');label.textContent=(change>0?'+':'−')+Math.abs(change).toLocaleString()+' 金币';label.setAttribute('aria-hidden','true');card.append(label);label.addEventListener('animationend',()=>label.remove(),{once:true});if(i===0||soundDelta===0)soundDelta=change;});if(soundDelta)moneySound(soundDelta>0)}previousCash=values;previousGame=s;}
function renderSound(){const b=$('sound');b.textContent=soundOn?'♫ 音效开':'♪ 已静音';b.setAttribute('aria-pressed',String(soundOn))}
$('sound').onclick=()=>{soundOn=!soundOn;try{localStorage.setItem('coast-sound',soundOn?'on':'off')}catch{}if(soundOn){unlockAudio();if(audioContext)audioContext.resume().then(()=>moneySound(true)).catch(()=>{})}renderSound()};
window.addEventListener('pointerdown',unlockAudio,{passive:true});window.addEventListener('keydown',unlockAudio);
function save(){try{localStorage.setItem(KEY,JSON.stringify(s))}catch{$('status').textContent+='（浏览器无法保存进度）'}}
function log(t){s.logs.unshift(t);s.logs=s.logs.slice(0,8)}
function net(i){return s.players[i].cash+Object.entries(s.lots).filter(([k,v])=>v.owner===i).reduce((v,[k,l])=>v+investment(k),0)}
function rentPreview(i,owner=s.turn,level=0){const modifier=mapRentMultiplier(i,owner);return Math.round(tiles[i].price*.2*(1+level*1.5)*modifier*(s.players[owner]?.role==='landlord'?1.1:1))}
function rent(i){return rentPreview(i,s.lots[i]?.owner,s.lots[i]?.level||0)}
function propertyActionUsed(id=s.turn){return s.acted===true||(s.propertyAction?.round===s.round&&s.propertyAction.player===id)}
function recordPropertyAction(kind,i,from=null,to=null){s.acted=true;s.propertyAction={round:s.round,player:s.turn,kind,lot:i,from,to}}
function canUpgrade(i,id=0){const p=s.players[id];return !!p&&!busy&&!propertyActionUsed(id)&&s.turn===id&&s.phase==='end'&&!p.out&&p.pos===i&&tiles[i]?.type==='land'&&s.lots[i]?.owner===id&&s.lots[i].level<3&&p.cash>=upgradeCost(i,id)}
function button(label,fn,disabled=false){const b=document.createElement('button');b.textContent=label;b.onclick=fn;b.disabled=disabled;return b}
function modal(title,body){const old=$('restartConfirm');if(old)old.remove();$('modalClose').textContent='继续游戏';$('modalTitle').textContent=title;$('modalText').textContent=body;$('dialog').showModal()}
$('modalClose').onclick=()=>$('dialog').close();$('help').onclick=()=>modal('闯关置业指南','四张地图依次解锁，关卡规则显示在棋盘上方。\n'+objective()+'。\n每回合掷一枚骰子，经过起点领取工资；停在道具补给格时随机抽一张卡（四种各25%，最多4张）。掷骰前最多用一张卡，与买地或升级的次数分开计算；电脑遵守相同规则。道具入口可查看每张卡的说明。停在海岸决斗场可自选一位对手比骰子大小，赢家获得至多40游戏金币；平局或离开不扣钱。决斗每次到场限一次，独立于移动骰子。城市委托可自愿选择经营目标，在期限内完成后手动领奖；每局最多接三份，每轮最多接一份，失败不扣钱。行动必须“走到”对应的格子上才生效：停在待售空地才能买下它，停在自己名下的地产才能升级它，停在别人的地产要付租金。\n每回合（指你自己的回合）在「买地」和「升级」中只能选一项执行一次：买了地就不能升级，升级了就不能买地；电脑对手遵守同样限制。升级必须落在自己的地皮上，最多 3 级，费用为地价的 60%。\n现金不足时以投入的一半自动出售地产；仍不足则破产。本关失败可重试，通关进度保留。\n通关获得 1 星；无负债且现金 ≥ 300 加 1 星；总资产 ≥ 目标的 125% 再加 1 星。\n后续地图有旺季、展会或暴雪周期，对所有玩家同样生效。\n角色技能：地主收租 +10%，建筑师升级费 −15%，商人购地费 −10%，旅行家过点工资 +20%；盗贼是唯一被动技能——除开局外，只要与任意玩家停在同一格，就自动偷走对方现有现金的 10%（不占用本回合行动，谁走到谁身上都算）。\n两位电脑对手风格不同：小橙（🔥 进取型）优先抢地、现金薄；阿蓝（⚖️ 稳健型）优先攒现金、扩张慢。');
$('reset').onclick=()=>chooseChapter(s.stage);
function tilePosition(i){if(i<=6)return [1,i+1];if(i<=12)return [i-5,7];if(i<=18)return [7,19-i];return [25-i,1]}
function render(){
 renderCampaign();renderRoles();renderSound();
 $('board').querySelectorAll('.tile').forEach(e=>e.remove());tiles.forEach((t,i)=>{const d=document.createElement('div');d.className='tile tile-'+t.type+(s.players[s.turn].pos===i?' current':'');const [r,c]=tilePosition(i);d.style.gridRow=r;d.style.gridColumn=c;d.style.setProperty('--band',t.band);d.setAttribute('role','button');d.tabIndex=0;d.setAttribute('aria-label',t.name);const stripe=document.createElement('div');stripe.className='stripe';const label=document.createElement('div');label.className='label';label.textContent=t.name;const price=document.createElement('div');price.className='price';const lot=s.lots[i];price.textContent=t.type==='land'?(lot?'租 '+rent(i)+' · '+lot.level+'级':'买地 '+purchaseCost(i)+'\n租金 '+rentPreview(i)):({start:'+'+salary(),tax:'−'+tax(),rest:'+'+chapter().rest,storm:'停一回合',chance:'好运来',supply:'随机道具',duel:'掷骰比大小'})[t.type];const tokens=document.createElement('div');tokens.className='tokens';s.players.forEach((p,j)=>{if(!p.out&&p.pos===i){const token=document.createElement('span');token.className='token';token.style.background=COLORS[j];token.style.setProperty('--pawn',COLORS[j]);token.setAttribute('aria-label',p.name);token.innerHTML=playerArt(j);token.setAttribute('data-player',String(j));token.classList.add('illustrated-pawn');tokens.append(token)}});d.append(stripe,label,price,tokens);if(lot){const owner=document.createElement('div');owner.className='owner';owner.style.background=COLORS[lot.owner];d.append(owner);const building=document.createElement('div');building.className='mini-building level-'+lot.level;building.style.setProperty('--building',COLORS[lot.owner]);building.style.setProperty('--height',(13+lot.level*9)+'px');building.setAttribute('aria-hidden','true');for(const face of ['front','side','roof']){const f=document.createElement('i');f.className=face;building.append(f)}d.append(building)}d.onclick=()=>inspect(i);d.onkeydown=e=>{if(e.key==='Enter')inspect(i)};$('board').append(d)});
 $('round').textContent=`第 ${s.round} 回合`;$('turn').textContent=s.phase==='over'?'本局结束':s.players[s.turn].name+'的回合';$('dice').textContent=s.dice?['⚀','⚁','⚂','⚃','⚄','⚅'][s.dice-1]:'⚄';$('dice').className=busy?'rolling':'';$('status').textContent=s.message;$('reset').disabled=busy;$('homeButton').disabled=busy;
 $('players').replaceChildren();s.players.forEach((p,i)=>{const d=document.createElement('div');d.className='player'+(s.turn===i?' active':'')+(p.out?' out':'');d.innerHTML=`<div class="player-top"><span class="avatar" style="background:${COLORS[i]}">${playerArt(i)}</span><strong>${p.name} · ${role(i).name}</strong><small>${p.out?'已破产':i?'电脑':'玩家'}</small></div><div class="cash">🪙 ${p.cash.toLocaleString()}</div><div class="meta">${role(i).icon} ${role(i).desc}</div>${i?'<div class="meta ai-tag">'+aiStyle(i).icon+' '+aiStyle(i).label+'<span class="ai-desc"> · '+aiStyle(i).desc+'</span></div>':''}<div class="meta">总资产 ${net(i).toLocaleString()} · 地产 ${Object.values(s.lots).filter(l=>l.owner===i).length} 块</div>`;$('players').append(d)});
 moneyEffects();
 $('actions').replaceChildren();if(!busy&&s.phase!=='over'&&s.turn===0){if(s.phase==='roll')$('actions').append(button(s.players[0].skip?'等待风暴过去':'掷骰子 →',roll));if(s.phase==='land'){if(s.acted){$('actions').append(button('结束回合 →',endTurnFromLand))}else{const pos=s.players[0].pos,cost=purchaseCost(pos),short=s.players[0].cash<cost;$('actions').append(button(short?'金币不足，无法购买':'确认购买 · '+cost+' 金币',requestPurchase,short),button('不买 · 不扣钱',declinePurchase))}}if(s.phase==='end')$('actions').append(button('结束回合 →',next))}if(s.phase==='over'){$('actions').append(button('重试本关',()=>chooseChapter(s.stage)));if(s.passed&&s.stage<3)$('actions').append(button('下一关 →',()=>startChapter(s.stage+1)));}
 const my=Object.entries(s.lots).filter(([k,l])=>l.owner===0);$('ownedCount').textContent=my.length+' 块'+(s.turn===0&&!busy&&s.phase!=='over'?(s.acted?' · 本回合已行动':(my.some(([k])=>+k===s.players[0].pos)?' · 可在本格升级':' · 需走到地块上才能升级')):'');$('properties').replaceChildren();if(!my.length)$('properties').textContent='还没有地产，去看看下一站吧。';my.forEach(([k,l])=>{const d=document.createElement('div');d.className='estate';const text=document.createElement('span');text.textContent=tiles[k].name+' · '+l.level+'级';const here=s.turn===0&&!s.players[0].out&&s.players[0].pos===+k;const label=l.level===3?'已满级':s.turn!==0?'等待你的回合':!here?'需走到此处':s.phase!=='end'?'掷骰停留后可升级':s.acted?'本回合已行动':s.players[0].cash<upgradeCost(+k,0)?'金币不足':'升级 '+upgradeCost(+k,0);d.append(text,button(label,()=>requestUpgrade(+k),!canUpgrade(+k)));$('properties').append(d)});$('logs').replaceChildren(...s.logs.map(t=>{const p=document.createElement('p');p.textContent=t;return p}));
}

function requestPurchase(){
 if(busy||s.acted||s.turn!==0||s.phase!=='land')return;
 const i=s.players[0].pos,cost=purchaseCost(i,0),game=s;
 if(tiles[i].type!=='land'||s.lots[i]||s.players[0].cash<cost)return;
 modal('购买'+tiles[i].name+'？','购买费用：'+cost+' 金币\n买下后租金：'+rentPreview(i,0)+' 金币/次\n当前余额：'+s.players[0].cash+' 金币\n购买后余额：'+(s.players[0].cash-cost)+' 金币\n\n取消不会扣钱；空地停留免费。');
 $('modalClose').textContent='再想想';
 const confirm=button('确认购买 · '+cost+' 金币',()=>{
  if(s!==game||s.turn!==0||s.phase!=='land'||s.players[0].pos!==i||purchaseCost(i,0)!==cost)return;
  buy();$('dialog').close();
 });confirm.id='restartConfirm';$('dialog').append(confirm);
}
function requestUpgrade(i){
 if(!canUpgrade(i))return;
 const game=s,level=s.lots[i].level,cost=upgradeCost(i,0),nextRent=rentPreview(i,0,level+1);
 modal('升级'+tiles[i].name+'？','建筑等级：'+level+' → '+(level+1)+' / 3\n升级费用：'+cost+' 金币\n租金变化：'+rent(i)+' → '+nextRent+' 金币/次\n当前余额：'+s.players[0].cash+' 金币\n升级后余额：'+(s.players[0].cash-cost)+' 金币');
 $('modalClose').textContent='取消升级';
 const confirm=button('确认升级 · '+cost+' 金币',()=>{
  if(s!==game||!canUpgrade(i)||s.lots[i].level!==level||upgradeCost(i,0)!==cost)return;
  upgrade(i);$('dialog').close();
 });confirm.id='restartConfirm';$('dialog').append(confirm);
}

function inspect(i){const t=tiles[i],lot=s.lots[i];modal(t.name,t.type==='land'?`原价：${t.price} 金币 / 当前角色购买价：${purchaseCost(i)} 金币\n业主：${lot?s.players[lot.owner].name:'尚未出售'}\n${lot?'等级：'+lot.level+' / 3\n租金：'+rent(i):'买下后 0 级租金：'+rentPreview(i)+' 金币/次（含当前角色技能与本轮加成）\n升级后租金：1级 '+rentPreview(i,s.turn,1)+' / 2级 '+rentPreview(i,s.turn,2)+' / 3级 '+rentPreview(i,s.turn,3)+' 金币/次\n单次升级费用：'+upgradeCost(i)+' 金币\n按当前租金约需 '+Math.ceil(purchaseCost(i)/rentPreview(i))+' 次收租覆盖购地款（不保证对手到访）。'}\n只有棋子停在这块地上时，才能在本回合升级它（每回合一次行动）。`:({start:'经过起点领取 '+salary()+' 金币。',tax:'本轮支付 '+tax()+' 金币维护城市。',chance:'随机发生一件奖金或支出事件。',duel:'停在这里可选择任意一位未破产对手掷骰决斗，也可以免费离开。双方各掷一次，点数大者获胜，从败方获得至多40游戏金币（不会超过双方现有现金）。平局不转账。每次到场只能决斗一次，遥控骰子不影响结果。',supply:'停在这里随机获得一张道具（遥控骰子、免租卡、路障卡、维修卡各25%）。背包最多4张；已满时不领取、不替换。只经过此格不抽卡。',rest:'休闲广场领取 '+chapter().rest+' 金币城市补贴。',storm:'下一个回合停走一次。'})[t.type]);if(s.stage===2&&t.type==='land')$('modalText').textContent+='\n同色街区：你已持有 '+districtCount(i,0)+' 块；持有至少2块时每块租金增加15%。';if(canUpgrade(i)){const upgradeButton=button('查看升级方案 · '+upgradeCost(i,0)+' 金币',()=>{$('dialog').close();requestUpgrade(i)});upgradeButton.id='restartConfirm';$('dialog').append(upgradeButton)}}
function checkWin(){if(s.phase==='over')return true;const alive=s.players.map((p,i)=>p.out?-1:i).filter(i=>i>=0);if(s.players[0].out||alive.length<=1||s.round>chapter().rounds){const best=Math.max(0,...alive.map(net));s.winner=alive.filter(i=>net(i)===best);s.phase='over';s.round=Math.min(s.round,chapter().rounds);s.passed=!s.players[0].out&&(alive.length===1||(net(0)>=chapter().target&&(!chapter().first||net(0)===best)));if(s.passed){const stars=1+(s.players[0].cash>=300?1:0)+(net(0)>=chapter().target*1.25?1:0);progress.stars[s.stage]=Math.max(progress.stars[s.stage]||0,stars);progress.unlocked=Math.max(progress.unlocked,Math.min(3,s.stage+1));try{localStorage.setItem('coast-campaign-v1',JSON.stringify(progress))}catch{}s.message=chapter().name+'通关！'+ '★'.repeat(stars)+' 总资产 '+net(0)+(s.stage<3?'，已解锁下一张地图！':'，全部地图挑战完成！');}else{s.message='挑战未通过。'+(s.players[0].out?'你已破产。':'总资产 '+net(0)+'，未满足本关目标。')+'可以保留经验，重新挑战。';}log(s.message);return true}return false}
function charge(id,amount,to=null){const p=s.players[id];const owned=Object.keys(s.lots).filter(k=>s.lots[k].owner===id).sort((a,b)=>tiles[a].price-tiles[b].price);while(p.cash<amount&&owned.length){const k=owned.shift(),l=s.lots[k],refund=Math.floor(investment(k)*.5);p.cash+=refund;delete s.lots[k];log(p.name+'资金不足，变卖'+tiles[k].name+'获得 '+refund+'。')}const paid=Math.min(p.cash,amount);p.cash-=paid;if(to!==null)s.players[to].cash+=paid;if(paid<amount){p.out=true;Object.keys(s.lots).forEach(k=>{if(s.lots[k].owner===id)delete s.lots[k]});log(p.name+'破产，退出本局。')}checkWin()}
// 盗贼技能：除开局外，与其他人停在同格即偷走对方 10% 现金（被动，不占用回合行动）
function thiefSteal(){
 const cells={};s.players.forEach((q,i)=>{if(!q.out)(cells[q.pos]=cells[q.pos]||[]).push(i)});
 const notes=[];
 Object.values(cells).forEach(ids=>{
  if(ids.length<2)return;
  const thieves=ids.filter(i=>s.players[i].role==='thief');
  if(!thieves.length)return;
  thieves.forEach(t=>ids.filter(i=>i!==t).forEach(v=>{
   const amount=Math.floor(s.players[v].cash*.1);
   if(amount<=0)return;
   s.players[v].cash-=amount;s.players[t].cash+=amount;
   const note=s.players[t].name+'（盗贼）顺手牵羊，从'+s.players[v].name+'身上偷走 '+amount+' 金币。';
   notes.push(note);log(note);
  }));
 });
 return notes.length?' '+notes.join(' '):'';
}
function land(){const p=s.players[s.turn],i=p.pos,t=tiles[i];s.phase='end';if(t.type==='land'){const l=s.lots[i];if(!l){if(s.acted){s.message=p.name+'本回合行动已用完（已购地或已升级），'+t.name+'暂不能购买，请结束回合。'}else{s.phase='land';s.message=p.name+'来到'+t.name+'（空地停留免费）。购买价 '+purchaseCost(i)+' 金币 ｜ 买下后租金 '+rentPreview(i)+' 金币/次（0级，含角色技能和本轮加成） ｜ '+(p.cash<purchaseCost(i)?'余额 '+p.cash+'，金币不足，可免费离开。':'购买后余额 '+(p.cash-purchaseCost(i))+' 金币。')}}else if(l.owner!==s.turn){const cost=rent(i),owner=l.owner;if(consumeWaiver(s.turn)){s.message=p.name+'使用免租防护，免付 '+cost+' 金币租金。';log(s.message)}else{s.message=p.name+'向'+s.players[owner].name+'支付 '+cost+' 金币租金。';log(s.message);charge(s.turn,cost,owner)}}else s.message='回到自己的'+t.name+'，不收租、不扣钱。'+(s.acted?'本回合行动已用完，不能再升级。':'停在这里可以升级它（每回合只能行动一次）。')}else if(t.type==='tax'){if(consumeRepair(s.turn)){s.message=p.name+'用维修防护免付 '+tax()+' 金币维护费。';log(s.message)}else{s.message=p.name+'支付 '+tax()+' 金币城市税。';log(s.message);charge(s.turn,tax())}}else if(t.type==='duel'){s.duelOffer={player:s.turn,round:s.round,used:false};s.duel=null;s.message=p.name+'来到决斗场，可选择一位对手掷骰决斗，也可免费离开。胜方从败方获得至多40金币，平局不扣钱。'}else if(t.type==='supply'){const key=awardCard(s.turn);s.message=key?p.name+'在道具补给格抽到了'+CARD_TYPES[key].name+'！已放入背包。':p.name+'的背包已满（4张），本次未领取道具。'}else if(t.type==='chance'){mapEvent()}else if(t.type==='storm'){if(s.stage===3&&activeMapPlan(s.turn)){s.message=p.name+'的防寒改造保持道路畅通，不停走。'}else if(consumeRepair(s.turn)){s.message=p.name+'用维修防护抵挡封路，不停走。'}else{p.skip=1;s.message=p.name+'遇到'+mapData().storm+'，下个回合停走一次。'}log(s.message)}else if(t.type==='rest'){p.cash+=chapter().rest;s.message=p.name+'在'+mapData().rest+'获得 '+chapter().rest+' 金币补贴。';log(s.message)}else s.message=t.type==='start'?'回到起点，新的旅程开始了。':'海风轻拂，安心休息一站。';s.message+=thiefSteal();checkWin();save();render()}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function roll(){if(busy||s.phase!=='roll')return;const p=s.players[s.turn];if(p.roadblock){p.roadblock=false;s.phase='end';s.message=p.name+'清除路障，本回合停走一次。';log(s.message);save();render();if(s.turn!==0)scheduleAI();return}if(p.skip){p.skip--;s.phase='end';s.message=p.name+'等待风暴过去，本回合不移动。';log(s.message);save();render();if(s.turn!==0)scheduleAI();return}busy=true;s.dice=p.remoteDice||1+Math.floor(Math.random()*6);p.remoteDice=0;s.message=p.name+'掷出了 '+s.dice+' 点！';render();await pause(650);for(let k=0;k<s.dice;k++){p.pos=(p.pos+1)%24;if(p.pos===0){p.cash+=salary();log(p.name+'经过起点，领取 '+salary()+' 金币。')}render();await pause(180)}busy=false;land();if(s.turn!==0)scheduleAI()}
function declinePurchase(){if(busy||s.phase!=='land'||s.turn!==0)return;s.phase='end';s.message='你选择不买'+tiles[s.players[0].pos].name+'，没有扣除金币。';log(s.message);save();render()}
function buy(){
 if(busy||propertyActionUsed()||s.phase!=='land')return false;
 const p=s.players[s.turn],i=p.pos;if(p.out||tiles[i].type!=='land'||s.lots[i]||p.cash<purchaseCost(i))return false;
 const paid=purchaseCost(i);recordPropertyAction('buy',i);p.cash-=paid;s.lots[i]={owner:s.turn,level:0,invested:paid};s.phase='end';
 s.message='第 '+s.round+' 轮 · '+p.name+'确认购买'+tiles[i].name+'，支付 '+paid+' 金币（0级）。';log(s.message);save();render();return true;
}
function upgrade(i,id=0){
 if(!canUpgrade(i,id))return false;
 const cost=upgradeCost(i,id),from=s.lots[i].level;
 recordPropertyAction('upgrade',i,from,from+1);s.lots[i].invested=investment(i)+cost;s.players[id].cash-=cost;s.lots[i].level=from+1;
 s.message='第 '+s.round+' 轮 · '+s.players[id].name+'将'+tiles[i].name+'从 '+from+' 级升级到 '+(from+1)+' 级，支付 '+cost+' 金币；本回合行动已用完。';
 log(s.message);save();render();return true;
}
function endTurnFromLand(){if(busy||s.phase!=='land'||s.turn!==0)return;s.phase='end';next()}
function next(){if(busy||s.phase!=='end')return;s.duelOffer=null;do{s.turn=(s.turn+1)%3;if(s.turn===0)s.round++}while(s.players[s.turn].out);if(checkWin()){save();render();return}s.acted=false;s.players[s.turn].cardUsed=false;s.phase='roll';s.message=s.players[s.turn].name+'准备出发。';save();render();scheduleAI()}

function aiCashBuffer(id){
 const base=chapter().reserve*aiStyle(id).reserve;if(s.stage<2)return base;
 const enemyRents=Object.keys(s.lots).filter(k=>s.lots[k].owner!==id).map(k=>rent(+k)).sort((a,b)=>b-a);
 return Math.max(base,(enemyRents[0]||0)*.65+chapter().tax*.65+(s.stage===3&&s.round%4===3?100:0));
}
function aiBuyPlan(id){const p=s.players[id],i=p.pos,price=purchaseCost(i,id);let reserve=aiCashBuffer(id);if(s.stage>=2){const group=districtCount(i,id);if(s.stage===2&&group>0)reserve*=.8;if(chapter().rounds-s.round<3&&group===0)reserve*=1.5}return {price,ok:tiles[i].type==='land'&&!s.lots[i]&&p.cash>=price&&p.cash-price>=reserve}}
function aiUpgradeGuard(id){return s.stage<2?chapter().upgradeReserve*aiStyle(id).upgradeReserve:Math.max(aiCashBuffer(id),chapter().upgradeReserve*aiStyle(id).upgradeReserve)}
function aiUpgradeLimit(){return 1}
function aiUpgradeScore(i,id){const l=s.lots[i],gain=rentPreview(i,id,l.level+1)-rent(i),cost=upgradeCost(i,id);if(s.stage<2)return rent(i);const traffic=s.players.reduce((sum,p,j)=>j!==id&&!p.out?sum+((i-p.pos+24)%24<=12?1.3:.7):sum,0);return gain/cost*traffic*(s.stage===2&&districtCount(i,id)>=2?1.15:1)}
function aiUpgradeCandidate(id){const p=s.players[id],guard=aiUpgradeGuard(id);return Object.keys(s.lots).filter(k=>canUpgrade(+k,id)&&p.cash-upgradeCost(+k,id)>guard).sort((a,b)=>aiUpgradeScore(+b,id)-aiUpgradeScore(+a,id))[0]}
function aiMapPlan(id){if(!mapPlanAllowed(id))return false;const count=Object.values(s.lots).filter(l=>l.owner===id).length,plan=mapData().plan;if(s.players[id].cash-plan.cost<aiCashBuffer(id))return false;const suitable=s.stage===3?(s.round%4===3||s.round%4===0):count>=2;if(!suitable)return false;return activateMapPlan(id)}
function cancelAI(){clearTimeout(aiTimer);aiGeneration++}
function scheduleAI(){
 cancelAI();if(atHome||s.turn===0||s.phase==='over')return;
 const game=s,id=s.turn,round=s.round,phase=s.phase,ticket=aiGeneration,st=aiStyle(id);
 const current=()=>s===game&&s.turn===id&&s.round===round&&s.phase===phase&&ticket===aiGeneration&&!busy&&!atHome&&!s.players[id].out;
 aiTimer=setTimeout(async()=>{
  if(!current())return;
  aiQuestStep(id);if(!current())return;
  if(s.phase==='roll'){aiUseCard(id);roll();return}
  if(s.phase==='land'){
   const p=s.players[id];if(aiBuyPlan(id).ok)buy();else{s.phase='end';s.message=p.name+'（'+st.label+'）决定不买这块地，先留着现金。';save();render()}
   scheduleAI();return;
  }
  if(s.phase==='end'){
   if(duelVisitAllowed(id)){await aiDuelStep(id);if(!current())return}
   aiMapPlan(id);
   const lot=aiUpgradeCandidate(id);if(lot!==undefined)upgrade(+lot,id);
   if(current())next();
  }
 },st.think);
}
let cameraAngle=0,cameraTop=false;
function updateCamera(){const board=$('board');board.style.setProperty('--rotation',cameraAngle+'deg');board.style.setProperty('--tilt',cameraTop?'0deg':'24deg');$('viewTop').textContent=cameraTop?'立体视角':'俯视';}
$('rotateLeft').onclick=()=>{cameraAngle=Math.max(-45,cameraAngle-9);updateCamera()};$('rotateRight').onclick=()=>{cameraAngle=Math.min(45,cameraAngle+9);updateCamera()};$('cameraReset').onclick=()=>{cameraAngle=0;cameraTop=false;updateCamera()};$('viewTop').onclick=()=>{cameraTop=!cameraTop;updateCamera()};updateCamera();
function hasSavedGame(){try{return !!localStorage.getItem(KEY)}catch{return false}}
function renderHome(){const saved=hasSavedGame();$('continueGame').hidden=!saved;$('newAdventure').textContent=saved?'开始新冒险':'开始冒险 →';$('newAdventure').className=saved?'':'start-primary';$('startSaveInfo').textContent=saved?'当前进度：'+chapter().name+' · 第 '+s.round+' 轮 · '+role(0).name+' · '+(s.phase==='over'?'本局已结束':'现金 '+s.players[0].cash+' 金币'):'从第一关出发，逐步解锁四座城市。';$('startHero').innerHTML=characterArt(selectedRole);$('startRoleCards').replaceChildren();Object.entries(ROLES).filter(([k])=>k!=='resident').forEach(([k,r])=>{const b=button('',()=>{selectedRole=k;try{localStorage.setItem('coast-selected-role',k)}catch{}renderHome();renderRoles()});b.className='role-card'+(selectedRole===k?' selected':'');b.setAttribute('aria-pressed',String(selectedRole===k));b.innerHTML=characterArt(k)+'<span class="character-info"><strong>'+r.name+'</strong><small>'+r.skill+'</small><span>'+r.desc+'</span></span>';$('startRoleCards').append(b)})}
function enterGame(){atHome=false;$('startScreen').hidden=true;$('gameScreen').hidden=false;render();scheduleAI()}
function goHome(){if(busy)return;cancelAI();atHome=true;save();$('gameScreen').hidden=true;$('startScreen').hidden=false;renderHome()}
$('homeButton').onclick=goHome;$('continueGame').onclick=enterGame;$('startRules').onclick=()=>$('help').click();$('newAdventure').onclick=()=>{if(hasSavedGame())chooseChapter(0);else startChapter(0)};
render();renderHome();



