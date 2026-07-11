export class PetController {
    constructor() {
        this.petAvatar = document.getElementById('pet-avatar');
        this.petState = document.getElementById('pet-state');
        this.reactionTimeout = null;

        this.petStates = {
            idle: { face: '( •_•)', label: 'IDLE' },
            blink: { face: '( -_•)', label: 'IDLE' },
            nav: { face: '( ⊙_⊙)', label: 'NAV' },
            happy: { face: '( ^_^ )!', label: 'YAY!' },
            game: { face: '(⌐■_■)', label: 'PLAY' }
        };

        this.initBlink();
    }

    triggerReaction(actionType, currentView) {
        if (this.reactionTimeout) clearTimeout(this.reactionTimeout);

        if (actionType === 'press') {
            this.petAvatar.textContent = this.petStates.happy.face;
            this.petState.textContent = this.petStates.happy.label;
        } else if (actionType === 'nav') {
            this.petAvatar.textContent = this.petStates.nav.face;
            this.petState.textContent = this.petStates.nav.label;
        }

        this.reactionTimeout = setTimeout(() => {
            if (currentView === 'games') {
                this.petAvatar.textContent = this.petStates.game.face;
                this.petState.textContent = this.petStates.game.label;
            } else {
                this.petAvatar.textContent = this.petStates.idle.face;
                this.petState.textContent = this.petStates.idle.label;
            }
        }, 800);
    }

    initBlink() {
        setInterval(() => {
            if (this.petAvatar.textContent === this.petStates.idle.face) {
                this.petAvatar.textContent = this.petStates.blink.face;
                setTimeout(() => {
                    if (this.petAvatar.textContent === this.petStates.blink.face) {
                        this.petAvatar.textContent = this.petStates.idle.face;
                    }
                }, 300);
            }
        }, 4000);
    }
}