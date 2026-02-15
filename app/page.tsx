import { CreatePollForm } from "@/components/CreatePollForm";

export default function HomePage() {
  return (
    <div className="space-y-[clamp(2rem,5vw,3.5rem)]">
      {/* Hero heading — font-light / extrabold contrast */}
      <div className="space-y-4">
        <span className="text-muted-foreground font-medium text-sm tracking-[0.3em] uppercase block">
          Real-time polling
        </span>
        <h1
          className="font-extrabold leading-[0.95] tracking-tight text-foreground"
          style={{ fontSize: "clamp(2rem, 8vw, 3.125rem)" }}
        >
          Create a{" "}
          <span className="underline decoration-primary/30 underline-offset-4">
            poll
          </span>
          ,<br />
          share the link.
        </h1>
        <p
          className="text-muted-foreground font-light leading-relaxed max-w-md"
          style={{ fontSize: "clamp(0.875rem, 2vw, 1.125rem)" }}
        >
          Watch votes roll in live. No sign-up required.
        </p>
        <div className="h-px w-16 bg-primary/30" />
      </div>

      <CreatePollForm />
    </div>
  );
}
