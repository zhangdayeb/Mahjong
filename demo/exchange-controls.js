const styleURL = new URL('./exchange-controls.css', import.meta.url);
const buttonURL = new URL('./control-study/btn-exchange.png', import.meta.url);
const backgroundURL = new URL('./control-study/exchange-tip-bg.png', import.meta.url);
const buttonAdapters = new WeakMap();

export const EXCHANGE_CONTROL_SOURCE = Object.freeze({
  design: [1280, 720], buttonSize: [233, 85], tipSize: [500, 200],
  buttonY: -46.069, labelY: 8, fontSize: 34, lineHeight: 45,
  exchangeSpacing: 15, trusteeSpacing: 2, effectiveSpacing: 0, color: '#c65c0f',
  promptFontSize: 35, promptLineHeight: 50,
  normalTipY: -135, liveTipY: -50.5,
  samePromptY: 58.219 + 2.062, anyPromptY: 58.362,
});

function installStyle() {
  if ([...document.querySelectorAll('link[rel="stylesheet"]')].some(e => e.href === styleURL.href)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = styleURL.href; document.head.append(link);
}

function rect(center, size) {
  return {x: center[0] - size[0] / 2, y: center[1] - size[1] / 2, width: size[0], height: size[1], center};
}

// Positions are the original Cocos node coordinates converted to a downward-y
// stage. The caller supplies a real hand offset; this helper does not infer one.
export function exchangeControlLayout(width = 1280, height = 640, options = {}) {
  const scale = options.scale ?? Math.min(width / 1280, height / 720);
  if (!(width > 0 && height > 0 && scale > 0)) throw Error('换牌控件需要正数舞台尺寸');
  const handOffsetY = options.handOffsetY ?? 0, live = options.live === true;
  const tipY = handOffsetY + (live ? -50.5 : -135);
  const point = y => [width / 2, height / 2 - y * scale];
  const promptY = options.bAllColor ? EXCHANGE_CONTROL_SOURCE.anyPromptY : EXCHANGE_CONTROL_SOURCE.samePromptY;
  return {
    width, height, scale,
    tip: rect(point(tipY), [500 * scale, 200 * scale]),
    button: rect(point(tipY - 46.069), [233 * scale, 85 * scale]),
    labelCenter: point(tipY - 46.069 + 8),
    promptCenter: point(tipY + promptY),
    fontSize: 34 * scale, lineHeight: 45 * scale, letterSpacing: 0,
    serializedSpacingX: 15 * scale,
    promptFontSize: 35 * scale, promptLineHeight: 50 * scale,
  };
}

export function exchangeButtonLabel(remaining) {
  return Number.isFinite(remaining) && remaining > 0 ? `同意(${Math.ceil(remaining)})` : '同意';
}

// Original engine assembler 277 (system font / TTF): spacingX is not read.
// It measures and paints the whole string with Canvas fillText. A single-line
// Label's texture height is lineHeight * (1 + BASELINE_RATIO), where ratio=.26.
// Reproduce its baseline and fractional node size, including the texture's
// integer raster dimensions, rather than relying on a browser line box.
function paintSystemLabel(canvas, text, {fontSize = 34, lineHeight = 45, parts} = {}) {
  const ctx = canvas.getContext('2d'); ctx.font = `${fontSize}px Arial`;
  const segments = parts || [{text, color: '#c65c0f'}];
  const widths = segments.map(part => ctx.measureText(part.text).width);
  const nodeWidth = parseFloat(widths.reduce((a, b) => a + b, 0).toFixed(2));
  const nodeHeight = parseFloat((lineHeight * 1.26).toFixed(2));
  canvas.width = Math.max(1, Math.floor(nodeWidth)); canvas.height = Math.max(1, Math.floor(nodeHeight));
  ctx.font = `${fontSize}px Arial`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  const baseline = fontSize * (1 - .26 / 2) - (fontSize - nodeHeight) / 2;
  let x = 0;
  for (let i = 0; i < segments.length; i++) {
    ctx.fillStyle = segments[i].color; ctx.fillText(segments[i].text, x, baseline); x += widths[i];
  }
  canvas.dataset.nodeWidth = String(nodeWidth); canvas.dataset.nodeHeight = String(nodeHeight);
  return {width: nodeWidth, height: nodeHeight, baseline};
}

// The source cc.Button uses SCALE (0.1 s, 1.2), with a gray target Sprite when
// disabled. Its Label keeps the original orange color and full opacity.
function mountGoldButton(button, initial = {}) {
  installStyle();
  const old = buttonAdapters.get(button);
  if (old) { old.update(initial); return old; }
  const visual = document.createElement('span'); visual.className = 'native-gold-visual';
  const image = document.createElement('img'); image.className = 'native-gold-image'; image.src = buttonURL.href; image.alt = ''; image.draggable = false;
  const label = document.createElement('span'); label.className = 'native-gold-label native-button-label';
  const labelCanvas = document.createElement('canvas'); labelCanvas.setAttribute('aria-hidden', 'true'); label.append(labelCanvas);
  visual.append(image, label); button.replaceChildren(visual); button.classList.add('native-gold-button');
  if (!button.style.position && getComputedStyle(button).position === 'static') button.style.position = 'relative';
  let state = {kind: 'exchange', scale: 1, enabled: true, remaining: null, ...initial};
  const press = () => { if (!button.disabled) visual.classList.add('is-pressed'); };
  const release = () => visual.classList.remove('is-pressed');
  button.addEventListener('pointerdown', press); button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release); button.addEventListener('pointerleave', release);
  button.addEventListener('keydown', e => { if (e.code === 'Space' || e.code === 'Enter') press(); });
  button.addEventListener('keyup', release); button.addEventListener('blur', release);
  function update(next = {}) {
    state = {...state, ...next};
    const scale = state.scale;
    if (!(scale > 0)) throw Error('按钮缩放必须为正数');
    const text = state.label ?? (state.kind === 'trustee' ? '取消托管' : exchangeButtonLabel(state.remaining));
    const measured = paintSystemLabel(labelCanvas, text);
    label.style.width = `${measured.width * scale}px`; label.style.height = `${measured.height * scale}px`;
    label.setAttribute('aria-label', text);
    button.style.setProperty('--native-gold-scale', String(scale));
    button.style.setProperty('--native-gold-spacing', '0px');
    button.dataset.sourceSpacingX = String(state.kind === 'trustee' ? 2 : 15);
    button.style.width = `${233 * scale}px`; button.style.height = `${85 * scale}px`;
    button.disabled = state.enabled === false; button.setAttribute('aria-label', text);
    visual.classList.toggle('is-disabled', button.disabled); if (button.disabled) release();
    return button;
  }
  const ready = image.decode();
  const adapter = {button, image, label, labelCanvas, ready, update}; buttonAdapters.set(button, adapter); update(); return adapter;
}

