<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Campus Blog | {{ $settings->app_name }}</title>
    
    <!-- Meta tags for SEO -->
    <meta name="description" content="Stay updated with the latest campus announcements, tips, and guides from the {{ $settings->app_name }} team.">
    
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

        /* Search Section */
        .search-container {
            max-width: 500px;
            margin: 0 auto 50px auto;
            position: relative;
        }

        .search-input {
            width: 100%;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            padding: 14px 20px 14px 46px;
            border-radius: 30px;
            color: var(--text-primary);
            font-family: inherit;
            font-size: 15px;
            outline: none;
            transition: var(--transition-smooth);
        }

        .search-input:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 15px rgba(9, 165, 219, 0.15);
        }

        .search-icon {
            position: absolute;
            left: 18px;
            top: 15px;
            color: var(--text-secondary);
            pointer-events: none;
        }

        /* Blog Grid & Cards */
        .blog-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 30px;
            margin-bottom: 60px;
        }
        
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
            height: 210px;
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
            width: 44px;
            height: 44px;
            color: rgba(255,255,255,0.7);
        }
        
        .blog-card-badge {
            position: absolute;
            top: 15px;
            left: 15px;
            background: var(--primary-color);
            color: #fff;
            padding: 5px 12px;
            border-radius: 30px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            z-index: 2;
        }

        .blog-card-video-overlay {
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255,255,255,0.1);
            color: #fff;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
        }
        
        .blog-card-content {
            padding: 25px;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }
        
        .blog-card-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: var(--text-secondary);
            margin-bottom: 12px;
        }
        
        .blog-card-views {
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        
        .blog-card-title {
            font-size: 19px;
            font-weight: 800;
            color: var(--text-primary);
            line-height: 1.4;
            margin-bottom: 12px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            height: 52px;
        }
        
        .blog-card-summary {
            font-size: 14px;
            color: var(--text-secondary);
            line-height: 1.6;
            margin-bottom: 20px;
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
            font-size: 13.5px;
            transition: var(--transition-smooth);
            width: fit-content;
        }
        
        .blog-card-link svg {
            transition: var(--transition-smooth);
        }
        
        .blog-card:hover .blog-card-link {
            color: #fff;
        }
        
        .blog-card:hover .blog-card-link svg {
            transform: translateX(4px);
            color: #fff;
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

        /* Pagination Styles */
        .pagination-container {
            display: flex;
            justify-content: center;
            margin-top: 40px;
        }

        .pagination {
            display: flex;
            list-style: none;
            gap: 8px;
            align-items: center;
        }

        .pagination li a, .pagination li span {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 1px solid var(--border-color);
            background: var(--bg-card);
            color: var(--text-primary);
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            transition: var(--transition-smooth);
            cursor: pointer;
        }

        .pagination li a:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
            transform: translateY(-2px);
        }

        .pagination li.active span {
            background: var(--primary-color);
            border-color: var(--primary-color);
            color: #fff;
        }

        .pagination li.disabled span {
            opacity: 0.4;
            cursor: not-allowed;
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
            margin-bottom: 24px;
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
    <main class="page-content">
        <div class="page-header">
            <h1 class="page-title">Campus Insights & Blog</h1>
            <p class="page-subtitle">Stay informed with the latest stories, announcement summaries, study tips, and campus guides.</p>
        </div>

        <!-- Search Bar -->
        <div class="search-container">
            <form action="{{ route('blog.index') }}" method="GET">
                <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" name="search" class="search-input" value="{{ request('search') }}" placeholder="Search articles...">
            </form>
        </div>

        <!-- Blog Cards Grid -->
        @if($blogPosts->isNotEmpty())
            <div class="blog-grid">
                @foreach($blogPosts as $post)
                    <a href="{{ route('blog.show', $post->slug) }}" class="blog-card">
                        <div class="blog-card-image-wrapper">
                            @if($post->image_path)
                                <img src="{{ asset('storage/' . $post->image_path) }}" alt="{{ $post->title }}" class="blog-card-image">
                            @else
                                <div class="blog-card-image-placeholder">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                                </div>
                            @endif
                            <div class="blog-card-badge">{{ $post->author_name }}</div>
                            @if($post->video_path)
                                <div class="blog-card-video-overlay" title="This post contains video content">
                                    <!-- Video Play SVG Icon -->
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                </div>
                            @endif
                        </div>
                        <div class="blog-card-content">
                            <div class="blog-card-meta">
                                <span>{{ $post->published_at ? $post->published_at->format('M d, Y') : $post->created_at->format('M d, Y') }}</span>
                                <span class="blog-card-views">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    {{ number_format($post->views) }} views
                                </span>
                            </div>
                            <h3 class="blog-card-title">{{ $post->title }}</h3>
                            <p class="blog-card-summary">{{ $post->summary ?: Str::limit(strip_tags($post->content), 110) }}</p>
                            <span class="blog-card-link">
                                <span>Read Article</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </span>
                        </div>
                    </a>
                @endforeach
            </div>

            <!-- Custom Pagination -->
            <div class="pagination-container">
                {{ $blogPosts->appends(request()->input())->links('pagination::bootstrap-4') }}
            </div>
        @else
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><path d="M8 14s1.5-2 3-2 3 2 3 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="13" y1="9" x2="13.01" y2="9"></line></svg>
                <h3>No articles found</h3>
                <p>We couldn't find any published blog posts matching your search query. Try typing something else!</p>
                <a href="{{ route('blog.index') }}" class="nav-btn" style="border-color:var(--primary-color); color:var(--primary-color);">Clear Search</a>
            </div>
        @endif
    </main>

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
