// parent-fees.js - Syncs the Fee Voucher with the central Admin student database

document.addEventListener('DOMContentLoaded', () => {

    const feesView = document.getElementById('view-fees');
    if (!feesView) return; // run only on parent dashboard

    const childSelect = document.querySelector('.header-left select');
    const breadcrumb = document.getElementById('finance-breadcrumb');

    // Voucher UI Elements
    const vStudentName = document.getElementById('voucher-student-name');
    const vFatherName = document.getElementById('voucher-father-name');
    const vClass = document.getElementById('voucher-class');
    const vRoll = document.getElementById('voucher-roll');
    const vFeeAmt = document.getElementById('voucher-fee-amount');
    const vTotalPayable = document.getElementById('voucher-total-payable');
    const vMonth = document.getElementById('voucher-month');
    const vNo = document.getElementById('voucher-no');

    // Status visual elements
    const vStatusBadge = document.getElementById('voucher-status-badge');
    const vWatermark = document.getElementById('voucher-watermark');
    const vStrip = document.getElementById('voucher-status-strip');
    const vDueDate = document.getElementById('voucher-due-date');

    function renderFeeVoucher() {
        // 1. Get Logged-in Student Data
        const studentId = sessionStorage.getItem('currentStudentId') || 'std_demo';
        const studentName = sessionStorage.getItem('currentStudentName') || 'Usman Khan';
        
        if (breadcrumb) breadcrumb.innerText = `Financial overview for ${studentName}`;

        // 2. Fetch the central student database (Admin's source of truth)
        const allStudents = JSON.parse(localStorage.getItem('alfaran-students')) || [];
        const studentData = allStudents.find(s => 
            s.id === studentId || s.name.toLowerCase() === studentName.toLowerCase()
        );

        if (studentData) {
            // Populate text
            vStudentName.innerText = studentData.name;
            vFatherName.innerText = studentData.father || 'N/A';
            vClass.innerText = studentData.class;
            vRoll.innerText = studentData.roll;
            vFeeAmt.innerText = studentData.feeAmount || '0';
            vTotalPayable.innerText = `Rs ${studentData.feeAmount || '0'}`;

            // Generate a fake voucher number based on student ID for realism
            vNo.innerText = (parseInt(studentData.id.replace('stu_', '')) % 90000) + 10000;

            // Set current month dynamically
            const date = new Date();
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            vMonth.innerText = `Month: ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            vDueDate.innerText = `10th ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;

            // Paint dynamically based on Admin fee status
            const status = studentData.fee || 'Unpaid';
            vStatusBadge.innerText = status.toUpperCase();
            vWatermark.innerText = status.toUpperCase();

            if (status === 'Paid') {
                // Paint Green
                vStatusBadge.className = 'status-badge status-paid';
                vWatermark.style.color = 'rgba(46, 204, 113, 0.08)';
                vStrip.style.background = 'rgba(46, 204, 113, 0.05)';
                vStrip.style.border = '1px solid rgba(46, 204, 113, 0.2)';

                // Show payment date if we have it
                if (studentData.paymentDate) {
                    vDueDate.innerText = `Paid on: ${studentData.paymentDate}`;
                    vDueDate.style.color = 'var(--success-color)';
                } else {
                    vDueDate.style.color = 'var(--text-color)';
                }

                vTotalPayable.style.color = 'var(--success-color)';

            } else if (status === 'Pending') {
                // Paint Orange
                vStatusBadge.className = 'status-badge status-pending';
                vWatermark.style.color = 'rgba(243, 156, 18, 0.08)';
                vStrip.style.background = 'rgba(243, 156, 18, 0.05)';
                vStrip.style.border = '1px solid rgba(243, 156, 18, 0.2)';
                vTotalPayable.style.color = 'var(--warning-color)';
            } else {
                // Paint Red (Unpaid)
                vStatusBadge.className = 'status-badge status-overdue';
                vWatermark.style.color = 'rgba(231, 76, 60, 0.08)';
                vStrip.style.background = 'rgba(231, 76, 60, 0.05)';
                vStrip.style.border = '1px solid rgba(231, 76, 60, 0.2)';
                vTotalPayable.style.color = 'var(--danger-color)';
            }

            // Sync overview dash widget if they are on overview
            const overviewFee = document.querySelector('#view-overview .stat-card.stat-danger');
            if (overviewFee) {
                if (status === 'Paid') {
                    overviewFee.className = 'stat-card stat-success';
                    overviewFee.style.background = '';
                    overviewFee.querySelector('h4').innerText = 'Fee Clear';
                    overviewFee.querySelector('.value').innerText = `Rs ${studentData.feeAmount}`;
                    overviewFee.querySelector('small').innerText = 'Paid for current month';
                    overviewFee.querySelector('small').className = 'text-success font-weight-bold';
                    overviewFee.querySelector('.stat-icon').innerHTML = '<i class="fas fa-check-circle"></i>';
                } else {
                    overviewFee.className = 'stat-card stat-danger';
                    overviewFee.style.background = 'rgba(231, 76, 60, 0.05)';
                    overviewFee.querySelector('h4').innerText = 'Fee Due';
                    overviewFee.querySelector('.value').innerText = `Rs ${studentData.feeAmount}`;
                    overviewFee.querySelector('small').innerText = `Due: 10th ${monthNames[date.getMonth()]}`;
                    overviewFee.querySelector('small').className = 'text-danger font-weight-bold';
                    overviewFee.querySelector('.stat-icon').innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                }
            }
        }
    }

    // Initial render
    renderFeeVoucher();

    // Rerender when changing the child
    if (childSelect) {
        childSelect.addEventListener('change', renderFeeVoucher);
    }
});