export function styleNativeExchangeButton(button, options = {}) {
  return mountGoldButton(button, {...options, kind: 'exchange'});
}

export function styleTrusteeButton(button, options = {}) {
  return mountGoldButton(button, {...options, kind: 'trustee'});
}

function paintNineSlice(canvas, image, insets = [18, 31, 22, 19]) {
  const [left, top, right, bottom] = insets, w = image.width, h = image.height;
  const sx = [0, left, w - right, w], sy = [0, top, h - bottom, h];
  const dx = [0, left, canvas.width - right, canvas.width], dy = [0, top, canvas.height - bottom, canvas.height];
  const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) {
    ctx.drawImage(image, sx[x], sy[y], sx[x + 1] - sx[x], sy[y + 1] - sy[y],
      dx[x], dy[y], dx[x + 1] - dx[x], dy[y + 1] - dy[y]);
  }
}

// A standalone original tip group. It adds no selection or timeout logic.
export function createExchangeControls(parent, initial = {}) {
  installStyle();
  const element = document.createElement('div'); element.className = 'native-exchange-controls'; element.hidden = true;
  const background = document.createElement('canvas'); background.className = 'native-exchange-background'; background.width = 500; background.height = 200; background.setAttribute('aria-hidden', 'true');
  const prompt = document.createElement('div'); prompt.className = 'native-exchange-prompt';
  const promptCanvas = document.createElement('canvas'); promptCanvas.setAttribute('aria-hidden', 'true'); prompt.append(promptCanvas);
  const button = document.createElement('button'); button.type = 'button'; button.className = 'native-exchange-confirm';
  const adapter = styleNativeExchangeButton(button, {remaining: initial.remaining, enabled: initial.enabled});
  element.append(background, prompt, button); parent.append(element);
  button.onclick = event => initial.onConfirm?.(event);
  let state = {width: 1280, height: 640, live: false, bAllColor: false, handOffsetY: 0, ...initial};
  const bg = new Image(); bg.src = backgroundURL.href;
  const ready = Promise.all([adapter.ready, bg.decode().then(() => paintNineSlice(background, bg))]);
  function update(next = {}) {
    state = {...state, ...next};
    const layout = exchangeControlLayout(state.width, state.height, state), {scale} = layout;
    // Children stay at native 500 × 200 dimensions; the whole Cocos group scales.
    element.style.left = layout.tip.center[0] + 'px'; element.style.top = layout.tip.center[1] + 'px';
    element.style.transform = `translate(-50%,-50%) scale(${scale})`;
    button.style.left = '133.5px'; button.style.top = '103.569px';
    adapter.update({remaining: state.remaining, enabled: state.enabled, scale: 1});
    const parts = state.bAllColor ? ['选择', '任意3张', '手牌'] : ['选择三张', '同花色', '手牌'];
    const measured = paintSystemLabel(promptCanvas, parts.join(''), {fontSize: 35, lineHeight: 50,
      parts: parts.map((text, i) => ({text, color: i === 1 ? '#ff5a2b' : '#fffbcb'}))});
    prompt.style.width = `${measured.width}px`; prompt.style.height = `${measured.height}px`;
    prompt.setAttribute('aria-label', parts.join(''));
    prompt.style.top = `${100 - (state.bAllColor ? EXCHANGE_CONTROL_SOURCE.anyPromptY : EXCHANGE_CONTROL_SOURCE.samePromptY)}px`;
    return layout;
  }
  function hide() { element.hidden = true; }
  function show(next = {}) { const layout = update(next); element.hidden = false; return layout; }
  update();
  return {element, button, prompt, ready, show, update, hide, get open() { return !element.hidden; }, destroy() { element.remove(); }};
}
