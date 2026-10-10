"use client";

import { useState } from "react";
import { RvIdentityFields } from "@/components/RvIdentityFields";
import {
  MAX_SELL_PHOTOS,
  MAX_SELL_VIDEOS,
  classifySellFile,
  prepareSellUpload,
  uploadSellFile,
  type SellMediaKind,
} from "@/lib/sell-media";

type LocalMedia = {
  id: string;
  file: File;
  kind: SellMediaKind;
  previewUrl: string;
};

const CATEGORIES = [
  "Class A Diesel",
  "Class A Gas",
  "Class C",
  "High-end Fifth Wheel",
];

const inputClass =
  "w-full rounded-md border border-fog bg-white px-4 py-3 text-base text-ink outline-none focus:border-signal";

export function WeBuyForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [zip, setZip] = useState("");
  const [rvCategory, setRvCategory] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [notes, setNotes] = useState("");
  const [payoffStatus, setPayoffStatus] = useState("");
  const [lenderName, setLenderName] = useState("");
  const [media, setMedia] = useState<LocalMedia[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const photoCount = media.filter((item) => item.kind === "photo").length;
  const videoCount = media.filter((item) => item.kind === "video").length;

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    setError("");
    const next = [...media];
    for (const file of Array.from(list)) {
      const kind = classifySellFile(file);
      if (!kind) {
        setError("Use a photo (JPG, PNG, WEBP, HEIC) or a video (MP4, MOV, WEBM).");
        continue;
      }
      if (kind === "video" && file.size > 45 * 1024 * 1024) {
        const megs = Math.max(1, Math.round(file.size / (1024 * 1024)));
        setError(
          `${file.name} is ${megs} MB. Each video must be under 45 MB. Remove it, or record a shorter walk-around, then send the photos.`,
        );
        continue;
      }
      const photos = next.filter((item) => item.kind === "photo").length;
      const videos = next.filter((item) => item.kind === "video").length;
      if (kind === "photo" && photos >= MAX_SELL_PHOTOS) {
        setError(`You can add up to ${MAX_SELL_PHOTOS} photos.`);
        continue;
      }
      if (kind === "video" && videos >= MAX_SELL_VIDEOS) {
        setError(`You can add up to ${MAX_SELL_VIDEOS} videos.`);
        continue;
      }
      next.push({
        id: crypto.randomUUID(),
        file,
        kind,
        previewUrl: URL.createObjectURL(file),
      });
    }
    setMedia(next);
  }

  function removeMedia(id: string) {
    setMedia((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return current.filter((entry) => entry.id !== id);
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (payoffStatus !== "Paid off" && payoffStatus !== "Financed") {
      setError("Tell us if the RV is paid off or financed.");
      return;
    }
    if (payoffStatus === "Financed" && lenderName.trim().length < 2) {
      setError("Enter the financing institution name.");
      return;
    }
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const uploaded = [];
      const folderId = crypto.randomUUID();
      for (let index = 0; index < media.length; index += 1) {
        const item = media[index];
        setStatus(`Uploading ${index + 1} of ${media.length}...`);
        const prepared = await prepareSellUpload(folderId, item.file, item.kind);
        await uploadSellFile(prepared);
        uploaded.push({
          path: prepared.path,
          kind: prepared.kind,
          name: prepared.name,
        });
      }
      setStatus("Sending your request...");
      const response = await fetch("/api/we-buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          mobile,
          zip,
          rvCategory,
          year,
          make,
          model,
          notes,
          payoffStatus,
          lenderName: payoffStatus === "Financed" ? lenderName : "",
          files: uploaded,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error || "Could not send your request.");
        return;
      }
      setDone(true);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "";
      if (/failed to fetch|network|load failed|aborted|timeout/i.test(message)) {
        setError(
          "The upload stopped before it finished. Remove the video and send the photos first if the signal is weak. A shorter video can go in a second request.",
        );
      } else {
        setError(message || "Could not send your request. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-md border border-fog bg-white p-6">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
          Request received.
        </h2>
        <p className="mt-3 text-ink/75">
          {photoCount + videoCount > 0
            ? `We received ${photoCount} photo${photoCount === 1 ? "" : "s"}${videoCount ? ` and ${videoCount} video${videoCount === 1 ? "" : "s"}` : ""}. DealerReady will review them and follow up with a purchase offer.`
            : "DealerReady will review your unit and follow up for the photos and video needed to prepare a purchase offer."}{" "}
          This is not a financing application.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="grid gap-4 rounded-md border border-fog bg-white p-6">
      <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide text-ink">
        Request a purchase offer
      </h2>
      <p className="text-sm leading-relaxed text-ink/70">
        Add the photos and walk-around video here. Complete photos keep the offer from changing on pickup day.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">First name</span>
          <input className={inputClass} value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">Last name</span>
          <input className={inputClass} value={lastName} onChange={(event) => setLastName(event.target.value)} required />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">Email</span>
          <input className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">Mobile</span>
          <input className={inputClass} type="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} required />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink/70">What are you selling?</span>
        <select className={inputClass} value={rvCategory} onChange={(event) => setRvCategory(event.target.value)} required>
          <option value="">Select one</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <RvIdentityFields
        year={year}
        make={make}
        model={model}
        onChange={(next) => {
          setYear(next.year);
          setMake(next.make);
          setModel(next.model);
        }}
      />
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink/70">Is this RV paid off or financed?</span>
        <select
          className={inputClass}
          value={payoffStatus}
          required
          onChange={(event) => {
            setPayoffStatus(event.target.value);
            if (event.target.value !== "Financed") setLenderName("");
          }}
        >
          <option value="">Select one</option>
          <option value="Paid off">Paid off</option>
          <option value="Financed">Financed</option>
        </select>
      </label>
      {payoffStatus === "Financed" ? (
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">Financing institution</span>
          <input
            className={inputClass}
            value={lenderName}
            required
            placeholder="Bank or finance company name"
            onChange={(event) => setLenderName(event.target.value)}
          />
        </label>
      ) : null}
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink/70">ZIP code</span>
        <input className={inputClass} value={zip} onChange={(event) => setZip(event.target.value)} />
      </label>
      <div className="rounded-md border border-fog bg-paper p-4">
        <p className="text-sm font-semibold text-ink">Photos and video</p>
        <p className="mt-1 text-sm text-ink/70">
          {photoCount} of 15–20 photos · {videoCount} of {MAX_SELL_VIDEOS} videos. A one to two minute walk-around is enough. Each video must be under 45 MB.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="inline-flex cursor-pointer justify-center rounded-md bg-signal px-4 py-3 text-sm font-bold tracking-wide text-white hover:bg-signal-deep">
            ADD PHOTOS
            <input
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              className="sr-only"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
          <label className="inline-flex cursor-pointer justify-center rounded-md border border-fog bg-white px-4 py-3 text-sm font-bold tracking-wide text-ink hover:bg-mist">
            ADD VIDEO
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
              className="sr-only"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        </div>
        {media.length > 0 ? (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((item) => (
              <li key={item.id} className="overflow-hidden rounded-md border border-fog bg-white">
                {item.kind === "photo" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.previewUrl} alt="" className="h-28 w-full object-cover" />
                ) : (
                  <video src={item.previewUrl} className="h-28 w-full bg-ink object-cover" muted />
                )}
                <div className="flex items-center justify-between gap-2 px-2 py-2">
                  <p className="truncate text-xs text-ink/70">
                    {item.file.name} · {Math.max(1, Math.round(item.file.size / (1024 * 1024)))} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => removeMedia(item.id)}
                    className="shrink-0 text-xs font-bold text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink/70">Anything we should know</span>
        <textarea className={inputClass} rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-signal px-6 py-3 text-sm font-bold tracking-wide text-white hover:bg-signal-deep disabled:opacity-60"
      >
        {saving ? status || "SENDING..." : "REQUEST A PURCHASE OFFER"}
      </button>
    </form>
  );
}
