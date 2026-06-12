// hooks/usePomodoro.js — the timer state machine.
// Phases: focus → break → focus … Completed FOCUS phases are logged to the API.
import { useEffect, useRef, useState } from 'react';
import { pomodoroService } from '../services/pomodoroService';

export default function usePomodoro({ onSessionLogged } = {}) {
  const [focusMin, setFocusMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [phase, setPhase] = useState('focus'); // 'focus' | 'break'
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  // keep the displayed time in sync when durations change while idle
  useEffect(() => {
    if (!running) setSecondsLeft((phase === 'focus' ? focusMin : breakMin) * 60);
  }, [focusMin, breakMin, phase]); // eslint-disable-line

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        clearInterval(intervalRef.current);
        handlePhaseEnd();
        return 0;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]); // eslint-disable-line

  async function handlePhaseEnd() {
    setRunning(false);
    if (phase === 'focus') {
      // log the completed focus session
      try {
        const res = await pomodoroService.logSession(focusMin);
        onSessionLogged?.(res.data);
      } catch { /* offline? stats just won't update */ }
      setPhase('break');
      setSecondsLeft(breakMin * 60);
    } else {
      setPhase('focus');
      setSecondsLeft(focusMin * 60);
    }
  }

  function start() { setRunning(true); }
  function pause() { setRunning(false); }
  function reset() {
    setRunning(false);
    setPhase('focus');
    setSecondsLeft(focusMin * 60);
  }
  function skipBreak() {
    if (phase !== 'break') return;
    setRunning(false);
    setPhase('focus');
    setSecondsLeft(focusMin * 60);
  }

  const total = (phase === 'focus' ? focusMin : breakMin) * 60;
  const progress = total ? 1 - secondsLeft / total : 0;

  return {
    focusMin, setFocusMin, breakMin, setBreakMin,
    phase, secondsLeft, running, progress,
    start, pause, reset, skipBreak,
  };
}
