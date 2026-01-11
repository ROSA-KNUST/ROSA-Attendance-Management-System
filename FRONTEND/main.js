console.log("Main.js loaded! Supabase init starting...");
// Initialize Supabase client
const SUPABASE_URL = 'https://xrubwkctffocraifwnkc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydWJ3a2N0ZmZvY3JhaWZ3bmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTY2MjgsImV4cCI6MjA4MTIzMjYyOH0.2Fp77O8OJY3N74W39eSQ4vLZ3OYd4qCAWBkH1t_F1E8';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
// Ensure global access

// ==========================================
// FORM SUBMISSION (for form-page.html)
// ==========================================
const form = document.getElementById('registrationForm');
const messageDiv = document.getElementById('message');

// Only run form code if form exists on the page
if (form && messageDiv) {
  // CHECK FOR URL PARAMS (Autofill & Attendance Logic)
  const urlParams = new URLSearchParams(window.location.search);
  const phoneParam = urlParams.get('phone');
  if (phoneParam) {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) phoneInput.value = decodeURIComponent(phoneParam);
  }

  // Function to show messages
  function showMessage(message, isError = false) {
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    messageDiv.style.color = isError ? '#dc3545' : '#28a745';
    messageDiv.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    messageDiv.style.border = `1px solid ${isError ? '#f5c6cb' : '#c3e6cb'}`;
    messageDiv.style.borderRadius = '4px';
  }

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values - Using DOB to match your database
    const formData = {
      full_name: document.getElementById('name').value.trim(),
      gender: document.getElementById('gender').value,
      DOB: document.getElementById('dob').value, // ✅ Correct for your DB
      phone_number: document.getElementById('phone').value.trim(),
      department: document.getElementById('department').value,
      email: document.getElementById('email').value.trim() || null
    };

    // Disable submit button during submission
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      // Insert data into Supabase - Using 'Members' with capital M
      const { data, error } = await supabaseClient
        .from('Members') // ✅ Capital M to match your table
        .insert([formData])
        .select();

      if (error) throw error;

      // Success!
      // Success!
      let successMsg = 'Registration successful! Thank you for joining our community.';

      // Check if we need to mark attendance automatically
      if (urlParams.get('new_member') === 'true') {
        try {
          const { error: attError } = await supabaseClient
            .from('Attendance')
            .insert([{
              member_name: formData.full_name,
              department: formData.department,
              status: 'Present',
              service: urlParams.get('service') || 'Sunday Service',
              date: new Date().toISOString().split('T')[0]
            }]);

          if (!attError) {
            successMsg = 'Registration successful! You have been marked Present for today.';
          }
        } catch (e) {
          console.log('Auto-attendance error:', e);
        }
      }

      showMessage(successMsg, false);
      form.reset();

    } catch (error) {
      console.error('Error:', error);
      showMessage(`Error: ${error.message}`, true);
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Details';
    }
  });
}

// ==========================================
// MEMBERS LIST (for members.html)
// ==========================================
const tableBody = document.querySelector('.table-container tbody');
const searchInput = document.querySelector('.search-box input');
const addBtn = document.querySelector('.add-btn');

// Only run member list code if elements exist
if (tableBody && searchInput && addBtn) {

  // Function to generate random avatar
  function getAvatarUrl(name, gender) {
    const genderPath = gender === 'female' ? 'women' : 'men';
    const randomId = Math.floor(Math.random() * 50) + 1;
    return `https://randomuser.me/api/portraits/${genderPath}/${randomId}.jpg`;
  }

  // Function to format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  // Helper function to capitalize first letter
  function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Function to render members in table
  function renderMembers(members) {
    if (!members || members.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px;">
            <p style="color: #666;">No members found</p>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = members.map(member => `
      <tr data-id="${member.id}">
        <td><input type="checkbox" /></td>
        <td>
          <div class="member-info">
            <span>${member.full_name}</span>
          </div>
        </td>
        <td class="blue-text">${capitalizeFirst(member.department)}</td>
        <td><span class="status active">Active</span></td>
        <td>${formatDate(member.created_at)}</td>
        <td>
          <i class="fa-solid fa-ellipsis" style="cursor: pointer;" onclick="viewMember('${member.id}')"></i>
        </td>
      </tr>
    `).join('');
  }

  // Function to fetch members from Supabase
  async function fetchMembers(searchTerm = '') {
    try {
      let query = supabaseClient
        .from('Members') // ✅ CHANGED: Capital M to match your table
        .select('*')
        .order('created_at', { ascending: false });

      // Add search filter if search term exists
      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,department.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log('Fetched members:', data); // Debug log
      renderMembers(data);

    } catch (error) {
      console.error('Error fetching members:', error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px;">
            <p style="color: #dc3545;">Error loading members: ${error.message}</p>
          </td>
        </tr>
      `;
    }
  }

  // View member details
  window.viewMember = function (memberId) {
    console.log('View member:', memberId);
    alert(`View details for member ID: ${memberId}`);
  }

  // Search functionality
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      fetchMembers(e.target.value);
    }, 300);
  });

  // Add new member button
  addBtn.addEventListener('click', () => {
    window.location.href = 'form-page.html';
  });

  // Load members when page loads
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Loading members...');
    fetchMembers();
  });
}