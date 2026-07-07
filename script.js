const databaseUrl = 'https://korsolutions-jobs-default-rtdb.europe-west1.firebasedatabase.app/jobs.json';
const botToken = '8018570948:AAEP421r9xEg7R587HYdkCGJTwiV-s6zkl0'; // Ваш токен
const chatId = '-1004430886299'; // ВАШ ID ГРУПИ З МІНУСОМ

// Автоматичне визначення мови
let currentLang = localStorage.getItem('lang');
if (!currentLang) {
    const browserLang = (navigator.language || navigator.userLanguage).slice(0, 2).toLowerCase();
    if (browserLang === 'uk' || browserLang === 'ua') currentLang = 'ua';
    else if (browserLang === 'pl') currentLang = 'pl';
    else if (browserLang === 'ru') currentLang = 'ru';
    else currentLang = 'en';
    localStorage.setItem('lang', currentLang);
}

// Словник інтерфейсу
const i18n = {
    "title": { ua: "KorSolutions", en: "KorSolutions", pl: "KorSolutions", ru: "KorSolutions" },
    "subtitle": { ua: "Знайди свою ідеальну роботу", en: "Find your ideal job", pl: "Znajdź swoją idealną pracę", ru: "Найди свою идеальную работу" },
    "searchPlaceholder": { ua: "Пошук (наприклад: Склад)...", en: "Search...", pl: "Szukaj...", ru: "Поиск..." },
    "applyBtn": { ua: "Відгукнутися", en: "Apply", pl: "Aplikuj", ru: "Откликнуться" },
    "confirmApplyBtn": { ua: "Підтвердити відгук", en: "Confirm application", pl: "Potwierdź zgłoszenie", ru: "Подтвердить отклик" },
    "showFilters": { ua: "Показати фільтри", en: "Show filters", pl: "Pokaż filtry", ru: "Показать фильтры" },
    "filtersTitle": { ua: "Фільтри", en: "Filters", pl: "Filtry", ru: "Фильтры" },
    "partnerCode": { ua: "Код партнера", en: "Partner Code", pl: "Kod partnera", ru: "Код партнера" },
    "partnerPlaceholder": { ua: "Введіть код...", en: "Enter code...", pl: "Wpisz kod...", ru: "Введите код..." },
    "sbSaved": { ua: "Збережені", en: "Saved", pl: "Zapisane", ru: "Сохраненные" },
    "sbFavs": { ua: "Тільки мої обрані", en: "Only my favorites", pl: "Tylko moje ulubione", ru: "Только мои избранные" },
    "sbStatus": { ua: "Актуальність", en: "Status", pl: "Aktualność", ru: "Актуальность" },
    "sbCountry": { ua: "Країна", en: "Country", pl: "Kraj", ru: "Страна" },
    "sbCity": { ua: "Місто / Регіон", en: "City / Region", pl: "Miasto / Region", ru: "Город / Регион" },
    "sbRadius": { ua: "Радіус від міста", en: "Radius", pl: "Promień od miasta", ru: "Радиус от города" },
    "sbCategory": { ua: "Сфера роботи", en: "Industry", pl: "Branża", ru: "Сфера работы" },
    "sbAge": { ua: "Вік кандидата", en: "Candidate Age", pl: "Wiek kandydata", ru: "Возраст кандидата" },
    "sbMinors": { ua: "Тільки для неповнолітніх (до 18)", en: "Minors only (under 18)", pl: "Tylko dla nieletnich", ru: "Только до 18 лет" },
    "sbGender": { ua: "Стать", en: "Gender", pl: "Płeć", ru: "Пол" },
    "resetFilters": { ua: "Скинути всі фільтри", en: "Reset all filters", pl: "Resetuj filtry", ru: "Сбросить фильтры" },
    "optAllJobs": { ua: "Всі вакансії", en: "All jobs", pl: "Wszystkie oferty", ru: "Все вакансии" },
    "optOnlyActive": { ua: "Тільки актуальні", en: "Only active", pl: "Tylko aktualne", ru: "Только актуальные" },
    "optArchive": { ua: "Архів (Неактуальні)", en: "Archive", pl: "Archiwum", ru: "Архив" },
    "optAllCities": { ua: "Всі міста", en: "All cities", pl: "Wszystkie miasta", ru: "Все города" },
    "optAnyDist": { ua: "Будь-яка відстань", en: "Any distance", pl: "Dowolna odległość", ru: "Любое расстояние" },
    "opt0km": { ua: "Точно в місті (0 км)", en: "Exactly in city", pl: "Dokładnie w mieście", ru: "Точно в городе" },
    "opt10km": { ua: "До 10 км", en: "Up to 10 km", pl: "Do 10 km", ru: "До 10 км" },
    "opt30km": { ua: "До 30 км", en: "Up to 30 km", pl: "Do 30 km", ru: "До 30 км" },
    "opt50km": { ua: "До 50 км", en: "Up to 50 km", pl: "Do 50 km", ru: "До 50 км" },
    "opt100km": { ua: "До 100 км", en: "Up to 100 km", pl: "Do 100 km", ru: "До 100 км" },
    "sortNew": { ua: "Спершу нові", en: "Newest first", pl: "Od najnowszych", ru: "Сначала новые" },
    "sortOld": { ua: "Спершу старі", en: "Oldest first", pl: "Od najstarszych", ru: "Сначала старые" },
    "sortAz": { ua: "За алфавітом (А-Я)", en: "Alphabetical (A-Z)", pl: "Alfabetycznie (A-Z)", ru: "По алфавиту (А-Я)" },
    "perPage6": { ua: "6 на сторінці", en: "6 per page", pl: "6 na stronę", ru: "6 на странице" },
    "perPage12": { ua: "12 на сторінці", en: "12 per page", pl: "12 na stronę", ru: "12 на странице" },
    "perPage24": { ua: "24 на сторінці", en: "24 per page", pl: "24 na stronę", ru: "24 на странице" },
    "Чоловіки": { ua: "Чоловіки", en: "Men", pl: "Mężczyźni", ru: "Мужчины" },
    "Жінки": { ua: "Жінки", en: "Women", pl: "Kobiety", ru: "Женщины" },
    "Сімейні пари": { ua: "Сімейні пари", en: "Couples", pl: "Pary", ru: "Семейные пары" },
    "Актуальна": { ua: "Актуальна", en: "Active", pl: "Aktualna", ru: "Актуальная" },
    "Неактуальна": { ua: "Неактуальна", en: "Archived", pl: "Nieaktualna", ru: "Архив" },
    "ageLabel": { ua: "Вік:", en: "Age:", pl: "Wiek:", ru: "Возраст:" },
    "minorsOk": { ua: "Можна до 18", en: "Under 18 allowed", pl: "Można do 18 lat", ru: "Можно до 18" },
    "untilDate": { ua: "До", en: "Until", pl: "Do", ru: "До" },
    "readMore": { ua: "Розгорнути", en: "Read more", pl: "Rozwiń", ru: "Развернуть" },
    "readLess": { ua: "Згорнути", en: "Read less", pl: "Zwiń", ru: "Свернуть" },
    "notFound": { ua: "За вказаними параметрами вакансій не знайдено.", en: "No jobs found.", pl: "Nie znaleziono ofert.", ru: "Вакансий не найдено." },
    
    // Плейсхолдери для модалки (ВІДГУК)
    "modalNamePlaceholder": { ua: "Ваше ім'я та прізвище", en: "Your Full Name", pl: "Imię i nazwisko", ru: "Ваше имя и фамилия" },
    "modalPhonePlaceholder": { ua: "Номер телефону", en: "Phone Number", pl: "Numer telefonu", ru: "Номер телефона" },
    
    // Словник популярних слів для "старих" вакансій
    "Польща": { ua: "Польща", en: "Poland", pl: "Polska", ru: "Польша" },
    "Німеччина": { ua: "Німеччина", en: "Germany", pl: "Niemcy", ru: "Германия" },
    "Чехія": { ua: "Чехія", en: "Czech Republic", pl: "Czechy", ru: "Чехия" },
    "Нідерланди": { ua: "Нідерланди", en: "Netherlands", pl: "Holandia", ru: "Нидерланды" },
    "Склад": { ua: "Склад", en: "Warehouse", pl: "Magazyn", ru: "Склад" },
    "Будівництво": { ua: "Будівництво", en: "Construction", pl: "Budownictwo", ru: "Строительство" },
    "Завод": { ua: "Завод", en: "Factory", pl: "Fabryka", ru: "Завод" },
    "Прибирання": { ua: "Прибирання", en: "Cleaning", pl: "Sprzątanie", ru: "Уборка" },
    "Водій": { ua: "Водій", en: "Driver", pl: "Kierowca", ru: "Водитель" }
};

