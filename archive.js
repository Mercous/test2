// archive.js - Обновленная версия с мобильной оптимизацией

class ArchiveGame {
    constructor() {
        this.dataManager = window.gameDataManager;
        if (!this.dataManager) {
            this.dataManager = {
                playerData: {
                    chronos: 1000,
                    inventory: [],
                    unlockedOrbits: [1, 2],
                    activeBoosters: [],
                    completedMissions: [],
                    systemPower: 0,
                    planetsCount: 0
                },
                spendChronos: (amount) => {
                    if (this.dataManager.playerData.chronos >= amount) {
                        this.dataManager.playerData.chronos -= amount;
                        return true;
                    }
                    return false;
                },
                addCardToInventory: (cardId) => {
                    const card = this.getCardById(cardId);
                    if (card) {
                        const inventoryCard = {
                            ...card,
                            obtainedAt: Date.now(),
                            inventoryId: `${cardId}-${Date.now()}`
                        };
                        this.dataManager.playerData.inventory.push(inventoryCard);
                        return true;
                    }
                    return false;
                },
                getActiveBoosters: () => this.dataManager.playerData.activeBoosters || [],
                addBooster: (boosterId, durationHours) => {
                    if (!this.dataManager.playerData.activeBoosters) {
                        this.dataManager.playerData.activeBoosters = [];
                    }
                    this.dataManager.playerData.activeBoosters.push({
                        id: boosterId,
                        activatedAt: Date.now(),
                        duration: durationHours * 60 * 60 * 1000
                    });
                },
                getActiveBoosterEffects: () => ({ planetRare: 0, sunRare: 0, chronosBoost: 0 }),
                useCardFromInventory: (inventoryId) => {
                    const inventory = this.dataManager.playerData.inventory || [];
                    const cardIndex = inventory.findIndex(card => card.inventoryId === inventoryId);
                    if (cardIndex !== -1) {
                        const card = inventory[cardIndex];
                        inventory.splice(cardIndex, 1);
                        return card;
                    }
                    return null;
                },
                savePlayerData: () => {
                    try {
                        localStorage.setItem('cosmogenesis_player_data', JSON.stringify(this.dataManager.playerData));
                    } catch (error) {}
                },
                isOrbitUnlocked: (orbit) => this.dataManager.playerData.unlockedOrbits.includes(orbit),
                unlockOrbit: (orbit) => {
                    if (!this.dataManager.isOrbitUnlocked(orbit)) {
                        this.dataManager.playerData.unlockedOrbits.push(orbit);
                        this.dataManager.savePlayerData();
                        return true;
                    }
                    return false;
                },
                addChronos: (amount) => {
                    this.dataManager.playerData.chronos += amount;
                    this.dataManager.savePlayerData();
                }
            };
        }
        
        this.purchaseCallback = null;
        
        this.shopUniverse = {
            sun: null,
            planets: [],
            lastPlanetRefresh: 0,
            lastSunRefresh: 0
        };
        
        this.isAnimating = false;
        this.animationFrameId = null;
        this.lastAnimationTime = 0;
        this.animationInterval = 1000 / 30;

        this.boostersData = {
            'luck-1': { name: 'Усилитель Удачи I', price: 150, duration: 24, effect: { planetRare: 0.1 } },
            'luck-2': { name: 'Усилитель Удачи II', price: 300, duration: 24, effect: { planetRare: 0.25, sunRare: 0.25 } },
            'gold-rush': { name: 'Золотая Лихорадка', price: 500, duration: 12, effect: { planetRare: 0.5, sunRare: 0.5 } },
            'xp-boost': { name: 'Бустер Опыта', price: 200, duration: 8, effect: { chronosBoost: 1.0 } }
        };

        this.missionsData = {
            'orbit-3': {
                name: 'ОРБИТА 3',
                price: 150,
                requirements: {
                    sun: 'any',
                    planets: ['gas', 'gas'],
                    balance: 200
                },
                reward: { unlockOrbit: 3 }
            },
            'orbit-4': {
                name: 'ОРБИТА 4',
                price: 300,
                requirements: {
                    sun: 'blue-giant',
                    planets: ['lava', 'ocean'],
                    balance: 350
                },
                reward: { unlockOrbit: 4 }
            },
            'orbit-5': {
                name: 'ОРБИТА 5',
                price: 500,
                requirements: {
                    sun: 'neutron',
                    planets: ['crystal', 'crystal', 'crystal'],
                    balance: 500,
                    power: 800
                },
                reward: { unlockOrbit: 5, bonusCard: 'planet-ultimate' }
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
        this.initShopUniverse();
        this.updateMissionsDisplay();
        this.setupMobileHeader();
        
        setInterval(() => {
            this.updateBoosters();
        }, 1000);
    }

    setupMobileHeader() {
        const header = document.querySelector('.archive-header');
        const main = document.querySelector('.archive-main');
        
        if (!header || !main) return;
        
        // Обновляем data-атрибут для отображения суммы валюты
        const updateCurrencyDisplay = () => {
            const currencyDisplay = document.querySelector('.currency-display');
            const chronosElement = document.getElementById('chronos-amount');
            
            if (currencyDisplay && chronosElement) {
                currencyDisplay.setAttribute('data-amount', chronosElement.textContent);
            }
        };
        
        updateCurrencyDisplay();
        
        // Добавляем обработчик прокрутки для динамического изменения шапки
        let lastScrollTop = 0;
        main.addEventListener('scroll', () => {
            const scrollTop = main.scrollTop;
            
            if (scrollTop > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScrollTop = scrollTop;
        });
        
        // Обновляем при изменении валюты
        const originalUpdateUI = this.updateUI.bind(this);
        this.updateUI = function() {
            originalUpdateUI();
            updateCurrencyDisplay();
        };
        
        // Обработчик ресайза для адаптации
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateCurrencyDisplay();
                
                // Перерисовываем магазин при изменении размера
                if (document.getElementById('shop-tab')?.classList.contains('active')) {
                    this.renderShopUniverse();
                }
            }, 250);
        });
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterInventory(e.target.dataset.filter);
            });
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('buy-button') && !e.target.disabled) {
                const missionId = e.target.dataset.mission;
                this.showPurchaseModal('mission', missionId);
            }
        });

        document.querySelectorAll('.buy-booster').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const boosterId = e.target.dataset.booster;
                this.showPurchaseModal('booster', boosterId);
            });
        });

        const closeModal = document.querySelector('.close-modal');
        const cancelBtn = document.querySelector('.modal-btn.cancel');
        const confirmBtn = document.querySelector('.modal-btn.confirm');
        const modal = document.getElementById('purchase-modal');

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideModal();
            });
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmPurchase();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'purchase-modal') {
                    this.hideModal();
                }
            });
        }

        this.setupShopEventListeners();
    }

    initShopUniverse() {
        const saved = localStorage.getItem('cosmogenesis_shop_universe');
        if (saved) {
            try {
                this.shopUniverse = JSON.parse(saved);
            } catch (error) {
                this.shopUniverse = {
                    sun: null,
                    planets: [],
                    lastPlanetRefresh: 0,
                    lastSunRefresh: 0
                };
            }
        }
        
        const now = Date.now();
        const fifteenMinutes = 15 * 60 * 1000;
        const thirtyMinutes = 30 * 60 * 1000;
        
        if (!this.shopUniverse.planets.length || now - this.shopUniverse.lastPlanetRefresh > fifteenMinutes) {
            this.generateShopPlanets();
        }
        
        if (!this.shopUniverse.sun || now - this.shopUniverse.lastSunRefresh > thirtyMinutes) {
            this.generateShopSun();
        }
        
        this.renderShopUniverse();
        this.startShopTimers();
        
        if (document.getElementById('shop-tab')?.classList.contains('active')) {
            this.startFloatingAnimations();
        }
    }

    generateShopPlanets() {
        const planets = PLANETS_LIBRARY || [];
        if (planets.length === 0) return;
        
        this.shopUniverse.planets = [];
        this.shopUniverse.lastPlanetRefresh = Date.now();
        
        const planetCount = 6 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < planetCount; i++) {
            const randomPlanet = planets[Math.floor(Math.random() * planets.length)];
            
            const shopPlanet = {
                id: `shop-planet-${Date.now()}-${i}`,
                planetId: randomPlanet.id,
                name: randomPlanet.name,
                type: randomPlanet.type,
                rarity: randomPlanet.rarity,
                power: randomPlanet.power,
                color: randomPlanet.color,
                x: 20 + Math.random() * 60,
                y: 20 + Math.random() * 60,
                size: 40 + Math.random() * 30,
                price: this.getPriceByRarity(randomPlanet.rarity),
                purchased: false,
                floatSpeed: 0.2 + Math.random() * 0.8,
                floatDirection: Math.random() * 360
            };
            
            this.shopUniverse.planets.push(shopPlanet);
        }
        
        this.saveShopUniverse();
    }

    generateShopSun() {
        const suns = SUNS_LIBRARY || [];
        if (suns.length === 0) return;
        
        const randomSun = suns[Math.floor(Math.random() * suns.length)];
        
        this.shopUniverse.sun = {
            id: `shop-sun-${Date.now()}`,
            sunId: randomSun.id,
            name: randomSun.name,
            type: randomSun.type,
            rarity: randomSun.rarity,
            power: randomSun.power,
            color: randomSun.color,
            x: 30 + Math.random() * 40,
            y: 30 + Math.random() * 40,
            size: 70 + Math.random() * 30,
            price: this.getPriceByRarity(randomSun.rarity) * 2,
            purchased: false,
            floatSpeed: 0.1 + Math.random() * 0.3,
            floatDirection: Math.random() * 360
        };
        
        this.shopUniverse.lastSunRefresh = Date.now();
        this.saveShopUniverse();
    }

    renderShopUniverse() {
        this.renderShopSun();
        this.renderShopPlanets();
    }

    renderShopSun() {
        const container = document.getElementById('shop-sun-container');
        if (!container) return;
        
        if (!this.shopUniverse.sun) {
            container.innerHTML = '<div class="shop-sun-placeholder"></div>';
            return;
        }
        
        const sun = this.shopUniverse.sun;
        
        container.innerHTML = `
            <div class="shop-sun ${sun.purchased ? 'purchased' : ''}" 
                 data-sun-id="${sun.id}"
                 style="
                    left: ${sun.x}%;
                    top: ${sun.y}%;
                    width: ${sun.size}px;
                    height: ${sun.size}px;
                    background: ${sun.color};
                    box-shadow: 0 0 40px ${sun.color};
                    cursor: ${sun.purchased ? 'default' : 'pointer'};
                    position: absolute;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    transition: transform 0.3s ease;
                    z-index: 10;
                 ">
                ${this.getCelestialBodyGraphic('sun', sun.type)}
                ${!sun.purchased ? `
                    <div class="sun-price-tag">${sun.price} ХРОНОС</div>
                ` : ''}
            </div>
        `;
    }

    renderShopPlanets() {
        const container = document.getElementById('shop-planets-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.shopUniverse.planets.forEach(planet => {
            if (planet.purchased) return;
            
            const planetElement = document.createElement('div');
            planetElement.className = `shop-planet ${planet.purchased ? 'purchased' : ''}`;
            planetElement.setAttribute('data-planet-id', planet.id);
            
            planetElement.style.cssText = `
                position: absolute;
                left: ${planet.x}%;
                top: ${planet.y}%;
                width: ${planet.size}px;
                height: ${planet.size}px;
                background: ${planet.color};
                box-shadow: 0 0 20px ${planet.color};
                cursor: pointer;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: transform 0.3s ease;
                z-index: 10;
            `;
            
            planetElement.innerHTML = `
                ${this.getCelestialBodyGraphic('planet', planet.type)}
                ${!planet.purchased ? `
                    <div class="planet-price-tag">${planet.price} ХРОНОС</div>
                ` : ''}
            `;
            
            container.appendChild(planetElement);
        });
    }

    getCelestialBodyGraphic(type, subtype) {
        if (type === 'sun') {
            return `
                <div class="celestial-graphic sun-graphic">
                    <div class="sun-core"></div>
                    <div class="sun-rays"></div>
                    <div class="sun-corona"></div>
                </div>
            `;
        }
        
        const planetGraphics = {
            'rocky': 'rocky-planet',
            'gas': 'gas-planet', 
            'lava': 'lava-planet',
            'ocean': 'ocean-planet',
            'ice': 'ice-planet',
            'crystal': 'crystal-planet',
            'jungle': 'jungle-planet',
            'desert': 'desert-planet'
        };
        
        const graphicClass = planetGraphics[subtype] || 'default-planet';
        
        return `
            <div class="celestial-graphic planet-graphic ${graphicClass}">
                <div class="planet-details"></div>
            </div>
        `;
    }

    setupShopEventListeners() {
        document.addEventListener('click', (e) => {
            const planetElement = e.target.closest('.shop-planet');
            if (planetElement && !planetElement.classList.contains('purchased')) {
                const planetId = planetElement.getAttribute('data-planet-id');
                if (planetId) {
                    this.selectShopItem('planet', planetId);
                    return;
                }
            }
            
            const sunElement = e.target.closest('.shop-sun');
            if (sunElement && !sunElement.classList.contains('purchased')) {
                const sunId = sunElement.getAttribute('data-sun-id');
                if (sunId) {
                    this.selectShopItem('sun', sunId);
                    return;
                }
            }
        });

        document.addEventListener('mouseover', (e) => {
            const planetElement = e.target.closest('.shop-planet');
            const sunElement = e.target.closest('.shop-sun');
            
            if ((planetElement || sunElement) && this.isAnimating) {
                this.stopFloatingAnimations();
            }
        });

        document.addEventListener('mouseout', (e) => {
            const planetElement = e.target.closest('.shop-planet');
            const sunElement = e.target.closest('.shop-sun');
            
            if ((planetElement || sunElement) && document.getElementById('shop-tab')?.classList.contains('active')) {
                setTimeout(() => {
                    this.startFloatingAnimations();
                }, 300);
            }
        });
    }

    startFloatingAnimations() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.lastAnimationTime = performance.now();
        
        const animate = (currentTime) => {
            if (!this.isAnimating) return;
            
            const deltaTime = currentTime - this.lastAnimationTime;
            
            if (deltaTime >= this.animationInterval) {
                this.updateFloatingPositions();
                this.lastAnimationTime = currentTime - (deltaTime % this.animationInterval);
            }
            
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        this.animationFrameId = requestAnimationFrame(animate);
    }

    stopFloatingAnimations() {
        this.isAnimating = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    updateFloatingPositions() {
        if (this.shopUniverse.sun && !this.shopUniverse.sun.purchased) {
            this.updateCelestialBodyPosition(this.shopUniverse.sun);
        }

        this.shopUniverse.planets.forEach(planet => {
            if (!planet.purchased) {
                this.updateCelestialBodyPosition(planet);
            }
        });
        
        if (document.getElementById('shop-tab')?.classList.contains('active')) {
            this.renderShopUniverse();
        }
    }

    updateCelestialBodyPosition(body) {
        const speedMultiplier = 0.02;
        
        const radians = (body.floatDirection * Math.PI) / 180;
        body.x += Math.cos(radians) * body.floatSpeed * speedMultiplier;
        body.y += Math.sin(radians) * body.floatSpeed * speedMultiplier;

        if (body.x < 15 || body.x > 85) {
            body.floatDirection = 180 - body.floatDirection;
            body.x = Math.max(15, Math.min(85, body.x));
        }
        if (body.y < 15 || body.y > 85) {
            body.floatDirection = -body.floatDirection;
            body.y = Math.max(15, Math.min(85, body.y));
        }

        if (Math.random() < 0.005) {
            body.floatDirection += (Math.random() - 0.5) * 30;
        }

        body.floatDirection = body.floatDirection % 360;
        if (body.floatDirection < 0) body.floatDirection += 360;
    }

    selectShopItem(type, id) {
        let item, itemName, itemData;
        
        if (type === 'planet') {
            item = this.shopUniverse.planets.find(p => p.id === id);
            if (item) {
                itemData = this.getCardById(item.planetId);
                itemName = item.name;
            }
        } else if (type === 'sun') {
            item = this.shopUniverse.sun;
            if (item && item.id === id) {
                itemData = this.getCardById(item.sunId);
                itemName = item.name;
            }
        }
        
        if (!item || !itemData) {
            this.showNotification('Ошибка выбора предмета', 'error');
            return;
        }
        
        const infoContainer = document.getElementById('shop-selection-info');
        if (!infoContainer) return;
        
        infoContainer.innerHTML = `
            <div class="selected-item-info">
                <div class="selected-item-preview" style="
                    background: ${item.color}; 
                    box-shadow: 0 0 30px ${item.color};
                    width: ${type === 'sun' ? '100px' : '80px'};
                    height: ${type === 'sun' ? '100px' : '80px'};
                ">
                    ${this.getCelestialBodyGraphic(type, item.type)}
                </div>
                <div class="selected-item-details">
                    <h3>${itemName}</h3>
                    <p>${this.getRarityText(item.rarity)} ${type === 'sun' ? 'Солнце' : 'Планета'}</p>
                    <div class="selected-item-stats">
                        <span>${type === 'sun' ? '☀️' : '🪐'} ${this.getTypeText(item.type)}</span>
                        <span>⚡ ${item.power}</span>
                        <span>🎲 ${this.getRarityText(item.rarity)}</span>
                    </div>
                    <div class="selected-item-price">${item.price} ХРОНОС</div>
                    <button class="buy-selected-item" 
                            data-item-type="${type}" 
                            data-item-id="${id}">
                        КУПИТЬ СЕЙЧАС
                    </button>
                </div>
            </div>
        `;
        
        const buyBtn = infoContainer.querySelector('.buy-selected-item');
        if (buyBtn) {
            buyBtn.addEventListener('click', () => {
                this.purchaseShopItem(type, id);
            });
        }
    }

    getTypeText(type) {
        const typeNames = {
            'sun': {
                'basic': 'Желтый карлик',
                'blue-giant': 'Голубой гигант',
                'red-giant': 'Красный гигант',
                'neutron': 'Нейтронная звезда',
                'white-dwarf': 'Белый карлик'
            },
            'planet': {
                'rocky': 'Каменная',
                'gas': 'Газовый гигант',
                'lava': 'Лавовый мир',
                'ocean': 'Океаническая',
                'ice': 'Ледяная',
                'crystal': 'Кристальная',
                'jungle': 'Джунгли',
                'desert': 'Пустынная'
            }
        };
        
        return typeNames[type]?.[type] || type;
    }

    purchaseShopItem(type, id) {
        let item, price;
        
        if (type === 'planet') {
            item = this.shopUniverse.planets.find(p => p.id === id);
        } else if (type === 'sun') {
            item = this.shopUniverse.sun;
        }
        
        if (!item || item.purchased) {
            this.showNotification('Предмет уже куплен или не найден!', 'error');
            return;
        }
        
        price = item.price;
        
        if (!this.dataManager.spendChronos(price)) {
            this.showNotification('Недостаточно Хроноса!', 'error');
            return;
        }
        
        const cardId = type === 'planet' ? item.planetId : item.sunId;
        const success = this.dataManager.addCardToInventory(cardId);
        
        if (success) {
            item.purchased = true;
            this.saveShopUniverse();
            
            this.renderShopUniverse();
            this.updateUI();
            
            this.showNotification(`Успешно куплено: ${item.name}!`);
            
            const infoContainer = document.getElementById('shop-selection-info');
            if (infoContainer) {
                infoContainer.innerHTML = `
                    <div class="selection-placeholder">
                        <p>🎉 Предмет добавлен в инвентарь!</p>
                        <p>Выберите другой объект на карте</p>
                    </div>
                `;
            }
        } else {
            this.showNotification('Ошибка при покупке!', 'error');
            this.dataManager.addChronos(price);
        }
    }

    startShopTimers() {
        setInterval(() => {
            this.updateShopTimers();
        }, 1000);
    }

    updateShopTimers() {
        const now = Date.now();
        const fifteenMinutes = 15 * 60 * 1000;
        const thirtyMinutes = 30 * 60 * 1000;
        
        const planetsTimeLeft = this.shopUniverse.lastPlanetRefresh + fifteenMinutes - now;
        const planetsTimer = document.getElementById('planets-timer');
        if (planetsTimer) {
            if (planetsTimeLeft <= 0) {
                this.generateShopPlanets();
                this.renderShopUniverse();
            } else {
                planetsTimer.textContent = this.formatTime(planetsTimeLeft);
            }
        }
        
        const sunTimeLeft = this.shopUniverse.lastSunRefresh + thirtyMinutes - now;
        const sunTimer = document.getElementById('sun-timer');
        if (sunTimer) {
            if (sunTimeLeft <= 0) {
                this.generateShopSun();
                this.renderShopUniverse();
            } else {
                sunTimer.textContent = this.formatTime(sunTimeLeft);
            }
        }
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    saveShopUniverse() {
        try {
            localStorage.setItem('cosmogenesis_shop_universe', JSON.stringify(this.shopUniverse));
        } catch (error) {}
    }

    switchTab(tabName) {
        if (document.getElementById('shop-tab')?.classList.contains('active')) {
            this.stopFloatingAnimations();
        }

        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const activeContent = document.getElementById(`${tabName}-tab`);
        if (activeContent) {
            activeContent.classList.add('active');
            
            if (tabName === 'shop') {
                setTimeout(() => {
                    this.startFloatingAnimations();
                }, 100);
            }
        }

        if (tabName === 'inventory') {
            this.updateInventory();
        } else if (tabName === 'boosters') {
            this.updateActiveBoosters();
        } else if (tabName === 'missions') {
            this.updateMissionsDisplay();
        } else if (tabName === 'shop') {
            this.updateShopTimers();
            this.renderShopUniverse();
        }
    }

    showPurchaseModal(type, id) {
        const modal = document.getElementById('purchase-modal');
        const title = document.getElementById('modal-title');
        const message = document.getElementById('modal-message');
        const priceElement = document.getElementById('modal-price-amount');

        if (!modal || !title || !message || !priceElement) return;

        let price = 0;
        let itemName = '';

        switch (type) {
            case 'mission':
                const missionData = this.missionsData[id];
                if (missionData) {
                    price = missionData.price;
                    itemName = missionData.name;
                    const requirementsMet = this.checkMissionRequirements(id);
                    message.textContent = requirementsMet ? 
                        `🎯 Все условия выполнены! Открыть орбиту ${missionData.reward.unlockOrbit}?` :
                        `Вы уверены, что хотите купить задание "${itemName}"?`;
                }
                break;

            case 'booster':
                const boosterData = this.boostersData[id];
                if (boosterData) {
                    price = boosterData.price;
                    itemName = boosterData.name;
                    message.textContent = `Вы уверены, что хотите активировать "${itemName}"?`;
                }
                break;
        }

        if (price === 0) {
            this.showNotification('Ошибка: предмет не найден', 'error');
            return;
        }

        priceElement.textContent = price;
        title.textContent = `ПОДТВЕРЖДЕНИЕ ПОКУПКИ`;

        this.purchaseCallback = { type, id, price };

        modal.classList.add('active');
    }

    getCardById(cardId) {
        try {
            if (typeof SUNS_LIBRARY !== 'undefined') {
                const sun = SUNS_LIBRARY.find(s => s.id === cardId);
                if (sun) return { ...sun, cardType: 'sun' };
            }
            
            if (typeof PLANETS_LIBRARY !== 'undefined') {
                const planet = PLANETS_LIBRARY.find(p => p.id === cardId);
                if (planet) return { ...planet, cardType: 'planet' };
            }
            
            const defaultCards = [
                { id: 'sun-basic', name: 'ЖЁЛТЫЙ КАРЛИК', type: 'basic', power: 100, color: '#ffd700', cardType: 'sun', rarity: 'common' },
                { id: 'planet-rocky', name: 'КАМЕНИСТАЯ', type: 'rocky', power: 25, color: '#8B4513', cardType: 'planet', rarity: 'common' },
                { id: 'planet-gas', name: 'ГАЗОВЫЙ ГИГАНТ', type: 'gas', power: 40, color: '#87CEEB', cardType: 'planet', rarity: 'common' }
            ];
            
            return defaultCards.find(card => card.id === cardId);
        } catch (error) {
            return null;
        }
    }

    hideModal() {
        const modal = document.getElementById('purchase-modal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.purchaseCallback = null;
    }

    confirmPurchase() {
        if (!this.purchaseCallback) return;

        const { type, id, price } = this.purchaseCallback;

        if (!this.dataManager.spendChronos(price)) {
            this.showNotification('Недостаточно Хроноса!', 'error');
            this.hideModal();
            return;
        }

        let success = false;
        
        switch (type) {
            case 'mission':
                success = this.buyMission(id);
                break;
            case 'booster':
                success = this.buyBooster(id);
                break;
        }

        if (success) {
            this.updateUI();
            this.hideModal();
            this.showNotification('Покупка успешна!');
        } else {
            this.showNotification('Ошибка при покупке!', 'error');
        }
    }

    buyMission(missionId) {
        const mission = this.missionsData[missionId];
        if (!mission) return false;

        if (!this.checkMissionRequirements(missionId)) {
            this.showNotification('Не выполнены требования задания!', 'error');
            return false;
        }

        if (mission.reward.unlockOrbit) {
            const unlocked = this.dataManager.unlockOrbit(mission.reward.unlockOrbit);
            if (unlocked) {
                this.showNotification(`🎉 Орбита ${mission.reward.unlockOrbit} открыта!`);
            }
        }
        
        if (mission.reward.bonusCard) {
            this.dataManager.addCardToInventory(mission.reward.bonusCard);
        }

        this.dataManager.playerData.completedMissions = this.dataManager.playerData.completedMissions || [];
        this.dataManager.playerData.completedMissions.push(missionId);
        
        this.dataManager.savePlayerData();
        return true;
    }

    checkMissionRequirements(missionId) {
        const mission = this.missionsData[missionId];
        if (!mission) return false;

        const universeState = this.getUniverseState();
        
        if (mission.requirements.sun !== 'any') {
            if (!universeState.sun || universeState.sun.type !== mission.requirements.sun) {
                return false;
            }
        }

        const planetTypes = Object.values(universeState.planets).map(p => p.type);
        const requiredPlanets = [...mission.requirements.planets];
        const availablePlanets = [...planetTypes];
        
        for (const requiredType of requiredPlanets) {
            const index = availablePlanets.indexOf(requiredType);
            if (index === -1) return false;
            availablePlanets.splice(index, 1);
        }

        if (mission.requirements.balance && (universeState.bonuses?.balance || 0) < mission.requirements.balance) {
            return false;
        }

        if (mission.requirements.power && (universeState.totalPower || 0) < mission.requirements.power) {
            return false;
        }

        return true;
    }

    getUniverseState() {
        try {
            const saved = localStorage.getItem('cosmogenesis_universe');
            return saved ? JSON.parse(saved) : { sun: null, planets: {}, totalPower: 0, bonuses: {} };
        } catch (error) {
            return { sun: null, planets: {}, totalPower: 0, bonuses: {} };
        }
    }

    buyBooster(boosterId) {
        const booster = this.boostersData[boosterId];
        if (booster) {
            this.dataManager.addBooster(boosterId, booster.duration);
            return true;
        }
        return false;
    }

    updateBoosters() {
        if (document.getElementById('boosters-tab')?.classList.contains('active')) {
            this.updateActiveBoosters();
        }
    }

    updateActiveBoosters() {
        const container = document.getElementById('active-boosters-list');
        if (!container) return;

        const activeBoosters = this.dataManager.getActiveBoosters();
        container.innerHTML = '';

        if (activeBoosters.length === 0) {
            container.innerHTML = '<p style="text-align: center; font-size: 0.6rem; opacity: 0.7;">Нет активных усилителей</p>';
            return;
        }

        activeBoosters.forEach(booster => {
            const data = this.boostersData[booster.id];
            if (!data) return;

            const remaining = booster.duration - (Date.now() - booster.activatedAt);
            if (remaining <= 0) return;

            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            
            const boosterElement = document.createElement('div');
            boosterElement.className = 'booster-card';
            boosterElement.innerHTML = `
                <div class="booster-icon">🚀</div>
                <div class="booster-info">
                    <h3>${data.name}</h3>
                    <p>Осталось: ${hours}ч ${minutes}м</p>
                </div>
            `;
            container.appendChild(boosterElement);
        });
    }

    updateUI() {
        const chronosElement = document.getElementById('chronos-amount');
        if (chronosElement) {
            chronosElement.textContent = Math.floor(this.dataManager.playerData.chronos);
        }
        
        this.updateInventory();
        this.updateStats();
    }

    updateStats() {
        const inventory = this.dataManager.playerData.inventory || [];
        const total = inventory.length;
        const suns = inventory.filter(item => item.cardType === 'sun').length;
        const planets = inventory.filter(item => item.cardType === 'planet').length;
        const rare = inventory.filter(item => item.rarity === 'rare' || item.rarity === 'epic').length;

        const totalElement = document.getElementById('total-cards');
        const sunsElement = document.getElementById('suns-count');
        const planetsElement = document.getElementById('planets-count');
        const rareElement = document.getElementById('rare-count');

        if (totalElement) totalElement.textContent = total;
        if (sunsElement) sunsElement.textContent = suns;
        if (planetsElement) planetsElement.textContent = planets;
        if (rareElement) rareElement.textContent = rare;
    }

    updateInventory() {
        const container = document.getElementById('cards-container');
        if (!container) return;

        const inventory = this.dataManager.playerData.inventory || [];
        
        container.innerHTML = '';

        if (inventory.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text); opacity: 0.7;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                    <div style="font-size: 0.7rem; margin-bottom: 0.5rem;">ИНВЕНТАРЬ ПУСТ</div>
                    <div style="font-size: 0.5rem;">Посетите магазин чтобы приобрести карты</div>
                </div>
            `;
            return;
        }

        inventory.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = `card-item ${card.rarity || 'common'}`;
            cardElement.innerHTML = `
                <div class="card-preview" style="background: ${card.color || '#666'};"></div>
                <div class="card-name">${card.name || 'Неизвестная карта'}</div>
                <div class="card-type">${card.cardType === 'sun' ? 'Солнце' : 'Планета'}</div>
                ${card.rarity ? `<div class="card-rarity">${this.getRarityText(card.rarity)}</div>` : ''}
                <div class="card-power">⚡ ${card.power || 0}</div>
            `;
            
            cardElement.addEventListener('click', () => {
                this.useCard(card.inventoryId || card.id);
            });
            
            container.appendChild(cardElement);
        });
    }

    useCard(inventoryId) {
        const usedCard = this.dataManager.useCardFromInventory(inventoryId);
        if (usedCard) {
            this.showNotification(`Карта "${usedCard.name}" подготовлена к использованию!`, 'success');
            this.updateUI();
            
            if (window.universeMap) {
                this.transferCardToUniverse(usedCard);
            } else {
                if (confirm('Перейти на карту вселенной для размещения карты?')) {
                    window.location.href = 'universe-map.html';
                }
            }
        } else {
            this.showNotification('Ошибка использования карты!', 'error');
        }
    }

    transferCardToUniverse(card) {
        if (card.cardType === 'sun') {
            if (window.universeMap && window.universeMap.showSelectionModal) {
                window.universeMap.showSelectionModal('sun');
            }
        } else if (card.cardType === 'planet') {
            if (window.universeMap && window.universeMap.showMessage) {
                window.universeMap.showMessage(`🪐 Планета "${card.name}" готова к размещению! Выберите слот на орбите.`);
            }
        }
    }

    filterInventory(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeFilter = document.querySelector(`[data-filter="${filter}"]`);
        if (activeFilter) {
            activeFilter.classList.add('active');
        }

        const cards = document.querySelectorAll('.card-item');
        if (cards.length === 0) return;
        
        cards.forEach(card => {
            let show = false;
            
            switch (filter) {
                case 'all':
                    show = true;
                    break;
                case 'suns':
                    show = card.querySelector('.card-type')?.textContent === 'Солнце';
                    break;
                case 'planets':
                    show = card.querySelector('.card-type')?.textContent === 'Планета';
                    break;
                case 'rare':
                    show = card.classList.contains('rare') || card.classList.contains('epic');
                    break;
            }
            
            card.style.display = show ? 'block' : 'none';
        });
    }

    updateMissionsDisplay() {
        const missionsGrid = document.querySelector('.missions-grid');
        if (!missionsGrid) return;

        missionsGrid.innerHTML = '';

        Object.entries(this.missionsData).forEach(([missionId, mission]) => {
            const isCompleted = this.dataManager.playerData.completedMissions?.includes(missionId);
            const requirementsMet = this.checkMissionRequirements(missionId);
            const canPurchase = !isCompleted && requirementsMet;
            
            const missionCard = document.createElement('div');
            missionCard.className = `mission-card ${isCompleted ? 'completed' : ''} ${requirementsMet ? 'requirements-met' : ''}`;
            missionCard.innerHTML = `
                <div class="mission-header">
                    <h3>${mission.name}</h3>
                    <span class="mission-price">${mission.price} ХРОНОС</span>
                </div>
                <div class="mission-status">
                    ${isCompleted ? 
                        '<div class="status-badge completed">✅ ВЫПОЛНЕНО</div>' : 
                        requirementsMet ? 
                        '<div class="status-badge can-complete">🎯 УСЛОВИЯ ВЫПОЛНЕНЫ</div>' :
                        '<div class="status-badge requirements-not-met">❌ УСЛОВИЯ НЕ ВЫПОЛНЕНЫ</div>'
                    }
                </div>
                <div class="mission-requirements">
                    <p>📋 Требования:</p>
                    <ul>
                        <li class="${this.checkSunRequirement(mission.requirements.sun) ? 'requirement-met' : 'requirement-not-met'}">
                            ⭐ Солнце: ${mission.requirements.sun === 'any' ? 'Любое' : this.getSunNameByType(mission.requirements.sun)}
                        </li>
                        <li class="${this.checkPlanetsRequirement(mission.requirements.planets) ? 'requirement-met' : 'requirement-not-met'}">
                            🪐 Планеты: ${this.getPlanetsRequirementText(mission.requirements.planets)}
                        </li>
                        <li class="${this.checkBalanceRequirement(mission.requirements.balance) ? 'requirement-met' : 'requirement-not-met'}">
                            ⚖️ Баланс системы: ≥ ${mission.requirements.balance}
                        </li>
                        ${mission.requirements.power ? 
                            `<li class="${this.checkPowerRequirement(mission.requirements.power) ? 'requirement-met' : 'requirement-not-met'}">
                                ⚡ Общая мощь: ≥ ${mission.requirements.power}
                            </li>` : ''
                        }
                    </ul>
                </div>
                <div class="mission-reward">
                    <p>🎁 Награда: ${this.getMissionRewardText(mission.reward)}</p>
                </div>
                <button class="buy-button ${isCompleted ? 'completed' : ''} ${canPurchase ? 'can-complete' : ''}" 
                        data-mission="${missionId}"
                        ${isCompleted ? 'disabled' : !requirementsMet ? 'disabled' : ''}>
                    ${isCompleted ? '✅ ВЫПОЛНЕНО' : requirementsMet ? 'ОТКРЫТЬ ОРБИТУ' : 'УСЛОВИЯ НЕ ВЫПОЛНЕНЫ'}
                </button>
                ${!requirementsMet && !isCompleted ? 
                    '<div class="mission-hint">⚠️ Выполните требования системы для открытия орбиты</div>' : ''
                }
            `;
            missionsGrid.appendChild(missionCard);
        });

        document.querySelectorAll('.missions-grid .buy-button:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const missionId = e.target.dataset.mission;
                this.showPurchaseModal('mission', missionId);
            });
        });
    }

    checkSunRequirement(requiredSun) {
        if (requiredSun === 'any') return true;
        const universeState = this.getUniverseState();
        return universeState.sun && universeState.sun.type === requiredSun;
    }

    checkPlanetsRequirement(requiredPlanets) {
        const universeState = this.getUniverseState();
        const planetTypes = Object.values(universeState.planets).map(p => p.type);
        const availablePlanets = [...planetTypes];
        
        for (const requiredType of requiredPlanets) {
            const index = availablePlanets.indexOf(requiredType);
            if (index === -1) return false;
            availablePlanets.splice(index, 1);
        }
        return true;
    }

    checkBalanceRequirement(requiredBalance) {
        if (!requiredBalance) return true;
        const universeState = this.getUniverseState();
        return (universeState.bonuses?.balance || 0) >= requiredBalance;
    }

    checkPowerRequirement(requiredPower) {
        if (!requiredPower) return true;
        const universeState = this.getUniverseState();
        return (universeState.totalPower || 0) >= requiredPower;
    }

    getSunNameByType(type) {
        const sun = SUNS_LIBRARY?.find(s => s.type === type);
        return sun?.name || type;
    }

    getPlanetsRequirementText(planets) {
        const counts = {};
        planets.forEach(type => {
            counts[type] = (counts[type] || 0) + 1;
        });
        
        return Object.entries(counts).map(([type, count]) => {
            const planet = PLANETS_LIBRARY?.find(p => p.type === type);
            const name = planet?.name || type;
            return `${count} ${name}`;
        }).join(', ');
    }

    getMissionRewardText(reward) {
        let text = `Открытие ${reward.unlockOrbit}-й орбиты`;
        if (reward.bonusCard) {
            const card = this.getCardById(reward.bonusCard);
            if (card) {
                text += ` + ${card.name}`;
            } else if (reward.unlockOrbit === 5) {
                text += ` + УЛЬТИМАТИВНАЯ ПЛАНЕТА`;
            }
        }
        return text;
    }

    getPriceByRarity(rarity) {
        switch (rarity) {
            case 'common': return 75;
            case 'uncommon': return 150;
            case 'rare': return 500;
            case 'epic': return 1000;
            case 'legendary': return 1600;
            default: return 100;
        }
    }

    getRarityText(rarity) {
        switch (rarity) {
            case 'common': return 'Обычная';
            case 'uncommon': return 'Необычная';
            case 'rare': return 'Редкая';
            case 'epic': return 'Эпическая';
            case 'legendary': return 'Легендарная';
            default: return 'Неизвестно';
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const text = document.getElementById('notification-text');
        
        if (!notification || !text) return;
        
        text.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.archiveGame = new ArchiveGame();
    }, 100);
});