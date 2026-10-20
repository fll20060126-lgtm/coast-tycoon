/* 首页氛围：程序化水声 + 背景音乐（Web Audio，无音频文件）+ 飘雪粒子 */
(function(){
'use strict';
var KEY='coast-home-audio';
var enabled=localStorage.getItem(KEY)!=='off';
var ctx=null,master=null,musicTimer=null,bellTimer=null,running=false,inited=false;
function makeNoise(){var len=ctx.sampleRate*2|0;var buf=ctx.createBuffer(1,len,ctx.sampleRate);var d=buf.getChannelData(0);var last=0;for(var i=0;i<len;i++){var w=Math.random()*2-1;last=(last+0.02*w)/1.02;d[i]=last*3.2;}return buf;}
function startWater(){
 var src=ctx.createBufferSource();src.buffer=makeNoise();src.loop=true;
 var lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=420;lp.Q.value=.6;
 var g=ctx.createGain();g.gain.value=.16;
 var lfo=ctx.createOscillator();lfo.frequency.value=.11;var lg=ctx.createGain();lg.gain.value=.05;
 lfo.connect(lg);lg.connect(g.gain);src.connect(lp);lp.connect(g);g.connect(master);src.start();lfo.start();
 var src2=ctx.createBufferSource();src2.buffer=makeNoise();src2.loop=true;
 var bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1600;bp.Q.value=.5;
 var g2=ctx.createGain();g2.gain.value=.014;
 var lfo2=ctx.createOscillator();lfo2.frequency.value=.07;var lg2=ctx.createGain();lg2.gain.value=.011;
 lfo2.connect(lg2);lg2.connect(g2.gain);src2.connect(bp);bp.connect(g2);g2.connect(master);src2.start();lfo2.start();
}
/* 低音区和弦垫：Am → F → G → Em，缓慢呼吸 */
var CHORDS=[[110,164.81,220,261.63],[87.31,130.81,174.61,220],[98,146.83,196,246.94],[82.41,123.47,164.81,196]];
var ci=0;
function playChord(){var t=ctx.currentTime,notes=CHORDS[ci%CHORDS.length];ci++;
 notes.forEach(function(f,i){var o=ctx.createOscillator();o.type=i===0?'sine':'triangle';o.frequency.value=f;
  var g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+2.4);
  g.gain.setValueAtTime(.05,t+5.4);g.gain.linearRampToValueAtTime(0,t+8.4);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+8.6);});}
/* 五声音阶风铃，偶尔点缀 */
function playBell(){var t=ctx.currentTime,sc=[440,493.88,554.37,659.25,739.99,880],f=sc[Math.random()*sc.length|0];
 var o=ctx.createOscillator();o.type='sine';o.frequency.value=f;
 var g=ctx.createGain();g.gain.setValueAtTime(.045,t);g.gain.exponentialRampToValueAtTime(.0001,t+2.2);
 o.connect(g);g.connect(master);o.start(t);o.stop(t+2.3);}
function beginLoops(){playChord();musicTimer=setInterval(playChord,8000);bellTimer=setInterval(function(){if(Math.random()<.75)playBell()},3600);}
function init(){if(inited)return;inited=true;var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
 ctx=new AC();master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);startWater();beginLoops();}
function setRunning(on){if(!ctx||on===running)return;running=on;var t=ctx.currentTime;
 master.gain.cancelScheduledValues(t);master.gain.setValueAtTime(master.gain.value,t);
 master.gain.linearRampToValueAtTime(on?.9:0,t+1.2);if(ctx.state==='suspended')ctx.resume();}
function gameShown(){var g=document.getElementById('gameScreen');return !!g&&!g.hidden;}
function refresh(){setRunning(enabled&&!document.hidden&&!gameShown());}
function updateChip(){var b=document.getElementById('homeSound');if(b){b.textContent=enabled?'🔊 水声·音乐 开':'🔇 水声·音乐 关';b.setAttribute('aria-pressed',enabled);}}
document.addEventListener('pointerdown',function(){init();refresh();},true);
document.addEventListener('visibilitychange',refresh);
var gs=document.getElementById('gameScreen');
if(gs)new MutationObserver(refresh).observe(gs,{attributes:true,attributeFilter:['hidden']});
var chip=document.getElementById('homeSound');
if(chip)chip.addEventListener('click',function(){enabled=!enabled;localStorage.setItem(KEY,enabled?'on':'off');init();updateChip();refresh();});
window.coastAmbience={state:function(){return{enabled:enabled,running:running,ctx:!!ctx,ctxState:ctx?ctx.state:'none'}},toggle:function(){if(chip)chip.click();}};
/* 飘雪粒子 */
(function(){var layer=document.querySelector('.aurora-layer');if(!layer)return;
 for(var i=0;i<34;i++){var s=document.createElement('i');s.className='snowflake';s.textContent='❄';
  s.style.left=(Math.random()*100)+'vw';s.style.fontSize=(6+Math.random()*10).toFixed(1)+'px';
  s.style.opacity=(.35+Math.random()*.5).toFixed(2);
  s.style.animationDuration=(9+Math.random()*14).toFixed(1)+'s';
  s.style.animationDelay=(-Math.random()*20).toFixed(1)+'s';
  s.style.setProperty('--dx',(Math.random()*14-7).toFixed(1)+'vw');
  layer.appendChild(s);}})();
updateChip();
})();
