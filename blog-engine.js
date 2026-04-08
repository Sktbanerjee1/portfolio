/* ============================================
   BLOG ENGINE — Client-side post list renderer
   ============================================ */

(function () {
  'use strict';

  function loadPostList() {
    var container = document.getElementById('blog-posts');
    if (!container) return;

    fetch('blog/posts/index.json')
      .then(function (response) {
        if (!response.ok) throw new Error('Blog index not found');
        return response.json();
      })
      .then(function (posts) {
        if (!posts || posts.length === 0) {
          container.innerHTML =
            '<div class="blog-empty-state glass-card" style="padding: 3rem; text-align: center; grid-column: 1 / -1;">' +
            '<p style="color: var(--text-secondary); font-size: 1.0625rem; line-height: 1.7;">No posts yet. Check back soon for thoughts on healthcare AI, computational biology, and the future of medicine.</p>' +
            '</div>';
          return;
        }
        posts
          .sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
          })
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

        // Initialize GSAP animations for dynamically added cards
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
          gsap.registerPlugin(ScrollTrigger);
          var cards = container.querySelectorAll('.glass-card');
          gsap.from(cards, {
            y: 80,
            opacity: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power3.out',
          });
        }
      })
      .catch(function () {
        container.innerHTML =
          '<p style="color: var(--text-secondary);">No blog posts yet. Check back soon.</p>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPostList);
  } else {
    loadPostList();
  }
})();
