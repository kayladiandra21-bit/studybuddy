// Doughnut: task distribution per subject
import { Doughnut } from 'react-chartjs-2';
import { PALETTE } from './setup';

export default function SubjectDonutChart({ subjects = [] }) {
  return (
    <div className="h-56">
      <Doughnut
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: '62%',
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true } } },
        }}
        data={{
          labels: subjects.map((s) => s.subject),
          datasets: [
            {
              data: subjects.map((s) => s.total),
              backgroundColor: subjects.map((_, i) => PALETTE[i % PALETTE.length]),
              borderWidth: 0,
            },
          ],
        }}
      />
    </div>
  );
}
