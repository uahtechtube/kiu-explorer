<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Campus Gallery | {{ $settings->app_name }}</title>
    
    <!-- Meta tags for SEO -->
    <meta name="description" content="Explore campus life, hostel facilities, student ceremonies, and events at Kashim Ibrahim University through our photos and video logs.">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- CSS -->
    <style>
        :root {
            --primary-color: {{ $settings->primary_color }};
            --secondary-color: {{ $settings->secondary_color }};
            --bg-dark: #070a13;
            --bg-card: rgba(16, 22, 38, 0.7);
            --border-color: rgba(255, 255, 255, 0.08);
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --transition-smooth: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Light Theme override */
        .theme-light,
        html.theme-light {
            --bg-dark: #f5f7fb;
            --bg-card: #ffffff;
            --border-color: rgba(0, 0, 0, 0.08);
            --text-primary: #0f172a;
            --text-secondary: #475569;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-dark);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.5;
            transition: var(--transition-smooth);
            overflow-x: hidden;
            display: flex;
            flex-direction: column;
        }

        /* Glowing background elements */
        .glow-sphere {
            position: absolute;
            border-radius: 50%;
            filter: blur(120px);
            z-index: -1;
            opacity: 0.12;
            pointer-events: none;
        }

        .glow-1 {
            top: 5%;
            left: 10%;
            width: 400px;
            height: 400px;
            background: var(--primary-color);
        }

        .glow-2 {
            top: 50%;
            right: 10%;
            width: 500px;
            height: 500px;
            background: var(--secondary-color);
        }

        /* Header Navigation */
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 10%;
            backdrop-filter: blur(20px);
            background: rgba(7, 10, 19, 0.7);
            border-bottom: 1px solid var(--border-color);
            position: sticky;
            top: 0;
            z-index: 100;
            transition: var(--transition-smooth);
        }

        body.theme-light header {
            background: rgba(245, 247, 251, 0.85);
        }

        .logo {
            display: flex;
            align-items: center;
            text-decoration: none;
            font-weight: 800;
            font-size: 20px;
            color: var(--text-primary);
            gap: 8px;
        }

        .logo span {
            background: linear-gradient(135deg, #fff 40%, var(--text-secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        body.theme-light .logo span {
            background: linear-gradient(135deg, #0f172a 40%, #475569);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .logo-dot {
            width: 10px;
            height: 10px;
            background: var(--primary-color);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--primary-color);
        }

        nav {
            display: flex;
            gap: 24px;
            align-items: center;
        }

        nav a {
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 14.5px;
            font-weight: 600;
            transition: var(--transition-smooth);
        }

        nav a:hover, nav a.active {
            color: var(--primary-color);
        }

        .nav-actions {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .nav-btn {
            background: none;
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 8px 16px;
            border-radius: 30px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            text-decoration: none;
            transition: var(--transition-smooth);
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .nav-btn:hover {
            background: var(--border-color);
            border-color: var(--text-secondary);
        }

        .btn-theme {
            padding: 10px;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            justify-content: center;
        }

        /* Page Layout */
        .page-content {
            flex-grow: 1;
            padding: 60px 10%;
            max-width: 1400px;
            margin: 0 auto;
            width: 100%;
        }

        .page-header {
            text-align: center;
            margin-bottom: 50px;
        }

        .page-title {
            font-size: 42px;
            font-weight: 800;
            color: var(--text-primary);
            letter-spacing: -1px;
            margin-bottom: 12px;
        }

        .page-subtitle {
            font-size: 16px;
            color: var(--text-secondary);
            max-width: 600px;
            margin: 0 auto;
        }

        /* Filter Controls */
        .filter-container {
            display: flex;
            justify-content: center;
            gap: 12px;
            margin-bottom: 50px;
        }

        .filter-btn {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 10px 24px;
            border-radius: 30px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: var(--transition-smooth);
            outline: none;
        }

        .filter-btn:hover, .filter-btn.active {
            border-color: var(--primary-color);
            color: var(--primary-color);
            background: rgba(9, 165, 219, 0.05);
            box-shadow: 0 4px 15px rgba(9, 165, 219, 0.1);
        }

        /* Gallery Grid */
        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 24px;
            margin-bottom: 60px;
        }

        .gallery-item-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            overflow: hidden;
            transition: var(--transition-smooth);
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            position: relative;
        }

        .gallery-item-card:hover {
            transform: translateY(-6px);
            border-color: rgba(9, 165, 219, 0.3);
            box-shadow: 0 10px 25px rgba(9, 165, 219, 0.1);
        }

        .gallery-preview-wrapper {
            position: relative;
            height: 220px;
            overflow: hidden;
            background: #0f172a;
        }

        .gallery-preview-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: var(--transition-smooth);
        }

        .gallery-item-card:hover .gallery-preview-image {
            transform: scale(1.04);
        }

        /* Hover media overlays */
        .gallery-overlay-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            background: rgba(9, 165, 219, 0.85);
            border-radius: 50%;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            opacity: 0;
            transition: var(--transition-smooth);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .gallery-item-card:hover .gallery-overlay-icon {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }

        .gallery-type-tag {
            position: absolute;
            top: 15px;
            left: 15px;
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255,255,255,0.1);
            color: #fff;
            padding: 4px 10px;
            border-radius: 30px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            z-index: 2;
        }

        .gallery-caption {
            padding: 16px 20px;
        }

        .gallery-item-title {
            font-size: 16px;
            font-weight: 700;
            color: var(--text-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 4px;
        }

        .gallery-item-desc {
            font-size: 13px;
            color: var(--text-secondary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        body.theme-light .gallery-item-card {
            background: #fff;
            box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }

        body.theme-light .gallery-item-title {
            color: #0f172a;
        }

        /* Lightbox Overlay Modals */
        .lightbox-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(7, 10, 19, 0.95);
            backdrop-filter: blur(12px);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .lightbox-overlay.open {
            opacity: 1;
            pointer-events: auto;
        }

        .lightbox-container {
            width: 90%;
            max-width: 950px;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            transform: scale(0.95);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .lightbox-overlay.open .lightbox-container {
            transform: scale(1);
        }

        .lightbox-media-wrapper {
            width: 100%;
            background: #000;
            border-radius: 16px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 30px 60px rgba(0,0,0,0.5);
            max-height: 70vh;
        }

        .lightbox-media-wrapper img {
            max-width: 100%;
            max-height: 70vh;
            object-fit: contain;
        }

        .lightbox-media-wrapper video {
            width: 100%;
            max-height: 70vh;
            outline: none;
            background: #000;
        }

        .lightbox-caption-bar {
            width: 100%;
            text-align: center;
            margin-top: 20px;
        }

        .lightbox-title {
            font-size: 20px;
            font-weight: 700;
            color: #fff;
            margin-bottom: 6px;
        }

        .lightbox-desc {
            font-size: 14.5px;
            color: #94a3b8;
            max-width: 600px;
            margin: 0 auto;
        }

        .lightbox-close-btn {
            position: absolute;
            top: -48px;
            right: 0;
            background: none;
            border: none;
            color: #94a3b8;
            font-size: 32px;
            cursor: pointer;
            outline: none;
            transition: color 0.2s;
            line-height: 1;
        }

        .lightbox-close-btn:hover {
            color: #fff;
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 80px 0;
            background: var(--bg-card);
            border: 1px dashed var(--border-color);
            border-radius: 24px;
            max-width: 600px;
            margin: 0 auto;
        }

        .empty-state svg {
            width: 64px;
            height: 64px;
            color: var(--text-secondary);
            margin-bottom: 20px;
        }

        .empty-state h3 {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .empty-state p {
            color: var(--text-secondary);
            font-size: 15px;
        }

        /* Footer */
        footer {
            border-top: 1px solid var(--border-color);
            padding: 40px 10%;
            background: rgba(9, 13, 22, 0.95);
            display: flex;
            flex-direction: column;
            gap: 30px;
            transition: var(--transition-smooth);
            margin-top: auto;
        }

        body.theme-light footer {
            background: #f1f5f9;
        }

        .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }

        .footer-logo {
            text-decoration: none;
            font-weight: 800;
            font-size: 22px;
            color: var(--text-primary);
        }

        .footer-logo span {
            color: var(--primary-color);
        }

        .footer-links {
            display: flex;
            gap: 24px;
        }

        .footer-links a {
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 14.5px;
            font-weight: 600;
            transition: var(--transition-smooth);
        }

        .footer-links a:hover {
            color: var(--primary-color);
        }

        .footer-copyright {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
            font-size: 13.5px;
            color: var(--text-secondary);
            border-top: 1px solid var(--border-color);
            padding-top: 25px;
        }

        .cms-link {
            color: var(--text-secondary);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: var(--transition-smooth);
        }

        .cms-link:hover {
            color: var(--primary-color);
        }

        /* Mobile adjustments */
        @media(max-width: 768px) {
            .page-title {
                font-size: 32px;
            }
            .page-content {
                padding: 40px 5%;
            }
            header {
                padding: 15px 5%;
            }
            nav {
                display: none;
            }
            footer {
                padding: 40px 5%;
            }
            .footer-content {
                flex-direction: column;
                text-align: center;
            }
            .footer-links {
                flex-direction: column;
                gap: 15px;
            }
            .footer-copyright {
                flex-direction: column;
                text-align: center;
            }
        }
    </style>
</head>
<body class="theme-{{ $settings->theme_mode }}">
    <div class="glow-sphere glow-1"></div>
    <div class="glow-sphere glow-2"></div>

    <!-- Header Navigation -->
    <header>
        <a href="{{ route('landing') }}" class="logo">
            <div class="logo-dot"></div>
            <span>{{ $settings->app_name }}</span>
        </a>
        <nav>
            <a href="{{ route('landing') }}#features">Features</a>
            <a href="{{ route('blog.index') }}">Blog</a>
            <a href="{{ route('gallery.index') }}" class="active">Gallery</a>
            <a href="{{ route('landing') }}#faq">FAQ</a>
        </nav>
        <div class="nav-actions">
            <!-- Theme Toggle Icon Button -->
            <button id="theme-toggle" class="nav-btn btn-theme" title="Toggle Light/Dark Theme">
                <!-- Sun Icon -->
                <svg id="theme-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                <!-- Moon Icon -->
                <svg id="theme-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </button>

            <a href="{{ route('landing') }}" class="nav-btn">
                <span>Go Back Home</span>
            </a>
        </div>
    </header>

    <!-- Main Content -->
    <main class="page-content">
        <div class="page-header">
            <h1 class="page-title">Campus Life Gallery</h1>
            <p class="page-subtitle">A visual tour of Kashim Ibrahim University campus architecture, events, accommodation facilities, and student community.</p>
        </div>

        <!-- Gallery Filters -->
        @if($galleryItems->isNotEmpty())
            <div class="filter-container">
                <button type="button" class="filter-btn active" data-filter="all">All Media</button>
                <button type="button" class="filter-btn" data-filter="image">Photos</button>
                <button type="button" class="filter-btn" data-filter="video">Videos</button>
            </div>

            <!-- Media Grid -->
            <div class="gallery-grid">
                @foreach($galleryItems as $item)
                    <div class="gallery-item-card" data-type="{{ $item->type }}" onclick='openLightbox({!! json_encode(array_merge($item->toArray(), [
                        "full_media_url" => asset("storage/" . $item->media_path),
                        "full_poster_url" => $item->thumbnail_path ? asset("storage/" . $item->thumbnail_path) : null
                    ])) !!})'>
                        <span class="gallery-type-tag">{{ $item->type }}</span>
                        
                        <div class="gallery-preview-wrapper">
                            @if($item->type === 'image')
                                <img src="{{ asset('storage/' . $item->media_path) }}" alt="{{ $item->title }}" class="gallery-preview-image">
                                <div class="gallery-overlay-icon">
                                    <!-- Zoom Icon -->
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                                </div>
                            @else
                                <div class="gallery-overlay-icon" style="opacity: 0.85; transform: scale(1.05); z-index: 3;">
                                    <!-- Play Icon -->
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                </div>
                                <video class="gallery-preview-image" autoplay muted loop playsinline style="width: 100%; height: 100%; object-fit: cover; border: none; outline: none;" poster="{{ $item->thumbnail_path ? asset('storage/' . $item->thumbnail_path) : '' }}">
                                    <source src="{{ asset('storage/' . $item->media_path) }}" type="video/mp4">
                                </video>
                            @endif
                        </div>
                        
                        <div class="gallery-caption">
                            <h3 class="gallery-item-title">{{ $item->title }}</h3>
                            <p class="gallery-item-desc">{{ $item->description ?: 'Campus event highlight.' }}</p>
                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <h3>No gallery items uploaded</h3>
                <p>There are currently no photos or videos in the campus gallery. Administrators will upload event highlights soon!</p>
            </div>
        @endif
    </main>

    <!-- Lightbox Modal -->
    <div class="lightbox-overlay" id="lightbox-modal">
        <button type="button" class="lightbox-close-btn" onclick="closeLightbox()">&times;</button>
        <div class="lightbox-container">
            <div class="lightbox-media-wrapper" id="lightbox-media-container">
                <!-- Dynamically populated media tag -->
            </div>
            <div class="lightbox-caption-bar">
                <h3 class="lightbox-title" id="lightbox-title"></h3>
                <p class="lightbox-desc" id="lightbox-description"></p>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer>
        <div class="footer-content">
            <a href="{{ route('landing') }}" class="footer-logo">
                KIU<span>Explorer</span>
            </a>
            <div class="footer-links">
                <a href="{{ route('landing') }}#features">Features</a>
                <a href="{{ route('blog.index') }}">Blog</a>
                <a href="{{ route('gallery.index') }}">Gallery</a>
                <a href="{{ route('landing') }}#faq">FAQ</a>
                <a href="{{ route('cms.login') }}">Admin Panel</a>
            </div>
        </div>
        <div class="footer-copyright">
            <span>© 2026 {{ $settings->app_name }}. All rights reserved. Serviced for KIU Campus.</span>
            <a href="{{ route('cms.login') }}" class="cms-link">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                CMS Management Portal
            </a>
        </div>
    </footer>

    <!-- JS for theme, filters, and lightbox -->
    <script>
        // Theme Switcher Logic
        const themeToggle = document.getElementById('theme-toggle');
        const themeSun = document.getElementById('theme-sun');
        const themeMoon = document.getElementById('theme-moon');
        const htmlElement = document.documentElement;

        function initTheme() {
            const savedTheme = localStorage.getItem('kiu-explorer-theme') || '{{ $settings->theme_mode }}';
            if (savedTheme === 'light') {
                document.body.className = 'theme-light';
                htmlElement.classList.add('theme-light');
                themeSun.style.display = 'block';
                themeMoon.style.display = 'none';
            } else {
                document.body.className = 'theme-dark';
                htmlElement.classList.remove('theme-light');
                themeSun.style.display = 'none';
                themeMoon.style.display = 'block';
            }
        }

        themeToggle.addEventListener('click', () => {
            if (document.body.classList.contains('theme-light')) {
                document.body.className = 'theme-dark';
                htmlElement.classList.remove('theme-light');
                themeSun.style.display = 'none';
                themeMoon.style.display = 'block';
                localStorage.setItem('kiu-explorer-theme', 'dark');
            } else {
                document.body.className = 'theme-light';
                htmlElement.classList.add('theme-light');
                themeSun.style.display = 'block';
                themeMoon.style.display = 'none';
                localStorage.setItem('kiu-explorer-theme', 'light');
            }
        });

        // Initialize Theme
        initTheme();

        // client-side tab filtering
        const filterButtons = document.querySelectorAll('.filter-btn');
        const galleryCards = document.querySelectorAll('.gallery-item-card');

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // remove active class
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterVal = btn.getAttribute('data-filter');

                galleryCards.forEach(card => {
                    const cardType = card.getAttribute('data-type');
                    if (filterVal === 'all' || cardType === filterVal) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });

        // Lightbox overlay methods
        function openLightbox(item) {
            const modal = document.getElementById('lightbox-modal');
            const mediaContainer = document.getElementById('lightbox-media-container');
            const titleEl = document.getElementById('lightbox-title');
            const descEl = document.getElementById('lightbox-description');

            titleEl.textContent = item.title;
            descEl.textContent = item.description || '';

            // Clean previous content
            mediaContainer.innerHTML = '';

            const assetUrl = item.full_media_url;

            if (item.type === 'image') {
                mediaContainer.innerHTML = `<img src="${assetUrl}" alt="${item.title}">`;
            } else {
                const posterAttr = item.full_poster_url ? ` poster="${item.full_poster_url}"` : '';
                mediaContainer.innerHTML = `
                    <video controls autoplay${posterAttr}>
                        <source src="${assetUrl}" type="video/mp4">
                        Your browser does not support HTML5 video logs.
                    </video>
                `;
            }

            modal.classList.add('open');
            document.body.style.overflow = 'hidden'; // stop scroll
        }

        function closeLightbox() {
            const modal = document.getElementById('lightbox-modal');
            const mediaContainer = document.getElementById('lightbox-media-container');

            // Pause/reset video content before removing
            const video = mediaContainer.querySelector('video');
            if (video) {
                video.pause();
            }

            modal.classList.remove('open');
            document.body.style.overflow = 'auto'; // allow scroll
            
            // clear after transition
            setTimeout(() => {
                mediaContainer.innerHTML = '';
            }, 300);
        }

        // Close lightbox on click outside the wrapper card container
        document.getElementById('lightbox-modal').addEventListener('click', (e) => {
            if (e.target.id === 'lightbox-modal') {
                closeLightbox();
            }
        });

        // Close lightbox on escape press
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('lightbox-modal').classList.contains('open')) {
                closeLightbox();
            }
        });
    </script>
</body>
</html>
