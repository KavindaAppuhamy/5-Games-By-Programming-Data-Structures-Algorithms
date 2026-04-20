import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MinCostControls from './MinCostControls';

describe('MinCostControls', () => {
  let mockOnRun;

  beforeEach(() => {
    mockOnRun = vi.fn();
  });

  it('renders all control elements', () => {
    render(<MinCostControls onRun={mockOnRun} />);

    expect(screen.getByText(/Random N/i)).toBeInTheDocument();
    expect(screen.getByText(/Min Cost/i)).toBeInTheDocument();
    expect(screen.getByText(/Max Cost/i)).toBeInTheDocument();
    expect(screen.getByText(/Algorithm/i)).toBeInTheDocument();
    expect(screen.getByText(/Persist/i)).toBeInTheDocument();
    expect(screen.getByText(/Run/i)).toBeInTheDocument();
  });

  it('has random N checkbox checked by default', () => {
    render(<MinCostControls onRun={mockOnRun} />);

    const randomNCheckbox = screen.getByRole('checkbox', { name: /Random N/i });
    expect(randomNCheckbox).toBeChecked();
  });

  it('has persist checkbox checked by default', () => {
    render(<MinCostControls onRun={mockOnRun} />);

    const persistCheckbox = screen.getByRole('checkbox', { name: /Persist/i });
    expect(persistCheckbox).toBeChecked();
  });

  it('shows N input when random N is unchecked', async () => {
    render(<MinCostControls onRun={mockOnRun} />);

    const randomNCheckbox = screen.getByRole('checkbox', { name: /Random N/i });
    await userEvent.click(randomNCheckbox);

    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
  });

  it('hides N input when random N is checked', async () => {
    render(<MinCostControls onRun={mockOnRun} />);

    const randomNCheckbox = screen.getByRole('checkbox', { name: /Random N/i });

    await userEvent.click(randomNCheckbox);
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();

    await userEvent.click(randomNCheckbox);
    expect(screen.queryAllByDisplayValue('50')).toHaveLength(0);
  });

  it('algorithm dropdown has correct options', () => {
    render(<MinCostControls onRun={mockOnRun} />);

    const algorithmSelect = screen.getByDisplayValue('hungarian');
    expect(algorithmSelect).toBeInTheDocument();

    const options = algorithmSelect.querySelectorAll('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('Hungarian (optimal)');
    expect(options[1]).toHaveTextContent('Greedy (fast)');
    expect(options[2]).toHaveTextContent('Both (compare)');
  });

  it('calls onRun with correct payload on button click', async () => {
    render(<MinCostControls onRun={mockOnRun} />);

    const runButton = screen.getByRole('button', { name: /Run/i });
    await userEvent.click(runButton);

    expect(mockOnRun).toHaveBeenCalledTimes(1);
    expect(mockOnRun).toHaveBeenCalledWith(
      expect.objectContaining({
        n: undefined,
        minCost: 20,
        maxCost: 200,
        algorithm: 'hungarian',
        persist: true,
      })
    );
  });

  it('sends specific N when random N is unchecked', async () => {
    render(<MinCostControls onRun={mockOnRun} />);

    const randomNCheckbox = screen.getByRole('checkbox', { name: /Random N/i });
    await userEvent.click(randomNCheckbox);

    const nInput = screen.getByDisplayValue('50');
    await userEvent.clear(nInput);
    await userEvent.type(nInput, '75');

    const runButton = screen.getByRole('button', { name: /Run/i });
    await userEvent.click(runButton);

    expect(mockOnRun).toHaveBeenCalledWith(
      expect.objectContaining({
        n: 75,
      })
    );
  });

  it('can change algorithm to greedy', async () => {
    render(<MinCostControls onRun={mockOnRun} />);

    const algorithmSelect = screen.getByDisplayValue('hungarian');
    await userEvent.selectOptions(algorithmSelect, 'greedy');

    const runButton = screen.getByRole('button', { name: /Run/i });
    await userEvent.click(runButton);

    expect(mockOnRun).toHaveBeenCalledWith(
      expect.objectContaining({
        algorithm: 'greedy',
      })
    );
  });

  it('can change algorithm to both', async () => {
    render(<MinCostControls onRun={mockOnRun} />);

    const algorithmSelect = screen.getByDisplayValue('hungarian');
    await userEvent.selectOptions(algorithmSelect, 'both');

    const runButton = screen.getByRole('button', { name: /Run/i });
    await userEvent.click(runButton);

    expect(mockOnRun).toHaveBeenCalledWith(
      expect.objectContaining({
        algorithm: 'both',
      })
    );
  });

  it('can toggle persist flag', async () => {
    render(<MinCostControls onRun={mockOnRun} />);

    const persistCheckbox = screen.getByRole('checkbox', { name: /Persist/i });
    await userEvent.click(persistCheckbox);

    const runButton = screen.getByRole('button', { name: /Run/i });
    await userEvent.click(runButton);

    expect(mockOnRun).toHaveBeenCalledWith(
      expect.objectContaining({
        persist: false,
      })
    );
  });

  it('can change min and max cost values', async () => {
    render(<MinCostControls onRun={mockOnRun} />);

    const inputs = screen.getAllByRole('spinbutton');
    const minCostInput = inputs[0];
    const maxCostInput = inputs[1];

    await userEvent.clear(minCostInput);
    await userEvent.type(minCostInput, '30');
    await userEvent.clear(maxCostInput);
    await userEvent.type(maxCostInput, '300');

    const runButton = screen.getByRole('button', { name: /Run/i });
    await userEvent.click(runButton);

    expect(mockOnRun).toHaveBeenCalledWith(
      expect.objectContaining({
        minCost: 30,
        maxCost: 300,
      })
    );
  });
});
