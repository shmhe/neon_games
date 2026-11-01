const DEFAULT_G = {
    lvl: 1, xp: 0, xpMax: 100, coins: 1000, statPoints: 5,
    hpLvl: 1, stLvl: 1, dmgLvl: 1, blockLvl: 1,
    bladeMastery: 1, breathMastery: 1,
    hasBreath: false, breathType: null,
    inventory: [], ownedClans: [], spins: 5,
    equipped: { katana: null, outfit: null, haori: null, clan: 'none' },
    questsDone: 0, isMoving: false, activeBoss: null, isFighting: false,
    bossTimer: null, skillsBought: []
};

let G = JSON.parse(JSON.stringify(DEFAULT_G)),
    shopInterval = null, shopTimeLeft = 30, currentShopItems = [],
    blockActive = false, blockCooldown = false, isPerfectBlockWindow = false,
    currentHp, currentSt;

const $ = id => document.getElementById(id);
const dmgMult = m => 1 + (m - 1) * (2 / 399);

function showAlert(m) {
    const w = $('custom-alert'), t = $('custom-alert-text');
    if (w && t) {
        t.textContent = m;
        w.style.display = 'block';
        setTimeout(() => w.style.display = 'none', 3000);
    } else alert(m);
}

function showConfirm(msg, onYes) {
    const modal = $('custom-alert');
    if (modal) {
        modal.innerHTML = `
            <div id="custom-alert-text" style="font-size: 1.1rem; font-weight: bold; color: #8c2d19; margin-bottom: 15px; font-family: 'Noto Serif JP', serif;">${msg}</div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="manga-btn" id="btn-confirm-yes" style="padding: 5px 20px; background: #241C18; color: #e6d5v8;">Да</button>
                <button class="manga-btn" id="btn-confirm-no" style="padding: 5px 20px;">Нет</button>
            </div>
        `;
        modal.style.display = 'block';
        $('btn-confirm-yes').onclick = () => { modal.style.display = 'none'; restoreAlertModal(); onYes(); };
        $('btn-confirm-no').onclick = () => { modal.style.display = 'none'; restoreAlertModal(); };
    } else {
        if (confirm(msg)) onYes();
    }
}

function restoreAlertModal() {
    const modal = $('custom-alert');
    if(modal) {
        modal.innerHTML = `<div id="custom-alert-text" style="font-size: 1.1rem; font-weight: bold; color: #8c2d19; margin-bottom: 15px; font-family: 'Noto Serif JP', serif;">Текст ошибки</div><button class="manga-btn" onclick="document.getElementById('custom-alert').style.display='none'" style="padding: 5px 20px; font-size: 0.9rem;">ОК</button>`;
    }
}

function saveGame() {
    const d = {
        lvl: G.lvl, xp: G.xp, xpMax: G.xpMax, coins: G.coins, statPoints: G.statPoints,
        hpLvl: G.hpLvl, stLvl: G.stLvl, dmgLvl: G.dmgLvl, blockLvl: G.blockLvl,
        bladeMastery: G.bladeMastery, breathMastery: G.breathMastery,
        hasBreath: G.hasBreath, breathType: G.breathType,
        inventory: G.inventory, ownedClans: G.ownedClans, spins: G.spins,
        equipped: G.equipped, questsDone: G.questsDone, skillsBought: G.skillsBought
    };
    localStorage.setItem('demonSlayerSave', JSON.stringify(d));
}

function loadGame() {
    const r = localStorage.getItem('demonSlayerSave');
    if (!r) return;
    try {
        const s = JSON.parse(r);
        G = { ...DEFAULT_G, ...s };
        if (!G.equipped) G.equipped = { katana: null, outfit: null, haori: null, clan: 'none' };
        if (!G.equipped.clan) G.equipped.clan = 'none';
        if (!Array.isArray(G.inventory)) G.inventory = [];
        if (!Array.isArray(G.ownedClans)) G.ownedClans = [];
        if (!Array.isArray(G.skillsBought)) G.skillsBought = [];
        if (typeof G.spins !== 'number') G.spins = 0;
        if (typeof G.questsDone !== 'number') G.questsDone = 0;
        if (G.hasBreath) unlockSkills();
    } catch (e) {
        console.warn('Ошибка загрузки сохранения', e);
    }
}

function getMaxHp() {
    let h = 100 + (G.hpLvl - 1) * 20;
    if (G.equipped.outfit && ITEMS[G.equipped.outfit]) h += ITEMS[G.equipped.outfit].hp;
    if (G.equipped.clan && CLANS[G.equipped.clan]) h += CLANS[G.equipped.clan].hp;
    return h;
}

function getMaxSt() {
    let s = 50 + (G.stLvl - 1) * 10;
    if (G.equipped.haori && ITEMS[G.equipped.haori]) s += ITEMS[G.equipped.haori].st;
    if (G.equipped.clan && CLANS[G.equipped.clan]) s += CLANS[G.equipped.clan].st;
    return s;
}

