// Globals
const RECORDS_PER_PAGE = 10;
let currentPage = 1;
let allRecords = [];

// Elements (will be selected on load)
let recordsTableBody;
let pageInfo;

document.addEventListener('DOMContentLoaded', () => {
  console.log('Attendance page loaded');
  recordsTableBody = document.querySelector('.records-table tbody');
  pageInfo = document.getElementById('pageInfo');
  const applyFiltersBtn = document.querySelector('.apply-btn');

  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
      console.log('Apply Filters Clicked');
      fetchAttendanceRecords();
    });
  }

  // Initial Load
  fetchAttendanceRecords();
});

// Fetch Records from Supabase
async function fetchAttendanceRecords() {
  if (!recordsTableBody) return;

  try {
    // Show loading
    recordsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading records...</td></tr>';

    // Get Filter Values from DOM directly to ensure fresh values
    const dateVal = document.getElementById('dateFilter')?.value;
    const deptVal = document.getElementById('deptFilter')?.value;
    const serviceVal = document.getElementById('serviceFilter')?.value;

    console.log('Filters:', { dateVal, deptVal, serviceVal });

    // Build Query
    let query = supabase
      .from('Attendance')
      .select('*')
      .order('date', { ascending: false })
      .order('check_in', { ascending: false });

    // Apply Filters
    if (dateVal) {
      query = query.eq('date', dateVal);
    }
    if (deptVal && deptVal !== "") {
      query = query.eq('department', deptVal);
    }
    if (serviceVal && serviceVal !== "") {
      query = query.eq('service', serviceVal);
    }

    const { data, error } = await query;

    if (error) throw error;

    console.log('Fetched data:', data?.length);
    allRecords = data || [];
    currentPage = 1;

    renderTable();

  } catch (err) {
    console.error('Error fetching attendance:', err);
    if (recordsTableBody) {
      recordsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Error: ${err.message}</td></tr>`;
    }
  }
}

// Render Table
function renderTable() {
  const start = (currentPage - 1) * RECORDS_PER_PAGE;
  const end = start + RECORDS_PER_PAGE;
  const paginatedRecords = allRecords.slice(start, end);

  if (paginatedRecords.length === 0) {
    recordsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No records found</td></tr>';
    if (pageInfo) pageInfo.textContent = 'Page 0 of 0';
    return;
  }

  recordsTableBody.innerHTML = paginatedRecords.map(record => {
    const checkInTime = record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
    const dateStr = new Date(record.date).toLocaleDateString();
    const statusClass = record.status.toLowerCase() === 'present' ? 'present' : 'absent';

    return `
            <tr>
                <td>${dateStr}</td>
                <td>${record.service}</td>
                <td>${record.member_name}</td>
                <td>${record.department}</td>
                <td>${checkInTime}</td>
                <td><span class="status ${statusClass}">${record.status}</span></td>
            </tr>
        `;
  }).join('');

  // Update Pagination Info
  const totalPages = Math.ceil(allRecords.length / RECORDS_PER_PAGE);
  if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

// Global Pagination Functions (bound in HTML)
// Actually we should bind these in JS to be cleaner, but existing HTML uses onclick
// We'll leave them if they work, or cleaner: bind them here if IDs exist.
// HTML: id="prevBtn", id="nextBtn"
document.addEventListener('DOMContentLoaded', () => {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentPage * RECORDS_PER_PAGE < allRecords.length) {
        currentPage++;
        renderTable();
      }
    });
  }
});
