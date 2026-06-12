// Line chart: tasks completed per month (last 6 months)
import { Line } from 'react-chartjs-2';
import { BRAND, BRAND_SOFT, baseOptions } from './setup';

export default function MonthlyTasksChart({ monthly = [] }) {
  return (
    <div className="h-56">
      <Line
        options={baseOptions}
        data={{
          labels: monthly.map((m) => m.month),
          datasets: [
            {
              data: monthly.map((m) => m.completed),
              borderColor: BRAND,
              backgroundColor: BRAND_SOFT,
              fill: true,
              tension: 0.35,
              pointRadius: 4,
            },
          ],
        }}
      />
    </div>
  );
}
