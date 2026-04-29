// ============================================
// ADMIN DASHBOARD - MAIN APPLICATION
// ============================================

let currentUser = null;
let allUsers = [];
let courseData = {};
let quizData = {};
let currentPrices = {};
let enrollmentChart = null;
let currentEditingQuizId = null;
let currentQuestions = [];

// ============================================
// LOGIN
// ============================================
document.getElementById('adminLoginBtn').addEventListener('click', async () => {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    if (!email || !password) { alert('Enter email and password'); return; }
    try {
        const cred = await auth.signInWithEmailAndPassword(email, password);
        const user = cred.user;
        if (!user.emailVerified) { alert('Verify your email first'); await auth.signOut(); return; }
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists && userDoc.data().isAdmin === true) {
            currentUser = user;
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            await loadAllData();
        } else { alert('Admin access required'); await auth.signOut(); }
    } catch(e) { alert(e.message); }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await auth.signOut();
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
});

// ============================================
// TAB SWITCHING
// ============================================
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const name = tab.getAttribute('data-tab');
        document.getElementById('overviewTab').style.display = name === 'overview' ? 'block' : 'none';
        document.getElementById('usersTab').style.display = name === 'users' ? 'block' : 'none';
        document.getElementById('coursesTab').style.display = name === 'courses' ? 'block' : 'none';
        document.getElementById('quizzesTab').style.display = name === 'quizzes' ? 'block' : 'none';
        document.getElementById('pricesTab').style.display = name === 'prices' ? 'block' : 'none';
        if (name === 'courses') loadCourses();
        if (name === 'quizzes') loadQuizzes();
        if (name === 'prices') loadPriceEditor();
    });
});

// ============================================
// LOAD ALL DATA
// ============================================
async function loadAllData() {
    await loadUsers();
    await loadCourses();
    await loadQuizzes();
    await loadAnalytics();
}

// ============================================
// USERS (with expandable details)
// ============================================
async function loadUsers() {
    try {
        const snapshot = await db.collection('users').get();
        allUsers = [];
        let enrollments = 0, revenue = 0, lessons = 0;
        snapshot.forEach(doc => {
            const u = doc.data();
            u.id = doc.id;
            allUsers.push(u);
            enrollments += (u.purchasedCourses || []).length;
            revenue += u.totalSpent || 0;
            const prog = u.progress || {};
            Object.values(prog).forEach(tasks => lessons += tasks.length);
        });
        document.getElementById('totalUsers').innerText = allUsers.length;
        document.getElementById('totalRevenue').innerText = `RM${revenue}`;
        renderUsersTable();
    } catch(e) { console.error(e); }
}

function renderUsersTable() {
    const tbody = document.getElementById('usersList');
    if (allUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No farmers yet</td></tr>';
        return;
    }
    tbody.innerHTML = allUsers.map((user, idx) => {
        const purchased = user.purchasedCourses || [];
        return `
            <tr id="user-row-${idx}">
                <td><button class="expand-btn" onclick="toggleDetails(${idx})"><i class="fas fa-chevron-down"></i></button></td>
                <td><strong>${user.name || '-'}</strong></td>
                <td>${user.email}</td>
                <td>${purchased.length}</td>
                <td>RM${user.totalSpent || 0}</td>
                <td>${Object.values(user.progress || {}).reduce((s, t) => s + t.length, 0)}</td>
                <td>${user.memberSince || '-'}</td>
            </tr>
            <tr id="user-details-${idx}" class="user-details-row">
                <td colspan="7" class="details-cell">
                    <strong>📚 Courses Purchased:</strong><br>
                    ${purchased.length ? purchased.map(cid => {
                        const c = courseData[cid];
                        const prog = user.progress?.[cid] || [];
                        let total = 0, comp = 0;
                        if (c && c.weeks && c.weeks.length) {
                            for (let w = 0; w < c.weeks.length; w++) {
                                const tasks = c.weeks[w].tasks || [];
                                total += tasks.length;
                                for (let t = 0; t < tasks.length; t++) {
                                    if (prog.includes(w + '_' + t)) comp++;
                                }
                            }
                        }
                        const pct = total ? Math.floor((comp/total)*100) : 0;
                        return `<span class="course-tag">${c?.name || cid} (${pct}%)</span>`;
                    }).join('') : '<span class="course-tag">None</span>'}
                    <br><br>
                    <strong>💰 Recent Transactions:</strong><br>
                    ${(user.transactions || []).slice(0, 5).map(t => `
                        <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #eee;">
                            <span>${t.description}</span>
                            <span style="color:#2d6a2f;">RM${t.amount}</span>
                            <span style="font-size:0.7rem; color:#8a9bb0;">${t.date}</span>
                        </div>
                    `).join('') || 'No transactions'}
                </td>
            </tr>
        `;
    }).join('');
}

