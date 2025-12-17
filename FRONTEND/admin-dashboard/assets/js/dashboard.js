// Initialize Charts
let attendanceChart;
let lastSundayChart;

document.addEventListener('DOMContentLoaded', async () => {
  initCharts();
  await fetchDashboardData();
});

function initCharts() {
  // Line Chart - Attendance (6 Weeks)
  const ctx1 = document.getElementById('attendanceChart').getContext('2d');
  attendanceChart = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: [], // To be filled
      datasets: [{
        label: 'Attendance',
        data: [], // To be filled
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // Doughnut Chart - Last Sunday's Attendance
  const ctx2 = document.getElementById('lastSundayChart').getContext('2d');
  lastSundayChart = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: ['Present', 'Absent'],
      datasets: [{
        data: [0, 0], // To be filled
        backgroundColor: ['#2563eb', '#e5e7eb'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: { legend: { display: false } }
    }
  });
}

async function fetchDashboardData() {
  try {
    // 1. Total Members
    const { count: totalMembers, error: err1 } = await supabase
      .from('Members')
      .select('*', { count: 'exact', head: true });

    if (!err1) updateCard('totalMembers', totalMembers);

    // 2. New Members (This Month)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { count: newMembers, error: err2 } = await supabase
      .from('Members')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth);

    if (!err2) updateCard('newMembers', newMembers);

    // 3. Departments Count
    // Supabase doesn't have a direct "distinct count" in one query easily without RPC, 
    // getting all departments and counting unique sets in JS for now (assuming < 10k members)
    const { data: deptData, error: err3 } = await supabase
      .from('Members')
      .select('department');

    if (!err3 && deptData) {
      const uniqueDepts = new Set(deptData.map(d => d.department)).size;
      updateCard('totalDepartments', uniqueDepts);
    }

    // 4. Attendance Stats & Charts
    // Fetch aggregated attendance data
    // For line chart: last 6 "events" (dates) aggregated
    const { data: attendanceData, error: err4 } = await supabase
      .from('Attendance')
      .select('date, status, service')
      .order('date', { ascending: true }); // Get all to process

    if (!err4 && attendanceData) {
      processAttendanceData(attendanceData);
    }

  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

function updateCard(id, value) {
  // We need to add IDs to the HTML elements to make this work reliably
  // Or we rely on the specific order which is brittle.
  // Let's assume we will update HTML to include IDs: #totalMembersVal, #newMembersVal, #avgAttendanceVal, #deptVal
  const el = document.getElementById(id);
  if (el) el.textContent = value.toLocaleString();
}

function processAttendanceData(data) {
  // --- 1. Average Attendance ---
  // Group by date
  const attendanceByDate = {};
  data.forEach(r => {
    if (!attendanceByDate[r.date]) attendanceByDate[r.date] = { total: 0, present: 0, absent: 0 };
    attendanceByDate[r.date].total++;
    if (r.status === 'Present') attendanceByDate[r.date].present++;
    if (r.status === 'Absent') attendanceByDate[r.date].absent++;
  });

  const dates = Object.keys(attendanceByDate).sort();

  // Average
  if (dates.length > 0) {
    const totalAttendance = dates.reduce((sum, date) => sum + attendanceByDate[date].present, 0);
    const avg = Math.round(totalAttendance / dates.length);
    updateCard('avgAttendance', avg);
  } else {
    updateCard('avgAttendance', 0);
  }

  // --- 2. Line Chart (Last 6 entries) ---
  const recentDates = dates.slice(-6);
  const chartLabels = recentDates.map(d => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
  const chartData = recentDates.map(d => attendanceByDate[d].present);

  attendanceChart.data.labels = chartLabels;
  attendanceChart.data.datasets[0].data = chartData;
  attendanceChart.update();

  // --- 3. Donut Chart (Last Entry) ---
  if (dates.length > 0) {
    const lastDate = dates[dates.length - 1];
    const lastStats = attendanceByDate[lastDate];
    const present = lastStats.present;
    const absent = lastStats.absent;
    const total = present + absent;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    lastSundayChart.data.datasets[0].data = [present, absent];
    lastSundayChart.update();

    // Update Center Text
    const centerText = document.querySelector('.donut-center strong');
    if (centerText) centerText.textContent = percentage + '%';
  }
}
