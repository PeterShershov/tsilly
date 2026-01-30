# Tsilly

A browser-based TypeScript playground with live preview. Write HTML, CSS, and TypeScript code side-by-side and see instant results.

## Features

- **Three-pane editor** - HTML, CSS, and TypeScript editors powered by Monaco Editor
- **Live preview** - Instantly see your changes rendered in an iframe
- **TypeScript compilation** - Client-side TypeScript to JavaScript compilation using Sucrase
- **Emmet support** - Fast HTML/CSS authoring with Emmet abbreviations
- **Console output** - View console logs and errors from your code
- **Share workspaces** - Generate shareable URLs with your code encoded
- **Local persistence** - Your work is automatically saved to localStorage
- **Resizable panels** - Adjust editor and preview panel sizes to your preference

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Scripts

| Script                | Description                  |
| --------------------- | ---------------------------- |
| `npm run dev`         | Start development server     |
| `npm run build`       | Build for production         |
| `npm run preview`     | Preview production build     |
| `npm run lint`        | Run ESLint                   |
| `npm run typecheck`   | Run TypeScript type checking |
| `npm run test:e2e`    | Run Playwright e2e tests     |
| `npm run test:e2e:ui` | Run Playwright tests with UI |

## Tech Stack

- [React](https://react.dev/) - UI framework
- [Vite](https://vite.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Sucrase](https://github.com/alangpierce/sucrase) - TypeScript compilation
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Playwright](https://playwright.dev/) - E2E testing

## License

MIT
