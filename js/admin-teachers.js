// admin-teachers.js - Handles the logic for managing Staff & Teachers data in localStorage

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial State
    let teachers = JSON.parse(localStorage.getItem('alfaran-teachers'));
    if (!teachers || !Array.isArray(teachers)) {
        teachers = [];
        localStorage.setItem('alfaran-teachers', JSON.stringify(teachers));
    }

    // 2. DOM Elements
    const tableBody = document.getElementById('teacher-table-body');
    if (!tableBody) return; // Only run on pages with the teacher table

    const modal = document.getElementById('teacher-modal');
    const form = document.getElementById('teacher-form');
    const title = document.getElementById('teacher-modal-title');
    const searchInput = document.getElementById('search-teacher');
    const statusFilter = document.getElementById('filter-teacher-status');
    const credsContainer = document.getElementById('teacher-generated-creds-container');

    // Form fields
    const fId = document.getElementById('teacher-id');
    const fName = document.getElementById('teacher-name');
    const fSubject = document.getElementById('teacher-subject');
    const fDesignation = document.getElementById('teacher-designation');
    const fIncharge = document.getElementById('teacher-incharge');
    const fAssignedClass = document.getElementById('teacher-assigned-class');
    const fAssignedSubjects = document.getElementById('teacher-assigned-subjects');
    const fPhone = document.getElementById('teacher-phone');
    const fEmail = document.getElementById('teacher-email');
    const fSalary = document.getElementById('teacher-salary');
    const fStatus = document.getElementById('teacher-status');
    const fGenId = document.getElementById('teacher-gen-id');
    const fGenPass = document.getElementById('teacher-gen-pass');

    // Stats Elements
    const statActive = document.getElementById('teacher-total-active');
    const statInactive = document.getElementById('teacher-total-inactive');

    // 3. Data Generation Utils
    function generateId() {
        const currentYear = new Date().getFullYear().toString().slice(-2);
        // Find highest existing ID to increment
        let maxSerial = 0;
        teachers.forEach(t => {
            // Check for both old (TCH-) and new (FSE-) formats to ensure unique serials
            if (t.empId && (t.empId.startsWith(`FSE-${currentYear}`) || t.empId.startsWith(`TCH-${currentYear}`))) {
                const parts = t.empId.split('-');
                const serialPart = parts[parts.length - 1]; // Get '2601' part
                const num = parseInt(serialPart.slice(-2), 10); // Get '01' part
                if (num > maxSerial) maxSerial = num;
            }
        });
        const nextSerial = (maxSerial + 1).toString().padStart(2, '0');
        return `FSE-${currentYear}${nextSerial}`; // e.g., FSE-2601
    }

    function generatePassword() {
        // Simple random password generator (e.g., alfaran4812)
        return 'alfaran' + Math.floor(1000 + Math.random() * 9000);
    }

    // 4. Render Table
    function renderTable() {
        const query = (searchInput.value || '').toLowerCase();
        const filterStatus = statusFilter.value;

        tableBody.innerHTML = '';

        let activeCount = 0;
        let inactiveCount = 0;

        // Calculate total stats regardless of filter
        teachers.forEach(t => {
            if (t.status === 'Active') activeCount++;
            else inactiveCount++;
        });

        if (statActive) statActive.innerText = activeCount;
        if (statInactive) statInactive.innerText = inactiveCount;

        // Update Dashboard Main Overview stat
        const overviewTotalTeachers = document.getElementById('overview-total-teachers');
        if (overviewTotalTeachers) {
            overviewTotalTeachers.innerText = activeCount;
        }

        // Filter elements
        const filtered = teachers.filter(t => {
            const matchQuery = t.name.toLowerCase().includes(query) || 
                               t.empId.toLowerCase().includes(query) ||
                               t.subject.toLowerCase().includes(query);
            const matchStatus = filterStatus === 'All' ? true : t.status === filterStatus;
            return matchQuery && matchStatus;
        });

        // Generate rows
        filtered.forEach(t => {
            // Determine badge colors
            let statusBadgeClass = t.status === 'Active' ? 'status-active' : 'status-danger';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-family: monospace; font-weight: 500;">${t.empId}</td>
                <td style="font-weight: 500;">${t.name}</td>
                <td style="font-size: 0.9rem;">${t.designation || 'Staff'} ${t.incharge === 'Yes' ? '<span style="color:var(--primary-color); font-weight:700;">(Incharge)</span>' : ''}</td>
                <td>${t.subject}</td>
                <td>${t.phone}</td>
                <td><span class="status-badge ${statusBadgeClass}">${t.status}</span></td>
                <td>
                    <button class="btn btn-outline edit-btn" data-id="${t.id}" style="padding: 2px 8px; font-size: 0.8rem; color: var(--secondary-color); border-color: var(--secondary-color);" title="Edit / View Credentials"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-outline delete-btn" data-id="${t.id}" style="padding: 2px 8px; font-size: 0.8rem; color: var(--danger-color); border-color: var(--danger-color);" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-5">No staff records found.</td></tr>`;
        }

        // Attach event listeners to buttons
        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', handleEdit));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', handleDelete));

        // Dispatch custom event to notify Dashboard Overview
        document.dispatchEvent(new Event('teachersDataUpdated'));
    }

    // 5. Data Operations
    function saveTeachers() {
        localStorage.setItem('alfaran-teachers', JSON.stringify(teachers));
    }

    function openModal(editMode = false) {
        modal.style.display = 'flex';
        title.innerText = editMode ? 'Edit Staff Details' : 'New Staff Member';
        
        if (!editMode) {
            form.reset();
            fId.value = '';
            // Auto generate creds early to show in form
            fGenId.value = generateId();
            fGenPass.value = generatePassword();
            credsContainer.style.display = 'block';
        } else {
            credsContainer.style.display = 'block'; // Ensure it's shown during edit to reveal password
        }
    }

    function closeModal() {
        modal.style.display = 'none';
        form.reset();
        fGenPass.type = 'password'; // Reset password field type
    }

    // Handle Form Submit (Add & Edit)
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const teacherData = {
            id: fId.value || 'tch_' + Date.now(),
            empId: fGenId.value, // Taken from the readonly field
            password: fGenPass.value, // Taken from the readonly field
            name: fName.value,
            designation: fDesignation.value,
            incharge: fIncharge.value,
            assignedClass: fAssignedClass.value,
            assignedSubjects: fAssignedSubjects.value,
            subject: fSubject.value,
            phone: fPhone.value,
            email: fEmail.value || '',
            salary: parseInt(fSalary.value) || 0,
            status: fStatus.value
        };

        if (fId.value) {
            // Update existing
            const idx = teachers.findIndex(t => t.id === fId.value);
            if (idx > -1) teachers[idx] = teacherData;
        } else {
            // Add new
            teachers.push(teacherData);
        }

        saveTeachers();
        closeModal();
        renderTable();
    });

    // Handle Edit Click
    function handleEdit(e) {
        const id = e.currentTarget.getAttribute('data-id');
        const t = teachers.find(t => t.id === id);
        if (t) {
            fId.value = t.id;
            fName.value = t.name;
            fDesignation.value = t.designation || '';
            fIncharge.value = t.incharge || 'No';
            fAssignedClass.value = t.assignedClass || '';
            fAssignedSubjects.value = t.assignedSubjects || '';
            fSubject.value = t.subject;
            fPhone.value = t.phone;
            fEmail.value = t.email;
            fSalary.value = t.salary;
            fStatus.value = t.status;
            
            // Populate credentials
            fGenId.value = t.empId;
            fGenPass.value = t.password || generatePassword(); // Fallback if old record has no pass
            
            openModal(true);
        }
    }

    // Handle Delete Click
    function handleDelete(e) {
        if (confirm('Are you sure you want to completely remove this staff member? This action cannot be undone.')) {
            const id = e.currentTarget.getAttribute('data-id');
            teachers = teachers.filter(t => t.id !== id);
            saveTeachers();
            renderTable();
        }
    }

    // 6. Wire up static Event Listeners
    document.getElementById('btn-add-teacher')?.addEventListener('click', () => openModal(false));
    document.getElementById('btn-close-teacher-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-teacher-modal')?.addEventListener('click', closeModal);

    // Close modal if clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Filtering events
    searchInput?.addEventListener('input', renderTable);
    statusFilter?.addEventListener('change', renderTable);

    // 7. Initial Render
    renderTable();
});
