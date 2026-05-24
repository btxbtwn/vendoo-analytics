"use client";

import { useState, useRef, cloneElement, isValidElement, ReactElement } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: React.ReactNode;
  children: ReactElement;
  side?: "top" | "bottom" | "left" | "right";
}

function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function show() {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: side === "bottom" ? rect.bottom + 6 : rect.top - 6,
          left: rect.left + rect.width / 2,
        });
        setVisible(true);
      }
    }, 200);
  }

  function hide() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  }

  const sideTransform: Record<string, string> = {
    top: "translate(-50%, -100%)",
    bottom: "translate(-50%, 0)",
    left: "translate(-100%, -50%)",
    right: "translate(0, -50%)",
  };

  const child = isValidElement(children)
    ? (cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: show,
        onMouseLeave: hide,
        onFocus: show,
        onBlur: hide,
      } as React.HTMLAttributes<HTMLElement>) as ReactElement)
    : children;

  return (
    <>
      {child}
      {visible && createPortal(
        <div
          onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setVisible(true); }}
          onMouseLeave={hide}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            transform: sideTransform[side],
            zIndex: 9999,
            animation: "tooltipFadeIn var(--duration-normal) var(--ease-out) forwards",
          }}
        >
          <div
            className="px-2.5 py-1.5 rounded-[var(--radius-md)] text-xs font-medium"
            style={{
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            {content}
          </div>
        </div>,
        document.body
      )}
      <style>{`
        @keyframes tooltipFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}

export { Tooltip };
export type { TooltipProps };
