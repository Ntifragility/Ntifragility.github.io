/**
 * @file AdminLinksView.ts
 * @description View rendering for the Tools & Useful Links Management Suite (#admin/links).
 */

import { ExternalLinkRecord } from '@/services/ExternalLinksService';

const AVAILABLE_LOGOS = [
    { label: 'ABB', path: 'logos/abb.svg' },
    { label: 'Siemens', path: 'logos/siemens.svg' },
    { label: 'Eaton', path: 'logos/eaton.svg' },
    { label: 'ELEK', path: 'logos/elek.png' },
    { label: 'IEEE', path: 'logos/ieee.svg' },
    { label: 'Schneider', path: 'logos/schneider.svg' },
    { label: 'IEC', path: 'logos/iec.png' },
    { label: 'EEP', path: 'logos/eep.png' },
    { label: 'NFPA', path: 'logos/nfpa.png' },
    { label: 'NEMA', path: 'logos/nema.png' }
];

export function renderAdminLinksView(
    items: ExternalLinkRecord[],
    currentSection: 'tools' | 'links',
    categories: string[],
    toolsCount: number,
    linksCount: number,
    userEmail?: string
): string {
    const categoryOptions = categories
        .map(cat => `<option value="${cat}">${formatCategoryLabel(cat)}</option>`)
        .join('');

    const currentItems = items.filter(item => item.section === currentSection);

    return `
        <div class="admin-view-wrapper">
            <div class="admin-panel-card admin-manage-card">
                <!-- Header -->
                <div class="admin-panel-header">
                    <div class="admin-header-title-row">
                        <div class="admin-nav-breadcrumbs">
                            <a href="#admin" class="admin-breadcrumb-link">Admin Hub</a>
                            <span class="admin-breadcrumb-sep">/</span>
                            <span class="admin-breadcrumb-current">Tools & Useful Links</span>
                        </div>
                        <div class="admin-header-actions">
                            ${userEmail ? `
                                <div class="admin-user-badge">
                                    <span>${userEmail}</span>
                                </div>
                            ` : ''}
                            <button type="button" class="admin-logout-btn" id="admin-logout-btn" title="Sign Out of Admin Portal">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                <span>Log Out</span>
                            </button>
                            <a href="#admin" class="admin-close-btn" title="Back to Admin Hub">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div class="admin-manage-header-flex">
                        <div>
                            <h2 class="admin-title">Tools & Useful Links Manager</h2>
                            <p class="admin-subtitle">
                                Add, edit, reorder, or remove engineering tools and industry reference links stored in Supabase.
                            </p>
                        </div>
                        <div class="admin-manage-actions">
                            <button type="button" class="admin-action-btn primary" id="btn-add-link">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <span>Add New Link / Tool</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Section Tabs -->
                <div class="admin-links-tabs-bar">
                    <button type="button" class="admin-links-tab-btn ${currentSection === 'tools' ? 'active' : ''}" data-section="tools">
                        <span class="tab-icon">⚡</span>
                        <span>Engineering Tools</span>
                        <span class="admin-tab-count">${toolsCount}</span>
                    </button>
                    <button type="button" class="admin-links-tab-btn ${currentSection === 'links' ? 'active' : ''}" data-section="links">
                        <span class="tab-icon">🔗</span>
                        <span>Useful Links & Standards</span>
                        <span class="admin-tab-count">${linksCount}</span>
                    </button>
                </div>

                <!-- Filter / Search Toolbar -->
                <div class="admin-filters-bar">
                    <div class="admin-search-wrapper">
                        <svg class="admin-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input type="text" id="admin-links-search-input" class="admin-search-input" placeholder="Search by title, category, description or URL..." />
                    </div>
                    <div class="admin-category-filter">
                        <select id="admin-links-category-select" class="admin-select">
                            <option value="">All Categories</option>
                            ${categoryOptions}
                        </select>
                    </div>
                    <div class="admin-article-count">
                        <span id="admin-links-count">${currentItems.length}</span> items
                    </div>
                </div>

                <!-- Links Table -->
                <div class="admin-table-container">
                    <table class="admin-articles-table" id="admin-links-table">
                        <thead>
                            <tr>
                                <th style="width: 45%;">Item / Resource</th>
                                <th style="width: 20%;">Category</th>
                                <th style="width: 15%;">Destination</th>
                                <th style="width: 20%; text-align: right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="admin-links-tbody">
                            ${renderLinkRows(currentItems)}
                        </tbody>
                    </table>
                </div>

                <!-- Footer -->
                <div class="admin-panel-footer admin-manage-footer">
                    <a href="#admin" class="admin-action-btn secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        <span>Back to Hub</span>
                    </a>
                    <div class="admin-footer-links-quick">
                        <a href="#tools" class="admin-action-btn secondary" target="_blank">
                            <span>View Tools (#tools)</span>
                        </a>
                        <a href="#links" class="admin-action-btn secondary" target="_blank">
                            <span>View Useful Links (#links)</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add / Edit Modal -->
        <div class="admin-modal-overlay" id="admin-link-edit-modal" style="display: none;">
            <div class="admin-modal-card admin-minimal-modal-card">
                <div class="admin-modal-header">
                    <div>
                        <h3 id="link-modal-title" class="admin-modal-title">Edit Resource</h3>
                        <p class="admin-modal-subtitle">Configure engineering tool or reference documentation link</p>
                    </div>
                    <button type="button" class="admin-modal-close-btn" id="modal-close-icon-btn" title="Close">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <form id="admin-link-form" class="admin-minimal-form">
                    <input type="hidden" id="link-form-id" value="" />
                    <input type="hidden" id="link-form-section" value="tools" />

                    <!-- Section Switcher -->
                    <div class="admin-minimal-field">
                        <label class="admin-field-label">Target Section</label>
                        <div class="modal-section-segmented" id="modal-section-switcher">
                            <button type="button" class="modal-section-btn active" data-section="tools">
                                <span>⚡ Engineering Tools (#tools)</span>
                            </button>
                            <button type="button" class="modal-section-btn" data-section="links">
                                <span>🔗 Useful Links (#links)</span>
                            </button>
                        </div>
                    </div>

                    <!-- Row 2: Title & Category -->
                    <div class="form-grid-2col">
                        <div class="admin-minimal-field">
                            <label class="admin-field-label" for="link-form-title">Title / Name *</label>
                            <input type="text" id="link-form-title" class="admin-minimal-input" placeholder="e.g. SIMARIS Planning Tools" required />
                        </div>
                        <div class="admin-minimal-field">
                            <label class="admin-field-label" for="link-form-category">Category *</label>
                            <input type="text" id="link-form-category" class="admin-minimal-input" placeholder="e.g. distribution, standards..." required />
                        </div>
                    </div>

                    <!-- Category Preset Chips -->
                    <div class="category-presets-wrapper">
                        <span class="preset-label">Suggested:</span>
                        <div class="category-presets" id="category-presets">
                            <span class="preset-chip" data-cat="distribution">distribution</span>
                            <span class="preset-chip" data-cat="cables-grounding">cables-grounding</span>
                            <span class="preset-chip" data-cat="power-quality">power-quality</span>
                            <span class="preset-chip" data-cat="standards">standards</span>
                            <span class="preset-chip" data-cat="guides">guides</span>
                            <span class="preset-chip" data-cat="codes">codes</span>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="admin-minimal-field">
                        <label class="admin-field-label" for="link-form-description">Description</label>
                        <textarea id="link-form-description" class="admin-minimal-textarea" rows="2" placeholder="Brief technical summary..."></textarea>
                    </div>

                    <!-- URL -->
                    <div class="admin-minimal-field">
                        <label class="admin-field-label" for="link-form-url">Target Web Address (URL) *</label>
                        <input type="url" id="link-form-url" class="admin-minimal-input" placeholder="https://www.example.com" required />
                    </div>

                    <!-- Logo / Icon -->
                    <div class="admin-minimal-field">
                        <label class="admin-field-label" for="link-form-icon">Brand Logo / Icon *</label>
                        <div class="icon-input-row">
                            <div class="icon-preview-box" id="icon-preview-box" title="Logo Preview">
                                <span class="preview-placeholder">Logo</span>
                            </div>
                            <input type="text" id="link-form-icon" class="admin-minimal-input" placeholder="e.g. logos/siemens.svg or image URL" required />
                        </div>
                        <div class="logo-presets">
                            <span class="preset-label">Presets:</span>
                            <div class="logo-presets-chips">
                                ${AVAILABLE_LOGOS.map(logo => `
                                    <button type="button" class="logo-chip-btn" data-path="${logo.path}">${logo.label}</button>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Sort Order -->
                    <div class="admin-minimal-field">
                        <label class="admin-field-label" for="link-form-order">Sort Priority (Lower numbers appear first)</label>
                        <input type="number" id="link-form-order" class="admin-minimal-input" value="0" min="0" style="max-width: 140px;" />
                    </div>

                    <div id="link-form-error" class="admin-minimal-error" style="display: none;"></div>

                    <div class="admin-modal-actions">
                        <button type="button" class="admin-minimal-ghost-btn" id="modal-cancel-link-btn">Cancel</button>
                        <button type="submit" class="admin-minimal-primary-btn" id="modal-save-link-btn">
                            <span id="btn-save-link-text">Save Link</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div class="admin-modal-overlay" id="admin-link-delete-modal" style="display: none;">
            <div class="admin-modal-card admin-minimal-modal-card" style="max-width: 440px;">
                <div class="admin-modal-header">
                    <div>
                        <h3 class="admin-modal-title">Delete Resource?</h3>
                        <p class="admin-modal-subtitle">This item will be removed from your website.</p>
                    </div>
                </div>
                <p class="admin-modal-body" style="margin: 0.5rem 0; font-size: 0.9rem; color: #cbd5e1;">
                    Are you sure you want to delete <strong id="delete-link-title" style="color: #ffffff;"></strong>?
                </p>
                <div class="admin-modal-actions">
                    <button type="button" class="admin-minimal-ghost-btn" id="modal-cancel-link-delete">Cancel</button>
                    <button type="button" class="admin-minimal-primary-btn" id="modal-confirm-link-delete" style="background: #dc2626; border-color: rgba(220, 38, 38, 0.4);">Yes, Delete</button>
                </div>
            </div>
        </div>
    `;
}

export function renderLinkRows(items: ExternalLinkRecord[]): string {
    if (items.length === 0) {
        return `
            <tr>
                <td colspan="4" class="admin-table-empty">
                    <div class="empty-state-box">
                        <p>No links found in this category.</p>
                    </div>
                </td>
            </tr>
        `;
    }

    return items
        .map(item => `
            <tr data-id="${item.id}" class="admin-table-row">
                <td class="admin-cell-title">
                    <div class="admin-link-item-flex">
                        <div class="admin-link-icon-thumb">
                            ${item.icon ? `<img src="${item.icon}" alt="${escapeHtml(item.title)}" onerror="this.style.display='none'" />` : ''}
                        </div>
                        <div class="admin-title-group">
                            <span class="admin-article-name">${escapeHtml(item.title)}</span>
                            ${item.description ? `<span class="admin-article-sub">${escapeHtml(item.description)}</span>` : ''}
                        </div>
                    </div>
                </td>
                <td class="admin-cell-category">
                    <span class="admin-category-badge">${formatCategoryLabel(item.category)}</span>
                </td>
                <td class="admin-cell-date">
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="admin-link-destination" title="${escapeHtml(item.url)}">
                        <span>Open Site</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>
                </td>
                <td class="admin-cell-actions">
                    <div class="admin-actions-group">
                        <button type="button" class="admin-btn-icon edit btn-edit-link" data-id="${item.id}" title="Edit Link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button type="button" class="admin-btn-icon delete btn-delete-link" data-id="${item.id}" data-title="${escapeHtml(item.title)}" title="Delete Link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `)
        .join('');
}

function formatCategoryLabel(cat: string): string {
    const map: Record<string, string> = {
        'distribution': 'Power Distribution',
        'cables-grounding': 'Cables & Grounding',
        'power-quality': 'Power Quality',
        'standards': 'Standards',
        'guides': 'Guides & Handbooks',
        'codes': 'Codes & Regs'
    };
    return map[cat] || cat;
}

function escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

