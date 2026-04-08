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
    initBlogPreview();
    initContactForm();
  }

  // Wait for DOM + libs
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay to ensure external scripts are loaded
    setTimeout(init, 100);
  }
})();
