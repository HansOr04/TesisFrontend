import { describe, expect, it } from "vitest";
import { formatDateOnly, parseDateOnly, toInputDate } from "./date-only";

describe("date-only", () => {
  it("toma el día guardado por el servidor, no el de la zona horaria", () => {
    const date = parseDateOnly("2026-11-10T00:00:00.000Z");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(10);
    expect(date.getDate()).toBe(10);
  });

  it("formatea el mismo día que se ingresó", () => {
    expect(
      formatDateOnly("2027-02-26T00:00:00.000Z", "es-EC", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    ).toBe("26/02/2027");
    expect(formatDateOnly("sin fecha")).toBe("—");
  });

  it("arma la fecha del campo con el día local", () => {
    // 23:30 del 9 de noviembre en hora local: sigue siendo el 9.
    expect(toInputDate(new Date(2026, 10, 9, 23, 30))).toBe("2026-11-09");
  });
});
