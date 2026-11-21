// Interaktywny setup środowiska testowego: `npm run init` pyta o adresy
// i zapisuje .env (gitignored — sekrety nigdy nie lądują w repo).
import { writeFile } from 'node:fs/promises';
import { confirm, intro, outro, text } from '@clack/prompts';

intro('qa-tools — konfiguracja środowiska testowego');

const baseURL = await text({
  message: 'BASE_URL aplikacji testowanej (UI)?',
  placeholder: 'http://localhost:3000',
  defaultValue: 'http://localhost:3000',
  validate: (v) => (v.startsWith('http') ? undefined : 'Podaj pełny URL, np. http://localhost:3000'),
});

const apiURL = await text({
  message: 'API_URL backendu (testy API)?',
  placeholder: 'http://localhost:8080',
});

const saveEnv = await confirm({
  message: 'Zapisać wartości do pliku .env?',
  initialValue: true,
});

if (saveEnv) {
  const env = [`BASE_URL=${baseURL}`, apiURL ? `API_URL=${apiURL}` : null].filter(Boolean).join('\n');
  await writeFile('.env', `${env}\n`);
  outro('Zapisano .env — uruchom testy: npm test');
} else {
  outro(`Ustaw ręcznie: BASE_URL=${baseURL}${apiURL ? ` API_URL=${apiURL}` : ''}, potem: npm test`);
}
