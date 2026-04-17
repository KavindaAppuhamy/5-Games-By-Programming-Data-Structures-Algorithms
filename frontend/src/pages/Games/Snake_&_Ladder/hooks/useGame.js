import { useState, useCallback, useRef } from 'react'
import { gameApi } from '../services/api'
import toast from 'react-hot-toast'

export const GAME_PHASE = {
  SETUP: 'SETUP',
  PLAYING: 'PLAYING',
  RESULT: 'RESULT',
  LEADERBOARD: 'LEADERBOARD',
}

export function useGame() {
  const [phase, setPhase] = useState(GAME_PHASE.SETUP)
  const [boardSize, setBoardSize] = useState(8)
  const [playerName, setPlayerName] = useState('')
  const [gameData, setGameData] = useState(null)       // NewGameResponse
  const [result, setResult] = useState(null)           // SubmitAnswerResponse
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  const startTimer = () => {
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
  }

  const stopTimer = () => {
    clearInterval(timerRef.current)
    return Math.floor((Date.now() - startTimeRef.current) / 1000)
  }

  const startGame = useCallback(async () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name first!')
      return
    }
    if (playerName.trim().length < 2) {
      toast.error('Name must be at least 2 characters')
      return
    }
    setLoading(true)
    try {
      const data = await gameApi.newGame(boardSize)
      setGameData(data)
      setElapsedSeconds(0)
      setPhase(GAME_PHASE.PLAYING)
      startTimer()
      toast.success('Game started! Find the minimum dice throws.', { icon: '🎲' })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [boardSize, playerName])

  const submitAnswer = useCallback(async (chosenAnswer) => {
    if (!gameData) return
    const timeTaken = stopTimer()
    setLoading(true)
    try {
      const res = await gameApi.submitAnswer({
        gameRoundId: gameData.gameRoundId,
        playerName: playerName.trim(),
        playerAnswer: chosenAnswer,
        timeTakenSeconds: timeTaken,
      })
      setResult(res)
      setPhase(GAME_PHASE.RESULT)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [gameData, playerName])

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    try {
      const data = await gameApi.getLeaderboard()
      setLeaderboard(data)
      setPhase(GAME_PHASE.LEADERBOARD)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  const resetGame = useCallback(() => {
    stopTimer()
    setPhase(GAME_PHASE.SETUP)
    setGameData(null)
    setResult(null)
    setElapsedSeconds(0)
  }, [])

  return {
    phase, boardSize, setBoardSize,
    playerName, setPlayerName,
    gameData, result, leaderboard,
    loading, elapsedSeconds,
    startGame, submitAnswer, fetchLeaderboard, resetGame,
  }
}
