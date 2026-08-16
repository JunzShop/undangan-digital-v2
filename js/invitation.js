// ===================================
// INVITATION PAGE JAVASCRIPT
// ===================================

// Global Variables
let invitationData = null;
let currentImageIndex = 0;
let galleryImages = [];
let countdownInterval = null;
let isMusicPlaying = false;

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    // Load invitation data
    loadInvitationData();
});

// ===================================
// LOAD INVITATION DATA
// ===================================
function loadInvitationData() {
    // Get invitation ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const invitationId = urlParams.get('id');
    
    if (!invitationId) {
        showError('ID undangan tidak ditemukan');
        return;
    }
    
    // Load from localStorage
    const invitations = Storage.get('invitations') || [];
    invitationData = invitations.find(inv => inv.id === invitationId);
    
    if (!invitationData) {
        showError('Undangan tidak ditemukan');
        return;
    }
    
    // Check if published
    if (invitationData.status !== 'published') {
        showError('Undangan ini belum dipublish');
        return;
    }
    
    // Track view
    trackView(invitationId);
    
    // Render invitation
    renderInvitation();
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('invitationContent').style.display = 'block';
    }, 1000);
}

function trackView(invitationId) {
    let invitations = Storage.get('invitations') || [];
    const index = invitations.findIndex(inv => inv.id === invitationId);
    
    if (index !== -1) {
        invitations[index].views = (invitations[index].views || 0) + 1;
        Storage.set('invitations', invitations);
    }
}

function showError(message) {
    document.getElementById('loadingScreen').innerHTML = `
        <div class="loading-content">
            <div class="loading-icon">❌</div>
            <h2>${message}</h2>
            <p style="margin-top: 1rem; color: var(--gray-600);">
                <a href="index.html" style="color: var(--primary);">Kembali ke Beranda</a>
            </p>
        </div>
    `;
}

// ===================================
// RENDER INVITATION
// ===================================
function renderInvitation() {
    // Set page title
    document.title = invitationData.title + ' - Undangan Ku';
    
    // Render hero section
    renderHero();
    
    // Render couple section (for wedding/engagement)
    if (invitationData.eventType === 'wedding' || invitationData.eventType === 'engagement') {
        renderCouple();
    } else {
        document.getElementById('coupleSection').style.display = 'none';
    }
    
    // Render details section
    renderDetails();
    
    // Render maps section
    if (invitationData.settings.maps) {
        renderMaps();
    } else {
        document.getElementById('mapsSection').style.display = 'none';
    }
    
    // Render gallery section
    if (invitationData.photos.gallery && invitationData.photos.gallery.length > 0) {
        renderGallery();
    } else {
        document.getElementById('gallerySection').style.display = 'none';
    }
    
    // Render story section
    if (invitationData.description) {
        renderStory();
    } else {
        document.getElementById('storySection').style.display = 'none';
    }
    
    // Render RSVP section
    if (invitationData.settings.rsvp) {
        renderRSVP();
    } else {
        document.getElementById('rsvpSection').style.display = 'none';
    }
    
    // Render guestbook section
    if (invitationData.settings.guestbook) {
        renderGuestbook();
    } else {
        document.getElementById('guestbookSection').style.display = 'none';
    }
    
    // Setup countdown
    if (invitationData.settings.countdown) {
        setupCountdown();
    } else {
        document.getElementById('countdownContainer').style.display = 'none';
    }
    
    // Setup music
    if (invitationData.settings.music) {
        setupMusic();
    } else {
        document.getElementById('musicPlayer').style.display = 'none';
    }
}

// ===================================
// RENDER HERO
// ===================================
function renderHero() {
    // Set hero background
    const heroSection = document.querySelector('.hero-section');
    if (invitationData.photos.hero) {
        heroSection.style.backgroundImage = `url(${invitationData.photos.hero})`;
        heroSection.style.backgroundSize = 'cover';
        heroSection.style.backgroundPosition = 'center';
    }
    
    // Set event badge
    const eventBadge = document.getElementById('eventBadge');
    const badges = {
        'wedding': 'The Wedding of',
        'birthday': 'Happy Birthday',
        'aqiqah': 'Aqiqah',
        'engagement': 'Engagement Party',
        'other': 'You Are Invited'
    };
    eventBadge.textContent = badges[invitationData.eventType] || 'You Are Invited';
    
    // Set title
    const heroTitle = document.getElementById('heroTitle');
    if (invitationData.eventType === 'wedding' || invitationData.eventType === 'engagement') {
        heroTitle.textContent = `${invitationData.groom} & ${invitationData.bride}`;
    } else {
        heroTitle.textContent = invitationData.personName;
    }
    
    // Set date
    const date = new Date(invitationData.date + 'T' + invitationData.time);
    const dateStr = date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    document.getElementById('heroDate').textContent = dateStr;
    
    // Set venue
    document.getElementById('heroVenue').textContent = invitationData.venue;
}

