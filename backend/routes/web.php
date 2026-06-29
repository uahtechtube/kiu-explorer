<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\BlogPostController;
use App\Http\Controllers\GalleryController;

// Public Landing Page and Download Routes
Route::get('/', [LandingPageController::class, 'index'])->name('landing');
Route::get('/download-apk/track', [LandingPageController::class, 'trackDownload'])->name('download.track');
Route::get('/download-apk/mock', [LandingPageController::class, 'downloadMockApk'])->name('download.mock');

// Public Blog & Gallery Routes
Route::get('/blog', [BlogPostController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [BlogPostController::class, 'show'])->name('blog.show');
Route::get('/gallery', [GalleryController::class, 'index'])->name('gallery.index');

// CMS Authentication and Dashboard Routes
Route::get('/cms/login', [LandingPageController::class, 'cmsLoginView'])->name('cms.login');
Route::post('/cms/login', [LandingPageController::class, 'cmsLogin']);
Route::get('/cms/dashboard', [LandingPageController::class, 'cmsDashboard'])->name('cms.dashboard');
Route::post('/cms/settings/update', [LandingPageController::class, 'cmsUpdate'])->name('cms.update');
Route::post('/cms/profile/password', [LandingPageController::class, 'cmsUpdatePassword'])->name('cms.password.update');
Route::post('/cms/admins/create', [LandingPageController::class, 'cmsCreateAdmin'])->name('cms.admin.create');
Route::post('/cms/logout', [LandingPageController::class, 'cmsLogout'])->name('cms.logout');

// CMS Blog Management Routes
Route::post('/cms/blog', [BlogPostController::class, 'store'])->name('cms.blog.store');
Route::post('/cms/blog/{id}/update', [BlogPostController::class, 'update'])->name('cms.blog.update');
Route::post('/cms/blog/{id}/delete', [BlogPostController::class, 'destroy'])->name('cms.blog.destroy');

// CMS Gallery Management Routes
Route::post('/cms/gallery', [GalleryController::class, 'store'])->name('cms.gallery.store');
Route::post('/cms/gallery/{id}/delete', [GalleryController::class, 'destroy'])->name('cms.gallery.destroy');

// Paystack Sandbox Checkout Simulator Page
Route::get('/payments/gateway', function (Request $request) {
    $reference = $request->query('ref');
    $redirectUrl = $request->query('redirect_url');
    $payment = \App\Models\Payment::where('reference', $reference)->firstOrFail();
    
    return "
    <!DOCTYPE html>
    <html>
    <head>
        <title>Paystack Sandbox Simulator</title>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background: #f8fafc;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
            }
            .card {
                background: white;
                border-radius: 24px;
                padding: 40px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
                max-width: 400px;
                width: 90%;
                text-align: center;
                border: 1px solid #f1f5f9;
            }
            .logo {
                color: #09a5db;
                font-size: 28px;
                font-weight: 800;
                margin-bottom: 24px;
            }
            .amount {
                font-size: 36px;
                font-weight: 800;
                color: #0f172a;
                margin-bottom: 8px;
            }
            .ref {
                color: #64748b;
                font-size: 14px;
                margin-bottom: 32px;
            }
            .btn {
                display: block;
                width: 100%;
                padding: 16px;
                border-radius: 16px;
                font-size: 16px;
                font-weight: 700;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
                box-sizing: border-box;
                text-decoration: none;
            }
            .btn-success {
                background: #09a5db;
                color: white;
                margin-bottom: 12px;
                box-shadow: 0 4px 12px rgba(9, 165, 219, 0.2);
            }
            .btn-success:hover {
                background: #078cb8;
            }
            .btn-cancel {
                background: #f1f5f9;
                color: #64748b;
                text-align: center;
                line-height: 16px;
            }
            .btn-cancel:hover {
                background: #e2e8f0;
            }
        </style>
    </head>
    <body>
        <div class='card'>
            <div class='logo'>paystack <span style='font-size:12px; font-weight:bold; color:#64748b; border:1px solid #cbd5e1; padding:2px 6px; border-radius:6px; vertical-align:middle; margin-left:4px;'>SANDBOX</span></div>
            <div style='color: #64748b; font-size: 14px; margin-bottom: 8px; font-weight: 600; text-transform: uppercase;'>Hostel Accommodation Fee</div>
            <div class='amount'>₦" . number_format($payment->amount, 2) . "</div>
            <div class='ref'>Ref: {$reference}</div>
            
            <form action='" . url('/payments/gateway/complete') . "' method='POST'>
                " . csrf_field() . "
                <input type='hidden' name='reference' value='{$reference}'>
                <input type='hidden' name='redirect_url' value='{$redirectUrl}'>
                <button type='submit' class='btn btn-success'>Authorize Successful Payment</button>
            </form>
            <br>
            <a href='{$redirectUrl}' class='btn btn-cancel'>Decline & Cancel</a>
        </div>
    </body>
    </html>
    ";
});