function t(key) {
    if (!i18n[key]) return key;
    return i18n[key][currentLang] || i18n[key]['ua'];
}

// Розумний переклад динамічних полів (країни, сфери)
function getTranslatedDynamicField(baseText, fieldName) {
    if (currentLang === 'ua' || !baseText) return baseText;
    
    // 1. Спочатку шукаємо в ручному словнику (для старих вакансій)
    if (i18n[baseText] && i18n[baseText][currentLang]) {
        return i18n[baseText][currentLang];
    }
    
    // 2. Якщо немає в словнику, шукаємо в базі даних (для нових, автоматичних вакансій)
    for (let job of allJobs) {
        if (job[fieldName] && job[fieldName].includes(baseText)) {
            const baseArr = job[fieldName].split(',').map(s => s.trim());
            const transField = job[`${fieldName}_${currentLang}`];
            if (transField) {
                const transArr = transField.split(',').map(s => s.trim());
                const idx = baseArr.indexOf(baseText);
                if (idx !== -1 && transArr[idx]) {
                    return transArr[idx];
                }
            }
        }
    }
    return baseText;
}

function applyUITranslations() {
    // Переклад статичних текстів
    document.querySelectorAll('[data-i18n]').forEach(el => { el.innerText = t(el.getAttribute('data-i18n')); });
    
    // Виправлений переклад Плейсхолдерів (Без багів!)
    if (document.getElementById('searchInput')) document.getElementById('searchInput').placeholder = t('searchPlaceholder');
    if (document.getElementById('partnerFilterInput')) document.getElementById('partnerFilterInput').placeholder = t('partnerPlaceholder');
    if (document.getElementById('modalName')) document.getElementById('modalName').placeholder = t('modalNamePlaceholder');
    if (document.getElementById('modalPhone')) document.getElementById('modalPhone').placeholder = t('modalPhonePlaceholder');
}

