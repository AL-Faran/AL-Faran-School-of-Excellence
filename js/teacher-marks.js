/**
 * teacher-marks.js
 * Handles student results entry for teachers.
 */

document.addEventListener('DOMContentLoaded', () => {
    const marksForm = document.getElementById('teacher-result-form');
    if (!marksForm) return;

    const classSelect = document.getElementById('marks-class');
    const studentSelect = document.getElementById('marks-student');
    const examSelect = document.getElementById('teacher-exam-type');
    const tableBody = document.getElementById('teacher-marks-body');
    const remarksInput = document.getElementById('teacher-remarks');

    // 1. Populate Subject Table (All subjects, but focused on teacher's assignments)
    const teacherId = sessionStorage.getItem('currentTeacherId');
    const teachers = JSON.parse(localStorage.getItem('alfaran-teachers')) || [];
    const myData = teachers.find(t => t.empId === teacherId);
    
    // Standard subjects list
    const standardSubjects = ['Mathematics', 'Science', 'English', 'Urdu', 'Islamia', 'Social Studies', 'Computer', 'General Knowledge'];
    
    function renderSubjectTable() {
        tableBody.innerHTML = '';
        standardSubjects.forEach(sub => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 500;">${sub}</td>
                <td><input type="number" class="form-control mark-total" value="100" style="width: 80px;"></td>
                <td><input type="number" class="form-control mark-obtained" data-subject="${sub}" placeholder="0" style="width: 80px;"></td>
            `;
            tableBody.appendChild(tr);
        });
    }

    renderSubjectTable();

    // 2. Populate Students when Class changes
    classSelect.addEventListener('change', () => {
        const selectedClass = classSelect.value;
        const allStudents = JSON.parse(localStorage.getItem('alfaran-students')) || [];
        const roster = allStudents.filter(s => s.class === selectedClass);

        studentSelect.innerHTML = '<option value="" disabled selected>Select Student...</option>';
        
        if (roster.length === 0) {
            studentSelect.innerHTML = '<option value="" disabled>No students found</option>';
            studentSelect.disabled = true;
            return;
        }

        roster.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = `${s.name} (Roll: ${s.roll})`;
            opt.dataset.name = s.name;
            studentSelect.appendChild(opt);
        });
        studentSelect.disabled = false;
    });

    // 3. Handle Form Submission
    marksForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const studentId = studentSelect.value;
        const examType = examSelect.value;
        const selectedClass = classSelect.value;
        const studentName = studentSelect.options[studentSelect.selectedIndex].dataset.name;

        if (!studentId || !examType || !selectedClass) {
            alert('Please complete all selection fields.');
            return;
        }

        // Gather Marks
        const marksInputs = document.querySelectorAll('.mark-obtained');
        const subjectsData = [];
        let totalMax = 0;
        let totalObtained = 0;

        marksInputs.forEach(input => {
            const subject = input.dataset.subject;
            const obtained = parseInt(input.value) || 0;
            const total = parseInt(input.closest('tr').querySelector('.mark-total').value) || 100;

            totalMax += total;
            totalObtained += obtained;
            subjectsData.push({ subject, total, obtained });
        });

        const percentage = ((totalObtained / totalMax) * 100).toFixed(1);
        let grade = 'F';
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';
        else if (percentage >= 50) grade = 'D';

        const record = {
            id: 'res_' + Date.now(),
            studentId,
            studentName,
            class: selectedClass,
            examType,
            dateRecorded: new Date().toISOString(),
            subjects: subjectsData,
            totalMax,
            totalObtained,
            percentage: parseFloat(percentage),
            grade,
            remarks: remarksInput.value.trim(),
            recordedBy: myData ? myData.name : 'Teacher'
        };

        // Save
        let allResults = JSON.parse(localStorage.getItem('alfaran-results')) || [];
        // Replace if exists for same student/exam
        allResults = allResults.filter(r => !(r.studentId === studentId && r.examType === examType));
        allResults.push(record);
        localStorage.setItem('alfaran-results', JSON.stringify(allResults));

        alert(`Successfully saved results for ${studentName}. Grade: ${grade}`);
        marksForm.reset();
        renderSubjectTable();
        studentSelect.innerHTML = '<option value="" disabled selected>Select Class First...</option>';
        studentSelect.disabled = true;
    });
});
