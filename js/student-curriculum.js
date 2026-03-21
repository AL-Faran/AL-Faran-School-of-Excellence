// student-curriculum.js - Logic for displaying filtered Science Curriculum to the student based on their grade level.

document.addEventListener('DOMContentLoaded', () => {

    const levelDisplay = document.getElementById('student-level-display');
    const tbCurriculumList = document.getElementById('student-curriculum-list');
    const tabsContainer = document.getElementById('curriculum-subject-tabs');
    const viewSection = document.getElementById('view-curriculum');

    if (!viewSection || !tbCurriculumList) return;

    // Simulate determining student's context. In a real app, this comes from an auth session token or server state.
    // For Zaid Ahmed, Grade 10-A, his level is Secondary. Let's hardcode it for this demo.
    const studentInfo = {
        name: 'Zaid Ahmed',
        grade: 'Grade 10',
        level: 'Secondary' // Could be Elementary (1-8), Secondary (9-10), Higher (11-12)
    };

    levelDisplay.innerHTML = `<span style="color: var(--primary-color); font-weight: 600;">Personalized for:</span> ${studentInfo.level} Education (${studentInfo.grade})`;

    let currentSubjectFilter = 'All';

    // Calculate dynamic subjects based on student level
    const subjectsMap = {
        'Elementary': ['General Science'],
        'Secondary': ['Physics', 'Chemistry', 'Biology'],
        'Higher': ['Physics', 'Chemistry', 'Biology']
    };

    const studentSubjects = subjectsMap[studentInfo.level];

    // Build the dynamic subject tabs
    function buildTabs() {
        tabsContainer.innerHTML = '';
        const allBtn = document.createElement('button');
        allBtn.className = 'btn btn-primary';
        allBtn.innerHTML = 'All Subjects';
        allBtn.onclick = () => {
            currentSubjectFilter = 'All';
            updateTabStyles();
            renderFilteredList();
        };
        tabsContainer.appendChild(allBtn);

        studentSubjects.forEach(sub => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline';
            btn.innerHTML = sub;
            btn.onclick = () => {
                currentSubjectFilter = sub;
                updateTabStyles();
                renderFilteredList();
            };
            tabsContainer.appendChild(btn);
        });
    }

    function updateTabStyles() {
        Array.from(tabsContainer.children).forEach(btn => {
            if (btn.innerHTML.includes(currentSubjectFilter) || (currentSubjectFilter === 'All' && btn.innerHTML === 'All Subjects')) {
                btn.className = 'btn btn-primary';
            } else {
                btn.className = 'btn btn-outline';
            }
        });
    }

    function renderFilteredList() {
        // Fetch raw data
        const allCurriculum = JSON.parse(localStorage.getItem('alfaran-curriculum')) || [];

        // Step 1: Filter ONLY items meant for this student's level (Crucial Security/Logic rule)
        let filteredCurriculum = allCurriculum.filter(item => item.level === studentInfo.level);

        // Step 2: Filter by subject tab if not 'All'
        if (currentSubjectFilter !== 'All') {
            filteredCurriculum = filteredCurriculum.filter(item => item.subject === currentSubjectFilter);
        }

        // Update counters on top of page for current filtered dataset
        document.getElementById('count-materials').innerText = filteredCurriculum.filter(i => i.type.includes('PDF') || i.type.includes('PPT') || i.type.includes('Quiz')).length;
        document.getElementById('count-labs').innerText = filteredCurriculum.filter(i => i.type.includes('Virtual Lab')).length;
        document.getElementById('count-live').innerText = filteredCurriculum.filter(i => i.type.includes('Live Session')).length;

        // Render Cards
        tbCurriculumList.innerHTML = '';

        if (filteredCurriculum.length === 0) {
            tbCurriculumList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <i class="fas fa-folder-open fa-3x mb-3" style="opacity: 0.3;"></i>
                    <h4>No resources found</h4>
                    <p style="font-size: 0.9rem;">Your teachers have not uploaded any materials for ${currentSubjectFilter === 'All' ? 'your level' : currentSubjectFilter} yet.</p>
                </div>
            `;
            return;
        }

        // Sort by newest first
        filteredCurriculum.sort((a, b) => b.id - a.id).forEach(item => {

            // Map visuals based on type
            let icon = 'fas fa-file-pdf';
            let bgClass = 'rgba(26, 75, 132, 0.05)';
            let textColor = 'var(--primary-color)';
            let btnText = 'Open Resource';

            if (item.type.includes('PPT')) { icon = 'fas fa-file-powerpoint'; bgClass = 'rgba(243, 156, 18, 0.05)'; textColor = 'var(--warning-color)'; btnText = 'View Slides'; }
            if (item.type.includes('Virtual Lab')) { icon = 'fas fa-flask'; bgClass = 'rgba(46, 204, 113, 0.05)'; textColor = 'var(--success-color)'; btnText = 'Launch Lab'; }
            if (item.type.includes('Live Session')) { icon = 'fas fa-video'; bgClass = 'rgba(231, 76, 60, 0.05)'; textColor = 'var(--danger-color)'; btnText = 'Join Class'; }
            if (item.type.includes('Quiz')) { icon = 'fas fa-question-circle'; bgClass = 'rgba(52, 152, 219, 0.05)'; textColor = 'var(--info-color)'; btnText = 'Start Quiz'; }

            const card = document.createElement('div');
            card.style.cssText = `
                padding: 1.25rem; 
                border: 1px solid var(--border-color); 
                border-left: 4px solid ${textColor};
                border-radius: var(--radius-sm); 
                margin-bottom: 1rem;
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                align-items: center;
                gap: 15px;
                background: ${bgClass};
                transition: transform 0.2s ease;
            `;

            card.onmouseover = () => card.style.transform = 'translateX(5px)';
            card.onmouseout = () => card.style.transform = 'translateX(0)';

            const dateStr = new Date(item.timestamp).toLocaleDateString();

            card.innerHTML = `
                <div style="flex: 1; min-width: 250px;">
                    <div style="font-size: 0.75rem; font-weight: 700; color: ${textColor}; text-transform: uppercase; margin-bottom: 5px; display: flex; align-items: center; gap: 8px;">
                        <i class="${icon}"></i> ${item.type} &bull; ${item.subject}
                    </div>
                    <h4 style="margin: 0; font-size: 1.15rem; color: var(--text-color);">${item.title}</h4>
                    <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: var(--text-muted);"><i class="far fa-calendar-alt"></i> Uploaded: ${dateStr}</p>
                </div>
                <div>
                    <a href="${item.url}" target="_blank" class="btn btn-outline" style="border-color: ${textColor}; color: ${textColor}; padding: 8px 15px;">
                        ${btnText} <i class="fas fa-external-link-alt ml-1"></i>
                    </a>
                </div>
            `;
            tbCurriculumList.appendChild(card);
        });
    }

    // Initialize View
    buildTabs();
    renderFilteredList();
});
