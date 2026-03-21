// digital-skills.js - Logic for the Digital Skills Mentor AI

document.addEventListener('DOMContentLoaded', () => {

    const btnBack = document.getElementById('btn-back');
    const chatHistory = document.getElementById('chat-history');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const typingIndicator = document.getElementById('typing-indicator');

    // Navigation back to dashboard
    btnBack.addEventListener('click', () => {
        window.location.href = 'student-dashboard.html';
    });

    // Helper to start a track from the UI cards
    window.startTrack = function (trackName) {
        let msg = `I want to start learning ${trackName}. What project should we build?`;
        chatInput.value = msg;
        chatForm.dispatchEvent(new Event('submit'));
    };

    // --- AI Chat Logic ---

    // Initial Welcome Message
    setTimeout(() => {
        appendMessage('ai', "Welcome to the IT Studio! I am your AI Digital Skills Mentor. Are you ready to dive into MS Office, Graphic Design, or Video Editing today?");
    }, 500);

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        // Display user message
        appendMessage('user', text);
        chatInput.value = '';

        // Trigger AI thinking state
        chatHistory.appendChild(typingIndicator);
        typingIndicator.style.display = 'flex';
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // Call the Central AI Service mapping to the Digital Skills Master Prompt
        if (typeof AIService !== 'undefined') {
            AIService.askDigitalSkills(text).then(response => {
                typingIndicator.style.display = 'none';
                chatHistory.appendChild(typingIndicator); // put it back at bottom
                appendMessage('ai', response);
            });
        } else {
            console.error("AIService not found! Did you include ai-service.js?");
            typingIndicator.style.display = 'none';
            appendMessage('ai', "Error connecting to AI Server.");
        }
    });

    function appendMessage(sender, text) {
        const div = document.createElement('div');
        div.className = `chat-msg ${sender === 'ai' ? 'msg-ai' : 'msg-user'}`;
        div.innerHTML = text.replace(/\n/g, '<br>');

        // Insert before typing indicator
        chatHistory.insertBefore(div, typingIndicator);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

});
