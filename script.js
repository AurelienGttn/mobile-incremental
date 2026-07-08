// ==========================================
// 1. GAME STATE (Global Variables)
// ==========================================
let hero = {
    hp: 100,
    hpMax: 100,
    attack: 10,
    gold: 0,
    stage: 1
};

// Global variable for current enemy
let currentEnemy = null; 

// Base game speed: 1 tick = 1000ms (1 second)
let gameSpeed = 1000; 
let gameLoop;

// ==========================================
// 2. INTERFACE UPDATE FUNCTIONS
// ==========================================
function refreshInterface() {
    document.getElementById("txt-stage").innerText = hero.stage;
    document.getElementById("txt-gold").innerText = hero.gold;
    document.getElementById("txt-hp").innerText = hero.hp;
    document.getElementById("txt-hp-max").innerText = hero.hpMax;
    document.getElementById("txt-attack").innerText = hero.attack;
}

function refreshEnemyInterface() {
    const enemyHpDisplay = document.getElementById("txt-enemy-hp");
    if (currentEnemy && currentEnemy.hp > 0) {
        enemyHpDisplay.innerText = currentEnemy.hp;
    } else {
        enemyHpDisplay.innerText = "0 (Defeated)";
    }
}

function addLogMessage(text) {
    const log = document.getElementById("log");
    // Newest messages appear at the top for easy mobile reading
    log.innerHTML = `<p>${text}</p>` + log.innerHTML;
}

// ==========================================
// 3. ENGINE LOGIC (Loop & Combat)
// ==========================================

function spawnNewEnemy() {
    currentEnemy = {
        hp: hero.stage * 12,
        attack: hero.stage * 2
    };
    refreshEnemyInterface();
}

function executeTick() {
    // If no enemy exists or is dead, spawn a new one for the stage
    if (!currentEnemy || currentEnemy.hp <= 0) {
        spawnNewEnemy();
        return; // Wait one tick for the combat to start properly
    }

    // Phase 1: Hero attacks enemy
    currentEnemy.hp -= hero.attack;
    addLogMessage(`⚔️ You hit the enemy for ${hero.attack} dmg.`);
    
    // We update the enemy UI immediately after the hero's attack
    refreshEnemyInterface();

    if (currentEnemy.hp <= 0) {
        // VICTORY
        let goldEarned = hero.stage * 3;
        hero.gold += goldEarned;
        addLogMessage(`🎉 Enemy Defeated! Stage ${hero.stage} Cleared! +${goldEarned} Gold.`);
        hero.stage++;
        
        // Full heal between stages for now
        hero.hp = hero.hpMax; 
        currentEnemy = null; // Mark enemy as gone for next spawn
    } else {
        // Phase 2: Enemy survives and counter-attacks
        hero.hp -= currentEnemy.attack;
        addLogMessage(`💥 Enemy strikes back for ${currentEnemy.attack} dmg.`);

        if (hero.hp <= 0) {
            // DEFEAT
            addLogMessage(`💀 You died at stage ${hero.stage}. Back to stage 1.`);
            hero.stage = 1;
            hero.hp = hero.hpMax;
            currentEnemy = null; // Wipe current enemy
        }
    }

    // Apply data changes to the screen
    refreshInterface();
}

// Automatically start the game loop on launch
// And make sure a first enemy exists immediately
gameLoop = setInterval(executeTick, gameSpeed);