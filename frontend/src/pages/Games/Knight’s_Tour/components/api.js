// API service for Knight's Tour game
const API_BASE_URL = 'http://localhost:8082/api/knights-tour';

export const knightsTourApi = {
  // Solve the knight's tour puzzle
  async solveTour(boardSize, startPosition) {
    try {
      const response = await fetch(`${API_BASE_URL}/solve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardSize: boardSize,
          startPosition: startPosition
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Verify player's answer
  async verifyAnswer(playerAnswer, correctSolution) {
    try {
      const response = await fetch(`${API_BASE_URL}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: playerAnswer,
          correctSolution: correctSolution
        })
      });
      
      const data = await response.json();
      return data.correct;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  },
  
  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
};