# Sahayak Frontend - Assistive Navigation Application

This is the frontend application for **Sahayak**, a comprehensive assistive technology solution designed to help visually impaired users navigate their environment safely and independently.

## 🚀 Features

- **Voice-First Interface**: 
  - Complete hands-free navigation using voice commands ("Navigate", "SOS", "Detect").
  - Real-time voice feedback for all actions and environment descriptions.
  - "Always On" continuous listening mode.

- **Real-time Object Detection**: 
  - Integrated **TensorFlow.js** (COCO-SSD) for offline, real-time object detection directly in the browser.
  - Auditory announcements of detected obstacles (e.g., "Person", "Chair", "Car").

- **Navigation & Maps**:
  - GPS-based outdoor navigation using **Leaflet** and OpenStreetMap.
  - Turn-by-turn guidance context.
  - "End Navigation" safety controls.

- **Emergency SOS**:
  - One-tap or voice-activated SOS mode.
  - Simulates sending emergency alerts and sharing location.

- **Visual Accessibility**:
  - High-contrast UI with large touch targets.
  - Haptic feedback integration for interactions.

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **AI/ML**: TensorFlow.js (@tensorflow-models/coco-ssd)
- **Maps**: Leaflet / React-Leaflet
- **Icons**: Lucide React

## 📂 Project Structure

```
project/
├── src/
│   ├── components/     # UI Components (Home, Navigation, Detection, etc.)
│   ├── contexts/       # Global State (VoiceContext, NavigationContext)
│   ├── services/       # Business Logic (VoiceService, API)
│   ├── App.tsx         # Main Application Layout
│   └── main.tsx        # Entry Point
├── public/             # Static Assets
├── .env                # Environment Variables
├── package.json        # Dependencies
└── vite.config.ts      # Vite Configuration
```

## ⚙️ Setup & Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/grishma-blip/Sahayak_Frontend.git
    cd Sahayak_Frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory:
    ```env
    VITE_GOOGLE_API_KEY=your_google_cloud_api_key
    ```

4.  **Start the Development Server**:
    ```bash
    npm run dev
    ```
    The app will open at `http://localhost:5173`.

5.  **Build for Production**:
    ```bash
    npm run build
    ```

## 👥 Team

**Team Name**: Bombay.Bytes

**Members**:
- **Grishma Thakare** ([@grishma-blip](https://github.com/grishma-blip))
- **Ashutosh Rai** ([@ashurai84](https://github.com/ashurai84))

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
