"use client";

import { useState, useEffect } from "react";
import type { Recurrence, Ordinal, Weekday } from "@/types/recurrence";
import { ORDINALS, WEEKDAYS } from "@/types/recurrence";

const FREQUENCY_OPTIONS = [
  "Daily",
  "Weekdays",
  "Weekends",
  "Weekly",
  "Biweekly",
  "Monthly",
  "Custom",
] as const;

const CUSTOM_SUB_OPTIONS = ["Daily", "Weekly", "Monthly", "Yearly"] as const;

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_ABBREV = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function defaultForEffectiveType(
  effectiveType: string,
  isCustom: boolean,
  customSub: string
): Recurrence {
  if (effectiveType === "daily") return { type: "daily", interval: 1 };
  if (effectiveType === "weekdays") return { type: "weekdays" };
  if (effectiveType === "weekends") return { type: "weekends" };
  if (effectiveType === "weekly") return { type: "weekly", days: [1, 2, 3, 4, 5], interval: 1 };
  if (effectiveType === "biweekly") return { type: "biweekly", days: [1, 2, 3, 4, 5] };
  if (effectiveType === "monthly") return { type: "monthly", everyMonths: 1, mode: "each", days: [1] };
  if (effectiveType === "yearly") return { type: "yearly", everyYears: 1, months: [1] };
  return { type: "weekly", days: [1, 2, 3, 4, 5], interval: 1 };
}

/* ─── Shared styling constants ───────────────────────────────── */
const INPUT_CLS = "border border-border bg-background rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";
const SELECT_CLS = "border border-border bg-background rounded-lg pl-3 pr-8 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";
const LABEL_CLS = "block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5";

type Props = {
  value: Recurrence | null;
  onChange: (r: Recurrence) => void;
};

export function RecurrencePicker({ value, onChange }: Props) {
  const [frequency, setFrequency] = useState<typeof FREQUENCY_OPTIONS[number]>(
    value ? frequencyFromRecurrence(value) : "Weekly"
  );
  const [customSub, setCustomSub] = useState<typeof CUSTOM_SUB_OPTIONS[number]>("Weekly");
  const isCustom = frequency === "Custom";
  const effectiveType = isCustom ? customSub.toLowerCase() : frequency.toLowerCase();

  useEffect(() => {
    if (!value) return;
    const matches =
      (effectiveType === "daily" && value.type === "daily") ||
      (effectiveType === "weekdays" && value.type === "weekdays") ||
      (effectiveType === "weekends" && value.type === "weekends") ||
      (effectiveType === "weekly" && value.type === "weekly") ||
      (effectiveType === "biweekly" && value.type === "biweekly") ||
      (effectiveType === "monthly" && value.type === "monthly") ||
      (effectiveType === "yearly" && value.type === "yearly");
    if (!matches) {
      onChange(defaultForEffectiveType(effectiveType, isCustom, customSub));
    }
  }, [effectiveType, isCustom, customSub]);

  function frequencyFromRecurrence(r: Recurrence): typeof FREQUENCY_OPTIONS[number] {
    if (r.type === "daily") return r.interval && r.interval > 1 ? "Custom" : "Daily";
    if (r.type === "weekdays") return "Weekdays";
    if (r.type === "weekends") return "Weekends";
    if (r.type === "weekly") return r.interval && r.interval > 1 ? "Custom" : "Weekly";
    if (r.type === "biweekly") return "Biweekly";
    if (r.type === "monthly") return "Monthly";
    if (r.type === "yearly") return "Custom";
    return "Weekly";
  }

  const showCustomConfig =
    isCustom &&
    (effectiveType === "daily" ||
      effectiveType === "weekly" ||
      effectiveType === "monthly" ||
      effectiveType === "yearly");

  function applyRecurrence(r: Recurrence) {
    onChange(r);
  }

  return (
    <div className="space-y-4 border border-border rounded-xl p-4 bg-muted/50">
      <div>
        <label className={LABEL_CLS}>Frequency</label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as typeof frequency)}
          className={`w-full ${SELECT_CLS}`}
        >
          {FREQUENCY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {isCustom && (
        <div>
          <label className={LABEL_CLS}>Custom</label>
          <select
            value={customSub}
            onChange={(e) => setCustomSub(e.target.value as typeof customSub)}
            className={`w-full ${SELECT_CLS}`}
          >
            {CUSTOM_SUB_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )}

      {showCustomConfig && effectiveType === "daily" && (
        <DailyOptions value={value && value.type === "daily" ? value : null} onChange={applyRecurrence} collapsibleSubSections />
      )}
      {showCustomConfig && effectiveType === "weekly" && (
        <WeeklyOptions value={value && value.type === "weekly" ? value : null} isBiweekly={false} onChange={applyRecurrence} collapsibleSubSections />
      )}
      {showCustomConfig && effectiveType === "monthly" && (
        <MonthlyOptions value={value && value.type === "monthly" ? value : null} onChange={applyRecurrence} collapsibleSubSections />
      )}
      {showCustomConfig && effectiveType === "yearly" && (
        <YearlyOptions value={value && value.type === "yearly" ? value : null} onChange={applyRecurrence} collapsibleSubSections />
      )}

      {!isCustom && effectiveType === "daily" && (
        <DailyOptions value={value && value.type === "daily" ? value : null} onChange={applyRecurrence} />
      )}
      {!isCustom && (effectiveType === "weekly" || effectiveType === "biweekly") && (
        <WeeklyOptions
          value={value && (value.type === "weekly" || value.type === "biweekly") ? value : null}
          isBiweekly={effectiveType === "biweekly"}
          onChange={applyRecurrence}
        />
      )}
      {!isCustom && effectiveType === "monthly" && (
        <MonthlyOptions value={value && value.type === "monthly" ? value : null} onChange={applyRecurrence} />
      )}
      {!isCustom && effectiveType === "yearly" && (
        <YearlyOptions value={value && value.type === "yearly" ? value : null} onChange={applyRecurrence} />
      )}

      {(effectiveType === "weekdays" || effectiveType === "weekends") && (
        <ApplyPreset
          preset={effectiveType === "weekdays" ? { type: "weekdays" } : { type: "weekends" }}
          current={value}
          onChange={onChange}
        />
      )}
    </div>
  );
}

