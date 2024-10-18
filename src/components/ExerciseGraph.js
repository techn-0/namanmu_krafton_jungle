import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js';
import { Line, Radar } from 'react-chartjs-2';
import './ExerciseGraph.css';

// Chart.js에 필요한 구성 요소 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

const ExerciseGraph = () => {
  // 임의의 운동 기록 데이터 (꺾은선 그래프용)
  const data = {
    labels: ['2024-10-10', '2024-10-11', '2024-10-12', '2024-10-13', '2024-10-14'],
    datasets: [
      {
        label: 'Push-ups',
        data: [20, 25, 30, 35, 40],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Squats',
        data: [15, 20, 25, 30, 35],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Plank(minutes)',
        data: [1, 1.5, 2, 2.5, 3],
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // 최고 기록 (레이더 차트용)
  const radarData = {
    labels: ['Push-ups', 'Squats', 'Plank(minutes)'],
    datasets: [
      {
        label: '최고 기록',
        data: [40, 35, 3],  // 각 운동의 최고 기록
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const radarOptions = {
    responsive: true,
    scale: {
      ticks: { beginAtZero: true, max: 60 },
    },
  };

  return (
    <><div  style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#fff', boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
      {/* Return 버튼 */}
      <button className="Btn" style={{ marginBottom: '20px' }}>
        <div className="sign">
          <svg viewBox="0 0 512 512">
            <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
          </svg>
        </div>
        <div className="text">Return</div>
      </button>

      {/* 그래프 블록 */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* 꺾은선 그래프 */}
        <div style={{ padding: '20px', width: '600px', background: '#fff' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>나의 기록</h2>
          <Line data={data} options={options} />
        </div>

        {/* 레이더 차트 */}
        <div style={{ padding: '20px', width: '400px', background: '#fff' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>최고 기록</h2>
          <Radar data={radarData} options={radarOptions} />
        </div>
      </div>
    </div>
    </>
  );
};

export default ExerciseGraph;
