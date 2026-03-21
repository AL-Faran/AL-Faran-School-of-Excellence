// teacher-curriculum.js - Logic for managing Science Curriculum across Elementary, Secondary, and Higher Secondary levels.

document.addEventListener('DOMContentLoaded', () => {

    const formUploadResource = document.getElementById('form-upload-resource');
    const formScheduleLive = document.getElementById('form-schedule-live');
    const tbCurriculumList = document.getElementById('tb-curriculum-list');

    // Only run if the elements exist on the page
    if (!formUploadResource || !formScheduleLive || !tbCurriculumList) return;

    // Load initial data structure if empty
    if (!localStorage.getItem('alfaran-curriculum')) {
        const initialCurriculum = [
            {
                id: Date.now() - 500000,
                type: 'Lecture Slides (PPT)',
                level: 'Secondary',
                subject: 'Physics',
                title: 'Chapter 1: Kinematics Introduction',
                url: 'https://docs.google.com/presentation/d/123456789',
                timestamp: new Date().toISOString()
            },
            {
                id: Date.now() - 300000,
                type: 'Virtual Lab',
                level: 'Higher',
                subject: 'Chemistry',
                title: 'Titration Simulation',
                url: 'https://www.youtube.com/watch?v=123456',
                timestamp: new Date().toISOString()
            }
        ];
        localStorage.setItem('alfaran-curriculum', JSON.stringify(initialCurriculum));
    }

    // Function to visually render the current list in the Teacher Dashboard
    function renderCurriculumList() {
        const curriculumData = JSON.parse(localStorage.getItem('alfaran-curriculum')) || [];
        tbCurriculumList.innerHTML = '';

        if (curriculumData.length === 0) {
            tbCurriculumList.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No curriculum resources uploaded yet.</td></tr>`;
            return;
        }

        // Sort by id descending (newest first)
        curriculumData.sort((a, b) => b.id - a.id).forEach(item => {

            // Map icons based on type
            let icon = 'fas fa-file-alt text-primary';
            if (item.type.includes('PPT')) icon = 'fas fa-file-powerpoint text-warning';
            if (item.type.includes('Virtual Lab')) icon = 'fas fa-flask text-success';
            if (item.type.includes('Live')) icon = 'fas fa-video text-danger';
            if (item.type.includes('Quiz')) icon = 'fas fa-question-circle text-info';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><i class="${icon} mr-2"></i> <strong>${item.title}</strong><br><small><a href="${item.url}" target="_blank" class="text-muted">View Link</a></small></td>
                <td><span class="badge ${item.level === 'Elementary' ? 'bg-info' : item.level === 'Secondary' ? 'bg-primary' : 'bg-success'} text-white">${item.level}</span></td>
                <td>${item.subject}</td>
                <td><span style="font-size: 0.85rem; font-weight: 500;">${item.type}</span></td>
                <td>
                    <button class="btn btn-outline text-danger delete-btn" data-id="${item.id}" style="padding: 5px 10px; font-size: 0.8rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbCurriculumList.appendChild(tr);
        });

        // Attach event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                deleteCurriculumItem(id);
            });
        });
    }

    // Form submission: Upload Resource/Lab
    formUploadResource.addEventListener('submit', (e) => {
        e.preventDefault();

        const level = document.getElementById('cur-level').value;
        const subject = document.getElementById('cur-subject').value;
        const type = document.getElementById('cur-type').value;
        const title = document.getElementById('cur-title').value;
        const url = document.getElementById('cur-url').value;

        addCurriculumItem({ type, level, subject, title, url });

        // Reset and provide visual feedback
        formUploadResource.reset();
        const btn = formUploadResource.querySelector('button[type="submit"]');
        animateButton(btn, 'Uploaded!');
    });

    // Form submission: Schedule Live Class
    formScheduleLive.addEventListener('submit', (e) => {
        e.preventDefault();

        const level = document.getElementById('live-level').value;
        const subject = document.getElementById('live-subject').value;
        const title = document.getElementById('live-title').value;
        const time = document.getElementById('live-time').value; // ISO format
        const platform = document.getElementById('live-platform').value;
        const url = document.getElementById('live-url').value;

        // Format the date uniquely
        const formattedDate = new Date(time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

        const formattedTitle = `${title} (${platform} | ${formattedDate})`;

        addCurriculumItem({ type: 'Live Session', level, subject, title: formattedTitle, url, rawTime: time });

        formScheduleLive.reset();
        const btn = formScheduleLive.querySelector('button[type="submit"]');
        animateButton(btn, 'Scheduled!', 'var(--success-color)');
    });

    // Core function to inject data into LocalStorage
    function addCurriculumItem(data) {
        const curriculumData = JSON.parse(localStorage.getItem('alfaran-curriculum')) || [];
        const newItem = {
            id: Date.now(),
            ...data,
            timestamp: new Date().toISOString()
        };
        curriculumData.push(newItem);
        localStorage.setItem('alfaran-curriculum', JSON.stringify(curriculumData));
        renderCurriculumList();
    }

    // Core function to delete data from LocalStorage
    function deleteCurriculumItem(id) {
        if (confirm('Are you sure you want to remove this curriculum resource? It will be deleted for all students immediately.')) {
            let curriculumData = JSON.parse(localStorage.getItem('alfaran-curriculum')) || [];
            curriculumData = curriculumData.filter(item => item.id !== id);
            localStorage.setItem('alfaran-curriculum', JSON.stringify(curriculumData));
            renderCurriculumList();
        }
    }

    // Helper to flash success on buttons
    function animateButton(btn, successText, color = 'var(--success-color)') {
        const originalText = btn.innerHTML;
        const originalBg = btn.style.background;

        btn.innerHTML = `<i class="fas fa-check mr-2"></i> ${successText}`;
        btn.style.background = color;
        btn.style.borderColor = color;

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = originalBg;
            btn.style.borderColor = '';
        }, 2000);
    }

    // Initial load
    renderCurriculumList();
});
