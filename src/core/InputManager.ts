export type SwipeDir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type Gesture =
  | { type: 'CHARGE_START' }
  | { type: 'CHARGE_CANCEL' }
  | { type: 'CHARGE_RELEASE'; hold: number }
  | { type: 'TAP'; x: number; y: number }
  | { type: 'DOUBLE_TAP'; x: number; y: number }
  | { type: 'SWIPE'; dir: SwipeDir; dx: number; dy: number; x: number; y: number }
  | { type: 'WALK'; dir: -1 | 0 | 1 }
  | { type: 'SCRUB'; tDelta: number }
  | { type: 'KEY_JETPACK' }
  | { type: 'KEY_REWIND' }
  | { type: 'KEY_GADGET' }
  | { type: 'KEY_EXPLORE' }
  | { type: 'KEY_PAUSE' };

type GestureHandler = (g: Gesture) => void;

const SWIPE_MIN = 52;
const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_PX = 44;
const HOLD_CHARGE_MS = 140;

export class InputManager {
  private onGesture: GestureHandler | null = null;
  private isListening = false;
  private isPressed = false;
  private pressStartTime = 0;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;
  private moved = false;
  private charging = false;
  private canvas: HTMLElement | null = null;
  private lastTapAt = 0;
  private lastTapX = 0;
  private lastTapY = 0;
  private keys = new Set<string>();
  private holdTimer: ReturnType<typeof setTimeout> | null = null;
  public exploring = false;
  public scrubbing = false;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
  }

  public setHandler(handler: GestureHandler) {
    this.onGesture = handler;
  }

  /** @deprecated jump-only wiring kept for safety */
  public setCallbacks(onStart: () => void, onRelease: (holdDurationSeconds: number) => void) {
    this.setHandler((g) => {
      if (g.type === 'CHARGE_START') onStart();
      if (g.type === 'CHARGE_RELEASE') onRelease(g.hold);
    });
  }

  public startListening(targetElement?: HTMLElement | Window) {
    if (this.isListening) return;
    this.isListening = true;
    const elem = (targetElement as HTMLElement) || window;
    this.canvas = elem instanceof HTMLElement ? elem : null;
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    elem.addEventListener('pointerdown', this.handlePointerDown as EventListener);
    window.addEventListener('pointermove', this.handlePointerMove as EventListener);
    window.addEventListener('pointerup', this.handlePointerUp as EventListener);
    window.addEventListener('pointercancel', this.handlePointerUp as EventListener);
    window.addEventListener('blur', this.clearKeys);
  }

  public stopListening(targetElement?: HTMLElement | Window) {
    if (!this.isListening) return;
    this.isListening = false;
    this.clearHoldTimer();
    const elem = (targetElement as HTMLElement) || window;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    elem.removeEventListener('pointerdown', this.handlePointerDown as EventListener);
    window.removeEventListener('pointermove', this.handlePointerMove as EventListener);
    window.removeEventListener('pointerup', this.handlePointerUp as EventListener);
    window.removeEventListener('pointercancel', this.handlePointerUp as EventListener);
    window.removeEventListener('blur', this.clearKeys);
  }

  private clearKeys = () => {
    this.keys.clear();
    this.emit({ type: 'WALK', dir: 0 });
  };

  public getHoldDuration(): number {
    if (!this.isPressed) return 0;
    return (performance.now() - this.pressStartTime) / 1000;
  }

  private localPoint(e: PointerEvent): { x: number; y: number } {
    if (this.canvas && this.canvas.getBoundingClientRect) {
      const r = this.canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    return { x: e.clientX, y: e.clientY };
  }

  private emit(g: Gesture) {
    if (this.onGesture) this.onGesture(g);
  }

  private clearHoldTimer() {
    if (this.holdTimer != null) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
  }

  private beginHoldCharge() {
    this.clearHoldTimer();
    this.holdTimer = setTimeout(() => {
      this.holdTimer = null;
      if (!this.isPressed || this.moved || this.exploring || this.scrubbing) return;
      if (!this.charging) {
        this.charging = true;
        this.emit({ type: 'CHARGE_START' });
      }
    }, HOLD_CHARGE_MS);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.repeat) return;
    const code = e.code;
    if (code === 'Space' || code === 'ArrowUp') {
      e.preventDefault();
      if (this.exploring || this.scrubbing) return;
      if (!this.charging) {
        this.charging = true;
        this.isPressed = true;
        this.pressStartTime = performance.now();
        this.emit({ type: 'CHARGE_START' });
      }
      return;
    }
    if (code === 'KeyW') {
      e.preventDefault();
      this.emit({ type: 'KEY_JETPACK' });
      return;
    }
    if (code === 'KeyS' || code === 'ArrowDown' || code === 'KeyR') {
      e.preventDefault();
      this.emit({ type: 'KEY_REWIND' });
      return;
    }
    if (code === 'KeyG') {
      this.emit({ type: 'KEY_GADGET' });
      return;
    }
    if (code === 'KeyE') {
      this.emit({ type: 'KEY_EXPLORE' });
      return;
    }
    if (code === 'Escape' || code === 'KeyP') {
      this.emit({ type: 'KEY_PAUSE' });
      return;
    }
    if (code === 'KeyA' || code === 'ArrowLeft' || code === 'KeyD' || code === 'ArrowRight') {
      this.keys.add(code);
      this.emitWalkFromKeys();
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    const code = e.code;
    if (code === 'Space' || code === 'ArrowUp') {
      e.preventDefault();
      if (this.charging) {
        const hold = (performance.now() - this.pressStartTime) / 1000;
        this.charging = false;
        this.isPressed = false;
        this.emit({ type: 'CHARGE_RELEASE', hold });
      }
      return;
    }
    if (code === 'KeyA' || code === 'ArrowLeft' || code === 'KeyD' || code === 'ArrowRight') {
      this.keys.delete(code);
      this.emitWalkFromKeys();
    }
  }

  private emitWalkFromKeys() {
    const left = this.keys.has('KeyA') || this.keys.has('ArrowLeft');
    const right = this.keys.has('KeyD') || this.keys.has('ArrowRight');
    let dir: -1 | 0 | 1 = 0;
    if (left && !right) dir = -1;
    if (right && !left) dir = 1;
    this.emit({ type: 'WALK', dir });
  }

  private handlePointerDown(e: PointerEvent) {
    const target = e.target as HTMLElement;
    if (target && (target.tagName === 'BUTTON' || target.closest('.ui-interactive'))) {
      return;
    }
    const p = this.localPoint(e);
    this.isPressed = true;
    this.moved = false;
    this.pressStartTime = performance.now();
    this.startX = p.x;
    this.startY = p.y;
    this.lastX = p.x;
    this.lastY = p.y;

    if (this.exploring) {
      const w = this.canvas?.clientWidth || 400;
      const dir: -1 | 0 | 1 = p.x < w * 0.38 ? -1 : p.x > w * 0.62 ? 1 : 0;
      this.emit({ type: 'WALK', dir });
      return;
    }

    if (this.scrubbing) return;

    // Delay charge so taps / double-taps / swipes are not jumps
    this.beginHoldCharge();
  }

  private handlePointerMove(e: PointerEvent) {
    if (!this.isPressed) return;
    const p = this.localPoint(e);
    const dx = p.x - this.startX;
    const dy = p.y - this.startY;
    this.lastX = p.x;
    this.lastY = p.y;
    if (Math.hypot(dx, dy) > 28) {
      this.moved = true;
      this.clearHoldTimer();
      if (this.charging && !this.scrubbing && !this.exploring) {
        this.emit({ type: 'CHARGE_CANCEL' });
        this.charging = false;
      }
    }

    if (this.scrubbing) {
      this.emit({ type: 'SCRUB', tDelta: dx / 220 });
      return;
    }

    if (this.exploring) {
      const w = this.canvas?.clientWidth || 400;
      const dir: -1 | 0 | 1 = p.x < w * 0.38 ? -1 : p.x > w * 0.62 ? 1 : Math.abs(dx) > 24 ? (dx > 0 ? 1 : -1) : 0;
      this.emit({ type: 'WALK', dir });
    }
  }

  private handlePointerUp(_e: PointerEvent) {
    if (!this.isPressed) return;
    this.isPressed = false;
    this.clearHoldTimer();
    const dx = this.lastX - this.startX;
    const dy = this.lastY - this.startY;
    const dist = Math.hypot(dx, dy);
    const hold = (performance.now() - this.pressStartTime) / 1000;

    if (this.exploring) {
      this.emit({ type: 'WALK', dir: 0 });
      if (dist >= SWIPE_MIN && Math.abs(dy) > Math.abs(dx) && dy > 0) {
        this.emit({ type: 'SWIPE', dir: 'DOWN', dx, dy, x: this.lastX, y: this.lastY });
      } else if (dist < SWIPE_MIN) {
        this.emitTap(this.lastX, this.lastY);
      }
      this.charging = false;
      return;
    }

    if (this.scrubbing) {
      this.charging = false;
      return;
    }

    if (this.moved && dist >= SWIPE_MIN) {
      if (this.charging) {
        this.emit({ type: 'CHARGE_CANCEL' });
        this.charging = false;
      }
      const dir = swipeDir(dx, dy);
      this.emit({ type: 'SWIPE', dir, dx, dy, x: this.lastX, y: this.lastY });
      return;
    }

    if (this.charging) {
      this.charging = false;
      this.emit({ type: 'CHARGE_RELEASE', hold });
      return;
    }

    this.emitTap(this.lastX, this.lastY);
  }

  private emitTap(x: number, y: number) {
    const now = performance.now();
    if (now - this.lastTapAt < DOUBLE_TAP_MS && Math.hypot(x - this.lastTapX, y - this.lastTapY) < DOUBLE_TAP_PX) {
      this.lastTapAt = 0;
      this.emit({ type: 'DOUBLE_TAP', x, y });
      return;
    }
    this.lastTapAt = now;
    this.lastTapX = x;
    this.lastTapY = y;
    this.emit({ type: 'TAP', x, y });
  }
}

function swipeDir(dx: number, dy: number): SwipeDir {
  if (Math.abs(dy) >= Math.abs(dx)) return dy < 0 ? 'UP' : 'DOWN';
  return dx < 0 ? 'LEFT' : 'RIGHT';
}
