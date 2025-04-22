// Initialize Telegram WebApp
const tgApp = window.Telegram.WebApp;
tgApp.expand();
tgApp.ready();

// Set theme variables based on Telegram theme
document.documentElement.style.setProperty('--tg-theme-bg-color', tgApp.colorScheme === 'dark' ? '#1c1c1c' : '#ffffff');
document.documentElement.style.setProperty('--tg-theme-text-color', tgApp.colorScheme === 'dark' ? '#ffffff' : '#000000');
document.documentElement.style.setProperty('--tg-theme-hint-color', tgApp.colorScheme === 'dark' ? '#aaaaaa' : '#999999');
document.documentElement.style.setProperty('--tg-theme-link-color', tgApp.colorScheme === 'dark' ? '#8cc3ff' : '#2675c8');
document.documentElement.style.setProperty('--tg-theme-button-color', tgApp.colorScheme === 'dark' ? '#8cc3ff' : '#2675c8');
document.documentElement.style.setProperty('--tg-theme-button-text-color', tgApp.colorScheme === 'dark' ? '#1c1c1c' : '#ffffff');

// Mock data for profiles
const mockProfiles = [
    {
        id: 1,
        name: 'Sofia',
        age: 28,
        bio: 'Coffee lover, hiking enthusiast',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'
    },
    {
        id: 2,
        name: 'Alex',
        age: 31,
        bio: 'Travel addict, foodie, photographer',
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'
    },
    {
        id: 3,
        name: 'Emma',
        age: 26,
        bio: 'Book lover, dog person, introvert',
        photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'
    },
    {
        id: 4,
        name: 'James',
        age: 29,
        bio: 'Fitness fanatic, loves cooking',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'
    },
    {
        id: 5,
        name: 'Olivia',
        age: 27,
        bio: 'Art lover, musician, night owl',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80'
    }
];

// Variables for swipe handling
let currentProfileIndex = 0;
let xStart = null;
let yStart = null;
let xDiff = 0;
let currentCard = null;
let isAnimating = false;

// DOM references
const cardsWrapper = document.querySelector('.cards-wrapper');
const likeButton = document.getElementById('like');
const dislikeButton = document.getElementById('dislike');
const matchPopup = document.getElementById('match-popup');
const matchName = document.getElementById('match-name');
const continueButton = document.getElementById('continue-button');

// Initialize the card stack
function initializeCards() {
    if (mockProfiles.length === 0) {
        cardsWrapper.innerHTML = `
            <div class="empty-state">
                <h3>No more profiles</h3>
                <p>Check back later for more matches</p>
            </div>
        `;
        return;
    }
    
    cardsWrapper.innerHTML = '';
    
    // Create cards for each profile, in reverse order so first is on top
    for (let i = Math.min(mockProfiles.length - 1, currentProfileIndex + 2); i >= currentProfileIndex; i--) {
        const profile = mockProfiles[i];
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = i;
        
        card.innerHTML = `
            <div class="photo" style="background-image: url('${profile.photo}')"></div>
            <div class="info">
                <h2>${profile.name} <span class="age">${profile.age}</span></h2>
                <p>${profile.bio}</p>
            </div>
        `;
        
        cardsWrapper.appendChild(card);
        
        if (i === currentProfileIndex) {
            currentCard = card;
            setupSwipeListeners(card);
        }
    }
}

// Set up event listeners for swiping
function setupSwipeListeners(card) {
    card.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
}

function handlePointerDown(e) {
    if (isAnimating) return;
    xStart = e.clientX;
    yStart = e.clientY;
    currentCard.classList.add('swiping');
}

function handlePointerMove(e) {
    if (xStart === null || isAnimating) return;
    
    const xCurrent = e.clientX;
    const yCurrent = e.clientY;
    xDiff = xCurrent - xStart;
    const yDiff = yCurrent - yStart;
    
    // Apply transform to the card
    const rotation = xDiff * 0.1; // Rotation effect
    currentCard.style.transform = `translate(${xDiff}px, ${yDiff}px) rotate(${rotation}deg)`;
    
    // Change opacity of buttons based on direction
    if (xDiff > 0) {
        likeButton.style.opacity = Math.min(xDiff / 100, 1);
        dislikeButton.style.opacity = 0.5;
    } else if (xDiff < 0) {
        dislikeButton.style.opacity = Math.min(Math.abs(xDiff) / 100, 1);
        likeButton.style.opacity = 0.5;
    } else {
        likeButton.style.opacity = dislikeButton.style.opacity = 0.5;
    }
}

