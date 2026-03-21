// students.js - Handles the logic for managing student data in localStorage

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial State
    let students = JSON.parse(localStorage.getItem('alfaran-students'));
    if (!students || !Array.isArray(students)) {
        // Start with an empty array if no students are added yet
        students = [];
        // Ensure to save back right away
        localStorage.setItem('alfaran-students', JSON.stringify(students));
    }

    // 2. DOM Elements
    const tableBody = document.getElementById('student-table-body');
    if (!tableBody) return; // Only execute on pages with the table (admin portal)

    const modal = document.getElementById('student-modal');
    const form = document.getElementById('student-form');
    const title = document.getElementById('modal-title');
    const searchInput = document.getElementById('search-student');
    const filterFeeStatus = document.getElementById('filter-fee-status');
    const classTabs = document.querySelectorAll('.class-tab');

    let activeClassFilter = 'Playgroup'; // Default to first tab

    // Form fields
    const fId = document.getElementById('student-id');
    const fRoll = document.getElementById('student-roll');
    const fName = document.getElementById('student-name');
    const fClass = document.getElementById('student-class');
    const fFather = document.getElementById('student-father');
    const fFeeAmount = document.getElementById('student-fee-amount');
    const fFee = document.getElementById('student-fee');
    const fBForm = document.getElementById('student-bform');
    const fContact = document.getElementById('student-contact');
    const fPhotoInput = document.getElementById('student-photo-input');

    // 3. Render Table
    function renderTable() {
        const query = (searchInput.value || '').toLowerCase();
        const feeStatusQuery = filterFeeStatus?.value || '';

        tableBody.innerHTML = '';

        // Filter elements
        const filtered = students.filter(s => {
            const matchQuery = s.name.toLowerCase().includes(query) || s.roll.toLowerCase().includes(query);
            const matchClass = s.class === activeClassFilter;
            const matchFeeState = feeStatusQuery ? s.fee === feeStatusQuery : true;
            return matchQuery && matchClass && matchFeeState;
        });

        // Generate rows
        filtered.forEach(s => {
            let feeBadgeClass = 'status-paid';
            let interactiveStyle = '';

            if (s.fee === 'Pending') {
                feeBadgeClass = 'status-pending';
                interactiveStyle = 'cursor: pointer; opacity: 0.9; transition: 0.2s;';
            }
            if (s.fee === 'Unpaid') {
                feeBadgeClass = 'status-overdue';
                interactiveStyle = 'cursor: pointer; opacity: 0.9; transition: 0.2s;';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${s.roll}</td>
                <td style="font-weight: 500;">${s.name}</td>
                <td>${s.father}</td>
                <td style="font-size: 0.9rem; color: var(--secondary-color); font-weight: 500;">${s.contact || 'N/A'}</td>
                <td style="font-family: monospace; font-size: 0.95rem;">Rs ${s.feeAmount || 0}</td>
                <td>
                    <span class="status-badge ${feeBadgeClass} update-fee-badge" data-id="${s.id}" style="${interactiveStyle}" title="${s.fee !== 'Paid' ? 'Click to mark as Paid' : 'Paid on ' + (s.paymentDate || 'unknown')}">${s.fee}</span>
                </td>
                <td>
                    <button class="btn btn-outline id-card-btn" data-id="${s.id}" style="padding: 2px 8px; font-size: 0.8rem; color: var(--primary-color); border-color: var(--primary-color);" title="Print ID Card"><i class="fas fa-id-card"></i></button>
                    <button class="btn btn-outline edit-btn" data-id="${s.id}" style="padding: 2px 8px; font-size: 0.8rem; color: var(--secondary-color); border-color: var(--secondary-color);" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-outline delete-btn" data-id="${s.id}" style="padding: 2px 8px; font-size: 0.8rem; color: var(--danger-color); border-color: var(--danger-color);" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        // If no students match
        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-5">No students found matching your criteria in ${activeClassFilter}.</td></tr>`;
        }

        // Attach dynamic event listeners to buttons
        document.querySelectorAll('.id-card-btn').forEach(btn => btn.addEventListener('click', (e) => printIDCard(e.currentTarget.getAttribute('data-id'))));
        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', handleEdit));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', handleDelete));

        // Make unpaid/pending badges clickable
        document.querySelectorAll('.update-fee-badge').forEach(badge => {
            badge.addEventListener('click', handleFeeToggle);
        });

        // Update overview stats
        updateOverviewStats();

        // Dispatch custom event so the finance dashboard can stay in sync
        document.dispatchEvent(new Event('studentsDataUpdated'));
    }

    // 3.5 Update Overview Stats
    function updateOverviewStats() {
        // Elements from dashboard overview
        const totalStudentsEl = document.getElementById('overview-total-students');
        const collectedEl = document.getElementById('overview-total-collected');
        const pendingEl = document.getElementById('overview-total-pending');

        if (!totalStudentsEl) return; // Only execute if on admin overview

        let totalCollected = 0;
        let totalPending = 0;

        students.forEach(s => {
            if (s.fee === 'Paid') {
                totalCollected += (s.feeAmount || 0);
            } else {
                totalPending += (s.feeAmount || 0);
            }
        });

        totalStudentsEl.innerText = students.length;
        if (collectedEl) collectedEl.innerText = `Rs ${totalCollected.toLocaleString()}`;
        if (pendingEl) pendingEl.innerText = `Rs ${totalPending.toLocaleString()}`;
    }

    // 4. Data Operations
    function saveStudents() {
        localStorage.setItem('alfaran-students', JSON.stringify(students));
    }

    function openModal(editMode = false) {
        modal.style.display = 'flex';
        title.innerText = editMode ? 'Edit Student Details' : 'New Admission';
        if (!editMode) {
            form.reset();
            fId.value = '';
            if (fBForm) fBForm.value = '';
            if (fContact) fContact.value = '';
            if (fPhotoInput) fPhotoInput.value = '';
            // Hide parent credentials display on fresh admission
            if (document.getElementById('parent-credentials-view')) {
                document.getElementById('parent-credentials-view').style.display = 'none';
            }
        }
    }

    function closeModal() {
        modal.style.display = 'none';
        form.reset();
        // Hide on close too
        if (document.getElementById('parent-credentials-view')) {
            document.getElementById('parent-credentials-view').style.display = 'none';
        }
    }

    // Handle Form Submit (Add & Edit)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check for existing paymentDate so we don't overwrite it if standard edit
        let prevPaymentDate = null;
        let prevPhoto = '';
        let prevBForm = '';
        if (fId.value) {
            const existing = students.find(s => s.id === fId.value);
            if (existing) {
                prevPaymentDate = existing.paymentDate;
                prevPhoto = existing.photo || '';
                prevBForm = existing.bform || '';
                prevContact = existing.contact || '';
            }
        }

        // Handle Photo Upload
        const photoFile = fPhotoInput ? fPhotoInput.files[0] : null;
        let photoBase64 = prevPhoto;

        if (photoFile) {
            const fileToBase64 = (file) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
            try {
                photoBase64 = await fileToBase64(photoFile);
            } catch (err) {
                console.error("Photo upload failed:", err);
            }
        }

        // Auto-Generate Class-wise Roll Number if admin leaves it empty
        let finalRoll = fRoll.value.trim();
        
        if (!finalRoll && fClass.value) {
            const currentYear = new Date().getFullYear().toString().slice(-2);
            let classCode = '';
            switch(fClass.value) {
                case 'Playgroup': classCode = 'PG'; break;
                case 'Nursery': classCode = 'N'; break;
                case 'KG': classCode = 'P'; break; // Assuming Prep means KG
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
            
            // Allow same logic to count students in THAT class to find next serial
            const studentsInClass = students.filter(s => s.class === fClass.value);
            const nextSerial = (studentsInClass.length + 1).toString().padStart(2, '0');
            finalRoll = `FSE${currentYear}-${classCode}${nextSerial}`;
        }

        // Check if this student already has parent credentials (for edits)
        let parentId = null;
        let parentPassword = null;
        if (fId.value) {
            const existing = students.find(s => s.id === fId.value);
            if (existing) {
                parentId = existing.parentId;
                parentPassword = existing.parentPassword;
            }
        }

        // Auto-Generate Parent Credentials if they don't exist
        if (!parentId) {
            // Use Roll Number if available, else name/timestamp
            const rollPart = finalRoll ? finalRoll.replace(/[^a-zA-Z0-9]/g, '') : Math.floor(Math.random() * 10000);
            parentId = `P-${rollPart}`;
        }
        if (!parentPassword) {
            // Generate a simple 6-character random password
            parentPassword = Math.random().toString(36).slice(-6).toUpperCase();
        }

        const studentData = {
            id: fId.value || 'std_' + Date.now(),
            roll: finalRoll || ('STD-' + Math.floor(Math.random() * 10000)), // Fallback fallback
            name: fName.value,
            class: fClass.value,
            father: fFather.value,
            contact: fContact ? fContact.value : '',
            bform: fBForm ? fBForm.value : (prevBForm || ''),
            photo: photoBase64,
            feeAmount: parseInt(fFeeAmount.value) || 0,
            fee: fFee.value,
            paymentDate: fFee.value === 'Paid' ? (prevPaymentDate || new Date().toLocaleDateString()) : null,
            parentId: parentId,
            parentPassword: parentPassword
        };

        if (fId.value) {
            // Update existing
            const idx = students.findIndex(s => s.id === fId.value);
            if (idx > -1) students[idx] = studentData;
        } else {
            // Add new
            students.push(studentData);
        }

        saveStudents();
        closeModal();
        renderTable();
    });

    // Handle Edit Click
    function handleEdit(e) {
        const id = e.currentTarget.getAttribute('data-id');
        const student = students.find(s => s.id === id);
        if (student) {
            fId.value = student.id;
            fRoll.value = student.roll;
            fName.value = student.name;
            fClass.value = student.class;
            fFather.value = student.father || '';
            fFeeAmount.value = student.feeAmount || '';
            fFee.value = student.fee || 'Paid';
            if (fBForm) fBForm.value = student.bform || '';
            if (fContact) fContact.value = student.contact || '';
            
            // Populate parent credentials for admin visibility
            if (document.getElementById('parent-login-id')) {
                document.getElementById('parent-login-id').value = student.parentId || 'Auto-generated on save';
                document.getElementById('parent-login-pass').value = student.parentPassword || 'Auto-generated on save';
                document.getElementById('parent-credentials-view').style.display = 'block';
            }
            
            openModal(true);
        }
    }

    // Handle Quick Fee Toggle (From Unpaid/Pending to Paid)
    function handleFeeToggle(e) {
        const id = e.currentTarget.getAttribute('data-id');
        const student = students.find(s => s.id === id);
        if (student && student.fee !== 'Paid') {
            if (confirm(`Mark ${student.name}'s fee (Rs ${student.feeAmount}) as Paid?`)) {
                student.fee = 'Paid';
                student.paymentDate = new Date().toLocaleDateString();
                saveStudents();
                renderTable();
            }
        }
    }

    // Handle Delete Click
    function handleDelete(e) {
        if (confirm('Are you sure you want to delete this student record? This action cannot be undone.')) {
            const id = e.currentTarget.getAttribute('data-id');
            students = students.filter(s => s.id !== id);
            saveStudents();
            renderTable();
        }
    }

    // 5. Wire up static Event Listeners
    document.getElementById('btn-add-student')?.addEventListener('click', () => openModal(false));
    document.getElementById('btn-close-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-modal')?.addEventListener('click', closeModal);

    // Close modal if clicking outside the modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Filtering events
    searchInput?.addEventListener('input', renderTable);
    filterFeeStatus?.addEventListener('change', renderTable);

    // Tab Clicks
    classTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Remove active from all tabs
            classTabs.forEach(t => {
                t.classList.remove('active', 'btn-primary');
                // Ensure it retains btn-outline
                if (!t.classList.contains('btn-outline')) {
                    t.classList.add('btn-outline');
                }
            });

            // Add active to clicked tab
            e.currentTarget.classList.remove('btn-outline');
            e.currentTarget.classList.add('active', 'btn-primary');

            // Update filter and re-render
            activeClassFilter = e.currentTarget.getAttribute('data-class');
            renderTable();
        });
    });

    // 6. ID Card Generation
    window.printIDCard = function(id) {
        const student = students.find(s => s.id === id);
        if (!student) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Student ID Card - ${student.name}</title>
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Outfit', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f3f5; }
                    .id-card { 
                        width: 400px; 
                        height: 600px; 
                        background: white; 
                        border-radius: 30px; 
                        box-shadow: 0 25px 50px rgba(0,0,0,0.15); 
                        overflow: hidden; 
                        position: relative; 
                        border: 1px solid #e0e0e0;
                        display: flex;
                        flex-direction: column;
                    }
                    
                    /* Top Branding Bar */
                    .top-branding { 
                        background: #1a3c5d; 
                        padding: 20px 0 40px; 
                        text-align: center; 
                        color: white;
                    }
                    .school-name { font-size: 1.6rem; font-weight: 800; margin: 0; letter-spacing: 2px; }
                    .school-sub { font-size: 0.8rem; color: #f1c40f; font-weight: 600; text-transform: uppercase; letter-spacing: 3px; }
                    
                    /* Logo Overlay - Properly Circumscribed */
                    .logo-overlay {
                        width: 90px;
                        height: 90px;
                        background: white;
                        border-radius: 50%;
                        position: absolute;
                        top: 85px;
                        left: 50%;
                        transform: translateX(-50%);
                        border: 4px solid #f1c40f;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                        z-index: 10;
                        padding: 5px;
                    }
                    .logo-overlay img { 
                        width: 100%; 
                        height: 100%; 
                        object-fit: contain; 
                        border-radius: 50%;
                    }
                    
                    /* Identity Body */
                    .card-body { 
                        flex: 1; 
                        display: flex; 
                        flex-direction: column; 
                        align-items: center; 
                        background: #fff;
                        padding-top: 50px;
                    }
                    
                    .photo-frame { 
                        width: 160px; 
                        height: 180px; 
                        border-radius: 20px; 
                        border: 4px solid #1a3c5d; 
                        overflow: hidden; 
                        background: #f8f9fa;
                        box-shadow: 0 15px 30px rgba(0,0,0,0.08);
                        margin-bottom: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .photo-frame img { width: 100%; height: 100%; object-fit: cover; }
                    .no-photo { color: #cbd5e0; text-align: center; }
                    
                    .student-data { text-align: center; width: 100%; padding: 0 30px; }
                    .s-name { font-size: 1.8rem; font-weight: 800; color: #2d3748; margin: 0 0 5px; text-transform: uppercase; }
                    .s-roll { font-size: 1rem; color: #3498db; font-weight: 700; letter-spacing: 2px; margin-bottom: 20px; display: block; }
                    
                    .data-grid { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 15px; 
                        background: #f7fafc; 
                        padding: 15px; 
                        border-radius: 20px; 
                        border: 1px solid #edf2f7;
                        margin: 0 20px;
                    }
                    .data-item { text-align: left; }
                    .d-label { display: block; font-size: 0.65rem; color: #718096; font-weight: 700; text-transform: uppercase; }
                    .d-val { font-size: 0.95rem; color: #1a3c5d; font-weight: 600; }
                    
                    .signature-row { 
                        display: flex; 
                        justify-content: space-between; 
                        width: 100%; 
                        padding: 0 40px; 
                        margin-top: 25px; 
                    }
                    .sig-line { border-top: 2px solid #e2e8f0; width: 120px; text-align: center; padding-top: 5px; font-size: 0.6rem; font-weight: 700; color: #4a5568; }
                    
                    /* Footer Decorative */
                    .card-footer { 
                        background: #1a3c5d; 
                        padding: 15px; 
                        color: rgba(255,255,255,0.8); 
                        text-align: center; 
                        font-size: 0.75rem; 
                        font-weight: 600;
                        border-top: 5px solid #f1c40f;
                    }
                    
                    @media print {
                        body { background: white; padding: 0; }
                        .id-card { box-shadow: none; border: 2px solid #1a3c5d; position: absolute; top: 0; left: 0; -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="id-card">
                    <div class="top-branding">
                        <h1 class="school-name">AL-FARAN SCHOOL</h1>
                        <div class="school-sub">Of Excellence</div>
                    </div>
                    
                    <div class="logo-overlay">
                        <img src="assets/logo.png" alt="School Logo">
                    </div>
                    
                    <div class="card-body">
                        <div class="photo-frame">
                            ${student.photo ? `<img src="${student.photo}">` : '<div class="no-photo"><i class="fas fa-user-circle" style="font-size: 5rem;"></i><br><small>No Photo</small></div>'}
                        </div>
                        
                        <div class="student-data">
                            <h2 class="s-name">${student.name}</h2>
                            <span class="s-roll">${student.roll}</span>
                            
                            <div class="data-grid">
                                <div class="data-item">
                                    <span class="d-label">Class</span>
                                    <span class="d-val">${student.class}</span>
                                </div>
                                <div class="data-item">
                                    <span class="d-label">Section</span>
                                    <span class="d-val">A</span>
                                </div>
                                <div class="data-item" style="grid-column: span 2;">
                                    <span class="d-label">Parentage/Guardian</span>
                                    <span class="d-val">${student.father}</span>
                                </div>
                                <div class="data-item" style="grid-column: span 2;">
                                    <span class="d-label">Contact</span>
                                    <span class="d-val">${student.contact || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="signature-row">
                            <div class="sig-line">STUDENT SIGN</div>
                            <div class="sig-line">PRINCIPAL SIGN</div>
                        </div>
                    </div>
                    
                    <div class="card-footer">
                        Empowering Future Leaders with AI Education
                    </div>
                </div>
                <script>
                    window.onload = function() { 
                        setTimeout(() => { window.print(); }, 800);
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    // 7. Initial Render
    renderTable();
});
