export class StatusHeader {
    constructor() {
        this.liveClock = document.getElementById('live-clock');
        this.liveBattery = document.getElementById('live-battery');
        this.initClock();
        this.initBattery();
    }

    initClock() {
        const updateClock = () => {
            const now = new Date();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const colon = now.getSeconds() % 2 === 0 ? ':' : ' ';

            if (this.liveClock) {
                this.liveClock.textContent = `${hours}${colon}${minutes} ${ampm}`;
            }
        };
        setInterval(updateClock, 1000);
        updateClock();
    }

    renderBattery(level, isCharging) {
        const totalBlocks = 4;
        const filledBlocks = Math.round(level * totalBlocks);
        const emptyBlocks = totalBlocks - filledBlocks;
        const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
        const chargeSymbol = isCharging ? '🗲' : '';
        const percentage = Math.round(level * 100);

        if (this.liveBattery) {
            this.liveBattery.textContent = `[${chargeSymbol}${bar}] ${percentage}%`;
        }
    }

    initBattery() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const updateBatteryInfo = () => this.renderBattery(battery.level, battery.charging);
                updateBatteryInfo();
                battery.addEventListener('levelchange', updateBatteryInfo);
                battery.addEventListener('chargingchange', updateBatteryInfo);
            });
        } else {
            this.renderBattery(1.0, false);
        }
    }
}