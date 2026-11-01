<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $post->title }} | {{ $settings->app_name }} Blog</title>
    
    <!-- Meta tags for SEO -->
    <meta name="description" content="{{ $post->summary ?: Str::limit(strip_tags($post->content), 150) }}">
    <meta name="author" content="{{ $post->author_name }}">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,700;1,400&display=swap" rel="stylesheet">
    
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
        }

        /* Glowing background elements */
        .glow-sphere {
            position: absolute;
            border-radius: 50%;
            filter: blur(120px);
            z-index: -1;
            opacity: 0.15;
            pointer-events: none;
        }

        .glow-1 {
            top: 10%;
            left: 20%;
            width: 400px;
            height: 400px;
            background: var(--primary-color);
        }

        .glow-2 {
            top: 40%;
            right: 15%;
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

        header nav a {
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 14.5px;
            font-weight: 600;
            transition: var(--transition-smooth);
        }

        header nav a:hover, header nav a.active {
            color: var(--primary-color);
        }

        @media(max-width: 768px) {
            header nav {
                display: none !important;
            }
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

        /* Article Wrapper layout */
        .article-container {
            max-width: 800px;
            margin: 60px auto;
            padding: 0 24px;
        }

        .article-back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 32px;
            transition: var(--transition-smooth);
        }

        .article-back-link:hover {
            color: var(--text-primary);
            transform: translateX(-4px);
        }

        .article-header {
            margin-bottom: 40px;
        }

        .article-badge {
            display: inline-block;
            background: rgba(9, 165, 219, 0.1);
            color: var(--primary-color);
            padding: 6px 16px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
            border: 1px solid rgba(9, 165, 219, 0.2);
        }

        .article-title {
            font-size: 38px;
            font-weight: 800;
            line-height: 1.25;
            color: var(--text-primary);
            margin-bottom: 24px;
            letter-spacing: -0.5px;
        }

        .article-meta {
            display: flex;
            align-items: center;
            gap: 20px;
            font-size: 14px;
            color: var(--text-secondary);
            flex-wrap: wrap;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 24px;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .meta-item svg {
            color: var(--primary-color);
        }

        /* Banner featured image */
        .article-banner {
            width: 100%;
            height: 450px;
            border-radius: 24px;
            overflow: hidden;
            margin-bottom: 48px;
            border: 1px solid var(--border-color);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .article-banner img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .article-banner-placeholder {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .article-banner-placeholder svg {
            width: 80px;
            height: 80px;
            color: rgba(255,255,255,0.6);
        }

        /* Article content styling */
        .article-content {
            font-size: 17.5px;
            line-height: 1.8;
            color: var(--text-primary);
        }

        /* Premium article spacing & typography rules */
        .article-content p {
            margin-bottom: 28px;
            font-weight: 400;
        }

        .article-content h2 {
            font-size: 26px;
            font-weight: 800;
            margin: 48px 0 20px 0;
            color: var(--text-primary);
            letter-spacing: -0.3px;
        }

        .article-content h3 {
            font-size: 21px;
            font-weight: 700;
            margin: 36px 0 16px 0;
            color: var(--text-primary);
        }

        .article-content ul, .article-content ol {
            margin-bottom: 28px;
            padding-left: 24px;
        }

        .article-content li {
            margin-bottom: 12px;
        }

        .article-content blockquote {
            border-left: 4px solid var(--primary-color);
            padding-left: 20px;
            font-style: italic;
            color: var(--text-secondary);
            margin: 32px 0;
            font-size: 19px;
            line-height: 1.6;
        }

        .article-content strong {
            font-weight: 700;
            color: var(--text-primary);
        }

        .article-content pre {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-color);
            padding: 20px;
            border-radius: 12px;
            overflow-x: auto;
            margin-bottom: 28px;
            font-family: monospace;
            font-size: 15px;
            color: #e2e8f0;
        }

        body.theme-light .article-content pre {
            background: #f1f5f9;
        }

        /* Related Articles Section */
        .related-section {
            background: rgba(9, 13, 22, 0.4);
            border-top: 1px solid var(--border-color);
            padding: 80px 10%;
            margin-top: 80px;
            transition: var(--transition-smooth);
        }

        body.theme-light .related-section {
            background: rgba(241, 245, 249, 0.6);
        }

        .related-container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .related-title {
            font-size: 24px;
            font-weight: 800;
            color: var(--text-primary);
            margin-bottom: 40px;
            text-align: center;
        }

        .related-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
        }

        /* Shared Card design from landing */
        .blog-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            height: 100%;
            transition: var(--transition-smooth);
            position: relative;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            text-decoration: none;
        }
        
        .blog-card:hover {
            transform: translateY(-8px);
            border-color: rgba(9, 165, 219, 0.4);
            box-shadow: 0 12px 30px rgba(9, 165, 219, 0.15);
        }
        
        .blog-card-image-wrapper {
            position: relative;
            height: 180px;
            overflow: hidden;
            background: #0f172a;
        }
        
        .blog-card-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: var(--transition-smooth);
        }
        
        .blog-card:hover .blog-card-image {
            transform: scale(1.05);
        }
        
        .blog-card-image-placeholder {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .blog-card-image-placeholder svg {
            width: 40px;
            height: 40px;
            color: rgba(255,255,255,0.7);
        }
        
        .blog-card-badge {
            position: absolute;
            top: 15px;
            left: 15px;
            background: var(--primary-color);
            color: #fff;
            padding: 4px 10px;
            border-radius: 30px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            z-index: 2;
        }
        
        .blog-card-content {
            padding: 20px;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }
        
        .blog-card-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: var(--text-secondary);
            margin-bottom: 10px;
        }
        
        .blog-card-title {
            font-size: 17px;
            font-weight: 800;
            color: var(--text-primary);
            line-height: 1.4;
            margin-bottom: 10px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            height: 48px;
        }
        
        .blog-card-summary {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.6;
            margin-bottom: 16px;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            flex-grow: 1;
        }
        
        .blog-card-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: var(--primary-color);
            font-weight: 700;
            font-size: 13px;
            width: fit-content;
        }

        body.theme-light .blog-card {
            background: #fff;
            box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }
        body.theme-light .blog-card-title {
            color: #0f172a;
        }
        body.theme-light .blog-card-summary {
            color: #475569;
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
            .article-title {
                font-size: 28px;
            }
            .article-banner {
                height: 280px;
            }
            .article-content {
                font-size: 16px;
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
        <nav style="display: flex; gap: 24px; align-items: center;">
            <a href="{{ route('landing') }}#features">Features</a>
            <a href="{{ route('blog.index') }}" class="active">Blog</a>
            <a href="{{ route('gallery.index') }}">Gallery</a>
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
    <main class="article-container">
        <a href="{{ route('blog.index') }}" class="article-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            <span>Back to Blog list</span>
        </a>

        <article>
            <div class="article-header">
                <span class="article-badge">{{ $post->author_name }}</span>
                <h1 class="article-title">{{ $post->title }}</h1>
                
                <div class="article-meta">
                    <div class="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span>Published: {{ $post->published_at ? $post->published_at->format('F d, Y') : $post->created_at->format('F d, Y') }}</span>
                    </div>
                    <div class="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        <span>{{ number_format($post->views) }} views</span>
                    </div>
                    <div class="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span>{{ max(1, ceil(str_word_count(strip_tags($post->content)) / 200)) }} min read</span>
                    </div>
                </div>
            </div>

            <!-- Banner Featured Image or Video -->
            <div class="article-banner">
                @if($post->video_path)
                    <video controls style="width: 100%; border-radius: 16px; outline: none; background: #000; box-shadow: 0 10px 30px rgba(0,0,0,0.3);" poster="{{ $post->image_path ? asset('storage/' . $post->image_path) : '' }}">
                        <source src="{{ asset('storage/' . $post->video_path) }}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                @elseif($post->image_path)
                    <img src="{{ asset('storage/' . $post->image_path) }}" alt="{{ $post->title }}">
                @else
                    <div class="article-banner-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    </div>
                @endif
            </div>

            <!-- Article Body Content -->
            <div class="article-content">
                {!! nl2br($post->content) !!}
            </div>
        </article>
    </main>

    <!-- Related Articles Section -->
    @if(!empty($relatedPosts) && $relatedPosts->isNotEmpty())
        <section class="related-section">
            <div class="related-container">
                <h2 class="related-title">You Might Also Like</h2>
                <div class="related-grid">
                    @foreach($relatedPosts as $rPost)
                        <a href="{{ route('blog.show', $rPost->slug) }}" class="blog-card">
                            <div class="blog-card-image-wrapper">
                                @if($rPost->image_path)
                                    <img src="{{ asset('storage/' . $rPost->image_path) }}" alt="{{ $rPost->title }}" class="blog-card-image">
                                @else
                                    <div class="blog-card-image-placeholder">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                                    </div>
                                @endif
                                <div class="blog-card-badge">{{ $rPost->author_name }}</div>
                            </div>
                            <div class="blog-card-content">
                                <div class="blog-card-meta">
                                    <span>{{ $rPost->published_at ? $rPost->published_at->format('M d, Y') : $rPost->created_at->format('M d, Y') }}</span>
                                    <span>{{ number_format($rPost->views) }} views</span>
                                </div>
                                <h3 class="blog-card-title">{{ $rPost->title }}</h3>
                                <p class="blog-card-summary">{{ Str::limit($rPost->summary ?: strip_tags($rPost->content), 100) }}</p>
                                <span class="blog-card-link">
                                    <span>Read Article</span>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </span>
                            </div>
                        </a>
                    @endforeach
                </div>
            </div>
        </section>
    @endif

    <!-- Footer -->
    <footer>
        <div class="footer-content">
            <a href="{{ route('landing') }}" class="footer-logo">
                KIU<span>Explorer</span>
            </a>
            <div class="footer-links">
                <a href="{{ route('landing') }}#features">Features</a>
                <a href="{{ route('landing') }}#blog">Blog</a>
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

    <!-- Theme Switcher Javascript -->
    <script>
        const themeToggle = document.getElementById('theme-toggle');
        const themeSun = document.getElementById('theme-sun');
        const themeMoon = document.getElementById('theme-moon');
        const htmlElement = document.documentElement;

        // Apply theme on load
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
    </script>
</body>
</html>
