import { test, request, type Page, type APIRequestContext } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const FRONTEND_BASE = process.env.SCREENSHOT_FRONTEND_BASE_URL ?? 'http://127.0.0.1:5500/pages';
const BACKEND_BASE = process.env.SCREENSHOT_BACKEND_BASE_URL ?? 'http://127.0.0.1:8000';
const OUTPUT_DIR = path.resolve('docs/screenshots');

const USER_NAME = process.env.SCREENSHOT_USER_NAME ?? 'UrbanWear Test User';
const USER_EMAIL = process.env.SCREENSHOT_USER_EMAIL ?? 'screenshot.user@urbanwear.local';
const USER_PASSWORD = process.env.SCREENSHOT_USER_PASSWORD ?? 'UrbanWear123!';

test.describe.configure({ mode: 'serial' });

test('capture UrbanWear screenshots', async ({ page }) => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const api = await request.newContext({ baseURL: BACKEND_BASE });

  await capture(page, 'login.png', '/login.html');
  await capture(page, 'register.png', '/register.html');

  await ensureUserExists(api);
  await loginThroughUi(page, USER_EMAIL, USER_PASSWORD);

  await capture(page, 'home.png', '/home.html');

  const product = await getFirstProduct(api);
  if (!product) {
    throw new Error('No products were returned by the API, so screenshots cannot continue.');
  }

  const token = await page.evaluate(() => localStorage.getItem('access_token') || localStorage.getItem('token'));
  if (!token) {
    throw new Error('Login succeeded but no access token was found in localStorage.');
  }

  await addToCart(api, token, product.id);

  await capture(page, 'products.png', '/products.html');
  await capture(page, 'product-details.png', `/product_details.html?id=${product.id}`);
  await capture(page, 'cart.png', '/cart.html');
  await capture(page, 'checkout.png', '/checkout.html');

  const orderId = await placeOrder(api, token);
  await capturePayment(page, orderId, product);

  await capture(page, 'orders.png', '/orders.html');
  await capture(page, 'profile.png', '/profile.html');
  await captureAiChat(page);

  await capture(page, 'admin-dashboard.png', '/admin/dashboard.html');

  await capture(page, 'swagger.png', 'http://127.0.0.1:8000/docs');
});

async function capture(page: Page, fileName: string, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, fileName),
    fullPage: true
  });
}

async function loginThroughUi(page: Page, email: string, password: string) {
  await page.goto('/login.html', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/home\.html$/);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

async function ensureUserExists(api: APIRequestContext) {
  const response = await api.post('/auth/register', {
    data: {
      name: USER_NAME,
      email: USER_EMAIL,
      password: USER_PASSWORD
    }
  });

  if (response.ok()) {
    return;
  }

  if (response.status() !== 400) {
    throw new Error(`Unable to create test user: ${response.status()} ${await response.text()}`);
  }
}

async function getFirstProduct(api: APIRequestContext) {
  const response = await api.get('/products/?page=1&limit=1');

  if (!response.ok()) {
    throw new Error(`Unable to load products: ${response.status()} ${await response.text()}`);
  }

  const payload = await response.json();
  const product = Array.isArray(payload) ? payload[0] : payload?.data?.[0] ?? payload?.products?.[0] ?? payload?.items?.[0];
  return product ?? null;
}

async function addToCart(api: APIRequestContext, token: string, productId: number) {
  const response = await api.post('/cart/', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: {
      product_id: productId,
      quantity: 1
    }
  });

  if (!response.ok()) {
    throw new Error(`Unable to add cart item: ${response.status()} ${await response.text()}`);
  }
}

async function placeOrder(api: APIRequestContext, token: string) {
  const response = await api.post('/orders/', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok()) {
    throw new Error(`Unable to place order: ${response.status()} ${await response.text()}`);
  }

  const payload = await response.json();
  return payload.order_id ?? payload.orderId;
}

async function capturePayment(page: Page, orderId: number, product: any) {
  const price = Number(product?.price ?? 2499);

  await page.addInitScript(
    ({ orderName, priceValue }) => {
      // Seed the payment page's demo data before its script executes.
      (window as any).orderData = {
        product: orderName,
        quantity: 1,
        subtotal: priceValue,
        shipping: 0,
        gst: 0,
        total: priceValue
      };
    },
    { orderName: product?.name ?? 'UrbanWear Order', priceValue: price }
  );

  await page.goto(`/payment.html?order_id=${orderId}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'payment.png'),
    fullPage: true
  });
}

async function captureAiChat(page: Page) {
  await page.goto('/ai_chat.html', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('Type your message here...').fill('Show me the best shoes under 5000');
  await page.getByRole('button', { name: 'Send' }).click();
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'ai-chat.png'),
    fullPage: true
  });
}
