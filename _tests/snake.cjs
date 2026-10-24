const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { SnakeGame, PACES } = require('../assets/js/snake.js');
let checks = 0;
function test(name, fn) { fn(); checks++; console.log('PASS ' + name); }
function playing() { const g = new SnakeGame(25, () => 0); g.state = 'playing'; return g; }
test('ready state and nonmoving until Play', () => { const g = new SnakeGame(); const before = JSON.stringify(g.cells); g.tick(); assert.equal(JSON.stringify(g.cells), before); assert.equal(g.state, 'ready'); });
test('three fixed difficulties', () => assert.deepEqual(PACES, { easy: 6, normal: 10, fast: 15 }));
test('edge wrapping on all four edges', () => { for (const [direction, head, expected] of [['right', {x:24,y:4},{x:0,y:4}],['left',{x:0,y:4},{x:24,y:4}],['up',{x:4,y:0},{x:4,y:24}],['down',{x:4,y:24},{x:4,y:0}]]) { const g=playing(); g.cells=[head]; g.direction=direction; g.tick(); assert.deepEqual(g.cells[0],expected); }});
test('queued turns apply one per tick and reject reversals', () => { const g=playing(); g.steer('left'); assert.equal(g.turns.length,0); g.steer('up'); g.steer('down'); g.steer('left'); g.steer('down'); assert.deepEqual(g.turns,['up','left']); g.tick(); assert.equal(g.direction,'up'); g.tick(); assert.equal(g.direction,'left'); });
test('food increases score and length exactly once', () => { const g=playing(); g.food={x:13,y:12}; g.tick(); assert.equal(g.score,1); assert.equal(g.cells.length,5); assert.ok(!g.cells.some(c=>c.x===g.food.x&&c.y===g.food.y)); });
test('food always uses an empty cell', () => { const g=playing(); for (let i=0;i<625;i++) { g.random=()=>i/625; g.placeFood(); assert.ok(!g.cells.some(c=>c.x===g.food.x&&c.y===g.food.y)); }});
test('moving into departing tail is legal', () => { const g=playing(); g.cells=[{x:1,y:1},{x:1,y:2},{x:2,y:2},{x:2,y:1}]; g.direction='right'; g.tick(); assert.equal(g.state,'playing'); assert.deepEqual(g.cells[0],{x:2,y:1}); });
test('self collision ends game without altering body', () => { const g=playing(); g.cells=[{x:1,y:1},{x:2,y:1},{x:2,y:2},{x:1,y:2}]; const before=JSON.stringify(g.cells); g.tick(); assert.equal(g.state,'over'); assert.equal(JSON.stringify(g.cells),before); });
test('last empty cell produces board completion', () => { const g=playing(); g.size=3; g.cells=[{x:0,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:2,y:2},{x:1,y:2},{x:0,y:2},{x:2,y:0}]; g.food={x:1,y:0}; g.tick(); assert.equal(g.state,'won'); assert.equal(g.food,null); assert.equal(g.cells.length,9); });
test('paused and finished games ignore ticks and steering', () => { for (const state of ['paused','over','won']) {const g=playing();g.state=state;const before=JSON.stringify(g.cells);g.steer('up');g.tick();assert.equal(g.turns.length,0);assert.equal(JSON.stringify(g.cells),before);}});

