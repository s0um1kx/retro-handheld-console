import { AudioManager } from './core/AudioManager.js';
import { PetController } from './core/PetController.js';
import { StatusHeader } from './core/StatusHeader.js';
import { GameEngine } from './GameEngine.js';

import { GridStack } from './games/GridStack/GridStack.js';
import { CosmicGrid } from './games/CosmicGrid/CosmicGrid.js';
import { ByteEater } from './games/ByteEater/ByteEater.js';
import { PocketJumper } from './games/PocketJumper/PocketJumper.js';
import { MicroQuest } from './games/MicroQuest/MicroQuest.js';

const audio = new AudioManager();
const pet = new PetController();
const status = new StatusHeader();

// Setup Canvas for Games inside Viewport
const viewport = document.querySelector('.game-viewport');
const gameCanvas = document.createElement('canvas');
gameCanvas.id = 'retro-game-canvas';
gameCanvas.style.display = 'none';
gameCanvas.style.width = '100%';
gameCanvas.style.height = '100%';
gameCanvas.style.imageRendering = 'pixelated';
viewport.appendChild(gameCanvas);

const gameEngine = new GameEngine(gameCanvas, audio);

let currentView = 'main-menu'; 
let currentSelectionIndex = 0; 
let currentSubSelectionIndex = 0;
let currentLegalSelectionIndex = 0;
let currentAudioIndex = 0;

const views = {
    'main-menu': document.getElementById('view-main-menu'),
    'games': document.getElementById('view-games'),
    'settings': document.getElementById('view-settings'),
    'audio': document.getElementById('view-audio'),
    'controls': document.getElementById('view-controls'),
    'theme': document.getElementById('view-theme'),
    'blog': document.getElementById('view-blog'),
    'contact': document.getElementById('view-contact'),
    'about': document.getElementById('view-about'),
    'careers': document.getElementById('view-careers'),
    'legal': document.getElementById('view-legal'),
    'privacy': document.getElementById('view-privacy'),
    'terms': document.getElementById('view-terms'),
    'license': document.getElementById('view-license')
};

const labelFooterLeft = document.querySelector('.screen-footer-bar span:first-child');
const labelFooterRight = document.querySelector('.screen-footer-bar span:last-child');

const backNavigationMap = {
    'games': 'main-menu',
    'settings': 'main-menu',
    'audio': 'settings',
    'controls': 'settings',
    'theme': 'settings',
    'blog': 'main-menu',
    'contact': 'main-menu',
    'about': 'main-menu',
    'careers': 'about',
    'legal': 'about',
    'privacy': 'legal',
    'terms': 'legal',
    'license': 'legal'
};

const gamesRegistry = {
    0: { name: 'GridStack', cls: GridStack },
    1: { name: 'Cosmic Grid', cls: CosmicGrid },
    2: { name: 'Byte Eater', cls: ByteEater },
    3: { name: 'Pocket Jumper', cls: PocketJumper },
    4: { name: 'Micro Quest', cls: MicroQuest }
};

function renderAudioView() {
    const musicCheck = audio.isMusicOn ? '[■] ON   [ ] OFF' : '[ ] ON   [■] OFF';
    const sfxCheck = audio.isSFXOn ? '[■] ON   [ ] OFF' : '[ ] ON   [■] OFF';

    const totalBlocks = 10;
    const filledBlocks = Math.round((audio.masterVolume / 100) * totalBlocks);
    const barStr = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);

    const prefix0 = currentAudioIndex === 0 ? '> ' : '  ';
    const prefix1 = currentAudioIndex === 1 ? '> ' : '  ';
    const prefix2 = currentAudioIndex === 2 ? '> ' : '  ';

    const line0 = `${prefix0}Music (BGM) : ${musicCheck}`;
    const line1 = `${prefix1}Sound (SFX) : ${sfxCheck}`;
    const line2 = `${prefix2}Master Vol  : ${barStr} (${audio.masterVolume}%)`;

    const block = document.querySelector('.audio-config-block');
    if (block) {
        block.textContent = `=== AUDIO SETTINGS ===\n\n  [ SETTING ]   [ STATE ]\n${line0}\n${line1}\n${line2}\n\n======================\n [LEFT/RIGHT] Toggle\n [B/ESC] to Return`;
    }
}

