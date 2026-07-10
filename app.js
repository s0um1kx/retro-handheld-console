// ==========================================================================
// 1. DOM Element Node Selection
// ==========================================================================
const screenText = document.querySelector('.screen-text');

// Create a mapping of Button IDs to their readable names
const buttonMap = {
    'btn-up': 'UP',
    'btn-down': 'DOWN',
    'btn-left': 'LEFT',
    'btn-right': 'RIGHT',
    'btn-a': 'BUTTON A',
    'btn-b': 'BUTTON B',
    'btn-select': 'SELECT',
    'btn-start': 'START'
};

// ==========================================================================
// 2. Click Interface Logic (Mouse / Tap Events)
// ==========================================================================
// Function to update the green matrix screen text
function updateScreenDisplay(inputName) {
    screenText.textContent = `INPUT: ${inputName}`;
}

// Add event listeners to all interactive buttons
Object.keys(buttonMap).forEach(buttonId => {
    const buttonNode = document.getElementById(buttonId);
    
    if (buttonNode) {
        buttonNode.addEventListener('click', () => {
            updateScreenDisplay(buttonMap[buttonId]);
        });
    }
});

// ==========================================================================
// 3. Keyboard Controller Mapping Logic
// ==========================================================================
// Map physical keyboard keys to readable console commands
const keyboardMap = {
    'ArrowUp': 'UP',
    'ArrowDown': 'DOWN',
    'ArrowLeft': 'LEFT',
    'ArrowRight': 'RIGHT',
    'z': 'BUTTON A',
    'Z': 'BUTTON A',
    'x': 'BUTTON B',
    'X': 'BUTTON B',
    'Enter': 'START',
    'Shift': 'SELECT'
};

// Listen for global keydown movements across the window canvas
window.addEventListener('keydown', (event) => {
    // Check if the pressed key matches our controller setup
    if (keyboardMap[event.key]) {
        // Prevent default browser operations (like arrow keys scrolling the webpage)
        event.preventDefault();
        
        // Update screen information
        updateScreenDisplay(keyboardMap[event.key]);
        
        // Visual feedback highlight setup (Optional: links keys directly to active CSS mechanics)
        triggerVisualFeedback(event.key);
    }
});

// Match keyboard press directly to physical CSS hover/active transformations
function triggerVisualFeedback(key) {
    let targetedId = '';
    if (key === 'ArrowUp') targetedId = 'btn-up';
    if (key === 'ArrowDown') targetedId = 'btn-down';
    if (key === 'ArrowLeft') targetedId = 'btn-left';
    if (key === 'ArrowRight') targetedId = 'btn-right';
    if (key.toLowerCase() === 'z') targetedId = 'btn-a';
    if (key.toLowerCase() === 'x') targetedId = 'btn-b';
    if (key === 'Enter') targetedId = 'btn-start';
    if (key === 'Shift') targetedId = 'btn-select';

    const visualNode = document.getElementById(targetedId);
    if (visualNode) {
        visualNode.classList.add('keyboard-active');
        setTimeout(() => visualNode.classList.remove('keyboard-active'), 100);
    }
}