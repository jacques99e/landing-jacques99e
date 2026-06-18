import { test, expect } from "@playwright/test";
import { loginToApp, dismissOnboarding } from "./helpers/auth.mjs";
import { apiCall, APP, LANDING, getOwnerToken, getTestStoreId } from "./helpers/api.mjs";

const MODULE_PAGES: Record<string, string[]> = {
  commerce: ["/products", "/sales", "/clients", "/sales/promotions"],
  agriculture: ["/agriculture", "/agriculture/cultures", "/agriculture/journal", "/agriculture/marches"],
  health: ["/health", "/health/patients", "/health/appointments", "/health/followups", "/health/pharmacie"],
  logistics: ["/logistics", "/logistics/deliveries/new", "/logistics/zones", "/logistics/tournee"],
  education: ["/education", "/education/courses/new"],
  blockchain: ["/blockchain", "/blockchain/assets/new", "/blockchain/contracts", "/blockchain/origin"],
};

const CORE_PAGES = [
  "/dashboard",
  "/settings",
  "/settings/notifications",
  "/settings/business",
  "/settings/team",
  "/analytics",
  "/modules",
  "/help",
  "/messages",
  "/insights",
  "/achievements",
];

const PUBLIC_PAGES = ["/suivi", "/formation", "/trace", "/login"];

test.describe("Production — APIs publiques & santé", () => {
  test("health JSON app + landing", async ({ request }) => {
    for (const base of [APP, LANDING]) {
      const res = await request.get(`${base}/api/health`);
      expect(res.status()).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
    }
  });

  test("APIs protégées refusent l'accès anonyme", async ({ request }) => {
    const dummyStore = "00000000-0000-0000-0000-000000000099";
    const paths = [
      `/api/education/courses?store_id=${dummyStore}`,
      `/api/logistics/deliveries?store_id=${dummyStore}`,
      `/api/blockchain/assets?store_id=${dummyStore}`,
      `/api/products?storeId=${dummyStore}`,
      `/api/sales`,
    ];
    for (const path of paths) {
      const res = await request.get(`${APP}${path}`);
      expect(res.status(), path).toBe(401);
    }
  });

  test("pages publiques app répondent", async ({ request }) => {
    for (const path of PUBLIC_PAGES) {
      const res = await request.get(`${APP}${path}`);
      expect(res.status(), path).toBeLessThan(500);
    }
  });

  test("boutique test publique", async ({ request }) => {
    const res = await request.get(`${APP}/boutique/boutique-test-roles-wazo`);
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html.toLowerCase()).toContain("boutique");
  });
});

