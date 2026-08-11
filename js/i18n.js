/* ===========================================================
   Bike.X — i18n.js
   Shared translation dictionary + language switching.
   =========================================================== */

const LANG_KEY = "moto_lang";

const CITY_NAMES_AR = {
  Riyadh: "الرياض",
  Jeddah: "جدة",
  Dammam: "الدمام",
  Mecca: "مكة المكرمة",
  Medina: "المدينة المنورة",
  Khobar: "الخبر",
  Abha: "أبها",
  Taif: "الطائف"
};

const I18N = {
  en: {
    titleHome: "Bike.X — Buy & sell motorcycles in Saudi Arabia",
    titleSell: "Sell — Bike.X",
    tagline: "motorcycles only",
    searchPlaceholder: "Search brand, model or city…",
    searchAria: "Search listings",
    searchBtn: "Search",
    sellBtn: "+ Sell",
    themeAria: "Toggle dark mode",
    switchTo: "العربية",
    backToListings: "← Back to listings",

    heroTitleHtml: "Find your next <span>ride</span>,<br>not just a listing.",
    heroSubtitle: "Saudi Arabia's classifieds, built only for motorcycles — sport bikes, cruisers, adventure and everything between.",
    heroStat1: "Active listings",
    heroStat2: "Cities covered",
    heroStat3: "Brands",
    heroOffersAria: "Recent motorcycle offers",

    filtersTitle: "Filters",
    labelBrand: "Brand",
    allBrands: "All brands",
    showMore: "Show more",
    showLess: "Show less",
    labelCity: "City",
    allCities: "All cities",
    labelCondition: "Condition",
    labelCommentsToggle: "Comments on this listing",
    commentsAllowLabel: "Allow comments",
    commentsDisableLabel: "Disable comments",
    commentsToggleHint: "Buyers can ask public questions under your listing unless you disable this.",
    conditionAny: "New or used",
    conditionNew: "New",
    conditionUsed: "Used",
    priceRangeLabel: "Price range (SAR)",
    minPlaceholder: "Min",
    maxPlaceholder: "Max",
    savedOnly: "♥ Saved only",
    clearFilters: "Clear all filters",

    sortAria: "Sort listings",
    sortNewest: "Newest",
    sortPriceAsc: "Price: low to high",
    sortPriceDesc: "Price: high to low",
    sortMileageAsc: "Mileage: lowest first",
    sortYearDesc: "Year: newest first",

    resultsFound: n => `${n} motorcycle${n === 1 ? "" : "s"} found`,
    saveListingAria: "Save listing",
    prevImageAria: "Previous image",
    nextImageAria: "Next image",
    imageAria: n => `Image ${n}`,
    odoLabel: "ODO",
    kmUnit: "km",
    emptyTitle: "No motorcycles match these filters",
    emptyText: "Try widening your price range or clearing a filter.",

    specBrand: "Brand", specModel: "Model", specYear: "Year", specMileage: "Mileage",
    specEngine: "Engine", specColor: "Color", specCondition: "Condition", specCity: "City",
    specType: "Type",
    sellerIn: city => `Seller in ${city}`,
    memberListing: id => `Member listing · Ref ${id}`,
    showContact: "Show contact details",
    hideContact: "Hide Contact Details",
    contactDemo: "+966 5X XXX XXXX (demo)",

    footerText: "Bike X — a motorcycle-only classifieds concept.",

    sellTitle: "List your motorcycle",
    sellSubtitle: "Fill in the details below. Your listing appears at the top of the homepage instantly — no account needed for this demo.",
    sellCategoryLabel: "What are you selling?",
    labelModel: "Model",
    labelYear: "Year",
    labelEngineCc: "Engine size (cc)",
    labelPriceSar: "Price (SAR) (optional)",
    priceOnRequest: "Price on request",
    labelMileageKm: "Mileage (km)",
    labelColor: "Color",
    labelDescription: "Description",
    labelCitySell: "City (optional)",
    labelModelOpt: "Model (optional)",
    labelYearOpt: "Year (optional)",
    labelEngineCcOpt: "Engine size (cc) (optional)",
    labelMileageKmOpt: "Mileage (km) (optional)",
    labelColorOpt: "Color (optional)",
    selectBrandDefault: "Select brand",
    selectCityDefault: "Select city",
    selectTypeDefault: "Select type",
    anyUniversal: "Any",
    placeholderModel: "e.g. YZF-R1",
    placeholderYear: "2023",
    placeholderCc: "998",
    placeholderPrice: "45000",
    placeholderMileage: "8000",
    placeholderColor: "e.g. Matte Black",

    labelPartTitle: "Part name",
    placeholderPartTitle: "e.g. Akrapovic Slip-on Exhaust",
    labelPartType: "Type",
    labelPartBrand: "Compatible brand (optional)",
    partTypeExhaust: "Exhaust",
    partTypeBrakes: "Brakes",
    partTypeDrivetrain: "Drivetrain",
    partTypeElectrical: "Electrical",
    partTypeBodywork: "Bodywork",
    partTypeLuggage: "Luggage",
    partTypeTires: "Tires & Wheels",
    partTypeEngine: "Engine",
    partTypeSuspension: "Suspension",
    partTypeOther: "Other",

    labelGearTitle: "Item name",
    placeholderGearTitle: "e.g. Shoei RF-1400 Helmet",
    labelGearType: "Type",
    labelGearSize: "Size (optional)",
    placeholderGearSize: "e.g. L, 43, One size",
    gearTypeHelmet: "Helmet",
    gearTypeJacket: "Jacket",
    gearTypeGloves: "Gloves",
    gearTypeBoots: "Boots",
    gearTypeTankBag: "Tank Bag",
    gearTypeRainSuit: "Rain Suit",
    gearTypeElectronics: "Electronics",

    labelServiceType: "Service type",
    serviceTypeTowing: "Towing / Flatbed Recovery",
    serviceTypeInsuranceTransfer: "Insurance & Ownership Transfer Offices",
    serviceTypeMobileWash: "Mobile Washing",
    serviceTypeParking: "Parking",
    placeholderDesc: "Service history, modifications, reason for selling…",
    cancelBtn: "Cancel",
    publishBtn: "Publish listing",
    toastPublished: "Listing published — redirecting to homepage…",

    loginTitle: "Log in to Bike X",
    loginSubtitle: "Welcome back. Log in to manage your listings.",
    signupTitle: "Create your account",
    signupSubtitle: "Join Bike X to post and manage your motorcycle listings.",
    labelFullName: "Full name",
    labelEmail: "Email",
    labelPassword: "Password",
    labelConfirmPassword: "Confirm password",
    placeholderFullName: "e.g. Abdullah",
    placeholderEmail: "you@example.com",
    placeholderPassword: "••••••••",
    rememberMe: "Remember me",
    loginBtn: "Log in",
    signupBtn: "Create account",
    noAccountYet: "Don't have an account?",
    haveAccountAlready: "Already have an account?",
    signupLink: "Sign up",
    loginLink: "Log in",
    catServices: "Services",
    catGear: "Gear & Accessories",
    catParts: "Parts",
    catMotorcycles: "Motorcycles",
    fromPricePrefix: "From",
    logoutBtn: "Log out",
    hiName: name => `Hi, ${name}`,
    authRequiredNotice: "Please log in to post a listing.",
    loginErrorInvalid: "Incorrect email or password.",
    signupErrorMismatch: "Passwords don't match.",
    signupErrorExists: "An account with this email already exists.",
    signupErrorFields: "Please fill in all fields.",
    orContinueWith: "or continue with",
    signInGoogle: "Sign in with Google",
    loginWithPhone: "Log in with phone (OTP)",
    labelPhone: "Phone number",
    sendCode: "Send code",
    labelOtpCode: "Enter code",
    verifyCode: "Verify & log in",
    googlePickerTitle: "Choose an account",
    googlePickerSubtitle: "to continue to Bike X",
    googlePickerFootnote: "Demo only — no real Google account is contacted.",
    otpInvalidPhone: "Please enter a valid phone number.",
    otpInvalidCode: "That code doesn't match. Please try again.",
    otpDemoCodeHint: code => `Demo mode: your verification code is ${code} (this would normally be sent by SMS).`,

    dashboardTitle: "Dashboard — Bike X",
    dashboardBtn: "Dashboard",
    myListings: "My Listings",
    accountSettings: "Account Settings",
    adminPanel: "Admin Panel",
    addNewListing: "Add New Listing",
    noListingsYet: "You haven't posted any listings yet",
    createFirstListing: "Create your first motorcycle listing!",
    noListings: "No listings found",
    noUsers: "No users found",
    edit: "Edit",
    delete: "Delete",
    editListing: "Edit Listing",
    confirmDelete: "Are you sure you want to delete this listing?",
    settingsSaved: "Settings saved successfully!",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    saveChanges: "Save Changes",
    emailCannotChange: "Email cannot be changed",
    labelPhone: "Phone Number",
    totalListings: "Total Listings",
    totalUsers: "Total Users",
    totalAdmins: "Admins",
    allListings: "All Listings",
    allUsers: "All Users",
    name: "Name",
    email: "Email",
    phone: "Phone",
    role: "Role",
    actions: "Actions",
    makeAdmin: "Make Admin",
    removeAdmin: "Remove Admin",

    // ✅ NEW: Modal & Confirmation Translations
    confirmDeleteTitle: "Confirm Delete",
    confirmDeleteMessage: "Are you sure you want to delete this listing? This action cannot be undone.",
    confirmDeleteCancel: "Cancel",
    confirmDeleteConfirm: "Delete",
    confirmActionTitle: "Confirm Action",
    confirmMakeAdminMessage: "Are you sure you want to make {email} an admin?",
    confirmRemoveAdminMessage: "Are you sure you want to remove admin privileges from {email}?",
    confirmDeleteUserMessage: "Are you sure you want to delete user {email}? This action cannot be undone.",
    permissionDenied: "Permission Denied",
    actionBlocked: "Action Blocked",
    success: "Success",
    error: "Error",
    isNowAdmin: "is now an admin.",
    isNowUser: "is now a regular user.",
    userDeleted: "has been deleted.",

    uploadImages: "Upload Images",
    dragDropImages: "Drag & drop images here or click to browse",
    imageRequiredAlert: "Please upload at least one image.",
    brandOther: "Other",
    labelSpecifyBrand: "Specify brand",
    placeholderSpecifyBrand: "e.g. Zongshen",
    imageUploadHint: "Upload up to 6 images (JPEG, PNG, GIF) - Max 2MB each",
    imageHelp: "First image will be used as the main listing image",
    maxImagesReached: "You can upload a maximum of 6 images.",
    removeImage: "Remove image",
    invalidImageType: "Please select a valid image file (JPEG, PNG, GIF, WEBP).",
    imageTooLarge: "Image size must be less than 2MB.",
    avatarUpdated: "Profile picture updated successfully!",
    avatarUpdateFailed: "Failed to update profile picture.",
    changeProfilePicture: "Change profile picture",

    home: "Home",
    about: "About",
    contact: "Contact",
    aboutTitle: "About Bike X",
    aboutSubtitle: "Saudi Arabia's dedicated motorcycle marketplace",
    aboutMission: "Our Mission",
    aboutMissionText: "Bike.X was created to connect motorcycle enthusiasts across Saudi Arabia.",
    aboutWhy: "Why Motorcycles Only?",
    aboutWhyText: "We're passionate about motorcycles. By focusing exclusively on motorcycles, we've built a platform that understands the unique needs of riders and sellers.",
    aboutUsers: "Happy riders",
    aboutValues: "Our Values",
    valueTrust: "Trust & Transparency",
    valueTrustText: "We believe in honest listings and clear communication.",
    valueCommunity: "Community First",
    valueCommunityText: "We're building a community of riders.",
    valueLocal: "Saudi Focused",
    valueLocalText: "Built specifically for the Saudi market.",
    valueSimple: "Simple & Fast",
    valueSimpleText: "No complicated processes.",
    aboutTeam: "The Team Behind Bike.X",
    aboutTeamText: "We're a small team of motorcycle enthusiasts based in Saudi Arabia.",
    aboutJoin: "Ready to join the community?",
    browseListings: "Browse Listings",
    contactTitle: "Contact Us",
    contactSubtitle: "We'd love to hear from you",
    getInTouch: "Get in Touch",
    contactText: "Have a question? Need help? We're here to help.",
    email: "Email",
    whatsapp: "WhatsApp",
    businessHours: "Business Hours",
    businessHoursText: "Sunday - Thursday: 9:00 AM - 6:00 PM",
    location: "Location",
    locationText: "Riyadh, Saudi Arabia",
    followUs: "Follow Us",
    sendMessage: "Send Message",
    subject: "Subject",
    message: "Message",
    faq: "Frequently Asked Questions",
    faq1q: "How do I list my motorcycle, parts, or gear for sale?",
    faq1a: "Simply click the \"+ Sell\" button, choose whether you're listing a motorcycle, a part, or gear & accessories, fill in the details, add photos, and publish. It appears instantly on the homepage.",
    faq2q: "Is Bike.X free to use?",
    faq2a: "Yes! Bike.X is completely free for both buyers and sellers. We believe in making motorcycle trading accessible to everyone.",
    faq3q: "How do I contact a seller?",
    faq3a: "Open the listing you're interested in and click \"Show Contact Details\" to see the seller's phone number and email.",
    faq4q: "What if I have a problem with a listing?",
    faq4a: "You can report any suspicious or problematic listings by contacting us directly via the form above or through WhatsApp.",

    listingTitle: "Listing — Bike.X",
    loadingListing: "Loading listing...",
    description: "Description",
    comments: "Comments",
    noCommentsYet: "No comments yet. Be the first to comment!",
    leaveComment: "Leave a Comment",
    postComment: "Post Comment",
    saveListing: "Save Listing",

    messagesTitle: "Messages",
    messagesSubtitle: "Your conversations with sellers and buyers",
    messages: "Messages",
    chatWithSeller: "💬 Chat with Seller",
    sendMessage: "Send Message",
    typeMessage: "Type your message...",
    noMessagesYet: "No messages yet",
    startConversation: "Start a conversation by asking about a listing!",
    messageSent: "Message sent successfully!",
    messageSendError: "Failed to send message.",
    chatPlaceholder: "Ask about the listing...",
    avatarUpdated: "Profile picture updated successfully!",
avatarUpdateFailed: "Failed to update profile picture.",
changeProfilePicture: "Change profile picture",
invalidFile: "Invalid File",
fileTooLarge: "File Too Large",
  },
  ar: {
    titleHome: "BIKE X — بيع وشراء الدراجات النارية في السعودية",
    titleSell: "بيع — BIKE X.",
    tagline: "دراجات نارية فقط",
    searchPlaceholder: "ابحث بالماركة، الموديل أو المدينة…",
    searchAria: "بحث في الإعلانات",
    searchBtn: "بحث",
    sellBtn: "+ بيع",
    themeAria: "تبديل الوضع الليلي",
    switchTo: "English",
    backToListings: "← رجوع إلى الإعلانات",

    heroTitleHtml: "اعثر على <span>دراجتك</span> القادمة،<br>وليس مجرد إعلان.",
    heroSubtitle: "إعلانات سعودية مخصصة للدراجات النارية فقط — رياضية، كروزر، مغامرات، وكل ما بينها.",
    heroStat1: "إعلان نشط",
    heroStat2: "مدينة مغطاة",
    heroStat3: "ماركة",
    heroOffersAria: "أحدث عروض الدراجات النارية",

    filtersTitle: "الفلاتر",
    labelBrand: "الماركة",
    allBrands: "كل الماركات",
    showMore: "عرض المزيد",
    showLess: "عرض أقل",
    labelCity: "المدينة",
    allCities: "كل المدن",
    labelCondition: "الحالة",
    labelCommentsToggle: "التعليقات على هذا الإعلان",
    commentsAllowLabel: "السماح بالتعليقات",
    commentsDisableLabel: "تعطيل التعليقات",
    commentsToggleHint: "يمكن للمشترين طرح أسئلة عامة تحت إعلانك ما لم تقم بتعطيل هذا الخيار.",
    conditionAny: "جديدة أو مستعملة",
    conditionNew: "جديدة",
    conditionUsed: "مستعملة",
    priceRangeLabel: "نطاق السعر (ر.س)",
    minPlaceholder: "الأدنى",
    maxPlaceholder: "الأعلى",
    savedOnly: "♥ المحفوظة فقط",
    clearFilters: "مسح كل الفلاتر",

    sortAria: "ترتيب الإعلانات",
    sortNewest: "الأحدث",
    sortPriceAsc: "السعر: من الأقل للأعلى",
    sortPriceDesc: "السعر: من الأعلى للأقل",
    sortMileageAsc: "المسافة: الأقل أولاً",
    sortYearDesc: "السنة: الأحدث أولاً",

    resultsFound: n => `تم العثور على ${n} دراجة نارية`,
    saveListingAria: "حفظ الإعلان",
    prevImageAria: "الصورة السابقة",
    nextImageAria: "الصورة التالية",
    imageAria: n => `صورة ${n}`,
    odoLabel: "العداد",
    kmUnit: "كم",
    emptyTitle: "لا توجد دراجات تطابق هذه الفلاتر",
    emptyText: "حاول توسيع نطاق السعر أو إزالة أحد الفلاتر.",

    specBrand: "الماركة", specModel: "الموديل", specYear: "السنة", specMileage: "المسافة المقطوعة",
    specEngine: "المحرك", specColor: "اللون", specCondition: "الحالة", specCity: "المدينة",
    specType: "النوع",
    sellerIn: city => `بائع في ${city}`,
    memberListing: id => `إعلان عضو · مرجع ${id}`,
    showContact: "عرض بيانات التواصل",
    hideContact: "إخفاء بيانات التواصل",
    contactDemo: "+966 5X XXX XXXX (تجريبي)",

    footerText: "Bike.X — إعلانات مخصصة للدراجات النارية",

    sellTitle: "أضف إعلان دراجتك",
    sellSubtitle: "أدخل التفاصيل أدناه.",
    sellCategoryLabel: "ماذا تريد أن تبيع؟",
    labelModel: "الموديل",
    labelYear: "سنة الصنع",
    labelEngineCc: "سعة المحرك (سي سي)",
    labelPriceSar: "السعر (ر.س) (اختياري)",
    priceOnRequest: "السعر عند الطلب",
    labelMileageKm: "المسافة المقطوعة (كم)",
    labelColor: "اللون",
    labelDescription: "الوصف",
    labelCitySell: "المدينة (اختياري)",
    labelModelOpt: "الموديل (اختياري)",
    labelYearOpt: "سنة الصنع (اختياري)",
    labelEngineCcOpt: "سعة المحرك (سي سي) (اختياري)",
    labelMileageKmOpt: "المسافة المقطوعة (كم) (اختياري)",
    labelColorOpt: "اللون (اختياري)",
    selectBrandDefault: "اختر الماركة",
    selectCityDefault: "اختر المدينة",
    selectTypeDefault: "اختر النوع",
    anyUniversal: "عام",
    placeholderModel: "مثال: YZF-R1",
    placeholderYear: "2023",
    placeholderCc: "998",
    placeholderPrice: "45000",
    placeholderMileage: "8000",
    placeholderColor: "مثال: أسود مطفي",

    labelPartTitle: "اسم القطعة",
    placeholderPartTitle: "مثال: شكمان أكرابوفيتش نصفي",
    labelPartType: "النوع",
    labelPartBrand: "الماركة المتوافقة (اختياري)",
    partTypeExhaust: "شكمان",
    partTypeBrakes: "فرامل",
    partTypeDrivetrain: "نظام الدفع",
    partTypeElectrical: "كهرباء",
    partTypeBodywork: "هيكل خارجي",
    partTypeLuggage: "حقائب",
    partTypeTires: "إطارات وجنوط",
    partTypeEngine: "محرك",
    partTypeSuspension: "نظام التعليق",
    partTypeOther: "أخرى",

    labelGearTitle: "اسم القطعة",
    placeholderGearTitle: "مثال: خوذة Shoei RF-1400",
    labelGearType: "النوع",
    labelGearSize: "المقاس (اختياري)",
    placeholderGearSize: "مثال: L، 43، مقاس واحد",
    gearTypeHelmet: "خوذة",
    gearTypeJacket: "جاكيت",
    gearTypeGloves: "قفازات",
    gearTypeBoots: "أحذية",
    gearTypeTankBag: "شنطة خزان",
    gearTypeRainSuit: "بدلة مطر",
    gearTypeElectronics: "إلكترونيات",

    labelServiceType: "نوع الخدمة",
    serviceTypeTowing: "سطحات",
    serviceTypeInsuranceTransfer: "مكاتب التأمين / نقل ملكية",
    serviceTypeMobileWash: "الغسيل المتنقل",
    serviceTypeParking: "مواقف",
    placeholderDesc: "تاريخ الصيانة، التعديلات، سبب البيع…",
    sellHint: "هذا عرض تجريبي للواجهة فقط: يتم حفظ إعلانك في متصفحك.",
    cancelBtn: "إلغاء",
    publishBtn: "نشر الإعلان",
    toastPublished: "تم نشر الإعلان — جاري التحويل للصفحة الرئيسية…",

    loginTitle: "تسجيل الدخول إلى BIKE X",
    loginSubtitle: "مرحباً بعودتك. سجّل الدخول لإدارة إعلاناتك.",
    signupTitle: "إنشاء حساب جديد",
    signupSubtitle: "انضم إلى بييك.إكس لنشر وإدارة إعلانات دراجتك النارية.",
    labelFullName: "الاسم الكامل",
    labelEmail: "البريد الإلكتروني",
    labelPassword: "كلمة المرور",
    labelConfirmPassword: "تأكيد كلمة المرور",
    placeholderFullName: "مثال: عبدالله  ",
    placeholderEmail: "you@example.com",
    placeholderPassword: "••••••••",
    rememberMe: "تذكرني",
    loginBtn: "تسجيل الدخول",
    signupBtn: "إنشاء حساب",
    noAccountYet: "ليس لديك حساب؟",
    haveAccountAlready: "لديك حساب مسبقاً؟",
    signupLink: "إنشاء حساب",
    loginLink: "تسجيل الدخول",
    catServices: "الخدمات",
    catGear: "ملابس ومستلزمات",
    catParts: "قطع الغيار",
    catMotorcycles: "الدراجات النارية",
    fromPricePrefix: "ابتداءً من",
    logoutBtn: "تسجيل الخروج",
    hiName: name => `أهلاً، ${name}`,
    authRequiredNotice: "يرجى تسجيل الدخول لنشر إعلان.",
    loginErrorInvalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    signupErrorMismatch: "كلمتا المرور غير متطابقتين.",
    signupErrorExists: "يوجد حساب مسجَّل بهذا البريد الإلكتروني مسبقاً.",
    signupErrorFields: "يرجى تعبئة جميع الحقول.",
    orContinueWith: "أو تابع باستخدام",
    signInGoogle: "تسجيل الدخول عبر جوجل",
    loginWithPhone: "تسجيل الدخول برقم الجوال (OTP)",
    labelPhone: "رقم الجوال",
    sendCode: "إرسال الرمز",
    labelOtpCode: "أدخل الرمز",
    verifyCode: "تحقق وسجّل الدخول",
    googlePickerTitle: "اختر حسابًا",
    googlePickerSubtitle: "للمتابعة إلى Bike X",
    otpInvalidPhone: "الرجاء إدخال رقم جوال صحيح.",
    otpInvalidCode: "الرمز غير صحيح. حاول مرة أخرى.",
    otpDemoCodeHint: code => `وضع تجريبي: رمز التحقق الخاص بك هو ${code} (عادةً يُرسل عبر رسالة نصية).`,

    dashboardTitle: "لوحة التحكم — BIKE X",
    dashboardBtn: "لوحة التحكم",
    myListings: "إعلاناتي",
    accountSettings: "إعدادات الحساب",
    adminPanel: "لوحة المدير",
    addNewListing: "إضافة إعلان جديد",
    noListingsYet: "لم تقم بنشر أي إعلانات بعد",
    createFirstListing: "أنشئ أول إعلان لدراجتك النارية!",
    noListings: "لا توجد إعلانات",
    noUsers: "لا يوجد مستخدمين",
    edit: "تعديل",
    delete: "حذف",
    editListing: "تعديل الإعلان",
    confirmDelete: "هل أنت متأكد من حذف هذا الإعلان؟",
    settingsSaved: "تم حفظ الإعدادات بنجاح!",
    newPassword: "كلمة مرور جديدة",
    confirmNewPassword: "تأكيد كلمة المرور الجديدة",
    saveChanges: "حفظ التغييرات",
    emailCannotChange: "لا يمكن تغيير البريد الإلكتروني",
    labelPhone: "رقم الهاتف",
    totalListings: "إجمالي الإعلانات",
    totalUsers: "إجمالي المستخدمين",
    totalAdmins: "المديرين",
    allListings: "جميع الإعلانات",
    allUsers: "جميع المستخدمين",
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    role: "الدور",
    actions: "الإجراءات",
    makeAdmin: "جعل مدير",
    removeAdmin: "إزالة المدير",

    // ✅ NEW: Modal & Confirmation Translations (Arabic)
    confirmDeleteTitle: "تأكيد الحذف",
    confirmDeleteMessage: "هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.",
    confirmDeleteCancel: "إلغاء",
    confirmDeleteConfirm: "حذف",
    confirmActionTitle: "تأكيد الإجراء",
    confirmMakeAdminMessage: "هل أنت متأكد من جعل {email} مديراً؟",
    confirmRemoveAdminMessage: "هل أنت متأكد من إزالة صلاحيات المدير من {email}؟",
    confirmDeleteUserMessage: "هل أنت متأكد من حذف المستخدم {email}؟ لا يمكن التراجع عن هذا الإجراء.",
    permissionDenied: "صلاحية مرفوضة",
    actionBlocked: "إجراء ممنوع",
    success: "نجاح",
    error: "خطأ",
    isNowAdmin: "أصبح الآن مديراً.",
    isNowUser: "أصبح الآن مستخدمًا عاديًا.",
    userDeleted: "تم حذفه.",

    uploadImages: "رفع الصور",
    dragDropImages: "اسحب الصور هنا أو انقر للتصفح",
    imageRequiredAlert: "الرجاء رفع صورة واحدة على الأقل.",
    brandOther: "أخرى",
    labelSpecifyBrand: "حدد الماركة",
    placeholderSpecifyBrand: "مثال: Zongshen",
    imageUploadHint: "رفع حتى 6 صور - الحد الأقصى 2 ميجابايت لكل صورة",
    imageHelp: "ستستخدم الصورة الأولى كصورة رئيسية للإعلان",
    maxImagesReached: "يمكنك رفع حتى 6 صور كحد أقصى.",
    removeImage: "إزالة الصورة",
    invalidImageType: "يرجى اختيار ملف صورة صالح.",
    imageTooLarge: "يجب أن يكون حجم الصورة أقل من 2 ميجابايت.",
    avatarUpdated: "تم تحديث صورة الملف الشخصي بنجاح!",
    avatarUpdateFailed: "فشل تحديث صورة الملف الشخصي.",
    changeProfilePicture: "تغيير صورة الملف الشخصي",

    home: "الرئيسية",
    about: "من نحن",
    contact: "اتصل بنا",
    aboutTitle: "عن BIKE X",
    aboutSubtitle: "سوق الدراجات النارية المخصص في السعودية",
    aboutMission: "رسالتنا",
    aboutMissionText: "تم إنشاء BIKE X  لعشاق الدراجات النارية في جميع أنحاء السعودية.",
    aboutWhy: "لماذا الدراجات النارية فقط؟",
    aboutWhyText: "نحن شغوفون بالدراجات النارية. من خلال التركيز حصراً على الدراجات النارية، بنينا منصة تفهم الاحتياجات الفريدة للراكبين والبائعين.",
    aboutUsers: "راكب سعيد",
    aboutValues: "قيمنا",
    valueTrust: "الثقة والشفافية",
    valueTrustText: "نؤمن بالإعلانات الصادقة والتواصل الواضح.",
    valueCommunity: "المجتمع أولاً",
    valueCommunityText: "نبني مجتمعاً من الراكبين الذين يشاركون نفس الشغف.",
    valueLocal: "التركيز على السعودية",
    valueLocalText: "مصمم خصيصاً للسوق السعودي مع دعم محلي.",
    valueSimple: "بسيط وسريع",
    valueSimpleText: "لا عمليات معقدة. فقط أضف دراجتك أو ابحث عن دراجتك القادمة.",
    aboutTeam: "الفريق خلف BIKE X",
    aboutTeamText: "نحن فريق صغير من عشاق الدراجات النارية في السعودية.",
    aboutJoin: "مستعد للانضمام إلى المجتمع؟",
    browseListings: "تصفح الإعلانات",
    contactTitle: "اتصل بنا",
    contactSubtitle: "نحن نحب أن نسمع منك",
    getInTouch: "تواصل معنا",
    contactText: "لديك سؤال؟ تحتاج مساعدة؟ نحن هنا للمساعدة.",
    email: "البريد الإلكتروني",
    whatsapp: "واتساب",
    businessHours: "ساعات العمل",
    businessHoursText: "الأحد - الخميس: 9:00 صباحاً - 6:00 مساءً",
    location: "الموقع",
    locationText: "جدة, السعودية",
    followUs: "تابعنا",
    sendMessage: "أرسل رسالة",
    subject: "الموضوع",
    message: "الرسالة",
    faq: "الأسئلة الشائعة",
    faq1q: "كيف أضيف دراجتي أو قطعة غيار أو ملابس للبيع؟",
    faq1a: "اضغط على زر \"+ بيع\"، ثم اختر ما إذا كنت تريد إضافة دراجة نارية أو قطعة غيار أو ملابس ومستلزمات، املأ التفاصيل وأضف الصور، ثم انشر الإعلان. سيظهر فورًا في الصفحة الرئيسية.",
    faq2q: "هل استخدام Bike.X مجاني؟",
    faq2a: "نعم! Bike.X مجاني بالكامل للبائعين والمشترين. نؤمن بجعل تجارة الدراجات النارية متاحة للجميع.",
    faq3q: "كيف أتواصل مع البائع؟",
    faq3a: "افتح الإعلان الذي يهمك واضغط على \"إظهار بيانات التواصل\" لرؤية رقم هاتف البائع وبريده الإلكتروني.",
    faq4q: "ماذا لو واجهت مشكلة في أحد الإعلانات؟",
    faq4a: "يمكنك الإبلاغ عن أي إعلان مشبوه أو به مشكلة من خلال التواصل معنا مباشرة عبر النموذج أعلاه أو عبر واتساب.",

    listingTitle: "الإعلان — BIKE X",
    loadingListing: "جاري تحميل الإعلان...",
    description: "الوصف",
    comments: "التعليقات",
    noCommentsYet: "لا توجد تعليقات بعد. كن أول من يعلق!",
    leaveComment: "أضف تعليقاً",
    postComment: "نشر التعليق",
    saveListing: "حفظ الإعلان",

    messagesTitle: "الرسائل",
    messagesSubtitle: "محادثاتك مع البائعين والمشترين",
    messages: "الرسائل",
    chatWithSeller: "💬 دردش مع البائع",
    sendMessage: "إرسال",
    typeMessage: "اكتب رسالتك...",
    noMessagesYet: "لا توجد رسائل بعد",
    startConversation: "ابدأ محادثة بالسؤال عن أحد الإعلانات!",
    messageSent: "تم إرسال الرسالة بنجاح!",
    messageSendError: "فشل إرسال الرسالة.",
    chatPlaceholder: "اسأل عن الإعلان...",
    avatarUpdated: "تم تحديث صورة الملف الشخصي بنجاح!",
avatarUpdateFailed: "فشل تحديث صورة الملف الشخصي.",
changeProfilePicture: "تغيير صورة الملف الشخصي",
invalidFile: "ملف غير صالح",
fileTooLarge: "الملف كبير جداً",
  }
};

