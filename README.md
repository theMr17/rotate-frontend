This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# AI Assistance Declaration

### i. Rental Needs
•⁠  ⁠*Frontend:* AI assistance was used in ⁠ app/rental-needs/ ⁠, to implement the rental-request feature. For example ⁠ app/rental-needs/[id]/page.tsx ⁠ file. This feature was developed towards the later stages and involved complex integration with the existing Orders and Offers workflow.

•⁠  ⁠*Backend:* AI assistance was used in ⁠ rental_needs/signals.py ⁠, especially for integrating Rental Needs with the order lifecycle.

### ii. Rating and Review System
AI assistance helped in developing this feature. This included developing the underlying functionality, connecting the APIs, and integrating the feature into the existing application workflow. ex -

•⁠  ⁠*Frontend:*  TrustBadges.tsx

•⁠  ⁠*Backend:*   trust/

## Objective

Rotate is a peer-to-peer rental platform that lets people rent everyday items from others nearby instead of buying things they need only briefly. It aims to:

- Let owners list items with an hourly rate, security deposit and condition.
- Let borrowers request a time slot and agree on a price through offers and counter-offers.
- Manage the full rental lifecycle (request, accept, handover, return, complete), with photo evidence and admin-resolved disputes.
- Let users post a "rental need" that item owners can respond to.
- Build trust between users through ratings and reviews.

