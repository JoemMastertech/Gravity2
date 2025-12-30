import { setSafeInnerHTML, showModal, hideModal } from '../../../../Shared/utils/domUtils.js';
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

    // Modals
    showModal(modalId) { showModal(modalId); }
    hideModal(modalId) { hideModal(modalId); }

    showValidationModal(message) {
        console.log('[OrderUI] 4. showValidationModal called with:', message); // TRACE
        this._createSimpleModal(message, 'Aceptar');
    }

    _createSimpleModal(message, buttonText, onConfirm) {
        console.log('[OrderUI] 5. Creating simple modal DOM'); // TRACE
        const modalBackdrop = this._createElement('div', 'modal-backdrop active');
        const modalContent = this._createElement('div', 'modal-content');

        const modalTitle = this._createElement('h3');
        modalTitle.textContent = message;

        const modalActions = this._createElement('div', 'modal-actions');
        const confirmBtn = this._createElement('button', 'btn btn-primary nav-button');
        confirmBtn.textContent = buttonText;
        confirmBtn.addEventListener('click', () => {
            document.body.removeChild(modalBackdrop);
            if (onConfirm) onConfirm();
        });

        modalActions.appendChild(confirmBtn);
        [modalTitle, modalActions].forEach(el => modalContent.appendChild(el));
        modalBackdrop.appendChild(modalContent);
        document.body.appendChild(modalBackdrop);
        console.log('[OrderUI] 6. Modal appended to body'); // TRACE
    }

    showConfirmationModal(title, message, onConfirm) {
        try {
            const modalBackdrop = this._createElement('div', 'modal-backdrop active');
            const modalContent = this._createElement('div', 'modal-content');

            const modalTitle = this._createElement('h3');
            modalTitle.textContent = title;

            const modalMessage = this._createElement('p');
            modalMessage.textContent = message;
            modalMessage.className = 'modal-confirmation-message';

            const modalActions = this._createElement('div', 'modal-actions');
            const buttons = [
                { text: 'Aceptar', handler: () => { onConfirm(); document.body.removeChild(modalBackdrop); } },
                { text: 'Cancelar', handler: () => document.body.removeChild(modalBackdrop) }
            ];

            buttons.forEach(({ text, handler }) => {
                // System Migration: Conditional Variant
                const variant = text === 'Aceptar' ? 'btn-primary' : 'btn-ghost';
                const btn = this._createElement('button', `btn ${variant} nav-button`);
                btn.textContent = text;
                btn.addEventListener('click', handler);
                modalActions.appendChild(btn);
            });

            [modalTitle, modalMessage, modalActions].forEach(el => modalContent.appendChild(el));
            modalBackdrop.appendChild(modalContent);
            document.body.appendChild(modalBackdrop);
        } catch (error) {
            console.error('[OrderUI] Error in showConfirmationModal:', error);
        }
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

        // Import SidebarManager dynamically if needed, or assume it's available via DI/Global
        // Since we are moving to a unified system, we'll try to use the imported module logic or global
        // For now, let's assume we import it at top of file, or use a dynamic import.
        // Given existing structure, we will update the imports next. 
        // For this step, we delegate logic:

        const hasItems = this.controller.core && this.controller.core.getItems && this.controller.core.getItems().length > 0;
        const shouldBeVisible = isActive || hasItems;

        import('../managers/SidebarManager.js').then(module => {
            const sidebarManager = module.default;
            if (shouldBeVisible) {
                sidebarManager.open(sidebar.id || 'order-sidebar');
            } else {
                sidebarManager.close(sidebar.id || 'order-sidebar', true); // Force close authorized by Logic
            }
        }).catch(err => {
            console.error('Failed to load SidebarManager', err);
            // Fallback (Simple toggle) if manager fails
            sidebar.classList.toggle('sidebar-visible', shouldBeVisible);
            document.body.classList.toggle('sidebar-open', shouldBeVisible);
        });
    }

    _handleMobileOrientation(sidebar) {
        const isLandscape = this._isLandscape();
        sidebar.classList.remove('sidebar-mobile-portrait', 'sidebar-mobile-landscape',
            'sidebar-mobile-hidden', 'sidebar-landscape-hidden', 'active');
        if (isLandscape) {
            sidebar.classList.add('sidebar-mobile-landscape', 'active');
        } else {
            sidebar.classList.add('sidebar-mobile-portrait');
        }
    }

    _isLandscape() {
        return window.innerWidth > window.innerHeight;
    }

    _handleMobileHiding(sidebar) {
        const isLandscape = this._isLandscape();
        sidebar.classList.remove('sidebar-mobile-portrait', 'sidebar-mobile-landscape',
            'sidebar-mobile-hidden', 'sidebar-landscape-hidden', 'active');
        sidebar.classList.remove('is-open');

        if (isLandscape) {
            sidebar.classList.add('sidebar-landscape-hidden');
        } else {
            sidebar.classList.add('sidebar-mobile-hidden');
        }
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
    // Drink Options UI
    showDrinkOptionsModal() {
        this.renderModalFromTemplate('drink-options-modal', 'drink-options-template');
        // Use setTimeout to ensure DOM is updated before setup
        setTimeout(() => this._setupDrinkModal(), 50);
    }

    renderDrinkOptions(container, options) {
        if (!Array.isArray(options)) {
            Logger.error('renderDrinkOptions: options is not an array:', options);
            return;
        }

        options.forEach(option => {
            container.appendChild(option === 'Ninguno' ? this._createNoneOption(option) : this._createDrinkOption(option));
        });
    }

    renderOptionsGrid(container, options) {
        if (!Array.isArray(options)) {
            Logger.error('renderOptionsGrid: options is not an array:', options);
            return;
        }

        const optionsGrid = this._createElement('div', 'options-grid drink-modal__grid');

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
                // Deselect all
                container.querySelectorAll('.drink-option').forEach(btn => {
                    btn.classList.remove('selected');
                });
                // Select clicked
                optionButton.classList.add('selected');
                // Update controller state
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

        // 1. Build Content Wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'drink-options-wrapper';

        // 2. Render Options based on Type
        // LITRO/COPA (Single Select) -> Grid
        if (priceType === CONSTANTS.PRICE_TYPES.LITER || priceType === CONSTANTS.PRICE_TYPES.CUP) {
            this.renderOptionsGrid(contentWrapper, drinkOptions);
        }
        // BOTELLA (Multi Select) -> List with Counters
        else {
            this.renderDrinkOptions(contentWrapper, drinkOptions);

            // Add Counter Display
            const counterDiv = document.createElement('div');
            counterDiv.id = 'total-drinks-count-container'; // ID required for logic updates
            counterDiv.className = 'total-drinks-container text-center mt-3';
            counterDiv.style.color = '#fff';
            counterDiv.innerHTML = `Total seleccionados: <strong id="total-drinks-count">0</strong>`;
            contentWrapper.appendChild(counterDiv);
        }

        // 3. Launch Modal via System
        ModalSystem.show({
            title: `┬┐Con qu├® desea acompa├▒ar su ${product.name}?`,
            content: contentWrapper,
            actions: [
                {
                    label: 'Cancelar',
                    type: 'ghost',
                    onClick: () => {
                        this.controller.cancelProductSelection();
                        // ModalSystem handles the visual close
                    }
                },
                {
                    label: 'Confirmar',
                    type: 'primary',
                    onClick: () => {
                        this.controller.confirmDrinkOptions();
                        ModalSystem.show({}).close(); // Close the current modal instance
                    }
                }
            ],
            onClose: () => {
                // Optional cleanup
            }
        });

        // 4. Update Counters (After DOM injection)
        setTimeout(() => {
            if (priceType !== CONSTANTS.PRICE_TYPES.LITER && priceType !== CONSTANTS.PRICE_TYPES.CUP) {
                this.updateTotalDrinkCount();
            }
        }, 50);
    }

    _updateModalTitle() {
        if (!this.controller.logic.currentProduct) {
            Logger.error('No current product selected for modal title update');
            return;
        }
        const modalTitle = document.querySelector('#drink-options-modal h3');
        if (!modalTitle) return;

        const { title, subtitle } = this.controller.logic.getDrinkModalTitle(this.controller.logic.currentProduct.name);
        const styleSpan = '<span class="modal-subtitle">';

        modalTitle.innerHTML = `${title}${styleSpan}${subtitle}</span>`;
        // Re-apply translation
        this._retranslateIfNeeded(document.getElementById('drink-options-modal'));
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

        const decrementBtn = this._createCounterButton('-', () => this._handleDrinkDecrement(option, countDisplay, optionContainer));
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

    // Customization Modals
    showFoodCustomizationModal() {
        this.renderModalFromTemplate('food-customization-modal', 'food-customization-template');
        setTimeout(() => this._setupFoodModal(), 50);
    }

    _setupFoodModal() {
        const ingredientsContainer = document.getElementById('ingredients-input-container');
        if (ingredientsContainer) ingredientsContainer.className = 'input-container-hidden';
        const ingredientsInput = document.getElementById('ingredients-to-remove');
        if (ingredientsInput) ingredientsInput.value = '';
        this.showModal('food-customization-modal');
    }

    showMeatCustomizationModal() {
        this.renderModalFromTemplate('meat-customization-modal', 'meat-customization-template');
        setTimeout(() => this._setupMeatModal(), 50);
    }

    _setupMeatModal() {
        const garnishContainer = document.getElementById('garnish-input-container');
        if (garnishContainer) garnishContainer.className = 'input-container-hidden';

        const garnishActions = document.querySelector('.garnish-actions');
        if (garnishActions) garnishActions.className = 'modal-actions garnish-actions input-container-hidden';

        const garnishModifications = document.getElementById('garnish-modifications');
        if (garnishModifications) garnishModifications.value = '';

        this.controller.logic.selectedCookingTerm = null;
        this._setupCookingOptions();
        this.showModal('meat-customization-modal');
    }

    _setupCookingOptions() {
        const cookingOptions = document.querySelectorAll('.cooking-option');
        cookingOptions.forEach(option => {
            option.classList.remove('selected');
            option.addEventListener('click', (e) => {
                cookingOptions.forEach(opt => opt.classList.remove('selected'));
                e.target.classList.add('selected');
                this.controller.logic.selectedCookingTerm = e.target.getAttribute('data-term');
            });
        });
    }

    renderModalFromTemplate(modalId, templateId) {
        const modal = document.getElementById(modalId);
        const template = document.getElementById(templateId);

        if (!modal || !template) {
            Logger.error('renderModalFromTemplate: Modal or Template not found', { modalId, templateId });
            return;
        }

        modal.innerHTML = '';
        const content = template.content.cloneNode(true);
        modal.appendChild(content);
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
    renderDrinkOptions(container, options) {
        if (!Array.isArray(options)) {
            Logger.error('renderDrinkOptions: options is not an array:', options);
            return;
        }

        options.forEach(option => {
            container.appendChild(option === 'Ninguno' ? this._createNoneOption(option) : this._createDrinkOption(option));
        });
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

        const decrementBtn = this._createCounterButton('-', () => this._handleDrinkDecrement(option, countDisplay, optionContainer));
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
            if (newCount === 0) {
                optionContainer.classList.remove('selected');
            }
            this.updateTotalDrinkCount();
        }
    }

    _handleDrinkIncrement(option, countDisplay, optionContainer) {
        const newCount = this.controller.handleDrinkIncrement(option);
        if (newCount !== null) {
            countDisplay.textContent = newCount;
            optionContainer.classList.add('selected');
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

    // Customization Modals
    // Customization Modals
    showFoodCustomizationModal() {
        this._setupFoodModal();
    }

    /**
     * Set ups and opens the Generic Food Customization Modal using ModalSystem.
     * @private
     */
    _setupFoodModal() {
        const logic = this.controller.logic;

        // 1. Build Content Wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'food-customization-wrapper';

        // 1.1 Question (Centered)
        const description = document.createElement('p');
        description.textContent = '┬┐Desea agregar el producto con todos sus ingredientes?';
        description.style.textAlign = 'center'; // Changed from justify
        description.style.fontSize = '1.1rem';
        description.className = 'mb-4';
        contentWrapper.appendChild(description);

        // 1.2 Initial Buttons (Centered - Utility Classes)
        const initialButtons = document.createElement('div');
        initialButtons.className = 'u-modal-actions u-modal-mb-lg';

        const btnYes = document.createElement('button');
        btnYes.className = 'btn btn-contrast'; // Matched to 'No'
        btnYes.textContent = 'S├¡';

        const btnNo = document.createElement('button');
        btnNo.className = 'btn btn-contrast';
        btnNo.textContent = 'No';

        initialButtons.appendChild(btnYes);
        initialButtons.appendChild(btnNo);
        contentWrapper.appendChild(initialButtons);

        // 1.3 Form
        const formContainer = document.createElement('div');
        formContainer.className = 'hidden u-modal-mt-md';

        // Guidance Text
        const guidance = document.createElement('p');
        guidance.textContent = 'Describa qu├® quiere cambiar del platillo:';
        guidance.className = 'u-modal-text-center u-modal-mb-md text-sm text-gray-300';
        formContainer.appendChild(guidance);

        const ingredientsInput = document.createElement('textarea');
        ingredientsInput.className = 'form-input ingredients-input w-full p-2 border rounded';
        ingredientsInput.placeholder = 'Escriba las modificaciones (ej. Sin cebolla)...';
        ingredientsInput.rows = 3;
        formContainer.appendChild(ingredientsInput);

        // Actions: Confirm (Left) / Cancel (Right) - Centered
        const formActions = document.createElement('div');
        formActions.className = 'u-modal-actions u-modal-mt-md';

        const btnConfirm = document.createElement('button');
        btnConfirm.className = 'btn btn-ghost'; // Changed to match Cancel
        btnConfirm.textContent = 'Confirmar';

        const btnCancel = document.createElement('button');
        btnCancel.className = 'btn btn-ghost';
        btnCancel.textContent = 'Cancelar';

        formActions.appendChild(btnConfirm); // Confirm first
        formActions.appendChild(btnCancel);  // Cancel second

        formContainer.appendChild(formActions);

        contentWrapper.appendChild(formContainer);

        // 2. Logic Interaction

        // ... (Listeners same as before, ensuring vars are captured) ...

        // FLOW: YES
        btnYes.onclick = () => {
            this.controller.addProductToOrder({
                name: logic.currentProduct.name,
                price: logic.currentProduct.price,
                category: logic.currentCategory,
                customizations: ['Con todo']
            });
            new ModalSystem().close();
        };

        // FLOW: NO
        btnNo.onclick = () => {
            description.style.display = 'none'; // Hide Question
            initialButtons.style.display = 'none'; // Hide Buttons
            formContainer.classList.remove('hidden');
            ingredientsInput.focus();
        };

        // FLOW: CANCEL
        btnCancel.onclick = () => {
            this.controller.addProductToOrder({
                name: logic.currentProduct.name,
                price: logic.currentProduct.price,
                category: logic.currentCategory,
                customizations: ['Con todo']
            });
            new ModalSystem().close();
        };

        // FLOW: CONFIRM
        btnConfirm.onclick = () => {
            const modifications = ingredientsInput.value.trim();
            const customizations = modifications ? [`Sin: ${modifications}`] : ['Con todo'];

            this.controller.addProductToOrder({
                name: logic.currentProduct.name,
                price: logic.currentProduct.price,
                category: logic.currentCategory,
                customizations
            });
            new ModalSystem().close();
        };

        // 3. Launch Modal
        ModalSystem.show({
            title: logic.currentProduct.name, // Removed 'Personalizar ' prefix
            content: contentWrapper,
            actions: []
        });
    }

    /* DRINK OPTIONS MODAL (Restored & Systematized) */
    showDrinkOptionsModal() {
        this.renderModalFromTemplate('drink-options-modal', 'drink-options-template');
        // Slight delay to ensure DOM is ready inside modal
        setTimeout(() => this._setupDrinkModal(), 50);
    }

    _setupDrinkModal() {
        const container = document.getElementById('drink-options-container');
        if (!container) return;

        container.innerHTML = '';
        container.className = 'drink-options-grid'; // Defined in _modals_custom.scss

        const productName = this.controller.logic.currentProduct.name;
        const result = this.controller.getDrinkOptionsForProduct(productName);
        const options = result.drinkOptions || [];

        if (!options || options.length === 0) {
            container.innerHTML = '<p>No hay opciones disponibles.</p>';
            return;
        }

        const priceType = this.controller.logic.currentProduct.priceType;
        const isSingleSelection = (priceType === 'precioLitro' || priceType === 'precioCopa');

        options.forEach(option => {
            // Card Container
            const card = this._createElement('div', 'drink-option-card');

            // Title
            const title = this._createElement('div', 'drink-option-title', option);
            card.appendChild(title);

            if (isSingleSelection) {
                // SINGLE SELECTION (Litro/Copa)
                // Compact style for simple buttons
                card.classList.add('compact');

                // Make the whole card clickable or use a selection indicator
                card.style.cursor = 'pointer';
                card.onclick = () => this._handleSingleDrinkSelection(option, card);

                // Pre-select if already active
                if (this.controller.logic.drinkCounts[option] > 0) {
                    card.classList.add('active');
                }

            } else {
                // MULTI SELECTION (Botella) => Counters
                const controls = this._createElement('div', 'drink-card-controls');

                const decBtn = this._createElement('button', 'btn btn-icon btn-sm action-btn decrement-btn');
                decBtn.innerHTML = '-';
                decBtn.onclick = (e) => {
                    e.stopPropagation();
                    const newCount = this.controller.handleDrinkDecrement(option);
                    if (newCount !== null) countDisplay.textContent = newCount;
                };

                const countDisplay = this._createElement('span', 'drink-card-counter', '0');

                const incBtn = this._createElement('button', 'btn btn-icon btn-sm action-btn increment-btn');
                incBtn.innerHTML = '+';
                incBtn.onclick = (e) => {
                    e.stopPropagation();
                    const newCount = this.controller.handleDrinkIncrement(option);
                    if (newCount !== null) countDisplay.textContent = newCount;
                };

                controls.appendChild(decBtn);
                controls.appendChild(countDisplay);
                controls.appendChild(incBtn);
                card.appendChild(controls);
            }

            container.appendChild(card);
        });

        this.showModal('drink-options-modal');
    }

    _handleSingleDrinkSelection(option, cardElement) {
        // Reset Logic State
        this.controller.logic.drinkCounts = {};
        this.controller.logic.selectedDrinks = [];

        // Add new selection logic
        // We use handleDrinkIncrement to safely add the new one, assuming 0 start
        // Or manually set 1. Let's use controller method to be safe with validation logic if any.
        // Actually, logic.maxDrinkCount might block if we don't reset. We reset above.

        this.controller.handleDrinkIncrement(option);

        // Update UI Visuals
        const container = document.getElementById('drink-options-container');
        Array.from(container.children).forEach(c => c.classList.remove('active'));
        cardElement.classList.add('active');
    }


    showMeatCustomizationModal() {
        this._setupMeatModal();
    }

    showPlatosCustomizationModal() {
        this._setupPlatosModal();
    }

    /**
     * Set ups and opens the Platos Fuertes Customization Modal using ModalSystem.
     * @private
     */
    _setupPlatosModal() {
        const logic = this.controller.logic;

        // 1. Build Content Wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'platos-customization-wrapper';

        // 1.1 Question (Justified)
        // 1.1 Question (Centered)
        const description = document.createElement('p');
        description.textContent = '┬┐Desea agregar el producto con todos sus ingredientes?';
        description.className = 'u-modal-text-center u-modal-mb-lg';
        description.style.fontSize = '1.1rem';
        contentWrapper.appendChild(description);

        // 1.2 Initial Buttons (Centered - Utility Classes)
        const initialButtons = document.createElement('div');
        initialButtons.className = 'u-modal-actions u-modal-mb-lg';

        const btnYes = document.createElement('button');
        btnYes.className = 'btn btn-contrast'; // Matched to 'No'
        btnYes.textContent = 'S├¡';

        const btnNo = document.createElement('button');
        btnNo.className = 'btn btn-contrast';
        btnNo.textContent = 'No';

        initialButtons.appendChild(btnYes);
        initialButtons.appendChild(btnNo);
        contentWrapper.appendChild(initialButtons);

        // 1.3 Form
        const formContainer = document.createElement('div');
        formContainer.className = 'hidden u-modal-mt-md';

        // Guidance Text
        const guidance = document.createElement('p');
        guidance.textContent = 'Describa qu├® quiere cambiar del platillo:';
        guidance.className = 'u-modal-text-center u-modal-mb-md text-sm text-gray-300';
        formContainer.appendChild(guidance);

        const garnishInput = document.createElement('textarea');
        garnishInput.className = 'form-input garnish-input w-full p-2 border rounded';
        garnishInput.placeholder = 'Escriba las modificaciones...';
        garnishInput.rows = 3;
        formContainer.appendChild(garnishInput);

        // Actions: Confirm (Left) / Cancel (Right) - Centered
        const formActions = document.createElement('div');
        formActions.className = 'u-modal-actions u-modal-mt-md';

        const btnConfirm = document.createElement('button');
        btnConfirm.className = 'btn btn-ghost'; // Changed to match Cancel
        btnConfirm.textContent = 'Confirmar';

        const btnCancel = document.createElement('button');
        btnCancel.className = 'btn btn-ghost';
        btnCancel.textContent = 'Cancelar';

        formActions.appendChild(btnConfirm); // Confirm first
        formActions.appendChild(btnCancel);  // Cancel second

        formContainer.appendChild(formActions);

        contentWrapper.appendChild(formContainer);

        // 2. Logic Interaction

        // FLOW: YES -> Add Standard
        btnYes.onclick = () => {
            this.controller.addProductToOrder({
                name: logic.currentProduct.name,
                price: logic.currentProduct.price,
                category: logic.currentCategory,
                customizations: ['Est├índar']
            });
            new ModalSystem().close();
        };

        // FLOW: NO
        btnNo.onclick = () => {
            description.style.display = 'none'; // Hide Question
            initialButtons.style.display = 'none'; // Hide Buttons
            formContainer.classList.remove('hidden');
            garnishInput.focus();
        };

        // FLOW: CANCEL
        btnCancel.onclick = () => {
            this.controller.addProductToOrder({
                name: logic.currentProduct.name,
                price: logic.currentProduct.price,
                category: logic.currentCategory,
                customizations: ['Est├índar']
            });
            new ModalSystem().close();
        };

        // FLOW: CONFIRM
        btnConfirm.onclick = () => {
            const modifications = garnishInput.value.trim();
            const customizations = modifications ? [`Sin: ${modifications}`] : ['Est├índar'];

            this.controller.addProductToOrder({
                name: logic.currentProduct.name,
                price: logic.currentProduct.price,
                category: logic.currentCategory,
                customizations
            });
            new ModalSystem().close();
        };

        // 3. Launch Modal
        ModalSystem.show({
            title: logic.currentProduct.name, // Removed 'Personalizar ' prefix
            content: contentWrapper,
            actions: []
        });
    }

    /**
     * Set ups and opens the Meat Customization Modal using ModalSystem.
     * @private
     */
    _setupMeatModal() {
        const logic = this.controller.logic;
        logic.selectedCookingTerm = null; // Reset selection

        // 1. Build content
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'meat-customization-wrapper';

        // 1.1 Cooking Terms
        const termsTitle = document.createElement('h3');
        termsTitle.className = 'section-title u-modal-text-center u-modal-mb-md';
        termsTitle.textContent = 'T├®rmino';
        contentWrapper.appendChild(termsTitle);

        const termsContainer = document.createElement('div');
        termsContainer.className = 'cooking-terms-grid u-modal-actions u-modal-mb-lg';
        termsContainer.style.gap = '10px'; // Override standard gap if needed

        const terms = [
            { id: 'medio', label: 'T├®rmino ┬¢' },
            { id: 'tres-cuartos', label: 'T├®rmino ┬¥' },
            { id: 'bien-cocido', label: 'Bien Cocido' }
        ];

        terms.forEach(term => {
            const btn = document.createElement('button');
            btn.className = 'cooking-option btn-ghost';
            btn.textContent = term.label;
            btn.dataset.term = term.id;
            btn.onclick = () => {
                termsContainer.querySelectorAll('.cooking-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                logic.selectedCookingTerm = term.id;
            };
            termsContainer.appendChild(btn);
        });
        contentWrapper.appendChild(termsContainer);

        // 1.2 Garnish Question
        const garnishTitle = document.createElement('p');
        garnishTitle.className = 'u-modal-text-center u-modal-mb-md text-sm text-gray-300';
        garnishTitle.textContent = '┬┐Desea cambiar algo de su Guarnici├│n?';
        contentWrapper.appendChild(garnishTitle);

        // 1.3 Initial Choice Buttons (Yes/No)
        const choiceContainer = document.createElement('div');
        choiceContainer.className = 'u-modal-actions u-modal-mb-lg';

        const btnYes = document.createElement('button');
        btnYes.className = 'btn btn-contrast'; // Changed to match No
        btnYes.textContent = 'S├¡';

        const btnNo = document.createElement('button');
        btnNo.className = 'btn btn-contrast';
        btnNo.textContent = 'No';

        choiceContainer.appendChild(btnYes);
        choiceContainer.appendChild(btnNo);
        contentWrapper.appendChild(choiceContainer);

        // 1.4 Conditional Form (Input + Actions)
        const formContainer = document.createElement('div');
        formContainer.className = 'hidden u-modal-mt-md';

        const garnishInput = document.createElement('textarea');
        garnishInput.className = 'form-input garnish-input';
        garnishInput.placeholder = 'Escriba cambios en la guarnici├│n (Opcional)';
        garnishInput.rows = 2;
        formContainer.appendChild(garnishInput);

        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'u-modal-actions u-modal-mt-md';

        const btnConfirm = document.createElement('button');
        btnConfirm.className = 'btn btn-ghost'; // Changed to match Cancel
        btnConfirm.textContent = 'Confirmar';

        const btnCancel = document.createElement('button');
        btnCancel.className = 'btn btn-ghost';
        btnCancel.textContent = 'Cancelar';

        actionsContainer.appendChild(btnConfirm);
        actionsContainer.appendChild(btnCancel);
        formContainer.appendChild(actionsContainer);
        contentWrapper.appendChild(formContainer);

        // --- Logic Handlers ---

        const validateAndAdd = (customText) => {
            if (!logic.selectedCookingTerm) {
                this.showValidationModal('Por favor seleccione un T├®rmino.');
                return false;
            }

            const termLabels = {
                'medio': 'T├®rmino ┬¢',
                'tres-cuartos': 'T├®rmino ┬¥',
                'bien-cocido': 'Bien Cocido'
            };
            const termLabel = termLabels[logic.selectedCookingTerm] || logic.selectedCookingTerm;

            // Build Customizations
            const customizations = [termLabel];
            if (customText) {
                customizations.push(customText);
            } else {
                customizations.push('Guarnici├│n Normal');
            }

            this.controller.addProductToOrder({
                name: logic.currentProduct.name,
                price: logic.currentProduct.price,
                category: logic.currentCategory,
                customizations
            });
            new ModalSystem().close();
            return true;
        };

        // Click Logic
        btnYes.onclick = () => {
            // Hide choice buttons, show form
            choiceContainer.style.display = 'none';
            formContainer.classList.remove('hidden');
            garnishInput.focus();
        };

        btnNo.onclick = () => {
            // Validate Term and Add (Standard)
            validateAndAdd(null); // Passing null triggers 'Guarnici├│n Normal' logic
        };

        btnCancel.onclick = () => {
            // Close without adding
            new ModalSystem().close();
        };

        btnConfirm.onclick = () => {
            // Validate Term and Add (Custom or Standard)
            const text = garnishInput.value.trim();
            const note = text ? `Guarnici├│n: ${text}` : null;
            validateAndAdd(note);
        };


        // 2. Launch
        ModalSystem.show({
            title: logic.currentProduct.name,
            content: contentWrapper,
            actions: []
        });
    }

    renderModalFromTemplate(modalId, templateId) {
        const template = document.getElementById(templateId);
        if (!template) {
            Logger.error(`Template ${templateId} not found`);
            return;
        }

        let modal = document.getElementById(modalId);
        if (!modal) {
            // Create wrapper if it doesn't exist
            const className = `modal modal-hidden modal--${modalId.replace('-modal', '')}`;
            modal = this._createElement('div', className);
            modal.id = modalId;
            document.body.appendChild(modal);
        } else {
            // Clear existing content
            modal.innerHTML = '';
        }

        const clone = template.content.cloneNode(true);
        modal.appendChild(clone);
    }

    // ==================== Orders Screen UI ====================

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
            emptyMsg.textContent = includeDeleteButton ? 'No hay ├│rdenes en el historial.' : 'No hay ├│rdenes guardadas.';
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
        // Styles moved to .fixed-bottom-actions in _orders.scss

        const button = this._createElement('button', 'btn btn-primary nav-button clear-history-btn', buttonText);
        // Styles moved to .clear-history-btn in _orders.scss
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
}