window.toggleDetails = (idx) => {
    const row = document.getElementById(`user-details-${idx}`);
    const btn = document.querySelector(`#user-row-${idx} .expand-btn i`);
    if (row.classList.contains('show')) {
        row.classList.remove('show');
        btn.className = 'fas fa-chevron-down';
    } else {
        row.classList.add('show');
        btn.className = 'fas fa-chevron-up';
    }
};

document.getElementById('refreshUsersBtn').addEventListener('click', () => loadUsers());

// ============================================
// COURSE BUILDER
// ============================================
async function loadCourses() {
    try {
        const doc = await db.collection('courses').doc('course_data').get();
        if (doc.exists && doc.data().data) {
            courseData = doc.data().data;
        } else {
            courseData = {
                chili: { id: 'chili', name: 'Chili', price: 15, category: 'crops', image: '', description: '', weeks: [] },
                tomato: { id: 'tomato', name: 'Tomato', price: 20, category: 'crops', image: '', description: '', weeks: [] },
                soil: { id: 'soil', name: 'Soil Preparation', price: 10, category: 'fundamentals', image: '', description: '', weeks: [] }
            };
            await db.collection('courses').doc('course_data').set({ data: courseData });
        }
        renderCoursesTable();
        
        const activeCount = Object.values(courseData).filter(c => c.weeks && c.weeks.length > 0).length;
        document.getElementById('activeCourses').innerText = activeCount;
    } catch(e) { console.error(e); }
}

function renderCoursesTable() {
    const tbody = document.getElementById('coursesList');
    const courses = Object.values(courseData);
    if (courses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No courses</td></tr>';
        return;
    }
    tbody.innerHTML = courses.map(c => `
        <tr>
            <td><code>${c.id}</code></td>
            <td><strong>${c.name}</strong></td>
            <td>RM${c.price}</td>
            <td><span style="background:#e8f0ea;padding:2px 10px;border-radius:20px;">${c.category === 'crops' ? '🌱 Crops' : '📚 Fundamentals'}</span></td>
            <td><button class="btn-edit" onclick="editCourse('${c.id}')">Edit</button><button class="btn-danger" onclick="deleteCourse('${c.id}')">Delete</button></td>
        </tr>
    `).join('');
}

window.editCourse = (id) => {
    const c = courseData[id];
    document.getElementById('modalTitle').innerText = 'Edit Course';
    document.getElementById('courseId').value = c.id;
    document.getElementById('courseId').disabled = true;
    document.getElementById('courseName').value = c.name;
    document.getElementById('coursePrice').value = c.price;
    document.getElementById('courseCategory').value = c.category;
    document.getElementById('courseImage').value = c.image || '';
    document.getElementById('courseDesc').value = c.description || '';
    document.getElementById('courseModal').style.display = 'flex';
};

document.getElementById('addCourseBtn').addEventListener('click', () => {
    document.getElementById('modalTitle').innerText = 'New Course';
    document.getElementById('courseId').value = '';
    document.getElementById('courseId').disabled = false;
    document.getElementById('courseName').value = '';
    document.getElementById('coursePrice').value = '';
    document.getElementById('courseCategory').value = 'crops';
    document.getElementById('courseImage').value = '';
    document.getElementById('courseDesc').value = '';
    document.getElementById('courseModal').style.display = 'flex';
});

