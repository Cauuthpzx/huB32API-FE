import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import App from "./App.tsx";

async function bootstrap() {
    if (import.meta.env.VITE_MOCK_API === "true") {
        const { startWorker } = await import("./mocks/browser");
        await startWorker();
    }

    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
}

bootstrap();
