// BG canvas animation
(function() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    let mouse = { x: null, y: null, radius: 100 }; // Mouse object for minimal interaction

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    for (let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 2.0 + 0.8, // Slightly larger base radius
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            a: Math.random() * 0.4 + 0.3 // Higher base opacity
        });
    }
    function draw() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach((p, i) => {
            // Mouse Repulsion logic
            if (mouse.x != null && mouse.y != null) {
                let dxMouse = p.x - mouse.x;
                let dyMouse = p.y - mouse.y;
                let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                
                // Draw connecting line to mouse tip!
                if (distMouse < 150) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    // Fade line out the further it gets from mouse
                    ctx.strokeStyle = `rgba(0, 229, 255, ${0.25 * (1 - distMouse / 150)})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }

                if (distMouse < mouse.radius) {
                    let forceDirectionX = dxMouse / distMouse;
                    let forceDirectionY = dyMouse / distMouse;
                    let force = (mouse.radius - distMouse) / mouse.radius;
                    // Apply subtle repulsion (0.5 max speed injection)
                    p.x += forceDirectionX * force * 0.5;
                    p.y += forceDirectionY * force * 0.5;
                }
            }

            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
            
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,229,255,${p.a})`; ctx.fill();
            
            particles.forEach((q, j) => {
                if (i !== j) {
                    const dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx*dx + dy*dy);
                    if (d < 120) {
                        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
                        // Make links slightly brighter if near mouse
                        let linkAlpha = 0.1 * (1 - d / 120); // Slightly brighter base connections
                        if (mouse.x != null && mouse.y != null) {
                             let dToMouse = Math.sqrt(Math.pow(p.x - mouse.x, 2) + Math.pow(p.y - mouse.y, 2));
                             if (dToMouse < parseInt(mouse.radius) + 20) linkAlpha = 0.25 * (1 - d / 120);
                        }
                        ctx.strokeStyle = `rgba(0,229,255,${linkAlpha})`;
                        ctx.lineWidth = 0.4; ctx.stroke();
                    }
                }
            });
        });
        requestAnimationFrame(draw);
    }
    draw();
})();

