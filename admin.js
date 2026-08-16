// ===================================
// ADMIN PAGE JAVASCRIPT
// ===================================

// Global Variables
let currentUser = null;
let currentInvitation = null;
let currentStep = 1;
let selectedTemplate = null;
let heroImage = null;
let galleryImages = [];
let musicFile = null;

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuth();
    
    // Initialize event listeners
    initAuthPages();
    initDashboard();
    initCreateInvitation();
});

// ===================================
// AUTHENTICATION
// ===================================
function checkAuth() {
    const user = Storage.get('currentUser');
    if (user) {
        currentUser = user;
        showDashboard();
    } else {
        showRegister();
    }
}

function initAuthPages() {
    // Show Login
    document.getElementById('showLogin')?.addEventListener('click', function(e) {
        e.preventDefault();
        showLogin();
    });
    
    // Show Register
    document.getElementById('showRegister')?.addEventListener('click', function(e) {
        e.preventDefault();
        showRegister();
    });
    
    // Register Form
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    
    // Login Form
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
}

function showRegister() {
    hideAllPages();
    document.getElementById('registerPage').style.display = 'flex';
}

function showLogin() {
    hideAllPages();
    document.getElementById('loginPage').style.display = 'flex';
}

function showDashboard() {
    hideAllPages();
    document.getElementById('dashboardPage').style.display = 'block';
    
    // Update user info
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('welcomeName').textContent = currentUser.name;
    
    // Load dashboard data
    loadDashboardData();
}

function showCreateInvitation() {
    hideAllPages();
    document.getElementById('createInvitationPage').style.display = 'block';
    
    // Reset form
    resetCreateForm();
    
    // Load templates
    loadTemplates();
}

function hideAllPages() {
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'none';
    document.getElementById('createInvitationPage').style.display = 'none';
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showToast('Mohon lengkapi semua field', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Password tidak cocok', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password minimal 6 karakter', 'error');
        return;
    }
    
    // Check if email already exists
    const users = Storage.get('users') || [];
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
        showToast('Email sudah terdaftar', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: password, // In production, hash this!
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    Storage.set('users', users);
    
    // Auto login
    currentUser = newUser;
    Storage.set('currentUser', newUser);
    
    showToast('Registrasi berhasil! Selamat datang!', 'success');
    
    setTimeout(() => {
        showDashboard();
    }, 1000);
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validation
    if (!email || !password) {
        showToast('Mohon lengkapi semua field', 'error');
        return;
    }
    
    // Check credentials
    const users = Storage.get('users') || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        showToast('Email atau password salah', 'error');
        return;
    }
    
    // Login success
    currentUser = user;
    Storage.set('currentUser', user);
    
    showToast('Login berhasil! Selamat datang kembali!', 'success');
    
    setTimeout(() => {
        showDashboard();
    }, 1000);
}

function handleLogout() {
    if (confirm('Yakin mau logout?')) {
        currentUser = null;
        Storage.remove('currentUser');
        showToast('Logout berhasil', 'success');
        
        setTimeout(() => {
            showRegister();
        }, 500);
    }
}

// ===================================
// DASHBOARD
// ===================================
function initDashboard() {
    document.getElementById('createInvitationBtn')?.addEventListener('click', function() {
        showCreateInvitation();
    });
}

function loadDashboardData() {
    // Load invitations
    const invitations = getUserInvitations();
    
    // Update stats
    document.getElementById('totalInvitations').textContent = invitations.length;
    
    const totalViews = invitations.reduce((sum, inv) => sum + (inv.views || 0), 0);
    document.getElementById('totalViews').textContent = totalViews;
    
    const totalRSVPs = invitations.reduce((sum, inv) => sum + (inv.rsvps?.length || 0), 0);
    document.getElementById('totalRSVPs').textContent = totalRSVPs;
    
    // Render invitations list
    renderInvitationsList(invitations);
}

function getUserInvitations() {
    const allInvitations = Storage.get('invitations') || [];
    return allInvitations.filter(inv => inv.userId === currentUser.id);
}

