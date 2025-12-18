import { getProductRepository } from '../../../../Shared/utils/diUtils.js';
import { setSafeInnerHTML } from '../../../../Shared/utils/domUtils.js';
import { logError, logWarning } from '../../../../Shared/utils/errorHandler.js';
import Logger from '../../../../Shared/utils/logger.js';
import TranslationService from '../../../../Shared/services/TranslationService.js';
import DOMTranslator from '../../../../Shared/services/DOMTranslator.js';
import {
  simpleHash,
  formatPrice
} from '../../../../Shared/modules/common/utils.js';

import {
  normalizeCategory,
  determineProductType,
  getCategoryForModal,
  isPriceField
} from '../../../../Shared/modules/product-table/utils.js';
import { eventHandlers } from '../../../../Shared/modules/product-table/events.js';
import { actions, state } from '../../../../Shared/modules/product-table/state.js';
import { api } from '../../../../Shared/modules/product-table/api.js';

const DEFAULT_IMAGE = '/assets/no-image.png';

const ProductRenderer = {
  ...eventHandlers,
  // Methods start here (State is now in modules/state.js)


  // Toggle between table and grid view
  toggleViewMode: async function () {
    const newMode = actions.toggleViewMode();
    Logger.info('View mode toggled to:', newMode);

    // Update toggle button text
    const toggleBtn = document.querySelector('.view-toggle-btn');
    if (toggleBtn) {
      toggleBtn.textContent = newMode === 'table' ? '🔲' : '📋';
      toggleBtn.classList.toggle('active', newMode === 'grid');
    }

    // Refresh the current view to apply the new mode
    const container = document.getElementById('content-container');
    if (container) {
      await this.refreshCurrentView(container);
      // Ensure new view content is translated according to current language
      this._retranslateIfNeeded(container);
    }

    return newMode;
  },





  // Refresh current view with new mode
  refreshCurrentView: async function (container) {
    const viewData = this._extractViewData(container);
    if (!viewData) return;

    const backButtonHTML = this._preserveBackButton(container);
    const targetContainer = this._clearAndRestoreContainer(container, backButtonHTML);
    await this._renderCategoryView(targetContainer, viewData.category);
    // Re-translate newly rendered content if needed
    this._retranslateIfNeeded(targetContainer);
  },

  _extractViewData: function (container) {
    const existingTable = container.querySelector('table, .product-grid');
    if (!existingTable) return null;

    const category = existingTable.dataset.category;
    if (!category) return null;

    return { category };
  },

  _preserveBackButton: function (container) {
    const backButtonContainer = container.querySelector('.back-button-container');
    return backButtonContainer ? backButtonContainer.outerHTML : null;
  },

  _clearAndRestoreContainer: function (container, backButtonHTML) {
    // Standardize: We expect #content-container to exist in index.html
    const targetContainer = document.getElementById('content-container');

    if (!targetContainer) {
      Logger.error('CRITICAL: #content-container missing from DOM. Static structure compromised.');
      return container; // Fallback to passed container (likely wrapper)
    }

    // Clear content but preserve structure
    targetContainer.innerHTML = '';

    if (backButtonHTML) {
      this._restoreBackButton(targetContainer, backButtonHTML);
    }

    return targetContainer;
  },

  _restoreBackButton: function (container, backButtonHTML) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = backButtonHTML;
    const restoredBackButton = tempDiv.firstChild;

    // No need to add individual event listener - handled by delegation
    container.appendChild(restoredBackButton);
  },



  _renderCategoryView: async function (container, category) {
    const categoryRenderers = this._getCategoryRenderers();
    const renderer = categoryRenderers[category];

    if (renderer) {
      await renderer(container);
      // Translate after category renderer completes
      this._retranslateIfNeeded(container);
    } else {
      Logger.warn('Unknown category for refresh:', category);
    }
  },

  _getCategoryRenderers: function () {
    return {
      'cocteleria': (container) => this.renderCocktails(container),
      'pizzas': (container) => this.renderPizzas(container),
      'alitas': (container) => this.renderAlitas(container),
      'sopas': (container) => this.renderSopas(container),
      'ensaladas': (container) => this.renderEnsaladas(container),
      'carnes': (container) => this.renderCarnes(container),
      'cafe': (container) => this.renderCafe(container),
      'postres': (container) => this.renderPostres(container),
      'refrescos': (container) => this.renderRefrescos(container),
      'cervezas': (container) => this.renderCervezas(container),
      'tequila': (container) => this.renderTequila(container),
      'whisky': (container) => this.renderWhisky(container),
      'ron': (container) => this.renderRon(container),
      'vodka': (container) => this.renderVodka(container),
      'ginebra': (container) => this.renderGinebra(container),
      'mezcal': (container) => this.renderMezcal(container),
      'cognac': (container) => this.renderCognac(container),
      'brandy': (container) => this.renderBrandy(container),
      'digestivos': (container) => this.renderDigestivos(container),
      'espumosos': (container) => this.renderEspumosos(container),
      'platos fuertes': (container) => this.renderPlatosFuertes(container),
      'snacks': (container) => this.renderSnacks(container)
    };
  },

  createProductTable: function (container, headers, data, fields, tableClass, categoryTitle) {
    const table = this._createTableElement(tableClass, categoryTitle);

    // FIX: Generate Colgroup to enforce widths (Critical for Title Row span)
    if (headers && headers.length > 0) {
      const colgroup = document.createElement('colgroup');
      headers.forEach(() => {
        const col = document.createElement('col');
        colgroup.appendChild(col);
      });
      table.appendChild(colgroup);
    }

    const titleRow = this._createTitleRow(categoryTitle, headers.length);
    const tableHead = this._createTableHeader(headers, titleRow);
    const tbody = this._createTableBody(data, fields, categoryTitle);

    table.appendChild(tableHead);
    table.appendChild(tbody);
    container.appendChild(table);
    // Ensure table content is translated if a non-Spanish language is active
    this._retranslateIfNeeded(container);
  },

  _createTableElement: function (tableClass, categoryTitle) {
    const table = document.createElement('table');
    table.className = tableClass;

    const normalizedCategory = normalizeCategory(categoryTitle);
    table.dataset.category = normalizedCategory;
    table.dataset.productType = determineProductType(normalizedCategory, tableClass, categoryTitle);

    return table;
  },

  _createTitleRow: function (categoryTitle, headerLength) {
    const titleRow = document.createElement('tr');
    titleRow.className = 'title-row';
    const titleCell = document.createElement('td');
    titleCell.colSpan = headerLength;
    const titleElement = document.createElement('h2');
    titleElement.className = 'page-title';
    titleElement.textContent = categoryTitle;
    // Marcar título para traducción
    if (categoryTitle) {
      const key = `category-title_${simpleHash((categoryTitle || '').trim())}`;
      titleElement.setAttribute('data-translate', key);
      titleElement.setAttribute('data-original-text', categoryTitle);
      titleElement.setAttribute('data-namespace', 'category.title');
    }
    titleCell.appendChild(titleElement);
    titleRow.appendChild(titleCell);
    return titleRow;
  },

  _createTableHeader: function (headers, titleRow) {
    const tableHead = document.createElement('thead');
    tableHead.appendChild(titleRow);

    const headerRow = document.createElement('tr');
    headerRow.setAttribute('data-nombre-column', 'true');

    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      // Marcar encabezado para traducción
      if (header) {
        const key = `table-header_${simpleHash((header || '').trim())}`;
        th.setAttribute('data-translate', key);
        th.setAttribute('data-original-text', header);
        th.setAttribute('data-namespace', 'table.header');
      }
      if (header === 'NOMBRE') {
        th.setAttribute('data-nombre-header', 'true');
      }
      headerRow.appendChild(th);
    });

    tableHead.appendChild(headerRow);
    return tableHead;
  },

  _createTableBody: function (data, fields, categoryTitle) {
    const tbody = document.createElement('tbody');

    data.forEach(item => {
      const row = this._createTableRow(item, fields, categoryTitle);
      tbody.appendChild(row);
    });

    return tbody;
  },

  _createTableRow: function (item, fields, categoryTitle) {
    const row = document.createElement('tr');

    fields.forEach(field => {
      const td = this._createTableCell(item, field, categoryTitle);
      row.appendChild(td);
    });

    return row;
  },

  _createTableCell: function (item, field, categoryTitle) {
    const td = document.createElement('td');

    if (field === 'nombre') {
      this._createNameCell(td, item[field]);
    } else if (field === 'ingredientes') {
      this._createIngredientsCell(td, item[field]);
    } else if (field === 'precios') {
      // New Stacked Logic
      this._createStackedPriceCell(td, item);
    } else if (field === 'precios_alitas') {
      // Stacked Alitas Logic
      this._createAlitasPriceCell(td, item);
    } else if (isPriceField(field)) {
      this._createPriceCell(td, item, field);
    } else if (field === 'video') {
      this._createVideoCell(td, item, categoryTitle);
    } else if (field === 'imagen' || field === 'ruta_archivo') {
      this._createImageCell(td, item, field, categoryTitle);
    } else {
      td.textContent = item[field] || '';
    }

    return td;
  },

  _createNameCell: function (td, nombre) {
    td.className = 'product-name';
    td.textContent = nombre;
    const key = `product-name_${simpleHash((nombre || '').trim())}`;
    td.setAttribute('data-translate', key);
    td.setAttribute('data-namespace', 'products');
    td.setAttribute('data-original-text', nombre || '');
  },

  _createIngredientsCell: function (td, ingredientes) {
    td.className = 'product-ingredients';
    td.textContent = ingredientes || '';
    if (ingredientes) {
      const key = `product-ingredients_${simpleHash((ingredientes || '').trim())}`;
      td.setAttribute('data-translate', key);
      td.setAttribute('data-namespace', 'products');
      td.setAttribute('data-original-text', ingredientes || '');
    }
  },

  /**
   * GENERIC: Renders a grid of price buttons (e.g. for Liquor or Alitas).
   * @param {HTMLElement} td - Target cell
   * @param {Object} item - Product data
   * @param {Array} config - Array of { key, label, mixerField? }
   */
  _createMultiPriceCell: function (td, item, config) {
    td.className = 'stacked-price-cell';
    const container = document.createElement('div');
    container.className = 'stacked-price-container';

    config.forEach(p => {
      const priceValue = item[p.key];
      // Condition: Render only if valid price exists
      if (priceValue && priceValue !== '0' && priceValue !== '--' && priceValue !== 0) {

        const priceItem = document.createElement('div');
        priceItem.className = 'price-chip';

        const label = document.createElement('span');
        label.className = 'price-label-mini';
        label.textContent = p.label;

        const button = document.createElement('button');
        button.className = 'price-button mobile-optimized';
        button.textContent = formatPrice(priceValue);
        button.dataset.productName = item.nombre;
        button.dataset.price = priceValue;
        button.dataset.field = p.key;

        // Attach Mixers logic if configured
        if (p.mixerField && item[p.mixerField]) {
          const mixers = item[p.mixerField];
          if (Array.isArray(mixers) && mixers.length > 0) {
            button.dataset.mixers = JSON.stringify(mixers);
          }
        }

        priceItem.appendChild(label);
        priceItem.appendChild(button);
        container.appendChild(priceItem);
      }
    });

    td.appendChild(container);
  },

  _createStackedPriceCell: function (td, item) {
    // Configuration for Liquor (3 Columns possible)
    const liquorConfig = [
      { key: 'precioBotella', label: 'Botella', mixerField: 'mixersBotella' },
      { key: 'precioLitro', label: 'Litro', mixerField: 'mixersLitro' },
      { key: 'precioCopa', label: 'Copa', mixerField: 'mixersCopa' }
    ];
    this._createMultiPriceCell(td, item, liquorConfig);
  },

  _createAlitasPriceCell: function (td, item) {
    // Configuration for Alitas (2 Columns)
    const alitasConfig = [
      { key: 'precio_10_piezas', label: '10 pzas' },
      { key: 'precio_25_piezas', label: '25 pzas' }
    ];
    this._createMultiPriceCell(td, item, alitasConfig);
  },





  _createPriceCell: function (td, item, field) {
    td.className = 'product-price';
    const priceButton = document.createElement('button');

    const priceValue = item[field];
    if (!priceValue || priceValue === '--') {
      priceButton.textContent = '--';
      priceButton.className = 'price-button non-selectable';
      priceButton.disabled = true;
    } else {
      priceButton.className = 'price-button';
      // Add $ symbol for liquor subcategories
      const formattedPrice = formatPrice(priceValue);
      priceButton.textContent = formattedPrice;
      priceButton.dataset.productName = item.nombre;
      priceButton.dataset.priceType = field;
      // Provide a unified attribute used by OrderSystem for grid/table views
      priceButton.dataset.field = field;

      // Attach mixer options if available
      let mixers = null;
      if (field === 'precioBotella') mixers = item.mixersBotella;
      else if (field === 'precioLitro') mixers = item.mixersLitro;
      else if (field === 'precioCopa') mixers = item.mixersCopa;

      if (mixers && Array.isArray(mixers) && mixers.length > 0) {
        priceButton.dataset.mixers = JSON.stringify(mixers);
      }
    }

    td.appendChild(priceButton);
  },

  _createVideoCell: function (td, item, categoryTitle) {
    td.className = 'video-icon';

    if (item.video) {
      // 1. URL del Video: Respetar estrictamente BD
      const videoUrl = item.video;

      // 2. URL del Thumbnail: Priorizar imagen explícita de la BD
      const explicitImage = item.imagen || item.ruta_archivo;
      const thumbnailUrl = explicitImage || DEFAULT_IMAGE;

      const thumbnailImg = document.createElement('img');
      thumbnailImg.className = 'video-thumb';
      thumbnailImg.src = thumbnailUrl;
      thumbnailImg.alt = `Ver video de ${item.nombre}`;
      thumbnailImg.dataset.videoUrl = videoUrl;
      // dataset.videoUrlFallback removed

      // Fallback para el thumbnail
      thumbnailImg.onerror = function () {
        const currentSrc = this.src;
        // Avoid infinite loops
        if (this.dataset.triedJpg && this.dataset.triedPng) {
          if (!this.dataset.fallenBack) {
            this.dataset.fallenBack = 'true';
            Logger.warn(`Thumbnail falló definitivamente: ${this.src}`);
          }
          return;
        }

        if (!this.dataset.triedJpg) {
          this.dataset.triedJpg = 'true';
          // Try JPG
          const jpgUrl = currentSrc.replace(/\.webp$/i, '.jpg');
          this.src = jpgUrl;
          return;
        }

        if (!this.dataset.triedPng) {
          this.dataset.triedPng = 'true';
          // Try PNG
          const pngUrl = currentSrc.replace(/\.jpg$/i, '.png');
          this.src = pngUrl;
          return;
        }
      };

      td.appendChild(thumbnailImg);
    } else {
      td.textContent = '--';
    }
  },

  _createImageCell: function (td, item, field, categoryTitle) {
    td.className = 'image-icon';
    // Fix: Explicitly check 'imagen' and 'ruta_archivo' regardless of the field name passed
    // This solves the issue where Tables looked for 'imagen' but data had 'ruta_archivo'
    const imageSrc = item[field] || item.imagen || item.ruta_archivo;

    if (imageSrc) {
      const img = document.createElement('img');
      img.src = imageSrc;
      img.alt = item.nombre;

      // Fallback Logic for Images
      img.onerror = function () {
        const currentSrc = this.src;
        Logger.warn(`Error loading image (attempting fallback): ${currentSrc}`);

        // Avoid infinite loops
        if (this.dataset.triedJpg && this.dataset.triedPng) {
          if (!this.dataset.fallenBack) {
            this.dataset.fallenBack = 'true';
            Logger.error(`Image failed permanently: ${this.src}`);
            // Optional: Set a placeholder if all fail
            // this.src = DEFAULT_IMAGE; 
          }
          return;
        }

        if (!this.dataset.triedJpg) {
          this.dataset.triedJpg = 'true';
          // Try JPG if WebP/Original fails
          // Assumption: URL ends in extension. If not, this regex might need adjustment.
          const jpgUrl = currentSrc.replace(/\.webp$/i, '.jpg').replace(/\.png$/i, '.jpg');
          if (jpgUrl !== currentSrc) {
            this.src = jpgUrl;
            return;
          }
        }

        if (!this.dataset.triedPng) {
          this.dataset.triedPng = 'true';
          // Try PNG if JP2/Original fails
          const pngUrl = currentSrc.replace(/\.webp$/i, '.png').replace(/\.jpg$/i, '.png');
          if (pngUrl !== currentSrc) {
            this.src = pngUrl;
            return;
          }
        }
      };

      const liquorCategories = ['whisky', 'tequila', 'ron', 'vodka', 'ginebra', 'mezcal', 'cognac', 'brandy', 'digestivos', 'espumosos'];
      const isBeverage = categoryTitle && (categoryTitle.toLowerCase() === 'cervezas' || categoryTitle.toLowerCase() === 'refrescos');
      const isLiquorSubcategory = categoryTitle && liquorCategories.includes(categoryTitle.toLowerCase());

      img.className = 'product-image';

      // No individual event listener - handled by delegation
      td.appendChild(img);
    } else {
      td.textContent = '--';
    }
  },



  // Create a single product card (SRP: UI Logic Separation)
  createProductCard: function (item, fields, normalizedCategory) {
    const card = document.createElement('div');
    card.className = 'product-card';

    // Product name
    const nameElement = document.createElement('div');
    nameElement.className = 'product-name';
    nameElement.textContent = item.nombre;
    const nameKey = `product-name_${simpleHash((item.nombre || '').trim())}`;
    nameElement.setAttribute('data-translate', nameKey);
    nameElement.setAttribute('data-namespace', 'products');
    nameElement.setAttribute('data-original-text', item.nombre || '');
    card.appendChild(nameElement);

    // Product ingredients (if available)
    if (item.ingredientes) {
      const ingredientsElement = document.createElement('div');
      ingredientsElement.className = 'product-ingredients';
      ingredientsElement.textContent = item.ingredientes;
      const ingKey = `product-ingredients_${simpleHash((item.ingredientes || '').trim())}`;
      ingredientsElement.setAttribute('data-translate', ingKey);
      ingredientsElement.setAttribute('data-namespace', 'products');
      ingredientsElement.setAttribute('data-original-text', item.ingredientes || '');
      card.appendChild(ingredientsElement);
    }

    // Media container (video or image)
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'product-media';

    // Prioritize explicit image from DB, fallback to generated thumbnail from video if needed
    const explicitImage = item.imagen || item.ruta_archivo;

    if (item.video) {
      // 1. URL del Video: Respetar estrictamente lo que viene de la BD
      const videoUrl = item.video;
      // Opcional: Podríamos generar una versión webm si quisieramos fallback, pero por ahora fiel a la BD

      // 2. URL del Thumbnail: Use DB image if available, otherwise use default
      const thumbnailUrl = explicitImage || DEFAULT_IMAGE;

      const videoThumbnail = document.createElement('img');
      videoThumbnail.className = 'video-thumbnail';
      videoThumbnail.src = thumbnailUrl;
      videoThumbnail.alt = `Video de ${item.nombre}`;
      videoThumbnail.dataset.videoUrl = videoUrl;
      // videoFallback removed as we trust the source

      videoThumbnail.onerror = function () {
        if (!this.dataset.fallenBack) {
          this.dataset.fallenBack = 'true';
          // Only log warning if explicit image failing or generated one failing
          Logger.warn(`Video Thumbnail failed (${explicitImage ? 'DB' : 'Generated'}): ${this.src}`);
        }
      };

      mediaContainer.appendChild(videoThumbnail);
    } else if (explicitImage) {
      const image = document.createElement('img');
      image.className = 'product-image';
      image.src = explicitImage;
      image.alt = item.nombre;

      image.onerror = function () {
        Logger.warn(`Grid Image failed: ${this.src}`);
      };

      mediaContainer.appendChild(image);
    }
    card.appendChild(mediaContainer);



    // Check if this is a liquor subcategory
    const liquorCategories = ['whisky', 'tequila', 'ron', 'vodka', 'ginebra', 'mezcal', 'cognac', 'brandy', 'digestivos', 'espumosos'];
    const isLiquorCategory = liquorCategories.includes(normalizedCategory);

    if (isLiquorCategory) {
      card.classList.add('liquor-card');
      card.dataset.productType = 'liquor';
      card.dataset.category = normalizedCategory;
    } else if (normalizedCategory === 'alitas') {
      card.classList.add('variant-card');
    }

    // --- PRICES RENDER LOGIC (Unified) ---
    const pricesContainer = document.createElement('div');
    pricesContainer.className = 'product-prices';

    // Helper to render prices based on strategy
    this._renderCardPrices(pricesContainer, item, fields, isLiquorCategory, normalizedCategory);

    card.appendChild(pricesContainer);
    return card;
  },

  /**
   * Helper: Renders prices in card view using config strategy
   */
  _renderCardPrices: function (container, item, fields, isLiquor, categoryName) {
    /* Strategy Logic: 
       1. Liquor: Vertical stack with labels (Botella: $X)
       2. Alitas/Pizzas: Variant buttons (10 pzas: $X)
       3. Standard: Single or simple buttons ($X)
    */

    // A. LIQUOR STRATEGY
    if (isLiquor) {
      const liquorConfig = [
        { key: 'precioBotella', label: 'Botella' },
        { key: 'precioLitro', label: 'Litro' },
        { key: 'precioCopa', label: 'Copa' }
      ];

      liquorConfig.forEach(conf => {
        const val = item[conf.key];
        if (val && val !== '--' && val !== '0' && val !== 0) {
          this._createPriceItemRow(container, conf.label, val, item, conf.key);
        }
      });
      return;
    }

    // B. ALITAS STRATEGY (Variants)
    if (categoryName === 'alitas') {
      // Detect fields like 'precio_10_piezas'
      fields.forEach(field => {
        if (field.includes('_piezas') && item[field]) {
          const pieces = field.replace('precio_', '').replace('_piezas', '');
          const label = `${pieces} piezas`;
          this._createPriceItemRow(container, label, item[field], item, field);
        }
      });
      return;
    }

    // C. STANDARD STRATEGY (Fallback)
    fields.forEach(field => {
      if ((field.includes('precio') || field === 'precio') && item[field]) {
        // Render simple button
        const btn = this._createPriceButton(item[field], item, field);
        container.appendChild(btn);
      }
    });
  },

  /**
   * Helper: Creates a Row (Label + Button) for Liquor/Variants
   */
  _createPriceItemRow: function (container, labelText, priceValue, item, fieldKey) {
    const row = document.createElement('div');
    row.className = 'price-item';

    const label = document.createElement('span');
    label.className = 'price-label';
    label.textContent = labelText + ':';

    const btn = this._createPriceButton(priceValue, item, fieldKey);

    row.appendChild(label);
    row.appendChild(btn);
    container.appendChild(row);
  },

  /**
   * Helper: Create the Golden Button
   */
  _createPriceButton: function (priceValue, item, fieldKey) {
    const btn = document.createElement('button');
    btn.className = 'price-button'; // Golden Standard
    btn.textContent = formatPrice(priceValue);
    btn.dataset.productName = item.nombre;
    btn.dataset.price = priceValue;
    btn.dataset.field = fieldKey;
    return btn;
  },

  // Create product grid view (Refactored: Orchestrator Pattern)
  createProductGrid: function (container, data, fields, categoryTitle) {
    const grid = document.createElement('div');
    grid.className = 'product-grid';

    // Normalize categoryTitle for data-attribute
    const normalizedCategory = categoryTitle
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    grid.dataset.category = normalizedCategory;

    // Determine productType based on category
    let productType;
    const foodCategories = ['pizzas', 'alitas', 'sopas', 'ensaladas', 'carnes', 'platos fuertes', 'snacks'];
    const beverageCategories = ['cocteleria', 'refrescos', 'cervezas', 'cafe', 'postres'];

    if (foodCategories.includes(normalizedCategory)) {
      productType = 'food';
    } else if (beverageCategories.includes(normalizedCategory)) {
      productType = 'beverage';
    } else {
      productType = 'unknown';
    }
    grid.dataset.productType = productType;

    // Add title
    const titleElement = document.createElement('h2');
    titleElement.className = 'page-title';
    titleElement.textContent = categoryTitle;
    // Marcar título para traducción en grid
    if (categoryTitle) {
      titleElement.setAttribute('data-translate', categoryTitle);
      titleElement.setAttribute('data-original-text', categoryTitle);
      titleElement.setAttribute('data-namespace', 'category.title');
    }
    // FIX: Append title to container instead of grid to avoid it becoming a grid item
    container.appendChild(titleElement);

    // Create product cards
    data.forEach(item => {
      const card = this.createProductCard(item, fields, normalizedCategory);
      grid.appendChild(card);
    });

    container.appendChild(grid);

    // Ensure grid content is translated if a non-Spanish language is active
    this._retranslateIfNeeded(container);
  },



  // Text truncation logic removed - handled entirely by CSS line-clamp
  // See cards.css for implementation details





  showVideoModal: function (videoUrl, title, category = null, fallbackUrl = null) {
    const modal = document.getElementById('media-modal');
    const modalContent = document.getElementById('media-modal-content');
    const titleEl = document.getElementById('media-modal-title');
    const videoEl = document.getElementById('media-modal-video');
    const imageEl = document.getElementById('media-modal-image');
    const errorEl = document.getElementById('media-error-message');
    const closeBtn = document.getElementById('media-modal-close-x');

    if (!modal || !modalContent || !videoEl) {
      Logger.error('Media modal elements not found in DOM');
      return;
    }

    // Reset State
    modalContent.classList.add('video-modal'); // Enable video styling
    if (category) modalContent.setAttribute('data-category', category);

    titleEl.textContent = title;

    // Show Video Elements
    videoEl.src = videoUrl;
    videoEl.style.display = 'block';
    videoEl.className = ''; // Remove 'hidden' class if present
    closeBtn.style.display = 'flex'; // Ensure flex for centering

    // Autoplay
    videoEl.play().catch(e => Logger.warn('Autoplay prevented by browser:', e));

    // Hide Image Elements
    imageEl.style.display = 'none';
    errorEl.style.display = 'none';

    // Error Handling
    videoEl.onerror = (e) => {
      if (fallbackUrl && !videoEl.dataset.usedFallback) {
        Logger.info(`Video fallback triggered: ${fallbackUrl}`);
        videoEl.dataset.usedFallback = 'true';
        videoEl.src = fallbackUrl;
        return;
      }
      Logger.warn('Video failed to load', e);
      videoEl.style.display = 'none';
      errorEl.style.display = 'block';
    };

    // Close Handler
    closeBtn.onclick = () => {
      videoEl.pause();
      videoEl.src = ''; // Stop buffering
      modal.classList.add('modal-hidden');
      modal.classList.remove('active'); // legacy support
    };

    // Close Handler (Click Outside/Backdrop)
    modal.onclick = (e) => {
      // Only close if clicking the backdrop (not the content)
      if (e.target === modal) {
        closeBtn.click();
      }
    };

    // Show Modal
    modal.classList.remove('modal-hidden');
    // Also support 'active' class if used by CSS
    setTimeout(() => modal.classList.add('active'), 10);
  },

  showImageModal: function (imageUrl, title, category = null) {
    const modal = document.getElementById('media-modal');
    const modalContent = document.getElementById('media-modal-content');
    const titleEl = document.getElementById('media-modal-title');
    const videoEl = document.getElementById('media-modal-video');
    const imageEl = document.getElementById('media-modal-image');
    const errorEl = document.getElementById('media-error-message');
    const closeBtn = document.getElementById('media-modal-close-x');

    if (!modal || !modalContent || !imageEl) return;

    // Reset State
    modalContent.classList.remove('video-modal'); // Disable video styling
    if (category) modalContent.setAttribute('data-category', category);

    titleEl.textContent = title;

    // Show Image Elements
    imageEl.src = imageUrl;
    imageEl.style.display = 'block';
    imageEl.className = '';
    closeBtn.style.display = 'flex';

    // Hide Video Elements
    videoEl.style.display = 'none';
    videoEl.pause();
    errorEl.style.display = 'none';

    // Close Handler
    closeBtn.onclick = () => {
      modal.classList.add('modal-hidden');
      modal.classList.remove('active');
    };

    // Close Handler (Click Outside/Backdrop)
    modal.onclick = (e) => {
      // Only close if clicking the backdrop (not the content)
      if (e.target === modal) {
        closeBtn.click();
      }
    };

    // Show Modal
    modal.classList.remove('modal-hidden');
    setTimeout(() => modal.classList.add('active'), 10);
  },

  renderLicores: async function (container) {
    // Ensure we're working with the correct content container, not destroying the sidebar
    let targetContainer = container;

    // If container is not the specific content-container, find or create it
    if (container.id !== 'content-container') {
      targetContainer = document.getElementById('content-container');
      if (!targetContainer) {
        // Create content-container within the flex structure
        const flexContainer = document.querySelector('.content-container-flex');
        if (flexContainer) {
          targetContainer = document.createElement('div');
          targetContainer.id = 'content-container';
          const existingSidebar = flexContainer.querySelector('#order-sidebar');
          if (existingSidebar) {
            flexContainer.insertBefore(targetContainer, existingSidebar);
          } else {
            flexContainer.appendChild(targetContainer);
          }
        } else {
          // Fallback: use the provided container but preserve sidebar
          const sidebar = document.getElementById('order-sidebar');
          const sidebarHTML = sidebar ? sidebar.outerHTML : null;
          targetContainer = container;
          if (sidebarHTML && !container.querySelector('#order-sidebar')) {
            container.insertAdjacentHTML('beforeend', sidebarHTML);
          }
        }
      }
    }

    const licoresCategoriesHTML = await this.createLicoresCategories();

    const licoresHTML = `
      <h2 class="page-title" data-translate="category.title.licores" data-original-text="Licores" data-namespace="categories">Licores</h2>
      <div class="category-grid" data-product-type="liquor" data-category="licores">
        ${licoresCategoriesHTML}
        <div class="subcategory-prompt">
          <h3 data-translate="category.prompt.choose" data-original-text="Elige una categoría" data-namespace="categories">Elige una categoría</h3>
        </div>
      </div>
    `;

    // Contenido dinámico: HTML generado con datos de Supabase
    // Se usa sanitización como medida preventiva
    setSafeInnerHTML(targetContainer, licoresHTML);
    // Translate newly injected liquor category content if a language is active
    this._retranslateIfNeeded(targetContainer);

    // No individual event listeners needed - handled by delegation
    // Category cards will be handled by the centralized event system
  },

  createLicoresCategories: async function () {
    const licoresCategories = await api.getLicoresCategories();

    const html = licoresCategories.map(category => {
      const name = (category.nombre || '').trim();
      const key = `liquor-category_${simpleHash(name)}`;
      return `
        <div class="category-card" data-category="${name.toLowerCase()}">
          <img src="${category.icono || category.imagen}" alt="${name}" class="category-image">
          <h3 class="category-name" data-translate="${key}" data-original-text="${name}" data-namespace="liquors">${name}</h3>
        </div>
      `;
    }).join('');

    return html;
  },

  renderLicorSubcategory: async function (container, category) {
    Logger.info(`🍾 Navegando hacia subcategoría de licores: ${category}`);

    // Log current DOM state before manipulation
    const currentMainScreen = document.getElementById('main-screen');
    const currentContentContainer = document.getElementById('content-container');
    const currentOrdersBox = document.getElementById('orders-box');

    Logger.debug('📊 Estado DOM antes de renderizar subcategoría:', {
      category: category,
      mainScreen: !!currentMainScreen,
      contentContainer: !!currentContentContainer,
      ordersBox: !!currentOrdersBox,
      mainScreenVisible: currentMainScreen ? !currentMainScreen.classList.contains('hidden') : false,
      mainScreenClasses: currentMainScreen ? Array.from(currentMainScreen.classList) : []
    });

    // Preserve the sidebar before clearing content
    // Look for sidebar in the correct location within the DOM structure
    const sidebar = document.getElementById('order-sidebar');
    let sidebarHTML = null;
    if (sidebar) {
      sidebarHTML = sidebar.outerHTML;
      Logger.debug('💾 Sidebar preservado para subcategoría');
    } else {
      Logger.warn('⚠️ No se encontró sidebar para preservar');
      Logger.debug('🔍 Buscando sidebar en DOM completo:', {
        sidebarInDocument: !!document.getElementById('order-sidebar'),
        contentContainerFlex: !!document.querySelector('.content-container-flex'),
        containerType: container.className || container.tagName
      });
    }

    // Get or create content container without destroying sidebar
    let targetContainer = document.getElementById('content-container');
    if (targetContainer) {
      // Simply clear the content container, leaving sidebar untouched
      targetContainer.innerHTML = '';
      Logger.debug('🧹 Content container limpiado, sidebar intacto');
    } else {
      Logger.warn('⚠️ No se encontró content-container, creando uno nuevo');
      // Find the content-container-flex to maintain proper structure
      const flexContainer = document.querySelector('.content-container-flex');
      if (flexContainer) {
        targetContainer = document.createElement('div');
        targetContainer.id = 'content-container';
        // Insert before the sidebar to maintain proper order
        const existingSidebar = flexContainer.querySelector('#order-sidebar');
        if (existingSidebar) {
          flexContainer.insertBefore(targetContainer, existingSidebar);
        } else {
          flexContainer.appendChild(targetContainer);
        }
        Logger.debug('🆕 Content container creado en estructura flex');
      } else {
        Logger.error('❌ No se encontró content-container-flex, estructura DOM comprometida');
        return;
      }
    }

    // Mostrar barra superior y botón de back
    const topNavBar = document.getElementById('top-nav-bar');
    const topBackBtn = document.getElementById('top-back-btn');
    const navTitle = document.getElementById('nav-title');

    // Mostrar la barra superior
    if (topNavBar) {
      topNavBar.classList.remove('top-nav-hidden');
      topNavBar.classList.add('top-nav-visible');
    }

    // Mostrar botón de back
    if (topBackBtn) {
      topBackBtn.classList.remove('back-btn-hidden');
      topBackBtn.dataset.action = 'back-to-licores';
      topBackBtn.title = 'Volver a Licores';

      // Agregar event listener específico para el botón de back
      // Remover listener anterior si existe
      if (this._topBackBtnHandler) {
        topBackBtn.removeEventListener('click', this._topBackBtnHandler);
      }

      // Crear y agregar nuevo listener
      this._topBackBtnHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        Logger.info('🔙 Botón de back clickeado - navegando a licores');
        this.handleBackButton(topBackBtn);
      };

      topBackBtn.addEventListener('click', this._topBackBtnHandler);
    }

    // ELIMINADO: No mostrar el título de la subcategoría en la barra superior
    // ya que el título aparece en el contenedor padre
    // if (navTitle) {
    //   const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
    //   navTitle.textContent = categoryTitle;
    // }

    // Update the title for all subcategory renderings
    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

    // Load specific subcategory
    switch (category) {
      case 'whisky':
        await this.renderWhisky(targetContainer, categoryTitle);
        break;
      case 'tequila':
        await this.renderTequila(targetContainer, categoryTitle);
        break;
      case 'ron':
        await this.renderRon(targetContainer, categoryTitle);
        break;
      case 'vodka':
        await this.renderVodka(targetContainer, categoryTitle);
        break;
      case 'brandy':
        await this.renderBrandy(targetContainer, categoryTitle);
        break;
      case 'ginebra':
        await this.renderGinebra(targetContainer, categoryTitle);
        break;
      case 'mezcal':
        await this.renderMezcal(targetContainer, categoryTitle);
        break;
      case 'cognac':
        await this.renderCognac(targetContainer, categoryTitle);
        break;
      case 'digestivos':
        await this.renderDigestivos(targetContainer, categoryTitle);
        break;
      case 'espumosos':
        await this.renderEspumosos(targetContainer, categoryTitle);
        break;
      default:
        // Asignación segura: cadena estática sin riesgo XSS
        targetContainer.innerHTML += '<p>Categoría no disponible</p>';
    }
    // Translate subcategory content after rendering
    this._retranslateIfNeeded(targetContainer);

    // Log DOM state after rendering subcategory
    setTimeout(() => {
      const afterMainScreen = document.getElementById('main-screen');
      const afterContentContainer = document.getElementById('content-container');
      const afterOrdersBox = document.getElementById('orders-box');

      Logger.debug('📊 Estado DOM después de renderizar subcategoría:', {
        category: category,
        mainScreen: !!afterMainScreen,
        contentContainer: !!afterContentContainer,
        ordersBox: !!afterOrdersBox,
        mainScreenVisible: afterMainScreen ? !afterMainScreen.classList.contains('hidden') : false,
        mainScreenClasses: afterMainScreen ? Array.from(afterMainScreen.classList) : []
      });

      Logger.info(`✅ Subcategoría ${category} renderizada completamente`);
    }, 100);
  },

  // Helper: translate newly rendered content when language is not Spanish
  _retranslateIfNeeded: function (scopeElement) {
    try {
      const currentLang = TranslationService.getCurrentLanguage();
      if (currentLang && currentLang !== 'es') {
        const root = scopeElement || document;
        if (typeof DOMTranslator.translateElement === 'function') {
          const elements = root.querySelectorAll('[data-translate], [data-translate-placeholder]');
          elements.forEach(el => DOMTranslator.translateElement(el, currentLang));
        } else if (typeof TranslationService.translatePage === 'function') {
          // Fallback: traducir toda la página solo si no hay capacidad por elemento
          TranslationService.translatePage(currentLang);
        }
      }
    } catch (err) {
      Logger.warn('Translation reapply failed after view change:', err);
    }
  },

  // Generic liquor renderer - eliminates code duplication
  renderLiquorCategory: async function (container, subcategory, title) {
    // UPDATED: 3-Column Standard (Name | Image | Prices)
    const liquorFields = ['nombre', 'imagen', 'precios'];
    const liquorHeaders = ['NOMBRE', 'IMAGEN', 'PRECIOS'];

    try {
      const data = await api.getLiquorSubcategory(subcategory);

      if (state.currentViewMode === 'grid') {
        this.createProductGrid(container,
          data,
          ['nombre', 'imagen', 'precioBotella', 'precioLitro', 'precioCopa'], // Grid keeps all fields for internal logic
          title
        );
      } else {
        this.createProductTable(container,
          liquorHeaders,
          data,
          liquorFields,
          'liquor-table',
          title
        );
      }
    } catch (error) {
      logError(`Error rendering ${title}:`, error);
      container.innerHTML += `<p>Error cargando ${title}. Por favor, intente de nuevo.</p>`;
    }
  },

  // Optimized render methods using generic function
  renderWhisky: async function (container, title = 'Whisky') {
    await this.renderLiquorCategory(container, 'whisky', title);
  },

  renderTequila: async function (container, title = 'Tequila') {
    await this.renderLiquorCategory(container, 'tequila', title);
  },

  renderRon: async function (container, title = 'Ron') {
    await this.renderLiquorCategory(container, 'ron', title);
  },

  renderVodka: async function (container, title = 'Vodka') {
    await this.renderLiquorCategory(container, 'vodka', title);
  },

  renderGinebra: async function (container, title = 'Ginebra') {
    await this.renderLiquorCategory(container, 'ginebra', title);
  },

  renderMezcal: async function (container, title = 'Mezcal') {
    await this.renderLiquorCategory(container, 'mezcal', title);
  },

  renderCognac: async function (container, title = 'Cognac') {
    await this.renderLiquorCategory(container, 'cognac', title);
  },

  renderBrandy: async function (container, title = 'Brandy') {
    await this.renderLiquorCategory(container, 'brandy', title);
  },

  renderDigestivos: async function (container, title = 'Digestivos') {
    const productRepository = getProductRepository();

    // Add view toggle button - DISABLED: Using top nav button instead
    // const toggleElement = this.createViewToggle(container);
    // container.appendChild(toggleElement);

    try {
      const data = await productRepository.getLiquorSubcategory('digestivos');

      if (state.currentViewMode === 'grid') {
        this.createProductGrid(container,
          data,
          ['nombre', 'imagen', 'precioBotella', 'precioLitro', 'precioCopa'],
          title
        );
      } else {
        this.createProductTable(container,
          ['NOMBRE', 'IMAGEN', 'PRECIO BOTELLA', 'PRECIO LITRO', 'PRECIO COPA'],
          data,
          ['nombre', 'imagen', 'precioBotella', 'precioLitro', 'precioCopa'],
          'liquor-table',
          title
        );
      }
    } catch (error) {
      logError(`Error rendering ${title}:`, error);
      container.innerHTML += `<p>Error cargando ${title}. Por favor, intente de nuevo.</p>`;
    }
  },

  renderEspumosos: async function (container, title = 'Espumosos') {
    await this.renderLiquorCategory(container, 'espumosos', title);
  },

  renderCervezas: async function (container) {
    const productRepository = getProductRepository();

    try {
      const data = await productRepository.getCervezas();

      // Define Strategy for Cervezas (Visual Table)
      const renderLiquorStrategy = (el, items, title) => {
        if (state.currentViewMode === 'grid') {
          this.createProductGrid(el, items, ['nombre', 'ruta_archivo', 'precio'], title);
        } else {
          this.createProductTable(el,
            ['NOMBRE', 'IMAGEN', 'PRECIO'],
            items,
            ['nombre', 'ruta_archivo', 'precio'],
            'liquor-table', // Strict Mapping
            title
          );
        }
      };

      this._renderSegmentedCategory(container, data, {
        cssCategory: 'cervezas',
        defaultTitle: 'Cervezas en botella',
        defaultClass: 'cervezas-botella-section',
        segments: [
          {
            title: 'Tarros',
            cssClass: 'tarros-section',
            matcher: (p, name) => name.startsWith('TARRO')
          },
          {
            title: 'Vasos',
            cssClass: 'vasos-cerveza-section',
            matcher: (p, name) => name.startsWith('VASO')
          }
        ],
        renderStrategy: renderLiquorStrategy // PASS STRATEGY
      });

    } catch (error) {
      logError('Error rendering Cervezas:', error);
      container.innerHTML = '<p>Error cargando Cervezas. Por favor, intente de nuevo.</p>';
    }
  },

  renderPizzas: async function (container) {
    const productRepository = getProductRepository();

    // Add view toggle button - DISABLED: Using top nav button instead
    // const toggleElement = this.createViewToggle(container);
    // container.appendChild(toggleElement);

    try {
      const data = await productRepository.getPizzas();

      if (state.currentViewMode === 'grid') {
        this.createProductGrid(container,
          data,
          ['nombre', 'ingredientes', 'video', 'precio'],
          'Pizzas'
        );
      } else {
        this.createProductTable(container,
          ['NOMBRE', 'INGREDIENTES', 'VIDEO', 'PRECIO'],
          data,
          ['nombre', 'ingredientes', 'video', 'precio'],
          'standard-table',
          'Pizzas'
        );
      }
    } catch (error) {
      logError('Error rendering Pizzas:', error);
      // Preserve sidebar when showing error
      const targetContainer = container.id === 'content-container' ? container : document.getElementById('content-container') || container;
      targetContainer.innerHTML = '<p>Error cargando Pizzas. Por favor, intente de nuevo.</p>';
    }
  },

  // Generic food/beverage renderer - eliminates code duplication
  renderFoodCategory: async function (container, methodName, title, fields = null, headers = null) {
    const productRepository = getProductRepository();

    // Add view toggle button - DISABLED: Using top nav button instead
    // const toggleElement = this.createViewToggle(container);
    // container.appendChild(toggleElement);

    // Default fields and headers for food items
    const defaultFields = ['nombre', 'ingredientes', 'video', 'precio'];
    const defaultHeaders = ['NOMBRE', 'INGREDIENTES', 'VIDEO', 'PRECIO'];

    const finalFields = fields || defaultFields;
    const finalHeaders = headers || defaultHeaders;

    // LIMPIEZA CRÍTICA: Asegurar que el contenedor esté vacío antes de renderizar
    container.innerHTML = '';

    try {
      const data = await productRepository[methodName]();

      if (state.currentViewMode === 'grid') {
        this.createProductGrid(container,
          data,
          finalFields,
          title
        );
      } else {
        this.createProductTable(container,
          finalHeaders,
          data,
          finalFields,
          'standard-table',
          title
        );
      }
    } catch (error) {
      logError(`Error rendering ${title}:`, error);
      container.innerHTML = `<p>Error cargando ${title}. Por favor, intente de nuevo.</p>`;
    }
  },

  // Optimized render methods using generic function
  renderAlitas: async function (container) {
    const productRepository = getProductRepository();

    try {
      const data = await productRepository.getAlitas();

      if (state.currentViewMode === 'grid') {
        this.createProductGrid(container,
          data,
          ['nombre', 'ingredientes', 'video', 'precio_10_piezas', 'precio_25_piezas'],
          'Alitas'
        );
      } else {
        this.createProductTable(container,
          ['NOMBRE', 'INGREDIENTES', 'VIDEO', 'PRECIOS'],
          data,
          ['nombre', 'ingredientes', 'video', 'precios_alitas'],
          'standard-table table-compact',
          'Alitas'
        );
      }
    } catch (error) {
      logError('Error rendering Alitas:', error);
      container.innerHTML = '<p>Error cargando Alitas. Por favor, intente de nuevo.</p>';
    }
  },

  /**
   * Helper to render categories that need specific segmentation (e.g. Cervezas -> Botella/Tarro/Vaso)
   * @param {HTMLElement} container - The DOM element to render into.
   * @param {Array<Object>} data - The raw product data from repository.
   * @param {Object} config - Configuration for segmentation.
   * @param {string} config.cssCategory - The data-category attribute value (e.g., 'cervezas').
   * @param {string} config.defaultTitle - Title for the "catch-all" segment (e.g. 'Cervezas en botella').
   * @param {Array<{title: string, cssClass: string, matcher: Function}>} config.segments - Specific segments.
   */
  _renderSegmentedCategory: function (container, data, config) {
    // 1. Prepare Buckets
    const defaultBucket = [];
    const segmentBuckets = config.segments.map(seg => ({ ...seg, items: [] }));

    // 2. Distribute Data
    data.forEach(product => {
      const name = (product.nombre || '').toUpperCase();
      let matched = false;

      // Check specific segments first
      for (const segment of segmentBuckets) {
        if (segment.matcher(product, name)) {
          segment.items.push(product);
          matched = true;
          break; // First match wins
        }
      }

      // If no match, goes to default
      if (!matched) {
        defaultBucket.push(product);
      }
    });

    // 3. Sort Buckets (Alphabetical)
    const sortByName = (a, b) => a.nombre.localeCompare(b.nombre);
    defaultBucket.sort(sortByName);
    segmentBuckets.forEach(b => b.items.sort(sortByName));

    // 4. Clean Container
    container.innerHTML = '';

    // 5. Render Helper Strategy
    const defaultRenderStrategy = (sectionContainer, items, title) => {
      // Fallback Strategy (Legacy Behavior)
      if (state.currentViewMode === 'grid') {
        this.createProductGrid(sectionContainer, items, ['nombre', 'ruta_archivo', 'precio'], title);
      } else {
        // Default to Liquor Table if not specified 
        this.createProductTable(sectionContainer,
          ['NOMBRE', 'IMAGEN', 'PRECIO'],
          items,
          ['nombre', 'ruta_archivo', 'precio'],
          'liquor-table',
          title
        );
      }
    };

    const executeRender = config.renderStrategy || defaultRenderStrategy;

    const renderSection = (items, title, cssClass) => {
      if (items.length === 0) return;

      const sectionContainer = document.createElement('div');
      sectionContainer.className = cssClass || 'product-section';

      // Execute the Strategy
      executeRender(sectionContainer, items, title);

      // Apply data attribute for styling hook if grid/table is found
      const gridOrTable = sectionContainer.querySelector('.product-grid, table');
      if (gridOrTable) gridOrTable.setAttribute('data-category', config.cssCategory);

      container.appendChild(sectionContainer);
    };

    // 6. Execute Render Sequence
    // Always Render Default First (e.g. Botellas / Refrescos)
    renderSection(defaultBucket, config.defaultTitle, config.defaultClass || 'default-section');

    // Then Render Segments in defined order
    segmentBuckets.forEach(seg => {
      renderSection(seg.items, seg.title, seg.cssClass);
    });
  },

  renderSopas: async function (container) {
    await this.renderFoodCategory(container, 'getSopas', 'Sopas');
  },

  renderEnsaladas: async function (container) {
    await this.renderFoodCategory(container, 'getEnsaladas', 'Ensaladas');
  },

  renderCarnes: async function (container) {
    await this.renderFoodCategory(container, 'getCarnes', 'Carnes');
  },

  renderSnacks: async function (container) {
    await this.renderFoodCategory(container, 'getSnacks', 'Snacks');
  },

  renderPlatosFuertes: async function (container) {
    await this.renderFoodCategory(container, 'getPlatosFuertes', 'Platos Fuertes');
  },

  renderCafe: async function (container) {
    await this.renderFoodCategory(container, 'getCafe', 'Café');
  },

  renderPostres: async function (container) {
    await this.renderFoodCategory(container, 'getPostres', 'Postres');
  },

  renderRefrescos: async function (container) {
    const productRepository = getProductRepository();

    try {
      const data = await productRepository.getRefrescos();

      // Define Strategy for Refrescos (Visual Table)
      const renderLiquorStrategy = (el, items, title) => {
        if (state.currentViewMode === 'grid') {
          this.createProductGrid(el, items, ['nombre', 'ruta_archivo', 'precio'], title);
        } else {
          this.createProductTable(el,
            ['NOMBRE', 'IMAGEN', 'PRECIO'],
            items,
            ['nombre', 'ruta_archivo', 'precio'],
            'liquor-table', // Strict Mapping
            title
          );
        }
      };

      this._renderSegmentedCategory(container, data, {
        cssCategory: 'refrescos',
        defaultTitle: 'Refrescos',
        defaultClass: 'refrescos-section',
        segments: [
          {
            title: 'Jarras de jugo',
            cssClass: 'jarras-section',
            matcher: (p, name) => name.includes('JARRA')
          },
          {
            title: 'Vasos de jugo',
            cssClass: 'vasos-section',
            matcher: (p, name) => name.includes('VASO') && !name.includes('VIDRIO')
          }
        ],
        renderStrategy: renderLiquorStrategy // PASS STRATEGY
      });

    } catch (error) {
      logError('Error rendering Refrescos:', error);
      container.innerHTML = '<p>Error cargando Refrescos. Por favor, intente de nuevo.</p>';
    }
  },

  renderCocktails: async function (container) {
    await this.renderFoodCategory(container, 'getCocteles', 'Coctelería');
  },

  // Initialize translation listener
  initTranslationListener: function () {
    window.addEventListener('languageChanged', (e) => {
      Logger.info('🌐 Language changed event received in ProductRenderer', e.detail);
      const container = document.getElementById('content-container');
      if (container) {
        this._retranslateIfNeeded(container);
      }
    });
  }
};

// Make ProductRenderer globally available for legacy compatibility
window.ProductRenderer = ProductRenderer;

// Initialize translation listener
ProductRenderer.initTranslationListener();

export default ProductRenderer;