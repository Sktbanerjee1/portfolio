# Saikat Bandyopadhyay — Portfolio Website

A production-ready personal portfolio and blog with Three.js 3D particle backgrounds, GSAP scroll animations, Typed.js hero text, glassmorphism cards, and a static markdown blog engine.

## Quick Start

Open `index.html` in a browser. For the blog to work (it uses `fetch`), you need a local server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# Then open http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a new GitHub repository
2. Push this folder to the repo:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/Sktbanerjee1/YOUR_REPO.git
   git push -u origin main
   ```
3. Go to **Settings > Pages > Source**: "Deploy from a branch" > Branch: `main`, Folder: `/` (root)
4. Your site will be live at `https://Sktbanerjee1.github.io/YOUR_REPO/`

## Customize Your Content

All content is driven by `data.json`. Edit it to update your info.

### Items marked for replacement

The following items in `data.json` have `[REPLACE]` prefixes — update them with your real URLs:

- `meta.social.scholar` — Your Google Scholar profile URL
- `projects[*].github` — GitHub repo URLs for each project

### Adding a Blog Post

The blog is ready to go — just add markdown files and register them. No rebuild needed; GitHub Pages serves the files and the client-side engine renders them automatically.

**Step 1:** Create a new `.md` file in `blog/posts/` with this format:

```markdown
---
title: Your Post Title
date: 2026-04-15
tags: [healthcare-ai, genomics]
readingTime: 5 min
excerpt: A one-sentence summary that appears on the blog listing page.
---

# Your Post Title

Write your content here using standard markdown. Code blocks, links,
images, blockquotes — all supported.
```

**Step 2:** Register the post in `blog/posts/index.json`:

```json
[
  {
    "slug": "your-post-slug",
    "title": "Your Post Title",
    "date": "2026-04-15",
    "tags": ["healthcare-ai", "genomics"],
    "readingTime": "5 min",
    "excerpt": "A one-sentence summary that appears on the blog listing page.",
    "file": "your-post-slug.md"
  }
]
```

The `slug` becomes the URL: `blog/post.html?slug=your-post-slug`

**Step 3:** Commit and push:

```bash
git add blog/posts/your-post-slug.md blog/posts/index.json
git commit -m "Add blog post: Your Post Title"
git push
```

The post will appear on both the blog listing page and the homepage preview within a few minutes once GitHub Pages redeploys.

### Adding Your Avatar

Replace `assets/avatar.jpg` with your photo (recommended: 400x400px square).

## File Structure

```
portfolio/
├── index.html          — Main portfolio page
├── blog.html           — Blog listing page
├── style.css           — Complete design system
├── script.js           — Animations & interactions
├── blog-engine.js      — Blog post list renderer
├── data.json           — Content configuration
├── assets/             — Images & avatar
├── blog/
│   ├── posts/          — Markdown blog posts
│   │   ├── index.json  — Post manifest
│   │   └── *.md        — Individual posts
│   └── post.html       — Single post template
└── README.md           — This file
```

## Tech Stack

- **Design**: Custom CSS design system with glassmorphism
- **Animations**: GSAP 3.12 + ScrollTrigger
- **3D Background**: Three.js r128 particle system
- **Hero Text**: Typed.js 2.0
- **Blog**: Client-side markdown rendering with marked.js
- **Fonts**: Inter + JetBrains Mono (Google Fonts)
