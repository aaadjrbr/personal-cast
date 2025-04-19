// DOM Elements
const uploadForm = document.getElementById('uploadForm');
const episodesList = document.getElementById('episodesList');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const pagination = document.getElementById('pagination');
const audioPlayerModal = new bootstrap.Modal(document.getElementById('audioPlayerModal'));
const modalAudioPlayer = document.getElementById('modalAudioPlayer');
const audioPlayerTitle = document.getElementById('audioPlayerTitle');
const audioPlayerDescription = document.getElementById('audioPlayerDescription');
const audioPlayerDate = document.getElementById('audioPlayerDate');
const audioPlayerCategory = document.getElementById('audioPlayerCategory');
const uploadBtn = document.getElementById('uploadBtn');
const uploadBtnText = document.getElementById('uploadBtnText');
const uploadSpinner = document.getElementById('uploadSpinner');
const downloadBtn = document.getElementById('downloadBtn');
const playPauseBtn = document.getElementById('playPauseBtn');
const stopBtn = document.getElementById('stopBtn');
const closePlayerBtn = document.getElementById('closePlayerBtn');
const floatingPlayer = document.querySelector('.floating-player');
const playerTitle = document.querySelector('.player-title');
const playerCategory = document.querySelector('.player-category');
const btnScrollTop = document.querySelector('.btn-scroll-top');
const fileInput = document.getElementById('audioFile');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const closeFileBtn = document.querySelector('.btn-close-file');
const searchClear = document.querySelector('.search-clear');
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtnText = document.getElementById('loginBtnText');
const loginSpinner = document.getElementById('loginSpinner');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const addEpisodeSection = document.getElementById('addEpisodeSection');
const toggleAddBtn = document.getElementById('toggleAddBtn');
const authError = document.getElementById('authError');
const forgotPassword = document.getElementById('forgotPassword');
const favoriteBtn = document.getElementById('favoriteBtn');
const editEpisodeBtn = document.getElementById('editEpisodeBtn');
const deleteEpisodeBtn = document.getElementById('deleteEpisodeBtn');
const showFavoritesBtn = document.getElementById('showFavoritesBtn');
const showAllBtn = document.getElementById('showAllBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const modalReadMoreBtn = document.getElementById('modalReadMoreBtn');

// Global variables
let episodes = [];
let filteredEpisodes = [];
let currentPage = 1;
const episodesPerPage = 6;
let allTypes = [];
let currentPlayingEpisode = null;
let isPlaying = false;
let isViewingFavorites = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setupReadMoreButtons();
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('episodeDate').value = today;
    
    // Setup file input
    setupFileInput();
    
    // Setup scroll to top button
    setupScrollToTop();
    
    // Setup audio visualizer animation
    setupAudioVisualizer();
    
    // Load episodes
    loadEpisodes();
});

// Setup file input functionality
function setupFileInput() {
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            const file = this.files[0];
            fileName.textContent = file.name;
            fileInfo.classList.remove('d-none');
            
            // Add pulse animation to upload button
            uploadBtn.classList.add('pulse');
            setTimeout(() => uploadBtn.classList.remove('pulse'), 2000);
        }
    });
    
    closeFileBtn.addEventListener('click', function() {
        fileInput.value = '';
        fileInfo.classList.add('d-none');
    });
}

// Setup scroll to top button
function setupScrollToTop() {
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            btnScrollTop.classList.add('visible');
        } else {
            btnScrollTop.classList.remove('visible');
        }
    });
    
    btnScrollTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Setup audio visualizer animation
function setupAudioVisualizer() {
    const audioBars = document.querySelectorAll('.audio-bar');
    
    modalAudioPlayer.addEventListener('play', function() {
        audioBars.forEach(bar => {
            bar.style.animationPlayState = 'running';
        });
    });
    
    modalAudioPlayer.addEventListener('pause', function() {
        audioBars.forEach(bar => {
            bar.style.animationPlayState = 'paused';
        });
    });
}

