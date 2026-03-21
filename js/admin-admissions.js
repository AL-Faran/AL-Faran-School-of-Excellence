// admin-admissions.js - Handles the Admissions Management tab in Admin Dashboard

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('admissions-table-body');
    if (!tableBody) return; // Only execute if the admissions table is present

    const searchInput = document.getElementById('search-admissions');
    const statusFilter = document.getElementById('filter-admission-status');

    let admissionsList = [];

    function loadAdmissions() {
        admissionsList = JSON.parse(localStorage.getItem('alfaran-admissions')) || [];
    }

    function saveAdmissions() {
        localStorage.setItem('alfaran-admissions', JSON.stringify(admissionsList));
        document.dispatchEvent(new Event('admissionsDataUpdated'));
    }

    function renderTable() {
        if (!tableBody) return;

        loadAdmissions();
        const query = (searchInput.value || '').toLowerCase();
        const filterStatus = statusFilter.value;

        tableBody.innerHTML = '';

        const filtered = admissionsList.filter(app => {
            const matchQuery = app.studentName.toLowerCase().includes(query);
            const matchStatus = filterStatus ? app.status === filterStatus : true;
            return matchQuery && matchStatus;
        });

        // Sort descending by date/id
        filtered.sort((a, b) => b.id.localeCompare(a.id));

        filtered.forEach(app => {
            let statusClass = 'status-pending';
            if (app.status === 'Admitted') statusClass = 'status-active'; // green
            if (app.status === 'Rejected') statusClass = 'status-danger'; // red (custom)
            if (app.status === 'Interview Scheduled') statusClass = 'status-warning'; // yellow

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 500;">${app.studentName}</td>
                <td>${app.appliedClass}</td>
                <td>${app.submissionDate}</td>
                <td>${app.whatsapp}</td>
                <td><span class="status-badge ${statusClass}" style="cursor: pointer;" onclick="changeStatus('${app.id}')" title="Click to change status">${app.status}</span></td>
                <td>
                    <button class="btn btn-outline" onclick="printForm('${app.id}')" style="padding: 2px 8px; font-size: 0.8rem; color: var(--text-muted); border-color: var(--border-color);" title="Print Form"><i class="fas fa-print"></i></button>
                    ${app.status !== 'Admitted' ? `<button class="btn btn-outline" onclick="approveAdmission('${app.id}')" style="padding: 2px 8px; font-size: 0.8rem; color: var(--success-color); border-color: var(--success-color);" title="Approve & Move to Students"><i class="fas fa-check"></i></button>` : ''}
                    <button class="btn btn-outline" onclick="deleteAdmission('${app.id}')" style="padding: 2px 8px; font-size: 0.8rem; color: var(--danger-color); border-color: var(--danger-color);" title="Delete Record"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-5">No admissions applications found.</td></tr>`;
        }
    }

    // Attach to global scope so inline onclick works
    window.changeStatus = function (id) {
        const statuses = ['Pending', 'Interview Scheduled', 'Admitted', 'Rejected'];
        const app = admissionsList.find(a => a.id === id);
        if (!app) return;

        let currentIndex = statuses.indexOf(app.status);
        let nextIndex = (currentIndex + 1) % statuses.length;
        app.status = statuses[nextIndex];

        saveAdmissions();
        renderTable();
    };

    // MODAL LOGIC FOR ADMISSION APPROVAL & FEE ENTRY
    const approveModal = document.getElementById('approve-admission-modal');
    const approveForm = document.getElementById('approve-admission-form');
    
    window.approveAdmission = function (id) {
        const app = admissionsList.find(a => a.id === id);
        if (!app) return;

        // Open Modal
        document.getElementById('approve-admission-id').value = id;
        document.getElementById('approve-student-name').innerText = `Set fee details for ${app.studentName}`;
        document.getElementById('approve-admission-fee').value = '';
        document.getElementById('approve-monthly-fee').value = '';
        
        approveModal.style.display = 'flex';
    };

    function closeApproveModal() {
        if(approveModal) approveModal.style.display = 'none';
        if(approveForm) approveForm.reset();
    }

    document.getElementById('btn-close-approve-modal')?.addEventListener('click', closeApproveModal);
    document.getElementById('btn-cancel-approve-modal')?.addEventListener('click', closeApproveModal);

    if (approveForm) {
        approveForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const admissionId = document.getElementById('approve-admission-id').value;
            const admissionFeeAmount = parseInt(document.getElementById('approve-admission-fee').value) || 0;
            const monthlyFeeAmount = parseInt(document.getElementById('approve-monthly-fee').value) || 0;

            const app = admissionsList.find(a => a.id === admissionId);
            if (!app) return;

            // 1. Mark as Admitted
            app.status = 'Admitted';
            saveAdmissions();

            // 2. Add to Students List
            let students = JSON.parse(localStorage.getItem('alfaran-students')) || [];

            // Map the applied class from admission form to exact format used in students.js tabs
            let mappedClass = app.appliedClass;
            const validClasses = ['Playgroup', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
            
            if (!validClasses.includes(mappedClass)) {
                const lowerApplied = mappedClass.toLowerCase();
                const matched = validClasses.find(c => lowerApplied.includes(c.toLowerCase().replace('class ', '')));
                if (matched) mappedClass = matched;
            }

            // Auto-Generate Class-wise Roll Number (e.g., FSE26-PG01)
            const currentYear = new Date().getFullYear().toString().slice(-2); // e.g., '26'
            let classCode = '';
            
            // Map the class to its code
            switch(mappedClass) {
                case 'Playgroup': classCode = 'PG'; break;
                case 'Nursery': classCode = 'N'; break;
                case 'KG': classCode = 'P'; break; 
                case 'Class 1': classCode = '1'; break;
                case 'Class 2': classCode = '2'; break;
                case 'Class 3': classCode = '3'; break;
                case 'Class 4': classCode = '4'; break;
                case 'Class 5': classCode = '5'; break;
                case 'Class 6': classCode = '6'; break;
                case 'Class 7': classCode = '7'; break;
                case 'Class 8': classCode = '8'; break;
                case 'Class 9': classCode = '9'; break;
                case 'Class 10': classCode = '10'; break;
                default: classCode = 'XX';
            }

            // Find how many students are currently in this class to determine the next serial number
            const studentsInClass = students.filter(s => s.class === mappedClass);
            const nextSerial = (studentsInClass.length + 1).toString().padStart(2, '0');
            
            const nextRollNum = `FSE${currentYear}-${classCode}${nextSerial}`;

            const newStudent = {
                id: 'std_' + Date.now(),
                roll: nextRollNum,
                name: app.studentName,
                class: mappedClass,
                father: app.fatherName,
                bform: app.bform || '',
                photo: app.studentPhoto || '',
                admissionFee: admissionFeeAmount, // Saved from modal
                feeAmount: monthlyFeeAmount,      // Saved from modal
                fee: 'Pending',
                paymentDate: null
            };

            students.push(newStudent);
            localStorage.setItem('alfaran-students', JSON.stringify(students));
            document.dispatchEvent(new Event('studentsDataUpdated')); // Notify other dashboards

            closeApproveModal();
            alert(`Student ${app.studentName} approved and added to Student Management successfully!`);
            
            // Reload to refresh the students.js cache and the view
            window.location.reload();
        });
    }

    window.printForm = function (id) {
        const app = admissionsList.find(a => a.id === id);
        if (!app) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Admission Form - ${app.studentName}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                    .header { text-align: center; border-bottom: 2px solid #2c3e50; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { margin: 0; color: #2c3e50; }
                    .header p { margin: 5px 0; color: #7f8c8d; }
                    .section { margin-bottom: 30px; }
                    .section h3 { border-bottom: 1px solid #eee; padding-bottom: 5px; color: #2980b9; }
                    .row { display: flex; flex-wrap: wrap; margin-bottom: 10px; }
                    .col { flex: 1; min-width: 250px; margin-bottom: 10px; }
                    .label { font-weight: bold; font-size: 0.9em; color: #7f8c8d; display: block; }
                    .value { font-size: 1.1em; }
                    .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px dashed #ccc; font-size: 0.9em; color: #7f8c8d; }
                    .photo-container { position: absolute; top: 40px; right: 40px; width: 120px; height: 150px; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #f9f9f9; }
                    .photo-container img { max-width: 100%; max-height: 100%; object-fit: cover; }
                    .photo-placeholder { font-size: 0.8em; color: #999; text-align: center; padding: 10px; }
                </style>
            </head>
            <body>
                <div class="photo-container">
                    ${app.studentPhoto ? `<img src="${app.studentPhoto}" alt="Student Photo">` : '<div class="photo-placeholder">No Photo<br>Available</div>'}
                </div>
                <div class="header">
                    <h1>AL-Faran School of Excellence</h1>
                    <p>Official Admission Application Form</p>
                    <p><strong>Application ID:</strong> ${app.id} | <strong>Date:</strong> ${app.submissionDate}</p>
                </div>

                <div class="section">
                    <h3>1. Student Details</h3>
                    <div class="row">
                        <div class="col"><span class="label">Full Name</span><span class="value">${app.studentName}</span></div>
                        <div class="col"><span class="label">Date of Birth</span><span class="value">${app.dob || '-'}</span></div>
                        <div class="col"><span class="label">B-Form Number</span><span class="value">${app.bform || '-'}</span></div>
                        <div class="col"><span class="label">Gender</span><span class="value">${app.gender || '-'}</span></div>
                    </div>
                    <div class="row">
                        <div class="col"><span class="label">Place of Birth</span><span class="value">${app.pob || '-'}</span></div>
                        <div class="col"><span class="label">Previous School & Grade</span><span class="value">${app.prevSchool || '-'}</span></div>
                    </div>
                </div>

                <div class="section">
                    <h3>2. Parent/Guardian Details</h3>
                    <div class="row">
                        <div class="col"><span class="label">Father's Name</span><span class="value">${app.fatherName}</span></div>
                        <div class="col"><span class="label">Mother's Name</span><span class="value">${app.motherName || '-'}</span></div>
                    </div>
                    <div class="row">
                        <div class="col"><span class="label">CNIC Number</span><span class="value">${app.cnic || '-'}</span></div>
                        <div class="col"><span class="label">Occupation</span><span class="value">${app.occupation || '-'}</span></div>
                        <div class="col"><span class="label">Annual Income</span><span class="value">${app.income || '-'}</span></div>
                    </div>
                </div>

                <div class="section">
                    <h3>3. Contact Details</h3>
                    <div class="row">
                        <div class="col"><span class="label">Primary WhatsApp</span><span class="value">${app.whatsapp}</span></div>
                        <div class="col"><span class="label">Emergency Contact</span><span class="value">${app.emergencyContact || '-'}</span></div>
                    </div>
                    <div class="row">
                        <div class="col"><span class="label">Current Address</span><span class="value">${app.currentAddress || '-'}</span></div>
                    </div>
                    <div class="row">
                        <div class="col"><span class="label">Permanent Address</span><span class="value">${app.permanentAddress || '-'}</span></div>
                    </div>
                </div>

                <div class="section">
                    <h3>4. Admission Details</h3>
                    <div class="row">
                        <div class="col"><span class="label">Class Applied For</span><span class="value"><strong>${app.appliedClass}</strong></span></div>
                        <div class="col"><span class="label">Academic Year</span><span class="value">${app.academicYear || '-'}</span></div>
                        <div class="col"><span class="label">Transport Required</span><span class="value">${app.transport || 'No'}</span></div>
                    </div>
                </div>

                <div class="footer">
                    <p>This is a system generated document.</p>
                    <p>Current Status: <strong>${app.status.toUpperCase()}</strong></p>
                </div>

                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    window.deleteAdmission = function (id) {
        if (confirm('Are you sure you want to completely delete this application record?')) {
            admissionsList = admissionsList.filter(a => a.id !== id);
            saveAdmissions();
            renderTable();
        }
    };

    // Event listeners for filters
    if (searchInput) searchInput.addEventListener('input', renderTable);
    if (statusFilter) statusFilter.addEventListener('change', renderTable);

    // Initial render
    renderTable();
});
