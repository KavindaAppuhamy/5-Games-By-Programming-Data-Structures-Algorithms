const API_BASE_URL = 'http://localhost:8080/api/knights-tour';

export const knightsTourApi = {
  async solveTour(boardSize, startPosition) {
    try {
      const response = await fetch(`${API_BASE_URL}/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardSize, startPosition })
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  async verifyAnswer(playerAnswer, correctSolution) {
    return { correct: JSON.stringify(playerAnswer) === JSON.stringify(correctSolution) };
  },
  
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
};
