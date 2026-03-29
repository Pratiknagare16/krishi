(() => {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    // Theme is managed by auth-guard.js — nothing to do here.

    // --- Language & i18n ---
    const translations = {
        en: {
            nav_dashboard: "Dashboard", nav_pest: "Pest Detection", nav_crop: "Crop Advisory",
            guest_farmer: "Guest Farmer", free_plan: "Free plan",
            session_history: "Session History", session_empty: "No sessions yet", session_loading: "Loading…",
            pest_title: "Pest Detection", pest_desc: "Upload a photo and describe the symptoms — AI will identify the pest and suggest remedies.", pest_placeholder: "Describe the symptoms (e.g., yellow spots on leaves)…",
            crop_title: "Crop Advisory", crop_desc: "Describe what's wrong with your crop or ask anything — AI gives you actionable advice.", crop_placeholder: "Describe your crop issue (e.g., rice leaves turning yellow)…",
            dash_welcome: "Welcome, Farmer!", dash_status: "Your crop advisory overview.",
            dash_stat_pest: "Pest Scans", dash_stat_crop: "Crop Advices", dash_stat_sessions: "Total Sessions",
            dash_action_pest: "New Pest Scan", dash_action_pest_desc: "AI-powered insect & disease identification",
            dash_action_crop: "Ask Advisory", dash_action_crop_desc: "Get instant help for your crop health"
        },
        hi: {
            nav_dashboard: "डैशबोर्ड", nav_pest: "कीट पहचान", nav_crop: "फसल सलाह",
            guest_farmer: "अतिथि किसान", free_plan: "मुफ़्त योजना",
            session_history: "सत्र इतिहास", session_empty: "अभी तक कोई सत्र नहीं", session_loading: "लोड हो रहा है…",
            pest_title: "कीट पहचान", pest_desc: "एक तस्वीर अपलोड करें और लक्षणों का वर्णन करें — AI कीट की पहचान करेगा और उपाय सुझाएगा।", pest_placeholder: "लक्षणों का वर्णन करें (जैसे, पत्तियों पर पीले धब्बे)…",
            crop_title: "फसल सलाह", crop_desc: "अपनी फसल के बारे में कुछ भी पूछें — AI आपको कार्रवाई योग्य सलाह देगा।", crop_placeholder: "फसल की समस्या का वर्णन करें…",
            dash_welcome: "आपका स्वागत है, किसान!", dash_status: "आपकी फसल सलाह का अवलोकन।",
            dash_stat_pest: "कीट स्कैन", dash_stat_crop: "फसल सलाह", dash_stat_sessions: "कुल सत्र",
            dash_action_pest: "नया कीट स्कैन", dash_action_pest_desc: "AI-संचालित कीट और रोग पहचान",
            dash_action_crop: "सलाह लें", dash_action_crop_desc: "फसल स्वास्थ्य के लिए तुरंत मदद"
        },
        mr: {
            nav_dashboard: "डॅशबोर्ड", nav_pest: "कीड ओळख", nav_crop: "पीक सल्ला",
            guest_farmer: "अतिथी शेतकरी", free_plan: "मोफत योजना",
            session_history: "सत्र इतिहास", session_empty: "अद्याप कोणतेही सत्र नाही", session_loading: "लोड करत आहे…",
            pest_title: "कीड ओळख", pest_desc: "फोटो अपलोड करा आणि लक्षणे सांगा — AI कीड ओळखेल आणि उपाय सुचवेल.", pest_placeholder: "लक्षणे सांगा (उदा., पानांवर पिवळे डाग)…",
            crop_title: "पीक सल्ला", crop_desc: "तुमच्या पिकाची समस्या सांगा किंवा काहीही विचारा — AI तुम्हाला योग्य सल्ला देईल.", crop_placeholder: "पिकाच्या समस्येचे वर्णन करा…",
            dash_welcome: "स्वागत आहे, शेतकरी!", dash_status: "आपला पीक सल्ला आढावा.",
            dash_stat_pest: "कीड स्कॅन", dash_stat_crop: "पीक सल्ले", dash_stat_sessions: "एकूण सत्रे",
            dash_action_pest: "नवीन कीड स्कॅन", dash_action_pest_desc: "AI-आधारित कीड आणि रोग ओळख",
            dash_action_crop: "सल्ला घ्या", dash_action_crop_desc: "पिकांच्या आरोग्यासाठी त्वरित मदत"
        },
        ta: {
            nav_dashboard: "கட்டுப்பாட்டகம்", nav_pest: "பூச்சி கண்டறிதல்", nav_crop: "பயிர் ஆலோசனை",
            guest_farmer: "விருந்தினர் விவசாயி", free_plan: "இலவச திட்டம்",
            session_history: "அமர்வு வரலாறு", session_empty: "அமர்வுகள் இல்லை", session_loading: "ஏற்றுகிறது…",
            pest_title: "பூச்சி கண்டறிதல்", pest_desc: "புகைப்படத்தை பதிவேற்றி அறிகுறிகளை விவரிக்கவும் — AI பூச்சியை கண்டறிந்து தீர்வுகளை பரிந்துரைக்கும்.", pest_placeholder: "அறிகுறிகளை விவரிக்கவும்…",
            crop_title: "பயிர் ஆலோசனை", crop_desc: "உங்கள் பயிர் பிரச்சினையை விவரிக்கவும் — AI உங்களுக்கு ஆலோசனை வழங்கும்.", crop_placeholder: "உங்கள் பயிர் பிரச்சினையை விவரிக்கவும்…",
            dash_welcome: "வரவேற்கிறோம், விவசாயி!", dash_status: "உங்கள் பயிர் ஆலோசனை கண்ணோட்டம்.",
            dash_stat_pest: "பூச்சி ஸ்கேன்", dash_stat_crop: "பயிர் ஆலோசனைகள்", dash_stat_sessions: "மொத்த அமர்வுகள்",
            dash_action_pest: "புதிய பூச்சி ஸ்கேன்", dash_action_pest_desc: "AI-இயங்கும் பூச்சி மற்றும் நோய் கண்டறிதல்",
            dash_action_crop: "ஆலோசனை கேள்", dash_action_crop_desc: "பயிர் ஆரோக்கியத்திற்கு உடனடி உதவி"
        },
        te: {
            nav_dashboard: "డాష్‌బోర్డ్", nav_pest: "తెగులు గుర్తింపు", nav_crop: "పంట సలహా",
            guest_farmer: "అతిథి రైతు", free_plan: "ఉచిత ప్లాన్",
            session_history: "సెషన్ చరిత్ర", session_empty: "ఇంకా సెషన్లు లేవు", session_loading: "లోడ్ అవుతోంది…",
            pest_title: "తెగులు గుర్తింపు", pest_desc: "ఫోటోను అప్‌లోడ్ చేసి లక్షణాలను వివరించండి — AI తెగులును గుర్తించి నివారణను సూచిస్తుంది.", pest_placeholder: "లక్షణాలను వివరించండి…",
            crop_title: "పంట సలహా", crop_desc: "మీ పంట సమస్యను వివరించండి లేదా ఏదైనా అడగండి — AI మీకు తగిన సలహా ఇస్తుంది.", crop_placeholder: "మీ పంట సమస్యను వివరించండి…",
            dash_welcome: "స్వాగతం, రైతు!", dash_status: "మీ పంట సలహా అవలోకనం.",
            dash_stat_pest: "తెగులు స్కాన్‌లు", dash_stat_crop: "పంట సలహాలు", dash_stat_sessions: "మొత్తం సెషన్లు",
            dash_action_pest: "కొత్త తెగులు స్కాన్", dash_action_pest_desc: "AI-ఆధారిత కీటక మరియు వ్యాధి గుర్తింపు",
            dash_action_crop: "సలహా తీసుకోండి", dash_action_crop_desc: "పంట ఆరోగ్యం కోసం తక్షణ సహాయం"
        }
    };

    function translateUI(lang) {
        const dict = translations[lang] || translations['en'];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
                    el.placeholder = dict[key];
                } else if (el.childNodes.length && el.childNodes[0].nodeType === Node.TEXT_NODE) {
                    // Replace the first text node so we don't destroy icons like <span>🪲</span>
                    el.childNodes[0].textContent = dict[key];
                } else {
                    el.textContent = dict[key];
                }
            }
        });
    }

    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        const currentLang = localStorage.getItem('krishi_language') || 'en';
        langSelect.value = currentLang;
        translateUI(currentLang);
        
        langSelect.addEventListener('change', (e) => {
            const newLang = e.target.value;
            localStorage.setItem('krishi_language', newLang);
            translateUI(newLang);
        });
    }

    // --- Sidebar toggle ---
    sidebarToggle?.addEventListener('click', () => {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            sidebar.classList.toggle('open');
        } else {
            sidebar.classList.toggle('collapsed');
        }
    });

    sidebarOverlay?.addEventListener('click', () => sidebar.classList.remove('open'));

    // --- Live date ---
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    // --- Load sessions from the API ---
    async function loadSessions() {
        const list = document.getElementById('sessionsList');
        const statSessions = document.getElementById('statSessions');

        try {
            const res = window.authFetch ? await window.authFetch('/sessions') : await fetch('/sessions');
            if (!res.ok) throw new Error('Failed to fetch');
            const sessions = await res.json();

            if (statSessions) statSessions.textContent = sessions.length;

            if (!sessions.length) {
                list.innerHTML = `<div class="empty-state"><span>📭</span>No sessions yet. Start a crop or pest scan!</div>`;
                return;
            }

            list.innerHTML = sessions.map(s => {
                const date = new Date(s.created_at).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                const shortId = s.id.slice(0, 8);
                return `
                    <div class="session-item">
                        <div class="session-info">
                            <div class="session-dot"></div>
                            <div>
                                <div class="session-id">Session #${shortId}</div>
                                <div class="session-date">${date}</div>
                            </div>
                        </div>
                        <a href="/crop-advisory?session_id=${s.id}" class="session-link">View →</a>
                    </div>`;
            }).join('');
        } catch {
            list.innerHTML = `<div class="empty-state"><span>⚠️</span>Couldn't load sessions. Is the server running?</div>`;
        }
    }

    // --- Weather Module Logic ---
    const weatherMenu = document.getElementById('nav-weather');
    const mainColArea = document.querySelector('.col-primary');
    const headerTitle = document.querySelector('.page-header h1');

    if (weatherMenu && mainColArea) {
        weatherMenu.addEventListener('click', async (e) => {
            if(e) e.preventDefault();
            
            // Highlight active menu
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            weatherMenu.classList.add('active');
            
            // Adjust header
            if (headerTitle) headerTitle.textContent = "Weather Forecast 🌦️";
            
            // Render loading state
            mainColArea.innerHTML = `
                <div class="weather-module">
                    <div class="weather-header">
                        <div class="weather-search">
                            <input type="text" id="weatherCityInput" placeholder="Search city..." value="${localStorage.getItem('weather_last_city') || ''}">
                            <button id="weatherSearchBtn">Search</button>
                            <button id="weatherLocationBtn" title="Use my location">📍</button>
                        </div>
                    </div>
                    <div class="empty-state" id="weatherLoader">
                        <span>⏳</span>
                        <span>Loading Weather Data...</span>
                    </div>
                    <div id="weatherContentArea"></div>
                </div>
            `;

            // Setup listeners inside the new DOM
            document.getElementById('weatherSearchBtn').addEventListener('click', () => {
                const city = document.getElementById('weatherCityInput').value.trim();
                if (city) {
                    localStorage.setItem('weather_last_city', city);
                    loadWeather(city, null, null);
                }
            });
            document.getElementById('weatherLocationBtn').addEventListener('click', () => {
                if (navigator.geolocation) {
                    document.getElementById('weatherLoader').style.display = 'block';
                    document.getElementById('weatherContentArea').innerHTML = '';
                    navigator.geolocation.getCurrentPosition(
                        (pos) => loadWeather(null, pos.coords.latitude, pos.coords.longitude),
                        (err) => { alert("Location access denied."); document.getElementById('weatherLoader').style.display = 'none'; }
                    );
                }
            });

            // Initial Load
            const lastCity = localStorage.getItem('weather_last_city');
            if (lastCity) {
                loadWeather(lastCity, null, null);
            } else {
                loadWeather("New Delhi", null, null);
            }
        });

        // Auto-open weather if URL explicitly requests it
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('view') === 'weather') {
            weatherMenu.click();
        }
    }

    async function loadWeather(city, lat, lon) {
        const loader = document.getElementById('weatherLoader');
        const contentArea = document.getElementById('weatherContentArea');
        if (!loader || !contentArea) return;

        loader.style.display = 'block';
        contentArea.innerHTML = '';
        
        try {
            let url = '';
            if (lat && lon) {
                url = `/api/weather/coords?lat=${lat}&lon=${lon}`;
            } else {
                url = `/api/weather/city?q=${encodeURIComponent(city)}`;
            }

            const res = window.authFetch ? await window.authFetch(url) : await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch weather');
            
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            renderWeather(data, contentArea);
        } catch (error) {
            console.error(error);
            contentArea.innerHTML = `
                <div class="empty-state" style="color: red;">
                    <span>⚠️</span>
                    <span>Failed to load weather data. Please try again.</span>
                </div>
            `;
        } finally {
            loader.style.display = 'none';
        }
    }

    function renderWeather(data, container) {
        const current = data.current || {};
        const daily = data.forecast_5day || [];
        const hourly = data.hourly_forecast || [];

        const fiveDayHTML = daily.map(day => `
            <div class="w-day-item">
                <div class="w-day-date">${new Date(day.date).toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric'})}</div>
                <div class="w-day-cond">${day.condition}</div>
                <div class="w-day-temps">${Math.round(day.min_temp)}° / ${Math.round(day.max_temp)}°</div>
            </div>
        `).join('');

        const hourlyHTML = hourly.map(hour => {
            const timeStr = new Date(hour.time).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'});
            return `
            <div class="w-hour-item">
                <div class="w-hour-time">${timeStr}</div>
                <div class="w-hour-temp">${Math.round(hour.temp)}°</div>
                <div class="w-hour-cond">${hour.condition}</div>
            </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="weather-current">
                <div class="weather-current-main">
                    <h2>${data.city}</h2>
                    <p>Current Conditions • ${current.condition}</p>
                    <div class="weather-temp">${Math.round(current.temperature)}°C</div>
                </div>
                <div class="weather-details-grid">
                    <div class="w-detail">
                        <span>Humidity</span>
                        <span>${current.humidity}%</span>
                    </div>
                    <div class="w-detail">
                        <span>Wind</span>
                        <span>${current.wind_speed} km/h</span>
                    </div>
                </div>
            </div>

            <div class="weather-forecasts">
                <div class="w-panel">
                    <h3>Hourly Forecast (24h)</h3>
                    <div class="w-hourly-scroll">
                        ${hourlyHTML}
                    </div>
                </div>
                <div class="w-panel">
                    <h3>5-Day Forecast</h3>
                    <div class="w-5day-list">
                        ${fiveDayHTML}
                    </div>
                </div>
            </div>
        `;
    }

    loadSessions();
})();
