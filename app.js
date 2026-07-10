// ==========================================================================
// 1. Navigation Mapping Config
// ==========================================================================
const menuItems = document.querySelectorAll('.menu-item');
let currentSelectionIndex = 0;

function updateMenuVisuals(index) {
    menuItems.forEach((node, i) => {
        if (i === index) {
            node.classList.add('active');
            node.textContent = `▶ ${node.textContent.replace('▶ ', '')}`;
        } else {
            node.classList.remove('active');
            node.textContent = node.textContent.replace('▶ ', '');
        }
    });
}

// ==========================================================================
// 2. Click Handling Logic
// ==========================================================================
document.getElementById('btn-up').addEventListener('click', () => {
    if (currentSelectionIndex > 0) {
        currentSelectionIndex--;
        updateMenuVisuals(currentSelectionIndex);
    }
});

document.getElementById('btn-down').addEventListener('click', () => {
    if (currentSelectionIndex < menuItems.length - 1) {
        currentSelectionIndex++;
        updateMenuVisuals(currentSelectionIndex);
    }
});

// ==========================================================================
// 3. Hardware Controller Keyboard Mapping
// ==========================================================================
const keyboardMap = {
    'ArrowUp': 'btn-up',
    'ArrowDown': 'btn-down',
    'ArrowLeft': 'btn-left',
    'ArrowRight': 'btn-right',
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