import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MinCostResults from "./MinCostResults";

describe("MinCostResults", () => {
  it("returns null when result is null", () => {
    const { container } = render(<MinCostResults result={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays result when provided", () => {
    const mockResult = {
      roundId: "abc-123",
      n: 5,
      algorithm: "hungarian",
      seed: 12345,
      totalCost: 500,
      runtimeMs: 15,
      assignments: [
        { agentIndex: 0, taskIndex: 0, cost: 100 },
        { agentIndex: 1, taskIndex: 1, cost: 100 },
      ],
    };

    render(<MinCostResults result={mockResult} />);

    expect(screen.getByText(/Round:/i)).toBeInTheDocument();
    expect(screen.getByText("abc-123")).toBeInTheDocument();
  });

  it("displays N value correctly", () => {
    const mockResult = {
      roundId: "abc-123",
      n: 75,
      algorithm: "greedy",
      seed: 67890,
      totalCost: 750,
      runtimeMs: 8,
      assignments: [],
    };

    render(<MinCostResults result={mockResult} />);

    expect(screen.getByText(/N: 75/)).toBeInTheDocument();
  });

  it("displays algorithm name", () => {
    const mockResult = {
      roundId: "abc-123",
      n: 10,
      algorithm: "hungarian",
      seed: 11111,
      totalCost: 300,
      runtimeMs: 20,
      assignments: [],
    };

    render(<MinCostResults result={mockResult} />);

    expect(screen.getByText(/hungarian/)).toBeInTheDocument();
  });

  it("displays total cost", () => {
    const mockResult = {
      roundId: "abc-123",
      n: 10,
      algorithm: "hungarian",
      seed: 11111,
      totalCost: 1257,
      runtimeMs: 20,
      assignments: [],
    };

    render(<MinCostResults result={mockResult} />);

    expect(screen.getByText(/1257/)).toBeInTheDocument();
  });

  it("displays runtime in milliseconds", () => {
    const mockResult = {
      roundId: "abc-123",
      n: 50,
      algorithm: "greedy",
      seed: 22222,
      totalCost: 2000,
      runtimeMs: 25,
      assignments: [],
    };

    render(<MinCostResults result={mockResult} />);

    expect(screen.getByText(/25ms/)).toBeInTheDocument();
  });

  it("displays assignments table with headers", () => {
    const mockResult = {
      roundId: "abc-123",
      n: 3,
      algorithm: "hungarian",
      seed: 33333,
      totalCost: 300,
      runtimeMs: 10,
      assignments: [
        { agentIndex: 0, taskIndex: 1, cost: 100 },
        { agentIndex: 1, taskIndex: 0, cost: 110 },
        { agentIndex: 2, taskIndex: 2, cost: 90 },
      ],
    };

    render(<MinCostResults result={mockResult} />);

    expect(screen.getByText(/Agent/)).toBeInTheDocument();
    expect(screen.getByText(/Task/)).toBeInTheDocument();
    expect(screen.getByText(/Cost/)).toBeInTheDocument();
  });

  it("displays all assignments in table", () => {
    const mockResult = {
      roundId: "abc-123",
      n: 3,
      algorithm: "hungarian",
      seed: 33333,
      totalCost: 300,
      runtimeMs: 10,
      assignments: [
        { agentIndex: 0, taskIndex: 1, cost: 100 },
        { agentIndex: 1, taskIndex: 0, cost: 110 },
        { agentIndex: 2, taskIndex: 2, cost: 90 },
      ],
    };

    render(<MinCostResults result={mockResult} />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("110")).toBeInTheDocument();
    expect(screen.getByText("90")).toBeInTheDocument();
  });

  it("formats cost with dollar sign", () => {
    const mockResult = {
      roundId: "abc-123",
      n: 2,
      algorithm: "greedy",
      seed: 44444,
      totalCost: 200,
      runtimeMs: 5,
      assignments: [
        { agentIndex: 0, taskIndex: 0, cost: 100 },
        { agentIndex: 1, taskIndex: 1, cost: 100 },
      ],
    };

    render(<MinCostResults result={mockResult} />);

    const dollarSigns = screen.getAllByText(/\$/);
    expect(dollarSigns.length).toBeGreaterThan(0);
  });

  it("shows Assignments heading", () => {
    const mockResult = {
      roundId: "abc-123",
      n: 5,
      algorithm: "hungarian",
      seed: 55555,
      totalCost: 500,
      runtimeMs: 15,
      assignments: [{ agentIndex: 0, taskIndex: 0, cost: 100 }],
    };

    render(<MinCostResults result={mockResult} />);

    expect(screen.getByText(/Assignments/)).toBeInTheDocument();
  });

  it("handles empty assignments array", () => {
    const mockResult = {
      roundId: "abc-123",
      n: 0,
      algorithm: "hungarian",
      seed: 66666,
      totalCost: 0,
      runtimeMs: 0,
      assignments: [],
    };

    render(<MinCostResults result={mockResult} />);

    expect(screen.getByText(/Assignments/)).toBeInTheDocument();
    const rows = screen.queryAllByRole("row");
    // Header row only
    expect(rows.length).toBe(1);
  });

  it("displays result with large numbers", () => {
    const mockResult = {
      roundId: "xyz-999",
      n: 100,
      algorithm: "both",
      seed: 999999,
      totalCost: 12500,
      runtimeMs: 450,
      assignments: Array(10)
        .fill(null)
        .map((_, i) => ({
          agentIndex: i,
          taskIndex: i,
          cost: 1250,
        })),
    };

    render(<MinCostResults result={mockResult} />);

    expect(screen.getByText(/12500/)).toBeInTheDocument();
    expect(screen.getByText(/450ms/)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });
});