// Authentication state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        document.body.classList.add('admin-logged-in');
        toggleAddBtn.classList.add('visible');
        adminLoginBtn.style.display = 'none';
        showFavoritesBtn.classList.remove('d-none');
        
        // Load user favorites with error handling
        loadUserFavorites(user.uid).catch(error => {
            console.error('Failed to load favorites:', error);
            window.userFavorites = [];
        });
    } else {
        // User is signed out
        document.body.classList.remove('admin-logged-in');
        toggleAddBtn.classList.remove('visible');
        addEpisodeSection.classList.remove('expanded');
        adminLoginBtn.style.display = 'block';
        showFavoritesBtn.classList.add('d-none');
        showAllBtn.classList.add('d-none');
        
        // Clear favorites when logged out
        window.userFavorites = [];
    }
});

// Load user's favorite episodes
async function loadUserFavorites(userId) {
    try {
        const favoritesSnapshot = await db.collection('favorites')
            .where('userId', '==', userId)
            .get();
        
        const favorites = [];
        favoritesSnapshot.forEach(doc => {
            favorites.push(doc.data().episodeId);
        });
        
        // Store favorites in a global variable
        window.userFavorites = favorites;
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

// Toggle favorite status
async function toggleFavorite(episodeId, userId) {
    try {
        const favoriteRef = db.collection('favorites')
            .where('userId', '==', userId)
            .where('episodeId', '==', episodeId)
            .limit(1);
        
        const snapshot = await favoriteRef.get();
        
        if (snapshot.empty) {
            // Add to favorites
            await db.collection('favorites').add({
                userId,
                episodeId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } else {
            // Remove from favorites
            await snapshot.docs[0].ref.delete();
            return false;
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        
        // Show user-friendly message
        let message = 'Error updating favorite.';
        if (error.code === 'permission-denied') {
            message = 'Please login to favorite episodes.';
        }
        
        alert(message);
        throw error;
    }
}

// Admin login button
adminLoginBtn.addEventListener('click', () => {
    loginModal.show();
});

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = loginEmail.value;
    const password = loginPassword.value;
    
    // Show loading state
    loginBtnText.textContent = 'Signing in...';
    loginSpinner.classList.remove('d-none');
    authError.style.display = 'none';
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        loginModal.hide();
    } catch (error) {
        console.error('Login error:', error);
        authError.textContent = error.message;
        authError.style.display = 'block';
    } finally {
        loginBtnText.textContent = 'Sign In';
        loginSpinner.classList.add('d-none');
    }
});

// Forgot password functionality
forgotPassword.addEventListener('click', () => {
    const email = loginEmail.value || prompt('Please enter your email address:');
    if (email) {
        auth.sendPasswordResetEmail(email)
            .then(() => {
                alert('Password reset email sent. Please check your inbox.');
            })
            .catch(error => {
                alert('Error sending reset email: ' + error.message);
            });
    }
});

// Toggle add episode section
toggleAddBtn.addEventListener('click', () => {
    addEpisodeSection.classList.toggle('expanded');
    toggleAddBtn.classList.toggle('expanded');

    // Scroll to #scroll-here if expanding
    if (addEpisodeSection.classList.contains('expanded')) {
        const scrollTarget = document.getElementById('scroll-here');
        scrollTarget.scrollIntoView({ behavior: 'smooth' });
    }
});

// Search functionality
searchInput.addEventListener('input', function() {
    if (this.value.length > 0) {
        searchClear.classList.remove('d-none');
    } else {
        searchClear.classList.add('d-none');
    }
    filterEpisodes();
});

searchClear.addEventListener('click', function() {
    searchInput.value = '';
    searchClear.classList.add('d-none');
    filterEpisodes();
    searchInput.focus();
});

// Type filter functionality
typeFilter.addEventListener('change', function() {
    filterEpisodes();
});

// Show favorites button
showFavoritesBtn.addEventListener('click', function() {
    isViewingFavorites = true;
    showFavoritesBtn.classList.add('d-none');
    showAllBtn.classList.remove('d-none');
    displayFavorites();
});

// Show all episodes button
showAllBtn.addEventListener('click', function() {
    isViewingFavorites = false;
    showAllBtn.classList.add('d-none');
    showFavoritesBtn.classList.remove('d-none');
    filterEpisodes();
});

// Display favorite episodes
async function displayFavorites() {
    const user = auth.currentUser;
    if (!user) return;
    
    episodesList.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading your favorites...</p>
        </div>
    `;
    
    try {
        // Get favorite episode IDs
        const favoritesSnapshot = await db.collection('favorites')
            .where('userId', '==', user.uid)
            .get();
        
        const favoriteIds = favoritesSnapshot.docs.map(doc => doc.data().episodeId);
        
        if (favoriteIds.length === 0) {
            episodesList.innerHTML = `
                <div class="no-results">
                    <i class="ri-heart-line"></i>
                    <p>You haven't favorited any episodes yet.</p>
                </div>
            `;
            pagination.innerHTML = '';
            return;
        }
        
        // Get the actual episodes
        const episodesPromises = favoriteIds.map(id => 
            db.collection('episodes').doc(id).get()
        );
        
        const episodesSnapshot = await Promise.all(episodesPromises);
        
        // Filter out any nulls (in case episodes were deleted)
        const favoriteEpisodes = episodesSnapshot
            .filter(doc => doc.exists)
            .map(doc => {
                const data = doc.data();
                data.id = doc.id;
                return data;
            });
        
        if (favoriteEpisodes.length === 0) {
            episodesList.innerHTML = `
                <div class="no-results">
                    <i class="ri-heart-line"></i>
                    <p>Your favorite episodes may have been removed.</p>
                </div>
            `;
            return;
        }
        
        // Display these episodes
        filteredEpisodes = favoriteEpisodes;
        currentPage = 1;
        displayEpisodes();
        
    } catch (error) {
        console.error('Error loading favorites:', error);
        
        let errorMessage = 'Error loading favorites.';
        if (error.code === 'permission-denied') {
            errorMessage = 'Please login to view favorites.';
        }
        
        episodesList.innerHTML = `
            <div class="error-message">
                <i class="ri-error-warning-line"></i>
                <p>${errorMessage}</p>
            </div>
        `;
    }
}

// Upload form submission
uploadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!auth.currentUser) {
        loginModal.show();
        return;
    }

    // Get form elements
    const title = document.getElementById('episodeTitle').value;
    const description = document.getElementById('episodeDescription').value;
    const type = document.getElementById('episodeType').value;
    const date = document.getElementById('episodeDate').value;
    const file = document.getElementById('audioFile').files[0];
    const isEditMode = this.dataset.editMode;

    // Validate only required fields
    if (!title.trim()) {
        alert('Title is required');
        return;
    }

    // Show loading state
    uploadBtn.disabled = true;
    uploadBtnText.textContent = isEditMode ? 'Updating...' : 'Uploading...';
    uploadSpinner.classList.remove('d-none');

    try {
        let downloadURL;
        
        // Only handle file if one was selected
        if (file) {
            const storageRef = storage.ref(`episodes/${Date.now()}_${file.name}`);
            await storageRef.put(file);
            downloadURL = await storageRef.getDownloadURL();
        }

        // Prepare update data - only include what's changed
        const episodeData = {
            title,
            description,
            type,
            date,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Only include audioUrl if we have a new file
        if (downloadURL) {
            episodeData.audioUrl = downloadURL;
        }

        if (isEditMode) {
            // Update existing episode
            await db.collection('episodes').doc(isEditMode).update(episodeData);
            
            // Update local copy if it's the currently playing episode
            if (currentPlayingEpisode && currentPlayingEpisode.id === isEditMode) {
                Object.assign(currentPlayingEpisode, episodeData);
            }
            
            alert('Episode updated successfully!');
        } else {
            // For new episodes, require a file
            if (!file) {
                throw new Error('Please select an audio file for new episodes');
            }
            
            episodeData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            episodeData.audioUrl = downloadURL;
            await db.collection('episodes').add(episodeData);
        }

        // Reset form
        this.reset();
        delete this.dataset.editMode;
        document.getElementById('episodeDate').value = new Date().toISOString().split('T')[0];
        fileInfo.classList.add('d-none');
        cancelEditBtn.classList.add('d-none');
        uploadBtnText.textContent = 'Upload Episode';

        // Reload episodes
        if (isViewingFavorites) {
            displayFavorites();
        } else {
            loadEpisodes();
        }

    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    } finally {
        uploadBtn.disabled = false;
        uploadSpinner.classList.add('d-none');
    }
});

// Load episodes from Firestore
function loadEpisodes() {
    episodesList.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading your episodes...</p>
        </div>
    `;
    
    db.collection('episodes')
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            episodes = [];
            allTypes = [];
            
            querySnapshot.forEach((doc) => {
                const episode = doc.data();
                episode.id = doc.id;
                episodes.push(episode);
                
                // Collect unique types
                if (episode.type && !allTypes.includes(episode.type)) {
                    allTypes.push(episode.type);
                }
            });
            
            // Update type filter dropdown
            updateTypeFilter();
            
            // Initial filter and display
            filterEpisodes();
        })
        .catch((error) => {
            console.error('Error loading episodes:', error);
            episodesList.innerHTML = `
                <div class="error-message">
                    <i class="ri-error-warning-line"></i>
                    <p>Error loading episodes. Please try again.</p>
                </div>
            `;
        });
}

