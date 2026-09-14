/**
 * @file ToolsController.ts
 * @description Controller connecting ToolsModel and ToolsGridView.
 * Handles user interactions (filtering, card clicks) and scroll reveal animations.
 */

import { ToolsModel, ToolCategory, toolFilters } from '@/models/ToolsModel';
import { renderToolsSection, renderToolCard } from '@/views/ToolsGridView';

export class ToolsController {
    private model: ToolsModel;
    private container: HTMLElement;
    private observer: IntersectionObserver | null = null;

    constructor(container: HTMLElement) {
        this.container = container;
        this.model = new ToolsModel();
    }

    public async init(): Promise<void> {
        this.render();
        await this.model.loadCloudItems();
        this.render();
    }

    public render(): void {
        const items = this.model.getFilteredItems();
        this.container.innerHTML = renderToolsSection(items, toolFilters, this.model.currentFilter);
        this.bindEvents();
        this.setupScrollReveal();
    }

    private bindEvents(): void {
        const section = this.container.querySelector('#tools');
        if (!section) return;

        // Filter button clicks
        const filterBtns = section.querySelectorAll<HTMLButtonElement>('.tool-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLButtonElement;
                const filter = target.dataset.filter as ToolCategory | 'all';
                this.handleFilterChange(filter);
            });
        });

        // Card clicks are handled natively by the <a> element with target="_blank"
    }

    private handleFilterChange(filter: ToolCategory | 'all'): void {
        this.model.setFilter(filter);

        // Update active class on filter buttons without full re-render
        const filterBtns = this.container.querySelectorAll<HTMLButtonElement>('.tool-filter-btn');
        filterBtns.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Re-render grid items
        const grid = this.container.querySelector('#tools-grid');
        if (grid) {
            const items = this.model.getFilteredItems();
            grid.innerHTML = items.map((item, index) => renderToolCard(item, index)).join('');
            
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
