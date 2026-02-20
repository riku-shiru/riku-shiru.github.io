document.addEventListener('DOMContentLoaded', () => {
    // Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }

    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-up');
    animatedElements.forEach(el => observer.observe(el));

    // Smooth scroll for anchor links (if browser doesn't support css scroll-behavior fully or for finer control)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');

            if (href === '#') {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
                return;
            }

            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 70;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Gallery Toggle (Mobile)
    const galleryToggle = document.getElementById('gallery-toggle');
    const photoGallery = document.querySelector('.photo-gallery');

    if (galleryToggle && photoGallery) {
        galleryToggle.addEventListener('click', () => {
            photoGallery.classList.add('expanded');
            galleryToggle.style.display = 'none';
        });
    }
    // Lightbox Functionality (Event Delegation)
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    document.body.appendChild(lightbox);

    // Navigation Buttons
    const prevBtn = document.createElement('button');
    prevBtn.classList.add('lightbox-nav', 'lightbox-prev');
    prevBtn.innerHTML = '&#10094;'; // Left Arrow
    lightbox.appendChild(prevBtn);

    const nextBtn = document.createElement('button');
    nextBtn.classList.add('lightbox-nav', 'lightbox-next');
    nextBtn.innerHTML = '&#10095;'; // Right Arrow
    lightbox.appendChild(nextBtn);

    const imgElement = document.createElement('img');
    lightbox.appendChild(imgElement);

    let galleryImages = [];
    let currentIndex = 0;

    function updateImage(index) {
        if (index < 0 || index >= galleryImages.length) return; // Prevent out of bounds

        currentIndex = index;
        imgElement.src = galleryImages[currentIndex].src;

        // Update button visibility
        if (currentIndex === 0) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'block';
        }

        if (currentIndex === galleryImages.length - 1) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'block';
        }
    }

    document.addEventListener('click', e => {
        if (e.target.tagName === 'IMG' && e.target.closest('.photo-gallery')) {
            // Update gallery images list dynamically in case of lazy loading or changes
            galleryImages = Array.from(document.querySelectorAll('.photo-gallery img'));
            currentIndex = galleryImages.indexOf(e.target);

            updateImage(currentIndex);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Lock Scroll
        }
    });

    // Close Lightbox
    lightbox.addEventListener('click', e => {
        if (e.target !== e.currentTarget) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Unlock Scroll
    });

    // Navigation Click Events
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateImage(currentIndex - 1);
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateImage(currentIndex + 1);
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') updateImage(currentIndex - 1);
        if (e.key === 'ArrowRight') updateImage(currentIndex + 1);
        if (e.key === 'Escape') {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Swipe Support (Mobile)
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            // Swipe Left -> Next
            if (currentIndex < galleryImages.length - 1) {
                updateImage(currentIndex + 1);
            }
        }
        if (touchEndX > touchStartX + 50) {
            // Swipe Right -> Prev
            if (currentIndex > 0) {
                updateImage(currentIndex - 1);
            }
        }
    }
});
