// ==========================================================================
// 1. App State Controller & Tree Hierarchy Config
// ==========================================================================
let currentView = 'main-menu'; 
let currentSelectionIndex = 0; 
let currentSubSelectionIndex = 0;
let currentLegalSelectionIndex = 0;

const views = {
    'main-menu': document.getElementById('view-main-menu'),
    'games': document.getElementById('view-games'),
    'settings': document.getElementById('view-settings'),
    'blog': document.getElementById('view-blog'),
    'contact': document.getElementById('view-contact'),
    'about': document.getElementById('view-about'),
    'legal': document.getElementById('view-legal'),
    'privacy': document.getElementById('view-privacy'),
    'terms': document.getElementById('view-terms'),
    'license': document.getElementById('view-license') // Added License view mapping
};

const labelFooterLeft = document.querySelector('.screen-footer-bar span:first-child');
const labelFooterRight = document.querySelector('.screen-footer-bar span:last-child');

// Define back navigation paths
const backNavigationMap = {
    'games': 'main-menu',
    'settings': 'main-menu',
    'blog': 'main-menu',
    'contact': 'main-menu',
    'about': 'main-menu',
    'legal': 'about',
    'privacy': 'legal',
    'terms': 'legal',
    'license': 'legal' // Added reverse mapping back to legal menu
};

// Render Primary Views (Main Menu, Games)
function updateMenuVisuals(viewKey) {
    const menuItems = views[viewKey].querySelectorAll('.menu-item');
    menuItems.forEach((node, i) => {
        if (i === currentSelectionIndex) {
            node.classList.add('active');
            node.textContent = `▶ ${node.textContent.replace('▶ ', '')}`;
        } else {
            node.classList.remove('active');
            node.textContent = node.textContent.replace('▶ ', '');
        }
    });
}

// Render Submenu Views (Settings, About)
function updateSubMenuVisuals(viewKey) {
    const subItems = views[viewKey].querySelectorAll('.submenu-item');
    subItems.forEach((node, i) => {
        if (i === currentSubSelectionIndex) {
            node.classList.add('active');
            node.textContent = `▶ ${node.textContent.replace('▶ ', '')}`;
        } else {
            node.classList.remove('active');
            node.textContent = node.textContent.replace('▶ ', '');
        }
    });
}

// Render Legal List Selection View
function updateLegalMenuVisuals() {
    const legalItems = views['legal'].querySelectorAll('.legal-item');
    legalItems.forEach((node, i) => {
        if (i === currentLegalSelectionIndex) {
            node.classList.add('active');
            node.textContent = `▶ ${node.textContent.replace('▶ ', '')}`;
        } else {
            node.classList.remove('active');
            node.textContent = node.textContent.replace('▶ ', '');
        }
    });
}

// Global Router Engine
function changeView(targetView) {
    currentView = targetView;
    
    // Manage view selections cleanly
    if (targetView === 'about') {
        currentSubSelectionIndex = 0;
    } else if (targetView === 'legal') {
        currentLegalSelectionIndex = 0;
    }
    
    Object.values(views).forEach(v => v.classList.remove('active-view'));
    views[targetView].classList.add('active-view');
    
    if (targetView === 'main-menu') {
        labelFooterLeft.textContent = "Menu";
        labelFooterRight.textContent = "Back";
    } else {
        labelFooterLeft.textContent = "";
        labelFooterRight.textContent = "Back";
    }
    
    // Sync active arrows immediately upon structural display
    if (targetView === 'main-menu' || targetView === 'games') {
        updateMenuVisuals(targetView);
    } else if (targetView === 'settings' || targetView === 'about') {
        updateSubMenuVisuals(targetView);
    } else if (targetView === 'legal') {
        updateLegalMenuVisuals();
    }
}

// ==========================================================================
// 2. Click Handling Logic
// ==========================================================================
document.getElementById('btn-up').addEventListener('click', () => {
    if (currentView === 'main-menu' || currentView === 'games') {
        if (currentSelectionIndex > 0) {
            currentSelectionIndex--;
            updateMenuVisuals(currentView);
        }
    } else if (currentView === 'settings' || currentView === 'about') {
        if (currentSubSelectionIndex > 0) {
            currentSubSelectionIndex--;
            updateSubMenuVisuals(currentView);
        }
    } else if (currentView === 'legal') {
        if (currentLegalSelectionIndex > 0) {
            currentLegalSelectionIndex--;
            updateLegalMenuVisuals();
        }
    }
});

document.getElementById('btn-down').addEventListener('click', () => {
    if (currentView === 'main-menu' || currentView === 'games') {
        const items = views[currentView].querySelectorAll('.menu-item');
        if (currentSelectionIndex < items.length - 1) {
            currentSelectionIndex++;
            updateMenuVisuals(currentView);
        }
    } else if (currentView === 'settings' || currentView === 'about') {
        const subItems = views[currentView].querySelectorAll('.submenu-item');
        if (currentSubSelectionIndex < subItems.length - 1) {
            currentSubSelectionIndex++;
            updateSubMenuVisuals(currentView);
        }
    } else if (currentView === 'legal') {
        const legalItems = views['legal'].querySelectorAll('.legal-item');
        if (currentLegalSelectionIndex < legalItems.length - 1) {
            currentLegalSelectionIndex++;
            updateLegalMenuVisuals();
        }
    }
});

// A Button Action (Select/Enter View)
document.getElementById('btn-a').addEventListener('click', () => {
    if (currentView === 'main-menu') {
        switch(currentSelectionIndex) {
            case 0: changeView('games'); break;
            case 1: changeView('settings'); break;
            case 2: changeView('blog'); break;
            case 3: changeView('contact'); break;
            case 4: changeView('about'); break;
        }
    } else if (currentView === 'about') {
        if (currentSubSelectionIndex === 1) {
            changeView('legal'); // Enters the Legal submenu
        }
    } else if (currentView === 'legal') {
        if (currentLegalSelectionIndex === 0) {
            changeView('privacy');
        } else if (currentLegalSelectionIndex === 1) {
            changeView('terms');
        } else if (currentLegalSelectionIndex === 2) {
            changeView('license'); // Enters License data leaf node
        }
    }
});

// B Button Action (Go Back through structured parent nodes)
document.getElementById('btn-b').addEventListener('click', () => {
    const fallbackView = backNavigationMap[currentView];
    if (fallbackView) {
        changeView(fallbackView);
    }
});

// ==========================================================================
// 3. Hardware Controller Keyboard Mapping
// ==========================================================================
const keyboardMap = {
    'ArrowUp': 'btn-up', 'w': 'btn-up', 'W': 'btn-up',
    'ArrowDown': 'btn-down', 's': 'btn-down', 'S': 'btn-down',
    'ArrowLeft': 'btn-left', 'a': 'btn-left', 'A': 'btn-left',
    'ArrowRight': 'btn-right', 'd': 'btn-right', 'D': 'btn-right',
    'z': 'btn-a', 'Z': 'btn-a',
    'x': 'btn-b', 'X': 'btn-b',
    'Enter': 'btn-start',
    'Shift': 'btn-select'
};

window.addEventListener('keydown', (event) => {
    const targetedId = keyboardMap[event.key];
    if (targetedId) {
        event.preventDefault();
        const visualNode = document.getElementById(targetedId);
        if (visualNode) {
            visualNode.click();
            visualNode.classList.add('keyboard-active');
            setTimeout(() => visualNode.classList.remove('keyboard-active'), 100);
        }
    }
});