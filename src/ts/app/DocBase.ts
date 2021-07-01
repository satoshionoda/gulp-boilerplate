import {
  EVENT_LOAD,
  EVENT_PAGESHOW,
  EVENT_READY,
  EVENT_RESIZE,
  EVENT_SCROLL,
} from "./Consts";

export class DocBase {
  static WinY: number = 0;

  protected isScrolling: boolean = false;
  protected isResizing: boolean = false;
  protected isWinLoaded: boolean = false;
  protected isDOMReady: boolean = false;
  private scrollTick: boolean = false;

  constructor() {
    this.setEvents();
  }

  /**
   * @abstract
   */
  protected onReady() {}

  protected onLoadWin() {}

  protected onScroll() {}

  protected onStartScrolling() {}

  protected onStopScrolling() {}

  protected onStartResizing() {}

  protected onStopResizing() {}

  private setEvents() {
    document.addEventListener(EVENT_READY, () => {
      this.isDOMReady = true;
      this.onReady();
    });

    window.addEventListener(EVENT_LOAD, () => {
      this.isWinLoaded = true;
      this.onLoadWin();
    });

    window.addEventListener(EVENT_PAGESHOW, (e) => {
      // http://stray-light.info/wp/ios-safari-backbutton/
      if ((e as any).persisted) {
        window.location.reload();
      }
    });

    let scrollTimeout: number;
    window.addEventListener(EVENT_SCROLL, () => {
      DocBase.WinY = window.scrollY;
      if (!this.isDOMReady) {
        return;
      }
      if (!this.scrollTick) {
        requestAnimationFrame(() => {
          this.scrollTick = false;
          this.onScroll();
        });
      }
      this.scrollTick = true;

      if (!this.isScrolling) {
        this.isScrolling = true;
        this.onStartScrolling();
      }
      window.clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        this.isScrolling = false;
        this.onStopScrolling();
      }, 300);
    });

    let resizeTimeout: number;
    window.addEventListener(EVENT_RESIZE, () => {
      if (!this.isResizing) {
        this.isResizing = true;
        this.onStartResizing();
      }
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        this.isResizing = false;
        this.onStopResizing();
      }, 300);
    });
  }
}
