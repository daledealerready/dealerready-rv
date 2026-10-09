"use client";

import { useRef, useState } from "react";
import {
  canonicalMake,
  isKnownMake,
  modelsForMake,
  NOT_SURE,
  OTHER,
  RV_MAKES,
  rvYears,
} from "@/lib/rv-catalog";

const inputClass =
  "w-full rounded-md border border-fog bg-white px-4 py-3 text-base text-ink outline-none focus:border-signal disabled:bg-mist disabled:text-ink/40";

function otherMake(make: string) {
  return Boolean(make) && make !== NOT_SURE && !isKnownMake(make);
}

function otherModel(make: string, model: string) {
  return (
    Boolean(model) &&
    model !== NOT_SURE &&
    isKnownMake(make) &&
    !modelsForMake(make).includes(model)
  );
}

export function RvYearSelect({
  value,
  onChange,
  required = false,
  placeholder = "Select a year",
  className = inputClass,
}: {
  value: string;
  onChange: (year: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const years = rvYears();
  const options = years.includes(value) || !value ? years : [value, ...years];
  return (
    <select
      className={className}
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
}

export function RvIdentityFields({
  year,
  make,
  model,
  onChange,
  showYear = true,
  allowNotSure = false,
  requireYear = false,
  requireMake = false,
  requireModel = false,
  yearLabel = "Year",
  makeLabel = "Make",
  modelLabel = "Model",
  className,
  labelClassName = "mb-2 block text-sm font-semibold text-ink/70",
  hintClassName = "text-sm text-ink/70",
  linkClassName = "font-semibold text-signal underline",
  showHint = true,
}: {
  year: string;
  make: string;
  model: string;
  onChange: (next: { year: string; make: string; model: string }) => void;
  showYear?: boolean;
  allowNotSure?: boolean;
  requireYear?: boolean;
  requireMake?: boolean;
  requireModel?: boolean;
  yearLabel?: string;
  makeLabel?: string;
  modelLabel?: string;
  className?: string;
  labelClassName?: string;
  hintClassName?: string;
  linkClassName?: string;
  showHint?: boolean;
}) {
  const makeInputRef = useRef<HTMLInputElement>(null);
  const [makeIsOther, setMakeIsOther] = useState(() => otherMake(make));
  const [modelIsOther, setModelIsOther] = useState(() => otherModel(make, model));

  const makes = RV_MAKES;
  const models = modelsForMake(make);
  const makeValue = makeIsOther ? OTHER : make === NOT_SURE ? NOT_SURE : isKnownMake(make) ? canonicalMake(make) : "";
  const modelValue = modelIsOther
    ? OTHER
    : model === NOT_SURE
      ? NOT_SURE
      : models.includes(model)
        ? model
        : "";
  const customMake = makeIsOther;
  const customModel = makeIsOther || modelIsOther;
  const modelLocked = !make || make === NOT_SURE || makeIsOther;
  const span = showYear ? "sm:col-span-3" : "sm:col-span-2";

  function chooseYear(nextYear: string) {
    onChange({ year: nextYear, make, model });
  }

  function chooseMake(nextMake: string) {
    if (nextMake === OTHER) {
      setMakeIsOther(true);
      setModelIsOther(false);
      onChange({ year, make: "", model: "" });
      return;
    }
    setMakeIsOther(false);
    setModelIsOther(false);
    const keepModel = nextMake !== NOT_SURE && modelsForMake(nextMake).includes(model) ? model : "";
    onChange({
      year,
      make: nextMake,
      model: keepModel,
    });
  }

  function chooseModel(nextModel: string) {
    if (nextModel === OTHER) {
      setModelIsOther(true);
      onChange({ year, make, model: "" });
      return;
    }
    setModelIsOther(false);
    onChange({ year, make, model: nextModel });
  }

  function typeItIn() {
    setMakeIsOther(true);
    setModelIsOther(false);
    const typedMake = make === NOT_SURE ? "" : isKnownMake(make) ? canonicalMake(make) : make;
    const typedModel = model === NOT_SURE ? "" : model;
    onChange({ year, make: typedMake, model: typedModel });
    window.setTimeout(() => makeInputRef.current?.focus(), 0);
  }

  function chooseFromList() {
    setMakeIsOther(false);
    setModelIsOther(false);
    const listedMake = isKnownMake(make) ? canonicalMake(make) : "";
    const listedModel =
      listedMake && modelsForMake(listedMake).includes(model) ? model : "";
    onChange({ year, make: listedMake, model: listedModel });
  }

  const gridClass =
    className ?? (showYear ? "grid gap-4 sm:grid-cols-3" : "grid gap-4 sm:grid-cols-2");

  return (
    <div className={gridClass}>
      {showYear ? (
        <label className="block">
          <span className={labelClassName}>{yearLabel}</span>
          <RvYearSelect value={year} onChange={chooseYear} required={requireYear} />
        </label>
      ) : null}
      <label className="block">
        <span className={labelClassName}>{makeLabel}</span>
        <select
          className={inputClass}
          value={makeValue}
          required={requireMake}
          onChange={(event) => chooseMake(event.target.value)}
        >
          <option value="">Select a make</option>
          {allowNotSure ? <option value={NOT_SURE}>{NOT_SURE}</option> : null}
          {makes.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
          <option value={OTHER}>Other</option>
        </select>
      </label>
      <label className="block">
        <span className={labelClassName}>{modelLabel}</span>
        <select
          className={inputClass}
          value={modelLocked ? "" : modelValue}
          required={requireModel && !modelLocked && !modelIsOther}
          disabled={modelLocked}
          onChange={(event) => chooseModel(event.target.value)}
        >
          <option value="">
            {makeIsOther ? "Type the model below" : make ? "Select a model" : "Select a make first"}
          </option>
          {allowNotSure && !modelLocked ? <option value={NOT_SURE}>{NOT_SURE}</option> : null}
          {models.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
          {!modelLocked ? <option value={OTHER}>Other</option> : null}
        </select>
      </label>
      {customMake ? (
        <label className={`block ${span}`}>
          <span className={labelClassName}>Type the manufacturer</span>
          <input
            className={inputClass}
            ref={makeInputRef}
            value={make}
            required={requireMake}
            onChange={(event) => onChange({ year, make: event.target.value, model })}
          />
        </label>
      ) : null}
      {customModel ? (
        <label className={`block ${span}`}>
          <span className={labelClassName}>Type the model</span>
          <input
            className={inputClass}
            value={model}
            required={requireModel}
            onChange={(event) => onChange({ year, make, model: event.target.value })}
          />
        </label>
      ) : null}
      {showHint ? (
        <p className={`${hintClassName} ${span}`}>
          {customMake ? (
            <>
              Want the menus instead?{" "}
              <button type="button" className={linkClassName} onClick={chooseFromList}>
                Click here
              </button>{" "}
              to choose from the list.
            </>
          ) : (
            <>
              If you cannot find your make and model,{" "}
              <button type="button" className={linkClassName} onClick={typeItIn}>
                click here
              </button>{" "}
              to type it in.
            </>
          )}
        </p>
      ) : null}
    </div>
  );
}