function getLang(){
  return localStorage.getItem(LANG_KEY) || "en";
}

function setLangAndReload(lang){
  localStorage.setItem(LANG_KEY, lang);
  window.location.reload();
}

function t(key){
  const dict = I18N[getLang()] || I18N.en;
  if (typeof dict[key] === 'function') {
    return dict[key];
  }
  return key in dict ? dict[key] : (I18N.en[key] || key);
}

function brandLabel(brandEn){
  const lang = getLang();
  if (lang === "ar") {
    const arNames = {
      "Yamaha": "ياماها",
      "Honda": "هوندا",
      "Kawasaki": "كاواساكي",
      "Ducati": "دوكاتي",
      "Harley-Davidson": "هارلي ديفيدسون",
      "BMW": "بي إم دبليو",
      "KTM": "كيه تي إم",
      "Suzuki": "سوزوكي",
      "Royal Enfield": "رويال إنفيلد",
      "Indian Motorcycles": "إنديان موتورسايكل",
      "CFMOTO": "سي إف موتو",
      "Polaris": "بولاريس",
      "Can-Am": "كان-آم",
      "SYM": "إس واي إم",
      "Bajaj Boxer": "باجاج بوكسر"
    };
    return arNames[brandEn] || brandEn;
  }
  return brandEn;
}

