"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { answerBeginnerQuestion, applyGuideReply } from "@/lib/beginner-guide";
import { loadProfile, saveProfile } from "@/lib/profile-storage";

type ChatMessage = {
  role: "guide" | "shopper";
  text: string;
};

const OPENER = answerBeginnerQuestion("hello");

export function BeginnerChat() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "guide", text: OPENER.reply },
  ]);
  const [suggestions, setSuggestions] = useState(OPENER.suggestions);
  const [savedType, setSavedType] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    inputRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages, open]);

  function ask(raw: string) {
    const question = raw.trim();
    if (!question) return;
    const reply = answerBeginnerQuestion(question);
    if (reply.summary || reply.rvTypes.length > 0) {
      const saved = applyGuideReply(loadProfile(), reply);
      saveProfile(saved);
      setSavedType(saved.rvTypes[saved.rvTypes.length - 1] || "");
    }
    setMessages((current) => [
      ...current,
      { role: "shopper", text: question },
      { role: "guide", text: reply.reply },
    ]);
    setSuggestions(reply.suggestions);
    setDraft("");
  }

  return (
    <div
      className={`fixed right-4 bottom-4 z-40 flex flex-col items-end ${
        open ? "w-[min(100vw-2rem,24rem)]" : ""
      }`}
    >
      {open ? (
        <section
          role="dialog"
          aria-label="Newcomer guide"
          className="mb-3 flex max-h-[min(70svh,36rem)] w-full flex-col overflow-hidden rounded-md border border-fog bg-white shadow-xl"
        >
          <header className="flex items-start justify-between gap-3 border-b border-fog px-4 py-3">
            <div>
              <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
                Newcomer guide
              </p>
              <p className="text-sm text-ink/65">
                Towable or motorized, in plain language.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm font-bold text-signal"
            >
              Close
            </button>
          </header>
          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <p
                key={`${message.role}-${index}`}
                className={`whitespace-pre-wrap rounded-md px-3 py-2 text-sm leading-relaxed ${
                  message.role === "shopper"
                    ? "ml-8 bg-signal text-white"
                    : "mr-4 bg-mist text-ink"
                }`}
              >
                {message.text}
              </p>
            ))}
            {savedType ? (
              <div className="rounded-md border border-signal/30 bg-white px-3 py-3 text-sm text-ink">
                <p className="font-semibold">Saved on your profile: {savedType}</p>
                <Link
                  href="/profile/start"
                  className="mt-3 inline-flex rounded-md bg-signal px-4 py-2 text-sm font-bold text-white"
                >
                  BUILD MY PROFILE
                </Link>
              </div>
            ) : null}
          </div>
          <div className="border-t border-fog px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => ask(suggestion)}
                  className="rounded-full border border-fog px-3 py-1 text-left text-xs font-semibold text-ink hover:border-signal"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                ask(draft);
              }}
            >
              <input
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask a beginner question"
                className="w-full rounded-md border border-fog px-3 py-2 text-sm text-ink outline-none focus:border-signal"
              />
              <button
                type="submit"
                className="rounded-md bg-signal px-3 py-2 text-sm font-bold text-white"
              >
                Ask
              </button>
            </form>
          </div>
        </section>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full bg-signal px-5 py-3 text-sm font-bold tracking-wide text-white shadow-lg hover:bg-signal-deep"
      >
        {open ? "HIDE GUIDE" : "NEW TO RVS? ASK"}
      </button>
    </div>
  );
}
