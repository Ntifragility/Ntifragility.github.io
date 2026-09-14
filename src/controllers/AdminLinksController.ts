/**
 * @file AdminLinksController.ts
 * @description Controller for the Tools & Useful Links Manager (#admin/links).
 * Supports full CRUD operations connected to Supabase external_links.
 */

import { renderAdminLinksView, renderLinkRows } from '@/views/AdminLinksView';
import { externalLinksService, ExternalLinkRecord } from '@/services/ExternalLinksService';
import { authService } from '@/services/AuthService';

export class AdminLinksController {
    private container: HTMLElement;
    private cleanups: (() => void)[] = [];
    private allItems: ExternalLinkRecord[] = [];
    private currentSection: 'tools' | 'links' = 'tools';
    private searchQuery = '';
    private selectedCategory = '';
    private pendingDeleteId: string | null = null;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    public async render(): Promise<void> {
        this.destroy();
        this.container.innerHTML = `
            <div class="admin-view-wrapper">
                <div class="admin-panel-card">
                    <div class="admin-panel-header">
                        <h2 class="admin-title">Loading Tools & Links...</h2>
                    </div>
                </div>
            </div>
        `;

        try {
            this.allItems = await externalLinksService.fetchAll();
            this.renderContent();
        } catch (err: any) {
            this.container.innerHTML = `
                <div class="admin-view-wrapper">
                    <div class="admin-panel-card">
                        <div class="admin-alert-banner">
                            <div class="alert-icon">⚠️</div>
                            <div class="alert-text">
                                <strong>Failed to load links</strong>
                                <p>${err.message}</p>
                            </div>
                        </div>
                        <div class="admin-panel-footer">
                            <a href="#admin" class="admin-action-btn secondary">Back to Hub</a>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    private renderContent(): void {
        this.destroy();

        const toolsCount = this.allItems.filter(i => i.section === 'tools').length;
        const linksCount = this.allItems.filter(i => i.section === 'links').length;

        const categories = Array.from(
            new Set(
                this.allItems
                    .filter(i => i.section === this.currentSection)
                    .map(i => i.category)
                    .filter(Boolean)
            )
        ).sort();

        this.container.innerHTML = renderAdminLinksView(
            this.getFilteredItems(),
            this.currentSection,
            categories,
            toolsCount,
            linksCount,
            authService.getUserEmail()
        );

        this.bindEvents();
    }

    private getFilteredItems(): ExternalLinkRecord[] {
        return this.allItems.filter(item => {
            if (item.section !== this.currentSection) return false;

            if (this.selectedCategory && item.category !== this.selectedCategory) {
                return false;
            }

            if (this.searchQuery) {
                const q = this.searchQuery.toLowerCase();
                const matchTitle = item.title.toLowerCase().includes(q);
                const matchDesc = item.description?.toLowerCase().includes(q);
                const matchCat = item.category.toLowerCase().includes(q);
                const matchUrl = item.url.toLowerCase().includes(q);
                if (!matchTitle && !matchDesc && !matchCat && !matchUrl) {
                    return false;
                }
            }

            return true;
        });
    }

    private updateTableOnly(): void {
        const tbody = this.container.querySelector<HTMLElement>('#admin-links-tbody');
        const countSpan = this.container.querySelector<HTMLElement>('#admin-links-count');
        const filtered = this.getFilteredItems();

        if (tbody) {
            tbody.innerHTML = renderLinkRows(filtered);
        }
        if (countSpan) {
            countSpan.textContent = filtered.length.toString();
        }
    }

    private bindEvents(): void {
        // Tab switching
        const tabBtns = this.container.querySelectorAll<HTMLButtonElement>('.admin-links-tab-btn');
        tabBtns.forEach(btn => {
            const handler = () => {
                const section = btn.dataset.section as 'tools' | 'links';
                if (section && section !== this.currentSection) {
                    this.currentSection = section;
                    this.selectedCategory = '';
                    this.searchQuery = '';
                    this.renderContent();
                }
            };
            btn.addEventListener('click', handler);
            this.cleanups.push(() => btn.removeEventListener('click', handler));
        });

        // Search input
        const searchInput = this.container.querySelector<HTMLInputElement>('#admin-links-search-input');
        if (searchInput) {
            const handleSearch = () => {
                this.searchQuery = searchInput.value.trim();
                this.updateTableOnly();
            };
            searchInput.addEventListener('input', handleSearch);
            this.cleanups.push(() => searchInput.removeEventListener('input', handleSearch));
        }

        // Category select
        const categorySelect = this.container.querySelector<HTMLSelectElement>('#admin-links-category-select');
        if (categorySelect) {
            const handleCat = () => {
                this.selectedCategory = categorySelect.value;
                this.updateTableOnly();
            };
            categorySelect.addEventListener('change', handleCat);
            this.cleanups.push(() => categorySelect.removeEventListener('change', handleCat));
        }

        // Add New Link button
        const addBtn = this.container.querySelector<HTMLButtonElement>('#btn-add-link');
        const modal = this.container.querySelector<HTMLElement>('#admin-link-edit-modal');
        const form = this.container.querySelector<HTMLFormElement>('#admin-link-form');
        const modalTitle = this.container.querySelector<HTMLElement>('#link-modal-title');
        const cancelBtn = this.container.querySelector<HTMLButtonElement>('#modal-cancel-link-btn');

        if (addBtn && modal && form) {
            const handleAdd = () => {
                form.reset();
                const idInput = form.querySelector<HTMLInputElement>('#link-form-id');
                const sectionInput = form.querySelector<HTMLSelectElement>('#link-form-section');
                const orderInput = form.querySelector<HTMLInputElement>('#link-form-order');
                const errorBox = form.querySelector<HTMLElement>('#link-form-error');

                if (idInput) idInput.value = '';
                if (sectionInput) sectionInput.value = this.currentSection;
                if (orderInput) {
                    const currentSectionItems = this.allItems.filter(i => i.section === this.currentSection);
                    orderInput.value = currentSectionItems.length.toString();
                }
                if (errorBox) errorBox.style.display = 'none';
                if (modalTitle) modalTitle.textContent = this.currentSection === 'tools' ? 'Add Engineering Tool' : 'Add Useful Link';

                this.updateIconPreview('');
                modal.style.display = 'flex';
            };
            addBtn.addEventListener('click', handleAdd);
            this.cleanups.push(() => addBtn.removeEventListener('click', handleAdd));
        }

        // Cancel modal
        if (cancelBtn && modal) {
            const handleCancel = () => {
                modal.style.display = 'none';
            };
            cancelBtn.addEventListener('click', handleCancel);
            this.cleanups.push(() => cancelBtn.removeEventListener('click', handleCancel));
        }

        // Form Preset Chips (Categories)
        const categoryInput = this.container.querySelector<HTMLInputElement>('#link-form-category');
        const categoryChips = this.container.querySelectorAll<HTMLElement>('.preset-chip');
        categoryChips.forEach(chip => {
            const handler = () => {
                if (categoryInput && chip.dataset.cat) {
                    categoryInput.value = chip.dataset.cat;
                }
            };
            chip.addEventListener('click', handler);
            this.cleanups.push(() => chip.removeEventListener('click', handler));
        });

        // Form Preset Chips (Logos)
        const iconInput = this.container.querySelector<HTMLInputElement>('#link-form-icon');
        const logoChips = this.container.querySelectorAll<HTMLButtonElement>('.logo-chip-btn');
        logoChips.forEach(chip => {
            const handler = () => {
                if (iconInput && chip.dataset.path) {
                    iconInput.value = chip.dataset.path;
                    this.updateIconPreview(chip.dataset.path);
                }
            };
            chip.addEventListener('click', handler);
            this.cleanups.push(() => chip.removeEventListener('click', handler));
        });

        // Live Icon Preview
        if (iconInput) {
            const handleIconInput = () => {
                this.updateIconPreview(iconInput.value.trim());
            };
            iconInput.addEventListener('input', handleIconInput);
            this.cleanups.push(() => iconInput.removeEventListener('input', handleIconInput));
        }

        // Edit / Delete Table Delegation
        const table = this.container.querySelector<HTMLElement>('#admin-links-table');
        const deleteModal = this.container.querySelector<HTMLElement>('#admin-link-delete-modal');
        const deleteTitleSpan = this.container.querySelector<HTMLElement>('#delete-link-title');
        const cancelDeleteBtn = this.container.querySelector<HTMLButtonElement>('#modal-cancel-link-delete');
        const confirmDeleteBtn = this.container.querySelector<HTMLButtonElement>('#modal-confirm-link-delete');

        if (table) {
            const handleTableClick = (e: MouseEvent) => {
                const editBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('.btn-edit-link');
                const deleteBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('.btn-delete-link');

                if (editBtn) {
                    const id = editBtn.dataset.id;
                    const item = this.allItems.find(i => i.id === id);
                    if (item) {
                        this.openEditModal(item);
                    }
                } else if (deleteBtn) {
                    const id = deleteBtn.dataset.id;
                    const title = deleteBtn.dataset.title || 'this item';
                    if (id && deleteModal) {
                        this.pendingDeleteId = id;
                        if (deleteTitleSpan) deleteTitleSpan.textContent = `"${title}"`;
                        deleteModal.style.display = 'flex';
                    }
                }
            };
            table.addEventListener('click', handleTableClick);
            this.cleanups.push(() => table.removeEventListener('click', handleTableClick));
        }

        // Cancel Delete
        if (cancelDeleteBtn && deleteModal) {
            const handleCancelDelete = () => {
                deleteModal.style.display = 'none';
                this.pendingDeleteId = null;
            };
            cancelDeleteBtn.addEventListener('click', handleCancelDelete);
            this.cleanups.push(() => cancelDeleteBtn.removeEventListener('click', handleCancelDelete));
        }

        // Confirm Delete
        if (confirmDeleteBtn && deleteModal) {
            const handleConfirmDelete = async () => {
                if (!this.pendingDeleteId) return;
                const idToDelete = this.pendingDeleteId;
                confirmDeleteBtn.disabled = true;
                confirmDeleteBtn.textContent = 'Deleting...';

                try {
                    const res = await externalLinksService.deleteLink(idToDelete);
                    if (!res.success) {
                        alert(res.error || 'Failed to delete link.');
                        return;
                    }

                    this.allItems = this.allItems.filter(i => i.id !== idToDelete);
                    deleteModal.style.display = 'none';
                    this.pendingDeleteId = null;
                    this.renderContent();
                } catch (err: any) {
                    alert(`Failed to delete: ${err.message}`);
                } finally {
                    confirmDeleteBtn.disabled = false;
                    confirmDeleteBtn.textContent = 'Yes, Delete';
                }
            };
            confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
            this.cleanups.push(() => confirmDeleteBtn.removeEventListener('click', handleConfirmDelete));
        }

        // Form Submit (Create / Edit)
        if (form && modal) {
            const handleFormSubmit = async (e: Event) => {
                e.preventDefault();

                const idInput = form.querySelector<HTMLInputElement>('#link-form-id');
                const sectionInput = form.querySelector<HTMLSelectElement>('#link-form-section');
                const categoryInput = form.querySelector<HTMLInputElement>('#link-form-category');
                const titleInput = form.querySelector<HTMLInputElement>('#link-form-title');
                const descInput = form.querySelector<HTMLTextAreaElement>('#link-form-description');
                const urlInput = form.querySelector<HTMLInputElement>('#link-form-url');
                const iconInput = form.querySelector<HTMLInputElement>('#link-form-icon');
                const orderInput = form.querySelector<HTMLInputElement>('#link-form-order');
                const saveBtn = form.querySelector<HTMLButtonElement>('#modal-save-link-btn');
                const btnText = form.querySelector<HTMLElement>('#btn-save-link-text');
                const errorBox = form.querySelector<HTMLElement>('#link-form-error');

                if (!titleInput?.value || !urlInput?.value || !categoryInput?.value) {
                    if (errorBox) {
                        errorBox.textContent = 'Please fill out all required fields.';
                        errorBox.style.display = 'block';
                    }
                    return;
                }

                if (saveBtn && btnText) {
                    saveBtn.disabled = true;
                    btnText.textContent = 'Saving to Cloud...';
                }

                const existingId = idInput?.value.trim();
                const recordId = existingId || `${sectionInput?.value || 'link'}-${Date.now()}`;

                const record: ExternalLinkRecord = {
                    id: recordId,
                    section: (sectionInput?.value as 'tools' | 'links') || 'tools',
                    category: categoryInput.value.trim(),
                    title: titleInput.value.trim(),
                    description: descInput?.value.trim() || '',
                    url: urlInput.value.trim(),
                    icon: iconInput?.value.trim() || '',
                    sort_order: parseInt(orderInput?.value || '0', 10)
                };

                const result = await externalLinksService.upsertLink(record);

                if (saveBtn && btnText) {
                    saveBtn.disabled = false;
                    btnText.textContent = 'Save Link';
                }

                if (result.success) {
                    const existingIndex = this.allItems.findIndex(i => i.id === record.id);
                    if (existingIndex >= 0) {
                        this.allItems[existingIndex] = record;
                    } else {
                        this.allItems.push(record);
                    }
                    modal.style.display = 'none';
                    this.renderContent();
                } else {
                    if (errorBox) {
                        errorBox.textContent = result.error || 'Failed to save link to Supabase.';
                        errorBox.style.display = 'block';
                    }
                }
            };
            form.addEventListener('submit', handleFormSubmit);
            this.cleanups.push(() => form.removeEventListener('submit', handleFormSubmit));
        }

        // Logout
        const logoutBtn = this.container.querySelector<HTMLButtonElement>('#admin-logout-btn');
        if (logoutBtn) {
            const handleLogout = async () => {
                await authService.signOut();
                window.location.hash = '#admin';
            };
            logoutBtn.addEventListener('click', handleLogout);
            this.cleanups.push(() => logoutBtn.removeEventListener('click', handleLogout));
        }
    }

    private openEditModal(item: ExternalLinkRecord): void {
        const modal = this.container.querySelector<HTMLElement>('#admin-link-edit-modal');
        const form = this.container.querySelector<HTMLFormElement>('#admin-link-form');
        const modalTitle = this.container.querySelector<HTMLElement>('#link-modal-title');
        if (!modal || !form) return;

        form.reset();

        const idInput = form.querySelector<HTMLInputElement>('#link-form-id');
        const sectionInput = form.querySelector<HTMLSelectElement>('#link-form-section');
        const categoryInput = form.querySelector<HTMLInputElement>('#link-form-category');
        const titleInput = form.querySelector<HTMLInputElement>('#link-form-title');
        const descInput = form.querySelector<HTMLTextAreaElement>('#link-form-description');
        const urlInput = form.querySelector<HTMLInputElement>('#link-form-url');
        const iconInput = form.querySelector<HTMLInputElement>('#link-form-icon');
        const orderInput = form.querySelector<HTMLInputElement>('#link-form-order');
        const errorBox = form.querySelector<HTMLElement>('#link-form-error');

        if (idInput) idInput.value = item.id;
        if (sectionInput) sectionInput.value = item.section;
        if (categoryInput) categoryInput.value = item.category;
        if (titleInput) titleInput.value = item.title;
        if (descInput) descInput.value = item.description || '';
        if (urlInput) urlInput.value = item.url;
        if (iconInput) iconInput.value = item.icon || '';
        if (orderInput) orderInput.value = (item.sort_order ?? 0).toString();
        if (errorBox) errorBox.style.display = 'none';

        if (modalTitle) modalTitle.textContent = `Edit "${item.title}"`;
        this.updateIconPreview(item.icon || '');

        modal.style.display = 'flex';
    }

    private updateIconPreview(src: string): void {
        const previewBox = this.container.querySelector<HTMLElement>('#icon-preview-box');
        if (!previewBox) return;

        if (src) {
            previewBox.innerHTML = `<img src="${src}" alt="Preview" onerror="this.parentElement.innerHTML='<span class=\\'preview-placeholder\\'>Error</span>'" />`;
        } else {
            previewBox.innerHTML = `<span class="preview-placeholder">Logo</span>`;
        }
    }

    public destroy(): void {
        this.cleanups.forEach(fn => fn());
        this.cleanups = [];
    }
}