// ==========================================
// Ambient Interactive Glow Background
// ==========================================
(function() {
    const canvas = document.getElementById('matrix-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let w, h;
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    function init() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    
    window.addEventListener('mousemove', (e) => {
        target.x = e.clientX;
        target.y = e.clientY;
    });
    
    function drawGlow() {
        ctx.clearRect(0, 0, w, h);
        
        // Smooth ease toward mouse
        mouse.x += (target.x - mouse.x) * 0.05;
        mouse.y += (target.y - mouse.y) * 0.05;
        
        // Draw radial glow
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 600);
        gradient.addColorStop(0, 'rgba(0, 229, 255, 0.08)'); // Very subtle cyan core
        gradient.addColorStop(0.5, 'rgba(0, 229, 255, 0.02)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        
        requestAnimationFrame(drawGlow);
    }
    
    init();
    window.addEventListener('resize', init);
    drawGlow();
})();

// Glitch effect
document.querySelectorAll('.glitch-text').forEach(el => {
    setInterval(() => { el.style.textShadow = `${(Math.random()-0.5)*6}px 0 #ff0055, ${(Math.random()-0.5)*6}px 0 #00e5ff`; setTimeout(() => el.style.textShadow = '', 80); }, 3000 + Math.random()*2000);
});

// Scroll reveal & Typewriter
// Reveal Animations & Text Decrypt
const observerOptions = { threshold: 0.1 };
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            
            // Trigger text decrypt if it has the class
            const decryptEls = entry.target.querySelectorAll('.decrypt-on-scroll');
            decryptEls.forEach(el => decryptText(el));
            
            // Trigger typewriter if it has one
            const tw = entry.target.querySelector('.typewriter');
            if (tw && !tw.classList.contains('typed')) {
                tw.classList.add('typed');
                const txt = tw.getAttribute('data-text');
                tw.textContent = '';
                let i = 0;
                const typeWriter = setInterval(() => {
                    if (i < txt.length) {
                        tw.textContent += txt.charAt(i);
                        i++;
                    } else {
                        clearInterval(typeWriter);
                    }
                }, 50);
            }
            
            revealObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

function decryptText(el) {
    const targetText = el.getAttribute('data-text') || el.innerText;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+";
    let iteration = 0;
    
    const interval = setInterval(() => {
        el.innerText = targetText.split("").map((letter, index) => {
            if (index < iteration) return targetText[index];
            return chars[Math.floor(Math.random() * chars.length)];
        }).join("");
        
        if (iteration >= targetText.length) clearInterval(interval);
        iteration += 1 / 3;
    }, 30);
}

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .timeline-item').forEach(el => revealObserver.observe(el));

// Podcast slider
const slider = document.getElementById('podcastSlider');
document.getElementById('slideLeft').addEventListener('click', () => slider.scrollBy({ left: -340, behavior: 'smooth' }));
document.getElementById('slideRight').addEventListener('click', () => slider.scrollBy({ left: 340, behavior: 'smooth' }));

// Recommendations slider
const recSlider = document.getElementById('recSlider');
if (recSlider) {
    document.getElementById('slideLeftRec').addEventListener('click', () => recSlider.scrollBy({ left: -380, behavior: 'smooth' }));
    document.getElementById('slideRightRec').addEventListener('click', () => recSlider.scrollBy({ left: 380, behavior: 'smooth' }));
}

// â”€â”€ Merged, rAF-throttled scroll handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const nav = document.getElementById('main-nav');
const navActivePath = document.getElementById('nav-active-path');
const sections = document.querySelectorAll('section');
let lastSection = 'HOME';
let scrollTicking = false;

function onScroll() {
    const sy = window.scrollY;
    // Nav scrolled class
    nav.classList.toggle('scrolled', sy > 60);
    // Scroll spy
    if (navActivePath) {
        const atBottom = (window.innerHeight + sy) >= document.documentElement.scrollHeight - 50;
        let current = 'HOME';
        if (atBottom) {
            // Force last section when near page bottom
            current = sections[sections.length - 1].getAttribute('id').toUpperCase();
        } else {
            sections.forEach(sec => {
                if (sy >= sec.offsetTop - 150) current = sec.getAttribute('id').toUpperCase();
            });
        }
        if (current !== lastSection) {
            navActivePath.textContent = current;
            lastSection = current;
            // Glow the matching nav link
            document.querySelectorAll('.nav-links a').forEach(a => {
                const href = a.getAttribute('href');
                a.classList.toggle('nav-active', href === '#' + current.toLowerCase());
            });
        }
    }
    scrollTicking = false;
}

window.addEventListener('scroll', () => {
    if (!scrollTicking) { requestAnimationFrame(onScroll); scrollTicking = true; }
}, { passive: true });

// Set date in hero terminal
const dateEl = document.getElementById('current-date');
if (dateEl) dateEl.textContent = new Date().toDateString();

// Hamburger menu
const ham = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
ham.addEventListener('click', () => { ham.classList.toggle('active'); navLinks.classList.toggle('open'); });

// Hacker Terminal Feed Cycler
const feedData = [
    '<span class="t-time hl-red">[FUTURE]</span> <strong class="t-badge hl-blue">[EVENT]</strong> <span class="t-text">22nd March - Guest speaker "AI, Cyber Security and content security" - Colombo Creative Academy.</span>',
    '<span class="t-time hl-blue">[LIVE]</span> <strong class="t-badge hl-red">[NEW_RECORD]</strong> <span class="t-text">Achieved 15+ hours of curated technical cyber awareness podcasts on air.</span>',
    '<span class="t-time hl-blue">[SYS]</span> <strong class="t-badge hl-blue">[APPOINTMENT]</strong> <span class="t-text">Now guiding newcomers as Consultant Educator at NIBM CertHub.</span>',
    '<span class="t-time hl-blue">[SYS]</span> <strong class="t-badge hl-blue">[IMPACT]</strong> <span class="t-text">Physically educating 1,000+ students across workshops and live training sessions.</span>',
    '<span class="t-time hl-blue">[LOG]</span> <strong class="t-badge hl-blue">[CERTIFICATION]</strong> <span class="t-text">Currently pursuing TCM Practical Ethical Hacking (PEH) & Red Hat RHCSA.</span>'
];

const feedContainer = document.getElementById('syslog-feed');
if (feedContainer) {
    let lines = [...feedData];
    
    function renderFeed() {
        feedContainer.innerHTML = `
            <div class="t-line t-latest">${lines[0]}</div>
            <div class="t-line t-prev">${lines[1]}</div>
            <div class="t-line t-old">${lines[2]}</div>
        `;
    }
    
    setInterval(() => {
        // Rotate array: move last item to front
        const last = lines.pop();
        lines.unshift(last);
        
        // Add a temporary transition class to old lines to fade them out smoothly
        const currentLines = feedContainer.querySelectorAll('.t-line');
        if(currentLines.length === 3) {
            currentLines[0].className = 't-line t-prev';
            currentLines[1].className = 't-line t-old';
            currentLines[2].style.opacity = '0';
        }
        
        // Render new shifted state after a brief CSS transition period
        setTimeout(renderFeed, 500);
        
    }, 4500);
    
    renderFeed();
}
// Breach Mode Toggle
const breachBtn = document.getElementById('breachToggle');
if (breachBtn) {
    breachBtn.addEventListener('click', () => {
        const isBreach = document.body.classList.toggle('breach-mode');
        const span = breachBtn.querySelector('span');
        const icon = breachBtn.querySelector('i');
        breachBtn.setAttribute('aria-pressed', isBreach ? 'true' : 'false'); // accessibility
        if (isBreach) {
            span.textContent = 'BREACH';
            icon.className = 'fas fa-skull';
        } else {
            span.textContent = 'SECURE';
            icon.className = 'fas fa-radiation';
        }
    });
}

// â”€â”€ Animated Stat Counters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1500;
    const step = Math.ceil(duration / target);
    let current = 0;
    const timer = setInterval(() => {
        current += 1;
        el.textContent = current + (current >= target ? '+' : '');
        if (current >= target) clearInterval(timer);
    }, step);
}
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// Terminal Easter Egg Logic
const termOverlay = document.getElementById('terminal-overlay');
const termInput = document.getElementById('term-input');
const termOutput = document.getElementById('term-output');
const closeTerm = document.getElementById('closeTerminal');

