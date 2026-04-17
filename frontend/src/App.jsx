import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import './App.css';

import GameMenu from './pages/Menu/gameMenu';
import MinCost from './pages/Games/Minimum_Cost_Assignment/MinCost';
import SnakeLadder from './pages/Games/Snake_&_Ladder/SnakeLadder';
import Traffic from './pages/Games/Traffic_Simulation/Traffic';
import KnightTour from './pages/Games/Knight’s_Tour/KnightTour';
import SixteenQueens from './pages/Games/Sixteen_Queens/SixteenQueens';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#12121f',
            color: '#e8e8f0',
            border: '1px solid #1e1e35',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
          },
          success: {
            iconTheme: {
              primary: '#00ff88',
              secondary: '#0a0a12',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff4466',
              secondary: '#0a0a12',
            },
          },
        }}
      />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GameMenu />} />
          <Route path="/min-cost" element={<MinCost />} />
          <Route path="/snake-ladder" element={<SnakeLadder />} />
          <Route path="/traffic" element={<Traffic />} />
          <Route path="/knight-tour" element={<KnightTour />} />
          <Route path="/sixteen-queens" element={<SixteenQueens />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;