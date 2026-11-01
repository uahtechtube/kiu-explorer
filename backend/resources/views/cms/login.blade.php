<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CMS Management Portal - Login</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --primary-color: #09a5db;
            --bg-dark: #090d16;
            --bg-card: rgba(17, 25, 40, 0.75);
            --border-color: rgba(255, 255, 255, 0.08);
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --transition-smooth: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            overflow: hidden;
            position: relative;
        }

        /* Ambient Glow Backgrounds */
        .glow-sphere {
            position: absolute;
            border-radius: 50%;
            filter: blur(140px);
            z-index: 0;
            pointer-events: none;
            opacity: 0.35;
        }

        .glow-1 {
            width: 400px;
            height: 400px;
            background: var(--primary-color);
            top: -100px;
            right: -100px;
        }

        .glow-2 {
            width: 400px;
            height: 400px;
            background: #a855f7;
            bottom: -100px;
            left: -100px;
        }

        .login-container {
            width: 100%;
            max-width: 440px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 24px;
            padding: 40px;
            backdrop-filter: blur(20px);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
            z-index: 10;
            display: flex;
            flex-direction: column;
            gap: 30px;
        }

        .login-header {
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .logo-mark {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-family: 'Outfit', sans-serif;
            font-size: 22px;
            font-weight: 800;
            text-decoration: none;
            color: #fff;
            margin-bottom: 5px;
        }

        .logo-mark span {
            color: var(--primary-color);
        }

        .logo-dot {
            width: 8px;
            height: 8px;
            background-color: var(--primary-color);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--primary-color);
        }

        .login-header h1 {
            font-size: 24px;
            font-weight: 700;
        }

        .login-header p {
            color: var(--text-secondary);
            font-size: 14px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 20px;
        }

        label {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        input {
            width: 100%;
            padding: 14px 20px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            color: var(--text-primary);
            font-size: 15px;
            outline: none;
            transition: var(--transition-smooth);
        }

        input:focus {
            border-color: var(--primary-color);
            background: rgba(255, 255, 255, 0.06);
            box-shadow: 0 0 12px color-mix(in srgb, var(--primary-color) 20%, transparent);
        }

        .btn-submit {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 80%, #000));
            color: #fff;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 15px color-mix(in srgb, var(--primary-color) 25%, transparent);
            transition: var(--transition-smooth);
            margin-top: 10px;
        }

        .btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px color-mix(in srgb, var(--primary-color) 45%, transparent);
        }

        .alert-error {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #f87171;
            padding: 12px 18px;
            border-radius: 10px;
            font-size: 13.5px;
            margin-bottom: 5px;
            text-align: center;
        }

        .alert-success {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            color: #34d399;
            padding: 12px 18px;
            border-radius: 10px;
            font-size: 13.5px;
            margin-bottom: 5px;
            text-align: center;
        }

        .back-link {
            text-align: center;
            font-size: 13.5px;
        }

        .back-link a {
            color: var(--text-secondary);
            text-decoration: none;
            transition: var(--transition-smooth);
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .back-link a:hover {
            color: var(--primary-color);
        }
    </style>
</head>
<body>
    <div class="glow-sphere glow-1"></div>
    <div class="glow-sphere glow-2"></div>

    <div class="login-container">
        <div class="login-header">
            <a href="/" class="logo-mark">
                <div class="logo-dot"></div>
                KIU<span>Explorer</span>
            </a>
            <h1>Administrator CMS</h1>
            <p>Sign in using your admin credentials to customize the landing page content.</p>
        </div>

        @if($errors->any())
            <div class="alert-error">
                {{ $errors->first() }}
            </div>
        @endif

        @if(session('success'))
            <div class="alert-success">
                {{ session('success') }}
            </div>
        @endif

        <form action="{{ route('cms.login') }}" method="POST">
            @csrf
            
            <div class="form-group">
                <label for="email">Admin Email</label>
                <input type="email" id="email" name="email" value="{{ old('email') }}" placeholder="admin@kiu.edu.ng" required autofocus>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" placeholder="••••••••" required>
            </div>

            <button type="submit" class="btn-submit">Authenticate Securely</button>
        </form>

        <div class="back-link">
            <a href="/">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                Back to Landing Page
            </a>
        </div>
    </div>
</body>
</html>
