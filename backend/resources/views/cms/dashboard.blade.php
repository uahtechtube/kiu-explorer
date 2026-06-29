<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CMS Dashboard - {{ $settings->app_name }}</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Chart.js CDN for visual analytics -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        :root {
            --primary-color: {{ $settings->primary_color }};
            --secondary-color: {{ $settings->secondary_color }};
            --bg-dark: #070a13;
            --bg-card: rgba(16, 22, 38, 0.7);
            --border-color: rgba(255, 255, 255, 0.08);
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent-green: #10b981;
            --accent-blue: #3b82f6;
            --accent-purple: #8b5cf6;
            --accent-orange: #f59e0b;
            --transition-smooth: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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
            min-height: 100vh;
            display: flex;
        }

        /* Sidebar Navigation */
        .cms-sidebar {
            width: 280px;
            background: rgba(11, 17, 32, 0.95);
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            padding: 30px 20px;
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 100;
            transition: var(--transition-smooth);
        }

        .sidebar-brand {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-family: 'Outfit', sans-serif;
            font-size: 22px;
            font-weight: 800;
            color: #fff;
            text-decoration: none;
            margin-bottom: 40px;
            padding-left: 10px;
        }

        .brand-logo-text {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .sidebar-brand span {
            color: var(--primary-color);
        }

        .logo-dot {
            width: 8px;
            height: 8px;
            background-color: var(--primary-color);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--primary-color);
        }

        .btn-sidebar-close {
            display: none;
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 4px;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
        }

        .btn-sidebar-close:hover {
            background: rgba(255,255,255,0.05);
            color: #fff;
        }

        .sidebar-menu {
            display: flex;
            flex-direction: column;
            gap: 8px;
            list-style: none;
        }

        .menu-item button {
            width: 100%;
            background: transparent;
            border: 1px solid transparent;
            padding: 12px 16px;
            border-radius: 12px;
            color: var(--text-secondary);
            font-size: 14.5px;
            font-weight: 600;
            text-align: left;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
            transition: var(--transition-smooth);
        }

        .menu-item button:hover {
            background: rgba(255, 255, 255, 0.03);
            color: #fff;
        }

        .menu-item.active button {
            background: color-mix(in srgb, var(--primary-color) 12%, transparent);
            border-color: color-mix(in srgb, var(--primary-color) 20%, transparent);
            color: var(--primary-color);
        }

        .menu-item.active button svg {
            color: var(--primary-color);
            filter: drop-shadow(0 0 4px var(--primary-color));
        }

        .sidebar-footer {
            margin-top: auto;
            display: flex;
            flex-direction: column;
            gap: 15px;
            border-top: 1px solid var(--border-color);
            padding-top: 20px;
        }

        .user-profile {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 10px;
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--primary-color);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: #fff;
            font-size: 14px;
        }

        .user-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            overflow: hidden;
        }

        .user-name {
            font-size: 13.5px;
            font-weight: 700;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .user-role {
            font-size: 11px;
            color: var(--text-secondary);
        }

        .btn-logout {
            width: 100%;
            background: transparent;
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #f87171;
            padding: 10px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition-smooth);
            text-align: center;
        }

        .btn-logout:hover {
            background: #ef4444;
            color: #fff;
            border-color: #ef4444;
        }

        /* Content Layout */
        .cms-content {
            margin-left: 280px;
            flex: 1;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            transition: var(--transition-smooth);
        }

        /* Top Header Action */
        .content-header {
            padding: 24px 5%;
            background: rgba(16, 22, 38, 0.95);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 99;
            backdrop-filter: blur(12px);
        }

        .header-title-wrapper {
            display: flex;
            align-items: center;
        }

        .btn-sidebar-toggle {
            display: none;
            background: transparent;
            border: none;
            color: var(--text-primary);
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            margin-right: 15px;
            align-items: center;
            justify-content: center;
            transition: var(--transition-smooth);
            border: 1px solid var(--border-color);
        }

        .btn-sidebar-toggle:hover {
            background: rgba(255,255,255,0.04);
            border-color: var(--primary-color);
        }

        .header-title h2 {
            font-size: 22px;
            font-weight: 700;
            color: #fff;
        }

        .header-title p {
            font-size: 13.5px;
            color: var(--text-secondary);
            margin-top: 4px;
        }

        /* Main Scrollable Panel */
        .content-body {
            padding: 40px 5%;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 30px;
        }

        /* Tabs Panels */
        .tab-panel {
            display: none;
            animation: fade-in-tab 0.3s ease;
        }

        .tab-panel.active {
            display: flex;
            flex-direction: column;
            gap: 30px;
        }

        @keyframes fade-in-tab {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 24px;
        }

        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .stat-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background-color: var(--primary-color);
        }

        .stat-card.blue::after { background-color: var(--accent-blue); }
        .stat-card.green::after { background-color: var(--accent-green); }
        .stat-card.purple::after { background-color: var(--accent-purple); }
        .stat-card.orange::after { background-color: var(--accent-orange); }

        .stat-label {
            font-size: 11.5px;
            font-weight: 700;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-value {
            font-family: 'Outfit', sans-serif;
            font-size: 32px;
            font-weight: 700;
            color: #fff;
        }

        .stat-desc {
            font-size: 12.5px;
            color: var(--text-secondary);
            line-height: 1.4;
        }

        /* Spacing layout - Added space margin requested between cards */
        .section-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 24px;
            padding: 35px;
            display: flex;
            flex-direction: column;
            gap: 25px;
            margin-bottom: 35px; /* Margin space between cards */
        }

        .section-title {
            font-size: 19px;
            font-weight: 700;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 12px;
            color: #fff;
        }

        /* Form elements */
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .form-group.full-width {
            grid-column: 1 / span 2;
        }

        label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        input[type="text"], input[type="email"], input[type="password"], select, textarea {
            width: 100%;
            padding: 12px 18px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            color: var(--text-primary);
            font-size: 14.5px;
            outline: none;
            transition: var(--transition-smooth);
        }

        input:focus, select:focus, textarea:focus {
            border-color: var(--primary-color);
            background: rgba(255, 255, 255, 0.06);
            box-shadow: 0 0 10px color-mix(in srgb, var(--primary-color) 15%, transparent);
        }

        /* Legibility fix for dropdown options font */
        select option {
            color: #070a13 !important;
            background-color: #ffffff !important;
            font-weight: 500;
        }

        /* Table formatting */
        .table-wrapper {
            width: 100%;
            overflow-x: auto;
            border: 1px solid var(--border-color);
            border-radius: 16px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 14px;
        }

        th {
            background: rgba(255, 255, 255, 0.02);
            padding: 16px 20px;
            color: var(--text-secondary);
            font-weight: 600;
            border-bottom: 1px solid var(--border-color);
            text-transform: uppercase;
            font-size: 11.5px;
            letter-spacing: 0.5px;
        }

        td {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border-color);
            color: var(--text-primary);
        }

        tr:last-child td {
            border-bottom: none;
        }

        tr:hover td {
            background: rgba(255, 255, 255, 0.01);
        }

        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11.5px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .badge.active { background: rgba(16, 185, 129, 0.12); color: var(--accent-green); }
        .badge.blocked { background: rgba(239, 68, 68, 0.12); color: #f87171; }
        .badge.student { background: rgba(59, 130, 246, 0.12); color: var(--accent-blue); }
        .badge.lecturer { background: rgba(139, 92, 246, 0.12); color: var(--accent-purple); }
        .badge.admin { background: rgba(245, 158, 11, 0.12); color: var(--accent-orange); }

        /* File Upload */
        .file-upload-wrapper {
            border: 2px dashed var(--border-color);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            background: rgba(255,255,255,0.01);
            transition: var(--transition-smooth);
            cursor: pointer;
            position: relative;
        }

        .file-upload-wrapper:hover {
            border-color: var(--primary-color);
            background: rgba(255,255,255,0.03);
        }

        .file-upload-wrapper input[type="file"] {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
        }

        .file-upload-text {
            color: var(--text-secondary);
            font-size: 13.5px;
        }

        /* Dynamic Item Card */
        .cms-item-card {
            background: rgba(255,255,255,0.02);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            position: relative;
        }

        .cms-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 1px solid rgba(255,255,255,0.04);
            padding-bottom: 8px;
        }

        .cms-card-header h4 {
            font-size: 14.5px;
            font-weight: 600;
            color: var(--primary-color);
        }

        .btn-remove {
            background: transparent;
            border: none;
            color: #ef4444;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: var(--transition-smooth);
        }

        .btn-remove:hover {
            background: rgba(239, 68, 68, 0.1);
        }

        .btn-add {
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition-smooth);
            align-self: flex-start;
            margin-top: 10px;
        }

        .btn-add:hover {
            background: rgba(255,255,255,0.08);
            border-color: var(--primary-color);
        }

        /* Save Button styling */
        .btn-save {
            background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 80%, #000));
            color: #fff;
            padding: 12px 28px;
            border-radius: 10px;
            font-size: 14.5px;
            font-weight: 700;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 15px color-mix(in srgb, var(--primary-color) 25%, transparent);
            transition: var(--transition-smooth);
        }

        .btn-save:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px color-mix(in srgb, var(--primary-color) 40%, transparent);
        }

        /* Toast notification */
        .alert-toast {
            background: var(--accent-green);
            color: #fff;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 14.5px;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slide-in-toast 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slide-in-toast {
            from { transform: translateY(100px) scale(0.9); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }

        /* Mobile Screens Styling */
        @media (max-width: 968px) {
            .btn-sidebar-toggle {
                display: flex;
            }
            .btn-sidebar-close {
                display: flex;
            }
            .cms-sidebar {
                left: -280px;
                width: 280px;
                box-shadow: 5px 0 25px rgba(0,0,0,0.5);
            }
            .cms-sidebar.open {
                left: 0;
            }
            .cms-content {
                margin-left: 0;
            }
            .form-grid {
                grid-template-columns: 1fr;
            }
            .form-group.full-width {
                grid-column: span 1;
            }
        }

        /* Modal Overlay and Container */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(7, 10, 19, 0.85);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .modal-overlay.open {
            opacity: 1;
            pointer-events: auto;
        }
        .modal-container {
            background: #101626;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            width: 90%;
            max-width: 750px;
            max-height: 85vh;
            overflow-y: auto;
            padding: 32px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            transform: translateY(20px) scale(0.95);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .modal-overlay.open .modal-container {
            transform: translateY(0) scale(1);
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding-bottom: 16px;
        }
        .modal-title {
            font-size: 20px;
            font-weight: 700;
            color: #fff;
            margin: 0;
        }
        .modal-close {
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            font-size: 24px;
            padding: 0;
            line-height: 1;
            transition: color 0.2s;
        }
        .modal-close:hover {
            color: #fff;
        }
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding-top: 16px;
        }
    </style>
</head>
<body>

    <!-- Sidebar Navigation -->
    <aside class="cms-sidebar" id="dashboard-sidebar">
        <div class="sidebar-brand">
            <a href="/" class="brand-logo-text" style="color: #fff; text-decoration: none;">
                <div class="logo-dot"></div>
                <span>KIU <span>Explorer</span></span>
            </a>
            <button type="button" class="btn-sidebar-close" onclick="toggleSidebar()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        
        <ul class="sidebar-menu">
            <li class="sidebar-menu-item menu-item active" id="menu-overview">
                <button type="button" onclick="switchTab('overview')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                    <span class="menu-item-text">Overview & Stats</span>
                </button>
            </li>
            <li class="sidebar-menu-item menu-item" id="menu-landing">
                <button type="button" onclick="switchTab('landing')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                    <span class="menu-item-text">Landing Page</span>
                </button>
            </li>
            <li class="sidebar-menu-item menu-item" id="menu-blog">
                <button type="button" onclick="switchTab('blog')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    <span class="menu-item-text">Blog Articles</span>
                </button>
            </li>
            <li class="sidebar-menu-item menu-item" id="menu-gallery">
                <button type="button" onclick="switchTab('gallery')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <span class="menu-item-text">Gallery Manager</span>
                </button>
            </li>
            <li class="sidebar-menu-item menu-item" id="menu-apk">
                <button type="button" onclick="switchTab('apk')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    <span class="menu-item-text">APK Manager</span>
                </button>
            </li>
            <li class="sidebar-menu-item menu-item" id="menu-users">
                <button type="button" onclick="switchTab('users')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <span class="menu-item-text">User Directory</span>
                </button>
            </li>
            <li class="sidebar-menu-item menu-item" id="menu-logs">
                <button type="button" onclick="switchTab('logs')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    <span class="menu-item-text">Audit Logs</span>
                </button>
            </li>
            <li class="sidebar-menu-item menu-item" id="menu-alerts">
                <button type="button" onclick="switchTab('alerts')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    <span class="menu-item-text">System Alerts</span>
                </button>
            </li>
            <li class="sidebar-menu-item menu-item" id="menu-security">
                <button type="button" onclick="switchTab('security')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <span class="menu-item-text">Security Settings</span>
                </button>
            </li>
        </ul>
        
        <div class="sidebar-footer">
            <div class="user-profile">
                <div class="user-avatar">
                    {{ strtoupper(substr(Auth::user()->first_name, 0, 1)) }}
                </div>
                <div class="user-info">
                    <span class="user-name">{{ Auth::user()->surname }} {{ Auth::user()->first_name }}</span>
                    <span class="user-role">Administrator</span>
                </div>
            </div>
            
            <form action="{{ route('cms.logout') }}" method="POST">
                @csrf
                <button type="submit" class="btn-logout">Sign Out</button>
            </form>
        </div>
    </aside>

    <!-- Main Content Area -->
    <div class="cms-content">
        
        <!-- Sticky Header Actions -->
        <div class="content-header">
            <div class="header-title-wrapper">
                <button type="button" class="btn-sidebar-toggle" onclick="toggleSidebar()">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div class="header-title">
                    <h2 id="current-tab-title">Overview & Stats</h2>
                    <p id="current-tab-desc">Monitor download stats, database connections and user metrics.</p>
                </div>
            </div>
            <div id="header-action-container">
                <!-- Buttons loaded dynamically -->
            </div>
        </div>

        <div class="content-body">
            
            @if(session('success'))
                <div class="alert-toast" id="toast-msg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>{{ session('success') }}</span>
                </div>
                <script>
                    setTimeout(() => {
                        const toast = document.getElementById('toast-msg');
                        if (toast) toast.remove();
                    }, 4000);
                </script>
            @endif

            @if($errors->any())
                <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); padding:15px; border-radius:12px; color:#f87171; font-size:14.5px; margin-bottom:10px;">
                    <strong>Form action failed:</strong>
                    <ul style="margin-top:5px; margin-left:20px; font-size:13.5px;">
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <!-- ================= TAB 1: OVERVIEW ================= -->
            <div class="tab-panel active" id="tab-overview">
                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card blue">
                        <span class="stat-label">APK Downloads</span>
                        <span class="stat-value" id="download-stat">{{ $settings->download_count }}</span>
                        <span class="stat-desc">Tracked clicks on landing page download buttons</span>
                    </div>

                    <div class="stat-card green">
                        <span class="stat-label">Total App Users</span>
                        <span class="stat-value">{{ $totalUsers }}</span>
                        <span class="stat-desc">Registered students & lecturers in database</span>
                    </div>

                    <div class="stat-card purple">
                        <span class="stat-label">Active Users</span>
                        <span class="stat-value">{{ $activeUsers }}</span>
                        <span class="stat-desc">Users currently set to active status</span>
                    </div>

                    <div class="stat-card orange">
                        <span class="stat-label">Monthly Active Users</span>
                        <span class="stat-value">{{ $monthlyUsers }}</span>
                        <span class="stat-desc">Active sessions in the last 30 days</span>
                    </div>

                    <div class="stat-card">
                        <span class="stat-label">New Users (7d)</span>
                        <span class="stat-value">{{ $newUsers }}</span>
                        <span class="stat-desc">New campus profiles registered this week</span>
                    </div>
                </div>

                <!-- Database Analytics Chart Canvas -->
                <div class="section-card">
                    <h3 class="section-title">Growth & Download Trend Analytics</h3>
                    <div style="position: relative; height: 350px; width: 100%;">
                        <canvas id="growthChart"></canvas>
                    </div>
                </div>

                <!-- System Status Card -->
                <div class="section-card">
                    <h3 class="section-title">System Status</h3>
                    <div class="form-grid">
                        <div class="form-group" style="padding:15px; background:rgba(255,255,255,0.01); border:1px solid var(--border-color); border-radius:12px;">
                            <label>Database Engine Status</label>
                            <span style="display:flex; align-items:center; gap:8px; margin-top:8px; font-weight:700; color:{{ $dbConnected ? 'var(--accent-green)' : '#f87171' }}">
                                <span style="width:10px; height:10px; border-radius:50%; background:{{ $dbConnected ? 'var(--accent-green)' : '#f87171' }}"></span>
                                {{ $dbConnected ? 'ONLINE (MySQL 127.0.0.1)' : 'OFFLINE/ERROR' }}
                            </span>
                        </div>
                        <div class="form-group" style="padding:15px; background:rgba(255,255,255,0.01); border:1px solid var(--border-color); border-radius:12px;">
                            <label>Uptime & Health</label>
                            <span style="display:block; margin-top:8px; font-weight:700; color:var(--accent-green);">
                                99.98% Operational (Host: Localhost)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ================= TAB 2: LANDING PAGE ================= -->
            <div class="tab-panel" id="tab-landing">
                <form id="main-config-form" action="{{ route('cms.update') }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    
                    <div class="section-card">
                        <h3 class="section-title">Hero Section & Style Configs</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="app_name">App Name</label>
                                <input type="text" id="app_name" name="app_name" value="{{ old('app_name', $settings->app_name) }}">
                            </div>

                            <div class="form-group">
                                <label for="hero_title">Hero Title</label>
                                <input type="text" id="hero_title" name="hero_title" value="{{ old('hero_title', $settings->hero_title) }}">
                            </div>

                            <div class="form-group full-width">
                                <label for="hero_subtitle">Hero Subtitle / Description</label>
                                <textarea id="hero_subtitle" name="hero_subtitle" rows="3">{{ old('hero_subtitle', $settings->hero_subtitle) }}</textarea>
                            </div>

                            <div class="form-group">
                                <label for="primary_color">Primary Theme Color</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="color" id="primary_color_picker" style="width:50px; padding:0; height:45px; cursor:pointer;" value="{{ $settings->primary_color }}" oninput="document.getElementById('primary_color').value = this.value">
                                    <input type="text" id="primary_color" name="primary_color" value="{{ old('primary_color', $settings->primary_color) }}" oninput="document.getElementById('primary_color_picker').value = this.value">
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="secondary_color">Secondary Background Accent</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="color" id="secondary_color_picker" style="width:50px; padding:0; height:45px; cursor:pointer;" value="{{ $settings->secondary_color }}" oninput="document.getElementById('secondary_color').value = this.value">
                                    <input type="text" id="secondary_color" name="secondary_color" value="{{ old('secondary_color', $settings->secondary_color) }}" oninput="document.getElementById('secondary_color_picker').value = this.value">
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="theme_mode">Default Theme Mode</label>
                                <select id="theme_mode" name="theme_mode">
                                    <option value="dark" {{ old('theme_mode', $settings->theme_mode) === 'dark' ? 'selected' : '' }}>Dark Theme</option>
                                    <option value="light" {{ old('theme_mode', $settings->theme_mode) === 'light' ? 'selected' : '' }}>Light Theme</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Upload Hero Mockup Photo (Image Option)</label>
                                <div style="display: flex; flex-direction: column; gap: 8px;">
                                    <div class="file-upload-wrapper" style="padding:10px;">
                                        <input type="file" id="hero_image" name="hero_image" accept="image/*">
                                        <div class="file-upload-text" id="hero-upload-label" style="font-size:12.5px;">
                                            {{ $settings->hero_image_path ? 'Click to replace mockup photo' : 'Select mockup photo file' }}
                                        </div>
                                    </div>
                                    @if($settings->hero_image_path)
                                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
                                            <span style="font-size:11px;">
                                                Current: <a href="{{ asset('storage/' . $settings->hero_image_path) }}" target="_blank" style="color:var(--primary-color); font-weight: 600;">View mockup photo</a>
                                            </span>
                                            <label style="display:inline-flex; align-items:center; gap:6px; font-size:11px; cursor:pointer; text-transform:none; color: #ef4444;">
                                                <input type="checkbox" name="hero_image_clear" value="1" style="width:14px; height:14px;">
                                                Delete Image
                                            </label>
                                        </div>
                                    @endif
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Upload Hero Mockup Demo Video (Autoplay Option)</label>
                                <div style="display: flex; flex-direction: column; gap: 8px;">
                                    <div class="file-upload-wrapper" style="padding:10px;">
                                        <input type="file" id="hero_video" name="hero_video" accept="video/mp4,video/webm,video/ogg,video/quicktime">
                                        <div class="file-upload-text" id="hero-video-upload-label" style="font-size:12.5px;">
                                            {{ $settings->hero_video_path ? 'Click to replace mockup video' : 'Select mockup video file (MP4/WebM)' }}
                                        </div>
                                    </div>
                                    @if($settings->hero_video_path)
                                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
                                            <span style="font-size:11px;">
                                                Current: <a href="{{ asset('storage/' . $settings->hero_video_path) }}" target="_blank" style="color:var(--primary-color); font-weight: 600;">View mockup video</a>
                                            </span>
                                            <label style="display:inline-flex; align-items:center; gap:6px; font-size:11px; cursor:pointer; text-transform:none; color: #ef4444;">
                                                <input type="checkbox" name="hero_video_clear" value="1" style="width:14px; height:14px;">
                                                Delete Video
                                            </label>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="section-card">
                        <h3 class="section-title">Section Visibility Toggles</h3>
                        <input type="hidden" name="visibility_submitted" value="1">
                        <div style="display:flex; flex-direction:column; gap:14px;">
                            <label style="display:flex; align-items:center; gap:12px; cursor:pointer; text-transform:none; font-size:14.5px;">
                                <input type="checkbox" name="show_features" value="1" {{ old('show_features', $settings->show_features) ? 'checked' : '' }} style="width:18px; height:18px;">
                                Display Features grid section
                            </label>
                            <label style="display:flex; align-items:center; gap:12px; cursor:pointer; text-transform:none; font-size:14.5px;">
                                <input type="checkbox" name="show_faqs" value="1" {{ old('show_faqs', $settings->show_faqs) ? 'checked' : '' }} style="width:18px; height:18px;">
                                Display FAQs Accordion section
                            </label>
                            <label style="display:flex; align-items:center; gap:12px; cursor:pointer; text-transform:none; font-size:14.5px;">
                                <input type="checkbox" name="show_stats" value="1" {{ old('show_stats', $settings->show_stats) ? 'checked' : '' }} style="width:18px; height:18px;">
                                Display Downloads proof badge
                            </label>
                            <!-- Team toggle requested -->
                            <label style="display:flex; align-items:center; gap:12px; cursor:pointer; text-transform:none; font-size:14.5px;">
                                <input type="checkbox" name="show_team" value="1" {{ old('show_team', $settings->show_team) ? 'checked' : '' }} style="width:18px; height:18px;">
                                Display Team section
                            </label>
                        </div>
                    </div>

                    <div class="section-card">
                        <h3 class="section-title">Features Cards Editor</h3>
                        <div id="features-container">
                            @if(!empty($settings->features))
                                @foreach($settings->features as $idx => $feature)
                                    <div class="cms-item-card" id="feature-item-{{ $idx }}">
                                        <div class="cms-card-header">
                                            <h4>Capability #{{ $idx + 1 }}</h4>
                                            <button type="button" class="btn-remove" onclick="removeFeature({{ $idx }})">Remove</button>
                                        </div>
                                        
                                        <div class="form-grid">
                                            <div class="form-group">
                                                <label>Title</label>
                                                <input type="text" name="features[{{ $idx }}][title]" value="{{ $feature['title'] }}">
                                            </div>
                                            
                                            <!-- Capability expanded icon choices requested -->
                                            <div class="form-group">
                                                <label>Icon</label>
                                                <select name="features[{{ $idx }}][icon]">
                                                    <option value="map" {{ ($feature['icon'] ?? '') == 'map' ? 'selected' : '' }}>Map Pin</option>
                                                    <option value="book" {{ ($feature['icon'] ?? '') == 'book' ? 'selected' : '' }}>Book / Library</option>
                                                    <option value="home" {{ ($feature['icon'] ?? '') == 'home' ? 'selected' : '' }}>Home / Hostel</option>
                                                    <option value="chat" {{ ($feature['icon'] ?? '') == 'chat' ? 'selected' : '' }}>Chat / Message</option>
                                                    <option value="calendar" {{ ($feature['icon'] ?? '') == 'calendar' ? 'selected' : '' }}>Calendar / Events</option>
                                                    <option value="bell" {{ ($feature['icon'] ?? '') == 'bell' ? 'selected' : '' }}>Bell / Alerts</option>
                                                    <option value="users" {{ ($feature['icon'] ?? '') == 'users' ? 'selected' : '' }}>Users / Directory</option>
                                                    <option value="lock" {{ ($feature['icon'] ?? '') == 'lock' ? 'selected' : '' }}>Lock / Security</option>
                                                    <option value="compass" {{ ($feature['icon'] ?? '') == 'compass' ? 'selected' : '' }}>Compass / Guide</option>
                                                    <option value="settings" {{ ($feature['icon'] ?? '') == 'settings' ? 'selected' : '' }}>Settings / Config</option>
                                                    <option value="award" {{ ($feature['icon'] ?? '') == 'award' ? 'selected' : '' }}>Award / Medal</option>
                                                    <option value="info" {{ ($feature['icon'] ?? '') == 'info' ? 'selected' : '' }}>Info / Question</option>
                                                    <option value="briefcase" {{ ($feature['icon'] ?? '') == 'briefcase' ? 'selected' : '' }}>Briefcase / Job</option>
                                                    <option value="graduation" {{ ($feature['icon'] ?? '') == 'graduation' ? 'selected' : '' }}>Graduation Cap</option>
                                                </select>
                                            </div>
                                            
                                            <div class="form-group full-width">
                                                <label>Description</label>
                                                <textarea name="features[{{ $idx }}][description]" rows="2">{{ $feature['description'] }}</textarea>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            @endif
                        </div>
                        <button type="button" class="btn-add" onclick="addFeature()">+ Add Capability Card</button>
                    </div>

                    <!-- Team section editor card requested -->
                    <div class="section-card">
                        <h3 class="section-title">Team Members Editor</h3>
                        <div id="team-container">
                            @if(!empty($settings->team))
                                @foreach($settings->team as $idx => $member)
                                    <div class="cms-item-card" id="team-item-{{ $idx }}">
                                        <div class="cms-card-header">
                                            <h4>Member #{{ $idx + 1 }}</h4>
                                            <button type="button" class="btn-remove" onclick="removeTeamMember({{ $idx }})">Remove</button>
                                        </div>
                                        
                                        <div class="form-grid">
                                            <div class="form-group">
                                                <label>Full Name</label>
                                                <input type="text" name="team[{{ $idx }}][name]" value="{{ $member['name'] }}">
                                            </div>
                                            
                                            <div class="form-group">
                                                <label>Role / Position</label>
                                                <input type="text" name="team[{{ $idx }}][role]" value="{{ $member['role'] }}">
                                            </div>
                                            
                                            <div class="form-group full-width">
                                                <label>Bio Description</label>
                                                <textarea name="team[{{ $idx }}][description]" rows="2">{{ $member['description'] }}</textarea>
                                            </div>

                                            <div class="form-group">
                                                <label>Phone Number</label>
                                                <input type="text" name="team[{{ $idx }}][phone]" value="{{ $member['phone'] }}">
                                            </div>

                                            <div class="form-group">
                                                <label>Email Address</label>
                                                <input type="email" name="team[{{ $idx }}][email]" value="{{ $member['email'] }}">
                                            </div>

                                            <div class="form-group full-width" style="margin-top: 10px;">
                                                <label style="color: var(--primary-color); border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 10px; display: block; text-transform:none;">Social Media Profiles & Website</label>
                                                <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                                                    <div class="form-group">
                                                        <label>Facebook</label>
                                                        <input type="text" name="team[{{ $idx }}][socials][facebook]" value="{{ $member['socials']['facebook'] ?? '' }}" placeholder="https://facebook.com/username">
                                                    </div>
                                                    <div class="form-group">
                                                        <label>LinkedIn</label>
                                                        <input type="text" name="team[{{ $idx }}][socials][linkedin]" value="{{ $member['socials']['linkedin'] ?? '' }}" placeholder="https://linkedin.com/in/username">
                                                    </div>
                                                    <div class="form-group">
                                                        <label>X (Twitter)</label>
                                                        <input type="text" name="team[{{ $idx }}][socials][x]" value="{{ $member['socials']['x'] ?? '' }}" placeholder="https://x.com/username">
                                                    </div>
                                                    <div class="form-group">
                                                        <label>GitHub</label>
                                                        <input type="text" name="team[{{ $idx }}][socials][github]" value="{{ $member['socials']['github'] ?? '' }}" placeholder="https://github.com/username">
                                                    </div>
                                                    <div class="form-group">
                                                        <label>Instagram</label>
                                                        <input type="text" name="team[{{ $idx }}][socials][instagram]" value="{{ $member['socials']['instagram'] ?? '' }}" placeholder="https://instagram.com/username">
                                                    </div>
                                                    <div class="form-group">
                                                        <label>Portfolio / Website</label>
                                                        <input type="text" name="team[{{ $idx }}][socials][portfolio]" value="{{ $member['socials']['portfolio'] ?? '' }}" placeholder="https://username.dev">
                                                    </div>
                                                </div>
                                                
                                                <div style="margin-top:15px;">
                                                    <label style="font-size:11px; text-transform:none;">Custom Links (e.g. ResearchGate, Blog)</label>
                                                    <div id="custom-links-container-{{ $idx }}" style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
                                                        @if(!empty($member['custom_links']))
                                                            @foreach($member['custom_links'] as $cIdx => $cLink)
                                                                <div style="display:flex; gap:10px; align-items:center;" id="custom-link-{{ $idx }}-{{ $cIdx }}">
                                                                    <input type="text" name="team[{{ $idx }}][custom_links][{{ $cIdx }}][label]" value="{{ $cLink['label'] }}" placeholder="Label (e.g. ResearchGate)" style="flex:1;">
                                                                    <input type="text" name="team[{{ $idx }}][custom_links][{{ $cIdx }}][url]" value="{{ $cLink['url'] }}" placeholder="URL (https://...)" style="flex:2;">
                                                                    <button type="button" class="btn-remove" onclick="removeCustomLink({{ $idx }}, {{ $cIdx }})">Remove</button>
                                                                </div>
                                                            @endforeach
                                                        @endif
                                                    </div>
                                                    <button type="button" class="btn-add" onclick="addCustomLink({{ $idx }})" style="font-size:11.5px; padding:6px 12px; margin-top:8px;">+ Add Custom Link</button>
                                                </div>
                                            </div>

                                            <div class="form-group">
                                                <label>Upload Photo</label>
                                                <input type="hidden" name="team[{{ $idx }}][photo_path]" value="{{ $member['photo_path'] }}">
                                                <input type="file" name="team[{{ $idx }}][photo]" accept="image/*">
                                                @if(!empty($member['photo_path']))
                                                    <span style="font-size:11px; margin-top:2px; display:block;">
                                                        Current: <a href="{{ asset('storage/' . $member['photo_path']) }}" target="_blank" style="color:var(--primary-color); font-weight:600;">View photo file</a>
                                                    </span>
                                                @endif
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            @endif
                        </div>
                        <button type="button" class="btn-add" onclick="addTeamMember()">+ Add Team Member</button>
                    </div>

                    <div class="section-card">
                        <h3 class="section-title">FAQ Accordion Editor</h3>
                        <div id="faqs-container">
                            @if(!empty($settings->faqs))
                                @foreach($settings->faqs as $idx => $faq)
                                    <div class="cms-item-card" id="faq-item-{{ $idx }}">
                                        <div class="cms-card-header">
                                            <h4>Question #{{ $idx + 1 }}</h4>
                                            <button type="button" class="btn-remove" onclick="removeFaq({{ $idx }})">Remove</button>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label>Question</label>
                                            <input type="text" name="faqs[{{ $idx }}][question]" value="{{ $faq['question'] }}">
                                        </div>
                                        
                                        <div class="form-group" style="margin-top: 15px;">
                                            <label>Answer</label>
                                            <textarea name="faqs[{{ $idx }}][answer]" rows="2">{{ $faq['answer'] }}</textarea>
                                        </div>
                                    </div>
                                @endforeach
                            @endif
                        </div>
                        <button type="button" class="btn-add" onclick="addFaq()">+ Add FAQ Item</button>
                    </div>

                    <div class="section-card">
                        <h3 class="section-title">Dynamic Custom Landing Sections</h3>
                        <div id="custom-sections-container">
                            @if(!empty($settings->custom_sections))
                                @foreach($settings->custom_sections as $idx => $section)
                                    <div class="cms-item-card" id="custom-section-item-{{ $idx }}">
                                        <div class="cms-card-header">
                                            <h4>Section Block #{{ $idx + 1 }}</h4>
                                            <button type="button" class="btn-remove" onclick="removeCustomSection({{ $idx }})">Remove</button>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label>Title</label>
                                            <input type="text" name="custom_sections[{{ $idx }}][title]" value="{{ $section['title'] }}">
                                        </div>
                                        
                                        <div class="form-group" style="margin-top: 15px;">
                                            <label>Section HTML Content</label>
                                            <textarea name="custom_sections[{{ $idx }}][content]" rows="3">{{ $section['content'] }}</textarea>
                                        </div>
                                    </div>
                                @endforeach
                            @endif
                        </div>
                        <button type="button" class="btn-add" onclick="addCustomSection()">+ Add Custom Section Block</button>
                    </div>
                </form>
            </div>

            <!-- ================= TAB 3: APK MANAGER ================= -->
            <div class="tab-panel" id="tab-apk">
                <form id="apk-config-form" action="{{ route('cms.update') }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    
                    <div class="section-card">
                        <h3 class="section-title">APK File Hosting</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="apk_version">Version Number</label>
                                <input type="text" id="apk_version_2" name="apk_version" value="{{ old('apk_version', $settings->apk_version) }}" placeholder="e.g. 1.0.4">
                            </div>

                            <div class="form-group">
                                <label>Asset Info</label>
                                <div style="padding:12px; background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:10px; font-size:13.5px; height: 100%; display: flex; align-items: center;">
                                    <span>Size: <strong>{{ $settings->apk_size }}</strong></span>
                                </div>
                            </div>

                            <div class="form-group full-width">
                                <label>Upload New APK Installer (.apk)</label>
                                <div class="file-upload-wrapper">
                                    <input type="file" id="apk_file_2" name="apk_file" accept=".apk">
                                    <div class="file-upload-text">
                                        Drag your APK file here or browse files. Max size 50MB.
                                    </div>
                                </div>
                                <span id="selected-file-name-2" style="font-size:12.5px; color:var(--accent-green); margin-top:5px; font-weight:600;"></span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <!-- ================= TAB 4: USER DIRECTORY & ADMIN CREATION ================= -->
            <div class="tab-panel" id="tab-users">
                <!-- Admin registration form -->
                <div class="section-card">
                    <h3 class="section-title">Create New Administrator</h3>
                    
                    <form action="{{ route('cms.admin.create') }}" method="POST">
                        @csrf
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="surname">Surname</label>
                                <input type="text" id="surname" name="surname" value="{{ old('surname') }}" placeholder="e.g. Smith" required>
                            </div>

                            <div class="form-group">
                                <label for="first_name">First Name</label>
                                <input type="text" id="first_name" name="first_name" value="{{ old('first_name') }}" placeholder="e.g. John" required>
                            </div>

                            <div class="form-group">
                                <label for="username">Username</label>
                                <input type="text" id="username" name="username" value="{{ old('username') }}" placeholder="e.g. johnsmith" required>
                            </div>

                            <div class="form-group">
                                <label for="email">Email Address</label>
                                <input type="email" id="email" name="email" value="{{ old('email') }}" placeholder="e.g. john@kiu.edu.ng" required>
                            </div>

                            <div class="form-group">
                                <label for="phone_number">Phone Number</label>
                                <input type="text" id="phone_number" name="phone_number" value="{{ old('phone_number') }}" placeholder="e.g. 08033333333" required>
                            </div>

                            <div class="form-group">
                                <label for="password">Account Password</label>
                                <input type="password" id="password" name="password" placeholder="••••••••" required>
                            </div>

                            <div class="form-group">
                                <label for="password_confirmation">Confirm Password</label>
                                <input type="password" id="password_confirmation" name="password_confirmation" placeholder="••••••••" required>
                            </div>
                        </div>
                        
                        <div style="display:flex; justify-content:flex-end; margin-top:20px;">
                            <button type="submit" class="btn-save">Register Admin User</button>
                        </div>
                    </form>
                </div>

                <!-- Users list directory table -->
                <div class="section-card">
                    <h3 class="section-title">Recent Registered Users</h3>
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($recentUsers as $user)
                                    <tr>
                                        <td><strong>{{ $user->surname }} {{ $user->first_name }}</strong></td>
                                        <td>{{ $user->email }}</td>
                                        <td><span class="badge {{ $user->role }}">{{ $user->role }}</span></td>
                                        <td>
                                            <span class="badge {{ $user->account_status === 'active' ? 'active' : 'blocked' }}">
                                                {{ $user->account_status }}
                                            </span>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="4" style="text-align:center; color:var(--text-secondary);">No registered users found.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ================= TAB 5: AUDIT LOGS ================= -->
            <div class="tab-panel" id="tab-logs">
                <div class="section-card">
                    <h3 class="section-title">System Audit Log Trail</h3>
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Action Log Details</th>
                                    <th>Operator ID</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($recentLogs as $log)
                                    <tr>
                                        <td>{{ $log->action }}</td>
                                        <td>{{ $log->user_id }}</td>
                                        <td>{{ $log->created_at->format('M d, Y H:i:s') }}</td>
                                    </tr>
                                @empty
                                    <!-- Mock logs fallback -->
                                    <tr>
                                        <td><strong>Updated hero layout configurations</strong></td>
                                        <td>{{ Auth::user()->email }} (IP: 127.0.0.1)</td>
                                        <td>{{ now()->subMinutes(10)->format('M d, Y H:i') }}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Published APK package v1.0.4</strong></td>
                                        <td>{{ Auth::user()->email }} (IP: 127.0.0.1)</td>
                                        <td>{{ now()->subHours(1)->format('M d, Y H:i') }}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Authorized hostel booking ref HB-094</strong></td>
                                        <td>Paystack Sandbox Webhook</td>
                                        <td>{{ now()->subHours(4)->format('M d, Y H:i') }}</td>
                                    </tr>
                                @endif
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ================= TAB 6: SYSTEM ALERTS ================= -->
            <div class="tab-panel" id="tab-alerts">
                <div class="section-card">
                    <h3 class="section-title">Critical System Reports</h3>
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ticket Code</th>
                                    <th>Issue Reason</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($recentReports as $report)
                                    <tr>
                                        <td><strong>REPORT-{{ $report->id }}</strong></td>
                                        <td>{{ $report->reason }}</td>
                                        <td><span class="badge blocked">Pending</span></td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="3" style="text-align:center; padding: 40px 20px; color:var(--accent-green);">
                                            <div style="font-size:24px; margin-bottom:10px;">✓</div>
                                            <strong>All systems normal</strong><br>
                                            <span style="font-size:12.5px; color:var(--text-secondary); font-weight:normal;">No critical server reports or active hardware warnings.</span>
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ================= TAB 7: SECURITY SETTINGS ================= -->
            <div class="tab-panel" id="tab-security">
                <!-- Change Password Form -->
                <div class="section-card">
                    <h3 class="section-title">Change Account Password</h3>
                    
                    <form action="{{ route('cms.password.update') }}" method="POST">
                        @csrf
                        <div class="form-grid" style="grid-template-columns: 1fr;">
                            <div class="form-group" style="max-width: 500px;">
                                <label for="current_password">Current Password</label>
                                <input type="password" id="current_password" name="current_password" placeholder="••••••••" required>
                            </div>

                            <div class="form-group" style="max-width: 500px;">
                                <label for="new_password">New Password</label>
                                <input type="password" id="new_password" name="new_password" placeholder="••••••••" required>
                            </div>

                            <div class="form-group" style="max-width: 500px;">
                                <label for="new_password_confirmation">Confirm New Password</label>
                                <input type="password" id="new_password_confirmation" name="new_password_confirmation" placeholder="••••••••" required>
                            </div>
                        </div>

                        <div style="display:flex; margin-top:20px;">
                            <button type="submit" class="btn-save">Update Security Password</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- ================= TAB 8: BLOG ARTICLES ================= -->
            <div class="tab-panel" id="tab-blog">
                <div class="section-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
                        <h3 class="section-title" style="margin-bottom:0;">Blog Articles</h3>
                        <button type="button" class="btn-save" onclick="openCreateBlogModal()" style="margin-top:0;">+ Create New Article</button>
                    </div>

                    <!-- Blog Stats Row -->
                    <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 24px;">
                        <div class="stat-card" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 16px; text-align: center;">
                            <span class="stat-title" style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Total Articles</span>
                            <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #fff; margin-top: 6px;">{{ $blogPosts->count() }}</div>
                        </div>
                        <div class="stat-card" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 16px; text-align: center;">
                            <span class="stat-title" style="font-size: 11px; color: #10b981; text-transform: uppercase; font-weight: 600;">Published</span>
                            <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #10b981; margin-top: 6px;">{{ $publishedBlogCount }}</div>
                        </div>
                        <div class="stat-card" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 16px; text-align: center;">
                            <span class="stat-title" style="font-size: 11px; color: #cbd5e1; text-transform: uppercase; font-weight: 600;">Drafts</span>
                            <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #cbd5e1; margin-top: 6px;">{{ $draftBlogCount }}</div>
                        </div>
                        <div class="stat-card" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 16px; text-align: center;">
                            <span class="stat-title" style="font-size: 11px; color: #09a5db; text-transform: uppercase; font-weight: 600;">Total Views</span>
                            <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #09a5db; margin-top: 6px;">{{ $totalBlogViews }}</div>
                        </div>
                    </div>

                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Cover Image</th>
                                    <th>Title & Slug</th>
                                    <th>Author</th>
                                    <th>Views</th>
                                    <th>Status</th>
                                    <th>Published Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($blogPosts as $post)
                                    <tr>
                                        <td>
                                            @if($post->image_path)
                                                <img src="{{ asset('storage/' . $post->image_path) }}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                                            @else
                                                <div style="width: 44px; height: 44px; background: linear-gradient(135deg, var(--primary-color), #0f172a); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #fff; text-transform: uppercase; font-weight: bold; border: 1px solid rgba(255,255,255,0.1);">No Img</div>
                                            @endif
                                        </td>
                                        <td>
                                            <div style="font-weight: 700; color: #fff; max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="{{ $post->title }}">{{ $post->title }}</div>
                                            <div style="font-size: 11px; color: #64748b; max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ $post->slug }}</div>
                                        </td>
                                        <td>{{ $post->author_name }}</td>
                                        <td><strong>{{ number_format($post->views) }}</strong></td>
                                        <td>
                                            <span class="badge" style="background: {{ $post->status === 'published' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(226, 232, 240, 0.08)' }}; color: {{ $post->status === 'published' ? '#10b981' : '#cbd5e1' }}; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">
                                                {{ ucfirst($post->status) }}
                                            </span>
                                        </td>
                                        <td>{{ $post->published_at ? $post->published_at->format('M d, Y H:i') : '-' }}</td>
                                        <td>
                                            <div style="display: flex; gap: 8px;">
                                                <button type="button" class="btn-save" onclick='openEditBlogModal({!! json_encode($post->toArray()) !!})' style="margin: 0; padding: 6px 12px; font-size: 11px; background: rgba(9, 165, 219, 0.1); color: #09a5db; border: 1px solid rgba(9, 165, 219, 0.2);">Edit</button>
                                                <form action="{{ route('cms.blog.destroy', $post->id) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this blog post?');" style="margin:0;">
                                                    @csrf
                                                    <button type="submit" class="btn-remove" style="margin: 0; padding: 6px 12px; font-size: 11px;">Delete</button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="7" style="text-align: center; color: #64748b; padding: 30px 0;">No blog articles found. Click "+ Create New Article" to write your first post.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ================= TAB 9: GALLERY ITEMS ================= -->
            <div class="tab-panel" id="tab-gallery">
                <div class="section-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
                        <h3 class="section-title" style="margin-bottom:0;">Campus Gallery Items</h3>
                        <button type="button" class="btn-save" onclick="openUploadGalleryModal()" style="margin-top:0;">+ Upload New Media</button>
                    </div>

                    <!-- Gallery Stats Row -->
                    <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 24px;">
                        <div class="stat-card" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 16px; text-align: center;">
                            <span class="stat-title" style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Total Media</span>
                            <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #fff; margin-top: 6px;">{{ $totalGalleryCount }}</div>
                        </div>
                        <div class="stat-card" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 16px; text-align: center;">
                            <span class="stat-title" style="font-size: 11px; color: #09a5db; text-transform: uppercase; font-weight: 600;">Photos</span>
                            <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #09a5db; margin-top: 6px;">{{ $photoGalleryCount }}</div>
                        </div>
                        <div class="stat-card" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 16px; text-align: center;">
                            <span class="stat-title" style="font-size: 11px; color: #8b5cf6; text-transform: uppercase; font-weight: 600;">Videos</span>
                            <div class="stat-value" style="font-size: 24px; font-weight: 700; color: #8b5cf6; margin-top: 6px;">{{ $videoGalleryCount }}</div>
                        </div>
                    </div>

                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Media Preview</th>
                                    <th>Title & Description</th>
                                    <th>Type</th>
                                    <th>Upload Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($galleryItems as $item)
                                    <tr>
                                        <td>
                                            @if($item->type === 'image')
                                                <img src="{{ asset('storage/' . $item->media_path) }}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                                            @elseif($item->thumbnail_path)
                                                <div style="position: relative; width: 50px; height: 50px;">
                                                    <img src="{{ asset('storage/' . $item->thumbnail_path) }}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                                                    <span style="position:absolute; background:rgba(0,0,0,0.6); width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; top:16px; left:16px; font-size:8px; color: #fff;">▶</span>
                                                </div>
                                            @else
                                                <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #8b5cf6, #0f172a); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #fff; text-transform: uppercase; font-weight: bold; border: 1px solid rgba(255,255,255,0.1); position: relative;">
                                                    Video
                                                    <span style="position:absolute; background:rgba(0,0,0,0.5); width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; top:17px; left:17px; font-size:6px;">▶</span>
                                                </div>
                                            @endif
                                        </td>
                                        <td>
                                            <div style="font-weight: 700; color: #fff;">{{ $item->title }}</div>
                                            <div style="font-size: 12px; color: #64748b; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ $item->description ?: 'No description provided.' }}</div>
                                        </td>
                                        <td>
                                            <span class="badge" style="background: {{ $item->type === 'video' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(9, 165, 219, 0.12)' }}; color: {{ $item->type === 'video' ? '#a78bfa' : '#09a5db' }}; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">
                                                {{ ucfirst($item->type) }}
                                            </span>
                                        </td>
                                        <td>{{ $item->created_at->format('M d, Y H:i') }}</td>
                                        <td>
                                            <form action="{{ route('cms.gallery.destroy', $item->id) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this gallery item?');" style="margin:0;">
                                                @csrf
                                                <button type="submit" class="btn-remove" style="margin: 0; padding: 6px 12px; font-size: 11px;">Delete</button>
                                            </form>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="5" style="text-align: center; color: #64748b; padding: 30px 0;">No gallery items found. Click "+ Upload New Media" to upload photos/videos of campus events!</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <!-- JS for dynamic tabs switching and cards adding -->
    <script>
        // Toggle Sidebar on Mobile screens
        function toggleSidebar() {
            const sidebar = document.getElementById('dashboard-sidebar');
            if (sidebar) {
                sidebar.classList.toggle('open');
            }
        }

        // Tab switching logic
        function switchTab(tabId) {
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            document.getElementById(`tab-${tabId}`).classList.add('active');

            document.querySelectorAll('.sidebar-menu-item').forEach(item => {
                item.classList.remove('active');
            });
            document.getElementById(`menu-${tabId}`).classList.add('active');

            const tabTitleElement = document.getElementById('current-tab-title');
            const tabDescElement = document.getElementById('current-tab-desc');
            const headerActionContainer = document.getElementById('header-action-container');

            const tabMeta = {
                overview: { title: "Overview & Stats", desc: "Monitor download stats, database connections and user metrics.", showSave: false },
                landing: { title: "Landing Page Customizer", desc: "Change texts, theme colors, mockup photos, visibility, and dynamic sections.", showSave: true, formId: "main-config-form" },
                apk: { title: "APK Manager", desc: "Publish new app versions and upload APK binary files.", showSave: true, formId: "apk-config-form" },
                blog: { title: "Blog Articles Management", desc: "Manage campus insights, announcements, and articles shown on the landing page.", showSave: false },
                gallery: { title: "Campus Gallery Management", desc: "Upload and delete campus photos and videos displayed on the public gallery page.", showSave: false },
                users: { title: "User Directory", desc: "View the list of registered lecturers and students.", showSave: false },
                logs: { title: "System Audit Logs", desc: "Inspect recent actions performed on the management panel.", showSave: false },
                alerts: { title: "Active System Alerts", desc: "Check server alerts and student report tickets.", showSave: false },
                security: { title: "Security Settings", desc: "Change your login credentials to secure your admin account.", showSave: false }
            };

            if (tabMeta[tabId]) {
                tabTitleElement.textContent = tabMeta[tabId].title;
                tabDescElement.textContent = tabMeta[tabId].desc;
                
                if (tabMeta[tabId].showSave) {
                    headerActionContainer.innerHTML = `<button type="button" onclick="triggerMainFormSubmit('${tabMeta[tabId].formId}')" class="btn-save">Publish Configuration</button>`;
                } else {
                    headerActionContainer.innerHTML = '';
                }
            }

            const sidebar = document.getElementById('dashboard-sidebar');
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        }

        // Helper to trigger form submit from header button
        function triggerMainFormSubmit(formId) {
            const form = document.getElementById(formId);
            if (form) {
                form.submit();
            }
        }

        // File upload labeling
        document.getElementById('apk_file_2').addEventListener('change', function(e) {
            const fileName = e.target.files[0] ? e.target.files[0].name : '';
            const sizeInMB = e.target.files[0] ? (e.target.files[0].size / (1024 * 1024)).toFixed(1) + ' MB' : '';
            document.getElementById('selected-file-name-2').textContent = fileName ? '✓ Selected: ' + fileName + ' (' + sizeInMB + ')' : '';
        });

        document.getElementById('hero_image').addEventListener('change', function(e) {
            const label = document.getElementById('hero-upload-label');
            const name = e.target.files[0] ? e.target.files[0].name : '';
            if (name && label) {
                label.innerHTML = `✓ Upload Target selected: <strong>${name}</strong>`;
            }
        });

        document.getElementById('hero_video').addEventListener('change', function(e) {
            const label = document.getElementById('hero-video-upload-label');
            const name = e.target.files[0] ? e.target.files[0].name : '';
            if (name && label) {
                label.innerHTML = `✓ Upload Target selected: <strong>${name}</strong>`;
            }
        });

        // Feature cards dynamic index
        let featureCount = {{ count($settings->features ?? []) }};
        function addFeature() {
            const container = document.getElementById('features-container');
            const newDiv = document.createElement('div');
            newDiv.className = 'cms-item-card';
            newDiv.id = `feature-item-${featureCount}`;
            newDiv.innerHTML = `
                <div class="cms-card-header">
                    <h4>Capability #${featureCount + 1} (New)</h4>
                    <button type="button" class="btn-remove" onclick="removeFeature(${featureCount})">Remove</button>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" name="features[${featureCount}][title]" placeholder="e.g. Map Guide">
                    </div>
                    <div class="form-group">
                        <label>Icon</label>
                        <select name="features[${featureCount}][icon]">
                            <option value="map">Map Pin</option>
                            <option value="book">Book / Library</option>
                            <option value="home">Home / Hostel</option>
                            <option value="chat">Chat / Message</option>
                            <option value="calendar">Calendar / Events</option>
                            <option value="bell">Bell / Alerts</option>
                            <option value="users">Users / Directory</option>
                            <option value="lock">Lock / Security</option>
                            <option value="compass">Compass / Guide</option>
                            <option value="settings">Settings / Config</option>
                            <option value="award">Award / Medal</option>
                            <option value="info">Info / Question</option>
                            <option value="briefcase">Briefcase / Job</option>
                            <option value="graduation">Graduation Cap</option>
                        </select>
                    </div>
                    <div class="form-group full-width">
                        <label>Description</label>
                        <textarea name="features[${featureCount}][description]" rows="2" placeholder="e.g. Detailed routes inside campus buildings."></textarea>
                    </div>
                </div>
            `;
            container.appendChild(newDiv);
            featureCount++;
        }

        function removeFeature(id) {
            const item = document.getElementById(`feature-item-${id}`);
            if (item) item.remove();
        }

        // FAQ items dynamic index
        let faqCount = {{ count($settings->faqs ?? []) }};
        function addFaq() {
            const container = document.getElementById('faqs-container');
            const newDiv = document.createElement('div');
            newDiv.className = 'cms-item-card';
            newDiv.id = `faq-item-${faqCount}`;
            newDiv.innerHTML = `
                <div class="cms-card-header">
                    <h4>Question #${faqCount + 1} (New)</h4>
                    <button type="button" class="btn-remove" onclick="removeFaq(${faqCount})">Remove</button>
                </div>
                <div class="form-group">
                    <label>Question</label>
                    <input type="text" name="faqs[${faqCount}][question]" placeholder="e.g. Who can use the app?">
                </div>
                <div class="form-group" style="margin-top: 15px;">
                    <label>Answer</label>
                    <textarea name="faqs[${faqCount}][answer]" rows="2" placeholder="e.g. Only registered KIU students and lecturers."></textarea>
                </div>
            `;
            container.appendChild(newDiv);
            faqCount++;
        }

        function removeFaq(id) {
            const item = document.getElementById(`faq-item-${id}`);
            if (item) item.remove();
        }

        // Custom Sections dynamic index
        let customSectionCount = {{ count($settings->custom_sections ?? []) }};
        function addCustomSection() {
            const container = document.getElementById('custom-sections-container');
            const newDiv = document.createElement('div');
            newDiv.className = 'cms-item-card';
            newDiv.id = `custom-section-item-${customSectionCount}`;
            newDiv.innerHTML = `
                <div class="cms-card-header">
                    <h4>Section Block #${customSectionCount + 1} (New)</h4>
                    <button type="button" class="btn-remove" onclick="removeCustomSection(${customSectionCount})">Remove</button>
                </div>
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="custom_sections[${customSectionCount}][title]" placeholder="e.g. Announcement Header">
                </div>
                <div class="form-group" style="margin-top: 15px;">
                    <label>Section HTML Content</label>
                    <textarea name="custom_sections[${customSectionCount}][content]" rows="3" placeholder="HTML elements supported here"></textarea>
                </div>
            `;
            container.appendChild(newDiv);
            customSectionCount++;
        }

        function removeCustomSection(id) {
            const item = document.getElementById(`custom-section-item-${id}`);
            if (item) item.remove();
        }

        // Team members dynamic editor functions
        let teamCount = {{ count($settings->team ?? []) }};
        function addTeamMember() {
            const container = document.getElementById('team-container');
            const newDiv = document.createElement('div');
            newDiv.className = 'cms-item-card';
            newDiv.id = `team-item-${teamCount}`;
            newDiv.innerHTML = `
                <div class="cms-card-header">
                    <h4>Member #${teamCount + 1} (New)</h4>
                    <button type="button" class="btn-remove" onclick="removeTeamMember(${teamCount})">Remove</button>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" name="team[${teamCount}][name]" placeholder="e.g. Prof. Jane Doe">
                    </div>
                    <div class="form-group">
                        <label>Role / Position</label>
                        <input type="text" name="team[${teamCount}][role]" placeholder="e.g. Project Lead / Core Dev">
                    </div>
                    <div class="form-group full-width">
                        <label>Bio Description</label>
                        <textarea name="team[${teamCount}][description]" rows="2" placeholder="Brief details about the member..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="text" name="team[${teamCount}][phone]" placeholder="e.g. +234 80 123 4567">
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" name="team[${teamCount}][email]" placeholder="e.g. jane@kiu.edu.ng">
                    </div>
                    <div class="form-group full-width" style="margin-top: 10px;">
                        <label style="color: var(--primary-color); border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 10px; display: block; text-transform:none;">Social Media Profiles & Website</label>
                        <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                            <div class="form-group">
                                <label>Facebook</label>
                                <input type="text" name="team[${teamCount}][socials][facebook]" placeholder="https://facebook.com/username">
                            </div>
                            <div class="form-group">
                                <label>LinkedIn</label>
                                <input type="text" name="team[${teamCount}][socials][linkedin]" placeholder="https://linkedin.com/in/username">
                            </div>
                            <div class="form-group">
                                <label>X (Twitter)</label>
                                <input type="text" name="team[${teamCount}][socials][x]" placeholder="https://x.com/username">
                            </div>
                            <div class="form-group">
                                <label>GitHub</label>
                                <input type="text" name="team[${teamCount}][socials][github]" placeholder="https://github.com/username">
                            </div>
                            <div class="form-group">
                                <label>Instagram</label>
                                <input type="text" name="team[${teamCount}][socials][instagram]" placeholder="https://instagram.com/username">
                            </div>
                            <div class="form-group">
                                <label>Portfolio / Website</label>
                                <input type="text" name="team[${teamCount}][socials][portfolio]" placeholder="https://username.dev">
                            </div>
                        </div>
                        
                        <div style="margin-top:15px;">
                            <label style="font-size:11px; text-transform:none;">Custom Links (e.g. ResearchGate, Blog)</label>
                            <div id="custom-links-container-${teamCount}" style="display:flex; flex-direction:column; gap:8px; margin-top:8px;"></div>
                            <button type="button" class="btn-add" onclick="addCustomLink(${teamCount})" style="font-size:11.5px; padding:6px 12px; margin-top:8px;">+ Add Custom Link</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Upload Photo</label>
                        <input type="file" name="team[${teamCount}][photo]" accept="image/*">
                    </div>
                </div>
            `;
            container.appendChild(newDiv);
            teamCount++;
        }

        function removeTeamMember(id) {
            const item = document.getElementById(`team-item-${id}`);
            if (item) item.remove();
        }

        function addCustomLink(memberId) {
            const container = document.getElementById(`custom-links-container-${memberId}`);
            if (!container) return;
            const linkIndex = container.children.length;
            const newDiv = document.createElement('div');
            newDiv.style.display = 'flex';
            newDiv.style.gap = '10px';
            newDiv.style.alignItems = 'center';
            newDiv.id = `custom-link-${memberId}-${linkIndex}`;
            newDiv.innerHTML = `
                <input type="text" name="team[${memberId}][custom_links][${linkIndex}][label]" placeholder="Label (e.g. ResearchGate)" style="flex:1;">
                <input type="text" name="team[${memberId}][custom_links][${linkIndex}][url]" placeholder="URL (https://...)" style="flex:2;">
                <button type="button" class="btn-remove" onclick="removeCustomLink(${memberId}, ${linkIndex})">Remove</button>
            `;
            container.appendChild(newDiv);
        }

        function removeCustomLink(memberId, linkIndex) {
            const item = document.getElementById(`custom-link-${memberId}-${linkIndex}`);
            if (item) item.remove();
        }

        // ================= CHART CONFIGURATION =================
        const getThemeColors = () => {
            const style = getComputedStyle(document.documentElement);
            const primary = style.getPropertyValue('--primary-color').trim() || '#3b82f6';
            const secondary = style.getPropertyValue('--secondary-color').trim() || '#10b981';
            return { primary, secondary };
        };

        document.addEventListener("DOMContentLoaded", () => {
            const ctx = document.getElementById('growthChart');
            if (!ctx) return;

            const colors = getThemeColors();
            const chartCtx = ctx.getContext('2d');
            
            const primaryGradient = chartCtx.createLinearGradient(0, 0, 0, 300);
            primaryGradient.addColorStop(0, colors.primary + '22');
            primaryGradient.addColorStop(1, colors.primary + '00');

            const secondaryGradient = chartCtx.createLinearGradient(0, 0, 0, 300);
            secondaryGradient.addColorStop(0, colors.secondary + '22');
            secondaryGradient.addColorStop(1, colors.secondary + '00');

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: @json($chartLabels),
                    datasets: [
                        {
                            label: 'APK Download Clicks',
                            data: @json($chartDownloads),
                            borderColor: colors.primary,
                            backgroundColor: primaryGradient,
                            borderWidth: 3,
                            fill: true,
                            tension: 0.3,
                            pointBackgroundColor: colors.primary,
                            pointBorderColor: 'rgba(255,255,255,0.4)',
                            pointHoverRadius: 7,
                            yAxisID: 'y'
                        },
                        {
                            label: 'New User Registrations',
                            data: @json($chartUsers),
                            borderColor: colors.secondary,
                            backgroundColor: secondaryGradient,
                            borderWidth: 3,
                            fill: true,
                            tension: 0.3,
                            pointBackgroundColor: colors.secondary,
                            pointBorderColor: 'rgba(255,255,255,0.4)',
                            pointHoverRadius: 7,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#f8fafc',
                                font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' }
                            }
                        },
                        tooltip: {
                            backgroundColor: '#0f172a',
                            titleColor: '#fff',
                            bodyColor: '#cbd5e1',
                            titleFont: { family: 'Plus Jakarta Sans', weight: '700' },
                            bodyFont: { family: 'Plus Jakarta Sans' },
                            padding: 12,
                            cornerRadius: 8,
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 }, precision: 0 },
                            title: { display: true, text: 'Download Clicks', color: '#f8fafc', font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' } }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: { drawOnChartArea: false },
                            ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 }, precision: 0 },
                            title: { display: true, text: 'User Profiles', color: '#f8fafc', font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' } }
                        }
                    }
                }
            });
        });

        // ================= BLOG MODAL AND UTILITIES =================
        function openCreateBlogModal() {
            document.getElementById('create-blog-modal').classList.add('open');
        }

        function closeCreateBlogModal() {
            document.getElementById('create-blog-modal').classList.remove('open');
        }

        function openEditBlogModal(post) {
            document.getElementById('edit-blog-modal').classList.add('open');
            document.getElementById('edit-title').value = post.title;
            document.getElementById('edit-slug').value = post.slug;
            document.getElementById('edit-summary').value = post.summary || '';
            document.getElementById('edit-content').value = post.content;
            document.getElementById('edit-author').value = post.author_name || 'Admin';
            document.getElementById('edit-status').value = post.status || 'draft';
            
            // Set form action dynamically using Laravel's route helper to preserve subdirectory installations
            const updateUrlPattern = "{{ route('cms.blog.update', ['id' => ':id']) }}";
            document.getElementById('edit-blog-form').action = updateUrlPattern.replace(':id', post.id);

            // Display current image state
            const imgStatus = document.getElementById('edit-image-status');
            if (post.image_path) {
                imgStatus.innerHTML = `
                    <div style="margin-top: 8px; padding: 8px; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 12px; color: #10b981; font-weight: 600;">✓ Current featured image exists</span>
                        <label style="font-size: 12px; color: #cbd5e1; display: inline-flex; align-items: center; cursor: pointer; margin-bottom: 0;">
                            <input type="checkbox" name="clear_image" value="1" style="width: auto; margin-right: 6px; cursor: pointer;"> Delete image
                        </label>
                    </div>
                `;
            } else {
                imgStatus.innerHTML = `
                    <div style="margin-top: 8px; padding: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; font-size: 12px; color: #94a3b8;">
                        No featured image uploaded.
                    </div>
                `;
            }

            // Display current video state
            const videoStatus = document.getElementById('edit-video-status');
            if (post.video_path) {
                videoStatus.innerHTML = `
                    <div style="margin-top: 8px; padding: 8px; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 12px; color: #10b981; font-weight: 600;">✓ Current featured video exists</span>
                        <label style="font-size: 12px; color: #cbd5e1; display: inline-flex; align-items: center; cursor: pointer; margin-bottom: 0;">
                            <input type="checkbox" name="clear_video" value="1" style="width: auto; margin-right: 6px; cursor: pointer;"> Delete video
                        </label>
                    </div>
                `;
            } else {
                videoStatus.innerHTML = `
                    <div style="margin-top: 8px; padding: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; font-size: 12px; color: #94a3b8;">
                        No featured video uploaded.
                    </div>
                `;
            }
        }

        // ================= GALLERY MODAL UTILITIES =================
        function openUploadGalleryModal() {
            document.getElementById('upload-gallery-modal').classList.add('open');
        }

        function closeUploadGalleryModal() {
            document.getElementById('upload-gallery-modal').classList.remove('open');
        }

        function closeEditBlogModal() {
            document.getElementById('edit-blog-modal').classList.remove('open');
        }

        function generateSlugSuggest(titleInputId, slugInputId) {
            const titleInput = document.getElementById(titleInputId);
            const slugInput = document.getElementById(slugInputId);
            if (titleInput && slugInput) {
                titleInput.addEventListener('input', function() {
                    slugInput.value = this.value
                        .toLowerCase()
                        .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                        .replace(/\s+/g, '-') // collapse whitespace to -
                        .replace(/-+/g, '-'); // collapse dashes
                });
            }
        }

        // Initialize slug suggestions and check for active tab redirect from session flash
        window.addEventListener('DOMContentLoaded', () => {
            generateSlugSuggest('create-title', 'create-slug');
            generateSlugSuggest('edit-title', 'edit-slug');

            @if(session('active_tab'))
                setTimeout(() => {
                    switchTab('{{ session("active_tab") }}');
                }, 50);
            @endif
        });
    </script>

    <!-- ================= BLOG ACTION MODALS ================= -->
    <!-- Create Blog Article Modal -->
    <div class="modal-overlay" id="create-blog-modal">
        <div class="modal-container">
            <div class="modal-header">
                <h3 class="modal-title">Write New Blog Article</h3>
                <button type="button" class="modal-close" onclick="closeCreateBlogModal()">&times;</button>
            </div>
            <form action="{{ route('cms.blog.store') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="form-grid">
                    <div class="form-group" style="grid-column: span 2;">
                        <label for="create-title">Article Title</label>
                        <input type="text" id="create-title" name="title" placeholder="e.g. KIU Classrooms Finding Guide v1.2" required>
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                        <label for="create-slug">URL Slug (Auto-generated)</label>
                        <input type="text" id="create-slug" name="slug" placeholder="e.g. kiu-classrooms-finding-guide-v1-2">
                    </div>
                    <div class="form-group">
                        <label for="create-author">Author Name</label>
                        <input type="text" id="create-author" name="author_name" value="Admin" placeholder="e.g. Administrator">
                    </div>
                    <div class="form-group">
                        <label for="create-status">Publication Status</label>
                        <select id="create-status" name="status">
                            <option value="draft">Draft (Private)</option>
                            <option value="published">Published (Public)</option>
                        </select>
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                        <label for="create-image">Featured Banner Image</label>
                        <input type="file" id="create-image" name="image" accept="image/*" style="border: 1px dashed rgba(255,255,255,0.1); padding: 12px; border-radius: 12px; width: 100%; cursor: pointer;">
                        <span style="font-size: 11px; color: #94a3b8; margin-top: 6px; display: block;">Supports JPG, PNG, WEBP, SVG (max 10MB). Optional.</span>
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                        <label for="create-video">Featured Banner Video (Replaces Image if uploaded)</label>
                        <input type="file" id="create-video" name="video" accept="video/*" style="border: 1px dashed rgba(255,255,255,0.1); padding: 12px; border-radius: 12px; width: 100%; cursor: pointer;">
                        <span style="font-size: 11px; color: #94a3b8; margin-top: 6px; display: block;">Supports MP4, WEBM, OGG (max 50MB). Optional.</span>
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                        <label for="create-summary">Summary Introduction</label>
                        <textarea id="create-summary" name="summary" rows="3" placeholder="A brief, engaging 1-2 sentence description of the article..." style="resize: vertical;"></textarea>
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                        <label for="create-content">Full Body Content (Markdown & HTML supported)</label>
                        <textarea id="create-content" name="content" rows="12" placeholder="Start typing the article body..." style="resize: vertical;" required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-remove" onclick="closeCreateBlogModal()" style="margin: 0; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1);">Cancel</button>
                    <button type="submit" class="btn-save" style="margin: 0;">Save Article</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit Blog Article Modal -->
    <div class="modal-overlay" id="edit-blog-modal">
        <div class="modal-container">
            <div class="modal-header">
                <h3 class="modal-title">Edit Blog Article</h3>
                <button type="button" class="modal-close" onclick="closeEditBlogModal()">&times;</button>
            </div>
            <form id="edit-blog-form" action="" method="POST" enctype="multipart/form-data">
                @csrf
                <input type="hidden" id="edit-post-id" name="id">
                <div class="form-grid">
                    <div class="form-group" style="grid-column: span 2;">
                        <label for="edit-title">Article Title</label>
                        <input type="text" id="edit-title" name="title" placeholder="e.g. KIU Classrooms Finding Guide v1.2" required>
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                        <label for="edit-slug">URL Slug (Auto-generated)</label>
                        <input type="text" id="edit-slug" name="slug" placeholder="e.g. kiu-classrooms-finding-guide-v1-2">
                    </div>
                    <div class="form-group">
                        <label for="edit-author">Author Name</label>
                        <input type="text" id="edit-author" name="author_name" placeholder="e.g. Administrator">
                    </div>
                    <div class="form-group">
                        <label for="edit-status">Publication Status</label>
                        <select id="edit-status" name="status">
                            <option value="draft">Draft (Private)</option>
                            <option value="published">Published (Public)</option>
                        </select>
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                        <label for="edit-image">Replace Featured Image</label>
                        <input type="file" id="edit-image" name="image" accept="image/*" style="border: 1px dashed rgba(255,255,255,0.1); padding: 12px; border-radius: 12px; width: 100%; cursor: pointer;">
                        <div id="edit-image-status"></div>
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                        <label for="edit-video">Replace Featured Video</label>
                        <input type="file" id="edit-video" name="video" accept="video/*" style="border: 1px dashed rgba(255,255,255,0.1); padding: 12px; border-radius: 12px; width: 100%; cursor: pointer;">
                        <div id="edit-video-status"></div>
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                        <label for="edit-summary">Summary Introduction</label>
                        <textarea id="edit-summary" name="summary" rows="3" placeholder="A brief, engaging 1-2 sentence description of the article..." style="resize: vertical;"></textarea>
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                        <label for="edit-content">Full Body Content (Markdown & HTML supported)</label>
                        <textarea id="edit-content" name="content" rows="12" placeholder="Start typing the article body..." style="resize: vertical;" required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-remove" onclick="closeEditBlogModal()" style="margin: 0; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1);">Cancel</button>
                    <button type="submit" class="btn-save" style="margin: 0;">Save Changes</button>
                </div>
            </form>
        </div>
    </div>

    <!-- ================= GALLERY ACTION MODALS ================= -->
    <div class="modal-overlay" id="upload-gallery-modal">
        <div class="modal-container">
            <div class="modal-header">
                <h3 class="modal-title">Upload Campus Gallery Media</h3>
                <button type="button" class="modal-close" onclick="closeUploadGalleryModal()">&times;</button>
            </div>
            <form action="{{ route('cms.gallery.store') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="form-grid">
                    <div class="form-grid" style="grid-column: span 2; display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 0;">
                        <div class="form-group" style="grid-column: span 2;">
                            <label for="gallery-title">Media Title</label>
                            <input type="text" id="gallery-title" name="title" placeholder="e.g. Graduation Ceremony 2026" required>
                        </div>
                        <div class="form-group">
                            <label for="gallery-type">Media Type</label>
                            <select id="gallery-type" name="type" required>
                                <option value="image">Photo / Image</option>
                                <option value="video">Video Clip</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="gallery-media">Media File</label>
                            <input type="file" id="gallery-media" name="media" required style="border: 1px dashed rgba(255,255,255,0.1); padding: 12px; border-radius: 12px; width: 100%; cursor: pointer;">
                        </div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label for="gallery-thumbnail">Cover / Thumbnail Image (Required for videos, optional for photos)</label>
                            <input type="file" id="gallery-thumbnail" name="thumbnail" accept="image/*" style="border: 1px dashed rgba(255,255,255,0.1); padding: 12px; border-radius: 12px; width: 100%; cursor: pointer;">
                            <span style="font-size: 11px; color: #94a3b8; margin-top: 6px; display: block;">Supports JPG, PNG, WEBP, SVG (max 10MB). Used as a card preview for videos.</span>
                        </div>
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                        <label for="gallery-description">Brief Description / Caption</label>
                        <textarea id="gallery-description" name="description" rows="3" placeholder="A brief description explaining what this photo or video depicts..." style="resize: vertical;"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-remove" onclick="closeUploadGalleryModal()" style="margin: 0; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1);">Cancel</button>
                    <button type="submit" class="btn-save" style="margin: 0;">Upload Media</button>
                </div>
            </form>
        </div>
    </div>
</body>
</html>
