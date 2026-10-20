(function(){
 const button=document.getElementById('landscapeStart');
 async function landscape(){
  try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen()}catch{}
  try{if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock('landscape')}catch{}
  const hint=document.getElementById('orientationHint');
  if(window.matchMedia('(orientation: portrait)').matches)hint.textContent='当前浏览器无法自动横屏，请关闭手机竖屏锁定后，将手机横过来。';
 }
 button.addEventListener('click',landscape);
 document.addEventListener('click',e=>{if(['continueGame','newAdventure'].includes(e.target.id)&&window.matchMedia('(pointer: coarse)').matches)landscape()});
})();

// Local play stays available after the initial offline cache is ready.
(()=>{
 const badge=document.createElement('div');badge.className='offline-state';badge.setAttribute('role','status');badge.hidden=navigator.onLine;badge.textContent='离线游玩 · 本地自动存档';document.body.append(badge);
 function network(){badge.hidden=navigator.onLine}
 window.addEventListener('online',network);window.addEventListener('offline',network);
 if('serviceWorker' in navigator)navigator.serviceWorker.register('./service-worker.js').then(()=>navigator.serviceWorker.ready).then(()=>{document.documentElement.dataset.offlineReady='true'}).catch(()=>{document.documentElement.dataset.offlineReady='false'});
})();
