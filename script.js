const databaseUrl = 'https://korsolutions-jobs-default-rtdb.europe-west1.firebasedatabase.app/jobs.json';
const botToken = '8018570948:AAEP421r9xEg7R587HYdkCGJTwiV-s6zkl0';
const chatId = '5426420290';
const langStrings = {
    ua: { title: "KorSolutions", subtitle: "Знайди свою ідеальну роботу", filters: "Фільтри", search: "Пошук...", apply: "Відгукнутися" },
    en: { title: "KorSolutions", subtitle: "Find your ideal job", filters: "Filters", search: "Search...", apply: "Apply" },
    pl: { title: "KorSolutions", subtitle: "Znajdź swoją idealną pracę", filters: "Filtry", search: "Szukaj...", apply: "Aplikuj" },
    ru: { title: "KorSolutions", subtitle: "Найди свою идеальную работу", filters: "Фильтры", search: "Поиск...", apply: "Откликнуться" }
};

let allJobs = [];
let filteredJobs = [];
let currentPage = 1;
let jobsPerPage = 6; 

let currentLang = localStorage.getItem('lang') || 'ua';
let activeFilters = { countries: [], categories: [], genders: [], ages: [] };
let searchQuery = "";
let expandedJobs = {};
let isFirstLoad = true; // Слідкує за тим, чи це перший захід на сайт

// Завантажуємо збережені вакансії з пам'яті браузера
let savedFavs = JSON.parse(localStorage.getItem('korsolutions_favs')) || [];

function updateUI() {
    const lang = currentLang;
    const s = langStrings[lang] || langStrings.ua;
    
    // Оновлюємо заголовки
    document.querySelector('.logo-text').innerText = s.title;
    document.querySelector('.hero-subtitle').innerText = s.subtitle;
    document.querySelector('.sidebar-header h3').innerHTML = `<i class="fas fa-sliders-h"></i> ${s.filters}`;
    document.getElementById('searchInput').placeholder = s.search;
    
    // Оновлюємо текст кнопки відгуку на всіх картках (якщо вони вже є)
    document.querySelectorAll('.btn-apply').forEach(btn => btn.innerText = s.apply);
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

    document.getElementById('dynamicCountries').innerHTML = countries.map(c => `<label><input type="checkbox" value="${c}" class="filter-cb" data-type="countries"> ${c}</label>`).join('');
    document.getElementById('dynamicCategories').innerHTML = categories.map(c => `<label><input type="checkbox" value="${c}" class="filter-cb" data-type="categories"> ${c}</label>`).join('');
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
    citySelect.innerHTML = '<option value="Всі">Всі міста</option>' + uniqueCities.map(city => `<option value="${city}">${city}</option>`).join('');
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
    // 1. ПЕРЕВІРКА УНІКАЛЬНОГО ПОСИЛАННЯ
    const urlParams = new URLSearchParams(window.location.search);
    let specificJobId = urlParams.get('job');

    // Якщо користувач почав користуватися фільтрами - скидаємо унікальне посилання, щоб показати всі вакансії
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
        // Якщо є унікальне посилання - ігноруємо всі фільтри і показуємо тільки цю вакансію!
        if (specificJobId) {
            return job.id === specificJobId;
        }

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

    // Автоматично розгортаємо текст, якщо відкрито унікальне посилання
    if (specificJobId && filteredJobs.length === 1) {
        expandedJobs[specificJobId] = true;
    }

    if (sortMode === 'date-desc') filteredJobs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    else if (sortMode === 'date-asc') filteredJobs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    else if (sortMode === 'name-asc') filteredJobs.sort((a, b) => a.title.localeCompare(b.title));

    currentPage = 1;
    isFirstLoad = false; // Вимикаємо прапорець першого завантаження
    renderActiveTags();
    renderJobs();
}