document.getElementById('saveCourseBtn').addEventListener('click', async () => {
    const id = document.getElementById('courseId').value.trim().toLowerCase();
    const name = document.getElementById('courseName').value.trim();
    const price = parseInt(document.getElementById('coursePrice').value);
    const cat = document.getElementById('courseCategory').value;
    const img = document.getElementById('courseImage').value;
    const desc = document.getElementById('courseDesc').value;
    
    if (!id || !name || isNaN(price)) { alert('Fill required fields'); return; }
    if (!id.match(/^[a-z]+$/)) { alert('ID must be lowercase letters only'); return; }
    
    courseData[id] = { id, name, price, category: cat, image: img, description: desc, weeks: courseData[id]?.weeks || [] };
    await db.collection('courses').doc('course_data').set({ data: courseData });
    await loadCourses();
    document.getElementById('courseModal').style.display = 'none';
    alert('Course saved');
});

window.deleteCourse = async (id) => {
    if (confirm('Delete this course?')) {
        delete courseData[id];
        await db.collection('courses').doc('course_data').set({ data: courseData });
        await loadCourses();
        alert('Course deleted');
    }
};

document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('courseModal').style.display = 'none';
});

// ============================================
// QUIZ MAKER
// ============================================
async function loadQuizzes() {
    try {
        const doc = await db.collection('quizzes').doc('quiz_data').get();
        if (doc.exists && doc.data().data) {
            quizData = doc.data().data;
        } else {
            quizData = {};
            await db.collection('quizzes').doc('quiz_data').set({ data: quizData });
        }
        renderQuizzesTable();
    } catch(e) { console.error(e); }
}

function renderQuizzesTable() {
    const tbody = document.getElementById('quizzesList');
    const quizzes = Object.values(quizData);
    if (quizzes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No quizzes yet. Click "New Quiz"<\/td></tr>';
        return;
    }
    tbody.innerHTML = quizzes.map(q => `
        <tr>
            <td><code>${q.id}</code></td>
            <td>${courseData[q.courseId]?.name || q.courseId}</td>
            <td>Week ${q.week}</td>
            <td>${q.questions?.length || 0} questions</td>
            <td><button class="btn-edit" onclick="editQuiz('${q.id}')">Edit</button><button class="btn-danger" onclick="deleteQuiz('${q.id}')">Delete</button></td>
        </tr>
    `).join('');
}

