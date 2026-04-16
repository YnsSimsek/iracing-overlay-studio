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

- 60Hz real-time WebSocket standings updates with incremental (changed-driver) payloads
- Professional standings widget (position delta, car number, country flag, gap/interval, best/last, pit, lap)
- Dark YUKA-style widget customization (size presets, opacity, font size, row spacing, column visibility)
- Profile-based JSON configuration storage (`/api/config/profiles/{name}`)
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

- 60Hz gerçek zamanlı WebSocket standings güncellemesi ve değişen sürücü odaklı payload
- Profesyonel standings bileşeni (pozisyon değişimi, araç numarası, bayrak, gap/interval, best/last, pit, lap)
- Koyu YUKA tarzı widget özelleştirme (boyut preset, opaklık, font, satır aralığı, sütun görünürlüğü)
- Profil bazlı JSON konfigürasyon saklama (`/api/config/profiles/{name}`)
- Zustand ile durum yönetimi
