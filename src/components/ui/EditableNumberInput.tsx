"use client";

import { useEffect, useState } from "react";

type EditableNumberInputProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
};

function normalizeNumberDraft(value: number) {
  return Number.isFinite(value) ? String(value) : "";
}

function clampNumber(value: number, min?: number, max?: number) {
  let next = value;
  if (typeof min === "number" && next < min) next = min;
  if (typeof max === "number" && next > max) next = max;
  return next;
}

export function EditableNumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  className = "input",
  placeholder,
  ariaLabel
}: EditableNumberInputProps) {
  const [draft, setDraft] = useState(() => normalizeNumberDraft(value));

  useEffect(() => {
    setDraft(normalizeNumberDraft(value));
  }, [value]);

  function commitDraft(rawDraft = draft) {
    const trimmed = rawDraft.trim();
    if (!trimmed) {
      const fallback = typeof min === "number" ? min : 0;
      setDraft(normalizeNumberDraft(fallback));
      onChange(fallback);
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      setDraft(normalizeNumberDraft(value));
      return;
    }

    const clamped = clampNumber(parsed, min, max);
    setDraft(normalizeNumberDraft(clamped));
    onChange(clamped);
  }

  return (
    <input
      type="number"
      inputMode="decimal"
      className={className}
      value={draft}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(event) => {
        const raw = event.target.value;
        setDraft(raw);
        if (raw.trim() === "" || raw === "-" || raw === ".") return;
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) onChange(parsed);
      }}
      onBlur={() => commitDraft()}
    />
  );
}
