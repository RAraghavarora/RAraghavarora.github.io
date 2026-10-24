(function () {
  'use strict';

  const DIRECTIONS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const PACES = { easy: 6, normal: 10, fast: 15 };
  const same = (a, b) => a.x === b.x && a.y === b.y;

  class SnakeGame {
    constructor(size = 25, random = Math.random) {
      this.size = size;
      this.random = random;
      this.reset();
    }
    reset() {
      const middle = Math.floor(this.size / 2);
      this.cells = Array.from({ length: 4 }, (_, i) => ({ x: middle - i, y: middle }));
      this.direction = 'right';
      this.turns = [];
      this.score = 0;
      this.state = 'ready';
      this.placeFood();
    }
    placeFood() {
      const occupied = new Set(this.cells.map(cell => cell.y * this.size + cell.x));
      const empty = [];
      for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
          if (!occupied.has(y * this.size + x)) empty.push({ x, y });
        }
      }
      this.food = empty.length ? empty[Math.floor(this.random() * empty.length)] : null;
    }
    steer(direction) {
      if (this.state !== 'playing' || !DIRECTIONS[direction] || this.turns.length >= 2) return;
      const previous = this.turns[this.turns.length - 1] || this.direction;
      const [px, py] = DIRECTIONS[previous];
      const [dx, dy] = DIRECTIONS[direction];
      if (previous !== direction && !(px + dx === 0 && py + dy === 0)) this.turns.push(direction);
    }
    tick() {
      if (this.state !== 'playing') return;
      this.direction = this.turns.shift() || this.direction;
      const [dx, dy] = DIRECTIONS[this.direction];
      const head = {
        x: (this.cells[0].x + dx + this.size) % this.size,
        y: (this.cells[0].y + dy + this.size) % this.size
      };
      const eating = this.food && same(head, this.food);
      const body = eating ? this.cells : this.cells.slice(0, -1);
      if (body.some(cell => same(head, cell))) {
        this.state = 'over';
        this.turns = [];
        return;
      }
      this.cells.unshift(head);
      if (eating) {
        this.score++;
        this.placeFood();
        if (!this.food) this.state = 'won';
      } else this.cells.pop();
    }
  }

  // The same engine can be exercised without a browser or animation clock.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SnakeGame, PACES };
    return;
  }
  const root = document.getElementById('snake-arcade');
  if (!root) return;
  const find = id => document.getElementById('snake-' + id);
  const canvas = find('board');
  const context = canvas.getContext('2d');
  if (!context) {
    find('overlay-title').textContent = 'Game unavailable';
    find('overlay-copy').textContent = 'Your browser could not open the game board. You can still head back home.';
    find('play').hidden = true;
    find('restart').disabled = true;
    find('difficulty').disabled = true;
    return;
  }
  find('play').disabled = false;
  const game = new SnakeGame();
  const difficulty = find('difficulty');
  const play = find('play');
  const pause = find('pause');
  const overlay = find('overlay');
  let pace = Object.prototype.hasOwnProperty.call(PACES, difficulty.value) ? difficulty.value : 'normal';
  difficulty.value = pace;
  let bests = { easy: 0, normal: 0, fast: 0 };
  let frame = null;
  let swipe = null;
  let newRecord = false;
  let lastTime = null;
  let elapsed = 0;
  let storage;
  const validScore = value => Number.isSafeInteger(value) && value >= 0;

  function storageUnavailable() {
    find('storage-note').textContent = 'Storage is unavailable. Personal bests last for this visit.';
    storage = null;
  }
  // A malformed record is recoverable; denied storage access is a separate failure.
  function mergeBests(raw) {
    let stored;
    try { stored = JSON.parse(raw || '{}'); } catch (_) { return; }
    Object.keys(bests).forEach(key => {
      if (stored && validScore(stored[key])) bests[key] = Math.max(bests[key], stored[key]);
    });
  }
  try {
    storage = window.localStorage;
    mergeBests(storage.getItem('snake404.bests.v1'));
    const old = storage.getItem('highScore');
    if (old !== null && validScore(Number(old))) {
      find('legacy').hidden = false;
      find('legacy').textContent = 'Legacy best: ' + Number(old) + ' · from the original game';
    }
  } catch (_) { storageUnavailable(); }

  function announce(message) { find('announcement').textContent = message; }
  function stopClock() {
    swipe = null;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastTime = null;
    elapsed = 0;
  }
  function updateScores() {
    find('score').textContent = game.score;
    if (game.score > bests[pace]) {
      if (storage) {
        try { mergeBests(storage.getItem('snake404.bests.v1')); }
        catch (_) { storageUnavailable(); }
      }
      if (game.score > bests[pace]) {
        newRecord = true;
        bests[pace] = game.score;
        if (storage) {
          try { storage.setItem('snake404.bests.v1', JSON.stringify(bests)); }
          catch (_) { storageUnavailable(); }
        }
      }
    }
    find('best').textContent = bests[pace];
  }
  function draw() {
    const unit = canvas.width / game.size;
    context.fillStyle = '#e2f3e5';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#d5e9d9';
    context.lineWidth = 1;
    context.beginPath();
    for (let i = 1; i < game.size; i++) {
      context.moveTo(i * unit, 0); context.lineTo(i * unit, canvas.height);
      context.moveTo(0, i * unit); context.lineTo(canvas.width, i * unit);
    }
    context.stroke();
    if (game.food) {
      context.fillStyle = '#cd5846';
      context.fillRect(game.food.x * unit + 4, game.food.y * unit + 4, unit - 8, unit - 8);
    }
    game.cells.forEach((cell, i) => {
      context.fillStyle = i === 0 ? '#12517b' : '#287aa0';
      context.fillRect(cell.x * unit + 1, cell.y * unit + 1, unit - 2, unit - 2);
    });
    const head = game.cells[0];
    const [dx, dy] = DIRECTIONS[game.direction];
    context.fillStyle = '#f0fff0';
    [-1, 1].forEach(side => {
      context.fillRect(head.x * unit + unit / 2 + dx * 5 + dy * side * 5 - 2,
        head.y * unit + unit / 2 + dy * 5 + dx * side * 5 - 2, 4, 4);
    });
  }
  function renderState() {
    const state = game.state;
    overlay.hidden = state === 'playing';
    pause.disabled = state !== 'playing' && state !== 'paused';
    pause.textContent = state === 'paused' ? 'Resume' : 'Pause';
    root.querySelectorAll('[data-direction]').forEach(button => { button.disabled = state !== 'playing'; });
    const messages = {
      ready: ['READY WHEN YOU ARE', 'A quick game?', 'Collect the food. Watch your tail.', 'Play Snake'],
      paused: ['TAKE YOUR TIME', 'Paused.', 'Your next pixel can wait.', 'Resume'],
      over: ['ONE MORE DETOUR?', 'Tail trouble.', 'You collected ' + game.score + ' pixels. Ready for another round?', 'Play again'],
      won: ['EVERY PIXEL FOUND', 'Board complete!', 'You filled the board. Final score: ' + game.score + '.', 'Play again']
    };
    if (messages[state]) {
      const [eyebrow, title, copy, label] = messages[state];
      find('overlay-eyebrow').textContent = eyebrow;
      find('overlay-title').textContent = title;
      find('overlay-copy').textContent = state === 'over' && newRecord && game.score >= bests[pace]
        ? 'New personal best: ' + game.score + '. Play again?' : copy;
      play.textContent = label;
    }
    draw();
    updateScores();
  }
  function loop(now) {
    frame = null;
    if (game.state !== 'playing') return;
    const interval = 1000 / PACES[pace];
    if (lastTime !== null) elapsed += Math.min(now - lastTime, interval);
    lastTime = now;
    if (elapsed >= interval) {
      elapsed %= interval;
      game.tick();
      updateScores();
      draw();
      if (game.state !== 'playing') {
        stopClock();
        renderState();
        announce((game.state === 'won' ? 'Board complete.' : 'Game over.') + ' ' + find('overlay-copy').textContent);
        return;
      }
    }
    frame = requestAnimationFrame(loop);
  }
  function start() {
    stopClock();
    if (game.state !== 'paused') {
      game.reset();
      newRecord = false;
    }
    game.state = 'playing';
    root.focus({ preventScroll: true });
    renderState();
    announce('Playing. ' + pace + ' pace.');
    frame = requestAnimationFrame(loop);
  }
  function pauseGame() {
    if (game.state !== 'playing') return;
    game.state = 'paused';
    game.turns = [];
    stopClock();
    renderState();
    announce('Paused. Use Resume or Space to continue.');
  }
  function ready() {
    stopClock();
    newRecord = false;
    game.reset();
    renderState();
    announce('Ready. ' + pace + ' pace. Press Play to begin.');
  }
  play.addEventListener('click', start);
  pause.addEventListener('click', () => game.state === 'paused' ? start() : pauseGame());
  find('restart').addEventListener('click', ready);
  difficulty.addEventListener('focus', pauseGame);
  difficulty.addEventListener('change', () => {
    pace = difficulty.value;
    ready();
  });
  root.addEventListener('keydown', event => {
    if (event.target.closest('select, input, textarea, summary, a') || event.altKey || event.ctrlKey || event.metaKey) return;
    const key = event.key.toLowerCase();
    const direction = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' }[key];
    if (direction && game.state === 'playing') {
      event.preventDefault();
      if (!event.repeat) game.steer(direction);
    } else if ((key === ' ' || key === 'enter') && !event.target.closest('button')) {
      event.preventDefault();
      if (event.repeat) return;
      if (game.state === 'playing') {
        if (key === ' ') pauseGame();
      } else start();
    }
  });
  root.querySelectorAll('[data-direction]').forEach(button => {
    function steerButton() {
      game.steer(button.dataset.direction);
      if (game.state === 'playing') root.focus({ preventScroll: true });
    }
    button.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 || game.state !== 'playing') return;
      event.preventDefault();
      steerButton();
    });
    // Keyboard and assistive-technology clicks have no pointer click count.
    button.addEventListener('click', event => { if (!(event.detail > 0)) steerButton(); });
  });
  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    root.focus({ preventScroll: true });
    swipe = { x: event.clientX, y: event.clientY, id: event.pointerId };
    canvas.setPointerCapture(event.pointerId);
  });
  function steerSwipe(event) {
    if (!swipe || swipe.id !== event.pointerId) return;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 16) return;
    swipe = null;
    game.steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  }
  canvas.addEventListener('pointermove', steerSwipe);
  canvas.addEventListener('pointerup', event => {
    if (!swipe || event.pointerId !== swipe.id) return;
    steerSwipe(event);
    swipe = null;
  });
  function cancelSwipe(event) {
    if (swipe && event.pointerId === swipe.id) swipe = null;
  }
  canvas.addEventListener('pointercancel', cancelSwipe);
  canvas.addEventListener('lostpointercapture', cancelSwipe);
  root.addEventListener('focusout', event => {
    if (!root.contains(event.relatedTarget)) pauseGame();
  });
  window.addEventListener('blur', pauseGame);
  window.addEventListener('pagehide', pauseGame);
  window.addEventListener('storage', event => {
    if (storage && event.key === 'snake404.bests.v1') {
      mergeBests(event.newValue);
      find('best').textContent = bests[pace];
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); });
  renderState();
})();
