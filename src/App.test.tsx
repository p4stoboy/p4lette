import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "./App";

afterEach(() => {
  window.history.pushState(null, "", "/");
});

describe("App routing", () => {
  it("renders the read-only share page for a /share?p= path", () => {
    window.history.pushState(null, "", "/share?p=ff3d00-0e5c9c-f4c430");
    render(<App />);
    expect(
      screen.getByRole("link", { name: /open in p4lette/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /mosaic/i })).toBeInTheDocument();
  });
});
