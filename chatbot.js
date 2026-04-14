(function() {
  // Chat widget state
  let isOpen = false;
  let messages = [
    { role: 'assistant', content: 'Willkommen bei der Zahnarztpraxis Dr. Weber! 👋 Wie kann ich Ihnen helfen? Ich kann Termine vereinbaren, Fragen beantworten oder zu Leistungen beraten.' }
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

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #xynoia-chat-widget * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; }
    #xynoia-chat-bubble {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 64px; height: 64px; border-radius: 50%;
      background: linear-gradient(135deg, #45BFA8, #3AA08A);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 24px rgba(69,191,168,0.4);
      animation: xynoia-pulse 2s ease-out infinite;
      transition: transform 0.2s;
    }
    #xynoia-chat-bubble:hover { transform: scale(1.1); }
    #xynoia-chat-bubble svg { width: 28px; height: 28px; }
    #xynoia-chat-badge {
      position: absolute; top: -4px; right: -2px;
      width: 22px; height: 22px; border-radius: 50%;
      background: #FF4D6A; display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: white; border: 2px solid #0B0E17;
    }
    @keyframes xynoia-pulse {
      0% { box-shadow: 0 4px 24px rgba(69,191,168,0.4), 0 0 0 0 rgba(69,191,168,0.4); }
      70% { box-shadow: 0 4px 24px rgba(69,191,168,0.4), 0 0 0 16px rgba(69,191,168,0); }
      100% { box-shadow: 0 4px 24px rgba(69,191,168,0.4), 0 0 0 0 rgba(69,191,168,0); }
    }
    #xynoia-chat-window {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 400px; height: 620px; border-radius: 20px; overflow: hidden;
      display: none; flex-direction: column;
      background: #0B0E17;
      border: 1px solid rgba(69,191,168,0.15);
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(69,191,168,0.05);
    }
    #xynoia-chat-window.open { display: flex; }
    @media (max-width: 480px) {
      #xynoia-chat-window { width: calc(100vw - 16px); height: calc(100vh - 80px); bottom: 8px; right: 8px; border-radius: 16px; }
    }
    .xc-header {
      padding: 14px 18px;
      background: linear-gradient(135deg, rgba(69,191,168,0.1), rgba(107,99,160,0.06));
      border-bottom: 1px solid rgba(69,191,168,0.08);
      display: flex; align-items: center; justify-content: space-between;
    }
    .xc-header-info { display: flex; align-items: center; gap: 12px; }
    .xc-avatar {
      width: 42px; height: 42px; border-radius: 12px;
      background: linear-gradient(135deg, #45BFA8, #3AA08A);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; box-shadow: 0 2px 12px rgba(69,191,168,0.3);
    }
    .xc-name { color: #E2E6EF; font-weight: 700; font-size: 14.5px; letter-spacing: 0.2px; }
    .xc-status { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
    .xc-status-dot {
      width: 7px; height: 7px; border-radius: 50%; background: #45BFA8;
      box-shadow: 0 0 8px rgba(69,191,168,0.8);
      animation: xc-glow 2s ease-in-out infinite;
    }
    @keyframes xc-glow { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
    .xc-status span { color: #7A8099; font-size: 11.5px; font-weight: 500; }
    .xc-close {
      background: rgba(255,255,255,0.05); border: none; color: #7A8099;
      cursor: pointer; font-size: 16px; padding: 6px 8px; border-radius: 8px; transition: all 0.2s;
    }
    .xc-close:hover { background: rgba(255,255,255,0.1); color: #E2E6EF; }
    .xc-demo-bar {
      padding: 7px 16px;
      background: linear-gradient(90deg, rgba(255,77,106,0.1), rgba(107,99,160,0.1));
      border-bottom: 1px solid rgba(255,77,106,0.08);
      text-align: center;
    }
    .xc-demo-bar span {
      font-size: 10px; color: #FF4D6A; font-weight: 700;
      letter-spacing: 1.5px; text-transform: uppercase;
    }
    .xc-demo-bar a { color: #45BFA8; text-decoration: none; font-weight: 700; }
    .xc-demo-bar a:hover { text-decoration: underline; }
    .xc-features {
      padding: 8px 16px 4px; display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none;
    }
    .xc-features::-webkit-scrollbar { display: none; }
    .xc-feature-pill {
      padding: 3px 10px; border-radius: 20px;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
      font-size: 10px; color: #5A5F78; font-weight: 500; white-space: nowrap;
    }
    .xc-messages {
      flex: 1; overflow-y: auto; padding: 12px 14px 8px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .xc-messages::-webkit-scrollbar { width: 3px; }
    .xc-messages::-webkit-scrollbar-track { background: transparent; }
    .xc-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
    .xc-msg { display: flex; align-items: flex-end; gap: 8px; animation: xc-fadeIn 0.3s ease-out; }
    .xc-msg-user { justify-content: flex-end; }
    .xc-msg-bot { justify-content: flex-start; }
    @keyframes xc-fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
    .xc-msg-avatar {
      width: 26px; height: 26px; border-radius: 8px;
      background: rgba(69,191,168,0.12);
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; flex-shrink: 0;
    }
    .xc-bubble {
      max-width: 80%; padding: 10px 14px; font-size: 13px; line-height: 1.6; white-space: pre-wrap;
    }
    .xc-bubble-bot {
      border-radius: 16px 16px 16px 4px;
      background: rgba(255,255,255,0.05); color: #D8DCE8;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .xc-bubble-user {
      border-radius: 16px 16px 4px 16px;
      background: linear-gradient(135deg, #45BFA8, #3AA08A); color: #0B0E17; font-weight: 500;
    }
    .xc-typing { display: flex; gap: 5px; padding: 12px 18px; }
    .xc-typing-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #45BFA8;
      animation: xc-bounce 1.2s ease-in-out infinite;
    }
    .xc-typing-dot:nth-child(2) { animation-delay: 0.15s; }
    .xc-typing-dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes xc-bounce { 0%,60%,100% { transform:translateY(0); } 30% { transform:translateY(-5px); } }
    .xc-quick {
      padding: 4px 14px 6px; display: flex; flex-wrap: wrap; gap: 5px;
    }
    .xc-quick-btn {
      padding: 5px 11px; border-radius: 20px;
      background: rgba(69,191,168,0.06); border: 1px solid rgba(69,191,168,0.15);
      color: #45BFA8; font-size: 11.5px; font-weight: 500;
      cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .xc-quick-btn:hover { background: rgba(69,191,168,0.12); border-color: rgba(69,191,168,0.3); }
    .xc-quick-btn:disabled { opacity: 0.4; cursor: default; }
    .xc-input-area {
      padding: 10px 14px 8px; border-top: 1px solid rgba(255,255,255,0.04);
      display: flex; gap: 8px; align-items: flex-end;
    }
    .xc-input {
      flex: 1; padding: 10px 14px; border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.03);
      color: #E2E6EF; font-size: 13.5px; outline: none; font-family: inherit;
      transition: border-color 0.2s;
    }
    .xc-input::placeholder { color: #3A3F55; }
    .xc-input:focus { border-color: rgba(69,191,168,0.3); }
    .xc-send {
      width: 40px; height: 40px; border-radius: 12px; border: none;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s; flex-shrink: 0;
    }
    .xc-send-active {
      background: linear-gradient(135deg, #45BFA8, #3AA08A);
      box-shadow: 0 2px 12px rgba(69,191,168,0.3);
    }
    .xc-send-inactive { background: rgba(255,255,255,0.04); cursor: default; }
    .xc-footer {
      padding: 5px 14px 10px; text-align: center; font-size: 10px; color: #2A2F42;
    }
    .xc-footer a { color: #45BFA8; font-weight: 700; text-decoration: none; letter-spacing: 0.5px; }
    .xc-footer a:hover { text-decoration: underline; }
    .xc-disclaimer {
      padding: 6px 14px;
      background: rgba(255,77,106,0.05);
      border-top: 1px solid rgba(255,77,106,0.06);
      text-align: center; font-size: 9.5px; color: #7A8099; line-height: 1.4;
    }
  `;
  document.head.appendChild(style);

  // Create widget container
  const widget = document.createElement('div');
  widget.id = 'xynoia-chat-widget';
  document.body.appendChild(widget);

  function render() {
    widget.innerHTML = '';

    if (!isOpen) {
      // Bubble
      widget.innerHTML = `
        <div style="position:fixed;bottom:24px;right:24px;z-index:99999">
          <button id="xynoia-chat-bubble" aria-label="Chat öffnen">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </button>
          <div id="xynoia-chat-badge">1</div>
        </div>`;
      document.getElementById('xynoia-chat-bubble').onclick = () => { isOpen = true; render(); };
      return;
    }

    // Chat window
    let msgsHtml = messages.map((m, i) => {
      if (m.role === 'assistant') {
        return `<div class="xc-msg xc-msg-bot">
          <div class="xc-msg-avatar">🦷</div>
          <div class="xc-bubble xc-bubble-bot">${escapeHtml(m.content)}</div>
        </div>`;
      } else {
        return `<div class="xc-msg xc-msg-user">
          <div class="xc-bubble xc-bubble-user">${escapeHtml(m.content)}</div>
        </div>`;
      }
    }).join('');

    if (loading) {
      msgsHtml += `<div class="xc-msg xc-msg-bot">
        <div class="xc-msg-avatar">🦷</div>
        <div class="xc-bubble xc-bubble-bot xc-typing">
          <div class="xc-typing-dot"></div><div class="xc-typing-dot"></div><div class="xc-typing-dot"></div>
        </div>
      </div>`;
    }

    let quickHtml = '';
    if (msgCount < 2) {
      quickHtml = `<div class="xc-quick">${QUICK_QUESTIONS.map(q =>
        `<button class="xc-quick-btn" ${loading ? 'disabled' : ''} data-q="${escapeAttr(q)}">${escapeHtml(q)}</button>`
      ).join('')}</div>`;
    }

    widget.innerHTML = `
      <div id="xynoia-chat-window" class="open">
        <div class="xc-header">
          <div class="xc-header-info">
            <div class="xc-avatar">🦷</div>
            <div>
              <div class="xc-name">Praxis Dr. Weber</div>
              <div class="xc-status">
                <div class="xc-status-dot"></div>
                <span>KI-Assistent · Antwortet sofort</span>
              </div>
            </div>
          </div>
          <button class="xc-close" id="xc-close-btn">✕</button>
        </div>
        <div class="xc-demo-bar">
          <span>⚠ DEMO — Fiktive Praxis · Erstellt von <a href="https://www.xynoia.de" target="_blank">XYNOIA.DE</a></span>
        </div>
        <div class="xc-features">
          <div class="xc-feature-pill">📅 Termine</div>
          <div class="xc-feature-pill">💬 Beratung</div>
          <div class="xc-feature-pill">🚨 Notfall</div>
          <div class="xc-feature-pill">⭐ Bewertung</div>
          <div class="xc-feature-pill">😰 Angstpatienten</div>
        </div>
        <div class="xc-messages" id="xc-messages">${msgsHtml}<div id="xc-scroll-anchor"></div></div>
        ${quickHtml}
        <div class="xc-input-area">
          <input class="xc-input" id="xc-input" placeholder="Ihre Nachricht..." ${loading ? 'disabled' : ''}>
          <button class="xc-send ${(!loading) ? 'xc-send-active' : 'xc-send-inactive'}" id="xc-send-btn">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="${loading ? '#3A3F55' : '#0B0E17'}" stroke-width="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <div class="xc-disclaimer">Dies ist eine KI-Demo von XYNOIA. Die Zahnarztpraxis Dr. Weber ist fiktiv. Keine echten Termine werden gebucht.</div>
        <div class="xc-footer">Powered by <a href="https://www.xynoia.de" target="_blank">XYNOIA</a> · KI-Automatisierung</div>
      </div>`;

    // Event listeners
    document.getElementById('xc-close-btn').onclick = () => { isOpen = false; render(); };

    const inputEl = document.getElementById('xc-input');
    const sendBtn = document.getElementById('xc-send-btn');

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(inputEl.value); }
    });
    sendBtn.onclick = () => sendMsg(inputEl.value);

    document.querySelectorAll('.xc-quick-btn').forEach(btn => {
      btn.onclick = () => sendMsg(btn.dataset.q);
    });

    // Scroll to bottom
    document.getElementById('xc-scroll-anchor').scrollIntoView({ behavior: 'smooth' });
    if (!loading) inputEl.focus();
  }

  async function sendMsg(text) {
    if (!text || !text.trim() || loading) return;
    text = text.trim();

    messages.push({ role: 'user', content: text });
    msgCount++;
    loading = true;
    render();

    try {
      const apiMessages = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || 'Entschuldigung, da ist etwas schiefgelaufen. Bitte rufen Sie uns an: 089 / 123 456 78';
      messages.push({ role: 'assistant', content: reply });
    } catch (err) {
      messages.push({ role: 'assistant', content: 'Entschuldigung, die Verbindung wurde unterbrochen. Bitte versuchen Sie es später erneut.' });
    }

    loading = false;
    render();
  }

  function escapeHtml(t) {
    return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/\n/g,'<br>');
  }
  function escapeAttr(t) {
    return t.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // Initial render
  render();
})();
