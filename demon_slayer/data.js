const BOSSES={tanjiro:{name:'Танджиро',icon:'🌊',hp:2000,xp:600,coins:300,dmg:20,dropKatana:'katana_water',dropOutfit:'outfit_water',dropHaori:'haori_water',skills:[{name:'Дыхание Воды: Водоворот',dmg:40,chance:0.3}]},zenitsu:{name:'Зеницу',icon:'⚡',hp:4000,xp:1500,coins:700,dmg:45,dropKatana:'katana_thunder',dropOutfit:'outfit_thunder',dropHaori:'haori_thunder',skills:[{name:'Дыхание Грома: Шестой стиль',dmg:120,chance:0.3}]},inosuke:{name:'Иноске',icon:'🐗',hp:5000,xp:2000,coins:900,dmg:50,dropKatana:'katana_beast',dropOutfit:'outfit_beast',dropHaori:'haori_beast',skills:[{name:'Звериное Дыхание: Клыки',dmg:80,chance:0.4}]},shinobu:{name:'Шинобу',icon:'🦋',hp:7000,xp:3500,coins:1500,dmg:65,dropKatana:'katana_insect',dropOutfit:'outfit_insect',dropHaori:'haori_insect',skills:[{name:'Дыхание Насекомого: Яд',dmg:90,chance:0.35}]},giyu:{name:'Гию',icon:'💧',hp:9000,xp:5000,coins:2500,dmg:80,dropKatana:'katana_water_strong',dropOutfit:'outfit_water_strong',dropHaori:'haori_water_strong',skills:[{name:'Дыхание Воды: Спокойствие',dmg:150,chance:0.4}]},muichiro:{name:'Муичиро',icon:'🌫️',hp:15000,xp:10000,coins:5000,dmg:110,dropKatana:'katana_mist',dropOutfit:'outfit_mist',dropHaori:'haori_mist',skills:[{name:'Дыхание Тумана: Рассеивание',dmg:250,chance:0.4}]},sanemi:{name:'Санеми',icon:'🌪️',hp:25000,xp:20000,coins:10000,dmg:150,dropKatana:'katana_wind',dropOutfit:'outfit_wind',dropHaori:'haori_wind',skills:[{name:'Дыхание Ветра: Ярость',dmg:400,chance:0.5}]},rengoku:{name:'Ренгоку',icon:'🔥',hp:30000,xp:50000,coins:20000,dmg:100,dropKatana:'katana_fire_god',dropOutfit:'outfit_flame_god',dropHaori:'haori_flame_god',skills:[{name:'Дыхание Огня: Первый стиль',dmg:300,chance:0.4},{name:'Дыхание Огня: Девятый стиль',dmg:600,chance:0.2}]},daki:{name:'Даки (Высшая Луна 6)',icon:'🩸',hp:50000,xp:80000,coins:30000,dmg:200,dropKatana:'katana_blood',dropOutfit:'outfit_blood',dropHaori:'haori_blood',skills:[{name:'Кровавые Оби',dmg:450,chance:0.5}]},gyutaro:{name:'Гютаро (Высшая Луна 6)',icon:'🕸️',hp:60000,xp:100000,coins:40000,dmg:250,dropKatana:'katana_poison',dropOutfit:'outfit_poison',dropHaori:'haori_poison',skills:[{name:'Кровавой Жнец',dmg:600,chance:0.4}]},akaza:{name:'Аказа (Высшая Луна 3)',icon:'❄️',hp:100000,xp:200000,coins:80000,dmg:400,dropKatana:'katana_fist',dropOutfit:'outfit_fist',dropHaori:'haori_fist',skills:[{name:'Разрушительный Удар',dmg:1000,chance:0.6}]},kokushibo:{name:'Кокушибо (Высшая Луна 1)',icon:'🌕',hp:250000,xp:500000,coins:200000,dmg:800,dropKatana:'katana_moon',dropOutfit:'outfit_moon',dropHaori:'haori_moon',skills:[{name:'Лунное Дыхание: Форма 16',dmg:2000,chance:0.7}]}};
const CLANS={
    // Common (Обычные)
    sakurai:{name:'Sakurai',dmg:10,hp:20,st:10,rarity:'common'},
    fujiwara:{name:'Fujiwara',dmg:12,hp:25,st:12,rarity:'common'},
    mori:{name:'Mori',dmg:14,hp:30,st:14,rarity:'common'},
    suzuki:{name:'Suzuki',dmg:16,hp:35,st:16,rarity:'common'},
    todoroki:{name:'Todoroki',dmg:18,hp:40,st:18,rarity:'common'},

    // Uncommon (Необычные)
    kaneki:{name:'Kaneki',dmg:25,hp:60,st:25,rarity:'uncommon'},
    nakahara:{name:'Nakahara',dmg:30,hp:75,st:30,rarity:'uncommon'},
    takada:{name:'Takada',dmg:35,hp:90,st:35,rarity:'uncommon'},

    // Rare (Редкие)
    haganezuka:{name:'Haganezuka',dmg:50,hp:130,st:50,rarity:'rare'},
    ubuyashiki:{name:'Ubuyashiki',dmg:70,hp:200,st:80,rarity:'rare'},

    // Legendary (Легендарные)
    kocho:{name:'Kocho',dmg:100,hp:350,st:150,rarity:'legendary'},
    shinazugawa:{name:'Shinazugawa',dmg:130,hp:450,st:200,rarity:'legendary'},
    sabito:{name:'Sabito',dmg:150,hp:550,st:250,rarity:'legendary'},
    tamayo:{name:'Tamayo',dmg:180,hp:650,st:300,rarity:'legendary'},

    // Mythic (Мифические)
    tomioka:{name:'Tomioka',dmg:220,hp:900,st:400,rarity:'mythic'},
    tokito:{name:'Tokito',dmg:260,hp:1100,st:450,rarity:'mythic'},
    hashibira:{name:'Hashibira',dmg:300,hp:1300,st:500,rarity:'mythic'},

    // Supreme (Высшие)
    agatsuma:{name:'Agatsuma',dmg:400,hp:1800,st:700,rarity:'supreme'},
    kamado:{name:'Kamado',dmg:450,hp:2500,st:800,rarity:'supreme'},
    rengoku:{name:'Rengoku',dmg:500,hp:2200,st:900,rarity:'supreme'},
    uzui:{name:'Uzui',dmg:480,hp:2000,st:850,rarity:'supreme'},

    // Admin (Админский)
    tsugikuni:{name:'Tsugikuni',dmg:1000,hp:5000,st:2000,rarity:'admin'}
};
const ITEMS={katana_water:{type:'katana',name:'Катана Воды 💧',dmg:12},katana_thunder:{type:'katana',name:'Катана Грома ⚡',dmg:20},katana_beast:{type:'katana',name:'Клинки Зверя 🐗',dmg:25},katana_insect:{type:'katana',name:'Катана Насекомого 🦋',dmg:30},katana_water_strong:{type:'katana',name:'Катана Гию 💧',dmg:50},katana_mist:{type:'katana',name:'Катана Тумана 🌫️',dmg:70},katana_wind:{type:'katana',name:'Катана Ветра 🌪️',dmg:90},outfit_water:{type:'outfit',name:'Аутфит Танджиро',hp:50},outfit_thunder:{type:'outfit',name:'Аутфит Зеницу',hp:60},outfit_beast:{type:'outfit',name:'Аутфит Иноске',hp:80},outfit_insect:{type:'outfit',name:'Аутфит Шинобу',hp:100},outfit_water_strong:{type:'outfit',name:'Аутфит Гию',hp:150},outfit_mist:{type:'outfit',name:'Аутфит Муичиро',hp:200},outfit_wind:{type:'outfit',name:'Аутфит Санеми',hp:300},haori_water:{type:'haori',name:'Хаори Танджиро',st:20},haori_thunder:{type:'haori',name:'Хаори Зеницу',st:25},haori_beast:{type:'haori',name:'Хаори Иноске',st:30},haori_insect:{type:'haori',name:'Хаори Шинобу',st:40},haori_water_strong:{type:'haori',name:'Хаори Гию',st:50},haori_mist:{type:'haori',name:'Хаори Муичиро',st:60},haori_wind:{type:'haori',name:'Хаори Санеми',st:80},katana_fire_god:{type:'katana',name:'🔥 Клинок Ренгоку 🔥',dmg:200},outfit_flame_god:{type:'outfit',name:'Плащ Ренгоку',hp:800},haori_flame_god:{type:'haori',name:'Хаори Ренгоку',st:250},katana_blood:{type:'katana',name:'Кровавая Катана',dmg:300},outfit_blood:{type:'outfit',name:'Кимоно Даки',hp:1000},haori_blood:{type:'haori',name:'Оби Даки',st:400},katana_poison:{type:'katana',name:'Клинок Яда',dmg:400},outfit_poison:{type:'outfit',name:'Кимоно Гютаро',hp:1500},haori_poison:{type:'haori',name:'Оби Гютаро',st:500},katana_fist:{type:'katana',name:'Кулаки Аказы',dmg:600},outfit_fist:{type:'outfit',name:'Аутфит Аказы',hp:2000},haori_fist:{type:'haori',name:'Хаори Аказы',st:600},katana_moon:{type:'katana',name:'Лунный Клинок',dmg:1500},outfit_moon:{type:'outfit',name:'Аутфит Кокушибо',hp:5000},haori_moon:{type:'haori',name:'Хаори Кокушибо',st:1500}};
const QUESTS={1:{name:'Фермер',icon:'👨‍🌾',reqLvl:1,reqQuests:0,xp:100,coins:100},2:{name:'Медсестра',icon:'👩‍⚕️',reqLvl:3,reqQuests:1,xp:300,coins:300},3:{name:'Повар',icon:'👨‍🍳',reqLvl:6,reqQuests:2,xp:700,coins:700},4:{name:'Учитель',icon:'👩‍🏫',reqLvl:10,reqQuests:3,xp:1500,coins:1500},5:{name:'Строитель',icon:'👷‍♂️',reqLvl:15,reqQuests:4,xp:3000,coins:3000},6:{name:'Художник',icon:'🧑‍🎨',reqLvl:22,reqQuests:5,xp:6000,coins:6000},7:{name:'Бизнесмен',icon:'👨‍💼',reqLvl:30,reqQuests:6,xp:12000,coins:12000},8:{name:'Космонавт',icon:'👩‍🚀',reqLvl:40,reqQuests:7,xp:25000,coins:25000}};
const BOSS_REQS={"node-boss-tanjiro":1,"node-boss-zenitsu":5,"node-boss-inosuke":8,"node-boss-shinobu":12,"node-boss-giyu":20,"node-boss-muichiro":30,"node-boss-sanemi":45,"node-boss-rengoku":15,"node-boss-daki":50,"node-boss-gyutaro":60,"node-boss-akaza":80,"node-boss-kokushibo":100};

const TRAINERS = {
    water: { name: 'Тренер Воды', icon: '💧', reqLvl: 25 },
    thunder: { name: 'Тренер Грома', icon: '⚡', reqLvl: 25 },
    flame: { name: 'Тренер Огня', icon: '🔥', reqLvl: 25 },
    insect: { name: 'Тренер Насекомого', icon: '🦋', reqLvl: 25 },
    wind: { name: 'Тренер Ветра', icon: '🌪️', reqLvl: 25 }
};