function handlePointerUp() {
    if (xStart === null || isAnimating) return;
    
    currentCard.classList.remove('swiping');
    
    // Reset button opacity
    likeButton.style.opacity = dislikeButton.style.opacity = 1;
    
    const swipeThreshold = 100; // Minimum distance to consider it a swipe
    
    if (xDiff > swipeThreshold) {
        // Swipe right (like)
        swipeRight();
    } else if (xDiff < -swipeThreshold) {
        // Swipe left (dislike)
        swipeLeft();
    } else {
        // Reset card position
        currentCard.style.transform = '';
    }
    
    // Reset tracking variables
    xStart = null;
    xDiff = 0;
}

function swipeRight() {
    isAnimating = true;
    
    // Animate card flying off to the right
    currentCard.classList.add('removed');
    currentCard.style.transform = `translate(${window.innerWidth}px, ${-100}px) rotate(30deg)`;
    
    // Simulate a match 30% of the time
    if (Math.random() < 0.3) {
        setTimeout(() => {
            showMatch(mockProfiles[currentProfileIndex].name);
        }, 500);
    } else {
        setTimeout(nextCard, 300);
    }
    
    // Clean up event listeners
    currentCard.removeEventListener('pointerdown', handlePointerDown);
    
    // Notify Telegram backend (would be implemented with real backend)
    const likedProfile = mockProfiles[currentProfileIndex];
    tgApp.sendData(JSON.stringify({
        action: 'like',
        profileId: likedProfile.id
    }));
}

function swipeLeft() {
    isAnimating = true;
    
    // Animate card flying off to the left
    currentCard.classList.add('removed');
    currentCard.style.transform = `translate(${-window.innerWidth}px, ${-100}px) rotate(-30deg)`;
    
    setTimeout(nextCard, 300);
    
    // Clean up event listeners
    currentCard.removeEventListener('pointerdown', handlePointerDown);
    
    // Notify Telegram backend (would be implemented with real backend)
    const dislikedProfile = mockProfiles[currentProfileIndex];
    tgApp.sendData(JSON.stringify({
        action: 'dislike',
        profileId: dislikedProfile.id
    }));
}

function nextCard() {
    currentProfileIndex++;
    isAnimating = false;
    
    if (currentProfileIndex >= mockProfiles.length) {
        // No more profiles
        cardsWrapper.innerHTML = `
            <div class="empty-state">
                <h3>No more profiles</h3>
                <p>Check back later for more matches</p>
            </div>
        `;
        return;
    }
    
    // Remove the current top card
    if (currentCard) {
        currentCard.remove();
    }
    
    // Add a new card at the bottom if needed
    if (currentProfileIndex + 2 < mockProfiles.length) {
        const newCardIndex = currentProfileIndex + 2;
        const profile = mockProfiles[newCardIndex];
        const newCard = document.createElement('div');
        newCard.className = 'card';
        newCard.dataset.index = newCardIndex;
        
        newCard.innerHTML = `
            <div class="photo" style="background-image: url('${profile.photo}')"></div>
            <div class="info">
                <h2>${profile.name} <span class="age">${profile.age}</span></h2>
                <p>${profile.bio}</p>
            </div>
        `;
        
        cardsWrapper.insertBefore(newCard, cardsWrapper.firstChild);
    }
    
    // Update current card reference
    currentCard = document.querySelector(`.card[data-index="${currentProfileIndex}"]`);
    if (currentCard) {
        setupSwipeListeners(currentCard);
    }
}

function showMatch(name) {
    matchName.textContent = name;
    matchPopup.classList.remove('hidden');
}

// Button event listeners
likeButton.addEventListener('click', () => {
    if (!isAnimating && currentCard) {
        swipeRight();
    }
});

dislikeButton.addEventListener('click', () => {
    if (!isAnimating && currentCard) {
        swipeLeft();
    }
});

continueButton.addEventListener('click', () => {
    matchPopup.classList.add('hidden');
    nextCard();
});

// Initialize the app
initializeCards();

