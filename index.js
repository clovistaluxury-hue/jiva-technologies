/* ==========================================================================
   JIVA TECHNOLOGIES — FUTURISTIC INTERACTIVE ENGINE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Initialize Modules
    initParticleCanvas();
    initTransitionManager();
    initScrollObserver();
    initPortfolioFilters();
    initTestimonialSlider();
    initContactForm();
    initMobileMenu();
    initInteractiveSlider();
});

/* ==========================================================================
   INTERACTIVE CANVAS PARTICLE ENGINE
   ========================================================================== */

let particleEngine = {
    canvas: null,
    ctx: null,
    particles: [],
    mouse: { x: null, y: null, active: false, radius: 150 },
    particleCount: 90,
    speedFactor: 1.0,
    colorMode: 'blue', // 'blue' or 'burst'
    running: true
};

function initParticleCanvas() {
    particleEngine.canvas = document.getElementById("particle-canvas");
    if (!particleEngine.canvas) return;
    
    particleEngine.ctx = particleEngine.canvas.getContext("2d");
    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);
    
    // Track mouse movement across window
    window.addEventListener("mousemove", (e) => {
        particleEngine.mouse.x = e.clientX;
        particleEngine.mouse.y = e.clientY;
        particleEngine.mouse.active = true;
    });

    window.addEventListener("mouseleave", () => {
        particleEngine.mouse.active = false;
    });

    // Create particles
    createParticles();
    
    // Start animation loop
    animateParticles();
}

function resizeCanvas() {
    particleEngine.canvas.width = window.innerWidth;
    particleEngine.canvas.height = window.innerHeight;
    
    // Adjust density based on screen size
    if (window.innerWidth < 768) {
        particleEngine.particleCount = 40;
    } else {
        particleEngine.particleCount = 90;
    }
    createParticles();
}

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * particleEngine.canvas.width;
        this.y = Math.random() * particleEngine.canvas.height;
        this.size = Math.random() * 2 + 1;
        this.baseSpeedX = (Math.random() * 0.8 - 0.4);
        this.baseSpeedY = (Math.random() * 0.8 - 0.4);
        this.vx = this.baseSpeedX;
        this.vy = this.baseSpeedY;
        this.alpha = Math.random() * 0.5 + 0.3;
    }

    update() {
        // Apply speed factors (acceleration on transitions)
        this.vx = this.baseSpeedX * particleEngine.speedFactor;
        this.vy = this.baseSpeedY * particleEngine.speedFactor;

        this.x += this.vx;
        this.y += this.vy;

        // Bounce on boundaries
        if (this.x < 0 || this.x > particleEngine.canvas.width) {
            this.baseSpeedX *= -1;
            this.x = Math.max(0, Math.min(this.x, particleEngine.canvas.width));
        }
        if (this.y < 0 || this.y > particleEngine.canvas.height) {
            this.baseSpeedY *= -1;
            this.y = Math.max(0, Math.min(this.y, particleEngine.canvas.height));
        }

        // Push away from mouse slightly
        if (particleEngine.mouse.active) {
            const dx = this.x - particleEngine.mouse.x;
            const dy = this.y - particleEngine.mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < particleEngine.mouse.radius) {
                const force = (particleEngine.mouse.radius - distance) / particleEngine.mouse.radius;
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                this.x += forceDirectionX * force * 3;
                this.y += forceDirectionY * force * 3;
            }
        }
    }

    draw() {
        const ctx = particleEngine.ctx;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        if (particleEngine.colorMode === 'blue') {
            ctx.fillStyle = `rgba(0, 217, 255, ${this.alpha})`;
        } else {
            // Burst mode: Orange transition color particles
            ctx.fillStyle = `rgba(255, 122, 0, ${this.alpha * 1.5})`;
        }
        ctx.fill();
    }
}

function createParticles() {
    particleEngine.particles = [];
    for (let i = 0; i < particleEngine.particleCount; i++) {
        particleEngine.particles.push(new Particle());
    }
}

