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
      className={`inline-flex flex-col items-center justify-center bg-[#FAFAFA] p-3 sm:p-4 rounded-2xl shadow-lg border border-[#27272A] aspect-square shrink-0 ${className}`}
    >
      <QRCodeSVG
        value={value}
        size={size}
        bgColor="#FAFAFA"
        fgColor="#09090B"
        level="M"
      />
    </div>
  );
}
