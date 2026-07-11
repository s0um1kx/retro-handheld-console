export class AudioManager {
    constructor() {
        this.audioCtx = null;
        this.bgmGainNode = null;
        this.bgmInterval = null;
        this.isMusicOn = true;
        this.isSFXOn = true;
        this.masterVolume = 60;
    }

    initAudioContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    playSFX(type) {
        if (!this.isSFXOn) return;
        this.initAudioContext();

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const effectiveVol = (this.masterVolume / 100) * 0.15;

        osc.type = 'square';
        gain.gain.setValueAtTime(effectiveVol, this.audioCtx.currentTime);

        if (type === 'nav') {
            osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(160, this.audioCtx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.05);
        } else if (type === 'select') {
            osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.08);
        } else if (type === 'back') {
            osc.frequency.setValueAtTime(520, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(260, this.audioCtx.currentTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.08);
        }

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
    }

    startBGM() {
        if (!this.isMusicOn) return;
        this.initAudioContext();
        this.stopBGM();

        const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
        let noteIdx = 0;

        this.bgmGainNode = this.audioCtx.createGain();
        this.bgmGainNode.gain.setValueAtTime((this.masterVolume / 100) * 0.05, this.audioCtx.currentTime);
        this.bgmGainNode.connect(this.audioCtx.destination);

        this.bgmInterval = setInterval(() => {
            if (!this.isMusicOn) return;
            const osc = this.audioCtx.createOscillator();
            const noteGain = this.audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = notes[noteIdx];

            noteGain.gain.setValueAtTime((this.masterVolume / 100) * 0.04, this.audioCtx.currentTime);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.18);

            osc.connect(noteGain);
            noteGain.connect(this.bgmGainNode);

            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.18);

            noteIdx = (noteIdx + 1) % notes.length;
        }, 200);
    }

    stopBGM() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }

    updateBGMVolume() {
        if (this.bgmGainNode && this.audioCtx) {
            this.bgmGainNode.gain.setValueAtTime((this.masterVolume / 100) * 0.05, this.audioCtx.currentTime);
        }
    }
}