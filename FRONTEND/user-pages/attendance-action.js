document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    // New schema uses member_name and department, not member_id foreign key
    const memberName = urlParams.get('name') ? decodeURIComponent(urlParams.get('name')) : '';
    const department = urlParams.get('dept') ? decodeURIComponent(urlParams.get('dept')) : '';
    const serviceName = urlParams.get('service') ? decodeURIComponent(urlParams.get('service')) : 'Sunday Service';

    // Select elements
    const nameEl = document.querySelector('.title');
    const dateEl = document.querySelector('.date');
    const btn = document.querySelector('.present-btn');
    const container = document.querySelector('.container');

    // Update Name
    if (memberName && nameEl) {
        nameEl.innerHTML = `Welcome back,<br> ${memberName} 👋`;
    }

    // Update Date
    if (dateEl) {
        const today = new Date();
        dateEl.textContent = today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Handle "Mark Present" Click
    if (btn) {
        btn.addEventListener('click', async () => {
            if (!memberName) {
                alert('Error: No member name found.');
                return;
            }

            btn.textContent = 'Marking...';
            btn.disabled = true;

            try {
                // Insert attendance record
                // Schema: id, check_in, date, service, member_name, department, status
                const { error } = await supabase
                    .from('Attendance')
                    .insert([
                        {
                            member_name: memberName,
                            department: department,
                            status: 'Present',
                            service: serviceName,
                            date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
                            // check_in defaults to now()
                        }
                    ]);

                if (error) throw error;

                // Success UI Replace - Reusing styles
                container.innerHTML = `
                    <div class="icon" style="color: #28a745;">✅</div>
                    <h1 class="title">You're Checked In!</h1>
                    <p class="subtitle">Enjoy the service.</p>
                    <div class="card">
                        <h2>Checked In</h2>
                        <p class="date">${new Date().toLocaleTimeString()}</p>
                    </div>
                `;

            } catch (err) {
                console.error('Attendance error:', err);
                // If table doesn't exist, this will error. 
                // If duplicate key error (already marked), handle it?
                if (err.code === '23505') { // Unique violation
                    alert('You have already marked attendance for today!');
                } else {
                    alert(`Error marking attendance: ${err.message}`);
                }
                btn.textContent = 'Mark Present';
                btn.disabled = false;
            }
        });
    }
});
