// js/downloads.js - Handles rendering and filtering of downloadable materials

document.addEventListener('DOMContentLoaded', () => {

    const downloadsContainer = document.getElementById('downloads-container');
    const filterButtons = document.querySelectorAll('#download-filters .filter-btn');

    // 1. Load Data
    const materials = JSON.parse(localStorage.getItem('alfaran-downloads')) || [];

    function renderDownloads(categoryFilter = 'all') {
        downloadsContainer.innerHTML = '';

        const filtered = categoryFilter === 'all' 
            ? materials 
            : materials.filter(m => m.category === categoryFilter);

        if (filtered.length === 0) {
            downloadsContainer.innerHTML = `
                <div class="text-center py-5" style="grid-column: 1/-1;">
                    <i class="fas fa-file-invoice fa-3x text-muted mb-3" style="opacity: 0.3;"></i>
                    <h3 class="text-muted">No materials found in this category</h3>
                    <p class="text-muted">Check back later for new updates.</p>
                    ${categoryFilter !== 'all' ? '<button class="btn btn-primary mt-3" onclick="document.querySelector(\'[data-category=all]\').click()">Show All Resources</button>' : ''}
                </div>
            `;
            return;
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => b.id - a.id).forEach(material => {
            const card = document.createElement('div');
            card.className = 'feature-card glass animate-fade-in';
            card.style.padding = '0';
            card.style.overflow = 'hidden';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.transition = 'all 0.4s ease';
            
            // Icon mapping based on category
            let icon = 'fa-file-alt';
            let color = 'var(--primary-color)';
            let bgColor = 'rgba(26, 75, 132, 0.05)';

            if (material.category === 'Forms') { icon = 'fa-file-signature'; color = '#3498db'; bgColor = 'rgba(52, 152, 219, 0.1)'; }
            else if (material.category === 'Notes') { icon = 'fa-book'; color = '#e67e22'; bgColor = 'rgba(230, 126, 34, 0.1)'; }
            else if (material.category === 'Syllabus') { icon = 'fa-graduation-cap'; color = '#2ecc71'; bgColor = 'rgba(46, 204, 113, 0.1)'; }
            else if (material.category === 'Datesheet') { icon = 'fa-calendar-check'; color = '#9b59b6'; bgColor = 'rgba(155, 89, 182, 0.1)'; }

            card.innerHTML = `
                <div style="padding: 25px; flex-grow: 1; position: relative;">
                    <div style="position: absolute; top: 20px; right: 20px; font-size: 3rem; opacity: 0.05; color: ${color}; transform: rotate(-15deg); pointer-events: none;">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; background: ${bgColor}; color: ${color}; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
                        ${material.category}
                    </div>
                    <h3 style="margin: 0 0 10px 0; font-size: 1.25rem; color: var(--text-dark); font-family: 'Outfit', sans-serif;">${material.name}</h3>
                    <div style="display: flex; align-items: center; gap: 15px; color: var(--text-muted); font-size: 0.85rem;">
                        <span><i class="far fa-calendar-alt mr-1"></i> ${material.date}</span>
                        <span><i class="fas fa-file-pdf mr-1"></i> PDF</span>
                    </div>
                </div>
                <div style="padding: 15px 25px; background: rgba(0,0,0,0.02); border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; align-items: center;">
                    <button class="btn btn-primary" onclick="downloadFile('${material.id}')" style="padding: 10px 20px; font-size: 0.9rem; border-radius: 30px; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 10px rgba(26, 75, 132, 0.2);">
                        <i class="fas fa-download"></i> <span>Download Now</span>
                    </button>
                </div>
            `;
            downloadsContainer.appendChild(card);
        });
    }

    // 2. Download Logic
    window.downloadFile = function(id) {
        const material = materials.find(m => m.id === id);
        if (!material) return;

        const link = document.createElement('a');
        link.href = material.data;
        link.download = material.fileName || `${material.name}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 3. Filter Logic
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderDownloads(btn.getAttribute('data-category'));
        });
    });

    // Initial Render
    renderDownloads();
});
