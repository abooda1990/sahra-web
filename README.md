# Sahra

A web video player built with React and TypeScript, for a Go streaming backend.

> Work in progress.

## Stack

- React 19 + TypeScript
- Vite
- ESLint

## Features



- [x] Login against the backend
- [x] Movie rows by genre , with the provider's categories as a fallback
- [x] Movie details and video player
- [x] Posters from TMDB when the provider has none (found once by the server, then cached)
- [x] Search by name, newest movies first
- [ ] Series
- [ ] Live channels
- [ ] Arabic and English (RTL)




## Run it

```bash
npm install
npm run dev

```

The dev server forwards API requests to the backend at `http://localhost:3000` (see `vite.config.ts`).
