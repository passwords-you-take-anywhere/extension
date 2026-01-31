<p align="center">
  <img src="public/icon/128.png" alt="PYTA Logo" width="100">
</p>

# PYTA Password Manager

Browser extension for managing passwords. Syncs with the [PYTA server](../server/).

## Getting Started

You'll need [Bun](https://bun.sh/) installed.

```bash
bun install
bun run dev          # chrome
bun run dev:firefox  # firefox
```

Then load the unpacked extension from `.output/chrome-mv3` (or `firefox-mv2` for Firefox).

## Building

```bash
bun run build
bun run build:firefox

# zip for distribution
bun run zip
bun run zip:firefox
```

## What's in here

```
src/
├── components/ui/    # UI components (button, input, etc)
├── entrypoints/
│   ├── background.ts
│   ├── content.ts
│   └── popup/        # main UI
├── lib/
│   ├── hash.ts       # encryption stuff
│   └── query/        # api calls
└── types/
```

## Stack

- [WXT](https://wxt.dev/) for the extension framework
- React 19 + TypeScript
- Tailwind CSS + Radix UI
- TanStack Query & Form

## Other commands

```bash
bun run lint        # eslint
bun run format      # prettier
bun run compile     # typecheck
```
