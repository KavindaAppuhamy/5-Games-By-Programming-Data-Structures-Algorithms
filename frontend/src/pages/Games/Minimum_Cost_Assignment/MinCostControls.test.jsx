// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest"; 
import MinCostControls from "./MinCostControls";

describe("MinCostControls", () => {
  let mockOnRun;

  beforeEach(() => {
    mockOnRun = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders all control elements", () => {
    render(<MinCostControls onRun={mockOnRun} />);
    expect(screen.getByLabelText(/Random N/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Min Cost/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Max Cost/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Run/i })).toBeInTheDocument();
  });

  it("has random N checkbox checked by default", () => {
    render(<MinCostControls onRun={mockOnRun} />);
    expect(screen.getByLabelText(/Random N/i)).toBeChecked();
  });

  it("algorithm dropdown has correct options", () => {
    render(<MinCostControls onRun={mockOnRun} />);
    const select = screen.getByLabelText(/Algorithm/i);
    expect(select).toBeInTheDocument();
  });

  it("can change algorithm to greedy", async () => {
    render(<MinCostControls onRun={mockOnRun} />);
    const select = screen.getByLabelText(/Algorithm/i);
    await userEvent.selectOptions(select, "greedy");
    expect(select.value).toBe("greedy");
  });

  it("can change algorithm to both", async () => {
    render(<MinCostControls onRun={mockOnRun} />);
    const select = screen.getByLabelText(/Algorithm/i);
    await userEvent.selectOptions(select, "both");
    expect(select.value).toBe("both");
  });

  it("shows Auto-save label instead of persist checkbox", () => {
    render(<MinCostControls onRun={mockOnRun} />);
    expect(screen.getByText(/Auto-save: On/i)).toBeInTheDocument();
  });

  it("calls onRun with correct payload on button click", async () => {
    render(<MinCostControls onRun={mockOnRun} />);
    const runButton = screen.getByRole("button", { name: /Run/i });
    await userEvent.click(runButton);
    expect(mockOnRun).toHaveBeenCalled();
  });
});
