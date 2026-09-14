/**
 * @file AppController.ts
 * @description Main application controller and router.
 * Bootstraps views, coordinates child controllers, manages hash routing and scroll state.
 */

import { appState } from '@/models/AppState';
import { navigationData } from '@/data/navigation';
import { heroData } from '@/data/hero';
import { introData } from '@/data/intro';
import { renderNavigation } from '@/views/NavigationView';
import { renderHero } from '@/views/HeroView';
import { renderIntro } from '@/views/IntroView';
import { ToolsController } from './ToolsController';
import { LinksController } from './LinksController';
import { ContentController } from './ContentController';
import { PostController } from './PostController';
import { AdminController } from './AdminController';

export class AppController {
    private navContainer: HTMLElement;
    private mainContent: HTMLElement;
    private detailContainer: HTMLElement;
    private canvasContainer: HTMLElement | null;
    private contentWrapper: HTMLElement | null;

    private toolsController: ToolsController | null = null;
    private linksController: LinksController | null = null;
    private contentController: ContentController | null = null;
    private postController: PostController;
    private adminController: AdminController;

    private heroObserver: IntersectionObserver | null = null;

    constructor() {
        this.navContainer = document.getElementById('nav-container')!;
        this.mainContent = document.getElementById('main-content')!;
        this.detailContainer = document.getElementById('detail-container')!;
        this.canvasContainer = document.getElementById('canvas-container');
        this.contentWrapper = document.getElementById('content-wrapper');

        this.postController = new PostController(this.detailContainer);
        this.adminController = new AdminController(this.detailContainer);

        this.init();
    }

    public init(): void {
        this.renderHomeLayout();
        this.setupNavigationEvents();
        this.setupHeroEvents();
        this.setupIntroEvents();
        this.setupHeroObserver();
        this.setupRouting();
        this.setupKeyboardNavigation();

        // Subscribe to app state changes
        appState.onChange(() => {
            this.handleStateChange();
        });

        // Initial route handling
        this.handleRoute();
    }

    private renderHomeLayout(): void {
        // Render Navigation
        this.navContainer.innerHTML = renderNavigation(navigationData);

        // Render Hero
        const heroWrapper = document.createElement('div');
        heroWrapper.innerHTML = renderHero(heroData.scrollTargetId);
        this.mainContent.appendChild(heroWrapper.firstElementChild!);

        // Render Intro (Hidden)
        const introWrapper = document.createElement('div');
        introWrapper.id = 'about-section-wrapper';
        introWrapper.style.display = 'none';
        introWrapper.innerHTML = renderIntro({
            title: introData.title,
            bio: introData.bio,
            buttons: introData.buttons.map(b => ({ label: b.label, primary: b.primary }))
        });
        this.mainContent.appendChild(introWrapper);

        // Render Tools section via ToolsController
        const toolsWrapper = document.createElement('div');
        toolsWrapper.id = 'tools-section-wrapper';
        this.mainContent.appendChild(toolsWrapper);
        this.toolsController = new ToolsController(toolsWrapper);
        this.toolsController.init();

        // Render Useful Links section via LinksController
        const linksWrapper = document.createElement('div');
        linksWrapper.id = 'links-section-wrapper';
        this.mainContent.appendChild(linksWrapper);
        this.linksController = new LinksController(linksWrapper);
        this.linksController.init();

        // Render Content section via ContentController
        const contentWrapper = document.createElement('div');
        this.mainContent.appendChild(contentWrapper);
        this.contentController = new ContentController(contentWrapper);
        this.contentController.init();
    }

