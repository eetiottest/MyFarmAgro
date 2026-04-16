async function sendPurchaseReceipt(userEmail, userName, credits, amount, transactionId) {
    try {
        await emailjs.send('service_g7wvugc', 'template_06qc9e9', {
            to_name: userName || 'Farmer', to_email: userEmail, credits: credits,
            amount: amount, transaction_id: transactionId, date: new Date().toLocaleDateString(),
            site_url: window.location.origin
        });
        return true;
    } catch (error) { return false; }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' : (type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : (type === 'warning' ? '<i class="fas fa-exclamation-triangle"></i>' : '<i class="fas fa-info-circle"></i>'));
    toast.innerHTML = `${icon}<span class="toast-message">${message}</span><span class="toast-close"><i class="fas fa-times"></i></span>`;
    container.appendChild(toast);
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 4000);
}

function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('btn-loading');
        button.setAttribute('data-original-text', button.innerText);
        button.innerHTML = '<span>Processing...</span>';
        button.disabled = true;
    } else {
        button.classList.remove('btn-loading');
        const original = button.getAttribute('data-original-text');
        if (original) button.innerHTML = original;
        button.disabled = false;
    }
}

let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('sliderDots');

function createDots() {
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
}

function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    document.querySelectorAll('.dot')[currentSlide]?.classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    document.querySelectorAll('.dot')[currentSlide]?.classList.add('active');
}

createDots();
document.getElementById('sliderPrev')?.addEventListener('click', () => goToSlide(currentSlide - 1));
document.getElementById('sliderNext')?.addEventListener('click', () => goToSlide(currentSlide + 1));
setInterval(() => goToSlide(currentSlide + 1), 5000);

let allCourses = [], currentSearch = '';

function filterAndRenderCourses() {
    let filtered = [...allCourses];
    if (currentSearch) {
        filtered = filtered.filter(course => 
            course.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
            (course.description && course.description.toLowerCase().includes(currentSearch.toLowerCase()))
        );
    }
    const noResults = document.getElementById('noResults');
    const courseGrid = document.getElementById('courseGrid');
    if (filtered.length === 0) {
        courseGrid.style.display = 'none';
        noResults.style.display = 'block';
        if (noResults) noResults.innerText = t('noResults');
    } else {
        courseGrid.style.display = 'flex';
        noResults.style.display = 'none';
        renderCourses(filtered);
    }
}

async function renderCourses(courses) {
    const purchased = getPurchasedCourses();
    const courseGrid = document.getElementById('courseGrid');
    const coursesWithProgress = await Promise.all(courses.map(async (course) => {
        let progress = 0;
        if (purchased.includes(course.id) && currentUser) {
            const userProgress = userProfile?.progress?.[course.id] || [];
            const totalTasks = course.weeks?.reduce((sum, week) => sum + (week.tasks?.length || 0), 0) || 1;
            progress = Math.floor((userProgress.length / totalTasks) * 100);
        }
        return { ...course, progress };
    }));
    
    courseGrid.innerHTML = coursesWithProgress.map(course => {
    const displayName = translateCourseText(course.name);
    
    return `
    <div class="course-card" data-course="${course.id}" data-price="${course.price}">
        <div class="course-image"><img src="${course.image || 'https://placehold.co/280x200?text=' + course.name}" alt="${course.name}" onerror="this.src='https://placehold.co/280x200?text=${course.name}'"></div>
        <div class="course-info">
            <h3>${displayName}</h3>
            ${purchased.includes(course.id) ? `
                <div class="course-progress-container"><div class="course-progress-fill" style="width: ${course.progress}%;"></div></div>
                <div class="progress-text">${course.progress}% ${t('complete')}</div>
            ` : ''}
            <div class="course-price"><i class="fas fa-seedling"></i> ${course.price} ${t('credits')}</div>
            <div class="course-action" id="${course.id}Action">
                ${purchased.includes(course.id) ? 
                    `<div class="owned-badge"><i class="fas fa-check-circle"></i> ${t('owned')}</div>
                     <button class="access-btn" onclick="accessCourse('${course.id}')"><i class="fas fa-play-circle"></i> ${t('accessCourse')}</button>` : 
                    `<button class="purchase-btn unlock-btn" data-course="${course.id}" data-price="${course.price}" onclick="attemptPurchaseWithLoading('${course.id}', ${course.price})">
                        <i class="fas fa-seedling"></i> ${t('unlockWith')} ${course.price} ${t('credits')}
                     </button>`
                }
            </div>
        </div>
    </div>
`}).join('');
}

