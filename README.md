# iRacing Overlay Studio

Real-time iRacing overlay studio with React frontend and .NET backend.

## English

### Project structure

```text
iracing-overlay-studio/
├── frontend/                 # React + Vite + TypeScript
├── backend/                  # ASP.NET Core (.NET 8) + WebSocket
├── shared/                   # Shared contracts/types
├── docker-compose.yml
├── .gitignore
└── README.md
```

### Quick start

1. Backend
   ```bash
   cd backend
   dotnet restore
   dotnet run
   ```
2. Frontend
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173`

WebSocket endpoint: `ws://localhost:5000/ws`

### Features

- Real-time WebSocket data flow (backend -> frontend)
- Basic iRacing session data model and mock reader fallback
- Overlay settings panel + live preview + widget editor layout
- Zustand store-based state management

## Türkçe

### Proje yapısı

```text
iracing-overlay-studio/
├── frontend/                 # React + Vite + TypeScript
├── backend/                  # ASP.NET Core (.NET 8) + WebSocket
├── shared/                   # Paylaşılan sözleşmeler/tipler
├── docker-compose.yml
├── .gitignore
└── README.md
```

### Kurulum

1. Backend
   ```bash
   cd backend
   dotnet restore
   dotnet run
   ```
2. Frontend
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Tarayıcıda `http://localhost:5173` adresini açın.

WebSocket adresi: `ws://localhost:5000/ws`

### Özellikler

- Gerçek zamanlı WebSocket veri akışı (backend -> frontend)
- Temel iRacing session modeli ve mock veri okuma fallback'i
- Overlay ayarlar paneli + canlı önizleme + widget editör düzeni
- Zustand ile durum yönetimi
