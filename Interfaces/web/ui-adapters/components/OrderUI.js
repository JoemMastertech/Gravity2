import { setSafeInnerHTML } from '../../../../Shared/utils/domUtils.js';
import { formatPrice } from '../../../../Shared/utils/formatters.js';
import Logger from '../../../../Shared/utils/logger.js';
import { CONSTANTS, simpleHash } from './OrderLogic.js';
import { isJuiceOption } from '../../../../Shared/utils/calculationUtils.js';
import { ModalSystem } from './ModalSystem.js';

export class OrderUI {
    constructor(controller) {
        this.controller = controller;
        this.eventDelegationInitialized = false;
    }

    initialize() {
        this.initEventDelegation();
        this._initOrientationListener();
    }

    // Event Delegation
    initEventDelegation() {
        if (this.eventDelegationInitialized) return;
        document.addEventListener('click', (e) => this.controller.handleDelegatedEvent(e));
        this.eventDelegationInitialized = true;
        Logger.debug('OrderSystem event delegation initialized');
    }

    // DOM Helpers
    _createElement(tag, className, textContent = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }

    // Unified Modal System

    showValidationModal(message) {
        Logger.info('[OrderUI] showValidationModal called with:', message);
        ModalSystem.show({
            title: 'Atención',
            content: `<p class="u-modal-text-center">${message}</p>`,
            actions: [
                {
                    label: 'Aceptar',
                    type: 'contrast', // Matte Black
                    onClick: () => ModalSystem.close()
                }
            ]
        });
    }

    showConfirmationModal(title, message, onConfirm) {
        ModalSystem.show({
            title: title || 'Confirmación',
            content: `<p class="u-modal-text-center">${message}</p>`,
            actions: [
                {
                    label: 'Confirmar',
                    type: 'contrast', // Matte Black
                    onClick: () => {
                        onConfirm();
                        ModalSystem.close();
                    }
                },
                {
                    label: 'Cancelar',
                    type: 'ghost',
                    onClick: () => ModalSystem.close()
                }
            ]
        });
    }

    // Order Display
    updateOrderDisplay(items) {
        const orderItemsContainer = document.getElementById('order-items');
        if (!orderItemsContainer) {
            // Only log debug if we are in order mode, otherwise it's expected
            if (this.controller.isOrderMode) {
                Logger.debug('updateOrderDisplay: order-items not found');
            }
            return;
        }
        this._updateOrderDisplayContent(orderItemsContainer, items);
    }

