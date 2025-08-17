# Contributing

Thanks for your interest in contributing!

## Setup
1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` → `.env` and fill MongoDB URI
4. Run `npm run seed` to seed products

## Branch workflow
- `main`: stable branch
- `feature/*`: one feature per branch (merge via PR)

## Testing endpoints
- `GET /api/health` → check DB connection
- `GET /api/products` → list products
- `POST /api/checkout` → simulate order
- See `CONVENTIONS.md` for more API details.

## Commit style
Use [conventional commits](https://www.conventionalcommits.org/):
- `feat: add checkout endpoint`
- `fix: trim price history overflow`
- `docs: update README`