function populateCourseSelect() {
    const select = document.getElementById('quizCourseId');
    const courses = Object.values(courseData);
    select.innerHTML = '<option value="">Select Course</option>' + courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function renderQuestionEditor() {
    const container = document.getElementById('questionsContainer');
    if (!currentQuestions.length) {
        container.innerHTML = '<div class="empty-state">No questions yet. Click "Add Question"</div>';
        return;
    }
    container.innerHTML = currentQuestions.map((q, idx) => `
        <div class="question-item">
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                <strong>Question ${idx + 1}</strong>
                <button type="button" class="btn-danger" onclick="removeQuestion(${idx})">Remove</button>
            </div>
            <div class="form-group"><label>Question Text</label><input type="text" id="q_text_${idx}" value="${escapeHtml(q.text)}" placeholder="Enter question"></div>
            <div class="form-group"><label>Choices (one per line)</label>
                <textarea id="q_choices_${idx}" rows="3" placeholder="Option 1&#10;Option 2&#10;Option 3&#10;Option 4">${q.choices ? q.choices.join('\n') : ''}</textarea>
            </div>
            <div class="form-group"><label>Correct Answer (number)</label><input type="number" id="q_correct_${idx}" value="${q.correct || 1}" min="1" max="4"></div>
        </div>
    `).join('');
}

window.removeQuestion = (idx) => {
    currentQuestions.splice(idx, 1);
    renderQuestionEditor();
};

document.getElementById('addQuestionBtn').addEventListener('click', () => {
    currentQuestions.push({ text: '', choices: ['', '', '', ''], correct: 1 });
    renderQuestionEditor();
});

function collectQuestionsFromEditor() {
    const questions = [];
    for (let i = 0; i < currentQuestions.length; i++) {
        const text = document.getElementById(`q_text_${i}`)?.value || '';
        const choicesText = document.getElementById(`q_choices_${i}`)?.value || '';
        const choices = choicesText.split('\n').filter(c => c.trim().length > 0);
        const correct = parseInt(document.getElementById(`q_correct_${i}`)?.value) || 1;
        if (text && choices.length >= 2) {
            questions.push({ text, choices, correct });
        }
    }
    return questions;
}

window.editQuiz = (id) => {
    currentEditingQuizId = id;
    const quiz = quizData[id];
    populateCourseSelect();
    document.getElementById('quizCourseId').value = quiz.courseId;
    document.getElementById('quizWeek').value = quiz.week;
    document.getElementById('quizTitle').value = quiz.title || '';
    currentQuestions = quiz.questions || [];
    renderQuestionEditor();
    document.getElementById('quizModalTitle').innerText = 'Edit Quiz';
    document.getElementById('quizModal').style.display = 'flex';
};

document.getElementById('addQuizBtn').addEventListener('click', () => {
    currentEditingQuizId = null;
    populateCourseSelect();
    document.getElementById('quizCourseId').value = '';
    document.getElementById('quizWeek').value = '';
    document.getElementById('quizTitle').value = '';
    currentQuestions = [];
    renderQuestionEditor();
    document.getElementById('quizModalTitle').innerText = 'Add New Quiz';
    document.getElementById('quizModal').style.display = 'flex';
});

document.getElementById('saveQuizBtn').addEventListener('click', async () => {
    const courseId = document.getElementById('quizCourseId').value;
    const week = parseInt(document.getElementById('quizWeek').value);
    const title = document.getElementById('quizTitle').value;
    const questions = collectQuestionsFromEditor();
    
    if (!courseId) { alert('Select a course'); return; }
    if (!week) { alert('Enter week number'); return; }
    if (!title) { alert('Enter quiz title'); return; }
    if (questions.length === 0) { alert('Add at least one question'); return; }
    
    const quizId = currentEditingQuizId || `${courseId}_week${week}`;
    quizData[quizId] = {
        id: quizId,
        courseId: courseId,
        week: week,
        title: title,
        questions: questions,
        createdAt: new Date().toISOString()
    };
    
    await db.collection('quizzes').doc('quiz_data').set({ data: quizData });
    await loadQuizzes();
    document.getElementById('quizModal').style.display = 'none';
    alert('Quiz saved!');
});

window.deleteQuiz = async (id) => {
    if (confirm('Delete this quiz?')) {
        delete quizData[id];
        await db.collection('quizzes').doc('quiz_data').set({ data: quizData });
        await loadQuizzes();
        alert('Quiz deleted');
    }
};

document.getElementById('closeQuizModalBtn').addEventListener('click', () => {
    document.getElementById('quizModal').style.display = 'none';
});

// ============================================
// ANALYTICS
// ============================================
async function loadAnalytics() {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const enrollmentByMonth = {};
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(today.getMonth() - i);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        enrollmentByMonth[key] = 0;
    }
    
    let weekEnrollments = 0;
    let enrollmentsToday = 0;
    let totalRevenue = 0;
    let revenueThisMonth = 0;
    const courseEnrollCount = {};
    const courseCompleteCount = {};
    
    for (const user of allUsers) {
        const transactions = user.transactions || [];
        totalRevenue += user.totalSpent || 0;
        
        for (const t of transactions) {
            const dateParts = t.date.split('/');
            if (dateParts.length === 3) {
                const txDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
                const monthKey = `${txDate.getFullYear()}-${txDate.getMonth()}`;
                if (enrollmentByMonth[monthKey] !== undefined) {
                    enrollmentByMonth[monthKey]++;
                }
                if (txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear()) {
                    revenueThisMonth += t.amount;
                }
                const daysDiff = Math.floor((today - txDate) / (1000 * 60 * 60 * 24));
                if (daysDiff <= 7) weekEnrollments++;
                if (daysDiff === 0) enrollmentsToday++;
            }
        }
        
        const purchased = user.purchasedCourses || [];
        for (const courseId of purchased) {
            courseEnrollCount[courseId] = (courseEnrollCount[courseId] || 0) + 1;
            const progress = user.progress || {};
            const courseProgress = progress[courseId] || [];
            const course = courseData[courseId];
            let total = 0, comp = 0;
            if (course && course.weeks) {
                for (let w = 0; w < course.weeks.length; w++) {
                    const tasks = course.weeks[w].tasks || [];
                    total += tasks.length;
                    for (let t = 0; t < tasks.length; t++) {
                        if (courseProgress.includes(w + '_' + t)) comp++;
                    }
                }
            }
            if (total > 0 && comp === total) {
                courseCompleteCount[courseId] = (courseCompleteCount[courseId] || 0) + 1;
            }
        }
    }
    
    // Update stats
    document.getElementById('enrollmentsToday').innerText = enrollmentsToday;
    document.getElementById('weekEnrollments').innerText = weekEnrollments;
    const revenueTrend = revenueThisMonth > 0 ? `+RM${revenueThisMonth} this month` : 'No revenue this month';
    document.getElementById('revenueTrend').innerHTML = revenueTrend;
    
    // Completion rate
    let totalCompletedCourses = 0;
    let totalEnrolledCourses = 0;
    for (const [courseId, enrolled] of Object.entries(courseEnrollCount)) {
        totalEnrolledCourses += enrolled;
        totalCompletedCourses += courseCompleteCount[courseId] || 0;
    }
    const avgCompletion = totalEnrolledCourses > 0 ? Math.floor((totalCompletedCourses / totalEnrolledCourses) * 100) : 0;
    document.getElementById('completionRate').innerText = avgCompletion + '%';
    document.getElementById('overallCompletion').innerText = avgCompletion + '%';
    
    // Avg revenue per user
    const avgRev = allUsers.length > 0 ? Math.floor(totalRevenue / allUsers.length) : 0;
    document.getElementById('avgRevenue').innerText = `RM${avgRev}`;
    
    // Most popular course
    let topCourseId = null;
    let topCourseCount = 0;
    for (const [id, count] of Object.entries(courseEnrollCount)) {
        if (count > topCourseCount) {
            topCourseCount = count;
            topCourseId = id;
        }
    }
    const topCourse = courseData[topCourseId]?.name || 'None';
    document.getElementById('topCourse').innerText = topCourse;
    document.getElementById('topCourseCount').innerText = `${topCourseCount} enrollments`;
    
    // Completion rates table
    const completionTbody = document.getElementById('completionRatesList');
    let completionHtml = '';
    for (const [courseId, enrolled] of Object.entries(courseEnrollCount)) {
        const course = courseData[courseId];
        if (course) {
            const completed = courseCompleteCount[courseId] || 0;
            const rate = enrolled > 0 ? Math.floor((completed / enrolled) * 100) : 0;
            completionHtml += `<tr><td>${course.name}</td><td>${enrolled}</td><td>${completed}</td><td><div class="badge-success">${rate}%</div></td></tr>`;
        }
    }
    completionTbody.innerHTML = completionHtml || '<tr><td colspan="4" class="empty-state">No enrollment data yet</td></tr>';
    
    // Popular courses list
    const popularList = document.getElementById('popularCoursesList');
    const sortedCourses = Object.entries(courseEnrollCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (sortedCourses.length === 0) {
        popularList.innerHTML = '<div class="empty-state">No enrollment data yet</div>';
    } else {
        let popularHtml = '';
        for (let i = 0; i < sortedCourses.length; i++) {
            const [id, count] = sortedCourses[i];
            const course = courseData[id];
            const completed = courseCompleteCount[id] || 0;
            const rate = count > 0 ? Math.floor((completed / count) * 100) : 0;
            popularHtml += `
                <div class="popular-item">
                    <div class="rank">${i + 1}</div>
                    <div class="name">${course?.name || id}</div>
                    <div class="count">${count} enrolled</div>
                    <div class="rate">${rate}%</div>
                </div>
            `;
        }
        popularList.innerHTML = popularHtml;
    }
    
    // Enrollment chart
    const chartLabels = [];
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(today.getMonth() - i);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        chartLabels.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
        chartData.push(enrollmentByMonth[key] || 0);
    }
    
    if (enrollmentChart) enrollmentChart.destroy();
    const ctx = document.getElementById('enrollmentChart').getContext('2d');
    enrollmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Enrollments',
                data: chartData,
                borderColor: '#2d6a2f',
                backgroundColor: 'rgba(45,106,47,0.05)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: true }
    });
}

