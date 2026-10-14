"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import {
  HiOutlineArrowDownTray, HiOutlineArrowPath, HiOutlineBriefcase, HiOutlineChatBubbleLeftRight, HiOutlineCodeBracket,
  HiOutlineRectangleStack, HiOutlineSparkles, HiOutlineUser, HiOutlineArrowUpRight, HiOutlineEnvelope, HiOutlinePaperAirplane,
  HiOutlinePencilSquare, HiOutlineXMark, HiStop,
} from "react-icons/hi2";
import BotMascot from "@/components/BotMascot";
import GirlGuide from "@/components/GirlGuide";
import { experience, profile, projects, stats, type Project } from "@/lib/data";

type Message = { role: "user" | "assistant"; content: string; error?: boolean };

const facts = stats.filter((s) => s.label !== "Certifications");
const currentJob = experience[0];
// Starter questions modelled on what recruiters ask in a first screen: intro, current work, skill checks, fit, CV.
const questions = [
  { q: "Tell me about him in 30 seconds", hint: "Quick intro", Icon: HiOutlineUser },
  { q: "What is he working on right now?", hint: "Current role", Icon: HiOutlineBriefcase },
  { q: "How experienced is he with React and Node.js?", hint: "Skills check", Icon: HiOutlineCodeBracket },
  { q: "Which project best shows his skills?", hint: "Real work", Icon: HiOutlineRectangleStack },
  { q: "Why should we hire him?", hint: "Strengths", Icon: HiOutlineSparkles },
  { q: "What roles is he open to, and how do I reach him?", hint: "Availability and contact", Icon: HiOutlineChatBubbleLeftRight },
];

// Short names the assistant is likely to use for each project, e.g. "Rishta & Rang" or "Hostel Management".
const projectKeys = projects
  .filter((p) => p.title !== "Personal Portfolio Website")
  .map((p) => ({
    project: p,
    key: p.title.split(" — ")[0].replace(/ (Website|Dashboard|System|Clone)$/, "").toLowerCase(),
  }));

function mentionedProjects(text: string): Project[] {
  const lower = text.toLowerCase();
  return projectKeys.filter(({ key }) => lower.includes(key)).map(({ project }) => project).slice(0, 3);
}

