const databaseUrl = 'https://korsolutions-jobs-default-rtdb.europe-west1.firebasedatabase.app/jobs.json';
const botToken = '8018570948:AAEP421r9xEg7R587HYdkCGJTwiV-s6zkl0';
const chatId = '5426420290';

let allJobs = [];
let filteredJobs = [];
let currentPage = 1;
const jobsPerPage = 6; 

let activeFilters = { countries: [], categories: [], genders: [], ages: [] };
let searchQuery = "";
let expandedJobs = {};

function loadJobsFromDatabase() {
    document.getElementById('jobList').innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 40px;"><i class="fas fa-spinner fa-spin"></i> Завантаження...</p>';
    fetch(databaseUrl)
    .then(response => response.json())
    .then(data => {
        if (data) {
            allJobs = Object.entries(data).map(([id, job]) => ({ id, ...job }));
        } else {
            allJobs = [];
        }
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
            applyFilters();
        });
    });
}

window.toggleSecretFilter = function() {
    const el = document.getElementById('secretPartnerDiv');
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    applyFilters();
});

window.resetFilters = function() {
    activeFilters = { countries: [], categories: [], genders: [], ages: [] };
    searchQuery = "";
    document.getElementById('searchInput').value = "";
    if(document.getElementById('partnerFilterInput')) document.getElementById('partnerFilterInput').value = "";
    document.getElementById('statusFilter').value = "Актуальна";
    document.getElementById('sortSelect').value = "date-desc";
    document.getElementById('minorsOnlyFilter').checked = false;
    document.querySelectorAll('.filter-cb').forEach(cb => cb.checked = false);
    applyFilters();
}

window.applyFilters = function() {
    const statusReq = document.getElementById('statusFilter').value;
    const minorsOnly = document.getElementById('minorsOnlyFilter').checked;
    const sortMode = document.getElementById('sortSelect').value;
    const partnerInput = document.getElementById('partnerFilterInput');
    const partnerReq = partnerInput ? partnerInput.value.toLowerCase().trim() : '';

    filteredJobs = allJobs.filter(job => {
        const matchSearch = job.title.toLowerCase().includes(searchQuery) || job.desc.toLowerCase().includes(searchQuery);
        const jobStatus = job.status || 'Актуальна';
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
        
        return matchSearch && matchStatus && matchMinors && matchCountry && matchCategory && matchGender && matchAgeGroup && matchPartner;
    });

    if (sortMode === 'date-desc') filteredJobs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    else if (sortMode === 'date-asc') filteredJobs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    else if (sortMode === 'name-asc') filteredJobs.sort((a, b) => a.title.localeCompare(b.title));

    currentPage = 1;
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
    applyFilters();
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

    jobsToShow.forEach(job => {
        // Створюємо тимчасовий елемент, щоб дістати ТІЛЬКИ текст з HTML (для короткого опису)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = job.desc;
        const plainText = tempDiv.innerText || tempDiv.textContent || '';
        
        const isLong = plainText.length > 150;
        const isExpanded = expandedJobs[job.id] === true;
        
        // Якщо розгорнуто — показуємо красивий HTML. Якщо згорнуто — показуємо обрізаний простий текст
        const htmlToDisplay = (isExpanded || !isLong) ? job.desc : plainText.substring(0, 150) + '...';

        const formattedCountry = job.country ? job.country.split(',').map(s => s.trim()).join(', ') : '';
        const formattedCategory = job.category ? job.category.split(',').map(s => s.trim()).join(', ') : '';
        const formattedAge = job.age ? job.age.split(',').map(s => s.trim()).join(', ') : '';
        const formattedGender = job.gender ? job.gender.split(',').map(s => s.trim()).join(', ') : '';
        const isInactive = (job.status || 'Актуальна') === 'Неактуальна';

        list.innerHTML += `
            <div class="job-card ${isInactive ? 'inactive' : ''}">
                <button class="copy-btn" onclick="copyJob('${job.id}')" title="Скопіювати інфу"><i class="fas fa-copy"></i></button>
                <div>
                    <div class="status-badge ${isInactive ? 'inactive' : 'active'}">${job.status || 'Актуальна'}</div>
                    <h3>${job.title}</h3>
                    <div class="job-meta">
                        <p><i class="fas fa-globe"></i> ${formattedCountry}</p>
                        ${job.address ? `<p><i class="fas fa-map-marker-alt"></i> ${job.address}</p>` : ''}
                        <p><i class="fas fa-tags"></i> ${formattedCategory}</p>
                        ${formattedGender ? `<p><i class="fas fa-user"></i> ${formattedGender}</p>` : ''}
                        ${formattedAge ? `<p><i class="fas fa-user-clock"></i> Вік: ${formattedAge}</p>` : ''}
                        ${job.minors === 'Так' ? `<p style="color:#f59e0b; font-weight:bold;"><i class="fas fa-child"></i> Можна до 18 років</p>` : ''}
                    </div>
                    <div class="job-salary">${job.salary}</div>
                    
                    <div class="desc-wrapper rich-text-box">
                        ${htmlToDisplay}
                    </div>
                    ${isLong ? `
                        <button class="read-more-btn" style="margin-bottom:20px;" onclick="toggleJobDescription('${job.id}')">
                            ${isExpanded ? 'Згорнути <i class="fas fa-angle-up"></i>' : 'Розгорнути <i class="fas fa-angle-down"></i>'}
                        </button>
                    ` : ''}
                </div>
                <button class="btn-apply" onclick="openModal('${job.title}')">Відгукнутися</button>
            </div>
        `;
    });
    renderPagination();
}

window.copyJob = function(id) {
    const job = allJobs.find(j => j.id === id);
    
    // Дістаємо чистий текст (з переносами рядків) для копіювання в месенджери
    const temp = document.createElement('div');
    temp.innerHTML = job.desc;
    const plainDesc = temp.innerText;

    let text = `🔥 Вакансія: ${job.title}\n📌 Статус: ${job.status || 'Актуальна'}\n🌍 Країна: ${job.country}\n`;
    if(job.address) text += `📍 Адреса: ${job.address}\n`;
    text += `💼 Сфера: ${job.category}\n`;
    if(job.gender) text += `🚻 Стать: ${job.gender}\n`;
    if(job.age) text += `⏳ Вік: ${job.age}\n`;
    if(job.minors === 'Так') text += `👶 Підходить для неповнолітніх: ТАК\n`;
    text += `💰 Зарплата: ${job.salary}\n\n📝 Опис:\n${plainDesc}\n\n🔗 Дізнатися більше: korsolutions.works`;

    const secretDiv = document.getElementById('secretPartnerDiv');
    if(secretDiv && secretDiv.style.display === 'block' && job.partner) {
        text += `\n\n🕵️ Внутрішній код: ${job.partner}`;
    }

    navigator.clipboard.writeText(text).then(() => {
        document.getElementById('toastTitle').innerText = 'Скопійовано!';
        document.getElementById('toastDesc').innerText = 'Всю інфу збережено в буфер обміну.';
        showToast();
    });
}

window.toggleJobDescription = function(id) { expandedJobs[id] = !expandedJobs[id]; renderJobs(); };

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
