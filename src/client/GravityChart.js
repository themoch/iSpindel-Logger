import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const GravityChart = ({ history }) => {
  const [timeWindow, setTimeWindow] = useState('all');

  // Filter history based on selected time window
  const filteredHistory = useMemo(() => {
    if (timeWindow === 'all' || !history || history.length === 0) {
      return history || [];
    }

    const now = Date.now();
    const timeWindows = {
      'hour': 60 * 60 * 1000,            // 1 hour in milliseconds
      '3hours': 3 * 60 * 60 * 1000,      // 3 hours
      '6hours': 6 * 60 * 60 * 1000,      // 6 hours
      '12hours': 12 * 60 * 60 * 1000,    // 12 hours
      'day': 24 * 60 * 60 * 1000,        // 1 day
      '3days': 3 * 24 * 60 * 60 * 1000,  // 3 days
      'week': 7 * 24 * 60 * 60 * 1000,   // 1 week
      'month': 30 * 24 * 60 * 60 * 1000  // 30 days
    };

    const cutoffTime = now - timeWindows[timeWindow];
    const filtered = history.filter(entry => {
      // Make sure timestamp exists and is a number
      const entryTimestamp = typeof entry.timestamp === 'number' ? entry.timestamp : 0;
      return entryTimestamp >= cutoffTime;
    });

    console.log(`Time window: ${timeWindow}, Cutoff: ${new Date(cutoffTime)}, Filtered: ${filtered.length}/${history.length}`);
    return filtered;
  }, [history, timeWindow]);
  // Prepare data for the chart
  const chartData = {
    labels: filteredHistory.map(entry => entry.time),
    datasets: [
      {
        label: 'Gravity',
        data: filteredHistory.map(entry => entry.gravity),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: 'y',
      },
      {
        label: 'Temperature',
        data: filteredHistory.map(entry => entry.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: 'y1',
      },
      {
        label: 'Battery',
        data: filteredHistory.map(entry => entry.battery),
        borderColor: 'rgb(255, 205, 86)',
        backgroundColor: 'rgba(255, 205, 86, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: 'y2',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 20,
          padding: 10,
          font: {
            size: 11,
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 6,
          font: {
            size: 10,
          }
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Gravity',
          font: {
            size: 10,
          }
        },
        grid: {
          color: 'rgba(75, 192, 192, 0.1)',
        },
        ticks: {
          font: {
            size: 10,
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Temp (°F)',
          font: {
            size: 10,
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          font: {
            size: 10,
          }
        }
      },
      y2: {
        type: 'linear',
        display: false,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          font: {
            size: 10,
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div style={{ padding: '10px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Showing {filteredHistory.length} data point{filteredHistory.length !== 1 ? 's' : ''}
        </div>
        <select
          value={timeWindow}
          onChange={(e) => setTimeWindow(e.target.value)}
          style={{
            padding: '5px 10px',
            fontSize: '12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="all">All Time</option>
          <option value="hour">Last 1 Hour</option>
          <option value="3hours">Last 3 Hours</option>
          <option value="6hours">Last 6 Hours</option>
          <option value="12hours">Last 12 Hours</option>
          <option value="day">Last 24 Hours</option>
          <option value="3days">Last 3 Days</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>
      </div>
      <div style={{ height: '150px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default GravityChart;

