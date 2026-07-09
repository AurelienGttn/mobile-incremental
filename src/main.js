import { 
    getHero, getCurrentEnemy, setCurrentEnemy, 
    getSearchTimer, setSearchTimer, resetSearchTimer,
    getRegenAccumulator, setRegenAccumulator,
    getAttackAccumulator, setAttackAccumulator 
} from './gameState.js';
import { refreshInterface, addLogMessage } from './interface.js';

const tickRate = 100; // Engine runs every 100ms!

function spawnNewEnemy() {
    const hero = getHero();
    setCurrentEnemy({
        hp: hero.stage * 12,
        attack: hero.stage * 2
    });
}

function executeTick() {
    const hero = getHero();
    let currentEnemy = getCurrentEnemy();
    let searchTimer = getSearchTimer();

    // PHASE 1: ACTIVE COMBAT
    if (currentEnemy && currentEnemy.hp > 0) {
        // Feed time into the combat turn tracker
        let attackAcc = getAttackAccumulator() + tickRate;
        setAttackAccumulator(attackAcc);

        // Check if enough time has passed to trigger the hero's attack speed
        if (attackAcc >= hero.attackSpeed) {
            setAttackAccumulator(0); // Reset timer
            
            // Hero strikes
            currentEnemy.hp -= hero.attack;
            addLogMessage(`⚔️ You hit the enemy for ${hero.attack} dmg.`);
            
            if (currentEnemy.hp <= 0) {
                let goldEarned = hero.stage * 3;
                hero.gold += goldEarned;
                addLogMessage(`🎉 Enemy Defeated! Stage ${hero.stage} Cleared! +${goldEarned} Gold.`);
                hero.stage++;
                setCurrentEnemy(null);
                resetSearchTimer(); 
                
                addLogMessage(`🔍 Searching for the next target...`);
                
                refreshInterface();
                return;
            }

            // Enemy counter-attacks instantly on your turn
            hero.hp -= currentEnemy.attack;
            addLogMessage(`💥 Enemy strikes back for ${currentEnemy.attack} dmg.`);

            if (hero.hp <= 0) {
                addLogMessage(`💀 You died at stage ${hero.stage}. Dropping back to stage 1.`);
                hero.stage = 1;
                hero.hp = 0; 
                setCurrentEnemy(null);
                setSearchTimer(0);
            }
        }
        refreshInterface();
        return; 
    }

    // PHASE 2: OUT-OF-COMBAT HEALING
    if (hero.hp < hero.hpMax) {
        let regenAcc = getRegenAccumulator() + tickRate;
        setRegenAccumulator(regenAcc);

        if (regenAcc >= 1000) { // Execute heal exactly once every 1000ms (1s)
            setRegenAccumulator(0);
            hero.hp = Math.min(hero.hpMax, hero.hp + hero.hpRegen);
        }
        refreshInterface(); 
        return; 
    }

    // PHASE 3: OUT-OF-COMBAT SEARCHING
    if (searchTimer > 0) {
        setSearchTimer(searchTimer - tickRate);
        
        // Check if this was the very last tick of the countdown
        if (getSearchTimer() <= 500) {
            let alertText = (hero.stage % 10 === 0) ? "👑 Boss found!" : "⚠️ Enemy found!";
            document.getElementById("txt-enemy-hp").innerText = alertText;
            // We skip refreshInterface() on this single tick so our alert text doesn't get overwritten by "Ready"
            return; 
        }

        refreshInterface();
        return; 
    }

    // PHASE 4: MONSTER SPAWN
    if (!getCurrentEnemy()) {
        spawnNewEnemy();
        setAttackAccumulator(0); // Instantly ready to fight upon enemy spawn
        addLogMessage(`⚠️ A wild enemy appears for Stage ${hero.stage}!`);
        refreshInterface(); 
    }
}

// Kickstart high-frequency engine loop
setInterval(executeTick, tickRate);