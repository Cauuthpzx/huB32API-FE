import { useTranslation } from "react-i18next";

function App() {
    const { t } = useTranslation();

    return (
        <div className="flex h-screen items-center justify-center">
            <h1 className="text-2xl font-semibold text-foreground">
                {t("app.name")} — {t("app.title")}
            </h1>
        </div>
    );
}

export default App;
