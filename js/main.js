/* ============================================================
   CarlteQ ΓÇö Main JavaScript v3
   Zoom intro, blob canvas, GSAP animations, smooth scroll
   ============================================================ */
(function () {
    'use strict';

    /* ---------- Motion & Script Availability ---------- */
    var NO_GSAP = typeof gsap === 'undefined';
    var REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Entrance Animation ---------- */
    function runEntrance(callback) {
        var overlay = document.getElementById('entrance');
        if (!overlay) { callback(); return; }
        if (NO_GSAP) { overlay.style.display = 'none'; callback(); return; }

        var tl = gsap.timeline({
            onComplete: function () {
                overlay.classList.add('done');
                overlay.style.display = 'none';
                callback();
            }
        });

        tl.from('.entrance-logo', { opacity: 0, scale: 0.92, duration: 0.5, ease: 'power2.out' })
          .to('.entrance-logo', { opacity: 0, scale: 1.08, duration: 0.4, ease: 'power2.in' }, '+=0.25')
          .to(overlay, { opacity: 0, duration: 0.5, ease: 'power2.inOut' });
    }

    /* ---------- Code Rain (web-syntax backdrop) ---------- */
    var codeTokens = [
        'const', 'let', '=>', '{', '}', 'function', 'await', 'import', 'export',
        '</div>', '<div>', 'className', 'return', 'async', 'if', 'else',
        'SELECT', 'FROM', 'WHERE', 'INSERT', 'JOIN', 'UPDATE',
        'flex', 'grid', '#fff', 'var(--gold)', 'margin:0', 'padding:0',
        '"carlteq"', "status:'live'", 'GET', 'POST', 'JSON', 'sql', '@media',
        'display:flex', 'position:relative', 'cursor:pointer', 'hover', '::after',
        'React', 'Flutter', 'Node', 'Postgres', 'npm i', 'git push', '0x1F', '=>{',
        'background:black', 'color:gold', 'border-radius:8px', 'z-index:999',
        '<form>', '</form>', '<head>', '>', '</>', 'console.log', 'String(idx)'
    ];

    function initCodeRain(canvasId) {
        var canvas = document.getElementById(canvasId);
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var COL_W = 22;
        var streams = [];
        var rafId = 0;
        var running = false;
        var W = 0, H = 0;

        function resize() {
            var dpr = window.devicePixelRatio || 1;
            W = canvas.offsetWidth;
            H = canvas.offsetHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            var cols = Math.max(1, Math.floor(W / COL_W));
            streams = new Array(cols);
            for (var c = 0; c < cols; c++) {
                streams[c] = newStream(0);
            }
        }

        function newStream(y) {
            var head = y;
            var len = 6 + Math.floor(Math.random() * 10);
            var tokens = [];
            for (var i = 0; i < len; i++) {
                tokens.push(codeTokens[Math.floor(Math.random() * codeTokens.length)]);
            }
            return {
                column: 0,
                head: head,
                speed: Math.random() * 0.35 + 0.25,
                tokens: tokens
            };
        }

        function drawStream(s, colX) {
            var headY = s.head;
            for (var i = 0; i < s.tokens.length; i++) {
                var tokenY = headY - i * 20;
                var alpha = 1 - (i / s.tokens.length);
                var maxAlpha = 0.34;
                ctx.font = '12px "JetBrains Mono", monospace';
                // leader token brighter gold, tail fades
                if (i === 0) {
                    ctx.fillStyle = 'rgba(249, 223, 159, ' + (Math.min(alpha, 1) * 0.55) + ')';
                } else if (i % 2 === 0) {
                    ctx.fillStyle = 'rgba(212, 175, 55, ' + (alpha * maxAlpha) + ')';
                } else {
                    ctx.fillStyle = 'rgba(206, 195, 197, ' + (alpha * maxAlpha * 0.8) + ')';
                }
                if (tokenY > -20 && tokenY < H + 20) {
                    ctx.fillText(s.tokens[i], colX, tokenY);
                }
                if (tokenY > H + 30) break;
            }
        }

        function animate() {
            if (!running) return;
            ctx.clearRect(0, 0, W, H);
            for (var c = 0; c < streams.length; c++) {
                var s = streams[c];
                s.head += s.speed;
                drawStream(s, c * COL_W + 4);
                if (s.head - (s.tokens.length) * 20 > H) {
                    streams[c] = newStream(-(Math.random() * H * 0.4));
                    streams[c].column = c;
                }
            }
            rafId = requestAnimationFrame(animate);
        }

        function start() {
            if (running) return;
            running = true;
            rafId = requestAnimationFrame(animate);
        }
        function stop() {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
        }

        resize();
        window.addEventListener('resize', resize);

        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) { start(); } else { stop(); }
                });
            }, { rootMargin: '200px 0px' });
            io.observe(canvas);
        } else {
            start();
        }
    }

    /* ---------- Hero Animation ---------- */
    function animateHero() {
        var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.8 }, 0.2)
          .to('.hero-line-inner', { y: 0, duration: 1.2, stagger: 0.15 }, 0.4)
          .to('.hero-sub', { opacity: 1, y: 0, duration: 0.8 }, 1)
          .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8 }, 1.2)
          .to('.hero-scroll-indicator', { opacity: 1, duration: 0.8 }, 1.5);
    }

    /* ---------- GSAP ScrollTrigger Setup ---------- */
    function initScrollAnimations() {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        // Navbar scroll
        var navbar = document.getElementById('navbar');
        if (navbar) {
            ScrollTrigger.create({
                start: 'top -80',
                onToggle: function (self) {
                    navbar.classList.toggle('nav-scrolled', self.isActive);
                }
            });
        }

        // Sticky cards reveal
        var stickyCards = document.querySelectorAll('.sticky-card');
        stickyCards.forEach(function (card) {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    end: 'top 30%',
                    toggleActions: 'play none none reverse',
                    onEnter: function () { card.classList.add('active'); },
                    onLeaveBack: function () { card.classList.remove('active'); }
                },
                opacity: 0,
                x: 60,
                duration: 0.8,
                ease: 'power3.out'
            });
        });

        // Glass cards reveal
        gsap.utils.toArray('.glass-card').forEach(function (card, i) {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 50,
                duration: 0.8,
                delay: i * 0.15,
                ease: 'power3.out'
            });
        });

        // Horizontal scroll section
        var hscrollTrack = document.querySelector('.hscroll-track');
        if (hscrollTrack) {
            var mm = gsap.matchMedia();
            mm.add('(min-width: 901px)', function () {
                var totalScroll = hscrollTrack.scrollWidth - window.innerWidth + 64;

                gsap.to(hscrollTrack, {
                    x: -totalScroll,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.hscroll-wrapper',
                        start: 'top top',
                        end: '+=' + totalScroll,
                        scrub: 1,
                        pin: true,
                        anticipatePin: 1,
                        invalidateOnRefresh: true
                    }
                });
            });
        }

        // Marquee speed on scroll
        var marqueeContent = document.querySelector('.marquee-content');
        if (marqueeContent) {
            ScrollTrigger.create({
                trigger: '.marquee-section',
                start: 'top bottom',
                end: 'bottom top',
                onUpdate: function (self) {
                    var speed = 25 - (self.getVelocity() / 200);
                    speed = Math.max(10, Math.min(50, speed));
                    marqueeContent.style.animationDuration = speed + 's';
                }
            });
        }

        // Founder portrait
        var founderPortrait = document.querySelector('.founder-portrait');
        if (founderPortrait) {
            gsap.from(founderPortrait, {
                scrollTrigger: {
                    trigger: founderPortrait,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                x: -50,
                duration: 1,
                ease: 'power3.out'
            });
        }

        // CTA section
        var ctaSection = document.querySelector('.cta-section');
        if (ctaSection) {
            gsap.from('.cta-content', {
                scrollTrigger: {
                    trigger: ctaSection,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 60,
                duration: 1,
                ease: 'power3.out'
            });
        }

        // Section titles
        gsap.utils.toArray('.section-title').forEach(function (title) {
            gsap.from(title, {
                scrollTrigger: {
                    trigger: title,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: 'power3.out'
            });
        });

        // Section subtitles
        gsap.utils.toArray('.section-subtitle').forEach(function (sub) {
            gsap.from(sub, {
                scrollTrigger: {
                    trigger: sub,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 20,
                duration: 0.8,
                delay: 0.2,
                ease: 'power3.out'
            });
        });

        // Stats counter animation
        gsap.utils.toArray('.stat-number').forEach(function (stat) {
            var target = stat.textContent;
            if (target.includes('+')) {
                gsap.from(stat, {
                    scrollTrigger: {
                        trigger: stat,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    },
                    textContent: 0,
                    duration: 2,
                    snap: { textContent: 1 },
                    ease: 'power2.out',
                    onUpdate: function () {
                        stat.textContent = Math.round(parseFloat(stat.textContent)) + '+';
                    }
                });
            }
        });
    }

    /* ---------- 3D Tilt Effect ---------- */
    function initTilt() {
        if (window.innerWidth <= 900) return;
        var tiltEls = document.querySelectorAll('[data-tilt]');
        tiltEls.forEach(function (el) {
            gsap.set(el, { transformPerspective: 800 });
            var rx = gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power2.out' });
            var ry = gsap.quickTo(el, 'rotationY', { duration: 0.4, ease: 'power2.out' });
            el.addEventListener('mousemove', function (e) {
                var rect = el.getBoundingClientRect();
                var x = (e.clientX - rect.left) / rect.width - 0.5;
                var y = (e.clientY - rect.top) / rect.height - 0.5;
                ry(x * 8);
                rx(-y * 8);
            });
            el.addEventListener('mouseleave', function () {
                rx(0);
                ry(0);
            });
        });
    }

    /* ---------- Mobile Menu ---------- */
    function initMobileMenu() {
        var toggle = document.querySelector('.nav-toggle');
        var navLinks = document.querySelector('.nav-links');
        if (!toggle || !navLinks) return;

        function closeMenu() {
            navLinks.classList.remove('open');
            toggle.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('nav-open');
        }

        toggle.addEventListener('click', function () {
            var isOpen = navLinks.classList.toggle('open');
            toggle.classList.toggle('open');
            toggle.setAttribute('aria-expanded', isOpen);
            document.body.classList.toggle('nav-open', isOpen);
            if (isOpen) {
                var firstLink = navLinks.querySelector('a');
                if (firstLink) firstLink.focus();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navLinks.classList.contains('open')) {
                closeMenu();
                toggle.focus();
            }
        });

        navLinks.addEventListener('click', function (e) {
            if (e.target.closest('a') && !e.target.closest('.dropdown')) {
                closeMenu();
            }
        });

        var dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(function (dropdown) {
            var toggleBtn = dropdown.querySelector('.dropdown-toggle');
            if (!toggleBtn) return;
            toggleBtn.addEventListener('click', function () {
                if (window.matchMedia('(max-width: 900px)').matches) {
                    var isOpen = dropdown.classList.toggle('open');
                    toggleBtn.setAttribute('aria-expanded', isOpen);
                }
            });
        });
    }

    /* ---------- Smooth Anchor Scroll ---------- */
    function initSmoothScroll() {
        if (typeof gsap === 'undefined' || typeof ScrollToPlugin === 'undefined') return;
        if (REDUCED_MOTION) return;
        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                var href = this.getAttribute('href');
                if (!href || href === '#') return;
                var target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    gsap.to(window, {
                        scrollTo: { y: target, offsetY: 80 },
                        duration: 1,
                        ease: 'power3.inOut'
                    });
                }
            });
        });
    }

    /* ---------- Portfolio Filter ---------- */
    function initPortfolioFilter() {
        var buttons = document.querySelectorAll('.filter-btn');
        var cards = document.querySelectorAll('.portfolio-grid .project-card');
        if (!buttons.length || !cards.length) return;

        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                buttons.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                var filter = btn.getAttribute('data-filter');
                cards.forEach(function (card) {
                    var show = filter === 'all' || card.getAttribute('data-category') === filter;
                    card.style.display = show ? 'flex' : 'none';
                });
            });
        });
    }

    /* ---------- Showcase Gallery Filter ---------- */
    function initGalleryFilter() {
        var buttons = document.querySelectorAll('[data-gallery-filter]');
        var items = document.querySelectorAll('.gallery-item');
        if (!buttons.length || !items.length) return;

        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var filter = btn.getAttribute('data-gallery-filter');
                buttons.forEach(function (b) {
                    var isActive = b === btn;
                    b.classList.toggle('active', isActive);
                    b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                });
                items.forEach(function (item) {
                    var show = filter === 'all' || item.getAttribute('data-category') === filter;
                    item.classList.toggle('is-hidden', !show);
                });
            });
        });
    }

    /* ---------- Lightbox Viewer ---------- */
    function initLightbox() {
        var triggers = document.querySelectorAll('.gallery-trigger');
        var box = document.getElementById('lightbox');
        if (!triggers.length || !box) return;

        var img = document.getElementById('lightbox-image');
        var titleEl = document.getElementById('lightbox-title');
        var metaEl = document.getElementById('lightbox-meta');
        var closeBtn = box.querySelector('.lightbox-close');
        var prevBtn = box.querySelector('.lightbox-prev');
        var nextBtn = box.querySelector('.lightbox-next');

        var current = 0;
        var lastFocused = null;

        function visibleTriggers() {
            return Array.prototype.filter.call(triggers, function (trigger) {
                var item = trigger.closest('.gallery-item');
                return item && !item.classList.contains('is-hidden');
            });
        }

        function render(index) {
            var list = visibleTriggers();
            if (!list.length) return;
            current = (index + list.length) % list.length;
            var trigger = list[current];
            img.setAttribute('src', trigger.getAttribute('data-gallery-full') || '');
            img.setAttribute('alt', trigger.getAttribute('data-gallery-title') || '');
            titleEl.textContent = trigger.getAttribute('data-gallery-title') || '';
            metaEl.textContent = trigger.getAttribute('data-gallery-category') || '';
        }

        function open(trigger) {
            lastFocused = document.activeElement;
            render(visibleTriggers().indexOf(trigger));
            box.hidden = false;
            document.body.classList.add('lightbox-open');
            document.dispatchEvent(new CustomEvent('cursor:reset'));
            closeBtn.focus();
        }

        function close() {
            box.hidden = true;
            document.body.classList.remove('lightbox-open');
            img.removeAttribute('src');
            document.dispatchEvent(new CustomEvent('cursor:reset'));
            if (lastFocused) lastFocused.focus();
        }

        triggers.forEach(function (trigger) {
            trigger.addEventListener('click', function () { open(trigger); });
        });

        closeBtn.addEventListener('click', close);
        prevBtn.addEventListener('click', function () { render(current - 1); });
        nextBtn.addEventListener('click', function () { render(current + 1); });

        box.addEventListener('click', function (e) {
            if (e.target === box) close();
        });

        document.addEventListener('keydown', function (e) {
            if (box.hidden) return;

            if (e.key === 'Escape') {
                close();
            } else if (e.key === 'ArrowLeft') {
                render(current - 1);
            } else if (e.key === 'ArrowRight') {
                render(current + 1);
            } else if (e.key === 'Tab') {
                var focusables = [closeBtn, prevBtn, nextBtn];
                var first = focusables[0];
                var last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }

    /* ---------- WebMCP (in-browser tools for agents) ---------- */
    function initWebMCP() {
        try {
            if (typeof navigator === 'undefined') return;
            if (!navigator.modelContext) return;
            if (typeof navigator.modelContext.registerTool !== 'function') return;

            navigator.modelContext.registerTool({
                name: 'get_carlteq_services',
                description: 'List CarlteQ services',
                inputSchema: { type: 'object', properties: {} },
                execute: async function () {
                    return [
                        { name: 'Brand Identity & Design' },
                        { name: 'Web Design & Development' },
                        { name: 'Digital Marketing' },
                        { name: 'Event Production' },
                        { name: 'Creative Technology' }
                    ];
                }
            });

            navigator.modelContext.registerTool({
                name: 'get_carlteq_portfolio',
                description: 'Get CarlteQ portfolio links',
                inputSchema: { type: 'object', properties: {} },
                execute: async function () {
                    return [
                        { title: 'Portfolio', url: 'https://carlteq.io/portfolio.html' },
                        { title: 'Branding', url: 'https://carlteq.io/branding.html' }
                    ];
                }
            });

            navigator.modelContext.registerTool({
                name: 'submit_contact_inquiry',
                description: 'Get contact details for CarlteQ',
                inputSchema: { type: 'object', properties: {} },
                execute: async function () {
                    return {
                        email: 'info@carlteq.io',
                        whatsapp: 'https://wa.me/254799213928',
                        form: 'https://carlteq.io/contact.html'
                    };
                }
            });
        } catch (e) {}
    }
    function initCustomCursor() {
        if (!window.matchMedia) return;
        if (!window.matchMedia('(pointer: fine)').matches) return;
        if (REDUCED_MOTION) return;

        var dotWrap = document.createElement('div');
        dotWrap.className = 'cursor-item cursor-dot-wrap';
        var dot = document.createElement('div');
        dot.className = 'cursor-dot';
        dotWrap.appendChild(dot);

        var ringWrap = document.createElement('div');
        ringWrap.className = 'cursor-item cursor-ring-wrap';
        var ring = document.createElement('div');
        ring.className = 'cursor-ring';
        var label = document.createElement('span');
        label.className = 'cursor-label';
        label.textContent = 'View';
        ring.appendChild(label);
        ringWrap.appendChild(ring);

        var pulse = document.createElement('div');
        pulse.className = 'cursor-item cursor-pulse';

        document.body.appendChild(dotWrap);
        document.body.appendChild(ringWrap);
        document.body.appendChild(pulse);
        document.documentElement.classList.add('cursor-none');

        var mx = -100, my = -100;
        var rx = -100, ry = -100;
        var inside = false;
        var running = false;
        var rafId = 0;

        function syncVisibility() {
            dotWrap.classList.toggle('is-visible', inside);
            ringWrap.classList.toggle('is-visible', inside);
        }

        function setState(cls, on) {
            dotWrap.classList.toggle(cls, on);
            ringWrap.classList.toggle(cls, on);
        }

        function frame() {
            if (!running) return;
            rx += (mx - rx) * 0.2;
            ry += (my - ry) * 0.2;
        dotWrap.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
        ringWrap.style.transform = 'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0) rotate(45deg)';
            rafId = requestAnimationFrame(frame);
        }

        function start() {
            if (running) return;
            running = true;
            rafId = requestAnimationFrame(frame);
        }

        function stop() {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = 0;
        }

        function updateCursorSurface(x, y) {
            try {
                var el = document.elementFromPoint(x, y);
                var inLight = false;
                while (el && el !== document.body && el !== document.documentElement) {
                    if (el.classList && (el.classList.contains('section-white') || el.classList.contains('events-band-warm') || el.classList.contains('brand-band-warm'))) { inLight = true; break; }
                    el = el.parentElement;
                }
                dotWrap.classList.toggle('in-white', inLight);
                ringWrap.classList.toggle('in-white', inLight);
                if (pulse) pulse.classList.toggle('in-white', inLight);
            } catch (e) {}
        }

        document.addEventListener('mousemove', function (e) {
            mx = e.clientX;
            my = e.clientY;
            if (!inside) {
                inside = true;
                rx = mx;
                ry = my;
                syncVisibility();
            }
            updateCursorSurface(e.clientX, e.clientY);
        }, { passive: true });

        document.addEventListener('mouseenter', function () {
            inside = true;
            start();
            syncVisibility();
        });

        document.addEventListener('mouseleave', function () {
            inside = false;
            syncVisibility();
        });

        document.addEventListener('mouseover', function (e) {
            var target = e.target;
            if (!target || !target.closest) return;

            var isView = !!target.closest('.gallery-trigger');
            var isInteractive = !!target.closest('a, button, [role="button"], [data-tilt]');
            var textField = target.closest('textarea, select, input');
            var isText = !!textField && textField.type !== 'submit' && textField.type !== 'button';

            setState('is-view', isView);
            setState('is-hover', isInteractive && !isView);
            setState('is-hidden', isText);
        });

        document.addEventListener('mousedown', function () {
            setState('is-down', true);
        });
        document.addEventListener('mouseup', function () {
            setState('is-down', false);
        });

        document.addEventListener('click', function (e) {
            pulse.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0) rotate(45deg)';
            pulse.classList.remove('is-active');
            void pulse.offsetWidth;
            pulse.classList.add('is-active');
        });

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) { stop(); } else { start(); }
        });

        document.addEventListener('cursor:reset', function () {
            setState('is-view', false);
            setState('is-hover', false);
            setState('is-hidden', false);
        });

        start();
    }

    /* ---------- Shared Footer ---------- */
    function initSharedFooter() {
        var footers = document.querySelectorAll('footer[data-shared-footer], footer#site-footer, footer');
        if (!footers.length) return;
        var fallbackHtml = "<div class=\"container footer-inner\">\n    <div class=\"footer-brand\">\n        <img src=\"assets/carlteq-logo.svg\" alt=\"CarlteQ\" class=\"footer-logo\">\n        <p>Branding &middot; Software &middot; Social &middot; Events</p>\n        <div class=\"footer-socials\">\n            <a href=\"https://www.facebook.com/CarlteQ.main\" target=\"_blank\" rel=\"noopener\" aria-label=\"Facebook\"><svg viewBox=\"0 0 24 24\"><path d=\"M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z\"/></svg></a>\n            <a href=\"https://www.instagram.com/_carlteq/\" target=\"_blank\" rel=\"noopener\" aria-label=\"Instagram\"><svg viewBox=\"0 0 24 24\"><path d=\"M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z\"/></svg></a>\n            <a href=\"https://github.com/CarlteQ-git/\" target=\"_blank\" rel=\"noopener\" aria-label=\"GitHub\"><svg viewBox=\"0 0 24 24\"><path d=\"M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z\"/></svg></a>\n            <a href=\"https://www.behance.net/designerokwach\" target=\"_blank\" rel=\"noopener\" aria-label=\"Behance\"><svg viewBox=\"0 0 24 24\"><path d=\"M17.197 0v5.484h4.815v1.627h-4.815v3.103h5.391c.199-2.827-1.315-4.655-4.197-4.655-3.166 0-4.884 1.965-4.884 5.076 0 3.217 1.718 5.007 4.884 5.007 2.77 0 4.12-1.459 4.787-3.436h-2.325c-.35.995-1.316 1.563-2.395 1.563-1.589 0-2.53-.982-2.53-2.775h7.33c.056-4.146-2.069-7.994-6.656-7.994zM0 16.543c.578 1.002 1.58 1.652 3.431 1.652 1.968 0 3.096-.966 3.096-2.575 0-1.234-.678-1.902-2.575-2.449l-.805-.259c-.866-.289-1.224-.656-1.224-1.174 0-.617.578-1.074 1.444-1.074.867 0 1.466.422 1.71 1.111l2.044-1.236c-.645-1.413-1.956-2.176-3.732-2.176-1.981 0-3.588 1.234-3.588 3.027 0 1.235.688 1.971 2.222 2.468l.925.295c.888.284 1.29.686 1.29 1.294 0 .658-.745 1.16-1.742 1.16-.968 0-1.708-.504-2.035-1.29L0 16.543zm4.35-10.772h6.798v1.274H4.35V5.771z\"/></svg></a>\n            <a href=\"https://stackoverflow.com/users/30054240/caleb-okwach-carlteq\" target=\"_blank\" rel=\"noopener\" aria-label=\"Stack Overflow\"><svg viewBox=\"0 0 24 24\"><path d=\"M17.509 19.419l-3.7-3.7-1.1 1.1 3.7 3.7zm0-6.6l-3.7-3.7-1.1 1.1 3.7 3.7zM6.49 19.419l3.7-3.7 1.1 1.1-3.7 3.7zm0-6.6l3.7-3.7 1.1 1.1-3.7 3.7zM3 15.3c0 2.9 2.1 4.2 3.5 4.2h1.3v-.1c-1.7-.6-2.8-1.6-2.8-3.6v-6.1H3zm9.9-6.1v5.6h2.1v-5.6zm6.6-2.9l-2.8-2.7-1 1 2.7 2.7zm-9.1 2.9h1.9v-2.1h-1.9zm9.9 5.6c0 2-1.1 3-2.8 3.6v.1h1.3c1.4 0 3.5-1.3 3.5-4.2v-6.1h-2.1v6.6z\"/></svg></a>\n        </div>\n    </div>\n    <div class=\"footer-col\">\n        <h4>Divisions</h4>\n        <a href=\"branding.html\">Branding & Merch</a>\n        <a href=\"web-systems.html\">Software Services</a>\n        <a href=\"marketing.html\">Social Media & Strategy</a>\n        <a href=\"events.html\">Events & Experience</a>\n    </div>\n    <div class=\"footer-col\">\n        <h4>Company</h4>\n        <a href=\"index.html\">Home</a>\n        <a href=\"about.html\">About</a>\n        <a href=\"portfolio.html\">Portfolio</a>\n        <a href=\"contact.html\">Contact</a>\n    </div>\n    <div class=\"footer-col\">\n        <h4>Legal</h4>\n        <a href=\"terms.html\">Terms of Service</a>\n        <a href=\"privacy.html\">Privacy Policy</a>\n    </div>\n    <div class=\"footer-col\">\n        <h4>Contact</h4>\n        <a href=\"mailto:info@carlteq.io\">info@carlteq.io</a>\n        <a href=\"tel:+254799213928\">+254-799-213-928</a>\n        <span>Nairobi, Kenya &middot; Global Operations</span>\n    </div>\n</div>\n<p class=\"footer-copy\">&copy; 2026 CarlteQ | Engineered by CarlteQ</p>";
        var applied = false;
        function apply(html, source) {
            if (applied) return;
            applied = true;
            footers.forEach(function (footer) {
                footer.innerHTML = html;
                footer.setAttribute('data-shared-footer', source || 'loaded');
            });
        }
        var paths = ['partials/footer.html', '/partials/footer.html'];
        var i = 0;
        function tryNext() {
            if (i >= paths.length) { apply(fallbackHtml, 'fallback'); return; }
            var url = paths[i++];
            fetch(url, { cache: 'no-cache' })
                .then(function (res) { if (!res.ok) throw new Error('bad'); return res.text(); })
                .then(function (html) { if (html && html.indexOf('footer-inner') !== -1) apply(html, 'partial'); else tryNext(); })
                .catch(function () { tryNext(); });
        }
        tryNext();
        setTimeout(function () { if (!applied) apply(fallbackHtml, 'fallback-timeout'); }, 1500);
    }

    /* ---------- Legacy Reveal Fallback (for inner pages) ---------- */
    function initLegacyReveal() {
        var revealEls = document.querySelectorAll('.reveal');
        if (!revealEls.length) return;
        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            revealEls.forEach(function (el) { observer.observe(el); });
        } else {
            revealEls.forEach(function (el) { el.classList.add('active'); });
        }
    }

    /* ---------- Initialize ---------- */
    document.addEventListener('DOMContentLoaded', function () {
        var isHome = window.location.pathname.endsWith('index.html') ||
                     window.location.pathname.endsWith('/') ||
                     window.location.pathname === '';

        initSharedFooter();
        initMobileMenu();
        initSmoothScroll();
        initPortfolioFilter();
        initGalleryFilter();
        initLightbox();
        initCustomCursor();

        if (typeof initWebMCP === 'function') { try { initWebMCP(); } catch(e){} }

        if (isHome) {
            if (NO_GSAP || REDUCED_MOTION) {
                document.documentElement.classList.add('no-anim');
                var entrance = document.getElementById('entrance');
                if (entrance) { entrance.classList.add('done'); entrance.style.display = 'none'; }
                return;
            }
            runEntrance(function () {
                initCodeRain('hero-code');
                initCodeRain('cta-code');
                initScrollAnimations();
                initTilt();
                animateHero();
            });
        } else {
            if (NO_GSAP || REDUCED_MOTION) {
                document.documentElement.classList.add('no-anim');
                return;
            }
            initLegacyReveal();
            var navbar = document.getElementById('navbar');
            if (navbar) {
                var ticking = false;
                window.addEventListener('scroll', function () {
                    if (ticking) return;
                    ticking = true;
                    requestAnimationFrame(function () {
                        navbar.classList.toggle('nav-scrolled', window.scrollY > 50);
                        ticking = false;
                    });
                }, { passive: true });
            }
        }
    });

})();
