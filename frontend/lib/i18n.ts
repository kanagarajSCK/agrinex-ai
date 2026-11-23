export type AppLanguage = "en" | "ta" | "te" | "hi";

export const LANGUAGE_STORAGE_KEY = "agrinex-language";

export const languageLabels: Record<AppLanguage, string> = {
  en: "English",
  ta: "தமிழ்",
  te: "తెలుగు",
  hi: "हिन्दी",
};

export const translations = {
  en: {
    // Navigation & Shell
    dashboard: "Overview",
    assistant: "AI Assistant",
    weather: "Weather intelligence",
    weatherShort: "Weather",
    markets: "Market intelligence",
    marketsShort: "Markets",
    crops: "Crop intelligence",
    cropsShort: "Crops",
    farms: "My farms",
    advisories: "Advisory history",
    settings: "Profile & settings",
    tagline: "Smarter Farming. Better Decisions.",
    workspace: "Workspace",
    liveBadge: "LIVE INTEGRATIONS",
    liveBadgeFull: "LIVE WEATHER, MARKETS & AI",
    farmerSession: "Farmer Session",
    noLogin: "LOCAL BROWSER SESSION · NO LOGIN",
    notifications: "Notifications",
    noNotifications: "No live alerts at this time.",
    activePlatform: "Active Platform",
    activePlatformDesc: "Live Open-Meteo weather, AGMARKNET mandi prices, and Gemini AI connected.",
    footerText: "AgriNex AI · Live Open-Meteo weather, AGMARKNET mandi prices and Gemini AI connected. Local-first agronomy.",

    // Common Actions
    selectedLocation: "Selected farm location",
    language: "Language",
    selectLanguage: "Select Language",
    displayLanguage: "Display language",
    loading: "Loading…",
    unavailable: "Unavailable",
    retry: "Retry",
    clear: "Clear",
    save: "Save",
    search: "Search",
    filter: "Filter",
    viewAll: "View all",
    back: "Back",
    confirm: "Confirm",

    // Dashboard
    goodMorning: "Good morning, farmer.",
    farmOverview: "Your farm overview",
    dashboardDesc: "Live weather, genuine mandi prices, and university crop intelligence for your farm.",
    quickActions: "Quick Actions",
    askAi: "Ask AI",
    askAiDesc: "Chat with agricultural AI",
    checkWeather: "Check weather",
    checkWeatherDesc: "View live forecast",
    comparePrices: "Compare prices",
    comparePricesDesc: "Genuine AGMARKNET prices",
    cropGuidance: "Crop guidance",
    cropGuidanceDesc: "Browse crop profiles",
    temperature: "Temperature",
    rainfall: "Rainfall",
    humidity: "Humidity",
    windSpeed: "Wind speed",
    liveWeather: "Live weather",
    liveMarkets: "Live mandi prices",
    sevenDayForecast: "7-day forecast",

    // Crop Intelligence
    cropGuidanceTitle: "Crop intelligence",
    cropGuidanceEyebrow: "University-verified agronomy",
    cropGuidanceSubtitle: "Evidence-based crop guidance with authentic TNAU/ICAR agronomic schedules, fertilizer dosages (NPK), water requirements, and integrated pest management.",
    searchCropsPlaceholder: "Search crops by name, category, or season…",
    allCategories: "All crops",
    growthStages: "Growth stages & timeline",
    fertilizerNPK: "Fertilizer dosage (NPK kg/acre)",
    waterManagement: "Water & irrigation",
    pestManagement: "Pest & disease management (IPM)",
    duration: "Duration",
    soil: "Soil",
    water: "Water",
    yield: "Expected yield",

    // Settings
    settingsTitle: "Profile & settings",
    settingsEyebrow: "Your workspace",
    settingsSubtitle: "Manage your farm location, display language, and application preferences.",
    profilePreview: "Profile preview",
    localProfileDesc: "Local demonstration profile",
    displayName: "Display name",
    primaryLocation: "Primary location",
    officialLocation: "Official India location",
    locationDesc: "Uses verified Indian government LGD hierarchy with offline fallback",
    clearLocationBtn: "Clear selected location",
    languagePreference: "Language preference",
    languageActiveNote: "Changes apply immediately across all navigation, controls, and features.",
    activeLanguage: "Active language across AgriNex AI:",
    notificationPreferences: "Notification preferences",
    sampleWeatherAlerts: "Weather alerts",
    sampleMarketUpdates: "Market price updates",
    regionalPreferences: "Regional preferences",
    measurementUnits: "Measurement units",
    privacyAndData: "Privacy & data protection",
    privacyBullet1: "No sign-in or account is required.",
    privacyBullet2: "Preferences stay private in your browser localStorage.",
    privacyBullet3: "Live weather, mandi prices, and Gemini AI operate securely without tracking.",

    // Assistant
    assistantTitle: "Agricultural AI Assistant",
    assistantEyebrow: "Intelligent farming advisory",
    assistantDesc: "Ask questions in English, Tamil, Telugu, or Hindi. Get answers backed by verified weather, mandi prices, and agronomic science.",
    askPlaceholder: "Ask about crop diseases, weather impact, mandi rates, or fertilizer schedules…",
    sendBtn: "Send",
    clearChatBtn: "Clear chat",

    // Weather
    weatherTitle: "Weather for your farm",
    weatherEyebrow: "Weather intelligence",

    // Markets
    marketsTitle: "Compare mandi prices",
    marketsEyebrow: "Market intelligence",

    // Advisories
    advisoriesTitle: "Advisory history",
    advisoriesEyebrow: "Your farm intelligence library",
  },
  ta: {
    // Navigation & Shell
    dashboard: "முகப்பு",
    assistant: "AI உதவியாளர்",
    weather: "வானிலை தகவல்",
    weatherShort: "வானிலை",
    markets: "சந்தை நிலவரம்",
    marketsShort: "மண்டி",
    crops: "பயிர் வழிகாட்டி",
    cropsShort: "பயிர்கள்",
    farms: "என் பண்ணைகள்",
    advisories: "ஆலோசனை வரலாறு",
    settings: "சுயவிவரம் & அமைப்புகள்",
    tagline: "சிறந்த விவசாயம். சிறந்த முடிவுகள்.",
    workspace: "பணிமனை",
    liveBadge: "நேரலை சேவைகள்",
    liveBadgeFull: "நேரலை வானிலை, மண்டி & AI",
    farmerSession: "விவசாயி அமர்வு",
    noLogin: "உள்ளூர் உலாவி அமர்வு · உள்நுழைவு தேவையில்லை",
    notifications: "அறிவிப்புகள்",
    noNotifications: "தற்போது புதிய விழிப்பூட்டல்கள் எதுவும் இல்லை.",
    activePlatform: "செயலில் உள்ள தளம்",
    activePlatformDesc: "Open-Meteo வானிலை, AGMARKNET மண்டி விலைகள் மற்றும் Gemini AI நேரலையில் இணைக்கப்பட்டுள்ளது.",
    footerText: "AgriNex AI · நேரலை Open-Meteo வானிலை, AGMARKNET மண்டி விலைகள் மற்றும் Gemini AI இணைக்கப்பட்டுள்ளது.",

    // Common Actions
    selectedLocation: "தேர்ந்தெடுத்த பண்ணை இடம்",
    language: "மொழி",
    selectLanguage: "மொழியைத் தேர்வுசெய்",
    displayLanguage: "காட்சி மொழி",
    loading: "ஏற்றுகிறது…",
    unavailable: "கிடைக்கவில்லை",
    retry: "மீண்டும் முயற்சி",
    clear: "அழி",
    save: "சேமி",
    search: "தேடுக",
    filter: "வடிகட்டு",
    viewAll: "அனைத்தையும் காண்க",
    back: "பின்செல்",
    confirm: "உறுதிப்படுத்து",

    // Dashboard
    goodMorning: "வணக்கம், விவசாய பெருமக்களே.",
    farmOverview: "உங்கள் பண்ணை கண்ணோட்டம்",
    dashboardDesc: "உங்கள் பண்ணைக்கான நேரலை வானிலை, உண்மையான மண்டி விலைகள் மற்றும் வேளாண் பல்கலைக்கழக பயிர் வழிகாட்டிகள்.",
    quickActions: "விரைவு சேவைகள்",
    askAi: "AI-யிடம் கேளுங்கள்",
    askAiDesc: "விவசாய AI உதவியாளரிடம் உரையாடுங்கள்",
    checkWeather: "வானிலை பாருங்கள்",
    checkWeatherDesc: "நேரலை 7 நாள் முன்னறிவிப்பு",
    comparePrices: "விலைகளை ஒப்பிடுக",
    comparePricesDesc: "உண்மையான அரசு AGMARKNET விலைகள்",
    cropGuidance: "பயிர் வழிகாட்டுதல்",
    cropGuidanceDesc: "அங்கீகரிக்கப்பட்ட பயிர் குறிப்புகள்",
    temperature: "வெப்பநிலை",
    rainfall: "மழைப்பொழிவு",
    humidity: "ஈரப்பதம்",
    windSpeed: "காற்றின் வேகம்",
    liveWeather: "நேரலை வானிலை",
    liveMarkets: "நேரலை மண்டி விலைகள்",
    sevenDayForecast: "7 நாள் முன்னறிவிப்பு",

    // Crop Intelligence
    cropGuidanceTitle: "பயிர் நுண்ணறிவு & வழிகாட்டி",
    cropGuidanceEyebrow: "வேளாண் பல்கலைக்கழக வழிகாட்டிகள்",
    cropGuidanceSubtitle: "TNAU / ICAR அங்கீகரித்த பயிர் மேலாண்மை, உர பரிந்துரைகள் (NPK), நீர் மேலாண்மை மற்றும் ஒருங்கிணைந்த பூச்சி கட்டுப்பாடு.",
    searchCropsPlaceholder: "பயிர் பெயர் அல்லது பருவத்தை தேடுக…",
    allCategories: "அனைத்து பயிர்கள்",
    growthStages: "வளர்ச்சி நிலைகள் & கால அட்டவணை",
    fertilizerNPK: "உர பரிந்துரை (NPK கிலோ/ஏக்கர்)",
    waterManagement: "நீர் மற்றும் பாசன மேலாண்மை",
    pestManagement: "பூச்சி & நோய் கட்டுப்பாடு (IPM)",
    duration: "பயிர் காலம்",
    soil: "மண் வகை",
    water: "நீர் தேவை",
    yield: "எதிர்பார்க்கப்படும் மகசூல்",

    // Settings
    settingsTitle: "சுயவிவரம் & அமைப்புகள்",
    settingsEyebrow: "உங்கள் பணிமனை",
    settingsSubtitle: "உங்கள் பண்ணை இருப்பிடம், காட்சி மொழி மற்றும் விருப்பங்களை நிர்வகிக்கவும்.",
    profilePreview: "சுயவிவர முன்னோட்டம்",
    localProfileDesc: "உள்ளூர் முன்னோட்ட சுயவிவரம்",
    displayName: "காட்சிப் பெயர்",
    primaryLocation: "முதன்மை இருப்பிடம்",
    officialLocation: "அதிகாரப்பூர்வ இந்திய இருப்பிடம்",
    locationDesc: "அங்கீகரிக்கப்பட்ட இந்திய LGD அமைப்பைப் பயன்படுத்துகிறது",
    clearLocationBtn: "தேர்ந்தெடுத்த இடத்தை நீக்கு",
    languagePreference: "மொழி விருப்பம்",
    languageActiveNote: "தேர்ந்தெடுக்கும் மொழி பயன்பாட்டின் அனைத்து பக்கங்களிலும் உடனடியாக மாற்றப்படும்.",
    activeLanguage: "செயலில் உள்ள மொழி:",
    notificationPreferences: "அறிவிப்பு விருப்பங்கள்",
    sampleWeatherAlerts: "வானிலை எச்சரிக்கைகள்",
    sampleMarketUpdates: "மண்டி விலை மாற்றங்கள்",
    regionalPreferences: "பிராந்திய விருப்பங்கள்",
    measurementUnits: "அளவீட்டு அலகுகள்",
    privacyAndData: "தனியுரிமை & தரவு பாதுகாப்பு",
    privacyBullet1: "உள்நுழைவு அல்லது கணக்கு தேவையில்லை.",
    privacyBullet2: "விருப்பங்கள் உங்கள் உலாவி localStorage-ல் மட்டுமே பாதுகாப்பாக இருக்கும்.",
    privacyBullet3: "வானிலை, மண்டி மற்றும் Gemini AI எவ்வித கண்காணிப்பும் இன்றி பாதுகாப்பாக இயங்குகின்றன.",

    // Assistant
    assistantTitle: "விவசாய AI உதவியாளர்",
    assistantEyebrow: "நுண்ணறிவு வேளாண் ஆலோசனை",
    assistantDesc: "தமிழ், ஆங்கிலம், தெலுங்கு அல்லது இந்தியில் கேள்விகளை கேளுங்கள். நம்பகமான வானிலை மற்றும் மண்டி விலைகளுடன் பதில்களைப் பெறுங்கள்.",
    askPlaceholder: "பயிர் நோய்கள், வானிலை பாதிப்பு, மண்டி விலைகள் அல்லது உர அட்டவணை பற்றி கேளுங்கள்…",
    sendBtn: "அனுப்பு",
    clearChatBtn: "உரையாடலை அழி",

    // Weather
    weatherTitle: "உங்கள் பண்ணை வானிலை",
    weatherEyebrow: "வானிலை தகவல்",

    // Markets
    marketsTitle: "மண்டி விலைகளை ஒப்பிடுக",
    marketsEyebrow: "சந்தை நிலவரம்",

    // Advisories
    advisoriesTitle: "ஆலோசனை வரலாறு",
    advisoriesEyebrow: "பண்ணை ஆலோசனை பெட்டகம்",
  },
  te: {
    // Navigation & Shell
    dashboard: "అవలోకనం",
    assistant: "AI సహాయకుడు",
    weather: "వాతావరణ సమాచారం",
    weatherShort: "వాతావరణం",
    markets: "మార్కెట్ సమాచారం",
    marketsShort: "మార్కెట్లు",
    crops: "పంట సమాచారం",
    cropsShort: "పంటలు",
    farms: "నా పొలాలు",
    advisories: "సలహా చరిత్ర",
    settings: "ప్రొఫైల్ & సెట్టింగ్స్",
    tagline: "తెలివైన వ్యవసాయం. మెరుగైన నిర్ణయాలు.",
    workspace: "వర్క్‌స్పేస్",
    liveBadge: "ప్రత్యక్ష సేవలు",
    liveBadgeFull: "ప్రత్యక్ష వాతావరణం, మార్కెట్లు & AI",
    farmerSession: "రైతు సెషన్",
    noLogin: "స్థానిక బ్రౌజర్ సెషన్ · లాగిన్ అవసరం లేదు",
    notifications: "నోటిఫికేషన్లు",
    noNotifications: "ప్రస్తుతం హెచ్చరికలు ఏవీ లేవు.",
    activePlatform: "క్రియాశీల ప్లాట్‌ఫారమ్",
    activePlatformDesc: "ప్రత్యక్ష Open-Meteo వాతావరణం, AGMARKNET మండీ ధరలు మరియు Gemini AI అనుసంధానించబడింది.",
    footerText: "AgriNex AI · ప్రత్యక్ష Open-Meteo వాతావరణం, AGMARKNET మండీ ధరలు మరియు Gemini AI అనుసంధానించబడింది.",

    // Common Actions
    selectedLocation: "ఎంచుకున్న పొలం స్థానం",
    language: "భాష",
    selectLanguage: "భాషను ఎంచుకోండి",
    displayLanguage: "ప్రదర్శన భాష",
    loading: "లోడ్ అవుతోంది…",
    unavailable: "అందుబాటులో లేదు",
    retry: "మళ్లీ ప్రయత్నించండి",
    clear: "తుడిచివేయి",
    save: "భద్రపరచు",
    search: "వెతకండి",
    filter: "వడపోత",
    viewAll: "అన్నీ చూడండి",
    back: "వెనుకకు",
    confirm: "ధృవీకరించండి",

    // Dashboard
    goodMorning: "శుభోదయం, రైతు సోదరులారా.",
    farmOverview: "మీ పొలం అవలోకనం",
    dashboardDesc: "మీ పొలం కోసం ప్రత్యక్ష వాతావరణం, అసలైన మార్కెట్ ధరలు మరియు విశ్వవిద్యాలయ పంట సమాచారం.",
    quickActions: "శీఘ్ర చర్యలు",
    askAi: "AI ని అడగండి",
    askAiDesc: "వ్యవసాయ AI తో చాట్ చేయండి",
    checkWeather: "వాతావరణం చూడండి",
    checkWeatherDesc: "ప్రత్యక్ష 7 రోజుల సూచన చూడండి",
    comparePrices: "ధరలను సరిపోల్చండి",
    comparePricesDesc: "నిజమైన ప్రభుత్వ AGMARKNET ధరలు",
    cropGuidance: "పంట మార్గదర్శకం",
    cropGuidanceDesc: "పంట వివరాలను బ్రౌజ్ చేయండి",
    temperature: "ఉష్ణోగ్రత",
    rainfall: "వర్షపాతం",
    humidity: "తేమ",
    windSpeed: "గాలి వేగం",
    liveWeather: "ప్రత్యక్ష వాతావరణం",
    liveMarkets: "ప్రత్యక్ష మండీ ధరలు",
    sevenDayForecast: "7 రోజుల సూచన",

    // Crop Intelligence
    cropGuidanceTitle: "పంట మేధస్సు & సమాచారం",
    cropGuidanceEyebrow: "విశ్వవిద్యాలయ ధృవీకరించిన వ్యవసాయం",
    cropGuidanceSubtitle: "TNAU / ICAR ఆధారిత ప్రామాణిక పంట యాజమాన్యం, ఎరువుల మోతాదు (NPK), నీటి నిర్వహణ మరియు పురుగుల నివారణ.",
    searchCropsPlaceholder: "పంట పేరు లేదా కాలం ద్వారా వెతకండి…",
    allCategories: "అన్ని పంటలు",
    growthStages: "వృద్ధి దశలు & కాలక్రమం",
    fertilizerNPK: "ఎరువుల మోతాదు (NPK కేజీ/ఎకరా)",
    waterManagement: "నీరు & సాగునీటి నిర్వహణ",
    pestManagement: "పురుగులు & తెగుళ్ల నివారణ (IPM)",
    duration: "వ్యవధి",
    soil: "నేల రకం",
    water: "నీరు",
    yield: "దిగుబడి",

    // Settings
    settingsTitle: "ప్రొఫైల్ & సెట్టింగ్స్",
    settingsEyebrow: "మీ పనిస్థలం",
    settingsSubtitle: "మీ పొలం స్థానం, ప్రదర్శన భాష మరియు ప్రాధాన్యతలను నిర్వహించండి.",
    profilePreview: "ప్రొఫైల్ ప్రివ్యూ",
    localProfileDesc: "స్థానిక ప్రదర్శన ప్రొఫైల్",
    displayName: "ప్రదర్శన పేరు",
    primaryLocation: "ప్రధాన స్థానం",
    officialLocation: "అధికారిక భారతదేశ స్థానం",
    locationDesc: "ధృవీకరించబడిన భారతీయ LGD వ్యవస్థను ఉపయోగిస్తుంది",
    clearLocationBtn: "ఎంచుకున్న స్థానాన్ని క్లియర్ చేయండి",
    languagePreference: "భాషా ప్రాధాన్యత",
    languageActiveNote: "మార్పులు వెంటనే అన్ని పేజీలు మరియు నావిగేషన్‌లో వర్తిస్తాయి.",
    activeLanguage: "క్రియాశీల భాష:",
    notificationPreferences: "నోటిఫికేషన్ ప్రాధాన్యతలు",
    sampleWeatherAlerts: "వాతావరణ హెచ్చరికలు",
    sampleMarketUpdates: "మార్కెట్ అప్‌డేట్‌లు",
    regionalPreferences: "ప్రాంతీయ ప్రాధాన్యతలు",
    measurementUnits: "కొలత ప్రమాణాలు",
    privacyAndData: "గోప్యత & డేటా రక్షణ",
    privacyBullet1: "సైన్-ఇన్ లేదా ఖాతా అవసరం లేదు.",
    privacyBullet2: "డేటా మీ బ్రౌజర్ localStorage లో మాత్రమే సురక్షితంగా ఉంటుంది.",
    privacyBullet3: "వాతావరణం, మార్కెట్ మరియు Gemini AI ట్రాకింగ్ లేకుండా సురక్షితంగా పనిచేస్తాయి.",

    // Assistant
    assistantTitle: "వ్యవసాయ AI సహాయకుడు",
    assistantEyebrow: "తెలివైన వ్యవసాయ సలహా",
    assistantDesc: "తెలుగు, ఇంగ్లీష్, తమిళం లేదా హిందీలో ప్రశ్నలు అడగండి. ఖచ్చితమైన వాతావరణం మరియు మార్కెట్ సమాచారంతో సమాధానాలు పొందండి.",
    askPlaceholder: "పంట తెగుళ్లు, వాతావరణ ప్రభావం, మార్కెట్ ధరలు లేదా ఎరువుల షెడ్యూల్ గురించి అడగండి…",
    sendBtn: "పంపండి",
    clearChatBtn: "చాట్ తొలగించు",

    // Weather
    weatherTitle: "మీ పొలం వాతావరణం",
    weatherEyebrow: "వాతావరణ సమాచారం",

    // Markets
    marketsTitle: "మండీ ధరలను సరిపోల్చండి",
    marketsEyebrow: "మార్కెట్ సమాచారం",

    // Advisories
    advisoriesTitle: "సలహా చరిత్ర",
    advisoriesEyebrow: "పొలం సలహా గ్రంథాలయం",
  },
  hi: {
    // Navigation & Shell
    dashboard: "अवलोकन",
    assistant: "AI सहायक",
    weather: "मौसम जानकारी",
    weatherShort: "मौसम",
    markets: "मंडी जानकारी",
    marketsShort: "मंडी",
    crops: "फसल जानकारी",
    cropsShort: "फसलें",
    farms: "मेरे खेत",
    advisories: "सलाह इतिहास",
    settings: "प्रोफ़ाइल और सेटिंग्स",
    tagline: "उन्नत खेती। बेहतर निर्णय।",
    workspace: "कार्यक्षेत्र",
    liveBadge: "लाइव सेवाएं",
    liveBadgeFull: "लाइव मौसम, मंडी और AI",
    farmerSession: "किसान सत्र",
    noLogin: "स्थानीय ब्राउज़र सत्र · कोई लॉगिन नहीं",
    notifications: "सूचनाएं",
    noNotifications: "इस समय कोई अलर्ट नहीं है।",
    activePlatform: "सक्रिय प्लेटफॉर्म",
    activePlatformDesc: "Open-Meteo मौसम, AGMARKNET मंडी भाव और Gemini AI सक्रिय रूप से जुड़े हैं।",
    footerText: "AgriNex AI · लाइव Open-Meteo मौसम, AGMARKNET मंडी भाव और Gemini AI से जुड़ा हुआ।",

    // Common Actions
    selectedLocation: "चयनित खेत स्थान",
    language: "भाषा",
    selectLanguage: "भाषा चुनें",
    displayLanguage: "प्रदर्शन भाषा",
    loading: "लोड हो रहा है…",
    unavailable: "उपलब्ध नहीं",
    retry: "फिर कोशिश करें",
    clear: "साफ़ करें",
    save: "सहेजें",
    search: "खोजें",
    filter: "फ़िल्टर",
    viewAll: "सभी देखें",
    back: "वापस",
    confirm: "पुष्टि करें",

    // Dashboard
    goodMorning: "सुप्रभात, किसान साथी।",
    farmOverview: "आपके खेत का अवलोकन",
    dashboardDesc: "आपके खेत के लिए लाइव मौसम, वास्तविक मंडी भाव और विश्वविद्यालय प्रमाणित फसल जानकारी।",
    quickActions: "त्वरित कार्य",
    askAi: "AI से पूछें",
    askAiDesc: "कृषि AI सहायक से बात करें",
    checkWeather: "मौसम देखें",
    checkWeatherDesc: "लाइव 7 दिनों का मौसम पूर्वानुमान",
    comparePrices: "भाव तुलना करें",
    comparePricesDesc: "असली सरकारी AGMARKNET मंडी भाव",
    cropGuidance: "फसल मार्गदर्शन",
    cropGuidanceDesc: "प्रमाणित फसल विवरण देखें",
    temperature: "तापमान",
    rainfall: "वर्षा",
    humidity: "नमी",
    windSpeed: "हवा की गति",
    liveWeather: "लाइव मौसम",
    liveMarkets: "लाइव मंडी भाव",
    sevenDayForecast: "7 दिनों का पूर्वानुमान",

    // Crop Intelligence
    cropGuidanceTitle: "फसल ज्ञान व संपूर्ण मार्गदर्शिका",
    cropGuidanceEyebrow: "कृषि विश्वविद्यालय द्वारा प्रमाणित",
    cropGuidanceSubtitle: "TNAU / ICAR द्वारा प्रमाणित फसल प्रबंधन, खाद की मात्रा (NPK), जल प्रबंधन और कीट नियंत्रण।",
    searchCropsPlaceholder: "फसल का नाम या मौसम खोजें…",
    allCategories: "सभी फसलें",
    growthStages: "विकास के चरण व समय रेखा",
    fertilizerNPK: "उर्वरक मात्रा (NPK किग्रा/एकड़)",
    waterManagement: "सिंचाई और जल प्रबंधन",
    pestManagement: "कीट व रोग प्रबंधन (IPM)",
    duration: "अवधि",
    soil: "मिट्टी",
    water: "पानी",
    yield: "अनुमानित उपज",

    // Settings
    settingsTitle: "प्रोफ़ाइल और सेटिंग्स",
    settingsEyebrow: "कार्यक्षेत्र",
    settingsSubtitle: "अपने खेत का स्थान, प्रदर्शन भाषा और सेटिंग्स प्रबंधित करें।",
    profilePreview: "प्रोफ़ाइल पूर्वावलोकन",
    localProfileDesc: "स्थानीय प्रदर्शन प्रोफ़ाइल",
    displayName: "प्रदर्शित नाम",
    primaryLocation: "प्राथमिक स्थान",
    officialLocation: "आधिकारिक भारत स्थान",
    locationDesc: "प्रमाणित भारतीय LGD व्यवस्था का उपयोग करता है",
    clearLocationBtn: "चुना हुआ स्थान साफ़ करें",
    languagePreference: "भाषा प्राथमिकता",
    languageActiveNote: "परिवर्तन तुरंत सभी नेविगेशन और सुविधाओं में लागू होंगे।",
    activeLanguage: "सक्रिय भाषा:",
    notificationPreferences: "अधिसूचना प्राथमिकताएं",
    sampleWeatherAlerts: "मौसम चेतावनी",
    sampleMarketUpdates: "मंडी भाव अपडेट",
    regionalPreferences: "क्षेत्रीय प्राथमिकताएं",
    measurementUnits: "मापन इकाइयाँ",
    privacyAndData: "गोपनीयता और डेटा सुरक्षा",
    privacyBullet1: "किसी साइन-इन या खाते की आवश्यकता नहीं है।",
    privacyBullet2: "डेटा आपके ब्राउज़र localStorage में ही सुरक्षित रहता है।",
    privacyBullet3: "मौसम, मंडी और Gemini AI बिना किसी ट्रैकिंग के सुरक्षित काम करते हैं।",

    // Assistant
    assistantTitle: "कृषि AI सहायक",
    assistantEyebrow: "बुद्धिमान कृषि सलाह",
    assistantDesc: "हिंदी, अंग्रेजी, तमिल या तेलुगु में प्रश्न पूछें। प्रमाणित मौसम, मंडी भाव और कृषि विज्ञान आधारित उत्तर पाएं।",
    askPlaceholder: "फसल के रोग, मौसम का प्रभाव, मंडी भाव या खाद के समय के बारे में पूछें…",
    sendBtn: "भेजें",
    clearChatBtn: "चैट साफ़ करें",

    // Weather
    weatherTitle: "आपके खेत का मौसम",
    weatherEyebrow: "मौसम जानकारी",

    // Markets
    marketsTitle: "मंडी भाव तुलना करें",
    marketsEyebrow: "मंडी जानकारी",

    // Advisories
    advisoriesTitle: "सलाह इतिहास",
    advisoriesEyebrow: "कृषि सलाह पुस्तकालय",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function getStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === "ta" || stored === "te" || stored === "hi" ? stored : "en";
  } catch {
    return "en";
  }
}

export function storeLanguage(language: AppLanguage) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Ignore storage write errors (e.g. private mode quota)
    }
  }
}
