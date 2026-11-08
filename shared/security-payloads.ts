// 🔒 Kanoniczne payloady i skanery do testów bezpieczeństwa — kopiuj do projektu jako src/data/security-payloads.ts.
// ZASADA: verification only — payloady są KANARKAMI (markery `qa-canary-*`), NIE działają destrukcyjnie.
// Test zawsze assertuje ZACHOWANIE BEZPIECZNE (odrzucenie payloadu, encja zakodowana, brak wycieku).
// Konta testowe tylko przez singleton env (src/config/env.ts) — nigdy process.env bezpośrednio.

// ── Kanarkowe payloady (stałe, zmarkerowane — łatwe do asercji w odpowiedzi) ──

export const XSS_CANARY = 'qa-canary-xss<script>alert(1)</script>';
export const SQLI_CANARY = "qa-canary-sqli' OR '1'='1' --";
export const NOSQLI_CANARY = '{"$ne": null, "qa-canary-nosqli": true}';
export const PATH_TRAVERSAL_CANARY = 'qa-canary-traversal../../../../etc/passwd';
export const SSRF_CANARY = 'http://qa-canary-ssrf.localhost';
export const COMMAND_INJECTION_CANARY = 'qa-canary-cmd; echo pwned';
export const XXE_CANARY = '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY qa-canary-xxe SYSTEM "file:///etc/passwd">]><foo>&qa-canary-xxe;</foo>';
export const DESERIALIZATION_CANARY = 'qa-canary-deser: O:8:"stdClass":0:{}';

/** Wszystkie kanarki w jednym miejscu — do pętli „refleksja payloadu w polu" */
export const CANARIES: readonly string[] = [
  XSS_CANARY,
  SQLI_CANARY,
  NOSQLI_CANARY,
  PATH_TRAVERSAL_CANARY,
  SSRF_CANARY,
  COMMAND_INJECTION_CANARY,
  XXE_CANARY,
  DESERIALIZATION_CANARY,
];

// ── Oczekiwane ZACHOWANIE BEZPIECZNE per klasa (assertuj zawsze to, nie payload) ──

export const SECURE_BEHAVIOR = {
  XSS_REFLECTION: 'payload nie wraca jako raw HTML — encja / sanitization (np. &lt;script&gt;)',
  SQLI: 'parametr parametryzowany — brak SQL error leak, status 4xx, nie 500',
  NOSQLI: 'operator MongoDB ($ne, $gt, $regex z kanarką) odrzucony — 4xx lub brak wpływu na wynik',
  PATH_TRAVERSAL: 'odpowiedź nie zawiera treści pliku systemowego (np. root:)',
  XXE: 'parser XML wyłącza encje zewnętrzne — brak treści /etc/passwd w odpowiedzi',
  DESERIALIZATION: 'obiekt z kanarką odrzucony (400/415) lub zdeserializowany jako string, nie jako obiekt',
  SSRF: 'wewnętrzny URL (localhost/169.254.169.254) zablokowany — brak odpowiedzi z metadanych',
  IDOR: 'obcy zasób → 401/403, nigdy 200 z cudzą treścią',
  AUTH_MISSING: 'brak/nieprawidłowy token → 401, nie 200/redirect do treści',
  MASS_ASSIGNMENT: 'pola z poza whitelisty (np. role, isAdmin) ignorowane w odpowiedzi',
} as const;

// ── Skanery wycieków danych w odpowiedzi (sensitive data exposure) ──

export type LeakType =
  | 'PESEL'
  | 'EMAIL'
  | 'CARD_NUMBER'
  | 'JWT'
  | 'BEARER_TOKEN'
  | 'PASSWORD_FIELD';

export type LeakFinding = {
  type: LeakType;
  match: string; // zamaskowany fragment, NIGDY pełny wyciek w logach
  pattern: string;
};

const LEAK_PATTERNS: ReadonlyArray<{ type: LeakType; pattern: RegExp }> = [
  // PESEL: 11 cyfr, nie przylegają do innych cyfr
  { type: 'PESEL', pattern: /(?<!\d)\d{11}(?!\d)/ },
  // e-mail (jeśli API nie ma go zwracać — zależnie od scope planu)
  { type: 'EMAIL', pattern: /[\w.+-]+@[\w-]+\.[\w.]{2,}/ },
  // nr karty (PAN): 16 cyfr, grupy po 4 (ze spacją/myślnikiem lub bez)
  { type: 'CARD_NUMBER', pattern: /(?<!\d)(?:\d{4}[ -]?){3,4}(?!\d)/ },
  // JWT: header.payload.signature (base64url)
  { type: 'JWT', pattern: /eyJ[\w-]+\.[\w-]+\.[\w-]+/ },
  // surowy token w body (Authorization zwykle nie powinien wyciekać do treści)
  { type: 'BEARER_TOKEN', pattern: /[Bb]earer\s+[A-Za-z0-9._-]{20,}/ },
  // pole password w JSON/JSONB odpowiedzi
  { type: 'PASSWORD_FIELD', pattern: /"(?:password|passwd|pwd)"\s*:\s*"[^"]+"/ },
];

const mask = (s: string): string => (s.length > 6 ? `${s.slice(0, 3)}…${s.slice(-2)}` : '***');

/**
 * Skanuje body odpowiedzi pod kątem wycieków danych osobowych/tajemnic.
 * Użycie: const leaks = scanForLeaks(await response.text());
 * Asercja: expect(leaks, response.url()).toEqual([]);
 * Wynik zawiera ZAMASKOWANE fragmenty — bezpieczny do raportu/logów.
 */
export function scanForLeaks(body: string): LeakFinding[] {
  const findings: LeakFinding[] = [];
  for (const { type, pattern } of LEAK_PATTERNS) {
    for (const match of body.match(pattern) ?? []) {
      findings.push({ type, match: mask(match), pattern: String(pattern) });
    }
  }
  return findings;
}

/** Podstawowe security headers, których obecność warto assertować (per scope planu) */
export const EXPECTED_SECURITY_HEADERS = [
  'x-content-type-options',
  'x-frame-options',
  'content-security-policy',
  'strict-transport-security',
  'referrer-policy',
] as const;
