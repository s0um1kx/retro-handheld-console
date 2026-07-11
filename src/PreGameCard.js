export const PRE_GAME_CARDS = {
    'GridStack': {
        title: 'GRIDSTACK',
        subtitle: 'Tetris Style',
        controls: '[D-Pad] Move/Rotate | [A] Fast Drop | [B] Back',
        goal: 'Clear lines to score high!',
        icon: [
            "  ████  ",
            "  █  █  ",
            "████████",
            "████████"
        ]
    },
    'Cosmic Grid': {
        title: 'COSMIC GRID',
        subtitle: 'Space Invaders',
        controls: '[D-Pad L/R] Move | [A] Fire Laser | [B] Back',
        goal: 'Destroy invaders before invasion!',
        icon: [
            "   ██   ",
            "  ████  ",
            "████████",
            "█ █  █ █"
        ]
    },
    'Byte Eater': {
        title: 'BYTE EATER',
        subtitle: 'Snake',
        controls: '[D-Pad] Change Direction | [B] Back',
        goal: 'Eat bytes and grow longer!',
        icon: [
            " █████  ",
            " █   █  ",
            " █████  ",
            "     ███"
        ]
    },
    'Pocket Jumper': {
        title: 'POCKET JUMPER',
        subtitle: 'Platformer',
        controls: '[D-Pad L/R] Move | [A] Jump | [B] Back',
        goal: 'Reach the flag on each stage!',
        icon: [
            "   ██   ",
            "  ████  ",
            "   ██   ",
            "  █  █  "
        ]
    },
    'Micro Quest': {
        title: 'MICRO QUEST',
        subtitle: 'RPG',
        controls: '[D-Pad] Move | [A] Interact/Attack | [B] Back',
        goal: 'Defeat monsters and find exit!',
        icon: [
            "   ██   ",
            "   ██   ",
            "  ████  ",
            "   ██   "
        ]
    }
};

export class PreGameCardRenderer {
    static render(ctx, width, height, gameKey) {
        const config = PRE_GAME_CARDS[gameKey];
        if (!config) return;

        ctx.fillStyle = '#8b9d2e';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#1a2405';
        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.textAlign = 'center';

        // Title & Subtitle
        ctx.fillText(`=== ${config.title} ===`, width / 2, 22);
        ctx.font = '10px "Courier New", monospace';
        ctx.fillText(`(${config.subtitle})`, width / 2, 36);

        // Icon ASCII/Pixel Representation
        ctx.font = '10px monospace';
        config.icon.forEach((line, index) => {
            ctx.fillText(line, width / 2, 58 + (index * 11));
        });

        // Goal Box
        ctx.font = '9px "Courier New", monospace';
        ctx.fillText(`Goal: ${config.goal}`, width / 2, 115);

        // Controls
        ctx.font = '8px "Courier New", monospace';
        ctx.fillText(config.controls, width / 2, 135);

        // Prompt
        ctx.font = 'bold 10px "Courier New", monospace';
        const blink = Math.floor(Date.now() / 500) % 2 === 0;
        if (blink) {
            ctx.fillText('[ PRESS A TO START ]', width / 2, 160);
        }
    }
}