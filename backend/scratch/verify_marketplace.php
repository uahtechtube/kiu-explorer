<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\MarketplaceController;
use Illuminate\Http\Request;

echo "--- VERIFYING MARKETPLACE CONTROLLER ENDPOINTS ---\n";

$controller = new MarketplaceController();

// 1. Verify indexProducts
echo "\n1. Testing indexProducts()...\n";
$request = Request::create('/api/marketplace/products', 'GET', [
    'category' => 'Books'
]);

$response = $controller->indexProducts($request);
echo "Response Status: " . $response->status() . "\n";
$data = json_decode($response->content(), true);

if ($response->status() == 200 && isset($data['data'])) {
    echo "SUCCESS: Fetched active products under category 'Books'!\n";
    echo "Found " . count($data['data']) . " products:\n";
    foreach ($data['data'] as $p) {
        echo "  - [ID: {$p['id']}] {$p['name']} (Price: ₦{$p['price']}, Shop: {$p['shop']['name']})\n";
    }
} else {
    echo "FAILED: indexProducts failed.\n";
    print_r($data);
}

// 2. Verify indexShops
echo "\n2. Testing indexShops()...\n";
$requestShops = Request::create('/api/marketplace/shops', 'GET');
$responseShops = $controller->indexShops($requestShops);
echo "Response Status: " . $responseShops->status() . "\n";
$shopsData = json_decode($responseShops->content(), true);

if ($responseShops->status() == 200 && isset($shopsData['data'])) {
    echo "SUCCESS: Fetched active shops!\n";
    echo "Found " . count($shopsData['data']) . " shops:\n";
    foreach ($shopsData['data'] as $s) {
        echo "  - [ID: {$s['id']}] Name: {$s['name']} (Phone: {$s['contact_phone']})\n";
    }
} else {
    echo "FAILED: indexShops failed.\n";
    print_r($shopsData);
}

echo "\n--- VERIFICATION FINISHED ---\n";
