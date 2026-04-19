import { useState, useCallback, useRef, useEffect } from 'react'
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
  const [gameData, setGameData] = useState(null)
  const [result, setResult] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  // ✅ START TIMER (safe)
  const startTimer = () => {
    if (timerRef.current) return // prevent duplicate timers

    startTimeRef.current = Date.now()

    timerRef.current = setInterval(() => {
      if (!startTimeRef.current) return
      setElapsedSeconds(
        Math.floor((Date.now() - startTimeRef.current) / 1000)
      )
    }, 1000)
  }

  // ✅ STOP TIMER (safe)
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (!startTimeRef.current) return 0

    const time = Math.floor(
      (Date.now() - startTimeRef.current) / 1000
    )

    startTimeRef.current = null
    return time
  }

  // ✅ CLEANUP on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

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
      toast.error('Failed to start game')
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
      toast.error('Failed to submit answer')
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
      toast.error('Failed to load leaderboard')
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
    phase,
    boardSize, setBoardSize,
    playerName, setPlayerName,
    gameData, result, leaderboard,
    loading, elapsedSeconds,
    startGame, submitAnswer, fetchLeaderboard, resetGame,
  }
}