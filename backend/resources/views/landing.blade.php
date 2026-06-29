<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $settings->app_name }} - Premium Campus Companion</title>
    
    <!-- Meta tags for SEO -->
    <meta name="description" content="Download {{ $settings->app_name }} APK. Timetables, campus maps, hostel booking, GPA calculator, and student communities for Kashim Ibrahim University.">
    <meta name="keywords" content="KIU, Kashim Ibrahim University, KIU Explorer, APK download, campus navigator, student portal, hostel booking">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Premium Styles -->
    <style>
        :root {
            --primary-color: {{ $settings->primary_color }};
            --secondary-color: {{ $settings->secondary_color }};
            
            /* Dark Theme variables by default */
            --bg-dark: #090d16;
            --bg-card: rgba(17, 25, 40, 0.65);
            --border-color: rgba(255, 255, 255, 0.08);
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --text-inverse: #0f172a;
            --transition-smooth: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Light Theme variable overrides */
        body.theme-light {
            --bg-dark: #f5f7fb;
            --bg-card: rgba(255, 255, 255, 0.8);
            --border-color: rgba(15, 23, 42, 0.08);
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --text-inverse: #f8fafc;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            max-width: 100%;
            overflow-x: hidden;
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
            transition: background-color 0.4s ease, color 0.4s ease;
        }

        h1, h2, h3, h4, .font-heading {
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: var(--bg-dark);
        }
        ::-webkit-scrollbar-thumb {
            background: var(--primary-color);
            border-radius: 4px;
        }

        /* Ambient Glow Backgrounds */
        .glow-sphere {
            position: absolute;
            border-radius: 50%;
            filter: blur(140px);
            z-index: 0;
            pointer-events: none;
            opacity: 0.4;
            transition: var(--transition-smooth);
        }

        body.theme-light .glow-sphere {
            opacity: 0.2;
            filter: blur(160px);
        }

        .glow-1 {
            top: -10%;
            right: -10%;
            width: 600px;
            height: 600px;
            background: var(--primary-color);
        }

        .glow-2 {
            top: 40%;
            left: -15%;
            width: 500px;
            height: 500px;
            background: color-mix(in srgb, var(--primary-color) 40%, #a855f7);
        }

        /* Navbar */
        header {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            padding: 20px 8%;
            z-index: 9999;
            display: flex;
            justify-content: space-between;
            align-items: center;
            -webkit-backdrop-filter: blur(16px);
            backdrop-filter: blur(16px);
            background: rgba(9, 13, 22, 0.85);
            border-bottom: 1px solid var(--border-color);
            transition: var(--transition-smooth);
        }

        body.theme-light header {
            background: rgba(245, 247, 251, 0.85);
        }

        .logo {
            font-family: 'Outfit', sans-serif;
            font-size: 24px;
            font-weight: 800;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
        }

        .logo span {
            background: linear-gradient(135deg, var(--text-primary), var(--primary-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .logo-dot {
            width: 8px;
            height: 8px;
            background-color: var(--primary-color);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--primary-color);
        }

        nav {
            display: flex;
            align-items: center;
            gap: 30px;
        }

        nav a {
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 15px;
            font-weight: 500;
            transition: var(--transition-smooth);
        }

        nav a:hover {
            color: var(--primary-color);
        }

        .nav-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .nav-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            padding: 10px 20px;
            border-radius: 30px;
            color: var(--text-primary);
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: var(--transition-smooth);
        }

        body.theme-light .nav-btn {
            background: rgba(15, 23, 42, 0.04);
        }

        .nav-btn:hover {
            background: var(--primary-color);
            border-color: var(--primary-color);
            color: #fff;
            box-shadow: 0 4px 15px color-mix(in srgb, var(--primary-color) 40%, transparent);
            transform: translateY(-2px);
        }

        /* Hero Section */
        .hero {
            position: relative;
            min-height: 100vh;
            padding: 150px 8% 80px;
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 40px;
            align-items: center;
            z-index: 10;
        }

        .hero-content {
            display: flex;
            flex-direction: column;
            gap: 25px;
        }

        .tagline {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: color-mix(in srgb, var(--primary-color) 12%, transparent);
            border: 1px solid color-mix(in srgb, var(--primary-color) 25%, transparent);
            color: var(--primary-color);
            padding: 6px 16px;
            border-radius: 50px;
            font-size: 13px;
            font-weight: 600;
            align-self: flex-start;
            text-transform: uppercase;
            letter-spacing: 1px;
            animation: pulse-slow 3s infinite;
        }

        .hero-content h1 {
            font-size: 56px;
            line-height: 1.15;
            letter-spacing: -1px;
            background: linear-gradient(135deg, var(--text-primary) 60%, var(--text-secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero-content p {
            font-size: 18px;
            color: var(--text-secondary);
            max-width: 580px;
        }

        .hero-ctas {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-top: 15px;
        }

        .btn-download {
            background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 80%, #000));
            color: #fff;
            padding: 12px 30px;
            border-radius: 40px;
            font-size: 16px;
            font-weight: 700;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 12px;
            border: none;
            cursor: pointer;
            box-shadow: 0 8px 30px color-mix(in srgb, var(--primary-color) 35%, transparent);
            transition: var(--transition-smooth);
        }

        .btn-download:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 12px 35px color-mix(in srgb, var(--primary-color) 50%, transparent);
        }

        .btn-container-wrapper {
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
        }

        .btn-version-label {
            font-size: 13px;
            color: var(--text-secondary);
            margin-left: 15px;
            font-weight: 500;
        }

        .apk-details {
            display: flex;
            flex-direction: column;
            gap: 4px;
            font-size: 13px;
            color: var(--text-secondary);
        }

        .apk-details strong {
            color: var(--text-primary);
        }

        /* Stats Badge */
        .download-stats {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border-color);
            padding: 10px 18px;
            border-radius: 12px;
            align-self: flex-start;
        }

        body.theme-light .download-stats {
            background: rgba(15, 23, 42, 0.03);
        }

        .stats-avatars {
            display: flex;
            margin-right: 5px;
        }

        .stats-avatars div {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid var(--bg-dark);
            background-color: #334155;
            margin-left: -8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: 700;
            color: #fff;
        }

        .stats-avatars div:first-child {
            margin-left: 0;
            background: #38bdf8;
        }
        .stats-avatars div:nth-child(2) {
            background: #ec4899;
        }
        .stats-avatars div:nth-child(3) {
            background: #10b981;
        }

        .stats-text {
            font-size: 13px;
            font-weight: 500;
            color: var(--text-secondary);
        }

        .stats-text strong {
            color: var(--text-primary);
        }

        /* Mobile Mockup styling */
        .hero-mockup {
            display: flex;
            justify-content: center;
            position: relative;
        }

        .phone-frame {
            width: 310px;
            height: 620px;
            background: #0f172a;
            border: 10px solid #1e293b;
            border-radius: 40px;
            box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.7), 0 0 40px color-mix(in srgb, var(--primary-color) 20%, transparent);
            padding: 10px;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            border-color: #334155;
        }

        body.theme-light .phone-frame {
            border-color: #cbd5e1;
            box-shadow: 0 25px 60px -10px rgba(15, 23, 42, 0.15), 0 0 30px color-mix(in srgb, var(--primary-color) 15%, transparent);
        }

        .phone-screen {
            flex: 1;
            background: #0a0f1d;
            border-radius: 30px;
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column;
            font-family: sans-serif;
        }

        /* App Mockup UI details */
        .phone-notch {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 110px;
            height: 20px;
            background: #334155;
            border-bottom-left-radius: 12px;
            border-bottom-right-radius: 12px;
            z-index: 100;
        }

        .mock-status-bar {
            height: 35px;
            padding: 8px 20px 0;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #64748b;
            z-index: 99;
        }

        .mock-app-header {
            padding: 10px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        
        .mock-logo {
            font-weight: 800;
            color: #fff;
            font-size: 14px;
        }

        .mock-map {
            margin: 10px 15px;
            height: 160px;
            background: #1e293b;
            border-radius: 16px;
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.05);
        }

        .mock-map-bg {
            position: absolute;
            inset: 0;
            opacity: 0.15;
            background-image: radial-gradient(circle, #fff 10%, transparent 11%), radial-gradient(circle, #fff 10%, transparent 11%);
            background-size: 20px 20px;
            background-position: 0 0, 10px 10px;
        }

        .mock-pin {
            position: absolute;
            top: 40%;
            left: 55%;
            width: 12px;
            height: 12px;
            background: var(--primary-color);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--primary-color);
            animation: pin-pulse 1.5s infinite;
        }

        .mock-pin-2 {
            position: absolute;
            top: 60%;
            left: 30%;
            width: 12px;
            height: 12px;
            background: #ec4899;
            border-radius: 50%;
            box-shadow: 0 0 10px #ec4899;
        }

        .mock-route {
            position: absolute;
            top: 45%;
            left: 35%;
            width: 60px;
            height: 2px;
            background: linear-gradient(90deg, #ec4899, var(--primary-color));
            transform: rotate(-30deg);
        }

        .mock-search {
            position: absolute;
            bottom: 8px;
            left: 8px;
            right: 8px;
            background: rgba(15, 23, 42, 0.9);
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 9px;
            color: #94a3b8;
            border: 1px solid rgba(255,255,255,0.08);
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .mock-dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            padding: 0 15px;
        }

        .mock-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 10px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .mock-card span:first-child {
            font-size: 8px;
            color: #64748b;
            text-transform: uppercase;
        }

        .mock-card span:last-child {
            font-size: 11px;
            font-weight: 700;
            color: #f1f5f9;
        }

        .mock-alert {
            margin: 12px 15px;
            background: linear-gradient(90deg, color-mix(in srgb, var(--primary-color) 20%, transparent), rgba(15,23,42,0.5));
            border-left: 3px solid var(--primary-color);
            padding: 10px;
            border-radius: 0 8px 8px 0;
            font-size: 9px;
        }

        .mock-nav-bar {
            margin-top: auto;
            height: 50px;
            border-top: 1px solid rgba(255,255,255,0.05);
            display: flex;
            justify-content: space-around;
            align-items: center;
            background: rgba(9, 13, 22, 0.95);
            padding: 0 10px;
        }

        .mock-nav-item {
            width: 15px;
            height: 15px;
            background: #475569;
            border-radius: 30%;
        }

        .mock-nav-item.active {
            background: var(--primary-color);
            box-shadow: 0 0 8px var(--primary-color);
        }

        /* Features Section */
        .features-section {
            padding: 100px 8%;
            position: relative;
            z-index: 10;
        }

        .section-header {
            text-align: center;
            max-width: 600px;
            margin: 0 auto 60px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .section-header h2 {
            font-size: 40px;
            letter-spacing: -0.5px;
        }

        .section-header p {
            color: var(--text-secondary);
            font-size: 16px;
        }

        .section-header-line {
            width: 60px;
            height: 4px;
            background-color: var(--primary-color);
            border-radius: 2px;
            margin: 5px auto 0;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
        }

        .feature-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            padding: 35px 30px;
            border-radius: 24px;
            backdrop-filter: blur(12px);
            display: flex;
            flex-direction: column;
            gap: 15px;
            transition: var(--transition-smooth);
        }

        .feature-card:hover {
            transform: translateY(-6px);
            border-color: color-mix(in srgb, var(--primary-color) 40%, transparent);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3), 0 0 20px color-mix(in srgb, var(--primary-color) 10%, transparent);
        }

        .feature-icon-wrapper {
            width: 55px;
            height: 55px;
            border-radius: 16px;
            background: color-mix(in srgb, var(--primary-color) 12%, transparent);
            border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary-color);
            transition: var(--transition-smooth);
        }

        .feature-card:hover .feature-icon-wrapper {
            background: var(--primary-color);
            color: #fff;
            transform: scale(1.05);
        }

        .feature-card h3 {
            font-size: 20px;
            font-weight: 700;
        }

        .feature-card p {
            color: var(--text-secondary);
            font-size: 14px;
            line-height: 1.5;
        }

        /* FAQ Section */
        .faq-section {
            padding: 80px 8% 120px;
            position: relative;
            z-index: 10;
        }

        .faq-container {
            max-width: 800px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .faq-item {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            overflow: hidden;
            transition: var(--transition-smooth);
        }

        .faq-question {
            padding: 24px 30px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 17px;
            font-weight: 600;
            user-select: none;
        }

        .faq-question:hover {
            color: var(--primary-color);
        }

        .faq-icon {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.03);
            transition: var(--transition-smooth);
        }

        .faq-item.active {
            border-color: color-mix(in srgb, var(--primary-color) 30%, transparent);
        }

        .faq-item.active .faq-icon {
            transform: rotate(45deg);
            background: var(--primary-color);
            color: #fff;
        }

        .faq-answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            color: var(--text-secondary);
            font-size: 15px;
            border-top: 0 solid transparent;
        }

        .faq-item.active .faq-answer {
            max-height: 200px;
            padding: 0 30px 24px;
            border-top: 1px solid var(--border-color);
        }

        /* Custom Dynamic Sections */
        .custom-section {
            padding: 80px 8%;
            position: relative;
            z-index: 10;
        }

        .custom-section-container {
            max-width: 900px;
            margin: 0 auto;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            padding: 50px 40px;
            border-radius: 24px;
            backdrop-filter: blur(12px);
            color: var(--text-secondary);
            font-size: 16px;
            line-height: 1.8;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }

        .custom-section-container p {
            margin-bottom: 15px;
        }
        .custom-section-container p:last-child {
            margin-bottom: 0;
        }

        .custom-section-container strong {
            color: var(--text-primary);
        }

        /* Team Section Styles */
        .team-section {
            padding: 80px 8%;
            position: relative;
            z-index: 10;
        }

        .team-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-top: 50px;
            transition: var(--transition-smooth);
        }

        .team-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 24px 18px;
            text-align: center;
            backdrop-filter: blur(12px);
            transition: var(--transition-smooth);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            box-shadow: 0 0 15px color-mix(in srgb, var(--primary-color) 8%, transparent);
        }

        .team-card:hover {
            transform: translateY(-8px);
            border-color: color-mix(in srgb, var(--primary-color) 40%, transparent);
            box-shadow: 0 0 30px color-mix(in srgb, var(--primary-color) 25%, transparent);
        }

        .team-photo-wrapper {
            width: 100%;
            height: 160px;
            border-radius: 10px 20px 10px 10px;
            overflow: hidden;
            border: 2px solid var(--border-color);
            margin-bottom: 5px;
            transition: var(--transition-smooth);
            cursor: pointer;
        }

        .team-card:hover .team-photo-wrapper {
            border-color: var(--primary-color);
            transform: scale(1.03);
        }

        .team-photo-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .team-name {
            font-size: 16px;
            font-weight: 700;
            color: var(--text-primary);
        }

        .team-role {
            font-size: 11px;
            font-weight: 700;
            color: var(--primary-color);
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-top: -5px;
        }

        .team-desc {
            font-size: 12.5px;
            color: var(--text-secondary);
            line-height: 1.5;
            margin-bottom: 5px;
            flex: 1;
        }

        .team-contacts {
            display: flex;
            flex-direction: column;
            gap: 6px;
            width: 100%;
            border-top: 1px solid var(--border-color);
            padding-top: 12px;
            font-size: 11.5px;
            align-items: center;
        }

        /* Responsive Team Grid Breakpoints */
        @media (max-width: 1200px) {
            .team-grid {
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
            }
        }

        @media (max-width: 900px) {
            .team-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
            }
        }

        @media (max-width: 600px) {
            .team-grid {
                grid-template-columns: 1fr;
                gap: 20px;
                max-width: 380px;
                margin-left: auto;
                margin-right: auto;
            }
        }

        .team-contacts a {
            color: var(--text-secondary);
            text-decoration: none;
            transition: var(--transition-smooth);
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .team-contacts a:hover {
            color: var(--primary-color);
        }

        .team-social-btn {
            margin-top: 5px;
            display: inline-block;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border-color);
            padding: 6px 16px;
            border-radius: 20px;
            color: var(--text-primary) !important;
            font-weight: 600;
            font-size: 12px;
            transition: var(--transition-smooth);
        }

        .team-social-btn:hover {
            background: var(--primary-color);
            border-color: var(--primary-color);
            color: #fff !important;
        }

        .team-social-row {
            display: flex;
            gap: 10px;
            margin-top: 15px;
            justify-content: center;
            flex-wrap: wrap;
            width: 100%;
        }

        .team-social-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            transition: var(--transition-smooth);
        }

        .team-social-icon:hover {
            background: var(--primary-color);
            border-color: var(--primary-color);
            color: #fff;
            transform: translateY(-3px) scale(1.08);
            box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-color) 30%, transparent);
        }

        .team-social-icon svg {
            width: 18px;
            height: 18px;
            fill: currentColor;
        }

        .team-custom-links {
            display: flex;
            gap: 8px;
            margin-top: 12px;
            justify-content: center;
            flex-wrap: wrap;
            width: 100%;
            border-top: 1px dashed var(--border-color);
            padding-top: 12px;
        }

        .team-custom-chip {
            font-size: 11px;
            font-weight: 600;
            padding: 5px 12px;
            border-radius: 20px;
            background: rgba(255,255,255,0.02);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            text-decoration: none;
            transition: var(--transition-smooth);
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .team-custom-chip:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
            background: rgba(255,255,255,0.05);
            transform: translateY(-1px);
        }

        /* Image Lightbox Modal Styles */
        .image-modal-overlay {
            display: none;
            position: fixed;
            z-index: 10005;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(7, 10, 19, 0.95);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            align-items: center;
            justify-content: center;
            flex-direction: column;
            padding: 20px;
        }

        .image-modal-content {
            max-width: 90%;
            max-height: 80%;
            border-radius: 16px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
            border: 1px solid var(--border-color);
            transform: scale(0.9);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .image-modal-overlay.open .image-modal-content {
            transform: scale(1);
            opacity: 1;
        }

        .image-modal-caption {
            margin-top: 20px;
            color: #fff;
            font-size: 16px;
            font-weight: 700;
            font-family: 'Outfit', sans-serif;
            text-align: center;
        }

        .image-modal-close {
            position: absolute;
            top: 25px;
            right: 30px;
            color: var(--text-secondary);
            font-size: 35px;
            font-weight: 700;
            cursor: pointer;
            transition: var(--transition-smooth);
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border-color);
            border-radius: 50%;
        }

        .image-modal-close:hover {
            color: #fff;
            background: var(--primary-color);
            border-color: var(--primary-color);
            transform: scale(1.05);
        }

        /* Footer */
        footer {
            background-color: #05080e;
            border-top: 1px solid var(--border-color);
            padding: 60px 8% 30px;
            position: relative;
            z-index: 10;
        }

        body.theme-light footer {
            background-color: #e2e8f0;
        }

        .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 30px;
            margin-bottom: 40px;
        }

        .footer-logo {
            text-decoration: none;
            font-size: 22px;
            font-weight: 800;
            color: #fff;
        }

        body.theme-light .footer-logo {
            color: #0f172a;
        }
        
        .footer-logo span {
            color: var(--primary-color);
        }

        .footer-links {
            display: flex;
            gap: 30px;
        }

        .footer-links a {
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 14px;
            transition: var(--transition-smooth);
        }

        .footer-links a:hover {
            color: var(--primary-color);
        }

        .footer-copyright {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 30px;
            color: #475569;
            font-size: 13px;
        }

        body.theme-light .footer-copyright {
            border-top-color: rgba(15, 23, 42, 0.05);
        }

        .cms-link {
            color: #475569;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: var(--transition-smooth);
        }

        .cms-link:hover {
            color: var(--primary-color);
        }

        /* Animations */
        @keyframes pulse-slow {
            0%, 100% { opacity: 0.9; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.02); }
        }

        @keyframes pin-pulse {
            0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(9, 165, 219, 0.5); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(9, 165, 219, 0); }
            100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(9, 165, 219, 0); }
        }

        /* Responsive */
        @media (max-width: 968px) {
            .hero {
                grid-template-columns: 1fr;
                padding: 130px 20px 60px;
                text-align: center;
                gap: 50px;
            }

            @media (max-width: 350px) {
                .phone-frame {
                    width: 275px;
                    height: 550px;
                }
            }

            .tagline {
                align-self: center;
            }

            .hero-content h1 {
                font-size: 42px;
            }

            .hero-content p {
                margin: 0 auto;
            }

            .hero-ctas {
                justify-content: center;
                flex-wrap: wrap;
            }

            .btn-container-wrapper {
                align-items: center;
            }

            .btn-version-label {
                margin-left: 0;
            }

            .download-stats {
                align-self: center;
            }

            header {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                z-index: 9999;
                padding: 15px 5%;
                background: rgba(9, 13, 22, 0.92);
                border-bottom: 1px solid var(--border-color);
            }

            body.theme-light header {
                background: rgba(245, 247, 251, 0.95);
            }

            nav {
                display: none; /* simple hidden nav for mobile */
            }

            .header-download-btn .btn-text {
                display: none;
            }

            .header-download-btn {
                padding: 0;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
        }

        /* Blog Section styling */
        .blog-section {
            padding: 80px 10%;
            position: relative;
            background: rgba(9, 13, 22, 0.4);
            border-bottom: 1px solid var(--border-color);
        }

        /* Gallery Section styling */
        .gallery-section {
            padding: 80px 10%;
            position: relative;
            background: rgba(7, 10, 19, 0.2);
            border-bottom: 1px solid var(--border-color);
        }
        
        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
            margin-top: 50px;
        }

        .gallery-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            overflow: hidden;
            transition: var(--transition-smooth);
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            text-decoration: none;
        }

        .gallery-card:hover {
            transform: translateY(-6px);
            border-color: rgba(9, 165, 219, 0.3);
            box-shadow: 0 10px 25px rgba(9, 165, 219, 0.1);
        }
        
        .blog-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
            margin-top: 50px;
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
        }
        
        .blog-card:hover {
            transform: translateY(-8px);
            border-color: rgba(9, 165, 219, 0.4);
            box-shadow: 0 12px 30px rgba(9, 165, 219, 0.15);
        }
        
        .blog-card-image-wrapper {
            position: relative;
            height: 200px;
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
            width: 48px;
            height: 48px;
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
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
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
            text-decoration: none;
            transition: var(--transition-smooth);
            width: fit-content;
        }
        
        .blog-card-link svg {
            transition: var(--transition-smooth);
        }
        
        .blog-card-link:hover {
            color: #fff;
        }
        
        .blog-card-link:hover svg {
            transform: translateX(4px);
        }

        /* Light theme support */
        body.theme-light .blog-section {
            background: rgba(241, 245, 249, 0.6);
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
    </style>
    
    <!-- Inline JS to prevent FOUC (Flash of Unstyled Content) on Light Theme settings -->
    <script>
        (function() {
            const savedTheme = localStorage.getItem('kiu-explorer-theme') || '{{ $settings->theme_mode }}';
            if (savedTheme === 'light') {
                document.documentElement.classList.add('theme-light');
                document.write('<style>body{background-color:#f5f7fb;color:#0f172a;}<\/style>');
            }
        })();
    </script>
</head>
<body class="theme-{{ $settings->theme_mode }}">
    <div class="glow-sphere glow-1"></div>
    <div class="glow-sphere glow-2"></div>

    <!-- Header Navigation -->
    <header>
        <a href="#" class="logo">
            <div class="logo-dot"></div>
            <span>{{ $settings->app_name }}</span>
        </a>
        <nav>
            @if($settings->show_features) <a href="#features">Features</a> @endif
            <a href="{{ route('blog.index') }}">Blog</a>
            <a href="{{ route('gallery.index') }}">Gallery</a>
            @if($settings->show_faqs) <a href="#faq">FAQ</a> @endif
            <a href="{{ route('cms.login') }}">Admin CMS</a>
        </nav>
        
        <div class="nav-actions">
            <!-- Theme Toggle Icon Button -->
            <button id="theme-toggle" class="nav-btn" style="padding: 10px; border-radius: 50%; width: 40px; height: 40px; display: inline-flex; justify-content: center; align-items: center; cursor: pointer; outline: none;" title="Toggle Light/Dark Theme">
                <!-- Sun Icon -->
                <svg id="theme-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                <!-- Moon Icon -->
                <svg id="theme-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </button>

            <a href="{{ route('download.track') }}" class="nav-btn header-download-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span class="btn-text">Download App</span>
            </a>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <div class="tagline">
                <span class="logo-dot" style="background:#10b981; box-shadow: 0 0 8px #10b981;"></span>
                CAMPUS PORTAL ACTIVE
            </div>
            <h1>{{ $settings->hero_title }}</h1>
            <p>{{ $settings->hero_subtitle }}</p>
            
            <div class="hero-ctas">
                <div class="btn-container-wrapper">
                    <a href="{{ route('download.track') }}" class="btn-download">
                        <!-- Custom Android SVG Icon -->
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.5 12c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5M6.5 12c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5M12 21.5c-4.14 0-7.5-3.36-7.5-7.5H19.5c0 4.14-3.36 7.5-7.5 7.5M12 4.2c2.81 0 5.17 1.7 6.16 4.1H5.84c.99-2.4 3.35-4.1 6.16-4.1M12 2C6.48 2 2 6.48 2 12c0 4.14 2.53 7.69 6.16 9.17l-1.4 3.03c-.15.33.01.72.34.87.33.15.72-.01.87-.34l1.45-3.13c.84.22 1.71.37 2.62.4v3.13c0 .33.27.6.6.6s.6-.27.6-.6v-3.13c.91-.03 1.78-.18 2.62-.4l1.45 3.13c.15.33.54.49.87.34.33-.15.49-.54.34-.87l-1.4-3.03C19.47 19.69 22 16.14 22 12c0-5.52-4.48-10-10-10z"/>
                        </svg>
                        <span>Download APK</span>
                    </a>
                    <span class="btn-version-label">
                        v{{ $settings->apk_version }} • {{ $settings->apk_size }}
                    </span>
                </div>
                
                <div class="apk-details">
                    <span>File: <strong>kiu-explorer-latest.apk</strong></span>
                    <span>Min SDK: <strong>Android 8.0+ (Oreo)</strong></span>
                </div>
            </div>

            <!-- Social Proof Statistics -->
            @if($settings->show_stats)
                <div class="download-stats">
                    <div class="stats-avatars">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div>+{{ $settings->download_count }}</div>
                    </div>
                    <div class="stats-text">
                        Joined by <strong>{{ $settings->download_count + 120 }} students</strong>. Quick offline installer.
                    </div>
                </div>
            @endif
        </div>

        <!-- Phone Mockup Container -->
        <div class="hero-mockup">
            <div class="phone-frame">
                <div class="phone-notch"></div>
                <div class="phone-screen">
                    @if(!empty($settings->hero_video_path))
                        <!-- CMS Uploaded mockup video -->
                        <video src="{{ asset('storage/' . $settings->hero_video_path) }}" autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover; display:block; border:none;"></video>
                    @elseif(!empty($settings->hero_image_path))
                        <!-- CMS Uploaded mockup image -->
                        <img src="{{ asset('storage/' . $settings->hero_image_path) }}" alt="App Mockup screen" style="width:100%; height:100%; object-fit:cover;">
                    @else
                        <!-- Default Custom CSS UI layout -->
                        <div class="mock-status-bar">
                            <span>14:02</span>
                            <div style="display:flex; gap: 4px;">
                                <span>📶</span>
                                <span>🔋</span>
                            </div>
                        </div>
                        <div class="mock-app-header">
                            <span class="mock-logo">KIU Explorer</span>
                            <span style="font-size:12px; color:var(--primary-color);">● Live</span>
                        </div>
                        
                        <div class="mock-map">
                            <div class="mock-map-bg"></div>
                            <div class="mock-route"></div>
                            <div class="mock-pin"></div>
                            <div class="mock-pin-2"></div>
                            <div class="mock-search">
                                <span>🔍</span> Search campus classroom, hostel, lab...
                            </div>
                        </div>

                        <div class="mock-dashboard-grid">
                            <div class="mock-card">
                                <span>TIMETABLE</span>
                                <span>CS 302 @ 15:00</span>
                            </div>
                            <div class="mock-card">
                                <span>GPA PLANNER</span>
                                <span>Target: 4.85 GPA</span>
                            </div>
                            <div class="mock-card">
                                <span>BOOKED ROOM</span>
                                <span>Hostel Bed #3</span>
                            </div>
                            <div class="mock-card" style="border-color:rgba(16,185,129,0.3)">
                                <span>FEES PAID</span>
                                <span>₦125,000.00</span>
                            </div>
                        </div>

                        <div class="mock-alert">
                            📢 <span style="font-weight:700; color:#fff;">Update:</span> Mid-semester exams starts July 12. Check timetable.
                        </div>

                        <div class="mock-nav-bar">
                            <div class="mock-nav-item active"></div>
                            <div class="mock-nav-item"></div>
                            <div class="mock-nav-item"></div>
                            <div class="mock-nav-item"></div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    @if($settings->show_features)
        <section id="features" class="features-section">
            <div class="section-header">
                <h2>Core Capabilities</h2>
                <p>Designed with features to simplify, enhance, and structure your student experience at KIU.</p>
                <div class="section-header-line"></div>
            </div>

            <div class="features-grid">
                @if(!empty($settings->features))
                    @foreach($settings->features as $feature)
                        <div class="feature-card">
                            <div class="feature-icon-wrapper">
                                @if(($feature['icon'] ?? 'map') === 'map')
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                                @elseif(($feature['icon'] ?? 'map') === 'book')
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                                @elseif(($feature['icon'] ?? 'map') === 'home')
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                @elseif(($feature['icon'] ?? 'map') === 'chat')
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                @elseif(($feature['icon'] ?? 'map') === 'calendar')
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                @elseif(($feature['icon'] ?? 'map') === 'bell')
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                @elseif(($feature['icon'] ?? 'map') === 'users')
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                @elseif(($feature['icon'] ?? 'map') === 'lock')
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                @elseif(($feature['icon'] ?? 'map') === 'compass')
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                                @elseif(($feature['icon'] ?? 'map') === 'settings')
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                @elseif(($feature['icon'] ?? 'map') === 'award')
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                @elseif(($feature['icon'] ?? 'map') === 'info')
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                @elseif(($feature['icon'] ?? 'map') === 'briefcase')
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                                @elseif(($feature['icon'] ?? 'map') === 'graduation')
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
                                @else
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                @endif
                            </div>
                            <h3>{{ $feature['title'] }}</h3>
                            <p>{{ $feature['description'] }}</p>
                        </div>
                    @endforeach
                @endif
            </div>
        </section>
    @endif

    <!-- FAQ Accordion Section -->
    @if($settings->show_faqs)
        <section id="faq" class="faq-section">
            <div class="section-header">
                <h2>Common Questions</h2>
                <p>Everything you need to know about setting up and operating KIU Explorer.</p>
                <div class="section-header-line"></div>
            </div>

            <div class="faq-container">
                @if(!empty($settings->faqs))
                    @foreach($settings->faqs as $index => $faq)
                        <div class="faq-item">
                            <div class="faq-question">
                                <span>{{ $faq['question'] }}</span>
                                <div class="faq-icon">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                </div>
                            </div>
                            <div class="faq-answer">
                                <p>{{ $faq['answer'] }}</p>
                            </div>
                        </div>
                    @endforeach
                @endif
            </div>
        </section>
    @endif

    <!-- Team Section -->
    @if(($settings->show_team ?? true) && !empty($settings->team))
        <section id="team" class="team-section">
            <div class="section-header">
                <h2>Our Development Team</h2>
                <p>The contributors and architects of the KIU Explorer project.</p>
                <div class="section-header-line"></div>
            </div>

            <div class="team-grid">
                @foreach($settings->team as $member)
                    <div class="team-card">
                        @php
                            $photoUrl = !empty($member['photo_path']) ? asset('storage/' . $member['photo_path']) : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400';
                        @endphp
                        <div class="team-photo-wrapper" onclick="openImageModal('{{ $photoUrl }}', '{{ addslashes($member['name']) }}', '{{ addslashes($member['role'] ?? '') }}')">
                            <img src="{{ $photoUrl }}" alt="{{ $member['name'] }}">
                        </div>
                        <h3 class="team-name">{{ $member['name'] }}</h3>
                        <span class="team-role">{{ $member['role'] }}</span>
                        <p class="team-desc">{{ $member['description'] }}</p>
                        
                        <div class="team-contacts">
                            @if(!empty($member['email']))
                                <a href="mailto:{{ $member['email'] }}">✉ {{ $member['email'] }}</a>
                            @endif
                            @if(!empty($member['phone']))
                                <a href="tel:{{ $member['phone'] }}">📞 {{ $member['phone'] }}</a>
                            @endif
                            
                            <!-- Structured Social Profiles -->
                            @if(!empty($member['socials']))
                                <div class="team-social-row">
                                    @if(!empty($member['socials']['facebook']))
                                        <a href="{{ $member['socials']['facebook'] }}" target="_blank" class="team-social-icon" title="Facebook">
                                            <svg viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>
                                        </a>
                                    @endif
                                    @if(!empty($member['socials']['linkedin']))
                                        <a href="{{ $member['socials']['linkedin'] }}" target="_blank" class="team-social-icon" title="LinkedIn">
                                            <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                        </a>
                                    @endif
                                    @if(!empty($member['socials']['x']))
                                        <a href="{{ $member['socials']['x'] }}" target="_blank" class="team-social-icon" title="X (Twitter)">
                                            <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                        </a>
                                    @endif
                                    @if(!empty($member['socials']['github']))
                                        <a href="{{ $member['socials']['github'] }}" target="_blank" class="team-social-icon" title="GitHub">
                                            <svg viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                        </a>
                                    @endif
                                    @if(!empty($member['socials']['instagram']))
                                        <a href="{{ $member['socials']['instagram'] }}" target="_blank" class="team-social-icon" title="Instagram">
                                            <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                                        </a>
                                    @endif
                                    @if(!empty($member['socials']['portfolio']))
                                        <a href="{{ $member['socials']['portfolio'] }}" target="_blank" class="team-social-icon" title="Portfolio / Website">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                        </a>
                                    @endif
                                </div>
                            @endif

                            @if(!empty($member['social_media']) && empty($member['socials']))
                                <a href="{{ $member['social_media'] }}" target="_blank" class="team-social-btn">View Profile</a>
                            @endif

                            <!-- Custom profiles/academic links -->
                            @if(!empty($member['custom_links']))
                                <div class="team-custom-links">
                                    @foreach($member['custom_links'] as $cLink)
                                        <a href="{{ $cLink['url'] }}" target="_blank" class="team-custom-chip">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                            {{ $cLink['label'] }}
                                        </a>
                                    @endforeach
                                </div>
                            @endif
                        </div>
                    </div>
                @endforeach
            </div>
        </section>
    @endif

    <!-- Blog Teaser Section -->
    @if(!empty($blogPosts) && $blogPosts->isNotEmpty())
        <section id="blog" class="blog-section">
            <div class="section-header">
                <h2>Campus Insights & News</h2>
                <p class="section-subtitle" style="text-align: center; color: var(--text-secondary); max-width: 600px; margin: 10px auto 0 auto; font-size: 15px; line-height: 1.6;">Stay updated with the latest campus announcements, student life tips, and guides from the KIU Explorer team.</p>
                <div class="section-header-line" style="margin-top: 20px;"></div>
            </div>
            
            <div class="blog-grid">
                @foreach($blogPosts as $post)
                    <article class="blog-card">
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
                                <div style="position: absolute; top: 15px; right: 15px; background: rgba(15,23,42,0.7); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff;">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                </div>
                            @endif
                        </div>
                        <div class="blog-card-content">
                            <div class="blog-card-meta">
                                <span class="blog-card-date">{{ $post->published_at ? $post->published_at->format('M d, Y') : $post->created_at->format('M d, Y') }}</span>
                                <span class="blog-card-views">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 2px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    {{ number_format($post->views) }} views
                                </span>
                            </div>
                            <h3 class="blog-card-title">{{ $post->title }}</h3>
                            <p class="blog-card-summary">{{ Str::limit($post->summary ?: strip_tags($post->content), 120) }}</p>
                            <a href="{{ route('blog.show', $post->slug) }}" class="blog-card-link">
                                <span>Read Full Article</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </a>
                        </div>
                    </article>
                @endforeach
            </div>

            <!-- View All Blog button -->
            <div style="text-align: center; margin-top: 40px;">
                <a href="{{ route('blog.index') }}" class="nav-btn" style="border-color: var(--primary-color); color: var(--primary-color); padding: 12px 30px; font-size: 15px; font-weight: 700;">
                    <span>View All Blog Articles</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="margin-left: 6px; vertical-align: middle;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
            </div>
        </section>
    @endif

    <!-- Gallery Highlights Teaser Section -->
    @if(!empty($galleryItems) && $galleryItems->isNotEmpty())
        <section id="gallery" class="gallery-section">
            <div class="section-header">
                <h2>Campus Life Gallery</h2>
                <p class="section-subtitle" style="text-align: center; color: var(--text-secondary); max-width: 600px; margin: 10px auto 0 auto; font-size: 15px; line-height: 1.6;">Explore a sneak peek of our campus highlights, graduations, study labs, and events.</p>
                <div class="section-header-line" style="margin-top: 20px;"></div>
            </div>

            <div class="gallery-grid">
                @foreach($galleryItems as $item)
                    <a href="{{ route('gallery.index') }}" class="gallery-card">
                        <div style="position: relative; height: 210px; overflow: hidden; background: #0f172a;">
                            <span style="position: absolute; top: 15px; left: 15px; background: rgba(15,23,42,0.7); color: #fff; padding: 4px 10px; border-radius: 30px; font-size: 9px; font-weight: 700; text-transform: uppercase; z-index: 2; border: 1px solid rgba(255,255,255,0.1);">{{ $item->type }}</span>
                            @if($item->type === 'image')
                                <img src="{{ asset('storage/' . $item->media_path) }}" alt="{{ $item->title }}" style="width: 100%; height: 100%; object-fit: cover; transition: var(--transition-smooth);">
                            @else
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(9, 165, 219, 0.85); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.25); z-index: 3;">
                                    <span style="font-size: 10px; margin-left: 2px;">▶</span>
                                </div>
                                <video style="width: 100%; height: 100%; object-fit: cover; border: none; outline: none;" autoplay muted loop playsinline poster="{{ $item->thumbnail_path ? asset('storage/' . $item->thumbnail_path) : '' }}">
                                    <source src="{{ asset('storage/' . $item->media_path) }}" type="video/mp4">
                                </video>
                            @endif
                        </div>
                        <div style="padding: 16px 20px;">
                            <h3 style="font-size: 15px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;">{{ $item->title }}</h3>
                            <p style="font-size: 12.5px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ $item->description ?: 'Campus highlight' }}</p>
                        </div>
                    </a>
                @endforeach
            </div>

            <!-- View Full Gallery button -->
            <div style="text-align: center; margin-top: 40px;">
                <a href="{{ route('gallery.index') }}" class="nav-btn" style="border-color: var(--primary-color); color: var(--primary-color); padding: 12px 30px; font-size: 15px; font-weight: 700;">
                    <span>Explore Full Campus Gallery</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="margin-left: 6px; vertical-align: middle;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
            </div>
        </section>
    @endif

    <!-- Render Custom Sections dynamically -->
    @if(!empty($settings->custom_sections))
        @foreach($settings->custom_sections as $index => $section)
            <section class="custom-section" id="section-custom-{{ $index }}">
                <div class="section-header">
                    <h2>{{ $section['title'] }}</h2>
                    <div class="section-header-line"></div>
                </div>
                <div class="custom-section-container">
                    {!! $section['content'] !!}
                </div>
            </section>
        @endforeach
    @endif

    <!-- Footer -->
    <footer>
        <div class="footer-content">
            <a href="#" class="footer-logo">
                KIU<span>Explorer</span>
            </a>
            <div class="footer-links">
                @if($settings->show_features) <a href="#features">Features</a> @endif
                <a href="{{ route('blog.index') }}">Blog</a>
                <a href="{{ route('gallery.index') }}">Gallery</a>
                @if(($settings->show_team ?? true) && !empty($settings->team)) <a href="#team">Team</a> @endif
                @if($settings->show_faqs) <a href="#faq">FAQ</a> @endif
                <a href="{{ route('cms.login') }}">Admin Panel</a>
            </div>
        </div>
        <div class="footer-copyright">
            <span>© 2026 {{ $settings->app_name }}. All rights reserved. Serviced for KIU Campus.</span>
            <a href="{{ route('cms.login') }}" class="cms-link">
                <!-- Lock Icon -->
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                CMS Management Portal
            </a>
        </div>
    </footer>

    <!-- Interactive FAQ Accordion & Theme Switcher JS -->
    <script>
        // FAQ Accordion
        document.querySelectorAll('.faq-question').forEach(item => {
            item.addEventListener('click', () => {
                const parent = item.parentElement;
                if (parent.classList.contains('active')) {
                    parent.classList.remove('active');
                } else {
                    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
                    parent.classList.add('active');
                }
            });
        });

        // Theme Switcher Logic
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
                // Switch to dark
                document.body.className = 'theme-dark';
                htmlElement.classList.remove('theme-light');
                themeSun.style.display = 'none';
                themeMoon.style.display = 'block';
                localStorage.setItem('kiu-explorer-theme', 'dark');
            } else {
                // Switch to light
                document.body.className = 'theme-light';
                htmlElement.classList.add('theme-light');
                themeSun.style.display = 'block';
                themeMoon.style.display = 'none';
                localStorage.setItem('kiu-explorer-theme', 'light');
            }
        });

        // Run initialization
        initTheme();

        // Image Lightbox Modal handlers
        function openImageModal(imgSrc, name, role) {
            const overlay = document.getElementById('image-modal');
            const modalImg = document.getElementById('modal-img-target');
            const caption = document.getElementById('image-modal-caption');
            
            overlay.style.display = "flex";
            setTimeout(() => {
                overlay.classList.add('open');
            }, 10);
            
            modalImg.src = imgSrc;
            caption.innerHTML = `${name} <span style="opacity:0.6; font-weight:normal; font-size:14px; margin-left:8px;">| ${role}</span>`;
        }

        function closeImageModal() {
            const overlay = document.getElementById('image-modal');
            overlay.classList.remove('open');
            setTimeout(() => {
                overlay.style.display = "none";
            }, 300);
        }
    </script>

    <!-- Lightbox Modal container -->
    <div id="image-modal" class="image-modal-overlay" onclick="closeImageModal()">
        <span class="image-modal-close" onclick="closeImageModal()">&times;</span>
        <img class="image-modal-content" id="modal-img-target" onclick="event.stopPropagation()">
        <div id="image-modal-caption" class="image-modal-caption" onclick="event.stopPropagation()"></div>
    </div>
</body>
</html>