// Paystack Sandbox Simulator Completion
Route::post('/payments/gateway/complete', function (Request $request) {
    $reference = $request->input('reference');
    $redirectUrl = $request->input('redirect_url');
    
    $payment = \App\Models\Payment::where('reference', $reference)->firstOrFail();
    $payment->update([
        'status' => 'paid',
        'transaction_date' => now(),
        'payment_method' => 'card',
    ]);
    
    // Auto-approve hostel booking on successful payment completion (with self-healing bed allocation)
    if ($payment->type === 'hostel') {
        $booking = \App\Models\HostelBooking::where('payment_id', $payment->id)->first();
        if ($booking && $booking->status === 'pending') {
            $room = $booking->room;
            if ($room && $room->available_slots > 0) {
                $booking->update([
                    'status' => 'approved',
                    'approved_at' => now(),
                ]);
                
                $bed = $room->beds()->where('is_occupied', false)->first();
                if ($bed) {
                    $bed->update([
                        'is_occupied' => true,
                        'student_id' => $booking->student_id,
                    ]);
                } else {
                    // Self-healing fallback: create bed dynamically if none exists
                    $room->beds()->create([
                        'bed_number' => 'Bed ' . ($room->capacity - $room->available_slots + 1),
                        'is_occupied' => true,
                        'student_id' => $booking->student_id,
                    ]);
                }
                
                $room->decrement('available_slots');
                if ($room->available_slots === 0) {
                    $room->update(['status' => 'full']);
                }
            }
        }
    }
    
    return "
    <!DOCTYPE html>
    <html>
    <head>
        <title>Payment Successful</title>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background: #f8fafc;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
            }
            .card {
                background: white;
                border-radius: 24px;
                padding: 40px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
                max-width: 400px;
                width: 90%;
                text-align: center;
                border: 1px solid #f1f5f9;
            }
            .icon {
                color: #10b981;
                font-size: 64px;
                margin-bottom: 24px;
            }
            h1 {
                font-size: 24px;
                font-weight: 800;
                color: #0f172a;
                margin: 0 0 12px 0;
            }
            p {
                color: #64748b;
                font-size: 15px;
                line-height: 1.6;
                margin: 0 0 32px 0;
            }
            .btn {
                display: block;
                width: 100%;
                padding: 16px;
                border-radius: 16px;
                font-size: 16px;
                font-weight: 700;
                text-align: center;
                background: #10b981;
                color: white;
                border: none;
                cursor: pointer;
                text-decoration: none;
                box-sizing: border-box;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
            }
            .btn:hover {
                background: #059669;
            }
        </style>
    </head>
    <body>
        <div class='card'>
            <div class='icon'>✓</div>
            <h1>Payment Successful!</h1>
            <p>Your payment of ₦" . number_format($payment->amount, 2) . " has been successfully authorized. Your hostel booking is now approved and room bed is allocated!</p>
            <p style='color:#94a3b8; font-size:12px; margin-top:-16px; margin-bottom:24px;'>Redirecting back to the app in 2 seconds...</p>
            <a href='{$redirectUrl}' class='btn'>Return to App</a>
        </div>
        
        <script>
            // Automatically redirect back to Expo App
            setTimeout(function() {
                var url = '{$redirectUrl}';
                if (url && url !== '#') {
                    window.location.href = url;
                }
            }, 2000);
        </script>
    </body>
    </html>
    ";
});

// Printable Payment Receipt Web View
Route::get('/payments/{reference}/receipt', [\App\Http\Controllers\PaymentController::class, 'downloadReceiptWeb']);
