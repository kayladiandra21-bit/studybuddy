// Register Chart.js pieces once for the whole app
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Legend,
  Tooltip
);

export const BRAND = '#6366f1';
export const BRAND_SOFT = 'rgba(99, 102, 241, 0.15)';
export const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.15)' } },
  },
};
