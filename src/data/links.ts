/**
 * @file links.ts
 * @description Data definitions for Useful Links & Technical Resources.
 */

export type LinkCategory = 'standards' | 'guides' | 'codes';

export interface LinkItem {
    id: string;
    category: LinkCategory;
    title: string;
    description: string;
    icon: string;
    url: string;
}

export const linksData: LinkItem[] = [
    {
        id: '1',
        category: 'standards',
        title: 'IEEE Xplore',
        description: 'Global technical literature and standards repository in electrical and power engineering.',
        icon: '/logos/ieee.svg',
        url: 'https://ieeexplore.ieee.org/'
    },
    {
        id: '2',
        category: 'standards',
        title: 'IEC Standards',
        description: 'International electrotechnical standards for electrical, electronic, and power technologies.',
        icon: '/logos/iec.png',
        url: 'https://webstore.iec.ch/'
    },
    {
        id: '3',
        category: 'guides',
        title: 'Schneider Technical Guides',
        description: 'Electrical installation handbooks, medium/low voltage protection, and network design publications.',
        icon: '/logos/schneider.svg',
        url: 'https://www.se.com/ww/en/work/support/resources/technical-publications/'
    },
    {
        id: '4',
        category: 'guides',
        title: 'Electrical Engineering Portal',
        description: 'Technical articles, calculations, spreadsheets, and electrical engineering guidelines.',
        icon: '/logos/eep.png',
        url: 'https://electrical-engineering-portal.com/'
    },
    {
        id: '5',
        category: 'codes',
        title: 'NFPA 70 (NEC)',
        description: 'The national standard for safe electrical design, installation, and inspection.',
        icon: '/logos/nfpa.png',
        url: 'https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70'
    },
    {
        id: '6',
        category: 'codes',
        title: 'NEMA Standards',
        description: 'Standards for electrical equipment including motors, enclosures, and industrial apparatus.',
        icon: '/logos/nema.png',
        url: 'https://www.nema.org/standards'
    }
];

