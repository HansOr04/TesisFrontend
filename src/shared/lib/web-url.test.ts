import { describe, expect, it } from "vitest";
import { webUrl } from "./web-url";

describe("webUrl", () => {
  it("acepta direcciones http y https", () => {
    expect(webUrl(" https://drive.example/acta.pdf ")).toBe(
      "https://drive.example/acta.pdf"
    );
    expect(webUrl("http://example.com")).toBe("http://example.com/");
  });

  it("rechaza lo demás", () => {
    for (const text of [
      "javascript:alert(1)",
      "data:text/html,x",
      "acta en la oficina",
      "",
      null,
      undefined,
    ]) {
      expect(webUrl(text)).toBeNull();
    }
  });
});
