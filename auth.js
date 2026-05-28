// ============================================
// FIREBASE AUTHENTICATION UI (SINGLE SOURCE OF TRUTH)
// ============================================

let currentUser = null;
let userProfile = null;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth.js loaded');
    addAuthModalToPage();
    setupAuthListener();
});

// Add auth modal to page
function addAuthModalToPage() {
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
                    <div style="text-align:center; margin:12px 0; color:#ccc;">OR</div>
                    <button id="googleSignInBtn" style="background: white; color: #333; border: 1px solid #ddd; padding: 12px; border-radius: 40px; width: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <i class="fab fa-google"></i> Sign in with Google
                    </button>
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
    
    // Add event listeners
    document.getElementById('showSignupBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'block';
        document.getElementById('forgotPasswordForm').style.display = 'none';
    });
    
    document.getElementById('showLoginBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('forgotPasswordForm').style.display = 'none';
    });
    
    document.getElementById('forgotPasswordBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('forgotPasswordForm').style.display = 'block';
    });
    
    document.getElementById('backToLoginBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('forgotPasswordForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    });
    
    document.getElementById('closeAuthModal')?.addEventListener('click', () => {
        document.getElementById('authModal').style.display = 'none';
    });
    
    document.getElementById('doSignupBtn')?.addEventListener('click', handleSignup);
    document.getElementById('doLoginBtn')?.addEventListener('click', handleLogin);
    document.getElementById('doResetBtn')?.addEventListener('click', handleResetPassword);
    document.getElementById('googleSignInBtn')?.addEventListener('click', googleSignIn);
}

// Handle Sign Up
async function handleSignup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
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
        
        await user.sendEmailVerification();
        
        await db.collection('users').doc(user.uid).set({
            name: name,
            email: email,
            purchasedCourses: [],
            totalSpent: 0,
            transactions: [],
            progress: {},
            memberSince: new Date().toLocaleDateString(),
            isAdmin: false,
            bookmarks: [],
            recentActivity: [],
            certificates: [],
            streak: 0
        });
        
        alert('Account created! Please check your email to verify your account before logging in.');
        await auth.signOut();
        
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
        
        document.getElementById('signupName').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
        
    } catch (error) {
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
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        if (!user.emailVerified) {
            await auth.signOut();
            alert('Please verify your email first. Check your inbox (and spam folder) for the verification link.');
            return;
        }
        
        alert('Logged in successfully!');
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        
        // Redirect to dashboard (not homepage)
        window.location.href = 'dashboard.html';
        
    } catch (error) {
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

// Google Sign In
async function googleSignIn() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            await db.collection('users').doc(user.uid).set({
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                purchasedCourses: [],
                totalSpent: 0,
                transactions: [],
                progress: {},
                memberSince: new Date().toLocaleDateString(),
                isAdmin: false,
                bookmarks: [],
                recentActivity: [],
                certificates: [],
                streak: 0
            });
        }
        
        alert('Logged in with Google!');
        document.getElementById('authModal').style.display = 'none';
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Logout function (exposed globally)
window.logout = async function() {
    try {
        await auth.signOut();
        alert('Logged out successfully');
        window.location.href = 'index.html';
    } catch (error) {
        alert('Error logging out: ' + error.message);
    }
};

// Show login modal (exposed globally)
window.showLoginModal = function() {
    const modal = document.getElementById('authModal');
    if (!modal) {
        addAuthModalToPage();
    }
    
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('forgotPasswordForm').style.display = 'none';
    
    const modalElem = document.getElementById('authModal');
    if (modalElem) modalElem.style.display = 'flex';
};

// Setup auth state listener (SINGLE SOURCE OF TRUTH)
function setupAuthListener() {
    auth.onAuthStateChanged(async (user) => {
        console.log('Auth state changed:', user ? 'Logged in' : 'Logged out');
        
        if (user && user.emailVerified) {
            currentUser = user;
            
            // Load user profile from Firestore
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                userProfile = userDoc.data();
            } else {
                userProfile = {
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    purchasedCourses: [],
                    totalSpent: 0,
                    transactions: [],
                    progress: {},
                    memberSince: new Date().toLocaleDateString(),
                    isAdmin: false,
                    bookmarks: [],
                    recentActivity: [],
                    certificates: [],
                    streak: 0
                };
                await db.collection('users').doc(user.uid).set(userProfile);
            }
            
            // Update app.js with auth state
            if (typeof window.updateUIForAuthState === 'function') {
                window.updateUIForAuthState(user, userProfile);
            }
            
            // Check if on homepage - redirect to dashboard
            if (window.location.pathname === '/' || 
                window.location.pathname === '/index.html' ||
                window.location.pathname.endsWith('index.html')) {
                window.location.href = 'dashboard.html';
            }
            
        } else {
            currentUser = null;
            userProfile = null;
            
            // Update app.js with auth state
            if (typeof window.updateUIForAuthState === 'function') {
                window.updateUIForAuthState(null, null);
            }
            
            // If on dashboard or profile without being logged in, redirect to homepage
            if (window.location.pathname.includes('dashboard.html') || 
                window.location.pathname.includes('profile.html')) {
                window.location.href = 'index.html';
            }
        }
    });
}