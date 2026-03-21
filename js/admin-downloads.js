// js/admin-downloads.js - Handles uploading and managing school materials in Admin Dashboard

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. DOM Elements
    const uploadForm = document.getElementById('download-upload-form');
    const tableBody = document.getElementById('downloads-table-body');
    const searchInput = document.getElementById('search-downloads');
    const fileInput = document.getElementById('download-file-input');
    const uploadBtn = document.getElementById('btn-upload-material');

    if (!uploadForm) return;

    // 2. Data Management
    let materialsList = JSON.parse(localStorage.getItem('alfaran-downloads')) || [];

    function saveMaterials() {
        localStorage.setItem('alfaran-downloads', JSON.stringify(materialsList));
        renderMaterials();
    }

    // 3. Render Table
    function renderMaterials() {
        const query = (searchInput.value || '').toLowerCase();
        
        const filtered = materialsList.filter(m => 
            m.name.toLowerCase().includes(query) || 
            m.category.toLowerCase().includes(query)
        );

        tableBody.innerHTML = '';

        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No materials found.</td></tr>';
            return;
        }

        filtered.sort((a, b) => b.id - a.id).forEach(material => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 500;">
                    <i class="far fa-file-pdf mr-2 text-danger"></i>${material.name}
                </td>
                <td><span class="status-badge" style="background: rgba(52, 152, 219, 0.1); color: var(--primary-color); border:none;">${material.category}</span></td>
                <td class="text-muted" style="font-size: 0.85rem;">${material.date}</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-outline" onclick="previewMaterial('${material.id}')" title="Preview" style="padding: 4px 8px; font-size: 0.8rem;"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-outline text-danger" onclick="deleteMaterial('${material.id}')" title="Delete" style="padding: 4px 8px; font-size: 0.8rem; border-color: rgba(231, 76, 60, 0.2);"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // 4. Handle Upload
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('download-name').value.trim();
        const category = document.getElementById('download-category').value;
        const file = fileInput.files[0];

        if (!file) return;

        // File size check (2MB limit for localStorage safety)
        if (file.size > 2 * 1024 * 1024) {
            alert('File is too large! Please keep it under 2MB for storage performance.');
            return;
        }

        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Uploading...';

        try {
            const base64Data = await convertToBase64(file);
            
            const newMaterial = {
                id: Date.now().toString(),
                name: name,
                category: category,
                fileName: file.name,
                fileType: file.type,
                data: base64Data,
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            };

            materialsList.push(newMaterial);
            saveMaterials();

            uploadForm.reset();
            alert('Material uploaded and published successfully!');
            
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload file. Please try again.');
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt mr-2"></i> Save & Publish';
        }
    });

    // 5. Helper Functions
    function convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    window.previewMaterial = function(id) {
        const material = materialsList.find(m => m.id === id);
        if (!material) return;

        // Open in new tab (data URL)
        const win = window.open();
        win.document.write(`<iframe src="${material.data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    };

    window.deleteMaterial = function(id) {
        if (confirm('Are you sure you want to delete this material? It will be removed from the public downloads page immediately.')) {
            materialsList = materialsList.filter(m => m.id !== id);
            saveMaterials();
        }
    };

    // Search listener
    searchInput.addEventListener('input', renderMaterials);

    // Initial render
    renderMaterials();
});