function getAtkDmg() {
    let d = 10 + (G.dmgLvl - 1) * 2;
    if (G.equipped.katana && ITEMS[G.equipped.katana]) d += ITEMS[G.equipped.katana].dmg;
    if (G.equipped.clan && CLANS[G.equipped.clan]) d += CLANS[G.equipped.clan].dmg;
    return d;
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = $(id);
    if (target) target.classList.add('active');
    if (id === 'screen-inventory') updateInventoryUI();
    if (id === 'screen-shop') startShopTimer();
    if (id === 'screen-tree') renderTree();
}

function updateMapUI() {
    $('map-lvl').textContent = G.lvl;
    $('map-xp').textContent = `${Math.floor(G.xp)}/${G.xpMax}`;
    $('map-coins').textContent = G.coins;
    $('map-spins').textContent = G.spins;
    $('map-breath').textContent = G.hasBreath ? G.breathType : 'Нет';
    $('map-breath').style.color = G.hasBreath ? '#267373' : '#a63a2b';
    saveGame();
}

function moveTo(id, cb) {
    if (G.isMoving) return;
    G.isMoving = true;
    document.querySelectorAll('.map-menu').forEach(m => m.style.display = 'none');
    const node = $(id), container = $('map-container');
    if (!node || !container) { G.isMoving = false; if (cb) cb(); return; }
    
    const n = node.getBoundingClientRect(), m = container.getBoundingClientRect();
    $('map-player').style.left = (((n.left - m.left) / m.width) * 100) + '%';
    $('map-player').style.top = (((n.top - m.top) / m.height) * 100) + '%';
    
    setTimeout(() => {
        G.isMoving = false;
        if (cb) cb();
    }, 800);
}

// Привязка кликов по карте
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    updateMapUI();

    const village = $('node-village');
    if (village) village.onclick = () => moveTo('node-village', () => {
        const menu = $('map-menu');
        if (menu) menu.style.display = 'flex';
    });

    const shopNode = $('node-shop');
    if (shopNode) shopNode.onclick = () => moveTo('node-shop', () => showScreen('screen-shop'));

    const btnTree = $('btn-tree');
    if (btnTree) btnTree.onclick = () => { showScreen('screen-tree'); renderTree(); };

    const btnInv = $('btn-inventory');
    if (btnInv) btnInv.onclick = () => showScreen('screen-inventory');

    for (let i = 1; i <= 8; i++) {
        const qNode = $(`node-quest-${i}`);
        if (qNode) qNode.onclick = () => moveTo(`node-quest-${i}`, () => tryStartQuest(i));
    }

    for (let k in BOSS_REQS) {
        const bNode = $(k);
        if (bNode) bNode.onclick = () => moveTo(k, () => {
            if (G.lvl < BOSS_REQS[k]) return showAlert(`Требуется ${BOSS_REQS[k]} уровень!`);
            startBoss(k.replace('node-boss-', ''));
        });
    }

    const learn = (lvl, name) => {
        if (G.hasBreath) return showAlert('Уже выучено!');
        if (G.lvl < lvl) return showAlert(`Нужен ${lvl} уровень!`);
        G.hasBreath = true;
        G.breathType = name;
        showAlert(`Выучено Дыхание: ${name}!`);
        updateMapUI();
        unlockSkills();
    };

    if ($('node-water-trainer')) $('node-water-trainer').onclick = () => moveTo('node-water-trainer', () => learn(2, 'Вода'));
    if ($('node-thunder-trainer')) $('node-thunder-trainer').onclick = () => moveTo('node-thunder-trainer', () => learn(5, 'Гром'));
    if ($('node-flame-trainer')) $('node-flame-trainer').onclick = () => moveTo('node-flame-trainer', () => learn(10, 'Огонь'));
    if ($('node-insect-trainer')) $('node-insect-trainer').onclick = () => moveTo('node-insect-trainer', () => learn(20, 'Насекомое'));
    if ($('node-wind-trainer')) $('node-wind-trainer').onclick = () => moveTo('node-wind-trainer', () => learn(35, 'Ветер'));

    const forgetBtn = $('btn-forget-breath');
    if (forgetBtn) forgetBtn.onclick = () => {
        if (!G.hasBreath) return showAlert('Нет дыхания!');
        showConfirm('Забыть текущее дыхание?', () => {
            G.hasBreath = false; G.breathType = null;
            document.querySelectorAll('.skill-btn,.ult-btn').forEach(el => el.classList.add('locked-skill'));
            saveGame(); updateMapUI(); showAlert('Забыто!'); closeScreen('tree');
        });
    };

    const spinBtn = $('btn-spin');
    if (spinBtn) spinBtn.onclick = () => spinGacha();

