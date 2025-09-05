# Frontend Documentation

## Overview

This frontend is built with **Expo + React Native + Expo Router**, providing a conversational AI advisor and product catalog browsing experience.  
The app integrates with the backend via REST APIs and Server-Sent Events (SSE) for real-time chat streaming.

---

## Tech Stack

- **Framework:** Expo + React Native
- **Navigation:** Expo Router (React Navigation)
- **Language:** TypeScript
- **Configuration:**
  - `package.json` (dependencies & scripts)
  - `.env` (expects `EXPO_PUBLIC_API_BASE_URL`)

---

## Project Structure

- **Navigation**

  - `app/_layout.tsx` → Root stack
  - `app/(tabs)/_layout.tsx` → Tabs (`conversation`, `catalog_tab`)

- **Screens**

  - `app/index.tsx` → Landing screen
  - `app/advisor.tsx` → Chat with AI advisor
  - `app/catalog.tsx` → Product catalog
  - `app/product/[productDetailsId].tsx` → Product details

- **UI Components**
  - `app/Components/HomeScreenUsp.tsx` → Home page USP (unique selling proposition) tiles

---

## Features

### Catalog (`app/catalog.tsx`)

- **Data fetching**
  - Categories: `GET /products/categories`
  - Products: `GET /products` (supports `q`, `category`, `sort`, pagination)
- **Performance optimizations**
  - Uses **FlashList** for performant infinite scrolling.
  - `onEndReached` to fetch additional pages.
  - Server-side paging with `page`, `pageSize`, `sort`.
  - For category filtering: `all=true` to fetch full filtered set and skip paging UI work.
  - Memoized item renderer via `useCallback`.

---

### Chat & Streaming (SSE) (`app/advisor.tsx`)

- **Streaming optimizations**
  - **Buffered token rendering**: tokens enqueued and appended at intervals → fewer re-renders.
  - **Minimal state churn**:
    - `useRef` for stream queue/timer and active message id.
    - Suppresses redundant status label updates once streaming starts.
  - **Lifecycle hygiene**:
    - On mount: hydrate from `GET /messages`.
    - On unmount/new run: remove SSE listeners, close connection, clear timers.
  - **Concurrency guard**: disables send button while busy.
  - **Auto-scroll**: short-delay scroll-to-end for smooth chat experience.

---

### Product Details (`app/product/[productDetailsId].tsx`)

- **UX touches**
  - **Bottom-anchoring trick**:
    - `ScrollView` is vertically inverted (`scaleY: -1`), with inner content containers also inverted.
    - This ensures content grows upward while keeping the footer visually anchored at the bottom.
  - **Incremental UX**:
    - Loads the product first, then similar products.
    - Displays a **full-screen loader overlay** until content dimensions are measured (`onContentSizeChange`).

⚡ **Note:** This inverted scroll view technique is also what enables the **“Add to Cart” button** to remain visually stuck to the bottom, while content loads progressively.

---

## Notable UI Libraries

- [`@shopify/flash-list`](https://shopify.github.io/flash-list/) → efficient product catalog list.
- [`react-native-sse`](https://www.npmjs.com/package/react-native-sse) → SSE client for chat streaming.
- [`lucide-react-native`](https://www.npmjs.com/package/lucide-react-native) → vector icons.
- [`expo-blur`](https://docs.expo.dev/versions/latest/sdk/blur-view/) → translucent USP tiles.
- [`react-native-url-polyfill`](https://www.npmjs.com/package/react-native-url-polyfill) → ensures URL support for SSE.
- **Core Expo libraries**: fonts, status bar, etc.

---

## Improvements & Future Work

- **Persistent storage**

  - Have experience with **MMKV** (a high-performance storage alternative to AsyncStorage).
  - Would improve local caching and reduce load times.

- **Animations**

  - Planned homepage animation which i have done [this](https://x.com/Its_Saif_Dev/status/1755665408143790298).
  - Couldn’t implement due to Expo Go compatibility restrictions.

- **Image performance**

  - Wanted to use **FastImage** for caching/faster image rendering.
  - Blocked by Expo Go (requires native module installation).

- **Potential enhancements**
  - Migrate to custom dev client (EAS) for native module support.
  - Integrate offline mode with cached catalog data.
  - More advanced chat UX (typing indicators, retry for failed runs).

---
