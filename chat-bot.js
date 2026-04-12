// Floating Chat Bot Script

(function() {
    // Default config
    const defaultConfig = {
        companyName: 'Company Name',
        apiKey: '',
        primaryColor: '#007bff',
        backendUrl: 'http://localhost:3000', // For demo; change to your hosted backend URL
        language: 'Bosnian',
        contactEmail: 'contact@company.com',
        contactPhone: '123-456-7890'
    };

    // Merge with user config
    const config = { ...defaultConfig, ...window.ChatBotConfig };

    const languages = [
        { label: 'BS', value: 'Bosnian', title: 'Bosanski' },
        { label: 'EN', value: 'English', title: 'English' },
        { label: 'HR', value: 'Croatian', title: 'Hrvatski' }
    ];

    const uiText = {
        Bosnian: {
            placeholder: 'Kako vam mogu pomoći?',
            subtitle: 'Pitaj za električne uređaje, dostavu ili servis.',
            initial: `Zdravo! Ja sam pomoćnik ${config.companyName}. Kako vam mogu pomoći danas?`,
            send: 'Pošalji',
            theme: 'Boja:'
        },
        English: {
            placeholder: 'How can I help you?',
            subtitle: 'Ask about electric devices, delivery or service.',
            initial: `Hello! I'm ${config.companyName}'s chat assistant. How can I help you today?`,
            send: 'Send',
            theme: 'Color:'
        },
        Croatian: {
            placeholder: 'Kako vam mogu pomoći?',
            subtitle: 'Pitaj za električne uređaje, dostavu ili servis.',
            initial: `Bok! Ja sam pomoćnik ${config.companyName}. Kako vam mogu pomoći danas?`,
            send: 'Pošalji',
            theme: 'Boja:'
        }
    };

    const suggestedRepliesByLanguage = {
        Bosnian: ['Cena dostave?', 'Garantni list?', 'Servis?'],
        English: ['Delivery cost?', 'Warranty card?', 'Service?'],
        Croatian: ['Cijena dostave?', 'Garantni list?', 'Servis?']
    };

    function shadeColor(color, percent) {
        const f = parseInt(color.slice(1), 16);
        const t = percent < 0 ? 0 : 255;
        const p = Math.abs(percent) / 100;
        const R = f >> 16;
        const G = (f >> 8) & 0x00FF;
        const B = f & 0x0000FF;
        const newR = Math.round((t - R) * p + R);
        const newG = Math.round((t - G) * p + G);
        const newB = Math.round((t - B) * p + B);
        return `#${(0x1000000 + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
    }

    function setTheme(color) {
        if (!popup) return;
        popup.style.setProperty('--bot-color', color);
        popup.style.setProperty('--bot-color-dark', shadeColor(color, -20));
        const dots = popup.querySelectorAll('.theme-dot');
        dots.forEach(dot => dot.classList.toggle('active', dot.dataset.color === color));
    }

    function setLanguage(lang) {
        config.language = lang;
        if (!popup) return;
        const langButtons = popup.querySelectorAll('.lang-button');
        langButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
        updateUI();
        createSuggestedReplies();
    }

    function updateUI() {
        const text = uiText[config.language] || uiText.Bosnian;
        const subtitle = popup.querySelector('.chat-bot-subtitle');
        const sendBtn = popup.querySelector('.chat-bot-send');
        const themeLabel = popup.querySelector('.chat-bot-theme-label');
        const input = popup.querySelector('.chat-bot-input');

        if (subtitle) subtitle.textContent = text.subtitle;
        if (sendBtn) sendBtn.textContent = text.send;
        if (themeLabel) themeLabel.textContent = text.theme;
        if (input) input.placeholder = text.placeholder;
    }

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
/* Floating Chat Bot Styles */

.chat-bot-icon {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, var(--bot-color), var(--bot-color-dark));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 14px 30px rgba(0,0,0,0.18);
    z-index: 1000;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.chat-bot-icon:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 18px 34px rgba(0,0,0,0.22);
}

.chat-bot-icon::before {
    content: '💬';
    font-size: 26px;
    color: white;
}

.chat-bot-popup {
    --bot-color: ${config.primaryColor};
    --bot-color-dark: ${shadeColor(config.primaryColor, -20)};
    position: fixed;
    bottom: 100px;
    right: 24px;
    width: 360px;
    height: 530px;
    background-color: rgba(255,255,255,0.98);
    border-radius: 22px;
    box-shadow: 0 18px 50px rgba(0,0,0,0.18);
    display: none;
    flex-direction: column;
    z-index: 1001;
    overflow: hidden;
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.9);
}

.chat-bot-popup.open {
    display: flex;
}

.chat-bot-header {
    background: linear-gradient(135deg, var(--bot-color), var(--bot-color-dark));
    color: white;
    padding: 18px 20px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.chat-bot-header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chat-bot-header h3 {
    margin: 0;
    font-size: 18px;
    letter-spacing: 0.03em;
    font-weight: 700;
}

.chat-bot-subtitle {
    margin: 0;
}

.chat-bot-settings {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
}

.chat-bot-language,
.chat-bot-theme {
    display: flex;
    align-items: center;
    gap: 8px;
}

.lang-button,
.theme-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.5);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: white;
    background: rgba(255,255,255,0.15);
    transition: transform 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.lang-button.active,
.theme-dot.active {
    transform: scale(1.05);
    border-color: white;
    opacity: 1;
}

.lang-button:hover,
.theme-dot:hover {
    transform: translateY(-1px) scale(1.05);
    border-color: white;
}

.chat-bot-theme-label,
.chat-bot-language-label {
    font-size: 12px;
    color: rgba(255,255,255,0.8);
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.chat-bot-theme {
    display: flex;
    align-items: center;
    gap: 10px;
}

.chat-bot-theme-label {
    font-size: 12px;
    color: rgba(255,255,255,0.8);
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.theme-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.5);
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.2s ease;
}

.theme-dot:hover,
.theme-dot.active {
    transform: scale(1.1);
    border-color: white;
}

.chat-bot-theme-label,
.chat-bot-language-label {
    font-size: 12px;
    color: rgba(255,255,255,0.8);
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.chat-bot-theme {
    display: flex;
    align-items: center;
    gap: 10px;
}

.chat-bot-theme-label {
    font-size: 12px;
    color: rgba(255,255,255,0.8);
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.theme-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.5);
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.2s ease;
}

.theme-dot:hover,
.theme-dot.active {
    transform: scale(1.1);
    border-color: white;
}

.chat-bot-messages {
    flex: 1;
    padding: 18px;
    overflow-y: auto;
    background: linear-gradient(180deg, #f6f8fb 0%, #eef4fb 100%);
    position: relative;
}

.chat-bot-popup {
    --bot-color: ${config.primaryColor};
    --bot-color-dark: ${shadeColor(config.primaryColor, -20)};
    position: fixed;
    bottom: 100px;
    right: 24px;
    width: 360px;
    height: 530px;
    background-color: rgba(255,255,255,0.98);
    border-radius: 22px;
    box-shadow: 0 18px 50px rgba(0,0,0,0.18);
    display: none;
    flex-direction: column;
    z-index: 1001;
    overflow: hidden;
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.9);
    opacity: 0;
    transform: translateY(10px) scale(0.98);
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.chat-bot-popup.open {
    display: flex;
    opacity: 1;
    transform: translateY(0) scale(1);
}

.chat-bot-messages {
    flex: 1;
    padding: 18px;
    overflow-y: auto;
    background: linear-gradient(180deg, #f6f8fb 0%, #eef4fb 100%);
    position: relative;
}

.message {
    margin-bottom: 12px;
    padding: 14px 16px;
    border-radius: 20px;
    max-width: 80%;
    box-shadow: 0 4px 18px rgba(0,0,0,0.05);
    line-height: 1.6;
    word-wrap: break-word;
}

.message.user {
    background: linear-gradient(135deg, var(--bot-color), var(--bot-color-dark));
    color: white;
    align-self: flex-end;
    margin-left: auto;
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 20px;
}

.message.bot {
    background: white;
    color: #263238;
    border: 1px solid rgba(99, 110, 114, 0.12);
    align-self: flex-start;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 20px;
}

.timestamp {
    font-size: 11px;
    color: rgba(38,50,56,0.55);
    margin-top: 8px;
}

.typing-indicator {
    display: none;
    padding: 12px 18px;
    background: rgba(255,255,255,0.95);
    border-top: 1px solid rgba(0,0,0,0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.typing-indicator span {
    width: 8px;
    height: 8px;
    background: #7a8ca7;
    border-radius: 50%;
    opacity: 0.35;
    animation: chatTyping 1.2s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
    animation-delay: 0.15s;
}

.typing-indicator span:nth-child(3) {
    animation-delay: 0.3s;
}

@keyframes chatTyping {
    0%, 100% { opacity: 0.35; transform: translateY(0);
    }
    50% { opacity: 1; transform: translateY(-4px);
    }
}

.chat-bot-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 18px;
    margin: 12px 0 0;
}

.suggestion-button {
    border: 1px solid rgba(33, 37, 41, 0.12);
    background: #ffffff;
    color: #2d3748;
    padding: 8px 12px;
    border-radius: 999px;
    cursor: pointer;
    font-size: 13px;
    transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.suggestion-button:hover {
    transform: translateY(-1px);
    background: rgba(13, 110, 253, 0.07);
}

.scroll-bottom-button {
    position: absolute;
    right: 18px;
    bottom: 88px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: rgba(33, 37, 41, 0.95);
    color: white;
    font-size: 18px;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 18px rgba(0,0,0,0.18);
    z-index: 1002;
}

.scroll-bottom-button.visible {
    display: flex;
}

.chat-bot-input-area {
    padding: 16px;
    background-color: white;
    border-top: 1px solid rgba(15, 76, 129, 0.08);
    display: flex;
    gap: 10px;
}

.chat-bot-input {
    flex: 1;
    padding: 14px 16px;
    border: 1px solid #d7dbe1;
    border-radius: 999px;
    margin: 0;
    background-color: #f4f7fb;
    color: #223249;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.chat-bot-input:focus {
    border-color: var(--bot-color);
    box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.12);
}

.chat-bot-send {
    padding: 0 18px;
    min-width: 90px;
    background: var(--bot-color);
    color: white;
    border: none;
    border-radius: 999px;
    cursor: pointer;
    font-weight: 700;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    transition: transform 0.2s ease, filter 0.2s ease;
}

.chat-bot-icon {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, var(--bot-color), var(--bot-color-dark));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 14px 30px rgba(0,0,0,0.18);
    z-index: 1000;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    animation: iconPop 0.6s ease-out;
}

.chat-bot-icon.pop {
    animation: iconPulse 2.5s ease-in-out 1s infinite;
}

@keyframes iconPop {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); }
}

@keyframes iconPulse {
    0%, 100% { transform: scale(1); box-shadow: 0 14px 30px rgba(0,0,0,0.18); }
    50% { transform: scale(1.05); box-shadow: 0 18px 36px rgba(0,0,0,0.22); }
}

.chat-bot-send:hover {
    transform: translateY(-1px);
    filter: brightness(1.05);
}

.chat-bot-send:active {
    transform: translateY(0);
}

/* Responsive */
@media (max-width: 420px) {
    .chat-bot-popup {
        width: 92vw;
        height: 72vh;
        bottom: 70px;
        right: 4vw;
    }
    .chat-bot-icon {
        width: 54px;
        height: 54px;
    }
    .chat-bot-icon::before {
        font-size: 22px;
    }
    .chat-bot-header {
        padding: 14px 16px;
    }
    .chat-bot-input-area {
        padding: 14px;
    }
}
    `;
    document.head.appendChild(style);

    // For embeddable, better to inline CSS, but for demo, ok.

    // Create icon
    const icon = document.createElement('div');
    icon.className = 'chat-bot-icon';
    icon.id = 'chat-bot-widget';
    icon.onclick = toggleChat;
    icon.style.opacity = '0';
    icon.style.pointerEvents = 'none';
    document.body.appendChild(icon);

    // Create popup
    const popup = document.createElement('div');
    popup.className = 'chat-bot-popup';
    popup.innerHTML = `
        <div class="chat-bot-header">
            <div class="chat-bot-header-top">
                <h3>${config.companyName}</h3>
                <button class="chat-bot-close" onclick="toggleChat()">&times;</button>
            </div>
            <p class="chat-bot-subtitle">Pitaj za električne uređaje, dostavu ili servis.</p>
            <div class="chat-bot-settings">
                <div class="chat-bot-language">
                    <span class="chat-bot-language-label">Lang:</span>
                    <button class="lang-button" data-lang="Bosnian" onclick="setLanguage('Bosnian')">BS</button>
                    <button class="lang-button" data-lang="English" onclick="setLanguage('English')">EN</button>
                    <button class="lang-button" data-lang="Croatian" onclick="setLanguage('Croatian')">HR</button>
                </div>
                <div class="chat-bot-theme">
                    <span class="chat-bot-theme-label">Boja:</span>
                    <button class="theme-dot" data-color="#0d6efd" onclick="setThemeColor('#0d6efd')" style="background:#0d6efd"></button>
                    <button class="theme-dot" data-color="#e03131" onclick="setThemeColor('#e03131')" style="background:#e03131"></button>
                    <button class="theme-dot" data-color="#2f9e44" onclick="setThemeColor('#2f9e44')" style="background:#2f9e44"></button>
                    <button class="theme-dot" data-color="#212529" onclick="setThemeColor('#212529')" style="background:#212529"></button>
                </div>
            </div>
        </div>
        <div class="chat-bot-messages" id="messages"></div>
        <div class="chat-bot-suggestions" id="suggestions"></div>
        <div class="typing-indicator" id="typing">
            <span></span><span></span><span></span>
        </div>
        <button class="scroll-bottom-button" id="scrollButton" aria-label="Scroll to latest message">⬇</button>
        <div class="chat-bot-input-area">
            <input type="text" class="chat-bot-input" id="input" placeholder="Kako vam mogu pomoći?">
            <button class="chat-bot-send" onclick="sendMessage()">Pošalji</button>
        </div>
    `;
    document.body.appendChild(popup);
    setTheme(config.primaryColor);

    // Messages container
    const messagesEl = document.getElementById('messages');
    const suggestionsEl = document.getElementById('suggestions');
    const inputEl = document.getElementById('input');
    const typingEl = document.getElementById('typing');
    const scrollButton = document.getElementById('scrollButton');
    setLanguage(config.language);

function createSuggestedReplies() {
        suggestionsEl.innerHTML = '';
        const replies = suggestedRepliesByLanguage[config.language] || suggestedRepliesByLanguage.Bosnian;
        replies.forEach(reply => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'suggestion-button';
            btn.textContent = reply;
            btn.addEventListener('click', () => {
                inputEl.value = reply;
                sendMessage();
            });
            suggestionsEl.appendChild(btn);
        });
    }

    function updateScrollButton() {
        const threshold = 60;
        const atBottom = messagesEl.scrollHeight - messagesEl.clientHeight - messagesEl.scrollTop <= threshold;
        if (!atBottom) {
            scrollButton.classList.add('visible');
        } else {
            scrollButton.classList.remove('visible');
        }
    }

    function scrollToBottom() {
        messagesEl.scrollTop = messagesEl.scrollHeight;
        scrollButton.classList.remove('visible');
    }

    scrollButton.addEventListener('click', scrollToBottom);
    messagesEl.addEventListener('scroll', updateScrollButton);

    function addMessage(type, text) {
        const wasAtBottom = messagesEl.scrollHeight - messagesEl.clientHeight - messagesEl.scrollTop <= 50;
        const msg = document.createElement('div');
        msg.className = `message ${type}`;
        msg.innerHTML = `<div>${text}</div><div class="timestamp">${new Date().toLocaleTimeString()}</div>`;
        messagesEl.appendChild(msg);
        if (wasAtBottom) {
            scrollToBottom();
        } else {
            updateScrollButton();
        }
    }

    createSuggestedReplies();

    // Initial message
    addMessage('bot', `Hello! I'm ${config.companyName}'s chat assistant. How can I help you today?`);

    // Functions
    function toggleChat() {
        popup.classList.toggle('open');
    }

    async function sendMessage() {
        const text = inputEl.value.trim();
        if (!text) return;
        addMessage('user', text);
        inputEl.value = '';
        showTyping();
        try {
            const response = await getResponse(text);
            hideTyping();
            addMessage('bot', response);
        } catch (e) {
            hideTyping();
            addMessage('bot', "Sorry, there was an error. Please try again.");
        }
    }

    function showTyping() {
        typingEl.style.display = 'block';
    }

    function hideTyping() {
        typingEl.style.display = 'none';
    }

    async function getResponse(message) {
        if (config.backendUrl) {
            try {
                const res = await fetch(`${config.backendUrl}/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: message,
                        companyName: config.companyName,
                        language: config.language
                    })
                });
                const data = await res.json();
                if (data.response) {
                    return data.response;
                } else {
                    throw new Error(data.error || 'Invalid response');
                }
            } catch (error) {
                console.error('Backend Error:', error);
                return getFallbackResponse(message);
            }
        } else if (config.apiKey) {
            // Fallback to direct API (not recommended for production)
            try {
                const res = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${config.apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            { role: 'system', content: `You are a helpful customer support assistant for ${config.companyName}. Answer questions about products, services, contact information, FAQs, and general inquiries. Be friendly, concise, and professional.` },
                            { role: 'user', content: message }
                        ],
                        max_tokens: 150
                    })
                });
                const data = await res.json();
                if (data.choices && data.choices[0]) {
                    return data.choices[0].message.content.trim();
                } else {
                    throw new Error('Invalid response');
                }
            } catch (error) {
                console.error('API Error:', error);
                return getFallbackResponse(message);
            }
        } else {
            return getFallbackResponse(message);
        }
    }

    function getFallbackResponse(message) {
        const lower = message.toLowerCase();
        if (lower.includes('product') || lower.includes('service')) {
            return 'We offer professional cleaning services for furniture, vehicles, and carpets. Ask about specific treatments or pricing.';
        } else if (lower.includes('contact') || lower.includes('phone') || lower.includes('email')) {
            return `You can contact us at ${config.contactEmail} or via WhatsApp at +${config.contactPhone}.`;
        } else if (lower.includes('faq') || lower.includes('help')) {
            return 'Check the FAQ section on the website for common questions. How else can I assist you?';
        } else if (lower.includes('price') || lower.includes('cost')) {
            return 'Pricing depends on the type of cleaning and the degree of dirt. Please provide more details to get a better estimate.';
        } else if (lower.includes('location') || lower.includes('address')) {
            return 'We serve Tuzla and nearby towns like Živinice, Lukavac, and Kalesija. Let me know where you are located.';
        } else {
            return "I'm here to help with questions about our cleaning services, contact options, and booking. Could you please rephrase your question?";
        }
    }

    // Enter key to send
    inputEl.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
        if (!popup.contains(e.target) && !icon.contains(e.target)) {
            popup.classList.remove('open');
        }
    });

    // Make functions global for onclick
    window.toggleChat = toggleChat;
    window.sendMessage = sendMessage;
    window.setThemeColor = setTheme;
    window.setLanguage = setLanguage;
})();