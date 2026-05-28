// ============================================
// MY FARMAGRO - MAIN APPLICATION (No Auth)
// ============================================

// Global state - auth will be managed by auth.js
window.currentUser = null;
window.userProfile = null;
window.courseData = {};
window.allCourses = [];
window.currentSearch = '';
window.currentPurchaseCourse = null;
window.currentCategory = 'crops';

// DOM Elements
const loginLogoutBtn = document.getElementById('loginLogoutBtn');
const accountBtn = document.getElementById('accountBtn');
const coursesLoading = document.getElementById('coursesLoading');
const courseGrid = document.getElementById('courseGrid');
const searchInput = document.getElementById('searchInput');
const toastContainer = document.getElementById('toastContainer');
const tabCrops = document.getElementById('tabCrops');
const tabFundamentals = document.getElementById('tabFundamentals');

// Initialize EmailJS
if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: "bDahuu_rYnIhtWtsH" });
}

// ============================================
// CHECK LOGIN BEFORE NAVIGATION
// ============================================
function checkLoginAndRedirect(page) {
    if (window.currentUser) {
        window.location.href = page;
    } else {
        showToast('Please log in first to access Dashboard and Profile', 'warning');
        // Use auth.js's showLoginModal if available, otherwise fallback
        if (typeof window.showLoginModal === 'function') {
            window.showLoginModal();
        } else {
            showToast('Please use the Log In button', 'info');
        }
    }
}

// ============================================
// COURSE FUNCTIONS
// ============================================

