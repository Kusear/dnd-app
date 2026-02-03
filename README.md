# DnD app

Electron app with React and Phaser, built with Electron Forge and Webpack.

## Tech Stack

- Electron
- React
- TypeScript
- Phaser
- Electron Forge
- Webpack

## Requirements

- Node.js 16+ (or the version required by Electron 39)
- npm

## Setup

```bash
npm install
```

## Development

```bash
npm run start
```

## Build

```bash
npm run package
```

## Distribute

```bash
npm run make
```

## Lint

```bash
npm run lint
```

## Project Structure

- `src/app.starter.tsx` — app bootstrap
- `src/components/` — React UI components
- `src/components/phaser-game/` — Phaser game integration
- `src/components/main-area/` — main view layout
- `src/components/sidebar/` — sidebar UI
- `src/index.ts` — renderer entry
- `src/renderer.ts` — renderer setup
- `src/preload.ts` — preload script

## License

MIT
