// ============================================================
//  NEON CYBER CLICKER RPG v2.0
// ============================================================

const allItemTemplates = [
    // ---- Эпоха 0 ----
    { id: 'cursor',      name: 'Курсор 🖱️',              baseCost: 15,        cps: 0.1,   reqRebirths: 0, tag: 'basic' },
    { id: 'grandma',     name: 'Бабушка 👵',              baseCost: 100,       cps: 1,     reqRebirths: 0, tag: 'basic' },
    { id: 'farm',        name: 'Гидроферма 🌾',           baseCost: 1100,      cps: 8,     reqRebirths: 0, tag: 'basic' },
    { id: 'mine',        name: 'Квантовая Шахта ⛏️',      baseCost: 12000,     cps: 47,    reqRebirths: 0, tag: 'basic' },
    { id: 'drone',       name: 'Дрон-Курьер 🛸',          baseCost: 45000,     cps: 120,   reqRebirths: 0, tag: 'basic' },

    // ---- Эпоха 1 ----
    { id: 'office',      name: 'Бизнес-Офис 🏢',          baseCost: 85000,     cps: 150,   reqRebirths: 1, tag: 'corp' },
    { id: 'bank',        name: 'Криптобанк 🏦',           baseCost: 450000,    cps: 720,   reqRebirths: 1, tag: 'corp' },
    { id: 'lab',         name: 'Нейро-Лаборатория 🧪',    baseCost: 900000,    cps: 1500,  reqRebirths: 1, tag: 'corp' },
    { id: 'satellite',   name: 'Орбитальный Узел 🛰️',     baseCost: 2000000,   cps: 3200,  reqRebirths: 1, tag: 'corp' },

    // ---- Эпоха 2 ----
    { id: 'supercomputer', name: 'ИИ-Кластер 🖥️',         baseCost: 2500000,   cps: 4200,  reqRebirths: 2, tag: 'tech' },
    { id: 'fusion',      name: 'Термоядерный Реактор ⚛️', baseCost: 8000000,   cps: 14000, reqRebirths: 2, tag: 'tech' },
    { id: 'dyson',       name: 'Сфера Дайсона 🌌',        baseCost: 18000000,  cps: 35000, reqRebirths: 2, tag: 'tech' },
    { id: 'blackhole',   name: 'Червоточина 🕳️',          baseCost: 50000000,  cps: 95000, reqRebirths: 2, tag: 'tech' },

    // ---- Эпоха 3 ----
    { id: 'timecore',    name: 'Ядро Времени ⏳',         baseCost: 150000000, cps: 280000,  reqRebirths: 3, tag: 'cosmic' },
    { id: 'galaxy',      name: 'Галактический Рой 🌠',    baseCost: 500000000, cps: 900000,  reqRebirths: 3, tag: 'cosmic' },
    { id: 'multiverse',  name: 'Мультивселенский Банк 🪐',baseCost: 2000000000,cps: 3000000, reqRebirths: 3, tag: 'cosmic' },

    // ---- Эпоха 4 ----
    { id: 'singularity', name: 'Сингулярность 🧿',        baseCost: 8000000000, cps: 9500000, reqRebirths: 4, tag: 'god' },
    { id: 'omniverse',   name: 'Омнивселенная ✨',        baseCost: 50000000000,cps: 40000000,reqRebirths: 4, tag: 'god' }
];

const petPool = [
    { name: 'Котёнок 🐱', multiplier: 0.1, chance: 0.50, rarity: 'common' },
    { name: 'Щенок 🐶', multiplier: 0.2, chance: 0.35, rarity: 'uncommon' },
    { name: 'Дракончик 🐉', multiplier: 0.5, chance: 0.12, rarity: 'rare' },
    { name: 'Единорог 🦄', multiplier: 1.5, chance: 0.03, rarity: 'legendary' }
];

