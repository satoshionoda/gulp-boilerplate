import { MainDoc } from "./MainDoc";

export class TopDoc extends MainDoc {
  constructor() {
    super();
  }

  protected onReady() {
    console.log("hello this is top");
  }
}
