import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import GameMenu from './pages/Menu/gameMenu'
import MinCost from './pages/Games/Minimum_Cost_Assignment/MinCost'
import SnakeLadder from './pages/Games/Snake_&_Ladder/SnakeLadder'
import Traffic from './pages/Games/Traffic_Simulation/Traffic'
import KnightTour from './pages/Games/Knight’s_Tour/KnightTour'
import SixteenQueens from './pages/Games/Sixteen_Queens/SixteenQueens'
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
 

  return (
    <><BrowserRouter>
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
  )
}

export default App
