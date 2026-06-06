"use client";

import { useState, useEffect } from "react";

const AFFILIATE = "https://base44.pxf.io/c/2252709/2049275/25619?trafcat=base";

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse leaves top of viewport
      if (e.clientY <= 0) {
        setShow(true);
        // Only show once per session
        setDismissed(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [dismissed]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-t-2xl">
          <h2 className="text-2xl font-bold">Wait! 🛑</h2>
          <p className="text-orange-100 text-sm mt-1">Don't leave without trying Base44</p>
        </div>

        <div className="px-6 py-4">
          <p className="text-gray-700 mb-4">
            Base44 is the easiest way to build custom apps without coding. Start free in seconds — no credit card required.
          </p>

          <ul className="text-sm text-gray-600 space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold mt-0.5">✓</span>
              <span>Build apps 10x faster than custom development</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold mt-0.5">✓</span>
              <span>AI-powered builder creates code for you</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold mt-0.5">✓</span>
              <span>Free forever plan. Premium at $29/mo</span>
            </li>
          </ul>

          <a
            href={AFFILIATE}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors mb-3"
          >
            Try Base44 Free →
          </a>

          <button
            onClick={() => setShow(false)}
            className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            I'll pass for now
          </button>
        </div>
      </div>
    </div>
  );
}
