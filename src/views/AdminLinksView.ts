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
            <div class="admin-modal-card admin-link-form-card">
                <div class="admin-modal-header">
                    <div class="admin-modal-icon info">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </div>
                    <h3 id="link-modal-title">Add New Link / Tool</h3>
                </div>

                <form id="admin-link-form" class="admin-link-form">
                    <input type="hidden" id="link-form-id" value="" />

                    <div class="form-row-2col">
                        <div class="admin-form-group">
                            <label for="link-form-section">Target Section *</label>
                            <select id="link-form-section" class="admin-form-input" required>
                                <option value="tools">⚡ Engineering Tools (#tools)</option>
                                <option value="links">🔗 Useful Links & Standards (#links)</option>
                            </select>
                        </div>
                        <div class="admin-form-group">
                            <label for="link-form-category">Category *</label>
                            <input type="text" id="link-form-category" class="admin-form-input" placeholder="e.g. distribution, standards, guides..." required />
                            <div class="category-presets" id="category-presets">
                                <span class="preset-chip" data-cat="distribution">distribution</span>
                                <span class="preset-chip" data-cat="cables-grounding">cables-grounding</span>
                                <span class="preset-chip" data-cat="power-quality">power-quality</span>
                                <span class="preset-chip" data-cat="standards">standards</span>
                                <span class="preset-chip" data-cat="guides">guides</span>
                                <span class="preset-chip" data-cat="codes">codes</span>
                            </div>
                        </div>
                    </div>

                    <div class="admin-form-group">
                        <label for="link-form-title">Title / Name *</label>
                        <input type="text" id="link-form-title" class="admin-form-input" placeholder="e.g. ABB PowerCore" required />
                    </div>

                    <div class="admin-form-group">
                        <label for="link-form-description">Description</label>
                        <textarea id="link-form-description" class="admin-form-input" rows="2" placeholder="Brief technical summary of this software or resource..."></textarea>
                    </div>

                    <div class="admin-form-group">
                        <label for="link-form-url">Target Web Address (URL) *</label>
                        <input type="url" id="link-form-url" class="admin-form-input" placeholder="https://..." required />
                    </div>

                    <div class="admin-form-group">
                        <label for="link-form-icon">Icon / Logo Image Path or URL *</label>
                        <div class="icon-input-row">
                            <input type="text" id="link-form-icon" class="admin-form-input" placeholder="e.g. logos/abb.svg or https://..." required />
                            <div class="icon-preview-box" id="icon-preview-box" title="Logo Preview">
                                <span class="preview-placeholder">Logo</span>
                            </div>
                        </div>
                        <div class="logo-presets">
                            <span class="logo-presets-label">Preset Logos:</span>
                            <div class="logo-presets-chips">
                                ${AVAILABLE_LOGOS.map(logo => `
                                    <button type="button" class="logo-chip-btn" data-path="${logo.path}">${logo.label}</button>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="admin-form-group">
                        <label for="link-form-order">Sort Order Priority (Lower appears first)</label>
                        <input type="number" id="link-form-order" class="admin-form-input" value="0" min="0" />
                    </div>

                    <div id="link-form-error" class="admin-form-error" style="display: none;"></div>

                    <div class="admin-modal-actions">
                        <button type="button" class="admin-action-btn secondary" id="modal-cancel-link-btn">Cancel</button>
                        <button type="submit" class="admin-action-btn primary" id="modal-save-link-btn">
                            <span id="btn-save-link-text">Save Link</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div class="admin-modal-overlay" id="admin-link-delete-modal" style="display: none;">
            <div class="admin-modal-card">
                <div class="admin-modal-header">
                    <div class="admin-modal-icon warning">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                    <h3>Delete Link / Tool?</h3>
                </div>
                <p class="admin-modal-body">
                    Are you sure you want to delete <strong id="delete-link-title"></strong>? It will immediately be removed from your website.
                </p>
                <div class="admin-modal-actions">
                    <button type="button" class="admin-action-btn secondary" id="modal-cancel-link-delete">Cancel</button>
                    <button type="button" class="admin-action-btn danger" id="modal-confirm-link-delete">Yes, Delete</button>
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

