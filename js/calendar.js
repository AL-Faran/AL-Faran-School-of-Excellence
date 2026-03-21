/* calendar.js */
document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.calendar-landscape-wrapper');
    const tabs = document.querySelectorAll('.calendar-tab');
    const sectionTitle = document.getElementById('section-title');

    function renderCalendar(sectionKey) {
        const data = calendarData[sectionKey];
        if (!data) return;

        // Update Title
        if (sectionTitle) sectionTitle.textContent = data.title;

        // Clear Wrapper
        wrapper.innerHTML = '';

        // Render Months
        data.months.forEach(month => {
            const column = document.createElement('div');
            column.className = 'month-column';
            
            let eventsHtml = '';
            month.events.forEach(event => {
                eventsHtml += `
                    <div class="event-card card-${event.type}">
                        <div class="date-box">
                            <span class="day">${event.day}</span>
                            <span class="mon">${event.mon}</span>
                        </div>
                        <div class="event-info">${event.title}</div>
                    </div>
                `;
            });

            let noteHtml = month.note ? `<div class="ramadan-note">${month.note}</div>` : '';

            column.innerHTML = `
                <h3>${month.name}</h3>
                <div class="month-content">
                    ${eventsHtml}
                    ${noteHtml}
                </div>
            `;
            wrapper.appendChild(column);
        });

        // Highlight Active Tab
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.section === sectionKey);
        });
    }

    // Tab Click Event
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const section = tab.dataset.section;
            renderCalendar(section);
        });
    });

    // Initial Render
    renderCalendar('preschool');
});
