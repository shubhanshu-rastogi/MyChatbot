type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description
}: SectionHeadingProps) {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-accent-300">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold text-white md:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-relaxed text-slate-300 md:text-lg">{description}</p>
    </div>
  );
}
