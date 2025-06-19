import { useState, useEffect } from "react"

export const useCountdown = (initialSeconds: number) => {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1)
      }, 1000)
    } else if (seconds === 0) {
      setIsActive(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, seconds])

  const start = () => {
    setSeconds(initialSeconds)
    setIsActive(true)
  }

  const stop = () => {
    setIsActive(false)
  }

  const reset = () => {
    setSeconds(initialSeconds)
    setIsActive(false)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return {
    seconds,
    isActive,
    start,
    stop,
    reset,
    formatTime: formatTime(seconds),
    isFinished: seconds === 0
  }
} 