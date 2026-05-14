"use client";

import { useState } from "react";

type CopyReportUrlButtonProps = {
  label: string;
  copiedLabel: string;
};

export function CopyReportUrlButton({
  label,
  copiedLabel
}: CopyReportUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      } else {
        copyWithTextarea();
      }
    } catch {
      copyWithTextarea();
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function copyWithTextarea() {
    const textarea = document.createElement("textarea");
    textarea.value = window.location.href;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  return (
    <button
      type="button"
      onClick={copyUrl}
      className="rounded-full border border-paper-line bg-paper-cream px-5 py-2 font-journal text-base text-paper-ink shadow-sm transition hover:bg-[#fffaf0]"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