function animateParticles() {
    if (!particleEngine.running) return;
    
    const ctx = particleEngine.ctx;
    ctx.clearRect(0, 0, particleEngine.canvas.width, particleEngine.canvas.height);

    // Update and draw particles
    particleEngine.particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Draw connection lines
    connectParticles();

    requestAnimationFrame(animateParticles);
}

function drawElectricity(ctx, x1, y1, x2, y2, color) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Snapping electricity segments
    const segments = Math.max(4, Math.floor(distance / 12));
    
    // Canvas shadow blur for high-end glowing look
    ctx.shadowBlur = Math.random() * 12 + 6;
    ctx.shadowColor = color;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    
    let currX = x1;
    let currY = y1;
    
    for (let i = 1; i < segments; i++) {
        const t = i / segments;
        // Perfect line projection
        const targetX = x1 + dx * t;
        const targetY = y1 + dy * t;
        
        // Random offset scale perpendicular to line
        const perpX = -dy / distance;
        const perpY = dx / distance;
        
        // Generate high frequency electrical noise
        const noise = (Math.random() * 10 - 5);
        
        currX = targetX + perpX * noise;
        currY = targetY + perpY * noise;
        
        ctx.lineTo(currX, currY);
    }
    
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    // Electrical snap flicker line width
    ctx.lineWidth = Math.random() * 1.8 + 0.8;
    ctx.stroke();
    
    // Reset shadow blur to avoid performance drag on standard lines
    ctx.shadowBlur = 0;
}

function connectParticles() {
    const ctx = particleEngine.ctx;
    const maxDistance = 140;

    // 1. Mesh connections (normal background lines)
    for (let i = 0; i < particleEngine.particles.length; i++) {
        for (let j = i + 1; j < particleEngine.particles.length; j++) {
            const p1 = particleEngine.particles[i];
            const p2 = particleEngine.particles[j];

            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
                const alpha = (maxDistance - distance) / maxDistance * 0.12;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                
                if (particleEngine.colorMode === 'blue') {
                    ctx.strokeStyle = `rgba(0, 123, 255, ${alpha})`;
                } else {
                    ctx.strokeStyle = `rgba(255, 122, 0, ${alpha * 2})`;
                }
                
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    // 2. Cursor snap electrical arcs (electricity!)
    if (particleEngine.mouse.active && particleEngine.mouse.x !== null) {
        const mouseColor = particleEngine.colorMode === 'blue' ? 'rgba(0, 217, 255, 0.85)' : 'rgba(255, 122, 0, 0.9)';
        const maxSnapDistance = particleEngine.mouse.radius;
        
        particleEngine.particles.forEach(p => {
            const dx = p.x - particleEngine.mouse.x;
            const dy = p.y - particleEngine.mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < maxSnapDistance) {
                // snap electricity bolt!
                drawElectricity(ctx, particleEngine.mouse.x, particleEngine.mouse.y, p.x, p.y, mouseColor);
            }
        });
    }
}


/* ==========================================================================
   TRANSITION MANAGER (PAGE 1 -> PAGE 2)
   ========================================================================== */

function initTransitionManager() {
    const wipeOverlay = document.getElementById("wipe-overlay");
    const page1 = document.getElementById("page-1");
    const page2 = document.getElementById("page-2");

    if (!page1 || !wipeOverlay) return;

    page1.addEventListener("click", () => {
        // Prevent multiple triggers if already transitioning
        if (page1.classList.contains("exit") || wipeOverlay.classList.contains("active")) {
            return;
        }

        // Step 1: Fire canvas particle burst (accelerate particles, change color)
        particleEngine.speedFactor = 22.0;
        particleEngine.colorMode = 'burst';
        
        // Step 2: Trigger wipe overlay slide in
        wipeOverlay.classList.add("active");

        // Step 3: At mid-point (overlay covers screen), swap views
        setTimeout(() => {
            page1.classList.add("exit");
            page2.classList.remove("hidden");
            
            // Trigger layout reflow for Page 2
            window.dispatchEvent(new Event('resize'));
            window.scrollTo(0, 0);
            
            // Adjust particles back to slow cinematic flow for Page 2
            particleEngine.speedFactor = 0.5;
            particleEngine.colorMode = 'blue';

            // Show page 2 container
            page2.classList.add("show");
        }, 900); // Wait for the slide columns to close fully

        // Step 4: Sweep out wipe overlay
        setTimeout(() => {
            wipeOverlay.classList.add("reveal");
        }, 1500);

        // Step 5: Clean up classes to restore interaction
        setTimeout(() => {
            wipeOverlay.classList.remove("active", "reveal");
            page1.style.display = "none"; // Permanently remove Page 1 interactions
        }, 2400);
    });
}


/* ==========================================================================
   SCROLL OBSERVER (FADE REVEALS & STAT COUNTERS)
   ========================================================================== */

function initScrollObserver() {
    // 1. Header scroll shrinking
    const header = document.getElementById("site-header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 60) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    // 2. Intersection observer for scroll elements reveal
    const revealElements = document.querySelectorAll(".scroll-reveal");
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                // If it's the stats section, animate counters
                if (entry.target.id === "why-choose-us") {
                    animateStatsCounters();
                }
                observer.unobserve(entry.target); // Trigger once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
}

function animateStatsCounters() {
    const counterElements = document.querySelectorAll(".stat-number");
    
    counterElements.forEach(counter => {
        const target = parseFloat(counter.getAttribute("data-target"));
        const decimals = parseInt(counter.getAttribute("data-decimals") || "0");
        const suffix = counter.getAttribute("data-suffix") || "";
        const duration = 2000; // ms
        let startTime = null;

        function updateCounter(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            // Easing function (outQuad)
            const easeProgress = progress * (2 - progress);
            const value = easeProgress * target;
            
            counter.innerText = value.toFixed(decimals) + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target.toFixed(decimals) + suffix;
            }
        }

        requestAnimationFrame(updateCounter);
    });
}


/* ==========================================================================
   PORTFOLIO FILTER LOGIC
   ========================================================================== */

function initPortfolioFilters() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const portfolioCards = document.querySelectorAll(".portfolio-card");

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Set active class
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filterValue = btn.getAttribute("data-filter");

            portfolioCards.forEach(card => {
                const category = card.getAttribute("data-category");
                
                if (filterValue === "all" || category === filterValue) {
                    card.classList.remove("hidden");
                    // Add fade-in animation trigger
                    card.style.opacity = "0";
                    card.style.transform = "scale(0.95)";
                    setTimeout(() => {
                        card.style.opacity = "1";
                        card.style.transform = "scale(1)";
                        card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
                    }, 50);
                } else {
                    card.classList.add("hidden");
                }
            });
        });
    });
}


