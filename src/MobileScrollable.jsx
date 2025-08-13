// src/MobileScrollable.jsx
import React, { useEffect, useRef } from "react";
import "./MobileScrollable.css"; // optional for styling

export default function MobileScrollable({ children, style, className }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Prevent scroll chaining on mobile
    const handleTouchStart = (e) => {
      const top = el.scrollTop;
      const totalScroll = el.scrollHeight;
      const currentScroll = top + el.offsetHeight;

      if (top === 0) el.scrollTop = 1;
      else if (currentScroll === totalScroll) el.scrollTop = top - 1;
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    return () => el.removeEventListener("touchstart", handleTouchStart);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`mobile-scrollable ${className || ""}`}
      style={{
        width: "100%",
        overflowX: "hidden",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch", // smooth scroll iOS
        ...style,
      }}
    >
      {children}
    </div>
  );
}