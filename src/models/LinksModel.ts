/**
 * @file LinksModel.ts
 * @description Model for the Useful Links section. Owns links data and filter state.
 * Supports asynchronous hydration from Supabase external_links table.
 */

import { linksData, LinkItem, LinkCategory } from '@/data/links';
import { externalLinksService } from '@/services/ExternalLinksService';

export type { LinkItem, LinkCategory };

export const linkFilters = [
    { id: 'all', label: 'All' },
    { id: 'standards', label: 'Standards' },
    { id: 'guides', label: 'Guides & Handbooks' },
    { id: 'codes', label: 'Codes & Regs' }
];

export class LinksModel {
    public items: LinkItem[] = linksData;
    private _currentFilter: LinkCategory | 'all' = 'all';

    public async loadCloudItems(): Promise<void> {
        try {
            const records = await externalLinksService.fetchLinks('links');
            if (records && records.length > 0) {
                this.items = records.map(r => ({
                    id: r.id,
                    title: r.title,
                    description: r.description,
                    icon: r.icon,
                    url: r.url,
                    category: r.category as LinkCategory
                }));
            }
        } catch (err) {
            console.warn('[LinksModel] Failed to load cloud items, using defaults:', err);
        }
    }

    public get currentFilter(): LinkCategory | 'all' {
        return this._currentFilter;
    }

    public setFilter(type: LinkCategory | 'all'): void {
        this._currentFilter = type;
    }

    public getFilteredItems(): LinkItem[] {
        if (this._currentFilter === 'all') return this.items;
        return this.items.filter(item => item.category === this._currentFilter);
    }
}
