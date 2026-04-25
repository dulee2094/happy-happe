// DOM Elements
const header = document.querySelector('header');
const fadeElements = document.querySelectorAll('.glass-card, .section-header, .hero-text, .hero-visual');

// Scroll Effect for Header
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.background = 'hsla(220, 30%, 8%, 0.95)';
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
    } else {
        header.style.background = 'hsla(220, 30%, 8%, 0.8)';
        header.style.boxShadow = 'none';
    }
});

// Intersection Observer for Fade-in Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add initial styles and observe elements
fadeElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
    observer.observe(el);
});

// Add 'visible' class style via JS injection or CSS class
// Injecting a small style style block for the 'visible' class to keep it self-contained in logic or just expect it in CSS.
// Let's add the class logic to CSS or just manipulate styles directly here for simplicity in this prototype phase.
// Better practice: manipulate styles here since I didn't add .visible in CSS yet.
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    .visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(styleSheet);

// Button Interactions
const ctaButtons = document.querySelectorAll('.btn-primary');
ctaButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // In a real app, this would route to the verification page
        // For now, let's simulate a navigation or modal
        console.log('Navigating to Case Verification...');
        // location.href = 'verification.html'; // Placeholder
    });
});