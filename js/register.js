async function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    if (!email || !password) {
        errorMessage.textContent = 'Both fields are required.';
        return;
    }

    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    try {
        const response = await fetch('https://comp4537-c2p-api-server-1.onrender.com/api/v1/user/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
        });

        const data = await response.json();

        if (response.status === 200) {
            // Automatically log the user in
            const loginResponse = await fetch('https://comp4537-c2p-api-server-1.onrender.com/api/v1/user/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });

            const loginData = await loginResponse.json();

            if (loginResponse.status === 200) {
                localStorage.setItem('jwtToken', loginData.jwtToken); // Store the token
                window.location.href = '/home'; // Redirect to the home page
            } else {
                errorMessage.textContent = loginData.error || 'Login after registration failed.';
            }
        } else {
            errorMessage.textContent = data.error || 'Registration failed.';
            console.log('Registration failed with error:', data.error || 'Registration failed');
        }
    } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
        console.error('Error:', error);
    }
}
