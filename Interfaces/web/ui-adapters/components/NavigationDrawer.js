/**
 * NavigationDrawer.js
 * Standalone controller for the Left Navigation Menu.
 * Handles opening/closing and menu item rendering.
 * Replaces legacy SidebarManager for navigation duties.
 */

const NavigationDrawer = {
    // Configuration
    config: {
        drawerId: 'drawer-menu',
        hamburgerId: 'hamburger-btn',
        backdropId: 'sidebar-backdrop',
        activeClass: 'active',
        openClass: 'is-open',
        zIndex: 3000 // Matched with CSS
    },

    // Menu Items Definition
    menuItems: [
        { id: 'cocteleria', label: 'Coctelería', icon: '🍸' },
        { id: 'refrescos', label: 'Refrescos', icon: '🥤' },
        { id: 'cervezas', label: 'Cervezas', icon: '🍺' },
        { id: 'licores', label: 'Licores', icon: '🥃' },
        // { id: 'vinos', label: 'Vinos', icon: '🍷' }, // Removed by User Request
        { id: 'pizzas', label: 'Pizzas', icon: '🍕' },
        { id: 'snacks', label: 'Snacks', icon: '🍟' }
    ],

    /**
     * Initialize the Navigation Drawer
     */
    init() {
        console.log('NavigationDrawer: Initializing...');

        // 1. Get Elements
        this.drawer = document.getElementById(this.config.drawerId);
        this.hamburger = document.getElementById(this.config.hamburgerId);

        // 1.1 Ensure Backdrop Exists
        this.backdrop = document.querySelector(`.${this.config.backdropId}`);
        if (!this.backdrop) {
            this.backdrop = document.createElement('div');
            this.backdrop.className = this.config.backdropId; // .sidebar-backdrop
            document.body.appendChild(this.backdrop);
        }

        if (!this.drawer || !this.hamburger) {
            console.error('NavigationDrawer: Critical elements missing from DOM.');
            return;
        }

        // 2. Bind Events
        this.bindEvents();

        console.log('NavigationDrawer: Ready.');
    },

    /**
     * Bind click listeners
     */
    bindEvents() {
        if (!this.hamburger) return;

        // Toggle Logic
        this.hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        });

        // Close on Backdrop Click is handled by SidebarManager
    },

    /**
     * Toggle visibility
     */
    toggle() {
        console.log('NavigationDrawer: toggle()');
        import('../managers/SidebarManager.js').then(module => {
            module.default.toggle(this.config.drawerId);
        });
    },

    /**
     * Open the drawer
     */
    open() {
        console.log('NavigationDrawer: open()');
        import('../managers/SidebarManager.js').then(module => {
            module.default.open(this.config.drawerId);
        });
    },

    /**
     * Close the drawer
     */
    close() {
        console.log('NavigationDrawer: close()');
        import('../managers/SidebarManager.js').then(module => {
            module.default.close(this.config.drawerId);
        });
    },

    /**
     * Handle category selection
     * @param {string} categoryId 
     */
    handleNavigation(categoryId) {
        console.log(`NavigationDrawer: Navigating to ${categoryId}`);

        // 1. Close Menu
        this.close();

        // 2. Trigger App Load
        if (window.AppInit && typeof window.AppInit.loadContent === 'function') {
            window.AppInit.loadContent(categoryId);

            // Update Title
            const titleEl = document.getElementById('nav-title');
            const item = this.menuItems.find(i => i.id === categoryId);
            if (titleEl && item) {
                titleEl.textContent = item.label;
            }
        } else {
            console.error('NavigationDrawer: AppInit.loadContent is not available.');
        }
    }
};

export default NavigationDrawer;