// ===================================
// RENDER COUPLE
// ===================================
function renderCouple() {
    // Set groom info
    document.getElementById('groomName').textContent = invitationData.groom;
    
    // Set bride info
    document.getElementById('brideName').textContent = invitationData.bride;
    
    // Set photos (use hero image as placeholder if no separate photos)
    if (invitationData.photos.hero) {
        document.getElementById('groomImg').src = invitationData.photos.hero;
        document.getElementById('brideImg').src = invitationData.photos.hero;
    }
}

// ===================================
// RENDER DETAILS
// ===================================
function renderDetails() {
    // Set date & time
    const date = new Date(invitationData.date + 'T' + invitationData.time);
    const dateStr = date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('eventDateTime').innerHTML = `${dateStr}<br>Pukul ${timeStr} WIB`;
    
    // Set venue
    document.getElementById('eventVenue').innerHTML = `${invitationData.venue}<br>${invitationData.address}`;
    
    // Set contact
    document.getElementById('eventContact').innerHTML = `${invitationData.contact.name}<br>${invitationData.contact.phone}`;
}

// ===================================
// RENDER MAPS
// ===================================
function renderMaps() {
    // Set venue info
    document.getElementById('venueName').textContent = invitationData.venue;
    document.getElementById('venueAddress').textContent = invitationData.address;
    
    // Set maps link
    const mapsQuery = encodeURIComponent(invitationData.venue + ' ' + invitationData.address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
    document.getElementById('mapsLink').href = mapsUrl;
    
    // Embed maps
    const embedUrl = `https://maps.google.com/maps?q=${mapsQuery}&output=embed`;
    document.getElementById('mapsFrame').src = embedUrl;
}

// ===================================
// RENDER GALLERY
// ===================================
function renderGallery() {
    galleryImages = invitationData.photos.gallery;
    const galleryGrid = document.getElementById('galleryGrid');
    
    galleryGrid.innerHTML = galleryImages.map((img, index) => `
        <div class="gallery-item" onclick="openLightbox(${index})">
            <img src="${img}" alt="Gallery image ${index + 1}" loading="lazy">
        </div>
    `).join('');
}

// ===================================
// RENDER STORY
// ===================================
function renderStory() {
    document.getElementById('storyContent').textContent = invitationData.description;
}

// ===================================
// RENDER RSVP
// ===================================
function renderRSVP() {
    const rsvpForm = document.getElementById('rsvpForm');
    
    rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRSVPSubmit();
    });
    
    // Hide guests field if attendance is "tidak"
    document.getElementById('rsvpAttendance').addEventListener('change', function() {
        const guestsGroup = document.getElementById('guestsGroup');
        if (this.value === 'tidak') {
            guestsGroup.style.display = 'none';
        } else {
            guestsGroup.style.display = 'block';
        }
    });
}

function handleRSVPSubmit() {
    const name = document.getElementById('rsvpName').value.trim();
    const attendance = document.getElementById('rsvpAttendance').value;
    const guests = parseInt(document.getElementById('rsvpGuests').value) || 1;
    const message = document.getElementById('rsvpMessage').value.trim();
    
    if (!name || !attendance) {
        showToast('Mohon lengkapi semua field yang wajib diisi', 'error');
        return;
    }
    
    // Create RSVP object
    const rsvp = {
        id: Date.now().toString(),
        name: name,
        attendance: attendance,
        guests: attendance === 'hadir' ? guests : 0,
        message: message,
        timestamp: new Date().toISOString()
    };
    
    // Save to invitation data
    let invitations = Storage.get('invitations') || [];
    const index = invitations.findIndex(inv => inv.id === invitationData.id);
    
    if (index !== -1) {
        if (!invitations[index].rsvps) {
            invitations[index].rsvps = [];
        }
        invitations[index].rsvps.push(rsvp);
        Storage.set('invitations', invitations);
        
        // Update local data
        invitationData = invitations[index];
    }
    
    // Show success message
    showToast('Terima kasih! Konfirmasi Anda telah dikirim 🎉', 'success');
    
    // Reset form
    document.getElementById('rsvpForm').reset();
    
    // Update guestbook
    if (invitationData.settings.guestbook) {
        renderGuestbook();
    }
}