function updateMenuVisuals(viewKey) {
    const menuItems = views[viewKey].querySelectorAll('.menu-item');
    menuItems.forEach((node, i) => {
        if (i === currentSelectionIndex) {
            node.classList.add('active');
            node.textContent = `> ${node.textContent.replace(/^>\s*/, '')}`;
        } else {
            node.classList.remove('active');
            node.textContent = node.textContent.replace(/^>\s*/, '');
        }
    });
}

function updateSubMenuVisuals(viewKey) {
    const subItems = views[viewKey].querySelectorAll('.submenu-item');
    subItems.forEach((node, i) => {
        if (i === currentSubSelectionIndex) {
            node.classList.add('active');
            node.textContent = `> ${node.textContent.replace(/^>\s*/, '')}`;
        } else {
            node.classList.remove('active');
            node.textContent = node.textContent.replace(/^>\s*/, '');
        }
    });
}

function updateLegalMenuVisuals() {
    const legalItems = views['legal'].querySelectorAll('.legal-item');
    legalItems.forEach((node, i) => {
        if (i === currentLegalSelectionIndex) {
            node.classList.add('active');
            node.textContent = `> ${node.textContent.replace(/^>\s*/, '')}`;
        } else {
            node.classList.remove('active');
            node.textContent = node.textContent.replace(/^>\s*/, '');
        }
    });
}

function changeView(targetView) {
    currentView = targetView;
    gameCanvas.style.display = 'none';
    
    if (targetView === 'games' || targetView === 'settings' || targetView === 'about') {
        currentSubSelectionIndex = 0;
    } else if (targetView === 'legal') {
        currentLegalSelectionIndex = 0;
    } else if (targetView === 'audio') {
        currentAudioIndex = 0;
        renderAudioView();
    }
    
    Object.values(views).forEach(v => {
        if (v) v.classList.remove('active-view');
    });
    if (views[targetView]) {
        views[targetView].classList.add('active-view');
    }
    
    if (targetView === 'main-menu') {
        labelFooterLeft.textContent = "Menu";
        labelFooterRight.textContent = "Back";
    } else {
        labelFooterLeft.textContent = "";
        labelFooterRight.textContent = "Back";
    }
    
    if (targetView === 'main-menu') {
        updateMenuVisuals(targetView);
    } else if (targetView === 'games' || targetView === 'settings' || targetView === 'about') {
        updateSubMenuVisuals(targetView);
    } else if (targetView === 'legal') {
        updateLegalMenuVisuals();
    }

    pet.triggerReaction('nav', currentView);
}

function launchGame(index) {
    const game = gamesRegistry[index];
    if (!game) return;

    Object.values(views).forEach(v => {
        if (v) v.classList.remove('active-view');
    });

    gameCanvas.style.display = 'block';
    currentView = 'game-active';

    gameEngine.launchCard(game.name, game.cls);
}

function handleGameInput(action) {
    const result = gameEngine.handleInput(action);
    if (result === 'EXIT') {
        gameEngine.stop();
        changeView('games');
    }
}

// Button Click Event Listeners
document.getElementById('btn-up').addEventListener('click', () => {
    pet.triggerReaction('press', currentView);

    if (currentView === 'game-active') {
        handleGameInput('UP');
        return;
    }

    audio.playSFX('nav');
    if (currentView === 'main-menu') {
        if (currentSelectionIndex > 0) {
            currentSelectionIndex--;
            updateMenuVisuals(currentView);
        }
    } else if (currentView === 'games' || currentView === 'settings' || currentView === 'about') {
        if (currentSubSelectionIndex > 0) {
            currentSubSelectionIndex--;
            updateSubMenuVisuals(currentView);
        }
    } else if (currentView === 'legal') {
        if (currentLegalSelectionIndex > 0) {
            currentLegalSelectionIndex--;
            updateLegalMenuVisuals();
        }
    } else if (currentView === 'audio') {
        if (currentAudioIndex > 0) {
            currentAudioIndex--;
            renderAudioView();
        }
    }
});

