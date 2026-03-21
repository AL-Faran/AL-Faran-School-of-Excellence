// admin-notices.js - Handles the creation and management of global school announcements

document.addEventListener('DOMContentLoaded', () => {

    const noticeForm = document.getElementById('notice-entry-form');
    const noticesListContainer = document.getElementById('admin-notices-list');

    if (!noticeForm) return; // Only execute on the Admin dashboard where the form exists

    // Provide default initial data if empty
    if (!localStorage.getItem('alfaran-notices')) {
        const initialNotices = [
            {
                id: Date.now() - 100000,
                title: 'Welcome to Al-Faran School of Excellence',
                category: 'General',
                body: 'We are thrilled to launch our new digital portal. Parents and Teachers can now access real-time data.',
                urgent: false,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            }
        ];
        localStorage.setItem('alfaran-notices', JSON.stringify(initialNotices));
    }

    // Render local preview list for admin
    function renderAdminNotices() {
        const notices = JSON.parse(localStorage.getItem('alfaran-notices')) || [];
        noticesListContainer.innerHTML = '';

        if (notices.length === 0) {
            noticesListContainer.innerHTML = '<p class="text-muted text-center py-3">No announcements have been published yet.</p>';
            return;
        }

        notices.forEach(notice => {
            const urgencyBadge = notice.urgent ? '<span class="status-badge status-overdue ml-2" style="font-size: 0.7rem; animation: pulseRed 1.5s infinite;">URGENT</span>' : '';
            const categoryColor =
                notice.category === 'Exam' ? 'var(--primary-color)' :
                    notice.category === 'Holiday' ? 'var(--success-color)' :
                        notice.category === 'Event' ? 'var(--warning-color)' : 'var(--text-muted)';

            const card = document.createElement('div');
            card.style.cssText = `
                padding: 1rem; 
                border: 1px solid var(--border-color); 
                border-radius: var(--radius-sm); 
                margin-bottom: 1rem; 
                display: flex; 
                justify-content: space-between; 
                align-items: center;
                border-left: 4px solid ${categoryColor};
            `;

            if (notice.urgent) {
                card.style.background = 'rgba(231, 76, 60, 0.02)';
                card.style.borderColor = 'rgba(231, 76, 60, 0.2)';
            }

            card.innerHTML = `
                <div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                        <span style="font-size: 0.75rem; font-weight: 600; color: ${categoryColor}; text-transform: uppercase;">${notice.category}</span>
                        <span style="color: var(--text-muted); font-size: 0.8rem;">&bull; ${notice.date}</span>
                    </div>
                    <h4 style="margin: 0; font-size: 1.1rem;">${notice.title} ${urgencyBadge}</h4>
                    <p style="margin: 5px 0 0 0; color: var(--text-muted); font-size: 0.9rem;  max-width: 600px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${notice.body}</p>
                </div>
                <div>
                    <button class="btn btn-outline text-danger delete-notice-btn" data-id="${notice.id}" style="padding: 5px 10px; font-size: 0.85rem;"><i class="fas fa-trash"></i></button>
                </div>
            `;
            noticesListContainer.appendChild(card);
        });

        // Add CSS for pulsing red (Urgent) if not exists
        if (!document.getElementById('pulse-anim')) {
            const style = document.createElement('style');
            style.id = 'pulse-anim';
            style.innerHTML = `
                @keyframes pulseRed {
                    0% { opacity: 1; box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
                    50% { opacity: 0.5; box-shadow: 0 0 0 6px rgba(231, 76, 60, 0); }
                    100% { opacity: 1; box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
                }
            `;
            document.head.appendChild(style);
        }

        // Bind delete buttons
        document.querySelectorAll('.delete-notice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                deleteNotice(parseInt(e.currentTarget.getAttribute('data-id')));
            });
        });
    }

    // Form Submission
    noticeForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('notice-title').value;
        const category = document.getElementById('notice-category').value;
        const body = document.getElementById('notice-body').value;
        const urgent = document.getElementById('notice-urgent').checked;

        const newNotice = {
            id: Date.now(),
            title,
            category,
            body,
            urgent,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        const notices = JSON.parse(localStorage.getItem('alfaran-notices')) || [];

        // Add to beginning of array so newest is first
        notices.unshift(newNotice);
        localStorage.setItem('alfaran-notices', JSON.stringify(notices));

        // Reset form and UI
        noticeForm.reset();

        // Custom animated success response
        const btn = document.querySelector('#notice-entry-form button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check mr-2"></i> Published!';
        btn.classList.add('btn-success');
        btn.classList.remove('btn-primary');

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('btn-success');
            btn.classList.add('btn-primary');
        }, 2000);

        renderAdminNotices();
    });

    // Delete notice function
    function deleteNotice(id) {
        if (confirm('Are you sure you want to delete this announcement? It will be removed globally from all dashboards immediately.')) {
            let notices = JSON.parse(localStorage.getItem('alfaran-notices')) || [];
            notices = notices.filter(n => n.id !== id);
            localStorage.setItem('alfaran-notices', JSON.stringify(notices));
            renderAdminNotices();
        }
    }

    // Initial render
    renderAdminNotices();
});