// ============================================
// MARKET PRICES
// ============================================
async function loadPriceEditor() {
    const container = document.getElementById('priceEditor');
    container.innerHTML = '<div class="empty-state">Loading...</div>';
    
    try {
        const doc = await db.collection('settings').doc('market_prices').get();
        
        if (doc.exists) {
            currentPrices = doc.data();
        } else {
            currentPrices = {
                item1: { id: 'item1', name: 'Chili', price: 8, unit: 'kg' },
                item2: { id: 'item2', name: 'Tomato', price: 5, unit: 'kg' },
                item3: { id: 'item3', name: 'Brinjal', price: 4, unit: 'kg' },
                item4: { id: 'item4', name: 'Bendi', price: 6, unit: 'kg' },
                item5: { id: 'item5', name: 'Cili Padi', price: 12, unit: 'kg' },
                item6: { id: 'item6', name: 'Mango', price: 7, unit: 'kg' }
            };
        }
        renderPriceEditorGrid();
    } catch(e) {
        console.error(e);
        container.innerHTML = '<div class="empty-state">Error loading. Check console.</div>';
    }
}

function renderPriceEditorGrid() {
    const container = document.getElementById('priceEditor');
    const items = Object.values(currentPrices);
    
    if (items.length === 0) {
        container.innerHTML = '<div class="empty-state">No items. Click "Add New Item" to start.</div>';
        return;
    }
    
    let html = '<div class="price-editor-grid">';
    for (let [key, item] of Object.entries(currentPrices)) {
        html += `
            <div class="price-card" data-key="${key}">
                <button class="delete-price-btn" onclick="deletePriceItem('${key}')"><i class="fas fa-trash"></i> Delete</button>
                <h4>${escapeHtml(item.name)}</h4>
                <label>Price (RM)</label>
                <input type="number" class="price-input" data-key="${key}" value="${item.price}" step="0.5">
                <label style="margin-top: 12px;">Unit</label>
                <input type="text" class="unit-input" data-key="${key}" value="${escapeHtml(item.unit)}">
            </div>
        `;
    }
    html += '</div>';
    container.innerHTML = html;
}