const attackBtn = $('btn-attack');
    if (attackBtn) attackBtn.onclick = () => {
        if (!G.isFighting) return;
        if (blockActive) { log('Нельзя атаковать во время блока!'); return; } // Блокируем удар, если активен блок
        if (Math.random() < 0.05) { log('Промах!'); return; }
        const dmg = Math.round(getAtkDmg() * (1 + G.bladeMastery / 200));
        hitBoss(dmg);
        log(`Удар на ${dmg} ед.`);
        currentSt = Math.min(getMaxSt(), currentSt + 5);
        updateBattleUI();
    };

    const blockBtn = $('btn-block');
    if (blockBtn) blockBtn.onclick = () => {
        if (!G.isFighting || blockCooldown) return;
        blockActive = true;
        log('Вы нажали блок!');
    };

    [1, 2, 3].forEach(id => {
        const sBtn = $(`btn-skill-${id}`);
        if (sBtn) sBtn.onclick = () => useSkill(id);
    });

    const ultBtn = $('btn-ult');
    if (ultBtn) ultBtn.onclick = () => useUlt();

    const contBtn = $('btn-continue');
    if (contBtn) contBtn.onclick = () => {
        showScreen('screen-map');
        contBtn.style.display = 'none';
        const actionBar = document.querySelector('.action-bar');
        if (actionBar) { actionBar.style.opacity = '1'; actionBar.style.pointerEvents = 'auto'; }
    };
});

function tryStartQuest(id) {
    const q = QUESTS[id];
    if (!q) return;
    if (G.lvl < q.reqLvl) return showAlert(`Требуется ${q.reqLvl} уровень!`);
    if (G.questsDone < q.reqQuests) return showAlert(`Квестов выполнено: ${G.questsDone}, нужно: ${q.reqQuests}!`);
    
    showScreen('screen-battle');
    $('btn-continue').style.display = 'none';
    $('boss-name-display').textContent = `Квест: ${q.name}`;
    $('boss-sprite').textContent = q.icon;
    $('boss-hp-text').textContent = '---';
    $('boss-hp-fill').style.width = '100%';
    $('boss-attack-fill').style.width = '0%';
    $('boss-skill-display').classList.remove('active');
    $('battle-log').innerHTML = `<div>Выполняется квест...</div>`;
    
    const actionBar = document.querySelector('.action-bar');
    if(actionBar) { actionBar.style.opacity = '0.3'; actionBar.style.pointerEvents = 'none'; }

    setTimeout(() => {
        G.coins += q.coins;
        gainXp(q.xp);
        G.questsDone++;
        log(`Квест выполнен! +${q.xp} опыта, +${q.coins} монет.`);
        $('btn-continue').style.display = 'block';
    }, 2000);
}

function unlockSkills() {
    document.querySelectorAll('.locked-skill').forEach(el => el.classList.remove('locked-skill'));
}

function closeScreen(id) {
    showScreen('screen-map');
}

function renderTree() {
    const tp = $('tree-points');
    if (tp) tp.textContent = G.statPoints;
    
    document.querySelectorAll('.tree-node[data-stat]').forEach(node => {
        const stat = node.dataset.stat;
        const cost = parseInt(node.dataset.cost);
        const reqId = node.dataset.req;
        const maxLvl = node.dataset.max;
        const lvlNum = node.dataset.lvl;
        
        let isBought = G.skillsBought.includes(node.id);
        let canBuy = true;
        
        if (reqId && !G.skillsBought.includes(reqId)) canBuy = false;
        if (G.statPoints < cost) canBuy = false;
        
        if (isBought) {
            node.classList.remove('locked');
            node.style.background = '#222122';
            node.style.borderColor = '#d32f2f';
        } else if (!canBuy) {
            node.classList.add('locked');
            node.style.background = '';
            node.style.borderColor = '';
        } else {
            node.classList.remove('locked');
            node.style.background = '';
            node.style.borderColor = '';
        }
        
        node.onmouseenter = () => {
            if (node.classList.contains('locked')) return;
            let statName = stat === 'hp' ? "Макс. Здоровье" : (stat === 'dmg' ? "Урон с меча" : (stat === 'st' ? "Стамина" : "Прочность блока"));
            const tEl = $('info-title'), dEl = $('info-desc');
            if(tEl) tEl.textContent = `${node.querySelector('.val').textContent} ${statName}`;
            if(dEl) dEl.textContent = `${statName} · Уровень ${lvlNum} из ${maxLvl}`;
        };
        
        node.onmouseleave = () => {
            const tEl = $('info-title'), dEl = $('info-desc');
            if(tEl) tEl.textContent = "Выберите навык";
            if(dEl) dEl.textContent = "Уровень 0";
        };

        node.onclick = () => {
            if (isBought) return showAlert('Этот навык уже изучен!');
            if (!canBuy) return showAlert('Недостаточно очков или не открыт предыдущий навык!');
            
            G.statPoints -= cost;
            G.skillsBought.push(node.id);
            
            const lvlVal = parseInt(lvlNum);
            if (stat === 'hp') G.hpLvl += (lvlVal === 10 ? 50 : (lvlVal === 9 ? 20 : (lvlVal === 8 ? 10 : (lvlVal === 7 ? 5 : (lvlVal === 6 ? 3 : 1)))));
            if (stat === 'dmg') G.dmgLvl += (lvlVal === 10 ? 20 : (lvlVal === 9 ? 10 : (lvlVal === 8 ? 6 : (lvlVal === 7 ? 4 : (lvlVal === 6 ? 2 : 1)))));
            if (stat === 'bladeMastery') G.bladeMastery += (lvlVal === 10 ? 50 : (lvlVal === 9 ? 25 : (lvlVal === 8 ? 15 : (lvlVal === 7 ? 10 : (lvlVal === 6 ? 5 : 2)))));
            if (stat === 'breathMastery') G.breathMastery += (lvlVal === 10 ? 50 : (lvlVal === 9 ? 25 : (lvlVal === 8 ? 15 : (lvlVal === 7 ? 10 : (lvlVal === 6 ? 5 : 2)))));
            if (stat === 'st') G.stLvl += 1;
            if (stat === 'block') G.blockLvl += 1;
            
            saveGame();
            renderTree();
            showAlert('Навык изучен!');
        };
    });
}

