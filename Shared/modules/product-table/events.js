import Logger from '../../utils/logger.js';
import { state, actions } from './state.js';

export const eventHandlers = {
    // Phase 3: Initialize intelligent event delegation
    initEventDelegation: function () {
        if (state.eventDelegationInitialized) return;

        const boundHandler = this.handleDelegatedEvent.bind(this);
        actions.setBoundDelegatedHandler(boundHandler);
        document.addEventListener('click', boundHandler);
        actions.setEventDelegationInitialized(true);

        Logger.info('Event delegation system initialized for ProductRenderer');
    },

    // Phase 3: Centralized event handler
    handleDelegatedEvent: function (e) {
        const target = e.target;

        // Handle view toggle buttons
        if (target.classList && target.classList.contains('view-toggle-btn')) {
            e.preventDefault();
            this.toggleViewMode().then(() => {
                // Refresh the current view to apply the new mode
                const container = document.getElementById('content-container');
                if (container) {
                    return this.refreshCurrentView(container);
                }
            }).catch(err => {
                Logger.error('Error in view toggle:', err);
            });
            return;
        }

        // Handle back buttons (both floating and top nav)
        if (target.classList && (target.classList.contains('back-button') || target.classList.contains('top-back-btn'))) {
            e.preventDefault();
            const container = target.closest('.content-wrapper') || document.querySelector('.content-wrapper');
            if (container) this.handleBackButton(target);
            return;
        }

        // Handle price buttons
        if (target.classList && target.classList.contains('price-button')) {
            e.preventDefault();
            this.handlePriceButtonClick(target, e);
            return;
        }

        // Handle video thumbnails
        if ((target.classList && target.classList.contains('video-thumb')) || (target.classList && target.classList.contains('video-thumbnail'))) {
            e.preventDefault();
            this.handleVideoClick(target);
            return;
        }

        // Handle product images
        if (target.classList && target.classList.contains('product-image')) {
            e.preventDefault();
            this.handleImageClick(target);
            return;
        }

        // Handle product cards (grid view)
        if (target.classList && target.classList.contains('product-card')) {
            e.preventDefault();
            this.handleCardClick(target, e);
            return;
        }

        // Handle category cards
        if ((target.classList && target.classList.contains('category-card')) || target.closest('.category-card')) {
            e.preventDefault();
            this.handleCategoryCardClick(target);
            return;
        }

        // Handle modal close buttons
        if (target.classList && target.classList.contains('modal-close-btn')) {
            e.preventDefault();
            this.handleModalClose(target);
            return;
        }

        // Handle modal backdrop clicks
        if ((target.classList && target.classList.contains('modal-backdrop')) ||
            (target.classList && target.classList.contains('video-modal-backdrop')) ||
            (target.classList && target.classList.contains('image-modal-backdrop'))) {
            this.handleModalBackdropClick(target, e);
            return;
        }
    },

    // Phase 3: Cleanup event delegation
    destroyEventDelegation: function () {
        if (state.boundDelegatedHandler) {
            document.removeEventListener('click', state.boundDelegatedHandler);
            actions.setBoundDelegatedHandler(null);
            actions.setEventDelegationInitialized(false);
            Logger.info('Event delegation system destroyed');
        }
    },

    // Create view toggle button (optimized)
    createViewToggle: function (container) {
        // Initialize event delegation if not already done
        this.initEventDelegation();

        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'view-toggle-container';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'view-toggle-btn';
        toggleBtn.textContent = state.currentViewMode === 'table' ? '🔲' : '📋';
        toggleBtn.classList.toggle('active', state.currentViewMode === 'grid');

        // No individual event listener needed - handled by delegation
        toggleContainer.appendChild(toggleBtn);
        return toggleContainer;
    },

    // Phase 3: Specific event handlers
    handleCategoryCardClick: function (target) {
        const categoryCard = target.closest('.category-card') || target;
        const category = categoryCard.dataset.category;

        if (category) {
            const container = categoryCard.closest('.content-wrapper') || document.querySelector('.content-wrapper');
            if (container) {
                this.renderLicorSubcategory(container, category);
            } else {
                Logger.error(`❌ No se encontró container para categoría ${category}`);
            }
        } else {
            Logger.warn('⚠️ No se encontró categoría en el elemento clickeado');
        }
    },

    handleModalClose: function (target) {
        const modal = target.closest('.modal-backdrop');
        if (modal) {
            modal.remove();
        }
    },

    handleModalBackdropClick: function (target, event) {
        // Only close if clicking directly on the backdrop, not on modal content
        if (event.target === target) {
            target.remove();
        }
    },

    handlePriceButtonClick: function (target, event) {
        if (target.disabled || (target.classList && target.classList.contains('non-selectable'))) {
            return;
        }

        const priceBtn = target.closest('.price-button');
        if (!priceBtn) {
            Logger.debug('[Events] Clicked element is not a price button (checked closest)');
            return;
        }

        // DECOUPLED: No window.OrderSystem checks here. Just dispatch event.

        const row = priceBtn.closest('tr');
        const card = priceBtn.closest('.product-card');
        let productName, priceText, contextElement;

        if (row) {
            // Table view handling
            const nameCell = row.querySelector('.product-name');
            priceText = priceBtn.textContent;
            productName = nameCell.textContent;
            contextElement = row;
        } else if (card) {
            // Grid view handling
            productName = priceBtn.dataset.productName;
            priceText = priceBtn.textContent;
            contextElement = card;
        } else {
            Logger.warn('Price button clicked outside of row or card context');
            return;
        }

        Logger.debug(`[Events] Dispatching product-interaction for ${productName}`);

        // Dispatch decoupled event
        const interactionEvent = new CustomEvent('product-interaction', {
            bubbles: true,
            detail: {
                action: 'select',
                productName: productName,
                priceText: priceText,
                contextElement: contextElement,
                originalEvent: event,
                target: priceBtn
            }
        });

        document.dispatchEvent(interactionEvent);
    },

    handleVideoClick: function (target) {
        const videoUrl = target.dataset.videoUrl || target.src;
        const fallbackUrl = target.dataset.videoUrlFallback;
        const productName = target.alt?.replace('Ver video de ', '') || target.alt?.replace('Video de ', '') || 'Producto';
        const categoryElement = target.closest('table, .product-grid');
        const category = categoryElement?.dataset.category;

        const modalCategory = (category === 'cervezas' || category === 'refrescos') ? category : null;
        this.showVideoModal(videoUrl, productName, modalCategory, fallbackUrl);
    },

    handleImageClick: function (target) {
        const imageUrl = target.src;
        const productName = target.alt || 'Producto';
        const categoryElement = target.closest('table, .product-grid');
        const category = categoryElement?.dataset.category;

        const modalCategory = (category === 'cervezas' || category === 'refrescos') ? category : null;
        this.showImageModal(imageUrl, productName, modalCategory);
    },

    handleCardClick: function (target, event) {
        // Handle card clicks if needed for future functionality
    },

    handleBackButton: function (target) {
        // Handle back button navigation using centralized AppInit controller
        if (target.title === 'Volver a Licores' || target.dataset.action === 'back-to-licores') {
            if (window.AppInit && typeof window.AppInit.loadContent === 'function') {
                Logger.info('Navigating back to Licores via AppInit');
                window.AppInit.loadContent('licores');
            } else {
                Logger.error('AppInit not available for back navigation');
            }
        }
    },
};
