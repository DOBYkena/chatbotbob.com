
console.log("JavaScript je uspješno povezan i radi!");

const skriveniElementi = document.querySelectorAll('.skriveno');


const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
       
        if (entry.isIntersecting) {
            entry.target.classList.add('prikazano'); 
            observer.unobserve(entry.target); 
        }
    });
}, {
    threshold: 0.1 
});


skriveniElementi.forEach((el) => observer.observe(el));

const modal = document.getElementById("rezervacija-modal");
const btnOtvori = document.getElementById("otvori-rezervaciju");
const btnZatvori = document.querySelector(".zatvori-modal");
const forma = document.getElementById("forma-kalendar");

if (btnOtvori) {
    btnOtvori.addEventListener("click", function(e) {
        e.preventDefault(); 
        if (modal) modal.style.display = "flex";
    });
}

if (btnZatvori) {
    btnZatvori.addEventListener("click", function() {
        if (modal) modal.style.display = "none";
    });
}

window.addEventListener("click", function(e) {
    if (modal && e.target === modal) {
        modal.style.display = "none";
    }
});

if (forma) {
    forma.addEventListener("submit", function(e) {
        e.preventDefault(); 

        // Get reCAPTCHA token
        grecaptcha.ready(function() {
            grecaptcha.execute('6Ldf_LMsAAAAAMkk0kEcs7ZpcfwQlJP4lxZolHP1', {action: 'submit'}).then(function(token) {
                const datum = document.getElementById('datum').value;
                const vrijeme = document.getElementById('vrijeme').value;

                // Verify token on backend
                fetch('/api/verify-recaptcha', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: token })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.score > 0.5) {
                        // reCAPTCHA passed, send email
                        const poruka = `Pozdrav! Zainteresovan/a sam za probni demo BOB chatbota.\n\n📅 Datum: ${datum}\n⏰ Vrijeme: ${vrijeme}\n\nMolim vas da mi potvrdite termin za kratku on-line prezentaciju.`;
                        const contactEmail = "ikinic.kenan99@gmail.com";
                        const mailtoUrl = `mailto:${contactEmail}?subject=${encodeURIComponent('Zahjev za demo BOB chatbota')}&body=${encodeURIComponent(poruka)}`;

                        window.location.href = mailtoUrl;
                        if (modal) modal.style.display = "none";
                        forma.reset();
                    } else {
                        alert('Sigurnosna provjera nije prošla. Pokušajte ponovo.');
                    }
                })
                .catch(error => {
                    console.error('reCAPTCHA verification error:', error);
                    alert('Greška pri sigurnosnoj provjeri. Pokušajte ponovo.');
                });
            });
        });
    });
}



flatpickr("#datum", {
    locale: "bs",           
    dateFormat: "d.m.Y",    
    minDate: "today",       
    disableMobile: true    
});


flatpickr("#vrijeme", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
    disableMobile: true,
    static: true,
    minTime: "08:00",
    maxTime: "18:00",
    minuteIncrement: 30,
  
    plugins: [
        new confirmDatePlugin({
            confirmText: "POTVRDI", 
            showAlways: true,       
            theme: "light" 
        })
    ]
});

const chatbotLauncher = document.getElementById("chatbot-launcher");
const chatbotPanel = document.getElementById("chatbot-panel");
const chatbotClose = document.getElementById("chatbot-close");

const demoButton = document.getElementById('demo-open-button');

function openBotFromDemo(e) {
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }

    // Create and show arrow
    let arrow = document.getElementById('demo-arrow');
    if (!arrow) {
        arrow = document.createElement('div');
        arrow.id = 'demo-arrow';
        arrow.className = 'demo-arrow';
        arrow.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="#0056b3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
        `;
        document.body.appendChild(arrow);
    }
    arrow.classList.add('show');

    // Show widget after arrow appears
    setTimeout(() => {
        const widget = document.getElementById('chat-bot-widget');
        if (widget) {
            widget.style.opacity = '1';
            widget.style.pointerEvents = 'auto';
        }
    }, 300);

    // Open chat after widget is visible
    setTimeout(() => {
        const openChat = () => {
            if (typeof window.toggleChat === 'function') {
                window.toggleChat();
                return true;
            }

            const botIcon = document.querySelector('.chat-bot-icon');
            if (botIcon && botIcon.style.opacity !== '0') {
                botIcon.click();
                return true;
            }

            const popup = document.querySelector('.chat-bot-popup');
            if (popup) {
                popup.classList.add('open');
                return true;
            }

            return false;
        };

        if (!openChat()) {
            const retry = setInterval(() => {
                if (openChat()) {
                    clearInterval(retry);
                }
            }, 200);
        }

        // Remove arrow after opening
        arrow.classList.remove('show');
    }, 600);
}
window.openBotFromDemo = openBotFromDemo;

if (demoButton) {
    demoButton.addEventListener('click', openBotFromDemo);
}

if (chatbotLauncher && chatbotPanel && chatbotClose) {
    chatbotLauncher.addEventListener("click", function() {
        chatbotPanel.classList.toggle("visible");
    });

    chatbotClose.addEventListener("click", function() {
        chatbotPanel.classList.remove("visible");
    });

    window.addEventListener("click", function(event) {
        if (!chatbotPanel.contains(event.target) && !chatbotLauncher.contains(event.target)) {
            chatbotPanel.classList.remove("visible");
        }
    });
}
