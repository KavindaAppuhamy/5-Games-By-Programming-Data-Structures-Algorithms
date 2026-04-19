import { describe, it, expect, vi, afterEach } from 'vitest';
import { solveMinCost, fetchHistory } from './mincost';

describe('mincost API client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('solveMinCost', () => {
    it('should call fetch with correct URL and method', async () => {
      global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () =>
                Promise.resolve({
                  roundId: 'test-id',
                  n: 5,
                  totalCost: 500,
                  runtimeMs: 10,
                  algorithm: 'hungarian',
                  assignments: [],
                }),
          })
      );

      const payload = {
        n: 5,
        algorithm: 'hungarian',
        persist: false,
      };

      await solveMinCost(payload);

      expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/mincost/solve'),
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
      );
    });

    it('should send correct JSON payload', async () => {
      global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ totalCost: 500 }),
          })
      );

      const payload = {
        n: 50,
        minCost: 20,
        maxCost: 200,
        algorithm: 'greedy',
        persist: true,
      };

      await solveMinCost(payload);

      const callArgs = global.fetch.mock.calls[0];
      const bodyString = callArgs[1].body;
      const parsedBody = JSON.parse(bodyString);

      expect(parsedBody).toEqual(payload);
    });

    it('should return parsed JSON response', async () => {
      const mockResponse = {
        roundId: 'abc-123',
        n: 10,
        totalCost: 750,
        runtimeMs: 25,
        algorithm: 'hungarian',
        assignments: [{ agentIndex: 0, taskIndex: 0, cost: 75 }],
      };

      global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockResponse),
          })
      );

      const result = await solveMinCost({ n: 10, algorithm: 'hungarian' });

      expect(result).toEqual(mockResponse);
    });

    it('should throw error on non-ok response', async () => {
      global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            text: () => Promise.resolve('Server error'),
          })
      );

      await expect(solveMinCost({ n: 5 })).rejects.toThrow('Server error');
    });

    it('should throw error with default message on non-ok response without text', async () => {
      global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            text: () => Promise.resolve(''),
          })
      );

      await expect(solveMinCost({ n: 5 })).rejects.toThrow('Request failed');
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      await expect(solveMinCost({ n: 5 })).rejects.toThrow('Network error');
    });

    it('should construct URL with environment variable', async () => {
      global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ totalCost: 500 }),
          })
      );

      await solveMinCost({ n: 5 });

      const url = global.fetch.mock.calls[0][0];
      expect(url).toContain('api/mincost/solve');
    });
  });

  describe('fetchHistory', () => {
    it('should fetch history with default pagination', async () => {
      const mockData = {
        content: [
          { id: '1', n: 50, totalCost: 1000, runtimeMs: 15 },
          { id: '2', n: 75, totalCost: 1500, runtimeMs: 25 },
        ],
        totalElements: 2,
        totalPages: 1,
      };

      global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockData),
          })
      );

      const result = await fetchHistory();

      expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('page=0&size=20')
      );
      expect(result).toEqual(mockData);
    });

    it('should fetch history with custom pagination', async () => {
      global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: [], totalElements: 0 }),
          })
      );

      await fetchHistory(2, 10);

      expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('page=2&size=10')
      );
    });

    it('should include playerName when provided', async () => {
      global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: [], totalElements: 0 }),
          })
      );

      await fetchHistory(0, 20, 'Hari');

      expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('playerName=Hari')
      );
    });

    it('should not include empty playerName', async () => {
      global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: [], totalElements: 0 }),
          })
      );

      await fetchHistory(0, 20, '   ');

      const url = global.fetch.mock.calls[0][0];
      expect(url).not.toContain('playerName=');
    });

    it('should throw error on non-ok response', async () => {
      global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
          })
      );

      await expect(fetchHistory()).rejects.toThrow('Failed to fetch history');
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network unavailable')));

      await expect(fetchHistory()).rejects.toThrow('Network unavailable');
    });

    it('should return paginated response with content', async () => {
      const mockData = {
        content: Array(5)
            .fill(null)
            .map((_, i) => ({
              id: `id-${i}`,
              n: 50 + i * 10,
              totalCost: 1000 + i * 100,
              runtimeMs: 10 + i * 5,
            })),
        totalElements: 5,
        totalPages: 1,
        pageable: { pageNumber: 0, pageSize: 20 },
      };

      global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockData),
          })
      );

      const result = await fetchHistory(0, 20);

      expect(result.content).toHaveLength(5);
      expect(result.totalElements).toBe(5);
    });
  });
});