function updateInventoryUI() {
    if (!$('eq-katana')) return;
    $('eq-katana').textContent = 'Катана: ' + (G.equipped.katana && ITEMS[G.equipped.katana] ? ITEMS[G.equipped.katana].name : 'Пусто');
    $('eq-outfit').textContent = 'Аутфит: ' + (G.equipped.outfit && ITEMS[G.equipped.outfit] ? ITEMS[G.equipped.outfit].name : 'Пусто');
    $('eq-haori').textContent = 'Хаори: ' + (G.equipped.haori && ITEMS[G.equipped.haori] ? ITEMS[G.equipped.haori].name : 'Пусто');
    $('eq-clan').textContent = 'Клан: ' + (G.equipped.clan && CLANS[G.equipped.clan] ? CLANS[G.equipped.clan].name : 'Нет');
    
    $('inv-stat-dmg').textContent = getAtkDmg();
    $('inv-stat-hp').textContent = getMaxHp();
    $('inv-stat-st').textContent = getMaxSt();
    $('inv-stat-blade').textContent = 'x' + dmgMult(G.bladeMastery).toFixed(2);
    $('spin-count').textContent = G.spins;

const cl = $('list-clans');
    if (cl) {
        cl.innerHTML = '';
        if (!G.ownedClans.length) {
            cl.innerHTML = '<div style="color:#a69f92;text-align:center;grid-column: 1/-1;">Крути рулетку!</div>';
        } else {
            // Задаем четкий порядок редкости сверху вниз
            const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3, 'legendary': 4, 'mythic': 5, 'supreme': 6, 'admin': 7 };
            
            // Сортируем полученные кланы по рангу редкости
            const sortedClans = [...G.ownedClans].sort((a, b) => {
                const rA = CLANS[a] ? rarityOrder[CLANS[a].rarity] || 0 : 0;
                const rB = CLANS[b] ? rarityOrder[CLANS[b].rarity] || 0 : 0;
                return rA - rB; // Сначала слабые, внизу сильные
            });

            sortedClans.forEach(cid => {
                const c = CLANS[cid];
                if (!c) return;
                const d = document.createElement('div');
                d.className = `clan-item clan-${c.rarity}`;
                if (G.equipped.clan === cid) d.classList.add('equipped');
                d.innerHTML = `<div style="font-size:1rem;">${c.name}</div><div style="font-size:0.75rem;">+${c.dmg} Dmg | +${c.hp} HP | +${c.st} ST</div>`;
                d.onclick = () => {
                    G.equipped.clan = G.equipped.clan === cid ? 'none' : cid;
                    updateInventoryUI();
                    saveGame();
                };
                cl.appendChild(d);
            });
        }
    }

    const lists = { katana: $('list-katanas'), outfit: $('list-outfits'), haori: $('list-haoris') };
    Object.values(lists).forEach(l => { if (l) l.innerHTML = ''; });

    G.inventory.forEach(iid => {
        const i = ITEMS[iid];
        if (!i || !lists[i.type]) return;
        const d = document.createElement('div');
        d.className = 'inv-item';
        if (G.equipped[i.type] === iid) d.classList.add('equipped');
        d.textContent = i.name + (G.equipped[i.type] === iid ? ' (Надето)' : '');
        d.onclick = () => {
            if (G.equipped[i.type] === iid) G.equipped[i.type] = null;
            else G.equipped[i.type] = iid;
            updateInventoryUI();
            saveGame();
        };
        lists[i.type].appendChild(d);
    });
}

