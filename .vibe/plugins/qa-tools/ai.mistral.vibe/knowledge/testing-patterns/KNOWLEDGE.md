---
name: testing-patterns
description: Sprawdzone wzorce pisania testów — AAA (Arrange-Act-Assert), Given-When-Then, tabela decyzyjna, testy brzegowe i parametryzowane. Z przykładami w Playwright.
display_name: Wzorce testowe
icon: pattern
---

# Wzorce testowe

## AAA — Arrange, Act, Assert

```typescript
test('adds product to cart', async ({ page }) => {
  // Arrange
  await page.goto('/products/123');

  // Act
  await page.getByRole('button', { name: 'Add to cart' }).click();

  // Assert
  await expect(page.getByRole('status')).toHaveText('Added to cart');
});
```

## Given-When-Then (BDD style)

```typescript
test.describe('Checkout', () => {
  test('given logged-in user with items in cart, when checkout completes, then order is confirmed', async ({ page }) => {
    // Given
    await login(page);
    await addItemToCart(page, 'product-1');

    // When
    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.getByRole('button', { name: 'Place order' }).click();

    // Then
    await expect(page.getByText('Order confirmed')).toBeVisible();
  });
});
```

## Testy parametryzowane (data-driven)

```typescript
const cases = [
  { email: '', error: 'Email is required' },
  { email: 'invalid', error: 'Invalid email format' },
  { email: 'test@test.com', error: null },
];

for (const { email, error } of cases) {
  test(`login with email "${email}"`, async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByRole('button', { name: 'Sign in' }).click();

    if (error) {
      await expect(page.getByRole('alert')).toHaveText(error);
    } else {
      await expect(page).toHaveURL('/dashboard');
    }
  });
}
```

## Tabela decyzyjna

Dla logiki biznesowej z wieloma warunkami:

| Role | Discount | Loyalty | Expected price |
|---|---|---|---|
| guest | no | no | 100% |
| user | yes | no | 90% |
| user | no | yes | 85% |
| user | yes | yes | 75% |
| VIP | any | any | 70% |

Każdy wiersz = osobny test case.

## Testy brzegowe (boundary values)

Dla pól z limitami — testuj wartości na krawędziach:

```
min-1, min, min+1, max-1, max, max+1
np. dla wieku 18-99: 17, 18, 19, 98, 99, 100
```

## Piramida testów

```
    /\    E2E (mało, krytyczne flow)
   /  \   Integration (API + DB)
  /____\  Unit (dużo, szybkie, izolowane)
```

Proporcje: ~70% unit, ~20% integration, ~10% E2E.
