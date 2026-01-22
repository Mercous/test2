// universe-map.js - Обновленная версия с оптимизированным статичным фоном для мобильных устройств

// Отладочное логирование
const DEBUG = true;
const debugLog = (...args) => {
    if (DEBUG) {
        const timestamp = new Date().toLocaleTimeString();
        const message = `[${timestamp}] ${args.join(' ')}`;
        console.log(message);
        
        // Сохраняем в localStorage для отладки
        try {
            const logs = JSON.parse(localStorage.getItem('cosmogenesis_debug_logs') || '[]');
            logs.push(message);
            if (logs.length > 100) logs.shift();
            localStorage.setItem('cosmogenesis_debug_logs', JSON.stringify(logs));
        } catch (e) {}
    }
};

// Сохраняем оригинальный console.error для отладки
const originalConsoleError = console.error;
console.error = function(...args) {
    const timestamp = new Date().toLocaleTimeString();
    const message = `[${timestamp}] ERROR: ${args.join(' ')}`;
    debugLog(message);
    originalConsoleError.apply(console, args);
};

// Класс загрузчика данных
class DataLoader {
    constructor() {
        this.suns = [];
        this.planets = [];
        this.loaded = false;
        this.loadPromise = null;
    }

    async loadAllData() {
        // Если уже загружается, возвращаем существующий промис
        if (this.loadPromise) {
            debugLog('Данные уже загружаются, ожидаем...');
            return this.loadPromise;
        }

        debugLog('Начало загрузки данных...');
        this.loadPromise = this._loadAllDataInternal();
        return this.loadPromise;
    }

    async _loadAllDataInternal() {
        try {
            debugLog('Попытка загрузки SUNS_LIBRARY...');
            if (typeof SUNS_LIBRARY !== 'undefined') {
                this.suns = SUNS_LIBRARY;
                debugLog(`Загружено солнц: ${this.suns.length}`);
            } else {
                debugLog('SUNS_LIBRARY не определен, используем дефолтные данные');
                this.suns = this.getDefaultSuns();
            }

            debugLog('Попытка загрузки PLANETS_LIBRARY...');
            if (typeof PLANETS_LIBRARY !== 'undefined') {
                this.planets = PLANETS_LIBRARY;
                debugLog(`Загружено планет: ${this.planets.length}`);
            } else {
                debugLog('PLANETS_LIBRARY не определен, используем дефолтные данные');
                this.planets = this.getDefaultPlanets();
            }

            this.loaded = true;
            debugLog('✅ Все данные успешно загружены');
            
        } catch (error) {
            debugLog(`❌ Ошибка загрузки данных: ${error.message}`);
            this.suns = this.getDefaultSuns();
            this.planets = this.getDefaultPlanets();
            this.loaded = true;
        }
    }

    getAllSuns() {
        if (!this.loaded) {
            debugLog('⚠️ Данные еще не загружены');
        }
        return this.suns;
    }

    getAllPlanets() {
        if (!this.loaded) {
            debugLog('⚠️ Данные еще не загружены');
        }
        return this.planets;
    }

    getSunById(id) {
        return this.suns.find(sun => sun.id === id);
    }

    getPlanetById(id) {
        return this.planets.find(planet => planet.id === id);
    }

    addSun(sunData) {
        if (!sunData.id || !sunData.name) {
            return false;
        }
        
        if (this.suns.find(sun => sun.id === sunData.id)) {
            return false;
        }
        
        this.suns.push(sunData);
        
        if (typeof addNewSun === 'function') {
            addNewSun(sunData);
        }
        
        return true;
    }

    addPlanet(planetData) {
        if (!planetData.id || !planetData.name) {
            return false;
        }
        
        if (this.planets.find(planet => planet.id === planetData.id)) {
            return false;
        }
        
        this.planets.push(planetData);
        
        if (typeof addNewPlanet === 'function') {
            addNewPlanet(planetData);
        }
        
        return true;
    }

    isLoaded() {
        return this.loaded;
    }

    getDefaultSuns() {
        debugLog('Используем дефолтные данные солнц');
        return [
            {
                id: 'sun-basic',
                name: 'ЖЁЛТЫЙ КАРЛИК',
                type: 'basic',
                power: 100,
                color: '#ffd700',
                size: 180,
                description: 'Баланс стабильности и энергии. Идеальное солнце для начинающих систем.',
                bonuses: { stability: 10, energy: 5, balance: 8 },
                rarity: 'common',
                chronosIncome: 2.0
            },
            {
                id: 'sun-red-giant',
                name: 'КРАСНЫЙ ГИГАНТ',
                type: 'red-giant',
                power: 200,
                color: '#ff4500',
                size: 220,
                description: 'Мощная энергия, низкая стабильность. Для опытных космогенетиков.',
                bonuses: { stability: -5, energy: 20, balance: 3 },
                rarity: 'uncommon',
                chronosIncome: 3.5
            },
            {
                id: 'sun-blue-supergiant',
                name: 'СИНИЙ СВЕРХГИГАНТ',
                type: 'blue-supergiant',
                power: 350,
                color: '#1e90ff',
                size: 250,
                description: 'Экстремальная мощность и энергия. Требует осторожного обращения.',
                bonuses: { stability: -10, energy: 35, balance: -5 },
                rarity: 'rare',
                chronosIncome: 5.0
            }
        ];
    }

    getDefaultPlanets() {
        debugLog('Используем дефолтные данные планет');
        return [
            {
                id: 'planet-rocky',
                name: 'КАМЕНИСТАЯ ПЛАНЕТА',
                type: 'rocky',
                power: 25,
                color: '#8B4513',
                size: 35,
                description: 'Стабильная скалистая планета с твердой поверхностью. Отличный выбор для начинающих.',
                bonuses: { stability: 5, energy: 2, balance: 3 },
                rarity: 'common',
                chronosIncome: 0.5
            },
            {
                id: 'planet-gas',
                name: 'ГАЗОВЫЙ ГИГАНТ',
                type: 'gas',
                power: 40,
                color: '#87CEEB',
                size: 50,
                description: 'Массивная планета состоящая из газов. Обеспечивает высокую энергию системы.',
                bonuses: { stability: 2, energy: 8, balance: 4 },
                rarity: 'common',
                chronosIncome: 0.8
            },
            {
                id: 'planet-ice',
                name: 'ЛЕДЯНОЙ ГИГАНТ',
                type: 'ice',
                power: 35,
                color: '#F0F8FF',
                size: 45,
                description: 'Холодная планета с ледяной поверхностью. Повышает стабильность системы.',
                bonuses: { stability: 8, energy: 1, balance: 5 },
                rarity: 'uncommon',
                chronosIncome: 0.6
            },
            {
                id: 'planet-lava',
                name: 'ЛАВОВАЯ ПЛАНЕТА',
                type: 'lava',
                power: 45,
                color: '#FF4500',
                size: 40,
                description: 'Раскаленная планета с вулканической активностью. Источник огромной энергии.',
                bonuses: { stability: -3, energy: 12, balance: 2 },
                rarity: 'uncommon',
                chronosIncome: 1.2
            }
        ];
    }
}

// Основной класс карты вселенной
class UniverseMap {
    constructor() {
        this.currentZoom = 1;
        this.currentSelection = null;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.mapPosition = { x: 0, y: 0 };
        this.animationFrame = null;
        this.rotationAngles = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        this.animationId = null;
        
        this.keys = {};
        this.keyboardMoveSpeed = 15;
        this.keyboardMoveInterval = null;
        
        this.incomeInterval = null;
        this.lastIncomeTime = Date.now();
        this.incomeRate = 0;
        this.accumulatedTime = 0;
        this.totalEarned = 0;
        
        // Определение типа устройства
        this.isMobile = this.detectMobile();
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.performanceLevel = this.detectPerformanceLevel();
        
        this.universeState = {
            sun: null,
            planets: {},
            totalPower: 0,
            bonuses: {
                stability: 0,
                energy: 0,
                balance: 0
            },
            income: {
                baseRate: 1.0,
                sunMultiplier: 0,
                planetMultiplier: 0,
                bonusMultiplier: 1.0,
                totalPerMinute: 0
            },
            lastSaveTime: Date.now()
        };
        
        this.dataLoader = new DataLoader();
        this.dataManager = window.gameDataManager;
        
        // Состояние инициализации
        this.isInitialized = false;
        this.isInitializing = false;
        
        debugLog(`📱 Мобильное устройство: ${this.isMobile}, Touch: ${this.isTouchDevice}, Производительность: ${this.performanceLevel}`);
        debugLog('🚀 UniverseMap создан');
        
        // Автоматическая оптимизация для мобильных устройств
        this.optimizeForMobile();
    }
    
    getOrbitRadii() {
        const width = window.innerWidth;
        
        if (width <= 360) {
            return { 1: 90, 2: 140, 3: 190, 4: 240, 5: 290 };
        } else if (width <= 480) {
            return { 1: 110, 2: 175, 3: 240, 4: 305, 5: 370 };
        } else if (width <= 768) {
            return { 1: 140, 2: 225, 3: 310, 4: 395, 5: 480 };
        } else {
            return { 1: 200, 2: 350, 3: 500, 4: 650, 5: 800 };
        }
    }
    
    detectMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    }
    
    detectPerformanceLevel() {
        if (this.isMobile) {
            // Проверяем доступную память (приблизительно)
            const memory = navigator.deviceMemory || 4;
            const cores = navigator.hardwareConcurrency || 2;
            
            // Проверяем частоту кадров
            let fps = 60;
            
            // Определяем уровень производительности
            if (memory < 2 || cores < 2 || window.innerWidth <= 360) {
                return 'low';
            } else if (memory < 4 || cores < 4 || window.innerWidth <= 480) {
                return 'medium';
            } else {
                return 'high';
            }
        }
        return 'high';
    }
    
    optimizeForMobile() {
        if (!this.isMobile) return;
        
        debugLog('📱 Оптимизация для мобильных устройств...');
        
        // Добавляем класс производительности
        document.body.classList.add(`performance-${this.performanceLevel}`);
        
        // Отключаем анимации фона на мобильных устройствах
        this.disableBackgroundAnimations();
        
        // Оптимизация для низкопроизводительных устройств
        if (this.performanceLevel === 'low') {
            this.optimizeForLowPerformance();
        }
        
        debugLog(`⚡ Уровень оптимизации: ${this.performanceLevel}`);
    }
    
    disableBackgroundAnimations() {
        debugLog('🌀 Отключение анимаций фона для мобильных устройств');
        
        const backgroundElements = [
            '.twinkling',
            '.nebula-background', 
            '.bright-stars'
        ];
        
        backgroundElements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.animation = 'none';
                element.style.animationPlayState = 'paused';
            }
        });
        
        // Замедляем анимации орбит
        const orbits = document.querySelectorAll('.orbit-ring');
        orbits.forEach(orbit => {
            orbit.style.animationDuration = '300s';
        });
    }
    
    optimizeForLowPerformance() {
        debugLog('⚡ Дополнительная оптимизация для слабых устройств');
        
        // Убираем сложные фоны
        document.querySelectorAll('.twinkling, .nebula-background').forEach(el => {
            el.style.opacity = '0.2';
        });
        
        // Упрощаем звезды
        const stars = document.querySelector('.stars');
        if (stars) {
            stars.style.background = '#050a19';
        }
        
        // Отключаем свечение солнца
        const sun = document.querySelector('.current-sun');
        if (sun) {
            const glow = sun.querySelector('::before');
            if (glow) {
                glow.style.display = 'none';
            }
        }
        
        // Отключаем анимации планет
        document.querySelectorAll('.planet-visual').forEach(planet => {
            planet.style.animation = 'none';
        });
    }
    
    async init() {
        if (this.isInitializing) {
            debugLog('⚠️ Инициализация уже запущена');
            return;
        }
        
        this.isInitializing = true;
        debugLog('🚀 Начало инициализации UniverseMap...');
        
        this.showLoadingMessage('🚀 ЗАГРУЗКА ДАННЫХ ВСЕЛЕННОЙ...');
        
        // Таймаут для инициализации
        const initTimeout = setTimeout(() => {
            if (!this.isInitialized) {
                debugLog('⏰ ТАЙМАУТ: Инициализация заняла слишком много времени');
                this.showTimeoutError();
            }
        }, 15000); // 15 секунд таймаут
        
        try {
            debugLog('📥 Загрузка данных...');
            await this.dataLoader.loadAllData();
            debugLog('✅ Данные загружены');
            
            debugLog('🎯 Создание слотов орбит...');
            this.createOrbitSlots();
            
            debugLog('🎮 Настройка событий...');
            this.bindEvents();
            
            debugLog('💾 Загрузка состояния вселенной...');
            this.loadUniverseState();
            
            debugLog('📊 Обновление информации системы...');
            this.updateSystemInfo();
            
            debugLog('⚙️ Обновление состояния слотов...');
            this.updateSlotStates();
            
            debugLog('🔄 Обновление трансформации карты...');
            this.updateMapTransform();
            
            debugLog('🌀 Запуск анимации орбит...');
            this.startOrbitAnimation();
            
            debugLog('💰 Запуск системы дохода...');
            this.startIncomeSystem();
            
            this.hideLoadingMessage();
            debugLog('✅ Инициализация завершена успешно');
            
            this.isInitialized = true;
            this.showMessage('🌟 ВСЕЛЕННАЯ ГОТОВА!');
            
            this.checkInventoryForNewCards();
            
            clearTimeout(initTimeout);
            
        } catch (error) {
            debugLog(`💥 КРИТИЧЕСКАЯ ОШИБКА ИНИЦИАЛИЗАЦИИ: ${error.message}`);
            console.error('Stack trace:', error.stack);
            
            clearTimeout(initTimeout);
            this.showErrorPage(error);
        } finally {
            this.isInitializing = false;
        }
    }
    
    showTimeoutError() {
        const loading = document.getElementById('loading-message');
        if (loading) {
            loading.innerHTML = `
                <div style="text-align: center; color: #ffaa00;">
                    <div style="font-size: 1.5rem; margin-bottom: 1rem;">⏰ ДОЛГАЯ ЗАГРУЗКА</div>
                    <div style="font-size: 0.8rem; margin-bottom: 1rem;">
                        Загрузка занимает больше времени чем обычно.<br>
                        Попробуйте обновить страницу.
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button onclick="window.location.reload()" style="
                            background: #ffaa00;
                            color: black;
                            border: none;
                            padding: 0.5rem 1rem;
                            font-size: 0.7rem;
                            cursor: pointer;
                            font-family: 'Press Start 2P', cursive;
                            min-width: 120px;
                        ">🔄 ОБНОВИТЬ</button>
                        <button onclick="localStorage.clear(); window.location.reload()" style="
                            background: #ff4444;
                            color: white;
                            border: none;
                            padding: 0.5rem 1rem;
                            font-size: 0.7rem;
                            cursor: pointer;
                            font-family: 'Press Start 2P', cursive;
                            min-width: 120px;
                        ">🗑️ ОЧИСТИТЬ ДАННЫЕ</button>
                        <button onclick="window.location.href='index.html'" style="
                            background: #666;
                            color: white;
                            border: none;
                            padding: 0.5rem 1rem;
                            font-size: 0.7rem;
                            cursor: pointer;
                            font-family: 'Press Start 2P', cursive;
                            min-width: 120px;
                        ">🏠 НА ГЛАВНУЮ</button>
                    </div>
                </div>
            `;
        }
    }
    
    showErrorPage(error) {
        const loading = document.getElementById('loading-message');
        if (loading) {
            loading.innerHTML = `
                <div style="text-align: center; color: #ff4444;">
                    <div style="font-size: 1.5rem; margin-bottom: 1rem;">💥 ОШИБКА ЗАГРУЗКИ</div>
                    <div style="font-size: 0.8rem; margin-bottom: 1rem;">
                        Не удалось загрузить вселенную.<br>
                        <span style="font-size: 0.6rem; color: #aaa;">${error.message || 'Неизвестная ошибка'}</span>
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button onclick="window.location.reload()" style="
                            background: #ff4444;
                            color: white;
                            border: none;
                            padding: 0.5rem 1rem;
                            font-size: 0.7rem;
                            cursor: pointer;
                            font-family: 'Press Start 2P', cursive;
                            min-width: 120px;
                        ">🔄 ПЕРЕЗАГРУЗИТЬ</button>
                        <button onclick="this.disabled=true; localStorage.removeItem('cosmogenesis_universe'); window.location.reload()" style="
                            background: #ff8800;
                            color: white;
                            border: none;
                            padding: 0.5rem 1rem;
                            font-size: 0.7rem;
                            cursor: pointer;
                            font-family: 'Press Start 2P', cursive;
                            min-width: 120px;
                        ">🗑️ СБРОСИТЬ ВСЕЛЕННУЮ</button>
                        <button onclick="window.location.href='index.html'" style="
                            background: #666;
                            color: white;
                            border: none;
                            padding: 0.5rem 1rem;
                            font-size: 0.7rem;
                            cursor: pointer;
                            font-family: 'Press Start 2P', cursive;
                            min-width: 120px;
                        ">🏠 НА ГЛАВНУЮ</button>
                    </div>
                    <div style="margin-top: 1rem; font-size: 0.5rem; color: #888;">
                        Если проблема повторяется, попробуйте очистить кэш браузера.
                    </div>
                </div>
            `;
        }
    }
    
    startIncomeSystem() {
        if (this.incomeInterval) {
            clearInterval(this.incomeInterval);
        }
        
        // Для мобильных устройств используем более редкие обновления
        const interval = this.isMobile ? 3000 : 1000;
        debugLog(`💰 Запуск системы дохода с интервалом ${interval}мс`);
        
        this.incomeInterval = setInterval(() => {
            this.calculateIncome();
            this.processIncome();
            this.updateIncomeDisplay();
        }, interval);
    }
    
    calculateIncome() {
        let baseIncome = this.universeState.income.baseRate;
        let sunIncome = 0;
        let planetIncome = 0;
        let bonusMultiplier = 1.0;
        
        if (this.universeState.sun) {
            sunIncome = this.universeState.sun.chronosIncome || (this.universeState.sun.power * 0.02);
        }
        
        Object.values(this.universeState.planets).forEach(planet => {
            planetIncome += planet.chronosIncome || (planet.power * 0.01);
        });
        
        const stabilityBonus = Math.max(0, this.universeState.bonuses.stability) * 0.01;
        const energyBonus = Math.max(0, this.universeState.bonuses.energy) * 0.005;
        const balanceBonus = Math.max(0, this.universeState.bonuses.balance) * 0.015;
        
        bonusMultiplier += (stabilityBonus + energyBonus + balanceBonus);
        
        const totalPerMinute = (baseIncome + sunIncome + planetIncome) * bonusMultiplier;
        
        this.universeState.income = {
            baseRate: baseIncome,
            sunMultiplier: sunIncome,
            planetMultiplier: planetIncome,
            bonusMultiplier: bonusMultiplier,
            totalPerMinute: Math.round(totalPerMinute * 100) / 100
        };
        
        this.incomeRate = totalPerMinute;
    }
    
    processIncome() {
        const now = Date.now();
        const deltaTime = (now - this.lastIncomeTime) / 1000;
        this.lastIncomeTime = now;
        
        this.accumulatedTime += deltaTime;
        
        if (this.accumulatedTime >= 1) {
            const incomeThisSecond = (this.incomeRate / 60) * this.accumulatedTime;
            
            if (incomeThisSecond > 0 && this.dataManager) {
                const incomeToAdd = Math.round(incomeThisSecond * 100) / 100;
                
                if (incomeToAdd >= 0.01) {
                    const newBalance = this.dataManager.addChronos(incomeToAdd);
                    this.totalEarned += incomeToAdd;
                    
                    if (Math.floor(this.totalEarned) % 5 === 0 && incomeToAdd >= 1) {
                        this.showIncomeAnimation(Math.floor(incomeToAdd));
                    }
                }
            }
            
            this.accumulatedTime = 0;
        }
    }
    
    updateIncomeDisplay() {
        const chronosAmount = document.getElementById('chronos-amount');
        const chronosPerMinute = document.getElementById('chronos-per-minute');
        const chronosIncome = document.getElementById('chronos-income');
        const totalIncome = document.getElementById('total-income');
        
        if (chronosAmount && this.dataManager) {
            chronosAmount.textContent = Math.floor(this.dataManager.playerData.chronos);
        }
        
        if (chronosPerMinute) {
            chronosPerMinute.textContent = `+${this.incomeRate.toFixed(1)}/мин`;
            if (this.isMobile && window.innerWidth <= 480) {
                chronosPerMinute.style.display = 'none';
            }
        }
        
        if (chronosIncome) {
            chronosIncome.textContent = `${this.incomeRate.toFixed(1)}`;
        }
        
        if (totalIncome) {
            totalIncome.textContent = `${this.incomeRate.toFixed(1)}/мин`;
        }
    }
    
    showIncomeAnimation(amount) {
        const animation = document.createElement('div');
        animation.className = 'chronos-gain';
        animation.textContent = `+${amount} ⏳`;
        animation.style.cssText = `
            position: fixed;
            top: 70px;
            right: 200px;
            z-index: 3000;
            font-family: 'Press Start 2P', cursive;
            font-size: 0.7rem;
            color: #39ff14;
            text-shadow: 0 0 10px #39ff14;
            animation: floatUp 2s ease-out;
        `;
        
        document.body.appendChild(animation);
        
        setTimeout(() => {
            if (animation.parentNode) {
                animation.parentNode.removeChild(animation);
            }
        }, 2000);
    }
    
    stopIncomeSystem() {
        if (this.incomeInterval) {
            clearInterval(this.incomeInterval);
            this.incomeInterval = null;
            debugLog('💰 Система дохода остановлена');
        }
    }
    
    checkInventoryForNewCards() {
        if (this.dataManager && this.dataManager.playerData) {
            const inventory = this.dataManager.playerData.inventory || [];
            const newCards = inventory.filter(card => 
                !this.isCardPlaced(card)
            );
            
            if (newCards.length > 0) {
                this.showMessage(`🎴 У вас ${newCards.length} новых карт в инвентаре!`);
            }
        }
    }
    
    isCardPlaced(card) {
        if (card.cardType === 'sun') {
            return this.universeState.sun && this.universeState.sun.id === card.id;
        } else {
            return Object.values(this.universeState.planets).some(planet => 
                planet.inventoryId === card.inventoryId
            );
        }
    }
    
    showLoadingMessage(text) {
        const loading = document.getElementById('loading-message');
        if (loading) {
            loading.textContent = text;
            loading.style.display = 'flex';
            loading.style.alignItems = 'center';
            loading.style.justifyContent = 'center';
        }
    }
    
    hideLoadingMessage() {
        const loading = document.getElementById('loading-message');
        if (loading) {
            loading.style.display = 'none';
        }
    }
    
    createOrbitSlots() {
        debugLog('🪐 Создание слотов орбит...');
        const orbits = [1, 2, 3, 4, 5];
        const slotsPerOrbit = [4, 6, 8, 10, 12];
        const orbitRadii = this.getOrbitRadii();
        
        const orbitAngles = {
            1: [0, 90, 180, 270],
            2: [0, 60, 120, 180, 240, 300],
            3: [0, 45, 90, 135, 180, 225, 270, 315],
            4: [0, 36, 72, 108, 144, 180, 216, 252, 288, 324],
            5: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
        };
        
        const universeMap = document.getElementById('universe-map');
        if (!universeMap) {
            debugLog('❌ Элемент universe-map не найден');
            return;
        }
        
        const oldContainer = document.querySelector('.all-planet-slots');
        if (oldContainer) {
            oldContainer.remove();
        }
        
        const allSlotsContainer = document.createElement('div');
        allSlotsContainer.className = 'all-planet-slots';
        allSlotsContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 200;
        `;
        universeMap.appendChild(allSlotsContainer);
        
        orbits.forEach((orbit) => {
            const isUnlocked = this.dataManager ? this.dataManager.isOrbitUnlocked(orbit) : orbit <= 2;
            
            const slotsCount = slotsPerOrbit[orbit - 1];
            const angles = orbitAngles[orbit];
            const orbitRadius = orbitRadii[orbit];
            
            for (let i = 0; i < slotsCount; i++) {
                const slot = document.createElement('div');
                slot.className = 'planet-slot';
                slot.dataset.orbit = orbit;
                slot.dataset.slot = i + 1;
                slot.dataset.initialAngle = angles[i];
                
                const angle = angles[i] * (Math.PI / 180);
                const x = Math.cos(angle) * orbitRadius;
                const y = Math.sin(angle) * orbitRadius;
                
                slot.style.left = `calc(50% + ${x}px)`;
                slot.style.top = `calc(50% + ${y}px)`;
                slot.style.transform = 'translate(-50%, -50%)';
                slot.style.pointerEvents = 'auto';
                
                if (!isUnlocked) {
                    slot.classList.add('disabled');
                    slot.title = `Орбита ${orbit} не открыта. Посетите архив для выполнения задания.`;
                    
                    const lockIcon = document.createElement('div');
                    lockIcon.className = 'orbit-lock';
                    lockIcon.innerHTML = '🔒';
                    lockIcon.style.cssText = `
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 1.2rem;
                        z-index: 10;
                    `;
                    slot.appendChild(lockIcon);
                    
                    const overlay = document.createElement('div');
                    overlay.style.cssText = `
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(255, 0, 0, 0.3);
                        border-radius: 50%;
                        pointer-events: none;
                    `;
                    slot.appendChild(overlay);
                }
                
                const slotNumber = document.createElement('div');
                slotNumber.className = 'slot-number';
                slotNumber.textContent = i + 1;
                
                slot.appendChild(slotNumber);
                allSlotsContainer.appendChild(slot);
            }
        });
        
        debugLog(`✅ Создано слотов: ${orbits.reduce((sum, orbit) => sum + slotsPerOrbit[orbit-1], 0)}`);
    }
    
    startOrbitAnimation() {
        debugLog('🌀 Запуск анимации орбит...');
        const orbits = [1, 2, 3, 4, 5];
        const orbitSpeeds = this.isMobile ? 
            { 1: 0.02, 2: 0.015, 3: 0.01, 4: 0.005, 5: 0.002 } : 
            { 1: 0.2, 2: 0.15, 3: 0.1, 4: 0.05, 5: 0.02 };
        const orbitDirections = { 1: 1, 2: -1, 3: 1, 4: -1, 5: 1 };
        const orbitRadii = this.getOrbitRadii();
        
        const animate = () => {
            orbits.forEach(orbit => {
                this.rotationAngles[orbit] += orbitSpeeds[orbit] * orbitDirections[orbit];
                
                const slots = document.querySelectorAll(`.planet-slot[data-orbit="${orbit}"]`);
                const orbitRadius = orbitRadii[orbit];
                
                slots.forEach(slot => {
                    const initialAngle = parseFloat(slot.dataset.initialAngle);
                    const currentAngle = (initialAngle + this.rotationAngles[orbit]) * (Math.PI / 180);
                    const x = Math.cos(currentAngle) * orbitRadius;
                    const y = Math.sin(currentAngle) * orbitRadius;
                    
                    slot.style.left = `calc(50% + ${x}px)`;
                    slot.style.top = `calc(50% + ${y}px)`;
                    
                    const planetVisual = slot.querySelector('.planet-visual');
                    if (planetVisual) {
                        planetVisual.style.left = '50%';
                        planetVisual.style.top = '50%';
                    }
                });
            });
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
        debugLog('✅ Анимация орбит запущена');
    }
    
    stopOrbitAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            debugLog('🌀 Анимация орбит остановлена');
        }
    }
    
    bindEvents() {
        debugLog('🎮 Настройка обработчиков событий...');
        
        try {
            const zoomIn = document.getElementById('zoom-in');
            const zoomOut = document.getElementById('zoom-out');
            const resetView = document.getElementById('reset-view');
            
            if (zoomIn) {
                zoomIn.addEventListener('click', () => this.zoom(0.2));
                debugLog('➕ Кнопка увеличения настроена');
            }
            
            if (zoomOut) {
                zoomOut.addEventListener('click', () => this.zoom(-0.2));
                debugLog('➖ Кнопка уменьшения настроена');
            }
            
            if (resetView) {
                resetView.addEventListener('click', () => this.resetView());
                debugLog('🔄 Кнопка сброса вида настроена');
            }
            
            const centralArea = document.getElementById('central-area');
            if (centralArea) {
                centralArea.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showCompactSelectionModal('sun');
                });
                
                if (this.isTouchDevice) {
                    centralArea.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.showCompactSelectionModal('sun');
                    });
                }
                debugLog('🌞 Центральная область настроена');
            }
            
            const universeMap = document.getElementById('universe-map');
            if (universeMap) {
                universeMap.addEventListener('click', (e) => {
                    const planetSlot = e.target.closest('.planet-slot');
                    if (planetSlot) {
                        e.stopPropagation();
                        this.handlePlanetSlotClick(planetSlot);
                    }
                });
                
                if (this.isTouchDevice) {
                    universeMap.addEventListener('touchend', (e) => {
                        const planetSlot = e.target.closest('.planet-slot');
                        if (planetSlot) {
                            e.preventDefault();
                            e.stopPropagation();
                            this.handlePlanetSlotClick(planetSlot);
                        }
                    });
                }
                debugLog('🗺️ Карта вселенной настроена');
            }
            
            if (this.isTouchDevice) {
                this.setupTouchControls();
                debugLog('👆 Touch-контролы настроены');
            } else {
                this.setupMapDragging();
                this.setupMouseWheelZoom();
                this.setupKeyboardControls();
                debugLog('🖱️ Десктоп контролы настроены');
            }
            
            this.setupArchiveButton();
            
            window.addEventListener('beforeunload', () => {
                debugLog('📝 Сохранение состояния перед выходом...');
                this.saveUniverse();
                this.stopOrbitAnimation();
                this.stopIncomeSystem();
                this.stopKeyboardMovement();
            });
            
            const saveInterval = this.isMobile ? 60000 : 30000;
            setInterval(() => {
                this.saveUniverse();
            }, saveInterval);
            
            setInterval(() => {
                this.updateSystemInfo();
            }, 1000);
            
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    this.updateOrbitsForResize();
                }, 300);
            });
            
            window.addEventListener('resize', () => {
                this.debounce(() => {
                    this.updateOrbitsForResize();
                }, 250)();
            });
            
            // Оптимизация при изменении видимости
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.stopOrbitAnimation();
                    this.stopIncomeSystem();
                } else {
                    this.startOrbitAnimation();
                    this.startIncomeSystem();
                }
            });
            
            // Снижение качества при низком заряде батареи
            if (typeof navigator.getBattery === 'function') {
                navigator.getBattery().then(battery => {
                    battery.addEventListener('levelchange', () => {
                        if (battery.level < 0.2) {
                            this.enableBatterySaverMode();
                        }
                    });
                });
            }
            
            debugLog('✅ Все обработчики событий настроены');
            
        } catch (error) {
            debugLog(`❌ Ошибка настройки событий: ${error.message}`);
            throw error;
        }
    }
    
    enableBatterySaverMode() {
        debugLog('🔋 Включен режим энергосбережения');
        
        // Уменьшаем частоту обновления
        if (this.incomeInterval) {
            clearInterval(this.incomeInterval);
            this.incomeInterval = setInterval(() => {
                this.calculateIncome();
                this.processIncome();
                this.updateIncomeDisplay();
            }, 5000); // Раз в 5 секунд вместо 1-2
        }
        
        // Упрощаем анимации
        this.stopOrbitAnimation();
        
        // Уменьшаем качество фона
        document.querySelectorAll('.twinkling, .nebula-background').forEach(el => {
            el.style.opacity = '0.1';
        });
        
        // Отключаем сложные эффекты
        const sun = document.querySelector('.current-sun');
        if (sun) {
            sun.style.animation = 'none';
        }
        
        document.querySelectorAll('.planet-visual').forEach(planet => {
            planet.style.animation = 'none';
        });
    }
    
    updateOrbitsForResize() {
        debugLog('📐 Обновление орбит при изменении размера...');
        this.createOrbitSlots();
        this.updateSlotStates();
        this.stopOrbitAnimation();
        this.startOrbitAnimation();
        this.showMessage('🔄 Размер обновлен');
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    setupTouchControls() {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;
        
        let touchStartZoom = 1;
        let touchStartDistance = 0;
        let lastTouchX = 0;
        let lastTouchY = 0;
        let isPinching = false;
        let touchStartTime = 0;
        
        mapContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                isPinching = true;
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                touchStartDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                touchStartZoom = this.currentZoom;
                e.preventDefault();
            } else if (e.touches.length === 1) {
                touchStartTime = Date.now();
                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;
                mapContainer.classList.add('grabbing');
            }
        }, { passive: false });
        
        mapContainer.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && isPinching) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                
                if (touchStartDistance > 0) {
                    const zoomDelta = (currentDistance - touchStartDistance) * 0.005;
                    this.zoom(zoomDelta);
                    touchStartDistance = currentDistance;
                }
                e.preventDefault();
            } else if (e.touches.length === 1 && !isPinching) {
                const touch = e.touches[0];
                const deltaX = touch.clientX - lastTouchX;
                const deltaY = touch.clientY - lastTouchY;
                
                if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                    const zoomFactor = Math.max(0.5, this.currentZoom);
                    const adjustedMoveX = deltaX / zoomFactor;
                    const adjustedMoveY = deltaY / zoomFactor;
                    
                    this.mapPosition.x += adjustedMoveX;
                    this.mapPosition.y += adjustedMoveY;
                    this.updateMapTransform();
                    
                    lastTouchX = touch.clientX;
                    lastTouchY = touch.clientY;
                }
            }
        }, { passive: false });
        
        mapContainer.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - touchStartTime;
            
            if (touchDuration < 300 && !isPinching && e.changedTouches.length === 1) {
                const touch = e.changedTouches[0];
                const deltaX = Math.abs(touch.clientX - lastTouchX);
                const deltaY = Math.abs(touch.clientY - lastTouchY);
                
                if (deltaX < 10 && deltaY < 10) {
                    this.currentSelection = null;
                }
            }
            
            mapContainer.classList.remove('grabbing');
            touchStartDistance = 0;
            isPinching = false;
            touchStartTime = 0;
        });
        
        let lastTapTime = 0;
        mapContainer.addEventListener('touchend', (e) => {
            const currentTime = Date.now();
            const timeDiff = currentTime - lastTapTime;
            
            if (timeDiff < 300 && timeDiff > 0) {
                this.resetView();
                e.preventDefault();
            }
            
            lastTapTime = currentTime;
        });
    }
    
    setupKeyboardControls() {
        this.keyCodeMap = {
            87: 'w', 1066: 'w',
            65: 'a', 1060: 'a',
            83: 's', 1067: 's',
            68: 'd', 1042: 'd',
            38: 'up',
            40: 'down',
            37: 'left',
            39: 'right'
        };

        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            const movementKey = this.keyCodeMap[e.keyCode];
            
            if (movementKey) {
                e.preventDefault();
                this.keys[movementKey] = true;
                
                if (!this.keyboardMoveInterval) {
                    this.startKeyboardMovement();
                }
            }
            
            if (e.code === 'Space' || e.keyCode === 32) {
                e.preventDefault();
                this.resetView();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const movementKey = this.keyCodeMap[e.keyCode];
            
            if (movementKey) {
                this.keys[movementKey] = false;
                
                if (!this.isAnyMovementKeyPressed()) {
                    this.stopKeyboardMovement();
                }
            }
        });
        
        window.addEventListener('blur', () => {
            this.stopKeyboardMovement();
            this.keys = {};
        });
    }
    
    isAnyMovementKeyPressed() {
        return this.keys['w'] || this.keys['a'] || this.keys['s'] || this.keys['d'] ||
               this.keys['arrowup'] || this.keys['arrowleft'] || this.keys['arrowdown'] || this.keys['arrowright'];
    }
    
    startKeyboardMovement() {
        if (this.keyboardMoveInterval) return;
        
        this.keyboardMoveInterval = setInterval(() => {
            this.processKeyboardMovement();
        }, 16);
    }
    
    processKeyboardMovement() {
        let moveX = 0;
        let moveY = 0;
        
        if (this.keys['w'] || this.keys['arrowup']) moveY += this.keyboardMoveSpeed;
        if (this.keys['s'] || this.keys['arrowdown']) moveY -= this.keyboardMoveSpeed;
        if (this.keys['a'] || this.keys['arrowleft']) moveX += this.keyboardMoveSpeed;
        if (this.keys['d'] || this.keys['arrowright']) moveX -= this.keyboardMoveSpeed;
        
        if (moveX !== 0 || moveY !== 0) {
            const zoomFactor = Math.max(0.5, this.currentZoom);
            const adjustedMoveX = moveX / zoomFactor;
            const adjustedMoveY = moveY / zoomFactor;
            
            this.mapPosition.x += adjustedMoveX;
            this.mapPosition.y += adjustedMoveY;
            this.updateMapTransform();
        }
    }
    
    stopKeyboardMovement() {
        if (this.keyboardMoveInterval) {
            clearInterval(this.keyboardMoveInterval);
            this.keyboardMoveInterval = null;
        }
    }
    
    setupArchiveButton() {
        const headerRight = document.querySelector('.header-right');
        if (headerRight && !document.querySelector('.archive-link')) {
            const archiveLink = document.createElement('a');
            archiveLink.className = 'archive-link back-button';
            archiveLink.href = 'archive.html';
            archiveLink.innerHTML = '📦 АРХИВ';
            archiveLink.style.marginLeft = '10px';
            
            archiveLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveUniverse();
                window.location.href = 'archive.html';
            });
            
            if (this.isTouchDevice) {
                archiveLink.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.saveUniverse();
                    window.location.href = 'archive.html';
                });
            }
            
            headerRight.appendChild(archiveLink);
            debugLog('📦 Кнопка архива добавлена');
        }
    }
    
    setupMapDragging() {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;
        
        mapContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
        mapContainer.addEventListener('mousedown', (e) => {
            if (e.button === 2) {
                e.preventDefault();
                this.isDragging = true;
                this.dragStart = { 
                    x: e.clientX - this.mapPosition.x, 
                    y: e.clientY - this.mapPosition.y 
                };
                mapContainer.classList.add('grabbing');
                mapContainer.style.cursor = 'grabbing';
                
                this.stopKeyboardMovement();
            }
        });
        
        const handleMouseMove = (e) => {
            if (!this.isDragging) return;
            
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            
            this.animationFrame = requestAnimationFrame(() => {
                this.mapPosition.x = e.clientX - this.dragStart.x;
                this.mapPosition.y = e.clientY - this.dragStart.y;
                this.updateMapTransform();
            });
        };
        
        const handleMouseUp = (e) => {
            if (e.button === 2 && this.isDragging) {
                this.isDragging = false;
                mapContainer.classList.remove('grabbing');
                mapContainer.style.cursor = 'grab';
                
                if (this.animationFrame) {
                    cancelAnimationFrame(this.animationFrame);
                    this.animationFrame = null;
                }
            }
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    
    setupMouseWheelZoom() {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;
        
        mapContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.zoom(delta);
        }, { passive: false });
    }
    
    updateMapTransform() {
        const universeMap = document.getElementById('universe-map');
        if (universeMap) {
            universeMap.style.transform = 
                `translate(calc(-50% + ${this.mapPosition.x}px), calc(-50% + ${this.mapPosition.y}px)) scale(${this.currentZoom})`;
        }
    }
    
    handlePlanetSlotClick(planetSlot) {
        if (planetSlot.classList.contains('disabled')) {
            const orbit = planetSlot.dataset.orbit;
            this.showMessage(`🔒 Орбита ${orbit} не открыта! Посетите архив для выполнения задания.`);
            return;
        }
        
        const orbit = planetSlot.dataset.orbit;
        const slotNum = planetSlot.dataset.slot;
        
        if (planetSlot.classList.contains('occupied')) {
            if (this.isMobile) {
                if (confirm('Заменить планету?')) {
                    this.removePlanetFromSlot(planetSlot, orbit, slotNum);
                    this.showCompactSelectionModal('planet', orbit, slotNum);
                }
            } else {
                if (confirm('Заменить планету в этом слоте?')) {
                    this.removePlanetFromSlot(planetSlot, orbit, slotNum);
                    this.showCompactSelectionModal('planet', orbit, slotNum);
                }
            }
        } else {
            this.showCompactSelectionModal('planet', orbit, slotNum);
        }
    }
    
    removePlanetFromSlot(planetSlot, orbit, slotNum) {
        const planetKey = `${orbit}-${slotNum}`;
        delete this.universeState.planets[planetKey];
        planetSlot.classList.remove('occupied');
        const slotNumber = document.createElement('div');
        slotNumber.className = 'slot-number';
        slotNumber.textContent = slotNum;
        planetSlot.innerHTML = '';
        planetSlot.appendChild(slotNumber);
    }
    
    showCompactSelectionModal(type, orbit = null, slot = null) {
        debugLog(`📱 Открытие модального окна выбора: ${type}, орбита: ${orbit}, слот: ${slot}`);
        
        this.currentSelection = { type, orbit, slot };
        
        let compactModal = document.getElementById('compact-selection-modal');
        if (!compactModal) {
            compactModal = this.createCompactModal();
        }
        
        const modalTitle = document.getElementById('compact-modal-title');
        const tabsContainer = document.getElementById('compact-tabs');
        const cardsContainer = document.getElementById('compact-cards-container');
        
        if (!modalTitle || !tabsContainer || !cardsContainer) {
            debugLog('❌ Не найдены элементы модального окна');
            return;
        }

        const title = type === 'sun' ? '🌞 ВЫБОР СОЛНЦА' : `🪐 ОРБИТА ${orbit} - ВЫБОР ПЛАНЕТЫ`;
        modalTitle.textContent = title;
        
        this.createRarityTabs(tabsContainer, type);
        this.loadCompactCards(cardsContainer, type, 'все');
        
        compactModal.classList.add('active');
        
        if (this.isMobile) {
            document.body.style.overflow = 'hidden';
        }
        
        // ИСПРАВЛЕНИЕ ПРОКРУТКИ - ДОБАВЛЯЕМ КЛАСС ДЛЯ ПРОКРУТКИ
        setTimeout(() => {
            this.checkTabsScrollHint();
            
            // Добавляем класс для исправления прокрутки на мобильных
            if (cardsContainer && this.isMobile) {
                cardsContainer.classList.add('modal-touch-fix');
            }
        }, 100);
    }
    
    createCompactModal() {
        debugLog('🆕 Создание модального окна выбора');
        
        const modal = document.createElement('div');
        modal.id = 'compact-selection-modal';
        modal.className = 'compact-modal';
        
        modal.innerHTML = `
            <div class="compact-modal-content">
                <div class="compact-modal-header">
                    <h3 id="compact-modal-title">ВЫБОР ОБЪЕКТА</h3>
                    <button class="compact-close-btn" id="compact-modal-close">&times;</button>
                </div>
                
                <div class="compact-filters">
                    <div class="compact-search-container">
                        <input type="text" class="compact-search" id="compact-search" placeholder="ПОИСК ПО НАЗВАНИЮ...">
                        <div class="compact-search-icon">🔍</div>
                        <button class="compact-search-clear" id="compact-search-clear">✕</button>
                    </div>
                    <button class="compact-filter-btn active" data-filter="all">ВСЕ КАРТЫ</button>
                    <button class="compact-filter-btn" data-filter="inventory">МОЙ ИНВЕНТАРЬ</button>
                </div>
                
                <div class="compact-modal-body">
                    <div class="compact-tabs" id="compact-tabs">
                        <!-- Табы редкости будут созданы динамически -->
                    </div>
                    <div class="compact-cards-container" id="compact-cards-container">
                        <!-- Карты будут загружены динамически -->
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        this.bindCompactModalEvents(modal);
        
        return modal;
    }
    
    checkTabsScrollHint() {
        const tabsContainer = document.querySelector('.compact-tabs');
        if (!tabsContainer) return;
        
        const hasHorizontalScroll = tabsContainer.scrollWidth > tabsContainer.clientWidth;
        
        if (hasHorizontalScroll && !this.isMobile) {
            tabsContainer.classList.add('has-scroll');
        } else {
            tabsContainer.classList.remove('has-scroll');
        }
    }
    
    createRarityTabs(tabsContainer, type) {
        debugLog(`🎨 Создание табов редкости для: ${type}`);
        
        const rarityCategories = [
            { id: 'все', name: 'ВСЕ', icon: '🎴' },
            { id: 'common', name: 'ОБЫЧНЫЕ', icon: '⚪' },
            { id: 'uncommon', name: 'НЕОБЫЧНЫЕ', icon: '🟢' },
            { id: 'rare', name: 'РЕДКИЕ', icon: '🔵' },
            { id: 'epic', name: 'ЭПИЧЕСКИЕ', icon: '🟣' },
            { id: 'legendary', name: 'ЛЕГЕНДАРНЫЕ', icon: '🟡' }
        ];
        
        tabsContainer.innerHTML = '';
        
        rarityCategories.forEach((category, index) => {
            const tab = document.createElement('button');
            tab.className = `compact-tab ${index === 0 ? 'active' : ''}`;
            tab.innerHTML = `${category.icon} ${category.name}`;
            tab.dataset.rarity = category.id;
            
            if (this.isMobile) {
                tab.style.minHeight = '44px';
                tab.style.minWidth = '70px';
            }
            
            tab.addEventListener('click', () => {
                tabsContainer.querySelectorAll('.compact-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                this.loadCompactCards(
                    document.getElementById('compact-cards-container'),
                    type,
                    tab.dataset.rarity
                );
            });
            
            if (this.isTouchDevice) {
                tab.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    tabsContainer.querySelectorAll('.compact-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    this.loadCompactCards(
                        document.getElementById('compact-cards-container'),
                        type,
                        tab.dataset.rarity
                    );
                });
            }
            
            tabsContainer.appendChild(tab);
        });
    }
    
    loadCompactCards(container, type, rarityFilter) {
        debugLog(`🃏 Загрузка карт: ${type}, редкость: ${rarityFilter}`);
        
        const inventoryCards = this.getAvailableCardsFromInventory(type);
        const allCards = type === 'sun' ? this.dataLoader.getAllSuns() : this.dataLoader.getAllPlanets();
        
        let filteredCards = [];
        
        const activeFilter = document.querySelector('.compact-filter-btn.active')?.dataset.filter || 'all';
        
        if (activeFilter === 'inventory') {
            filteredCards = inventoryCards;
        } else {
            filteredCards = allCards;
        }
        
        if (rarityFilter !== 'все') {
            filteredCards = filteredCards.filter(card => card.rarity === rarityFilter);
        }
        
        const searchTerm = document.getElementById('compact-search')?.value.toLowerCase() || '';
        if (searchTerm) {
            filteredCards = filteredCards.filter(card => 
                card.name.toLowerCase().includes(searchTerm) ||
                (card.description && card.description.toLowerCase().includes(searchTerm)) ||
                (card.type && card.type.toLowerCase().includes(searchTerm))
            );
        }
        
        container.innerHTML = '';
        
        if (filteredCards.length === 0) {
            container.innerHTML = this.getCompactEmptyHTML(type, rarityFilter, activeFilter);
        } else {
            filteredCards.sort((a, b) => {
                const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
                const rarityDiff = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
                if (rarityDiff !== 0) return rarityDiff;
                return b.power - a.power;
            });
        
            if (this.isMobile && filteredCards.length > 20) {
                filteredCards = filteredCards.slice(0, 20);
            }
        
            const cardsWrapper = document.createElement('div');
            cardsWrapper.className = 'compact-cards-grid';
            
            if (this.isMobile && window.innerWidth <= 480) {
                cardsWrapper.className = 'compact-cards-list';
                cardsWrapper.style.display = 'flex';
                cardsWrapper.style.flexDirection = 'column';
                cardsWrapper.style.gap = '0.6rem';
            }
        
            filteredCards.forEach(card => {
                const isFromInventory = inventoryCards.some(invCard => invCard.id === card.id);
                const cardElement = this.createCompactCard(card, type, isFromInventory);
                cardsWrapper.appendChild(cardElement);
            });
        
            container.appendChild(cardsWrapper);
        }
    
        if (this.isMobile) {
            container.scrollTop = 0;
        }
        
        debugLog(`✅ Загружено карт: ${filteredCards.length}`);
    }
    
    createCompactCard(card, type, fromInventory = false) {
        const cardElement = document.createElement('div');
        cardElement.className = `compact-card ${fromInventory ? 'from-inventory' : ''} rarity-${card.rarity || 'common'}`;
        cardElement.dataset.id = card.id;
        
        if (fromInventory) {
            cardElement.dataset.inventoryId = card.inventoryId;
        }

        const previewClass = `compact-preview ${type} ${card.type}`;
        const chronosIncome = card.chronosIncome || (card.power * (type === 'sun' ? 0.02 : 0.01));
        
        const rarityClass = `compact-badge rarity ${card.rarity}`;
        const rarityText = this.getRarityText(card.rarity);
        const rarityColors = this.getRarityColors(card.rarity);
        
        cardElement.innerHTML = `
            <div class="${previewClass}" 
                 style="background: radial-gradient(circle, ${card.color}, ${this.darkenColor(card.color, 0.3)});
                        border: 2px solid ${rarityColors.border};">
            </div>
            
            <div class="compact-card-info">
                <div class="compact-card-header">
                    <h4 class="compact-card-name" title="${card.name}">${card.name}</h4>
                    <span class="compact-card-power">⚡ ${card.power}</span>
                </div>
                
                <div class="compact-badges">
                    ${fromInventory ? '<span class="compact-badge inventory">🎴 ИНВЕНТАРЬ</span>' : ''}
                    <span class="compact-badge income">⏳ +${chronosIncome.toFixed(1)}/МИН</span>
                    <span class="${rarityClass}" style="background: ${rarityColors.background}; color: ${rarityColors.text}; border: 1px solid ${rarityColors.border};">${rarityText}</span>
                </div>
                
                <div class="compact-stats">
                    <span class="compact-stat">🛡️ ${card.bonuses?.stability || 0}%</span>
                    <span class="compact-stat">⚡ ${card.bonuses?.energy || 0}%</span>
                    <span class="compact-stat">⚖️ ${card.bonuses?.balance || 0}%</span>
                </div>
            </div>
        `;

        cardElement.addEventListener('click', () => {
            this.handleCardSelection(card, type, fromInventory);
        });
        
        if (this.isTouchDevice) {
            cardElement.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleCardSelection(card, type, fromInventory);
            });
        }

        return cardElement;
    }
    
    handleCardSelection(card, type, fromInventory) {
        debugLog(`🎯 Выбор карты: ${card.name}, тип: ${type}, из инвентаря: ${fromInventory}`);
        
        if (fromInventory) {
            if (!this.dataManager) {
                this.showMessage('❌ Ошибка: менеджер данных не загружен');
                return;
            }
            
            if (typeof this.dataManager.useCardFromInventory !== 'function') {
                this.showMessage('❌ Ошибка: функция использования карты не найдена');
                return;
            }
            
            try {
                const usedCard = this.dataManager.useCardFromInventory(card.inventoryId);
                
                if (usedCard) {
                    const cardType = usedCard.cardType || type;
                    
                    if (cardType === 'sun') {
                        this.placeSun(usedCard);
                    } else {
                        this.placePlanet(usedCard, this.currentSelection.orbit, this.currentSelection.slot);
                    }
                    this.hideCompactSelectionModal();
                    
                    setTimeout(() => {
                        const activeTab = document.querySelector('.compact-tab.active');
                        if (activeTab) {
                            this.loadCompactCards(
                                document.getElementById('compact-cards-container'),
                                type,
                                activeTab.dataset.rarity
                            );
                        }
                    }, 100);
                    
                } else {
                    this.showMessage('❌ Ошибка использования карты! Карта не найдена в инвентаре.');
                    
                    setTimeout(() => {
                        const activeTab = document.querySelector('.compact-tab.active');
                        if (activeTab) {
                            this.loadCompactCards(
                                document.getElementById('compact-cards-container'),
                                type,
                                activeTab.dataset.rarity
                            );
                        }
                    }, 100);
                }
            } catch (error) {
                debugLog(`❌ Ошибка выбора карты: ${error.message}`);
                this.showMessage(`❌ Ошибка: ${error.message}`);
            }
        } else {
            this.showMessage(`ℹ️ Карта "${card.name}" не в инвентаре. Посетите архив для покупки.`);
        }
    }
    
    getRarityColors(rarity) {
        switch (rarity) {
            case 'common':
                return {
                    background: '#666666',
                    text: '#ffffff',
                    border: '#4d4d4d'
                };
            case 'uncommon':
                return {
                    background: '#2ecc71', 
                    text: '#ffffff',
                    border: '#27ae60'
                };
            case 'rare':
                return {
                    background: '#3498db',
                    text: '#ffffff', 
                    border: '#2980b9'
                };
            case 'epic':
                return {
                    background: '#9b59b6',
                    text: '#ffffff',
                    border: '#8e44ad'
                };
            case 'legendary':
                return {
                    background: '#f1c40f',
                    text: '#000000',
                    border: '#f39c12'
                };
            default:
                return {
                    background: '#666666',
                    text: '#ffffff',
                    border: '#4d4d4d'
                };
        }
    }
    
    getCompactEmptyHTML(type, rarityFilter, filter) {
        const cardType = type === 'sun' ? 'солнц' : 'планет';
        let message = '';
        
        if (filter === 'inventory') {
            message = `У вас нет ${cardType} в инвентаре для этой редкости.`;
        } else if (rarityFilter !== 'все') {
            const rarityText = this.getRarityText(rarityFilter);
            message = `Не найдено ${cardType} редкости "${rarityText}".`;
        } else {
            message = `Не найдено ${cardType} по вашему запросу.`;
        }
        
        return `
            <div class="compact-empty">
                <div class="compact-empty-icon">📭</div>
                <div class="compact-empty-title">НИЧЕГО НЕ НАЙДЕНО</div>
                <div class="compact-empty-desc">
                    ${message}<br>
                    Посетите архив чтобы приобрести новые карты.
                </div>
                <button class="compact-archive-btn" id="compact-go-to-archive">
                    🛒 ПЕРЕЙТИ В АРХИВ
                </button>
            </div>
        `;
    }

    bindCompactModalEvents(modal) {
        debugLog('🔗 Настройка событий модального окна');
        
        const closeBtn = modal.querySelector('#compact-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideCompactSelectionModal();
            });
            
            if (this.isTouchDevice) {
                closeBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.hideCompactSelectionModal();
                });
            }
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideCompactSelectionModal();
            }
        });
        
        if (this.isTouchDevice) {
            modal.addEventListener('touchend', (e) => {
                if (e.target === modal) {
                    e.preventDefault();
                    this.hideCompactSelectionModal();
                }
            });
        }
        
        const searchInput = modal.querySelector('#compact-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const activeTab = modal.querySelector('.compact-tab.active');
                const type = this.currentSelection.type;
                this.loadCompactCards(
                    modal.querySelector('#compact-cards-container'),
                    type,
                    activeTab?.dataset.rarity || 'все'
                );
            });
            
            if (this.isMobile) {
                searchInput.style.paddingRight = '30px';
                
                const clearBtn = document.createElement('button');
                clearBtn.innerHTML = '✕';
                clearBtn.style.cssText = `
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #999;
                    font-size: 1rem;
                    cursor: pointer;
                    padding: 5px;
                    display: none;
                `;
                
                searchInput.parentNode.style.position = 'relative';
                searchInput.parentNode.appendChild(clearBtn);
                
                searchInput.addEventListener('input', () => {
                    clearBtn.style.display = searchInput.value ? 'block' : 'none';
                });
                
                clearBtn.addEventListener('click', () => {
                    searchInput.value = '';
                    searchInput.focus();
                    clearBtn.style.display = 'none';
                    
                    const activeTab = modal.querySelector('.compact-tab.active');
                    const type = this.currentSelection.type;
                    this.loadCompactCards(
                        modal.querySelector('#compact-cards-container'),
                        type,
                        activeTab?.dataset.rarity || 'все'
                    );
                });
            }
        }
        
        const filterBtns = modal.querySelectorAll('.compact-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const activeTab = modal.querySelector('.compact-tab.active');
                const type = this.currentSelection.type;
                this.loadCompactCards(
                    modal.querySelector('#compact-cards-container'),
                    type,
                    activeTab?.dataset.rarity || 'все'
                );
            });
            
            if (this.isTouchDevice) {
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    const activeTab = modal.querySelector('.compact-tab.active');
                    const type = this.currentSelection.type;
                    this.loadCompactCards(
                        modal.querySelector('#compact-cards-container'),
                        type,
                        activeTab?.dataset.rarity || 'все'
                    );
                });
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.hideCompactSelectionModal();
            }
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'compact-go-to-archive' || e.target.closest('#compact-go-to-archive')) {
                this.hideCompactSelectionModal();
                setTimeout(() => {
                    window.location.href = 'archive.html';
                }, 300);
            }
        });
        
        window.addEventListener('resize', () => {
            this.debounce(() => {
                this.checkTabsScrollHint();
            }, 250)();
        });
    }

    hideCompactSelectionModal() {
        const modal = document.getElementById('compact-selection-modal');
        if (modal) {
            modal.classList.remove('active');
            
            // Убираем класс для прокрутки
            const cardsContainer = document.getElementById('compact-cards-container');
            if (cardsContainer) {
                cardsContainer.classList.remove('modal-touch-fix');
            }
        }
        this.currentSelection = null;
        
        if (this.isMobile) {
            document.body.style.overflow = '';
        }
        
        debugLog('📱 Модальное окно скрыто');
    }
    
    getAvailableCardsFromInventory(type) {
        if (!this.dataManager || !this.dataManager.playerData) {
            return [];
        }
        
        const inventory = this.dataManager.playerData.inventory || [];
        const availableCards = inventory.filter(card => {
            const isCorrectType = (type === 'sun' && card.cardType === 'sun') || 
                                 (type === 'planet' && card.cardType === 'planet');
            const isNotPlaced = !this.isCardPlaced(card);
            
            return isCorrectType && isNotPlaced;
        });
        
        return availableCards;
    }
    
    getRarityText(rarity) {
        switch (rarity) {
            case 'common': return 'ОБЫЧНАЯ';
            case 'uncommon': return 'НЕОБЫЧНАЯ';
            case 'rare': return 'РЕДКАЯ';
            case 'epic': return 'ЭПИЧЕСКАЯ';
            case 'legendary': return 'ЛЕГЕНДАРНАЯ';
            default: return '';
        }
    }
    
    placeSun(sunData) {
        debugLog(`🌞 Установка солнца: ${sunData.name}`);
        
        const currentSun = document.getElementById('current-sun');
        const centralArea = document.getElementById('central-area');
        const sunPlaceholder = document.getElementById('sun-placeholder');
        
        if (!currentSun || !centralArea || !sunPlaceholder) return;
        
        sunPlaceholder.style.display = 'none';
        currentSun.style.display = 'block';
        
        // ИСПРАВЛЕНИЕ РАСТЯГИВАНИЯ - ГАРАНТИРУЕМ КРУГЛУЮ ФОРМУ
        currentSun.style.cssText = `
            width: ${sunData.size}px;
            height: ${sunData.size}px;
            min-width: ${sunData.size}px;
            min-height: ${sunData.size}px;
            max-width: ${sunData.size}px;
            max-height: ${sunData.size}px;
            border-radius: 50%;
            background: radial-gradient(circle, ${sunData.color}, ${this.darkenColor(sunData.color, 0.3)});
            box-shadow: 0 0 50px ${sunData.color};
            aspect-ratio: 1 / 1;
            --size: ${sunData.size}px;
            position: relative;
            cursor: pointer;
            animation: pulse-sun 3s ease-in-out infinite alternate;
            transform-origin: center;
            transform: translateZ(0);
            will-change: transform;
            display: block;
        `;
        
        // Добавляем свечение обратно
        currentSun.innerHTML = `
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: ${sunData.size + 40}px;
                height: ${sunData.size + 40}px;
                background: radial-gradient(circle, rgba(255, 215, 0, 0.3), transparent 70%);
                border-radius: 50%;
            "></div>
            <div class="sun-info" style="
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.8);
                padding: 5px 10px;
                border-radius: 10px;
                font-size: 0.5rem;
                white-space: nowrap;
                border: 1px solid ${sunData.color};
            ">${sunData.name}</div>
        `;
        
        centralArea.classList.add('has-sun');
        centralArea.classList.remove('no-sun');
        
        this.universeState.sun = sunData;
        this.updateSystemInfo();
        this.updateSlotStates();
        this.showMessage(`🌞 Солнце "${sunData.name}" установлено! +${(sunData.chronosIncome || sunData.power * 0.02).toFixed(1)} Хроноса/мин`);
        this.saveUniverse();
    }
    
    placePlanet(planetData, orbit, slot) {
        debugLog(`🪐 Установка планеты: ${planetData.name} на орбиту ${orbit}, слот ${slot}`);
        
        const planetSlot = document.querySelector(`.planet-slot[data-orbit="${orbit}"][data-slot="${slot}"]`);
        if (!planetSlot) return;
        
        if (!this.universeState.sun) {
            if (this.isMobile) {
                if (!confirm('Установить без солнца?')) {
                    return;
                }
            } else {
                if (!confirm('⚠️ Вы еще не выбрали солнце! Хотите продолжить без солнца?')) {
                    return;
                }
            }
        }
        
        const planetVisual = document.createElement('div');
        planetVisual.className = `planet-visual ${planetData.type}`;
        
        // ИСПРАВЛЕНИЕ РАСТЯГИВАНИЯ - ГАРАНТИРУЕМ КРУГЛУЮ ФОРМУ
        planetVisual.style.cssText = `
            width: ${planetData.size}px;
            height: ${planetData.size}px;
            min-width: ${planetData.size}px;
            min-height: ${planetData.size}px;
            max-width: ${planetData.size}px;
            max-height: ${planetData.size}px;
            border-radius: 50%;
            background: radial-gradient(circle, ${planetData.color}, ${this.darkenColor(planetData.color, 0.3)});
            box-shadow: 0 0 20px ${planetData.color};
            aspect-ratio: 1 / 1;
            --size: ${planetData.size}px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: float-planet 4s ease-in-out infinite alternate;
            z-index: 160;
            will-change: transform;
        `;
        
        planetVisual.dataset.planetId = planetData.id;
        planetVisual.dataset.planetName = planetData.name;
        
        const planetInfo = document.createElement('div');
        planetInfo.className = 'planet-info';
        planetInfo.textContent = planetData.name;
        planetInfo.style.cssText = `
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            padding: 3px 8px;
            border-radius: 8px;
            font-size: 0.4rem;
            white-space: nowrap;
            border: 1px solid ${planetData.color};
        `;
        
        planetSlot.innerHTML = '';
        planetSlot.appendChild(planetVisual);
        planetSlot.appendChild(planetInfo);
        planetSlot.classList.add('occupied');
        
        const planetKey = `${orbit}-${slot}`;
        this.universeState.planets[planetKey] = {
            ...planetData,
            orbit: parseInt(orbit),
            slot: parseInt(slot)
        };
        
        this.updateSystemInfo();
        const planetIncome = planetData.chronosIncome || planetData.power * 0.01;
        this.showMessage(`🪐 Планета "${planetData.name}" размещена на орбите ${orbit}! +${planetIncome.toFixed(1)} Хроноса/мин`);
        this.saveUniverse();
    }
    
    updateSlotStates() {
        const slots = document.querySelectorAll('.planet-slot');
        const hasSun = this.universeState.sun !== null;
        
        slots.forEach(slot => {
            if (!hasSun && !slot.classList.contains('occupied') && !slot.classList.contains('disabled')) {
                slot.classList.add('no-sun-warning');
            } else {
                slot.classList.remove('no-sun-warning');
            }
        });
        
        const centralArea = document.getElementById('central-area');
        if (centralArea) {
            if (!hasSun) {
                centralArea.classList.add('no-sun');
                centralArea.classList.remove('has-sun');
            } else {
                centralArea.classList.remove('no-sun');
                centralArea.classList.add('has-sun');
            }
        }
    }
    
    updateSystemInfo() {
        let totalPower = 0;
        let planetsCount = 0;
        let activeOrbits = new Set();
        
        this.universeState.bonuses = { stability: 0, energy: 0, balance: 0 };
        
        if (this.universeState.sun) {
            totalPower += this.universeState.sun.power;
            Object.keys(this.universeState.bonuses).forEach(bonus => {
                this.universeState.bonuses[bonus] += this.universeState.sun.bonuses[bonus];
            });
        }
        
        Object.values(this.universeState.planets).forEach(planet => {
            totalPower += planet.power;
            planetsCount++;
            activeOrbits.add(planet.orbit);
            Object.keys(this.universeState.bonuses).forEach(bonus => {
                this.universeState.bonuses[bonus] += planet.bonuses[bonus];
            });
        });
        
        const totalBonuses = Object.values(this.universeState.bonuses).reduce((a, b) => a + b, 0);
        this.universeState.bonuses.balance = Math.round(totalBonuses / 3);
        
        this.universeState.totalPower = totalPower;
        
        this.calculateIncome();
        
        const systemPowerEl = document.getElementById('system-power');
        const planetsCountEl = document.getElementById('planets-count');
        const activeOrbitsEl = document.getElementById('active-orbits');
        const stabilityBonusEl = document.getElementById('stability-bonus');
        const energyBonusEl = document.getElementById('energy-bonus');
        const balanceBonusEl = document.getElementById('balance-bonus');
        
        if (systemPowerEl) systemPowerEl.textContent = totalPower;
        if (planetsCountEl) planetsCountEl.textContent = planetsCount;
        if (activeOrbitsEl) activeOrbitsEl.textContent = activeOrbits.size;
        if (stabilityBonusEl) stabilityBonusEl.textContent = this.formatBonus(this.universeState.bonuses.stability);
        if (energyBonusEl) energyBonusEl.textContent = this.formatBonus(this.universeState.bonuses.energy);
        if (balanceBonusEl) balanceBonusEl.textContent = this.formatBonus(this.universeState.bonuses.balance);
        
        if (this.dataManager) {
            this.dataManager.playerData.systemPower = totalPower;
            this.dataManager.playerData.planetsCount = planetsCount;
            this.dataManager.savePlayerData();
        }
    }
    
    formatBonus(value) {
        return value > 0 ? `+${value}%` : `${value}%`;
    }
    
    zoom(delta) {
        this.currentZoom = Math.max(0.3, Math.min(3, this.currentZoom + delta));
        this.updateMapTransform();
        const zoomLevelEl = document.getElementById('zoom-level');
        if (zoomLevelEl) {
            zoomLevelEl.textContent = `${Math.round(this.currentZoom * 100)}%`;
        }
    }
    
    resetView() {
        this.currentZoom = 1;
        this.mapPosition = { x: 0, y: 0 };
        this.updateMapTransform();
        const zoomLevelEl = document.getElementById('zoom-level');
        if (zoomLevelEl) {
            zoomLevelEl.textContent = '100%';
        }
        this.showMessage('🔄 Вид сброшен');
    }
    
    saveUniverse() {
        try {
            this.universeState.lastSaveTime = Date.now();
            localStorage.setItem('cosmogenesis_universe', JSON.stringify(this.universeState));
        } catch (error) {
            debugLog(`❌ Ошибка сохранения вселенной: ${error.message}`);
        }
    }
    
    loadUniverseState() {
        debugLog('💾 Начало загрузки состояния вселенной...');
        
        try {
            const saved = localStorage.getItem('cosmogenesis_universe');
            debugLog(saved ? '📄 Сохраненные данные найдены' : '📄 Сохраненные данные не найдены');
            
            if (saved) {
                const savedState = JSON.parse(saved);
                debugLog('📝 Парсинг JSON успешен');
                
                if (!savedState || typeof savedState !== 'object') {
                    throw new Error('Некорректная структура данных');
                }
                
                this.universeState = { ...this.universeState, ...savedState };
                
                debugLog(`🌞 Информация о солнце: ${this.universeState.sun ? 'есть' : 'нет'}`);
                debugLog(`🪐 Количество планет: ${Object.keys(this.universeState.planets || {}).length}`);
                
                if (this.universeState.sun && this.universeState.sun.id) {
                    debugLog(`🌞 Восстановление солнца: ${this.universeState.sun.name}`);
                    const sunData = this.dataLoader.getSunById(this.universeState.sun.id);
                    if (sunData) {
                        this.placeSun(sunData);
                    }
                }
                
                Object.values(this.universeState.planets).forEach(planet => {
                    if (planet && planet.id && planet.orbit && planet.slot) {
                        debugLog(`🪐 Восстановление планеты на орбите ${planet.orbit}, слот ${planet.slot}`);
                        const planetData = this.dataLoader.getPlanetById(planet.id);
                        if (planetData) {
                            this.placePlanet(planetData, planet.orbit, planet.slot);
                        }
                    }
                });
                
                debugLog('✅ Состояние вселенной загружено');
                this.showMessage('💫 Вселенная загружена!');
            } else {
                debugLog('📝 Сохраненное состояние не найдено, используется пустая вселенная');
            }
            
        } catch (error) {
            debugLog(`💥 Ошибка загрузки состояния вселенной: ${error.message}`);
            
            try {
                const backupKey = `cosmogenesis_universe_backup_${Date.now()}`;
                const saved = localStorage.getItem('cosmogenesis_universe');
                localStorage.setItem(backupKey, saved);
                debugLog(`💾 Создана резервная копия: ${backupKey}`);
            } catch (e) {}
            
            localStorage.removeItem('cosmogenesis_universe');
            this.universeState = {
                sun: null,
                planets: {},
                totalPower: 0,
                bonuses: { stability: 0, energy: 0, balance: 0 },
                income: {
                    baseRate: 1.0,
                    sunMultiplier: 0,
                    planetMultiplier: 0,
                    bonusMultiplier: 1.0,
                    totalPerMinute: 0
                },
                lastSaveTime: Date.now()
            };
            
            this.showMessage('⚠️ Поврежденные данные очищены, создана новая вселенная');
        }
    }
    
    showMessage(text) {
        const oldMessages = document.querySelectorAll('.universe-message');
        oldMessages.forEach(msg => msg.remove());
        
        const message = document.createElement('div');
        message.className = 'universe-message';
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 60px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: #39ff14;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: 'Press Start 2P', cursive;
            font-size: 0.7rem;
            z-index: 1000;
            text-align: center;
            border: 2px solid #39ff14;
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 1.7s;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 2000);
    }
    
    darkenColor(color, factor) {
        try {
            const hex = color.replace('#', '');
            if (hex.length !== 6) return color;
            
            const num = parseInt(hex, 16);
            const amt = Math.round(2.55 * factor * 100);
            const R = Math.max(0, (num >> 16) - amt);
            const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
            const B = Math.max(0, (num & 0x0000FF) - amt);
            
            return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
                (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
                (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
        } catch (error) {
            return color;
        }
    }
    
    clearUniverse() {
        const confirmMessage = this.isMobile ? 
            'Очистить всю вселенную?' : 
            '⚠️ Очистить всю вселенную? Это действие нельзя отменить.';
        
        if (confirm(confirmMessage)) {
            debugLog('🗑️ Очистка вселенной...');
            
            this.universeState = {
                sun: null,
                planets: {},
                totalPower: 0,
                bonuses: { stability: 0, energy: 0, balance: 0 },
                income: {
                    baseRate: 1.0,
                    sunMultiplier: 0,
                    planetMultiplier: 0,
                    bonusMultiplier: 1.0,
                    totalPerMinute: 0
                },
                lastSaveTime: Date.now()
            };
            
            const currentSun = document.getElementById('current-sun');
            const sunPlaceholder = document.getElementById('sun-placeholder');
            const centralArea = document.getElementById('central-area');
            
            if (currentSun) {
                currentSun.style.display = 'none';
                currentSun.innerHTML = '';
            }
            if (sunPlaceholder) sunPlaceholder.style.display = 'flex';
            if (centralArea) {
                centralArea.classList.remove('has-sun');
                centralArea.classList.add('no-sun');
            }
            
            document.querySelectorAll('.planet-slot.occupied').forEach(slot => {
                slot.classList.remove('occupied');
                const slotNumber = document.createElement('div');
                slotNumber.className = 'slot-number';
                slotNumber.textContent = slot.dataset.slot;
                slot.innerHTML = '';
                slot.appendChild(slotNumber);
            });
            
            this.updateSystemInfo();
            this.updateSlotStates();
            this.saveUniverse();
            this.showMessage('🗑️ Вселенная очищена!');
        }
    }
    
    getSystemStats() {
        return {
            power: this.universeState.totalPower,
            planets: Object.keys(this.universeState.planets).length,
            orbits: new Set(Object.values(this.universeState.planets).map(p => p.orbit)).size,
            bonuses: this.universeState.bonuses,
            income: this.incomeRate,
            totalEarned: this.totalEarned
        };
    }
    
    getIncomeDetails() {
        return {
            ...this.universeState.income,
            currentRate: this.incomeRate,
            totalEarned: this.totalEarned,
            efficiency: this.incomeRate / (1 + Object.keys(this.universeState.planets).length)
        };
    }
}

// Инициализация карты вселенной
let universeMap;

document.addEventListener('DOMContentLoaded', async () => {
    debugLog('📄 DOMContentLoaded - начало загрузки UniverseMap');
    
    // Функция отладки мобильных проблем
    const debugMobileIssues = () => {
        debugLog('🔍 Отладка мобильных проблем...');
        debugLog(`📱 User Agent: ${navigator.userAgent}`);
        debugLog(`🖥️ Screen size: ${window.innerWidth} x ${window.innerHeight}`);
        debugLog(`📍 Touch support: ${'ontouchstart' in window}`);
        debugLog(`💾 LocalStorage доступен: ${typeof localStorage !== 'undefined'}`);
        
        try {
            const testKey = 'cosmogenesis_test_' + Date.now();
            localStorage.setItem(testKey, 'test');
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            debugLog(`💾 LocalStorage работает: ${retrieved === 'test'}`);
        } catch (e) {
            debugLog(`💥 LocalStorage недоступен: ${e.message}`);
        }
        
        debugLog(`📚 SUNS_LIBRARY: ${typeof SUNS_LIBRARY}`);
        debugLog(`📚 PLANETS_LIBRARY: ${typeof PLANETS_LIBRARY}`);
        debugLog(`🎮 gameDataManager: ${typeof window.gameDataManager}`);
    };
    
    debugMobileIssues();
    
    const loading = document.getElementById('loading-message');
    if (loading) {
        loading.style.display = 'flex';
        loading.style.alignItems = 'center';
        loading.style.justifyContent = 'center';
        loading.style.textAlign = 'center';
    }
    
    const timeoutId = setTimeout(() => {
        debugLog('⏰ ТАЙМАУТ: Инициализация заняла слишком много времени');
        if (loading) {
            loading.innerHTML = `
                <div style="text-align: center; color: #ffaa00; padding: 1rem;">
                    <div style="font-size: 1.5rem; margin-bottom: 1rem;">⏰ ДОЛГАЯ ЗАГРУЗКА</div>
                    <div style="font-size: 0.8rem; margin-bottom: 1rem;">
                        Загрузка занимает больше времени чем обычно.<br>
                        Попробуйте обновить страницу.
                    </div>
                    <button onclick="window.location.reload()" style="
                        background: #ffaa00;
                        color: black;
                        border: none;
                        padding: 0.5rem 1rem;
                        font-size: 0.7rem;
                        cursor: pointer;
                        font-family: 'Press Start 2P', cursive;
                        margin: 0.5rem;
                    ">🔄 ОБНОВИТЬ</button>
                </div>
            `;
        }
    }, 10000);
    
    try {
        debugLog('🚀 Создание экземпляра UniverseMap...');
        universeMap = new UniverseMap();
        
        window.universeMap = universeMap;
        window.dataLoader = universeMap.dataLoader;
        
        await universeMap.init();
        
        clearTimeout(timeoutId);
        debugLog('✅ UniverseMap успешно инициализирован');
        
    } catch (error) {
        debugLog(`💥 Ошибка инициализации UniverseMap: ${error.message}`);
        console.error('Stack trace:', error.stack);
        
        clearTimeout(timeoutId);
        
        if (loading) {
            loading.innerHTML = `
                <div style="text-align: center; color: #ff4444; padding: 1rem;">
                    <div style="font-size: 1.5rem; margin-bottom: 1rem;">💥 ФАТАЛЬНАЯ ОШИБКА</div>
                    <div style="font-size: 0.8rem; margin-bottom: 1rem;">
                        ${error.message || 'Неизвестная ошибка'}
                    </div>
                    <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
                        <button onclick="window.location.reload()" style="
                            background: #ff4444;
                            color: white;
                            border: none;
                            padding: 0.5rem 1rem;
                            font-size: 0.7rem;
                            cursor: pointer;
                            font-family: 'Press Start 2P', cursive;
                            margin: 0.25rem;
                        ">🔄 ПЕРЕЗАГРУЗИТЬ</button>
                        <button onclick="localStorage.clear(); window.location.reload()" style="
                            background: #ff8800;
                            color: white;
                            border: none;
                            padding: 0.5rem 1rem;
                            font-size: 0.7rem;
                            cursor: pointer;
                            font-family: 'Press Start 2P', cursive;
                            margin: 0.25rem;
                        ">🗑️ ОЧИСТИТЬ ДАННЫЕ</button>
                    </div>
                </div>
            `;
        }
    }
});

// Предотвращение выделения текста при перетаскивании
document.addEventListener('selectstart', (e) => {
    if (universeMap && universeMap.isDragging) {
        e.preventDefault();
    }
});

// Обработка сенсорных событий для предотвращения масштабирования на iOS
document.addEventListener('touchmove', function(e) {
    if (e.scale !== 1) {
        e.preventDefault();
    }
}, { passive: false });

// Добавляем CSS анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { top: 40px; opacity: 0; }
        to { top: 60px; opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes floatUp {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-50px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Очистка старого объекта при повторной загрузке страницы
if (window.universeMap && window.universeMap.destroy) {
    window.universeMap.destroy();
}