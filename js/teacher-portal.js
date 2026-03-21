/**
 * teacher-portal.js
 * Handles dynamic rendering of teacher dashboard based on assigned classes and subjects.
 */

document.addEventListener('DOMContentLoaded', () => {
    const teacherId = sessionStorage.getItem('currentTeacherId');
    const teacherName = sessionStorage.getItem('currentTeacherName');
    const timetableContainer = document.getElementById('timetable-container');

    if (!teacherId || !timetableContainer) return;

    // 1. Fetch Teacher Data
    const teachers = JSON.parse(localStorage.getItem('alfaran-teachers')) || [];
    const myData = teachers.find(t => t.empId === teacherId || t.name === teacherName);

    if (!myData) {
        timetableContainer.innerHTML = '<div class="text-center p-5 text-muted">Profile data not found. Please contact Admin.</div>';
        return;
    }

    // 2. Populate Class Dropdowns (Attendance & Marks)
    function populateDropdowns() {
        const attendanceSelect = document.getElementById('attendance-class');
        const marksSelect = document.getElementById('marks-class');
        
        if (!attendanceSelect || !marksSelect) return;

        const assignedClass = myData.assignedClass || '';
        
        let classesToDisplay = [];
        if (assignedClass === 'Multiple') {
            classesToDisplay = ['Playgroup', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
        } else if (assignedClass) {
            classesToDisplay = [assignedClass];
        }

        const selects = [attendanceSelect, marksSelect];
        selects.forEach(sel => {
            const originalValue = sel.value;
            sel.innerHTML = `<option value="" disabled ${!originalValue ? 'selected' : ''}>Select My Class...</option>`;
            classesToDisplay.forEach(cls => {
                const opt = document.createElement('option');
                opt.value = cls;
                opt.textContent = cls;
                sel.appendChild(opt);
            });
            if (originalValue) sel.value = originalValue;
        });
    }

    // 3. Render Timetable
    function renderTimetable() {
        const assignedClass = myData.assignedClass || 'No Class Assigned';
        const assignedSubjects = myData.assignedSubjects || 'No Subjects Assigned';
        
        // Split subjects if multiple
        const subjectsList = assignedSubjects.split(',').map(s => s.trim());
        
        // Generate mock slots for demonstration based on assignments
        // In a real app, this would come from a separate timetable database
        timetableContainer.innerHTML = '';
        
        subjectsList.forEach((subject, index) => {
            const timeSlots = [
                { start: '08:00', end: '08:45' },
                { start: '09:00', end: '09:45' },
                { start: '10:00', end: '10:45' },
                { start: '11:00', end: '11:45' }
            ];
            
            const slot = timeSlots[index % timeSlots.length];
            
            const card = document.createElement('div');
            card.className = 'chart-card';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <h3 class="mb-1 text-primary">${assignedClass}</h3>
                        <p class="text-muted" style="font-size: 0.9rem;">Subject: ${subject}</p>
                    </div>
                    <div style="background: rgba(243, 156, 18, 0.2); color: var(--secondary-color); padding: 0.5rem; border-radius: var(--radius-md); font-size: 0.85rem;">
                        <i class="fas fa-clock mr-1"></i> ${slot.start} - ${slot.end}
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                    <button class="btn btn-outline flex-fill text-center" style="padding: 6px; font-size: 0.85rem;" 
                        onclick="switchView('attendance', this)">
                        <i class="fas fa-check-square mr-1"></i> Attendance
                    </button>
                    <button class="btn btn-primary flex-fill text-center" style="padding: 6px; font-size: 0.85rem;"
                        onclick="switchView('homework', this)">
                        <i class="fas fa-upload mr-1"></i> Assign
                    </button>
                </div>
            `;
            timetableContainer.appendChild(card);
        });

        if (subjectsList.length === 0 || assignedSubjects === 'No Subjects Assigned') {
            timetableContainer.innerHTML = '<div class="text-center p-5 text-muted">No classes scheduled.</div>';
        }
    }

    // Supporting function for internal dashboard navigation if needed
    window.switchView = function(viewId, btn) {
        const navLink = document.querySelector(`.nav-link-item[data-target="${viewId}"]`);
        if (navLink) navLink.click();
    };

    populateDropdowns();
    renderTimetable();
});
