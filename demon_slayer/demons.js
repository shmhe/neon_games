let activeDemons = [], demonTimeouts = {}, demonIdCounter = 0;
const DEMON_TYPES = {
    easy: { name: 'Слабый Демон', icon: '👹', hpM: 0.5, dmgM: 0.5, xpM: 0.5, color: '#8c2d19' },
    hard: { name: 'Свирепый Демон', icon: '👺', hpM: 1.5, dmgM: 1.5, xpM: 2, color: '#a63a2b' },
    impossible: { name: 'Высшая Луна', icon: '🌙', hpM: 4, dmgM: 3, xpM: 5, color: '#512b52' }
};

function spawnDemon() {
    if (G.isFighting || !$('screen-map').classList.contains('active') || activeDemons.length >= 3) return;
    const roll = Math.random(); let type = 'easy';
    if (roll > 0.9) type = 'impossible'; else if (roll > 0.6) type = 'hard';
    
    const d = DEMON_TYPES[type], id = demonIdCounter++;
    const nd = {
        id, type, name: d.name, icon: d.icon, color: d.color,
        hp: Math.floor((300 + G.lvl * 100) * d.hpM), maxHp: Math.floor((300 + G.lvl * 100) * d.hpM),
        dmg: Math.floor((10 + G.lvl * 3) * d.dmgM),
        xp: Math.floor(100 * d.xpM * (1 + G.lvl * 0.2)),
        coins: Math.floor(50 * d.xpM * (1 + G.lvl * 0.1)),
        top: 15 + Math.random() * 70, left: 15 + Math.random() * 70
    };
    activeDemons.push(nd);
    
    const el = document.createElement('div');
    el.id = 'demon-' + id; el.className = 'map-node';
    el.style.cssText = `top:${nd.top}%;left:${nd.left}%;border-color:${nd.color};box-shadow:0 0 15px ${nd.color};font-size:2rem;animation:pulse 1s infinite alternate;`;
    el.innerHTML = nd.icon;
    el.onclick = () => moveTo('demon-' + id, () => startDemonFight(id));
    $('map-container').appendChild(el);
    
    demonTimeouts[id] = setTimeout(() => { removeDemon(id); log('Демон скрылся...'); }, 20000);
}

function removeDemon(id) {
    const el = $('demon-' + id); if (el) el.remove();
    activeDemons = activeDemons.filter(d => d.id !== id);
    clearTimeout(demonTimeouts[id]); delete demonTimeouts[id];
}

function startDemonFight(id) {
    const d = activeDemons.find(x => x.id === id); if (!d) return;
    showScreen('screen-battle'); G.isFighting = true; currentHp = getMaxHp(); currentSt = getMaxSt();
    G.activeBoss = { name: d.name, icon: d.icon, hp: d.hp, maxHp: d.maxHp, dmg: d.dmg, xp: d.xp, coins: d.coins, skills: [{ name: 'Темный удар', dmg: Math.floor(d.dmg * 1.5), chance: 0.2 }], isDemon: true };
    
    $('btn-continue').style.display = 'none';
    $('boss-name-display').textContent = d.name; $('boss-name-display').style.color = d.color;
    $('boss-sprite').textContent = d.icon;
    updateBattleUI();
    $('battle-log').innerHTML = `<div style="color:${d.color};font-weight:bold;">На вас напал ${d.name}!</div>`;
    document.querySelector('.action-bar').style.opacity = '1'; document.querySelector('.action-bar').style.pointerEvents = 'auto';
    blockActive = false; blockCooldown = false; $('btn-block').classList.remove('disabled');
    clearInterval(G.bossTimer); G.bossTimer = setInterval(bossLoop, 100);
    updateSkillButtons();
    removeDemon(id);
}

// Перехват победы над демонами
const originalWinBoss = winBoss;
winBoss = function() {
    if (G.activeBoss && G.activeBoss.isDemon) {
        G.isFighting = false; clearInterval(G.bossTimer);
        log(`Странствующий демон повержен!`);
        G.coins += G.activeBoss.coins; G.spins += 1;
        let dr = [];
        const roll = Math.random(); let nc = null; const ck = Object.keys(CLANS);
        if(roll < 0.001) nc='tsugikuni';
        else if(roll < 0.011) nc=ck.filter(k=>CLANS[k].rarity==='supreme')[Math.floor(Math.random()*ck.filter(k=>CLANS[k].rarity==='supreme').length)];
        else if(roll < 0.021) nc=ck.filter(k=>CLANS[k].rarity==='mythic')[Math.floor(Math.random()*ck.filter(k=>CLANS[k].rarity==='mythic').length)];
        else if(roll < 0.061) nc=ck.filter(k=>CLANS[k].rarity==='legendary')[Math.floor(Math.random()*ck.filter(k=>CLANS[k].rarity==='legendary').length)];
        else if(roll < 0.181) nc=ck.filter(k=>CLANS[k].rarity==='rare')[Math.floor(Math.random()*ck.filter(k=>CLANS[k].rarity==='rare').length)];
        else if(roll < 0.411) nc=ck.filter(k=>CLANS[k].rarity==='uncommon')[Math.floor(Math.random()*ck.filter(k=>CLANS[k].rarity==='uncommon').length)];
        else nc=ck.filter(k=>CLANS[k].rarity==='common')[Math.floor(Math.random()*ck.filter(k=>CLANS[k].rarity==='common').length)];
        
        if(nc && !G.ownedClans.includes(nc)) { G.ownedClans.push(nc); dr.push(`🎉 НОВЫЙ КЛАН: ${CLANS[nc].name}`); } 
        else if(nc) { G.coins += 500; dr.push('Повтор (компенсация 500 монет)'); }

        gainXp(G.activeBoss.xp);
        log(`=== ПОБЕДА ===`); log(`+${G.activeBoss.xp} опыта`); log(`+${G.activeBoss.coins} монет`); log(`+1 спин 🎟️`);
        dr.forEach(d => log(d));
        $('btn-continue').style.display = 'block';
        document.querySelector('.action-bar').style.opacity = '0.3'; document.querySelector('.action-bar').style.pointerEvents = 'none';
        saveGame();
    } else { originalWinBoss(); }
};

setInterval(() => { if (Math.random() < 0.3) spawnDemon(); }, 3000);