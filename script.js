const databaseUrl = 'https://korsolutions-jobs-default-rtdb.europe-west1.firebasedatabase.app/jobs.json';
const botToken = '8018570948:AAEP421r9xEg7R587HYdkCGJTwiV-s6zkl0';
const chatId = '5426420290';

let allJobs = [];
let filteredJobs = [];
let currentPage = 1;
const jobsPerPage = 6; // Рівно 6 вакансій на сторінку (сітка 2 в ряд, 3 ряди в глибину)

let activeFilters = { countries: [], categories: [], genders: [] };
let searchQuery = "";
// Сховище для відстеження розгорнутих текстів
let expandedJobs = {};

function loadJobsFromDatabase() {
    document.getElementById('jobList').innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 40px;"><i class="fas fa-spinner fa-spin"></i> Завантаження актуальних вакансій...</p>';
    fetch(databaseUrl)
    .then(response => response.json())
    .then(data => {
        if (data) {
            allJobs = Object.entries(data).map(([id, job]) => ({ id, ...job })).reverse();
        } else {
            allJobs = [];
        }
        filteredJobs = [...allJobs];
        
        buildDynamicCheckboxes();
        renderJobs();
    })
    .catch(() => {
        document.getElementById('jobList').innerHTML = '<p style="color:red; text-align:center; grid-column: 1/-1; padding: 40px;">Помилка завантаження бази даних.</p>';
    });
}

function buildDynamicCheckboxes() {
    const countries = [...new Set(allJobs.map(j => j.country))].filter(Boolean);
    const categories = [...new Set(allJobs.map(j => j.category))].filter(Boolean);

    document.getElementById('dynamicCountries').innerHTML = countries.map(c => 
        `<label><input type="checkbox" value="${c}" class="filter-cb" data-type="countries"> ${c}</label>`
    ).join('');

    document.getElementById('dynamicCategories').innerHTML = categories.map(c => 
        `<label><input type="checkbox" value="${c}" class="filter-cb" data-type="categories"> ${c}</label>`
    ).join('');

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

document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    applyFilters();
});

function applyFilters() {
    filteredJobs = allJobs.filter(job => {
        const matchSearch = job.title.toLowerCase().includes(searchQuery) || job.desc.toLowerCase().includes(searchQuery);
        const matchCountry = activeFilters.countries.length === 0 || activeFilters.countries.includes(job.country);
        const matchCategory = activeFilters.categories.length === 0 || activeFilters.categories.includes(job.category);
        const matchGender = activeFilters.genders.length === 0 || (job.gender && activeFilters.genders.includes(job.gender));
        
        return matchSearch && matchCountry && matchCategory && matchGender;
    });

    currentPage = 1;
    renderActiveTags();
    renderJobs();
}

function renderActiveTags() {
    const container = document.getElementById('activeTags');
    container.innerHTML = '';
    ['countries', 'categories', 'genders'].forEach(type => {
        activeFilters[type].forEach(val => {
            container.innerHTML += `<span class="tag">${val} <i class="fas fa-times" onclick="removeFilter('${type}', '${val}')"></i></span>`;
        });
    });
}

function removeFilter(type, val) {
    activeFilters[type] = activeFilters[type].filter(item => item !== val);
    document.querySelectorAll('.filter-cb').forEach(cb => {
        if (cb.dataset.type === type && cb.value === val) cb.checked = false;
    });
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
        const isLong = job.desc.length > 120;
        const isExpanded = expandedJobs[job.id] === true;
        
        // Визначаємо який текст показувати
        const textToDisplay = (isLong && !isExpanded) ? job.desc.substring(0, 120) + '...' : job.desc;

        list.innerHTML += `
            <div class="job-card">
                <div>
                    <h3>${job.title}</h3>
                    <div class="job-meta">
                        <p><i class="fas fa-map-marker-alt"></i> ${job.country}</p>
                        <p><i class="fas fa-tags"></i> ${job.category}</p>
                        ${job.gender ? `<p><i class="fas fa-user"></i> ${job.gender}</p>` : ''}
                    </div>
                    <div class="job-salary">${job.salary}</div>
                    
                    <div class="desc-wrapper">
                        <span class="desc-text">${textToDisplay}</span>
                        ${isLong ? `
                            <button class="read-more-btn" onclick="toggleJobDescription('${job.id}')">
                                ${isExpanded ? 'Згорнути <i class="fas fa-angle-up"></i>' : 'Розгорнути <i class="fas fa-angle-down"></i>'}
                            </button>
                        ` : ''}
                    </div>
                </div>

                <button class="btn-apply" onclick="openModal('${job.title}')">Відгукнутися</button>
            </div>
        `;
    });

    renderPagination();
}

// Нова 100% робоча функція перемикання опису
window.toggleJobDescription = function(id) {
    expandedJobs[id] = !expandedJobs[id];
    renderJobs(); // Перемальовуємо картки з новим станом тексту
};

function renderPagination() {
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    const pagDiv = document.getElementById('pagination');
    pagDiv.innerHTML = '';

    if (totalPages <= 1) return;

    // Стрілочка вліво
    pagDiv.innerHTML += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
    
    // Цифри сторінок
    for (let i = 1; i <= totalPages; i++) {
        pagDiv.innerHTML += `<button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
    
    // Стрілочка вправо
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

window.toggleAccordion = function(id) {
    document.getElementById(id).classList.toggle('open');
}

window.toggleSidebar = function() {
    document.getElementById('sidebar').classList.toggle('open');
}

function openModal(jobTitle) {
    document.getElementById('modalJobTitle').innerText = jobTitle;
    document.getElementById('jobModal').style.display = 'flex';
}
function closeModal() {
    document.getElementById('jobModal').style.display = 'none';
    document.getElementById('modalTgForm').reset();
}
window.onclick = function(event) { if (event.target == document.getElementById('jobModal')) closeModal(); }

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
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
