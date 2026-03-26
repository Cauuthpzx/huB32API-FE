import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import App from "./App.tsx";

async function bootstrap() {
    if (import.meta.env.VITE_MOCK_API === "true") {
        try {
            const { startWorker } = await import("./mocks/browser");
            await Promise.race([
                startWorker(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("MSW timeout")), 3000),
                ),
            ]);
        } catch {
            console.warn("[MSW] Service worker failed to start — running without mocks");
        }
    }

    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
}

bootstrap();
