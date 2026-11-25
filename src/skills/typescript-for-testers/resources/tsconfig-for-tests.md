# tsconfig for test code

Biome lints and formats; **`tsc --noEmit` type-checks — neither replaces the other** (`static-code-analysis-typescript`). Tests deserve the strictest config, because they touch every boundary of the app.

## Recommended layout

```jsonc
// tsconfig.json — the app (also the base for tests)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,                      // includes strictNullChecks
    "noUncheckedIndexedAccess": true,    // arr[0] is T | undefined
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src"]
}
```

```jsonc
// tsconfig.test.json — tests extend the app config
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["node", "@playwright/test"]   // or "vitest/globals", "bun:test"
  },
  "include": ["tests", "e2e", "src/**/*.test.ts"]
}
```

## CI wiring

```jsonc
// package.json scripts
{
  "typecheck": "tsc --noEmit",
  "typecheck:tests": "tsc --noEmit -p tsconfig.test.json"
}
```

Both run in CI (`biome ci` for lint/format, both `tsc` runs for types — see `static-code-analysis-typescript` and `automating-ci-test-pipelines`).

## Flags that matter most in tests

| Flag | Why it matters for tests |
| --- | --- |
| `strict` | null/undefined safety — kills a whole class of runtime flakes at compile time |
| `noUncheckedIndexedAccess` | `arr[0]`, `record[key]` become `T \| undefined` — empty-list cases become explicit test branches |
| `module: NodeNext` + `useNodejsImportProtocol` (Biome) | `node:fs` style imports; ESM/CJS mismatches surface at compile time |
| `skipLibCheck` | don't pay for third-party .d.ts errors you can't fix |
| `types` array | limits ambient globals to what the suite actually uses (catches importing the wrong test framework's globals) |

## Bun and Node 24 note

Bun and Node ≥ 24 execute TypeScript natively (type stripping) — **stripping is not checking**. The runtime will happily run code with type errors; only `tsc --noEmit` catches them. Keep the type gate in CI regardless of runner (`testing-with-bun`).