document.getElementById('searchInput')?.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    filterAndRenderCourses();
});

let currentUser = null, userProfile = null, courseData = {};
const loginLogoutBtn = document.getElementById('loginLogoutBtn');
const accountBtn = document.getElementById('accountBtn');
const seedBalanceEl = document.getElementById('seedBalance');
const coursesLoading = document.getElementById('coursesLoading');

async function loadCoursesFromFirestore() {
    try {
        const doc = await db.collection('courses').doc('course_data').get();
        if (doc.exists && doc.data().data) {
            courseData = doc.data().data;
            allCourses = Object.values(courseData);
        } else {
            courseData = {
                chili: { id: 'chili', name: 'Chili', price: 15, image: 'https://images.unsplash.com/photo-1518006959466-0db0b6b4c1d0?w=280&h=200&fit=crop', description: 'Spicy and versatile.', weeks: [] },
                tomato: { id: 'tomato', name: 'Tomato', price: 20, image: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=280&h=200&fit=crop', description: 'Juicy and sweet.', weeks: [] },
                brinjal: { id: 'brinjal', name: 'Brinjal', price: 10, image: 'https://images.unsplash.com/photo-1659261111792-66709e46d53d?w=280&h=200&fit=crop', description: 'Glossy and versatile.', weeks: [] },
                bendi: { id: 'bendi', name: 'Bendi', price: 10, image: 'https://images.unsplash.com/photo-1632014530325-3911c738b779?w=280&h=200&fit=crop', description: 'Fast-growing and heat-tolerant.', weeks: [] },
                cilipadi: { id: 'cilipadi', name: 'Cili Padi', price: 15, image: 'https://cdn.shopify.com/s/files/1/0750/9190/2779/files/Birds-Eye-Chilli-003-700x575.webp?w=280&h=200&fit=crop', description: 'Extra spicy and aromatic.', weeks: [] },
                mango: { id: 'mango', name: 'Mango', price: 20, image: 'https://images.unsplash.com/photo-1685429631345-3de21cc2eb65?w=280&h=200&fit=crop', description: 'Sweet tropical fruit.', weeks: [] }
            };
            allCourses = Object.values(courseData);
        }
        coursesLoading.style.display = 'none';
        document.getElementById('courseGrid').style.display = 'flex';
        filterAndRenderCourses();
        document.getElementById('statCourses').innerText = allCourses.length + '+';
    } catch (error) {
        coursesLoading.innerHTML = `<p style="color: red;">${t('loadError')}</p>`;
        showToast(t('loadError'), 'error');
    }
}

function accessCourse(courseId) { window.location.href = `crops/course.html?id=${courseId}`; }
function getSeedBalance() { return userProfile?.seedsBalance || 0; }
function setSeedBalanceLocally(amount) { if (seedBalanceEl) seedBalanceEl.innerHTML = `${amount} <span>${t('credits')}</span>`; }
function getPurchasedCourses() { return userProfile?.purchasedCourses || []; }

async function attemptPurchaseWithLoading(courseId, price) {
    const btn = document.querySelector(`.unlock-btn[data-course="${courseId}"]`);
    if (btn) setButtonLoading(btn, true);
    try {
        await attemptPurchase(courseId, price);
    } finally { if (btn) setButtonLoading(btn, false); }
}

async function attemptPurchase(courseId, price) {
    if (!currentUser) { showToast(t('loginFirst'), 'warning'); showLoginModal(); return; }
    const balance = getSeedBalance();
    if (balance >= price) {
        const newBalance = balance - price;
        const purchased = [...getPurchasedCourses(), courseId];
        try {
            await db.collection('users').doc(currentUser.uid).update({ seedsBalance: newBalance, purchasedCourses: purchased });
            userProfile.seedsBalance = newBalance;
            userProfile.purchasedCourses = purchased;
            setSeedBalanceLocally(newBalance);
            filterAndRenderCourses();
            showToast(t('unlockSuccess', { course: courseData[courseId]?.name || courseId }), 'success');
        } catch (error) { showToast(t('unlockFailed'), 'error'); }
    } else {
        document.getElementById('insufficientMessage').innerHTML = t('needMoreCredits');
        document.getElementById('insufficientModal').style.display = 'flex';
    }
}

let selectedPack = null;
document.querySelectorAll('.credit-pack').forEach(pack => {
    pack.addEventListener('click', () => {
        if (!currentUser) { showToast(t('loginFirst'), 'warning'); showLoginModal(); return; }
        selectedPack = { seeds: parseInt(pack.dataset.seeds), price: parseInt(pack.dataset.price) };
        document.getElementById('modalSeedsAmount').innerHTML = `🌱 ${t('buyCreditsModal')}`;
        document.getElementById('modalSeedsPrice').innerHTML = `RM ${selectedPack.price}`;
        document.getElementById('buySeedsModal').style.display = 'flex';
    });
});

document.getElementById('confirmBuySeedsBtn')?.addEventListener('click', async () => {
    if (selectedPack && currentUser) {
        const btn = document.getElementById('confirmBuySeedsBtn');
        setButtonLoading(btn, true);
        try {
            const newBalance = getSeedBalance() + selectedPack.seeds;
            const newTotalSpent = (userProfile?.totalSpent || 0) + selectedPack.price;
            await db.collection('users').doc(currentUser.uid).update({ seedsBalance: newBalance, totalSpent: newTotalSpent });
            userProfile.seedsBalance = newBalance;
            userProfile.totalSpent = newTotalSpent;
            setSeedBalanceLocally(newBalance);
            await sendPurchaseReceipt(currentUser.email, userProfile?.name, selectedPack.seeds, selectedPack.price, Date.now().toString());
            showToast(t('purchaseSuccess', { credits: selectedPack.seeds, amount: selectedPack.price }), 'success');
            document.getElementById('buySeedsModal').style.display = 'none';
            selectedPack = null;
        } catch (error) { showToast(t('purchaseFailed'), 'error'); }
        finally { setButtonLoading(btn, false); }
    }
});

document.getElementById('closeBuySeedsModal')?.addEventListener('click', () => { document.getElementById('buySeedsModal').style.display = 'none'; selectedPack = null; });
document.getElementById('closeInsufficientModal')?.addEventListener('click', () => { document.getElementById('insufficientModal').style.display = 'none'; });
document.getElementById('closeAccountModal')?.addEventListener('click', () => { document.getElementById('accountModal').style.display = 'none'; });

function addAuthModal() {
    if (document.getElementById('authModal')) return;
    const modalHTML = `<div id="authModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);align-items:center;justify-content:center;z-index:2000;"><div style="background:white;max-width:400px;width:90%;border-radius:48px;padding:40px;text-align:center;"><i class="fas fa-seedling" style="font-size:3rem;color:#2d6a2f;"></i><div id="loginForm"><h2>${t('welcomeBack')}</h2><input type="email" id="loginEmail" placeholder="${t('email')}" style="width:100%;padding:14px;border-radius:40px;border:1px solid #ddd;margin-bottom:12px;"><input type="password" id="loginPassword" placeholder="${t('password')}" style="width:100%;padding:14px;border-radius:40px;border:1px solid #ddd;margin-bottom:12px;"><button id="doLoginBtn" style="background:#2d6a2f;color:white;padding:14px;border-radius:40px;width:100%;cursor:pointer;">${t('logInBtn')}</button><p style="margin-top:16px;"><a href="#" id="showSignupBtn" style="color:#2d6a2f;">${t('signUp')}</a> | <a href="#" id="forgotPasswordBtn" style="color:#2d6a2f;">${t('forgotPassword')}</a></p></div><div id="signupForm" style="display:none;"><h2>${t('createAccount')}</h2><input type="text" id="signupName" placeholder="${t('fullNamePlaceholder')}" style="width:100%;padding:14px;border-radius:40px;border:1px solid #ddd;margin-bottom:12px;"><input type="email" id="signupEmail" placeholder="${t('email')}" style="width:100%;padding:14px;border-radius:40px;border:1px solid #ddd;margin-bottom:12px;"><input type="password" id="signupPassword" placeholder="${t('passwordMin')}" style="width:100%;padding:14px;border-radius:40px;border:1px solid #ddd;margin-bottom:12px;"><button id="doSignupBtn" style="background:#2d6a2f;color:white;padding:14px;border-radius:40px;width:100%;cursor:pointer;">${t('signUp')}</button><p style="margin-top:16px;"><a href="#" id="showLoginBtn" style="color:#2d6a2f;">${t('backToLogin')}</a></p></div><div id="forgotPasswordForm" style="display:none;"><h2>${t('resetPassword')}</h2><input type="email" id="resetEmail" placeholder="${t('email')}" style="width:100%;padding:14px;border-radius:40px;border:1px solid #ddd;margin-bottom:12px;"><button id="doResetBtn" style="background:#2d6a2f;color:white;padding:14px;border-radius:40px;width:100%;cursor:pointer;">${t('sendResetLink')}</button><p style="margin-top:16px;"><a href="#" id="backToLoginBtn" style="color:#2d6a2f;">${t('backToLogin')}</a></p></div><button id="closeAuthModal" style="background:none;border:none;color:#888;margin-top:20px;cursor:pointer;">${t('close')}</button></div></div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('showSignupBtn')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('loginForm').style.display = 'none'; document.getElementById('signupForm').style.display = 'block'; document.getElementById('forgotPasswordForm').style.display = 'none'; });
    document.getElementById('showLoginBtn')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('signupForm').style.display = 'none'; document.getElementById('loginForm').style.display = 'block'; document.getElementById('forgotPasswordForm').style.display = 'none'; });
    document.getElementById('forgotPasswordBtn')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('loginForm').style.display = 'none'; document.getElementById('forgotPasswordForm').style.display = 'block'; });
    document.getElementById('backToLoginBtn')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('forgotPasswordForm').style.display = 'none'; document.getElementById('loginForm').style.display = 'block'; });
    document.getElementById('closeAuthModal')?.addEventListener('click', () => { document.getElementById('authModal').style.display = 'none'; });
    document.getElementById('doSignupBtn')?.addEventListener('click', handleSignup);
    document.getElementById('doLoginBtn')?.addEventListener('click', handleLogin);
    document.getElementById('doResetBtn')?.addEventListener('click', handleResetPassword);
}

async function handleSignup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    if (!name || !email || !password) { showToast(t('loginFirst'), 'warning'); return; }
    if (password.length < 6) { showToast(t('passwordMin'), 'warning'); return; }
    const btn = document.getElementById('doSignupBtn');
    setButtonLoading(btn, true);
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.sendEmailVerification();
        await db.collection('users').doc(userCredential.user.uid).set({ name, email, seedsBalance: 0, purchasedCourses: [], totalSpent: 0, transactions: [], progress: {}, memberSince: new Date().toLocaleDateString() });
        showToast(t('accountCreated'), 'success');
        document.getElementById('authModal').style.display = 'none';
        await auth.signOut();
    } catch (error) { showToast(error.message, 'error'); }
    finally { setButtonLoading(btn, false); }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { showToast(t('loginFirst'), 'warning'); return; }
    const btn = document.getElementById('doLoginBtn');
    setButtonLoading(btn, true);
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        if (!userCredential.user.emailVerified) { await auth.signOut(); showToast(t('accountCreated'), 'warning'); return; }
        showToast(t('loggedIn'), 'success');
        document.getElementById('authModal').style.display = 'none';
    } catch (error) { showToast(error.message, 'error'); }
    finally { setButtonLoading(btn, false); }
}

async function handleResetPassword() {
    const email = document.getElementById('resetEmail').value;
    if (!email) { showToast(t('loginFirst'), 'warning'); return; }
    const btn = document.getElementById('doResetBtn');
    setButtonLoading(btn, true);
    try {
        await auth.sendPasswordResetEmail(email);
        showToast(t('sendResetLink'), 'success');
        document.getElementById('forgotPasswordForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    } catch (error) { showToast(error.message, 'error'); }
    finally { setButtonLoading(btn, false); }
}

function showLoginModal() { addAuthModal(); document.getElementById('loginForm').style.display = 'block'; document.getElementById('signupForm').style.display = 'none'; document.getElementById('forgotPasswordForm').style.display = 'none'; document.getElementById('authModal').style.display = 'flex'; }
function logout() { 
    auth.signOut().then(() => { 
        currentUser = null; userProfile = null;
        loginLogoutBtn.textContent = t('logIn');
        accountBtn.style.display = 'none';
        setSeedBalanceLocally(0);
        filterAndRenderCourses();
        showToast(t('loggedOut'), 'info');
    });
}

function updateAccountModal() {
    if (!userProfile) return;
    document.getElementById('profileName').innerText = userProfile.name || '-';
    document.getElementById('profileEmail').innerText = userProfile.email || '-';
    document.getElementById('memberSince').innerText = userProfile.memberSince || '-';
    document.getElementById('accountSeedsBalance').innerText = getSeedBalance();
    document.getElementById('accountCoursesOwned').innerText = getPurchasedCourses().length;
    document.getElementById('totalSpent').innerText = `RM${userProfile.totalSpent || 0}`;
    let completedCount = 0;
    const progress = userProfile.progress || {};
    Object.values(progress).forEach(tasks => { completedCount += tasks.length; });
    document.getElementById('completedLessons').innerText = completedCount;
    const subscriptionDiv = document.getElementById('subscriptionList');
    const purchased = getPurchasedCourses();
    if (purchased.length > 0) {
        subscriptionDiv.innerHTML = purchased.map(c => `<div class="subscription-item"><span><i class="fas fa-seedling"></i> ${translateCourseText(courseData[c]?.name || c)} Masterclass</span><span style="color:#2d6a2f;">${t('owned')}</span></div>`).join('');
    } else { subscriptionDiv.innerHTML = `<p style="text-align:center;color:#8ba07e;">${t('noCourses')}</p>`; }
    const transactions = userProfile.transactions || [];
    const transactionDiv = document.getElementById('transactionList');
    if (transactions.length > 0) {
        transactionDiv.innerHTML = transactions.map(t => `<div class="transaction-item"><span>${t.description}</span><span>RM${t.amount}</span><span style="font-size:0.7rem;">${t.date}</span></div>`).join('');
    } else { transactionDiv.innerHTML = `<p style="text-align:center;color:#8ba07e;">${t('noTransactions')}</p>`; }
}

document.getElementById('editProfileBtn')?.addEventListener('click', () => {
    if (userProfile) document.getElementById('editName').value = userProfile.name || '';
    document.getElementById('accountModal').style.display = 'none';
    document.getElementById('editProfileModal').style.display = 'flex';
});

document.getElementById('saveProfileBtn')?.addEventListener('click', async () => {
    if (currentUser && userProfile) {
        userProfile.name = document.getElementById('editName').value;
        await db.collection('users').doc(currentUser.uid).update({ name: userProfile.name });
        showToast(t('profileUpdated'), 'success');
    }
    document.getElementById('editProfileModal').style.display = 'none';
});

document.getElementById('closeEditModal')?.addEventListener('click', () => { document.getElementById('editProfileModal').style.display = 'none'; });
document.getElementById('ctaSubscribeBtn')?.addEventListener('click', () => { document.getElementById('vegetables').scrollIntoView({ behavior: 'smooth' }); });

auth.onAuthStateChanged(async (user) => {
    if (user && user.emailVerified) {
        currentUser = user;
        loginLogoutBtn.textContent = t('logOut');
        accountBtn.style.display = 'inline-block';
        loginLogoutBtn.onclick = () => logout();
        accountBtn.onclick = () => { updateAccountModal(); document.getElementById('accountModal').style.display = 'flex'; };
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            userProfile = userDoc.data();
            setSeedBalanceLocally(userProfile.seedsBalance || 0);
            filterAndRenderCourses();
        }
    } else {
        currentUser = null; userProfile = null;
        loginLogoutBtn.textContent = t('logIn');
        accountBtn.style.display = 'none';
        loginLogoutBtn.onclick = () => showLoginModal();
        setSeedBalanceLocally(0);
        filterAndRenderCourses();
    }
});

document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        else if (href && href.startsWith('#')) { e.preventDefault(); const target = document.querySelector(href); if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});

window.addEventListener('click', (e) => {
    ['buySeedsModal', 'insufficientModal', 'accountModal', 'editProfileModal', 'authModal'].forEach(id => {
        const modal = document.getElementById(id);
        if (e.target === modal) modal.style.display = 'none';
    });
});

setSeedBalanceLocally(0);
loadCoursesFromFirestore();

window.attemptPurchase = attemptPurchase;
window.accessCourse = accessCourse;
window.showLoginModal = showLoginModal;
window.attemptPurchaseWithLoading = attemptPurchaseWithLoading;