async function loadCoursesFromFirestore() {
    try {
        if (coursesLoading) coursesLoading.style.display = 'flex';
        if (courseGrid) courseGrid.style.display = 'none';
        
        const doc = await db.collection('courses').doc('course_data').get();
        
        if (doc.exists && doc.data().data) {
            window.courseData = doc.data().data;
            window.allCourses = Object.values(window.courseData);
        } else {
            window.courseData = {
                chili: { id: 'chili', name: 'Chili', price: 15, category: 'crops', image: 'https://images.unsplash.com/photo-1518006959466-0db0b6b4c1d0?w=280&h=200&fit=crop', weeks: [], description: 'Learn to grow spicy chilies.' },
                tomato: { id: 'tomato', name: 'Tomato', price: 20, category: 'crops', image: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=280&h=200&fit=crop', weeks: [], description: 'Juicy tomatoes for home gardens.' },
                brinjal: { id: 'brinjal', name: 'Brinjal', price: 10, category: 'crops', image: 'https://images.unsplash.com/photo-1659261111792-66709e46d53d?w=280&h=200&fit=crop', weeks: [], description: 'Glossy eggplants.' },
                bendi: { id: 'bendi', name: 'Bendi', price: 10, category: 'crops', image: 'https://images.unsplash.com/photo-1632014530325-3911c738b779?w=280&h=200&fit=crop', weeks: [], description: 'Fast-growing okra.' },
                cilipadi: { id: 'cilipadi', name: 'Cili Padi', price: 15, category: 'crops', image: 'https://cdn.shopify.com/s/files/1/0750/9190/2779/files/Birds-Eye-Chilli-003-700x575.webp?w=280&h=200&fit=crop', weeks: [], description: 'Extra spicy chili.' },
                mango: { id: 'mango', name: 'Mango', price: 20, category: 'crops', image: 'https://images.unsplash.com/photo-1685429631345-3de21cc2eb65?w=280&h=200&fit=crop', weeks: [], description: 'Sweet tropical mangoes.' },
                soil: { id: 'soil', name: 'Soil Preparation', price: 10, category: 'fundamentals', image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=280&h=200&fit=crop', weeks: [], description: 'Master soil testing and composting.' },
                irrigation: { id: 'irrigation', name: 'Irrigation Systems', price: 10, category: 'fundamentals', image: 'https://images.unsplash.com/photo-1621420425624-c9cc9d5fade4?w=280&h=200&fit=crop', weeks: [], description: 'Efficient water management.' },
                pest: { id: 'pest', name: 'Pest Management', price: 10, category: 'fundamentals', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=280&h=200&fit=crop', weeks: [], description: 'Organic pest control.' },
                fertilizer: { id: 'fertilizer', name: 'Fertilizing Techniques', price: 10, category: 'fundamentals', image: 'https://images.unsplash.com/photo-1585336261022-680e9ce1f5a1?w=280&h=200&fit=crop', weeks: [], description: 'NPK ratios and application.' }
            };
            window.allCourses = Object.values(window.courseData);
        }
        
        if (coursesLoading) coursesLoading.style.display = 'none';
        if (courseGrid) courseGrid.style.display = 'grid';
        filterAndRenderCourses();
        const statElem = document.getElementById('statCourses');
        if (statElem) statElem.innerText = window.allCourses.length + '+';
    } catch (error) {
        console.error('Error:', error);
        if (coursesLoading) coursesLoading.innerHTML = '<p style="color: red;">Error loading courses. Please refresh.</p>';
        showToast('Failed to load courses', 'error');
    }
}

function filterAndRenderCourses() {
    let filtered = [...window.allCourses];
    
    if (window.currentCategory === 'crops') {
        filtered = filtered.filter(course => course.category === 'crops');
    } else if (window.currentCategory === 'fundamentals') {
        filtered = filtered.filter(course => course.category === 'fundamentals');
    }
    
    if (window.currentSearch) {
        filtered = filtered.filter(course => 
            course.name.toLowerCase().includes(window.currentSearch.toLowerCase()) ||
            (course.description && course.description.toLowerCase().includes(window.currentSearch.toLowerCase()))
        );
    }
    
    const noResults = document.getElementById('noResults');
    if (filtered.length === 0) {
        if (courseGrid) courseGrid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
    } else {
        if (courseGrid) courseGrid.style.display = 'grid';
        if (noResults) noResults.style.display = 'none';
        renderCourses(filtered);
    }
}

function getPurchasedCourses() { 
    return window.userProfile?.purchasedCourses || []; 
}

function accessCourse(courseId) { 
    window.location.href = `crops/course.html?id=${courseId}`; 
}

async function renderCourses(courses) {
    const purchased = getPurchasedCourses();
    if (!courseGrid) return;
    
    courseGrid.innerHTML = courses.map(course => {
        let progress = 0;
        if (purchased.includes(course.id) && window.currentUser && window.userProfile?.progress?.[course.id]) {
            const userProgress = window.userProfile.progress[course.id] || [];
            let totalTasks = 0;
            if (course.weeks) {
                course.weeks.forEach(week => {
                    totalTasks += (week.tasks || []).length;
                });
            }
            progress = totalTasks > 0 ? Math.floor((userProgress.length / totalTasks) * 100) : 0;
        }
        
        const categoryBadge = course.category === 'crops' ? 
            '<span style="background: #e8f0ea; color: #2d6a2f; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; margin-bottom: 8px; display: inline-block;"><i class="fas fa-seedling"></i> Crop</span>' : 
            '<span style="background: #e8edf2; color: #2c7da0; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; margin-bottom: 8px; display: inline-block;"><i class="fas fa-book"></i> Fundamentals</span>';
        
        return `
        <div class="course-card">
            <div class="course-image">
                <img src="${course.image || 'https://placehold.co/280x200?text=' + course.name}" alt="${course.name}" onerror="this.src='https://placehold.co/280x200?text=${course.name}'">
            </div>
            <div class="course-info">
                ${categoryBadge}
                <h3>${course.name}</h3>
                <p style="font-size: 0.8rem; color: #6b7a8a; margin: 8px 0;">${course.description || 'Learn professional farming techniques.'}</p>
                ${purchased.includes(course.id) ? `
                    <div class="course-progress-container"><div class="course-progress-fill" style="width: ${progress}%;"></div></div>
                    <div class="progress-text">${progress}% complete</div>
                    <div class="owned-badge"><i class="fas fa-check-circle"></i> Owned</div>
                    <button class="access-btn" onclick="accessCourse('${course.id}')"><i class="fas fa-play-circle"></i> Access Course</button>
                ` : `
                    <div class="course-price">RM${course.price}</div>
                    <button class="purchase-btn" onclick="showPaymentModal('${course.id}', ${course.price}, '${course.name}')">
                        <i class="fas fa-shopping-cart"></i> Buy Now - RM${course.price}
                    </button>
                `}
            </div>
        </div>
    `}).join('');
}

// ============================================
// PAYMENT FUNCTIONS
// ============================================

function showPaymentModal(courseId, price, courseName) {
    if (!window.currentUser) { 
        showToast('Please log in first', 'warning'); 
        if (typeof window.showLoginModal === 'function') {
            window.showLoginModal();
        }
        return; 
    }
    window.currentPurchaseCourse = { id: courseId, price: price, name: courseName };
    const nameElem = document.getElementById('paymentCourseName');
    const priceElem = document.getElementById('paymentPrice');
    if (nameElem) nameElem.innerText = courseName;
    if (priceElem) priceElem.innerHTML = `RM${price}`;
    const modal = document.getElementById('paymentModal');
    if (modal) modal.style.display = 'flex';
}

async function sendPurchaseReceipt(userEmail, userName, courseName, amount, transactionId) {
    if (typeof emailjs === 'undefined') return false;
    try {
        await emailjs.send('service_g7wvugc', 'template_06qc9e9', {
            to_name: userName || 'Farmer',
            to_email: userEmail,
            course_name: courseName,
            amount: amount,
            transaction_id: transactionId,
            date: new Date().toLocaleDateString(),
            site_url: window.location.origin
        });
        return true;
    } catch (error) { 
        console.error('Email error:', error);
        return false; 
    }
}

// ============================================
// UI FUNCTIONS
// ============================================

function showToast(message, type = 'success') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' : 
               (type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : '<i class="fas fa-info-circle"></i>');
    toast.innerHTML = `${icon}<span class="toast-message">${message}</span><span class="toast-close"><i class="fas fa-times"></i></span>`;
    toastContainer.appendChild(toast);
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 4000);
}

// ============================================
// EXPOSE FUNCTIONS FOR auth.js TO CALL
// ============================================

// This will be called by auth.js when user logs in/out
window.updateUIForAuthState = function(user, profile) {
    window.currentUser = user;
    window.userProfile = profile;
    
    // Update buttons
    if (loginLogoutBtn) {
        loginLogoutBtn.textContent = user ? 'Log Out' : 'Log In';
    }
    if (accountBtn) {
        if (user) {
            accountBtn.textContent = 'My Dashboard';
            accountBtn.style.display = 'inline-block';
        } else {
            accountBtn.style.display = 'none';
        }
    }
    
    // Hide Home link when logged in (handled in HTML via CSS class)
    const homeLink = document.querySelector('.nav-links a[href="index.html"]');
    if (homeLink) {
        if (user) {
            homeLink.style.display = 'none';
        } else {
            homeLink.style.display = 'inline-block';
        }
    }
    
    // Refresh courses
    if (typeof filterAndRenderCourses === 'function') {
        filterAndRenderCourses();
    }
};

// ============================================
// EVENT LISTENERS
// ============================================

if (loginLogoutBtn) {
    loginLogoutBtn.onclick = () => {
        if (window.currentUser) {
            // Logout via auth.js if available
            if (typeof window.logout === 'function') {
                window.logout();
            } else {
                auth.signOut();
                showToast('Logged out', 'info');
                setTimeout(() => location.reload(), 500);
            }
        } else {
            if (typeof window.showLoginModal === 'function') {
                window.showLoginModal();
            }
        }
    };
}

if (accountBtn) {
    accountBtn.onclick = () => {
        if (window.currentUser) {
            window.location.href = 'dashboard.html';
        }
    };
}

document.getElementById('ctaSubscribeBtn')?.addEventListener('click', () => {
    document.getElementById('all-courses').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('heroSubscribeBtn')?.addEventListener('click', () => {
    document.getElementById('all-courses').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('confirmPaymentBtn')?.addEventListener('click', async () => {
    if (window.currentPurchaseCourse && window.currentUser) {
        const btn = document.getElementById('confirmPaymentBtn');
        btn.disabled = true;
        btn.innerHTML = 'Processing...';
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const purchased = [...(window.userProfile?.purchasedCourses || []), window.currentPurchaseCourse.id];
            const newTotalSpent = (window.userProfile?.totalSpent || 0) + window.currentPurchaseCourse.price;
            
            await db.collection('users').doc(window.currentUser.uid).update({ 
                purchasedCourses: purchased,
                totalSpent: newTotalSpent
            });
            
            window.userProfile.purchasedCourses = purchased;
            window.userProfile.totalSpent = newTotalSpent;
            
            const transaction = {
                description: `Purchased ${window.currentPurchaseCourse.name} course`,
                amount: window.currentPurchaseCourse.price,
                date: new Date().toLocaleDateString()
            };
            const transactions = window.userProfile?.transactions || [];
            transactions.unshift(transaction);
            await db.collection('users').doc(window.currentUser.uid).update({ transactions: transactions });
            window.userProfile.transactions = transactions;
            
            await sendPurchaseReceipt(
                window.currentUser.email,
                window.userProfile?.name,
                window.currentPurchaseCourse.name,
                window.currentPurchaseCourse.price,
                Date.now().toString()
            );
            
            showToast(`✅ Purchased ${window.currentPurchaseCourse.name}!`, 'success');
            document.getElementById('paymentModal').style.display = 'none';
            window.currentPurchaseCourse = null;
            filterAndRenderCourses();
            
        } catch (error) {
            console.error('Purchase error:', error);
            showToast('Purchase failed. Please try again.', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Confirm Purchase';
        }
    }
});

document.getElementById('closePaymentModal')?.addEventListener('click', () => {
    document.getElementById('paymentModal').style.display = 'none';
    window.currentPurchaseCourse = null;
});

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        window.currentSearch = e.target.value;
        filterAndRenderCourses();
    });
}

if (tabCrops) {
    tabCrops.addEventListener('click', () => {
        window.currentCategory = 'crops';
        tabCrops.style.background = '#2d6a2f';
        tabCrops.style.color = 'white';
        if (tabFundamentals) {
            tabFundamentals.style.background = '#f0f4ea';
            tabFundamentals.style.color = '#333';
        }
        filterAndRenderCourses();
    });
}

if (tabFundamentals) {
    tabFundamentals.addEventListener('click', () => {
        window.currentCategory = 'fundamentals';
        tabFundamentals.style.background = '#2d6a2f';
        tabFundamentals.style.color = 'white';
        if (tabCrops) {
            tabCrops.style.background = '#f0f4ea';
            tabCrops.style.color = '#333';
        }
        filterAndRenderCourses();
    });
}

window.addEventListener('click', (e) => {
    const modals = ['paymentModal', 'authModal'];
    modals.forEach(id => {
        const modal = document.getElementById(id);
        if (e.target === modal) modal.style.display = 'none';
    });
});

setTimeout(() => {
    loadCoursesFromFirestore();
}, 500);

// Make functions global
window.accessCourse = accessCourse;
window.showPaymentModal = showPaymentModal;
window.checkLoginAndRedirect = checkLoginAndRedirect;