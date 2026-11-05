// Kanoniczny SINGLETON zmiennych środowiskowych: dotenv + zod.
// Kopiuj do projektu jako src/config/env.ts i dostosuj schemat do projektu.
// Moduły Node są cache'owane — jeden import = jedna instancja w całym procesie.
// W testach/kodzie używaj `env.X` (nigdy process.env bezpośrednio).
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  BASE_URL: z.string().url(),
  API_URL: z.string().url().optional(),
  OPENAPI_SPEC: z.string().default('docs/openapi/openapi.json'),
  // Logger requestów API (fixture api.logger.fixture.ts) — 'true' / 'false'
  LOGGER: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
  // Konta testowe — tylko środowisko testowe
  TEST_USER_EMAIL: z.string().email().optional(),
  TEST_USER_PASSWORD: z.string().min(1).optional(),
  TEST_ADMIN_EMAIL: z.string().email().optional(),
  TEST_ADMIN_PASSWORD: z.string().min(1).optional(),
  DATABASE_URL: z.string().optional(),
  K6_TARGET_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Nieprawidłowe zmienne środowiskowe (.env):\n${issues}`);
}

export const env = Object.freeze(parsed.data);
export type Env = z.infer<typeof envSchema>;
