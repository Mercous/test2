// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Плавная прокрутка для якорных ссылок
    initSmoothScroll();
    
    // Анимация счетчиков статистики
    initCounters();
    
    // Инициализация эффекта наклона для карточек
    initTiltEffect();
    
    // Интерактивные эффекты для кнопок
    initButtonEffects();
    
    // Параллакс эффект для фона
    initParallax();
    
    // Анимация появления элементов при скролле
    initScrollAnimations();
});

// Плавная прокрутка
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const headerHeight = document.querySelector('.header').offsetHeight;
                
                window.scrollTo({
                    top: offsetTop - headerHeight,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Анимация счетчиков
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 2000; // 2 секунды
                const step = target / (duration / 16); // 60 FPS
                let current = 0;
                
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    counter.textContent = Math.floor(current).toLocaleString();
                }, 16);
                
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// Эффект наклона для карточек
function initTiltEffect() {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    
    tiltElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// Эффекты для кнопок
function initButtonEffects() {
    const buttons = document.querySelectorAll('.pixel-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Если это кнопка "Создать Вселенную"
            if (this.href && this.href.includes('universe-map.html')) {
                e.preventDefault();
                showCreationDialog();
                return;
            }
            
            // Если это кнопка "Нексус Битв"
            if (this.textContent.includes('Нексус Битв') || this.href && this.href.includes('#battle')) {
                e.preventDefault();
                showBattleComingSoonDialog();
                return;
            }
            
            // Если это кнопка "Компания"
            if (this.textContent.includes('Компания') || this.href && this.href.includes('#company')) {
                e.preventDefault();
                showCompanyDialog();
                return;
            }
            
            // Создаем эффект волны для других кнопок
            const wave = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            wave.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                left: ${x}px;
                top: ${y}px;
                transform: scale(0);
                animation: wave 0.6s linear;
                pointer-events: none;
            `;
            
            this.appendChild(wave);
            
            setTimeout(() => {
                wave.remove();
            }, 600);
        });
    });
    
    // Добавляем CSS для анимации волны
    const style = document.createElement('style');
    style.textContent = `
        @keyframes wave {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Функция показа диалога создания вселенной в стиле комикса
function showCreationDialog() {
    const dialogHTML = `
        <div class="dialog-overlay">
            <div class="comic-dialog">
                <div class="talking-planet"></div>
                <div class="speech-bubble">
                    <div class="dialog-text">
                        <span class="typing-text"></span>
                        <span class="cursor"></span>
                    </div>
                    <button class="dialog-continue" style="display: none;">ПРОДОЛЖИТЬ →</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', dialogHTML);
    
    const dialog = document.querySelector('.dialog-overlay');
    const typingText = document.querySelector('.typing-text');
    const continueBtn = document.querySelector('.dialog-continue');
    const planet = document.querySelector('.talking-planet');
    
    const messages = [
        "ПРИВЕТСТВУЮ, ДЕМИУРГ!",
        "Я - ПРОТОПЛАНЕТА ХРОНОСА.",
        "ОБНАРУЖЕНЫ ЧАСТИЦЫ ПЕРВОМАТЕРИИ...",
        "ФОРМИРУЮ ПРОСТРАНСТВЕННО-ВРЕМЕННОЙ КОНТИНУУМ...",
        "СИНТЕЗИРУЮ ЗАКОНЫ ФИЗИКИ...",
        "ВСЕЛЕННАЯ ГОТОВА К ПРОЯВЛЕНИЮ!"
    ];
    
    let messageIndex = 0;
    let charIndex = 0;
    let currentMessage = '';
    
    function typeWriter() {
        if (messageIndex < messages.length) {
            if (charIndex === 0) {
                currentMessage = messages[messageIndex];
                typingText.textContent = '';
                
                // Анимация "разговора" планеты
                planet.style.animation = 'planet-talk 0.5s ease-in-out';
                setTimeout(() => {
                    planet.style.animation = 'planet-talk 2s ease-in-out infinite';
                }, 500);
            }
            
            if (charIndex < currentMessage.length) {
                typingText.textContent += currentMessage.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 40); // Скорость печати
            } else {
                // Переход к следующему сообщению
                messageIndex++;
                charIndex = 0;
                
                if (messageIndex < messages.length) {
                    typingText.innerHTML += '<br><br>';
                    setTimeout(typeWriter, 800); // Пауза между сообщениями
                } else {
                    // Все сообщения напечатаны - ПОКАЗЫВАЕМ КНОПКУ
                    setTimeout(() => {
                        continueBtn.style.display = 'block';
                        continueBtn.style.opacity = '1';
                    }, 500);
                }
            }
        }
    }
    
    // Начинаем печатать текст
    setTimeout(typeWriter, 500);
    
    // Обработчик кнопки продолжения
    continueBtn.addEventListener('click', function() {
        // Создаем эффект сверхновой
        createSupernovaEffect();
        
        // Задержка перед переходом на карту
        setTimeout(() => {
            window.location.href = 'universe-map.html';
        }, 1500); // Время должно совпадать с длительностью анимации сверхновой
    });
    
    // Закрытие по клику на overlay
    dialog.addEventListener('click', function(e) {
        if (e.target === dialog) {
            continueBtn.click();
        }
    });
}

// Функция показа диалога "Скоро будет" для Нексус Битв
function showBattleComingSoonDialog() {
    const dialogHTML = `
        <div class="dialog-overlay">
            <div class="comic-dialog">
                <div class="talking-planet battle-planet"></div>
                <div class="speech-bubble">
                    <div class="dialog-text">
                        <span class="typing-text"></span>
                        <span class="cursor"></span>
                    </div>
                    <button class="dialog-continue" style="display: none;">ПОНЯТНО →</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', dialogHTML);
    
    const dialog = document.querySelector('.dialog-overlay');
    const typingText = document.querySelector('.typing-text');
    const continueBtn = document.querySelector('.dialog-continue');
    const planet = document.querySelector('.talking-planet');
    
    // Специальные стили для планеты Нексус Битв
    planet.style.background = 'radial-gradient(circle, #ff0000 0%, #8b0000 30%, #4b0082 70%)';
    planet.style.boxShadow = '0 0 30px #ff0000, 0 0 60px rgba(139, 0, 0, 0.4)';
    planet.style.border = '3px solid #ff6ec7';
    
    const messages = [
        "ВОИН ДЕМИУРГ!",
        "Я - СТРАЖ НЕКСУСА БИТВ.",
        "ПРОСТРАНСТВО БИТВ ЕЩЁ ФОРМИРУЕТСЯ...",
        "РЕАЛЬНОСТИ СТАБИЛИЗИРУЮТСЯ...",
        "СКОРО ТЫ СМОЖЕШЬ СРАЗИТЬСЯ",
        "С ДРУГИМИ ТВОРЦАМИ В ЭПИЧЕСКИХ БИТВАХ!",
        "ВОЗВРАЩАЙСЯ ПОЗЖЕ, КОГДА ВСЕЛЕННЫЕ СХЛЕСТНУТСЯ!"
    ];
    
    let messageIndex = 0;
    let charIndex = 0;
    let currentMessage = '';
    
    function typeWriter() {
        if (messageIndex < messages.length) {
            if (charIndex === 0) {
                currentMessage = messages[messageIndex];
                typingText.textContent = '';
                
                // Анимация "разговора" планеты
                planet.style.animation = 'planet-talk 0.5s ease-in-out';
                setTimeout(() => {
                    planet.style.animation = 'planet-talk 2s ease-in-out infinite';
                }, 500);
            }
            
            if (charIndex < currentMessage.length) {
                typingText.textContent += currentMessage.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 40);
            } else {
                // Переход к следующему сообщению
                messageIndex++;
                charIndex = 0;
                
                if (messageIndex < messages.length) {
                    typingText.innerHTML += '<br><br>';
                    setTimeout(typeWriter, 800);
                } else {
                    // Все сообщения напечатаны - показываем кнопку
                    setTimeout(() => {
                        continueBtn.style.display = 'block';
                        continueBtn.style.opacity = '1';
                    }, 500);
                }
            }
        }
    }
    
    // Начинаем печатать текст
    setTimeout(typeWriter, 500);
    
    // Обработчик кнопки продолжения
    continueBtn.addEventListener('click', function() {
        // Создаем эффект исчезновения для Нексус Битв
        createNexusDisappearEffect();
        
        // Задержка перед закрытием диалога
        setTimeout(() => {
            dialog.remove();
        }, 1000);
    });
    
    // Закрытие по клику на overlay
    dialog.addEventListener('click', function(e) {
        if (e.target === dialog) {
            continueBtn.click();
        }
    });
}

// Функция показа диалога для Компании
function showCompanyDialog() {
    const dialogHTML = `
        <div class="dialog-overlay">
            <div class="comic-dialog">
                <div class="silhouette-character"></div>
                <div class="speech-bubble">
                    <div class="dialog-text">
                        <span class="typing-text"></span>
                        <span class="cursor"></span>
                    </div>
                    <button class="dialog-continue" style="display: none;">РАСКРЫТЬ ИСТИНУ →</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', dialogHTML);
    
    const dialog = document.querySelector('.dialog-overlay');
    const typingText = document.querySelector('.typing-text');
    const continueBtn = document.querySelector('.dialog-continue');
    const silhouette = document.querySelector('.silhouette-character');
    
    const messages = [
        "ПРИВЕТСТВУЮ, ИЗБРАННЫЙ...",
        "Я - ХРАНИТЕЛЬ ИСТИНЫ.",
        "ТЫ ДУМАЕШЬ, ЧТО ПРОСТО СОЗДАЕШЬ ВСЕЛЕННЫЕ?",
        "НО ПРАВДА ГОРАЗДО ГЛУБЖЕ...",
        "ТВОЁ ПРИЗВАНИЕ НЕ СЛУЧАЙНО.",
        "ГОТОВ ЛИ ТЫ УЗНАТЬ, ЗАЧЕМ БЫЛ ПРИГЛАШЁН",
        "И КАКОВА ИМЕННО ТВОЯ ЗАДАЧА?"
    ];
    
    let messageIndex = 0;
    let charIndex = 0;
    let currentMessage = '';
    
    function typeWriter() {
        if (messageIndex < messages.length) {
            if (charIndex === 0) {
                currentMessage = messages[messageIndex];
                typingText.textContent = '';
                
                // Анимация "присутствия" силуэта
                silhouette.style.animation = 'silhouette-pulse 0.5s ease-in-out';
                setTimeout(() => {
                    silhouette.style.animation = 'silhouette-pulse 3s ease-in-out infinite';
                }, 500);
            }
            
            if (charIndex < currentMessage.length) {
                typingText.textContent += currentMessage.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 50); // Немного медленнее для драматизма
            } else {
                // Переход к следующему сообщению
                messageIndex++;
                charIndex = 0;
                
                if (messageIndex < messages.length) {
                    typingText.innerHTML += '<br><br>';
                    setTimeout(typeWriter, 1000); // Более длинная пауза
                } else {
                    // Все сообщения напечатаны - показываем кнопку
                    setTimeout(() => {
                        continueBtn.style.display = 'block';
                        continueBtn.style.opacity = '1';
                    }, 800);
                }
            }
        }
    }
    
    // Начинаем печатать текст
    setTimeout(typeWriter, 700);
    
    // Обработчик кнопки продолжения
    continueBtn.addEventListener('click', function() {
        // Создаем эффект таинственного исчезновения
        createMysteryEffect();
        
        // Задержка перед закрытием диалога
        setTimeout(() => {
            dialog.remove();
            window.location.href = 'company.html';
            showLoreReveal();
        }, 2000);
    });
    
    // Закрытие по клику на overlay
    dialog.addEventListener('click', function(e) {
        if (e.target === dialog) {
            continueBtn.click();
        }
    });
}

// Функция создания эффекта сверхновой
function createSupernovaEffect() {
    const supernova = document.createElement('div');
    supernova.className = 'supernova-effect';
    
    // Стили для эффекта сверхновой
    supernova.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 10px;
        height: 10px;
        background: radial-gradient(circle, #ffffff, #ffd700, #ff8c00, #ff4500);
        border-radius: 50%;
        z-index: 10001;
        pointer-events: none;
        animation: supernova-explosion 1.5s ease-out forwards;
    `;
    
    document.body.appendChild(supernova);
    
    // Добавляем CSS для анимации сверхновой
    if (!document.querySelector('#supernova-styles')) {
        const style = document.createElement('style');
        style.id = 'supernova-styles';
        style.textContent = `
            @keyframes supernova-explosion {
                0% {
                    width: 10px;
                    height: 10px;
                    opacity: 1;
                    box-shadow: 0 0 20px #ffd700;
                }
                20% {
                    width: 100px;
                    height: 100px;
                    opacity: 0.9;
                    box-shadow: 0 0 50px #ff8c00;
                }
                50% {
                    width: 500px;
                    height: 500px;
                    opacity: 0.8;
                    box-shadow: 0 0 100px #ff4500, 0 0 200px rgba(255, 69, 0, 0.5);
                }
                80% {
                    width: 2000px;
                    height: 2000px;
                    opacity: 0.6;
                    box-shadow: 0 0 200px #ff8c00, 0 0 400px rgba(255, 140, 0, 0.4);
                }
                100% {
                    width: 4000px;
                    height: 4000px;
                    opacity: 0;
                    box-shadow: 0 0 300px #ffd700, 0 0 600px rgba(255, 215, 0, 0.2);
                }
            }
            
            /* Эффект засветки всего экрана */
            .supernova-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.1);
                z-index: 10000;
                pointer-events: none;
                animation: screen-flash 1.5s ease-out forwards;
            }
            
            @keyframes screen-flash {
                0% { opacity: 0; }
                20% { opacity: 0.3; }
                50% { opacity: 0.7; background: rgba(255, 255, 255, 0.8); }
                80% { opacity: 0.4; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Создаем эффект засветки экрана
    const overlay = document.createElement('div');
    overlay.className = 'supernova-overlay';
    document.body.appendChild(overlay);
    
    // Удаляем элементы после завершения анимации
    setTimeout(() => {
        supernova.remove();
        overlay.remove();
    }, 1500);
}

// Функция создания эффекта исчезновения для Нексус Битв
function createNexusDisappearEffect() {
    const vortex = document.createElement('div');
    vortex.className = 'nexus-vortex-effect';
    
    // Стили для эффекта вихря
    vortex.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 10px;
        height: 10px;
        background: radial-gradient(circle, #ff0000, #8b0000, #4b0082);
        border-radius: 50%;
        z-index: 10001;
        pointer-events: none;
        animation: nexus-vortex 1s ease-in forwards;
    `;
    
    document.body.appendChild(vortex);
    
    // Добавляем CSS для анимации вихря
    if (!document.querySelector('#nexus-styles')) {
        const style = document.createElement('style');
        style.id = 'nexus-styles';
        style.textContent = `
            @keyframes nexus-vortex {
                0% {
                    width: 10px;
                    height: 10px;
                    opacity: 1;
                    box-shadow: 0 0 20px #ff0000;
                    border-radius: 50%;
                }
                30% {
                    width: 200px;
                    height: 200px;
                    opacity: 0.8;
                    box-shadow: 0 0 50px #8b0000;
                    border-radius: 40%;
                }
                60% {
                    width: 500px;
                    height: 500px;
                    opacity: 0.6;
                    box-shadow: 0 0 80px #4b0082;
                    border-radius: 30%;
                    transform: translate(-50%, -50%) rotate(180deg);
                }
                100% {
                    width: 1000px;
                    height: 1000px;
                    opacity: 0;
                    box-shadow: 0 0 100px #ff6ec7;
                    border-radius: 20%;
                    transform: translate(-50%, -50%) rotate(360deg);
                }
            }
            
            .nexus-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(75, 0, 130, 0.1);
                z-index: 10000;
                pointer-events: none;
                animation: nexus-flash 1s ease-out forwards;
            }
            
            @keyframes nexus-flash {
                0% { opacity: 0; }
                30% { opacity: 0.4; background: rgba(255, 0, 0, 0.2); }
                60% { opacity: 0.6; background: rgba(139, 0, 0, 0.3); }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Создаем эффект засветки экрана
    const overlay = document.createElement('div');
    overlay.className = 'nexus-overlay';
    document.body.appendChild(overlay);
    
    // Удаляем элементы после завершения анимации
    setTimeout(() => {
        vortex.remove();
        overlay.remove();
    }, 1000);
}

// Функция создания эффекта таинственного исчезновения
function createMysteryEffect() {
    const mystery = document.createElement('div');
    mystery.className = 'mystery-effect';
    
    // Стили для эффекта
    mystery.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 10px;
        height: 10px;
        background: radial-gradient(circle, #000000, #2a0a4a, #000000);
        border-radius: 50%;
        z-index: 10001;
        pointer-events: none;
        animation: mystery-vanish 2s ease-in forwards;
    `;
    
    document.body.appendChild(mystery);
    
    // Добавляем CSS для анимации
    if (!document.querySelector('#mystery-styles')) {
        const style = document.createElement('style');
        style.id = 'mystery-styles';
        style.textContent = `
            @keyframes mystery-vanish {
                0% {
                    width: 10px;
                    height: 10px;
                    opacity: 1;
                    box-shadow: 0 0 20px #000000;
                    border-radius: 50%;
                    filter: blur(0px);
                }
                30% {
                    width: 300px;
                    height: 300px;
                    opacity: 0.8;
                    box-shadow: 0 0 50px #2a0a4a, 0 0 100px rgba(42, 10, 74, 0.6);
                    border-radius: 40%;
                    filter: blur(2px);
                }
                60% {
                    width: 800px;
                    height: 800px;
                    opacity: 0.6;
                    box-shadow: 0 0 80px #4b0082, 0 0 160px rgba(75, 0, 130, 0.4);
                    border-radius: 30%;
                    filter: blur(5px);
                    transform: translate(-50%, -50%) rotate(180deg);
                }
                100% {
                    width: 2000px;
                    height: 2000px;
                    opacity: 0;
                    box-shadow: 0 0 100px #8a2be2, 0 0 200px rgba(138, 43, 226, 0.2);
                    border-radius: 20%;
                    filter: blur(10px);
                    transform: translate(-50%, -50%) rotate(360deg);
                }
            }
            
            .mystery-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.1);
                z-index: 10000;
                pointer-events: none;
                animation: mystery-flash 2s ease-out forwards;
            }
            
            @keyframes mystery-flash {
                0% { opacity: 0; background: rgba(0, 0, 0, 0); }
                30% { opacity: 0.6; background: rgba(42, 10, 74, 0.3); }
                60% { opacity: 0.8; background: rgba(75, 0, 130, 0.5); }
                100% { opacity: 0; background: rgba(0, 0, 0, 0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Создаем эффект засветки экрана
    const overlay = document.createElement('div');
    overlay.className = 'mystery-overlay';
    document.body.appendChild(overlay);
    
    // Удаляем элементы после завершения анимации
    setTimeout(() => {
        mystery.remove();
        overlay.remove();
    }, 2000);
}

// Функция раскрытия лора (можно развить дальше)
function showLoreReveal() {
    // Здесь можно добавить дополнительный диалог или переход на страницу с лором
    console.log("Раскрытие глубинного лора...");
    // window.location.href = 'lore.html'; // Раскомментировать если будет страница с лором
    
    // Временное сообщение для демонстрации
    const tempMessage = document.createElement('div');
    tempMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: var(--neon-blue);
        padding: 2rem;
        border: 2px solid var(--accent);
        z-index: 10002;
        font-family: 'Press Start 2P', cursive;
        text-align: center;
        max-width: 500px;
        box-shadow: 0 0 30px rgba(138, 43, 226, 0.5);
    `;
    tempMessage.innerHTML = `
        <h3 style="color: var(--accent); margin-bottom: 1rem;">ИСТИНА ОТКРЫТА</h3>
        <p style="font-size: 0.7rem; line-height: 1.6;">
            Ты был избран для участия в Великом Эксперименте.<br><br>
            Твоя задача - не просто создавать вселенные, а стать хранителем баланса мультивселенной...
        </p>
        <button onclick="this.parentElement.remove()" style="
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            margin-top: 1rem;
            font-family: 'Press Start 2P', cursive;
            cursor: pointer;
        ">ПОНЯТНО</button>
    `;
    
    document.body.appendChild(tempMessage);
}

// Параллакс эффект
function initParallax() {
    const stars = document.querySelector('.stars');
    const twinkling = document.querySelector('.twinkling');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        stars.style.transform = `translateY(${rate}px)`;
        twinkling.style.transform = `translateY(${rate * 0.7}px)`;
    });
}

// Анимация появления элементов при скролле
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.info-card, .mechanic-card, .info-block');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Дополнительные интерактивные эффекты
document.addEventListener('mousemove', (e) => {
    const galaxy = document.querySelector('.galaxy');
    if (!galaxy) return;
    
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    
    galaxy.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${x + y}deg)`;
});

// Эффект печатной машинки для заголовка (опционально)
function typeWriterEffect() {
    const title = document.querySelector('.hero-title');
    if (!title) return;
    
    const text = title.textContent;
    title.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            title.textContent += text.charAt(i);
            i++;
            setTimeout(type, 100);
        }
    }
    
    // Запускаем только когда секция видима
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            type();
            observer.unobserve(title);
        }
    });
    
    observer.observe(title);
}

// Запускаем эффект печатной машинки
typeWriterEffect();