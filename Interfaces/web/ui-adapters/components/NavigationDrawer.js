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

        // 2. Render Menu Actions
        this.renderMenu();

        // 3. Bind Events
        this.bindEvents();

        console.log('NavigationDrawer: Ready.');
    },

    /**
     * Render buttons inside the drawer
     */
    renderMenu() {
        const contentContainer = this.drawer.querySelector('.drawer-content');
        if (!contentContainer) return;

        // Clear existing dynamic buttons (keep logo if present)
        // Adjust: We append to a specific container or just clear/re-add buttons?
        // Let's look for existing buttons/containers.
        // Strategy: Create a new container for items to avoid wiping the logo.

        let menuContainer = contentContainer.querySelector('.nav-menu-items');
        if (!menuContainer) {
            menuContainer = document.createElement('div');
            menuContainer.className = 'nav-menu-items';
            menuContainer.style.display = 'flex';
            menuContainer.style.flexDirection = 'column';
            menuContainer.style.gap = '10px';
            menuContainer.style.marginTop = '20px';
            contentContainer.appendChild(menuContainer);
        } else {
            menuContainer.innerHTML = ''; // Clear old items
        }

        this.menuItems.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'nav-button'; // Uses existing CSS class
            btn.innerHTML = `${item.icon} ${item.label}`;
            btn.setAttribute('data-category', item.id);

            // Click Handler
            btn.addEventListener('click', () => {
                this.handleNavigation(item.id);
            });

            menuContainer.appendChild(btn);
        });

        // Add Separator and "Crear Orden" shortcut (Optional but helpful)
        /*
        const separator = document.createElement('hr');
        separator.style.borderColor = 'rgba(255,255,255,0.1)';
        separator.style.margin = '15px 0';
        menuContainer.appendChild(separator);
        */
    },

    /**
     * Bind click listeners
     */
    bindEvents() {
        // Toggle Logic
        this.hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Close on Backdrop Click
        this.backdrop.addEventListener('click', () => {
            this.close();
        });

        // Close on Swipe (Optional - Simple implementation)
        // TODO: Add HammerJS or simple touch logic if requested.
    },

    /**
     * Toggle visibility
     */
    toggle() {
        const isOpen = this.drawer.classList.contains(this.config.activeClass);
        if (isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * Open the drawer
     */
    open() {
        this.drawer.classList.add(this.config.activeClass);
        this.drawer.classList.add(this.config.openClass);

        this.backdrop.style.display = 'block';
        // Force reflow for fade animation
        this.backdrop.offsetHeight;
        this.backdrop.style.opacity = '1';

        document.body.classList.add('sidebar-open'); // Lock scroll
    },

    /**
     * Close the drawer
     */
    close() {
        this.drawer.classList.remove(this.config.activeClass);
        this.drawer.classList.remove(this.config.openClass);

        this.backdrop.style.opacity = '0';
        setTimeout(() => {
            this.backdrop.style.display = 'none';
        }, 300); // Match CSS transition

        document.body.classList.remove('sidebar-open');
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
