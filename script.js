class ImageCarousel {
    constructor() {
        this.currentIndex = 0;
        this.images = [];
        this.isLoading = true;
        
        this.init();
    }

    async init() {
        await this.loadImages();
        this.setupCarousel();
        this.setupEventListeners();
        this.updateCarousel();
    }

    async loadImages() {
        try {
            const response = await fetch('./files');
            const text = await response.text();
            
            // Parse the file content to extract URLs
            const lines = text.split('\n');
            this.images = lines
                .map(line => line.trim())
                .filter(line => line && !line.match(/^\d+\|?\s*$/))
                .map(line => {
                    // Remove line numbers if present
                    const match = line.match(/^\d+\|?\s*(.+)$/);
                    return match ? match[1] : line;
                })
                .filter(url => url && (url.includes('drive.google.com') || url.includes('amazonaws.com')));
            
            // Add https:// prefix if missing
            this.images = this.images.map(url => 
                url.startsWith('http') ? url : `https://${url}`
            );
            
            console.log('Loaded images:', this.images);
        } catch (error) {
            console.error('Error loading images:', error);
            this.showError('Failed to load images');
        }
    }

    setupCarousel() {
        const track = document.getElementById('carouselTrack');
        const indicators = document.getElementById('indicators');
        
        // Clear existing content
        track.innerHTML = '';
        indicators.innerHTML = '';
        
        // Create slides and indicators
        this.images.forEach((imageSrc, index) => {
            // Create slide
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `
                <div class="loading">Loading image ${index + 1}...</div>
                <img src="${imageSrc}" alt="Image ${index + 1}" style="display: none;" onload="this.style.display='block'; this.previousElementSibling.style.display='none';" onerror="this.previousElementSibling.innerHTML='Failed to load image ${index + 1}';">
            `;
            track.appendChild(slide);
            
            // Create indicator
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            indicator.addEventListener('click', () => this.goToSlide(index));
            indicators.appendChild(indicator);
        });
        
        // Update navigation buttons state
        this.updateNavigationButtons();
    }

    setupEventListeners() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const navUpBtn = document.getElementById('navUpBtn');
        const navDownBtn = document.getElementById('navDownBtn');
        
        prevBtn.addEventListener('click', () => this.prevSlide());
        nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Left navigation buttons
        if (navUpBtn) {
            navUpBtn.addEventListener('click', () => {
                if (this.currentIndex > 0) {
                    this.prevSlide();
                }
            });
        }
        if (navDownBtn) {
            navDownBtn.addEventListener('click', () => {
                if (this.currentIndex < this.images.length - 1) {
                    this.nextSlide();
                }
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
            if (e.key === 'ArrowUp') this.prevSlide();
            if (e.key === 'ArrowDown') this.nextSlide();
        });
        
        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        const carouselWrapper = document.querySelector('.carousel-wrapper');
        
        carouselWrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        carouselWrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
        this.touchStartX = touchStartX;
        this.touchEndX = touchEndX;
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchEndX - this.touchStartX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.prevSlide();
            } else {
                this.nextSlide();
            }
        }
    }

    updateCarousel() {
        const track = document.getElementById('carouselTrack');
        const indicators = document.querySelectorAll('.indicator');
        const postContent = document.querySelector('.post-content p');
        
        // Update slide position
        track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        
        // Update indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
        
        // Update post content with progress
        if (postContent) {
            const current = this.currentIndex + 1;
            const total = this.images.length;
            postContent.textContent = `Check out these amazing images! (${current}/${total})`;
        }
        
        // Update navigation buttons
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const navUpBtn = document.getElementById('navUpBtn');
        const navDownBtn = document.getElementById('navDownBtn');
        
        const isAtStart = this.currentIndex === 0;
        const isAtEnd = this.currentIndex === this.images.length - 1;
        
        prevBtn.disabled = isAtStart;
        nextBtn.disabled = isAtEnd;
        
        if (navUpBtn) {
            navUpBtn.style.opacity = isAtStart ? '0.3' : '1';
            navUpBtn.style.cursor = isAtStart ? 'not-allowed' : 'pointer';
        }
        
        if (navDownBtn) {
            navDownBtn.style.opacity = isAtEnd ? '0.3' : '1';
            navDownBtn.style.cursor = isAtEnd ? 'not-allowed' : 'pointer';
        }
    }

    prevSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateCarousel();
        }
    }

    nextSlide() {
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
            this.updateCarousel();
        }
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
    }

    showError(message) {
        const track = document.getElementById('carouselTrack');
        track.innerHTML = `
            <div class="carousel-slide">
                <div style="text-align: center; color: #666; padding: 40px;">
                    <p>${message}</p>
                    <p>Please check the 'files' file and try again.</p>
                </div>
            </div>
        `;
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageCarousel();
});

// Add some interactivity to engagement buttons
document.addEventListener('DOMContentLoaded', () => {
    const likeBtn = document.querySelector('.like-btn');
    const commentBtn = document.querySelector('.comment-btn');
    const shareBtn = document.querySelector('.share-btn');
    const sendBtn = document.querySelector('.send-btn');
    
    let isLiked = false;
    
    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            isLiked = !isLiked;
            likeBtn.style.color = isLiked ? '#0A66C2' : '#666666';
            likeBtn.querySelector('svg').style.fill = isLiked ? '#0A66C2' : 'none';
            likeBtn.querySelector('svg').style.stroke = isLiked ? '#0A66C2' : 'currentColor';
        });
    }
    
    if (commentBtn) {
        commentBtn.addEventListener('click', () => {
            alert('Comment feature would open a comment section');
        });
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: 'Image Carousel',
                    text: 'Check out these amazing images!',
                    url: window.location.href
                });
            } else {
                alert('Share feature would open share options');
            }
        });
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            alert('Send feature would open a message composer');
        });
    }
});