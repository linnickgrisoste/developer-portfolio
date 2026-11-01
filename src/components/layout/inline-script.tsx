"use client";

import { useLayoutEffect } from "react";

// Trocar de idioma remonta o root layout, e o React apaga do <html> os data-* que o script pôs: guarda e devolve.
let saved: [string, string][] = [];

export function InlineScript({ code }: { code: string }) {
  useLayoutEffect(() => {
    const html = document.documentElement;
    for (const [name, value] of saved) if (!html.hasAttribute(name)) html.setAttribute(name, value);
    saved = [];
    return () => {
      saved = Array.from(html.attributes)
        .filter((attribute) => attribute.name.startsWith("data-"))
        .map((attribute) => [attribute.name, attribute.value]);
    };
  }, []);

  return (
    <script
      // Já rodou vindo do servidor; como dado, o React não avisa "Encountered a script tag" ao remontar.
      type={typeof window === "undefined" ? undefined : "application/json"}
      dangerouslySetInnerHTML={{ __html: code }}
      suppressHydrationWarning
    />
  );
}
