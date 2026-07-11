export const PRE_GAME_CARDS = {
    'GridStack': {
        title: 'GRIDSTACK',
        goal: ['Goal: Fill lines to clear them', 'and prevent overflow.'],
        controls: [
            { key: '[D-Pad L/R]', action: 'Move' },
            { key: '[D-Pad Up]', action: 'Rotate' },
            { key: '[D-Pad Down]', action: 'Soft Drop' },
            { key: '[A Button]', action: 'Hard Drop' },
            { key: '[B Button]', action: 'Hold' }
        ],
        tip: null,
        comingSoon: false
    },
    'Cosmic Grid': {
        title: 'COSMIC GRID',
        goal: ['Goal: Destroy alien waves', 'before they invade.'],
        controls: [
            { key: '[D-Pad L/R]', action: 'Move Ship' },
            { key: '[A Button]', action: 'Fire Laser' },
            { key: '[B Button]', action: 'Deploy Shield' }
        ],
        tip: 'TIP: Shoot UFOs for bonus points!',
        comingSoon: false
    },
    'Byte Eater': {
        title: 'BYTE EATER',
        goal: ['Goal: Eat data bugs & grow', 'without hitting walls.'],
        controls: [
            { key: '[D-Pad]', action: 'Change Dir' },
            { key: '[A Button]', action: 'Boost Speed' }
        ],
        tip: 'TIP: Avoid biting your own tail!',
        comingSoon: false
    },
    'Pocket Jumper': {
        title: 'POCKET JUMPER',
        goal: ['Goal: Dodge traps and reach', 'the flag at the end.'],
        controls: [
            { key: '[D-Pad L/R]', action: 'Run' },
            { key: '[A Button]', action: 'Jump' },
            { key: '[A] (In Air)', action: 'Double Jump' },
            { key: '[B Button]', action: 'Sprint' }
        ],
        tip: null,
        comingSoon: false
    },
    'Micro Quest': {
        title: 'MICRO QUEST',
        goal: ['Under Construction!'],
        controls: [],
        tip: 'Check back in a future update!',
        comingSoon: true
    }
};

export class PreGameCardRenderer {
    static render(ctx, width, height, gameKey) {
        const config = PRE_GAME_CARDS[gameKey];
        if (!config) return;

        const LCD_BG = '#8b9d2e';
        const LCD_TEXT = '#1a2405';

        ctx.fillStyle = LCD_BG;
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = LCD_TEXT;
        ctx.lineWidth = 1;
        ctx.strokeRect(3, 3, width - 6, height - 6);

        ctx.fillStyle = LCD_TEXT;
        ctx.textAlign = 'center';

        // Header Title Box
        ctx.strokeRect(7, 7, width - 14, 20);
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`[ ${config.title} ]`, width / 2, 21);

        // Inner Content Box
        ctx.strokeRect(7, 30, width - 14, height - 37);

        if (config.comingSoon) {
            ctx.font = 'bold 12px monospace';
            ctx.fillText('*** COMING SOON ***', width / 2, 75);
            ctx.font = '8px monospace';
            ctx.fillText('This game is currently', width / 2, 95);
            ctx.fillText('under development.', width / 2, 107);
            
            ctx.font = 'italic 7px monospace';
            ctx.fillText(config.tip, width / 2, 130);

            ctx.font = 'bold 8px monospace';
            ctx.fillText('[B] BACK TO MENU', width / 2, height - 12);
            return;
        }

        let currentY = 43;

        // Goal Section
        ctx.font = '8px monospace';
        config.goal.forEach(line => {
            ctx.fillText(line, width / 2, currentY);
            currentY += 10;
        });

        currentY += 3;

        // Controls Header
        ctx.font = 'bold 8px monospace';
        ctx.fillText('CONTROLS:', width / 2, currentY);
        currentY += 10;

        // Controls List
        ctx.font = '7px monospace';
        config.controls.forEach(ctrl => {
            ctx.textAlign = 'left';
            ctx.fillText(`* ${ctrl.key}`, 14, currentY);
            ctx.textAlign = 'right';
            ctx.fillText(ctrl.action, width - 14, currentY);
            currentY += 9;
        });

        if (config.tip) {
            currentY += 2;
            ctx.textAlign = 'center';
            ctx.font = 'italic 7px monospace';
            ctx.fillText(config.tip, width / 2, currentY);
        }

        const blink = Math.floor(Date.now() / 500) % 2 === 0;
        if (blink) {
            ctx.textAlign = 'center';
            ctx.font = 'bold 8px monospace';
            ctx.fillText('[A] START GAME', width / 2, height - 12);
        }
    }
}