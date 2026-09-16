/* ============================================================
   CarlteQ — Main JavaScript v3
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
        var cards = document.querySelectorAll('.project-card');
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

        initMobileMenu();
        initSmoothScroll();
        initPortfolioFilter();

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