/* ─── Collapsible Section ─────────────────────────────────────── */

function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-lg bg-background overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium hover:bg-accent transition-colors"
      >
        <span>{title}</span>
        <span className="text-muted-foreground text-xs" aria-hidden>
          {expanded ? "▲" : "▼"}
        </span>
      </button>
      {expanded && <div className="px-3 pb-3 pt-0 space-y-4">{children}</div>}
    </div>
  );
}

/* ─── Toggle Button (day/month selector) ──────────────────────── */

const TOGGLE_BASE = "rounded-lg border text-sm font-medium transition-colors";
const TOGGLE_ON = "bg-primary text-primary-foreground border-primary";
const TOGGLE_OFF = "bg-background border-border text-foreground hover:bg-accent";

/* ─── Daily Options ───────────────────────────────────────────── */

function DailyOptions({
  value,
  onChange,
  collapsibleSubSections,
}: {
  value: Recurrence | null;
  onChange: (r: Recurrence) => void;
  collapsibleSubSections?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const interval = value && value.type === "daily" ? (value.interval ?? 1) : 1;
  const content = (
    <div>
      <label className={LABEL_CLS}>Every</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={365}
          value={interval}
          onChange={(e) => onChange({ type: "daily", interval: Math.max(1, Number(e.target.value) || 1) })}
          className={`w-20 ${INPUT_CLS}`}
        />
        <span className="text-sm text-muted-foreground">day(s)</span>
      </div>
    </div>
  );
  if (collapsibleSubSections) {
    return (
      <CollapsibleSection title="Every X days" expanded={expanded} onToggle={() => setExpanded((e) => !e)}>
        {content}
      </CollapsibleSection>
    );
  }
  return content;
}

/* ─── Weekly Options ──────────────────────────────────────────── */

function WeeklyOptions({
  value,
  isBiweekly,
  onChange,
  collapsibleSubSections,
}: {
  value: Recurrence | null;
  isBiweekly: boolean;
  onChange: (r: Recurrence) => void;
  collapsibleSubSections?: boolean;
}) {
  const [intervalExpanded, setIntervalExpanded] = useState(true);
  const [daysExpanded, setDaysExpanded] = useState(true);
  const days = value && (value.type === "weekly" || value.type === "biweekly") ? value.days : [1, 2, 3, 4, 5];
  const interval = value && value.type === "weekly" && value.interval ? value.interval : 1;

  function toggleDay(d: number) {
    const next = days.includes(d) ? days.filter((x) => x !== d) : [...days, d].sort((a, b) => a - b);
    if (next.length === 0) return;
    if (isBiweekly) {
      onChange({ type: "biweekly", days: next });
    } else {
      onChange({ type: "weekly", days: next, interval: interval > 1 ? interval : undefined });
    }
  }

  function setIntervalEvery(n: number) {
    if (isBiweekly) return;
    onChange({ type: "weekly", days, interval: n > 1 ? n : undefined });
  }

  const intervalBlock = !isBiweekly ? (
    <div>
      <label className={LABEL_CLS}>Every</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={52}
          value={interval}
          onChange={(e) => setIntervalEvery(Math.max(1, Number(e.target.value) || 1))}
          className={`w-20 ${INPUT_CLS}`}
        />
        <span className="text-sm text-muted-foreground">week(s)</span>
      </div>
    </div>
  ) : null;

  const daysBlock = (
    <div>
      <span className={LABEL_CLS}>Days</span>
      <div className="flex gap-1.5 mt-1">
        {[0, 1, 2, 3, 4, 5, 6].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => toggleDay(d)}
            className={`w-9 h-9 ${TOGGLE_BASE} ${days.includes(d) ? TOGGLE_ON : TOGGLE_OFF}`}
          >
            {DAY_LETTERS[d]}
          </button>
        ))}
      </div>
    </div>
  );

  if (collapsibleSubSections) {
    return (
      <div className="space-y-2">
        {intervalBlock && (
          <CollapsibleSection title="Every X weeks" expanded={intervalExpanded} onToggle={() => setIntervalExpanded((e) => !e)}>
            {intervalBlock}
          </CollapsibleSection>
        )}
        <CollapsibleSection title="Days of week" expanded={daysExpanded} onToggle={() => setDaysExpanded((e) => !e)}>
          {daysBlock}
        </CollapsibleSection>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {intervalBlock}
      {daysBlock}
    </div>
  );
}

