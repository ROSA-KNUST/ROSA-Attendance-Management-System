// Initialize charts when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    setupEventListeners();
    loadMockData();
    // populate initial quick stats
    updateQuickStats();
});

// Setup event listeners
function setupEventListeners() {
    // Generate report button
    document.querySelector('.generate-btn').addEventListener('click', generateReport);
    
    // Export buttons
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const format = this.dataset.format;
            exportReport(format);
        });
    });

    // Date picker inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.addEventListener('change', updateDateRange);
    });
}

// Initialize all charts
function initializeCharts() {
    // Use the canvas IDs present in reports.html and fill with dummy data
    // Weekly Attendance (line)
    const attendanceCtx = document.getElementById('attendanceChart').getContext('2d');
    new Chart(attendanceCtx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            datasets: [{
                label: 'Attendance',
                data: [520, 630, 590, 680, 540, 610],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.12)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Department distribution (doughnut)
    const deptCtx = document.getElementById('departmentChart').getContext('2d');
    new Chart(deptCtx, {
        type: 'doughnut',
        data: {
            labels: ['Worship', 'Youth', 'Choir', 'Ushering'],
            datasets: [{ data: [35, 25, 20, 20], backgroundColor: ['#2563eb','#60a5fa','#93c5fd','#bfdbfe'] }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    // Attendance by Event Type (bar) - replace age demographics with this more actionable chart
    const eventTypeCtx = document.getElementById('eventTypeChart').getContext('2d');
    new Chart(eventTypeCtx, {
        type: 'bar',
        data: {
            labels: ['Sunday', 'Wednesday', 'Friday', 'Special'],
            datasets: [{
                label: 'Average Attendance',
                data: [680, 320, 180, 120],
                backgroundColor: ['#2563eb', '#60a5fa', '#93c5fd', '#bfdbfe']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } }
        }
    });

    // Growth metrics (small area/line)
    const growthCtx = document.getElementById('growthChart').getContext('2d');
    new Chart(growthCtx, {
        type: 'line',
        data: {
            labels: ['Jan','Feb','Mar','Apr','May','Jun'],
            datasets: [{ label: 'Growth %', data: [1.2, 1.4, 1.3, 1.6, 1.5, 1.8], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', fill: true, tension: 0.3 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
}

// Generate report based on selected filters
function generateReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const eventType = document.getElementById('eventType').value;
    const memberStatus = document.getElementById('memberStatus').value;

    // Add loading state
    document.querySelector('.generate-btn').classList.add('loading');

    // Simulate API call
    setTimeout(() => {
        // Update charts with new data
        updateCharts(startDate, endDate, eventType, memberStatus);
        // Update table data
        updateTableData();
        // Update quick stats
        updateQuickStats();
        
        // Remove loading state
        document.querySelector('.generate-btn').classList.remove('loading');
    }, 1000);
}

// Export report in different formats
function exportReport(format) {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // Add loading state
    const btn = document.querySelector('[data-format="' + format + '"]');
    btn.classList.add('loading');

    // Simulate export process
    setTimeout(() => {
        switch(format) {
            case 'pdf':
                console.log('Exporting PDF...');
                // Implement PDF export
                break;
            case 'excel':
                console.log('Exporting Excel...');
                // Implement Excel export
                break;
            case 'csv':
                console.log('Exporting CSV...');
                // Implement CSV export
                break;
        }
        
        // Remove loading state
        btn.classList.remove('loading');
    }, 1000);
}

// Update date range
function updateDateRange() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');

    // Ensure end date is not before start date
    if (startDate.value && endDate.value) {
        if (new Date(endDate.value) < new Date(startDate.value)) {
            endDate.value = startDate.value;
        }
    }
}

// Load mock data for the table
function loadMockData() {
    const tableBody = document.querySelector('table tbody');
    const mockData = [
        {
            date: '2024-01-01',
            event: 'Sunday Service',
            totalAttendance: 145,
            newMembers: 3,
            trend: '+2.8%'
        },
        {
            date: '2024-01-03',
            event: 'Wednesday Service',
            totalAttendance: 82,
            newMembers: 1,
            trend: '+1.2%'
        },
        {
            date: '2024-01-05',
            event: 'Friday Prayer',
            totalAttendance: 95,
            newMembers: 2,
            trend: '+3.5%'
        }
    ];

    tableBody.innerHTML = mockData.map(row => 
        '<tr>' +
            '<td>' + row.date + '</td>' +
            '<td>' + row.event + '</td>' +
            '<td>' + row.totalAttendance + '</td>' +
            '<td>' + row.newMembers + '</td>' +
            '<td class="trend positive">' + row.trend + '</td>' +
        '</tr>'
    ).join('');
}

// Update quick stats
function updateQuickStats() {
    // Update total attendance
    document.querySelector('[data-stat="total-attendance"] .value').textContent = '432';
    document.querySelector('[data-stat="total-attendance"] .trend').textContent = '+5.2%';

    // Update new members
    document.querySelector('[data-stat="new-members"] .value').textContent = '6';
    document.querySelector('[data-stat="new-members"] .trend').textContent = '+2.8%';

    // Update average attendance
    document.querySelector('[data-stat="avg-attendance"] .value').textContent = '107';
    document.querySelector('[data-stat="avg-attendance"] .trend').textContent = '+3.5%';

    // Update growth rate
    document.querySelector('[data-stat="growth-rate"] .value').textContent = '3.8%';
    document.querySelector('[data-stat="growth-rate"] .trend').textContent = '+0.5%';
}

// Update table data
function updateTableData() {
    // Implementation for updating table data based on filters
    console.log('Updating table data...');
}

// Update charts with new data
function updateCharts(startDate, endDate, eventType, memberStatus) {
    // Implementation for updating charts based on filters
    console.log('Updating charts...', { startDate, endDate, eventType, memberStatus });
}
