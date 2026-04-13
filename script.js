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
    initSkillNetwork();
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

  // ---- Interactive Skill Network (hub-and-spoke) ----
  function initSkillNetwork() {
    var svg = document.getElementById('skill-network-svg');
    var wrapper = document.getElementById('skill-network');
    var tooltip = document.getElementById('skill-network-tooltip');
    var tipLabel = document.getElementById('skill-tooltip-label');
    var tipSub = document.getElementById('skill-tooltip-sub');
    var legendEl = document.getElementById('skill-network-legend');
    if (!svg || !wrapper) return;

    // Skill groups (must match data.json). Each group has a base color.
    // Hubs use a DARKER variant of the same color; spokes use a LIGHTER variant.
    var groups = [
      { id: 'clinical',   name: 'Clinical Pipeline Design', base: '#f472b6',
        skills: ['CLIA/CAP', 'HIPAA/SOC 2', 'Validation Gates', 'Audit Trails', 'Redundancy', 'QC Monitoring'] },
      { id: 'pipeline',   name: 'Pipeline Engineering', base: '#34d399',
        skills: ['Nextflow', 'Snakemake', 'WDL/CWL', 'DRAGEN', 'SLURM/HPC', 'Docker', 'FAIR', 'ETL'] },
      { id: 'statgen',    name: 'Statistical Genetics', base: '#38bdf8',
        skills: ['GWAS', 'eQTL', 'Colocalization', 'Cond. Analysis', 'Bayesian Nets', 'Mendelian Rand.'] },
      { id: 'genomics',   name: 'Genomics & Multi-Omics', base: '#818cf8',
        skills: ['WGS', 'DNA-seq', 'Long-Read RNA', 'ChIP-seq', 'Proteogenomics', 'Variant Calling'] },
      { id: 'ai',         name: 'ML/DL & Public Data', base: '#fb923c',
        skills: ['ResNet CNNs', 'Segmentation', 'Cancer Genomics', 'TCGA', 'CPTAC', 'GENCODE', 'SRA', 'GEO', 'PRIDE'] },
      { id: 'singlecell', name: 'Single-Cell & Networks', base: '#c084fc',
        skills: ['scRNA-seq', 'Slingshot', 'WGCNA', 'Deconvolution', 'Hub Genes', 'GRN'] },
      { id: 'programming',name: 'Programming & Tools', base: '#fbbf24',
        skills: ['Python', 'R', 'Bash', 'SQL', 'Git', 'Linux', 'HPC', 'Cloud', 'REST APIs', 'Jupyter', 'R Markdown'] }
    ];

    // Map a skill (normalized) -> regex or token list that should match project tech-badges
    // Used for click-to-filter-projects functionality
    var skillToProjectTokens = {
      'CLIA/CAP': ['Encryption', 'REST API'],
      'HIPAA/SOC 2': ['Encryption', 'REST API'],
      'Validation Gates': ['Nextflow'],
      'Audit Trails': ['Data Governance', 'Metadata Standards'],
      'Redundancy': ['SLURM', 'HPC'],
      'QC Monitoring': ['Data Governance'],
      'Nextflow': ['Nextflow'],
      'Snakemake': ['Nextflow'],
      'WDL/CWL': ['WGS'],
      'DRAGEN': ['WGS'],
      'SLURM/HPC': ['SLURM', 'HPC'],
      'Docker': ['Encryption'],
      'FAIR': ['FAIR', 'Data Governance', 'Metadata'],
      'ETL': ['ETL', 'Data Governance', 'Metadata'],
      'GWAS': ['GWAS', 'coloc'],
      'eQTL': ['eQTL', 'coloc'],
      'Colocalization': ['coloc', 'GWAS', 'eQTL'],
      'Cond. Analysis': ['coloc', 'GWAS'],
      'Bayesian Nets': ['bnlearn', 'Bayesian'],
      'Mendelian Rand.': ['coloc', 'GWAS'],
      'WGS': ['WGS', 'Imputation'],
      'DNA-seq': ['WGS'],
      'Long-Read RNA': ['Long-Read', 'Nextflow'],
      'ChIP-seq': ['Long-Read'],
      'Proteogenomics': ['Proteomics', 'Mass Spectrometry', 'Long-Read'],
      'Variant Calling': ['WGS', 'Imputation'],
      'ResNet CNNs': ['ResNet', 'PyTorch', 'Medical Imaging'],
      'Segmentation': ['Medical Imaging', 'ResNet'],
      'Cancer Genomics': ['Medical Imaging', 'PyTorch'],
      'TCGA': ['Medical Imaging'],
      'CPTAC': ['Proteomics'],
      'GENCODE': ['Long-Read', 'Proteomics'],
      'SRA': [],
      'GEO': [],
      'PRIDE': ['Proteomics'],
      'scRNA-seq': ['scRNA-seq', 'Slingshot', 'WGCNA'],
      'Slingshot': ['Slingshot', 'scRNA-seq'],
      'WGCNA': ['WGCNA'],
      'Deconvolution': ['scRNA-seq'],
      'Hub Genes': ['WGCNA', 'Bayesian'],
      'GRN': ['bnlearn', 'WGCNA'],
      'Python': ['Python', 'PyTorch', 'Nextflow'],
      'R': ['R', 'coloc', 'bnlearn'],
      'Bash': ['Bash'],
      'SQL': [],
      'Git': [],
      'Linux': ['SLURM', 'HPC', 'Bash'],
      'HPC': ['SLURM', 'HPC'],
      'Cloud': [],
      'REST APIs': ['REST API', 'Encryption'],
      'Jupyter': ['Python'],
      'R Markdown': ['R'],
    };

    // --- Color helpers ---
    function hexToRgb(hex) {
      var h = hex.replace('#','');
      if (h.length === 3) h = h.split('').map(function(c){return c+c;}).join('');
      var num = parseInt(h, 16);
      return { r: (num>>16)&255, g: (num>>8)&255, b: num&255 };
    }
    function rgbToStr(r,g,b,a) { return 'rgba('+r+','+g+','+b+','+(a==null?1:a)+')'; }
    function darken(hex, amt) {
      var c = hexToRgb(hex);
      return rgbToStr(Math.round(c.r*(1-amt)), Math.round(c.g*(1-amt)), Math.round(c.b*(1-amt)));
    }
    function lighten(hex, amt) {
      var c = hexToRgb(hex);
      return rgbToStr(Math.round(c.r+(255-c.r)*amt), Math.round(c.g+(255-c.g)*amt), Math.round(c.b+(255-c.b)*amt));
    }

    // --- Layout ---
    function render() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      var rect = wrapper.getBoundingClientRect();
      var W = rect.width;
      var H = rect.height;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      var cx = W / 2;
      var cy = H / 2; // legend now lives outside the wrapper, use full vertical space
      var isMobile = W < 700;
      // Base hub ring radius (jittered per-hub below for an organic layout)
      var hubRingR = Math.min(W, H) * (isMobile ? 0.32 : 0.30);
      // Spoke distance (hub center → skill orb center)
      var spokeDist = isMobile ? 60 : 86;
      // Hub and skill orbs are the SAME size — hubs differentiated by darker color + halo
      var skillOrbR = isMobile ? 9 : 13;
      var hubOrbR = skillOrbR;

      // Defs: per-group radial gradients for the orbs
      var svgNS = 'http://www.w3.org/2000/svg';
      var defs = document.createElementNS(svgNS, 'defs');
      groups.forEach(function(g) {
        // Hub gradient: dark, saturated — 3D sphere look
        var hg = document.createElementNS(svgNS, 'radialGradient');
        hg.setAttribute('id', 'grad-hub-' + g.id);
        hg.setAttribute('cx', '35%');
        hg.setAttribute('cy', '35%');
        hg.setAttribute('r', '75%');
        var hs1 = document.createElementNS(svgNS, 'stop');
        hs1.setAttribute('offset', '0%');
        hs1.setAttribute('stop-color', lighten(g.base, 0.15));
        var hs2 = document.createElementNS(svgNS, 'stop');
        hs2.setAttribute('offset', '60%');
        hs2.setAttribute('stop-color', g.base);
        var hs3 = document.createElementNS(svgNS, 'stop');
        hs3.setAttribute('offset', '100%');
        hs3.setAttribute('stop-color', darken(g.base, 0.55));
        hg.appendChild(hs1); hg.appendChild(hs2); hg.appendChild(hs3);
        defs.appendChild(hg);

        // Skill gradient: lighter, pastel — satellites around their hub
        var sg = document.createElementNS(svgNS, 'radialGradient');
        sg.setAttribute('id', 'grad-skill-' + g.id);
        sg.setAttribute('cx', '35%');
        sg.setAttribute('cy', '35%');
        sg.setAttribute('r', '70%');
        var ss1 = document.createElementNS(svgNS, 'stop');
        ss1.setAttribute('offset', '0%');
        ss1.setAttribute('stop-color', lighten(g.base, 0.5));
        var ss2 = document.createElementNS(svgNS, 'stop');
        ss2.setAttribute('offset', '100%');
        ss2.setAttribute('stop-color', lighten(g.base, 0.1));
        sg.appendChild(ss1); sg.appendChild(ss2);
        defs.appendChild(sg);
      });
      svg.appendChild(defs);

      // Layers (order matters for z-index)
      var interHubLayer = document.createElementNS(svgNS, 'g');
      interHubLayer.setAttribute('class', 'interhub-layer');
      var edgeLayer = document.createElementNS(svgNS, 'g');
      edgeLayer.setAttribute('class', 'edge-layer');
      var nodeLayer = document.createElementNS(svgNS, 'g');
      nodeLayer.setAttribute('class', 'node-layer');
      svg.appendChild(interHubLayer);
      svg.appendChild(edgeLayer);
      svg.appendChild(nodeLayer);

      // Organic (non-circular) hub layout. Each hub starts from its equal-spacing
      // angle on an imaginary ring, then gets jittered angularly and radially so
      // the whole network looks like an asymmetric biological cluster rather than
      // a clumsy perfect circle. Jitter values are deterministic per-index so the
      // layout stays stable across renders (no random reshuffling on resize).
      // Order matches the `groups` array: clinical, pipeline, statgen, genomics,
      // ai, singlecell, programming.
      var hubJitter = [
        { dAngle:  0.00, rScale: 1.00 },  // clinical   — top
        { dAngle: -0.06, rScale: 0.92 },  // pipeline   — slightly in from upper-right
        { dAngle:  0.05, rScale: 1.06 },  // statgen    — slightly out to the right
        { dAngle: -0.05, rScale: 0.94 },  // genomics   — slightly in from lower-right
        { dAngle:  0.05, rScale: 1.06 },  // ai         — slightly out to lower-left
        { dAngle: -0.06, rScale: 0.93 },  // singlecell — slightly in from left
        { dAngle:  0.04, rScale: 1.04 }   // programming— slightly out to upper-left
      ];

      // Pre-compute hub positions using the organic jitter layout
      var hubPositions = groups.map(function(g, gi) {
        var baseA = (gi / groups.length) * 2 * Math.PI - Math.PI / 2;
        var jitter = hubJitter[gi] || { dAngle: 0, rScale: 1 };
        var a = baseA + jitter.dAngle;
        var r = hubRingR * jitter.rScale;
        return {
          id: g.id,
          group: g,
          angle: a,
          x: cx + r * Math.cos(a),
          y: cy + r * Math.sin(a)
        };
      });

      // ----- Inter-hub edges: connect each hub to its two ring neighbors -----
      var interHubEdges = [];
      for (var i = 0; i < hubPositions.length; i++) {
        var a = hubPositions[i];
        var b = hubPositions[(i + 1) % hubPositions.length];
        var line = document.createElementNS(svgNS, 'line');
        line.setAttribute('class', 'interhub-edge');
        // Start at edge of orb, not center
        var dx = b.x - a.x, dy = b.y - a.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var ux = dx / dist, uy = dy / dist;
        line.setAttribute('x1', a.x + ux * hubOrbR);
        line.setAttribute('y1', a.y + uy * hubOrbR);
        line.setAttribute('x2', b.x - ux * hubOrbR);
        line.setAttribute('y2', b.y - uy * hubOrbR);
        line.setAttribute('data-groups', a.id + ',' + b.id);
        interHubLayer.appendChild(line);
        interHubEdges.push({ el: line, groupIds: [a.id, b.id] });
      }

      var allNodes = [];
      var allEdges = [];

      // ----- Spoke edges + skill orbs + hubs -----
      groups.forEach(function(g, gi) {
        var hp = hubPositions[gi];
        var hx = hp.x, hy = hp.y, hubAngle = hp.angle;

        // Skill orbs fan outward from hub along an arc facing away from center
        var nSkills = g.skills.length;
        var spreadAngle = Math.PI * 0.72; // ~130° arc — narrower to prevent module overlap
        var startA = hubAngle - spreadAngle / 2;

        g.skills.forEach(function(skill, si) {
          var a = nSkills === 1
            ? hubAngle
            : startA + (si / (nSkills - 1)) * spreadAngle;
          var sx = hx + spokeDist * Math.cos(a);
          var sy = hy + spokeDist * Math.sin(a);

          // Spoke edge (hub → skill), starting and ending at the orb edges
          var edge = document.createElementNS(svgNS, 'line');
          edge.setAttribute('class', 'edge');
          edge.setAttribute('x1', hx + hubOrbR * Math.cos(a));
          edge.setAttribute('y1', hy + hubOrbR * Math.sin(a));
          edge.setAttribute('x2', sx - skillOrbR * Math.cos(a));
          edge.setAttribute('y2', sy - skillOrbR * Math.sin(a));
          edge.setAttribute('stroke', lighten(g.base, 0.2));
          edge.setAttribute('data-group', g.id);
          edge.setAttribute('data-skill', skill);
          edgeLayer.appendChild(edge);
          allEdges.push({ el: edge, groupId: g.id, skill: skill });

          // Skill node
          var skillNode = document.createElementNS(svgNS, 'g');
          skillNode.setAttribute('class', 'node skill-node');
          skillNode.setAttribute('data-group', g.id);
          skillNode.setAttribute('data-skill', skill);
          skillNode.setAttribute('transform', 'translate(' + sx + ',' + sy + ')');

          var orb = document.createElementNS(svgNS, 'circle');
          orb.setAttribute('class', 'orb skill-orb');
          orb.setAttribute('cx', 0);
          orb.setAttribute('cy', 0);
          orb.setAttribute('r', skillOrbR);
          orb.setAttribute('fill', 'url(#grad-skill-' + g.id + ')');
          orb.setAttribute('stroke', lighten(g.base, 0.3));
          orb.setAttribute('stroke-width', 1.2);
          orb.style.color = g.base;
          skillNode.appendChild(orb);

          // Label: extend outward past the orb along the same radial direction
          var labelOffset = skillOrbR + 7;
          var labelDx = labelOffset * Math.cos(a);
          var labelDy = labelOffset * Math.sin(a) + 3.5;
          var textEl = document.createElementNS(svgNS, 'text');
          textEl.setAttribute('x', labelDx);
          textEl.setAttribute('y', labelDy);
          var anchor = 'middle';
          if (Math.cos(a) > 0.15) anchor = 'start';
          else if (Math.cos(a) < -0.15) anchor = 'end';
          textEl.setAttribute('text-anchor', anchor);
          textEl.textContent = skill;
          skillNode.appendChild(textEl);

          nodeLayer.appendChild(skillNode);
          allNodes.push({ el: skillNode, type: 'skill', groupId: g.id, label: skill, x: sx, y: sy });
        });

        // ----- Hub node (drawn last so it sits on top of edges) -----
        var hubNode = document.createElementNS(svgNS, 'g');
        hubNode.setAttribute('class', 'node hub-node');
        hubNode.setAttribute('data-group', g.id);
        hubNode.setAttribute('transform', 'translate(' + hx + ',' + hy + ')');

        // Outer halo ring — marks the hub since its orb is now the same size as skills
        var halo = document.createElementNS(svgNS, 'circle');
        halo.setAttribute('class', 'hub-halo');
        halo.setAttribute('cx', 0);
        halo.setAttribute('cy', 0);
        halo.setAttribute('r', hubOrbR + 6);
        halo.setAttribute('fill', 'none');
        halo.setAttribute('stroke', g.base);
        halo.setAttribute('stroke-width', 1.2);
        halo.setAttribute('stroke-opacity', '0.45');
        halo.setAttribute('stroke-dasharray', '2 3');
        hubNode.appendChild(halo);

        var hOrb = document.createElementNS(svgNS, 'circle');
        hOrb.setAttribute('class', 'orb hub-orb');
        hOrb.setAttribute('cx', 0);
        hOrb.setAttribute('cy', 0);
        hOrb.setAttribute('r', hubOrbR);
        hOrb.setAttribute('fill', 'url(#grad-hub-' + g.id + ')');
        hOrb.setAttribute('stroke', lighten(g.base, 0.1));
        hOrb.setAttribute('stroke-width', 2);
        hOrb.style.color = g.base;
        hubNode.appendChild(hOrb);

        // Hub label: position INWARD (toward viz center) so labels occupy
        // the empty middle region and don't clash with outward-fanning spokes
        var inwardAngle = hubAngle + Math.PI;
        var labelDist = hubOrbR + 22; // clear the halo ring (hubOrbR + 6)
        var hlx = labelDist * Math.cos(inwardAngle);
        var hly = labelDist * Math.sin(inwardAngle);
        var hAnchor = 'middle';
        if (Math.cos(inwardAngle) > 0.2) hAnchor = 'start';
        else if (Math.cos(inwardAngle) < -0.2) hAnchor = 'end';

        // Split multi-word names into 2 lines for compactness
        var nameParts = g.name.split(' ');
        var line1, line2;
        if (nameParts.length <= 1) {
          line1 = g.name; line2 = '';
        } else {
          var mid = Math.ceil(nameParts.length / 2);
          line1 = nameParts.slice(0, mid).join(' ');
          line2 = nameParts.slice(mid).join(' ');
        }

        // Vertical balancing: if inward points up/down, offset line1 so pair is centered
        var lineHeight = 14;
        var verticalBalance = line2 ? -lineHeight / 2 + 4 : 4;
        var t1 = document.createElementNS(svgNS, 'text');
        t1.setAttribute('x', hlx);
        t1.setAttribute('y', hly + verticalBalance);
        t1.setAttribute('text-anchor', hAnchor);
        t1.textContent = line1;
        hubNode.appendChild(t1);
        if (line2) {
          var t2 = document.createElementNS(svgNS, 'text');
          t2.setAttribute('x', hlx);
          t2.setAttribute('y', hly + verticalBalance + lineHeight);
          t2.setAttribute('text-anchor', hAnchor);
          t2.textContent = line2;
          hubNode.appendChild(t2);
        }

        nodeLayer.appendChild(hubNode);
        allNodes.push({ el: hubNode, type: 'hub', groupId: g.id, label: g.name, x: hx, y: hy });
      });

      // Expose interhub edges so bindInteractions can dim them too
      allEdges.interhub = interHubEdges;

      bindInteractions(allNodes, allEdges);
      renderLegend();
    }

    // --- Interactions ---
    function bindInteractions(allNodes, allEdges) {
      var interHubEdges = allEdges.interhub || [];

      function clearHighlight() {
        allNodes.forEach(function(n) { n.el.classList.remove('dimmed','highlighted'); });
        allEdges.forEach(function(e) { e.el.classList.remove('dimmed','highlighted'); });
        interHubEdges.forEach(function(e) { e.el.classList.remove('dimmed','highlighted'); });
      }

      function highlightGroup(groupId, activeSkill) {
        allNodes.forEach(function(n) {
          if (n.groupId === groupId) {
            n.el.classList.add('highlighted');
            n.el.classList.remove('dimmed');
          } else {
            n.el.classList.add('dimmed');
            n.el.classList.remove('highlighted');
          }
        });
        allEdges.forEach(function(e) {
          if (e.groupId === groupId) {
            e.el.classList.add('highlighted');
            e.el.classList.remove('dimmed');
          } else {
            e.el.classList.add('dimmed');
            e.el.classList.remove('highlighted');
          }
        });
        // Inter-hub edges: keep any that touch this group, dim the rest
        interHubEdges.forEach(function(e) {
          if (e.groupIds.indexOf(groupId) !== -1) {
            e.el.classList.remove('dimmed');
          } else {
            e.el.classList.add('dimmed');
          }
        });
      }

      function showTooltip(label, sub, x, y) {
        tipLabel.textContent = label;
        tipSub.textContent = sub || '';
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
        tooltip.classList.add('visible');
      }
      function hideTooltip() {
        tooltip.classList.remove('visible');
      }

      allNodes.forEach(function(n) {
        n.el.addEventListener('mouseenter', function() {
          highlightGroup(n.groupId);
          var subText = n.type === 'hub'
            ? (groups.find(function(g){return g.id===n.groupId;}).skills.length + ' skills')
            : 'Click to see related projects';
          showTooltip(n.label, subText, n.x, n.y);
        });
        n.el.addEventListener('mouseleave', function() {
          clearHighlight();
          hideTooltip();
        });

        n.el.addEventListener('click', function(e) {
          e.stopPropagation();
          if (n.type === 'skill') {
            filterProjectsBySkill(n.label);
          } else {
            // Hub click: filter by ANY skill in that group
            filterProjectsByGroup(n.groupId);
          }
        });
      });

      // Clicking outside clears project highlight
      document.addEventListener('click', function(e) {
        if (!wrapper.contains(e.target)) clearProjectHighlight();
      });
    }

    // --- Project filtering ---
    function tokensForSkill(skill) {
      return skillToProjectTokens[skill] || [];
    }

    function filterProjectsBySkill(skill) {
      var tokens = tokensForSkill(skill);
      applyProjectHighlight(tokens);
    }

    function filterProjectsByGroup(groupId) {
      var g = groups.find(function(x){return x.id===groupId;});
      if (!g) return;
      var tokens = [];
      g.skills.forEach(function(s) {
        tokensForSkill(s).forEach(function(t){ if (tokens.indexOf(t)===-1) tokens.push(t); });
      });
      applyProjectHighlight(tokens);
    }

    function applyProjectHighlight(tokens) {
      var cards = document.querySelectorAll('.project-card');
      if (!cards.length) return;

      if (!tokens.length) {
        clearProjectHighlight();
        return;
      }

      var matchedCount = 0;
      cards.forEach(function(card) {
        var badges = card.querySelectorAll('.tech-badge');
        var badgeText = Array.prototype.map.call(badges, function(b){ return b.textContent; }).join(' ');
        var matched = tokens.some(function(t) {
          return badgeText.toLowerCase().indexOf(t.toLowerCase()) !== -1;
        });
        card.classList.remove('skill-highlight','skill-dim');
        if (matched) {
          card.classList.add('skill-highlight');
          matchedCount++;
        } else {
          card.classList.add('skill-dim');
        }
      });

      if (matchedCount > 0) {
        // Smooth scroll to projects section
        var projects = document.getElementById('projects');
        if (projects) {
          projects.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        clearProjectHighlight();
      }
    }

    function clearProjectHighlight() {
      document.querySelectorAll('.project-card').forEach(function(card){
        card.classList.remove('skill-highlight','skill-dim');
      });
    }

    // --- Legend ---
    function renderLegend() {
      if (!legendEl) return;
      legendEl.innerHTML = '';
      groups.forEach(function(g) {
        var item = document.createElement('div');
        item.className = 'legend-item';
        item.dataset.group = g.id;
        var sw = document.createElement('span');
        sw.className = 'legend-swatch';
        sw.style.background = g.base;
        sw.style.color = g.base;
        var lbl = document.createElement('span');
        lbl.textContent = g.name;
        item.appendChild(sw);
        item.appendChild(lbl);
        legendEl.appendChild(item);

        // Legend hover -> highlight that group
        item.addEventListener('mouseenter', function() {
          var nodes = svg.querySelectorAll('.node');
          var edges = svg.querySelectorAll('.edge');
          var interEdges = svg.querySelectorAll('.interhub-edge');
          nodes.forEach(function(n) {
            if (n.getAttribute('data-group') === g.id) {
              n.classList.add('highlighted'); n.classList.remove('dimmed');
            } else {
              n.classList.add('dimmed'); n.classList.remove('highlighted');
            }
          });
          edges.forEach(function(e) {
            if (e.getAttribute('data-group') === g.id) {
              e.classList.add('highlighted'); e.classList.remove('dimmed');
            } else {
              e.classList.add('dimmed'); e.classList.remove('highlighted');
            }
          });
          interEdges.forEach(function(e) {
            var groupIds = (e.getAttribute('data-groups') || '').split(',');
            if (groupIds.indexOf(g.id) !== -1) {
              e.classList.remove('dimmed');
            } else {
              e.classList.add('dimmed');
            }
          });
        });
        item.addEventListener('mouseleave', function() {
          svg.querySelectorAll('.node,.edge,.interhub-edge').forEach(function(el){
            el.classList.remove('dimmed','highlighted');
          });
        });
      });
    }

    render();

    // Re-render on resize (debounced)
    var resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(render, 200);
    });
  }

  // Wait for DOM + libs
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay to ensure external scripts are loaded
    setTimeout(init, 100);
  }
})();
