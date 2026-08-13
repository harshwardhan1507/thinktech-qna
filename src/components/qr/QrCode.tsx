"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";

export interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * Reusable high-contrast SVG QR Code component with quiet-zone padding.
 * Designed for projector and display presentation screens.
 */
export function QrCode({
  value,
  size = 320,
  className = "",
  ariaLabel = "QR code to open ThinkTech anonymous Q&A",
}: QrCodeProps) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={{ width: size, height: size }}
      className={`inline-flex flex-col items-center justify-center bg-white p-3 sm:p-4 rounded-2xl shadow-[0_2px_12px_rgba(17,17,17,0.06)] border border-[#E5E7EB] aspect-square shrink-0 ${className}`}
    >
      <QRCodeSVG
        value={value}
        size={size}
        bgColor="#FFFFFF"
        fgColor="#111111"
        level="M"
        className="w-full h-full"
      />
    </div>
  );
}
