const translations = {
    en: {
        home: "Home", courses: "Courses", allCourses: "All Courses", buyCredits: "Buy Credits",
        testimonials: "Testimonials", myAccount: "My Account", logIn: "Log In", logOut: "Log Out",
        welcome: "Welcome to My FarmAgro!",
        welcomeDesc: "Start your journey as a modern agropreneur with our expert-led courses.",
        learnFromExperts: "Learn from Experts",
        learnFromExpertsDesc: "Step-by-step video lessons from experienced farmers.",
        growOwnFood: "Grow Your Own Food",
        growOwnFoodDesc: "From seed to harvest - master the art of farming.",
        howItWorks: "How It Works", startJourney: "Start your journey in 3 simple steps",
        step1Title: "Register Account", step1Desc: "Create your free account to start learning.",
        step2Title: "Buy Credits", step2Desc: "Purchase credits to unlock your chosen courses.",
        step3Title: "Start Learning", step3Desc: "Follow weekly modules and start growing your harvest.",
        expertCourses: "Expert Courses", videoLessons: "Video Lessons",
        registeredFarmers: "Registered Farmers", userRating: "★ User Rating",
        masterFundamentals: "🌾 Master the Fundamentals",
        soilTitle: "Soil & Land Prep", soilDesc: "Learn soil testing, composting, and regenerative techniques to build rich farmland.",
        cropTitle: "Crop Planning", cropDesc: "Seasonal calendars, companion planting, and high-value crop selection.",
        irrigationTitle: "Irrigation Systems", irrigationDesc: "Drip, sprinkler, rainwater harvesting — efficient water management.",
        farmTitle: "Farm Economics", farmDesc: "Budgeting, pricing, and selling to local markets & restaurants.",
        yourCredits: "Your Credits Balance", credits: "Credits",
        creditDesc: "1 Credit = RM1 • Use Credits to unlock courses",
        buyCreditsTitle: "🌱 Buy Credits",
        buyCreditsText: "Purchase credits to unlock courses. One-time payment, lifetime access to each course.",
        instantDelivery: "✓ Instant delivery • Use Credits to unlock any course",
        creditsAmount: "Credits", searchPlaceholder: "Search courses...",
        chooseCourse: "Choose Your Course", noResults: "No courses found matching your search.",
        loadingCourses: "Loading courses...", owned: "Owned", unlockWith: "Unlock with",
        accessCourse: "Access Course", complete: "complete",
        whatFarmersSay: "💬 What Our Farmers Say",
        testimonial1: "“I bought Credits and unlocked the Chili course. Now I'm harvesting my own chilies and selling at the local market!”",
        testimonial2: "“The Cili Padi course taught me everything. My sambal is now famous in the village!”",
        testimonial3: "“Finally, a platform that teaches mango grafting properly. My trees are producing after 2 years!”",
        readyStart: "Ready to Start Your Farming Journey?",
        joinFarmers: "Join thousands of farmers who are growing their own food.",
        getStarted: "Get Started →",
        myAccountTitle: "My Account", memberSince: "Member since",
        creditsAvailable: "Credits", coursesOwned: "Courses Owned",
        totalSpent: "Total Spent", lessonsCompleted: "Lessons Completed",
        myCourses: "My Courses", transactionHistory: "Transaction History",
        editProfile: "Edit Profile", noCourses: "No courses purchased yet.",
        noTransactions: "No transactions yet.",
        editProfileTitle: "Edit Profile", fullName: "Full Name",
        emailCannotChange: "Email cannot be changed. Contact support if needed.",
        saveChanges: "Save Changes", cancel: "Cancel",
        buyCreditsModal: "Buy Credits", confirmPurchase: "Confirm Purchase →",
        insufficientCredits: "Insufficient Credits", needMoreCredits: "You need more Credits to unlock this course.",
        buyCreditsBtn: "Buy Credits",
        welcomeBack: "Welcome Back", email: "Email", password: "Password",
        logInBtn: "Log In", signUp: "Sign Up", forgotPassword: "Forgot Password?",
        createAccount: "Create Account", fullNamePlaceholder: "Full Name",
        passwordMin: "Password (min 6)", backToLogin: "Back to Login",
        resetPassword: "Reset Password", sendResetLink: "Send Reset Link", close: "Close",
        loginFirst: "Please log in first", loggedIn: "Logged in successfully!",
        loggedOut: "Logged out successfully",
        accountCreated: "Account created! Please check your email to verify.",
        profileUpdated: "Profile updated!",
        purchaseSuccess: "✅ Purchased {{credits}} Credits for RM{{amount}}!",
        purchaseFailed: "Failed to purchase credits. Please try again.",
        unlockSuccess: "✅ Unlocked {{course}} Masterclass!",
        unlockFailed: "Failed to unlock course. Please try again.",
        loadError: "Failed to load courses. Please refresh the page.",
        copyright: "© 2025 My FarmAgro — Cultivate knowledge, grow your future."
    },
    ms: {
        home: "Utama", courses: "Kursus", allCourses: "Semua Kursus", buyCredits: "Beli Kredit",
        testimonials: "Testimoni", myAccount: "Akaun Saya", logIn: "Log Masuk", logOut: "Log Keluar",
        welcome: "Selamat Datang ke My FarmAgro!",
        welcomeDesc: "Mulakan perjalanan anda sebagai usahawan tani moden dengan kursus pakar kami.",
        learnFromExperts: "Belajar dari Pakar",
        learnFromExpertsDesc: "Pelajaran video langkah demi langkah dari petani berpengalaman.",
        growOwnFood: "Tanam Makanan Sendiri",
        growOwnFoodDesc: "Dari biji benih ke tuaian - kuasai seni pertanian.",
        howItWorks: "Cara Ia Berfungsi", startJourney: "Mulakan perjalanan anda dalam 3 langkah mudah",
        step1Title: "Daftar Akaun", step1Desc: "Cipta akaun percuma anda untuk mula belajar.",
        step2Title: "Beli Kredit", step2Desc: "Beli kredit untuk membuka kursus pilihan anda.",
        step3Title: "Mula Belajar", step3Desc: "Ikuti modul mingguan dan mula hasilkan tuaian anda.",
        expertCourses: "Kursus Pakar", videoLessons: "Pelajaran Video",
        registeredFarmers: "Petani Berdaftar", userRating: "★ Penilaian Pengguna",
        masterFundamentals: "🌾 Kuasai Asas",
        soilTitle: "Penyediaan Tanah", soilDesc: "Belajar ujian tanah, pengkomposan, dan teknik regeneratif untuk tanah subur.",
        cropTitle: "Perancangan Tanaman", cropDesc: "Kalendar bermusim, penanaman bersampingan, dan pemilihan tanaman bernilai tinggi.",
        irrigationTitle: "Sistem Pengairan", irrigationDesc: "Titisan, sprinkler, penuaian air hujan — pengurusan air efisien.",
        farmTitle: "Ekonomi Ladang", farmDesc: "Belanjawan, penetapan harga, dan menjual ke pasaran tempatan & restoran.",
        yourCredits: "Baki Kredit Anda", credits: "Kredit",
        creditDesc: "1 Kredit = RM1 • Guna Kredit untuk buka kursus",
        buyCreditsTitle: "🌱 Beli Kredit",
        buyCreditsText: "Beli kredit untuk buka kursus. Bayaran sekali, akses seumur hidup.",
        instantDelivery: "✓ Penghantaran segera • Guna Kredit untuk buka mana-mana kursus",
        creditsAmount: "Kredit", searchPlaceholder: "Cari kursus...",
        chooseCourse: "Pilih Kursus Anda", noResults: "Tiada kursus ditemui.",
        loadingCourses: "Memuatkan kursus...", owned: "Dimiliki", unlockWith: "Buka dengan",
        accessCourse: "Akses Kursus", complete: "selesai",
        whatFarmersSay: "💬 Kata Petani Kami",
        testimonial1: "“Saya beli Kredit dan buka kursus Cili. Sekarang saya menuai cili sendiri dan menjual di pasar!”",
        testimonial2: "“Kursus Cili Padi mengajar saya segalanya. Sambal saya kini terkenal di kampung!”",
        testimonial3: "“Akhirnya platform yang mengajar cantuman mangga dengan betul. Pokok saya mula berbuah selepas 2 tahun!”",
        readyStart: "Sedia Memulakan Perjalanan Tani Anda?",
        joinFarmers: "Sertai ribuan petani yang sedang mengembangkan hasil tanaman mereka.",
        getStarted: "Mulakan →",
        myAccountTitle: "Akaun Saya", memberSince: "Ahli sejak",
        creditsAvailable: "Kredit", coursesOwned: "Kursus Dimiliki",
        totalSpent: "Jumlah Bayaran", lessonsCompleted: "Pelajaran Selesai",
        myCourses: "Kursus Saya", transactionHistory: "Sejarah Transaksi",
        editProfile: "Edit Profil", noCourses: "Tiada kursus dibeli lagi.",
        noTransactions: "Tiada transaksi lagi.",
        editProfileTitle: "Edit Profil", fullName: "Nama Penuh",
        emailCannotChange: "Email tidak boleh diubah. Hubungi sokongan jika perlu.",
        saveChanges: "Simpan", cancel: "Batal",
        buyCreditsModal: "Beli Kredit", confirmPurchase: "Sahkan Pembelian →",
        insufficientCredits: "Kredit Tidak Mencukupi", needMoreCredits: "Anda perlukan lebih banyak kredit untuk buka kursus ini.",
        buyCreditsBtn: "Beli Kredit",
        welcomeBack: "Selamat Kembali", email: "Email", password: "Kata Laluan",
        logInBtn: "Log Masuk", signUp: "Daftar", forgotPassword: "Lupa Kata Laluan?",
        createAccount: "Cipta Akaun", fullNamePlaceholder: "Nama Penuh",
        passwordMin: "Kata Laluan (min 6)", backToLogin: "Kembali ke Log Masuk",
        resetPassword: "Tetap Semula Kata Laluan", sendResetLink: "Hantar Link Reset", close: "Tutup",
        loginFirst: "Sila log masuk terlebih dahulu", loggedIn: "Log masuk berjaya!",
        loggedOut: "Log keluar berjaya",
        accountCreated: "Akaun berjaya didaftarkan! Sila sahkan email anda.",
        profileUpdated: "Profil dikemaskini!",
        purchaseSuccess: "✅ Berjaya beli {{credits}} Kredit untuk RM{{amount}}!",
        purchaseFailed: "Gagal membeli kredit. Sila cuba lagi.",
        unlockSuccess: "✅ Berjaya buka kunci {{course}} Masterclass!",
        unlockFailed: "Gagal membuka kursus. Sila cuba lagi.",
        loadError: "Gagal memuatkan kursus. Sila muat semula halaman.",
        copyright: "© 2025 My FarmAgro — Tanam ilmu, tuai hasil."
    }
};