    _updateOrderDisplayContent(orderItemsContainer, items) {
        orderItemsContainer.innerHTML = '';
        const orderTotalAmount = document.getElementById('order-total-amount');

        // Update total if element exists
        if (orderTotalAmount) {
            // Total calculation is done by logic/core, but we need to display it.
            // The controller should pass the total or we get it from core.
            // Let's assume controller updates the total separately or we do it here.
            // In original code, updateOrderDisplay calls core.getTotal().
            // I'll assume items is passed, but total?
            // I'll use controller.core.getTotal() for now.
            orderTotalAmount.textContent = formatPrice(this.controller.core.getTotal());
        }

        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';

            const itemHeader = document.createElement('div');
            itemHeader.className = 'order-item-header';

            const itemName = document.createElement('div');
            itemName.className = 'order-item-name';
            itemName.textContent = item.name;
            const nameKey = `product-name_${simpleHash((item.name || '').trim())}`;
            itemName.setAttribute('data-translate', nameKey);
            itemName.setAttribute('data-namespace', 'products');
            itemName.setAttribute('data-original-text', item.name || '');

            const removeButton = document.createElement('button');
            removeButton.className = 'remove-order-item';
            setSafeInnerHTML(removeButton, '&times;');
            removeButton.addEventListener('click', () => {
                this.controller.removeOrderItem(item.id);
            });

            itemHeader.appendChild(itemName);
            itemHeader.appendChild(removeButton);

            const itemPrice = document.createElement('div');
            itemPrice.className = 'order-item-price';
            itemPrice.textContent = formatPrice(item.price);

            itemElement.appendChild(itemHeader);
            itemElement.appendChild(itemPrice);

            if (item.customizations && item.customizations.length > 0) {
                item.customizations.forEach(customization => {
                    const customElem = document.createElement('div');
                    customElem.className = 'order-item-customization';
                    customElem.textContent = customization;
                    const optKey = `product-option_${simpleHash((customization || '').trim())}`;
                    customElem.setAttribute('data-translate', optKey);
                    customElem.setAttribute('data-namespace', 'products');
                    customElem.setAttribute('data-original-text', customization || '');
                    itemElement.appendChild(customElem);
                });
            }
            orderItemsContainer.appendChild(itemElement);
        });

        // Auto-scroll to bottom to show latest item (Chat-like behavior)
        // Wrappped in requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
            orderItemsContainer.scrollTop = orderItemsContainer.scrollHeight;
        });
    }

    // Order Mode UI
    toggleOrderModeUI(isActive) {
        const elements = {
            sidebar: document.getElementById(CONSTANTS.SELECTORS.SIDEBAR),
            tables: document.querySelectorAll(CONSTANTS.SELECTORS.TABLES),
            wrapper: document.querySelector('.content-wrapper'),
            orderBtn: document.getElementById(CONSTANTS.SELECTORS.ORDER_BTN),
            body: document.body
        };

        this._updateOrderButton(elements.orderBtn, isActive);
        this._updateSidebarVisibility(elements.sidebar, isActive);
        this._updateTablesMode(elements.tables, isActive);
        this._updateWrapperState(elements.wrapper, isActive);
        this._updateBodyState(elements.body, isActive);
    }

    _updateOrderButton(orderBtn, isActive) {
        this._updateHamburgerMenuButton(isActive);
    }

    async _updateHamburgerMenuButton(isActive) {
        const hamburgerButtons = document.querySelectorAll('#drawer-menu .nav-button');
        const createOrderBtn = Array.from(hamburgerButtons).find(btn =>
            btn.getAttribute('data-action') === 'createOrder'
        );

        if (createOrderBtn) {
            if (isActive) {
                createOrderBtn.setAttribute('data-translate', 'menu.cancel_order');
                createOrderBtn.setAttribute('data-namespace', 'menu');
                createOrderBtn.setAttribute('data-original-text', 'CANCELAR ORDEN');
                createOrderBtn.textContent = 'CANCELAR ORDEN';
            } else {
                createOrderBtn.setAttribute('data-translate', 'menu.create_order');
                createOrderBtn.setAttribute('data-namespace', 'menu');
                createOrderBtn.setAttribute('data-original-text', 'Crear orden');
                createOrderBtn.textContent = 'Crear orden';
            }
            // Translation logic omitted for brevity, can be added if needed
        }
    }

    _updateSidebarVisibility(sidebar, isActive) {
        if (!sidebar) return;

        const hasItems = this.controller.core && this.controller.core.getItems && this.controller.core.getItems().length > 0;
        const shouldBeVisible = isActive || hasItems;

        import('./OrderDrawer.js').then(module => {
            const OrderDrawer = module.default;
            if (shouldBeVisible) {
                OrderDrawer.open();
            } else {
                OrderDrawer.close(true); // Force close authorized by Logic
            }
        }).catch(err => {
            console.error('Failed to load OrderDrawer', err);
            // Fallback (Simple toggle) if drawer fails
            sidebar.classList.toggle('sidebar-visible', shouldBeVisible);
            document.body.classList.toggle('sidebar-open', shouldBeVisible);
        });
    }

    _handleMobileHiding(sidebar) {
        // Handled delegated to OrderDrawer
        import('./OrderDrawer.js').then(module => {
            module.default.close(true);
        });
    }

    _initOrientationListener() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this._handleOrientationChange(), 100);
        });
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => this._handleOrientationChange(), 150);
        });
    }

    _handleOrientationChange() {
        const sidebar = document.getElementById(CONSTANTS.SELECTORS.SIDEBAR);
        if (sidebar && sidebar.classList.contains('sidebar-visible')) {
            this._handleMobileOrientation(sidebar);
            const contentWrapper = document.querySelector('.content-wrapper');
            if (contentWrapper) {
                contentWrapper.classList.toggle('with-sidebar', this._isLandscape());
            }
        }
    }

    _updateTablesMode(tables, isActive) {
        if (tables) {
            tables.forEach(table => {
                if (table && table.classList) {
                    table.classList.toggle('price-selection-mode', isActive);
                }
            });
        }
    }

    _updateWrapperState(wrapper, isActive) {
        if (wrapper && wrapper.classList) {
            wrapper.classList.toggle('order-active', isActive);
        }
    }

    _updateBodyState(body, isActive) {
        if (body && body.classList) {
            body.classList.toggle('order-mode-active', isActive);
        }
    }


    // Drink Options UI
    showDrinkOptionsModal() {
        Logger.info('[OrderUI:LOG] showDrinkOptionsModal called');
        this._setupDrinkModal();
    }

    renderDrinkOptions(container, options) {
        if (!Array.isArray(options)) {
            Logger.error('renderDrinkOptions: options is not an array:', options);
            return;
        }

        // Bottles use a 2-column grid container (New Refinement)
        const grid = this._createElement('div', 'bottle-mixer-grid');

        options.forEach(option => {
            grid.appendChild(option === 'Ninguno' ? this._createNoneOption(option) : this._createDrinkOption(option));
        });

        container.appendChild(grid);
    }

    renderOptionsGrid(container, options) {
        if (!Array.isArray(options)) {
            Logger.error('renderOptionsGrid: options is not an array:', options);
            return;
        }

        const optionsGrid = this._createElement('div', 'drink-modal__grid'); // Dynamic auto-fill grid

        options.forEach(option => {
            const optionButton = this._createElement('button', 'drink-option drink-modal__option nav-button');
            optionButton.textContent = option;

            // Translation attributes
            const key = `drink_options.${simpleHash(option)}`;
            optionButton.setAttribute('data-translate', key);
            optionButton.setAttribute('data-namespace', 'menu');
            optionButton.setAttribute('data-original-text', option);

            // Add click handler for single selection
            optionButton.addEventListener('click', () => {
                container.querySelectorAll('.drink-option').forEach(btn => btn.classList.remove('selected'));
                optionButton.classList.add('selected');
                this.controller.logic.selectedDrinks = [option];
                this.controller.logic.drinkCounts = {};
            });

            optionsGrid.appendChild(optionButton);
        });

        container.appendChild(optionsGrid);
    }

    /**
     * Set ups and opens the Drink Options Modal using the new ModalSystem.
     * @private
     */
    _setupDrinkModal() {
        const product = this.controller.logic.currentProduct;
        const { drinkOptions } = this.controller.logic.getDrinkOptionsForProduct(product.name);
        const priceType = product.priceType;

        Logger.info('[OrderUI:LOG] _setupDrinkModal for:', {
            product: product.name,
            priceType: priceType,
            optionsCount: drinkOptions?.length
        });

        // 1. Build Content Wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'drink-options-wrapper u-full-width';

        // Add Dynamic Subtitle/Message if available
        const { title: dynamicTitle, subtitle } = this.controller.logic.getDrinkModalTitle(product.name);
        if (subtitle) {
            const messageEl = document.createElement('p');
            messageEl.className = 'drink-options-message';
            messageEl.textContent = subtitle;
            contentWrapper.appendChild(messageEl);
        }

        // 2. Render Options based on Type
        // LITRO/COPA (Single Select) -> Grid
        if (priceType === CONSTANTS.PRICE_TYPES.LITER || priceType === CONSTANTS.PRICE_TYPES.CUP) {
            this.renderOptionsGrid(contentWrapper, drinkOptions);
        }
        // BOTELLA (Multi Select) -> Grid (2 cols)
        else {
            this.renderDrinkOptions(contentWrapper, drinkOptions);
        }

        // 3. Launch Modal via System
        ModalSystem.show({
            title: dynamicTitle,
            content: contentWrapper,
            size: 'large sys-modal-compact sys-modal-top sys-modal-premium-buttons bottle-modal',
            actions: [
                {
                    label: 'Confirmar',
                    type: 'contrast', // Restored Matte Black style
                    onClick: () => {
                        this.controller.confirmDrinkOptions();
                        ModalSystem.close();
                    }
                },
                {
                    label: 'Cancelar',
                    type: 'ghost',
                    onClick: () => {
                        this.controller.cancelProductSelection();
                    }
                }
            ]
        });

        // 4. Update Counters (After DOM injection)
        setTimeout(() => {
            if (priceType !== CONSTANTS.PRICE_TYPES.LITER && priceType !== CONSTANTS.PRICE_TYPES.CUP) {
                this.updateTotalDrinkCount();
            }
        }, 50);
    }


    async _retranslateIfNeeded(scopeElement) {
        try {
            const TranslationServiceModule = await import('../../../../Shared/services/TranslationService.js');
            const TranslationService = TranslationServiceModule.default || TranslationServiceModule;
            const currentLang = typeof TranslationService.getCurrentLanguage === 'function'
                ? TranslationService.getCurrentLanguage()
                : 'es';
            if (currentLang && currentLang !== 'es') {
                try {
                    const DOMTranslatorModule = await import('../../../../Shared/services/DOMTranslator.js');
                    const DOMTranslator = DOMTranslatorModule.default || DOMTranslatorModule;
                    if (DOMTranslator && typeof DOMTranslator.translateElement === 'function') {
                        const root = scopeElement || document;
                        const elements = root.querySelectorAll('[data-translate], [data-translate-placeholder]');
                        await Promise.all(Array.from(elements).map(el => DOMTranslator.translateElement(el, currentLang)));
                    } else if (typeof TranslationService.translatePage === 'function') {
                        TranslationService.translatePage(currentLang);
                    }
                } catch (err) {
                    Logger.warn('DOMTranslator not available, using translatePage', err);
                    if (typeof TranslationService.translatePage === 'function') {
                        TranslationService.translatePage(currentLang);
                    }
                }
            }
        } catch (error) {
            Logger.warn('Failed to re-apply translation in OrderUI', error);
        }
    }

    _createNoneOption(option) {
        const noneOption = this._createElement('button', 'drink-option');
        noneOption.textContent = option;
        noneOption.setAttribute('data-original-text', option);
        noneOption.setAttribute('data-translate', `drinks.option.${simpleHash(option)}`);
        noneOption.setAttribute('data-namespace', 'drinks');

        noneOption.addEventListener('click', () => {
            // Handle none option click - usually clears selection or adds 'Ninguno'
            // For now, let's assume it's handled by delegation or we add a listener
            // In original code, it might have been handled by delegation or specific listener
            // Let's delegate to controller
            this.controller.handleOptionClick(option);
        });
        return noneOption;
    }

    _createDrinkOption(option) {
        const optionContainer = this._createElement('div', 'drink-option-container');
        const optionName = this._createElement('span', 'drink-option-name');
        optionName.textContent = option;
        optionName.setAttribute('data-original-text', option);
        optionName.setAttribute('data-translate', `drinks.option.${simpleHash(option)}`);
        optionName.setAttribute('data-namespace', 'drinks');

        const counterContainer = this._createElement('div', 'counter-container');
        const countDisplay = this._createElement('span', 'count-display', '0');

        // Initialize count if exists in logic
        const currentCount = this.controller.logic.drinkCounts[option] || 0;
        countDisplay.textContent = currentCount;
        if (currentCount > 0) optionContainer.classList.add('selected');

        const decrementBtn = this._createCounterButton('−', () => this._handleDrinkDecrement(option, countDisplay, optionContainer));
        const incrementBtn = this._createCounterButton('+', () => this._handleDrinkIncrement(option, countDisplay, optionContainer));

        counterContainer.append(decrementBtn, countDisplay, incrementBtn);
        optionContainer.append(optionName, counterContainer);
        return optionContainer;
    }

    _createCounterButton(text, clickHandler) {
        const btn = this._createElement('button', 'counter-btn');
        btn.textContent = text;
        if (clickHandler) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent bubbling if needed
                clickHandler();
            });
        }
        return btn;
    }

    _handleDrinkDecrement(option, countDisplay, optionContainer) {
        const newCount = this.controller.handleDrinkDecrement(option);
        if (newCount !== null) {
            countDisplay.textContent = newCount;
            this.updateTotalDrinkCount();
        }
    }

    _handleDrinkIncrement(option, countDisplay, optionContainer) {
        const newCount = this.controller.handleDrinkIncrement(option);
        if (newCount !== null) {
            countDisplay.textContent = newCount;
            this.updateTotalDrinkCount();
        }
    }

    updateTotalDrinkCount() {
        const totalCountElement = document.getElementById('total-drinks-count');
        const total = this.controller.logic.calculateTotalDrinkCount();
        if (totalCountElement) totalCountElement.textContent = total;

        // Update buttons disabled state
        const maxCount = this.controller.logic.maxDrinkCount;
        const isSpecial = this.controller.logic.isSpecialDrinkProduct(); // We need to expose this in logic

        document.querySelectorAll('.drink-option-container .counter-btn').forEach(btn => {
            if (btn.textContent === '+') {
                // Simple check for now, can be more complex with special rules
                btn.disabled = total >= maxCount;
            }
        });
    }

    // Customization Modals Protocol
    _launchCustomizationModal(config) {
        const product = this.controller.logic.currentProduct;

        ModalSystem.show({
            title: product.name,
            content: config.content,
            actions: [
                {
                    label: 'Confirmar',
                    type: 'contrast', // Matte Black
                    onClick: config.onConfirm
                },
                {
                    label: 'Cancelar',
                    type: 'ghost',
                    onClick: () => this.controller.cancelProductSelection()
                }
            ]
        });
    }

    showFoodCustomizationModal() {
        this._showIngredientsCustomizationModal({
            title: '¿Desea su platillo con todos los ingredientes?',
            placeholder: 'Indique los ingredientes que desea quitar o cambios adicionales',
            wrapperClass: 'food-customization-wrapper'
        });
    }

    showPlatosCustomizationModal() {
        this._showIngredientsCustomizationModal({
            title: '¿Desea su plato con todos los ingredientes?',
            placeholder: 'Indique si desea quitar algún ingrediente o guarnición',
            wrapperClass: 'platos-customization-wrapper'
        });
    }

    /**
     * Internal helper to handle the common "Yes/No (Customize)" pattern 
     * shared by Food, Snacks and Platos Fuertes.
     * @private
     */
    _showIngredientsCustomizationModal(config) {
        const product = this.controller.logic.currentProduct;

        // 1. Build Content Shell
        const contentWrapper = document.createElement('div');
        contentWrapper.className = `${config.wrapperClass} u-modal-text-center`;

        const question = document.createElement('h3');
        question.textContent = config.title;
        question.className = 'modal-section-title';
        contentWrapper.appendChild(question);

        const choiceContainer = document.createElement('div');
        choiceContainer.className = 'ingredients-choice u-flex u-gap-md u-flex-center';

        const btnNo = document.createElement('button');
        btnNo.className = 'btn btn-ghost';
        btnNo.textContent = 'No (Personalizar)';

        const btnYes = document.createElement('button');
        btnYes.className = 'btn btn-primary active';
        btnYes.textContent = 'Sí (Normal)';

        const customizationInputContainer = document.createElement('div');
        customizationInputContainer.className = 'u-hidden u-fade-in u-mt-lg';

        const textarea = document.createElement('textarea');
        textarea.className = 'form-textarea';
        textarea.placeholder = config.placeholder;
        customizationInputContainer.appendChild(textarea);

        btnNo.onclick = () => {
            btnNo.classList.add('active');
            btnYes.classList.remove('active');
            customizationInputContainer.classList.remove('u-hidden');
            textarea.focus();
        };

        btnYes.onclick = () => {
            btnYes.classList.add('active');
            btnNo.classList.remove('active');
            customizationInputContainer.classList.add('u-hidden');
            textarea.value = '';
        };

        choiceContainer.append(btnYes, btnNo);
        contentWrapper.appendChild(choiceContainer);
        contentWrapper.appendChild(customizationInputContainer);

        // 2. Launch using System Protocol
        this._launchCustomizationModal({
            content: contentWrapper,
            onConfirm: () => {
                const customization = [];
                const additionalText = textarea.value.trim();
                customization.push(additionalText ? `Personalizado: ${additionalText}` : 'Sin cambios');
                this.controller.confirmProductWithCustomization(customization);
                ModalSystem.close();
            }
        });
    }

    showMeatCustomizationModal() {
        const logic = this.controller.logic;
        const product = logic.currentProduct;

        // 1. Build Content Shell
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'meat-customization-wrapper';

        // Cooking Options Section
        const cookingTitle = document.createElement('h3');
        cookingTitle.textContent = 'Seleccione el término de cocción:';
        cookingTitle.className = 'modal-section-title';
        contentWrapper.appendChild(cookingTitle);

        const cookingOptions = document.createElement('div');
        cookingOptions.className = 'cooking-options sys-modal-grid u-mb-lg';

        const terms = [
            { id: 'medio', label: 'Término ½' },
            { id: 'tres-cuartos', label: 'Término ¾' },
            { id: 'bien-cocido', label: 'Bien Cocido' }
        ];

        terms.forEach(term => {
            const btn = document.createElement('button');
            btn.className = 'cooking-option btn btn-ghost';
            btn.textContent = term.label;
            btn.dataset.term = term.id;

            btn.onclick = () => {
                cookingOptions.querySelectorAll('.cooking-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                btn.classList.add('active');
                logic.selectedCookingTerm = term.id;
                cookingOptions.classList.remove('u-validation-error');
            };
            cookingOptions.appendChild(btn);
        });
        contentWrapper.appendChild(cookingOptions);

        // Garnish Section
        const garnishTitle = document.createElement('h3');
        garnishTitle.textContent = '¿Desea cambiar algo de la guarnición?';
        garnishTitle.className = 'modal-section-title';
        contentWrapper.appendChild(garnishTitle);

        const garnishChoice = document.createElement('div');
        garnishChoice.className = 'garnish-choice u-flex u-gap-md u-mb-md';

        const btnNo = document.createElement('button');
        btnNo.className = 'btn btn-primary active'; // Default
        btnNo.textContent = 'No (Normal)';

        const btnYes = document.createElement('button');
        btnYes.className = 'btn btn-ghost';
        btnYes.textContent = 'Sí (Cambiar)';

        const garnishInputContainer = document.createElement('div');
        garnishInputContainer.className = 'u-hidden u-fade-in u-mt-md';
        const textarea = document.createElement('textarea');
        textarea.className = 'form-textarea';
        textarea.placeholder = 'Indique los cambios en la guarnición';
        garnishInputContainer.appendChild(textarea);

        btnYes.onclick = () => {
            btnYes.classList.add('active');
            btnNo.classList.remove('active');
            garnishInputContainer.classList.remove('u-hidden');
            textarea.focus();
        };

        btnNo.onclick = () => {
            btnNo.classList.add('active');
            btnYes.classList.remove('active');
            garnishInputContainer.classList.add('u-hidden');
            textarea.value = '';
        };

        garnishChoice.append(btnNo, btnYes);
        contentWrapper.appendChild(garnishChoice);
        contentWrapper.appendChild(garnishInputContainer);

        // 5. Launch using System Protocol
        this._launchCustomizationModal({
            content: contentWrapper,
            onConfirm: () => {
                if (!logic.selectedCookingTerm) {
                    cookingOptions.classList.add('u-validation-error');
                    Logger.warn('Validation failed: No cooking term selected');
                    return;
                }

                const customization = [];
                const termLabel = terms.find(t => t.id === logic.selectedCookingTerm).label;
                customization.push(termLabel);

                const garnishText = textarea.value.trim();
                customization.push(garnishText ? `Guarnición: ${garnishText}` : 'Guarnición Normal');

                this.controller.confirmProductWithCustomization(customization);
                ModalSystem.close();
            }
        });

        logic.selectedCookingTerm = null;
    }



    // Orders Screen UI (Consolidated)

    showOrdersScreen(orders, isHistory = false) {
        Logger.info('Showing orders screen', { orderCount: orders.length, isHistory });

        const elements = {
            mainContentScreen: document.querySelector('.main-content-screen'),
            contentContainer: document.getElementById('content-container'),
            hamburgerBtn: document.getElementById('hamburger-btn'),
            ordersScreen: document.querySelector('.orders-screen')
        };

        // Hide hamburger button
        if (elements.hamburgerBtn) {
            elements.hamburgerBtn.className = 'hamburger-btn hamburger-hidden';
        }

        // Hide main content
        if (elements.contentContainer) {
            elements.contentContainer.className = 'content-hidden';
        }

        // Remove existing orders screen to avoid duplicates
        if (elements.ordersScreen && elements.ordersScreen.parentNode) {
            elements.ordersScreen.parentNode.removeChild(elements.ordersScreen);
        }

        // Create and append new orders screen
        if (elements.mainContentScreen) {
            elements.mainContentScreen.appendChild(this._createOrdersScreen(orders, isHistory));
        }
    }

    _createOrdersScreen(orders, isHistory) {
        const ordersScreen = this._createElement('div', 'orders-screen');

        const header = this._createOrdersHeader(isHistory);
        const ordersListContainer = this._createElement('div', 'orders-list-container');
        const ordersList = this._createElement('div', isHistory ? 'history-list-content' : 'orders-list', 'orders-list');

        // Populate orders
        this._populateOrdersList(ordersList, orders, isHistory);

        ordersListContainer.appendChild(ordersList);
        ordersScreen.appendChild(header);
        ordersScreen.appendChild(ordersListContainer);

        // Add clear history button if showing history
        if (isHistory && orders.length > 0) {
            this._createFixedBottomButton(ordersScreen, 'Limpiar Historial', () => {
                this.controller.handleClearHistory();
            });
        }

        return ordersScreen;
    }

    _createOrdersHeader(isHistory) {
        const header = this._createElement('div', ' orders-screen-header');

        const backBtn = this._createElement('button', 'btn btn-ghost nav-button orders-back-btn', 'Volver');
        backBtn.addEventListener('click', async () => {
            await this.controller.hideOrdersScreen();
        });

        const historyBtn = this._createElement('button', 'btn btn-ghost nav-button history-btn', isHistory ? 'Ver Activas' : 'Ver Historial');
        historyBtn.addEventListener('click', () => {
            this.controller.toggleOrderHistoryView();
        });

        header.appendChild(backBtn);
        header.appendChild(historyBtn);

        return header;
    }

    _populateOrdersList(container, orders, includeDeleteButton) {
        container.innerHTML = '';

        if (orders.length === 0) {
            const emptyMsg = this._createElement('div');
            emptyMsg.className = 'orders-empty-state';
            emptyMsg.textContent = includeDeleteButton ? 'No hay órdenes en el historial.' : 'No hay órdenes guardadas.';
            container.appendChild(emptyMsg);
            return;
        }

        orders.forEach((order) => {
            container.appendChild(this._createOrderElement(order, includeDeleteButton));
        });
    }

    _createOrderElement(order, includeDeleteButton) {
        const orderElement = this._createElement('div', 'saved-order');

        // Order header with timestamp
        const header = this._createElement('h3');
        header.textContent = `Orden - ${order.completedAt || new Date(order.timestamp).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}`;
        orderElement.appendChild(header);

        // Order items list
        const itemsList = this._createElement('div', 'saved-order-items');
        order.items.forEach(item => {
            const itemDiv = this._createElement('div', 'saved-order-item');

            const itemName = this._createElement('div', 'saved-order-item-name');
            itemName.textContent = item.name;
            itemDiv.appendChild(itemName);

            if (item.customizations && item.customizations.length > 0) {
                const customizations = this._createElement('div', 'saved-order-item-customization');
                customizations.textContent = item.customizations.join(', ');
                itemDiv.appendChild(customizations);
            }

            const itemPrice = this._createElement('div', 'saved-order-item-price');
            itemPrice.textContent = formatPrice(item.price);
            itemDiv.appendChild(itemPrice);

            itemsList.appendChild(itemDiv);
        });
        orderElement.appendChild(itemsList);

        // Order total
        const totalDiv = this._createElement('div', 'saved-order-total');
        totalDiv.textContent = `Total: ${formatPrice(order.total)}`;
        orderElement.appendChild(totalDiv);

        // Delete button if  needed
        if (includeDeleteButton) {
            const deleteBtn = this._createElement('button', 'btn btn-ghost nav-button delete-order-btn', 'Eliminar');
            deleteBtn.addEventListener('click', () => {
                this.controller.handleDeleteOrder(order.id);
            });
            orderElement.appendChild(deleteBtn);
        }

        return orderElement;
    }

    _createFixedBottomButton(parentContainer, buttonText, onClick) {
        const fixedContainer = this._createElement('div', 'fixed-bottom-actions');
        const button = this._createElement('button', 'btn btn-primary nav-button clear-history-btn', buttonText);
        button.addEventListener('click', onClick);

        fixedContainer.appendChild(button);
        parentContainer.appendChild(fixedContainer);
    }

    async hideOrdersScreen() {
        const ordersScreen = document.querySelector('.orders-screen');
        if (ordersScreen && ordersScreen.parentNode) {
            ordersScreen.parentNode.removeChild(ordersScreen);
        }

        // Show hamburger button
        const hamburgerBtn = document.getElementById('hamburger-btn');
        if (hamburgerBtn) {
            hamburgerBtn.className = 'hamburger-btn';
        }

        // Show content container
        const contentContainer = document.getElementById('content-container');
        if (contentContainer) {
            contentContainer.className = 'content-container';
        }
    }

    updateOrdersDisplay(orders, isHistory) {
        const ordersList = document.querySelector(isHistory ? '.history-list-content' : '.orders-list');
        if (ordersList) {
            this._populateOrdersList(ordersList, orders, !isHistory);
        }
    }

    _isLandscape() {
        return window.innerWidth > window.innerHeight;
    }

    _handleMobileOrientation(sidebar) {
        if (!sidebar) return;
        if (!this._isLandscape()) {
            sidebar.classList.add('mobile-portrait');
        } else {
            sidebar.classList.remove('mobile-portrait');
        }
    }
}