const synergies = [
    { name: 'Автоматизация',   target: 'cursor',    scaleWith: 'grandma',       per: 10, bonus: 0.5 },
    { name: 'Агро-Сеть',       target: 'farm',      scaleWith: 'mine',          per: 1,  bonus: 0.4 },
    { name: 'Дрон-Флот',       target: 'drone',     scaleWith: 'office',        per: 1,  bonus: 0.25 },
    { name: 'Крипто-Синтез',   target: 'bank',      scaleWith: 'lab',           per: 1,  bonus: 0.3 },
    { name: 'Орбитальный ИИ',  target: 'satellite', scaleWith: 'supercomputer', per: 1,  bonus: 0.2 },
    { name: 'Термо-Синтез',    target: 'fusion',    scaleWith: 'dyson',         per: 1,  bonus: 0.4 },
    { name: 'Временной Поток', target: 'timecore',  scaleWith: 'galaxy',        per: 1,  bonus: 0.15 }
];

const achievements = [
    { id: 'first_click',   name: 'Первый Контакт',    desc: 'Кликни 1 раз',               check: s => s.totalClicks >= 1,    reward: 0.05 },
    { id: 'click_100',     name: 'Разминка',          desc: '100 кликов',                 check: s => s.totalClicks >= 100,  reward: 0.05 },
    { id: 'click_1000',    name: 'Палец-Титан',       desc: '1000 кликов',                check: s => s.totalClicks >= 1000, reward: 0.1 },
    { id: 'buy_10',        name: 'Инвестор',          desc: 'Купи 10 апгрейдов',          check: s => totalOwned() >= 10,    reward: 0.05 },
    { id: 'buy_50',        name: 'Магнат',            desc: 'Купи 50 апгрейдов',          check: s => totalOwned() >= 50,    reward: 0.1 },
    { id: 'buy_200',       name: 'Корпорация',        desc: 'Купи 200 апгрейдов',         check: s => totalOwned() >= 200,   reward: 0.15 },
    { id: 'pet_1',         name: 'Зоолог',            desc: 'Получи первого питомца',     check: s => s.pets.length >= 1,    reward: 0.05 },
    { id: 'pet_10',        name: 'Заводчик',          desc: 'Собери 10 питомцев',         check: s => s.pets.length >= 10,   reward: 0.15 },
    { id: 'pet_25',        name: 'Ковчег',            desc: 'Собери 25 питомцев',         check: s => s.pets.length >= 25,   reward: 0.25 },
    { id: 'rebirth_1',     name: 'Новая Эпоха',       desc: 'Соверши перерождение',       check: s => s.rebirths >= 1,       reward: 0.1 },
    { id: 'rebirth_3',     name: 'Хроникёр',          desc: '3 перерождения',             check: s => s.rebirths >= 3,       reward: 0.2 },
    { id: 'minigame_5',    name: 'Синхронизатор',     desc: 'Сыграй 5 раз в мини-игру',   check: s => s.minigamePlays >= 5,  reward: 0.1 },
    { id: 'combo_8',       name: 'Комбо-Мастер',      desc: 'Достигни комбо x8',          check: s => s.bestCombo >= 8,      reward: 0.15 }
];

const events = [
    { name: 'Золотой Кристалл', desc: 'Появился на 15 сек!', icon: '💎', color: '#ffd700', duration: 15, effect: 'golden' },
    { name: 'Энерго-Всплеск',   desc: 'x3 доход на 10 сек',  icon: '⚡', color: '#00f0ff', duration: 10, effect: 'triple' },
    { name: 'Кибер-Атака',      desc: 'Цены -30% на 12 сек', icon: '🛡️', color: '#ff007f', duration: 12, effect: 'discount' }
];

const EGG_COST = 500;
const SAVE_KEY = 'cyberClickerSave';
const AUTOSAVE_INTERVAL = 5000;

let gameState = {
    score: 0,
    rebirths: 0,
    owned: {},
    pets: [],
    totalClicks: 0,
    minigamePlays: 0,
    achievements: [],
    bestCombo: 1
};

