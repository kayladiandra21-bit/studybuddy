// pages/Pomodoro.jsx — circular timer + stats + achievements
import { useState } from 'react';
import usePomodoro from '../hooks/usePomodoro';
import useFetch from '../hooks/useFetch';
import { pomodoroService } from '../services/pomodoroService';
import StatCard from '../components/StatCard';
import WeeklyFocusChart from '../components/charts/WeeklyFocusChart';
import '../components/charts/setup';

const ACHIEVEMENTS = [
  { tier: 'bronze', icon: '🥉', need: 5, label: 'Bronze' },
  { tier: 'silver', icon: '🥈', need: 10, label: 'Silver' },
  { tier: 'gold', icon: '🥇', need: 20, label: 'Gold' },
];

function fmt(s) {
  const m = String(Math.floor(s / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${m}:${sec}`;
}

export default function Pomodoro() {
  const { data, refetch } = useFetch(() => pomodoroService.stats());
  const [toast, setToast] = useState('');

  const timer = usePomodoro({
    onSessionLogged: (res) => {
      refetch();
      setToast(
        res.achievement
          ? `Session logged! Achievement unlocked: ${res.achievement.toUpperCase()} 🏆`
          : 'Focus session logged! Time for a break ☕'
      );
      setTimeout(() => setToast(''), 5000);
    },
  });

  const stats = data || {};
  const sessionsToday = stats.today?.sessions || 0;
  const isFocus = timer.phase === 'focus';

  // SVG circle progress
  const R = 88;
  const CIRC = 2 * Math.PI * R;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pomodoro Timer</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Focus {timer.focusMin} min · Break {timer.breakMin} min
        </p>
      </div>

      {toast && (
        <div className="card border-l-4 border-emerald-500 py-3 text-sm font-medium animate-fade-up">
          {toast}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Timer card */}
        <div className="card flex flex-col items-center py-8">
          <span className={`mb-4 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider ${
            isFocus
              ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
          }`}>
            {isFocus ? '🎯 Focus time' : '☕ Break time'}
          </span>

          <div className="relative">
            <svg width="220" height="220" className="-rotate-90">
              <circle cx="110" cy="110" r={R} fill="none" strokeWidth="12"
                className="stroke-slate-100 dark:stroke-slate-800" />
              <circle cx="110" cy="110" r={R} fill="none" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - timer.progress)}
                className={`transition-all duration-1000 ${isFocus ? 'stroke-brand-500' : 'stroke-emerald-500'}`} />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <span className="font-mono text-5xl font-bold tabular-nums">{fmt(timer.secondsLeft)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex gap-2">
            {!timer.running ? (
              <button className="btn-primary px-8" onClick={timer.start}>
                {timer.progress > 0 ? 'Resume' : 'Start'}
              </button>
            ) : (
              <button className="btn-primary px-8" onClick={timer.pause}>Pause</button>
            )}
            <button className="btn-ghost ring-1 ring-slate-200 dark:ring-slate-700" onClick={timer.reset}>Reset</button>
            {timer.phase === 'break' && (
              <button className="btn-ghost" onClick={timer.skipBreak}>Skip break ⏭</button>
            )}
          </div>

          {/* Custom durations */}
          <div className="mt-6 grid w-full max-w-xs grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Focus (min)</label>
              <input type="number" min="5" max="120" className="input" value={timer.focusMin}
                disabled={timer.running}
                onChange={(e) => timer.setFocusMin(Math.max(1, Number(e.target.value)))} />
            </div>
            <div>
              <label className="label text-xs">Break (min)</label>
              <input type="number" min="1" max="60" className="input" value={timer.breakMin}
                disabled={timer.running}
                onChange={(e) => timer.setBreakMin(Math.max(1, Number(e.target.value)))} />
            </div>
          </div>
        </div>

        {/* Stats column */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon="📅" label="Today" value={`${stats.today?.hours ?? 0}h`} sub={`${sessionsToday} sessions`} />
            <StatCard icon="🔥" label="Streak" value={`${stats.streak ?? 0} days`} />
            <StatCard icon="⏱️" label="All-time focus" value={`${stats.totals?.total_hours ?? 0}h`} />
            <StatCard icon="✔️" label="Total sessions" value={stats.totals?.total_sessions ?? 0} />
          </div>

          {/* Achievements */}
          <div className="card">
            <h2 className="mb-3 font-semibold">Today's achievements</h2>
            <div className="grid grid-cols-3 gap-3">
              {ACHIEVEMENTS.map((a) => {
                const unlocked = sessionsToday >= a.need;
                return (
                  <div key={a.tier}
                    className={`rounded-2xl p-3 text-center ring-1 transition ${
                      unlocked
                        ? 'bg-amber-50 ring-amber-200 dark:bg-amber-500/10 dark:ring-amber-500/25'
                        : 'opacity-45 ring-slate-200 dark:ring-slate-700'
                    }`}>
                    <div className="text-3xl">{a.icon}</div>
                    <p className="mt-1 text-sm font-semibold">{a.label}</p>
                    <p className="text-xs text-slate-400">
                      {unlocked ? 'Unlocked!' : `${sessionsToday}/${a.need} sessions`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h2 className="mb-3 font-semibold">This week</h2>
            <WeeklyFocusChart weekly={stats.weekly} />
          </div>
        </div>
      </div>
    </div>
  );
}
