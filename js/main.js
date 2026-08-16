// ===================================
// DOM READY
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initSmoothScroll();
    initTemplateFilter();
    initScrollAnimations();
    initHeaderScroll();
});

// ===================================
// MOBILE MENU
// ===================================
function initMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!menuToggle || !navMenu) return;
    
    menuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        this.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
}

// ===================================
// SMOOTH SCROLL
// ===================================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// TEMPLATE FILTER
// ===================================
function initTemplateFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const templateCards = document.querySelectorAll('.template-card');
    
    if (!filterBtns.length || !templateCards.length) return;
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Filter templates
            templateCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ===================================
// SCROLL ANIMATIONS
// ===================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    const animatedElements = document.querySelectorAll(
        '.feature-card, .template-card, .pricing-card, .testimonial-card'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Add animated class styles
const style = document.createElement('style');
style.textContent = `
    .animated {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ===================================
// HEADER SCROLL EFFECT
// ===================================
function initHeaderScroll() {
    const header = document.querySelector('.header');
    
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Add shadow on scroll
        if (currentScroll > 50) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
        }
        
        lastScroll = currentScroll;
    });
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format number with thousand separator
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Format currency
function formatCurrency(amount) {
    return 'Rp ' + formatNumber(amount);
}

// Show toast notification
function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    // Add animation styles
    const toastStyle = document.createElement('style');
    toastStyle.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .toast-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .toast-icon {
            font-size: 1.5rem;
        }
        
        .toast-message {
            color: #333;
            font-weight: 500;
        }
    `;
    document.head.appendChild(toastStyle);
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Validate email
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validate phone number (Indonesian format)
function isValidPhone(phone) {
    const regex = /^(\+62|62|08)[0-9]{9,12}$/;
    return regex.test(phone.replace(/\s|-/g, ''));
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Berhasil disalin ke clipboard!', 'success');
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            showToast('Berhasil disalin ke clipboard!', 'success');
            textArea.remove();
            return true;
        } catch (err) {
            showToast('Gagal menyalin ke clipboard', 'error');
            textArea.remove();
            return false;
        }
    }
}

// Share via WhatsApp
function shareWhatsApp(text, url) {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
}

// Share via generic share API
async function share(title, text, url) {
    if (navigator.share) {
        try {
            await navigator.share({ title, text, url });
            showToast('Berhasil dibagikan!', 'success');
        } catch (err) {
            console.log('Share cancelled');
        }
    } else {
        // Fallback: copy to clipboard
        copyToClipboard(`${text} ${url}`);
    }
}

// ===================================
// LOCAL STORAGE HELPERS
// ===================================
const Storage = {
    get: function(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (err) {
            console.error('Error reading from localStorage:', err);
            return null;
        }
    },
    
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (err) {
            console.error('Error writing to localStorage:', err);
            return false;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (err) {
            console.error('Error removing from localStorage:', err);
            return false;
        }
    },
    
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (err) {
            console.error('Error clearing localStorage:', err);
            return false;
        }
    }
};

// ===================================
// API HELPERS (for future use)
// ===================================
const API = {
    baseUrl: 'https://api.undanganku.com', // Replace with actual API
    
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }
            
            return data;
        } catch (err) {
            console.error('API Error:', err);
            throw err;
        }
    },
    
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },
    
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// ===================================
// COUNTDOWN TIMER (for invitation page)
// ===================================
function initCountdown(targetDate, elementId) {
    const countdownElement = document.getElementById(elementId);
    
    if (!countdownElement) return;
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        if (distance < 0) {
            countdownElement.innerHTML = '<div class="countdown-finished">Acara Sudah Dimulai! 🎉</div>';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        countdownElement.innerHTML = `
            <div class="countdown-item">
                <div class="countdown-number">${days}</div>
                <div class="countdown-label">Hari</div>
            </div>
            <div class="countdown-item">
                <div class="countdown-number">${hours}</div>
                <div class="countdown-label">Jam</div>
            </div>
            <div class="countdown-item">
                <div class="countdown-number">${minutes}</div>
                <div class="countdown-label">Menit</div>
            </div>
            <div class="countdown-item">
                <div class="countdown-number">${seconds}</div>
                <div class="countdown-label">Detik</div>
            </div>
        `;
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ===================================
// RSVP FORM HANDLER (for invitation page)
// ===================================
function initRSVPForm(formId) {
    const form = document.getElementById(formId);
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Validate
        if (!data.name || !data.attendance) {
            showToast('Mohon lengkapi semua field yang wajib diisi', 'error');
            return;
        }
        
        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Mengirim...';
        submitBtn.disabled = true;
        
        try {
            // Save to localStorage (or API)
            const rsvps = Storage.get('rsvps') || [];
            rsvps.push({
                ...data,
                timestamp: new Date().toISOString()
            });
            Storage.set('rsvps', rsvps);
            
            showToast('RSVP berhasil dikirim! Terima kasih! 🎉', 'success');
            form.reset();
        } catch (err) {
            showToast('Gagal mengirim RSVP. Silakan coba lagi.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ===================================
// GUEST BOOK HANDLER (for invitation page)
// ===================================
function initGuestBook(formId, listId) {
    const form = document.getElementById(formId);
    const list = document.getElementById(listId);
    
    if (!form || !list) return;
    
    // Load existing messages
    loadGuestBookMessages(list);
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Validate
        if (!data.name || !data.message) {
            showToast('Mohon isi nama dan ucapan', 'error');
            return;
        }
        
        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Mengirim...';
        submitBtn.disabled = true;
        
        try {
            // Save to localStorage (or API)
            const messages = Storage.get('guestbook') || [];
            const newMessage = {
                id: Date.now(),
                ...data,
                timestamp: new Date().toISOString()
            };
            messages.unshift(newMessage);
            Storage.set('guestbook', messages);
            
            // Add to list
            addGuestBookMessage(list, newMessage);
            
            showToast('Ucapan berhasil dikirim! Terima kasih! 💌', 'success');
            form.reset();
        } catch (err) {
            showToast('Gagal mengirim ucapan. Silakan coba lagi.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

function loadGuestBookMessages(list) {
    const messages = Storage.get('guestbook') || [];
    
    if (messages.length === 0) {
        list.innerHTML = '<p class="empty-message">Belum ada ucapan. Jadilah yang pertama! 💌</p>';
        return;
    }
    
    list.innerHTML = '';
    messages.forEach(message => {
        addGuestBookMessage(list, message);
    });
}

function addGuestBookMessage(list, message) {
    const emptyMessage = list.querySelector('.empty-message');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = 'guestbook-message';
    messageElement.innerHTML = `
        <div class="message-header">
            <strong>${message.name}</strong>
            <span class="message-time">${formatTimeAgo(message.timestamp)}</span>
        </div>
        <p class="message-text">${message.message}</p>
    `;
    
    list.insertBefore(messageElement, list.firstChild);
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return past.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
}

// ===================================
// EXPORT FOR GLOBAL USE
// ===================================
window.UndanganKu = {
    showToast,
    copyToClipboard,
    shareWhatsApp,
    share,
    Storage,
    API,
    initCountdown,
    initRSVPForm,
    initGuestBook,
    formatCurrency,
    isValidEmail,
    isValidPhone
};

console.log('🎉 Undangan Ku - Landing Page Loaded Successfully!');
