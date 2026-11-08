// Przykładowy interaktywny skrypt CLI — kopiuj do projektu jako scripts/<nazwa>.ts
// Uruchomienie: npm run script -- scripts/<nazwa>.ts   (tsx, ESM)
// Biblioteka promptów: @clack/prompts — tylko gdy skrypt MA być interaktywny.
// W CI / trybie nieinteraktywnym używaj argumentów CLI i env (env.X), nie promptów.
import { cancel, confirm, intro, outro, text } from '@clack/prompts';
import { env } from '../src/config/env.js';

intro('🧪 QA helper script');

const target = await text({
  message: 'Podaj URL środowiska testowego:',
  initialValue: env.BASE_URL,
  validate: (v) => (v.startsWith('http') ? undefined : 'URL musi zaczynać się od http(s)://'),
});

if (typeof target === 'symbol') {
  cancel('Anulowano.');
  process.exit(0);
}

const proceed = await confirm({ message: `Uruchomić na ${target}?` });
if (!proceed) {
  cancel('Anulowano.');
  process.exit(0);
}

// ... logika skryptu (env.X z singletonu, dane z faker, itp.)

outro('✅ Gotowe.');
