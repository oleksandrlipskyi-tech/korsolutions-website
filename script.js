// База вакансій (Сюди ти додаватимеш коди нових вакансій з Адмінки!)
const jobs = [
    { title: "Працівник складу Amazon", country: "Німеччина", category: "Склади", salary: "від 1800€/міс", desc: "Пакування замовлень, робота зі сканером. Житло надається безкоштовно біля підприємства." },
    { title: "Монтажник металоконструкцій", country: "Польща", category: "Будівництво", salary: "від 7000 PLN/міс", desc: "Досвід роботи від 1 року обов'язковий. Робочий одяг та інструменти видаємо." },
    { title: "Оператор навантажувача (Карщик)", country: "Німеччина", category: "Склади", salary: "від 2200€/міс", desc: "Потрібні права категорії UDT або європейський сертифікат. Знання німецької мови буде плюсом." }
];

// Твої конфіденційні дані для Telegram
const botToken = '8018570948:AAEP421r9xEg7R587HYdkCGJTwiV-s6zkl0';
const chatId = '5426420290';

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
        list.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">За вказаними фільтрами вакансій не знайдено. Спробуйте змінити параметри.</div>';
    }
}

// Запускаємо відображення при завантаженні сторінки
renderJobs();

// Керування модальним вікном (спливаюча форма)
function openModal(jobTitle) {
    document.getElementById('modalJobTitle').innerText = jobTitle;
    document.getElementById('jobModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('jobModal').style.display = 'none';
    document.getElementById('modalTgForm').reset();
}

// Закриття модалки при кліку на область навколо неї
window.onclick = function(event) {
    const modal = document.getElementById('jobModal');
    if (event.target == modal) {
        closeModal();
    }
}

// Красиве кастомне сповіщення (Toast)
function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Відправка форми в Telegram (Загальна анкета знизу сайту)
document.getElementById('tgForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const interest = document.getElementById('interest').value;
    
    const message = `🚨 <b>ЗАГАЛЬНА АНКЕТА (ПІДБІР)</b> 🚨\n\n👤 <b>Ім'я:</b> ${name}\n📞 <b>Телефон:</b> ${phone}\n💼 <b>Що цікавить:</b> ${interest}`;
    
    sendTelegram(message, this);
});

// Відправка форми в Telegram (Конкретна вакансія з модалки)
document.getElementById('modalTgForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('modalName').value;
    const phone = document.getElementById('modalPhone').value;
    const jobTitle = document.getElementById('modalJobTitle').innerText;
    
    const message = `🔥 <b>ВІДГУК НА ВАКАНСІЮ</b> 🔥\n\n🎯 <b>Вакансія:</b> ${jobTitle}\n👤 <b>Ім'я:</b> ${name}\n📞 <b>Телефон:</b> ${phone}`;
    
    sendTelegram(message, this, true);
});

// Універсальна функція для надсилання запиту в Telegram API
function sendTelegram(text, formElement, isModal = false) {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            chat_id: chatId, 
            text: text,
            parse_mode: 'HTML' // дозволяє робити жирний шрифт у повідомленні
        })
    })
    .then(response => {
        if(response.ok) {
            showToast(); // Показуємо гарне сповіщення
            formElement.reset(); // Очищаємо поля
            if(isModal) closeModal(); // Закриваємо модалку, якщо це була вона
        } else {
            alert('Сталася помилка відправки. Спробуйте ще раз або зв\'яжіться з нами напряму.');
        }
    })
    .catch(error => {
        alert('Помилка мережі. Перевірте з\'єднання з інтернетом.');
    });
}