    private setupNavigationEvents(): void {
        const hamburger = this.navContainer.querySelector('#hamburger-btn');
        const mobileMenu = this.navContainer.querySelector('#mobile-menu');

        if (!hamburger || !mobileMenu) return;

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });

        const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }

    private setupHeroEvents(): void {
        const scrollBtn = this.mainContent.querySelector('#scroll-btn');
        scrollBtn?.addEventListener('click', () => {
            const aboutSection = document.getElementById(heroData.scrollTargetId);
            aboutSection?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    private setupIntroEvents(): void {
        const buttons = this.mainContent.querySelectorAll<HTMLButtonElement>('.intro-btn');
        buttons.forEach(btn => {
            const index = parseInt(btn.dataset.index || '0', 10);
            if (introData.buttons[index]) {
                btn.addEventListener('click', introData.buttons[index].onClick);
            }
        });
    }

    private setupHeroObserver(): void {
        const heroElement = document.getElementById('hero');
        if (!heroElement || !this.canvasContainer) return;

        this.heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (window.location.hash.startsWith('#content/') || window.location.hash.startsWith('#knowledge/')) return;

                if (entry.isIntersecting) {
                    this.canvasContainer?.classList.remove('fade-out');
                    this.navContainer.classList.add('hidden');
                    if (this.canvasContainer) this.canvasContainer.style.pointerEvents = 'auto';
                } else {
                    this.canvasContainer?.classList.add('fade-out');
                    this.navContainer.classList.remove('hidden');
                    if (this.canvasContainer) this.canvasContainer.style.pointerEvents = 'none';
                }
            });
        }, {
            threshold: 0.1
        });

        this.heroObserver.observe(heroElement);
    }

    private setupRouting(): void {
        window.addEventListener('hashchange', () => {
            appState.setRoute(window.location.hash);
            this.handleRoute();
        });
    }

    private handleRoute(): void {
        const hash = window.location.hash;
        const contentId = appState.getContentId();

        if (hash === '#admin' || hash.startsWith('#admin/')) {
            // Admin Hub & Sub-Route Mode
            this.postController.hide();
            const subRoute = hash.replace(/^#admin\/?/, '');
            this.adminController.render(subRoute);

            if (this.contentWrapper) this.contentWrapper.style.display = 'none';
            if (this.canvasContainer) this.canvasContainer.classList.add('fade-out');
            window.scrollTo(0, 0);
        } else if (contentId) {
            // Detail View Mode
            this.adminController.destroy();
            this.postController.render(contentId);

            if (this.contentWrapper) this.contentWrapper.style.display = 'none';
            if (this.canvasContainer) this.canvasContainer.classList.add('fade-out');
            window.scrollTo(0, 0);
        } else {
            // Home / Landing Mode
            const wasDetailView = this.detailContainer.innerHTML !== '';
            this.adminController.destroy();
            this.postController.hide();
            if (this.contentWrapper) this.contentWrapper.style.display = 'block';

            // Anchor scroll jumping logic
            if (hash && hash !== '#') {
                const targetId = hash.substring(1).split('&')[0];
                if (targetId === 'hero') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    if (this.canvasContainer) {
                        this.canvasContainer.classList.remove('fade-out');
                        this.canvasContainer.style.pointerEvents = 'auto';
                    }
                } else {
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        if (wasDetailView && (targetId === 'content' || targetId === 'knowledge')) {
                            // Instantly snap to the knowledge vault without scrolling through intermediate sections
                            document.documentElement.classList.add('no-smooth-scroll');
                            document.body.classList.add('no-smooth-scroll');
                            
                            targetElement.scrollIntoView({ behavior: 'auto' });
                            
                            setTimeout(() => {
                                document.documentElement.classList.remove('no-smooth-scroll');
                                document.body.classList.remove('no-smooth-scroll');
                            }, 50);
                        } else {
                            setTimeout(() => {
                                targetElement.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                        }
                    }
                }
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            if (this.canvasContainer && window.scrollY < 100) {
                this.canvasContainer.classList.remove('fade-out');
                this.canvasContainer.style.pointerEvents = 'auto';
            }
        }
    }

    private setupKeyboardNavigation(): void {
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            // Ignore if user is currently typing in an input, textarea, or editable element
            const activeEl = document.activeElement as HTMLElement | null;
            const tagName = (activeEl?.tagName || '').toLowerCase();
            if (tagName === 'input' || tagName === 'textarea' || activeEl?.isContentEditable) {
                return;
            }

            // Ignore if in Admin panel or Article detail view
            const hash = window.location.hash;
            if (hash.startsWith('#admin') || hash.startsWith('#knowledge/') || hash.startsWith('#content/')) {
                return;
            }

            const sections = ['hero', 'tools', 'links', 'knowledge']
                .map(id => document.getElementById(id))
                .filter((el): el is HTMLElement => el !== null && el.offsetParent !== null);

            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                const nextSection = sections.find(sec => {
                    const rect = sec.getBoundingClientRect();
                    return rect.top > 40;
                });

                if (nextSection) {
                    e.preventDefault();
                    nextSection.scrollIntoView({ behavior: 'smooth' });
                    history.replaceState(null, '', `#${nextSection.id}`);
                }
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                const reversed = [...sections].reverse();
                const prevSection = reversed.find(sec => {
                    const rect = sec.getBoundingClientRect();
                    return rect.top < -40;
                });

                if (prevSection) {
                    e.preventDefault();
                    prevSection.scrollIntoView({ behavior: 'smooth' });
                    history.replaceState(null, '', `#${prevSection.id}`);
                } else if (window.scrollY > 40) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    history.replaceState(null, '', '#hero');
                }
            }
        });
    }

    private handleStateChange(): void {
        // Additional global state reactivity if needed
    }
}