// Exercise the actual browser controller with deterministic DOM and animation adapters.
function browserHarness(initial={}, blocked=false, options={}) {
  const elements=new Map(); let active=null; let nextFrame=1; const frames=new Map(); const data={...initial};
  function element(id) {
    if(elements.has(id)) return elements.get(id);
    const listeners={}; const e={id,tag:'',textContent:'',hidden:false,disabled:false,value:'normal',dataset:{},
      addEventListener(type,fn){(listeners[type]||=[]).push(fn);},
      dispatch(type,extra={}){const event={target:e,relatedTarget:null,preventDefault(){this.prevented=true;},...extra};for(const fn of listeners[type]||[])fn(event);return event;},
      closest(selector){return selector.split(',').map(s=>s.trim()).includes(e.tag)?e:null;},
      focus(){active=e;},contains(target){return target&&[...elements.values()].includes(target);},
      querySelectorAll(){return ['up','down','left','right'].map(d=>{const b=element(d);b.dataset.direction=d;b.tag='button';return b;});},
      getContext(){if(options.noCanvas)return null;const ctx={fillRect(x,y,w,h){if(ctx.fillStyle==='#12517b')e.head={x,y};},beginPath(){},moveTo(){},lineTo(){},stroke(){}};return ctx;},setPointerCapture(){},width:600,height:600};
    elements.set(id,e);return e;
  }
  element('snake-difficulty').value=options.pace || 'normal';
  const root=element('snake-arcade'); const doc=element('document');doc.getElementById=element;doc.hidden=false;
  const win=element('window');Object.defineProperty(win,'localStorage',{get(){if(blocked)throw Error('blocked');return {getItem:k=>data[k]??null,setItem:(k,v)=>{if(options.writeBlocked)throw Error('quota');data[k]=v;}};}});
  const seededMath=Object.create(Math); seededMath.random=()=>0;
  const env={Math:seededMath,document:doc,window:win,requestAnimationFrame:fn=>{const id=nextFrame++;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),console};
  vm.runInNewContext(fs.readFileSync(require.resolve('../assets/js/snake.js'),'utf8'),env);
  const fire=ms=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(ms));};
  return {element,root,doc,win,frames,data,fire,get active(){return active;}};
}
test('Play, pause, resume and restart keep a single clock',()=>{const h=browserHarness();const e=h.element;assert.equal(h.frames.size,0);e('snake-play').dispatch('click');assert.equal(h.frames.size,1);assert.equal(e('snake-overlay').hidden,true);e('snake-play').dispatch('click');assert.equal(h.frames.size,1);e('snake-pause').dispatch('click');assert.equal(h.frames.size,0);assert.equal(e('snake-overlay').hidden,false);e('snake-pause').dispatch('click');assert.equal(h.frames.size,1);e('snake-restart').dispatch('click');assert.equal(h.frames.size,0);assert.equal(e('snake-score').textContent,0);});
test('blur, focus exit and tab hiding pause explicitly',()=>{for(const trigger of ['blur','focusout','hidden']){const h=browserHarness();h.element('snake-play').dispatch('click');if(trigger==='blur')h.win.dispatch('blur');if(trigger==='focusout')h.root.dispatch('focusout');if(trigger==='hidden'){h.doc.hidden=true;h.doc.dispatch('visibilitychange');}assert.equal(h.frames.size,0);assert.equal(h.element('snake-overlay-title').textContent,'Paused.');}});
test('focus within arcade does not pause',()=>{const h=browserHarness();h.element('snake-play').dispatch('click');h.root.dispatch('focusout',{relatedTarget:h.element('snake-pause')});assert.equal(h.frames.size,1);});
test('difficulty resets and displays separate persisted best',()=>{const h=browserHarness({'snake404.bests.v1':JSON.stringify({easy:2,normal:5,fast:8})});assert.equal(h.element('snake-best').textContent,5);h.element('snake-play').dispatch('click');h.element('snake-difficulty').value='fast';h.element('snake-difficulty').dispatch('change');assert.equal(h.element('snake-best').textContent,8);assert.equal(h.frames.size,0);});
test('legacy scores stay separate and storage failure is graceful',()=>{const h=browserHarness({highScore:'117'});assert.equal(h.element('snake-legacy').hidden,false);assert.match(h.element('snake-legacy').textContent,/117/);assert.equal(h.element('snake-best').textContent,0);const blocked=browserHarness({},true);assert.match(blocked.element('snake-storage-note').textContent,/this visit/);blocked.element('snake-play').dispatch('click');assert.equal(blocked.frames.size,1);});
test('malformed score data cannot enter the UI',()=>{for(const value of ['null','[]','{"normal":-10}','{"normal":"bad"}'])assert.equal(browserHarness({'snake404.bests.v1':value}).element('snake-best').textContent,0);});
test('handled keyboard input prevents scrolling; select stays native',()=>{const h=browserHarness();h.element('snake-play').dispatch('click');assert.equal(h.root.dispatch('keydown',{key:'ArrowUp'}).prevented,true);const select=h.element('snake-difficulty');select.tag='select';assert.equal(h.root.dispatch('keydown',{key:'ArrowDown',target:select}).prevented,undefined);h.root.dispatch('keydown',{key:' '});assert.equal(h.frames.size,0);h.root.dispatch('keydown',{key:' ',repeat:true});assert.equal(h.frames.size,0);h.root.dispatch('keydown',{key:' '});assert.equal(h.frames.size,1);});
test('score persists on food and remains separated by pace',()=>{
const h=browserHarness();h.element('snake-play').dispatch('click');let time=0;h.fire(time);
function step(n){for(let i=0;i<n;i++){time+=101;h.fire(time);}}
h.root.dispatch('keydown',{key:'ArrowUp'});step(12);h.root.dispatch('keydown',{key:'ArrowLeft'});step(12);
assert.equal(h.element('snake-score').textContent,1);
assert.equal(JSON.parse(h.data['snake404.bests.v1']).normal,1);
h.element('snake-difficulty').value='easy';h.element('snake-difficulty').dispatch('change');assert.equal(h.element('snake-best').textContent,0);
});
test('touch buttons and swipes steer the actual game',()=>{
const h=browserHarness();h.element('snake-play').dispatch('click');h.fire(0);
h.element('up').dispatch('click');h.fire(101);assert.deepEqual(h.element('snake-board').head,{x:289,y:265});
h.element('snake-board').dispatch('pointerdown',{isPrimary:true,button:0,pointerId:1,clientX:100,clientY:100});
h.element('snake-board').dispatch('pointerup',{pointerId:1,clientX:50,clientY:100});h.fire(202);
assert.deepEqual(h.element('snake-board').head,{x:265,y:265});
});
test('long frame stalls advance at most one cell and resume has no catch-up',()=>{
const h=browserHarness();h.element('snake-play').dispatch('click');h.fire(0);h.fire(100000);
assert.deepEqual(h.element('snake-board').head,{x:313,y:289});
h.element('snake-pause').dispatch('click');h.element('snake-pause').dispatch('click');h.fire(200000);
assert.deepEqual(h.element('snake-board').head,{x:313,y:289});h.fire(200101);assert.deepEqual(h.element('snake-board').head,{x:337,y:289});assert.equal(h.frames.size,1);
});
function eatFirstFood(h) {
  h.element('snake-play').dispatch('click');
  let time=0; h.fire(time);
  h.root.dispatch('keydown',{key:'ArrowUp'});
  for(let i=0;i<12;i++) h.fire(time+=101);
  h.root.dispatch('keydown',{key:'ArrowLeft'});
  for(let i=0;i<12;i++) h.fire(time+=101);
}
test('corrupt JSON is replaced on the next best score',()=>{
  const h=browserHarness({'snake404.bests.v1':'{broken', highScore:'160'});
  assert.match(h.element('snake-legacy').textContent,/160/);
  eatFirstFood(h);
  assert.equal(JSON.parse(h.data['snake404.bests.v1']).normal,1);
  assert.doesNotMatch(h.element('snake-storage-note').textContent,/unavailable/);
});
test('a new score preserves higher scores written by another tab',()=>{
  const h=browserHarness();
  h.data['snake404.bests.v1']=JSON.stringify({normal:50,easy:12,fast:20});
  eatFirstFood(h);
  assert.deepEqual(JSON.parse(h.data['snake404.bests.v1']),{easy:12,normal:50,fast:20});
  assert.equal(h.element('snake-best').textContent,50);
});
test('storage events update best without interrupting the round',()=>{
  const h=browserHarness();h.element('snake-play').dispatch('click');
  h.win.dispatch('storage',{key:'snake404.bests.v1',newValue:'{"normal":42}'});
  assert.equal(h.element('snake-best').textContent,42);assert.equal(h.frames.size,1);
  h.win.dispatch('storage',{key:'snake404.bests.v1',newValue:'{"normal":3}'});
  assert.equal(h.element('snake-best').textContent,42);
});
test('write failures preserve the score and keep the game playable',()=>{
  const h=browserHarness({},false,{writeBlocked:true});eatFirstFood(h);
  assert.equal(h.element('snake-best').textContent,1);
  assert.match(h.element('snake-storage-note').textContent,/this visit/);assert.equal(h.frames.size,1);
});
test('restored dropdown selection matches the actual pace',()=>{
  const h=browserHarness({'snake404.bests.v1':'{"fast":9}'},false,{pace:'fast'});
  assert.equal(h.element('snake-best').textContent,9);
  h.element('snake-play').dispatch('click');h.fire(0);h.fire(67);
  assert.deepEqual(h.element('snake-board').head,{x:313,y:289});
});
test('swipes turn before finger release and only once per gesture',()=>{
  const h=browserHarness();h.element('snake-play').dispatch('click');h.fire(0);const c=h.element('snake-board');
  c.dispatch('pointerdown',{isPrimary:true,button:0,pointerId:1,clientX:100,clientY:100});
  c.dispatch('pointermove',{pointerId:1,clientX:100,clientY:70});h.fire(101);
  assert.deepEqual(c.head,{x:289,y:265});
  c.dispatch('pointerup',{pointerId:1,clientX:50,clientY:70});h.fire(202);
  assert.deepEqual(c.head,{x:289,y:241});
});
test('cancelled swipes do not leave a pending gesture',()=>{
  const h=browserHarness();h.element('snake-play').dispatch('click');h.fire(0);const c=h.element('snake-board');
  c.dispatch('pointerdown',{isPrimary:true,button:0,pointerId:1,clientX:100,clientY:100});c.dispatch('pointercancel',{pointerId:1});
  c.dispatch('pointermove',{pointerId:1,clientX:100,clientY:50});h.fire(101);
  assert.deepEqual(c.head,{x:313,y:289});
});
test('Enter starts and touch steering returns focus for Space pause',()=>{
  const h=browserHarness();assert.equal(h.element('up').disabled,true);
  h.root.dispatch('keydown',{key:'Enter'});assert.equal(h.frames.size,1);assert.equal(h.element('up').disabled,false);
  h.element('up').dispatch('click');assert.equal(h.active,h.root);
  h.root.dispatch('keydown',{key:' '});assert.equal(h.frames.size,0);assert.equal(h.element('up').disabled,true);
});
test('select focus and page history navigation pause gameplay',()=>{
  const h=browserHarness();h.element('snake-play').dispatch('click');h.element('snake-difficulty').dispatch('focus');assert.equal(h.frames.size,0);
  h.element('snake-play').dispatch('click');h.win.dispatch('pagehide');assert.equal(h.frames.size,0);
});
test('held steering keys do not enqueue a later unintended turn',()=>{
  const h=browserHarness();h.element('snake-play').dispatch('click');h.fire(0);
  h.root.dispatch('keydown',{key:'ArrowUp'});h.fire(101);
  h.root.dispatch('keydown',{key:'ArrowLeft'});
  h.root.dispatch('keydown',{key:'ArrowUp',repeat:true});h.fire(202);h.fire(303);
  assert.deepEqual(h.element('snake-board').head,{x:241,y:265});
});
test('a gesture started before pause cannot steer after resume',()=>{
  const h=browserHarness();h.element('snake-play').dispatch('click');const c=h.element('snake-board');
  c.dispatch('pointerdown',{isPrimary:true,button:0,pointerId:1,clientX:100,clientY:100});
  h.element('snake-pause').dispatch('click');h.element('snake-pause').dispatch('click');h.fire(0);
  c.dispatch('pointermove',{pointerId:1,clientX:100,clientY:50});h.fire(101);
  assert.deepEqual(c.head,{x:313,y:289});
});
test('lifting a second finger does not cancel the primary swipe',()=>{
  const h=browserHarness();h.element('snake-play').dispatch('click');h.fire(0);const c=h.element('snake-board');
  c.dispatch('pointerdown',{isPrimary:true,button:0,pointerId:1,clientX:100,clientY:100});
  c.dispatch('pointerup',{pointerId:2,clientX:50,clientY:100});
  c.dispatch('pointermove',{pointerId:1,clientX:100,clientY:50});h.fire(101);
  assert.deepEqual(c.head,{x:289,y:265});
});
test('direction buttons react on press and suppress the later pointer click',()=>{
  const h=browserHarness();h.element('snake-play').dispatch('click');h.fire(0);
  const up=h.element('up');up.dispatch('pointerdown',{isPrimary:true,button:0});h.fire(101);
  assert.deepEqual(h.element('snake-board').head,{x:289,y:265});
  h.element('left').dispatch('click');up.dispatch('click',{detail:1});h.fire(202);h.fire(303);
  assert.deepEqual(h.element('snake-board').head,{x:241,y:265});
});
test('unavailable canvas leaves a clear explanation and no broken Play action',()=>{
  const h=browserHarness({},false,{noCanvas:true});
  assert.equal(h.element('snake-overlay-title').textContent,'Game unavailable');
  assert.equal(h.element('snake-play').hidden,true);
  assert.equal(h.element('snake-restart').disabled,true);
  assert.equal(h.element('snake-difficulty').disabled,true);
  assert.equal(h.frames.size,0);
});
function finishAfterFirstFood(h) {
  let time=2424;
  for(const key of ['ArrowDown','ArrowRight','ArrowUp']) {
    h.root.dispatch('keydown',{key});h.fire(time+=101);
  }
}
test('a completed record round shows and announces the personal best',()=>{
  const h=browserHarness();eatFirstFood(h);finishAfterFirstFood(h);
  assert.equal(h.frames.size,0);assert.match(h.element('snake-overlay-copy').textContent,/New personal best: 1/);
  assert.match(h.element('snake-announcement').textContent,/New personal best/);
  eatFirstFood(h);finishAfterFirstFood(h);
  assert.doesNotMatch(h.element('snake-overlay-copy').textContent,/New personal best/);
});
test('beating an old local value does not claim a higher record from another tab',()=>{
  const h=browserHarness();h.data['snake404.bests.v1']='{"normal":50}';
  eatFirstFood(h);finishAfterFirstFood(h);
  assert.doesNotMatch(h.element('snake-overlay-copy').textContent,/New personal best/);
  assert.equal(h.element('snake-best').textContent,50);
});
console.log(checks+' checks passed.');