// ===================================
// RENDER GUESTBOOK
// ===================================
function renderGuestbook() {
    const messages = invitationData.rsvps || [];
    
    // Update stats
    document.getElementById('totalMessages').textContent = messages.length;
    const totalAttend = messages.filter(m => m.attendance === 'hadir').reduce((sum, m) => sum + m.guests, 0);
    document.getElementById('totalAttend').textContent = totalAttend;
    
    // Render messages
    const guestbookList = document.getElementById('guestbookList');
    
    if (messages.length === 0) {
        guestbookList.innerHTML = `
            <div class="empty-guestbook">
                <div class="empty-guestbook-icon">📝</div>
                <h3>Belum ada ucapan</h3>
                <p>Jadilah yang pertama menulis ucapan!</p>
            </div>
        `;
        return;
    }
    
    // Sort by timestamp (newest first)
    const sortedMessages = [...messages].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    guestbookList.innerHTML = sortedMessages.map(msg => {
        const attendanceLabels = {
            'hadir': 'Hadir',
            'tidak': 'Tidak Hadir',
            'ragu': 'Masih Ragu'
        };
        
        const timeAgo = formatTimeAgo(msg.timestamp);
        
        return `
            <div class="guestbook-message">
                <div class="message-header">
                    <div class="message-author">${msg.name}</div>
                    <div class="message-attendance attendance-${msg.attendance}">
                        ${attendanceLabels[msg.attendance]}
                    </div>
                </div>
                ${msg.message ? `<div class="message-text">${msg.message}</div>` : ''}
                <div class="message-time">${timeAgo}</div>
            </div>
        `;
    }).join('');
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
// COUNTDOWN TIMER
// ===================================
function setupCountdown() {
    const eventDate = new Date(invitationData.date + 'T' + invitationData.time).getTime();
    
    // Update countdown immediately
    updateCountdown(eventDate);
    
    // Update every second
    countdownInterval = setInterval(() => {
        updateCountdown(eventDate);
    }, 1000);
}

function updateCountdown(eventDate) {
    const now = new Date().getTime();
    const distance = eventDate - now;
    
    if (distance < 0) {
        // Event has passed
        document.getElementById('countdownContainer').innerHTML = `
            <div style="text-align: center; font-size: 1.5rem; font-weight: 600;">
                🎉 Acara Sudah Dimulai! 🎉
            </div>
        `;
        clearInterval(countdownInterval);
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// ===================================
// MUSIC PLAYER
// ===================================
function setupMusic() {
    const musicPlayer = document.getElementById('backgroundMusic');
    musicPlayer.src = invitationData.settings.music;
}

function toggleMusic() {
    const musicPlayer = document.getElementById('backgroundMusic');
    const musicToggle = document.getElementById('musicToggle');
    const musicIcon = document.getElementById('musicIcon');
    
    if (isMusicPlaying) {
        musicPlayer.pause();
        musicIcon.textContent = '🎵';
        musicToggle.classList.remove('playing');
        isMusicPlaying = false;
    } else {
        musicPlayer.play().then(() => {
            musicIcon.textContent = '🔊';
            musicToggle.classList.add('playing');
            isMusicPlaying = true;
        }).catch(err => {
            console.error('Error playing music:', err);
            showToast('Gagal memutar music', 'error');
        });
    }
}

// ===================================
// LIGHTBOX
// ===================================
function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    
    lightboxImg.src = galleryImages[index];
    lightbox.classList.add('show');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('show');
    
    // Restore body scroll
    document.body.style.overflow = '';
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    document.getElementById('lightboxImg').src = galleryImages[currentImageIndex];
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    document.getElementById('lightboxImg').src = galleryImages[currentImageIndex];
}

// Close lightbox on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        prevImage();
    } else if (e.key === 'ArrowRight') {
        nextImage();
    }
});

// Close lightbox on background click
document.getElementById('lightbox')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeLightbox();
    }
});

// ===================================
// SHARE FUNCTIONS
// ===================================
function shareWhatsApp() {
    const url = window.location.href;
    const text = `Saya mengundang Anda ke ${invitationData.title}! Lihat undangannya di: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function shareFacebook() {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareTwitter() {
    const url = window.location.href;
    const text = `Saya mengundang Anda ke ${invitationData.title}!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
}

function copyLink() {
    const url = window.location.href;
    
    // Create temporary input
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    
    showToast('Link berhasil dicopy! 📋', 'success');
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
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
    }
};

console.log('🎉 Invitation Page Loaded Successfully!');
