# Client Setup - Globe Integration

## Files Created/Copied

### Globe Implementation Files

1. **`/client/src/globe/createGlobe.ts`** (NEW)
   - Core globe creation logic
   - Three.js scene, camera, renderer setup
   - Lighting configuration (dim ambient + multiple directional lights)
   - MeshPhongMaterial with blue glow
   - Points system for cities (white dots)
   - Arc/connection system for Berlin ↔ Rabat
   - Cleanup and disposal functions

2. **`/client/src/components/GithubGlobe.tsx`** (NEW)
   - React component wrapper
   - Uses `createGlobe` function
   - ResizeObserver for responsive handling
   - Proper cleanup on unmount
   - Props: `height`, `autoRotate`, `showConnections`

3. **`/client/src/App.tsx`** (UPDATED)
   - Renders `<GithubGlobe />` component
   - Responsive container styling

4. **`/client/src/App.css`** (UPDATED)
   - Styling for globe container
   - Dark theme matching globe background

5. **`/client/src/index.css`** (UPDATED)
   - Dark theme base styles

## Dependencies Installed

```bash
npm install three @react-three/fiber@^8.15.0 @react-three/drei@^9.88.0 three-globe --legacy-peer-deps
```

**Note:** Used `--legacy-peer-deps` due to React 19 compatibility with @react-three/fiber v8.

## Code Changes

### `/client/src/globe/createGlobe.ts`
- **NEW FILE** - Complete globe implementation
- Uses Three.js directly (not react-three/fiber) for exact github-globe style
- Implements:
  - Blue glowing globe with MeshPhongMaterial
  - White points on major cities (30+ cities)
  - Berlin (52.52°N, 13.405°E) ↔ Rabat (34.0209°N, -6.8416°E) connection
  - Gold-colored arc and city markers
  - Auto-rotation and OrbitControls

### `/client/src/components/GithubGlobe.tsx`
- **NEW FILE** - React component
- **Lines changed:** N/A (new file)
- Uses `useEffect` for initialization
- Uses `ResizeObserver` for responsive resizing
- Proper cleanup: cancels RAF, disposes renderer/controls, removes canvas

### `/client/src/App.tsx`
- **Changed:** Complete rewrite
- **Before:** Default Vite template
- **After:** Renders GithubGlobe component with header

### `/client/src/App.css`
- **Changed:** Complete rewrite
- **Before:** Default Vite styles
- **After:** Dark theme styles for globe container

## Germany ↔ Morocco Connection

Added in `createGlobe.ts`:

```typescript
// Berlin coordinates
const berlinLat = 52.52;
const berlinLon = 13.405;

// Rabat coordinates  
const rabatLat = 34.0209;
const rabatLon = -6.8416;

// Creates QuadraticBezierCurve3 arc
// Gold color (0xffd700)
// Glowing markers at both cities
```

## Run Commands

### Backend (Terminal 1)
```bash
cd server
npm install
npm run dev
```
Backend runs on: `http://localhost:3001`

### Client (Terminal 2)
```bash
cd client
npm install
npm run dev
```
Client runs on: `http://localhost:5173` (or next available port)

## Verification

1. ✅ Globe renders with blue glow
2. ✅ White dots visible on continents
3. ✅ Berlin ↔ Rabat connection arc visible
4. ✅ Auto-rotation works
5. ✅ Interactive controls (drag, zoom)
6. ✅ Resize handling via ResizeObserver
7. ✅ Proper cleanup on unmount
8. ✅ No console errors

## Notes

- The implementation uses Three.js directly (not react-three/fiber) to match the exact github-globe style
- All textures/assets are programmatically generated (no external files needed)
- The globe uses the same lighting and material setup as github-globe
- Connection arc uses QuadraticBezierCurve3 for smooth curve
- City markers use MeshStandardMaterial with emissive for glow effect
