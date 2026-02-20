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

    // Carousel Track
    const track = document.createElement('div');
    track.classList.add('lightbox-track');
    lightbox.appendChild(track);

    // Create 3 image containers (Prev, Current, Next)
    const imgContainers = [];
    const images = [];
    for (let i = 0; i < 3; i++) {
        const container = document.createElement('div');
        container.classList.add('lightbox-image-container');
        const img = document.createElement('img');
        container.appendChild(img);
        track.appendChild(container);
        imgContainers.push(container);
        images.push(img);
    }

    // Navigation Buttons
    const prevBtn = document.createElement('button');
    prevBtn.classList.add('lightbox-nav', 'lightbox-prev');
    prevBtn.innerHTML = '&#10094;'; // Left Arrow
    lightbox.appendChild(prevBtn);

    const nextBtn = document.createElement('button');
    nextBtn.classList.add('lightbox-nav', 'lightbox-next');
    nextBtn.innerHTML = '&#10095;'; // Right Arrow
    lightbox.appendChild(nextBtn);

    // Swipe Hints (Mobile)
    const hintLeft = document.createElement('div');
    hintLeft.classList.add('swipe-hint', 'swipe-hint-left');
    hintLeft.innerHTML = '&#10094;'; // Left Chevron
    lightbox.appendChild(hintLeft);

    const hintRight = document.createElement('div');
    hintRight.classList.add('swipe-hint', 'swipe-hint-right');
    hintRight.innerHTML = '&#10095;'; // Right Chevron
    lightbox.appendChild(hintRight);

    let galleryImages = [];
    let currentIndex = 0;
    let hintTimeout;

    // Swipe Variables
    let touchStartX = 0;
    let currentTranslate = 0;
    let isDragging = false;
    let startTimestamp = 0;

    function showSwipeHints() {
        if (window.innerWidth > 768) return; // Don't show on PC

        hintLeft.classList.add('visible');
        hintRight.classList.add('visible');

        clearTimeout(hintTimeout);
        hintTimeout = setTimeout(() => {
            hintLeft.classList.remove('visible');
            hintRight.classList.remove('visible');
        }, 2000);
    }

    function getSlideWidth() {
        // Safe check if container exists and has width
        if (imgContainers.length > 0 && imgContainers[0].offsetWidth > 0) {
            return imgContainers[0].offsetWidth;
        }
        // Fallback if layout hasn't finished yet
        return window.innerWidth > 768 ? window.innerWidth : window.innerWidth * 0.85;
    }

    function setTrackPosition(translate, animate = false) {
        if (animate) {
            track.classList.add('animating');
        } else {
            track.classList.remove('animating');
        }
        track.style.transform = `translateX(${translate}px)`;
    }

    function centerCarousel(animate = false) {
        // We always want the middle image (Index 1) to be centered in viewport
        const slideWidth = getSlideWidth();
        const viewportWidth = window.innerWidth;

        // Calculate the position to center the middle slide (index 1)
        // The track has 3 slides: [0, 1, 2]
        // We want the center of slide 1 to match the center of the viewport
        // Slide 1 starts at slideWidth pixels (relative to track start)
        // Slide 1 center is at slideWidth + (slideWidth / 2)

        // Viewport center is viewportWidth / 2

        // So we want: (slideWidth * 1.5) + translateX = viewportWidth / 2
        // translateX = (viewportWidth / 2) - (slideWidth * 1.5)

        const centerOffset = (viewportWidth / 2) - (slideWidth * 1.5);

        currentTranslate = centerOffset;
        setTrackPosition(currentTranslate, animate);
    }

    function updateCarouselImages() {
        // Center image is currentIndex
        // Left image is currentIndex - 1
        // Right image is currentIndex + 1

        const setSrc = (img, index) => {
            if (index >= 0 && index < galleryImages.length) {
                img.src = galleryImages[index].src;
                img.style.visibility = 'visible';
            } else {
                img.style.visibility = 'hidden';
            }
        };

        setSrc(images[0], currentIndex - 1);
        setSrc(images[1], currentIndex);
        setSrc(images[2], currentIndex + 1);

        // Reset track to center
        centerCarousel(false);
    }

    function updateButtons() {
        if (currentIndex === 0) {
            prevBtn.classList.add('hidden-nav');
            hintLeft.style.display = 'none';
        } else {
            prevBtn.classList.remove('hidden-nav');
            hintLeft.style.display = 'block';
        }

        if (currentIndex === galleryImages.length - 1) {
            nextBtn.classList.add('hidden-nav');
            hintRight.style.display = 'none';
        } else {
            nextBtn.classList.remove('hidden-nav');
            hintRight.style.display = 'block';
        }
    }

    function updateImage(index) {
        if (index < 0 || index >= galleryImages.length) return;
        currentIndex = index;
        updateCarouselImages();
        updateButtons();
    }

    // Handle Window Resize
    window.addEventListener('resize', () => {
        if (lightbox.classList.contains('active')) {
            centerCarousel(false);
        }
    });

    document.addEventListener('click', e => {
        if (e.target.tagName === 'IMG' && e.target.closest('.photo-gallery')) {
            galleryImages = Array.from(document.querySelectorAll('.photo-gallery img'));
            currentIndex = galleryImages.indexOf(e.target);

            lightbox.classList.add('active'); // Show first to get dimensions
            document.body.style.overflow = 'hidden';

            // Allow a brief moment for layout/paint if needed, 
            // but usually synchronous after class add is fine for offsetWidth
            updateImage(currentIndex);

            showSwipeHints();
        }
    });

    // Close Lightbox
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox || e.target === track || e.target.classList.contains('lightbox-image-container')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Button Navigation
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        animateSlide(1); // Slide right (show prev)
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        animateSlide(-1); // Slide left (show next)
    });

    function animateSlide(direction) {
        // direction: 1 for prev, -1 for next (Wait, this logic was inverted in prev code comments?)
        // Let's standardise:
        // direction = 1 => Moving to PREV image (swipe Right). Track moves RIGHT (positive).
        // direction = -1 => Moving to NEXT image (swipe Left). Track moves LEFT (negative).

        if (direction === 1 && currentIndex === 0) return;
        if (direction === -1 && currentIndex === galleryImages.length - 1) return;

        const slideWidth = getSlideWidth();
        const targetTranslate = currentTranslate + (direction * slideWidth);
        setTrackPosition(targetTranslate, true);

        setTimeout(() => {
            if (direction === 1) currentIndex--;
            else currentIndex++;

            updateCarouselImages();
            updateButtons();
        }, 300); // Match CSS transition duration
    }

    // Touch Events for Swipe
    track.addEventListener('touchstart', (e) => {
        isDragging = true;
        touchStartX = e.touches[0].clientX;
        track.classList.remove('animating');
        startTimestamp = Date.now();
    }, { passive: false });

    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent background scroll

        const currentX = e.touches[0].clientX;
        const diffX = currentX - touchStartX;

        // Apply resistance if at edges
        let newTranslate = currentTranslate + diffX;
        if ((currentIndex === 0 && diffX > 0) || (currentIndex === galleryImages.length - 1 && diffX < 0)) {
            newTranslate = currentTranslate + (diffX * 0.3);
        }

        setTrackPosition(newTranslate, false);
    }, { passive: false });

    track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;

        const endX = e.changedTouches[0].clientX;
        const diffX = endX - touchStartX;
        const timeDiff = Date.now() - startTimestamp;

        // Threshold for swipe (pixel based)
        // Check if swiped more than 15% of slide width or fast swipe
        const slideWidth = getSlideWidth();
        const threshold = slideWidth * 0.15;

        if (Math.abs(diffX) > threshold || (Math.abs(diffX) > 20 && timeDiff < 300)) {
            if (diffX > 0) {
                animateSlide(1); // Prev
            } else {
                animateSlide(-1); // Next
            }
        } else {
            // Snap back
            centerCarousel(true);
        }
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') animateSlide(1);
        if (e.key === 'ArrowRight') animateSlide(-1);
        if (e.key === 'Escape') {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});
