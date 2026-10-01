# Foodio

A focused pickup-first shawarma storefront built with React, TypeScript, and Vite.

## Features

- Filterable food menu with a functional cart
- Selectable pickup points on an interactive illustrated map
- Responsive mobile ordering bar and checkout drawer
- Dark mode with persisted preference
- Keyboard navigation, visible focus states, empty and success states

## Run locally

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:3000`.

## Structure

```text
src/
  components/   focused UI components, one per file
  App.tsx       storefront state and composition
  data.ts       menu and pickup-point content
  styles.css    responsive visual system
```