function spinGacha() {
    if (G.spins <= 0) return showAlert('Нет спинов!');
    G.spins--;
    saveGame();
    updateInventoryUI();
    
    const r = $('gacha-result');
    if (!r) return;
    r.classList.add('spin-anim');
    r.textContent = 'Крутим...';
    
    let si = setInterval(() => {
        const rc = Object.keys(CLANS)[Math.floor(Math.random() * Object.keys(CLANS).length)];
        r.textContent = CLANS[rc].name;
    }, 50);

    setTimeout(() => {
        clearInterval(si);
        r.classList.remove('spin-anim');
        const roll = Math.random();
        let nc = null;
        const ck = Object.keys(CLANS);
        
        if (roll < 0.001) nc = 'tsugikuni';
        else if (roll < 0.011) nc = ck.filter(k => CLANS[k].rarity === 'supreme')[Math.floor(Math.random() * ck.filter(k => CLANS[k].rarity === 'supreme').length)];
        else if (roll < 0.021) nc = ck.filter(k => CLANS[k].rarity === 'mythic')[Math.floor(Math.random() * ck.filter(k => CLANS[k].rarity === 'mythic').length)];
        else if (roll < 0.061) nc = ck.filter(k => CLANS[k].rarity === 'legendary')[Math.floor(Math.random() * ck.filter(k => CLANS[k].rarity === 'legendary').length)];
        else if (roll < 0.181) nc = ck.filter(k => CLANS[k].rarity === 'rare')[Math.floor(Math.random() * ck.filter(k => CLANS[k].rarity === 'rare').length)];
        else if (roll < 0.411) nc = ck.filter(k => CLANS[k].rarity === 'uncommon')[Math.floor(Math.random() * ck.filter(k => CLANS[k].rarity === 'uncommon').length)];
        else nc = ck.filter(k => CLANS[k].rarity === 'common')[Math.floor(Math.random() * ck.filter(k => CLANS[k].rarity === 'common').length)];
        
        if (!nc) nc = ck[Math.floor(Math.random() * ck.length)];
        const c = CLANS[nc];
        r.textContent = `${c.name} (${c.rarity.toUpperCase()})`;
        
        if (!G.ownedClans.includes(nc)) {
            G.ownedClans.push(nc);
            r.textContent += ' - НОВЫЙ!';
        } else {
            r.textContent += ' - ПОВТОР';
            G.coins += 500;
        }
        saveGame();
        updateInventoryUI();
    }, 1500);
}

function startShopTimer() {
    clearInterval(shopInterval);
    shopTimeLeft = 30;
    generateShopItems();
    updateShopTimerUI();
    shopInterval = setInterval(() => {
        shopTimeLeft--;
        updateShopTimerUI();
        if (shopTimeLeft <= 0) {
            shopTimeLeft = 30;
            generateShopItems();
        }
    }, 1000);
}

function updateShopTimerUI() {
    const t = $('shop-timer');
    if (t) t.textContent = `Обновление через: ${shopTimeLeft}с`;
}

function generateShopItems() {
    const p = Object.keys(ITEMS);
    currentShopItems = [];
    while (currentShopItems.length < 3 && currentShopItems.length < p.length) {
        const id = p[Math.floor(Math.random() * p.length)];
        if (!currentShopItems.includes(id)) currentShopItems.push(id);
    }
    renderShop();
}

function renderShop() {
    const c = $('shop-items');
    if (!c) return;
    c.innerHTML = '';
    currentShopItems.forEach(id => {
        const i = ITEMS[id];
        if (!i) return;
        const pr = id.includes('_moon') ? 500000 : (id.includes('_fist') || id.includes('_poison') || id.includes('_blood') ? 200000 : (id.includes('_god') ? 100000 : Math.floor(Math.random() * 1000) + 500));
        
        const card = document.createElement('div');
        card.className = 'shop-card';
        card.innerHTML = `
            <div class="shop-item-icon">${i.type === 'katana' ? '⚔️' : (i.type === 'outfit' ? '🥋' : '👘')}</div>
            <div class="shop-item-title">${i.name}</div>
            <div class="shop-item-price">${pr} 🪙</div>
            <button class="shop-buy-btn" onclick="buyShop('${id}', ${pr})">Купить</button>
        `;
        c.appendChild(card);
    });
}

window.buyShop = function(id, pr) {
    if (G.coins < pr) return showAlert('Мало монет!');
    if (G.inventory.includes(id)) return showAlert('Уже есть!');
    G.coins -= pr;
    G.inventory.push(id);
    showAlert('Куплено!');
    updateMapUI();
    saveGame();
};

function startBoss(bid) {
    showScreen('screen-battle');
    G.isFighting = true;
    currentHp = getMaxHp();
    currentSt = getMaxSt();
    const b = BOSSES[bid];
    if (!b) return;
    G.activeBoss = { ...b, hp: b.hp, maxHp: b.hp, attackCharge: 0, isCharging: false, stun: false, isSkill: false, skillName: '' };
    $('btn-continue').style.display = 'none';
    $('boss-name-display').textContent = b.name;
    $('boss-sprite').textContent = b.icon;
    updateBattleUI();
    $('battle-log').innerHTML = `<div>Бой начался!</div>`;
    
    const actionBar = document.querySelector('.action-bar');
    if (actionBar) { actionBar.style.opacity = '1'; actionBar.style.pointerEvents = 'auto'; }
    
    blockActive = false;
    blockCooldown = false;
    const bBtn = $('btn-block');
    if(bBtn) bBtn.classList.remove('disabled');
    
    clearInterval(G.bossTimer);
    G.bossTimer = setInterval(bossLoop, 100);
    updateSkillButtons();
}

