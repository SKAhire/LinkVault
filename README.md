# LinkVault

> A minimal, structured mobile app for organizing saved links with clarity and intent.

LinkVault helps you build a personal knowledge system by categorizing, managing, and searching saved resources in a clean, distraction-free environment.

---

## Overview

LinkVault is a productivity-focused React Native application built with Expo. It allows users to organize links into meaningful categories and manage them with a structured, modern UI.

> **Note:** This is not a security or encryption tool. It is a structured organization tool built for clarity, order, and intentional curation.

---

## Features

### ✅ Step 1 (Current)

- Create and manage categories
- Default categories: **Learn**, **Rewatch**, **Inspiration**, **Fitness**, **Career**
- Add and store links under categories
- Real-time search
- Download / export support
- Light and Dark theme support
- SQLite local persistence
- Modular, production-ready UI

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React Native | Core framework |
| Expo | Build tooling & native APIs |
| NativeWind | Tailwind CSS for React Native |
| Expo SQLite | Local persistent storage |
| React Navigation | Screen navigation |
| Kotlin (via Expo Prebuild) | Android native support |

---

## Project Structure

```
src/
  components/     # Reusable UI components
  screens/        # Application screens
  navigation/     # Navigation configuration
  database/       # SQLite logic and queries
  hooks/          # Custom hooks
  constants/      # Theme and configuration
App.tsx
```

### Architecture Principles

- Small, reusable components
- Clear separation of concerns
- Database logic isolated from UI

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/linkvault.git
cd linkvault
```

### 2. Install dependencies

```bash
npm install
```

or

```bash
yarn install
```

### 3. Start the development server

```bash
npx expo start
```

### Android Native Setup (Optional)

If you need direct access to Android native code:

```bash
npx expo prebuild
```

This generates the `/android` directory for Kotlin and native module customization.

---

## Database

LinkVault uses SQLite for local persistent storage.

**Tables:** `categories`, `links`

**Structure:**
- One-to-many relationship between categories and links
- Async database operations
- Encapsulated query layer

Database logic lives in `src/database/`.

---

## Design System

### Color Palette

| Role | Color | Preview |
|---|---|---|
| Primary | `#C0301E` | 🔴 |
| Secondary | `#000000` | ⬛ |
| Accent | `#F6DA9D` | 🟡 |

### Styling Principles

- NativeWind utility classes only — no `StyleSheet`-based UI
- Consistent spacing scale
- Reusable card and modal components
- Theme-aware design

---

## Search

- Case-insensitive filtering
- Real-time updates
- Optimized SQLite queries

---

## Roadmap

### 🔜 Step 2

- [ ] Share-to-app integration
- [ ] Deep linking
- [ ] Improved metadata extraction

### 🔮 Future Enhancements

- [ ] Tag system
- [ ] Bulk actions
- [ ] Import / Export JSON
- [ ] Optional cloud sync
- [ ] Backup support

---

## Contributing

Contributions are welcome!

**Guidelines:**
- Keep components modular
- Use NativeWind for styling
- Maintain theme consistency
- Keep database logic clean and structured

---

## License

[MIT License](LICENSE)

---

## Author

Built by [Guru](https://github.com/SKAhire)