 # Dynamic Knowledge Base API

Initial Node.js + TypeScript project for an API.

Requirements:
- Node.js LTS (>=18)
- pnpm

## TypeScript

- Version: ^5.4.2 (see `devDependencies.typescript` in `package.json`)

## Package manager

- This project uses pnpm as the package manager.
- Install/activate:
  - With Corepack (recommended):
    - `corepack enable`
    - `corepack prepare pnpm@latest --activate`
  - Or via npm: `npm i -g pnpm`

Scripts:
- pnpm run dev  -> development mode (hot-reload)
- pnpm run build -> compiles TypeScript to `dist`
- pnpm start     -> runs the compiled output

Quick install (bash on Windows):

```bash
pnpm install
pnpm run dev
```

Structure:
- `src/` - TypeScript source code
- `dist/` - compiled output

## Database

- This project uses in-memory data structures for storage during runtime (no external DB).

## Postman Collection

- A ready-to-use Postman collection is included at `postman/Dynamic Knowledge Base API.postman_collection.json`.
- Import it in Postman to quickly try endpoints (auth, topics, resources, users).
- Steps:
  1. Open Postman → Import → Select the JSON file above.
  2. Start the server (`pnpm run dev`). Default base URL: `http://localhost:3000`.
  3. Use the "Login" request to obtain a JWT, then set it as a Bearer token for protected routes.
