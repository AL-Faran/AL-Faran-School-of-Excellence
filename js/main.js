// main.js - Global Interactions for Public Pages

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('show')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // 2. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        htmlElement.setAttribute('data-theme', 'dark');
        updateThemeIcon(true);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = htmlElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                htmlElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                updateThemeIcon(false);
            } else {
                htmlElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                updateThemeIcon(true);
            }
        });
    }

    function updateThemeIcon(isDark) {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (isDark) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    // 4. Number Counter Animation for Stats Section
    const statsSection = document.getElementById('stats');
    if (statsSection) {
        const observerList = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateNumbers();
                observerList.disconnect();
            }
        });
        observerList.observe(statsSection);
    }

    function animateNumbers() {
        // Fetch real counts from localStorage
        const students = JSON.parse(localStorage.getItem('alfaran-students')) || [];
        const teachers = JSON.parse(localStorage.getItem('alfaran-teachers')) || [];
        
        const activeTeachers = teachers.filter(t => t.status === 'Active').length;

        // Set targets dynamically
        const studentStat = document.getElementById('stat-students');
        const teacherStat = document.getElementById('stat-teachers');

        if (studentStat) studentStat.setAttribute('data-target', students.length);
        if (teacherStat) teacherStat.setAttribute('data-target', activeTeachers);

        const counters = document.querySelectorAll('.stat-number');
        const speed = 200; // lower is slower

        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText.replace(/[^0-9]/g, ''); // strip suffix for calculation
                const inc = Math.max(target / speed, 1); // ensure increment is at least 1

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 10);
                } else {
                    counter.innerText = target + (target >= 1000 ? '+' : (target === 100 ? '%' : ''));
                    // Add conditional suffixes back
                    if (counter.parentElement.innerText.includes('Success Rate')) {
                        counter.innerText = target + '%';
                    } else if (target >= 1000) {
                        counter.innerText = target + '+';
                    }
                }
            };
            updateCount();
        });
    }

    // 5. Gallery Filtering
    const filterBtns = document.querySelectorAll('#gallery-category-filters .filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterBtns.length > 0 && galleryItems.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                galleryItems.forEach(item => {
                    if (filter === 'all' || item.getAttribute('data-category') === filter) {
                        item.classList.remove('hide');
                        setTimeout(() => {
                            item.classList.add('show');
                        }, 10);
                    } else {
                        item.classList.remove('show');
                        item.classList.add('hide');
                    }
                });
            });
        });
    }
});
