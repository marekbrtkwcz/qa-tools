# Hybrid UI + API Test Patterns

## Pattern 1: API seed → UI act → UI + API verify

```typescript
test('checkout completes', async ({ page, request }) => {
  const cart = await seedCart(request, [{ sku: 'ABC', qty: 2 }]);
  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Pay' }).click();
  await expect(page.getByText('Thank you')).toBeVisible();
  const order = await getOrder(request, cart.orderId);
  expect(order.status).toBe('paid');
});
```

## Pattern 2: API auth shared with UI

```typescript
// global setup: get token via API, save as storageState
// tests: page loads already authenticated, request fixture shares the token
test.use({ storageState: 'auth/user.json' });
```

## Pattern 3: Verify side effects via API/mock

```typescript
// UI triggers action → verify webhook fired via mock endpoint
await page.getByRole('button', { name: 'Notify' }).click();
const calls = await getWebhookCalls(request, '/webhooks/test');
expect(calls[0].payload.event).toBe('user.notified');
```

## Pattern 4: Cleanup via API

```typescript
afterEach(async ({ request }, testInfo) => {
  if (testInfo.project.metadata.seededIds) {
    await request.delete(`/api/cleanup/${testInfo.project.metadata.seededIds.join(',')}`);
  }
});
```

## Anti-patterns

- ❌ UI setup for state that an API can seed in milliseconds
- ❌ Verifying database state by scraping the UI
- ❌ Duplicating auth logic in UI and API (use shared storageState/token)
