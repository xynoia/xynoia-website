(function(){
  var isOpen=false, loading=false, msgCount=0;
  var messages=[{role:'assistant',content:'Hallo! \uD83D\uDC4B Willkommen bei der Zahnarztpraxis Dr. Weber. Wie kann ich Ihnen helfen?'}];
  var QUESTIONS=['Termin buchen','Zahnreinigung Kosten?','Zahnschmerzen!','War gestern bei euch','Angst vorm Zahnarzt','Ist das echt?'];

  function playSound(){
    try{
      var a=new(window.AudioContext||window.webkitAudioContext)();
      var o=a.createOscillator(),g=a.createGain();
      o.connect(g);g.connect(a.destination);
      o.type='sine';o.frequency.setValueAtTime(830,a.currentTime);
      o.frequency.setValueAtTime(1100,a.currentTime+0.08);
      g.gain.setValueAtTime(0.15,a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.3);
      o.start(a.currentTime);o.stop(a.currentTime+0.3);
    }catch(e){}
  }

  var css=document.createElement('style');
  css.textContent=`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

#xbot *, #xbot *::before, #xbot *::after {
  margin:0; padding:0; box-sizing:border-box;
  font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif;
  -webkit-tap-highlight-color:transparent;
}

/* ── Bubble ── */
#xbot-fab {
  position:fixed; bottom:24px; right:24px; z-index:99998;
  width:60px; height:60px; border-radius:50%; border:none; cursor:pointer;
  background:linear-gradient(135deg,#45BFA8,#38A693);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 4px 16px rgba(69,191,168,0.4);
  transition:transform .2s;
}
#xbot-fab:hover { transform:scale(1.08); }
#xbot-fab svg { width:24px; height:24px; stroke:#fff; fill:none; stroke-width:2; }
#xbot-dot {
  position:fixed; bottom:76px; right:24px; z-index:99999;
  width:18px; height:18px; border-radius:50%;
  background:#FF4D6A; border:2px solid #0B0E17;
  display:flex; align-items:center; justify-content:center;
  font-size:9px; font-weight:700; color:#fff;
}

/* ── Window ── */
#xbot-win {
  position:fixed; z-index:99999;
  bottom:24px; right:24px;
  width:420px; height:600px;
  border-radius:24px; overflow:hidden;
  display:none; flex-direction:column;
  background:#0d1017;
  border:1px solid rgba(255,255,255,0.06);
  box-shadow:0 20px 60px rgba(0,0,0,0.45);
}
#xbot-win.open { display:flex; }

/* ── Header ── */
.xb-hd {
  padding:22px 28px;
  background:linear-gradient(180deg,rgba(69,191,168,0.05),transparent);
  border-bottom:1px solid rgba(255,255,255,0.05);
  display:flex; align-items:center; justify-content:space-between;
  flex-shrink:0;
}
.xb-hd-l { display:flex; align-items:center; gap:16px; }
.xb-av {
  width:44px; height:44px; border-radius:50%;
  background:linear-gradient(135deg,#45BFA8,#38A693);
  display:flex; align-items:center; justify-content:center;
  font-size:21px; flex-shrink:0;
}
.xb-hd-l h3 { font-size:16px; font-weight:700; color:#e8ebf2; }
.xb-hd-l p { font-size:12.5px; color:#6b7194; margin-top:2px; display:flex; align-items:center; gap:7px; }
.xb-on { width:7px; height:7px; border-radius:50%; background:#45BFA8; box-shadow:0 0 6px rgba(69,191,168,.6); }
.xb-x {
  background:rgba(255,255,255,0.04); border:none; color:#6b7194;
  cursor:pointer; font-size:18px; padding:10px 12px;
  border-radius:12px; transition:all .2s; line-height:1;
}
.xb-x:hover { color:#e8ebf2; background:rgba(255,255,255,0.08); }

/* ── Demo bar ── */
.xb-demo {
  padding:8px 28px; flex-shrink:0;
  background:rgba(255,77,106,0.05);
  border-bottom:1px solid rgba(255,77,106,0.05);
  text-align:center; font-size:10px; color:#ff6b81;
  font-weight:600; letter-spacing:1px;
}
.xb-demo a { color:#45BFA8; text-decoration:none; font-weight:700; }

/* ── Messages ── */
.xb-msgs {
  flex:1; overflow-y:auto; min-height:0;
  padding:28px 28px 16px;
  display:flex; flex-direction:column; gap:20px;
}
.xb-msgs::-webkit-scrollbar { width:2px; }
.xb-msgs::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.06); border-radius:2px; }

.xb-row { display:flex; align-items:flex-start; gap:14px; animation:xbIn .3s ease-out; }
.xb-row-u { justify-content:flex-end; }
@keyframes xbIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

.xb-ico {
  width:34px; height:34px; border-radius:50%; flex-shrink:0;
  background:rgba(69,191,168,0.08);
  display:flex; align-items:center; justify-content:center;
  font-size:17px; margin-top:2px;
}
.xb-bub {
  max-width:70%; padding:16px 20px;
  font-size:14.5px; line-height:1.7; white-space:pre-wrap; word-wrap:break-word;
}
.xb-bub-b {
  background:rgba(255,255,255,0.045); color:#cdd2e4;
  border-radius:4px 20px 20px 20px;
}
.xb-bub-u {
  background:linear-gradient(135deg,#45BFA8,#38A693); color:#081210;
  border-radius:20px 20px 4px 20px; font-weight:500;
}

/* Typing */
.xb-typ {
  display:flex; gap:5px; padding:16px 20px;
  background:rgba(255,255,255,0.045); border-radius:4px 20px 20px 20px;
}
.xb-d {
  width:6px; height:6px; border-radius:50%; background:#45BFA8; opacity:.5;
  animation:xbB 1.2s ease-in-out infinite;
}
.xb-d:nth-child(2){animation-delay:.15s}
.xb-d:nth-child(3){animation-delay:.3s}
@keyframes xbB { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }

/* ── Quick buttons ── */
.xb-q { padding:8px 28px 12px; display:flex; flex-wrap:wrap; gap:8px; flex-shrink:0; }
.xb-qb {
  padding:9px 16px; border-radius:22px;
  background:transparent; border:1px solid rgba(69,191,168,0.14);
  color:#45BFA8; font-size:13px; font-weight:500;
  cursor:pointer; transition:all .2s; font-family:inherit;
}
.xb-qb:hover { background:rgba(69,191,168,0.08); border-color:rgba(69,191,168,0.3); }
.xb-qb:disabled { opacity:.3; cursor:default; }

/* ── Input ── */
.xb-inp {
  padding:16px 28px 14px; flex-shrink:0;
  border-top:1px solid rgba(255,255,255,0.04);
  display:flex; align-items:center; gap:14px;
}
.xb-inp input {
  flex:1; padding:14px 20px; border-radius:24px;
  border:1px solid rgba(255,255,255,0.06);
  background:rgba(255,255,255,0.03);
  color:#e8ebf2; font-size:14.5px; outline:none;
  font-family:inherit; transition:border-color .2s;
}
.xb-inp input::placeholder { color:#3d4260; }
.xb-inp input:focus { border-color:rgba(69,191,168,0.2); }
.xb-send {
  width:46px; height:46px; border-radius:50%; border:none; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:all .15s;
}
.xb-send.on { background:linear-gradient(135deg,#45BFA8,#38A693); box-shadow:0 2px 10px rgba(69,191,168,0.25); }
.xb-send.off { background:rgba(255,255,255,0.03); cursor:default; }
.xb-send svg { width:18px; height:18px; fill:none; stroke-width:2.5; }

/* ── Footer ── */
.xb-ft {
  padding:6px 28px 16px; text-align:center; flex-shrink:0;
  font-size:10.5px; color:#2d3250; line-height:1.6;
}
.xb-ft .xb-disc { font-size:9.5px; color:#3d4260; margin-bottom:3px; }
.xb-ft a { color:#45BFA8; font-weight:700; text-decoration:none; }

/* ═══ MOBILE ═══ */
@media (max-width:500px) {
  #xbot-fab { bottom:20px; right:20px; width:54px; height:54px; }
  #xbot-fab svg { width:22px; height:22px; }
  #xbot-dot { bottom:68px; right:20px; width:16px; height:16px; font-size:8px; }

  #xbot-win {
    top:10px; left:10px; right:10px; bottom:10px;
    width:auto; height:auto;
    border-radius:20px;
    border:1px solid rgba(255,255,255,0.08);
  }

  .xb-hd { padding:18px 22px; }
  .xb-av { width:38px; height:38px; font-size:18px; }
  .xb-hd-l { gap:12px; }
  .xb-hd-l h3 { font-size:14.5px; }
  .xb-hd-l p { font-size:11.5px; }
  .xb-x { font-size:18px; padding:10px 12px; }

  .xb-demo { padding:6px 22px; font-size:9px; }

  .xb-msgs { padding:20px 22px 12px; gap:16px; }
  .xb-ico { width:30px; height:30px; font-size:15px; }
  .xb-bub { max-width:76%; padding:13px 16px; font-size:14px; }

  .xb-q { padding:6px 22px 10px; gap:6px; }
  .xb-qb { padding:8px 13px; font-size:12px; }

  .xb-inp { padding:12px 22px 10px; gap:10px; }
  .xb-inp input { padding:12px 16px; font-size:16px; border-radius:20px; }
  .xb-send { width:42px; height:42px; }

  .xb-ft { padding:4px 22px 12px; font-size:9.5px; }
  .xb-ft .xb-disc { font-size:8.5px; }
}
`;
  document.head.appendChild(css);

  var el=document.createElement('div');
  el.id='xbot';
  document.body.appendChild(el);

  function render(){
    el.innerHTML='';

    if(!isOpen){
      el.innerHTML='<button id="xbot-fab"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></button><div id="xbot-dot">1</div>';
      document.getElementById('xbot-fab').onclick=function(){isOpen=true;playSound();render()};
      return;
    }

    var mh='';
    for(var i=0;i<messages.length;i++){
      var m=messages[i];
      if(m.role==='assistant'){
        mh+='<div class="xb-row"><div class="xb-ico">\uD83E\uDDB7</div><div class="xb-bub xb-bub-b">'+esc(m.content)+'</div></div>';
      }else{
        mh+='<div class="xb-row xb-row-u"><div class="xb-bub xb-bub-u">'+esc(m.content)+'</div></div>';
      }
    }

    if(loading){
      mh+='<div class="xb-row"><div class="xb-ico">\uD83E\uDDB7</div><div class="xb-typ"><div class="xb-d"></div><div class="xb-d"></div><div class="xb-d"></div></div></div>';
    }

    var qh='';
    if(msgCount<2){
      qh='<div class="xb-q">';
      for(var j=0;j<QUESTIONS.length;j++){
        qh+='<button class="xb-qb" '+(loading?'disabled':'')+' data-q="'+escA(QUESTIONS[j])+'">'+esc(QUESTIONS[j])+'</button>';
      }
      qh+='</div>';
    }

    var sc=loading?'#3d4260':'#081210';

    el.innerHTML=
    '<div id="xbot-win" class="open">'
    +'<div class="xb-hd"><div class="xb-hd-l"><div class="xb-av">\uD83E\uDDB7</div><div><h3>Praxis Dr. Weber</h3><p><span class="xb-on"></span>Online \u00B7 Antwortet sofort</p></div></div><button class="xb-x" id="xb-cls">\u2715</button></div>'
    +'<div class="xb-demo">\u26A0 DEMO \u2014 FIKTIVE PRAXIS \u00B7 <a href="https://www.xynoia.de" target="_blank">XYNOIA.DE</a></div>'
    +'<div class="xb-msgs" id="xb-ms">'+mh+'<div id="xb-end"></div></div>'
    +qh
    +'<div class="xb-inp"><input id="xb-in" placeholder="Ihre Nachricht..." '+(loading?'disabled':'')+' autocomplete="off"><button class="xb-send '+(loading?'off':'on')+'" id="xb-snd"><svg viewBox="0 0 24 24" stroke="'+sc+'"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button></div>'
    +'<div class="xb-ft"><div class="xb-disc">Demo von XYNOIA. Praxis Dr. Weber ist fiktiv.</div>Powered by <a href="https://www.xynoia.de" target="_blank">XYNOIA</a></div>'
    +'</div>';

    document.getElementById('xb-cls').onclick=function(){isOpen=false;render()};
    var inp=document.getElementById('xb-in');
    inp.onkeydown=function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(inp.value)}};
    document.getElementById('xb-snd').onclick=function(){send(inp.value)};
    var btns=document.querySelectorAll('.xb-qb');
    for(var k=0;k<btns.length;k++){
      (function(b){b.onclick=function(){send(b.getAttribute('data-q'))}})(btns[k]);
    }
    document.getElementById('xb-end').scrollIntoView({behavior:'smooth'});
    if(!loading) inp.focus();
  }

  function send(t){
    if(!t||!t.trim()||loading)return;
    t=t.trim();
    messages.push({role:'user',content:t});
    msgCount++;loading=true;render();

    var body=JSON.stringify({messages:messages.map(function(m){return{role:m.role,content:m.content}})});
    fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:body})
    .then(function(r){return r.json()})
    .then(function(d){
      var txt=(d.content&&d.content[0]&&d.content[0].text)||'Entschuldigung, da ist etwas schiefgelaufen.';
      messages.push({role:'assistant',content:txt});
      loading=false;render();
    })
    .catch(function(){
      messages.push({role:'assistant',content:'Verbindung unterbrochen. Bitte versuchen Sie es erneut.'});
      loading=false;render();
    });
  }

  function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/\n/g,'<br>')}
  function escA(s){return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

  render();
})();
