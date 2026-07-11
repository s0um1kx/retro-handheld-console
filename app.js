// ==========================================================================
// 1. App State Controller & Tree Hierarchy Config
// ==========================================================================
let currentView = 'main-menu'; 
let currentSelectionIndex = 0; 
let currentSubSelectionIndex = 0;
let currentLegalSelectionIndex = 0;

// Audio Configuration State
let currentAudioIndex = 0; // 0: Music, 1: Sound, 2: Master Vol
let isMusicOn = true;
let isSFXOn = true;
let masterVolume = 60; // 0 to 100%

const views = {
    'main-menu': document.getElementById('view-main-menu'),
    'games': document.getElementById('view-games'),
    'settings': document.getElementById('view-settings'),
    'audio': document.getElementById('view-audio'),
    'controls': document.getElementById('view-controls'),
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

// Define back navigation paths
const backNavigationMap = {
    'games': 'main-menu',
    'settings': 'main-menu',
    'audio': 'settings',
    'controls': 'settings',
    'blog': 'main-menu',
    'contact': 'main-menu',
    'about': 'main-menu',
    'careers': 'about',
    'legal': 'about',
    'privacy': 'legal',
    'terms': 'legal',
    'license': 'legal'
};

// ==========================================================================
// 2. Synthesizer & Web Audio Engine
// ==========================================================================
let audioCtx = null;
let bgmOscillator = null;
let bgmGainNode = null;
let bgmInterval = null;

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSFX(type) {
    if (!isSFXOn) return;
    initAudioContext();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const effectiveVol = (masterVolume / 100) * 0.15;

    osc.type = 'square';
    gain.gain.setValueAtTime(effectiveVol, audioCtx.currentTime);

    if (type === 'nav') {
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(160, audioCtx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === 'select') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
    } else if (type === 'back') {
        osc.frequency.setValueAtTime(520, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(260, audioCtx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
    }

    osc.connect(gain);
    gain.connect(audioCtx.destination);
}

// Retro Arpeggiated BGM Loop
function startBGM() {
    if (!isMusicOn) return;
    initAudioContext();
    stopBGM();

    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
    let noteIdx = 0;

    bgmGainNode = audioCtx.createGain();
    bgmGainNode.gain.setValueAtTime((masterVolume / 100) * 0.05, audioCtx.currentTime);
    bgmGainNode.connect(audioCtx.destination);

    bgmInterval = setInterval(() => {
        if (!isMusicOn) return;
        const osc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = notes[noteIdx];

        noteGain.gain.setValueAtTime((masterVolume / 100) * 0.04, audioCtx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);

        osc.connect(noteGain);
        noteGain.connect(bgmGainNode);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);

        noteIdx = (noteIdx + 1) % notes.length;
    }, 200);
}

function stopBGM() {
    if (bgmInterval) {
        clearInterval(bgmInterval);
        bgmInterval = null;
    }
}

function updateBGMVolume() {
    if (bgmGainNode && audioCtx) {
        bgmGainNode.gain.setValueAtTime((masterVolume / 100) * 0.05, audioCtx.currentTime);
    }
}

// Render Audio Screen State
function renderAudioView() {
    const musicState = isMusicOn ? '▶ [ ON ] /  OFF ' : '  [ OFF] /  ON  ';
    const sfxState = isSFXOn ? '▶ [ ON ] /  OFF ' : '  [ OFF] /  ON  ';

    const totalBlocks = 10;
    const filledBlocks = Math.round((masterVolume / 100) * totalBlocks);
    const barStr = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);
    const volPrefix = currentAudioIndex === 2 ? '▶ ' : '  ';

    const line0 = currentAudioIndex === 0 ? `▶ Music (BGM) : ${isMusicOn ? '[ ON ] / OFF' : 'ON / [ OFF ]'}` : `  Music (BGM) : ${isMusicOn ? '[ ON ] / OFF' : 'ON / [ OFF ]'}`;
    const line1 = currentAudioIndex === 1 ? `▶ Sound (SFX) : ${isSFXOn ? '[ ON ] / OFF' : 'ON / [ OFF ]'}` : `  Sound (SFX) : ${isSFXOn ? '[ ON ] / OFF' : 'ON / [ OFF ]'}`;
    const line2 = `${volPrefix}Master Vol  : ${barStr} (${masterVolume}%)`;

    const block = document.querySelector('.audio-config-block');
    if (block) {
        block.textContent = `=== AUDIO SETTINGS ===\n\n  [ SETTING ]   [ STATE ]\n${line0}\n${line1}\n${line2}\n\n======================\n [LEFT/RIGHT] Change\n [B/ESC] to Return`;
    }
}

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
    
    if (targetView === 'about') {
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
    
    if (targetView === 'main-menu' || targetView === 'games') {
        updateMenuVisuals(targetView);
    } else if (targetView === 'settings' || targetView === 'about') {
        updateSubMenuVisuals(targetView);
    } else if (targetView === 'legal') {
        updateLegalMenuVisuals();
    }
}

// ==========================================================================
// 3. Click & Directional Control Logic
// ==========================================================================
document.getElementById('btn-up').addEventListener('click', () => {
    playSFX('nav');
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
    } else if (currentView === 'audio') {
        if (currentAudioIndex > 0) {
            currentAudioIndex--;
            renderAudioView();
        }
    }
});

