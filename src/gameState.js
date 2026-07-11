// Private game state variables (Inaccessible from browser console)
const hero = {
    hp: 100,
    hpMax: 100,
    attack: 10,
    attackSpeed: 1000, // Attack cooldown in milliseconds (1000ms = 1s)
    hpRegen: 5,        // HP recovered per second out of combat
    gold: 0,
    stage: 1
};

let currentEnemy = null;

// High-frequency time trackers (in milliseconds)
let searchTimer = 0;
const searchCooldown = 3000; // 3 seconds to find a monster
let regenAccumulator = 0;    // Tracks elapsed time for passive healing
let attackAccumulator = 0;   // Tracks elapsed time for combat turns

// Secure gateway functions (Getters & Setters)
export function getHero() { return hero; }
export function getCurrentEnemy() { return currentEnemy; }
export function setCurrentEnemy(enemy) { currentEnemy = enemy; }

export function getSearchTimer() { return searchTimer; }
export function setSearchTimer(val) { searchTimer = val; }
export function resetSearchTimer() { searchTimer = searchCooldown; }

export function getRegenAccumulator() { return regenAccumulator; }
export function setRegenAccumulator(val) { regenAccumulator = val; }

export function getAttackAccumulator() { return attackAccumulator; }
export function setAttackAccumulator(val) { attackAccumulator = val; }