// Update type filter dropdown
function updateTypeFilter() {
    typeFilter.innerHTML = '<option value="">All Categories</option>';
    
    allTypes.sort().forEach(type => {
        typeFilter.innerHTML += `<option value="${type}">${type}</option>`;
    });
}

// Filter episodes based on search and type filter
function filterEpisodes() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;
    
    filteredEpisodes = episodes.filter(episode => {
        const matchesSearch = episode.title.toLowerCase().includes(searchTerm) || 
                             (episode.description && episode.description.toLowerCase().includes(searchTerm));
        const matchesType = !selectedType || episode.type === selectedType;
        
        return matchesSearch && matchesType;
    });
    
    currentPage = 1;
    displayEpisodes();
}

// Truncate description text
function truncateDescription(description, maxLength = 120) {
    if (!description) return 'No description available';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
}

// Display episodes with pagination
function displayEpisodes() {
    if (filteredEpisodes.length === 0) {
        episodesList.innerHTML = `
            <div class="no-results">
                <i class="ri-search-eye-line"></i>
                <p>No episodes found. Try adjusting your search or filters.</p>
            </div>
        `;
        pagination.innerHTML = '';
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredEpisodes.length / episodesPerPage);
    const startIndex = (currentPage - 1) * episodesPerPage;
    const endIndex = Math.min(startIndex + episodesPerPage, filteredEpisodes.length);
    const paginatedEpisodes = filteredEpisodes.slice(startIndex, endIndex);
    
    // Display episodes
    let html = '';
    paginatedEpisodes.forEach(episode => {
        const isFavorite = window.userFavorites && window.userFavorites.includes(episode.id);
        const description = episode.description || 'No description available';
        const shouldTruncate = description.length > 120;
        const displayDescription = shouldTruncate ? truncateDescription(description) : description;
        
        html += `
            <div class="episode-card" data-aos="fade-up">
                <div class="episode-thumbnail">
                    <i class="ri-music-2-fill"></i>
                    ${isFavorite ? '<span class="favorite-badge"><i class="ri-heart-fill"></i></span>' : ''}
                </div>
                <h3 class="episode-title">${episode.title}</h3>
                <div class="episode-description-container">
                    <p class="episode-description">${displayDescription}</p>
                    ${shouldTruncate ? `<button class="read-more-btn" data-full="${escapeHtml(description)}">Read more</button>` : ''}
                </div>
                <div class="episode-meta">
                    <div class="meta-item">
                        <i class="ri-calendar-line"></i>
                        <span>${formatDate(episode.createdAt)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="ri-price-tag-3-line"></i>
                        <span>${episode.type || 'Uncategorized'}</span>
                    </div>
                </div>
                <button class="play-btn" data-id="${episode.id}">
                    <i class="ri-play-fill"></i> Play Now
                </button>
            </div>
        `;
    });
    
    episodesList.innerHTML = html;
    
    // Add event listeners to play buttons
    document.querySelectorAll('.play-btn').forEach(button => {
        button.addEventListener('click', function() {
            const episodeId = this.getAttribute('data-id');
            playEpisode(episodeId);
        });
    });
    
    // Setup read more buttons
    setupReadMoreButtons();
    
    // Update pagination
    updatePagination(totalPages);
}

