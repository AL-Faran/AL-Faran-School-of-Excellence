/**
 * parent-diary.js
 * Fetches and displays the class diary for the logged-in student's class.
 */

document.addEventListener('DOMContentLoaded', () => {
    const diaryContent = document.getElementById('class-diary-content');
    const diaryDateDisplay = document.getElementById('diary-date-display');

    if (!diaryContent) return;

    // 1. Get Student Class from session
    const studentClass = sessionStorage.getItem('currentStudentClass');
    if (!studentClass) {
        diaryContent.innerHTML = '<div class="text-center text-muted">Student session not found. Please log in again.</div>';
        return;
    }

    // 2. Fetch Diaries
    function loadClassDiary() {
        const allDiaries = JSON.parse(localStorage.getItem('alfaran-class-diaries')) || [];
        
        // Find most recent diary for this class
        const myClassDiaries = allDiaries
            .filter(d => d.class === studentClass)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (myClassDiaries.length === 0) {
            diaryContent.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-calendar-minus mb-2" style="font-size: 2rem; opacity: 0.3;"></i><br>
                    <span class="text-muted">No homework or diary entries posted for ${studentClass} yet.</span>
                </div>`;
            return;
        }

        const latest = myClassDiaries[0];
        const diaryDate = new Date(latest.date);
        const today = new Date();
        today.setHours(0,0,0,0);
        
        let dateLabel = diaryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        if (diaryDate.getTime() === today.getTime()) {
            dateLabel = 'Today, ' + dateLabel;
        }

        diaryDateDisplay.textContent = dateLabel;
        diaryContent.innerHTML = latest.content;
    }

    loadClassDiary();
});
