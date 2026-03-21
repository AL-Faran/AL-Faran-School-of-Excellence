/**
 * parent-overview.js
 * Handles the logic for the Parent Dashboard Overview section.
 * Fetches actual data from localStorage (Students, Attendance, Results).
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get Logged-in Student Data from Session
    const studentId = sessionStorage.getItem('currentStudentId');
    const studentName = sessionStorage.getItem('currentStudentName');

    if (!studentId) return;

    // Elements
    const attendanceVal = document.getElementById('ov-attendance-val');
    const attendanceCount = document.getElementById('ov-attendance-count');
    const resultVal = document.getElementById('ov-result-val');
    const resultInfo = document.getElementById('ov-result-info');
    const feeVal = document.getElementById('ov-fee-val');
    const feeDate = document.getElementById('ov-fee-date');
    const activitiesList = document.getElementById('recent-activities-list');
    const progressCanvas = document.getElementById('progressChart');

    // Initialization
    function initOverview() {
        renderStats();
        renderProgressChart();
        renderRecentActivities();
    }

    // --- 1. RENDER STATS (Attendance, Results, Fees) ---
    function renderStats() {
        // A. Attendance
        const attendanceHistory = JSON.parse(localStorage.getItem('alfaran-attendance-history')) || [];
        const myAttendance = attendanceHistory.filter(a => 
            (a.studentId && a.studentId === studentId) || (a.studentName === studentName)
        );
        
        if (myAttendance.length > 0) {
            const presentCount = myAttendance.filter(a => a.status === 'Present').length;
            const percentage = Math.round((presentCount / myAttendance.length) * 100);
            attendanceVal.innerText = `${percentage}%`;
            attendanceCount.innerText = `${presentCount}/${myAttendance.length} Days Present`;
        }

        // B. Results
        const allResults = JSON.parse(localStorage.getItem('alfaran-results')) || [];
        const myResults = allResults.filter(r => 
            (r.studentId && r.studentId === studentId) || (r.studentName === studentName)
        );

        if (myResults.length > 0) {
            // Sort by date to get latest
            myResults.sort((a, b) => new Date(b.dateRecorded) - new Date(a.dateRecorded));
            const latest = myResults[0];
            resultVal.innerText = `${latest.percentage}%`;
            resultInfo.innerText = `${latest.examType} (Grade: ${latest.grade})`;
        }

        // C. Fees
        const allStudents = JSON.parse(localStorage.getItem('alfaran-students')) || [];
        const studentData = allStudents.find(s => s.id === studentId || s.name === studentName);
        
        if (studentData) {
            if (studentData.fee === 'Paid') {
                feeVal.innerText = 'Paid';
                feeVal.style.color = 'var(--success-color)';
                feeDate.innerText = 'All dues cleared';
                feeDate.className = 'text-success font-weight-bold';
            } else {
                feeVal.innerText = `Rs ${studentData.feeAmount || 0}`;
                feeVal.style.color = 'var(--danger-color)';
                feeDate.innerText = 'Payment Pending';
                feeDate.className = 'text-danger font-weight-bold';
            }
        }
    }

    // --- 2. ACADEMIC PROGRESS CHART ---
    function renderProgressChart() {
        if (!progressCanvas || typeof Chart === 'undefined') return;

        const allResults = JSON.parse(localStorage.getItem('alfaran-results')) || [];
        const myResults = allResults.filter(r => 
            (r.studentId && r.studentId === studentId) || (r.studentName === studentName)
        );

        let labels = ['No Data'];
        let dataValues = [0];
        let termLabel = 'Latest Exam';

        if (myResults.length > 0) {
            // Get latest exam result
            myResults.sort((a, b) => new Date(b.dateRecorded) - new Date(a.dateRecorded));
            const latest = myResults[0];
            termLabel = latest.examType;
            
            if (latest.subjects && latest.subjects.length > 0) {
                labels = latest.subjects.map(s => s.subject);
                dataValues = latest.subjects.map(s => Math.round((s.obtained / s.total) * 100));
            }
        }

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        new Chart(progressCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: `${termLabel} (%)`,
                    data: dataValues,
                    backgroundColor: '#3a75b8',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { font: { size: 10 } } },
                    x: { ticks: { font: { size: 10 } } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // --- 3. RECENT ACTIVITIES ---
    function renderRecentActivities() {
        if (!activitiesList) return;

        const attendanceHistory = JSON.parse(localStorage.getItem('alfaran-attendance-history')) || [];
        const allResults = JSON.parse(localStorage.getItem('alfaran-results')) || [];

        // Combine and format
        let activities = [];

        attendanceHistory.filter(a => (a.studentId === studentId || a.studentName === studentName)).forEach(a => {
            activities.push({
                type: 'attendance',
                date: a.date,
                timestamp: new Date(a.rawDate || a.date).getTime(),
                title: a.status === 'Present' ? 'Attendance Marked' : 'Absent Recorded',
                desc: a.status === 'Present' ? 'Student was present in class.' : (a.remarks || 'No reason provided.'),
                color: a.status === 'Present' ? 'var(--success-color)' : 'var(--danger-color)',
                bg: a.status === 'Present' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)'
            });
        });

        allResults.filter(r => (r.studentId === studentId || r.studentName === studentName)).forEach(r => {
            activities.push({
                type: 'result',
                date: new Date(r.dateRecorded).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                timestamp: new Date(r.dateRecorded).getTime(),
                title: `Result: ${r.examType}`,
                desc: `Achieved ${r.percentage}% (Grade ${r.grade}).`,
                color: 'var(--primary-color)',
                bg: 'rgba(26, 75, 132, 0.1)'
            });
        });

        // Sort by timestamp
        activities.sort((a, b) => b.timestamp - a.timestamp);

        // Render top 5
        if (activities.length === 0) {
            activitiesList.innerHTML = '<li class="text-center p-4 text-muted">No recent activity detected.</li>';
            return;
        }

        activitiesList.innerHTML = '';
        activities.slice(0, 5).forEach(act => {
            const li = document.createElement('li');
            li.style.cssText = 'padding: 15px; border-bottom: 1px solid var(--border-color); display: flex; gap: 15px;';
            
            const dateParts = act.date.split(' ');
            const day = dateParts[0] || '??';
            const month = (dateParts[1] || '???').toUpperCase();

            li.innerHTML = `
                <div style="background: ${act.bg}; color: ${act.color}; padding: 10px; border-radius: var(--radius-sm); text-align: center; min-width: 60px;">
                    <div class="font-weight-bold">${day}</div>
                    <small>${month}</small>
                </div>
                <div>
                    <h5 class="mb-1">${act.title}</h5>
                    <p class="text-muted" style="font-size: 0.85rem; margin: 0;">${act.desc}</p>
                </div>
            `;
            activitiesList.appendChild(li);
        });
    }

    initOverview();
});
