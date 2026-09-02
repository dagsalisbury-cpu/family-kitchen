# Family Kitchen 🍳

A family meal and recipe planning dashboard with automated online grocery cart integration for UK supermarkets (Tesco and Sainsbury's).

## Features

- **Weekly Dinner & Meal Planner**: Plan dinners across days, assign family chefs (with fun roaming animal avatars), specify adult/child guest counts, and plan weekly breakfast, lunch, and snacks.
- **Recipe & Bundle Library**: Manage reusable recipes and grocery bundles with per-adult and per-child quantity scaling.
- **Smart Grocery List**: Aggregates ingredients across planned meals, calculates pack sizing using a knowledge base, and tracks unchecked basket items.
- **Supermarket Automation**: Direct checkout automation for Tesco and Sainsbury's via background Playwright daemons.
- **Supabase Cloud Sync**: Synchronizes recipes, bundles, meal plans, and chefs across devices in real time.

## Tech Stack

- Next.js (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Supabase
- Lucide React Icons
- Playwright (for checkout automation)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.
