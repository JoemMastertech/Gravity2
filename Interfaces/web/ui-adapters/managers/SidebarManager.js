/**
 * Universal Sidebar Manager
 * 
 * Responsibilities:
 * 1. UI State Management (Open/Close) for ALL sidebars.
 * 2. Overlay/Backdrop Orchestration (One overlay to rule them all).
 * 3. Z-Index Governance & Scroll Locking.
 * 4. CSS Grid Layout Toggling for Desktop (preventing layout shifts).
 * 
 * @singleton
 */
class SidebarManager {
    constructor() {
        if (SidebarManager.instance) {
            return SidebarManager.instance;
        }

        this.body = document.body;
        this.overlay = this._createOverlay();
        this.activeSidebarId = null;
        this.appContainer = document.querySelector('.app-container');

        // Core Configuration
        this.config = {
            desktopBreakpoint: 1024, // Matches CSS Grid Layout (Tablet Landscape)
            openAttribute: 'data-sidebar-state',
            openValue: 'open',
            // Sidebars that should persist (pinned) on desktop
            persistentSidebars: ['order-sidebar', 'side-panel']
        };

        this._bindGlobalEvents();
        SidebarManager.instance = this;
    }

    /**
     * Initializes the unified backdrop element
     */
    _createOverlay() {
        // Reuse existing or create new
        let overlay = document.querySelector('.sidebar-backdrop');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-backdrop u-hidden';
            document.body.appendChild(overlay);
        }

        // Accessibility
        overlay.setAttribute('aria-hidden', 'true');

        // Event: Click overlay to close active sidebar
        overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeAll();
        });

        return overlay;
    }

    /**
     * Binds global keys (Escape)
     */
    _bindGlobalEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeSidebarId) {
                this.closeAll();
            }
        });
    }

    /**
     * Checks if a sidebar should be persistent (pinned) on the current device
     * @param {string} sidebarId 
     * @returns {boolean}
     */
    _isPersistent(sidebarId) {
        if (!sidebarId) return false;
        const isDesktop = window.innerWidth >= this.config.desktopBreakpoint;
        const isWhitelisted = this.config.persistentSidebars.includes(sidebarId);
        return isDesktop && isWhitelisted;
    }

    /**
     * Opens a specific sidebar
     * @param {string} sidebarId - ID of the sidebar element
     */
    open(sidebarId) {
        console.log(`[SidebarManager] open('${sidebarId}') called. Mobile=${window.innerWidth < this.config.desktopBreakpoint}`);

        // Lazy-query core elements if they were missing at init
        if (!this.overlay) this.overlay = this._createOverlay();
        if (!this.appContainer) this.appContainer = document.querySelector('.app-container');

        const sidebar = document.getElementById(sidebarId);
        if (!sidebar) {
            console.error(`[SidebarManager] ID #${sidebarId} not found in DOM.`);
            return;
        }

        // 1. Close others if different
        if (this.activeSidebarId && this.activeSidebarId !== sidebarId) {
            this.close(this.activeSidebarId);
        }

        // 2. Activate State
        this.activeSidebarId = sidebarId;
        this.lastOpenTime = Date.now();
        sidebar.classList.add('active', 'is-open');
        document.body.classList.add('sidebar-open');

        // 3. Show Overlay (Mobile) / Grid Shift (Desktop)
        this._updateEnvironment(true, sidebarId);

        // 4. Emit Event
        this._emitEvent('sidebar:open', { id: sidebarId });
    }

    /**
     * Closes a specific sidebar or the active one
     * @param {string} [sidebarId] - Optional. Defaults to active.
     * @param {boolean} [force=false] - Force close even if persistent.
     */
    close(sidebarId = this.activeSidebarId, force = false) {
        // Persistence Check: Prevent accidental closing of pinned sidebars
        if (!force && this._isPersistent(sidebarId)) {
            console.warn(`[SidebarManager] Persistent sidebar ${sidebarId} requires force=true to close.`);
            return;
        }

        console.log(`[SidebarManager] Closing ${sidebarId}`);
        if (!sidebarId || sidebarId !== this.activeSidebarId) return;

        const sidebar = document.getElementById(sidebarId);
        if (sidebar) {
            sidebar.classList.remove('active', 'is-open');
        }

        this.activeSidebarId = null;
        this.body.classList.remove('sidebar-open');
        this._updateEnvironment(false, sidebarId);
        this._emitEvent('sidebar:close', { id: sidebarId });
    }

    /**
     * Closes any open sidebar
     */
    closeAll() {
        if (this.activeSidebarId) {
            this.close(this.activeSidebarId);
        }
    }

    /**
     * Toggles a sidebar
     */
    toggle(sidebarId) {
        const now = Date.now();
        if (this.lastToggleTime && (now - this.lastToggleTime < 300)) return;
        this.lastToggleTime = now;

        console.log(`[SidebarManager] toggle('${sidebarId}'). ActiveId was: ${this.activeSidebarId}`);

        if (this.activeSidebarId === sidebarId) {
            this.close(sidebarId);
        } else {
            this.open(sidebarId);
        }
    }

    /**
     * Updates the global environment (Body, Overlay, AppContainer)
     * @param {boolean} isOpen 
     * @param {string} sidebarId 
     */
    _updateEnvironment(isOpen, sidebarId) {
        const isPersistent = this._isPersistent(sidebarId);

        if (isOpen) {
            this.body.classList.add('sidebar-open');

            if (isPersistent) {
                // Persistent Mode: Trigger Grid Shift, Hide Overlay
                if (this.appContainer) {
                    this.appContainer.setAttribute(this.config.openAttribute, this.config.openValue);
                }
                this.overlay.classList.remove('u-block');
                this.overlay.classList.add('u-hidden');
            } else {
                // Overlay Mode: Show Overlay
                this.overlay.classList.remove('u-hidden');
                this.overlay.classList.add('u-block', 'active'); // Added 'active' for transition

                // Isolation Logic: If a Persistent Sidebar is ALREADY active (pinned) in background,
                // do NOT disturb the Grid Layout.
                const currentPinnedSidebar = this.config.persistentSidebars.find(id =>
                    document.getElementById(id)?.classList.contains('active')
                );
                const isPersistenceActive = window.innerWidth >= this.config.desktopBreakpoint && currentPinnedSidebar;

                if (this.appContainer && !isPersistenceActive) {
                    this.appContainer.removeAttribute(this.config.openAttribute);
                }
            }

        } else {
            // Close Mode
            this.body.classList.remove('sidebar-open');
            this.overlay.classList.remove('u-block', 'active'); // Removed 'active'
            this.overlay.classList.add('u-hidden');

            // Isolation Logic (Close): Preserve Grid if Persistent layout is active
            const currentPinnedSidebar = this.config.persistentSidebars.find(id =>
                document.getElementById(id)?.classList.contains('active')
            );
            const isPersistenceActive = window.innerWidth >= this.config.desktopBreakpoint && currentPinnedSidebar;

            if (this.appContainer && !isPersistenceActive) {
                this.appContainer.removeAttribute(this.config.openAttribute);
            }
        }
    }

    _emitEvent(eventName, detail) {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
}

// Export Singleton
const sidebarManager = new SidebarManager();
export default sidebarManager;
