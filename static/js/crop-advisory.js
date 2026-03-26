(() => {
    const els = {
        plusBtn: document.getElementById('plusBtn'),
        imageInput: document.getElementById('imageInput'),
        imagePreview: document.getElementById('imagePreview'),
        previewImg: document.getElementById('previewImg'),
        removeImage: document.getElementById('removeImage'),
        textInput: document.getElementById('textInput'),
        diagnoseBtn: document.getElementById('diagnoseBtn'),
        resultsPlaceholder: document.getElementById('resultsPlaceholder'),
        resultsContent: document.getElementById('resultsContent'),
        historyList: document.getElementById('historyList'),
        sessionCount: document.getElementById('sessionCount'),
    };

    let selectedFile = null;
    let currentSessionId = localStorage.getItem('crop_session_id') || null;

    // --- UI Interactions ---
    els.plusBtn.addEventListener('click', () => els.imageInput.click());

    els.imageInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file?.type.startsWith('image/')) return;
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = ev => {
            els.previewImg.src = ev.target.result;
            els.imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });

    els.removeImage.addEventListener('click', e => {
        e.preventDefault();
        selectedFile = null;
        els.imageInput.value = '';
        els.imagePreview.style.display = 'none';
        els.previewImg.src = '';
    });

    els.textInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 140) + 'px';
        this.style.overflowY = this.scrollHeight > 140 ? 'auto' : 'hidden';
    });

    els.textInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            els.diagnoseBtn.click();
        }
    });

    // --- Core API Logic ---
    els.diagnoseBtn.addEventListener('click', async () => {
        const query = els.textInput.value.trim();
        if (!selectedFile && !query) {
            els.textInput.focus();
            return;
        }

        // Hide placeholder, ensure clear chat log container if empty
        els.resultsPlaceholder.style.display = 'none';
        els.resultsContent.style.display = 'flex';
        els.resultsContent.classList.add('chat-log');

        // Track file before clearing state
        const fileToUpload = selectedFile;

        // Optimistic UI: append user message but keep a ref for rollback on failure
        const userMsg = query || "[Image Uploaded]";
        const userBubble = appendMessage('user', userMsg);
        
        // Reset inputs immediately for good UX
        els.textInput.value = '';
        els.textInput.style.height = 'auto';
        selectedFile = null;
        els.imagePreview.style.display = 'none';
        els.imageInput.value = '';

        setLoading(true);

        const formData = new FormData();
        formData.append('query', query || 'Analyze this crop condition.');
        if (fileToUpload) formData.append('crop_image', fileToUpload);
        if (currentSessionId) formData.append('session_id', currentSessionId);

        const savedLang = localStorage.getItem('krishi_language') || 'en';
        formData.append('language', savedLang);

        try {
            const apiRes = window.authFetch ? await window.authFetch('/analyze-crop', { method: 'POST', body: formData }) : await fetch('/analyze-crop', { method: 'POST', body: formData });
            const data = await apiRes.json();
            if (!apiRes.ok || !data.advice) throw new Error(data.error || 'Analysis failed');
            
            // Save session
            currentSessionId = data.session_id;
            localStorage.setItem('crop_session_id', currentSessionId);
            
            removeLoading();
            appendMessage('ai', data.advice);
            loadHistoryPanel();
        } catch (err) {
            removeLoading();
            // Roll back the optimistic user message bubble
            if (userBubble && userBubble.parentNode) userBubble.remove();
            appendMessage('error', '⚠️ ' + (err.message || 'Something went wrong. Please try again.'));
        }
    });

    function appendMessage(role, content) {
        const div = document.createElement('div');
        div.className = `chat-bubble chat-bubble--${role}`;
        div.innerHTML = role === 'ai' ? formatMarkdown(content) : escapeHTML(content);
        els.resultsContent.appendChild(div);
        
        // Auto-scroll to bottom
        const panel = els.resultsContent.parentElement;
        panel.scrollTo({ top: panel.scrollHeight, behavior: 'smooth' });
        return div;
    }

    function setLoading(on) {
        els.diagnoseBtn.disabled = on;
        els.diagnoseBtn.innerHTML = on ? '⏳' : '➤';
        if (on) {
            const div = document.createElement('div');
            div.className = 'chat-bubble chat-bubble--ai typing-indicator';
            div.id = 'loadingBubble';
            div.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div> analyzing…`;
            els.resultsContent.appendChild(div);
            const panel = els.resultsContent.parentElement;
            panel.scrollTo({ top: panel.scrollHeight, behavior: 'smooth' });
        }
    }

    function removeLoading() {
        const loading = document.getElementById('loadingBubble');
        if (loading) loading.remove();
        els.diagnoseBtn.disabled = false;
        els.diagnoseBtn.style.opacity = '1';
        els.diagnoseBtn.innerHTML = '➤';
    }

    function formatMarkdown(text) {
        return text
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
            .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>\n?)+/g, match => `<ul>${match}</ul>`)
            .replace(/\n\n+/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag]));
    }

    // --- Session History Fetching ---
    async function loadHistoryPanel() {
        try {
            const res = window.authFetch ? await window.authFetch('/sessions') : await fetch('/sessions');
            if (!res.ok) throw new Error();
            const sessions = await res.json();

            if (els.sessionCount) els.sessionCount.textContent = sessions.length;

            if (!sessions.length) {
                els.historyList.innerHTML = `<div class="empty-state"><span>📭</span>No sessions yet</div>`;
                return;
            }

            els.historyList.innerHTML = sessions.map(s => {
                const date = new Date(s.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                });
                const isActive = s.id === currentSessionId ? 'active' : '';
                return `
                    <div class="history-item ${isActive}" data-id="${s.id}">
                        <div class="history-item-id">Session #${s.id.slice(0, 8)}</div>
                        <div class="history-item-date">${date}</div>
                    </div>`;
            }).join('');

            // Click on history items to load past sessions
            document.querySelectorAll('.history-item').forEach(item => {
                item.addEventListener('click', () => {
                    const sid = item.dataset.id;
                    if (sid !== currentSessionId) {
                        currentSessionId = sid;
                        localStorage.setItem('crop_session_id', sid);
                        loadSessionMessages(sid);
                        loadHistoryPanel(); // Refresh active state
                    }
                });
            });
        } catch {
            els.historyList.innerHTML = `<div class="empty-state"><span>⚠️</span>Failed to load</div>`;
        }
    }

    async function loadSessionMessages(sessionId) {
        try {
            const res = window.authFetch ? await window.authFetch(`/sessions/${sessionId}/messages`) : await fetch(`/sessions/${sessionId}/messages`);
            if (!res.ok) throw new Error();
            const messages = await res.json();
            
            els.resultsPlaceholder.style.display = 'none';
            els.resultsContent.style.display = 'flex';
            els.resultsContent.classList.add('chat-log');
            els.resultsContent.innerHTML = ''; // clear

            messages.forEach(msg => {
                appendMessage(msg.role === 'model' ? 'ai' : 'user', msg.content);
            });
            
            // Scroll to bottom
            const panel = els.resultsContent.parentElement;
            panel.scrollTo({ top: panel.scrollHeight, behavior: 'instant' });
            
        } catch {
            // If session not found or error, just clear it
            localStorage.removeItem('crop_session_id');
            currentSessionId = null;
            els.resultsContent.innerHTML = '';
            els.resultsContent.style.display = 'none';
            els.resultsPlaceholder.style.display = 'flex';
            loadHistoryPanel();
        }
    }

    // Initialize
    loadHistoryPanel();
    if (currentSessionId) {
        loadSessionMessages(currentSessionId);
    }
})();