function renderInvitationsList(invitations) {
    const container = document.getElementById('invitationsList');
    
    if (invitations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📄</div>
                <h3>Belum ada undangan</h3>
                <p>Mulai buat undangan digital cantik pertama Anda!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = invitations.map(inv => {
        const status = inv.status === 'published' ? 'Published' : 'Draft';
        const statusClass = inv.status === 'published' ? 'success' : 'warning';
        const date = new Date(inv.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        return `
            <div class="invitation-card" data-id="${inv.id}">
                <div class="invitation-image">
                    <img src="${inv.photos?.hero || 'images/placeholder.jpg'}" alt="${inv.title}">
                    <div class="invitation-badge" style="background: var(--${statusClass});">${status}</div>
                </div>
                <div class="invitation-info">
                    <h3 class="invitation-title">${inv.title}</h3>
                    <div class="invitation-meta">
                        <span>📅 ${date}</span>
                        <span>👁️ ${inv.views || 0} views</span>
                        <span>✅ ${inv.rsvps?.length || 0} RSVP</span>
                    </div>
                    <div class="invitation-actions">
                        <button class="btn btn-outline btn-small" onclick="editInvitation('${inv.id}')">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-primary btn-small" onclick="viewInvitation('${inv.id}')">
                            👁️ View
                        </button>
                        <button class="btn btn-outline btn-small" onclick="deleteInvitation('${inv.id}')">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function editInvitation(id) {
    const invitations = Storage.get('invitations') || [];
    const invitation = invitations.find(inv => inv.id === id);
    
    if (!invitation) {
        showToast('Undangan tidak ditemukan', 'error');
        return;
    }
    
    currentInvitation = invitation;
    showCreateInvitation();
    
    // Load template
    selectedTemplate = invitation.template;
    setTimeout(() => {
        const templateCard = document.querySelector(`.template-card[data-id="${invitation.template}"]`);
        if (templateCard) {
            templateCard.classList.add('selected');
        }
    }, 100);
    
    // Load hero image
    if (invitation.photos?.hero) {
        heroImage = invitation.photos.hero;
        setTimeout(() => {
            document.getElementById('heroPreviewImg').src = heroImage;
            document.getElementById('heroPreview').style.display = 'inline-block';
            document.getElementById('heroUploadArea').style.display = 'none';
        }, 100);
    }
    
    // Load gallery images
    if (invitation.photos?.gallery && invitation.photos.gallery.length > 0) {
        galleryImages = invitation.photos.gallery;
        setTimeout(() => {
            const galleryPreview = document.getElementById('galleryPreview');
            galleryImages.forEach((imageData, i) => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.innerHTML = `
                    <img src="${imageData}" alt="Gallery image">
                    <button class="btn-remove" onclick="removeGalleryImage(${i})">✕</button>
                `;
                galleryPreview.appendChild(galleryItem);
            });
        }, 100);
    }
    
    // Load music
    if (invitation.settings?.music) {
        musicFile = invitation.settings.music;
        setTimeout(() => {
            document.getElementById('musicPlayer').src = musicFile;
            document.getElementById('musicPreview').style.display = 'block';
        }, 100);
    }
    
    // Load form data
    setTimeout(() => {
        document.getElementById('eventType').value = invitation.eventType || 'wedding';
        handleEventTypeChange({ target: { value: invitation.eventType || 'wedding' } });
        
        if (invitation.eventType === 'wedding' || invitation.eventType === 'engagement') {
            document.getElementById('groomName').value = invitation.groom || '';
            document.getElementById('brideName').value = invitation.bride || '';
        } else {
            document.getElementById('personName').value = invitation.personName || '';
        }
        
        document.getElementById('eventDate').value = invitation.date || '';
        document.getElementById('eventTime').value = invitation.time || '';
        document.getElementById('venueName').value = invitation.venue || '';
        document.getElementById('venueAddress').value = invitation.address || '';
        document.getElementById('eventDescription').value = invitation.description || '';
        document.getElementById('contactName').value = invitation.contact?.name || '';
        document.getElementById('contactPhone').value = invitation.contact?.phone || '';
        
        // Load settings
        document.getElementById('enableCountdown').checked = invitation.settings?.countdown !== false;
        document.getElementById('enableMaps').checked = invitation.settings?.maps !== false;
        document.getElementById('enableRSVP').checked = invitation.settings?.rsvp !== false;
        document.getElementById('enableGuestbook').checked = invitation.settings?.guestbook !== false;
        
        showToast('Data undangan berhasil dimuat! Silakan edit.', 'success');
    }, 200);
}

function viewInvitation(id) {
    const currentPath = window.location.pathname;
    const baseUrl = currentPath.substring(0, currentPath.lastIndexOf('/'));
    const url = `${window.location.origin}${baseUrl}/undangan.html?id=${id}`;
    window.open(url, '_blank');
}

function deleteInvitation(id) {
    if (!confirm('Yakin mau hapus undangan ini?')) {
        return;
    }
    
    let invitations = Storage.get('invitations') || [];
    invitations = invitations.filter(inv => inv.id !== id);
    Storage.set('invitations', invitations);
    
    showToast('Undangan berhasil dihapus', 'success');
    
    // Reload dashboard
    loadDashboardData();
}

// ===================================
// CREATE INVITATION
// ===================================
function initCreateInvitation() {
    // Back to dashboard
    document.getElementById('backToDashboardBtn')?.addEventListener('click', function() {
        if (confirm('Yakin mau kembali? Data yang belum disimpan akan hilang.')) {
            showDashboard();
        }
    });
    
    // Step navigation
    document.getElementById('nextStep1')?.addEventListener('click', () => goToStep(2));
    document.getElementById('nextStep2')?.addEventListener('click', () => goToStep(3));
    document.getElementById('nextStep3')?.addEventListener('click', () => goToStep(4));
    document.getElementById('nextStep4')?.addEventListener('click', () => goToStep(5));
    
    document.getElementById('prevStep2')?.addEventListener('click', () => goToStep(1));
    document.getElementById('prevStep3')?.addEventListener('click', () => goToStep(2));
    document.getElementById('prevStep4')?.addEventListener('click', () => goToStep(3));
    document.getElementById('prevStep5')?.addEventListener('click', () => goToStep(4));
    
    // Template filter
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterTemplates(filter);
        });
    });
    
    // Upload hero image
    const heroUploadArea = document.getElementById('heroUploadArea');
    const heroImageInput = document.getElementById('heroImageInput');
    
    heroUploadArea?.addEventListener('click', () => heroImageInput.click());
    heroImageInput?.addEventListener('change', handleHeroImageUpload);
    
    document.getElementById('removeHeroBtn')?.addEventListener('click', removeHeroImage);
    
    // Upload gallery images
    const galleryUploadArea = document.getElementById('galleryUploadArea');
    const galleryImageInput = document.getElementById('galleryImageInput');
    
    galleryUploadArea?.addEventListener('click', () => galleryImageInput.click());
    galleryImageInput?.addEventListener('change', handleGalleryImageUpload);
    
    // Event type change
    document.getElementById('eventType')?.addEventListener('change', handleEventTypeChange);
    
    // Music upload
    document.getElementById('musicFile')?.addEventListener('change', handleMusicUpload);
    document.getElementById('removeMusicBtn')?.addEventListener('click', removeMusic);
    
    // Preview device toggle
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const device = this.getAttribute('data-device');
            document.getElementById('previewFrame').parentElement.setAttribute('data-device', device);
        });
    });
    
    // Publish invitation
    document.getElementById('publishInvitationBtn')?.addEventListener('click', publishInvitation);
}

function resetCreateForm() {
    currentStep = 1;
    selectedTemplate = null;
    heroImage = null;
    galleryImages = [];
    musicFile = null;
    currentInvitation = null;
    
    // Reset steps
    goToStep(1);
    
    // Reset forms
    document.getElementById('contentForm')?.reset();
    
    // Reset previews
    document.getElementById('heroPreview').style.display = 'none';
    document.getElementById('heroUploadArea').style.display = 'block';
    document.getElementById('galleryPreview').innerHTML = '';
    document.getElementById('musicPreview').style.display = 'none';
}

function goToStep(step) {
    // Validation before moving to next step
    if (step > currentStep) {
        if (!validateStep(currentStep)) {
            return;
        }
    }
    
    // Update step
    currentStep = step;
    
    // Update UI
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`step${step}`).classList.add('active');
    
    // Update steps indicator
    document.querySelectorAll('.step').forEach((s, index) => {
        const stepNumber = index + 1;
        s.classList.remove('active', 'completed');
        
        if (stepNumber < step) {
            s.classList.add('completed');
        } else if (stepNumber === step) {
            s.classList.add('active');
        }
    });
    
    // Load preview if step 5
    if (step === 5) {
        loadPreview();
    }
}

function validateStep(step) {
    if (step === 1) {
        if (!selectedTemplate) {
            showToast('Pilih template terlebih dahulu', 'error');
            return false;
        }
    }
    
    if (step === 2) {
        if (!heroImage) {
            showToast('Upload foto utama terlebih dahulu', 'error');
            return false;
        }
    }
    
    if (step === 3) {
        const form = document.getElementById('contentForm');
        const eventType = document.getElementById('eventType').value;
        
        if (eventType === 'wedding' || eventType === 'engagement') {
            const groomName = document.getElementById('groomName').value.trim();
            const brideName = document.getElementById('brideName').value.trim();
            
            if (!groomName || !brideName) {
                showToast('Lengkapi nama mempelai', 'error');
                return false;
            }
        } else {
            const personName = document.getElementById('personName').value.trim();
            
            if (!personName) {
                showToast('Lengkapi nama', 'error');
                return false;
            }
        }
        
        const eventDate = document.getElementById('eventDate').value;
        const eventTime = document.getElementById('eventTime').value;
        const venueName = document.getElementById('venueName').value.trim();
        const venueAddress = document.getElementById('venueAddress').value.trim();
        const contactName = document.getElementById('contactName').value.trim();
        const contactPhone = document.getElementById('contactPhone').value.trim();
        
        if (!eventDate || !eventTime || !venueName || !venueAddress || !contactName || !contactPhone) {
            showToast('Lengkapi semua field yang wajib diisi', 'error');
            return false;
        }
    }
    
    return true;
}

// ===================================
// TEMPLATES
// ===================================
function loadTemplates() {
    const templates = [
        {
            id: 'elegant-gold',
            name: 'Elegant Gold',
            category: 'wedding',
            description: 'Minimalist, elegant dengan sentuhan gold yang mewah',
            image: 'images/templates/elegant-gold.jpg'
        },
        {
            id: 'modern-romance',
            name: 'Modern Romance',
            category: 'wedding',
            description: 'Modern & romantic dengan warna dusty pink',
            image: 'images/templates/modern-romance.jpg'
        },
        {
            id: 'rustic-nature',
            name: 'Rustic Nature',
            category: 'wedding',
            description: 'Rustic & natural dengan sentuhan kayu',
            image: 'images/templates/rustic-nature.jpg'
        },
        {
            id: 'islamic-wedding',
            name: 'Islamic Wedding',
            category: 'wedding',
            description: 'Islamic elegant dengan ornamen Islami',
            image: 'images/templates/islamic-wedding.jpg'
        },
        {
            id: 'beach-wedding',
            name: 'Beach Wedding',
            category: 'wedding',
            description: 'Tropical & fresh untuk beach wedding',
            image: 'images/templates/beach-wedding.jpg'
        },
        {
            id: 'kids-fun',
            name: 'Kids Fun',
            category: 'birthday',
            description: 'Colorful & playful untuk ulang tahun anak',
            image: 'images/templates/kids-fun.jpg'
        },
        {
            id: 'sweet-17',
            name: 'Sweet 17',
            category: 'birthday',
            description: 'Girly & trendy untuk sweet seventeen',
            image: 'images/templates/sweet-17.jpg'
        },
        {
            id: 'adult-elegant',
            name: 'Adult Elegant',
            category: 'birthday',
            description: 'Sophisticated untuk ulang tahun dewasa',
            image: 'images/templates/adult-elegant.jpg'
        },
        {
            id: 'neon-party',
            name: 'Neon Party',
            category: 'birthday',
            description: 'Energetic & modern dengan neon glow',
            image: 'images/templates/neon-party.jpg'
        },
        {
            id: 'vintage-birthday',
            name: 'Vintage Birthday',
            category: 'birthday',
            description: 'Retro & nostalgic dengan vibe vintage',
            image: 'images/templates/vintage-birthday.jpg'
        },
        {
            id: 'islamic-green',
            name: 'Islamic Green',
            category: 'aqiqah',
            description: 'Islamic simple dengan nuansa hijau',
            image: 'images/templates/islamic-green.jpg'
        },
        {
            id: 'baby-blue',
            name: 'Baby Blue',
            category: 'aqiqah',
            description: 'Cute & soft untuk baby boy',
            image: 'images/templates/baby-blue.jpg'
        },
        {
            id: 'baby-pink',
            name: 'Baby Pink',
            category: 'aqiqah',
            description: 'Cute & soft untuk baby girl',
            image: 'images/templates/baby-pink.jpg'
        },
        {
            id: 'romantic-engagement',
            name: 'Romantic Engagement',
            category: 'engagement',
            description: 'Romantic & sweet untuk lamaran',
            image: 'images/templates/romantic-engagement.jpg'
        },
        {
            id: 'modern-proposal',
            name: 'Modern Proposal',
            category: 'engagement',
            description: 'Modern & clean untuk proposal',
            image: 'images/templates/modern-proposal.jpg'
        },
        {
            id: 'garden-engagement',
            name: 'Garden Engagement',
            category: 'engagement',
            description: 'Natural & fresh untuk garden party',
            image: 'images/templates/garden-engagement.jpg'
        },
        {
            id: 'corporate-event',
            name: 'Corporate Event',
            category: 'other',
            description: 'Professional untuk acara perusahaan',
            image: 'images/templates/corporate-event.jpg'
        },
        {
            id: 'graduation',
            name: 'Graduation',
            category: 'other',
            description: 'Academic & celebratory untuk wisuda',
            image: 'images/templates/graduation.jpg'
        },
        {
            id: 'housewarming',
            name: 'Housewarming',
            category: 'other',
            description: 'Warm & welcoming untuk rumah baru',
            image: 'images/templates/housewarming.jpg'
        }
    ];
    
    renderTemplates(templates);
}

function renderTemplates(templates) {
    const container = document.getElementById('templatesGrid');
    
    container.innerHTML = templates.map(template => `
        <div class="template-card" data-id="${template.id}" data-category="${template.category}">
            <div class="template-image">
                <img src="${template.image}" alt="${template.name}">
            </div>
            <div class="template-info">
                <h3 class="template-name">${template.name}</h3>
                <p class="template-category">${getCategoryLabel(template.category)}</p>
                <p class="template-description">${template.description}</p>
            </div>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedTemplate = this.getAttribute('data-id');
        });
    });
}

