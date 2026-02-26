const chatBox = document.getElementById('chat-box');
const input = document.getElementById('user-input');
const themeIcon = document.getElementById('theme-icon');

// --- 1. Initialization & Theme Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Load Chat History
    const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    if (history.length > 0) {
        // Clear default welcome message if history exists
        chatBox.innerHTML = '';
        history.forEach(msg => appendMessage(msg.sender, msg.text, false));
    }
});

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

// --- 2. Chat Logic ---
async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto'; // Reset height
    appendMessage('user', text, true);

    // Show Loading Animation
    const loadingId = appendLoading();

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await response.json();

        removeLoading(loadingId);
        appendMessage('bot', data.reply, true);
    } catch (error) {
        removeLoading(loadingId);
        appendMessage('bot', "⚠️ Connection Error. Please try again.", false);
    }
}

function appendMessage(sender, text, save) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    
    const icon = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
    
    // Convert newlines to breaks for display
    const formattedText = text.replace(/\n/g, '<br>');

    msgDiv.innerHTML = `
        <div class="avatar">${icon}</div>
        <div class="message-content">${formattedText}</div>
    `;

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    if (save) saveHistory(sender, text);
}

function appendLoading() {
    const id = 'loader-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message bot';
    msgDiv.id = id;
    msgDiv.innerHTML = `
        <div class="avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="message-content">
            <i class="fa-solid fa-circle-notch fa-spin"></i> Thinking...
        </div>
    `;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

function removeLoading(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function saveHistory(sender, text) {
    const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    history.push({ sender, text });
    localStorage.setItem('chatHistory', JSON.stringify(history));
}

function clearChat() {
    localStorage.removeItem('chatHistory');
    chatBox.innerHTML = `
        <div class="message bot">
            <div class="avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="message-content">Chat history cleared.</div>
        </div>
    `;
}

function handleEnter(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
}