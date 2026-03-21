// parent-results.js - Fetches and displays student Result Cards from Admin records

document.addEventListener('DOMContentLoaded', () => {

    const resultsView = document.getElementById('view-academics');
    if (!resultsView) return; // Only run on parent dashboard

    const examSelect = document.getElementById('parent-exam-select');
    const childSelect = document.querySelector('.header-left select'); // The multi-child selector
    const breadcrumb = document.getElementById('results-breadcrumb');

    // Result Card Display Containers
    const cardContainer = document.getElementById('result-card-container');
    const emptyState = document.getElementById('result-empty-state');

    // Result Card Elements
    const rcPercentage = document.getElementById('rc-percentage');
    const rcTotalMarks = document.getElementById('rc-total-marks');
    const rcGrade = document.getElementById('rc-grade');
    const rcSubjectsBody = document.getElementById('rc-subjects-body');
    const rcRemarks = document.getElementById('rc-remarks');

    function renderResultCard() {
        // 1. Get Logged-in Student Data
        const studentId = sessionStorage.getItem('currentStudentId') || 'std_demo';
        const studentName = sessionStorage.getItem('currentStudentName') || 'Usman Khan';

        if (breadcrumb) breadcrumb.innerText = `Academic performance for ${studentName}`;

        const examType = examSelect.value;
        if (!examType) {
            // Unselected state
            cardContainer.style.display = 'none';
            emptyState.style.display = 'none';
            return;
        }

        // 2. Fetch Global Database
        const allResults = JSON.parse(localStorage.getItem('alfaran-results')) || [];

        // Find the specific record
        const record = allResults.find(r =>
            ((r.studentId && r.studentId === studentId) || (r.studentName.toLowerCase() === studentName.toLowerCase())) &&
            r.examType === examType
        );

        if (!record) {
            cardContainer.style.display = 'none';
            emptyState.style.display = 'block';
            emptyState.querySelector('p').innerText = `The school administration has not uploaded the ${examType} results for ${childName} yet.`;
            return;
        }

        // 3. Populate Data
        emptyState.style.display = 'none';
        cardContainer.style.display = 'block';

        // Summary
        rcPercentage.innerText = `${record.percentage}%`;
        rcTotalMarks.innerText = `${record.totalObtained} / ${record.totalMax}`;
        rcGrade.innerText = record.grade;

        // Color coding grade badge
        rcGrade.className = 'value font-weight-bold';
        if (record.percentage >= 80) rcGrade.classList.add('text-success');
        else if (record.percentage >= 60) rcGrade.classList.add('text-warning');
        else rcGrade.classList.add('text-danger');

        // Remarks
        rcRemarks.innerText = `"${record.remarks}"`;

        // Subjects Table
        rcSubjectsBody.innerHTML = '';

        record.subjects.forEach(sub => {
            const subjectPct = ((sub.obtained / sub.total) * 100);
            let subGrade = 'F';
            let gradeClass = 'status-overdue'; // red by default

            if (subjectPct >= 90) { subGrade = 'A+'; gradeClass = 'status-paid'; }
            else if (subjectPct >= 80) { subGrade = 'A'; gradeClass = 'status-paid'; }
            else if (subjectPct >= 70) { subGrade = 'B'; gradeClass = 'status-pending'; }
            else if (subjectPct >= 60) { subGrade = 'C'; gradeClass = 'status-pending'; }
            else if (subjectPct >= 50) { subGrade = 'D'; gradeClass = 'status-overdue'; }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 500;">${sub.subject}</td>
                <td>${sub.total}</td>
                <td style="font-weight: 600;">${sub.obtained}</td>
                <td><span class="status-badge ${gradeClass}" style="padding: 2px 8px;">${subGrade}</span></td>
            `;
            rcSubjectsBody.appendChild(tr);
        });
    }

    // Listeners
    if (examSelect) examSelect.addEventListener('change', renderResultCard);
    if (childSelect) childSelect.addEventListener('change', () => {
        // Reset exam select when switching child or force re-render
        examSelect.value = "";
        renderResultCard();
    });

});
