# TechDrop Lab

**Explore the Hardware. Understand the Technology.**

TechDrop Lab is an interactive 3D educational website for learning the parts of a desktop computer. A real-time 3D PC — built entirely from Three.js geometry — sits on a blueprint-style inspection sheet. Select any component in 3D or from the component index, the camera focuses on it, and a study panel explains what it is, what it does, and how it works.

**Live:** https://techdrop-lab.vercel.app

## Components covered

Motherboard · CPU · RAM · GPU · SSD · PSU · CPU Cooler · Case Fans

## Features

- Interactive 3D desktop PC with an open side panel and individually selectable hardware
- Pointer and scroll parallax that suspends while a component is being inspected
- Smooth camera focus per component, plus orbit, zoom, and reset-view controls
- The CPU cooler fades away when the CPU is selected, revealing the processor underneath
- Accessible component index as an alternative to clicking 3D meshes, keyboard support (Esc to close), and `prefers-reduced-motion` support
- WebGL fallback that keeps the educational content available
- Responsive layouts for desktop, tablet, and mobile, including a wider default camera framing on phones

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- Three.js with React Three Fiber and Drei
- Lucide icons

## Getting started

```bash
npm install
npm run dev      # start the development server
npm run build    # type-check and build for production
npm run preview  # preview the production build
```

## Project structure

```text
src/
├── App.tsx                  # Page composition and application state
├── components/              # Component index and study panel
├── data/components.ts       # Educational content for all 8 components
├── three/
│   ├── PCModel.tsx          # The 3D computer, built part by part
│   └── PCScene.tsx          # Canvas, camera flights, parallax, controls
└── types/hardware.ts        # Shared types
```

Built by [Khonif Zakaria](https://nivdev.ai.id) as a learning and portfolio project.