// ---------- DOM ----------
const scoreDisplay = document.getElementById('score-display');
const cpsDisplay = document.getElementById('cps-display');
const multDisplay = document.getElementById('mult-display');
const cookieBtn = document.getElementById('cookie-btn');
const shopContainer = document.getElementById('shop-container');
const rebirthBtn = document.getElementById('rebirth-btn');
const rebirthCostText = document.getElementById('rebirth-cost-text');
const rebirthBadge = document.getElementById('rebirth-badge');
const buyEggBtn = document.getElementById('buy-egg-btn');
const petsList = document.getElementById('pets-list');
const resetBtn = document.getElementById('reset-btn');
const adminModal = document.getElementById('admin-modal');
const adminToggle = document.getElementById('admin-toggle-btn');
const adminClose = document.getElementById('admin-close-btn');
const achievementsList = document.getElementById('achievements-list');

const minigameArea = document.getElementById('minigame-area');
const crystal = document.getElementById('crystal-target');
const startMinigameBtn = document.getElementById('start-game-btn');
const minigameStats = document.getElementById('minigame-stats');
const startScreen = document.getElementById('minigame-start-screen');

// ---------- Служебные ----------
function totalOwned() { return Object.values(gameState.owned).reduce((a, b) => a + b, 0); }

function formatNumber(n) {
    if (n < 1000) return Math.floor(n).toString();
    const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx'];
    let i = 0;
    while (n >= 1000 && i < units.length - 1) { n /= 1000; i++; }
    return n.toFixed(n < 10 ? 2 : 1) + units[i];
}

function personalInitOwned() {
    allItemTemplates.forEach(item => {
        if (gameState.owned[item.id] === undefined) gameState.owned[item.id] = 0;
    });
}

// ---------- Загрузка / Сохранение ----------
function loadGame() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    try {
        const saved = JSON.parse(raw);
        if (typeof saved !== 'object' || saved === null) return;
        gameState = { ...gameState, ...saved };
        if (!Array.isArray(gameState.pets)) gameState.pets = [];
        if (!Array.isArray(gameState.achievements)) gameState.achievements = [];
        if (typeof gameState.owned !== 'object' || gameState.owned === null) gameState.owned = {};
        if (typeof gameState.score !== 'number' || !isFinite(gameState.score)) gameState.score = 0;
        if (typeof gameState.rebirths !== 'number') gameState.rebirths = 0;
        if (typeof gameState.totalClicks !== 'number') gameState.totalClicks = 0;
        if (typeof gameState.minigamePlays !== 'number') gameState.minigamePlays = 0;
        if (typeof gameState.bestCombo !== 'number') gameState.bestCombo = 1;
    } catch (e) {
        console.warn('Сейв битый, начинаем заново', e);
    }
}

function saveGame() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
}

// ---------- Экономика и Множители ----------
function getRebirthCost() {
    return Math.round(100000 * Math.pow(4, gameState.rebirths));
}

function getPetMultiplier() {
    let bonus = 0;
    gameState.pets.forEach(p => bonus += (p.multiplier || 0));
    return 1 + bonus;
}

function getRebirthMultiplier() {
    return 1 + gameState.rebirths * 1.5;
}

function getAchievementBonus() {
    let bonus = 0;
    achievements.forEach(a => {
        if (gameState.achievements.includes(a.id)) bonus += a.reward;
    });
    return bonus;
}

function getSynergyBonusFor(itemId) {
    let bonus = 0;
    synergies.forEach(s => {
        if (s.target !== itemId) return;
        const count = gameState.owned[s.scaleWith] || 0;
        const stacks = Math.floor(count / s.per);
        if (stacks > 0) bonus += stacks * s.bonus;
    });
    return bonus;
}

let activeEvent = null;
let eventBonus = { triple: false, discount: false };

function getTotalMultiplier() {
    let mult = getPetMultiplier() * getRebirthMultiplier() * (1 + getAchievementBonus());
    if (eventBonus.triple) mult *= 3;
    return mult;
}

function calculateBaseCPS() {
    let total = 0;
    allItemTemplates.forEach(item => {
        if (gameState.rebirths < item.reqRebirths) return;
        const count = gameState.owned[item.id] || 0;
        if (count === 0) return;
        const synergy = getSynergyBonusFor(item.id);
        total += count * item.cps * (1 + synergy);
    });
    return total;
}

function getTotalCPS() {
    return parseFloat((calculateBaseCPS() * getTotalMultiplier()).toFixed(1));
}

