/**
 * OrderDrawer.js
 * Specialized controller for the Right Order Sidebar.
 * Handles opening/closing, grid integration (Phoenix Protocol), and mobile overlays.
 */

import SidebarManager from '../managers/SidebarManager.js';

const OrderDrawer = {
    // Configuration
    config: {
        drawerId: 'order-sidebar',
        backdropId: 'sidebar-backdrop',
        activeClass: 'active',
        openClass: 'is-open',
        appContainerSelector: '.app-container',
        openAttribute: 'data-sidebar-state',
        openValue: 'open',
        desktopBreakpoint: 1280
    },

    /**
     * Initialize the Order Drawer
     */
    init() {
        console.log('OrderDrawer: Initializing...');
        this.drawer = document.getElementById(this.config.drawerId);
        this.appContainer = document.querySelector(this.config.appContainerSelector);

        // Ensure Backdrop exists (shared with NavigationDrawer)
        this.backdrop = document.querySelector(`.${this.config.backdropId}`);
        if (!this.backdrop) {
            this.backdrop = document.createElement('div');
            this.backdrop.className = this.config.backdropId;
            document.body.appendChild(this.backdrop);
        }

        if (!this.drawer) {
            console.warn('OrderDrawer: order-sidebar element not found.');
            return;
        }

        this.bindEvents();
        console.log('OrderDrawer: Ready.');
    },

    /**
     * Bind events if needed (e.g., closing on backdrop click)
     */
    bindEvents() {
        // Backdrop click is usually handled by SidebarManager or collectively.
        // But we want specialized behavior here.
        this.backdrop.addEventListener('click', () => {
            // Only close if we are on mobile (NOT persistent on desktop)
            if (window.innerWidth < this.config.desktopBreakpoint) {
                this.close();
            }
        });
    },

    /**
     * Open the Order Drawer
     * @param {boolean} force - Skip persistence check
     */
    open(force = false) {
        console.log('OrderDrawer: open()');
        SidebarManager.open(this.config.drawerId);
    },

    /**
     * Close the Order Drawer
     * @param {boolean} force - Force close even if it should be persistent
     */
    close(force = false) {
        console.log('OrderDrawer: close()');
        SidebarManager.close(this.config.drawerId, force);
    },

    /**
     * Toggle the Order Drawer
     */
    toggle() {
        console.log('OrderDrawer: toggle()');
        SidebarManager.toggle(this.config.drawerId);
    }
};

export default OrderDrawer;
