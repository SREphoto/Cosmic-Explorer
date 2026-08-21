export class InputManager {
  private onChargeStartCb: (() => void) | null = null;
  private onChargeReleaseCb: ((holdDurationSeconds: number) => void) | null = null;
  private isListening: boolean = false;
  private isPressed: boolean = false;
  private pressStartTime: number = 0;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
  }

  public setCallbacks(onStart: () => void, onRelease: (holdDurationSeconds: number) => void) {
    this.onChargeStartCb = onStart;
    this.onChargeReleaseCb = onRelease;
  }

  public getHoldDuration(): number {
    if (!this.isPressed) return 0;
    return (performance.now() - this.pressStartTime) / 1000;
  }

  public startListening(targetElement?: HTMLElement | Window) {
    if (this.isListening) return;
    this.isListening = true;

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    const elem = targetElement || window;
    elem.addEventListener('pointerdown', this.handlePointerDown as EventListener);
    window.addEventListener('pointerup', this.handlePointerUp as EventListener);
  }

  public stopListening(targetElement?: HTMLElement | Window) {
    if (!this.isListening) return;
    this.isListening = false;

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    const elem = targetElement || window;
    elem.removeEventListener('pointerdown', this.handlePointerDown as EventListener);
    window.removeEventListener('pointerup', this.handlePointerUp as EventListener);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.repeat) return;
    if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp') {
      e.preventDefault();
      this.startCharge();
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp') {
      e.preventDefault();
      this.releaseCharge();
    }
  }

  private handlePointerDown(e: PointerEvent) {
    const target = e.target as HTMLElement;
    if (target && (target.tagName === 'BUTTON' || target.closest('.ui-interactive'))) {
      return;
    }
    this.startCharge();
  }

  private handlePointerUp(_e: PointerEvent) {
    this.releaseCharge();
  }

  private startCharge() {
    if (this.isPressed) return;
    this.isPressed = true;
    this.pressStartTime = performance.now();
    if (this.onChargeStartCb) {
      this.onChargeStartCb();
    }
  }

  private releaseCharge() {
    if (!this.isPressed) return;
    this.isPressed = false;
    const holdDuration = (performance.now() - this.pressStartTime) / 1000;
    if (this.onChargeReleaseCb) {
      this.onChargeReleaseCb(holdDuration);
    }
  }
}
