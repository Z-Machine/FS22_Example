/**
 * This boilerplate declarations could be moved to a seperate project or file
 */

declare namespace AIJob {
  let getPricePerMs: (this: void) => number;
}

declare namespace AIJobConveyor {
  let getPricePerMs: (this: void) => number;
}

declare namespace Utils {
  function overwrittenFunction<T1 extends Function, T2 extends T1>(this: void, oldFunc: T1, newFunc: T2): T1;
}

declare function addModEventListener(this: void, listener: Object): void;
declare function removeModEventListener(this: void, listener: Object): void;

declare function addConsoleCommand<TEnv extends {}, TKey extends keyof TEnv>(name: string, description: string, key: TKey, env?: TEnv): void;
declare function removeConsoleCommand(name: string): void;

/**
 * Methods expected when `addModEventListener()` is called
 */
declare class FSModEventListener {
  static loadMap(name: string): void;
  static deleteMap(): void;
  static mouseEvent(posX: number, posY: number, isDown: boolean, isUp: boolean, button: any): void;
  static keyEvent(posX: number, posY: number, isDown: boolean, isUp: boolean, button: any): void;
  static update(dt: number): void;
}

class FreeLabour implements FSModEventListener {
  private constructor() {}

  static loadMap(name: string): void {
    AIJob.getPricePerMs = Utils.overwrittenFunction(AIJob.getPricePerMs, this.getPricePerMs);
    AIJobConveyor.getPricePerMs = Utils.overwrittenFunction(AIJob.getPricePerMs, this.getPricePerMs);

    addConsoleCommand("fl_price", "sets the price per ms for AI labour.", "setPricePerMs", this);

    print("***FreeLabour is loaded***");
  }

  static deleteMap(): void {
    removeConsoleCommand("fl_price");
  }

  private static _ppms = 0;
  static getPricePerMs() {
    return FreeLabour._ppms;
  }

  static setPricePerMs(value?: number) {
    value = tonumber(value);
    if (value !== undefined && type(value) === "number") {
      this._ppms = value;
      print(`FreeLabour: PPMs set to ${value}`);
    } else {
      print(`FreeLabour: PPMs is currently ${this.getPricePerMs()}`);
    }
  }
}

addModEventListener(FreeLabour);