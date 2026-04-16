(function(){
  var isOpen=false, loading=false, msgCount=0;
  var messages=[{role:'assistant',content:'Hallo! \uD83D\uDC4B Willkommen bei der Zahnarztpraxis Dr. Weber. Wie kann ich Ihnen helfen?'}];
  var QUESTIONS=['Termin buchen','Zahnreinigung Kosten?','Zahnschmerzen!','War gestern bei euch','Angst vorm Zahnarzt','Ist das echt?'];

  // ═══════════════════════════════════════════
  // SOUND — sanfte Terz (C5 + E5), dezent
  // ═══════════════════════════════════════════
  var audioCtx=null;
  function playSound(){
    try{
      if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended') audioCtx.resume();
      var now=audioCtx.currentTime;
      [523.25,659.25].forEach(function(freq,i){
        var osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
        osc.type='sine'; osc.frequency.value=freq;
        var st=now+i*0.09;
        gain.gain.setValueAtTime(0,st);
        gain.gain.linearRampToValueAtTime(0.12,st+0.02);
        gain.gain.exponentialRampToValueAtTime(0.001,st+0.35);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(st); osc.stop(st+0.4);
      });
    }catch(e){}
  }

  // ═══════════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════════
  var css=document.createElement('style');
  css.textContent=`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Space+Grotesk:wght@500;600;700&display=swap');

#xbot *, #xbot *::before, #xbot *::after {
  margin:0; padding:0; box-sizing:border-box;
  font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif;
  -webkit-tap-highlight-color:transparent;
}

/* ── Launcher (Bubble) ── */
#xbot-fab {
  position:fixed; bottom:24px; right:24px; z-index:99998;
  width:60px; height:60px; border-radius:50%; border:none; cursor:pointer;
  background:linear-gradient(135deg,#45BFA8,#6B63A0);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 12px 32px rgba(69,191,168,0.45), 0 0 0 4px rgba(255,255,255,0.06);
  transition:transform .25s cubic-bezier(0.34,1.56,0.64,1);
}
#xbot-fab:hover { transform:scale(1.08); }
#xbot-fab:active { transform:scale(0.95); }
#xbot-fab svg { width:26px; height:26px; stroke:#fff; fill:none; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round; }
#xbot-fab::before {
  content:''; position:absolute; inset:-4px; border-radius:50%;
  border:2px solid #45BFA8; animation:xbPulse 2s ease-out infinite; opacity:0;
}
@keyframes xbPulse {
  0% { transform:scale(0.95); opacity:0.6; }
  100% { transform:scale(1.4); opacity:0; }
}
#xbot-dot {
  position:fixed; bottom:76px; right:24px; z-index:99999;
  width:20px; height:20px; border-radius:50%;
  background:#FF4D6A; border:2px solid #0B0E17;
  display:flex; align-items:center; justify-content:center;
  font-size:10px; font-weight:700; color:#fff;
}

/* ── Chat Fenster ── */
#xbot-win {
  position:fixed; z-index:99999;
  bottom:24px; right:24px;
  width:400px; height:640px;
  max-height:calc(100vh - 120px);
  max-height:calc(100dvh - 120px);
  border-radius:20px; overflow:hidden;
  display:none; flex-direction:column;
  background:#FFFFFF;
  box-shadow:0 25px 60px rgba(0,0,0,0.4);
  opacity:0; transform:translateY(20px) scale(0.95);
  transition:opacity .28s ease, transform .28s cubic-bezier(0.34,1.56,0.64,1);
}
#xbot-win.open { display:flex; opacity:1; transform:translateY(0) scale(1); }

/* ── Header ── */
.xb-hd {
  padding:18px 22px;
  background:linear-gradient(135deg,#1A1D2E 0%,#2A2F4A 100%);
  border-bottom:1px solid rgba(255,255,255,0.05);
  display:flex; align-items:center; justify-content:space-between;
  flex-shrink:0;
}
.xb-hd-l { display:flex; align-items:center; gap:14px; min-width:0; }
.xb-av {
  width:44px; height:44px; border-radius:50%;
  background:linear-gradient(135deg,#45BFA8,#6B63A0);
  display:flex; align-items:center; justify-content:center;
  font-size:22px; flex-shrink:0;
  box-shadow:0 4px 12px rgba(69,191,168,0.3);
}
.xb-hd-info { min-width:0; }
.xb-hd-l h3 {
  font-family:'Space Grotesk',sans-serif;
  font-size:16px; font-weight:600; color:#fff;
  margin-bottom:2px;
}
.xb-hd-l p { font-size:12px; color:rgba(255,255,255,0.7); display:flex; align-items:center; gap:7px; }
.xb-on {
  width:8px; height:8px; border-radius:50%; background:#45BFA8;
  box-shadow:0 0 0 3px rgba(69,191,168,0.25);
  animation:xbBreathe 2s ease-in-out infinite;
}
@keyframes xbBreathe {
  0%,100% { box-shadow:0 0 0 3px rgba(69,191,168,0.25); }
  50% { box-shadow:0 0 0 6px rgba(69,191,168,0.15); }
}
.xb-x {
  background:rgba(255,255,255,0.05); border:none; color:rgba(255,255,255,0.6);
  cursor:pointer; padding:8px; border-radius:10px; display:flex;
  align-items:center; justify-content:center; transition:all .15s;
}
.xb-x:hover, .xb-x:active { background:rgba(255,255,255,0.12); color:#fff; }
.xb-x svg { width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; }

/* ── Demo Banner ── */
.xb-demo {
  padding:9px 22px; flex-shrink:0;
  background:linear-gradient(90deg,rgba(69,191,168,0.08),rgba(107,99,160,0.08));
  border-bottom:1px solid #E5E7EB;
  text-align:center; font-size:11px; color:#45BFA8;
  font-weight:700; letter-spacing:0.08em;
}
.xb-demo a { color:#45BFA8; text-decoration:none; font-weight:700; }

/* ── Messages ── */
.xb-msgs {
  flex:1; overflow-y:auto; min-height:0;
  padding:24px 20px;
  display:flex; flex-direction:column; gap:12px;
  background:#FFFFFF;
  -webkit-overflow-scrolling:touch;
}
.xb-msgs::-webkit-scrollbar { width:6px; }
.xb-msgs::-webkit-scrollbar-track { background:transparent; }
.xb-msgs::-webkit-scrollbar-thumb { background:#D1D5DB; border-radius:3px; }

.xb-row { display:flex; align-items:flex-start; gap:10px; max-width:85%; animation:xbIn .3s ease-out; }
.xb-row-u { align-self:flex-end; flex-direction:row-reverse; }
.xb-row:not(.xb-row-u) { align-self:flex-start; }
@keyframes xbIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

.xb-ico {
  width:32px; height:32px; border-radius:50%; flex-shrink:0;
  background:#F0F2F5;
  display:flex; align-items:center; justify-content:center;
  font-size:15px;
}
.xb-row-u .xb-ico { display:none; }

.xb-bub {
  padding:12px 16px; border-radius:18px;
  font-size:14.5px; line-height:1.5;
  white-space:pre-wrap; word-wrap:break-word; overflow-wrap:break-word;
}
.xb-bub-b {
  background:#F0F2F5; color:#1A1D2E;
  border-top-left-radius:4px;
}
.xb-bub-u {
  background:linear-gradient(135deg,#45BFA8,#3AA891); color:#fff;
  border-top-right-radius:4px; font-weight:500;
  box-shadow:0 2px 8px rgba(69,191,168,0.25);
}

/* Typing */
.xb-typ {
  display:flex; gap:5px; padding:14px 18px;
  background:#F0F2F5; border-radius:18px 18px 18px 4px;
  align-items:center;
}
.xb-d {
  width:7px; height:7px; border-radius:50%; background:#6B7280; opacity:.3;
  animation:xbB 1.4s ease-in-out infinite;
}
.xb-d:nth-child(2) { animation-delay:.2s; }
.xb-d:nth-child(3) { animation-delay:.4s; }
@keyframes xbB {
  0%,60%,100% { opacity:.3; transform:translateY(0); }
  30% { opacity:1; transform:translateY(-5px); }
}

/* ── Quick Replies ── */
.xb-q {
  padding:12px 20px; display:flex; flex-wrap:wrap; gap:8px; flex-shrink:0;
  border-top:1px solid #E5E7EB; background:#FFFFFF;
}
.xb-qb {
  padding:8px 14px; border-radius:20px;
  background:#fff; border:1.5px solid #45BFA8;
  color:#45BFA8; font-size:13px; font-weight:500;
  cursor:pointer; transition:all .15s; font-family:inherit;
  white-space:nowrap;
}
.xb-qb:hover, .xb-qb:active { background:#45BFA8; color:#fff; transform:translateY(-1px); }
.xb-qb:disabled { opacity:.4; cursor:default; transform:none; }

/* ── Input ── */
.xb-inp {
  padding:14px 20px 16px; flex-shrink:0;
  border-top:1px solid #E5E7EB; background:#FFFFFF;
  display:flex; align-items:center; gap:10px;
}
.xb-inp input {
  flex:1; padding:12px 18px; border-radius:24px;
  border:1.5px solid #E5E7EB;
  background:#F5F7FA; color:#1A1D2E;
  font-size:16px; outline:none; font-family:inherit;
  transition:all .15s; min-width:0;
}
.xb-inp input::placeholder { color:#6B7280; }
.xb-inp input:focus {
  border-color:#45BFA8; background:#fff;
  box-shadow:0 0 0 3px rgba(69,191,168,0.15);
}
.xb-send {
  width:44px; height:44px; border-radius:50%; border:none; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:transform .15s;
}
.xb-send.on { background:linear-gradient(135deg,#45BFA8,#3AA891); box-shadow:0 4px 12px rgba(69,191,168,0.35); }
.xb-send.on:hover { transform:scale(1.05); }
.xb-send.on:active { transform:scale(0.95); }
.xb-send.off { background:#E5E7EB; cursor:default; }
.xb-send svg { width:18px; height:18px; fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }

/* ── Footer ── */
.xb-ft {
  padding:10px 20px; text-align:center; flex-shrink:0;
  font-size:11px; color:#6B7280; line-height:1.5;
  background:#FFFFFF; border-top:1px solid #E5E7EB;
}
.xb-ft .xb-disc { font-size:10px; color:#9CA3AF; margin-bottom:2px; }
.xb-ft a { color:#6B63A0; font-weight:700; text-decoration:none; }

/* ═══════════════════════════════════════════
   MOBILE — Vollbild (wie earlibird.ai)
   ═══════════════════════════════════════════ */
@media (max-width:640px) {
  #xbot-fab {
    bottom:20px; right:20px; width:56px; height:56px;
    bottom:calc(20px + env(safe-area-inset-bottom));
  }
  #xbot-fab svg { width:24px; height:24px; }
  #xbot-dot { bottom:68px; right:20px; width:18px; height:18px; font-size:9px; }

  #xbot-win {
    top:0; left:0; right:0; bottom:0;
    width:100%; height:100vh; height:100dvh;
    max-height:100vh; max-height:100dvh;
    border-radius:0;
    padding-bottom:env(safe-area-inset-bottom);
  }

  .xb-hd {
    padding:16px 20px;
    padding-top:max(16px, env(safe-area-inset-top));
  }
  .xb-av { width:40px; height:40px; font-size:20px; }
  .xb-hd-l { gap:12px; }
  .xb-hd-l h3 { font-size:15px; }
  .xb-hd-l p { font-size:11.5px; }

  .xb-demo { padding:8px 20px; font-size:10px; }

  .xb-msgs { padding:20px 16px; gap:10px; }
  .xb-ico { width:30px; height:30px; font-size:14px; }
  .xb-bub { padding:11px 15px; font-size:14.5px; }

  .xb-q {
    padding:12px 16px; gap:8px;
    overflow-x:auto; flex-wrap:nowrap;
    -webkit-overflow-scrolling:touch;
    scrollbar-width:none;
  }
  .xb-q::-webkit-scrollbar { display:none; }
  .xb-qb { padding:8px 14px; font-size:13px; }

  .xb-inp { padding:12px 16px 14px; gap:10px; }
  .xb-inp input { padding:12px 16px; font-size:16px; border-radius:22px; }
  .xb-send { width:42px; height:42px; }

  .xb-ft { padding:10px 16px; font-size:10.5px; }
}
`;
  document.head.appendChild(css);

  var el=document.createElement('div');
  el.id='xbot';
  document.body.appendChild(el);

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  function render(){
    el.innerHTML='';

    if(!isOpen){
      el.innerHTML='<button id="xbot-fab" aria-label="Chat \u00F6ffnen"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></button><div id="xbot-dot">1</div>';
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

    var sc=loading?'#9CA3AF':'#fff';

    el.innerHTML=
    '<div id="xbot-win" class="open">'
    +'<div class="xb-hd">'
      +'<div class="xb-hd-l">'
        +'<div class="xb-av">\uD83E\uDDB7</div>'
        +'<div class="xb-hd-info">'
          +'<h3>Praxis Dr. Weber</h3>'
          +'<p><span class="xb-on"></span>Online \u00B7 Antwortet sofort</p>'
        +'</div>'
      +'</div>'
      +'<button class="xb-x" id="xb-cls" aria-label="Chat schlie\u00DFen"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
    +'</div>'
    +'<div class="xb-demo">\u26A0 DEMO \u2014 FIKTIVE PRAXIS \u00B7 <a href="https://www.xynoia.de" target="_blank">XYNOIA.DE</a></div>'
    +'<div class="xb-msgs" id="xb-ms">'+mh+'<div id="xb-end"></div></div>'
    +qh
    +'<div class="xb-inp">'
      +'<input id="xb-in" placeholder="Ihre Nachricht..." '+(loading?'disabled':'')+' autocomplete="off" autocapitalize="sentences">'
      +'<button class="xb-send '+(loading?'off':'on')+'" id="xb-snd" aria-label="Senden">'
        +'<svg viewBox="0 0 24 24" stroke="'+sc+'"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="'+sc+'"/></svg>'
      +'</button>'
    +'</div>'
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
    var endEl=document.getElementById('xb-end');
    if(endEl) endEl.scrollIntoView({behavior:'smooth'});

    // Focus nur auf Desktop — verhindert Keyboard-Popup auf Mobile
    if(!loading && window.innerWidth > 640) inp.focus();
  }

  // ═══════════════════════════════════════════
  // SEND — Kompatibel zu /api/chat (erwartet {messages})
  // ═══════════════════════════════════════════
  function send(t){
    if(!t||!t.trim()||loading)return;
    t=t.trim();
    messages.push({role:'user',content:t});
    msgCount++; loading=true; render();

    var body=JSON.stringify({
      messages:messages.map(function(m){return{role:m.role,content:m.content}})
    });

    fetch('/api/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:body
    })
    .then(function(r){return r.json()})
    .then(function(d){
      var txt=(d.content&&d.content[0]&&d.content[0].text)||'Entschuldigung, da ist etwas schiefgelaufen.';
      messages.push({role:'assistant',content:txt});
      loading=false; render();
    })
    .catch(function(){
      messages.push({role:'assistant',content:'Verbindung unterbrochen. Bitte versuchen Sie es erneut.'});
      loading=false; render();
    });
  }

  function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/\n/g,'<br>')}
  function escA(s){return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

  // ESC schließt den Chat auf Desktop
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape' && isOpen){ isOpen=false; render(); }
  });

  render();
})();