function renderActiveTags() {
    const container = document.getElementById('activeTags');
    container.innerHTML = '';
    ['countries', 'categories', 'genders', 'ages'].forEach(type => {
        activeFilters[type].forEach(val => {
            container.innerHTML += `<span class="tag">${val} <i class="fas fa-times" onclick="removeFilter('${type}', '${val}')"></i></span>`;
        });
    });
}

window.removeFilter = function(type, val) {
    activeFilters[type] = activeFilters[type].filter(item => item !== val);
    document.querySelectorAll('.filter-cb').forEach(cb => { if (cb.dataset.type === type && cb.value === val) cb.checked = false; });
    if(type === 'countries') updateCityDropdown();
    applyFilters();
}

// Функція трекінгу аналітики (записує кліки в БД)
window.trackClick = function(id, type) {
    const url = `${databaseUrl.replace('.json', '')}/${id}/${type}.json`;
    fetch(url).then(r => r.json()).then(count => {
        fetch(url, { method: 'PUT', body: JSON.stringify((count || 0) + 1) });
    });
}

// Сердечко (Додати/Прибрати з обраного)
window.toggleFav = function(id) {
    if(savedFavs.includes(id)) savedFavs = savedFavs.filter(x => x !== id);
    else savedFavs.push(id);
    localStorage.setItem('korsolutions_favs', JSON.stringify(savedFavs));
    applyFilters();
}

// Кнопка Поділитися (Генерує УНІКАЛЬНЕ посилання)
window.shareJob = function(id) {
    const job = allJobs.find(j => j.id === id);
    const jobUrl = `${window.location.origin}${window.location.pathname}?job=${id}`; // Ось це посилання!
    const text = `🔥 Вакансія: ${job.title}\n💰 Зарплата: ${job.salary}\n🌍 Країна: ${job.country}\n\nДізнайся більше на сайті!`;
    
    if (navigator.share) {
        navigator.share({ title: job.title, text: text, url: jobUrl }).catch(err => console.log(err));
    } else {
        // Для комп'ютерів просто копіюємо в буфер
        navigator.clipboard.writeText(text + '\n' + jobUrl).then(() => {
            document.getElementById('toastTitle').innerText = 'Скопійовано!';
            document.getElementById('toastDesc').innerText = 'Посилання скопійовано в буфер обміну.';
            showToast();
        });
    }
}

