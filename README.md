# FocusMate AI

Local LLM-powered task breakdown timer for ADHD users.

## 🎯 Features

- **Local AI**: No server needed - runs entirely on your device
- **Task Breakdown**: AI breaks down complex tasks into manageable steps
- **Smart Timer**: Track time for each step with completion tracking
- **Save Favorites**: Library of saved breakdowns for quick access
- **Offline Ready**: Works without internet after model download

## 📱 Available Platforms

- ✅ **Web PWA** - Runs in browsers (Safari iOS recommended)
- ✅ **Android App** - Native Android via Capacitor
- ✅ **iOS App** - Native iOS via Capacitor (requires Mac/Xcode)

## 🚀 Quick Start

### Development

```bash
npm install
npm run dev
```

Open http://localhost:5173/ in your browser.

### Web Build

```bash
npm run build
# Output: dist/
```

Deploy the `dist/` folder to any static hosting (Vercel, Netlify, GitHub Pages, etc.)

### Android App Setup

```bash
# Install Android Studio first, then:
npm run cap:build      # Build web assets + sync to native
npm run cap:android    # Open in Android Studio
# In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

### iOS App Setup (Mac only)

```bash
npm run cap:ios        # Open in Xcode
# In Xcode: Product → Archive
```

## 🧠 How It Works

1. **Initialize Model (first time only)**: Downloads Qwen2-1.5B model (~900MB)
2. **Enter Task**: Describe what you want to do
3. **Break It Down**: AI creates step-by-step breakdown with time estimates
4. **Start Timer**: Track your progress through each step
5. **Repeat**: All breakdowns are cached for instant reuse

## ⚠️ Web Browser Limitations

The web version works perfectly on:
- ✅ **iPhone Safari** (full support)
- ✅ **Chrome/Edge** with WebGPU enabled

Does NOT work on:
- ❌ **Android browsers** (Cache API blocked - use native app)
- ❌ **Firefox** (no WebGPU support yet)

**Solution**: Use the native Android app for full functionality!

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tooling
- **@mlc-ai/web-llm** - Local LLM inference (WebGPU)
- **Capacitor** - Native mobile app wrapper
- **Qwen2-1.5B-Instruct** - AI model (4-bit quantized, ~900MB)

## 📦 Project Structure

```
focusmate-ai/
├── src/
│   ├── llm/              # LLM integration
│   ├── timer/            # Timer management
│   ├── favorites/        # Saved breakdowns
│   ├── App.tsx           # Main UI (iOS-style tabs)
│   └── App.css           # Styles
├── public/               # Static assets
├── dist/                 # Build output (generated)
├── android/              # Native Android project (generated locally)
├── ios/                  # Native iOS project (generated locally)
└── package.json
```

**Note**: `android/` and `ios/` folders are excluded from Git via `.gitignore` but generated locally via Capacitor commands.

## 🎨 UI Design

- **Home Tab**: Task input + breakdowns with integrated timer
- **Library Tab**: Saved favorites with search
- **Settings Tab**: Model status + cache management
- **iOS-Style**: Bottom tab navigation, clean interface, dark mode support

## 🔧 Troubleshooting

### Web-LLM Cache Error on Android Browser

**Error**: `ReferenceError: caches is not defined`

**Solution**: Android browsers block the Cache API. Use the native Android app instead!

### Model Download Problems

**Error**: Model gets stuck downloading

**Solutions**:
1. Clear browser cache (F12 → Application → Clear site data)
2. Try incognito mode
3. Check network connection
4. Switch to smaller network (WiFi recommended for ~900MB download)

### WebGPU Not Available

**Error**: WebGPU required for LLM

**Solution**: Enable WebGPU in Chrome/Edge:
- Chrome: `chrome://flags/#enable-unsafe-webgpu` → Enable → Relaunch
- Edge: `edge://flags/#enable-unsafe-webgpu` → Enable → Relaunch

## 📍 Roadmap

- [ ] Voice input (Web Speech API)
- [ ] Task categories & tags
- [ ] Push notifications
- [ ] Better offline sync
- [ ] Analytics & pattern learning

## 📄 License

Private project

## 🤝 Contributing

This is a personal project. Contact the owner before contributing.

---

**Note**: This app respects your privacy - no data is sent to any server. Everything runs locally on your device.