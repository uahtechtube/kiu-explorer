<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use App\Models\Product;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class MarketplaceController extends Controller
{
    /**
     * Helper to upload base64 image
     */
    private function uploadBase64Image($base64String, $folder = 'marketplace')
    {
        if (!$base64String) {
            return null;
        }

        try {
            if (strpos($base64String, 'data:image') === 0) {
                // Base64 Data URI
                $image = str_replace('data:image/', '', $base64String);
                $image = explode(';base64,', $image);
                $extension = $image[0];
                $imageData = base64_decode($image[1]);
            } elseif (strpos($base64String, 'file://') === 0 || strpos($base64String, '/') === 0) {
                // File Path
                $filePath = str_replace('file://', '', $base64String);
                if (file_exists($filePath)) {
                    $imageData = file_get_contents($filePath);
                    $extension = pathinfo($filePath, PATHINFO_EXTENSION);
                } else {
                    throw new \Exception('Image file not found');
                }
            } else {
                // Raw Base64
                $imageData = base64_decode($base64String);
                $extension = 'jpg'; // default
            }

            $fileName = uniqid() . '_' . time() . '.' . $extension;
            $path = $folder . '/' . $fileName;

            Storage::disk('public')->put($path, $imageData);

            return 'storage/' . $path;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Helper to upload base64 image/video media
     */
    private function uploadBase64Media($base64String, $folder = 'marketplace')
    {
        if (!$base64String) {
            return null;
        }

        try {
            if (strpos($base64String, 'data:') === 0) {
                // Base64 Data URI (supports image/png, video/mp4, etc.)
                $typeSplit = explode(';base64,', $base64String);
                $mimeType = str_replace('data:', '', $typeSplit[0]);
                $extension = explode('/', $mimeType)[1] ?? 'dat';
                
                if (strpos($extension, 'quicktime') !== false) {
                    $extension = 'mov';
                }
                
                $fileData = base64_decode($typeSplit[1]);
            } elseif (strpos($base64String, 'file://') === 0 || strpos($base64String, '/') === 0) {
                // File Path
                $filePath = str_replace('file://', '', $base64String);
                if (file_exists($filePath)) {
                    $fileData = file_get_contents($filePath);
                    $extension = pathinfo($filePath, PATHINFO_EXTENSION);
                } else {
                    throw new \Exception('Media file not found');
                }
            } else {
                // Raw Base64
                $fileData = base64_decode($base64String);
                $extension = 'jpg';
            }

            $fileName = uniqid() . '_' . time() . '.' . $extension;
            $path = $folder . '/' . $fileName;

            Storage::disk('public')->put($path, $fileData);

            return 'storage/' . $path;
        } catch (\Exception $e) {
            return null;
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                         STUDENT SHOP ENDPOINTS                             */
    /* -------------------------------------------------------------------------- */

    /**
     * Get all active shops
     */
    public function indexShops(Request $request)
    {
        $query = Shop::where('status', 'active');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        $shops = $query->latest()->paginate(15);

        return response()->json($shops);
    }

    /**
     * Get the authenticated user's shop
     */
    public function myShop(Request $request)
    {
        $shop = Shop::with('products')->where('user_id', $request->user()->id)->first();

        if (!$shop) {
            return response()->json([
                'has_shop' => false,
                'message' => 'You do not have a shop yet.'
            ]);
        }

        return response()->json([
            'has_shop' => true,
            'shop' => $shop
        ]);
    }

    /**
     * Create a shop
     */
    public function storeShop(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'contact_phone' => 'required|string|max:20',
            'whatsapp_number' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:255',
            'logo' => 'nullable|string', // base64
            'banner' => 'nullable|string', // base64
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Check if user already has a shop
        $existingShop = Shop::where('user_id', $request->user()->id)->first();
        if ($existingShop) {
            return response()->json(['message' => 'You can only create one shop.'], 400);
        }

        $logoPath = null;
        if ($request->has('logo') && $request->logo) {
            $logoPath = $this->uploadBase64Image($request->logo, 'marketplace/logos');
        }

        $bannerPath = null;
        if ($request->has('banner') && $request->banner) {
            $bannerPath = $this->uploadBase64Image($request->banner, 'marketplace/banners');
        }

        $shop = Shop::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'description' => $request->description,
            'logo' => $logoPath,
            'banner' => $bannerPath,
            'contact_phone' => $request->contact_phone,
            'whatsapp_number' => $request->whatsapp_number,
            'contact_email' => $request->contact_email,
            'status' => 'active'
        ]);

        return response()->json([
            'message' => 'Shop created successfully!',
            'shop' => $shop
        ], 201);
    }

    /**
     * Update shop details
     */
    public function updateShop(Request $request, $id)
    {
        $shop = Shop::where('user_id', $request->user()->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'contact_phone' => 'sometimes|required|string|max:20',
            'whatsapp_number' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:255',
            'logo' => 'nullable|string', // base64
            'banner' => 'nullable|string', // base64
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->only(['name', 'description', 'contact_phone', 'whatsapp_number', 'contact_email']);

        if ($request->has('logo') && $request->logo) {
            // Delete old logo
            if ($shop->logo && Storage::disk('public')->exists(str_replace('storage/', '', $shop->logo))) {
                Storage::disk('public')->delete(str_replace('storage/', '', $shop->logo));
            }
            $data['logo'] = $this->uploadBase64Image($request->logo, 'marketplace/logos');
        }

        if ($request->has('banner') && $request->banner) {
            // Delete old banner
            if ($shop->banner && Storage::disk('public')->exists(str_replace('storage/', '', $shop->banner))) {
                Storage::disk('public')->delete(str_replace('storage/', '', $shop->banner));
            }
            $data['banner'] = $this->uploadBase64Image($request->banner, 'marketplace/banners');
        }

        $shop->update($data);

        return response()->json([
            'message' => 'Shop updated successfully!',
            'shop' => $shop
        ]);
    }

    /**
     * Delete shop
     */
    public function destroyShop(Request $request, $id)
    {
        $shop = Shop::where('user_id', $request->user()->id)->findOrFail($id);
        
        // Clean up media files
        if ($shop->logo && Storage::disk('public')->exists(str_replace('storage/', '', $shop->logo))) {
            Storage::disk('public')->delete(str_replace('storage/', '', $shop->logo));
        }
        if ($shop->banner && Storage::disk('public')->exists(str_replace('storage/', '', $shop->banner))) {
            Storage::disk('public')->delete(str_replace('storage/', '', $shop->banner));
        }

        $shop->delete();

        return response()->json([
            'message' => 'Shop deleted successfully.'
        ]);
    }

    /* -------------------------------------------------------------------------- */
    /*                        STUDENT PRODUCT ENDPOINTS                           */
    /* -------------------------------------------------------------------------- */

    /**
     * Get listed active products
     */
    public function indexProducts(Request $request)
    {
        $query = Product::with('shop.owner')
            ->where('status', 'active')
            ->whereHas('shop', function ($q) {
                $q->where('status', 'active');
            });

        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        if ($request->has('shop_id') && $request->shop_id) {
            $query->where('shop_id', $request->shop_id);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $products = $query->latest()->paginate(20);

        return response()->json($products);
    }

    /**
     * Show single product with parent shop details and reviews
     */
    public function showProduct(Request $request, $id)
    {
        $product = Product::with(['shop.owner', 'reviews.user:id,surname,first_name,passport_photograph'])->findOrFail($id);

        // Compute review stats
        $ratingsCount = $product->reviews->count();
        $averageRating = $ratingsCount > 0 ? round($product->reviews->avg('rating'), 1) : 0;
        
        $product->average_rating = $averageRating;
        $product->ratings_count = $ratingsCount;

        return response()->json($product);
    }

    /**
     * Create product under user's shop
     */
    public function storeProduct(Request $request)
    {
        $shop = Shop::where('user_id', $request->user()->id)->first();
        if (!$shop) {
            return response()->json(['message' => 'You must create a shop first.'], 400);
        }

        if ($shop->status === 'suspended') {
            return response()->json(['message' => 'Your shop is suspended. Please contact admin.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:100',
            'image' => 'nullable|string', // base64
            'gallery' => 'nullable|array',
            'gallery.*.type' => 'required|in:image,video',
            'gallery.*.file' => 'required|string', // base64 file content
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $imagePath = null;
        if ($request->has('image') && $request->image) {
            $imagePath = $this->uploadBase64Image($request->image, 'marketplace/products');
        }

        $galleryData = [];
        if ($request->has('gallery') && is_array($request->gallery)) {
            foreach ($request->gallery as $item) {
                if (isset($item['file']) && isset($item['type'])) {
                    $mediaPath = $this->uploadBase64Media($item['file'], 'marketplace/products/gallery');
                    if ($mediaPath) {
                        $galleryData[] = [
                            'type' => $item['type'],
                            'url' => $mediaPath
                        ];
                    }
                }
            }
        }

        $product = Product::create([
            'shop_id' => $shop->id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'image_url' => $imagePath,
            'gallery' => $galleryData,
            'category' => $request->category,
            'status' => 'active'
        ]);

        return response()->json([
            'message' => 'Product listed successfully!',
            'product' => $product
        ], 201);
    }

    /**
     * Update product details
     */
    public function updateProduct(Request $request, $id)
    {
        $shop = Shop::where('user_id', $request->user()->id)->first();
        if (!$shop) {
            return response()->json(['message' => 'Shop not found.'], 404);
        }

        $product = Product::where('shop_id', $shop->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'category' => 'sometimes|required|string|max:100',
            'status' => 'sometimes|required|in:active,sold_out',
            'image' => 'nullable|string', // base64
            'gallery' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->only(['name', 'description', 'price', 'category', 'status']);

        if ($request->has('image') && $request->image) {
            // Delete old image
            if ($product->image_url && Storage::disk('public')->exists(str_replace('storage/', '', $product->image_url))) {
                Storage::disk('public')->delete(str_replace('storage/', '', $product->image_url));
            }
            $data['image_url'] = $this->uploadBase64Image($request->image, 'marketplace/products');
        }

        if ($request->has('gallery') && is_array($request->gallery)) {
            // Clean up old gallery files
            $oldGallery = $product->gallery ?: [];
            foreach ($oldGallery as $item) {
                $cleanPath = str_replace('storage/', '', $item['url']);
                if (Storage::disk('public')->exists($cleanPath)) {
                    Storage::disk('public')->delete($cleanPath);
                }
            }

            $galleryData = [];
            foreach ($request->gallery as $item) {
                if (isset($item['file']) && isset($item['type'])) {
                    $mediaPath = $this->uploadBase64Media($item['file'], 'marketplace/products/gallery');
                    if ($mediaPath) {
                        $galleryData[] = [
                            'type' => $item['type'],
                            'url' => $mediaPath
                        ];
                    }
                } elseif (isset($item['url']) && isset($item['type'])) {
                    // Keep existing media file
                    $galleryData[] = [
                        'type' => $item['type'],
                        'url' => $item['url']
                    ];
                }
            }
            $data['gallery'] = $galleryData;
        }

        $product->update($data);

        return response()->json([
            'message' => 'Product updated successfully!',
            'product' => $product
        ]);
    }

    /**
     * Delete product
     */
    public function destroyProduct(Request $request, $id)
    {
        $shop = Shop::where('user_id', $request->user()->id)->first();
        if (!$shop) {
            return response()->json(['message' => 'Shop not found.'], 404);
        }

        $product = Product::where('shop_id', $shop->id)->findOrFail($id);

        // Delete main image file
        if ($product->image_url && Storage::disk('public')->exists(str_replace('storage/', '', $product->image_url))) {
            Storage::disk('public')->delete(str_replace('storage/', '', $product->image_url));
        }

        // Delete all gallery files
        if ($product->gallery && is_array($product->gallery)) {
            foreach ($product->gallery as $item) {
                $cleanPath = str_replace('storage/', '', $item['url']);
                if (Storage::disk('public')->exists($cleanPath)) {
                    Storage::disk('public')->delete($cleanPath);
                }
            }
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully.'
        ]);
    }

    /* -------------------------------------------------------------------------- */
    /*                         ADMIN MODERATION ENDPOINTS                         */
    /* -------------------------------------------------------------------------- */

    /**
     * List all shops for administration
     */
    public function adminIndexShops(Request $request)
    {
        $query = Shop::with(['owner', 'products']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhereHas('owner', function($q) use ($search) {
                      $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('surname', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $shops = $query->latest()->paginate(25);

        return response()->json($shops);
    }

    /**
     * Suspend/activate a shop (Admin Only)
     */
    public function adminUpdateShopStatus(Request $request, $id)
    {
        $shop = Shop::findOrFail($id);

        $request->validate([
            'status' => 'required|in:active,suspended'
        ]);

        $oldStatus = $shop->status;
        $shop->update(['status' => $request->status]);

        // Create Audit Log
        try {
            AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => $request->status === 'suspended' ? 'Suspended Shop' : 'Activated Shop',
                'model_type' => Shop::class,
                'model_id' => $shop->id,
                'old_values' => ['status' => $oldStatus],
                'new_values' => ['status' => $request->status],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
        } catch (\Exception $e) {}

        return response()->json([
            'message' => "Shop status successfully updated to {$request->status}.",
            'shop' => $shop
        ]);
    }

    /**
     * Force delete student shop (Admin Only)
     */
    public function adminDestroyShop(Request $request, $id)
    {
        $shop = Shop::findOrFail($id);

        // Delete files
        if ($shop->logo && Storage::disk('public')->exists(str_replace('storage/', '', $shop->logo))) {
            Storage::disk('public')->delete(str_replace('storage/', '', $shop->logo));
        }
        if ($shop->banner && Storage::disk('public')->exists(str_replace('storage/', '', $shop->banner))) {
            Storage::disk('public')->delete(str_replace('storage/', '', $shop->banner));
        }

        // Keep info for audit log
        $shopName = $shop->name;
        $shop->delete();

        // Create Audit Log
        try {
            AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => 'Admin Deleted Shop',
                'model_type' => Shop::class,
                'model_id' => $id,
                'old_values' => ['name' => $shopName],
                'new_values' => ['deleted' => true],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
        } catch (\Exception $e) {}

        return response()->json([
            'message' => 'Shop and all its products successfully deleted by Administrator.'
        ]);
    }

    /**
     * List all products for administration
     */
    public function adminIndexProducts(Request $request)
    {
        $query = Product::with(['shop.owner']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $products = $query->latest()->paginate(25);

        return response()->json($products);
    }

    /**
     * Suspend/activate a product (Admin Only)
     */
    public function adminUpdateProductStatus(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'status' => 'required|in:active,suspended,sold_out'
        ]);

        $oldStatus = $product->status;
        $product->update(['status' => $request->status]);

        // Create Audit Log
        try {
            AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => 'Admin Updated Product Status',
                'model_type' => Product::class,
                'model_id' => $product->id,
                'old_values' => ['status' => $oldStatus],
                'new_values' => ['status' => $request->status],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
        } catch (\Exception $e) {}

        return response()->json([
            'message' => "Product status successfully updated to {$request->status}.",
            'product' => $product
        ]);
    }

    /**
     * Force delete student product (Admin Only)
     */
    public function adminDestroyProduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // Delete main image file
        if ($product->image_url && Storage::disk('public')->exists(str_replace('storage/', '', $product->image_url))) {
            Storage::disk('public')->delete(str_replace('storage/', '', $product->image_url));
        }

        // Delete all gallery files
        if ($product->gallery && is_array($product->gallery)) {
            foreach ($product->gallery as $item) {
                $cleanPath = str_replace('storage/', '', $item['url']);
                if (Storage::disk('public')->exists($cleanPath)) {
                    Storage::disk('public')->delete($cleanPath);
                }
            }
        }

        $productName = $product->name;
        $product->delete();

        // Create Audit Log
        try {
            AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => 'Admin Deleted Product',
                'model_type' => Product::class,
                'model_id' => $id,
                'old_values' => ['name' => $productName],
                'new_values' => ['deleted' => true],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
        } catch (\Exception $e) {}

        return response()->json([
            'message' => 'Product successfully deleted by Administrator.'
        ]);
    }

    /* -------------------------------------------------------------------------- */
    /*                         PRODUCT REVIEW ENDPOINTS                           */
    /* -------------------------------------------------------------------------- */

    /**
     * Get reviews for a product
     */
    public function getReviews($id)
    {
        $reviews = \App\Models\ProductReview::with('user:id,surname,first_name,passport_photograph')
            ->where('product_id', $id)
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    /**
     * Store a product review
     */
    public function storeReview(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'description' => 'nullable|string',
            'media_type' => 'required|in:image,video,none',
            'media_file' => 'nullable|string', // base64
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $mediaPath = null;
        if ($request->has('media_file') && $request->media_file && $request->media_type !== 'none') {
            $mediaPath = $this->uploadBase64Media($request->media_file, 'marketplace/reviews');
        }

        $review = \App\Models\ProductReview::create([
            'product_id' => $product->id,
            'user_id' => $request->user()->id,
            'rating' => $request->rating,
            'description' => $request->description,
            'media_type' => $request->media_type,
            'media_url' => $mediaPath,
        ]);

        $review->load('user:id,surname,first_name,passport_photograph');

        return response()->json([
            'message' => 'Review posted successfully!',
            'review' => $review
        ], 201);
    }

    /**
     * Delete a product review
     */
    public function destroyReview(Request $request, $id)
    {
        $review = \App\Models\ProductReview::findOrFail($id);

        if ($review->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($review->media_url && Storage::disk('public')->exists(str_replace('storage/', '', $review->media_url))) {
            Storage::disk('public')->delete(str_replace('storage/', '', $review->media_url));
        }

        $review->delete();

        return response()->json(['message' => 'Review deleted successfully.']);
    }
}
