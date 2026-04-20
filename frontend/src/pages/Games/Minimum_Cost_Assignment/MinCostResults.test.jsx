// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import MinCostResults from "./MinCostResults";

describe("MinCostResults", () => {
  afterEach(() => {
    cleanup();
  });

  it("returns null when result is null", () => {
    const { container } = render(<MinCostResults result={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays task assignments heading and total cost", () => {
    const mockResult = {
      roundId: "abc-123",
      n: 5,
      algorithm: "hungarian",
      seed: 12345,
      totalCost: 500,
      runtimeMs: 15,
      assignments: [],
    };
    render(<MinCostResults result={mockResult} />);
    expect(screen.getByText(/Task Assignments/i)).toBeInTheDocument();
    expect(screen.getByText(/\$500/)).toBeInTheDocument();
  });

  it("displays assignments table with correct headers", () => {
    const mockResult = {
      roundId: "abc-123",
      n: 3,
      algorithm: "hungarian",
      seed: 33333,
      totalCost: 300,
      runtimeMs: 10,
      assignments: [],
    };
    render(<MinCostResults result={mockResult} />);
    // Searches strictly for the column headers so it doesn't get confused by the rows
    expect(
      screen.getByRole("columnheader", { name: /Employee/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Task/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Cost/i }),
    ).toBeInTheDocument();
  });

  it("displays all assignments in table rows", () => {
    const mockResult = {
      roundId: "abc-123",
      n: 3,
      algorithm: "hungarian",
      seed: 33333,
      totalCost: 300,
      runtimeMs: 10,
      assignments: [{ agentIndex: 0, taskIndex: 1, cost: 100 }],
    };
    render(<MinCostResults result={mockResult} />);
    expect(screen.getByText("Employee 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();
  });

  it("can open technical details accordion to see advanced stats", async () => {
    const mockResult = {
      roundId: "abc-123",
      n: 75,
      algorithm: "hungarian",
      seed: 12345,
      totalCost: 500,
      runtimeMs: 25,
      assignments: [],
    };
    render(<MinCostResults result={mockResult} />);

    // Find the technical details button
    const detailsButton = screen.getByText(/Technical Details/i);
    expect(detailsButton).toBeInTheDocument();

    // Have the test bot actually click the button to expand the UI!
    await userEvent.click(detailsButton);

    // Now that it is expanded, the test can "see" the hidden text
    expect(await screen.findByText(/75/)).toBeInTheDocument();
    expect(await screen.findByText(/hungarian/i)).toBeInTheDocument();
    expect(await screen.findByText(/25ms/)).toBeInTheDocument();
    expect(await screen.findByText(/abc-123/)).toBeInTheDocument();
  });
});