function getCurrentCost(item) {
    const count = gameState.owned[item.id] || 0;
    let cost = item.baseCost * Math.pow(1.15, count);
    if (eventBonus.discount) cost *= 0.7;
    return Math.round(cost);
}

// ---------- Отрисовка ----------
function renderActiveShop() {
    shopContainer.innerHTML = '';
    const visible = allItemTemplates.filter(i => gameState.rebirths >= i.reqRebirths);

    visible.forEach(item => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.id = `card-${item.id}`;
        card.dataset.tag = item.tag || 'basic'; // Для цветовой полоски CSS
        card.innerHTML = `
            <div>
                <span class="upgrade-name">${item.name}</span>
                <span class="upgrade-details" id="detail-${item.id}">+0/сек</span>
            </div>
            <div class="upgrade-right">
                <span class="upgrade-cost" id="cost-${item.id}">0</span>
                <span class="upgrade-count" id="count-${item.id}">0</span>
            </div>
        `;
        card.addEventListener('click', () => tryBuy(item));
        shopContainer.appendChild(card);
    });
    updateShopDetails();
}

function tryBuy(item) {
    const cost = getCurrentCost(item);
    if (gameState.score < cost) return;
    gameState.score -= cost;
    gameState.owned[item.id] = (gameState.owned[item.id] || 0) + 1;
    saveGame();
    updateUI();
}

function updateShopDetails() {
    const mult = getTotalMultiplier();
    allItemTemplates.forEach(item => {
        const detail = document.getElementById(`detail-${item.id}`);
        if (detail) {
            const synergy = getSynergyBonusFor(item.id);
            const realCps = (item.cps * mult * (1 + synergy));
            let text = `+${formatNumber(realCps)}/сек`;
            if (synergy > 0) text += ` (Синергия +${Math.round(synergy*100)}%)`;
            detail.textContent = text;
            detail.style.color = synergy > 0 ? '#ffd700' : 'var(--text-muted)';
        }
    });
}

function renderPets() {
    petsList.innerHTML = '';
    if (gameState.pets.length === 0) {
        petsList.innerHTML = '<div style="color:var(--text-muted);font-size:0.8rem;text-align:center;width:100%;padding:8px;">Пусто. Купи яйцо!</div>';
        return;
    }
    gameState.pets.forEach(pet => {
        const badge = document.createElement('div');
        badge.className = `pet-badge rarity-${pet.rarity || 'common'}`;
        badge.innerHTML = `${pet.name}<br><span style="color:var(--neon-blue)">+${Math.round(pet.multiplier * 100)}%</span>`;
        petsList.appendChild(badge);
    });
}

function renderAchievements() {
    if (!achievementsList) return;
    achievementsList.innerHTML = '';
    achievements.forEach(a => {
        const unlocked = gameState.achievements.includes(a.id);
        const el = document.createElement('div');
        el.className = `achievement ${unlocked ? 'unlocked' : 'locked'}`;
        el.innerHTML = `
            <span class="ach-name">${unlocked ? '✅' : '🔒'} ${a.name}</span>
            <span class="ach-desc">${a.desc} · +${Math.round(a.reward*100)}%</span>
        `;
        achievementsList.appendChild(el);
    });
}

// ---------- Достижения ----------
let checkingAch = false;
function checkAchievements() {
    if (checkingAch) return;
    checkingAch = true;
    let unlocked = false;
    achievements.forEach(a => {
        if (gameState.achievements.includes(a.id)) return;
        if (a.check(gameState)) {
            gameState.achievements.push(a.id);
            unlocked = true;
            spawnFloatingText(window.innerWidth / 2, window.innerHeight / 3, `🏆 ${a.name}`, '#ffd700');
        }
    });
    if (unlocked) { saveGame(); updateUI(); renderAchievements(); }
    checkingAch = false;
}

// ---------- Питомцы ----------
function rollPet() {
    const rand = Math.random();
    let cumulative = 0;
    let reward = petPool[0];
    for (const p of petPool) {
        cumulative += p.chance;
        if (rand <= cumulative) { reward = p; break; }
    }
    gameState.pets.push({ name: reward.name, multiplier: reward.multiplier, rarity: reward.rarity });
    renderPets();
    return reward;
}

