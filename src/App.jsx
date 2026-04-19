import { useState } from "react";
import background from "./assets/background.gif";
import MainBtn from "./components/main_btn";
import SecBtn from "./components/second_btn";

export default function App() {
  const [secKey, setSecKey] = useState(0);
  const [muted,  setMuted]  = useState(false);

  const resetAll = () => {
    setMuted(false);
    setSecKey(k => k + 1);
  };

  return (
    <div style={{
      backgroundImage: `url(${background})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      width: "1440px",
      height: "1024px",
      position: "relative",
      overflow: "hidden",
    }}>
      <SecBtn key={secKey} onReset={resetAll} onMute={() => setMuted(true)} />

      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 100,
      }}>
        <MainBtn onClicked={resetAll} muted={muted} />
      </div>
    </div>
  );
}