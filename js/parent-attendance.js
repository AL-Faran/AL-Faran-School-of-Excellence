// parent-attendance.js - Syncs Teacher's attendance data into the Parent Dashboard

document.addEventListener('DOMContentLoaded', () => {

    // Core Elements
    const attendanceView = document.getElementById('view-attendance');
    if (!attendanceView) return; // Only run on parent dashboard

    // UI Elements
    const breadcrumb = document.getElementById('attendance-breadcrumb');
    const todayIcon = document.getElementById('today-status-icon');
    const todayText = document.getElementById('today-status-text');
    const todayDate = document.getElementById('today-status-date');
    const monthlyPct = document.getElementById('monthly-percentage-text');
    const monthlyStats = document.getElementById('monthly-stats-text');
    const miniCalendar = document.getElementById('mini-calendar');
    const absenceBody = document.getElementById('absence-table-body');
    const childSelect = document.querySelector('.header-left select'); // The multi-child selector

    let chartInstance = null;

    function renderParentAttendance() {
        // 1. Get Logged-in Student Data
        const studentId = sessionStorage.getItem('currentStudentId') || 'std_demo';
        const studentName = sessionStorage.getItem('currentStudentName') || 'Usman Khan';

        if (breadcrumb) breadcrumb.innerText = `Attendance overview for ${studentName}`;
        
        // Update header/sidebar sync (if elements exist)
        if (document.getElementById('welcome-parent')) {
            document.getElementById('welcome-parent').innerText = `Welcome ${sessionStorage.getItem('currentParentName') || 'Parent'}`;
            document.getElementById('overview-breadcrumb').innerText = `Overview for ${studentName}`;
            document.getElementById('display-parent-name').innerText = sessionStorage.getItem('currentParentName') || 'Parent';
            document.getElementById('display-student-name').innerText = studentName;
            const avatar = document.getElementById('parent-avatar');
            if (avatar) avatar.innerText = (sessionStorage.getItem('currentParentName') || 'P').charAt(0).toUpperCase();
        }

        // 2. Fetch Global Database
        const attendanceHistory = JSON.parse(localStorage.getItem('alfaran-attendance-history')) || [];

        // Filter history specifically for this studentId (best practice) or studentName
        const childHistory = attendanceHistory.filter(a => 
            (a.studentId && a.studentId === studentId) || 
            (a.studentName.toLowerCase() === studentName.toLowerCase())
        );

        // 3. Process Today's Status
        const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        todayDate.innerText = todayStr;

        const todayRecord = childHistory.find(a => a.date === todayStr);

        if (todayRecord) {
            if (todayRecord.status === 'Present') {
                todayIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
                todayIcon.style.color = 'var(--success-color)';
                todayText.innerText = 'Present';
                todayText.className = 'text-success';
            } else if (todayRecord.status === 'Absent') {
                todayIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
                todayIcon.style.color = 'var(--danger-color)';
                todayText.innerText = 'Absent';
                todayText.className = 'text-danger';
            }
        } else {
            todayIcon.innerHTML = '<i class="fas fa-question-circle"></i>';
            todayIcon.style.color = 'var(--text-muted)';
            todayText.innerText = 'Not Marked Yet';
            todayText.className = 'text-muted';
        }

        // 4. Calculate Current Month Stats
        // We simulate a 26 day working month for the ring chart math
        let workingDaysInMonth = 26;
        let presentDays = childHistory.filter(a => a.status === 'Present').length;

        // If they have more than 0 records but less than 26, calculate percentage based on marked days
        let markedDays = childHistory.length;
        let presentPct = 0;

        if (markedDays > 0) {
            presentPct = Math.round((presentDays / markedDays) * 100);
            monthlyStats.innerText = `${presentDays} / ${markedDays} Marked Days Present`;
        } else {
            monthlyStats.innerText = `No attendance records found yet.`;
        }

        monthlyPct.innerText = markedDays > 0 ? `${presentPct}%` : '--%';

        // Draw Chart.js Ring
        const ctx = document.getElementById('attendanceRingChart');
        if (ctx && typeof Chart !== 'undefined') {
            if (chartInstance) chartInstance.destroy();

            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const trackColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
            const progressColor = presentPct >= 80 ? '#2ecc71' : (presentPct >= 60 ? '#f39c12' : '#e74c3c');

            chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: markedDays > 0 ? [presentPct, 100 - presentPct] : [0, 100],
                        backgroundColor: markedDays > 0 ? [progressColor, trackColor] : [trackColor, trackColor],
                        borderWidth: 0,
                        cutout: '80%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { animateScale: true },
                    plugins: { tooltip: { enabled: false } },
                    events: [] // Disable hover interactions
                }
            });
        }

        // 5. Generate Mini Calendar (Last 14 days grid simulation)
        // We'll just generate 14 empty dots, and fill in the ones that match history for visual effect
        // Note: Real calendars require complex date math. We simulate the grid styling here for the prototype.

        // Preserve headers, clear old dots
        const oldDots = miniCalendar.querySelectorAll('.cal-dot-container');
        oldDots.forEach(node => node.remove());

        // Sort history by rawDate descending to get recent
        const sortedHistory = [...childHistory].sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

        // Create 21 dots (3 weeks)
        for (let i = 0; i < 21; i++) {
            const dotWrapper = document.createElement('div');
            dotWrapper.className = 'cal-dot-container';
            dotWrapper.style.padding = '5px';

            const dot = document.createElement('div');
            dot.style.width = '12px';
            dot.style.height = '12px';
            dot.style.borderRadius = '50%';
            dot.style.margin = '0 auto';

            // Assign colors based on recent history (front-loading newest)
            if (i < sortedHistory.length) {
                const rec = sortedHistory[i];
                if (rec.status === 'Present') {
                    dot.style.background = 'var(--success-color)';
                    dot.title = `Present on ${rec.date}`;
                } else {
                    dot.style.background = 'var(--danger-color)';
                    dot.title = `Absent on ${rec.date}`;
                }
            } else {
                // Future/Unmarked days
                dot.style.background = 'var(--border-color)';
                dot.title = `Unmarked`;
            }

            dotWrapper.appendChild(dot);
            miniCalendar.appendChild(dotWrapper);
        }

        // 6. Build Detailed Absence Table
        absenceBody.innerHTML = '';
        const absences = sortedHistory.filter(a => a.status === 'Absent');

        if (absences.length === 0) {
            absenceBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No absences recorded on the active database. Excellent!</td></tr>`;
        } else {
            absences.forEach(rec => {
                const row = document.createElement('tr');
                const rawDateObj = new Date(rec.rawDate);
                const dayName = rawDateObj.toLocaleDateString('en-US', { weekday: 'short' });

                row.innerHTML = `
                    <td style="font-weight: 500;">${rec.date}</td>
                    <td>${dayName}</td>
                    <td><span class="status-badge status-overdue" style="padding: 2px 8px;">Absent</span></td>
                    <td class="text-muted" style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${rec.remarks || 'No remarks provided'}</td>
                `;
                absenceBody.appendChild(row);
            });
        }

        // Sync overview dash widget if they are on overview
        const overviewAtt = document.querySelector('#view-overview .stat-card.stat-success .value');
        if (overviewAtt) {
            overviewAtt.innerText = markedDays > 0 ? `${presentPct}%` : '--%';
            overviewAtt.nextElementSibling.innerText = markedDays > 0 ? `${presentDays}/${markedDays} Days Present` : 'Awaiting sync';
        }
    }

    // Initial Render
    renderParentAttendance();

    // Listen for child switcher change
    if (childSelect) {
        childSelect.addEventListener('change', renderParentAttendance);
    }
});
