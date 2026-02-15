import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 space-y-6">
      <div className="space-y-4">
        <span className="text-muted-foreground font-light text-sm tracking-[0.3em] uppercase block">
          Page not found
        </span>
        <h1
          className="font-extrabold leading-[0.9] tracking-tight text-foreground"
          style={{ fontSize: "clamp(4rem, 15vw, 8rem)" }}
        >
          404.
        </h1>
        <p
          className="text-muted-foreground font-light leading-relaxed max-w-md"
          style={{ fontSize: "clamp(0.875rem, 2vw, 1.125rem)" }}
        >
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="h-px w-16 bg-primary/30" />
      </div>

      <Link
        href="/"
        className="group inline-flex items-center gap-3 font-light text-foreground hover:gap-5 transition-all duration-300"
        style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
      >
        <svg
          className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span className="border-b border-foreground/30 pb-0.5">Create a Poll</span>
      </Link>
    </div>
  );
}
