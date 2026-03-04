import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function Banner() {
  return (
    <div className="bg-primary relative isolate flex items-center gap-x-6 overflow-hidden px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      <div
        className="absolute top-1/2 left-[max(-7rem,calc(50%-52rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
        aria-hidden="true"
      >
        <div
          className="from-primary to-accent aspect-[577/310] w-[36.0625rem] bg-gradient-to-r opacity-30"
          style={{
            clipPath:
              "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
          }}
        />
      </div>
      <div
        className="absolute top-1/2 left-[max(45rem,calc(50%+8rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
        aria-hidden="true"
      >
        <div
          className="from-accent to-primary aspect-[577/310] w-[36.0625rem] bg-gradient-to-r opacity-30"
          style={{
            clipPath:
              "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
          }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-primary-foreground text-sm/6">
          <strong className="inline-flex items-center gap-1.5 font-semibold">
            <Sparkles className="h-4 w-4" />
            New version released
          </strong>
          <svg
            viewBox="0 0 2 2"
            className="mx-2 inline h-0.5 w-0.5 fill-current"
            aria-hidden="true"
          >
            <circle cx={1} cy={1} r={1} />
          </svg>
          v0.2.0 with Storybook integration is now available
        </p>
        <Link
          href="/docs/changelog"
          className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 focus-visible:outline-primary-foreground flex-none rounded-full px-3.5 py-1 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Read more <ArrowRight className="ml-1 inline h-3 w-3" />
        </Link>
      </div>
      <div className="flex flex-1 justify-end">
        {/* You can add a close button here if needed */}
      </div>
    </div>
  );
}
