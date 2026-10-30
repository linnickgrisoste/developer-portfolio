import type { Ref } from "react";
import { cn } from "@/lib/utils";
import type { SectionId } from "@/lib/sections";

/** Largura máxima e respiro lateral da página. Para elementos que não podem ser um `<Container>`. */
export const containerClass = "mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn(containerClass, className)}>{children}</div>;
}

type SectionProps = {
  id: SectionId;
  ref?: Ref<HTMLElement>;
  /** Vai para o contêiner interno, onde fica o grid da seção. */
  className?: string;
  children: React.ReactNode;
};

// Seção de conteúdo: fio no topo, respiro vertical e o deslocamento que compensa o cabeçalho fixo nas âncoras.
export function Section({ id, ref, className, children }: SectionProps) {
  return (
    <section id={id} ref={ref} className="relative scroll-mt-16 border-t border-rule">
      <Container className={cn("py-24 md:py-32", className)}>{children}</Container>
    </section>
  );
}
