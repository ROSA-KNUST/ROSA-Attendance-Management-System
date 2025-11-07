// Line Chart - Attendance (6 Weeks)
const ctx1 = document.getElementById('attendanceChart').getContext('2d');
new Chart(ctx1, {
  type: 'line',
  data: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [{
      label: 'Attendance',
      data: [500, 650, 600, 700, 550, 675],
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    },
    scales: { 
      y: { 
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6b7280',
          font: { size: 12 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: { size: 12 }
        }
      }
    }
  }
});

// Doughnut Chart - Last Sunday's Attendance
const ctx2 = document.getElementById('lastSundayChart').getContext('2d');
new Chart(ctx2, {
  type: 'doughnut',
  data: {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [75, 25],
      backgroundColor: ['#2563eb', '#e5e7eb'],
      borderWidth: 0
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed + '%';
            return label;
          }
        }
      }
    }
  }
});
