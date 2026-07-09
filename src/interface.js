import { getHero, getCurrentEnemy, getSearchTimer } from './gameState.js';

export function refreshInterface() {
    const hero = getHero();
    const currentEnemy = getCurrentEnemy();
    const searchTimer = getSearchTimer();

    // Render Hero Attributes
    document.getElementById("txt-stage").innerText = hero.stage;
    document.getElementById("txt-gold").innerText = hero.gold;
    document.getElementById("txt-hp").innerText = hero.hp;
    document.getElementById("txt-hp-max").innerText = hero.hpMax;
    document.getElementById("txt-attack").innerText = hero.attack;

    const enemyHpDisplay = document.getElementById("txt-enemy-hp");
    
    // UI Priority Chain
    if (currentEnemy && currentEnemy.hp > 0) {
        let icon = (hero.stage % 10 === 0) ? "👑" : "👹";
        enemyHpDisplay.innerText = `${icon} HP: ${currentEnemy.hp}`;
    } 
    else if (hero.hp < hero.hpMax) {
        let missingHp = hero.hpMax - hero.hp;
        let secondsLeft = Math.ceil(missingHp / hero.hpRegen);
        enemyHpDisplay.innerText = `❤️ Healing... (${secondsLeft}s left)`;
    } 
    else if (searchTimer > 0) {
        // High-precision countdown display (e.g., 2.7s, 2.6s...)
        let seconds = (searchTimer / 1000).toFixed(1);
        enemyHpDisplay.innerText = `🔍 Searching...`;
    } else {
        enemyHpDisplay.innerText = "⏳ Ready";
    }
}

export function addLogMessage(text) {
    const logContainer = document.getElementById("log");
    const newEntry = document.createElement("p");
    newEntry.textContent = text; // Secured against HTML injection
    newEntry.style.margin = "2px 0";
    
    logContainer.prepend(newEntry);
    
    // Performance cap for mobile screens
    while (logContainer.children.length > 30) {
        logContainer.lastChild.remove();
    }
}