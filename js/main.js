document.addEventListener("DOMContentLoaded", () => {
    // ========== HEADER SCROLL ==========
    const header = document.querySelector(".header");
    let scrollTimeout = false;
    
    window.addEventListener("scroll", () => {
        if (!scrollTimeout) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    header.classList.add("scrolled");
                } else {
                    header.classList.remove("scrolled");
                }
                scrollTimeout = false;
            });
            scrollTimeout = true;
        }
    }, { passive: true });

    // ========== CUSTOM CURSOR ==========
    const cursor = document.querySelector(".custom-cursor");
    const follower = document.querySelector(".cursor-follower");
    const viewCursor = document.querySelector(".cursor-view");
    
    // Check if device has touch screen to disable custom cursor
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice && cursor && follower) {
        let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;
        let isLooping = false;
        
        // Follower animation loop with smart sleeping when mouse is stationary
        const animateFollower = () => {
            const dx = mouseX - followerX;
            const dy = mouseY - followerY;
            
            // Sleep the animation loop if we are close enough to coordinates
            if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
                followerX = mouseX;
                followerY = mouseY;
                follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
                isLooping = false;
                return;
            }
            
            followerX += dx * 0.15;
            followerY += dy * 0.15;
            follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
            
            if (isLooping) {
                requestAnimationFrame(animateFollower);
            }
        };
        
        document.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Move main cursor instantly
            cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
            viewCursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${viewCursor.classList.contains('active') ? 1 : 0})`;
            
            // Wake up animation loop if sleeping
            if (!isLooping) {
                isLooping = true;
                requestAnimationFrame(animateFollower);
            }
        });
        
        // Initial run
        isLooping = true;
        animateFollower();

        // Hover effects
        const textTriggers = document.querySelectorAll("h1, h2, .section-heading");
        textTriggers.forEach(trigger => {
            trigger.addEventListener("mouseenter", () => cursor.classList.add("hover-text"));
            trigger.addEventListener("mouseleave", () => cursor.classList.remove("hover-text"));
        });

        const hoverTriggers = document.querySelectorAll("a, button, .hover-trigger");
        hoverTriggers.forEach(trigger => {
            trigger.addEventListener("mouseenter", () => cursor.classList.add("hover"));
            trigger.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
        });

        // View cursor for project cards
        const viewTriggers = document.querySelectorAll(".hover-view-trigger");
        viewTriggers.forEach(trigger => {
            trigger.addEventListener("mouseenter", () => {
                cursor.style.display = "none";
                follower.style.display = "none";
                viewCursor.classList.add("active");
            });
            trigger.addEventListener("mouseleave", () => {
                cursor.style.display = "block";
                follower.style.display = "block";
                viewCursor.classList.remove("active");
            });
        });
    } else {
        // Fallback for touch devices
        document.body.style.cursor = "auto";
        if(cursor) cursor.style.display = "none";
        if(follower) follower.style.display = "none";
        if(viewCursor) viewCursor.style.display = "none";
    }

    // ========== SCROLL ANIMATIONS (Intersection Observer) ==========
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                
                // If it contains count-up elements, trigger them
                const counters = entry.target.querySelectorAll(".count-up");
                counters.forEach(counter => {
                    if (!counter.classList.contains("counted")) {
                        animateCounter(counter);
                        counter.classList.add("counted");
                    }
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe fade elements
    document.querySelectorAll(".fade-up, .fade-left, .fade-right").forEach(el => {
        scrollObserver.observe(el);
    });

    // ========== COUNTER ANIMATION ==========
    function animateCounter(el) {
        const target = parseFloat(el.getAttribute("data-target"));
        const decimals = parseInt(el.getAttribute("data-decimals")) || 0;
        const duration = 2000; // ms
        const steps = 60;
        const stepTime = duration / steps;
        let current = 0;
        
        const timer = setInterval(() => {
            current += target / steps;
            if (current >= target) {
                el.innerText = target.toFixed(decimals);
                clearInterval(timer);
            } else {
                el.innerText = current.toFixed(decimals);
            }
        }, stepTime);
    }

    // ========== TESTIMONIALS SLIDER ==========
    const track = document.querySelector('.testimonials-track');
    const slides = document.querySelectorAll('.testimonial-slide');
    if (track && slides.length > 0) {
        let index = 0;
        
        // Auto slide function
        const slideNext = () => {
            let visibleCount = 3;
            if (window.innerWidth <= 768) {
                visibleCount = 1;
            } else if (window.innerWidth <= 1024) {
                visibleCount = 2;
            }
            
            const maxIndex = slides.length - visibleCount;
            index++;
            if (index > maxIndex) {
                index = 0;
            }
            
            const slideWidth = slides[0].getBoundingClientRect().width;
            const gap = 32; // gap size matching the flex-gap
            const amountToMove = index * (slideWidth + gap);
            track.style.transform = `translateX(-${amountToMove}px)`;
        };
        
        // Trigger auto slide every 4 seconds (luxury spacing)
        let sliderInterval = setInterval(slideNext, 4000);
        
        // Pause slide on mouse hover to improve user experience
        const container = document.querySelector('.testimonials-slider-container');
        if (container) {
            container.addEventListener('mouseenter', () => clearInterval(sliderInterval));
            container.addEventListener('mouseleave', () => {
                clearInterval(sliderInterval);
                sliderInterval = setInterval(slideNext, 4000);
            });
        }
        
        // Recalculate track position on window resize to avoid visual glitches
        window.addEventListener('resize', () => {
            let visibleCount = 3;
            if (window.innerWidth <= 768) {
                visibleCount = 1;
            } else if (window.innerWidth <= 1024) {
                visibleCount = 2;
            }
            const maxIndex = slides.length - visibleCount;
            if (index > maxIndex) {
                index = maxIndex;
            }
            const slideWidth = slides[0].getBoundingClientRect().width;
            const gap = 32;
            const amountToMove = index * (slideWidth + gap);
            track.style.transform = `translateX(-${amountToMove}px)`;
        });
    }
});