// Escape HTML for safe display
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Setup read more buttons
function setupReadMoreButtons() {
    // Event delegation for episode cards
    episodesList.addEventListener('click', function(e) {
        const readMoreBtn = e.target.closest('.read-more-btn');
        if (readMoreBtn) {
            e.preventDefault();
            const descriptionContainer = readMoreBtn.closest('.episode-description-container');
            const descriptionElement = descriptionContainer.querySelector('.episode-description');
            const fullDescription = readMoreBtn.getAttribute('data-full');
            
            if (readMoreBtn.textContent === 'Read more') {
                descriptionElement.textContent = fullDescription;
                readMoreBtn.textContent = 'Read less';
            } else {
                descriptionElement.textContent = truncateDescription(fullDescription);
                readMoreBtn.textContent = 'Read more';
            }
        }
    });
}

// Update pagination controls
function updatePagination(totalPages) {
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage - 1}">
            <i class="ri-arrow-left-s-line"></i>
        </a>
    </li>`;
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        html += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
        if (startPage > 2) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
            <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        html += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
    }
    
    // Next button
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage + 1}">
            <i class="ri-arrow-right-s-line"></i>
        </a>
    </li>`;
    
    pagination.innerHTML = html;
    
    // Add event listeners to pagination buttons
    document.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.getAttribute('data-page'));
            if (page !== currentPage) {
                currentPage = page;
                displayEpisodes();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

// Play episode in modal
function playEpisode(episodeId) {
    // First, clean up any old playback positions (older than 24 hours)
    cleanupOldPlaybackPositions();

    const episode = filteredEpisodes.find(e => e.id === episodeId);
    if (!episode) return;

    // Check if we're already playing this episode
    if (currentPlayingEpisode && currentPlayingEpisode.id === episodeId) {
        // Just toggle play/pause if modal is already open
        if (audioPlayerModal._element.classList.contains('show')) {
            if (isPlaying) {
                modalAudioPlayer.pause();
            } else {
                modalAudioPlayer.play();
            }
            isPlaying = !isPlaying;
            updatePlayPauseButton();
            return;
        }
    }
    
    currentPlayingEpisode = episode;
    const description = episode.description || 'No description available';
    
    // Update modal content
    audioPlayerTitle.textContent = episode.title;
    audioPlayerDescription.textContent = description;
    audioPlayerDate.textContent = formatDate(episode.date);
    audioPlayerCategory.textContent = episode.type || 'Uncategorized';
    
    // Only change source if it's a different episode
    if (modalAudioPlayer.src !== episode.audioUrl) {
        modalAudioPlayer.src = episode.audioUrl;
        
        // Try to load saved playback position from localStorage
        const playbackData = localStorage.getItem(`episode_${episodeId}_playback`);
        if (playbackData) {
            try {
                const { time, timestamp } = JSON.parse(playbackData);
                // Check if the saved position is less than 24 hours old
                if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                    modalAudioPlayer.currentTime = parseFloat(time);
                } else {
                    // Remove expired playback data
                    localStorage.removeItem(`episode_${episodeId}_playback`);
                }
            } catch (e) {
                console.error('Error parsing playback data:', e);
            }
        }
    }
    
    // Handle read more button in modal
    if (description.length > 200) {
        audioPlayerDescription.textContent = truncateDescription(description, 200);
        modalReadMoreBtn.classList.remove('d-none');
        modalReadMoreBtn.textContent = 'Read more';
        modalReadMoreBtn.onclick = function() {
            if (this.textContent === 'Read more') {
                audioPlayerDescription.textContent = description;
                this.textContent = 'Read less';
            } else {
                audioPlayerDescription.textContent = truncateDescription(description, 200);
                this.textContent = 'Read more';
            }
        };
    } else {
        modalReadMoreBtn.classList.add('d-none');
    }
    
    // Update floating player
    playerTitle.textContent = episode.title;
    playerCategory.textContent = episode.type || 'Uncategorized';
    floatingPlayer.classList.add('active');
    
    // Show/hide admin buttons
    const user = auth.currentUser;
    if (user) {
        editEpisodeBtn.classList.remove('d-none');
        deleteEpisodeBtn.classList.remove('d-none');
    } else {
        editEpisodeBtn.classList.add('d-none');
        deleteEpisodeBtn.classList.add('d-none');
    }
    
    // Update favorite button
    if (user && window.userFavorites && window.userFavorites.includes(episode.id)) {
        favoriteBtn.classList.add('favorited');
        favoriteBtn.innerHTML = '<i class="ri-heart-fill me-1"></i> Favorited';
    } else {
        favoriteBtn.classList.remove('favorited');
        favoriteBtn.innerHTML = '<i class="ri-heart-line me-1"></i> Favorite';
    }
    
    // Show modal
    audioPlayerModal.show();
    
    // Play when modal is fully shown
    const modalShownListener = () => {
        modalAudioPlayer.play()
            .then(() => {
                isPlaying = true;
                updatePlayPauseButton();
            })
            .catch(e => console.log('Autoplay prevented:', e));
        audioPlayerModal._element.removeEventListener('shown.bs.modal', modalShownListener);
    };
    
    audioPlayerModal._element.addEventListener('shown.bs.modal', modalShownListener);
    
    // Set up download button
    downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = episode.audioUrl;
        link.download = `${episode.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}

// Helper function to clean up old playback positions (older than 24 hours)
function cleanupOldPlaybackPositions() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('episode_') && key.endsWith('_playback')) {
            try {
                const data = localStorage.getItem(key);
                const { timestamp } = JSON.parse(data);
                if (now - timestamp > oneDay) {
                    localStorage.removeItem(key);
                }
            } catch (e) {
                console.error('Error cleaning up playback data:', e);
            }
        }
    }
}

// Add these event listeners somewhere in your initialization code
modalAudioPlayer.addEventListener('timeupdate', function() {
    if (currentPlayingEpisode) {
        // Save playback position with timestamp
        const playbackData = {
            time: modalAudioPlayer.currentTime,
            timestamp: Date.now()
        };
        localStorage.setItem(
            `episode_${currentPlayingEpisode.id}_playback`,
            JSON.stringify(playbackData)
        );
    }
});

modalAudioPlayer.addEventListener('ended', function() {
    isPlaying = false;
    updatePlayPauseButton();
    if (currentPlayingEpisode) {
        // Remove playback position when episode ends
        localStorage.removeItem(`episode_${currentPlayingEpisode.id}_playback`);
    }
});

// Modal read more button functionality
modalReadMoreBtn.addEventListener('click', function() {
    const fullDescription = currentPlayingEpisode.description || 'No description available';
    if (this.textContent === 'Read more') {
        audioPlayerDescription.textContent = fullDescription;
        this.textContent = 'Read less';
    } else {
        audioPlayerDescription.textContent = truncateDescription(fullDescription, 200);
        this.textContent = 'Read more';
    }
});

// Update play/pause button
function updatePlayPauseButton() {
    if (isPlaying) {
        playPauseBtn.innerHTML = '<i class="ri-pause-fill"></i>';
    } else {
        playPauseBtn.innerHTML = '<i class="ri-play-fill"></i>';
    }
}

// Play/pause button event
playPauseBtn.addEventListener('click', function() {
    if (!currentPlayingEpisode) return;
    
    if (isPlaying) {
        modalAudioPlayer.pause();
    } else {
        modalAudioPlayer.play();
    }
    
    isPlaying = !isPlaying;
    updatePlayPauseButton();
});

// Stop button event
stopBtn.addEventListener('click', function() {
    if (!currentPlayingEpisode) return;
    
    modalAudioPlayer.pause();
    modalAudioPlayer.currentTime = 0;
    isPlaying = false;
    updatePlayPauseButton();
});

// Close player button
closePlayerBtn.addEventListener('click', function() {
    floatingPlayer.classList.remove('active');
    modalAudioPlayer.pause();
    isPlaying = false;
    updatePlayPauseButton();
});

// Edit episode button
editEpisodeBtn.addEventListener('click', function() {
    if (!currentPlayingEpisode) return;
    
    // Populate form with episode data
    document.getElementById('episodeTitle').value = currentPlayingEpisode.title;
    document.getElementById('episodeDescription').value = currentPlayingEpisode.description || '';
    document.getElementById('episodeType').value = currentPlayingEpisode.type || '';
    document.getElementById('episodeDate').value = currentPlayingEpisode.date || new Date().toISOString().split('T')[0];
    
    // Clear file input but keep it optional
    fileInput.value = '';
    fileInfo.classList.add('d-none');
    
    // Set edit mode
    uploadForm.dataset.editMode = currentPlayingEpisode.id;
    uploadBtnText.textContent = 'Update Episode';
    cancelEditBtn.classList.remove('d-none');
    
    // Make file input not required during edits
    fileInput.required = false;
    
    // Show the form
    addEpisodeSection.classList.add('expanded');
    document.getElementById('scroll-here').scrollIntoView({ behavior: 'smooth' });
    audioPlayerModal.hide();
});

// Cancel edit button
cancelEditBtn.addEventListener('click', function() {
    uploadForm.reset();
    delete uploadForm.dataset.editMode;
    document.getElementById('episodeDate').value = new Date().toISOString().split('T')[0];
    fileInfo.classList.add('d-none');
    uploadBtnText.textContent = 'Upload Episode';
    cancelEditBtn.classList.add('d-none');
    
    // Reset file input requirement
    fileInput.required = true;
});

// Delete episode button
deleteEpisodeBtn.addEventListener('click', async function() {
    if (!currentPlayingEpisode) return;
    
    if (confirm('Are you sure you want to delete this episode? This cannot be undone.')) {
        try {
            // Delete from Firestore
            await db.collection('episodes').doc(currentPlayingEpisode.id).delete();
            
            // Delete from Storage (optional - if you want to delete the audio file too)
            const storageRef = storage.refFromURL(currentPlayingEpisode.audioUrl);
            await storageRef.delete();
            
            // Close modal and reload episodes
            audioPlayerModal.hide();
            
            if (isViewingFavorites) {
                displayFavorites();
            } else {
                loadEpisodes();
            }
            
            // Show success message
            alert('Episode deleted successfully');
        } catch (error) {
            console.error('Error deleting episode:', error);
            alert('Error deleting episode: ' + error.message);
        }
    }
});

// Favorite button
favoriteBtn.addEventListener('click', async function() {
    const user = auth.currentUser;
    if (!user || !currentPlayingEpisode) return;
    
    try {
        const isFavorited = await toggleFavorite(currentPlayingEpisode.id, user.uid);
        
        if (isFavorited) {
            favoriteBtn.classList.add('favorited');
            // Update favorites list
            if (!window.userFavorites) window.userFavorites = [];
            window.userFavorites.push(currentPlayingEpisode.id);
        } else {
            favoriteBtn.classList.remove('favorited');
            // Update favorites list
            if (window.userFavorites) {
                window.userFavorites = window.userFavorites.filter(id => id !== currentPlayingEpisode.id);
            }
        }
        
        // Update the episode card if we're viewing favorites
        if (isViewingFavorites) {
            displayFavorites();
        } else {
            // Just update the current view
            displayEpisodes();
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
    }
});

// Audio player events
modalAudioPlayer.addEventListener('play', function() {
    isPlaying = true;
    updatePlayPauseButton();
});

modalAudioPlayer.addEventListener('pause', function() {
    isPlaying = false;
    updatePlayPauseButton();
});

modalAudioPlayer.addEventListener('ended', function() {
    isPlaying = false;
    updatePlayPauseButton();
});

// Format date for display
function formatDate(dateInput) {
    if (!dateInput) return 'Unknown date';

    let date;
    if (typeof dateInput === 'string') {
        // Handle string date (e.g., '2025-04-19')
        date = new Date(dateInput);
    } else if (dateInput instanceof firebase.firestore.Timestamp) {
        // Handle Firestore timestamp
        date = dateInput.toDate();
    } else {
        // Handle unexpected input
        return 'Invalid date';
    }

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

// Set today's date for the date picker
const today = new Date().toISOString().split('T')[0];