/**
 * @file navigation.ts
 * @description Configuration for navigation links and structure.
 */

export interface NavLink {
    label: string;
    href: string;
}

export const navigationData = {
    logo: 'Marco',
    links: [
        { label: 'Start', href: '#hero' },
        { label: 'Tools', href: '#tools' },
        { label: 'Links', href: '#links' },
        { label: 'Knowledge', href: '#knowledge' }
    ] as NavLink[]
};
