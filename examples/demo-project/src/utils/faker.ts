// Kanoniczna instancja @faker-js/faker — kopiuj do projektu jako src/utils/faker.ts.
// Używaj TYLKO w factories (src/api/factories, src/ui/factories) oraz w beforeEach/beforeAll.
// Nigdy nie generuj danych inline w krokach testu.
import { faker } from '@faker-js/faker';
import { fakerPL } from '@faker-js/faker/locale/pl';

// Deterministyczne dane: wywołaj w beforeEach/beforeAll (stały seed per suita lub seed z testInfo).
export function seedFaker(seed: number): void {
  faker.seed(seed);
  fakerPL.seed(seed);
}

export { faker, fakerPL };
