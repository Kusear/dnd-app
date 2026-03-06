# DnD app

## About

Приложение для игры в DnD (Dungeons and Dragons). А так же пробы разработки фронта.
Некоторые части приложения написаны с помощью ИИ.

Чеклист:

- [x] Поле для отрисовки карт
- [x] Возможность загрузки карты из вне (без политик безопасности [в дальнейшем можно будет добавить])
- [x] Токены сущностей (герои, монстры, нпс)
- [] Онлайн лобби (синхронизация девайсов в лобби)
  - [] Подключение к серверу для кооп игры
  - [] Реализация взаимодействия по сокетам
  - [] Синхронизация девайсов в лобби
- [] Что нибудь еще...

## Tech Stack

- Electron
- React
- TypeScript
- Electron Forge
- Webpack

## Requirements

- Node.js 22+ (or the version required by Electron 39)
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
