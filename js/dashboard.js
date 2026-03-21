// dashboard.js - Shared logic for all portal dashboards

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Toggle Logic
    const toggleBtn = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('mobile-open');
            } else {
                sidebar.classList.toggle('collapsed');
            }
        });
    }

    // 2. Navigation View Switching Logic (Vanilla SPA feel)
    const navLinks = document.querySelectorAll('.nav-link-item');
    const views = document.querySelectorAll('.view-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active from all links and views
            navLinks.forEach(l => l.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));

            // Add active to clicked link
            link.classList.add('active');

            // Show corresponding view
            const targetId = 'view-' + link.getAttribute('data-target');
            const targetView = document.getElementById(targetId);
            if (targetView) {
                targetView.classList.add('active');
            }

            // Close mobile sidebar after click
            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('mobile-open');
            }
        });
    });

    // 3. Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Check saved theme
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    let isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

    if (isDark) {
        htmlElement.setAttribute('data-theme', 'dark');
        updateThemeIcon(true);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            isDark = htmlElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                htmlElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                updateThemeIcon(false);
                updateCharts(false); // Update chart colors
            } else {
                htmlElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                updateThemeIcon(true);
                updateCharts(true); // Update chart colors
            }
        });
    }

    function updateThemeIcon(dark) {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (dark) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    // 4. Chart.js Initialization (Mock Data)
    let revChart, attChart;

    // Initialize charts if elements exist (primarily on Admin Dashboard)
    const revCtx = document.getElementById('revenueChart');
    const attCtx = document.getElementById('attendanceChart');

    if (revCtx && attCtx && typeof Chart !== 'undefined') {
        const textColor = isDark ? '#f5f6fa' : '#2c3e50';
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

        // Common Chart Options
        Chart.defaults.color = textColor;
        Chart.defaults.font.family = "'Inter', sans-serif";

        // Revenue Line Chart
        revChart = new Chart(revCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                datasets: [{
                    label: 'Fee Collection (Rs)',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4 // Smooth curves
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { color: gridColor } },
                    y: { grid: { color: gridColor }, beginAtZero: true }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // Attendance Doughnut Chart
        attChart = new Chart(attCtx, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Absent', 'On Leave'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#2ecc71', '#e74c3c', '#f1c40f'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    // Helper to completely re-render charts on theme change
    function updateCharts(darkTheme) {
        if (!revChart || !attChart) return;
        const color = darkTheme ? '#f5f6fa' : '#2c3e50';
        const grid = darkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

        Chart.defaults.color = color;

        revChart.options.scales.x.grid.color = grid;
        revChart.options.scales.y.grid.color = grid;
        revChart.update();

        attChart.update();
    }

    // --- Dynamic Data Linking for Dashboard Overview ---

    function updateDashboardRecentActivity() {
        const tableBody = document.getElementById('recent-activity-table-body');
        if (!tableBody) return;

        const admissions = JSON.parse(localStorage.getItem('alfaran-admissions')) || [];
        
        // Sort descending and take top 5
        admissions.sort((a, b) => b.id.localeCompare(a.id));
        const recent = admissions.slice(0, 5);

        tableBody.innerHTML = '';

        if (recent.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="text-align: center; padding: 2rem 0;">No recent activity found.</td></tr>`;
            return;
        }

        recent.forEach(app => {
            let statusClass = 'status-pending';
            if (app.status === 'Admitted') statusClass = 'status-active';
            if (app.status === 'Rejected') statusClass = 'status-danger';
            if (app.status === 'Interview Scheduled') statusClass = 'status-warning';

            const tr = document.createElement('tr');
            // Mocking a standard "View" button for now
            tr.innerHTML = `
                <td>#${app.id.substring(4, 12).toUpperCase()}</td>
                <td style="font-weight: 500;">${app.studentName}</td>
                <td>${app.appliedClass}</td>
                <td>${app.submissionDate}</td>
                <td><span class="status-badge ${statusClass}">${app.status}</span></td>
                <td><button class="btn btn-outline" onclick="document.querySelector('[data-target=\\'admissions\\']').click();" style="padding: 2px 8px; font-size: 0.8rem;">View</button></td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function updateAttendanceChart() {
        if (!attChart) return;
        
        const history = JSON.parse(localStorage.getItem('alfaran-attendance-history')) || [];
        const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        
        // Filter history for today only
        const todayRecords = history.filter(r => r.date === dateStr);
        
        if (todayRecords.length === 0) {
             // If no attendance taken today, leave as zeros
             attChart.data.datasets[0].data = [0, 0, 0];
             attChart.update();
             return;
        }
        
        let present = 0;
        let absent = 0;
        // Mocking 'On Leave' logic
        let onLeave = 0; 

        todayRecords.forEach(r => {
            if (r.status === 'Present') present++;
            else if (r.status === 'Absent') absent++;
        });

        attChart.data.datasets[0].data = [present, absent, onLeave];
        attChart.update();
    }

    function updateRevenueChart() {
        if (!revChart) return;

        const students = JSON.parse(localStorage.getItem('alfaran-students')) || [];
        
        // Initialize 10 months to correspond with chart labels: Jan to Oct
        // For a real app, you'd align this with the Academic Year.
        const monthlyRevenue = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        
        students.forEach(s => {
            if (s.fee === 'Paid' && s.paymentDate) {
                 // Try parsing the payment date
                 const dateParts = s.paymentDate.split('/'); // Assumes MM/DD/YYYY or DD/MM/YYYY depending on locale
                 
                 // Fallback robust date parsing:
                 const d = new Date(s.paymentDate); 
                 if (!isNaN(d.getTime())) {
                     const monthIndex = d.getMonth(); // 0-11
                     // Map 0-9 (Jan-Oct) to the chart array. Ignore Nov/Dec for the mocked chart labels.
                     if (monthIndex < 10) {
                         monthlyRevenue[monthIndex] += (s.feeAmount || 0);
                     }
                 }
            }
        });

        revChart.data.datasets[0].data = monthlyRevenue;
        revChart.update();
    }

    // Initial Population
    updateDashboardRecentActivity();
    updateAttendanceChart();
    updateRevenueChart();

    // Listeners for updates from other modules
    document.addEventListener('admissionsDataUpdated', updateDashboardRecentActivity);
    document.addEventListener('attendanceDataUpdated', updateAttendanceChart);
    document.addEventListener('studentsDataUpdated', () => {
        updateRevenueChart();
        // The numbers at the top (Total Students, Fee Collection, Pending) are already 
        // updated by students.js/updateOverviewStats(), which fires on the same event.
    });

    // --- Report Export Functionality ---

    function downloadCSV(csv, filename) {
        const csvFile = new Blob([csv], { type: 'text/csv' });
        const downloadLink = document.createElement('a');
        downloadLink.download = filename;
        downloadLink.href = window.URL.createObjectURL(csvFile);
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    function generateFullReport() {
        const students = JSON.parse(localStorage.getItem('alfaran-students')) || [];
        const admissions = JSON.parse(localStorage.getItem('alfaran-admissions')) || [];
        
        if (students.length === 0 && admissions.length === 0) {
            alert('No data available to export.');
            return;
        }

        const date = new Date().toISOString().split('T')[0];

        // 1. Group Students by Class
        const classes = {};
        students.forEach(s => {
            if (!classes[s.class]) classes[s.class] = [];
            classes[s.class].push(s);
        });

        // 2. Export each class separately
        Object.keys(classes).forEach(className => {
            let csv = 'Roll No,Name,Father Name,Contact,B-Form,Fee Status,Amount\n';
            classes[className].forEach(s => {
                csv += `${s.roll},"${s.name}","${s.father}","${s.contact || ''}","${s.bform || ''}",${s.fee},"Rs ${s.feeAmount}"\n`;
            });
            downloadCSV(csv, `Students_Report_${className}_${date}.csv`);
        });

        // 3. Export Admissions separately (if any)
        if (admissions.length > 0) {
            let admissionsCsv = 'ID,Name,Applied Class,Father Name,Contact,Status\n';
            admissions.forEach(a => {
                admissionsCsv += `${a.id},"${a.studentName}",${a.appliedClass},"${a.fatherName}","${a.phone}",${a.status}\n`;
            });
            downloadCSV(admissionsCsv, `Admissions_Report_Full_${date}.csv`);
        }
        
        alert('Reports have been generated class-wise. Please check your downloads folder.');
    }

    const exportBtn = document.getElementById('btn-export-main');
    if (exportBtn) {
        exportBtn.addEventListener('click', generateFullReport);
    }

});