The project has two parts: a Next.js frontend ([rotate-frontend](https://github.com/theMr17/rotate-frontend)) and a Django REST backend ([rotate-backend](https://github.com/theMr17/rotate-backend)).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) **20.9 or newer** (required by Next.js 16) and npm
- The **Rotate backend** running locally. Follow the setup in [rotate-backend](https://github.com/theMr17/rotate-backend) first; the frontend only shows data the API returns.

### 1. Clone the repository

```bash
git clone https://github.com/theMr17/rotate-frontend.git
cd rotate-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

It contains one variable, the base URL of the backend API:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Change it only if your backend runs on a different host or port. Restart the dev server after editing this file.

The backend must allow this frontend's address in `CORS_ALLOWED_ORIGINS` (its default, `http://localhost:3000`, already does).

### 4. Run the development server

Make sure the backend is running (`python manage.py runserver` in `rotate-backend`), then start the frontend:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Register a new account (or log in) to list items, request rentals and post rental needs. Browsing items and open rental requests works without logging in.

### Other commands

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # run ESLint
```

## Code Organization

The app uses the Next.js **App Router**: every folder inside `app/` is a URL, and the `page.tsx` inside it is the page for that URL. A folder in square brackets (`[id]`) matches any value, such as `/items/5`.

```text
rotate-frontend/
├── app/            pages (one folder = one URL)
├── components/     reusable UI pieces used by the pages
├── lib/            API client and helper logic (no UI)
├── types/          TypeScript shapes of the backend's JSON
├── public/         static files served as-is
└── config files    package.json, next.config.ts, tsconfig.json, …
```

### `app/`: pages and routes

| File | URL | Role |
|---|---|---|
| `layout.tsx` | all pages | Root layout: Navbar, page content, Footer; page title and fonts |
| `globals.css` | all pages | Global styles and Tailwind import |
| `page.tsx` | `/` | Home page (hero, categories, how it works) |
| `login/page.tsx` | `/login` | Log-in form |
| `register/page.tsx` | `/register` | Sign-up form |
| `items/page.tsx` | `/items` | Browse available items, with search and category filter |
| `items/new/page.tsx` | `/items/new` | Create a new listing |
| `items/mine/page.tsx` | `/items/mine` | My listings: mark available/unavailable, delete |
| `items/[id]/page.tsx` | `/items/5` | Item details and the "Request to rent" button |
| `orders/page.tsx` | `/orders` | My orders, as borrower and as lender |
| `orders/new/[itemId]/page.tsx` | `/orders/new/5` | Request to rent an item |
| `orders/[id]/page.tsx` | `/orders/12` | Order detail: offers, actions, photos, settlement, reviews |
| `orders/disputes/page.tsx` | `/orders/disputes` | Admin list of disputed orders |
| `rental-needs/page.tsx` | `/rental-needs` | Browse open rental requests / my requests |
| `rental-needs/new/page.tsx` | `/rental-needs/new` | Post a rental requirement |
| `rental-needs/[id]/page.tsx` | `/rental-needs/7` | Request detail: respond, negotiate, accept/reject, cancel |
| `profile/page.tsx` | `/profile` | My profile: edit details, photo, home location, logout |
| `users/[id]/page.tsx` | `/users/3` | Another user's public profile and reviews |
| `favicon.ico` | none | Browser tab icon |

### `components/`: reusable UI

| File | Role |
|---|---|
| `Navbar.tsx` | Top navigation; shows "Log in" or "My Profile" |
| `Footer.tsx` | Page footer |
| `AuthForm.tsx` | Shared form used by both login and register |
| `Avatar.tsx` | Profile photo, or initials when there's no photo |
| `form/Field.tsx` | Labelled input with error and hint text |
| `form/HomeLocationFields.tsx` | Latitude/longitude inputs with "use my location" |
| `home/Hero.tsx`, `Categories.tsx`, `HowItWorks.tsx` | Sections of the home page |
| `items/ItemCard.tsx` | One item card in the browse grid |
| `orders/OrderCard.tsx` | One order in the orders list |
| `orders/StatusBadge.tsx` | Coloured order-status label |
| `orders/RentalRequestForm.tsx` | Dates and price form; creates an order |
| `orders/ConditionPhotos.tsx` | Upload and view handover/return photos |
| `orders/ResolveDispute.tsx` | Admin form to set a deposit deduction |
| `orders/OrderReview.tsx` | Leave or view reviews after completion |
| `rental-needs/RentalNeedCard.tsx` | One rental request card |
| `rental-needs/RentalNeedResponseForm.tsx` | Offer one of your items for a request |
| `rental-needs/RentalNeedCounterOfferForm.tsx` | Make a counter-offer on a response |
| `profile/ProfileEditForm.tsx` | Edit name, phone and location |
| `profile/ProfilePhoto.tsx` | Upload or remove the profile photo |
| `trust/Stars.tsx` | Star display and star picker |
| `trust/ReviewCard.tsx`, `ReviewList.tsx` | A single review, and a paginated list |
| `trust/TrustBadges.tsx` | Rating and reliability summary |

### `lib/`: logic without UI

| File | Role |
|---|---|
| `api.ts` | **All backend calls**: `apiGet` / `apiPost` / `apiPatch` / `apiDelete`; stores JWT tokens, refreshes them on a 401, and turns API errors into messages; login, register, logout, profile and review helpers |
| `rental-needs-api.ts` | Named functions for the rental-needs endpoints |
| `homeLocation.ts` | Parsing and validating the home location (lat/lng) inputs |

### `types/`: shapes of the backend's JSON

| File | Role |
|---|---|
| `item.ts` | `Item`, `CreateItemPayload` |
| `order.ts` | `Order`, `Offer`, `ConditionPhoto`, status types |
| `rental-need.ts` | `RentalNeed`, responses and payloads |
| `user.ts` | `UserProfile`, `PublicProfile`, `GeoPoint`, payloads |
| `trust.ts` | `Review`, `Trust`, rating summary types |

### Root config files

| File | Role |
|---|---|
| `package.json` / `package-lock.json` | Dependencies and npm scripts / exact installed versions |
| `next.config.ts` | Next.js config: allows images from Cloudinary |
| `tsconfig.json` | TypeScript settings and the `@/` import shortcut |
| `postcss.config.mjs` | Loads Tailwind CSS |
| `eslint.config.mjs` | Lint rules |
| `.env.example` | Template for `NEXT_PUBLIC_API_URL` |
| `public/` | `package.png` (item placeholder image) and default icons |
| `AGENTS.md`, `CLAUDE.md` | Notes for AI coding assistants; not used by the app |

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
