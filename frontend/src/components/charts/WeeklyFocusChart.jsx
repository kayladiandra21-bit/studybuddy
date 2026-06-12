// Bar chart: focus hours per day for the last 7 days
import { Bar } from 'react-chartjs-2';
import { BRAND, baseOptions } from './setup';

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeeklyFocusChart({ weekly = [] }) {
  // Build the last 7 days, fill missing days with 0
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const row = weekly.find((w) => String(w.session_date).slice(0, 10) === key);
    return { label: DAY[d.getDay()], hours: row ? +(row.minutes / 60).toFixed(1) : 0 };
  });

  return (
    <div className="h-56">
      <Bar
        options={baseOptions}
        data={{
          labels: days.map((d) => d.label),
          datasets: [{ data: days.map((d) => d.hours), backgroundColor: BRAND, borderRadius: 8, maxBarThickness: 36 }],
        }}
      />
    </div>
  );
}
