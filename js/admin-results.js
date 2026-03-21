// admin-results.js - Handler for submitting and saving Exam Results in Admin Dashboard

document.addEventListener('DOMContentLoaded', () => {

    const resultsForm = document.getElementById('result-entry-form');
    if (!resultsForm) return; // Only run on admin dashboard where form exists

    const classSelect = document.getElementById('result-class');
    const studentSelect = document.getElementById('result-student');
    const examSelect = document.getElementById('result-exam-type');
    const remarksInput = document.getElementById('result-remarks');

    // Dynamically Populate Students when Class changes
    classSelect.addEventListener('change', () => {
        const selectedClass = classSelect.value;
        const allStudents = JSON.parse(localStorage.getItem('alfaran-students')) || [];
        const classRoster = allStudents.filter(s => s.class === selectedClass);

        studentSelect.innerHTML = '<option value="" disabled selected>Select Student...</option>';

        if (classRoster.length === 0) {
            studentSelect.innerHTML = '<option value="" disabled>No students found</option>';
            studentSelect.disabled = true;
            return;
        }

        classRoster.forEach(student => {
            const opt = document.createElement('option');
            opt.value = student.id;
            opt.innerText = `${student.name} (Roll: ${student.roll})`;
            // Attach full object string as data for easy bridging later
            opt.dataset.studentName = student.name;
            opt.dataset.roll = student.roll;
            studentSelect.appendChild(opt);
        });

        studentSelect.disabled = false;
    });

    // Handle Form Submission
    resultsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate selections
        const studentId = studentSelect.value;
        const examType = examSelect.value;
        const studentName = studentSelect.options[studentSelect.selectedIndex].dataset.studentName;

        if (!studentId || !examType) {
            alert("Please select Exam Term, Class, and Student.");
            return;
        }

        // Collect Marks
        const marksInputs = document.querySelectorAll('.mark-obtained');
        const subjectsData = [];
        let totalMax = 0;
        let totalObtained = 0;

        marksInputs.forEach(input => {
            const subject = input.dataset.subject;
            const obtained = parseInt(input.value) || 0;
            // Get total from previous sibling element
            const tr = input.closest('tr');
            const total = parseInt(tr.querySelector('.mark-total').value);

            totalMax += total;
            totalObtained += obtained;

            subjectsData.push({
                subject: subject,
                total: total,
                obtained: obtained
            });
        });

        // 1. Calculate Percentage
        let percentage = ((totalObtained / totalMax) * 100).toFixed(1);

        // 2. Calculate Overall Grade
        let finalGrade = 'F';
        if (percentage >= 90) finalGrade = 'A+';
        else if (percentage >= 80) finalGrade = 'A';
        else if (percentage >= 70) finalGrade = 'B';
        else if (percentage >= 60) finalGrade = 'C';
        else if (percentage >= 50) finalGrade = 'D';

        // 3. Build Record Object
        const resultRecord = {
            id: 'res_' + Date.now(),
            studentId: studentId,
            studentName: studentName,
            class: classSelect.value,
            examType: examType,
            dateRecorded: new Date().toISOString(),
            subjects: subjectsData,
            totalMax: totalMax,
            totalObtained: totalObtained,
            percentage: parseFloat(percentage),
            grade: finalGrade,
            remarks: remarksInput.value.trim()
        };

        // 4. Save to LocalStorage
        let allResults = JSON.parse(localStorage.getItem('alfaran-results')) || [];

        // Remove any existing duplicate record for this specific student + exam
        allResults = allResults.filter(r => !(r.studentId === studentId && r.examType === examType));
        allResults.push(resultRecord);

        localStorage.setItem('alfaran-results', JSON.stringify(allResults));

        // Let user know
        alert(`Success! Result Card for ${studentName} (${examType}) has been saved. Grade: ${finalGrade}`);

        // Reset form but keep class selection for workflow speed
        const currentClass = classSelect.value;
        resultsForm.reset();
        classSelect.value = currentClass;
        // Trigger change to reload students
        classSelect.dispatchEvent(new Event('change'));
    });

});
