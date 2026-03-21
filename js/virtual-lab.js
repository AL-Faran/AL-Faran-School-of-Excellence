// virtual-lab.js - Controls the PhET iframe integration and the Simulated AI Chat Assistant

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const btnBack = document.getElementById('btn-back');
    const subjectBtns = document.querySelectorAll('.subject-btn');
    const currentLabTitle = document.getElementById('current-lab-title');
    const simFrame = document.getElementById('sim-frame');
    const simLoader = document.getElementById('sim-loader');

    // AI Elements
    const chatHistory = document.getElementById('chat-history');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const typingIndicator = document.getElementById('typing-indicator');
    const quickPromptsContainer = document.getElementById('quick-prompts-container');
    const modeAskBtn = document.getElementById('mode-ask');
    const modeGuideBtn = document.getElementById('mode-guide');

    // --- Knowledge Base for PhET Simulations & AI ---
    // In a production environment, you would swap out the simulateAIResponse logic with a real fetch() to OpenAI/Gemini API via a Node backend.

    const LAB_DATA = {
        'physics': {
            title: 'DC Circuit Construction',
            url: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc-virtual-lab/latest/circuit-construction-kit-dc-virtual-lab_en.html',
            welcome: "Hello! I am your Physics Lab Assistant. Today we are building DC circuits. Drag a battery, wire, and bulb to construct a loop. How can I help?",
            taskTitle: "Task: Build a Simple Circuit",
            taskDesc: "Challenge: Drag one battery, two wires, and one bulb onto the screen. Connect them in a circle to make the bulb light up!",
            quickPrompts: ["Why isn't my bulb glowing?", "What is Voltage?", "Explain parallel vs series circuits."]
        },
        'chemistry': {
            title: 'Acid-Base Solutions',
            url: 'https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_en.html',
            welcome: "Welcome to the Chemistry Lab! We're exploring Acids and Bases. You can measure pH or dip litmus paper into the solutions. What would you like to know?",
            taskTitle: "Task: Measure Strong vs Weak Acids",
            taskDesc: "Challenge: Select 'Strong Acid'. Dip the pH meter in the liquid. Then switch to 'Weak Acid' and compare the pH numbers. What changes?",
            quickPrompts: ["What is pH?", "Why does the color change?", "What makes an acid 'strong'?"]
        },
        'biology': {
            title: 'Natural Selection',
            url: 'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_en.html',
            welcome: "Welcome to the Biology Lab! Let's explore evolution. Add mutations to the bunnies and change the environment (wolves, food). What shall we investigate?",
            taskTitle: "Task: Survive the Wolves",
            taskDesc: "Challenge: Add a 'Brown Fur' mutation for the bunnies. Then change the environment straight to 'Equator' and add wolves. Notice how brown fur becomes an advantage!",
            quickPrompts: ["What is a mutation?", "Why did the white bunnies die?", "Explain natural selection."]
        }
    };

    let currentSubject = 'physics';
    let currentMode = 'ask'; // 'ask' or 'guide'

    // --- Navigation Logic ---
    btnBack.addEventListener('click', () => {
        window.location.href = 'student-dashboard.html';
    });

    // Subject Switching
    subjectBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update UI
            subjectBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');

            currentSubject = e.currentTarget.getAttribute('data-subject');
            loadLab(currentSubject);
        });
    });

    function loadLab(subject) {
        const data = LAB_DATA[subject];
        currentLabTitle.innerText = data.title;

        // Load iFrame
        simLoader.style.opacity = '1';
        simLoader.style.pointerEvents = 'all';
        simFrame.src = data.url;

        simFrame.onload = () => {
            setTimeout(() => {
                simLoader.style.opacity = '0';
                simLoader.style.pointerEvents = 'none';
            }, 500); // slight delay for smooth transition
        };

        // Reset Chat
        chatHistory.innerHTML = '';
        renderQuickPrompts();

        if (currentMode === 'ask') {
            appendMessage('ai', data.welcome);
        } else {
            promptGuidedTask();
        }
    }

    // --- AI Chat Logic ---

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

        // Trigger AI Service
        AIService.askScienceLab(text, { subject: currentSubject })
            .then(response => {
                typingIndicator.style.display = 'none';
                chatHistory.appendChild(typingIndicator); // put it back at bottom for next time
                appendMessage('ai', response);
            });
    });

    function appendMessage(sender, text) {
        const div = document.createElement('div');
        div.className = `chat-msg ${sender === 'ai' ? 'msg-ai' : 'msg-user'}`;
        div.innerHTML = text.replace(/\n/g, '<br>');

        // Insert before typing indicator
        chatHistory.insertBefore(div, typingIndicator);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function renderQuickPrompts() {
        quickPromptsContainer.innerHTML = '';
        if (currentMode === 'guide') return; // no prompts in guide mode

        const prompts = LAB_DATA[currentSubject].quickPrompts;
        prompts.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'quick-prompt-btn';
            btn.type = 'button';
            btn.innerText = p;
            btn.onclick = () => {
                chatInput.value = p;
                chatForm.dispatchEvent(new Event('submit'));
            };
            quickPromptsContainer.appendChild(btn);
        });
    }

    modeAskBtn.addEventListener('click', () => {
        currentMode = 'ask';
        modeAskBtn.classList.add('active');
        modeGuideBtn.classList.remove('active');

        chatHistory.innerHTML = '';
        renderQuickPrompts();
        appendMessage('ai', LAB_DATA[currentSubject].welcome);
    });

    modeGuideBtn.addEventListener('click', () => {
        currentMode = 'guide';
        modeGuideBtn.classList.add('active');
        modeAskBtn.classList.remove('active');

        chatHistory.innerHTML = '';
        renderQuickPrompts();
        promptGuidedTask();
    });

    function promptGuidedTask() {
        const data = LAB_DATA[currentSubject];
        const taskHTML = `
            <div class="guided-task-card">
                <h4 style="color: var(--ai-primary); margin: 0 0 10px 0;">${data.taskTitle}</h4>
                <p style="margin: 0; font-size: 0.9rem;">${data.taskDesc}</p>
            </div>
            <p style="font-size: 0.9rem;">Once you finish, tell me what happened in the chat below!</p>
        `;
        appendMessage('ai', taskHTML);
    }

    // Initialize logic
    loadLab(currentSubject);

});
