# Scenario: Checkout on mobile viewport (touch)

## 1. Scenario name
User can complete checkout on a mobile viewport using tap gestures

## 2. Preconditions
- Mobile project in playwright.config (`devices['Pixel 7']`: viewport, hasTouch, isMobile)
- Test account and a product in cart (seeded via API in `beforeEach`)

## 3. Steps
1. User opens `/checkout` on mobile viewport
2. User taps the "Pay" button (`touchscreen.tap` or click)
3. User confirms the order

## 4. Validation points
- After tap: `await expect(page).toHaveURL(/\/order-confirmation/)`
- Confirmation heading visible: `await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible()`
- No horizontal scroll at 320px width: `document.documentElement.scrollWidth <= 320`

## 5. Test data
- Test account credentials from env; one product in cart

## 6. Out of scope
- Desktop hover states (do not exist on touch)
- Real payments — mocked PSP on test environment
