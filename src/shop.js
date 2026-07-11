import { getHero } from './gameState.js';
import { refreshInterface, addLogMessage } from './interface.js';

// Base pricing curves (Incremental scaling formula)
const upgradeCosts = {
    attack: 10,
    hpMax: 15
};

// Update shop text labels
function updateShopUI() {
    document.getElementById("lbl-cost-attack").innerText = upgradeCosts.attack;
    document.getElementById("lbl-cost-hp").innerText = upgradeCosts.hpMax;
}

function buyAttack() {
    const hero = getHero();
    
    if (hero.gold >= upgradeCosts.attack) {
        // Deduct currency & mutate state safely
        hero.gold -= upgradeCosts.attack;
        hero.attack += 2;
        
        addLogMessage(`🛒 Bought +2 Attack! (Total: ${hero.attack})`);
        
        // Scale price exponentially (Standard Idle Game formula)
        upgradeCosts.attack = Math.round(upgradeCosts.attack * 1.5);
        
        // Sync everything back to the screen
        updateShopUI();
        refreshInterface();
    } else {
        addLogMessage(`❌ Not enough Gold! Need ${upgradeCosts.attack}g.`);
    }
}

function buyMaxHP() {
    const hero = getHero();
    
    if (hero.gold >= upgradeCosts.hpMax) {
        hero.gold -= upgradeCosts.hpMax;
        hero.hpMax += 20;
        hero.hp += 20; // Instantly heal the extra HP gained
        
        addLogMessage(`🛒 Bought +20 Max HP! (Total: ${hero.hpMax})`);
        
        upgradeCosts.hpMax = Math.round(upgradeCosts.hpMax * 1.6);
        
        updateShopUI();
        refreshInterface();
    } else {
        addLogMessage(`❌ Not enough Gold! Need ${upgradeCosts.hpMax}g.`);
    }
}

// Modern ES Module event binding (Keeps F12 console safe from onclick exploits)
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-buy-attack").addEventListener("click", buyAttack);
    document.getElementById("btn-buy-hp").addEventListener("click", buyMaxHP);
    updateShopUI(); // Run once at launch to populate prices
});