/**
 * @file tools.ts
 * @description Data definitions for the tools and tech stack.
 */

export type ToolCategory = 'distribution' | 'cables-grounding' | 'power-quality';
export interface ToolItem {
    id: string;
    category: ToolCategory;
    title: string;
    description: string;
    icon: string; // URL to icon
    url: string;
}

export const toolsData: ToolItem[] = [
    {
        id: '1',
        category: 'distribution',
        title: 'ABB PowerCore',
        description: 'Engineering & configuration tool for electrical distribution and digital power systems.',
        icon: '/logos/abb.svg',
        url: 'https://powercore.abb.com/en'
    },
    {
        id: '2',
        category: 'distribution',
        title: 'SIMARIS Tools',
        description: 'Siemens cloud-based suite of planning, dimensioning, and power distribution tools.',
        icon: '/logos/siemens.svg',
        url: 'https://simaris-toolbox.siemens.cloud/'
    },
    {
        id: '3',
        category: 'distribution',
        title: 'SIMARIS Planning Tools',
        description: 'Comprehensive dimensioning and network planning software by Siemens (design, project & curves).',
        icon: '/logos/siemens.svg',
        url: 'https://www.siemens.com/es-es/products/simaris/'
    },
    {
        id: '4',
        category: 'cables-grounding',
        title: 'ELEK Cable Pro Software',
        description: 'Electrical cable sizing and thermal rating calculations compliant with IEC, AS/NZS, and IEEE.',
        icon: '/logos/elek.png',
        url: 'https://cablepro.elek.com/'
    },
    {
        id: '5',
        category: 'cables-grounding',
        title: 'ELEK SafeGrid Grounding',
        description: 'Substation earthing & grounding grid design software, analyzing touch and step voltages to IEEE 80.',
        icon: '/logos/elek.png',
        url: 'https://elek.com/es/electrical-software/safegrid-earthing/'
    },
    {
        id: '6',
        category: 'power-quality',
        title: 'Eaton Harmonics Calculator',
        description: 'Interactive online tool for estimating electrical system harmonics, THD, and IEEE 519 compliance.',
        icon: '/logos/eaton.svg',
        url: 'https://www.eaton.com/us/en-us/products/controls-drives-automation-sensors/harmonics/harmonics-calculator.html'
    }
];
