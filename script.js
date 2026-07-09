// ==========================================
// 1. GAME STATE (Global Variables)
// ==========================================
let hero = {
    hp: 100,
    hpMax: 100,
    attack: 10,
    hpRegen: 5, // HP recovered per tick out of combat (1 tick = gameSpeed ms)
    gold: 0,
    stage: 1
};

let currentEnemy = null; 
let searchTimer = 0;       // Decrements down to 0 to spawn an enemy
let searchCooldown = 3;    // Base search time in ticks (mutable for future shop)

let gameSpeed = 1000;      // Tick duration in ms; 1 tick = 1000ms (1 second)
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

    const enemyHpDisplay = document.getElementById("txt-enemy-hp");
    
    // UI reflects the exact current state
    if (currentEnemy && currentEnemy.hp > 0) {
        let icon = (hero.stage % 10 === 0) ? "👑" : "👹";
        enemyHpDisplay.innerText = `${icon} HP: ${currentEnemy.hp} / ${currentEnemy.hpMax}`;
    } 
    else if (hero.hp < hero.hpMax) {
        const missingHp = hero.hpMax - hero.hp;
        const ticksLeft = Math.ceil(missingHp / hero.hpRegen);
        const secondsLeft = Math.ceil((ticksLeft * gameSpeed) / 1000);
        enemyHpDisplay.innerText = `❤️ Healing... (${secondsLeft}s left)`;
    } 
    else if (searchTimer > 0) {
        enemyHpDisplay.innerText = `🔍 Searching... (${searchTimer}s)`;
    } 
    else {
        enemyHpDisplay.innerText = "⏳ Ready...";
    }
}

function addLogMessage(text) {
    const log = document.getElementById("log");
    const p = document.createElement("p");
    p.textContent = text;
    log.prepend(p);
    // Prevent unbounded growth over long idle sessions
    while (log.children.length > 100) {
        log.removeChild(log.lastElementChild);
    }
}

// ==========================================
// 3. ENGINE LOGIC (Core Loop & Progression)
// ==========================================
function spawnNewEnemy() {
    currentEnemy = {
        hp: hero.stage * 12,
        hpMax: hero.stage * 12,
        attack: hero.stage * 2
    };
}

function executeTick() {
    // 1. ACTIVE COMBAT PHASE
    if (currentEnemy && currentEnemy.hp > 0) {
        currentEnemy.hp -= hero.attack;
        addLogMessage(`⚔️ You hit the enemy for ${hero.attack} dmg.`);
        
        if (currentEnemy.hp <= 0) {
            let goldEarned = hero.stage * 3;
            hero.gold += goldEarned;
            addLogMessage(`🎉 Enemy Defeated! Stage ${hero.stage} Cleared! +${goldEarned} Gold.`);
            hero.stage++;
            currentEnemy = null; 
            searchTimer = searchCooldown;
        } else {
            hero.hp -= currentEnemy.attack;
            addLogMessage(`💥 Enemy strikes back for ${currentEnemy.attack} dmg.`);

            if (hero.hp <= 0) {
                addLogMessage(`💀 You died at stage ${hero.stage}. Back to stage 1.`);
                hero.stage = 1;
                hero.hp = 0; 
                currentEnemy = null; 
                searchTimer = 0; 
            }
        }
        refreshInterface();
        return; 
    }

    // 2. OUT-OF-COMBAT HEALING PHASE
    if (hero.hp < hero.hpMax) {
        hero.hp = Math.min(hero.hpMax, hero.hp + hero.hpRegen);
        refreshInterface(); 
        return; 
    }

    // 3. OUT-OF-COMBAT ENEMY SEARCH PHASE
    if (searchTimer > 0) {
        searchTimer--;
        
        if (searchTimer > 0) {
            // Log only once at the start of the search to avoid spamming the log
            if (searchTimer === searchCooldown - 1) {
                 addLogMessage(`🔍 Searching for the next target...`);
            }
            refreshInterface();
            return; 
        }
    }

    // 4. IMMEDIATE MONSTER SPAWN
    if (!currentEnemy) {
        spawnNewEnemy();
        addLogMessage(`⚠️ A wild enemy appears for Stage ${hero.stage}!`);
        refreshInterface(); 
    }
}

// Kickstart the game engine loop
refreshInterface();
gameLoop = setInterval(executeTick, gameSpeed);