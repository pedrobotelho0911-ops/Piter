import { useState } from "react";
import { AppProvider } from "./store/AppContext";
import { TabBar, type Aba } from "./components/TabBar";
import { HojeScreen } from "./screens/HojeScreen";
import { ProgressoScreen } from "./screens/ProgressoScreen";
import { AjustesScreen } from "./screens/AjustesScreen";

export default function App() {
  const [aba, setAba] = useState<Aba>("hoje");

  return (
    <AppProvider>
      <div className="mx-auto min-h-dvh max-w-2xl pb-24">
        {aba === "hoje" && <HojeScreen />}
        {aba === "progresso" && <ProgressoScreen />}
        {aba === "ajustes" && <AjustesScreen />}
      </div>
      <TabBar aba={aba} onMudar={setAba} />
    </AppProvider>
  );
}
