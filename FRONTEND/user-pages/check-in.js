(function () {
    const checkInForm = document.getElementById('checkInForm');
    const messageDiv = document.getElementById('message');

    if (checkInForm) {
        checkInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const phone = document.getElementById('phone').value.trim();
            const submitBtn = checkInForm.querySelector('button[type="submit"]');

            // Get session ID from URL to pass it along
            const urlParams = new URLSearchParams(window.location.search);
            const sessionId = urlParams.get('session');
            const serviceName = urlParams.get('service') || 'Sunday Service';

            submitBtn.disabled = true;
            submitBtn.textContent = 'Checking...';
            messageDiv.style.display = 'none';

            try {
                // Query Member by phone using global supabase client from main.js
                // Using 'Members' table as seen in main.js
                const { data, error } = await supabase
                    .from('Members')
                    .select('*')
                    .eq('phone_number', phone)
                    .maybeSingle();

                if (error) throw error;

                if (data) {
                    // Member found - redirect to attendance confirmation page
                    // We pass name and dept as per new schema requirements (schema expects text for these)
                    window.location.href = `attendance-page.html?name=${encodeURIComponent(data.full_name)}&dept=${encodeURIComponent(data.department || '')}&service=${encodeURIComponent(serviceName)}`;
                } else {
                    // Member not found - redirect to registration form
                    const redirectUrl = `forms-page.html?phone=${encodeURIComponent(phone)}&service=${encodeURIComponent(serviceName)}&new_member=true`;
                    window.location.href = redirectUrl;
                }

            } catch (err) {
                console.error('Check-in error:', err);
                messageDiv.textContent = 'Error checking in. Please try again.';
                messageDiv.style.display = 'block';
                messageDiv.style.color = '#dc3545';
                messageDiv.style.backgroundColor = '#f8d7da';
                messageDiv.style.border = '1px solid #f5c6cb';
                messageDiv.style.borderRadius = '4px';

                submitBtn.disabled = false;
                submitBtn.textContent = 'Check In';
            }
        });
    }
})();