function bossLoop() {
    if (!G.isFighting || !G.activeBoss) return;
    const b = G.activeBoss;
    if (b.stun) return;
    
    if (!b.isCharging && b.attackCharge === 0) {
        b.isCharging = true;
        b.isSkill = false;
        const sd = $('boss-skill-display');
        if (sd) {
            sd.classList.remove('active');
            sd.textContent = '';
        }
        if (b.skills && b.skills.length > 0) {
            const r = Math.random();
            let cc = 0;
            for (let s of b.skills) {
                cc += s.chance;
                if (r < cc) {
                    b.isSkill = true;
                    b.skillName = s.name;
                    b.currentSkillDmg = s.dmg;
                    if (sd) {
                        sd.textContent = `⚠️ ${s.name} ⚠️`;
                        sd.classList.add('active');
                    }
                    log(`ВНИМАНИЕ! Босс готовит ${s.name}!`);
                    break;
                }
            }
        }
    }
    
    if (b.isCharging) {
        b.attackCharge += 15;
        const bFill = $('boss-attack-fill');
        if (bFill) bFill.style.width = `${Math.min(100, (b.attackCharge / 1200) * 100)}%`;
        
        if (b.attackCharge >= 1000 && b.attackCharge < 1200) isPerfectBlockWindow = true;
        
        if (b.attackCharge >= 1200) {
            b.isCharging = false;
            b.attackCharge = 0;
            isPerfectBlockWindow = false;
            if (bFill) bFill.style.width = '0%';
            const sd = $('boss-skill-display');
            if (sd) sd.classList.remove('active');
            
            if (blockActive && isPerfectBlockWindow) {
                log('ИДЕАЛЬНОЕ ПАРИРОВАНИЕ!');
                b.stun = true;
                setTimeout(() => { b.stun = false; log('Босс очнулся.'); }, 2000);
            } else if (blockActive) {
                log('Заблокировано!');
                blockActive = false;
                const bBtn = $('btn-block');
                if (bBtn) bBtn.classList.add('disabled');
                blockCooldown = true;
                setTimeout(() => {
                    blockCooldown = false;
                    if (bBtn) bBtn.classList.remove('disabled');
                    log('Блок восстановлен.');
                }, 4000);
            } else {
                let dmg = b.isSkill ? b.currentSkillDmg : G.activeBoss.dmg;
                currentHp -= dmg;
                log(`Босс атакует! Урон: ${dmg}`);
                if (currentHp <= 0) { die(); return; }
                updateBattleUI();
            }
            
            setTimeout(() => {
                if (G.isFighting && G.activeBoss) {
                    G.activeBoss.isCharging = true;
                    G.activeBoss.attackCharge = 0;
                }
            }, 1000);
        }
    }
}

function updateBattleUI() {
    if (!$('b-hp-fill')) return;
    $('b-hp-fill').style.width = `${Math.max(0, (currentHp / getMaxHp()) * 100)}%`;
    $('b-hp-text').textContent = `${Math.max(0, currentHp)}/${getMaxHp()}`;
    $('b-st-fill').style.width = `${(currentSt / getMaxSt()) * 100}%`;
    $('b-st-text').textContent = `${Math.floor(currentSt)}/${getMaxSt()}`;
    if (G.activeBoss) {
        $('boss-hp-fill').style.width = `${Math.max(0, (G.activeBoss.hp / G.activeBoss.maxHp) * 100)}%`;
        $('boss-hp-text').textContent = `${Math.ceil(G.activeBoss.hp)}/${G.activeBoss.maxHp}`;
    }
}

function log(msg) {
    const logBox = $('battle-log');
    if (!logBox) return;
    const d = document.createElement('div');
    d.textContent = msg;
    logBox.appendChild(d);
    logBox.scrollTop = logBox.scrollHeight;
}

function hitBoss(dmg) {
    if (!G.activeBoss) return;
    G.activeBoss.hp -= dmg;
    const dt = $('damage-text');
    if (dt) {
        dt.textContent = dmg;
        dt.style.left = '70%';
        dt.style.top = '30%';
        dt.style.animation = 'none';
        void dt.offsetWidth;
        dt.style.animation = 'dmgAnim 0.8s forwards';
    }
    updateBattleUI();
    if (G.activeBoss.hp <= 0) winBoss();
}

function die() {
    G.isFighting = false;
    clearInterval(G.bossTimer);
    log('Вы погибли в бою...');
    currentHp = getMaxHp();
    updateBattleUI();
    showAlert('Вы проиграли бой!');
    setTimeout(() => {
        showScreen('screen-map');
        const actionBar = document.querySelector('.action-bar');
        if(actionBar) { actionBar.style.opacity = '1'; actionBar.style.pointerEvents = 'auto'; }
    }, 1500);
}

