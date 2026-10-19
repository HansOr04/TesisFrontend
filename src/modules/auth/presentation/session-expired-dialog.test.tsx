import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SessionExpiredDialog } from "./session-expired-dialog";

vi.mock("@/shared/i18n/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const password = () => screen.getByLabelText("app.login.password");
const resumeButton = () =>
  screen.getByRole("button", { name: "app.session.expiredResume" });

describe("SessionExpiredDialog (RNF-02, HU-25)", () => {
  it("asks for the password of the current account", () => {
    render(
      <SessionExpiredDialog
        email="facilitador@terra360.org"
        onResume={vi.fn()}
        onLogout={vi.fn()}
      />
    );

    expect(screen.getByText("app.session.expiredTitle")).toBeInTheDocument();
    expect(screen.getByDisplayValue("facilitador@terra360.org")).toBeDisabled();
    expect(resumeButton()).toBeDisabled();
  });

  it("resumes the session with the typed password, also with Enter", async () => {
    const onResume = vi.fn().mockResolvedValue(undefined);
    render(
      <SessionExpiredDialog
        email="a@b.org"
        onResume={onResume}
        onLogout={vi.fn()}
      />
    );

    fireEvent.change(password(), { target: { value: "clave-segura" } });
    fireEvent.keyDown(password(), { key: "Enter" });

    await waitFor(() => expect(onResume).toHaveBeenCalledWith("clave-segura"));
    await waitFor(() => expect(password()).toHaveValue(""));
  });

  it("stays open and shows the error when the password is wrong", async () => {
    const onResume = vi
      .fn()
      .mockRejectedValue(new Error("Credenciales inválidas"));
    render(
      <SessionExpiredDialog
        email="a@b.org"
        onResume={onResume}
        onLogout={vi.fn()}
      />
    );

    fireEvent.change(password(), { target: { value: "incorrecta" } });
    fireEvent.click(resumeButton());

    expect(
      await screen.findByText("Credenciales inválidas")
    ).toBeInTheDocument();
    expect(screen.getByText("app.session.expiredTitle")).toBeInTheDocument();
    expect(password()).toHaveValue("incorrecta");
  });

  it("cannot be dismissed with Escape, only by resuming or logging out", () => {
    const onLogout = vi.fn();
    render(
      <SessionExpiredDialog
        email="a@b.org"
        onResume={vi.fn()}
        onLogout={onLogout}
      />
    );

    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    expect(screen.getByText("app.session.expiredTitle")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "app.session.expiredLogout" })
    );
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
