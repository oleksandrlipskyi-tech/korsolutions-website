// Посилання на твою хмарну базу даних
const databaseUrl = 'https://korsolutions-jobs-default-rtdb.europe-west1.firebasedatabase.app/jobs.json';

// Твої дані для Telegram
const botToken = '8018570948:AAEP421r9xEg7R587HYdkCGJTwiV-s6zkl0';
const chatId = '5426420290';

let jobs = []; 

// Функція завантаження даних з бази Firebase
function loadJobsFromDatabase() {
    const list = document.getElementById('jobList');
    list.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;"><i class="fas fa-spinner fa-spin"></i> Завантаження актуальних вакансій...</div>';

    fetch(databaseUrl)
    .then(response => response.json())
    .then(data => {
        if (data) {
            jobs = Object.values(data);
        } else {
            jobs = [];
        }
        renderJobs(); 
    })
    .catch(error => {
        list.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;">Не вдалося завантажити вакансії. Перевірте з\'єднання.</div>';
    });
}

// Функція виведення вакансій на екран
function renderJobs() {
    const country = document.getElementById('countryFilter').value;
    const category = document.getElementById('categoryFilter').value;
    const list = document.getElementById('jobList');
    list.innerHTML = '';

    const filteredJobs = jobs.filter(job => 
        (country === "Всі" || job.country === country) && 
        (category === "Всі" || job.category === category)
    );

    filteredJobs.forEach(job => {
        list.innerHTML += `
            <div class="job-card">
                <div>
                    <h3>${job.title}</h3>
                    <div class="job-meta">
                        <p><i class="fas fa-map-marker-alt"></i> <strong>Країна:</strong> ${job.country}</p>
                        <p><i class="fas fa-tags"></i> <strong>Сфера:</strong> ${job.category}</p>
                    </div>
                    <div class="job-salary">${job.salary}</div>
                    <p class="job-desc">${job.desc}</p>
                </div>
                <button class="btn-apply" onclick="openModal('${job.title}')">Відгукнутися <i class="fas fa-chevron-right"></i></button>
            </div>
        `;
    });

    if(filteredJobs.length === 0) {
        list.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">За вказаними фільтрами вакансій не знайдено.</div>';
    }
}

loadJobsFromDatabase();

function openModal(jobTitle) {
    document.getElementById('modalJobTitle').innerText = jobTitle;
    document.getElementById('jobModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('jobModal').style.display = 'none';
    document.getElementById('modalTgForm').reset();
}

window.onclick = function(event) {
    const modal = document.getElementById('jobModal');
    if (event.target == modal) closeModal();
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 4000);
}

// Відправка форми в Telegram (Загальна анкета)
document.getElementById('tgForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const interest = document.getElementById('interest').value;
    const message = `🚨 <b>ЗАГАЛЬНА АНКЕТА (ПІДБІР)</b> 🚨\n\n👤 <b>Ім'я:</b> ${name}\n📞 <b>Телефон:</b> ${phone}\n💼 <b>Що цікавить:</b> ${interest}`;
    sendTelegram(message, this);
});

// Відправка форми в Telegram (Конкретна вакансія)
document.getElementById('modalTgForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('modalName').value;
    const phone = document.getElementById('modalPhone').value;
    const jobTitle = document.getElementById('modalJobTitle').innerText;
    const message = `🔥 <b>ВІДГУК НА ВАКАНСІЮ</b> 🔥\n\n🎯 <b>Вакансія:</b> ${jobTitle}\n👤 <b>Ім'я:</b> ${name}\n📞 <b>Телефон:</b> ${phone}`;
    sendTelegram(message, this, true);
});

function sendTelegram(text, formElement, isModal = false) {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' })
    })
    .then(response => {
        if(response.ok) {
            showToast();
            formElement.reset();
            if(isModal) closeModal();
        } else {
            alert('Помилка відправки в Телеграм.');
        }
    })
    .catch(error => alert('Помилка мережі.'));
}
