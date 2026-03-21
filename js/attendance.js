// attendance.js - Handles the Attendance Management System for the Teacher Dashboard

document.addEventListener('DOMContentLoaded', () => {

    // Core Elements
    const classSelect = document.getElementById('attendance-class');
    const loadBtn = document.getElementById('load-roster-btn');
    const selectAllBtn = document.getElementById('select-all-btn');
    const submitBtn = document.getElementById('submit-attendance-btn');
    const tableBody = document.getElementById('attendance-table-body');
    const summaryContainer = document.getElementById('attendance-summary-container');
    const whatsappBtn = document.getElementById('export-whatsapp-btn');
    const whatsappClipboard = document.getElementById('whatsapp-clipboard');

    // Summary Elements
    const totalEl = document.getElementById('summary-total');
    const presentEl = document.getElementById('summary-present');
    const absentEl = document.getElementById('summary-absent');

    if (!tableBody) return; // Only run on teacher attendance page

    let currentRoster = [];

    // Load Roster for Selected Class
    loadBtn.addEventListener('click', () => {
        const selectedClass = classSelect.value;
        if (!selectedClass) {
            alert('Please select a class first.');
            return;
        }

        // Fetch students from localStorage
        const allStudents = JSON.parse(localStorage.getItem('alfaran-students')) || [];

        // Filter by class
        currentRoster = allStudents.filter(s => s.class === selectedClass);

        if (currentRoster.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-5">No students found in ${selectedClass}.</td></tr>`;
            summaryContainer.style.display = 'none';
            return;
        }

        // Render Roster
        tableBody.innerHTML = '';
        currentRoster.forEach(student => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', student.id);
            // Default styling
            tr.innerHTML = `
                <td>${student.roll}</td>
                <td style="font-weight: 500;">${student.name}</td>
                <td>${student.father || 'N/A'}</td>
                <td style="text-align: center;">
                    <input type="radio" name="att_${student.id}" value="P" class="att-radio-p" 
                        style="accent-color: var(--success-color); transform: scale(1.4); cursor: pointer;">
                </td>
                <td style="text-align: center;">
                    <input type="radio" name="att_${student.id}" value="A" class="att-radio-a" 
                        style="accent-color: var(--danger-color); transform: scale(1.4); cursor: pointer;">
                </td>
                <td>
                    <input type="text" class="form-control att-remarks" style="padding: 4px 8px; height: 30px; font-size: 0.85rem;" placeholder="Optional">
                </td>
            `;
            tableBody.appendChild(tr);

            // Add visual event listeners to the radios for the row background
            const row = tableBody.lastChild;
            const radioP = row.querySelector('.att-radio-p');
            const radioA = row.querySelector('.att-radio-a');

            const handleRowColor = () => {
                if (radioA.checked) {
                    row.style.background = 'rgba(231, 76, 60, 0.1)'; // Light Red for Absent
                    row.style.transition = '0.3s';
                } else {
                    row.style.background = '';
                }
            };

            radioP.addEventListener('change', handleRowColor);
            radioA.addEventListener('change', handleRowColor);
        });

        // Hide summary until submitted
        summaryContainer.style.display = 'none';
    });

    // Select All Present Shortcut
    selectAllBtn.addEventListener('click', () => {
        if (currentRoster.length === 0) return;

        const presentRadios = document.querySelectorAll('.att-radio-p');
        presentRadios.forEach(radio => {
            radio.checked = true;
            // Trigger change event to fix row background if they were absent
            radio.dispatchEvent(new Event('change'));
        });
    });

    // Submit Attendance & Generate Report
    submitBtn.addEventListener('click', () => {
        if (currentRoster.length === 0) {
            alert('Please load a class roster first.');
            return;
        }

        let total = currentRoster.length;
        let present = 0;
        let absent = 0;
        let missing = 0;

        let absentStudents = [];

        let attendanceHistory = JSON.parse(localStorage.getItem('alfaran-attendance-history')) || [];
        const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        currentRoster.forEach(student => {
            const radioP = document.querySelector(`input[name="att_${student.id}"][value="P"]`);
            const radioA = document.querySelector(`input[name="att_${student.id}"][value="A"]`);
            const remarksInput = document.querySelector(`input[name="att_${student.id}"]`).closest('tr').querySelector('.att-remarks');

            let status = null;

            if (radioP && radioP.checked) {
                present++;
                status = 'Present';
            } else if (radioA && radioA.checked) {
                absent++;
                status = 'Absent';
                absentStudents.push({
                    name: student.name,
                    father: student.father || 'N/A',
                    roll: student.roll,
                    remarks: remarksInput.value || 'No Reason'
                });
            } else {
                missing++;
            }

            if (status) {
                const record = {
                    studentId: student.id,
                    studentName: student.name,
                    class: classSelect.value,
                    date: dateStr,
                    rawDate: new Date().toISOString(),
                    status: status,
                    remarks: remarksInput.value || ''
                };

                // Remove existing record for this date if rewriting
                attendanceHistory = attendanceHistory.filter(r => !(r.studentId === student.id && r.date === dateStr));
                attendanceHistory.push(record);
            }
        });

        if (missing > 0) {
            alert(`You have missed ${missing} student(s). Please mark everyone as Present or Absent.`);
            return;
        }

        // Save to LocalStorage
        localStorage.setItem('alfaran-attendance-history', JSON.stringify(attendanceHistory));
        document.dispatchEvent(new Event('attendanceDataUpdated'));

        // Update Stats UI
        totalEl.innerText = total;
        presentEl.innerText = present;
        absentEl.innerText = absent;

        // Generate WhatsApp Formatted Text
        const selectedClass = classSelect.value;

        let waText = `*Al-Faran School of Excellence*\n`;
        waText += `*Attendance Report*\n`;
        waText += `📅 Date: ${dateStr}\n`;
        waText += `🏫 Class: ${selectedClass}\n`;
        waText += `-------------------\n`;
        waText += `📊 Total Students: ${total}\n`;
        waText += `✅ Present: ${present}\n`;
        waText += `❌ Absent: ${absent}\n`;
        waText += `-------------------\n`;

        if (absent > 0) {
            waText += `*Absentee List:*\n`;
            absentStudents.forEach((s, i) => {
                waText += `${i + 1}. ${s.name} (S/O ${s.father}) - Roll: ${s.roll}\n`;
            });
        } else {
            waText += `*Excellent! 100% Attendance today!*\n`;
        }

        whatsappClipboard.value = waText;

        // Show summary container smoothly
        summaryContainer.style.display = 'block';
        summaryContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });

    // Copy to Clipboard feature
    whatsappBtn.addEventListener('click', () => {
        whatsappClipboard.select();
        whatsappClipboard.setSelectionRange(0, 99999); // For mobile devices

        try {
            document.execCommand('copy');
            const originalText = whatsappBtn.innerHTML;
            whatsappBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Copied!';
            whatsappBtn.classList.replace('btn-success', 'btn-outline');
            whatsappBtn.style.color = 'var(--success-color)';

            setTimeout(() => {
                whatsappBtn.innerHTML = originalText;
                whatsappBtn.classList.replace('btn-outline', 'btn-success');
                whatsappBtn.style.color = '';
            }, 3000);
        } catch (e) {
            alert("Failed to copy text. Please try manually copying.");
        }
    });

});
