document.addEventListener('DOMContentLoaded', () => {
  /* ----------------------------------------
     1. Toast Helper
  ---------------------------------------- */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3000);
  }

  /* ----------------------------------------
     2. Scroll-Triggered Fade-In (IntersectionObserver)
  ---------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ----------------------------------------
     3. Sticky Navbar & Mobile Menu
  ---------------------------------------- */
  const navbar = document.querySelector('.navbar');
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobileDrawer');

  window.addEventListener(
    'scroll',
    () => {
      if (window.scrollY > 30) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    },
    { passive: true }
  );

  function closeMobileMenu() {
    mobileDrawer?.classList.remove('open');
    mobileBtn?.classList.remove('is-open');
    mobileBtn?.setAttribute('aria-expanded', 'false');
  }

  mobileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = mobileDrawer.classList.toggle('open');
    mobileBtn.classList.toggle('is-open', isOpen);
    mobileBtn.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!mobileDrawer?.classList.contains('open')) return;
    if (!mobileDrawer.contains(e.target) && !mobileBtn?.contains(e.target)) {
      closeMobileMenu();
    }
  });

  document.querySelectorAll('.nav-link, .mobile-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === 'javascript:void(0)' || href.startsWith('#')) {
        e.preventDefault();
      }
      closeMobileMenu();
    });
  });

  /* ----------------------------------------
     4. Hero Email Capture Form
  ---------------------------------------- */
  const heroForm = document.getElementById('heroEmailForm');
  const heroEmailInput = document.getElementById('heroEmailInput');
  const heroFeedback = document.getElementById('heroFormFeedback');

  heroForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = heroEmailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      heroFeedback.textContent = 'Please enter a valid work email address.';
      heroFeedback.classList.add('error');
      heroEmailInput.focus();
      return;
    }

    heroFeedback.classList.remove('error');
    heroFeedback.textContent = `Invite sent to ${email}! Check your inbox.`;
    showToast(`Welcome aboard! Workspace link sent to ${email}`);
    heroForm.reset();
  });

  /* ----------------------------------------
     5. Interactive Performance Overview Wave Chart
  ---------------------------------------- */
  const dayPills = document.querySelectorAll('.day-pill');
  const perfWaveLine = document.getElementById('perfWaveLine');
  const perfWaveArea = document.getElementById('perfWaveArea');
  const perfWaveDots = document.getElementById('perfWaveDots');
  const perfActiveDot = document.getElementById('perfActiveDot');
  const perfActiveHalo = document.getElementById('perfActiveHalo');
  const waveTooltip = document.getElementById('waveTooltip');

  const waveX = [32, 114, 196, 278, 360, 442];
  const waveReports = {
    0: { day: 'Tue', val: 82, ys: [52, 34, 64, 48, 58, 36] },
    1: { day: 'Wed', val: 88, ys: [62, 32, 54, 42, 60, 28] },
    2: { day: 'Fri', val: 91, ys: [58, 46, 28, 50, 38, 44] },
    3: { day: 'Sun', val: 94, ys: [54, 36, 66, 26, 52, 30] },
    4: { day: 'Thu', val: 89, ys: [48, 58, 40, 56, 30, 46] },
    5: { day: 'Mon', val: 86, ys: [64, 42, 56, 38, 52, 24] },
  };

  function buildSmoothPath(points) {
    if (!points.length) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }

  function renderWaveChart(activeIndex) {
    const report = waveReports[activeIndex];
    if (!report || !perfWaveLine || !perfWaveArea) return;

    const points = waveX.map((x, idx) => ({ x, y: report.ys[idx] }));
    const lineD = buildSmoothPath(points);
    const areaD = `${lineD} L ${points[points.length - 1].x} 96 L ${points[0].x} 96 Z`;

    perfWaveLine.setAttribute('d', lineD);
    perfWaveArea.setAttribute('d', areaD);

    if (perfWaveDots) {
      perfWaveDots.innerHTML = '';
      points.forEach((pt, idx) => {
        if (idx === activeIndex) return;
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', pt.x);
        c.setAttribute('cy', pt.y);
        c.setAttribute('r', '4');
        c.setAttribute('fill', '#97C300');
        c.style.cursor = 'pointer';
        c.addEventListener('click', () => selectDay(idx));
        perfWaveDots.appendChild(c);
      });
    }

    const activePt = points[activeIndex];
    if (perfActiveDot && perfActiveHalo) {
      perfActiveDot.setAttribute('cx', activePt.x);
      perfActiveDot.setAttribute('cy', activePt.y);
      perfActiveHalo.setAttribute('cx', activePt.x);
      perfActiveHalo.setAttribute('cy', activePt.y);
    }

    if (waveTooltip) {
      waveTooltip.textContent = `${report.day}: ${report.val}%`;
      const leftPct = (activePt.x / 470) * 100;
      const topPct = (activePt.y / 96) * 100;
      waveTooltip.style.left = `${leftPct}%`;
      waveTooltip.style.top = `${topPct}%`;
    }
  }

  function selectDay(index) {
    dayPills.forEach((p, idx) => {
      p.classList.toggle('active', idx === index);
    });
    renderWaveChart(index);
  }

  dayPills.forEach((pill, idx) => {
    pill.addEventListener('click', () => selectDay(idx));
  });

  renderWaveChart(3);

  /* ----------------------------------------
     6. Monthly Reports Range Toggle (7M / 10M / 12M)
  ---------------------------------------- */
  const rangeData = {
    '7M': [
      [26, 38],
      [40, 32],
      [18, 38],
      [32, 50],
      [45, 40],
      [40, 23],
      [45, 35],
      [12, 30],
    ],
    '10M': [
      [34, 46],
      [48, 38],
      [28, 44],
      [42, 54],
      [50, 46],
      [36, 32],
      [52, 42],
      [26, 38],
    ],
    '12M': [
      [44, 52],
      [38, 48],
      [46, 40],
      [54, 56],
      [48, 52],
      [44, 38],
      [50, 48],
      [36, 44],
    ],
  };

  const rangeBtns = document.querySelectorAll('.range-btn');
  const barCols = document.querySelectorAll('#monthlyBarChart .bar-col');

  rangeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      rangeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const dataset = rangeData[btn.dataset.range];
      if (!dataset) return;

      barCols.forEach((col, i) => {
        const bars = col.querySelectorAll('.bar');
        if (bars[0] && bars[1] && dataset[i]) {
          bars[0].style.setProperty('--h', `${dataset[i][0]}px`);
          bars[1].style.setProperty('--h', `${dataset[i][1]}px`);
        }
      });
    });
  });

  barCols.forEach((col) => {
    col.addEventListener('click', () => {
      barCols.forEach((c) => c.classList.remove('active'));
      col.classList.add('active');
    });
  });

  /* ----------------------------------------
     7. Animated Stats Count-Up
  ---------------------------------------- */
  const statValues = document.querySelectorAll('.stat-value');
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !statsAnimated) {
          statsAnimated = true;
          statValues.forEach((el) => {
            const target = Number(el.dataset.target || 0);
            const suffix = el.dataset.suffix || '';
            const useComma = el.dataset.format === 'comma';
            const duration = 1400;
            const start = performance.now();

            function tick(now) {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.round(target * eased);
              el.textContent = (useComma ? current.toLocaleString() : current) + suffix;
              if (progress < 1) {
                requestAnimationFrame(tick);
              }
            }
            requestAnimationFrame(tick);
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  const statsCard = document.querySelector('.stats-glass-card');
  if (statsCard) statsObserver.observe(statsCard);

  /* ----------------------------------------
     8. Management Dock & Search
  ---------------------------------------- */
  const dockBtns = document.querySelectorAll('.dock-btn');
  const mgmtSearchInput = document.getElementById('mgmtSearchInput');

  dockBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      dockBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode || 'items';
      if (mgmtSearchInput) {
        mgmtSearchInput.placeholder = `Search ${mode.toLowerCase()}…`;
      }
      showToast(`Switched to ${mode} view`);
    });
  });

  /* ----------------------------------------
     9. Insights Month Tabs
  ---------------------------------------- */
  const monthTabs = document.querySelectorAll('#insightsMonths .month-tab');
  monthTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      monthTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  /* ----------------------------------------
     10. FAQ Accordion
  ---------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    trigger?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach((other) => {
        other.classList.remove('active');
        other.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
      });
      if (!isActive) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

});