document.getElementById('btn-down').addEventListener('click', () => {
    pet.triggerReaction('press', currentView);

    if (currentView === 'game-active') {
        handleGameInput('DOWN');
        return;
    }

    audio.playSFX('nav');
    if (currentView === 'main-menu') {
        const items = views[currentView].querySelectorAll('.menu-item');
        if (currentSelectionIndex < items.length - 1) {
            currentSelectionIndex++;
            updateMenuVisuals(currentView);
        }
    } else if (currentView === 'games' || currentView === 'settings' || currentView === 'about') {
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
    } else if (currentView === 'audio') {
        if (currentAudioIndex < 2) {
            currentAudioIndex++;
            renderAudioView();
        }
    }
});

document.getElementById('btn-left').addEventListener('click', () => {
    pet.triggerReaction('press', currentView);

    if (currentView === 'game-active') {
        handleGameInput('LEFT');
        return;
    }

    if (currentView === 'audio') {
        audio.playSFX('nav');
        if (currentAudioIndex === 0) {
            audio.isMusicOn = !audio.isMusicOn;
            audio.isMusicOn ? audio.startBGM() : audio.stopBGM();
        } else if (currentAudioIndex === 1) {
            audio.isSFXOn = !audio.isSFXOn;
        } else if (currentAudioIndex === 2) {
            if (audio.masterVolume >= 10) audio.masterVolume -= 10;
            audio.updateBGMVolume();
        }
        renderAudioView();
    }
});

document.getElementById('btn-right').addEventListener('click', () => {
    pet.triggerReaction('press', currentView);

    if (currentView === 'game-active') {
        handleGameInput('RIGHT');
        return;
    }

    if (currentView === 'audio') {
        audio.playSFX('nav');
        if (currentAudioIndex === 0) {
            audio.isMusicOn = !audio.isMusicOn;
            audio.isMusicOn ? audio.startBGM() : audio.stopBGM();
        } else if (currentAudioIndex === 1) {
            audio.isSFXOn = !audio.isSFXOn;
        } else if (currentAudioIndex === 2) {
            if (audio.masterVolume <= 90) audio.masterVolume += 10;
            audio.updateBGMVolume();
        }
        renderAudioView();
    }
});

document.getElementById('btn-a').addEventListener('click', () => {
    pet.triggerReaction('press', currentView);

    if (currentView === 'game-active') {
        handleGameInput('A');
        return;
    }

    audio.playSFX('select');
    if (currentView === 'main-menu') {
        switch(currentSelectionIndex) {
            case 0: changeView('games'); break;
            case 1: changeView('settings'); break;
            case 2: changeView('blog'); break;
            case 3: changeView('contact'); break;
            case 4: changeView('about'); break;
        }
    } else if (currentView === 'games') {
        launchGame(currentSubSelectionIndex);
    } else if (currentView === 'settings') {
        if (currentSubSelectionIndex === 0) changeView('audio');
        else if (currentSubSelectionIndex === 1) changeView('controls');
        else if (currentSubSelectionIndex === 2) changeView('theme');
    } else if (currentView === 'about') {
        if (currentSubSelectionIndex === 0) changeView('careers'); 
        else if (currentSubSelectionIndex === 1) changeView('legal'); 
    } else if (currentView === 'legal') {
        if (currentLegalSelectionIndex === 0) changeView('privacy');
        else if (currentLegalSelectionIndex === 1) changeView('terms');
        else if (currentLegalSelectionIndex === 2) changeView('license'); 
    }
});

document.getElementById('btn-b').addEventListener('click', () => {
    pet.triggerReaction('press', currentView);

    if (currentView === 'game-active') {
        handleGameInput('B');
        return;
    }

    audio.playSFX('back');
    const fallbackView = backNavigationMap[currentView];
    if (fallbackView) {
        changeView(fallbackView);
    }
});

const keyboardMap = {
    'ArrowUp': 'btn-up', 'w': 'btn-up', 'W': 'btn-up',
    'ArrowDown': 'btn-down', 's': 'btn-down', 'S': 'btn-down',
    'ArrowLeft': 'btn-left', 'a': 'btn-left', 'A': 'btn-left',
    'ArrowRight': 'btn-right', 'd': 'btn-right', 'D': 'btn-right',
    'z': 'btn-a', 'Z': 'btn-a',
    'x': 'btn-b', 'X': 'btn-b', 'Escape': 'btn-b',
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