test.describe("Production — APIs métier (owner authentifié)", () => {
  let token: string;
  let storeId: string;
  let trackingCode: string;
  let courseId: string;
  let inviteCode: string;
  let assetHash: string;

  test.beforeAll(async () => {
    token = await getOwnerToken();
    storeId = await getTestStoreId();
  });

  test("GET modules protégés → 200", async () => {
    const reads = [
      `/api/education/courses?store_id=${storeId}`,
      `/api/logistics/deliveries?store_id=${storeId}`,
      `/api/blockchain/assets?store_id=${storeId}`,
      `/api/products?storeId=${storeId}`,
      `/api/team/members?store_id=${storeId}`,
    ];
    for (const path of reads) {
      const { status } = await apiCall(token, path);
      expect(status, path).toBe(200);
    }
  });

  test("commerce — créer produit via API", async () => {
    const { status, body } = await apiCall(token, "/api/products", {
      method: "POST",
      body: JSON.stringify({
        store_id: storeId,
        name: `E2E Produit ${Date.now()}`,
        price: 1500,
        stock_quantity: 5,
        description: "Test E2E production",
      }),
    });
    expect(status).toBe(200);
    expect(body.product?.id).toBeTruthy();
  });

  test("commerce — enregistrer vente via API", async () => {
    const extId = `e2e-sale-${Date.now()}`;
    const { status, body } = await apiCall(token, "/api/sales", {
      method: "POST",
      body: JSON.stringify({
        store_id: storeId,
        external_local_id: extId,
        total_amount: 2500,
        payment_method: "cash",
        items: [
          {
            product_name: "E2E vente",
            quantity: 1,
            unit_price: 2500,
            subtotal: 2500,
          },
        ],
      }),
    });
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.id).toBeTruthy();
  });

  test("logistique — créer livraison + suivi public", async () => {
    const { status, body } = await apiCall(token, "/api/logistics/deliveries", {
      method: "POST",
      body: JSON.stringify({
        store_id: storeId,
        sender_name: "E2E",
        recipient_name: "Client E2E",
        recipient_phone: "+221770000001",
        address: "Dakar",
      }),
    });
    expect(status).toBe(200);
    trackingCode = body.delivery?.tracking_code;
    expect(trackingCode).toBeTruthy();

    const pub = await fetch(`${APP}/api/logistics/public/${trackingCode}`);
    expect(pub.status).toBe(200);
    const pubBody = await pub.json();
    expect(pubBody.delivery?.tracking_code).toBe(trackingCode);
  });

  test("formation — cours + module + page publique", async () => {
    const title = `E2E Cours ${Date.now()}`;
    const created = await apiCall(token, "/api/education/courses", {
      method: "POST",
      body: JSON.stringify({
        store_id: storeId,
        title,
        description: "Test E2E",
        is_public: true,
      }),
    });
    expect(created.status).toBe(200);
    courseId = created.body.course?.id;
    inviteCode = created.body.course?.invite_code;
    expect(courseId).toBeTruthy();
    expect(inviteCode).toBeTruthy();

    const mod = await apiCall(token, "/api/education/modules", {
      method: "POST",
      body: JSON.stringify({
        course_id: courseId,
        title: "Leçon E2E",
        content: "Contenu test",
        sort_order: 1,
      }),
    });
    expect(mod.status).toBe(200);
    expect(mod.body.success).toBe(true);

    const pub = await fetch(`${APP}/api/education/public/${inviteCode}`);
    expect(pub.status).toBe(200);
    const pubBody = await pub.json();
    expect(pubBody.modules?.length).toBeGreaterThan(0);
    expect(pubBody.course?.title).toBe(title);
  });

  test("santé — créer patient", async () => {
    const { status, body } = await apiCall(token, "/api/health/patients", {
      method: "POST",
      body: JSON.stringify({
        store_id: storeId,
        full_name: `Patient E2E ${Date.now()}`,
        phone: "+221770000002",
        age: 30,
      }),
    });
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.patient?.id).toBeTruthy();
  });

  test("agriculture — créer parcelle", async () => {
    const { status, body } = await apiCall(token, "/api/agriculture/parcels", {
      method: "POST",
      body: JSON.stringify({
        store_id: storeId,
        name: `Parcelle E2E ${Date.now()}`,
        area_hectares: 2.5,
        crop_type: "Maïs",
        stage: "growth",
      }),
    });
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.parcel?.id).toBeTruthy();
  });

  test("blockchain — créer actif + trace publique", async () => {
    const { status, body } = await apiCall(token, "/api/blockchain/assets", {
      method: "POST",
      body: JSON.stringify({
        store_id: storeId,
        name: `Actif E2E ${Date.now()}`,
        asset_type: "product",
        description: "Test production",
      }),
    });
    expect(status).toBe(200);
    assetHash = body.asset?.hash_sha256;
    expect(assetHash).toBeTruthy();

    const pub = await fetch(`${APP}/api/blockchain/public/${assetHash}`);
    expect(pub.status).toBe(200);
  });

  test("agriculture — météo et conseils (session requise)", async () => {
    const weather = await apiCall(token, "/api/agriculture/weather?lat=14.7&lon=-17.4");
    expect(weather.status).toBe(200);

    const tips = await apiCall(token, "/api/agriculture/tips?crop=mais");
    expect(tips.status).toBe(200);
  });
});

test.describe("Production — UI modules (owner connecté)", () => {
  test.beforeEach(async ({ page }) => {
    await loginToApp(page, {
      email: process.env.E2E_OWNER_EMAIL || "test.owner@wazo.africa",
      password: process.env.E2E_OWNER_PASSWORD || "TestOwner2026!",
      appUrl: APP,
    });
    await dismissOnboarding(page);
  });

  for (const path of CORE_PAGES) {
    test(`page core ${path} charge sans erreur 5xx`, async ({ page }) => {
      const response = await page.goto(`${APP}${path}`);
      expect(response?.status() ?? 200).toBeLessThan(500);
      await expect(page.locator("body")).toBeVisible();
    });
  }

  for (const [module, routes] of Object.entries(MODULE_PAGES)) {
    for (const route of routes) {
      test(`UI ${module} — ${route}`, async ({ page }) => {
        const response = await page.goto(`${APP}${route}`);
        expect(response?.status() ?? 200).toBeLessThan(500);
        await expect(page.locator("body")).toBeVisible();
      });
    }
  }

  test("paramètres sync cloud — bouton visible", async ({ page }) => {
    await page.goto(`${APP}/settings/notifications`);
    await expect(page.getByRole("button", { name: /Synchroniser maintenant/i })).toBeVisible();
    await expect(page.getByText(/Sync cloud Supabase/i)).toBeVisible();
  });
});
