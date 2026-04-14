(function() {
  let isOpen = false;
  let messages = [
    { role: 'assistant', content: 'Hallo! 👋 Willkommen bei der Zahnarztpraxis Dr. Weber. Wie kann ich Ihnen helfen?' }
  ];
  let loading = false;
  let msgCount = 0;

  const QUICK_QUESTIONS = [
    'Termin buchen',
    'Was kostet eine Zahnreinigung?',
    'Ich habe Zahnschmerzen!',
    'Ich war gestern bei euch',
    'Ich habe Angst vorm Zahnarzt',
    'Ist das eine echte Praxis?'
  ];

  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    #xynoia-chat-widget * { margin:0; padding:0; box-sizing:border-box; font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif; -webkit-tap-highlight-color:transparent; }
    body.xc-chat-open { overflow:hidden; }

    /* === BUBBLE === */
    .xc-bubble-wrap { position:fixed; bottom:28px; right:28px; z-index:99999; }
    .xc-bubble-btn {
      width:62px; height:62px; border-radius:50%; border:none; cursor:pointer;
      background:linear-gradient(135deg,#45BFA8,#3AA08A);
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 4px 20px rgba(69,191,168,0.35);
      animation:xc-pulse 2.5s ease-out infinite;
      transition:transform .2s;
    }
    .xc-bubble-btn:hover { transform:scale(1.08); }
    .xc-bubble-btn svg { width:26px; height:26px; stroke:white; fill:none; stroke-width:2; }
    .xc-badge {
      position:absolute; top:-3px; right:-1px;
      width:20px; height:20px; border-radius:50%;
      background:#FF4D6A; font-size:10px; font-weight:700; color:white;
      display:flex; align-items:center; justify-content:center;
      border:2px solid #0B0E17;
    }
    @keyframes xc-pulse {
      0% { box-shadow:0 4px 20px rgba(69,191,168,0.35),0 0 0 0 rgba(69,191,168,0.35); }
      70% { box-shadow:0 4px 20px rgba(69,191,168,0.35),0 0 0 14px rgba(69,191,168,0); }
      100% { box-shadow:0 4px 20px rgba(69,191,168,0.35),0 0 0 0 rgba(69,191,168,0); }
    }

    /* === WINDOW === */
    .xc-window {
      position:fixed; bottom:28px; right:28px; z-index:99999;
      width:380px; height:600px; border-radius:24px; overflow:hidden;
      display:none; flex-direction:column;
      background:#0c0f1a;
      border:1px solid rgba(255,255,255,0.07);
      box-shadow:0 25px 70px rgba(0,0,0,0.5);
    }
    .xc-window.open { display:flex; }

    /* === HEADER === */
    .xc-header {
      padding:20px 24px 16px;
      background:linear-gradient(180deg,rgba(69,191,168,0.06) 0%,transparent 100%);
      border-bottom:1px solid rgba(255,255,255,0.05);
      display:flex; align-items:center; justify-content:space-between;
    }
    .xc-header-left { display:flex; align-items:center; gap:14px; }
    .xc-avatar {
      width:44px; height:44px; border-radius:50%;
      background:linear-gradient(135deg,#45BFA8,#3AA08A);
      display:flex; align-items:center; justify-content:center;
      font-size:22px; box-shadow:0 2px 10px rgba(69,191,168,0.25);
    }
    .xc-header-text h3 { color:#E8EBF2; font-size:15px; font-weight:700; }
    .xc-header-text p { color:#6B7194; font-size:12px; font-weight:500; margin-top:2px; display:flex; align-items:center; gap:6px; }
    .xc-online-dot { width:7px; height:7px; border-radius:50%; background:#45BFA8; box-shadow:0 0 6px rgba(69,191,168,0.7); }
    .xc-close-btn {
      background:none; border:none; color:#5A5F78; font-size:22px;
      cursor:pointer; padding:4px; transition:color .2s; line-height:1;
    }
    .xc-close-btn:hover { color:#E8EBF2; }

    /* === DEMO BANNER === */
    .xc-demo {
      padding:8px 24px;
      background:rgba(255,77,106,0.06);
      border-bottom:1px solid rgba(255,77,106,0.06);
      text-align:center;
    }
    .xc-demo span { font-size:10px; color:#FF6B81; font-weight:600; letter-spacing:1.2px; }
    .xc-demo a { color:#45BFA8; text-decoration:none; font-weight:700; }
    .xc-demo a:hover { text-decoration:underline; }

    /* === MESSAGES === */
    .xc-messages {
      flex:1; overflow-y:auto; padding:20px 20px 12px;
      display:flex; flex-direction:column; gap:16px;
    }
    .xc-messages::-webkit-scrollbar { width:3px; }
    .xc-messages::-webkit-scrollbar-track { background:transparent; }
    .xc-messages::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.06); border-radius:4px; }

    .xc-msg { display:flex; align-items:flex-start; gap:10px; animation:xc-fadeIn .3s ease-out; }
    .xc-msg-user { justify-content:flex-end; }
    @keyframes xc-fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

    .xc-msg-icon {
      width:30px; height:30px; border-radius:50%; flex-shrink:0;
      background:rgba(69,191,168,0.1);
      display:flex; align-items:center; justify-content:center; font-size:15px;
      margin-top:2px;
    }
    .xc-text {
      max-width:75%; padding:12px 16px; font-size:14px; line-height:1.65; white-space:pre-wrap;
    }
    .xc-text-bot {
      background:rgba(255,255,255,0.05); color:#D0D5E4;
      border-radius:4px 18px 18px 18px;
      border:1px solid rgba(255,255,255,0.04);
    }
    .xc-text-user {
      background:linear-gradient(135deg,#45BFA8,#38A693); color:#071210;
      border-radius:18px 18px 4px 18px; font-weight:500;
    }

    /* Typing */
    .xc-typing-wrap { display:flex; align-items:flex-start; gap:10px; }
    .xc-typing {
      display:flex; gap:5px; padding:14px 20px;
      background:rgba(255,255,255,0.05); border-radius:4px 18px 18px 18px;
      border:1px solid rgba(255,255,255,0.04);
    }
    .xc-dot {
      width:7px; height:7px; border-radius:50%; background:#45BFA8; opacity:.5;
      animation:xc-bounce 1.2s ease-in-out infinite;
    }
    .xc-dot:nth-child(2){animation-delay:.15s}
    .xc-dot:nth-child(3){animation-delay:.3s}
    @keyframes xc-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}

    /* === QUICK QUESTIONS === */
    .xc-quick { padding:4px 20px 8px; display:flex; flex-wrap:wrap; gap:6px; }
    .xc-qbtn {
      padding:7px 14px; border-radius:20px;
      background:rgba(69,191,168,0.05); border:1px solid rgba(69,191,168,0.12);
      color:#45BFA8; font-size:12.5px; font-weight:500;
      cursor:pointer; transition:all .2s; font-family:inherit;
    }
    .xc-qbtn:hover { background:rgba(69,191,168,0.1); border-color:rgba(69,191,168,0.25); }
    .xc-qbtn:disabled { opacity:.35; cursor:default; }

    /* === INPUT === */
    .xc-input-wrap {
      padding:12px 20px 10px;
      border-top:1px solid rgba(255,255,255,0.04);
      display:flex; gap:10px; align-items:center;
    }
    .xc-input {
      flex:1; padding:12px 16px; border-radius:16px;
      border:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.03);
      color:#E8EBF2; font-size:14px; outline:none; font-family:inherit;
      transition:border-color .2s;
    }
    .xc-input::placeholder { color:#3D4260; }
    .xc-input:focus { border-color:rgba(69,191,168,0.25); }
    .xc-send-btn {
      width:42px; height:42px; border-radius:50%; border:none;
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; transition:all .2s; flex-shrink:0;
    }
    .xc-send-btn.active {
      background:linear-gradient(135deg,#45BFA8,#3AA08A);
      box-shadow:0 2px 10px rgba(69,191,168,0.3);
    }
    .xc-send-btn.inactive { background:rgba(255,255,255,0.03); cursor:default; }
    .xc-send-btn svg { width:18px; height:18px; fill:none; stroke-width:2.5; }

    /* === FOOTER === */
    .xc-bottom {
      padding:6px 20px 14px; text-align:center;
      font-size:10.5px; color:#2D3250; line-height:1.5;
    }
    .xc-bottom a { color:#45BFA8; font-weight:700; text-decoration:none; letter-spacing:.3px; }
    .xc-bottom a:hover { text-decoration:underline; }
    .xc-bottom .xc-disclaimer { font-size:9.5px; color:#3D4260; margin-bottom:4px; }

    /* === MOBILE === */
    @media(max-width:480px){
      .xc-window {
        width:100vw; height:100vh; height:100dvh;
        bottom:0; right:0; border-radius:0; border:none;
      }
      .xc-bubble-wrap { bottom:20px; right:20px; }
      .xc-bubble-btn { width:56px; height:56px; }
      .xc-bubble-btn svg { width:22px; height:22px; }
      .xc-header { padding:16px 20px 14px; }
      .xc-avatar { width:40px; height:40px; font-size:20px; }
      .xc-header-text h3 { font-size:14px; }
      .xc-demo { padding:6px 20px; }
      .xc-messages { padding:16px 16px 10px; gap:14px; }
      .xc-msg-icon { width:28px; height:28px; font-size:14px; }
      .xc-text { max-width:82%; padding:10px 14px; font-size:14px; }
      .xc-quick { padding:4px 16px 6px; gap:5px; }
      .xc-qbtn { padding:6px 12px; font-size:12px; }
      .xc-input-wrap { padding:10px 16px 8px; gap:8px; }
      .xc-input { padding:11px 14px; font-size:16px; border-radius:14px; }
      .xc-send-btn { width:40px; height:40px; }
      .xc-bottom { padding:4px 16px 12px; }
      .xc-close-btn { font-size:24px; padding:6px; }
    }
  `;
  document.head.appendChild(style);

  const widget = document.createElement('div');
  widget.id = 'xynoia-chat-widget';
  document.body.appendChild(widget);

  function render() {
    widget.innerHTML = '';
    if (isOpen && window.innerWidth <= 480) {
      document.body.classList.add('xc-chat-open');
    } else {
      document.body.classList.remove('xc-chat-open');
    }

    if (!isOpen) {
      widget.innerHTML = `
        <div class="xc-bubble-wrap">
          <button class="xc-bubble-btn" id="xc-open" aria-label="Chat oeffnen">
            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </button>
          <div class="xc-badge">1</div>
        </div>`;
      document.getElementById('xc-open').onclick = () => { isOpen = true; render(); };
      return;
    }

    let msgsHtml = messages.map(m => {
      if (m.role === 'assistant') {
        return `<div class="xc-msg">
          <div class="xc-msg-icon">🦷</div>
          <div class="xc-text xc-text-bot">${esc(m.content)}</div>
        </div>`;
      }
      return `<div class="xc-msg xc-msg-user">
        <div class="xc-text xc-text-user">${esc(m.content)}</div>
      </div>`;
    }).join('');

    if (loading) {
      msgsHtml += `<div class="xc-typing-wrap">
        <div class="xc-msg-icon">🦷</div>
        <div class="xc-typing"><div class="xc-dot"></div><div class="xc-dot"></div><div class="xc-dot"></div></div>
      </div>`;
    }

    let quickHtml = '';
    if (msgCount < 2) {
      quickHtml = `<div class="xc-quick">${QUICK_QUESTIONS.map(q =>
        `<button class="xc-qbtn" ${loading?'disabled':''} data-q="${escA(q)}">${esc(q)}</button>`
      ).join('')}</div>`;
    }

    widget.innerHTML = `
      <div class="xc-window open">
        <div class="xc-header">
          <div class="xc-header-left">
            <div class="xc-avatar">🦷</div>
            <div class="xc-header-text">
              <h3>Praxis Dr. Weber</h3>
              <p><span class="xc-online-dot"></span> KI-Assistent · Online</p>
            </div>
          </div>
          <button class="xc-close-btn" id="xc-close">✕</button>
        </div>
        <div class="xc-demo">
          <span>⚠ DEMO — FIKTIVE PRAXIS · Erstellt von <a href="https://www.xynoia.de" target="_blank">XYNOIA.DE</a></span>
        </div>
        <div class="xc-messages" id="xc-msgs">${msgsHtml}<div id="xc-anchor"></div></div>
        ${quickHtml}
        <div class="xc-input-wrap">
          <input class="xc-input" id="xc-in" placeholder="Ihre Nachricht..." ${loading?'disabled':''} autocomplete="off">
          <button class="xc-send-btn ${loading?'inactive':'active'}" id="xc-send">
            <svg viewBox="0 0 24 24" stroke="${loading?'#3D4260':'#071210'}">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <div class="xc-bottom">
          <div class="xc-disclaimer">Demo von XYNOIA. Die Praxis Dr. Weber ist fiktiv. Keine echten Termine.</div>
          Powered by <a href="https://www.xynoia.de" target="_blank">XYNOIA</a> · KI-Automatisierung
        </div>
      </div>`;

    document.getElementById('xc-close').onclick = () => { isOpen = false; render(); };
    const inp = document.getElementById('xc-in');
    inp.addEventListener('keydown', e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg(inp.value);} });
    document.getElementById('xc-send').onclick = () => sendMsg(inp.value);
    document.querySelectorAll('.xc-qbtn').forEach(b => { b.onclick = () => sendMsg(b.dataset.q); });
    document.getElementById('xc-anchor').scrollIntoView({behavior:'smooth'});
    if(!loading) inp.focus();
  }

  async function sendMsg(text) {
    if(!text||!text.trim()||loading) return;
    text = text.trim();
    messages.push({role:'user',content:text});
    msgCount++;
    loading = true;
    render();
    try {
      const res = await fetch('/api/chat',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({messages:messages.map(m=>({role:m.role,content:m.content}))})
      });
      const data = await res.json();
      messages.push({role:'assistant',content:data.content?.[0]?.text||'Entschuldigung, da ist etwas schiefgelaufen. Bitte rufen Sie uns an: 089 / 123 456 78'});
    } catch(e) {
      messages.push({role:'assistant',content:'Verbindung unterbrochen. Bitte versuchen Sie es erneut.'});
    }
    loading = false;
    render();
  }

  function esc(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/\n/g,'<br>');}
  function escA(t){return t.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  render();
})();
