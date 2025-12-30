/**
 * SettingsDrawer.js
 * Standalone controller for the Settings Menu.
 * Handles opening/closing and panel transitions using the standardized backdrop.
 */

const SettingsDrawer = {
    config: {
        drawerId: 'settings-menu',
        backdropId: 'sidebar-backdrop',
        activeClass: 'active',
        openClass: 'is-open',
        mainPanelId: 'main-settings-panel'
    },

    init() {
        console.log('SettingsDrawer: Initializing...');
        this.drawer = document.getElementById(this.config.drawerId);
        this.backdrop = document.querySelector(`.${this.config.backdropId}`);

        if (!this.drawer) {
            console.error('SettingsDrawer: Critical element missing: #settings-menu');
            return;
        }

        this.bindEvents();
        console.log('SettingsDrawer: Ready.');
    },

    bindEvents() {
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => this.close());
        }
    },

    /**
     * Open the settings drawer
     */
    open() {
        console.log('SettingsDrawer: open()');
        import('../managers/SidebarManager.js').then(module => {
            module.default.open(this.config.drawerId);
            // Always show the main panel when opening
            this.showPanel(this.config.mainPanelId);
        });
    },

    /**
     * Close the settings drawer
     */
    close() {
        console.log('SettingsDrawer: close()');
        import('../managers/SidebarManager.js').then(module => {
            module.default.close(this.config.drawerId);
        });
    },

    toggle() {
        console.log('SettingsDrawer: toggle()');
        import('../managers/SidebarManager.js').then(module => {
            module.default.toggle(this.config.drawerId);
            if (this.drawer && this.drawer.classList.contains('active')) {
                this.showPanel(this.config.mainPanelId);
            }
        });
    },

    /**
     * Transition between panels inside the drawer
     * @param {string} panelId 
     */
    showPanel(panelId) {
        console.log(`SettingsDrawer: showing panel ${panelId}`);
        const targetPanel = document.getElementById(panelId);
        if (!targetPanel) {
            console.warn(`SettingsDrawer: panel #${panelId} not found.`);
            return;
        }

        // Hide all sibling panels
        const allPanels = this.drawer.querySelectorAll('.settings-panel');
        allPanels.forEach(p => {
            p.classList.add('u-hidden');
            p.classList.remove('u-fade-in');
            // Legacy cleanup just in case
            p.classList.remove('screen-visible');
        });

        // Show target panel
        targetPanel.classList.remove('u-hidden', 'screen-hidden');
        targetPanel.classList.add('u-fade-in');
    }
};

export default SettingsDrawer;
