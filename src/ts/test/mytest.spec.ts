import {MainDoc} from "../app/MainDoc";

describe("MainDoc", () => {
  beforeEach(() => {
    loadFixtures("products/index.html");
  });
  it("should be created", () => {
    expect(new MainDoc()).toBeTruthy();
  });
  it("should find fixture", () => {
    const result = $("h1").text();
    expect(result).toBe("HELLO WORLD");
  });
});
