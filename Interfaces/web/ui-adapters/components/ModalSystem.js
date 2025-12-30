/**
 * THE MODAL SYSTEM (Phase 1)
 * A Builder Pattern implementation for creating standardized modals.
 * Replaces manual DOM manipulation with a configuration-driven approach.
 */
export class ModalSystem {
    constructor() {
        this.overlay = null;
        this.currentModal = null;
        this._init();
    }

    /**
     * Initializes the global overlay if not present.
     */
    _init() {
        // Verify if overlay exists in index.html, if not, create it
        let overlay = document.querySelector('.sys-modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sys-modal-overlay';
            overlay.id = 'sys-global-overlay';
            document.body.appendChild(overlay);
        }
        this.overlay = overlay;

        // Close on background click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
    }

    /**
     * Builds and displays a modal based on configuration.
     * @param {Object} config - The modal configuration.
     * @param {string} config.title - The title of the modal.
     * @param {HTMLElement|string} config.content - The body content (Node or HTML string).
     * @param {Array} config.actions - Array of action buttons [{label, type, onClick}].
     * @param {Function} [config.onClose] - Optional callback when closed.
     */
    static show(config) {
        const system = new ModalSystem(); // Singleton-ish usage for now
        system.build(config).open();
        return system;
    }

    /**
     * Constructs the DOM elements for the modal.
     */
    build(config) {
        this.onCloseCallback = config.onClose;

        // 1. Create Container
        const container = document.createElement('div');
        container.className = `sys-modal-container ${config.size ? `sys-modal-${config.size}` : ''}`;

        // 2. Header
        const header = document.createElement('div');
        header.className = 'sys-modal-header';
        header.innerHTML = `
            <h2>${config.title || 'Attention'}</h2>
            <button class="close-btn">&times;</button>
        `;
        header.querySelector('.close-btn').onclick = () => this.close();
        container.appendChild(header);

        // 3. Body
        const body = document.createElement('div');
        body.className = 'sys-modal-body';
        if (typeof config.content === 'string') {
            body.innerHTML = config.content;
        } else if (config.content instanceof HTMLElement) {
            body.appendChild(config.content);
        }
        container.appendChild(body);

        // 4. Footer (Actions)
        if (config.actions && config.actions.length > 0) {
            const footer = document.createElement('div');
            footer.className = 'sys-modal-footer';

            config.actions.forEach(action => {
                const btn = document.createElement('button');
                // Auto-map types to new button system
                const btnClass = action.type === 'primary' ? 'btn-contrast' :
                    action.type === 'ghost' ? 'btn-ghost' : 'btn-primary';

                btn.className = `btn ${btnClass}`;
                btn.textContent = action.label;
                btn.disabled = action.disabled || false;
                btn.onclick = () => {
                    if (action.onClick) action.onClick();
                    // Optional: auto-close? Let handler decide usually.
                };
                footer.appendChild(btn);
            });
            container.appendChild(footer);
        }

        this.currentModal = container;
        return this;
    }

    /**
     * Opens the constructed modal.
     */
    open() {
        if (!this.currentModal) return;

        // Clear previous content
        this.overlay.innerHTML = '';
        this.overlay.appendChild(this.currentModal);

        // Activate (CSS Transition)
        // Timeout to ensure DOM is ready for transition
        requestAnimationFrame(() => {
            this.overlay.classList.add('active');
        });
    }

    /**
     * static close()
     * Closes any active modal by targeting the shared overlay.
     */
    static close() {
        const system = new ModalSystem();
        system.close();
    }

    /**
     * Closes the modal.
     */
    close() {
        this.overlay.classList.remove('active');

        // Wait for CSS transition (0.3s)
        setTimeout(() => {
            this.overlay.innerHTML = '';
            if (this.onCloseCallback) this.onCloseCallback();
        }, 300);
    }
}
