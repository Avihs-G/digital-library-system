// js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login');
    const registerForm = document.getElementById('register');
    const forgotPasswordLink = document.getElementById('forgot-password-link');

    // Handle login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('User logged in:', userCredential.user);
                window.location.href = 'profile.html';
            })
            .catch((error) => {
                console.error('Error logging in:', error.message);
            });
    });

    // Handle registration
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('User registered:', userCredential.user);
                window.location.href = 'profile.html';
            })
            .catch((error) => {
                console.error('Error registering:', error.message);
            });
    });

    // Handle password reset
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        const email = prompt('Please enter your email for password reset:');
        if (email) {
            auth.sendPasswordResetEmail(email)
                .then(() => {
                    alert('Password reset email sent!');
                })
                .catch((error) => {
                    console.error('Error sending password reset email:', error.message);
                });
        }
    });
});
