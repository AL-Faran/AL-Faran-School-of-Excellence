// global-notices.js - Fetches and displays the Global Notice Board across all portals (Home, Parent, Teacher)

document.addEventListener('DOMContentLoaded', () => {

    // Identify where we are trying to render the notices
    const noticeBoardContainer = document.getElementById('global-notice-board');
    if (!noticeBoardContainer) return;

    function renderGlobalNotices() {
        const notices = JSON.parse(localStorage.getItem('alfaran-notices')) || [];
        noticeBoardContainer.innerHTML = '';

        if (notices.length === 0) {
            noticeBoardContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: var(--surface-color); border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
                    <i class="fas fa-check-circle fa-3x mb-3" style="opacity: 0.3;"></i>
                    <h4 style="margin: 0;">You're all caught up!</h4>
                    <p style="font-size: 0.9rem; margin-top: 5px;">There are no active announcements from the administration at this time.</p>
                </div>
            `;
            return;
        }

        // Render notices chronologically
        notices.forEach(notice => {

            // Map categories to visual aesthetics
            let iconClass = 'fas fa-info-circle';
            let categoryColor = 'var(--text-muted)';

            if (notice.category === 'Exam') { iconClass = 'fas fa-file-alt'; categoryColor = 'var(--primary-color)'; }
            else if (notice.category === 'Holiday') { iconClass = 'fas fa-calendar-alt'; categoryColor = 'var(--success-color)'; }
            else if (notice.category === 'Event') { iconClass = 'fas fa-star'; categoryColor = 'var(--warning-color)'; }

            // Add intense visual styling for Urgent markers
            const isUrgentStyle = notice.urgent ? `
                border-left: 4px solid var(--danger-color);
                background: linear-gradient(to right, rgba(231, 76, 60, 0.05) 0%, rgba(231, 76, 60, 0) 100%);
                animation: subtlePulseRed 2s infinite;
            ` : `border-left: 4px solid ${categoryColor}; background: var(--surface-color);`;

            const urgentLabel = notice.urgent ? `<span class="status-badge status-overdue ml-2" style="font-size: 0.7rem; padding: 2px 6px;">URGENT</span>` : '';

            const card = document.createElement('div');
            card.style.cssText = `
                padding: 1.5rem; 
                border: 1px solid var(--border-color);
                border-radius: var(--radius-sm); 
                margin-bottom: 1.2rem; 
                position: relative;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                ${isUrgentStyle}
            `;

            card.onmouseover = () => { card.style.transform = 'translateY(-2px)'; card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.06)'; };
            card.onmouseout = () => { card.style.transform = 'translateY(0)'; card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)'; };

            card.innerHTML = `
                <div style="display: flex; gap: 15px; align-items: flex-start;">
                    <div style="background: rgba(0,0,0,0.03); width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: ${notice.urgent ? 'var(--danger-color)' : categoryColor};">
                        <i class="${notice.urgent ? 'fas fa-exclamation-triangle' : iconClass} fa-lg"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <span style="font-size: 0.75rem; font-weight: 700; color: ${notice.urgent ? 'var(--danger-color)' : categoryColor}; text-transform: uppercase; letter-spacing: 1px;">
                                ${notice.category} ${urgentLabel}
                            </span>
                            <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 500;"><i class="far fa-clock mr-1"></i> ${notice.date}</span>
                        </div>
                        <h3 style="margin: 0 0 10px 0; font-size: 1.25rem; color: var(--text-color);">${notice.title}</h3>
                        <p style="margin: 0; color: #555; font-size: 0.95rem; line-height: 1.6;">${notice.body.replace(/\n/g, '<br>')}</p>
                    </div>
                </div>
            `;

            noticeBoardContainer.appendChild(card);
        });

        // Ensure keyframes exist for urgent pulsing
        if (!document.getElementById('pulse-anim-global') && notices.some(n => n.urgent)) {
            const style = document.createElement('style');
            style.id = 'pulse-anim-global';
            style.innerHTML = `
                @keyframes subtlePulseRed {
                    0% { border-left-color: rgba(231, 76, 60, 1); }
                    50% { border-left-color: rgba(231, 76, 60, 0.3); }
                    100% { border-left-color: rgba(231, 76, 60, 1); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    renderGlobalNotices();
});
