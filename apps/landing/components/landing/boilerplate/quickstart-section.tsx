"use client";

import { CheckCircle2, Copy, Check } from "lucide-react";
import { useState } from "react";

const commands = [
  {
    label: "Clone the repository",
    code: "git clone https://github.com/yourusername/yourrepo.git",
  },
  {
    label: "Install dependencies",
    code: "pnpm install",
  },
  {
    label: "Start development server",
    code: "pnpm dev",
  },
];

export function QuickstartSection() {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <span className="bg-primary-light text-primary mb-4 inline-block rounded-full px-4 py-2 text-sm font-semibold">
            Quick Start
          </span>
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Get Running in Minutes
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg">
            Three commands to a fully functional development environment.
          </p>
        </div>

        {/* Commands */}
        <div className="space-y-6">
          {commands.map((cmd, index) => (
            <CommandBlock key={index} label={cmd.label} code={cmd.code} />
          ))}
        </div>

        {/* Prerequisites */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-6">
          <h3 className="text-foreground mb-4 text-xl font-bold">
            Prerequisites
          </h3>
          <ul className="space-y-2">
            {[
              "Node.js 18+ and pnpm",
              "PostgreSQL database (or use Docker)",
              "AWS S3 bucket or compatible storage (for file uploads)",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 className="text-primary" size={20} />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

interface CommandBlockProps {
  label: string;
  code: string;
}

function CommandBlock({ label, code }: CommandBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <p className="text-muted-foreground mb-2 text-sm font-medium">{label}</p>
      <div className="group relative">
        <pre className="bg-slate-900 text-slate-100 overflow-x-auto rounded-lg px-4 py-3 text-sm font-mono">
          <code>{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="bg-card hover:bg-muted absolute top-2 right-2 rounded-md p-2 opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Copy command"
        >
          {copied ? (
            <Check className="text-primary" size={16} />
          ) : (
            <Copy size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
