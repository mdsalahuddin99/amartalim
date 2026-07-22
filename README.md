# Amar Talim

Islamic magazine + e-learning platform — Bengali UI, Kalpurush font.

## Current state

- **Phase**: React 18 + Vite (Lovable). Frontend complete (~70–80%).
- **Target stack**: Next.js 15 (App Router) + Prisma + Neon Postgres + NextAuth.

## Folder structure (Next.js-mirrored)

```
src/
├── app/                  # Route folders — mirrors Next.js App Router
│   ├── (marketing)/      # Magazine, blogs, library
│   ├── (learn)/          # Courses, lessons, quizzes, certificates
│   ├── (auth)/           # Login, register
│   ├── admin/            # CMS
│   ├── instructor/       # Instructor panel
│   ├── api/              # (empty) — route handlers after migration
│   └── not-found.tsx
├── components/
│   ├── ui/               # shadcn primitives
│   ├── shared/           # navbar, footer, seo
│   ├── blog/             # blog-specific
│   ├── course/           # youtube-player, etc.
│   ├── admin/            # admin CMS UI
│   └── payment/          # bkash, nagad, zinipay buttons
├── lib/
│   ├── prisma.ts         # (stub) Prisma client singleton
│   ├── auth.ts           # (stub) NextAuth config
│   ├── auth-guards.ts    # requireAuth, requireRole
│   ├── cloudinary.ts     # Cloudinary helpers
│   ├── payments/         # bkash, nagad, zinipay
│   ├── validators/       # Zod schemas
│   └── utils.ts
├── server/
│   ├── actions/          # (stub) "use server" mutations
│   └── queries/          # (stub) cached data fetchers
├── hooks/
├── types/                # Shared TS types + next-auth augmentation
├── styles/
├── contexts/             # React contexts (Vite-only, replace post-migration)
└── App.tsx               # React Router — replaced by Next.js routing after migration

prisma/
├── schema.prisma         # Full data model — ready for Next.js
└── seed.ts
```

## Migration to Next.js (after frontend is done)

1. Export this project to GitHub.
2. Create a new Next.js app: `pnpm create next-app@latest amar-talim`.
3. Copy `src/app/`, `src/components/`, `src/lib/`, `src/server/`, `src/types/`, `prisma/` into the new project.
4. Delete `src/App.tsx`, `src/main.tsx`, `src/contexts/` — replace with Next.js root `layout.tsx`.
5. Replace `react-router-dom` imports with `next/link` + `next/navigation`.
6. Replace `<img>` with `next/image`, asset imports with `/public` references.
7. Install Prisma + NextAuth, paste `.env.example` values, run `prisma migrate dev`.
8. Implement stub files in `src/lib/` and `src/server/`.

See `/mnt/documents/amar-talim-nextjs-structure.md` for the full migration blueprint.

## Design tokens

- Primary: `#2C6E49` (green), Accent: `#FFD700` (gold)
- Background: `#F9F9F9`, Text: `#333333`
- Font: Kalpurush (Bengali)
- **Constraint**: no female imagery.
