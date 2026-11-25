(() => {
  const canvas = document.getElementById('screen');
  const ctx = canvas.getContext('2d');
  const faceCanvas = document.getElementById('face-canvas');
  const faceCtx = faceCanvas.getContext('2d');

  const W = canvas.width;
  const H = canvas.height;
  const TEX_SIZE = 64;

  // --- SISTEMA DE AUDIO SINTETIZADO (WEB AUDIO API) ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.bgmTimer = null;
      this.step = 0;
    }

    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      if (!this.enabled) this.stopMusic();
      else if (gameState === 'PLAYING') this.startMusic();
      return this.enabled;
    }

    playTone(freq, type, duration, vol = 0.2, slideTo = null) {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    }

    playNoise(duration, vol = 0.35, filterFreq = 900) {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    }

    playShoot(weapon) {
      if (weapon === 1) {
        this.playTone(95, 'sawtooth', 0.16, 0.28, 45);
      } else if (weapon === 2) {
        this.playNoise(0.18, 0.35, 1600);
        this.playTone(220, 'square', 0.12, 0.25, 55);
      } else if (weapon === 3) {
        this.playNoise(0.38, 0.55, 1100);
        this.playTone(140, 'sawtooth', 0.28, 0.4, 35);
      }
    }

    playPickup() {
      this.playTone(520, 'sine', 0.08, 0.18, 780);
      setTimeout(() => this.playTone(780, 'sine', 0.12, 0.18, 1040), 70);
    }

    playDoor() {
      this.playTone(110, 'sawtooth', 0.45, 0.2, 65);
    }

    playHurt() {
      this.playTone(150, 'sawtooth', 0.25, 0.35, 50);
    }

    playEnemyHit() {
      this.playTone(190, 'square', 0.14, 0.22, 80);
    }

    playEnemyDie() {
      this.playTone(160, 'sawtooth', 0.4, 0.3, 32);
    }

    startMusic() {
      this.stopMusic();
      if (!this.enabled) return;
      // Riff synth-metal inspirado en E1M1
      const riff = [82.41, 82.41, 164.81, 82.41, 82.41, 146.83, 82.41, 82.41, 130.81, 82.41, 82.41, 123.47, 82.41, 82.41, 130.81, 138.59];
      this.bgmTimer = setInterval(() => {
        if (!this.enabled || gameState !== 'PLAYING') return;
        const freq = riff[this.step % riff.length];
        this.playTone(freq, 'sawtooth', 0.14, 0.07);
        this.step++;
      }, 155);
    }

    stopMusic() {
      if (this.bgmTimer) {
        clearInterval(this.bgmTimer);
        this.bgmTimer = null;
      }
    }
  }

  const audio = new SoundEngine();

  // --- GENERADOR DE TEXTURAS PROCEDURALES (64x64) ---
  const textures = {};
  function createTexture(id, drawFn) {
    const c = document.createElement('canvas');
    c.width = TEX_SIZE;
    c.height = TEX_SIZE;
    const g = c.getContext('2d');
    drawFn(g);
    textures[id] = g.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
  }

  // 1: Ladrillo infernal rojo
  createTexture(1, (g) => {
    g.fillStyle = '#4a1212';
    g.fillRect(0, 0, 64, 64);
    for (let y = 0; y < 64; y += 16) {
      const offset = (y / 16) % 2 === 0 ? 0 : 16;
      for (let x = -16; x < 64; x += 32) {
        g.fillStyle = (x + y) % 32 === 0 ? '#7f1d1d' : '#681616';
        g.fillRect(x + offset + 1, y + 1, 30, 14);
        g.fillStyle = '#991b1b';
        g.fillRect(x + offset + 2, y + 2, 28, 2);
      }
    }
  });

  // 2: Panel metálico UAC gris
  createTexture(2, (g) => {
    g.fillStyle = '#3f3f46';
    g.fillRect(0, 0, 64, 64);
    g.strokeStyle = '#18181b';
    g.lineWidth = 2;
    g.strokeRect(2, 2, 60, 60);
    g.strokeRect(10, 10, 44, 44);
    g.fillStyle = '#71717a';
    [[6, 6], [54, 6], [6, 54], [54, 54]].forEach(([rx, ry]) => g.fillRect(rx, ry, 4, 4));
    g.fillStyle = '#92400e';
    g.fillRect(14, 46, 36, 6);
  });

  // 3: Muro tecnológico verde/azulado
  createTexture(3, (g) => {
    g.fillStyle = '#1e293b';
    g.fillRect(0, 0, 64, 64);
    g.fillStyle = '#0f172a';
    g.fillRect(6, 6, 52, 52);
    g.fillStyle = '#22c55e';
    g.fillRect(12, 14, 16, 4);
    g.fillStyle = '#ef4444';
    g.fillRect(36, 14, 8, 4);
    g.fillStyle = '#38bdf8';
    g.fillRect(12, 26, 40, 2);
    g.fillRect(12, 34, 28, 2);
    g.fillStyle = '#475569';
    g.fillRect(12, 44, 40, 10);
  });

  // 4: Puerta corrediza estándar
  createTexture(4, (g) => {
    g.fillStyle = '#52525b';
    g.fillRect(0, 0, 64, 64);
    g.fillStyle = '#27272a';
    g.fillRect(30, 0, 4, 64);
    // Franjas de precaución
    g.fillStyle = '#eab308';
    g.fillRect(4, 4, 56, 8);
    g.fillRect(4, 52, 56, 8);
    g.fillStyle = '#18181b';
    for (let i = 4; i < 56; i += 12) {
      g.fillRect(i, 4, 6, 8);
      g.fillRect(i, 52, 6, 8);
    }
  });

  // 5: Puerta cerrada con llave amarilla
  createTexture(5, (g) => {
    g.putImageData(textures[4], 0, 0);
    g.fillStyle = '#facc15';
    g.fillRect(0, 0, 6, 64);
    g.fillRect(58, 0, 6, 64);
    g.fillRect(24, 24, 16, 16);
  });

  // 6: Puerta cerrada con llave roja
  createTexture(6, (g) => {
    g.putImageData(textures[4], 0, 0);
    g.fillStyle = '#ef4444';
    g.fillRect(0, 0, 6, 64);
    g.fillRect(58, 0, 6, 64);
    g.fillRect(24, 24, 16, 16);
  });

  // 9: Interruptor de salida de nivel
  createTexture(9, (g) => {
    g.putImageData(textures[2], 0, 0);
    g.fillStyle = '#09090b';
    g.fillRect(18, 16, 28, 32);
    g.fillStyle = '#dc2626';
    g.fillRect(24, 22, 16, 12);
    g.fillStyle = '#facc15';
    g.font = 'bold 9px monospace';
    g.fillText('SALIDA', 16, 13);
  });

  // --- GENERADOR DE SPRITES PROCEDURALES (64x64) ---
  const sprites = {};
  function createSprite(name, drawFn) {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const g = c.getContext('2d');
    drawFn(g);
    sprites[name] = c;
  }

  // Soldado Poseído
  createSprite('trooper', (g) => {
    g.fillStyle = '#3f6212'; // Armadura verde oscuro
    g.fillRect(20, 22, 24, 24);
    g.fillStyle = '#fca5a5'; // Cabeza
    g.fillRect(25, 10, 14, 12);
    g.fillStyle = '#ef4444'; // Ojos rojos
    g.fillRect(27, 14, 3, 2);
    g.fillRect(34, 14, 3, 2);
    g.fillStyle = '#18181b'; // Rifle y botas
    g.fillRect(16, 30, 32, 5);
    g.fillRect(22, 46, 7, 16);
    g.fillRect(35, 46, 7, 16);
  });

  // Diablillo Infernal (Imp)
  createSprite('imp', (g) => {
    g.fillStyle = '#78350f'; // Cuerpo marrón
    g.fillRect(20, 18, 24, 28);
    g.fillRect(24, 8, 16, 12);
    g.fillStyle = '#f5f5f4'; // Púas blancas
    g.fillRect(17, 18, 4, 4);
    g.fillRect(43, 18, 4, 4);
    g.fillRect(22, 6, 3, 4);
    g.fillRect(39, 6, 3, 4);
    g.fillStyle = '#ef4444'; // Ojos y bola de fuego
    g.fillRect(27, 12, 3, 2);
    g.fillRect(34, 12, 3, 2);
    g.fillStyle = '#f97316';
    g.beginPath();
    g.arc(15, 32, 5, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#78350f';
    g.fillRect(22, 46, 7, 16);
    g.fillRect(35, 46, 7, 16);
  });

  // Barón del Infierno (Jefe)
  createSprite('baron', (g) => {
    g.fillStyle = '#be185d'; // Torso rosado musculoso
    g.fillRect(14, 14, 36, 30);
    g.fillRect(22, 4, 20, 12);
    g.fillStyle = '#fef08a'; // Cuernos
    g.fillRect(18, 2, 4, 8);
    g.fillRect(42, 2, 4, 8);
    g.fillStyle = '#22c55e'; // Ojos y garras de plasma verde
    g.fillRect(26, 8, 3, 3);
    g.fillRect(35, 8, 3, 3);
    g.beginPath();
    g.arc(11, 28, 6, 0, Math.PI * 2);
    g.arc(53, 28, 6, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#451a03'; // Patas de cabra
    g.fillRect(18, 44, 10, 18);
    g.fillRect(36, 44, 10, 18);
  });

  // Enemigo abatido
  createSprite('dead', (g) => {
    g.fillStyle = '#7f1d1d';
    g.fillRect(12, 50, 40, 10);
    g.fillStyle = '#dc2626';
    g.fillRect(18, 47, 28, 6);
  });

  // Objetos recogibles
  createSprite('medkit', (g) => {
    g.fillStyle = '#f4f4f5';
    g.fillRect(20, 36, 24, 20);
    g.fillStyle = '#dc2626';
    g.fillRect(30, 40, 4, 12);
    g.fillRect(26, 44, 12, 4);
  });

  createSprite('armor', (g) => {
    g.fillStyle = '#16a34a';
    g.fillRect(18, 34, 28, 22);
    g.fillStyle = '#4ade80';
    g.fillRect(22, 38, 20, 6);
  });

  createSprite('ammo', (g) => {
    g.fillStyle = '#ca8a04';
    g.fillRect(22, 40, 20, 16);
    g.fillStyle = '#fef08a';
    g.fillRect(25, 36, 3, 6);
    g.fillRect(31, 36, 3, 6);
    g.fillRect(37, 36, 3, 6);
  });

  createSprite('shotgun_item', (g) => {
    g.fillStyle = '#78350f';
    g.fillRect(12, 46, 16, 6);
    g.fillStyle = '#52525b';
    g.fillRect(26, 45, 26, 4);
  });

  createSprite('key_yellow', (g) => {
    g.fillStyle = '#facc15';
    g.fillRect(24, 34, 16, 22);
    g.fillStyle = '#000';
    g.fillRect(28, 38, 8, 5);
  });

  createSprite('key_red', (g) => {
    g.fillStyle = '#ef4444';
    g.fillRect(24, 34, 16, 22);
    g.fillStyle = '#000';
    g.fillRect(28, 38, 8, 5);
  });

  createSprite('fireball', (g) => {
    g.fillStyle = '#ef4444';
    g.beginPath();
    g.arc(32, 32, 12, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#facc15';
    g.beginPath();
    g.arc(32, 32, 6, 0, Math.PI * 2);
    g.fill();
  });

  // --- DEFINICIÓN DE NIVELES ---
  const LEVELS = [
    {
      name: 'NIVEL 1: HANGAR UAC',
      playerStart: { x: 2.5, y: 2.5, angle: 0 },
      map: [
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
        [2,0,0,0,0,2,0,0,0,0,0,2,0,0,0,2],
        [2,0,0,0,0,4,0,0,0,0,0,5,0,0,0,2],
        [2,0,0,0,0,2,0,0,0,0,0,2,0,0,9,2],
        [2,2,4,2,2,2,0,0,3,3,0,2,2,2,2,2],
        [2,0,0,0,0,0,0,0,3,3,0,0,0,0,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,0,1,1,4,1,1,0,0,1,4,1,0,0,2],
        [2,0,0,1,0,0,0,1,0,0,1,0,1,0,0,2],
        [2,0,0,1,0,0,0,1,0,0,1,0,1,0,0,2],
        [2,0,0,1,1,1,1,1,0,0,1,1,1,0,0,2],
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
      ],
      entities: [
        { type: 'trooper', x: 7.5, y: 2.5 },
        { type: 'trooper', x: 8.5, y: 6.5 },
        { type: 'imp', x: 5.5, y: 8.5 },
        { type: 'imp', x: 13.5, y: 2.5 },
        { type: 'shotgun_item', x: 3.5, y: 5.5 },
        { type: 'ammo', x: 4.5, y: 8.5 },
        { type: 'medkit', x: 6.5, y: 8.5 },
        { type: 'armor', x: 11.5, y: 8.5 },
        { type: 'key_yellow', x: 11.5, y: 9.5 }
      ]
    },
    {
      name: 'NIVEL 2: PLANTA NUCLEAR',
      playerStart: { x: 1.5, y: 1.5, angle: 0 },
      map: [
        [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
        [3,0,0,0,3,0,0,0,0,0,3,0,0,0,0,3],
        [3,0,0,0,4,0,0,0,0,0,4,0,0,0,0,3],
        [3,0,0,0,3,0,0,3,3,0,3,0,0,0,0,3],
        [3,3,4,3,3,0,0,3,3,0,3,3,5,3,3,3],
        [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
        [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
        [3,3,6,3,3,1,1,1,1,1,0,0,1,1,1,3],
        [3,0,0,0,3,1,0,0,0,1,0,0,1,0,0,3],
        [3,0,9,0,3,1,0,0,0,4,0,0,4,0,0,3],
        [3,0,0,0,3,1,0,0,0,1,0,0,1,0,0,3],
        [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
      ],
      entities: [
        { type: 'trooper', x: 6.5, y: 2.5 },
        { type: 'imp', x: 8.5, y: 5.5 },
        { type: 'imp', x: 13.5, y: 2.5 },
        { type: 'imp', x: 7.5, y: 9.5 },
        { type: 'baron', x: 2.5, y: 8.5 },
        { type: 'key_yellow', x: 14.5, y: 9.5 },
        { type: 'key_red', x: 7.5, y: 8.5 },
        { type: 'medkit', x: 12.5, y: 2.5 },
        { type: 'ammo', x: 5.5, y: 6.5 },
        { type: 'armor', x: 1.5, y: 5.5 }
      ]
    },
    {
      name: 'NIVEL 3: CIUDADELA DEL INFIERNO',
      playerStart: { x: 8.0, y: 10.5, angle: -Math.PI / 2 },
      map: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,9,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,0,0,0,0,0,0,0,1,1,0,1],
        [1,0,1,1,0,0,0,0,0,0,0,0,1,1,0,1],
        [1,0,0,0,0,0,1,6,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1],
        [1,1,4,1,1,0,0,0,0,0,0,1,1,4,1,1],
        [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,1,1,4,1,1,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      entities: [
        { type: 'imp', x: 4.5, y: 5.5 },
        { type: 'imp', x: 11.5, y: 5.5 },
        { type: 'trooper', x: 2.5, y: 8.0 },
        { type: 'trooper', x: 13.5, y: 8.0 },
        { type: 'baron', x: 7.5, y: 2.5 },
        { type: 'baron', x: 8.5, y: 2.5 },
        { type: 'key_red', x: 2.5, y: 7.5 },
        { type: 'medkit', x: 13.5, y: 7.5 },
        { type: 'medkit', x: 7.5, y: 7.5 },
        { type: 'ammo', x: 8.5, y: 7.5 },
        { type: 'armor', x: 6.5, y: 10.5 }
      ]
    }
  ];

  // --- ESTADO GLOBAL DEL JUEGO ---
  let gameState = 'MENU';
  let currentLevelIdx = 0;
  let worldMap = [];
  let doors = {};
  let entities = [];
  let projectiles = [];
  let showMinimap = false;
  let totalEnemies = 0;
  let kills = 0;

  const player = {
    x: 2.5,
    y: 2.5,
    angle: 0,
    health: 100,
    armor: 0,
    ammo: 50,
    weapon: 2, // 1: Sierra, 2: Pistola, 3: Escopeta
    ownedWeapons: { 1: true, 2: true, 3: false },
    keys: { yellow: false, red: false },
    bobPhase: 0,
    shootTimer: 0,
    faceLook: 0,
    facePainTimer: 0
  };

  const keysPressed = {};

  // --- INICIALIZACIÓN DE NIVEL ---
  function loadLevel(idx, keepStats = false) {
    currentLevelIdx = idx;
    const lvl = LEVELS[idx];
    worldMap = lvl.map.map((row) => [...row]);
    doors = {};
    projectiles = [];

    for (let y = 0; y < worldMap.length; y++) {
      for (let x = 0; x < worldMap[y].length; x++) {
        const cell = worldMap[y][x];
        if (cell === 4 || cell === 5 || cell === 6) {
          doors[`${x},${y}`] = { open: 0, opening: false, timer: 0, lock: cell };
        }
      }
    }

    player.x = lvl.playerStart.x;
    player.y = lvl.playerStart.y;
    player.angle = lvl.playerStart.angle;
    player.keys = { yellow: false, red: false };
    player.shootTimer = 0;

    if (!keepStats) {
      player.health = 100;
      player.armor = 0;
      player.ammo = 50;
      player.weapon = 2;
      player.ownedWeapons = { 1: true, 2: true, 3: false };
    }

    totalEnemies = 0;
    kills = 0;
    entities = lvl.entities.map((e) => {
      const isEnemy = ['trooper', 'imp', 'baron'].includes(e.type);
      if (isEnemy) totalEnemies++;
      const hpMap = { trooper: 30, imp: 55, baron: 180 };
      return {
        ...e,
        isEnemy,
        hp: hpMap[e.type] || 0,
        alive: true,
        cooldown: Math.random() * 1.5,
        hitFlash: 0
      };
    });

    showMessage(lvl.name);
    updateHUD();
  }

  let msgTimeout = null;
  function showMessage(text) {
    const el = document.getElementById('hud-msg');
    el.textContent = text;
    clearTimeout(msgTimeout);
    msgTimeout = setTimeout(() => (el.textContent = ''), 3000);
  }

  function triggerFlash(id) {
    const el = document.getElementById(id);
    el.style.opacity = '1';
    setTimeout(() => (el.style.opacity = '0'), 110);
  }

  // --- CONTROLES Y EVENTOS ---
  window.addEventListener('keydown', (e) => {
    keysPressed[e.code] = true;
    if (gameState !== 'PLAYING') return;

    if (e.code === 'Digit1') switchWeapon(1);
    if (e.code === 'Digit2') switchWeapon(2);
    if (e.code === 'Digit3') switchWeapon(3);
    if (e.code === 'Space') fireWeapon();
    if (e.code === 'KeyF' || e.code === 'KeyE') interactDoor();
    if (e.code === 'Tab' || e.code === 'KeyM') {
      e.preventDefault();
      showMinimap = !showMinimap;
    }
  });

  window.addEventListener('keyup', (e) => {
    keysPressed[e.code] = false;
  });

  canvas.addEventListener('click', () => {
    if (gameState === 'PLAYING') {
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock?.();
      }
      fireWeapon();
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (gameState === 'PLAYING' && document.pointerLockElement === canvas) {
      player.angle += e.movementX * 0.0025;
    }
  });

  function switchWeapon(num) {
    if (player.ownedWeapons[num]) {
      player.weapon = num;
      updateHUD();
    }
  }

  // --- INTERACCIÓN CON PUERTAS Y SALIDA ---
  function interactDoor() {
    const checkDist = 1.35;
    const tx = Math.floor(player.x + Math.cos(player.angle) * checkDist);
    const ty = Math.floor(player.y + Math.sin(player.angle) * checkDist);
    if (ty < 0 || ty >= worldMap.length || tx < 0 || tx >= worldMap[0].length) return;

    const cell = worldMap[ty][tx];
    if (cell === 9) {
      // Salida de nivel
      audio.playPickup();
      endLevel(true);
      return;
    }

    const door = doors[`${tx},${ty}`];
    if (door) {
      if (door.lock === 5 && !player.keys.yellow) {
        showMessage('NECESITAS LA LLAVE AMARILLA');
        return;
      }
      if (door.lock === 6 && !player.keys.red) {
        showMessage('NECESITAS LA LLAVE ROJA');
        return;
      }
      if (door.open === 0 && !door.opening) {
        door.opening = true;
        door.timer = 4.0;
        audio.playDoor();
      }
    }
  }

  // --- COMBATE Y DISPAROS ---
  function fireWeapon() {
    if (player.shootTimer > 0) return;

    if (player.weapon === 1) {
      // Sierra UAC (cuerpo a cuerpo)
      player.shootTimer = 0.22;
      audio.playShoot(1);
      hitScan(1.6, 22, 0.28);
    } else if (player.weapon === 2) {
      // Pistola
      if (player.ammo <= 0) return showMessage('¡SIN MUNICIÓN!');
      player.ammo--;
      player.shootTimer = 0.32;
      audio.playShoot(2);
      hitScan(14, 18, 0.1);
    } else if (player.weapon === 3) {
      // Escopeta de Combate
      if (player.ammo < 2) return showMessage('MUNICIÓN INSUFICIENTE');
      player.ammo -= 2;
      player.shootTimer = 0.68;
      audio.playShoot(3);
      for (let i = 0; i < 5; i++) {
        hitScan(11, 14, 0.16);
      }
    }
    updateHUD();
  }

  function hitScan(maxRange, damage, spread) {
    let bestTarget = null;
    let bestDist = maxRange;

    for (const ent of entities) {
      if (!ent.isEnemy || !ent.alive) continue;
      const dx = ent.x - player.x;
      const dy = ent.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > bestDist) continue;

      let angleDiff = Math.atan2(dy, dx) - player.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      if (Math.abs(angleDiff) < spread && hasLineOfSight(player.x, player.y, ent.x, ent.y)) {
        bestDist = dist;
        bestTarget = ent;
      }
    }

    if (bestTarget) {
      bestTarget.hp -= damage;
      bestTarget.hitFlash = 0.15;
      if (bestTarget.hp <= 0) {
        bestTarget.alive = false;
        kills++;
        audio.playEnemyDie();
        updateHUD();
      } else {
        audio.playEnemyHit();
      }
    }
  }

  function hasLineOfSight(x1, y1, x2, y2) {
    const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) * 6);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const cx = Math.floor(x1 + (x2 - x1) * t);
      const cy = Math.floor(y1 + (y2 - y1) * t);
      if (isWallSolid(cx, cy)) return false;
    }
    return true;
  }

  function isWallSolid(gx, gy) {
    if (gy < 0 || gy >= worldMap.length || gx < 0 || gx >= worldMap[0].length) return true;
    const cell = worldMap[gy][gx];
    if (cell === 0) return false;
    const door = doors[`${gx},${gy}`];
    if (door && door.open > 0.85) return false;
    return true;
  }

  function damagePlayer(amount) {
    if (player.health <= 0) return;
    let absorbed = 0;
    if (player.armor > 0) {
      absorbed = Math.min(player.armor, Math.ceil(amount * 0.5));
      player.armor -= absorbed;
    }
    player.health = Math.max(0, player.health - (amount - absorbed));
    player.facePainTimer = 0.55;
    triggerFlash('damage-flash');
    audio.playHurt();
    updateHUD();

    if (player.health <= 0) {
      endLevel(false);
    }
  }

  // --- ACTUALIZACIÓN LÓGICA (DT) ---
  function update(dt) {
    if (gameState !== 'PLAYING') return;

    if (player.shootTimer > 0) player.shootTimer = Math.max(0, player.shootTimer - dt);
    if (player.facePainTimer > 0) player.facePainTimer = Math.max(0, player.facePainTimer - dt);

    // Rotación con teclado
    const rotSpeed = 2.6 * dt;
    if (keysPressed['ArrowLeft'] || keysPressed['KeyQ']) player.angle -= rotSpeed;
    if (keysPressed['ArrowRight'] || keysPressed['KeyE']) player.angle += rotSpeed;

    // Movimiento WASD
    const moveSpeed = 3.8 * dt;
    let moveX = 0;
    let moveY = 0;
    const cos = Math.cos(player.angle);
    const sin = Math.sin(player.angle);

    if (keysPressed['KeyW'] || keysPressed['ArrowUp']) {
      moveX += cos;
      moveY += sin;
    }
    if (keysPressed['KeyS'] || keysPressed['ArrowDown']) {
      moveX -= cos;
      moveY -= sin;
    }
    if (keysPressed['KeyA']) {
      moveX += sin;
      moveY -= cos;
    }
    if (keysPressed['KeyD']) {
      moveX -= sin;
      moveY += cos;
    }

    const len = Math.hypot(moveX, moveY);
    if (len > 0) {
      moveX = (moveX / len) * moveSpeed;
      moveY = (moveY / len) * moveSpeed;
      const pad = 0.25;
      if (!isWallSolid(Math.floor(player.x + moveX + Math.sign(moveX) * pad), Math.floor(player.y))) {
        player.x += moveX;
      }
      if (!isWallSolid(Math.floor(player.x), Math.floor(player.y + moveY + Math.sign(moveY) * pad))) {
        player.y += moveY;
      }
      player.bobPhase += dt * 10;
    }

    // Actualizar puertas
    for (const key in doors) {
      const d = doors[key];
      if (d.opening) {
        d.open = Math.min(1, d.open + dt * 1.8);
        if (d.open >= 1) {
          d.timer -= dt;
          if (d.timer <= 0) {
            const [dx, dy] = key.split(',').map(Number);
            if (Math.floor(player.x) !== dx || Math.floor(player.y) !== dy) {
              d.opening = false;
            }
          }
        }
      } else if (d.open > 0) {
        d.open = Math.max(0, d.open - dt * 1.5);
      }
    }

    // Actualizar entidades (Enemigos y Objetos)
    for (const ent of entities) {
      if (!ent.alive) continue;
      if (ent.hitFlash > 0) ent.hitFlash = Math.max(0, ent.hitFlash - dt);

      const dx = player.x - ent.x;
      const dy = player.y - ent.y;
      const dist = Math.hypot(dx, dy);

      // Recolección de objetos
      if (!ent.isEnemy && dist < 0.65) {
        let picked = false;
        if (ent.type === 'medkit' && player.health < 100) {
          player.health = Math.min(100, player.health + 25);
          showMessage('BOTIQUÍN (+25% SALUD)');
          picked = true;
        } else if (ent.type === 'armor' && player.armor < 100) {
          player.armor = Math.min(100, player.armor + 50);
          showMessage('ARMADURA DE COMBATE (+50%)');
          picked = true;
        } else if (ent.type === 'ammo') {
          player.ammo = Math.min(200, player.ammo + 15);
          showMessage('CAJA DE MUNICIÓN (+15)');
          picked = true;
        } else if (ent.type === 'shotgun_item') {
          player.ownedWeapons[3] = true;
          player.weapon = 3;
          player.ammo = Math.min(200, player.ammo + 8);
          showMessage('¡ESCOPETA DE COMBATE OBTENIDA!');
          picked = true;
        } else if (ent.type === 'key_yellow') {
          player.keys.yellow = true;
          showMessage('¡LLAVE AMARILLA RECOGIDA!');
          picked = true;
        } else if (ent.type === 'key_red') {
          player.keys.red = true;
          showMessage('¡LLAVE ROJA RECOGIDA!');
          picked = true;
        }

        if (picked) {
          ent.alive = false;
          audio.playPickup();
          triggerFlash('pickup-flash');
          updateHUD();
        }
        continue;
      }

      // Inteligencia Artificial de enemigos
      if (ent.isEnemy && dist < 11 && hasLineOfSight(ent.x, ent.y, player.x, player.y)) {
        const speed = ent.type === 'baron' ? 1.4 : 1.7;
        if (dist > 1.8) {
          const stepX = (dx / dist) * speed * dt;
          const stepY = (dy / dist) * speed * dt;
          if (!isWallSolid(Math.floor(ent.x + stepX * 2), Math.floor(ent.y))) ent.x += stepX;
          if (!isWallSolid(Math.floor(ent.x), Math.floor(ent.y + stepY * 2))) ent.y += stepY;
        }

        ent.cooldown -= dt;
        if (ent.cooldown <= 0) {
          if (ent.type === 'trooper') {
            ent.cooldown = 1.6;
            audio.playShoot(2);
            if (Math.random() < 0.65) damagePlayer(8);
          } else {
            ent.cooldown = ent.type === 'baron' ? 1.3 : 1.9;
            projectiles.push({
              x: ent.x,
              y: ent.y,
              vx: (dx / dist) * 5.2,
              vy: (dy / dist) * 5.2,
              dmg: ent.type === 'baron' ? 18 : 11
            });
          }
        }
      }
    }

    // Actualizar proyectiles (bolas de fuego)
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (isWallSolid(Math.floor(p.x), Math.floor(p.y))) {
        projectiles.splice(i, 1);
      } else if (Math.hypot(p.x - player.x, p.y - player.y) < 0.45) {
        damagePlayer(p.dmg);
        projectiles.splice(i, 1);
      }
    }
  }

  // --- MOTOR DE RENDERIZADO RAYCASTING ---
  const zBuffer = new Float32Array(W);

  function render() {
    // Techo y suelo
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, W, H / 2);
    const floorGrad = ctx.createLinearGradient(0, H / 2, 0, H);
    floorGrad.addColorStop(0, '#1c1917');
    floorGrad.addColorStop(1, '#3f3f46');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, H / 2, W, H / 2);

    const fov = Math.PI / 3;
    const screenBuffer = ctx.getImageData(0, 0, W, H);
    const pixels = screenBuffer.data;

    for (let x = 0; x < W; x++) {
      const rayAngle = player.angle - fov / 2 + (x / W) * fov;
      const rayDirX = Math.cos(rayAngle);
      const rayDirY = Math.sin(rayAngle);

      let mapX = Math.floor(player.x);
      let mapY = Math.floor(player.y);

      const deltaDistX = Math.abs(1 / (rayDirX || 1e-6));
      const deltaDistY = Math.abs(1 / (rayDirY || 1e-6));

      let stepX, sideDistX;
      if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (player.x - mapX) * deltaDistX;
      } else {
        stepX = 1;
        sideDistX = (mapX + 1.0 - player.x) * deltaDistX;
      }

      let stepY, sideDistY;
      if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (player.y - mapY) * deltaDistY;
      } else {
        stepY = 1;
        sideDistY = (mapY + 1.0 - player.y) * deltaDistY;
      }

      let hit = 0;
      let side = 0;
      let wallX = 0;

      while (hit === 0) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }

        if (mapY < 0 || mapY >= worldMap.length || mapX < 0 || mapX >= worldMap[0].length) {
          hit = 1;
          break;
        }

        const cell = worldMap[mapY][mapX];
        if (cell > 0) {
          const door = doors[`${mapX},${mapY}`];
          const perpDistTemp = side === 0 ? sideDistX - deltaDistX : sideDistY - deltaDistY;
          let wx = side === 0 ? player.y + perpDistTemp * rayDirY : player.x + perpDistTemp * rayDirX;
          wx -= Math.floor(wx);

          if (door) {
            if (wx > door.open) {
              hit = cell;
              wallX = wx - door.open;
            }
          } else {
            hit = cell;
            wallX = wx;
          }
        }
      }

      const perpWallDist = side === 0 ? sideDistX - deltaDistX : sideDistY - deltaDistY;
      const correctedDist = Math.max(0.05, perpWallDist * Math.cos(rayAngle - player.angle));
      zBuffer[x] = correctedDist;

      const lineHeight = Math.floor(H / correctedDist);
      const drawStart = Math.max(0, Math.floor(-lineHeight / 2 + H / 2));
      const drawEnd = Math.min(H - 1, Math.floor(lineHeight / 2 + H / 2));

      const tex = textures[hit] || textures[1];
      let texX = Math.floor(wallX * TEX_SIZE);
      if ((side === 0 && rayDirX > 0) || (side === 1 && rayDirY < 0)) {
        texX = TEX_SIZE - texX - 1;
      }
      texX = Math.max(0, Math.min(TEX_SIZE - 1, texX));

      const shade = Math.max(0.18, Math.min(1, 1 / (1 + correctedDist * 0.14))) * (side === 1 ? 0.78 : 1);

      for (let y = drawStart; y < drawEnd; y++) {
        const d = y - H / 2 + lineHeight / 2;
        const texY = Math.max(0, Math.min(TEX_SIZE - 1, Math.floor((d * TEX_SIZE) / lineHeight)));
        const tIdx = (texY * TEX_SIZE + texX) * 4;
        const pIdx = (y * W + x) * 4;

        pixels[pIdx] = tex.data[tIdx] * shade;
        pixels[pIdx + 1] = tex.data[tIdx + 1] * shade;
        pixels[pIdx + 2] = tex.data[tIdx + 2] * shade;
        pixels[pIdx + 3] = 255;
      }
    }

    ctx.putImageData(screenBuffer, 0, 0);

    // Renderizar Sprites (Enemigos, Objetos y Proyectiles)
    const renderList = [];
    for (const ent of entities) {
      renderList.push({
        x: ent.x,
        y: ent.y,
        sprite: ent.alive ? sprites[ent.type] : sprites.dead,
        dist: Math.hypot(ent.x - player.x, ent.y - player.y),
        flash: ent.hitFlash > 0
      });
    }
    for (const p of projectiles) {
      renderList.push({
        x: p.x,
        y: p.y,
        sprite: sprites.fireball,
        dist: Math.hypot(p.x - player.x, p.y - player.y),
        flash: false
      });
    }

    renderList.sort((a, b) => b.dist - a.dist);

    for (const item of renderList) {
      if (item.dist < 0.25) continue;
      const dx = item.x - player.x;
      const dy = item.y - player.y;

      let spriteAngle = Math.atan2(dy, dx) - player.angle;
      while (spriteAngle > Math.PI) spriteAngle -= Math.PI * 2;
      while (spriteAngle < -Math.PI) spriteAngle += Math.PI * 2;

      if (Math.abs(spriteAngle) > fov * 0.75) continue;

      const perpDist = item.dist * Math.cos(spriteAngle);
      const spriteSize = Math.floor(H / perpDist);
      const screenX = Math.floor((0.5 + spriteAngle / fov) * W - spriteSize / 2);
      const screenY = Math.floor(H / 2 - spriteSize / 2);

      for (let stripe = 0; stripe < spriteSize; stripe++) {
        const sx = screenX + stripe;
        if (sx < 0 || sx >= W || perpDist >= zBuffer[sx]) continue;
        const texX = Math.floor((stripe / spriteSize) * 64);
        ctx.drawImage(item.sprite, texX, 0, 1, 64, sx, screenY, 1, spriteSize);
      }
    }

    drawWeapon();
    drawCrosshair();
    if (showMinimap) drawMinimap();
  }

  function drawWeapon() {
    const bobX = Math.cos(player.bobPhase) * 10;
    const bobY = Math.abs(Math.sin(player.bobPhase)) * 10;
    const recoil = player.shootTimer > 0 ? 22 : 0;
    const cx = W / 2 + bobX;
    const cy = H - 135 + bobY + recoil;

    ctx.save();
    if (player.weapon === 1) {
      // Sierra UAC
      ctx.fillStyle = '#eab308';
      ctx.fillRect(cx - 25, cy + 40, 70, 95);
      ctx.fillStyle = '#71717a';
      ctx.fillRect(cx - 10, cy - 35, 28, 85);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - 8, cy - 25, 24, 14);
    } else if (player.weapon === 2) {
      // Pistola
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(cx - 18, cy + 10, 36, 125);
      ctx.fillStyle = '#71717a';
      ctx.fillRect(cx - 12, cy - 10, 24, 30);
    } else if (player.weapon === 3) {
      // Escopeta
      ctx.fillStyle = '#27272a';
      ctx.fillRect(cx - 22, cy - 25, 44, 160);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx - 26, cy + 45, 52, 55);
    }

    // Fogonazo de disparo
    if (player.shootTimer > 0.16 && player.weapon !== 1) {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx, cy - 25, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy - 25, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCrosshair() {
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 8, H / 2);
    ctx.lineTo(W / 2 + 8, H / 2);
    ctx.moveTo(W / 2, H / 2 - 8);
    ctx.lineTo(W / 2, H / 2 + 8);
    ctx.stroke();
  }

  function drawMinimap() {
    const scale = 11;
    const ox = 16;
    const oy = 42;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(ox - 4, oy - 4, worldMap[0].length * scale + 8, worldMap.length * scale + 8);

    for (let y = 0; y < worldMap.length; y++) {
      for (let x = 0; x < worldMap[y].length; x++) {
        const c = worldMap[y][x];
        if (c === 0) continue;
        ctx.fillStyle = c === 9 ? '#22c55e' : c >= 4 ? '#facc15' : '#71717a';
        ctx.fillRect(ox + x * scale, oy + y * scale, scale - 1, scale - 1);
      }
    }

    // Jugador en minimapa
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(ox + player.x * scale, oy + player.y * scale, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- ROSTRO ANIMADO DEL MARINE EN EL HUD ---
  function drawMarineFace() {
    faceCtx.fillStyle = '#18181b';
    faceCtx.fillRect(0, 0, 64, 64);

    // Cabeza y cabello
    faceCtx.fillStyle = '#f5c29b';
    faceCtx.fillRect(16, 14, 32, 38);
    faceCtx.fillStyle = '#451a03';
    faceCtx.fillRect(16, 8, 32, 10);

    // Ojos
    const lookOffset = Math.sin(performance.now() * 0.002) > 0.6 ? 2 : Math.sin(performance.now() * 0.002) < -0.6 ? -2 : 0;
    faceCtx.fillStyle = '#ffffff';
    faceCtx.fillRect(21, 24, 8, 5);
    faceCtx.fillRect(35, 24, 8, 5);
    faceCtx.fillStyle = player.facePainTimer > 0 ? '#ef4444' : '#1e3a8a';
    faceCtx.fillRect(24 + lookOffset, 25, 3, 3);
    faceCtx.fillRect(38 + lookOffset, 25, 3, 3);

    // Sangre según salud
    if (player.health < 70) {
      faceCtx.fillStyle = '#dc2626';
      faceCtx.fillRect(18, 34, 4, 10);
    }
    if (player.health < 35) {
      faceCtx.fillStyle = '#dc2626';
      faceCtx.fillRect(38, 18, 6, 14);
      faceCtx.fillRect(26, 44, 12, 6);
    }

    // Boca
    faceCtx.fillStyle = '#7f1d1d';
    if (player.facePainTimer > 0) {
      faceCtx.fillRect(26, 39, 12, 9);
    } else {
      faceCtx.fillRect(24, 42, 16, 3);
    }
  }

  function updateHUD() {
    document.getElementById('hud-ammo').textContent = player.weapon === 1 ? '∞' : player.ammo;
    document.getElementById('hud-health').textContent = `${player.health}%`;
    document.getElementById('hud-armor').textContent = `${player.armor}%`;
    document.getElementById('hud-kills').textContent = `${kills}/${totalEnemies}`;

    [1, 2, 3].forEach((n) => {
      const el = document.getElementById(`wpn-${n}`);
      el.classList.toggle('owned', !!player.ownedWeapons[n]);
      el.classList.toggle('active', player.weapon === n);
    });

    document.getElementById('key-yellow').classList.toggle('collected', player.keys.yellow);
    document.getElementById('key-red').classList.toggle('collected', player.keys.red);
  }

  function endLevel(victory) {
    gameState = 'END';
    document.exitPointerLock?.();
    const overlay = document.getElementById('overlay-end');
    const title = document.getElementById('end-title');
    const subtitle = document.getElementById('end-subtitle');
    const btnNext = document.getElementById('btn-next');

    const pct = totalEnemies > 0 ? Math.round((kills / totalEnemies) * 100) : 100;
    document.getElementById('stat-kills').textContent = `${pct}% (${kills}/${totalEnemies})`;
    document.getElementById('stat-level').textContent = currentLevelIdx + 1;

    if (!victory) {
      title.textContent = 'HAS CAÍDO EN COMBATE';
      subtitle.textContent = 'Los demonios han tomado la base';
      btnNext.textContent = '↻ REINTENTAR MISIÓN';
      btnNext.onclick = () => {
        overlay.classList.remove('active');
        gameState = 'PLAYING';
        loadLevel(currentLevelIdx, false);
      };
    } else if (currentLevelIdx + 1 < LEVELS.length) {
      title.textContent = 'SECTOR DESPEJADO';
      subtitle.textContent = 'Prepárate para descender más profundo';
      btnNext.textContent = 'SIGUIENTE NIVEL ▶';
      btnNext.onclick = () => {
        overlay.classList.remove('active');
        gameState = 'PLAYING';
        loadLevel(currentLevelIdx + 1, true);
      };
    } else {
      title.textContent = '¡VICTORIA INFERNAL!';
      subtitle.textContent = 'Has erradicado la invasión demoníaca de la UAC';
      btnNext.textContent = '↻ JUGAR DE NUEVO';
      btnNext.onclick = () => {
        overlay.classList.remove('active');
        gameState = 'PLAYING';
        loadLevel(0, false);
      };
    }

    overlay.classList.add('active');
  }

  // --- BOTONES DE MENÚ ---
  document.getElementById('btn-start').addEventListener('click', () => {
    audio.init();
    audio.startMusic();
    document.getElementById('overlay-menu').classList.remove('active');
    gameState = 'PLAYING';
    loadLevel(0, false);
    canvas.requestPointerLock?.();
  });

  document.getElementById('btn-audio').addEventListener('click', (e) => {
    audio.init();
    const active = audio.toggle();
    e.target.textContent = active ? '🔊 SONIDO: ACTIVADO' : '🔇 SONIDO: SILENCIADO';
  });

  // --- BUCLE PRINCIPAL ---
  let lastTime = performance.now();
  function gameLoop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    if (gameState === 'PLAYING') {
      update(dt);
      render();
      drawMarineFace();
    }

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
})();