function filterTemplates(filter) {
    const cards = document.querySelectorAll('.template-card');
    
    cards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function getCategoryLabel(category) {
    const labels = {
        'wedding': '💍 Pernikahan',
        'birthday': '🎂 Ulang Tahun',
        'aqiqah': '👶 Aqiqah',
        'engagement': '💍 Engagement',
        'other': '🎉 Lainnya'
    };
    
    return labels[category] || category;
}

// ===================================
// IMAGE UPLOAD
// ===================================
function handleHeroImageUpload(e) {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validation
    if (!file.type.startsWith('image/')) {
        showToast('File harus berupa gambar', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
        showToast('Ukuran file maksimal 5MB', 'error');
        return;
    }
    
    // Read file
    const reader = new FileReader();
    
    reader.onload = function(event) {
        heroImage = event.target.result;
        
        // Show preview
        document.getElementById('heroPreviewImg').src = heroImage;
        document.getElementById('heroPreview').style.display = 'inline-block';
        document.getElementById('heroUploadArea').style.display = 'none';
        
        showToast('Foto utama berhasil diupload', 'success');
    };
    
    reader.readAsDataURL(file);
}

function removeHeroImage() {
    heroImage = null;
    document.getElementById('heroPreview').style.display = 'none';
    document.getElementById('heroUploadArea').style.display = 'block';
    document.getElementById('heroImageInput').value = '';
    
    showToast('Foto utama dihapus', 'info');
}

function handleGalleryImageUpload(e) {
    const files = Array.from(e.target.files);
    
    if (galleryImages.length + files.length > 10) {
        showToast('Maksimal 10 foto', 'error');
        return;
    }
    
    files.forEach(file => {
        // Validation
        if (!file.type.startsWith('image/')) {
            showToast('File harus berupa gambar', 'error');
            return;
        }
        
        if (file.size > 3 * 1024 * 1024) { // 3MB
            showToast('Ukuran file maksimal 3MB', 'error');
            return;
        }
        
        // Read file
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const imageData = event.target.result;
            galleryImages.push(imageData);
            
            // Add to gallery preview
            const galleryPreview = document.getElementById('galleryPreview');
            const imageIndex = galleryImages.length - 1;
            
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${imageData}" alt="Gallery image">
                <button class="btn-remove" onclick="removeGalleryImage(${imageIndex})">✕</button>
            `;
            
            galleryPreview.appendChild(galleryItem);
            
            showToast('Foto gallery berhasil ditambahkan', 'success');
        };
        
        reader.readAsDataURL(file);
    });
    
    // Reset input
    e.target.value = '';
}

function removeGalleryImage(index) {
    galleryImages.splice(index, 1);
    
    // Re-render gallery
    const galleryPreview = document.getElementById('galleryPreview');
    galleryPreview.innerHTML = '';
    
    galleryImages.forEach((imageData, i) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${imageData}" alt="Gallery image">
            <button class="btn-remove" onclick="removeGalleryImage(${i})">✕</button>
        `;
        
        galleryPreview.appendChild(galleryItem);
    });
    
    showToast('Foto gallery dihapus', 'info');
}

function handleEventTypeChange(e) {
    const eventType = e.target.value;
    
    if (eventType === 'wedding' || eventType === 'engagement') {
        document.getElementById('namesSection').style.display = 'block';
        document.getElementById('singleNameSection').style.display = 'none';
    } else {
        document.getElementById('namesSection').style.display = 'none';
        document.getElementById('singleNameSection').style.display = 'block';
    }
}

function handleMusicUpload(e) {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validation
    if (!file.type.startsWith('audio/')) {
        showToast('File harus berupa audio', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
        showToast('Ukuran file maksimal 5MB', 'error');
        return;
    }
    
    // Read file
    const reader = new FileReader();
    
    reader.onload = function(event) {
        musicFile = event.target.result;
        
        // Show preview
        document.getElementById('musicPlayer').src = musicFile;
        document.getElementById('musicPreview').style.display = 'block';
        
        showToast('Music berhasil diupload', 'success');
    };
    
    reader.readAsDataURL(file);
}

function removeMusic() {
    musicFile = null;
    document.getElementById('musicPreview').style.display = 'none';
    document.getElementById('musicFile').value = '';
    document.getElementById('musicPlayer').src = '';
    
    showToast('Music dihapus', 'info');
}

// ===================================
// PREVIEW & PUBLISH
// ===================================
function loadPreview() {
    // Collect all data
    const invitationData = collectInvitationData();
    
    // Create preview URL (in production, this would be a real URL)
    const previewUrl = `preview.html?data=${encodeURIComponent(JSON.stringify(invitationData))}`;
    
    // Load in iframe
    document.getElementById('previewFrame').src = previewUrl;
}

function collectInvitationData() {
    const eventType = document.getElementById('eventType').value;
    
    const data = {
        id: currentInvitation?.id || Date.now().toString(),
        userId: currentUser.id,
        template: selectedTemplate,
        eventType: eventType,
        photos: {
            hero: heroImage,
            gallery: galleryImages
        },
        settings: {
            countdown: document.getElementById('enableCountdown').checked,
            maps: document.getElementById('enableMaps').checked,
            rsvp: document.getElementById('enableRSVP').checked,
            guestbook: document.getElementById('enableGuestbook').checked,
            music: musicFile
        },
        createdAt: currentInvitation?.createdAt || new Date().toISOString(),
        status: 'draft'
    };
    
    // Add names based on event type
    if (eventType === 'wedding' || eventType === 'engagement') {
        data.groom = document.getElementById('groomName').value.trim();
        data.bride = document.getElementById('brideName').value.trim();
        data.title = `Pernikahan ${data.groom} & ${data.bride}`;
    } else {
        data.personName = document.getElementById('personName').value.trim();
        data.title = `${getEventLabel(eventType)} ${data.personName}`;
    }
    
    // Add event details
    data.date = document.getElementById('eventDate').value;
    data.time = document.getElementById('eventTime').value;
    data.venue = document.getElementById('venueName').value.trim();
    data.address = document.getElementById('venueAddress').value.trim();
    data.description = document.getElementById('eventDescription').value.trim();
    data.contact = {
        name: document.getElementById('contactName').value.trim(),
        phone: document.getElementById('contactPhone').value.trim()
    };
    
    return data;
}

function getEventLabel(eventType) {
    const labels = {
        'wedding': 'Pernikahan',
        'birthday': 'Ulang Tahun',
        'aqiqah': 'Aqiqah',
        'engagement': 'Engagement',
        'other': 'Acara'
    };
    
    return labels[eventType] || 'Acara';
}

function publishInvitation() {
    const invitationData = collectInvitationData();
    invitationData.status = 'published';
    invitationData.publishedAt = new Date().toISOString();
    invitationData.views = 0;
    invitationData.rsvps = [];
    invitationData.messages = [];
    
    // Save to localStorage
    let invitations = Storage.get('invitations') || [];
    
    if (currentInvitation) {
        // Update existing
        const index = invitations.findIndex(inv => inv.id === currentInvitation.id);
        if (index !== -1) {
            invitations[index] = invitationData;
        }
    } else {
        // Create new
        invitations.push(invitationData);
    }
    
    Storage.set('invitations', invitations);
    
    showToast('Undangan berhasil dipublish! 🎉', 'success');
    
    // Show share modal
    setTimeout(() => {
        showShareModal(invitationData.id);
    }, 1000);
}

function showShareModal(invitationId) {
    const currentPath = window.location.pathname;
    const baseUrl = currentPath.substring(0, currentPath.lastIndexOf('/'));
    const url = `${window.location.origin}${baseUrl}/undangan.html?id=${invitationId}`;
    
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = '🎉 Undangan Berhasil Dipublish!';
    
    document.getElementById('modalBody').innerHTML = `
        <p style="margin-bottom: 1rem;">Undangan Anda sudah live! Share link ini ke tamu:</p>
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
            <input type="text" id="shareUrl" value="${url}" readonly style="flex: 1; padding: 0.75rem; border: 2px solid var(--gray-300); border-radius: 0.5rem;">
            <button class="btn btn-primary btn-small" onclick="copyShareUrl()">Copy</button>
        </div>
        <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-outline btn-small" onclick="shareWhatsApp('${url}')">
                💬 WhatsApp
            </button>
            <button class="btn btn-outline btn-small" onclick="shareFacebook('${url}')">
                📘 Facebook
            </button>
            <button class="btn btn-outline btn-small" onclick="shareTwitter('${url}')">
                🐦 Twitter
            </button>
        </div>
    `;
    
    document.getElementById('modalFooter').innerHTML = `
        <button class="btn btn-outline" onclick="closeModal()">Tutup</button>
        <button class="btn btn-primary" onclick="closeModal(); showDashboard();">Ke Dashboard</button>
    `;
    
    modal.classList.add('show');
}

function copyShareUrl() {
    const urlInput = document.getElementById('shareUrl');
    urlInput.select();
    document.execCommand('copy');
    
    showToast('Link berhasil dicopy!', 'success');
}

function shareWhatsApp(url) {
    const text = `Saya mengundang Anda ke acara saya! Lihat undangannya di: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function shareFacebook(url) {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareTwitter(url) {
    const text = 'Saya mengundang Anda ke acara saya!';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

// Close modal on outside click
document.getElementById('modal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// ===================================
// UTILITY FUNCTIONS
// ===================================
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

console.log('🎉 Admin Page Loaded Successfully!');
