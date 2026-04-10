/* ============================================
   SAIKAT BANDYOPADHYAY — PORTFOLIO SCRIPTS
   Three.js Particles | GSAP Scroll | Typed.js
   ============================================ */

(function () {
  'use strict';

  // ---- Three.js Particle Background ----
  function initParticleBackground() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle system
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 800 : 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;
      velocities[i] = (Math.random() - 0.5) * 0.002;
      velocities[i + 1] = (Math.random() - 0.5) * 0.002;
      velocities[i + 2] = (Math.random() - 0.5) * 0.002;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: isMobile ? 0.03 : 0.02,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    camera.position.z = 5;

    // Mouse tracking
    let mouseX = 0,
      mouseY = 0;
    document.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      var pos = geometry.attributes.position.array;
      for (var i = 0; i < pos.length; i += 3) {
        pos[i] += velocities[i];
        pos[i + 1] += velocities[i + 1];
        pos[i + 2] += velocities[i + 2];

        // Boundary wrap
        if (Math.abs(pos[i]) > 5) velocities[i] *= -1;
        if (Math.abs(pos[i + 1]) > 5) velocities[i + 1] *= -1;
        if (Math.abs(pos[i + 2]) > 5) velocities[i + 2] *= -1;
      }
      geometry.attributes.position.needsUpdate = true;

      // Smooth mouse follow
      particles.rotation.x += (mouseY * 0.1 - particles.rotation.x) * 0.02;
      particles.rotation.y += (mouseX * 0.1 - particles.rotation.y) * 0.02;

      renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // ---- GSAP Scroll Animations ----
  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Fade-up reveal for sections
    gsap.utils.toArray('.reveal-up').forEach(function (el) {
      gsap.from(el, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Staggered card reveals
    gsap.utils.toArray('.stagger-container').forEach(function (container) {
      var cards = container.querySelectorAll('.glass-card');
      gsap.from(cards, {
        y: 80,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Section heading slide-in
    gsap.utils.toArray('.section-heading').forEach(function (heading) {
      gsap.from(heading, {
        x: -40,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Section subtitle fade
    gsap.utils.toArray('.section-subtitle').forEach(function (sub) {
      gsap.from(sub, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sub,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });
  }

  // ---- Typed.js Hero Text ----
  function initTypedHero() {
    var el = document.getElementById('typed-output');
    if (!el || typeof Typed === 'undefined') return;

    new Typed('#typed-output', {
      strings: [
        'Computational Biologist',
        'ML Engineer',
        'Pipeline Architect',
        'Health Data Scientist',
      ],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 2000,
      loop: true,
      cursorChar: '|',
    });
  }

  // ---- Navigation ----
  function initNavigation() {
    var nav = document.querySelector('.main-nav');
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link');
    var mobileBtn = document.querySelector('.mobile-menu-btn');
    var navMenu = document.querySelector('.nav-links');

    // Blur on scroll
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }
    });

    // Active section tracking
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (link) {
              link.classList.remove('active');
            });
            var activeLink = document.querySelector(
              '.nav-link[href="#' + entry.target.id + '"]'
            );
            if (activeLink) activeLink.classList.add('active');
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });

    // Smooth scroll
    navLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // Close mobile menu
        if (navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          mobileBtn.classList.remove('active');
          mobileBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Mobile menu toggle
    if (mobileBtn) {
      mobileBtn.addEventListener('click', function () {
        var isOpen = navMenu.classList.toggle('active');
        mobileBtn.classList.toggle('active');
        mobileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }
  }

  // ---- Blog Preview ----
  function initBlogPreview() {
    var container = document.getElementById('blog-preview-posts');
    if (!container) return;

    // Load blog posts manifest
    fetch('blog/posts/index.json')
      .then(function (response) {
        if (!response.ok) throw new Error('Blog index not found');
        return response.json();
      })
      .then(function (posts) {
        if (!posts || posts.length === 0) {
          container.innerHTML =
            '<div class="blog-empty-state glass-card">' +
            '<p class="blog-empty-text">Posts coming soon. Stay tuned for thoughts on healthcare AI, computational biology, and the future of medicine.</p>' +
            '</div>';
          return;
        }
        // Show latest 3 posts
        posts
          .sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
          })
          .slice(0, 3)
          .forEach(function (post) {
            var card = document.createElement('article');
            card.className = 'glass-card blog-card';
            card.innerHTML =
              '<div class="blog-card-meta">' +
              '<time>' +
              new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) +
              '</time>' +
              '<span class="reading-time">' +
              post.readingTime +
              '</span>' +
              '</div>' +
              '<h3><a href="blog/post.html?slug=' +
              post.slug +
              '">' +
              post.title +
              '</a></h3>' +
              '<p class="blog-excerpt">' +
              post.excerpt +
              '</p>' +
              '<div class="blog-tags">' +
              post.tags
                .map(function (t) {
                  return '<span class="tech-badge">' + t + '</span>';
                })
                .join('') +
              '</div>';
            container.appendChild(card);
          });
      })
      .catch(function () {
        container.innerHTML =
          '<div class="blog-empty-state glass-card">' +
          '<p class="blog-empty-text">Posts coming soon. Stay tuned for thoughts on healthcare AI, computational biology, and the future of medicine.</p>' +
          '</div>';
      });
  }

  // ---- Contact Form (mailto) ----
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('contact-name').value.trim();
      var email = document.getElementById('contact-email').value.trim();
      var reason = document.getElementById('contact-reason').value;
      var message = document.getElementById('contact-message').value.trim();

      // Basic validation
      if (!name || !email || !reason || !message) {
        alert('Please fill in all fields before sending.');
        return;
      }

      var subject = encodeURIComponent('[Portfolio] ' + reason + ' — from ' + name);
      var body = encodeURIComponent(
        'Hi Saikat,\n\n' +
        message +
        '\n\n---\n' +
        'From: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Reason: ' + reason
      );

      var mailto = 'mailto:saikat.bandyopadhyay.dsx@gmail.com?subject=' + subject + '&body=' + body;
      window.location.href = mailto;
    });
  }

  // ---- Initialize Everything ----
  function init() {
    initParticleBackground();
    initTypedHero();
    initNavigation();
    initScrollAnimations();
    initProjectTimeline();
    initBlogPreview();
    initContactForm();
  }

  // ---- Interactive Project Timeline with Donut Charts ----
  function initProjectTimeline() {
    const track = document.getElementById('timeline-track');
    const yearsContainer = document.getElementById('timeline-years');
    const tooltip = document.getElementById('timeline-tooltip');
    const tooltipTitle = document.getElementById('tooltip-title');
    const tooltipPeriod = document.getElementById('tooltip-period');
    const tooltipCanvas = document.getElementById('tooltip-donut');
    const tooltipLegend = document.getElementById('tooltip-legend');

    if (!track || !yearsContainer) return;

    // Project data with timeline and role breakdown
    // Consistent color palette for role categories
    var catColors = {
      'Scientific Research': '#818cf8',
      'Development':         '#34d399',
      'Architecture Design': '#f472b6',
      'Data Analysis':       '#38bdf8',
      'Writing':             '#fb923c',
      'Mentoring':           '#fbbf24',
      'Stakeholder Mgmt':    '#c084fc'
    };

    var projects = [
      {
        name: 'RAPID-CT',
        fullName: 'RAPID-CT: AI Brain Hemorrhage Detection',
        start: 2018.83,
        end: 2021.67,
        color: '#f472b6',
        row: 0,
        breakdown: [
          { label: 'Scientific Research', pct: 40, color: catColors['Scientific Research'] },
          { label: 'Development', pct: 30, color: catColors['Development'] },
          { label: 'Architecture Design', pct: 20, color: catColors['Architecture Design'] },
          { label: 'Mentoring', pct: 10, color: catColors['Mentoring'] }
        ]
      },
      {
        name: 'LP-WGS Pipeline',
        fullName: 'LP-WGS Processing Pipeline',
        start: 2023.08,
        end: 2024.0,
        color: '#34d399',
        row: 0,
        breakdown: [
          { label: 'Architecture Design', pct: 35, color: catColors['Architecture Design'] },
          { label: 'Development', pct: 35, color: catColors['Development'] },
          { label: 'Data Analysis', pct: 20, color: catColors['Data Analysis'] },
          { label: 'Scientific Research', pct: 10, color: catColors['Scientific Research'] }
        ]
      },
      {
        name: 'Proteogenomics',
        fullName: 'Proteogenomics Pipeline (JASMS 2024)',
        start: 2022.0,
        end: 2023.0,
        color: '#818cf8',
        row: 1,
        breakdown: [
          { label: 'Data Analysis', pct: 50, color: catColors['Data Analysis'] },
          { label: 'Development', pct: 25, color: catColors['Development'] },
          { label: 'Scientific Research', pct: 15, color: catColors['Scientific Research'] },
          { label: 'Writing', pct: 10, color: catColors['Writing'] }
        ]
      },
      {
        name: 'FAIR Governance',
        fullName: 'FAIR Data Governance Framework',
        start: 2023.08,
        end: 2024.0,
        color: '#fbbf24',
        row: 2,
        breakdown: [
          { label: 'Architecture Design', pct: 50, color: catColors['Architecture Design'] },
          { label: 'Development', pct: 25, color: catColors['Development'] },
          { label: 'Stakeholder Mgmt', pct: 15, color: catColors['Stakeholder Mgmt'] },
          { label: 'Scientific Research', pct: 10, color: catColors['Scientific Research'] }
        ]
      },
      {
        name: 'Colocalization',
        fullName: 'Causal Gene Discovery Pipeline',
        start: 2024.0,
        end: 2026.25,
        color: '#38bdf8',
        row: 1,
        breakdown: [
          { label: 'Data Analysis', pct: 40, color: catColors['Data Analysis'] },
          { label: 'Architecture Design', pct: 30, color: catColors['Architecture Design'] },
          { label: 'Writing', pct: 15, color: catColors['Writing'] },
          { label: 'Scientific Research', pct: 15, color: catColors['Scientific Research'] }
        ]
      },
      {
        name: 'Single-Cell',
        fullName: 'Single-Cell Trajectory Analysis (eLife)',
        start: 2025.0,
        end: 2026.25,
        color: '#c084fc',
        row: 2,
        breakdown: [
          { label: 'Data Analysis', pct: 50, color: catColors['Data Analysis'] },
          { label: 'Scientific Research', pct: 20, color: catColors['Scientific Research'] },
          { label: 'Development', pct: 20, color: catColors['Development'] },
          { label: 'Writing', pct: 10, color: catColors['Writing'] }
        ]
      }
    ];

    var minYear = 2018;
    var maxYear = 2027;
    var totalYears = maxYear - minYear;

    // Render year labels
    for (var y = minYear; y <= maxYear; y++) {
      var label = document.createElement('span');
      label.className = 'year-label';
      label.textContent = y;
      yearsContainer.appendChild(label);
    }

    // Render project blocks
    var rowHeight = 34;
    var topPadding = 10;

    projects.forEach(function (proj) {
      var block = document.createElement('div');
      block.className = 'timeline-block';

      var leftPct = ((proj.start - minYear) / totalYears) * 100;
      var widthPct = ((proj.end - proj.start) / totalYears) * 100;
      var topPos = topPadding + proj.row * rowHeight;

      block.style.left = leftPct + '%';
      block.style.width = widthPct + '%';
      block.style.top = topPos + 'px';
      block.style.background = 'linear-gradient(135deg, ' + proj.color + ', ' + proj.color + 'aa)';
      block.style.border = '1px solid ' + proj.color + '66';

      var labelSpan = document.createElement('span');
      labelSpan.className = 'timeline-block-label';
      labelSpan.textContent = proj.name;
      block.appendChild(labelSpan);

      // Hover events
      block.addEventListener('mouseenter', function (e) {
        showTooltip(proj, e.currentTarget);
      });
      block.addEventListener('mouseleave', function () {
        hideTooltip();
      });

      track.appendChild(block);
    });

    // ---- Annotation Layer: Research Phases ----
    var annotations = [
      { label: 'Deep Learning Architecture', start: 2019, end: 2021, color: '#f472b6' },
      { label: 'Long-Read Transcriptomics & Proteomics Integration', start: 2022, end: 2023, color: '#818cf8' },
      { label: 'Statistical Genetics', start: 2023, end: 2026, color: '#38bdf8' }
    ];

    var annotationRow = document.createElement('div');
    annotationRow.className = 'timeline-annotations';

    annotations.forEach(function (anno) {
      var bar = document.createElement('div');
      bar.className = 'annotation-bar';

      var leftPct = ((anno.start - minYear) / totalYears) * 100;
      var widthPct = ((anno.end - anno.start) / totalYears) * 100;

      bar.style.left = leftPct + '%';
      bar.style.width = widthPct + '%';
      bar.style.borderColor = anno.color;
      bar.style.background = anno.color + '12';

      var annoLabel = document.createElement('span');
      annoLabel.className = 'annotation-label';
      annoLabel.textContent = anno.label;
      annoLabel.style.color = anno.color;
      bar.appendChild(annoLabel);

      annotationRow.appendChild(bar);
    });

    track.parentElement.appendChild(annotationRow);

    function showTooltip(proj, blockEl) {
      tooltipTitle.textContent = proj.fullName;

      var startYear = Math.floor(proj.start);
      var endLabel = proj.end >= 2026 ? 'Present' : Math.floor(proj.end);
      tooltipPeriod.textContent = startYear + ' — ' + endLabel;

      // Draw donut chart
      drawDonut(proj.breakdown);

      // Build legend
      tooltipLegend.innerHTML = '';
      proj.breakdown.forEach(function (seg) {
        var item = document.createElement('div');
        item.className = 'legend-item';
        var dot = document.createElement('span');
        dot.className = 'legend-dot';
        dot.style.background = seg.color;
        var text = document.createTextNode(seg.label + ' ' + seg.pct + '%');
        item.appendChild(dot);
        item.appendChild(text);
        tooltipLegend.appendChild(item);
      });

      // Position tooltip above block
      var trackRect = track.getBoundingClientRect();
      var blockRect = blockEl.getBoundingClientRect();
      var blockCenterX = blockRect.left + blockRect.width / 2 - trackRect.left;

      tooltip.style.left = blockCenterX + 'px';
      tooltip.style.top = (blockEl.offsetTop - 8) + 'px';
      tooltip.classList.add('visible');
    }

    function hideTooltip() {
      tooltip.classList.remove('visible');
    }

    function drawDonut(segments) {
      var ctx = tooltipCanvas.getContext('2d');
      var size = 160;
      var dpr = window.devicePixelRatio || 1;
      tooltipCanvas.width = size * dpr;
      tooltipCanvas.height = size * dpr;
      tooltipCanvas.style.width = size + 'px';
      tooltipCanvas.style.height = size + 'px';
      ctx.scale(dpr, dpr);

      var cx = size / 2;
      var cy = size / 2;
      var outerR = 64;
      var innerR = 38;
      var startAngle = -Math.PI / 2;

      ctx.clearRect(0, 0, size, size);

      segments.forEach(function (seg) {
        var sliceAngle = (seg.pct / 100) * 2 * Math.PI;
        var endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle, endAngle);
        ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();

        // Draw percentage text on larger segments
        if (seg.pct >= 15) {
          var midAngle = startAngle + sliceAngle / 2;
          var textR = (outerR + innerR) / 2;
          var tx = cx + textR * Math.cos(midAngle);
          var ty = cy + textR * Math.sin(midAngle);
          ctx.fillStyle = '#0f0f23';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(seg.pct + '%', tx, ty);
        }

        startAngle = endAngle;
      });

      // Center hole glow
      ctx.beginPath();
      ctx.arc(cx, cy, innerR - 1, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(15, 15, 35, 0.9)';
      ctx.fill();
    }
  }

  // Wait for DOM + libs
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay to ensure external scripts are loaded
    setTimeout(init, 100);
  }
})();