buyEggBtn.addEventListener('click', () => {
    if (gameState.score < EGG_COST) return;
    gameState.score -= EGG_COST;
    const pet = rollPet();
    saveGame();
    updateUI();
    spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2, `+${pet.name}`, '#ffae00');
});

// ---------- Перерождение ----------
rebirthBtn.addEventListener('click', () => {
    const cost = getRebirthCost();
    if (gameState.score < cost) return;
    gameState.rebirths++;
    gameState.score = 0;
    allItemTemplates.forEach(i => gameState.owned[i.id] = 0);
    renderActiveShop();
    saveGame();
    updateUI();
    spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2, `ЭПОХА ${gameState.rebirths}!`, '#9d4edd');
});

// ---------- Клик и визуал ----------
function spawnFloatingText(x, y, text, color) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    if (color) el.style.color = color;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
}

cookieBtn.addEventListener('click', (e) => {
    const gain = 1 * getTotalMultiplier();
    gameState.score += gain;
    gameState.totalClicks++;
    spawnFloatingText(e.clientX, e.clientY, `+${formatNumber(gain)}`);
    updateUI();
    saveGame();
});

// ---------- Главный Update ----------
function updateUI() {
    scoreDisplay.textContent = formatNumber(gameState.score);

    const cps = getTotalCPS();
    cpsDisplay.textContent = `доход: ${formatNumber(cps)}/сек`;

    multDisplay.textContent = `Глобальный множитель: x${getTotalMultiplier().toFixed(2)}`;
    rebirthBadge.textContent = `Эпоха: ${gameState.rebirths}`;

    const rCost = getRebirthCost();
    rebirthCostText.textContent = `Требуется: ${formatNumber(rCost)} 🪙`;
    rebirthBtn.classList.toggle('disabled', gameState.score < rCost);
    buyEggBtn.classList.toggle('disabled', gameState.score < EGG_COST);

    allItemTemplates.forEach(item => {
        if (gameState.rebirths < item.reqRebirths) return;
        const card = document.getElementById(`card-${item.id}`);
        const costSpan = document.getElementById(`cost-${item.id}`);
        const countSpan = document.getElementById(`count-${item.id}`);
        if (!card || !costSpan || !countSpan) return;

        const cost = getCurrentCost(item);
        costSpan.textContent = formatNumber(cost);
        countSpan.textContent = gameState.owned[item.id] || 0;
        card.classList.toggle('disabled', gameState.score < cost);
    });

    updateShopDetails();
    checkAchievements();
}

// ---------- Мини-игра ----------
let gameActive = false;
let crystalClicks = 0;
let combo = 1;
let lastCrystalClick = 0;
let minigameTimer = null;
let currentTimeLeft = 10;

startMinigameBtn.addEventListener('click', () => {
    if (gameActive) return;
    startScreen.style.display = 'none';
    gameActive = true;
    crystalClicks = 0;
    combo = 1;
    lastCrystalClick = 0;
    crystal.style.display = 'block';
    moveCrystal();

    currentTimeLeft = 10;
    updateMinigameStats();

    minigameTimer = setInterval(() => {
        currentTimeLeft--;
        updateMinigameStats();
        if (currentTimeLeft <= 0) endMinigame();
    }, 1000);
});

function updateMinigameStats() {
    minigameStats.textContent = `Синхронизация: ${currentTimeLeft}с | Зарядов: ${crystalClicks} | Комбо: x${combo}`;
}

function endMinigame() {
    clearInterval(minigameTimer);
    gameActive = false;
    crystal.style.display = 'none';
    startScreen.style.display = 'flex';

    const reward = Math.round(crystalClicks * 100 * getTotalMultiplier() * (1 + combo * 0.15));
    gameState.score += reward;
    gameState.minigamePlays++;
    minigameStats.textContent = `Стабильно! +${formatNumber(reward)} энергии (комбо x${combo})`;
    updateUI();
    saveGame();
    spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2, `+${formatNumber(reward)} ⚡`, '#00f0ff');
}