function cityLabel(cityEn){
  return getLang() === "ar" ? (CITY_NAMES_AR[cityEn] || cityEn) : cityEn;
}

function formatPrice(n){
  if (n === null || n === undefined || n === "") {
    return t("priceOnRequest");
  }
  const num = n.toLocaleString("en-US");
  return getLang() === "ar" ? `${num} ر.س` : `SAR ${num}`;
}

function applyHtmlDirection(){
  const lang = getLang();
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
}

function translateStaticPage(){
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const val = t(key);
    if (typeof val === 'string') {
      el.textContent = val;
    }
  });
  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    const val = t(el.getAttribute("data-i18n-html"));
    if (typeof val === 'string') {
      el.innerHTML = val;
    }
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const val = t(el.getAttribute("data-i18n-placeholder"));
    if (typeof val === 'string') {
      el.setAttribute("placeholder", val);
    }
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    const val = t(el.getAttribute("data-i18n-aria"));
    if (typeof val === 'string') {
      el.setAttribute("aria-label", val);
    }
  });

  const titleKey = document.body.getAttribute("data-title-key");
  if(titleKey) {
    const titleVal = t(titleKey);
    if (typeof titleVal === 'string') {
      document.title = titleVal;
    }
  }

  // Fix language switch button for desktop
  const langBtn = document.getElementById("langSwitch");
  if(langBtn){
    const currentLang = getLang();
    langBtn.textContent = currentLang === "ar" ? "English" : "العربية";
    const newBtn = langBtn.cloneNode(true);
    langBtn.parentNode.replaceChild(newBtn, langBtn);
    newBtn.addEventListener("click", function(e) {
      e.preventDefault();
      const current = getLang();
      const next = current === "ar" ? "en" : "ar";
      setLangAndReload(next);
    });
  }

  // Fix language switch button for mobile menu
  const mobileLangSwitch = document.getElementById("mobileLangSwitch");
  if(mobileLangSwitch){
    const currentLang = getLang();
    mobileLangSwitch.textContent = currentLang === "ar" ? "English" : "العربية";
    const newMobileBtn = mobileLangSwitch.cloneNode(true);
    mobileLangSwitch.parentNode.replaceChild(newMobileBtn, mobileLangSwitch);
    newMobileBtn.addEventListener("click", function(e) {
      e.preventDefault();
      const current = getLang();
      const next = current === "ar" ? "en" : "ar";
      setLangAndReload(next);
    });
  }
}

applyHtmlDirection();
