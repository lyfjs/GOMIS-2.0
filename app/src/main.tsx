
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

async function bootstrap() {
  try {
    // Sync dbConfig from electron-store into localStorage before app renders (packaged app)
    const electronAPI = (window as any).electronAPI;
    if (electronAPI && electronAPI.getDbConfig) {
      const res = await electronAPI.getDbConfig();
      const saved = res?.dbConfig;
      if (saved && typeof saved === 'string') {
        const settings = JSON.parse(localStorage.getItem('gomis_settings') || '{}');
        settings.dbConfig = saved;
        localStorage.setItem('gomis_settings', JSON.stringify(settings));
      }
    }
  } catch {}
  createRoot(document.getElementById("root")!).render(<App />);
}

bootstrap();
  