/* ==========================================================================
   TESTIMONIAL SLIDER
   ========================================================================== */

function initTestimonialSlider() {
    const slides = document.querySelectorAll(".testimonial-card");
    const dots = document.querySelectorAll(".slider-dots .dot");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    let currentIndex = 0;
    let slideInterval = null;

    if (slides.length === 0) return;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove("active"));
        dots.forEach(dot => dot.classList.remove("active"));

        currentIndex = (index + slides.length) % slides.length;
        slides[currentIndex].classList.add("active");
        dots[currentIndex].classList.add("active");
    }

    // Click triggers
    prevBtn.addEventListener("click", () => {
        showSlide(currentIndex - 1);
        resetAutoplay();
    });

    nextBtn.addEventListener("click", () => {
        showSlide(currentIndex + 1);
        resetAutoplay();
    });

    dots.forEach(dot => {
        dot.addEventListener("click", (e) => {
            const index = parseInt(e.target.getAttribute("data-index"));
            showSlide(index);
            resetAutoplay();
        });
    });

    // Autoplay loop
    function startAutoplay() {
        slideInterval = setInterval(() => {
            showSlide(currentIndex + 1);
        }, 7000);
    }

    function resetAutoplay() {
        clearInterval(slideInterval);
        startAutoplay();
    }

    startAutoplay();
}


/* ==========================================================================
   FUTURISTIC CONTACT FORM CONTROLS
   ========================================================================== */

