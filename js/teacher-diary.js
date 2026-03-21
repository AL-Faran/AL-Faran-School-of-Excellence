/**
 * teacher-diary.js
 * Handles posting of class diaries by teachers (Class Incharges only).
 */

document.addEventListener('DOMContentLoaded', () => {
    const diaryForm = document.getElementById('form-post-diary');
    if (!diaryForm) return;

    const diaryClassInput = document.getElementById('diary-class');
    const diaryDateInput = document.getElementById('diary-date');
    const diaryContentInput = document.getElementById('diary-content');
    const submitBtn = document.getElementById('btn-submit-diary');
    const permissionMsg = document.getElementById('diary-permission-msg');
    const recentList = document.getElementById('recent-diaries-list');

    // 1. Check Permissions & Initialize
    const teacherId = sessionStorage.getItem('currentTeacherId');
    const teachers = JSON.parse(localStorage.getItem('alfaran-teachers')) || [];
    const myData = teachers.find(t => t.empId === teacherId);

    if (!myData) return;

    // Set default date to today
    diaryDateInput.valueAsDate = new Date();

    const isIncharge = myData.incharge === 'Yes';
    const assignedCls = myData.assignedClass;

    if (!isIncharge || assignedCls === 'Multiple' || !assignedCls) {
        diaryForm.style.opacity = '0.5';
        diaryForm.style.pointerEvents = 'none';
        submitBtn.disabled = true;
        permissionMsg.style.display = 'block';
        permissionMsg.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> Only <strong>Class Incharges</strong> assigned to a single specific class can post diaries.`;
        diaryClassInput.value = assignedCls || 'N/A';
    } else {
        diaryClassInput.value = assignedCls;
    }

    // 2. Render Recent Diaries
    function renderRecentDiaries() {
        const allDiaries = JSON.parse(localStorage.getItem('alfaran-class-diaries')) || [];
        // Filter for this teacher's class
        const myClassDiaries = allDiaries
            .filter(d => d.class === assignedCls)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5); // Show last 5

        if (myClassDiaries.length === 0) {
            recentList.innerHTML = '<div class="text-center p-4 text-muted">No diaries posted yet.</div>';
            return;
        }

        recentList.innerHTML = '';
        myClassDiaries.forEach(d => {
            const dateStr = new Date(d.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const card = document.createElement('div');
            card.className = 'p-3';
            card.style.background = 'var(--white)';
            card.style.borderRadius = '10px';
            card.style.border = '1px solid var(--border-color)';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong class="text-primary">${dateStr}</strong>
                    <span style="font-size: 0.8rem; color: var(--text-light);">${d.postedBy}</span>
                </div>
                <div style="font-size: 0.9rem; white-space: pre-wrap; line-height: 1.5;">${d.content}</div>
            `;
            recentList.appendChild(card);
        });
    }

    renderRecentDiaries();

    // 3. Handle Submit
    diaryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (confirm('Post this diary for all parents of ' + assignedCls + '?')) {
            const newDiary = {
                id: 'dry_' + Date.now(),
                class: assignedCls,
                date: diaryDateInput.value,
                content: diaryContentInput.value.trim(),
                postedBy: myData.name,
                timestamp: new Date().toISOString()
            };

            let allDiaries = JSON.parse(localStorage.getItem('alfaran-class-diaries')) || [];
            
            // Check if already posted for this date/class - overwrite if so
            allDiaries = allDiaries.filter(d => !(d.class === newDiary.class && d.date === newDiary.date));
            allDiaries.push(newDiary);
            
            localStorage.setItem('alfaran-class-diaries', JSON.stringify(allDiaries));
            
            alert('Diary posted successfully!');
            diaryContentInput.value = '';
            renderRecentDiaries();
        }
    });
});