let allJobs = [];
let filteredJobs = [];
let currentPage = 1;
let jobsPerPage = 6; 
let activeFilters = { countries: [], categories: [], genders: [], ages: [] };
let searchQuery = "";
let expandedJobs = {};
let isFirstLoad = true; 
let savedFavs = JSON.parse(localStorage.getItem('korsolutions_favs')) || [];

document.addEventListener('DOMContentLoaded', () => {
    const activeBtn = document.getElementById(`btn-lang-${currentLang}`);
    if (activeBtn) activeBtn.classList.add('active');
    applyUITranslations();
});

window.changeLanguage = function(lang) {
    localStorage.setItem('lang', lang);
    location.reload(); 
}

function loadJobsFromDatabase() {
    document.getElementById('jobList').innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 40px;"><i class="fas fa-spinner fa-spin"></i> Завантаження...</p>';
    fetch(databaseUrl)
    .then(response => response.json())
    .then(data => {
        if (data) allJobs = Object.entries(data).map(([id, job]) => ({ id, ...job }));
        else allJobs = [];
        buildDynamicCheckboxes();
        applyFilters(); 
    })
}

function buildDynamicCheckboxes() {
    const rawCountries = allJobs.flatMap(j => j.country ? j.country.split(',').map(s => s.trim()) : []);
    const countries = [...new Set(rawCountries)].filter(Boolean);
    const rawCategories = allJobs.flatMap(j => j.category ? j.category.split(',').map(s => s.trim()) : []);
    const categories = [...new Set(rawCategories)].filter(Boolean);
    const rawAges = allJobs.flatMap(j => j.age ? j.age.split(',').map(s => s.trim()) : []);
    const ages = [...new Set(rawAges)].filter(Boolean);

    document.getElementById('dynamicCountries').innerHTML = countries.map(c => `<label><input type="checkbox" value="${c}" class="filter-cb" data-type="countries"> ${getTranslatedDynamicField(c, 'country')}</label>`).join('');
    document.getElementById('dynamicCategories').innerHTML = categories.map(c => `<label><input type="checkbox" value="${c}" class="filter-cb" data-type="categories"> ${getTranslatedDynamicField(c, 'category')}</label>`).join('');
    document.getElementById('dynamicAges').innerHTML = ages.map(c => `<label><input type="checkbox" value="${c}" class="filter-cb" data-type="ages"> ${c}</label>`).join('');

    document.querySelectorAll('.filter-cb').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const type = e.target.dataset.type;
            const val = e.target.value;
            if (e.target.checked) activeFilters[type].push(val);
            else activeFilters[type] = activeFilters[type].filter(item => item !== val);
            if(type === 'countries') updateCityDropdown();
            applyFilters();
        });
    });
    updateCityDropdown();
}

