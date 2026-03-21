// daily-challenge.js - Triggers the "AI Science Challenge" every 24 hours on the student dashboard

document.addEventListener('DOMContentLoaded', () => {

    // Dependency check for ai-service.js
    if (typeof AIService === 'undefined') {
        console.error("AIService is not loaded. Cannot fetch Daily Challenge.");
        return;
    }

    // Modal UI Injection
    const modalHTML = `
        <div id="daily-challenge-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
            <div style="background: var(--surface-color); width: 90%; max-width: 500px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); animation: popIn 0.3s ease-out;">
                
                <div style="background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 20px; text-align: center; position: relative;">
                    <i class="fas fa-rocket fa-3x mb-2" style="opacity: 0.9;"></i>
                    <h2 style="margin: 0; font-size: 1.5rem;" id="dc-title">Daily Challenge</h2>
                    <button id="dc-close-top" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; opacity: 0.7;"><i class="fas fa-times"></i></button>
                </div>
                
                <div style="padding: 25px;">
                    <p style="font-weight: 500; font-size: 1.1rem; color: var(--text-color); margin-bottom: 20px; line-height: 1.6;" id="dc-text">
                        Loading challenge...
                    </p>
                    
                    <div style="margin-bottom: 20px;">
                        <textarea id="dc-answer" placeholder="Type your answer here..." style="width: 100%; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px; font-family: inherit; resize: vertical; min-height: 80px;"></textarea>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--warning-color); font-weight: bold;"><i class="fas fa-star"></i> <span id="dc-points">10</span> XP</span>
                        <button id="dc-submit" class="btn btn-primary" style="background: #e74c3c; border: none;"><i class="fas fa-paper-plane mr-2"></i> Submit Answer</button>
                    </div>
                </div>

                <!-- Success Overlay -->
                <div id="dc-success" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: var(--surface-color); align-items: center; justify-content: center; flex-direction: column; text-align: center; padding: 30px;">
                    <div style="width: 80px; height: 80px; background: rgba(46, 204, 113, 0.1); color: var(--success-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin-bottom: 20px;">
                        <i class="fas fa-check"></i>
                    </div>
                    <h3 style="margin: 0 0 10px 0;">Awesome!</h3>
                    <p class="text-muted">The AI has received your answer. Keep up the great work!</p>
                    <button id="dc-close-bottom" class="btn btn-outline mt-3">Close</button>
                </div>

            </div>
        </div>
        <style>
            @keyframes popIn {
                0% { transform: scale(0.9); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('daily-challenge-modal');
    const titleEl = document.getElementById('dc-title');
    const textEl = document.getElementById('dc-text');
    const pointsEl = document.getElementById('dc-points');
    const submitBtn = document.getElementById('dc-submit');
    const answerBox = document.getElementById('dc-answer');
    const successOverlay = document.getElementById('dc-success');

    // Display Logic Check based on time
    function checkDailyChallenge() {
        const lastSeen = localStorage.getItem('alfaran-last-challenge-time');
        const now = new Date().getTime();

        // If never seen OR if 24 hours (86400000 ms) have passed.
        // For testing purposes, let's trigger it immediately if it hasn't fired in the last 1 minute (60000ms)
        const cooldown = 60000; // Change to 86400000 for actual 24hr

        if (!lastSeen || (now - parseInt(lastSeen)) > cooldown) {
            triggerChallengeModal();
        }
    }

    async function triggerChallengeModal() {
        // Show modal early with loading state
        modal.style.display = 'flex';
        titleEl.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Connecting to AI...';
        textEl.innerText = "Generating your personalized challenge...";
        pointsEl.innerText = "...";
        answerBox.disabled = true;
        submitBtn.disabled = true;

        try {
            // Assume student level is Grade 10 for demo (could fetch from student profile)
            const challengeData = await AIService.getDailyChallenge("Grade 10");

            titleEl.innerText = challengeData.title;
            textEl.innerText = challengeData.text;
            pointsEl.innerText = challengeData.points;
            answerBox.disabled = false;
            submitBtn.disabled = false;

            // Update last seen
            localStorage.setItem('alfaran-last-challenge-time', new Date().getTime().toString());
        } catch (e) {
            titleEl.innerText = "AI System Offline";
            textEl.innerText = "Unable to generate challenge right now. Try again later.";
        }
    }

    submitBtn.addEventListener('click', () => {
        if (!answerBox.value.trim()) {
            answerBox.style.borderColor = 'var(--danger-color)';
            setTimeout(() => answerBox.style.borderColor = 'var(--border-color)', 1000);
            return;
        }

        // Simulate AI checking the answer
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';

        setTimeout(() => {
            successOverlay.style.display = 'flex';
        }, 1500);
    });

    // Close buttons
    document.getElementById('dc-close-top').addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('dc-close-bottom').addEventListener('click', () => modal.style.display = 'none');

    // Run check 2 seconds after dashboard loads
    setTimeout(checkDailyChallenge, 2000);

});
