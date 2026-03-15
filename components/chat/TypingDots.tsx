export function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1.5" aria-label="Assistant is typing">
      <span className="typing-dot h-2 w-2 rounded-full bg-slate-300" />
      <span className="typing-dot h-2 w-2 rounded-full bg-slate-300" />
      <span className="typing-dot h-2 w-2 rounded-full bg-slate-300" />
    </div>
  );
}