document.getElementById('btn-down').addEventListener('click', () => {
    playSFX('nav');
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
    } else if (currentView === 'audio') {
        if (currentAudioIndex < 2) {
            currentAudioIndex++;
            renderAudioView();
        }
    }
});

// Left / Right controls for Audio Volume and Toggles
document.getElementById('btn-left').addEventListener('click', () => {
    if (currentView === 'audio') {
        playSFX('nav');
        if (currentAudioIndex === 0) {
            isMusicOn = !isMusicOn;
            isMusicOn ? startBGM() : stopBGM();
        } else if (currentAudioIndex === 1) {
            isSFXOn = !isSFXOn;
        } else if (currentAudioIndex === 2) {
            if (masterVolume >= 10) masterVolume -= 10;
            updateBGMVolume();
        }
        renderAudioView();
    }
});

document.getElementById('btn-right').addEventListener('click', () => {
    if (currentView === 'audio') {
        playSFX('nav');
        if (currentAudioIndex === 0) {
            isMusicOn = !isMusicOn;
            isMusicOn ? startBGM() : stopBGM();
        } else if (currentAudioIndex === 1) {
            isSFXOn = !isSFXOn;
        } else if (currentAudioIndex === 2) {
            if (masterVolume <= 90) masterVolume += 10;
            updateBGMVolume();
        }
        renderAudioView();
    }
});

// A Button Action (Select / Enter)
document.getElementById('btn-a').addEventListener('click', () => {
    playSFX('select');
    if (currentView === 'main-menu') {
        switch(currentSelectionIndex) {
            case 0: changeView('games'); break;
            case 1: changeView('settings'); break;
            case 2: changeView('blog'); break;
            case 3: changeView('contact'); break;
            case 4: changeView('about'); break;
        }
    } else if (currentView === 'settings') {
        if (currentSubSelectionIndex === 0) {
            changeView('audio');
        } else if (currentSubSelectionIndex === 1) {
            changeView('controls');
        }
    } else if (currentView === 'about') {
        if (currentSubSelectionIndex === 0) {
            changeView('careers'); 
        } else if (currentSubSelectionIndex === 1) {
            changeView('legal'); 
        }
    } else if (currentView === 'legal') {
        if (currentLegalSelectionIndex === 0) {
            changeView('privacy');
        } else if (currentLegalSelectionIndex === 1) {
            changeView('terms');
        } else if (currentLegalSelectionIndex === 2) {
            changeView('license'); 
        }
    } else if (currentView === 'audio') {
        if (currentAudioIndex === 0) {
            isMusicOn = !isMusicOn;
            isMusicOn ? startBGM() : stopBGM();
        } else if (currentAudioIndex === 1) {
            isSFXOn = !isSFXOn;
        }
        renderAudioView();
    }
});

// B Button Action (Go Back)
document.getElementById('btn-b').addEventListener('click', () => {
    playSFX('back');
    const fallbackView = backNavigationMap[currentView];
    if (fallbackView) {
        changeView(fallbackView);
    }
});

// ==========================================================================
// 4. Keyboard Controls Handler
// ==========================================================================
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