// ============================================
// FIREBASE AUTHENTICATION UI (WORKING)
// ============================================

let currentUser = null;
let userProfile = null;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth.js loaded');
    
    // Get DOM elements
    const loginLogoutBtn = document.getElementById('loginLogoutBtn');
    const accountBtn = document.getElementById('accountBtn');
    
    console.log('Login button found:', loginLogoutBtn);
    
    // Login/Logout button click handler
    if (loginLogoutBtn) {
        loginLogoutBtn.addEventListener('click', () => {
            console.log('Login/Logout button clicked');
            if (currentUser) {
                logout();
            } else {
                showLoginModal();
            }
        });
    }
    
    // Set up auth state listener
    setupAuthListener();
});

// Add auth modal to page (simplified)
function addAuthModalToPage() {
    // Check if modal already exists
    if (document.getElementById('authModal')) return;
    
    const modalHTML = `
        <div id="authModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); align-items: center; justify-content: center; z-index: 2000;">
            <div style="background: white; max-width: 400px; width: 90%; border-radius: 48px; padding: 40px; text-align: center;">
                <i class="fas fa-seedling" style="font-size: 3rem; color: #2d6a2f; margin-bottom: 16px;"></i>
                
                <!-- Login Form -->
                <div id="loginForm">
                    <h2>Welcome Back</h2>
                    <p style="margin-bottom: 20px;">Log in to continue learning</p>
                    <input type="email" id="loginEmail" placeholder="Email" style="width: 100%; padding: 14px; border-radius: 40px; border: 1px solid #ddd; margin-bottom: 12px;">
                    <input type="password" id="loginPassword" placeholder="Password" style="width: 100%; padding: 14px; border-radius: 40px; border: 1px solid #ddd; margin-bottom: 12px;">
                    <button id="doLoginBtn" style="background: #2d6a2f; color: white; border: none; padding: 14px; border-radius: 40px; font-weight: 700; width: 100%; cursor: pointer;">Log In</button>
                    <p style="margin-top: 16px;">
                        <a href="#" id="forgotPasswordBtn" style="color: #2d6a2f; font-size: 0.9rem;">Forgot Password?</a>
                    </p>
                    <p style="margin-top: 12px;">Don't have an account? <a href="#" id="showSignupBtn" style="color: #2d6a2f;">Sign Up</a></p>
                </div>
                
                <!-- Signup Form -->
                <div id="signupForm" style="display: none;">
                    <h2>Create Account</h2>
                    <p style="margin-bottom: 20px;">Start your farming journey</p>
                    <input type="text" id="signupName" placeholder="Full Name" style="width: 100%; padding: 14px; border-radius: 40px; border: 1px solid #ddd; margin-bottom: 12px;">
                    <input type="email" id="signupEmail" placeholder="Email" style="width: 100%; padding: 14px; border-radius: 40px; border: 1px solid #ddd; margin-bottom: 12px;">
                    <input type="password" id="signupPassword" placeholder="Password (min 6 characters)" style="width: 100%; padding: 14px; border-radius: 40px; border: 1px solid #ddd; margin-bottom: 12px;">
                    <button id="doSignupBtn" style="background: #2d6a2f; color: white; border: none; padding: 14px; border-radius: 40px; font-weight: 700; width: 100%; cursor: pointer;">Sign Up</button>
                    <p style="margin-top: 16px;">Already have an account? <a href="#" id="showLoginBtn" style="color: #2d6a2f;">Log In</a></p>
                </div>
                
                <!-- Forgot Password Form -->
                <div id="forgotPasswordForm" style="display: none;">
                    <h2>Reset Password</h2>
                    <p style="margin-bottom: 20px;">Enter your email to receive a reset link</p>
                    <input type="email" id="resetEmail" placeholder="Email" style="width: 100%; padding: 14px; border-radius: 40px; border: 1px solid #ddd; margin-bottom: 12px;">
                    <button id="doResetBtn" style="background: #2d6a2f; color: white; border: none; padding: 14px; border-radius: 40px; font-weight: 700; width: 100%; cursor: pointer;">Send Reset Link</button>
                    <p style="margin-top: 16px;"><a href="#" id="backToLoginBtn" style="color: #2d6a2f;">Back to Login</a></p>
                </div>
                
                <button id="closeAuthModal" style="background: none; border: none; color: #888; margin-top: 20px; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('Modal added to page');
    
    // Add event listeners
    const showSignupBtn = document.getElementById('showSignupBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const doSignupBtn = document.getElementById('doSignupBtn');
    const doLoginBtn = document.getElementById('doLoginBtn');
    const doResetBtn = document.getElementById('doResetBtn');
    
    if (showSignupBtn) {
        showSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('signupForm').style.display = 'block';
            document.getElementById('forgotPasswordForm').style.display = 'none';
            console.log('Switched to signup form');
        });
    }
    
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('signupForm').style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('forgotPasswordForm').style.display = 'none';
            console.log('Switched to login form');
        });
    }
    
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('forgotPasswordForm').style.display = 'block';
            console.log('Switched to forgot password form');
        });
    }
    
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('forgotPasswordForm').style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
            console.log('Back to login form');
        });
    }
    
    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', () => {
            document.getElementById('authModal').style.display = 'none';
        });
    }
    
    if (doSignupBtn) {
        doSignupBtn.addEventListener('click', handleSignup);
        console.log('Signup button listener added');
    }
    
    if (doLoginBtn) {
        doLoginBtn.addEventListener('click', handleLogin);
        console.log('Login button listener added');
    }
    
    if (doResetBtn) {
        doResetBtn.addEventListener('click', handleResetPassword);
        console.log('Reset button listener added');
    }
}

// Function to check if email exists
async function checkEmailExists(email) {
    try {
        const methods = await auth.fetchSignInMethodsForEmail(email);
        return methods.length > 0;
    } catch (error) {
        console.error('Error checking email:', error);
        return false;
    }
}

// Handle Sign Up
async function handleSignup() {
    console.log('Signup function called');
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    console.log('Name:', name, 'Email:', email);
    
    if (!name || !email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log('User created:', user.uid);
        
        // Send email verification
        await user.sendEmailVerification();
        console.log('Verification email sent');
        
        // Save user profile to Firestore
        await db.collection('users').doc(user.uid).set({
            name: name,
            email: email,
            seedsBalance: 0,
            purchasedCourses: [],
            progress: {},
            totalSpent: 0,
            memberSince: new Date().toLocaleDateString(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('Account created! Please check your email to verify your account before logging in.');
        
        // Sign out until they verify
        await auth.signOut();
        
        // Close modal and reset forms
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
        
        // Clear form
        document.getElementById('signupName').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
        
    } catch (error) {
        console.error('Signup error:', error);
        let errorMessage = error.message;
        if (errorMessage.includes('email-already-in-use')) {
            errorMessage = 'This email is already registered. Please log in instead.';
        } else if (errorMessage.includes('invalid-email')) {
            errorMessage = 'Please enter a valid email address.';
        }
        alert('Error: ' + errorMessage);
    }
}

// Handle Login
async function handleLogin() {
    console.log('Login function called');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log('User logged in:', user.uid);
        
        // Check if email is verified
        if (!user.emailVerified) {
            await auth.signOut();
            alert('Please verify your email first. Check your inbox (and spam folder) for the verification link.');
            return;
        }
        
        alert('Logged in successfully!');
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = error.message;
        if (errorMessage.includes('user-not-found')) {
            errorMessage = 'No account found with this email. Please sign up first.';
        } else if (errorMessage.includes('wrong-password')) {
            errorMessage = 'Incorrect password. Please try again or click "Forgot Password".';
        }
        alert('Error: ' + errorMessage);
    }
}

// Handle Reset Password
async function handleResetPassword() {
    const email = document.getElementById('resetEmail').value;
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    try {
        await auth.sendPasswordResetEmail(email);
        alert(`Password reset email sent to ${email}. Check your inbox.`);
        document.getElementById('resetEmail').value = '';
        document.getElementById('forgotPasswordForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    } catch (error) {
        if (error.message.includes('user-not-found')) {
            alert('No account found with this email. Please sign up first.');
        } else {
            alert('Error: ' + error.message);
        }
    }
}

// Handle Logout
function logout() {
    auth.signOut().then(() => {
        alert('Logged out successfully');
        window.location.href = 'index.html';
    }).catch((error) => {
        alert('Error logging out: ' + error.message);
    });
}

// Show login modal
function showLoginModal() {
    console.log('Showing login modal');
    
    // Make sure modal exists
    if (!document.getElementById('authModal')) {
        addAuthModalToPage();
    }
    
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotForm = document.getElementById('forgotPasswordForm');
    
    if (loginForm) loginForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
    if (forgotForm) forgotForm.style.display = 'none';
    
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'flex';
}

// Setup auth state listener
function setupAuthListener() {
    auth.onAuthStateChanged(async (user) => {
        const loginLogoutBtn = document.getElementById('loginLogoutBtn');
        const accountBtn = document.getElementById('accountBtn');
        
        console.log('Auth state changed:', user ? 'Logged in' : 'Logged out');
        
        if (user && user.emailVerified) {
            currentUser = user;
            if (loginLogoutBtn) loginLogoutBtn.textContent = 'Log Out';
            if (accountBtn) accountBtn.style.display = 'inline-block';
            
            // Load user data from Firestore
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                userProfile = userDoc.data();
                if (userProfile.seedsBalance !== undefined) {
                    localStorage.setItem('seed_balance', userProfile.seedsBalance.toString());
                    const balanceEl = document.getElementById('seedBalance');
                    if (balanceEl) balanceEl.innerHTML = `${userProfile.seedsBalance} <span>Seeds</span>`;
                }
                if (userProfile.purchasedCourses) {
                    localStorage.setItem('purchased_courses', JSON.stringify(userProfile.purchasedCourses));
                }
                if (typeof updateAllCourseButtons === 'function') {
                    updateAllCourseButtons();
                }
            }
        } else {
            currentUser = null;
            if (loginLogoutBtn) loginLogoutBtn.textContent = 'Log In';
            if (accountBtn) accountBtn.style.display = 'none';
        }
    });
}

// Make sure modal is added when page loads
setTimeout(() => {
    if (!document.getElementById('authModal')) {
        addAuthModalToPage();
    }
}, 100);