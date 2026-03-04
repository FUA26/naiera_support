"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Accessibility,
  X,
  AudioLines,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Link2,
  Contrast,
  SunMedium,
  MousePointer2,
  CircleSlash,
  ImageOff,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Default state
const DEFAULT_STATE = {
  isOpen: false,
  speechEnabled: false,
  textSize: 100,
  lineHeight: 1.5,
  letterSpacing: "normal" as "small" | "normal" | "large",
  textAlign: "default" as "default" | "left" | "center" | "right" | "justify",
  readableFont: false,
  linksUnderline: false,
  monochrome: false,
  highContrast: false,
  zoomCursor: false,
  stopAnimation: false,
  hideImages: false,
};

type AccessibilityState = typeof DEFAULT_STATE;

const STORAGE_KEY = "naiera-accessibility-settings";

export function AccessibilityWidget() {
  const t = useTranslations("Accessibility");
  const [state, setState] = useState<AccessibilityState>(DEFAULT_STATE);
  const [mounted, setMounted] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState((prev) => ({ ...prev, ...parsed, isOpen: false }));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Apply effects whenever state changes
  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;
    const body = document.body;

    // Text Size
    html.style.setProperty("--a11y-font-scale", String(state.textSize / 100));
    html.classList.toggle("a11y-text-scale", state.textSize !== 100);

    // Line Height
    html.style.setProperty("--a11y-line-height", String(state.lineHeight));
    body.classList.toggle("a11y-line-height", state.lineHeight !== 1.5);

    // Letter Spacing
    const spacingMap = { small: "-0.05em", normal: "0", large: "0.15em" };
    html.style.setProperty(
      "--a11y-letter-spacing",
      spacingMap[state.letterSpacing]
    );
    body.classList.toggle(
      "a11y-letter-spacing",
      state.letterSpacing !== "normal"
    );

    // Text Align
    body.classList.remove(
      "a11y-align-left",
      "a11y-align-center",
      "a11y-align-right",
      "a11y-align-justify"
    );
    if (state.textAlign !== "default") {
      body.classList.add(`a11y-align-${state.textAlign}`);
    }

    // Toggles
    body.classList.toggle("a11y-readable-font", state.readableFont);
    body.classList.toggle("a11y-links-underline", state.linksUnderline);
    body.classList.toggle("a11y-monochrome", state.monochrome);
    body.classList.toggle("a11y-high-contrast", state.highContrast);
    body.classList.toggle("a11y-zoom-cursor", state.zoomCursor);
    body.classList.toggle("a11y-stop-animation", state.stopAnimation);
    body.classList.toggle("a11y-hide-images", state.hideImages);

    // Persist to localStorage (exclude isOpen)
    const toSave = { ...state };
    delete (toSave as Partial<AccessibilityState>).isOpen;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [state, mounted]);

  const toggleOpen = useCallback(() => {
    setState((s) => ({ ...s, isOpen: !s.isOpen }));
  }, []);

  const resetAll = useCallback(() => {
    setState({ ...DEFAULT_STATE, isOpen: true });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const adjustTextSize = (delta: number) => {
    setState((s) => ({
      ...s,
      textSize: Math.max(50, Math.min(200, s.textSize + delta)),
    }));
  };

  const adjustLineHeight = (delta: number) => {
    setState((s) => ({
      ...s,
      lineHeight: Math.max(1, Math.min(3, +(s.lineHeight + delta).toFixed(1))),
    }));
  };

  // Web Speech API
  const speak = useCallback(
    (text: string) => {
      if (!state.speechEnabled || typeof window === "undefined") return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    },
    [state.speechEnabled]
  );

  useEffect(() => {
    if (!state.speechEnabled) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const text = target.innerText || target.textContent;
      if (text) speak(text);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [state.speechEnabled, speak]);

  if (!mounted) return null;

  return (
    <div className="a11y-widget-root">
      {/* Floating Trigger Button */}
      <button
        onClick={toggleOpen}
        className={cn(
          "fixed right-6 bottom-6 z-[9998] flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl transition-all hover:scale-110 hover:bg-indigo-700",
          state.isOpen && "scale-0 opacity-0"
        )}
        aria-label={t("title")}
      >
        <Accessibility className="a11y-icon h-7 w-7" />
      </button>

      {/* Sidebar Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-[9999] h-full w-80 max-w-full transform overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-in-out",
          state.isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4">
          <h2 className="text-lg font-bold text-slate-800">{t("title")}</h2>
          <button
            onClick={toggleOpen}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="space-y-6 p-4">
          {/* Web Speech */}
          <ToggleRow
            icon={AudioLines}
            label={t("speech")}
            active={state.speechEnabled}
            onToggle={() =>
              setState((s) => ({ ...s, speechEnabled: !s.speechEnabled }))
            }
          />

          {/* Text Size */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Type className="h-5 w-5 text-indigo-600" />
              {t("textSize")}
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => adjustTextSize(-10)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="min-w-[60px] text-center font-semibold text-slate-800">
                {state.textSize}%
              </span>
              <button
                onClick={() => adjustTextSize(10)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Line Height */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Type className="h-5 w-5 text-indigo-600" />
              {t("lineHeight")}
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => adjustLineHeight(-0.25)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="min-w-[60px] text-center font-semibold text-slate-800">
                {state.lineHeight}x
              </span>
              <button
                onClick={() => adjustLineHeight(0.25)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Letter Spacing */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Type className="h-5 w-5 text-indigo-600" />
              {t("letterSpacing")}
            </div>
            <div className="flex gap-2">
              {(["small", "normal", "large"] as const).map((sp) => (
                <button
                  key={sp}
                  onClick={() => setState((s) => ({ ...s, letterSpacing: sp }))}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    state.letterSpacing === sp
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {t(`spacing.${sp}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Text Align */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <AlignLeft className="h-5 w-5 text-indigo-600" />
              {t("textAlign")}
            </div>
            <div className="flex gap-2">
              {[
                { key: "left", Icon: AlignLeft },
                { key: "center", Icon: AlignCenter },
                { key: "right", Icon: AlignRight },
                { key: "justify", Icon: AlignJustify },
              ].map(({ key, Icon }) => (
                <button
                  key={key}
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      textAlign:
                        s.textAlign === key
                          ? "default"
                          : (key as AccessibilityState["textAlign"]),
                    }))
                  }
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                    state.textAlign === key
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Options */}
          <ToggleRow
            icon={Bold}
            label={t("readableFont")}
            active={state.readableFont}
            onToggle={() =>
              setState((s) => ({ ...s, readableFont: !s.readableFont }))
            }
          />
          <ToggleRow
            icon={Link2}
            label={t("linksUnderline")}
            active={state.linksUnderline}
            onToggle={() =>
              setState((s) => ({ ...s, linksUnderline: !s.linksUnderline }))
            }
          />
          <ToggleRow
            icon={Contrast}
            label={t("monochrome")}
            active={state.monochrome}
            onToggle={() =>
              setState((s) => ({ ...s, monochrome: !s.monochrome }))
            }
          />
          <ToggleRow
            icon={SunMedium}
            label={t("highContrast")}
            active={state.highContrast}
            onToggle={() =>
              setState((s) => ({ ...s, highContrast: !s.highContrast }))
            }
          />
          <ToggleRow
            icon={MousePointer2}
            label={t("zoomCursor")}
            active={state.zoomCursor}
            onToggle={() =>
              setState((s) => ({ ...s, zoomCursor: !s.zoomCursor }))
            }
          />
          <ToggleRow
            icon={CircleSlash}
            label={t("stopAnimation")}
            active={state.stopAnimation}
            onToggle={() =>
              setState((s) => ({ ...s, stopAnimation: !s.stopAnimation }))
            }
          />
          <ToggleRow
            icon={ImageOff}
            label={t("hideImages")}
            active={state.hideImages}
            onToggle={() =>
              setState((s) => ({ ...s, hideImages: !s.hideImages }))
            }
          />

          {/* Reset Button */}
          <button
            onClick={resetAll}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
          >
            <RotateCcw className="h-4 w-4" />
            {t("reset")}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {state.isOpen && (
        <div
          onClick={toggleOpen}
          className="fixed inset-0 z-[9997] bg-black/30 backdrop-blur-sm"
        />
      )}
    </div>
  );
}

// Toggle Row Component
interface ToggleRowProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onToggle: () => void;
}

function ToggleRow({ icon: Icon, label, active, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Icon className="h-5 w-5 text-indigo-600" />
        {label}
      </div>
      <button
        onClick={onToggle}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          active ? "bg-indigo-600" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            active && "translate-x-5"
          )}
        />
      </button>
    </div>
  );
}