function initContactForm() {
    const form = document.getElementById("jiva-contact-form");
    const successMsg = document.getElementById("form-success-msg");
    const closeBtn = document.getElementById("success-close-btn");

    if (!form || !successMsg) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Form field values capture
        const name = document.getElementById("form-name").value;
        const email = document.getElementById("form-email").value;
        const service = document.getElementById("form-service").value;
        const message = document.getElementById("form-message").value;

        // Perform mock API submit (visual feedback animation)
        const submitBtn = form.querySelector(".form-submit-btn");
        const btnText = submitBtn.querySelector("span");
        const btnIcon = submitBtn.querySelector("i");
        
        btnText.innerText = "Encrypting & Sending...";
        submitBtn.style.opacity = "0.75";
        submitBtn.style.pointerEvents = "none";

        setTimeout(() => {
            // Restore button
            btnText.innerText = "Submit Request";
            submitBtn.style.opacity = "1";
            submitBtn.style.pointerEvents = "auto";
            
            // Display success modal
            successMsg.classList.remove("hidden");
            form.reset();
        }, 1800);
    });

    closeBtn.addEventListener("click", () => {
        successMsg.classList.add("hidden");
    });
}


/* ==========================================================================
   MOBILE NAVIGATION DRAWER
   ========================================================================== */

function initMobileMenu() {
    const toggleBtn = document.getElementById("mobile-menu-toggle");
    const closeBtn = document.getElementById("mobile-menu-close");
    const menuOverlay = document.getElementById("mobile-menu");
    const navLinks = document.querySelectorAll(".mobile-nav-link, .mobile-menu-cta");

    if (!toggleBtn || !menuOverlay) return;

    toggleBtn.addEventListener("click", () => {
        menuOverlay.classList.add("open");
        document.body.style.overflow = "hidden"; // Disable scroll when open
    });

    function closeMenu() {
        menuOverlay.classList.remove("open");
        document.body.style.overflow = ""; // Re-enable scroll
    }

    closeBtn.addEventListener("click", closeMenu);

    // Auto close menu when links are clicked
    navLinks.forEach(link => {
        link.addEventListener("click", closeMenu);
    });
}

/* ==========================================================================
   PAGE 2: CINEMATIC HORIZONTAL AUTOPLAY SLIDER WITH HUD HIGHLIGHTS
   ========================================================================== */

function initInteractiveSlider() {
    const sliderSection = document.getElementById("cinematic-slider");
    if (!sliderSection) return;

    const wrapper = sliderSection.querySelector(".slider-wrapper");
    const slides = sliderSection.querySelectorAll(".slide-item");
    const dots = sliderSection.querySelectorAll(".slide-dot");
    const hudItems = sliderSection.querySelectorAll(".hud-service-item");
    const countLabel = document.getElementById("slider-count-label");

    if (!wrapper || slides.length === 0) return;

    let currentIndex = 0;
    let autoplayTimer = null;
    const slideDuration = 4500; // 4.5 seconds per slide cycle

    function goToSlide(index) {
        currentIndex = (index + slides.length) % slides.length;

        // Smooth horizontal slide translation
        wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Update active class on slides (triggers scale effect)
        slides.forEach((slide, idx) => {
            if (idx === currentIndex) {
                slide.classList.add("active");
            } else {
                slide.classList.remove("active");
            }
        });

        // Update pagination dots
        dots.forEach((dot, idx) => {
            if (idx === currentIndex) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });

        // Update Left HUD Overlay Highlights
        hudItems.forEach((hudItem, idx) => {
            if (idx === currentIndex) {
                hudItem.classList.add("active");
            } else {
                hudItem.classList.remove("active");
            }
        });

        // Update active badge metadata
        if (countLabel) {
            countLabel.innerHTML = `JIVA ARCHITECTURES &bull; ${currentIndex + 1} / ${slides.length}`;
        }
    }

    function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, slideDuration);
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    // Dot navigation triggers
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            goToSlide(index);
            startAutoplay();
        });
    });

    // Left HUD Sidebar items navigation triggers
    hudItems.forEach((hudItem, index) => {
        hudItem.addEventListener("click", () => {
            goToSlide(index);
            startAutoplay();
        });
    });

    // Start cycle
    startAutoplay();
}