let currentLang = 'en';

function t(key, replacements = {}) {
    let text = translations[currentLang][key] || translations['en'][key] || key;
    for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(`{{${k}}}`, v);
    }
    return text;
}

// Auto-translate course text (for dynamic course names and descriptions)
function translateCourseText(text) {
    if (!text || currentLang !== 'ms') return text;
    
    const translations = {
        // Vegetables/Fruits
        "Chili": "Cili",
        "Tomato": "Tomato",
        "Brinjal": "Terung",
        "Bendi": "Bendi",
        "Cili Padi": "Cili Padi",
        "Mango": "Mangga",
        "Durian": "Durian",
        "Carrot": "Lobak Merah",
        "Spinach": "Bayam",
        "Eggplant": "Terung",
        "Okra": "Bendi",
        
        // Descriptions
        "Spicy and versatile.": "Pedas dan serbaguna.",
        "Juicy and sweet.": "Manis dan berjus.",
        "Glossy and versatile.": "Berkilat dan serbaguna.",
        "Fast-growing and heat-tolerant.": "Tumbuh cepat dan tahan panas.",
        "Extra spicy and aromatic.": "Extra pedas dan wangi.",
        "Sweet tropical fruit.": "Buah tropika yang manis.",
        "King of Fruits": "Raja Buahan",
        "Crunchy and healthy.": "Rangup dan sihat.",
        "Rich in iron and vitamins.": "Kaya dengan zat besi dan vitamin.",
        "Learn to grow": "Belajar tanam"
    };
    
    // Check exact match
    if (translations[text]) return translations[text];
    
    // Check partial match for phrases
    for (const [eng, malay] of Object.entries(translations)) {
        if (text.includes(eng)) {
            return text.replace(eng, malay);
        }
    }
    
    return text;
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[lang][key];
            } else {
                el.innerHTML = translations[lang][key];
            }
        }
    });
    
    document.querySelectorAll('.credit-pack .seeds-amount').forEach(el => {
        const number = el.innerText.match(/\d+/)?.[0];
        if (number) el.innerHTML = `${number} ${currentLang === 'ms' ? 'Kredit' : 'Credits'}`;
    });
    
    if (typeof filterAndRenderCourses === 'function') filterAndRenderCourses();
}

const savedLang = localStorage.getItem('language');
if (savedLang && translations[savedLang]) currentLang = savedLang;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.getAttribute('data-lang')));
    });
    setLanguage(currentLang);
});