function openTerminal() {
    termOverlay.classList.add('active');
    setTimeout(() => termInput.focus(), 500);
}

function closeTerminal() {
    termOverlay.classList.remove('active');
}

window.addEventListener('keydown', (e) => {
    if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        termOverlay.classList.contains('active') ? closeTerminal() : openTerminal();
    }
    if (e.key === 'Escape' && termOverlay.classList.contains('active')) {
        closeTerminal();
    }
});

closeTerm.addEventListener('click', closeTerminal);

termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const cmd = termInput.value.trim().toLowerCase();
        termInput.value = '';
        executeCommand(cmd);
    }
});

function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function executeCommand(cmd) {
    if (!cmd) return;
    
    // Echo command â€” user input MUST be escaped before innerHTML injection
    const line = document.createElement('div');
    line.className = 'term-line';
    line.innerHTML = `<span class="term-prompt">sandaru@root:~$</span> <span class="term-cmd">${escapeHtml(cmd)}</span>`;
    termOutput.appendChild(line);
    
    const output = document.createElement('div');
    output.className = 'term-line';
    
    switch (cmd) {
        case 'help':
            output.innerHTML = `
                <div class="term-help-item"><span class="term-help-cmd">whoami</span><span>Display current user profile.</span></div>
                <div class="term-help-item"><span class="term-help-cmd">ls skills</span><span>List modular technical expertise.</span></div>
                <div class="term-help-item"><span class="term-help-cmd">sudo hire</span><span>Enable recruitment protocol.</span></div>
                <div class="term-help-item"><span class="term-help-cmd">clear</span><span>Flush the terminal buffer.</span></div>
                <div class="term-help-item"><span class="term-help-cmd">exit</span><span>Terminate remote session.</span></div>
            `;
            break;
        case 'whoami':
            output.innerText = "NAME: Sandaru Fernando | ROLE: Cybersecurity Specialist | STATUS: ACTING_ROOT";
            break;
        case 'ls skills':
            output.innerText = "CrowdStrike, SentinelOne, Burp, Nmap, Splunk, Azure, AWS, Nessus, MITRE ATT&CK...";
            break;
        case 'sudo hire':
            output.innerText = "Recruitment protocol activated. Redirecting to comms layer...";
            window.location.href = "mailto:hansakasandaru99@gmail.com";
            break;
        case 'clear':
            termOutput.innerHTML = '<div class="term-line">Terminal buffer cleared.</div>';
            return;
        case 'exit':
            closeTerminal();
            return;
        default:
            output.innerText = `Command not found: ${cmd}. Type 'help' for available ops.`;
    }
    
    termOutput.appendChild(output);
    termOutput.scrollTop = termOutput.scrollHeight;
}

// â”€â”€ Scroll Progress Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = pct + '%';
    }, { passive: true });
})();