/* AI assistant launcher + full-screen chat that answers visitor questions from the portfolio data via /api/chat. */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [greet, setGreet] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stickToBottom = useRef(true);

  // The girl says hello a few seconds after load (after the preloader), until the visitor opens or dismisses it.
  useEffect(() => {
    const t = setTimeout(() => setGreet(true), 4500);
    return () => clearTimeout(t);
  }, []);

  // While the full-screen chat is open: pause smooth scrolling and page scroll, focus the input, close on Escape.
  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.__lenis?.start();
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Follow the streaming answer unless the visitor has scrolled up to reread something.
  useEffect(() => {
    if (stickToBottom.current) listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open]);

  const onScroll = () => {
    const el = listRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const send = async (text: string, base: Message[] = messages) => {
    const content = text.trim();
    if (!content || loading) return;
    const history: Message[] = [...base, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    stickToBottom.current = true;

    // No-op once the chat was cleared mid-answer, so a late chunk or "Stopped." can't land in the new chat.
    const update = (fn: (last: Message) => Message) =>
      setMessages((prev) => (prev.length === 0 ? prev : [...prev.slice(0, -1), fn(prev[prev.length - 1])]));
    const fail = (msg: string) => update((last) => ({ ...last, content: msg, error: true }));

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.filter((m) => !m.error).map(({ role, content }) => ({ role, content })) }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        fail((await res.text().catch(() => "")) || "The assistant couldn't answer just now.");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        update((last) => ({ ...last, content: last.content + chunk }));
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        update((last) => ({ ...last, content: last.content || "Stopped." }));
      } else {
        fail("Couldn't reach the assistant. Check your connection.");
      }
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  // Resend the last question after a failed answer.
  const retry = () => {
    const lastUser = messages.findLastIndex((m) => m.role === "user");
    if (lastUser >= 0) send(messages[lastUser].content, messages.slice(0, lastUser));
  };

  // Start over: stop any answer in progress and return to the starter questions.
  const newChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    // Show the welcome screen from the top; the next question turns auto-follow back on.
    stickToBottom.current = false;
    listRef.current?.scrollTo({ top: 0 });
    inputRef.current?.focus();
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          // Full-screen chat.
          <motion.div
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent
            className="fixed inset-0 z-60 flex bg-ink"
            role="dialog"
            aria-modal="true"
            aria-label="Portfolio assistant"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute left-1/2 top-[-20%] h-[70vh] w-[90vw] max-w-5xl -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(240,178,82,0.16),transparent)] blur-2xl" />
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] bg-size-[22px_22px] mask-[radial-gradient(60%_55%_at_50%_35%,#000,transparent)]" />
            </div>

            <section className="relative flex min-w-0 flex-1 flex-col">
              <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-ink/60 px-4 py-3 backdrop-blur-md sm:px-8">
                <div className="flex min-w-0 items-center gap-3">
                  <BotMascot size={40} talking={loading} />
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold text-white">{profile.firstName}&apos;s assistant</p>
                    <p className="flex items-center gap-1.5 text-xs text-white/50">
                      <span className={`h-1.5 w-1.5 rounded-full ${loading ? "animate-pulse bg-gold" : "bg-emerald-400"}`} />
                      {loading ? "Writing an answer" : "Online, answers from his portfolio"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-full border border-white/10 bg-panel/70 p-0.5">
                  <a
                    href={`mailto:${profile.email}`}
                    title="Email"
                    aria-label="Email"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/5 hover:text-gold"
                  >
                    <HiOutlineEnvelope size={19} />
                  </a>
                  <a
                    href={profile.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    title="WhatsApp"
                    aria-label="WhatsApp"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/5 hover:text-gold"
                  >
                    <FaWhatsapp size={18} />
                  </a>
                  <a
                    href={profile.resume}
                    title="Download resume"
                    aria-label="Download resume"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/5 hover:text-gold"
                  >
                    <HiOutlineArrowDownTray size={19} />
                  </a>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close assistant"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-gold/60 hover:text-gold focus-visible:outline-2 focus-visible:outline-gold"
                  >
                    <HiOutlineXMark size={20} />
                  </button>
                </div>
              </header>

              <div ref={listRef} onScroll={onScroll} className="flex-1 overflow-y-auto">
                <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-8" aria-live="polite">
                  {messages.length === 0 ? (
                    <div className="flex min-h-[58dvh] flex-col items-center justify-center text-center">
                      {/* Mascot inside a slowly turning orbit with a soft glow. */}
                      <div className="relative flex h-36 w-36 items-center justify-center">
                        <div aria-hidden className="absolute inset-4 rounded-full bg-gold/15 blur-2xl" />
                        <div aria-hidden className="chat-orbit absolute inset-0 rounded-full border border-dashed border-gold/30">
                          <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_10px_rgba(245,190,98,0.9)]" />
                        </div>
                        <div aria-hidden className="absolute inset-5 rounded-full border border-white/10" />
                        <BotMascot size={80} wave sparkle />
                      </div>
                      <h3 className="mt-6 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Hi, I&apos;m {profile.firstName}&apos;s assistant
                      </h3>
                      <p className="mt-3 max-w-[46ch] text-white/60">
                        Ask anything about his projects, skills, experience, or how to hire him. Pick a question to start.
                      </p>
                      <div className="mt-5 flex flex-wrap justify-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-white/80">
                          <HiOutlineBriefcase size={13} className="text-gold" />
                          {currentJob.role.replace(/ \(.*\)/, "")} at {currentJob.company}
                        </span>
                        {facts.map((f) => (
                          <span key={f.label} className="rounded-full border border-white/10 bg-panel/70 px-3 py-1 text-xs text-white/60">
                            <span className="font-semibold text-gold">{f.value}</span> {f.label}
                          </span>
                        ))}
                      </div>
                      <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                        {questions.map(({ q, hint, Icon }, i) => (
                          <motion.button
                            key={q}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            onClick={() => send(q)}
                            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-panel/80 p-3 pr-4 text-left backdrop-blur transition hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_12px_30px_-12px_rgba(240,178,82,0.35)] focus-visible:outline-2 focus-visible:outline-gold"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold transition group-hover:bg-gold group-hover:text-on-gold">
                              <Icon size={19} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium leading-snug text-white/90">{q}</span>
                              <span className="mt-0.5 block text-xs text-white/45">{hint}</span>
                            </span>
                            <HiOutlineArrowUpRight size={15} className="shrink-0 text-white/25 transition group-hover:text-gold" />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((m, i) => {
                        const streaming = loading && i === messages.length - 1;
                        const cards = m.role === "assistant" && !streaming && !m.error ? mentionedProjects(m.content) : [];
                        return m.role === "user" ? (
                          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                            <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-gold px-4 py-2.5 text-[0.95rem] text-on-gold">
                              {m.content}
                            </p>
                          </motion.div>
                        ) : (
                          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                            <span className="mt-0.5 shrink-0">
                              <BotMascot size={30} talking={streaming} />
                            </span>
                            <div className="min-w-0 flex-1">
                              {m.content ? (
                                <p
                                  className={`whitespace-pre-wrap text-[0.95rem] leading-relaxed ${m.error ? "text-red-300" : "text-white/85"}`}
                                >
                                  {m.content}
                                </p>
                              ) : (
                                <span className="flex h-6 items-center gap-1" aria-label="Writing an answer">
                                  {[0, 1, 2].map((d) => (
                                    <span
                                      key={d}
                                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold"
                                      style={{ animationDelay: `${d * 0.15}s` }}
                                    />
                                  ))}
                                </span>
                              )}
                              {m.error && (
                                <button
                                  onClick={retry}
                                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:underline"
                                >
                                  <HiOutlineArrowPath size={15} /> Try again
                                </button>
                              )}
                              {cards.length > 0 && (
                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                  {cards.map((p) => (
                                    <ProjectCard key={p.title} project={p} />
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}

                    </div>
                  )}
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="px-4 pb-4 pt-2 sm:px-8"
              >
                <div className="mx-auto w-full max-w-2xl">
                  {/* Sits right above the input, where eyes already are, once there is a conversation to clear. */}
                  <AnimatePresence>
                    {messages.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="mb-3 flex justify-center"
                      >
                        <button
                          type="button"
                          onClick={newChat}
                          className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-medium text-gold shadow-[0_6px_20px_-10px_rgba(240,178,82,0.6)] transition hover:-translate-y-0.5 hover:bg-gold hover:text-on-gold focus-visible:outline-2 focus-visible:outline-gold"
                        >
                          <HiOutlinePencilSquare size={16} />
                          New chat
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-panel p-1.5 pl-5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)] transition focus-within:border-gold/60 focus-within:shadow-[0_0_0_4px_rgba(240,178,82,0.12),0_10px_40px_-15px_rgba(240,178,82,0.35)]">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      maxLength={600}
                      placeholder={`Ask about ${profile.firstName}'s work`}
                      aria-label="Your question"
                      className="min-w-0 flex-1 bg-transparent py-2 text-[0.95rem] text-white placeholder:text-white/40 focus:outline-none"
                    />
                    {loading ? (
                      <button
                        type="button"
                        onClick={() => abortRef.current?.abort()}
                        aria-label="Stop answering"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-gold/60 hover:text-gold"
                      >
                        <HiStop size={16} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!input.trim()}
                        aria-label="Send"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#fbd384] to-[#f0b252] text-on-gold shadow-[0_6px_18px_-6px_rgba(240,178,82,0.7)] transition hover:scale-105 disabled:bg-none disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none disabled:hover:scale-100"
                      >
                        <HiOutlinePaperAirplane size={17} />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-center text-[0.7rem] text-white/35">
                    AI answers can be wrong. For anything important, email {profile.email}.
                  </p>
                </div>
              </form>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {greet && !open && (
          // A cartoon girl jumps up beside the launcher and points at it, with a speech bubble over her head.
          <motion.div
            initial={{ opacity: 0, y: 120 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 120 }}
            transition={{ type: "spring", stiffness: 180, damping: 15 }}
            className="fixed bottom-1 right-[4.6rem] z-50 w-24 sm:right-[5.1rem] sm:w-32"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              // Not .panel: that class sets position: relative, which would pull the bubble into the girl's narrow box.
              // On phones the bubble shifts right to the screen gutter and caps its width so it never runs off-screen.
              className="absolute bottom-full right-[-3.6rem] mb-1 w-[min(14rem,calc(100vw-2rem))] origin-bottom-right rounded-2xl border border-white/10 bg-panel px-3.5 py-2.5 text-[0.8rem] leading-snug text-white/85 shadow-xl shadow-black/40 sm:right-2 sm:w-56 sm:px-4 sm:py-3 sm:text-sm"
            >
              <button
                onClick={() => setGreet(false)}
                aria-label="Dismiss"
                className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-panel text-white/60 hover:text-gold"
              >
                <HiOutlineXMark size={11} />
              </button>
              <button onClick={() => setOpen(true)} className="text-left">
                Hi there! 👋 Got questions about {profile.firstName}? Ask his AI assistant right here!
              </button>
              {/* bubble tail */}
              <span
                aria-hidden
                className="absolute -bottom-1.5 right-[6.4rem] h-3 w-3 rotate-45 border-b border-r border-white/10 bg-panel sm:right-12"
              />
            </motion.div>
            <button onClick={() => setOpen(true)} aria-label="Open AI assistant" className="block w-full">
              <GirlGuide className="h-auto w-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pops in with a spin once the preloader is done, then floats. */}
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 14, delay: 3.2 }}
        className="fixed bottom-4 right-3 z-50 sm:right-4"
      >
        <motion.button
          onClick={() => {
            setOpen((o) => !o);
            setGreet(false);
          }}
          animate={open ? { y: 0 } : { y: [0, -6, 0] }}
          transition={open ? { duration: 0.2 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.1, rotate: [0, -10, 10, -6, 0], transition: { duration: 0.5 } }}
          whileTap={{ scale: 0.88 }}
          aria-label={open ? "Close assistant" : "Open AI assistant"}
          aria-expanded={open}
          className="relative flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-panel shadow-lg shadow-gold/25"
        >
          {!open && <span aria-hidden className="absolute inset-0 animate-ping rounded-full border border-gold/40 [animation-duration:2.5s]" />}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "bot"}
              initial={{ scale: 0.4, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.4, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex"
            >
              {open ? <HiOutlineXMark size={22} className="text-gold" /> : <BotMascot size={48} wave={greet} sparkle />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </>
  );
}

/* Compact project card shown under an answer that mentions the project. */
function ProjectCard({ project }: { project: Project }) {
  const body = (
    <>
      <Image src={project.image} alt="" width={96} height={72} className="h-14 w-18 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{project.title}</p>
        <p className="mt-0.5 truncate text-xs text-white/50">{project.tags.join(", ")}</p>
        {project.link && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-gold">
            {project.link.label} <HiOutlineArrowUpRight size={12} />
          </p>
        )}
      </div>
    </>
  );
  const cls = "flex items-center gap-3 rounded-xl border border-white/10 bg-panel p-2 pr-3 transition";
  return project.link ? (
    <a href={project.link.href} target="_blank" rel="noreferrer" className={`${cls} hover:border-gold/50`}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}
