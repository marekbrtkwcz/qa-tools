# Layer Placement

Ask of each behaviour: what is the cheapest test that would fail if this broke?

## Layers

| Layer | Proves | Does not prove | Typical runner |
| --- | --- | --- | --- |
| Unit | rules, calculations, transformations, state machines, error handling inside one module | wiring, I/O, rendering | Vitest, Jest |
| Component | rendering states, widget behaviour, form validation, per-component accessibility | routing, sessions, real data | Playwright component testing, Testing Library |
| API / integration | status codes, permissions, validation, persistence, business rules behind an endpoint | how errors look to the user | Playwright `request`, Supertest |
| Contract | the shape agreed between consumer and provider | behaviour behind the shape | Pact, schema validation |
| E2E | journeys across pages, auth and redirects, cookies, third-party iframes, the integration of everything | edge cases cheaply | Playwright Test |
| Non-functional | accessibility, visual appearance, performance | functional correctness | axe, `toHaveScreenshot`, k6 |

## Placement matrix (starting point)

| Behaviour | Layer | Why |
| --- | --- | --- |
| Price, discount, tax rules and their boundaries | Unit | exhaustive cases are cheap |
| Form field validation messages | Component | no backend needed to show them |
| Role X cannot delete resource Y | API | permission is backend logic; a matrix of roles is cheap at this layer |
| Create, read, update, delete persistence | API | data integrity matters more than UI |
| Error response shapes and status codes | API | |
| How an API error is shown to the user | Component (stubbed response) | |
| Login, logout, session expiry, redirects | E2E | cookies and navigation |
| Checkout across several pages, with payment iframe | E2E, payment provider stubbed for negative cases | multi-page, third-party |
| Search results rendering | Component; query logic in API | |
| Layout at breakpoints, theme | Visual | |
| Keyboard navigation and ARIA of a widget | Component + axe | |
| Shape of a provider's responses that the frontend relies on | Contract | |

## Signals a test is on the wrong layer

- an E2E test that fills a form only to check one validation message: push down to component
- an E2E test that loops over roles to check a permission: push down to API
- an E2E test with ten data variations of one calculation: one E2E case stays, the variations go to unit
- a unit test with six mocks of owned modules: the behaviour is integration; test it at the API or integration layer
- an API test that asserts on HTML: the behaviour is UI; component or E2E
- a component test that needs a running backend: either stub the backend or it is an E2E test

## Branch: component tests - when the layer applies and when it does not

Component tests pay rent when a behaviour lives **inside** one component and its states are cheap to enumerate: validation messages, loading/error/success states, widget ARIA, prop-driven rendering. Two placement rules keep them from becoming a second, worse E2E suite:

- **Component, not page**: if the test needs routing, a session, or another component to observe the result, it is not a component test - push it to the E2E layer or restructure the component's contract.
- **Stub the transport, own the owner**: mock the network at the fetch/MSW layer, never the app's own store or hooks - a component test with six `vi.mock` shims of owned modules proves the mocks, not the component (`mocking-network-and-time` owns the layer choice).

Runner placement differs; the layer does not: Playwright component mode, Vitest+Testing Library, Storybook interactions are all the same layer - pick one per project and record which (`component-testing-vitest-rtl` for the JS stack).

## Branch: mobile - which layer owns what on a device surface

"Mobile" splits into three layers with different owners; conflating them is how device farms end up running tests that a unit layer should have caught:

| Behaviour | Layer | Why |
| --- | --- | --- |
| ViewModel/presenter logic, offline queueing rules, platform branching in JS/TS/Dart/Kotlin/Swift | Unit | no device needed; exhaustive cases are cheap |
| Rendered UI of one screen, state transitions | Component (Widget/unit-UI test) where the framework supports it (Flutter widget tests, Compose previews) | seconds, no emulator |
| Journey across screens with OS behaviour: permissions, deep links, notifications, biometrics, backgrounds/foregrounds | Device E2E (Maestro first / Appium at grid scale - `mobile-app-testing`) | only a real device proves OS integration |
| Responsive layout of a web app at mobile viewports | Visual at viewport (this suite, `running-visual-regression-tests`) - not the device layer | a browser at 390px is not an emulator, and does not need one |

Signals a mobile test is on the wrong layer: a device suite looping over calculation variants (push to unit), a device test asserting a server response shape (push to API/contract), or an emulator farm used to check CSS breakpoints (push to visual).

## Push-down checklist (for an existing suite)

1. List E2E tests by runtime and by count per feature.
2. For each feature with more than a handful of E2E tests, mark which tests prove a journey and which prove a rule.
3. For each rule-test, name the lower-layer test that would replace it, and whether it already exists.
4. Write the lower-layer test first, see it fail against broken behaviour, then delete the E2E variant.
5. Keep one E2E test per journey that proves the pieces are wired together.

Record the counts before and after. The aim is a faster suite with the same or better defect detection, not a prettier ratio.
