# Typing test patterns: fixtures, factories, Page Objects, API clients, mocks

Runnable-style examples. All assume `strict: true` + `noUncheckedIndexedAccess: true` and Biome `noExplicitAny` at error level.

## 1. Fixtures and factories

```ts
// fixtures/user.ts — one source of truth for the shape
const defaultUser = {
  id: 'u-1',
  email: 'test@example.com',
  role: 'customer' as const,
};

export type User = typeof defaultUser;               // derive, don't duplicate
export type Role = User['role'];

export function user(overrides: Partial<User> = {}): User {
  return { ...defaultUser, ...overrides };           // return type inferred as User
}
```

- `as const` on `role` keeps the literal type so `role: 'admin'` in overrides is checked against `'customer' | 'admin'`-style unions when the type is declared as a union explicitly.
- Override one field without retyping the world — that is what `Partial<T>` is for.
- Unique data per run: `user({ email: `t-${crypto.randomUUID()}@example.com` })` (see `test-data-factories`).

## 2. Page Objects

```ts
// pages/cart.page.ts
import type { Page, Locator } from '@playwright/test';

export interface CartPage {
  add(item: { name: string; price: number }): Promise<void>;
  total(): Promise<number>;
  checkout(): Promise<void>;
}

export class CartPageImpl implements CartPage {
  private readonly rows: Locator;
  constructor(private readonly page: Page) {
    this.rows = page.getByRole('row', { name: /cart item/i });
  }
  async add(item: { name: string; price: number }): Promise<void> {
    await this.page.getByRole('button', { name: `add ${item.name}` }).click();
  }
  async total(): Promise<number> {
    const text = await this.page.getByTestId('cart-total').textContent();
    return Number(text?.replace(/[^0-9.]/g, ''));     // textContent: string | null
  }
  async checkout(): Promise<void> {
    await this.page.getByRole('button', { name: 'checkout' }).click();
  }
}

export const openCart = (page: Page): CartPage => new CartPageImpl(page);
```

- The **interface is the contract the test sees**; the class holds locators privately. Tests depend on `CartPage`, so selector refactors touch one file.
- `textContent()` returns `string | null` — handle null, don't `!` it.

## 3. Typed API client for tests

```ts
// api/client.ts
export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; body: unknown };

export async function apiGet<T>(
  request: APIRequestContext,
  url: string,
): Promise<ApiResult<T>> {
  const res = await request.get(url);
  const body: unknown = await res.json().catch(() => undefined);
  return res.ok()
    ? { ok: true, status: res.status(), data: body as T }   // one justified cast, at the boundary
    : { ok: false, status: res.status(), body };
}
```

Usage in a test — narrowing instead of casting:

```ts
test('cart returns items', async ({ request }) => {
  const res = await apiGet<Cart>(request, '/api/cart');
  assert(res.ok);                       // narrows to the ok branch
  expect(res.data.items.length).toBeGreaterThan(0);
});
```

If the backend shape is not trusted, validate it: parse `body` with a type guard or a schema (see `testing-api-contracts` for OpenAPI/JSON Schema validation) instead of `as T`.

## 4. Mocks that type-check

```ts
// Vitest / bun:test style — type the mock against the real module's exports
import type * as cartService from '../src/cart.service';

mock.module('../src/cart.service', () => {
  const real = mock.requireActual<typeof cartService>('../src/cart.service');
  return { ...real, getTotal: () => 42 };   // factory checked against the real module
});
```

- `mock.requireActual<typeof X>` gives the mock factory the real types — a renamed export becomes a compile error in the mock, not a runtime surprise.
- Restore in `afterEach(() => mock.restore())` — leaked mocks are order-dependent flakes.

## 5. Handling `noUncheckedIndexedAccess` in assertions

```ts
const items = await apiGet<Cart>(request, '/api/cart');
assert(items.ok);
const first = items.data.items.at(0);          // CartItem | undefined
if (!first) throw new Error('cart is empty');  // explicit, testable failure
expect(first.name).toBe('Widget');
```

The `undefined` case is a legitimate test branch (empty cart), not noise to silence.

## 6. tsconfig split for app + tests

See `tsconfig-for-tests.md` for the full file. The pattern: root `tsconfig.json` (app, strict) + `tsconfig.test.json` extending it with `"types": ["node", "@playwright/test"]` and `include: ["tests", "e2e"]`; CI runs `tsc --noEmit -p tsconfig.test.json` alongside the app's `tsc --noEmit`.
