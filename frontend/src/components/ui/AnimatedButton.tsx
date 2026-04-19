"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedButtonProps {
  children:   ReactNode;
  onClick?:   () => void;
  type?:      "button" | "submit" | "reset";
  variant?:   "primary" | "outline";
  fullWidth?: boolean;
  disabled?:  boolean;
  style?:     React.CSSProperties;
  className?: string;
}

export default function AnimatedButton({
  children,
  onClick,
  type      = "button",
  variant   = "primary",
  fullWidth = false,
  disabled  = false,
  style,
  className,
}: AnimatedButtonProps) {
  const base: React.CSSProperties = {
    width:          fullWidth ? "100%" : "auto",
    padding:        "12px 28px",
    borderRadius:   "12px",
    fontWeight:     "600",
    fontSize:       "1rem",
    cursor:         disabled ? "not-allowed" : "pointer",
    border:         "none",
    display:        "inline-flex",
    alignItems:     "center",
    justifyContent: "center",
    gap:            "8px",
    position:       "relative",
    overflow:       "hidden",
    opacity:        disabled ? 0.6 : 1,
  };

  const primary: React.CSSProperties = {
    backgroundColor: "#2e8673",
    color:           "#ffffff",
    boxShadow:       "0 2px 12px rgba(46,134,115,0.25)",
  };

  const outline: React.CSSProperties = {
    backgroundColor: "#ffffff",
    color:           "#2e8673",
    border:          "2px solid #2e8673",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ ...base, ...(variant === "primary" ? primary : outline), ...style }}
      whileHover={disabled ? {} : {
        scale:     1.03,
        boxShadow: variant === "primary"
          ? "0 6px 24px rgba(46,134,115,0.4)"
          : "0 4px 16px rgba(46,134,115,0.2)",
      }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.button>
  );
}