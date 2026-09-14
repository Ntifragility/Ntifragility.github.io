/**
 * @file LinksGridView.ts
 * @description Pure rendering functions for the Useful Links section.
 */

import { LinkItem } from '@/models/LinksModel';

export function renderLinksSection(
    items: LinkItem[],
    filters: { id: string; label: string }[],
    activeFilter: string
): string {
    const filterButtons = filters
        .map(f => `<button data-filter="${f.id}" class="link-filter-btn filter-btn ${f.id === activeFilter ? 'active' : ''}">${f.label}</button>`)
        .join('');

    const cards = items
        .map((item, index) => renderLinkCard(item, index))
        .join('');

    return `
        <section id="links" class="grid-section">
            <div class="grid-section-header">
                <h2 class="grid-section-title">Useful Links</h2>
                <div id="link-filter-container" class="filter-container">
                    ${filterButtons}
                </div>
            </div>
            <div id="links-grid" class="tools-grid">
                ${cards}
            </div>
        </section>
    `;
}

export function renderLinkCard(item: LinkItem, index: number): string {
    const rowIndex = Math.floor(index / 3);
    const colIndex = index % 3;
    const delay = (rowIndex * 0.25) + (colIndex * 0.1);

    return `
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="glass reveal-item tool-card link-card" style="transition-delay: ${delay}s" data-url="${item.url}">
            <div class="card-inner">
                <div class="card-image-wrap tool-card-icon">
                    <img src="${item.icon}" alt="${item.title}" loading="lazy">
                </div>
                <h3 class="tool-card-title">${item.title}</h3>
                <p class="tool-card-desc">${item.description}</p>
            </div>
        </a>
    `;
}

