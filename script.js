// ==========================================
// 1. GAME STATE (Global Variables)
// ==========================================
let hero = {
    hp: 100,
    hpMax: 100,
    attack: 10,
    hpRegen: 5, // HP recovered per second out of combat
    gold: 0,
    stage: 1
};

let currentEnemy = null; 
let searchTimer = 0;       // Decrements down to 0 to spawn an enemy
let searchCooldown = 3;    // Base search time in seconds (mutable for future shop)

let gameSpeed = 1000;      // 1 tick = 1000ms (1 second)
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
        let missingHp = hero.hpMax - hero.hp;
        let secondsLeft = Math.ceil(missingHp / hero.hpRegen);
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
    // Insert new message at the top for comfortable mobile view
    log.innerHTML = `<p>${text}</p>` + log.innerHTML;
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
    // 1. PHASE DE COMBAT ACTIF
    if (currentEnemy && currentEnemy.hp > 0) {
        currentEnemy.hp -= hero.attack;
        addLogMessage(`⚔️ You hit the enemy for ${hero.attack} dmg.`);
        
        if (currentEnemy.hp <= 0) {
            let goldEarned = hero.stage * 3;
            hero.gold += goldEarned;
            addLogMessage(`🎉 Enemy Defeated! Stage ${hero.stage} Cleared! +${goldEarned} Gold.`);
            hero.stage++;
            currentEnemy = null; 
            searchTimer = searchCooldown; // Vaut 3
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
        refreshInterface(); // Affiche immédiatement "Searching (3s)" au moment de la mort
        return; 
    }

    // 2. PHASE DE SOIN HORS-COMBAT
    if (hero.hp < hero.hpMax) {
        hero.hp = Math.min(hero.hpMax, hero.hp + hero.hpRegen);
        refreshInterface(); 
        return; 
    }

    // 3. PHASE DE RECHERCHE HORS-COMBAT (Ordre corrigé pour éviter le doublon)
    if (searchTimer > 0) {
        searchTimer--; // On baisse le timer IMMÉDIATEMENT (passe de 3 à 2, etc.)
        
        if (searchTimer > 0) {
            addLogMessage(`🔍 Searching for the next target...`); 
            refreshInterface(); // Affichera 2s, puis 1s
            return; 
        }
        // Si le timer est tombé à 0 après la baisse, on ne fait pas de return 
        // et on laisse le code couler directement vers le spawn du monstre !
    }

    // 4. SPAWN IMMÉDIAT DU MONSTRE
    if (!currentEnemy) {
        spawnNewEnemy();
        addLogMessage(`⚠️ A wild enemy appears for Stage ${hero.stage}!`);
        refreshInterface(); 
    }
}

// ==========================================
// 4. DEV TOOLS (Functions for fast testing)
// ==========================================
function devSkipToStage(targetStage) {
    hero.stage = targetStage;
    currentEnemy = null; 
    searchTimer = 0;     
    addLogMessage(`[DEV] Teleported to Stage ${targetStage}`);
    refreshInterface();
}

function devKillHero() {
    hero.hp = 0;
    addLogMessage(`[DEV] Smites the hero out of existence.`);
}

function devGiveGold(amount) {
    hero.gold += amount;
    addLogMessage(`[DEV] Added +${amount} Gold.`);
    refreshInterface();
}

// Kickstart the game engine loop
gameLoop = setInterval(executeTick, gameSpeed);