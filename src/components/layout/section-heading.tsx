import { KineticText } from "@/components/motion/kinetic-text";
import { cn } from "@/lib/utils";

// Título de seção: nível "título" do texto cinético. As letras assentam como tipos ao aparecer,
// e, engajado, ganham peso perto do cursor e a lateral cobalto.
export function SectionHeading({ text, className }: { text: string; className?: string }) {
  return (
    <KineticText
      as="h2"
      level="title"
      text={text}
      width={112}
      extrude
      className={cn("text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] tracking-[-0.02em]", className)}
    />
  );
}