function updateCityDropdown() {
    const citySelect = document.getElementById('cityFilter');
    let availableCities = [];
    allJobs.forEach(job => {
        const jobCountries = job.country ? job.country.split(',').map(s => s.trim()) : [];
        const isCountryMatch = activeFilters.countries.length === 0 || jobCountries.some(c => activeFilters.countries.includes(c));
        if(isCountryMatch && job.baseCity) job.baseCity.split(',').forEach(c => availableCities.push(c.trim()));
    });

    const uniqueCities = [...new Set(availableCities)].sort();
    const currentSelection = citySelect.value;
    citySelect.innerHTML = `<option value="Всі">${t('optAllCities')}</option>` + uniqueCities.map(city => `<option value="${city}">${city}</option>`).join('');
    if (uniqueCities.includes(currentSelection)) citySelect.value = currentSelection;
    else citySelect.value = "Всі";
}

window.toggleSecretFilter = function() {
    const el = document.getElementById('secretPartnerDiv');
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

document.getElementById('searchInput').addEventListener('input', (e) => { searchQuery = e.target.value.toLowerCase(); applyFilters(); });

window.changePerPage = function() { jobsPerPage = parseInt(document.getElementById('perPageSelect').value); currentPage = 1; renderJobs(); };

window.resetFilters = function() {
    activeFilters = { countries: [], categories: [], genders: [], ages: [] };
    searchQuery = "";
    document.getElementById('searchInput').value = "";
    if(document.getElementById('partnerFilterInput')) document.getElementById('partnerFilterInput').value = "";
    document.getElementById('statusFilter').value = "Актуальна";
    document.getElementById('sortSelect').value = "date-desc";
    document.getElementById('cityFilter').value = "Всі"; 
    document.getElementById('radiusFilter').value = "Будь-який"; 
    document.getElementById('minorsOnlyFilter').checked = false;
    document.getElementById('favFilter').checked = false; 
    document.querySelectorAll('.filter-cb').forEach(cb => cb.checked = false);
    updateCityDropdown();
    applyFilters();
}

window.applyFilters = function() {
    const urlParams = new URLSearchParams(window.location.search);
    let specificJobId = urlParams.get('job');

    if (!isFirstLoad && specificJobId) {
        const url = new URL(window.location);
        url.searchParams.delete('job');
        window.history.pushState({}, '', url);
        specificJobId = null;
    }

    const statusReq = document.getElementById('statusFilter').value;
    const minorsOnly = document.getElementById('minorsOnlyFilter').checked;
    const sortMode = document.getElementById('sortSelect').value;
    const cityReq = document.getElementById('cityFilter').value;
    const radiusReq = document.getElementById('radiusFilter').value;
    const showFavsOnly = document.getElementById('favFilter').checked;
    const partnerInput = document.getElementById('partnerFilterInput');
    const partnerReq = partnerInput ? partnerInput.value.toLowerCase().trim() : '';
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

    filteredJobs = allJobs.filter(job => {
        if (specificJobId) return job.id === specificJobId;

        const matchSearch = job.title.toLowerCase().includes(searchQuery) || job.desc.toLowerCase().includes(searchQuery);
        let jobStatus = job.status || 'Актуальна';
        if (job.expireDate && job.expireDate < today) jobStatus = 'Неактуальна';

        const matchStatus = (statusReq === 'Всі') || (jobStatus === statusReq);
        const matchMinors = !minorsOnly || job.minors === 'Так';
        const jobPartner = (job.partner || '').toLowerCase();
        const matchPartner = partnerReq === '' || jobPartner.includes(partnerReq);
        
        const jobCountries = job.country ? job.country.split(',').map(s => s.trim()) : [];
        const matchCountry = activeFilters.countries.length === 0 || jobCountries.some(c => activeFilters.countries.includes(c));
        
        const jobCategories = job.category ? job.category.split(',').map(s => s.trim()) : [];
        const matchCategory = activeFilters.categories.length === 0 || jobCategories.some(c => activeFilters.categories.includes(c));
        
        const jobAges = job.age ? job.age.split(',').map(s => s.trim()) : [];
        const matchAgeGroup = activeFilters.ages.length === 0 || jobAges.some(c => activeFilters.ages.includes(c));
        
        const jobGenders = job.gender ? job.gender.split(',').map(s => s.trim()) : [];
        const matchGender = activeFilters.genders.length === 0 || jobGenders.some(g => activeFilters.genders.includes(g));

        const jobCity = job.baseCity ? job.baseCity.trim() : '';
        const matchCity = (cityReq === 'Всі') || (jobCity === cityReq);
        
        let matchRadius = true;
        if (radiusReq !== 'Будь-який' && cityReq !== 'Всі') {
            const jobRad = parseInt(job.radius || '0');
            const searchRad = parseInt(radiusReq);
            matchRadius = jobRad <= searchRad; 
        }

        const matchFav = !showFavsOnly || savedFavs.includes(job.id);
        
        return matchSearch && matchStatus && matchMinors && matchCountry && matchCategory && matchGender && matchAgeGroup && matchPartner && matchCity && matchRadius && matchFav;
    });

    if (specificJobId && filteredJobs.length === 1) expandedJobs[specificJobId] = true;

    if (sortMode === 'date-desc') filteredJobs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    else if (sortMode === 'date-asc') filteredJobs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    else if (sortMode === 'name-asc') filteredJobs.sort((a, b) => a.title.localeCompare(b.title));

    currentPage = 1;
    isFirstLoad = false; 
    renderActiveTags();
    renderJobs();
}

function renderActiveTags() {
    const container = document.getElementById('activeTags');
    container.innerHTML = '';
    ['countries', 'categories', 'genders', 'ages'].forEach(type => {
        activeFilters[type].forEach(val => {
            let displayVal = val;
            if (type === 'countries') displayVal = getTranslatedDynamicField(val, 'country');
            else if (type === 'categories') displayVal = getTranslatedDynamicField(val, 'category');
            else if (type === 'genders') displayVal = t(val);

            container.innerHTML += `<span class="tag">${displayVal} <i class="fas fa-times" onclick="removeFilter('${type}', '${val}')"></i></span>`;
        });
    });
}

window.removeFilter = function(type, val) {
    activeFilters[type] = activeFilters[type].filter(item => item !== val);
    document.querySelectorAll('.filter-cb').forEach(cb => { if (cb.dataset.type === type && cb.value === val) cb.checked = false; });
    if(type === 'countries') updateCityDropdown();
    applyFilters();
}

window.trackClick = function(id, type) {
    const url = `${databaseUrl.replace('.json', '')}/${id}/${type}.json`;
    fetch(url).then(r => r.json()).then(count => { fetch(url, { method: 'PUT', body: JSON.stringify((count || 0) + 1) }); });
}

window.toggleFav = function(id) {
    if(savedFavs.includes(id)) savedFavs = savedFavs.filter(x => x !== id);
    else savedFavs.push(id);
    localStorage.setItem('korsolutions_favs', JSON.stringify(savedFavs));
    applyFilters();
}

window.shareJob = function(id) {
    const job = allJobs.find(j => j.id === id);
    const jobUrl = `${window.location.origin}${window.location.pathname}?job=${id}`; 
    const text = `🔥 Вакансія: ${job.title}\n💰 Зарплата: ${job.salary}\n🌍 Країна: ${job.country}\n\nДізнайся більше на сайті!`;
    if (navigator.share) {
        navigator.share({ title: job.title, text: text, url: jobUrl }).catch(err => console.log(err));
    } else {
        navigator.clipboard.writeText(text + '\n' + jobUrl).then(() => {
            document.getElementById('toastTitle').innerText = 'Скопійовано!';
            document.getElementById('toastDesc').innerText = 'Посилання скопійовано в буфер обміну.';
            showToast();
        });
    }
}

window.copyJob = function(id) {
    const job = allJobs.find(j => j.id === id);
    const jobUrl = `${window.location.origin}${window.location.pathname}?job=${id}`; 
    const temp = document.createElement('div');
    temp.innerHTML = job.desc;
    
    let text = `🔥 Вакансія: ${job.title}\n📌 Статус: ${job.status || 'Актуальна'}\n🌍 Країна: ${job.country}\n`;
    if(job.address) text += `📍 Адреса: ${job.address}\n`;
    text += `💼 Сфера: ${job.category}\n`;
    if(job.gender) text += `🚻 Стать: ${job.gender}\n`;
    if(job.age) text += `⏳ Вік: ${job.age}\n`;
    if(job.minors === 'Так') text += `👶 Підходить для неповнолітніх: ТАК\n`;
    text += `💰 Зарплата: ${job.salary}\n\n📝 Опис:\n${temp.innerText}\n\n🔗 Дізнатися більше та відгукнутися: ${jobUrl}`;

    const secretDiv = document.getElementById('secretPartnerDiv');
    if(secretDiv && secretDiv.style.display === 'block' && job.partner) {
        text += `\n\n🕵️ Внутрішній код: ${job.partner}`;
    }

    navigator.clipboard.writeText(text).then(() => {
        document.getElementById('toastTitle').innerText = 'Скопійовано!';
        document.getElementById('toastDesc').innerText = 'Всю інфу та посилання збережено в буфер обміну.';
        showToast();
    });
}

function renderJobs() {
    const list = document.getElementById('jobList');
    list.innerHTML = '';
    const start = (currentPage - 1) * jobsPerPage;
    const end = start + jobsPerPage;
    const jobsToShow = filteredJobs.slice(start, end);

    if (jobsToShow.length === 0) {
        list.innerHTML = `<p style="text-align:center; color:#64748b; grid-column: 1/-1; padding: 40px;">${t('notFound')}</p>`;
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

    jobsToShow.forEach(job => {
        // Отримуємо перекладені дані з бази
        const displayTitle = (currentLang === 'ua') ? job.title : (job['title_' + currentLang] || job.title);
        const displayDesc = (currentLang === 'ua') ? job.desc : (job['desc_' + currentLang] || job.desc);
        const displayCountry = (currentLang === 'ua') ? job.country : (job['country_' + currentLang] || job.country);
        const displayCategory = (currentLang === 'ua') ? job.category : (job['category_' + currentLang] || job.category);
        const displaySalary = (currentLang === 'ua') ? job.salary : (job['salary_' + currentLang] || job.salary); // <-- Переклад зарплати!

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = displayDesc; 
        const plainText = tempDiv.innerText || tempDiv.textContent || '';
        
        const isLong = plainText.length > 200; 
        const isExpanded = expandedJobs[job.id] === true;
        const wrapperClass = (isLong && !isExpanded) ? "desc-wrapper rich-text-box collapsed" : "desc-wrapper rich-text-box expanded";

        const formattedCountry = displayCountry ? displayCountry.split(',').map(s => s.trim()).join(', ') : '';
        const formattedCategory = displayCategory ? displayCategory.split(',').map(s => s.trim()).join(', ') : '';
        const formattedAge = job.age ? job.age.split(',').map(s => s.trim()).join(', ') : '';
        
        const formattedGender = job.gender ? job.gender.split(',').map(s => t(s.trim())).join(', ') : '';
        
        let jobStatus = job.status || 'Актуальна';
        if (job.expireDate && job.expireDate < today) jobStatus = 'Неактуальна';
        const isInactive = jobStatus === 'Неактуальна';
        const displayStatus = t(jobStatus);
        
        const isFav = savedFavs.includes(job.id);
        const coverImageHtml = job.image ? `<img src="${job.image}" class="job-cover-img" loading="lazy" alt="${displayTitle}">` : '';

        const readMoreText = isExpanded ? `${t('readLess')} <i class="fas fa-angle-up"></i>` : `${t('readMore')} <i class="fas fa-angle-down"></i>`;

        list.innerHTML += `
            <div class="job-card ${isInactive ? 'inactive' : ''}" id="job-card-${job.id}">
                <div class="action-buttons">
                    <button class="icon-btn" onclick="copyJob('${job.id}')" title="Скопіювати все"><i class="fas fa-copy"></i></button>
                    <button class="icon-btn fav ${isFav ? 'active' : ''}" onclick="toggleFav('${job.id}')" title="Зберегти"><i class="${isFav ? 'fas' : 'far'} fa-heart"></i></button>
                    <button class="icon-btn share" onclick="shareJob('${job.id}')" title="Поділитися"><i class="fas fa-share-alt"></i></button>
                </div>

                <div>
                    <div class="status-badge ${isInactive ? 'inactive' : 'active'}">${displayStatus}</div>
                    <h3>${displayTitle}</h3>
                    <div class="job-meta">
                        <p><i class="fas fa-globe"></i> ${formattedCountry}</p>
                        ${job.address ? `<p><i class="fas fa-map-marker-alt"></i> ${job.address}</p>` : ''}
                        <p><i class="fas fa-tags"></i> ${formattedCategory}</p>
                        ${formattedGender ? `<p><i class="fas fa-user"></i> ${formattedGender}</p>` : ''}
                        ${formattedAge ? `<p><i class="fas fa-user-clock"></i> ${t('ageLabel')} ${formattedAge}</p>` : ''}
                        ${job.expireDate ? `<p style="color:#ef4444;"><i class="fas fa-hourglass-end"></i> ${t('untilDate')} ${job.expireDate}</p>` : ''}
                        ${job.minors === 'Так' ? `<p style="color:#f59e0b; font-weight:bold;"><i class="fas fa-child"></i> ${t('minorsOk')}</p>` : ''}
                    </div>
                    <div class="job-salary">${displaySalary}</div>
                    
                    ${coverImageHtml}
                    
                    <div class="${wrapperClass}">
                        ${displayDesc}
                    </div>
                    
                    ${isLong ? `
                        <button class="read-more-btn" onclick="trackClick('${job.id}', 'views'); toggleJobDescription('${job.id}')">
                            ${readMoreText}
                        </button>
                    ` : ''}
                </div>
                <button class="btn-apply" onclick="trackClick('${job.id}', 'applies'); openModal('${displayTitle.replace(/'/g, "\\'")}')">${t('applyBtn')}</button>
            </div>
        `;
    });
    renderPagination();
}

window.toggleJobDescription = function(id) { 
    const wasExpanded = expandedJobs[id];
    expandedJobs[id] = !expandedJobs[id]; 
    renderJobs(); 
    if (wasExpanded) {
        const card = document.getElementById(`job-card-${id}`);
        if (card) {
            const offsetPosition = card.getBoundingClientRect().top + window.pageYOffset - 40;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    }
};

function renderPagination() {
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    const pagDiv = document.getElementById('pagination');
    pagDiv.innerHTML = '';
    if (totalPages <= 1) return;

    pagDiv.innerHTML += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
    for (let i = 1; i <= totalPages; i++) {
        pagDiv.innerHTML += `<button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
    pagDiv.innerHTML += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
}

window.changePage = function(page) {
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderJobs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

loadJobsFromDatabase();

window.toggleAccordion = function(id) { document.getElementById(id).classList.toggle('open'); }
window.toggleSidebar = function() { document.getElementById('sidebar').classList.toggle('open'); }

function openModal(jobTitle) { document.getElementById('modalJobTitle').innerText = jobTitle; document.getElementById('jobModal').style.display = 'flex'; }
function closeModal() { document.getElementById('jobModal').style.display = 'none'; document.getElementById('modalTgForm').reset(); }
window.onclick = function(event) { if (event.target == document.getElementById('jobModal')) closeModal(); }

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

document.getElementById('modalTgForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('modalName').value;
    const phone = document.getElementById('modalPhone').value;
    const jobTitle = document.getElementById('modalJobTitle').innerText;
    
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: `🔥 ВІДГУК НА ВАКАНСІЮ 🔥\n\n🎯 Вакансія: ${jobTitle}\n👤 Ім'я: ${name}\n📞 Телефон: ${phone}` })
    }).then(res => { if(res.ok) { showToast(); closeModal(); } });
});
