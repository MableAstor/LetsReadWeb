
import { useEffect, useState } from "react";

const PAUSE_DURATION = 20 * 60;

export default function usePauseTimer() {
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseExpired, setPauseExpired] = useState(false);
  const [pauseDeadline, setPauseDeadline] = useState(null);
  const [pauseRemaining, setPauseRemaining] = useState(PAUSE_DURATION);

  useEffect(() => {
    if (!isPaused || !pauseDeadline) return;

    const updatePauseTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil((pauseDeadline - Date.now()) / 1000),
      );

      setPauseRemaining(remaining);

      if (remaining === 0) {
        setPauseExpired(true);
        setShowPauseModal(true);
      }
    };

    updatePauseTimer();

    const timer = setInterval(updatePauseTimer, 1000);

    return () => clearInterval(timer);
  }, [isPaused, pauseDeadline]);

  const formatPauseTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  const startPause = () => {
    setPauseRemaining(PAUSE_DURATION);
    setPauseExpired(false);
    setPauseDeadline(Date.now() + PAUSE_DURATION * 1000);
    setIsPaused(true);
    setShowPauseModal(true);
  };

  const resumeSwipe = () => {
    setIsPaused(false);
    setPauseDeadline(null);
    setPauseExpired(false);
    setPauseRemaining(PAUSE_DURATION);
    setShowPauseModal(false);
  };

  const openPauseModal = () => {
    setShowPauseModal(true);
  };

  const handlePauseOpenChange = (open) => {
    // ระหว่างพักไม่ให้ปิดหน้าต่างโดยไม่เลือกการทำงาน
    if (open || !isPaused) {
      setShowPauseModal(open);
    }
  };

  return {
    isPaused,
    showPauseModal,
    pauseExpired,
    pauseRemaining,
    formatPauseTime,
    startPause,
    resumeSwipe,
    openPauseModal,
    handlePauseOpenChange,
  };
}
