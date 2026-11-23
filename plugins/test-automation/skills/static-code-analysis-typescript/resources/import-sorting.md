# Import Sorting - Biome organizeImports and Legacy Migrations

## Recommended approach: Biome's `organizeImports` assist action

Import organization belongs to Biome's assist, not to a Prettier plugin or an ESLint plugin. `npx biome init` enables it by default:

```json
"assist": {
  "enabled": true,
  "actions": { "source": { "organizeImports": "on" } }
}
```

**Why assist-based import sorting is preferred:**

1. **No extra dependencies** - the organizer ships inside the same binary as the formatter and linter
2. **Applied with the same command** - `biome check --write .` sorts imports alongside formatting and safe lint fixes; no separate `--fix` pass
3. **Works while you type** - the editor extension runs the same assist, so on-save and CLI orderings never diverge
4. **No version-coupled plugin API** - Prettier import-sort plugins are exposed whenever Prettier's plugin API changes; `eslint-plugin-*` variants disappeared together with the ESLint setup
5. **Fast and TypeScript-native** - Biome's own parser, no Babel round-trip

Biome groups imports by origin (URLs, packages, aliases, relative paths) with its own documented ordering. Custom grouping like the old `importOrder` regex arrays is **not** supported - accept Biome's ordering rather than re-implementing the old groups.

## Decision tree: import sorting in an existing project

```
Is assist organizeImports enabled in biome.json?
├── Yes → done; verify no other sorter is active
└── No
   ├── No other sorter active → enable assist organizeImports
   ├── eslint-plugin-simple-import-sort / eslint-plugin-perfectionist still configured
   │   → removed by the ESLint migration (see ./biome-migration.md)
   ├── @trivago/prettier-plugin-sort-imports / @ianvs/prettier-plugin-sort-imports still configured
   │   → removed by the Prettier migration (see ./biome-migration.md)
   └── VS Code "source.organizeImports" enabled
       → disable it; it fights Biome's organizer (fix below)
```

## VS Code conflict

**Symptom:** imports re-order themselves on every save, flipping between two orderings.

**Cause:** VS Code's built-in `source.organizeImports` and Biome's `organizeImports` assist produce different orders.

**Fix:** remove `"source.organizeImports": "explicit"` from `.vscode/settings.json` `editor.codeActionsOnSave` and let the Biome extension own import order. Also remove `esbenp.prettier-vscode` and `dbaeumer.vscode-eslint` from `.vscode/extensions.json` if still recommended; both can grab import handling on save.

## One-time normalization after any sorter change

```bash
npx biome check --write .   # sorts every file once, plus format and safe fixes
git add -A && git commit -m "chore: normalize imports with Biome"
```

Commit the normalization separately from any functional change, so the big mechanical diff never mixes with a reviewable one.

## Legacy plugin notes

- `@trivago/prettier-plugin-sort-imports` - Babel-based parser (slower, less TypeScript-aware), no Prettier 4 support. No reason to keep it when Biome assimilates formatting.
- `@ianvs/prettier-plugin-sort-imports` - a solid fork, but still a Prettier plugin that disappears with the Prettier config.
- `eslint-plugin-simple-import-sort` - a good tool in its day; its job is now done by the assist action with zero dependencies.
- Migrating to Biome **does not port these plugins' grouping rules** - after migration, run the one-time normalization above and review the import diff.
