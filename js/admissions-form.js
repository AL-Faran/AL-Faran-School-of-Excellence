// admissions-form.js - Handles the logic for the public admissions application

document.addEventListener('DOMContentLoaded', () => {
    const admissionForm = document.getElementById('admission-form');
    const successMsg = document.getElementById('af-success-msg');

    if (admissionForm) {
        admissionForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Helper to convert file to Base64
            const fileToBase64 = (file) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });

            // Handle Photo Upload
            const photoFile = document.getElementById('af-student-photo').files[0];
            let photoBase64 = '';
            if (photoFile) {
                try {
                    photoBase64 = await fileToBase64(photoFile);
                } catch (err) {
                    console.error("Photo upload failed:", err);
                }
            }

            // 1. Gather form data
            const admissionData = {
                id: 'adm_' + Date.now(),
                status: 'Pending',
                submissionDate: new Date().toLocaleDateString(),
                studentPhoto: photoBase64, // Storing image as Base64

                // Student Details
                studentName: document.getElementById('af-student-name').value,
                dob: document.getElementById('af-dob').value,
                bform: document.getElementById('af-bform').value,
                gender: document.getElementById('af-gender').value,
                pob: document.getElementById('af-pob').value,
                prevSchool: document.getElementById('af-prev-school').value,

                // Parent/Guardian Details
                fatherName: document.getElementById('af-father-name').value,
                motherName: document.getElementById('af-mother-name').value,
                cnic: document.getElementById('af-cnic').value,
                occupation: document.getElementById('af-occupation').value,
                income: document.getElementById('af-income').value,

                // Contact Details
                currentAddress: document.getElementById('af-current-address').value,
                permanentAddress: document.getElementById('af-permanent-address').value,
                whatsapp: document.getElementById('af-whatsapp').value,
                emergencyContact: document.getElementById('af-emergency').value,

                // Admission Details
                appliedClass: document.getElementById('af-class').value,
                academicYear: document.getElementById('af-year').value,
                transport: document.getElementById('af-transport').value
            };

            // 2. Fetch existing admissions from localStorage OR start empty array
            let admissionsList = JSON.parse(localStorage.getItem('alfaran-admissions')) || [];

            // 3. Add new submission
            admissionsList.push(admissionData);

            // 4. Save back to localStorage
            localStorage.setItem('alfaran-admissions', JSON.stringify(admissionsList));

            // 5. Show success message and download button
            const submitBtn = document.getElementById('submit-btn-main');
            const printBox = document.getElementById('print-action-box');
            
            if (submitBtn) submitBtn.style.display = 'none';
            if (printBox) printBox.style.display = 'block';

            if (successMsg) {
                successMsg.style.display = 'block';
            }

            // 6. Reset form if needed, but usually keep it for printing
            // admissionForm.reset(); 

        });
    }
});
