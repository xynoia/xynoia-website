(function(){
  'use strict';

  var isOpen=false, loading=false, msgCount=0;
  var messages=[{role:'assistant',content:'Hallo! \uD83D\uDC4B Willkommen bei der Zahnarztpraxis Dr. Weber. Wie kann ich Ihnen helfen?'}];
  var QUESTIONS=['Termin buchen','Zahnreinigung Kosten?','Zahnschmerzen!','War gestern bei euch','Angst vorm Zahnarzt','Ist das echt?'];

  // ═══════════════════════════════════════════════════════
  // VIEWPORT-HEIGHT-FIX (löst iOS Safari 100vh Bug +
  // Keyboard-Problem via VisualViewport API)
  // ═══════════════════════════════════════════════════════
  var root=document.documentElement;
  function updateVH(){
    var h;
    if(window.visualViewport){
      h=window.visualViewport.height;
    } else {
      h=window.innerHeight;
    }
    root.style.setProperty('--xbot-vh', h + 'px');
  }
  updateVH();
  window.addEventListener('resize', updateVH);
  window.addEventListener('orientationchange', function(){ setTimeout(updateVH, 100); });
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize', updateVH);
    window.visualViewport.addEventListener('scroll', updateVH);
  }

  // ═══════════════════════════════════════════════════════
  // SOUND — sanfte Terz (C5 + E5)
  // ═══════════════════════════════════════════════════════
  var audioCtx=null;
  function playSound(){
    try{
      if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended') audioCtx.resume();
      var now=audioCtx.currentTime;
      [523.25, 659.25].forEach(function(freq, i){
        var osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
        osc.type='sine'; osc.frequency.value=freq;
        var st=now + i*0.09;
        gain.gain.setValueAtTime(0, st);
        gain.gain.linearRampToValueAtTime(0.12, st + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.35);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(st); osc.stop(st + 0.4);
      });
    }catch(e){}
  }

  // ═══════════════════════════════════════════════════════
  // STYLES — hohe Spezifität, überschreibt index.html
  // ═══════════════════════════════════════════════════════
  var css=document.createElement('style');
  css.id='xbot-styles';
  css.textContent = `
/* Reset nur für Chatbot-Scope — nichts leckt nach außen */
#xbot, #xbot *, #xbot *::before, #xbot *::after {
  margin:0 !important; padding:0 !important; box-sizing:border-box !important;
  font-family:'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
  -webkit-tap-highlight-color:transparent !important;
  line-height:normal;
}

/* ═══ LAUNCHER (Bubble Button) ═══ */
#xbot #xbot-fab {
  position:fixed !important;
  bottom:24px !important; right:24px !important;
  z-index:2147483646 !important;
  width:60px !important; height:60px !important;
  border-radius:50% !important; border:none !important; cursor:pointer !important;
  background:linear-gradient(135deg, #45BFA8, #6B63A0) !important;
  display:flex !important; align-items:center !important; justify-content:center !important;
  box-shadow:0 12px 32px rgba(69,191,168,0.45), 0 0 0 4px rgba(255,255,255,0.06) !important;
  transition:transform .25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  padding:0 !important;
}
#xbot #xbot-fab:hover { transform:scale(1.08) !important; }
#xbot #xbot-fab:active { transform:scale(0.95) !important; }
#xbot #xbot-fab svg {
  width:26px !important; height:26px !important;
  stroke:#fff !important; fill:none !important;
  stroke-width:2.5 !important; stroke-linecap:round !important; stroke-linejoin:round !important;
}
#xbot #xbot-fab::before {
  content:'' !important; position:absolute !important; inset:-4px !important;
  border-radius:50% !important;
  border:2px solid #45BFA8 !important;
  animation:xbPulse 2s ease-out infinite !important; opacity:0 !important;
}
@keyframes xbPulse {
  0% { transform:scale(0.95); opacity:0.6; }
  100% { transform:scale(1.4); opacity:0; }
}
#xbot #xbot-dot {
  position:fixed !important;
  bottom:76px !important; right:24px !important;
  z-index:2147483647 !important;
  width:20px !important; height:20px !important;
  border-radius:50% !important;
  background:#FF4D6A !important; border:2px solid #0B0E17 !important;
  display:flex !important; align-items:center !important; justify-content:center !important;
  font-size:10px !important; font-weight:700 !important; color:#fff !important;
  pointer-events:none !important;
}

/* ═══ CHAT FENSTER ═══ */
#xbot #xbot-win {
  position:fixed !important;
  z-index:2147483647 !important;
  bottom:24px !important; right:24px !important;
  width:400px !important;
  height:640px !important;
  max-height:calc(100vh - 120px) !important;
  max-height:calc(var(--xbot-vh, 100vh) - 120px) !important;
  border-radius:20px !important;
  overflow:hidden !important;
  display:none;
  flex-direction:column !important;
  background:#FFFFFF !important;
  box-shadow:0 25px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) !important;
  opacity:0;
  transform:translateY(20px) scale(0.95);
  transition:opacity .28s ease, transform .28s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  color:#1A1D2E !important;
}
#xbot #xbot-win.open {
  display:flex !important;
  opacity:1;
  transform:translateY(0) scale(1);
}

/* ═══ HEADER ═══ */
#xbot .xb-hd {
  padding:18px 22px !important;
  background:linear-gradient(135deg, #1A1D2E 0%, #2A2F4A 100%) !important;
  border-bottom:1px solid rgba(255,255,255,0.05) !important;
  display:flex !important; align-items:center !important; justify-content:space-between !important;
  flex-shrink:0 !important;
}
#xbot .xb-hd-l { display:flex !important; align-items:center !important; gap:14px !important; min-width:0 !important; flex:1 !important; }
#xbot .xb-av {
  width:44px !important; height:44px !important; border-radius:50% !important;
  background:linear-gradient(135deg, #45BFA8, #6B63A0) !important;
  display:flex !important; align-items:center !important; justify-content:center !important;
  font-size:22px !important; flex-shrink:0 !important;
  box-shadow:0 4px 12px rgba(69,191,168,0.3) !important;
}
#xbot .xb-hd-info { min-width:0 !important; flex:1 !important; }
#xbot .xb-hd-info h3 {
  font-family:'Space Grotesk', sans-serif !important;
  font-size:16px !important; font-weight:600 !important; color:#fff !important;
  margin:0 0 2px 0 !important;
  line-height:1.25 !important;
}
#xbot .xb-hd-info p {
  font-size:12px !important; color:rgba(255,255,255,0.7) !important;
  margin:0 !important; line-height:1.3 !important;
  display:flex !important; align-items:center !important; gap:7px !important;
}
#xbot .xb-on {
  width:8px !important; height:8px !important; border-radius:50% !important;
  background:#45BFA8 !important;
  box-shadow:0 0 0 3px rgba(69,191,168,0.25) !important;
  animation:xbBreathe 2s ease-in-out infinite !important;
  flex-shrink:0 !important;
}
@keyframes xbBreathe {
  0%, 100% { box-shadow:0 0 0 3px rgba(69,191,168,0.25); }
  50% { box-shadow:0 0 0 6px rgba(69,191,168,0.15); }
}
#xbot .xb-x {
  background:rgba(255,255,255,0.05) !important; border:none !important;
  color:rgba(255,255,255,0.6) !important;
  cursor:pointer !important;
  padding:8px !important;
  border-radius:10px !important;
  display:flex !important; align-items:center !important; justify-content:center !important;
  transition:all .15s !important;
  flex-shrink:0 !important;
}
#xbot .xb-x:hover, #xbot .xb-x:active {
  background:rgba(255,255,255,0.12) !important;
  color:#fff !important;
}
#xbot .xb-x svg {
  width:18px !important; height:18px !important;
  fill:none !important; stroke:currentColor !important;
  stroke-width:2 !important; stroke-linecap:round !important;
  display:block !important;
}

/* ═══ DEMO BANNER ═══ */
#xbot .xb-demo {
  padding:9px 22px !important; flex-shrink:0 !important;
  background:linear-gradient(90deg, rgba(69,191,168,0.08), rgba(107,99,160,0.08)) !important;
  border-bottom:1px solid #E5E7EB !important;
  text-align:center !important;
  font-size:11px !important; color:#45BFA8 !important;
  font-weight:700 !important; letter-spacing:0.08em !important;
  line-height:1.4 !important;
}
#xbot .xb-demo a { color:#45BFA8 !important; text-decoration:none !important; font-weight:700 !important; }

/* ═══ MESSAGES ═══ */
#xbot .xb-msgs {
  flex:1 1 auto !important;
  overflow-y:auto !important;
  overflow-x:hidden !important;
  min-height:0 !important;
  padding:24px 20px !important;
  display:flex !important;
  flex-direction:column !important;
  gap:12px !important;
  background:#FFFFFF !important;
  -webkit-overflow-scrolling:touch !important;
}
#xbot .xb-msgs::-webkit-scrollbar { width:6px !important; }
#xbot .xb-msgs::-webkit-scrollbar-track { background:transparent !important; }
#xbot .xb-msgs::-webkit-scrollbar-thumb { background:#D1D5DB !important; border-radius:3px !important; }

#xbot .xb-row {
  display:flex !important;
  align-items:flex-start !important;
  gap:10px !important;
  max-width:85% !important;
  animation:xbIn .3s ease-out !important;
}
#xbot .xb-row-u {
  align-self:flex-end !important;
  flex-direction:row-reverse !important;
}
#xbot .xb-row:not(.xb-row-u) { align-self:flex-start !important; }
@keyframes xbIn {
  from { opacity:0; transform:translateY(8px); }
  to { opacity:1; transform:translateY(0); }
}

#xbot .xb-ico {
  width:32px !important; height:32px !important; border-radius:50% !important;
  flex-shrink:0 !important;
  background:#F0F2F5 !important;
  display:flex !important; align-items:center !important; justify-content:center !important;
  font-size:15px !important;
}
#xbot .xb-row-u .xb-ico { display:none !important; }

#xbot .xb-bub {
  padding:12px 16px !important;
  border-radius:18px !important;
  font-size:14.5px !important; line-height:1.5 !important;
  white-space:pre-wrap !important;
  word-wrap:break-word !important;
  overflow-wrap:break-word !important;
}
#xbot .xb-bub-b {
  background:#F0F2F5 !important; color:#1A1D2E !important;
  border-top-left-radius:4px !important;
}
#xbot .xb-bub-u {
  background:linear-gradient(135deg, #45BFA8, #3AA891) !important;
  color:#fff !important;
  border-top-right-radius:4px !important;
  font-weight:500 !important;
  box-shadow:0 2px 8px rgba(69,191,168,0.25) !important;
}

/* Typing */
#xbot .xb-typ {
  display:flex !important; gap:5px !important;
  padding:14px 18px !important;
  background:#F0F2F5 !important;
  border-radius:18px 18px 18px 4px !important;
  align-items:center !important;
}
#xbot .xb-d {
  width:7px !important; height:7px !important; border-radius:50% !important;
  background:#6B7280 !important; opacity:0.3;
  animation:xbB 1.4s ease-in-out infinite !important;
}
#xbot .xb-d:nth-child(2) { animation-delay:.2s !important; }
#xbot .xb-d:nth-child(3) { animation-delay:.4s !important; }
@keyframes xbB {
  0%, 60%, 100% { opacity:0.3; transform:translateY(0); }
  30% { opacity:1; transform:translateY(-5px); }
}

/* ═══ QUICK REPLIES ═══ */
#xbot .xb-q {
  padding:12px 20px !important;
  display:flex !important;
  flex-wrap:wrap !important;
  gap:8px !important;
  flex-shrink:0 !important;
  border-top:1px solid #E5E7EB !important;
  background:#FFFFFF !important;
}
#xbot .xb-qb {
  padding:8px 14px !important;
  border-radius:20px !important;
  background:#fff !important;
  border:1.5px solid #45BFA8 !important;
  color:#45BFA8 !important;
  font-size:13px !important; font-weight:500 !important;
  cursor:pointer !important;
  transition:all .15s !important;
  white-space:nowrap !important;
  line-height:1.4 !important;
}
#xbot .xb-qb:hover, #xbot .xb-qb:active {
  background:#45BFA8 !important; color:#fff !important;
  transform:translateY(-1px);
}
#xbot .xb-qb:disabled { opacity:0.4 !important; cursor:default !important; transform:none !important; }

/* ═══ INPUT ═══ */
#xbot .xb-inp {
  padding:14px 20px 16px !important;
  flex-shrink:0 !important;
  border-top:1px solid #E5E7EB !important;
  background:#FFFFFF !important;
  display:flex !important; align-items:center !important; gap:10px !important;
}
#xbot .xb-inp input {
  flex:1 1 auto !important;
  padding:12px 18px !important;
  border-radius:24px !important;
  border:1.5px solid #E5E7EB !important;
  background:#F5F7FA !important;
  color:#1A1D2E !important;
  font-size:16px !important;
  outline:none !important;
  transition:all .15s !important;
  min-width:0 !important;
  width:auto !important;
  height:auto !important;
}
#xbot .xb-inp input::placeholder { color:#6B7280 !important; }
#xbot .xb-inp input:focus {
  border-color:#45BFA8 !important;
  background:#fff !important;
  box-shadow:0 0 0 3px rgba(69,191,168,0.15) !important;
}
#xbot .xb-send {
  width:44px !important; height:44px !important;
  border-radius:50% !important; border:none !important;
  flex-shrink:0 !important;
  display:flex !important; align-items:center !important; justify-content:center !important;
  cursor:pointer !important;
  transition:transform .15s !important;
  padding:0 !important;
}
#xbot .xb-send.on {
  background:linear-gradient(135deg, #45BFA8, #3AA891) !important;
  box-shadow:0 4px 12px rgba(69,191,168,0.35) !important;
}
#xbot .xb-send.on:hover { transform:scale(1.05); }
#xbot .xb-send.on:active { transform:scale(0.95); }
#xbot .xb-send.off { background:#E5E7EB !important; cursor:default !important; }
#xbot .xb-send svg {
  width:18px !important; height:18px !important;
  fill:none !important;
  stroke-width:2 !important; stroke-linecap:round !important; stroke-linejoin:round !important;
  display:block !important;
}

/* ═══ FOOTER ═══ */
#xbot .xb-ft {
  padding:10px 20px !important;
  text-align:center !important;
  flex-shrink:0 !important;
  font-size:11px !important; color:#6B7280 !important;
  line-height:1.5 !important;
  background:#FFFFFF !important;
  border-top:1px solid #E5E7EB !important;
}
#xbot .xb-ft .xb-disc { font-size:10px !important; color:#9CA3AF !important; margin-bottom:2px !important; }
#xbot .xb-ft a { color:#6B63A0 !important; font-weight:700 !important; text-decoration:none !important; }

/* ═══════════════════════════════════════════
   MOBILE — Vollbild mit VisualViewport Fix
   ═══════════════════════════════════════════ */
@media (max-width:640px) {
  #xbot #xbot-fab {
    bottom:20px !important; right:20px !important;
    width:56px !important; height:56px !important;
  }
  #xbot #xbot-fab svg { width:24px !important; height:24px !important; }
  #xbot #xbot-dot { bottom:68px !important; right:20px !important; width:18px !important; height:18px !important; font-size:9px !important; }

  #xbot #xbot-win {
    /* Echtes Vollbild, dynamisch an VisualViewport gekoppelt */
    top:0 !important;
    left:0 !important;
    right:0 !important;
    bottom:auto !important;
    width:100vw !important;
    height:var(--xbot-vh, 100vh) !important;
    max-height:var(--xbot-vh, 100vh) !important;
    border-radius:0 !important;
    box-shadow:none !important;
  }

  #xbot .xb-hd {
    padding:14px 18px !important;
    padding-top:max(14px, env(safe-area-inset-top)) !important;
  }
  #xbot .xb-av { width:40px !important; height:40px !important; font-size:20px !important; }
  #xbot .xb-hd-l { gap:12px !important; }
  #xbot .xb-hd-info h3 { font-size:15px !important; }
  #xbot .xb-hd-info p { font-size:11.5px !important; }

  #xbot .xb-demo { padding:8px 18px !important; font-size:10px !important; }

  #xbot .xb-msgs { padding:18px 16px !important; gap:10px !important; }
  #xbot .xb-ico { width:30px !important; height:30px !important; font-size:14px !important; }
  #xbot .xb-bub { padding:11px 15px !important; font-size:14.5px !important; }

  #xbot .xb-q {
    padding:10px 16px !important;
    gap:8px !important;
    overflow-x:auto !important;
    flex-wrap:nowrap !important;
    -webkit-overflow-scrolling:touch !important;
    scrollbar-width:none !important;
  }
  #xbot .xb-q::-webkit-scrollbar { display:none !important; }
  #xbot .xb-qb { padding:8px 14px !important; font-size:13px !important; }

  #xbot .xb-inp {
    padding:10px 16px 12px !important;
    padding-bottom:max(12px, env(safe-area-inset-bottom)) !important;
    gap:10px !important;
  }
  #xbot .xb-inp input { padding:11px 16px !important; font-size:16px !important; border-radius:22px !important; }
  #xbot .xb-send { width:42px !important; height:42px !important; }

  #xbot .xb-ft {
    padding:8px 16px !important;
    padding-bottom:max(8px, env(safe-area-inset-bottom)) !important;
    font-size:10.5px !important;
  }

  /* Body scroll lock wenn Chat offen (verhindert Hintergrund-Scroll) */
  body.xbot-open {
    overflow:hidden !important;
    position:fixed !important;
    width:100% !important;
  }
}
`;
  document.head.appendChild(css);

  // Container
  var el=document.createElement('div');
  el.id='xbot';
  document.body.appendChild(el);

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  function render(){
    el.innerHTML='';

    if(!isOpen){
      el.innerHTML =
        '<button id="xbot-fab" aria-label="Chat \u00F6ffnen" type="button">'
        +'<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>'
        +'</button>'
        +'<div id="xbot-dot">1</div>';
      var fab=document.getElementById('xbot-fab');
      fab.onclick=function(){ isOpen=true; playSound(); render(); };
      return;
    }

    // Messages HTML
    var mh='';
    for(var i=0;i<messages.length;i++){
      var m=messages[i];
      if(m.role==='assistant'){
        mh+='<div class="xb-row"><div class="xb-ico">\uD83E\uDDB7</div><div class="xb-bub xb-bub-b">'+esc(m.content)+'</div></div>';
      } else {
        mh+='<div class="xb-row xb-row-u"><div class="xb-bub xb-bub-u">'+esc(m.content)+'</div></div>';
      }
    }
    if(loading){
      mh+='<div class="xb-row"><div class="xb-ico">\uD83E\uDDB7</div><div class="xb-typ"><div class="xb-d"></div><div class="xb-d"></div><div class="xb-d"></div></div></div>';
    }

    // Quick-Replies — zeigen wenn weniger als 2 User-Messages
    var qh='';
    if(msgCount<2){
      qh='<div class="xb-q">';
      for(var j=0;j<QUESTIONS.length;j++){
        qh+='<button class="xb-qb" type="button" '+(loading?'disabled':'')+' data-q="'+escA(QUESTIONS[j])+'">'+esc(QUESTIONS[j])+'</button>';
      }
      qh+='</div>';
    }

    var sc=loading?'#9CA3AF':'#fff';

    el.innerHTML =
      '<div id="xbot-win" class="open">'
      + '<div class="xb-hd">'
        + '<div class="xb-hd-l">'
          + '<div class="xb-av">\uD83E\uDDB7</div>'
          + '<div class="xb-hd-info">'
            + '<h3>Praxis Dr. Weber</h3>'
            + '<p><span class="xb-on"></span>Online \u00B7 Antwortet sofort</p>'
          + '</div>'
        + '</div>'
        + '<button class="xb-x" id="xb-cls" aria-label="Chat schlie\u00DFen" type="button"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
      + '</div>'
      + '<div class="xb-demo">\u26A0 DEMO \u2014 FIKTIVE PRAXIS \u00B7 <a href="https://www.xynoia.de" target="_blank" rel="noopener">XYNOIA.DE</a></div>'
      + '<div class="xb-msgs" id="xb-ms">' + mh + '<div id="xb-end"></div></div>'
      + qh
      + '<div class="xb-inp">'
        + '<input id="xb-in" type="text" placeholder="Ihre Nachricht..." ' + (loading?'disabled':'') + ' autocomplete="off" autocapitalize="sentences" autocorrect="on">'
        + '<button class="xb-send ' + (loading?'off':'on') + '" id="xb-snd" aria-label="Senden" type="button">'
          + '<svg viewBox="0 0 24 24" stroke="' + sc + '"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="' + sc + '"/></svg>'
        + '</button>'
      + '</div>'
      + '<div class="xb-ft"><div class="xb-disc">Demo von XYNOIA. Praxis Dr. Weber ist fiktiv.</div>Powered by <a href="https://www.xynoia.de" target="_blank" rel="noopener">XYNOIA</a></div>'
      + '</div>';

    document.body.classList.add('xbot-open');

    document.getElementById('xb-cls').onclick=function(){
      isOpen=false;
      document.body.classList.remove('xbot-open');
      render();
    };

    var inp=document.getElementById('xb-in');
    inp.onkeydown=function(e){
      if(e.key==='Enter' && !e.shiftKey){
        e.preventDefault();
        send(inp.value);
      }
    };

    document.getElementById('xb-snd').onclick=function(){ send(inp.value); };

    var btns=document.querySelectorAll('#xbot .xb-qb');
    for(var k=0;k<btns.length;k++){
      (function(b){
        b.onclick=function(){ send(b.getAttribute('data-q')); };
      })(btns[k]);
    }

    var endEl=document.getElementById('xb-end');
    if(endEl) endEl.scrollIntoView({ behavior:'smooth', block:'end' });

    // Focus nur auf Desktop
    if(!loading && window.innerWidth > 640){
      setTimeout(function(){ inp.focus(); }, 100);
    }
  }

  // ═══════════════════════════════════════════
  // SEND — kompatibel zu /api/chat ({messages})
  // ═══════════════════════════════════════════
  function send(t){
    if(!t || !t.trim() || loading) return;
    t=t.trim();
    messages.push({ role:'user', content:t });
    msgCount++;
    loading=true;
    render();

    var body=JSON.stringify({
      messages: messages.map(function(m){ return { role:m.role, content:m.content }; })
    });

    fetch('/api/chat', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body:body
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
      var txt=(d.content && d.content[0] && d.content[0].text) || 'Entschuldigung, da ist etwas schiefgelaufen.';
      messages.push({ role:'assistant', content:txt });
      loading=false;
      render();
    })
    .catch(function(){
      messages.push({ role:'assistant', content:'Verbindung unterbrochen. Bitte versuchen Sie es erneut.' });
      loading=false;
      render();
    });
  }

  function esc(s){
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/\n/g,'<br>');
  }
  function escA(s){
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/"/g,'&quot;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;');
  }

  // ESC schließt den Chat
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape' && isOpen){
      isOpen=false;
      document.body.classList.remove('xbot-open');
      render();
    }
  });

  // Init
  render();
})();