// â”€â”€ Podcast Slider Dots â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function() {
    const slider = document.getElementById('podcastSlider');
    const dotsContainer = document.getElementById('podcastDots');
    if (!slider || !dotsContainer) return;

    const cards = slider.querySelectorAll('.pod-card');
    const totalDots = Math.min(cards.length, 11);

    // Build dots
    for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to podcast ${i + 1}`);
        dot.addEventListener('click', () => {
            const card = cards[i];
            if (card) slider.scrollTo({ left: card.offsetLeft - 10, behavior: 'smooth' });
        });
        dotsContainer.appendChild(dot);
    }

    // Sync active dot on scroll
    const dots = dotsContainer.querySelectorAll('.slider-dot');
    slider.addEventListener('scroll', () => {
        const scrollLeft = slider.scrollLeft;
        let closestIdx = 0, closestDist = Infinity;
        cards.forEach((card, i) => {
            const dist = Math.abs(card.offsetLeft - scrollLeft);
            if (dist < closestDist) { closestDist = dist; closestIdx = i; }
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === closestIdx));
    }, { passive: true });
})();

// â”€â”€ Hamburger aria-expanded â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function() {
    const hbtn = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (!hbtn || !navLinks) return;
    navLinks.id = 'nav-links';
    const observer = new MutationObserver(() => {
        hbtn.setAttribute('aria-expanded', navLinks.classList.contains('open') ? 'true' : 'false');
        hbtn.setAttribute('aria-label', navLinks.classList.contains('open') ? 'Close navigation menu' : 'Open navigation menu');
    });
    observer.observe(navLinks, { attributes: true, attributeFilter: ['class'] });
})();

// â”€â”€ Footer hint opens terminal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function() {
    const hint = document.getElementById('footerTermHint');
    const overlay = document.getElementById('terminal-overlay');
    if (!hint || !overlay) return;
    hint.addEventListener('click', () => {
        overlay.classList.add('active');
        const inp = document.getElementById('term-input');
        if (inp) inp.focus();
    });
})();

// â”€â”€ Interactive Radar Chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function() {
    const svgs = document.querySelectorAll('.radar-svg');
    if (!svgs.length) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'radar-tooltip';
    document.body.appendChild(tooltip);

    svgs.forEach(svg => {
        const dots = svg.querySelectorAll('.radar-dot');
        const labels = svg.querySelectorAll('.radar-label');

        dots.forEach((dot, i) => {
            // Get paired label text for this dot
            const labelEl = labels[i];
            const skillName = labelEl ? labelEl.textContent.trim() : '';
            const valLabel = svg.querySelectorAll('.radar-label-val')[i];
            const skillVal = valLabel ? valLabel.textContent.trim() : '';

            dot.style.cursor = 'crosshair';

            dot.addEventListener('mouseenter', (e) => {
                tooltip.textContent = `${skillName}: ${skillVal}`;
                tooltip.classList.add('visible');
            });
            dot.addEventListener('mousemove', (e) => {
                tooltip.style.left = (e.clientX + 12) + 'px';
                tooltip.style.top = (e.clientY - 28) + 'px';
            });
            dot.addEventListener('mouseleave', () => {
                tooltip.classList.remove('visible');
            });
        });
    });
})();

// â”€â”€ HUD Operator Card â€” Counter + Bar Animations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function() {
    const card = document.querySelector('.hero-hud-card');
    if (!card) return;

    let animated = false;
    const animate = () => {
        if (animated) return;
        animated = true;

        // Count-up numbers
        card.querySelectorAll('.hc-num').forEach(el => {
            const target = parseInt(el.dataset.target, 10);
            const duration = 1200;
            const step = 16;
            const steps = Math.ceil(duration / step);
            let current = 0;
            const inc = target / steps;
            const timer = setInterval(() => {
                current = Math.min(current + inc, target);
                el.textContent = Math.floor(current);
                if (current >= target) clearInterval(timer);
            }, step);
        });

        // Skill bar fills (CSS transition, just set the width)
        card.querySelectorAll('.hc-bar-fill').forEach(el => {
            const w = el.dataset.w || 0;
            // Small delay so CSS transition fires after paint
            requestAnimationFrame(() => requestAnimationFrame(() => {
                el.style.width = w + '%';
            }));
        });
    };

    // Fire immediately if card is in view on load (it's in hero, above fold)
    const io = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { animate(); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(card);
    // Also fire after 800ms unconditionally in case observer misses
    setTimeout(animate, 800);
})();