/* ─── Monthly Options ─────────────────────────────────────────── */

function MonthlyOptions({
  value,
  onChange,
  collapsibleSubSections,
}: {
  value: Recurrence | null;
  onChange: (r: Recurrence) => void;
  collapsibleSubSections?: boolean;
}) {
  const [eachExpanded, setEachExpanded] = useState(true);
  const [onTheExpanded, setOnTheExpanded] = useState(true);
  const base = value && value.type === "monthly" ? value : null;
  const everyMonths = base ? base.everyMonths : 1;
  const mode = base?.mode ?? "each";
  const days = base && base.mode === "each" ? base.days : [];
  const ordinal = base && base.mode === "on_the" ? base.ordinal : "first";
  const weekday = base && base.mode === "on_the" ? base.weekday : "sunday";

  const everyBlock = (
    <div>
      <label className={LABEL_CLS}>Every</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={12}
          value={everyMonths}
          onChange={(e) => {
            const n = Math.max(1, Number(e.target.value) || 1);
            if (mode === "each") onChange({ type: "monthly", everyMonths: n, mode: "each", days });
            else onChange({ type: "monthly", everyMonths: n, mode: "on_the", ordinal, weekday });
          }}
          className={`w-20 ${INPUT_CLS}`}
        />
        <span className="text-sm text-muted-foreground">month(s)</span>
      </div>
    </div>
  );

  const eachBlock = (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input
          type="radio"
          name="monthly-mode"
          checked={mode === "each"}
          onChange={() => onChange({ type: "monthly", everyMonths, mode: "each", days: days.length ? days : [1] })}
          className="accent-primary"
        />
        Each
      </label>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => {
              const next = days.includes(d) ? days.filter((x) => x !== d) : [...days, d].sort((a, b) => a - b);
              if (next.length === 0) return;
              onChange({ type: "monthly", everyMonths, mode: "each", days: next });
            }}
            className={`h-8 ${TOGGLE_BASE} text-xs ${days.includes(d) ? TOGGLE_ON : TOGGLE_OFF}`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );

  const onTheBlock = (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input
          type="radio"
          name="monthly-mode"
          checked={mode === "on_the"}
          onChange={() => onChange({ type: "monthly", everyMonths, mode: "on_the", ordinal, weekday })}
          className="accent-primary"
        />
        On the
      </label>
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={ordinal}
          onChange={(e) => onChange({ type: "monthly", everyMonths, mode: "on_the", ordinal: e.target.value as Ordinal, weekday })}
          className={SELECT_CLS}
        >
          {ORDINALS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <select
          value={weekday}
          onChange={(e) => onChange({ type: "monthly", everyMonths, mode: "on_the", ordinal, weekday: e.target.value as Weekday })}
          className={SELECT_CLS}
        >
          {WEEKDAYS.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </div>
    </div>
  );

  if (collapsibleSubSections) {
    return (
      <div className="space-y-2">
        {everyBlock}
        <CollapsibleSection title="Each (days of month)" expanded={eachExpanded} onToggle={() => setEachExpanded((e) => !e)}>
          {eachBlock}
        </CollapsibleSection>
        <CollapsibleSection title="On the (ordinal weekday)" expanded={onTheExpanded} onToggle={() => setOnTheExpanded((e) => !e)}>
          {onTheBlock}
        </CollapsibleSection>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {everyBlock}
      <div className="space-y-3">
        {eachBlock}
        {onTheBlock}
      </div>
    </div>
  );
}

/* ─── Yearly Options ──────────────────────────────────────────── */

function YearlyOptions({
  value,
  onChange,
  collapsibleSubSections,
}: {
  value: Recurrence | null;
  onChange: (r: Recurrence) => void;
  collapsibleSubSections?: boolean;
}) {
  const [monthsExpanded, setMonthsExpanded] = useState(true);
  const [onTheExpanded, setOnTheExpanded] = useState(true);
  const base = value && value.type === "yearly" ? value : null;
  const everyYears = base ? base.everyYears : 1;
  const months = base ? base.months : [];
  const onThe = base?.onThe;
  const [useOnThe, setUseOnThe] = useState(!!onThe);
  const ordinal = onThe?.ordinal ?? "first";
  const weekday = onThe?.weekday ?? "sunday";

  function toggleMonth(m: number) {
    const next = months.includes(m) ? months.filter((x) => x !== m) : [...months, m].sort((a, b) => a - b);
    onChange({
      type: "yearly",
      everyYears,
      months: next,
      onThe: useOnThe ? { ordinal, weekday } : undefined,
    });
  }

  const everyBlock = (
    <div>
      <label className={LABEL_CLS}>Every</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={10}
          value={everyYears}
          onChange={(e) => {
            const n = Math.max(1, Number(e.target.value) || 1);
            onChange({
              type: "yearly",
              everyYears: n,
              months,
              onThe: useOnThe ? { ordinal, weekday } : undefined,
            });
          }}
          className={`w-20 ${INPUT_CLS}`}
        />
        <span className="text-sm text-muted-foreground">year(s)</span>
      </div>
    </div>
  );

  const monthsBlock = (
    <div>
      <span className={LABEL_CLS}>Months</span>
      <div className="grid grid-cols-4 gap-2 mt-1">
        {MONTH_ABBREV.map((label, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggleMonth(i + 1)}
            className={`py-2 ${TOGGLE_BASE} ${months.includes(i + 1) ? TOGGLE_ON : TOGGLE_OFF}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  const onTheBlock = (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
        <input
          type="checkbox"
          checked={useOnThe}
          onChange={(e) => {
            setUseOnThe(e.target.checked);
            onChange({
              type: "yearly",
              everyYears,
              months,
              onThe: e.target.checked ? { ordinal, weekday } : undefined,
            });
          }}
          className="accent-primary"
        />
        On the
      </label>
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={ordinal}
          disabled={!useOnThe}
          onChange={(e) => onChange({
            type: "yearly",
            everyYears,
            months,
            onThe: { ordinal: e.target.value as Ordinal, weekday },
          })}
          className={`${SELECT_CLS} disabled:opacity-50`}
        >
          {ORDINALS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <select
          value={weekday}
          disabled={!useOnThe}
          onChange={(e) => onChange({
            type: "yearly",
            everyYears,
            months,
            onThe: { ordinal, weekday: e.target.value as Weekday },
          })}
          className={`${SELECT_CLS} disabled:opacity-50`}
        >
          {WEEKDAYS.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </div>
    </div>
  );

  if (collapsibleSubSections) {
    return (
      <div className="space-y-2">
        {everyBlock}
        <CollapsibleSection title="Months of year" expanded={monthsExpanded} onToggle={() => setMonthsExpanded((e) => !e)}>
          {monthsBlock}
        </CollapsibleSection>
        <CollapsibleSection title="On the (ordinal weekday)" expanded={onTheExpanded} onToggle={() => setOnTheExpanded((e) => !e)}>
          {onTheBlock}
        </CollapsibleSection>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {everyBlock}
      {monthsBlock}
      {onTheBlock}
    </div>
  );
}

/* ─── Apply Preset ────────────────────────────────────────────── */

function ApplyPreset({
  preset,
  current,
  onChange,
}: {
  preset: Recurrence;
  current: Recurrence | null;
  onChange: (r: Recurrence) => void;
}) {
  if (!current || current.type !== preset.type) {
    onChange(preset);
  }
  return null;
}
