/**
 * @file ExternalLinksService.ts
 * @description Cloud service for managing Tools and Useful Links via Supabase external_links table.
 * Automatically seeds default items on first launch and provides local fallback.
 */

import { supabase, isSupabaseConfigured } from './SupabaseClient';
import { toolsData } from '@/data/tools';
import { linksData } from '@/data/links';

export interface ExternalLinkRecord {
    id: string;
    section: 'tools' | 'links';
    category: string;
    title: string;
    description: string;
    icon: string;
    url: string;
    sort_order?: number;
}

export class ExternalLinksService {
    private hasSeeded = false;

    /**
     * Fetch links for a specific section ('tools' or 'links').
     * If cloud table is empty, auto-seeds default items.
     */
    public async fetchLinks(section: 'tools' | 'links'): Promise<ExternalLinkRecord[]> {
        if (isSupabaseConfigured()) {
            try {
                const { data, error } = await supabase
                    .from('external_links')
                    .select('*')
                    .eq('section', section)
                    .order('sort_order', { ascending: true });

                if (!error && data && data.length > 0) {
                    return data as ExternalLinkRecord[];
                }

                // If table is empty for this section, seed defaults
                if (!error && (!data || data.length === 0) && !this.hasSeeded) {
                    await this.seedDefaults();
                    return section === 'tools'
                        ? toolsData.map((t, idx) => ({ ...t, section: 'tools', sort_order: idx }))
                        : linksData.map((l, idx) => ({ ...l, section: 'links', sort_order: idx }));
                }

                if (error) {
                    console.warn('[ExternalLinksService] Query error, using defaults:', error.message);
                }
            } catch (err) {
                console.warn('[ExternalLinksService] Supabase error:', err);
            }
        }

        // Fallback to local static data
        return section === 'tools'
            ? toolsData.map((t, idx) => ({ ...t, section: 'tools', sort_order: idx }))
            : linksData.map((l, idx) => ({ ...l, section: 'links', sort_order: idx }));
    }

    /**
     * Fetch all links for the admin dashboard.
     */
    public async fetchAll(): Promise<ExternalLinkRecord[]> {
        if (isSupabaseConfigured()) {
            try {
                const { data, error } = await supabase
                    .from('external_links')
                    .select('*')
                    .order('section', { ascending: true })
                    .order('sort_order', { ascending: true });

                if (!error && data && data.length > 0) {
                    return data as ExternalLinkRecord[];
                }

                if (!error && (!data || data.length === 0) && !this.hasSeeded) {
                    await this.seedDefaults();
                }
            } catch (err) {
                console.warn('[ExternalLinksService] fetchAll error:', err);
            }
        }

        const defaultTools: ExternalLinkRecord[] = toolsData.map((t, idx) => ({ ...t, section: 'tools', sort_order: idx }));
        const defaultLinks: ExternalLinkRecord[] = linksData.map((l, idx) => ({ ...l, section: 'links', sort_order: idx }));
        return [...defaultTools, ...defaultLinks];
    }

    /**
     * Upsert (create or edit) a tool or useful link.
     */
    public async upsertLink(item: ExternalLinkRecord): Promise<{ success: boolean; error?: string }> {
        if (!isSupabaseConfigured()) {
            return { success: false, error: 'Supabase is not configured.' };
        }

        try {
            const { error } = await supabase
                .from('external_links')
                .upsert({
                    id: item.id || `link-${Date.now()}`,
                    section: item.section,
                    category: item.category,
                    title: item.title,
                    description: item.description,
                    icon: item.icon,
                    url: item.url,
                    sort_order: item.sort_order ?? 0
                });

            if (error) {
                return { success: false, error: error.message };
            }
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message || 'Save failed.' };
        }
    }

    /**
     * Delete a link by ID.
     */
    public async deleteLink(id: string): Promise<{ success: boolean; error?: string }> {
        if (!isSupabaseConfigured()) {
            return { success: false, error: 'Supabase is not configured.' };
        }

        try {
            const { error } = await supabase
                .from('external_links')
                .delete()
                .eq('id', id);

            if (error) {
                return { success: false, error: error.message };
            }
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message || 'Delete failed.' };
        }
    }

    /**
     * Seed initial tools and links into the Supabase external_links table.
     */
    private async seedDefaults(): Promise<void> {
        this.hasSeeded = true;
        try {
            const seeds: ExternalLinkRecord[] = [
                ...toolsData.map((t, idx) => ({ ...t, section: 'tools' as const, sort_order: idx })),
                ...linksData.map((l, idx) => ({ ...l, section: 'links' as const, sort_order: idx }))
            ];

            const { error } = await supabase
                .from('external_links')
                .upsert(seeds);

            if (error) {
                console.warn('[ExternalLinksService] Seeding error:', error.message);
            } else {
                console.info('[ExternalLinksService] Successfully seeded default tools and links to Supabase.');
            }
        } catch (err) {
            console.warn('[ExternalLinksService] Seeding failed:', err);
        }
    }
}

export const externalLinksService = new ExternalLinksService();