// Повна копія вакансії (Для рекрутерів)
window.copyJob = function(id) {
    const job = allJobs.find(j => j.id === id);
    const jobUrl = `${window.location.origin}${window.location.pathname}?job=${id}`; // Унікальне посилання
    
    const temp = document.createElement('div');
    temp.innerHTML = job.desc;
    const plainDesc = temp.innerText;

    let text = `🔥 Вакансія: ${job.title}\n📌 Статус: ${job.status || 'Актуальна'}\n🌍 Країна: ${job.country}\n`;
    if(job.address) text += `📍 Адреса: ${job.address}\n`;
    text += `💼 Сфера: ${job.category}\n`;
    if(job.gender) text += `🚻 Стать: ${job.gender}\n`;
    if(job.age) text += `⏳ Вік: ${job.age}\n`;
    if(job.minors === 'Так') text += `👶 Підходить для неповнолітніх: ТАК\n`;
    text += `💰 Зарплата: ${job.salary}\n\n📝 Опис:\n${plainDesc}\n\n🔗 Дізнатися більше та відгукнутися: ${jobUrl}`;

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
        list.innerHTML = '<p style="text-align:center; color:#64748b; grid-column: 1/-1; padding: 40px;">За вказаними параметрами вакансій не знайдено.</p>';
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

    jobsToShow.forEach(job => {
        // --- ЛОГІКА ПЕРЕКЛАДУ ---
        // Якщо мова UA, беремо оригінал, якщо ні - шукаємо перекладене поле
        const displayTitle = (currentLang === 'ua') ? job.title : (job['title_' + currentLang] || job.title);
        const displayDesc = (currentLang === 'ua') ? job.desc : (job['desc_' + currentLang] || job.desc);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = displayDesc; // Використовуємо вже перекладений текст для перевірки довжини
        const plainText = tempDiv.innerText || tempDiv.textContent || '';
        
        const isLong = plainText.length > 200; 
        const isExpanded = expandedJobs[job.id] === true;
        const wrapperClass = (isLong && !isExpanded) ? "desc-wrapper rich-text-box collapsed" : "desc-wrapper rich-text-box expanded";

        // ... (інші форматування лишаються без змін)
        const formattedCountry = job.country ? job.country.split(',').map(s => s.trim()).join(', ') : '';
        const formattedCategory = job.category ? job.category.split(',').map(s => s.trim()).join(', ') : '';
        const formattedAge = job.age ? job.age.split(',').map(s => s.trim()).join(', ') : '';
        const formattedGender = job.gender ? job.gender.split(',').map(s => s.trim()).join(', ') : '';
        
        let jobStatus = job.status || 'Актуальна';
        if (job.expireDate && job.expireDate < today) jobStatus = 'Неактуальна';
        const isInactive = jobStatus === 'Неактуальна';
        
        const isFav = savedFavs.includes(job.id);
        const coverImageHtml = job.image ? `<img src="${job.image}" class="job-cover-img" loading="lazy" alt="${displayTitle}">` : '';

        list.innerHTML += `
            <div class="job-card ${isInactive ? 'inactive' : ''}" id="job-card-${job.id}">
                <div class="action-buttons">
                    <button class="icon-btn" onclick="copyJob('${job.id}')" title="Скопіювати все"><i class="fas fa-copy"></i></button>
                    <button class="icon-btn fav ${isFav ? 'active' : ''}" onclick="toggleFav('${job.id}')" title="Зберегти"><i class="${isFav ? 'fas' : 'far'} fa-heart"></i></button>
                    <button class="icon-btn share" onclick="shareJob('${job.id}')" title="Поділитися"><i class="fas fa-share-alt"></i></button>
                </div>

                <div>
                    <div class="status-badge ${isInactive ? 'inactive' : 'active'}">${jobStatus}</div>
                    <h3>${displayTitle}</h3>
                    <div class="job-meta">
                        <p><i class="fas fa-globe"></i> ${formattedCountry}</p>
                        ${job.address ? `<p><i class="fas fa-map-marker-alt"></i> ${job.address}</p>` : ''}
                        <p><i class="fas fa-tags"></i> ${formattedCategory}</p>
                        ${formattedGender ? `<p><i class="fas fa-user"></i> ${formattedGender}</p>` : ''}
                        ${formattedAge ? `<p><i class="fas fa-user-clock"></i> Вік: ${formattedAge}</p>` : ''}
                        ${job.expireDate ? `<p style="color:#ef4444;"><i class="fas fa-hourglass-end"></i> До ${job.expireDate}</p>` : ''}
                        ${job.minors === 'Так' ? `<p style="color:#f59e0b; font-weight:bold;"><i class="fas fa-child"></i> Можна до 18</p>` : ''}
                    </div>
                    <div class="job-salary">${job.salary}</div>
                    
                    ${coverImageHtml}
                    
                    <div class="${wrapperClass}">
                        ${displayDesc}
                    </div>
                    
                    ${isLong ? `
                        <button class="read-more-btn" onclick="trackClick('${job.id}', 'views'); toggleJobDescription('${job.id}')">
                            ${isExpanded ? 'Згорнути <i class="fas fa-angle-up"></i>' : 'Розгорнути <i class="fas fa-angle-down"></i>'}
                        </button>
                    ` : ''}
                </div>
                <button class="btn-apply" onclick="trackClick('${job.id}', 'applies'); openModal('${displayTitle.replace(/'/g, "\\'")}')">Відгукнутися</button>
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
            const headerOffset = 40; 
            const elementPosition = card.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
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


document.addEventListener('DOMContentLoaded', function() {
    window.changeLang = function(lang) {
        console.log("Мова змінена на:", lang);
        currentLang = lang;
        localStorage.setItem('lang', lang);
        renderJobs();
        updateUI();
    };
});