function winBoss() {
    G.isFighting = false;
    clearInterval(G.bossTimer);
    log(`Босс ${G.activeBoss.name} повержен!`);
    
    G.bladeMastery += 2;
    log(`⚔️ Мастери Меча повышено до ${G.bladeMastery}!`);
    
    G.coins += G.activeBoss.coins;
    G.statPoints += 5;
    G.spins += 1;
    
    let dr = [];
    if (G.activeBoss.dropKatana && Math.random() < 0.05 && !G.inventory.includes(G.activeBoss.dropKatana)) {
        G.inventory.push(G.activeBoss.dropKatana);
        dr.push(ITEMS[G.activeBoss.dropKatana].name);
    }
    if (G.activeBoss.dropOutfit && Math.random() < 0.1 && !G.inventory.includes(G.activeBoss.dropOutfit)) {
        G.inventory.push(G.activeBoss.dropOutfit);
        dr.push(ITEMS[G.activeBoss.dropOutfit].name);
    }
    if (G.activeBoss.dropHaori && Math.random() < 0.1 && !G.inventory.includes(G.activeBoss.dropHaori)) {
        G.inventory.push(G.activeBoss.dropHaori);
        dr.push(ITEMS[G.activeBoss.dropHaori].name);
    }
    
    gainXp(G.activeBoss.xp);
    log(`=== ПОБЕДА ===`);
    log(`+${G.activeBoss.xp} опыта`);
    log(`+${G.activeBoss.coins} монет`);
    log(`+5 очков навыков`);
    log(`+1 спин 🎟️`);
    dr.forEach(d => log(`Выпало: ${d}`));
    
    const contBtn = $('btn-continue');
    if (contBtn) contBtn.style.display = 'block';
    const actionBar = document.querySelector('.action-bar');
    if (actionBar) { actionBar.style.opacity = '0.3'; actionBar.style.pointerEvents = 'none'; }
    saveGame();
}

const BREATH_SKILLS = {
    'Вода': { i1: '💧', n1: 'Водяной удар', d1: 1.5, c1: 10, a1: 0.85, i2: '🌊', n2: 'Водоворот', d2: 2.5, c2: 20, a2: 0.80, i3: '🌪️', n3: 'Дыхание Воды', d3: 4.0, c3: 30, a3: 0.90, i4: '💦', n4: 'Ульта Воды', d4: 10, c4: 50 },
    'Гром': { i1: '⚡', n1: 'Громовой удар', d1: 2.0, c1: 12, a1: 0.90, i2: '🌩️', n2: 'Шестой стиль', d2: 3.0, c2: 25, a2: 0.80, i3: '💥', n3: 'Бог Грома', d3: 5.0, c3: 35, a3: 0.85, i4: '🌩️', n4: 'Ульта Грома', d4: 12, c4: 50 },
    'Огонь': { i1: '🔥', n1: 'Огненный удар', d1: 2.0, c1: 15, a1: 0.85, i2: '☄️', n2: 'Второй стиль', d2: 3.5, c2: 30, a2: 0.80, i3: '🌋', n3: 'Девятый стиль', d3: 6.0, c3: 40, a3: 0.90, i4: '☀️', n4: 'Ульта Огня', d4: 15, c4: 50 },
    'Насекомое': { i1: '🦋', n1: 'Жало', d1: 1.2, c1: 8, a1: 0.95, i2: '☠️', n2: 'Яд', d2: 2.0, c2: 15, a2: 0.90, i3: '🦟', n3: 'Дыхание Насекомого', d3: 3.5, c3: 25, a3: 0.85, i4: '🦋', n4: 'Ульта Насекомого', d4: 8, c4: 50 },
    'Ветер': { i1: '🌪️', n1: 'Порыв', d1: 1.8, c1: 12, a1: 0.85, i2: '🌬️', n2: 'Смерч', d2: 3.0, c2: 22, a2: 0.85, i3: '💨', n3: 'Ярость Ветра', d3: 4.5, c3: 35, a3: 0.90, i4: '🌪️', n4: 'Ульта Ветра', d4: 11, c4: 50 }
};

function updateSkillButtons() {
    if (!G.hasBreath) return;
    
    const s1 = $('btn-skill-1'), s2 = $('btn-skill-2'), s3 = $('btn-skill-3'), ult = $('btn-ult');
    if(s1) s1.disabled = false;
    if(s2) s2.disabled = G.breathMastery < 5;
    if(s3) s3.disabled = G.breathMastery < 15;
    if(ult) ult.disabled = G.breathMastery < 30;
    
    if (G.breathMastery >= 5 && s2) s2.classList.remove('locked-skill');
    if (G.breathMastery >= 15 && s3) s3.classList.remove('locked-skill');
    if (G.breathMastery >= 30 && ult) ult.classList.remove('locked-skill');
    
    const s = BREATH_SKILLS[G.breathType] || BREATH_SKILLS['Вода'];
    if(s1) s1.innerHTML = s.i1;
    if(s2) s2.innerHTML = s.i2;
    if(s3) s3.innerHTML = s.i3;
    if(ult) ult.innerHTML = s.i4 + '<br><span style="font-size:0.6rem">Ульта</span>';
}