function moveCrystal() {
    if (!gameActive) return;
    const rect = minigameArea.getBoundingClientRect();
    const pad = 35;
    const maxX = Math.max(pad, rect.width - pad);
    const maxY = Math.max(pad, rect.height - pad);
    const x = pad + Math.random() * (maxX - pad);
    const y = pad + Math.random() * (maxY - pad);
    crystal.style.left = `${x}px`;
    crystal.style.top = `${y}px`;
}

crystal.addEventListener('click', () => {
    if (!gameActive) return;
    const now = performance.now();
    if (lastCrystalClick && (now - lastCrystalClick) < 700) {
        combo = Math.min(combo + 1, 10);
    } else {
        combo = 1;
    }
    lastCrystalClick = now;
    crystalClicks++;
    if (combo > gameState.bestCombo) gameState.bestCombo = combo;
    moveCrystal();
    updateMinigameStats();
});

// ---------- Случайные события ----------
function trySpawnEvent() {
    if (activeEvent) return;
    if (Math.random() > 0.15) return;
    const ev = events[Math.floor(Math.random() * events.length)];
    activeEvent = ev;
    eventBonus = { triple: false, discount: false };
    if (ev.effect === 'triple') eventBonus.triple = true;
    if (ev.effect === 'discount') eventBonus.discount = true;

    showEventBanner(ev);
    setTimeout(() => {
        activeEvent = null;
        eventBonus = { triple: false, discount: false };
        hideEventBanner();
        updateUI();
    }, ev.duration * 1000);
}

function showEventBanner(ev) {
    let banner = document.getElementById('event-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'event-banner';
        banner.className = 'event-banner';
        document.body.appendChild(banner);
    }
    banner.innerHTML = `<span style="font-size:1.5rem">${ev.icon}</span> <b>${ev.name}</b> — ${ev.desc}`;
    banner.style.display = 'block';
    banner.style.borderColor = ev.color;
    banner.style.boxShadow = `0 0 20px ${ev.color}`;
}

function hideEventBanner() {
    const banner = document.getElementById('event-banner');
    if (banner) banner.style.display = 'none';
}

setInterval(trySpawnEvent, 30000);

// ---------- Админ-панель ----------
adminToggle.addEventListener('click', () => adminModal.style.display = 'flex');
adminClose.addEventListener('click', () => adminModal.style.display = 'none');
adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) adminModal.style.display = 'none';
});

document.getElementById('admin-add-score').addEventListener('click', () => {
    const val = parseFloat(document.getElementById('admin-score-input').value) || 0;
    gameState.score += val;
    updateUI(); saveGame();
});

document.getElementById('admin-set-rebirth').addEventListener('click', () => {
    const val = parseInt(document.getElementById('admin-rebirth-input').value) || 0;
    gameState.rebirths = Math.max(0, val);
    renderActiveShop(); updateUI(); saveGame();
});

document.getElementById('admin-give-pet').addEventListener('click', () => {
    rollPet(); updateUI(); saveGame();
});

// ---------- Сброс ----------
resetBtn.addEventListener('click', () => {
    if (!confirm('Уничтожить все данные сессии?')) return;
    gameState = { score: 0, rebirths: 0, owned: {}, pets: [], totalClicks: 0, minigamePlays: 0, achievements: [], bestCombo: 1 };
    personalInitOwned();
    renderActiveShop();
    renderPets();
    renderAchievements();
    updateUI();
    saveGame();
});

// ---------- Игровой цикл ----------
let lastTick = Date.now();
let lastSave = Date.now();

setInterval(() => {
    const now = Date.now();
    const delta = (now - lastTick) / 1000;
    lastTick = now;

    const cps = getTotalCPS();
    if (cps > 0) gameState.score += cps * delta;

    scoreDisplay.textContent = formatNumber(gameState.score);

    const rCost = getRebirthCost();
    rebirthBtn.classList.toggle('disabled', gameState.score < rCost);
    buyEggBtn.classList.toggle('disabled', gameState.score < EGG_COST);

    if (now - lastSave > AUTOSAVE_INTERVAL) {
        saveGame();
        lastSave = now;
    }
}, 100);

window.addEventListener('beforeunload', saveGame);

// ---------- Старт ----------
loadGame();
personalInitOwned();
renderActiveShop();
renderPets();
renderAchievements();
updateUI();