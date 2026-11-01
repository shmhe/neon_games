const arena = document.getElementById('arena');
const playerEl = document.getElementById('player');
let W = arena.clientWidth;
let H = arena.clientHeight;

// Стейт игрока
let player = {
    x: W / 2, y: H / 2,
    hp: 100, maxHp: 100,
    chakra: 50, maxChakra: 50,
    lvl: 1,
    speed: 5
};

let enemies = [];
let kunais = [];
let keys = {};

// Адаптация под размер окна
window.addEventListener('resize', () => {
    W = arena.clientWidth;
    H = arena.clientHeight;
});

// Управление WASD / Стрелочки
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function updateUI() {
    document.getElementById('hp').textContent = Math.floor(player.hp);
    document.getElementById('max-hp').textContent = player.maxHp;
    document.getElementById('chakra').textContent = Math.floor(player.chakra);
    document.getElementById('max-chakra').textContent = player.maxChakra;
    document.getElementById('lvl').textContent = player.lvl;
}

function spawnEnemy() {
    const x = Math.random() * (W - 100) + 50;
    const y = Math.random() * (H - 100) + 50;
    const el = document.createElement('div');
    el.className = 'enemy';
    el.textContent = Math.random() > 0.5 ? '👹' : '💀';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    arena.appendChild(el);
    
    enemies.push({
        el, x, y,
        hp: 30 + player.lvl * 10,
        dmg: 5 + player.lvl * 2,
        speed: 1.5 + Math.random()
    });
}

function createExplosion(x, y) {
    const eff = document.createElement('div');
    eff.className = 'effect';
    eff.textContent = '💥';
    eff.style.left = x + 'px';
    eff.style.top = y + 'px';
    arena.appendChild(eff);
    setTimeout(() => eff.remove(), 300);
}

// Игровой цикл
function gameLoop() {
    if (player.hp <= 0) return; // Смерть

    // 1. Движение игрока
    let dx = 0, dy = 0;
    if (keys['w'] || keys['arrowup'] || keys['ц']) dy -= player.speed;
    if (keys['s'] || keys['arrowdown'] || keys['ы']) dy += player.speed;
    if (keys['a'] || keys['arrowleft'] || keys['ф']) dx -= player.speed;
    if (keys['d'] || keys['arrowright'] || keys['в']) dx += player.speed;

    player.x = Math.max(20, Math.min(W - 20, player.x + dx));
    player.y = Math.max(20, Math.min(H - 20, player.y + dy));
    
    playerEl.style.left = player.x + 'px';
    playerEl.style.top = player.y + 'px';

    // 2. Логика врагов (преследование)
    enemies.forEach((enemy, index) => {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.speed;
        enemy.y += Math.sin(angle) * enemy.speed;
        
        enemy.el.style.left = enemy.x + 'px';
        enemy.el.style.top = enemy.y + 'px';

        // Урон при касании
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist < 40) {
            player.hp -= enemy.dmg;
            updateUI();
            // Откидываем игрока
            player.x -= Math.cos(angle) * 30;
            player.y -= Math.sin(angle) * 30;
            createExplosion(player.x, player.y);
        }
    });

    // 3. Логика кунаев
    kunais.forEach((k, kIndex) => {
        k.x += k.vx;
        k.y += k.vy;
        k.el.style.left = k.x + 'px';
        k.el.style.top = k.y + 'px';

        if (k.x < 0 || k.x > W || k.y < 0 || k.y > H) {
            k.el.remove();
            kunais.splice(kIndex, 1);
            return;
        }

        // Попадание в врага
        enemies.forEach((enemy, eIndex) => {
            const dist = Math.hypot(k.x - enemy.x, k.y - enemy.y);
            if (dist < 30) {
                enemy.hp -= 20;
                createExplosion(enemy.x, enemy.y);
                k.el.remove();
                kunais.splice(kIndex, 1);
                
                if (enemy.hp <= 0) {
                    enemy.el.remove();
                    enemies.splice(eIndex, 1);
                    // Награда
                    player.lvl++;
                    player.maxHp += 10;
                    player.hp = Math.min(player.hp + 20, player.maxHp);
                    updateUI();
                    setTimeout(spawnEnemy, 1000);
                }
            }
        });
    });

    // Восстановление чакры
    if (player.chakra < player.maxChakra) {
        player.chakra += 0.05; // Медленный реген
        updateUI();
    }

    requestAnimationFrame(gameLoop);
}

// Дзюцу
document.getElementById('btn-kunai').onclick = () => {
    if (player.chakra < 10) return;
    player.chakra -= 10;
    
    // Стреляем в сторону ближайшего врага
    if (enemies.length > 0) {
        let nearest = enemies[0];
        let minDist = Infinity;
        enemies.forEach(e => {
            const d = Math.hypot(e.x - player.x, e.y - player.y);
            if (d < minDist) { minDist = d; nearest = e; }
        });

        const angle = Math.atan2(nearest.y - player.y, nearest.x - player.x);
        const el = document.createElement('div');
        el.className = 'kunai';
        el.textContent = '🗡️';
        el.style.left = player.x + 'px';
        el.style.top = player.y + 'px';
        arena.appendChild(el);

        kunais.push({
            el, x: player.x, y: player.y,
            vx: Math.cos(angle) * 12,
            vy: Math.sin(angle) * 12
        });
    }
    updateUI();
};

document.getElementById('btn-rasengan').onclick = () => {
    if (player.chakra < 30) return;
    player.chakra -= 30;
    
    // Взрыв вокруг игрока (убивает всех рядом)
    createExplosion(player.x, player.y);
    enemies.forEach((enemy, index) => {
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist < 150) {
            enemy.hp -= 100;
            if (enemy.hp <= 0) {
                enemy.el.remove();
                enemies.splice(index, 1);
                player.lvl++;
                player.maxHp += 10;
                player.hp = Math.min(player.hp + 20, player.maxHp);
                setTimeout(spawnEnemy, 1000);
            }
        }
    });
    updateUI();
};

// Старт
spawnEnemy();
spawnEnemy();
updateUI();
gameLoop();