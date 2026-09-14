/**
 * @file LinksController.ts
 * @description Controller connecting LinksModel and LinksGridView.
 */

import { LinksModel, LinkCategory, linkFilters } from '@/models/LinksModel';
import { renderLinksSection, renderLinkCard } from '@/views/LinksGridView';

export class LinksController {
    private model: LinksModel;
    private container: HTMLElement;
    private observer: IntersectionObserver | null = null;

    constructor(container: HTMLElement) {
        this.container = container;
        this.model = new LinksModel();
    }

    public async init(): Promise<void> {
        this.render();
        await this.model.loadCloudItems();
        this.render();
    }

    public render(): void {
        const items = this.model.getFilteredItems();
        this.container.innerHTML = renderLinksSection(items, linkFilters, this.model.currentFilter);
        this.bindEvents();
        this.setupScrollReveal();
    }

    private bindEvents(): void {
        const section = this.container.querySelector('#links');
        if (!section) return;

        // Filter buttons
        const filterBtns = section.querySelectorAll<HTMLButtonElement>('.link-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLButtonElement;
                const filter = target.dataset.filter as LinkCategory | 'all';
                this.handleFilterChange(filter);
            });
        });
    }

    private handleFilterChange(filter: LinkCategory | 'all'): void {
        this.model.setFilter(filter);

        const filterBtns = this.container.querySelectorAll<HTMLButtonElement>('.link-filter-btn');
        filterBtns.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const grid = this.container.querySelector('#links-grid');
        if (grid) {
            const items = this.model.getFilteredItems();
            grid.innerHTML = items.map((item, index) => renderLinkCard(item, index)).join('');
            this.setupScrollReveal();
        }
    }

    private setupScrollReveal(): void {
        if (this.observer) {
            this.observer.disconnect();
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    this.observer?.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const cards = this.container.querySelectorAll('.reveal-item');
        cards.forEach(card => this.observer?.observe(card));
    }

    public destroy(): void {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
}

