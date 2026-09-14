/**
 * @file ToolsModel.ts
 * @description Model for the tools/tech-stack grid. Owns data, filter state, and filtering logic.
 * Supports asynchronous hydration from Supabase external_links table.
 */

import { toolsData, ToolItem, ToolCategory } from '@/data/tools';
import { externalLinksService } from '@/services/ExternalLinksService';

export type { ToolItem, ToolCategory };

export const toolFilters = [
    { id: 'all', label: 'All' },
    { id: 'distribution', label: 'Power Distribution' },
    { id: 'cables-grounding', label: 'Cables & Grounding' },
    { id: 'power-quality', label: 'Power Quality' }
];

export class ToolsModel {
    public items: ToolItem[] = toolsData;
    private _currentFilter: ToolCategory | 'all' = 'all';

    public async loadCloudItems(): Promise<void> {
        try {
            const records = await externalLinksService.fetchLinks('tools');
            if (records && records.length > 0) {
                this.items = records.map(r => ({
                    id: r.id,
                    title: r.title,
                    description: r.description,
                    icon: r.icon,
                    url: r.url,
                    category: r.category as ToolCategory
                }));
            }
        } catch (err) {
            console.warn('[ToolsModel] Failed to load cloud items, using defaults:', err);
        }
    }

    public get currentFilter(): ToolCategory | 'all' {
        return this._currentFilter;
    }

    public setFilter(type: ToolCategory | 'all'): void {
        this._currentFilter = type;
    }

    public getFilteredItems(): ToolItem[] {
        if (this._currentFilter === 'all') return this.items;
        return this.items.filter(item => item.category === this._currentFilter);
    }
}
