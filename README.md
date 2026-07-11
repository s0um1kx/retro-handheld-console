# Retro Console Pro

A lightweight, modular, and extensible web-based retro gaming engine. **Retro Console Pro** provides a dedicated sandbox for browser-based retro experiences, featuring a custom core engine, structured game management, and an authentic user interface.

[**Launch Live Demo**](https://s0um1kx.github.io/retro-handheld-console/)

---

## 📋 Table of Contents
1. [Overview](#-overview)
2. [Core Features](#-core-features)
3. [Technical Architecture](#-technical-architecture)
4. [Controls Reference](#-controls-reference)
5. [Project Structure](#-project-structure)
6. [Contribution Guidelines](#-contribution-guidelines)
7. [License](#-license)

---

## 📖 Overview
Retro Console Pro is designed to simulate a classic handheld gaming experience entirely in the browser. By separating the engine's core logic from game-specific code, the project allows for rapid prototyping of new titles while maintaining consistent performance and UI standards.

## 🚀 Core Features
*   **Modular Design**: Engine logic, audio management, and game controllers are decoupled for better maintainability.
*   **Extensible Game System**: Developers can easily add new games to the `src/games/` directory without altering core files.
*   **Keyboard Input Mapping**: Mimics physical console hardware with dedicated key mappings for a tactile feel.
*   **Zero-Dependency Engine**: Built entirely with Vanilla JavaScript, ensuring fast load times and zero overhead.

## 🛠️ Technical Architecture
The engine operates on a central controller loop that manages state transitions and input processing:
*   **Core Controller**: Handles the system clock, power states, and input broadcasting.
*   **AudioManager**: A centralized service for triggering sound effects across various game states.
*   **State Management**: Manages navigation between the system menu, settings, and active game sessions.

## 🎮 Controls Reference
The interface is optimized for standard desktop keyboard layouts:

| Input Function | Key Mapping |
| :--- | :--- |
| **D-Pad Direction** | Arrow Keys |
| **Action A** | `Z` Key |
| **Action B** | `X` Key |
| **System Menu** | `Enter` / `ESC` |

## 📁 Project Structure
```text
/
├── src/
│   ├── core/         # Engine core: Audio, Controllers, Engine Logic
│   ├── games/        # Individual game modules
│   ├── legal/        # Legal docs (Terms, Privacy, License)
│   └── styles/       # CSS/SCSS layout and themes
├── index.html        # Main application entry point
├── LICENSE           # Project license
└── README.md         # Project documentation