window.deletePriceItem = (key) => {
    if (confirm('Delete this item?')) {
        delete currentPrices[key];
        renderPriceEditorGrid();
    }
};

document.getElementById('addPriceItemBtn').addEventListener('click', () => {
    document.getElementById('newItemName').value = '';
    document.getElementById('newItemPrice').value = '5';
    document.getElementById('newItemUnit').value = 'kg';
    document.getElementById('addPriceModal').style.display = 'flex';
});

document.getElementById('confirmAddPriceBtn').addEventListener('click', () => {
    const name = document.getElementById('newItemName').value.trim();
    const price = parseFloat(document.getElementById('newItemPrice').value);
    const unit = document.getElementById('newItemUnit').value.trim();
    
    if (!name) { alert('Enter item name'); return; }
    if (isNaN(price)) { alert('Enter valid price'); return; }
    if (!unit) { alert('Enter unit'); return; }
    
    const newId = 'item_' + Date.now();
    currentPrices[newId] = { id: newId, name: name, price: price, unit: unit };
    renderPriceEditorGrid();
    document.getElementById('addPriceModal').style.display = 'none';
});

document.getElementById('closeAddPriceModalBtn').addEventListener('click', () => {
    document.getElementById('addPriceModal').style.display = 'none';
});

document.getElementById('savePricesBtn').addEventListener('click', async () => {
    for (let [key, item] of Object.entries(currentPrices)) {
        const priceInput = document.querySelector(`.price-input[data-key="${key}"]`);
        const unitInput = document.querySelector(`.unit-input[data-key="${key}"]`);
        if (priceInput && unitInput) {
            currentPrices[key].price = parseFloat(priceInput.value);
            currentPrices[key].unit = unitInput.value;
        }
    }
    
    try {
        await db.collection('settings').doc('market_prices').set(currentPrices);
        alert('Market prices saved to Firestore!');
    } catch(e) {
        alert('Error saving: ' + e.message);
    }
});

// Close modals on outside click
window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('courseModal')) document.getElementById('courseModal').style.display = 'none';
    if (e.target === document.getElementById('quizModal')) document.getElementById('quizModal').style.display = 'none';
    if (e.target === document.getElementById('addPriceModal')) document.getElementById('addPriceModal').style.display = 'none';
});