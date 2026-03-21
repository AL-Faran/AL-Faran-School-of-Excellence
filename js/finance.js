// finance.js - Handles the logic for the Fee & Finance Dashboard

document.addEventListener('DOMContentLoaded', () => {

    // DOM Elements
    const totalCollectedEl = document.getElementById('finance-total-collected');
    const totalPendingEl = document.getElementById('finance-total-pending');
    const totalUnpaidEl = document.getElementById('finance-total-unpaid');
    const financeTableBody = document.getElementById('finance-table-body');

    if (!financeTableBody) return; // Only execute if finance table exists

    const classList = [
        "Playgroup", "Nursery", "KG",
        "Class 1", "Class 2", "Class 3",
        "Class 4", "Class 5", "Class 6",
        "Class 7", "Class 8", "Class 9", "Class 10"
    ];

    function renderFinanceDashboard() {
        const students = JSON.parse(localStorage.getItem('alfaran-students')) || [];

        let globalCollected = 0;
        let globalPending = 0;
        let globalUnpaid = 0;

        financeTableBody.innerHTML = '';

        classList.forEach(className => {
            // Filter students in this class
            const classStudents = students.filter(s => s.class === className);

            if (classStudents.length === 0) return; // Skip empty classes in the dashboard table

            let classTotalStudents = classStudents.length;
            let classPaidStudents = 0;
            let classCollectedAmount = 0;
            let classPendingAmount = 0;
            let classUnpaidAmount = 0;

            classStudents.forEach(s => {
                const amount = s.feeAmount || 0;
                if (s.fee === 'Paid') {
                    classPaidStudents++;
                    classCollectedAmount += amount;
                    globalCollected += amount;
                } else if (s.fee === 'Pending') {
                    classPendingAmount += amount;
                    globalPending += amount;
                } else if (s.fee === 'Unpaid') {
                    classUnpaidAmount += amount;
                    globalUnpaid += amount;
                }
            });

            const collectionRate = classTotalStudents > 0
                ? Math.round((classPaidStudents / classTotalStudents) * 100)
                : 0;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 500;">${className}</td>
                <td>${classTotalStudents}</td>
                <td>${classPaidStudents}</td>
                <td style="color: var(--success-color); font-weight: 600;">Rs ${classCollectedAmount}</td>
                <td style="color: var(--danger-color); font-weight: 600;">Rs ${classPendingAmount + classUnpaidAmount}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="flex-grow: 1; height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: ${collectionRate}%; background: ${collectionRate === 100 ? 'var(--success-color)' : 'var(--primary-color)'};"></div>
                        </div>
                        <span style="font-size: 0.85rem; font-weight: 600;">${collectionRate}%</span>
                    </div>
                </td>
            `;
            financeTableBody.appendChild(tr);
        });

        if (financeTableBody.innerHTML === '') {
            financeTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-5">No student data available to generate finance summary.</td></tr>`;
        }

        // Update top stats
        totalCollectedEl.innerText = `Rs ${globalCollected}`;
        totalPendingEl.innerText = `Rs ${globalPending}`;
        totalUnpaidEl.innerText = `Rs ${globalUnpaid}`;
    }

    // Initial Render
    renderFinanceDashboard();

    // Listen for custom event triggered by students.js to auto-refresh the finance dashboard silently
    document.addEventListener('studentsDataUpdated', renderFinanceDashboard);
});
