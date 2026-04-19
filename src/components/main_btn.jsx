import { useState, useEffect, useRef } from "react";
import shadow from "../assets/shadow.png";
import ambientSound from "../assets/anxiety.m4a";

const bgWidth =  { default: "0px", hover: "530px",  pressing: "1061px", clicked: "200vmax" };
const bgHeight = { default: "0px", hover: "345px",  pressing: "690px",  clicked: "200vmax" };
const stateVolume = { default: 1.0, hover: 0.6, pressing: 0.3, clicked: 0.0 };

const stateColor = {
  default:  "#ffffff",
  hover:    "#cccccc",
  pressing: "#888888",
  clicked:  "#ffffff",
};

export default function MainBtn({ onClicked, muted }) {
  const [state,    setState]    = useState("default");
  const [qHovered, setQHovered] = useState(false);
  const audioRef = useRef(null);
  const fadeRef  = useRef(null);

  useEffect(() => {
    const audio = new Audio(ambientSound);
    audio.loop   = true;
    audio.volume = stateVolume.default;
    audioRef.current = audio;

    const startOnInteraction = () => {
      audio.play().catch(() => {});
      window.removeEventListener("pointerdown", startOnInteraction);
    };

    // if already interacted (e.g. user clicked something before this mounts)
    audio.play().catch(() => {
      // autoplay blocked — wait for first interaction
      window.addEventListener("pointerdown", startOnInteraction);
    });

    return () => {
      audio.pause();
      audio.src = "";
      window.removeEventListener("pointerdown", startOnInteraction);
    };
  }, []);

  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    fadeVolume(muted ? 0 : stateVolume[state]);
  }, [muted]);

  const fadeVolume = (target) => {
    const audio = audioRef.current;
    if (!audio) return;
    const duration = 400, steps = 30;
    const interval = duration / steps;
    const delta = (target - audio.volume) / steps;
    clearInterval(fadeRef.current);
    let step = 0;
    fadeRef.current = setInterval(() => {
      step++;
      audio.volume = Math.min(1, Math.max(0, audio.volume + delta));
      if (step >= steps) { audio.volume = target; clearInterval(fadeRef.current); }
    }, interval);
  };

  const handleMouseEnter = () => { if (state !== "clicked") { setState("hover");    fadeVolume(stateVolume.hover);    } };
  const handleMouseLeave = () => { if (state !== "clicked") { setState("default");  fadeVolume(stateVolume.default);  } };
  const handleMouseDown  = () => { if (state !== "clicked") { setState("pressing"); fadeVolume(stateVolume.pressing); } };
  const handleMouseUp    = () => { if (state !== "clicked") { setState("hover");    fadeVolume(stateVolume.hover);    } };

  const handleClick = () => {
    setState(s => {
      const next = s === "clicked" ? "default" : "clicked";
      fadeVolume(stateVolume[next]);
      if (next === "clicked" && onClicked) onClicked();
      return next;
    });
    setQHovered(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');
        @keyframes shake {
          0%   { transform: translateX(0px);  }
          25%  { transform: translateX(-2px); }
          50%  { transform: translateX(2px);  }
          75%  { transform: translateX(-1px); }
          100% { transform: translateX(0px);  }
        }
      `}</style>

      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: bgWidth[state],
        height: bgHeight[state],
        transform: "translate(-50%, -50%)",
        backgroundImage: `url(${shadow})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        zIndex: 1,
        pointerEvents: "none",
      }} />

      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={state !== "clicked" ? handleClick : undefined}
        style={{
          position: "relative",
          zIndex: 2,
          background: "none",
          border: "none",
          padding: 0,
          cursor: state !== "clicked" ? "pointer" : "default",
          userSelect: "none",
        }}
      >
        <span style={{
          display: "block",
          color: stateColor[state],
          fontSize: "100px",
          fontWeight: "400",
          fontFamily: `"Special Elite", system-ui`,
          letterSpacing: "0.05em",
          textShadow: "0 2px 12px rgba(0,0,0,0.5)",
          transition: "color 0.2s ease",
          whiteSpace: "nowrap",
          animation: state !== "clicked" ? "shake 0.12s linear infinite" : "none",
          pointerEvents: "none",
        }}>
          {state !== "clicked" ? (
            state === "default"  ? "GET OUT OF HERE"  :
            state === "hover"    ? "GET OUT OF HERE!" :
                                   "GET OUT OF HERE!!"
          ) : (
            <>
              MAYBE NEXT TIME(
              <span
                onMouseEnter={() => setQHovered(true)}
                onMouseLeave={() => setQHovered(false)}
                onClick={handleClick}
                style={{
                  color: qHovered ? "#ff2222" : "#ffffff",
                  cursor: "pointer",
                  transition: "color 0.15s ease",
                  pointerEvents: "auto",
                }}
              >
                ?
              </span>
              )
            </>
          )}
        </span>
      </button>
    </>
  );
}