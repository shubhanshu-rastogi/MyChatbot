export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-2 px-6 py-8 text-sm text-slate-400 md:flex-row md:items-center lg:px-8">
        <p>© {new Date().getFullYear()} Shubhanshu Rastogi</p>
        <p>Premium Personal AI Profile | shubhanshurastogi.it.com</p>
      </div>
    </footer>
  );
}