function useSkill(n) {
    if (!G.isFighting || !G.hasBreath) return;
    
    if (n === 2 && G.breathMastery < 5) return showAlert('Нужен 5 уровень мастери дыхания!');
    if (n === 3 && G.breathMastery < 15) return showAlert('Нужен 15 уровень мастери дыхания!');
    
    const s = BREATH_SKILLS[G.breathType] || BREATH_SKILLS['Вода'];
    let sk = n === 1 ? { c: s.c1, d: s.d1, a: s.a1, n: s.n1 } :
             n === 2 ? { c: s.c2, d: s.d2, a: s.a2, n: s.n2 } :
                       { c: s.c3, d: s.d3, a: s.a3, n: s.n3 };
                       
    if (currentSt < sk.c) { log('Мало стамины!'); return; }
    currentSt -= sk.c;
    
    if (Math.random() > sk.a) { log('Промах!'); updateBattleUI(); return; }
    
    const breathBonus = 1 + (G.breathMastery * 0.05);
    const dmg = Math.round(getAtkDmg() * sk.d * breathBonus);
    
    hitBoss(dmg);
    log(`${sk.n}: ${dmg} урона! (Бонус дыхания: x${breathBonus.toFixed(2)})`);
    updateBattleUI();
}

function useUlt() {
    if (!G.isFighting || !G.hasBreath) return;
    if (G.breathMastery < 30) return showAlert('Нужен 30 уровень мастери дыхания для Ульты!');
    
    const s = BREATH_SKILLS[G.breathType] || BREATH_SKILLS['Вода'];
    if (currentSt < s.c4) { log('Мало стамины!'); return; }
    
    currentSt -= s.c4;
    const breathBonus = 1 + (G.breathMastery * 0.05);
    const dmg = Math.round(getAtkDmg() * s.d4 * breathBonus);
    
    hitBoss(dmg);
    log(`${s.n4}! ${dmg} урона! (Бонус дыхания: x${breathBonus.toFixed(2)})`);
    updateBattleUI();
}

function gainXp(amt) {
    G.xp += amt;
    while (G.xp >= G.xpMax) {
        G.xp -= G.xpMax;
        G.lvl++;
        G.xpMax = Math.round(G.xpMax * 1.2);
        G.statPoints++;
        log(`Уровень повышен! +1 очко навыков.`);
    }
    updateMapUI();
}

setInterval(() => {
    if (G.isFighting) {
        currentSt = Math.min(getMaxSt(), currentSt + 2);
        updateBattleUI();
    }
}, 1000);

// Админ-панель (F4 или 5 кликов по заголовку)
document.addEventListener('keydown', (e) => {
    if (e.key === 'F4' || e.code === 'F4') {
        e.preventDefault();
        toggleAdminModal();
    }
});

let secretClicks = 0;
document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('manga-title')) {
        secretClicks++;
        if (secretClicks >= 5) {
            secretClicks = 0;
            toggleAdminModal();
        }
        setTimeout(() => { secretClicks = 0; }, 2000);
    }
});

function toggleAdminModal() {
    const modal = $('admin-modal');
    const pwdModal = $('password-modal');
    if (!modal || !pwdModal) return;

    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        // Показываем кастомное окно вместо prompt()
        pwdModal.style.display = 'flex';
        const input = $('admin-password-input');
        input.value = '';
        input.focus();

        // Обработка кнопки "Вход"
        $('btn-password-ok').onclick = () => {
            if (input.value === '6752') { // Здесь твой пароль
                pwdModal.style.display = 'none';
                modal.style.display = 'flex';
            } else {
                showAlert('Неверный пароль!');
                input.value = '';
                input.focus();
            }
        };

        // Обработка кнопки "Отмена"
        $('btn-password-cancel').onclick = () => {
            pwdModal.style.display = 'none';
        };

        // Поддержка нажатия Enter прямо в поле ввода
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                $('btn-password-ok').click();
            }
        };
    }
}
window.adminGive = function(t) {
    if (t === 'allItems') { for (let k in ITEMS) if (!G.inventory.includes(k)) G.inventory.push(k); }
    if (t === 'allClans') { for (let k in CLANS) if (!G.ownedClans.includes(k)) G.ownedClans.push(k); }
    if (t === 'spins') G.spins += 1000;
    if (t === 'coins') G.coins += 1000000;
    if (t === 'lvl') { G.lvl += 100; G.statPoints += 100; }
    saveGame();
    updateMapUI();
    updateInventoryUI();
    showAlert('Выдано успешно!');
};

window.adminReset = function() {
    showConfirm('Удалить весь прогресс игры?', () => {
        localStorage.removeItem('demonSlayerSave');
        location.reload();
    });
};
loadGame();
updateMapUI();