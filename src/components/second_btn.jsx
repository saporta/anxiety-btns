import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const positions = ["bottom-left", "top-right", "top-left", "bottom-right"];

const redOpacity = {
  "bottom-left":   0,
  "top-right":     0.125,
  "top-left":      0.25,
  "bottom-right":  0.375,
};

const positionStyle = {
  "bottom-left":   { bottom: "60px",  left: "120px",  right: "auto",  top: "auto",    transform: "none" },
  "top-right":     { top:    "60px",  right: "120px", left: "auto",   bottom: "auto", transform: "none" },
  "top-left":      { top:    "60px",  left: "120px",  right: "auto",  bottom: "auto", transform: "none" },
  "bottom-right":  { bottom: "60px",  right: "120px", left: "auto",   top: "auto",    transform: "none" },
};

const stateText = { default: "DELETE", hover: "DELETE?", pressing: "DELETE??", clicked: "..." };

export default function RunawayBtn({ onReset, onMute }) {
  const [posIndex,   setPosIndex]   = useState(0);
  const [btnState,   setBtnState]   = useState("default");
  const [opacity,    setOpacity]    = useState(0);
  const [blinkKey,   setBlinkKey]   = useState(0);
  const [blinking,   setBlinking]   = useState(false);
  const [finalBlink, setFinalBlink] = useState(false);
  const opacityRef  = useRef(0);
  const animRef     = useRef(null);
  const resetTimer  = useRef(null);

  const animateOpacity = (target) => {
    cancelAnimationFrame(animRef.current);
    const duration  = 600;
    const start     = opacityRef.current;
    const startTime = performance.now();
    const tick = (now) => {
      const t     = Math.min((now - startTime) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const val   = start + (target - start) * eased;
      opacityRef.current = val;
      setOpacity(val);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  };

  const triggerBlink = () => {
    setBlinkKey(k => k + 1);
    setBlinking(true);
    setTimeout(() => setBlinking(false), 300);
  };

  const fullReset = () => {
    clearTimeout(resetTimer.current); // cancel auto-timer if clicked early
    if (onReset) onReset();
    setPosIndex(0);
    setBtnState("default");
    setOpacity(0);
    opacityRef.current = 0;
    setTimeout(() => {
      setFinalBlink(false);
    }, 100);
  };

  const pos     = positions[posIndex];
  const isFinal = pos === "bottom-right";

  const advance = () => {
    if (!isFinal) {
      const next    = posIndex + 1;
      const nextPos = positions[next];
      setPosIndex(next);
      animateOpacity(redOpacity[nextPos]);
      triggerBlink();
    }
  };

  const handleFinalEnter = () => { if (btnState !== "clicked") setBtnState("hover");    };
  const handleFinalLeave = () => { if (btnState !== "clicked") setBtnState("default");  };
  const handleFinalDown  = () => { if (btnState !== "clicked") setBtnState("pressing"); };
  const handleFinalUp    = () => { if (btnState !== "clicked") setBtnState("hover");    };
  const handleFinalClick = () => {
    setBtnState(s => {
      if (s === "clicked") {
        setFinalBlink(false);
        clearTimeout(resetTimer.current);
        return "default";
      } else {
        setFinalBlink(true);
        if (onMute) onMute();   // ← tell App to mute MainBtn
        resetTimer.current = setTimeout(() => {
          fullReset();
        }, 600 + 5000);
        return "clicked";
      }
    });
  };

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const label = isFinal ? stateText[btnState] : "DON'T DELETE";

  const eyelidBase = (isTop) => ({
    position: "fixed",
    left: 0,
    right: 0,
    height: "50vh",
    backgroundColor: "black",
    zIndex: 99999,
    ...(isTop ? { top: 0 } : { bottom: 0 }),
  });

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

        @keyframes eyelid-top {
          0%   { transform: translateY(-100%); }
          40%  { transform: translateY(0%);    }
          60%  { transform: translateY(0%);    }
          100% { transform: translateY(-100%); }
        }
        @keyframes eyelid-bottom {
          0%   { transform: translateY(100%);  }
          40%  { transform: translateY(0%);    }
          60%  { transform: translateY(0%);    }
          100% { transform: translateY(100%);  }
        }

        @keyframes eyelid-top-stay {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(0%);    }
        }
        @keyframes eyelid-bottom-stay {
          0%   { transform: translateY(100%);  }
          100% { transform: translateY(0%);    }
        }

        @keyframes eyelid-top-open {
          0%   { transform: translateY(0%);    }
          100% { transform: translateY(-100%); }
        }
        @keyframes eyelid-bottom-open {
          0%   { transform: translateY(0%);    }
          100% { transform: translateY(100%);  }
        }
      `}</style>

      {/* red overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: `rgba(180, 0, 0, ${opacity})`,
        pointerEvents: "none", zIndex: 10,
      }} />

      {/* fast blink on teleport */}
      {blinking && createPortal(
        <div key={blinkKey}>
          <div style={{ ...eyelidBase(true),  animation: "eyelid-top    0.3s ease-in-out forwards" }} />
          <div style={{ ...eyelidBase(false), animation: "eyelid-bottom 0.3s ease-in-out forwards" }} />
        </div>,
        document.body
      )}

      {/* final clicked — close and stay, click anywhere to reset */}
      {finalBlink && createPortal(
        <div
          onClick={fullReset}
          style={{ position: "fixed", inset: 0, zIndex: 99998, cursor: "pointer" }}
        >
          <div style={{ ...eyelidBase(true),  animation: "eyelid-top-stay    0.6s ease-in forwards" }} />
          <div style={{ ...eyelidBase(false), animation: "eyelid-bottom-stay 0.6s ease-in forwards" }} />
        </div>,
        document.body
      )}

      {/* button */}
      <button
        onMouseEnter={isFinal ? handleFinalEnter : advance}
        onMouseLeave={isFinal ? handleFinalLeave : undefined}
        onMouseDown={isFinal  ? handleFinalDown  : undefined}
        onMouseUp={isFinal    ? handleFinalUp    : undefined}
        onClick={isFinal      ? handleFinalClick : undefined}
        style={{
          position: "absolute",
          ...positionStyle[pos],
          zIndex: 16,
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          color: "#ffffff",
          fontSize: isFinal ? "42px" : "32px",
          fontWeight: "400",
          fontFamily: `"Special Elite", system-ui`,
          letterSpacing: "0.05em",
          textShadow: "0 2px 12px rgba(0,0,0,0.5)",
          whiteSpace: "nowrap",
          userSelect: "none",
          animation: "shake 0.12s linear infinite",
          transition: "font-size 0.3s ease",
        }}
      >
        {label}
      </button>
    </>
  );
}