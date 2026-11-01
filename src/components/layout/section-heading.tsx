import { KineticText } from "@/components/motion/kinetic-text";
import { cn } from "@/lib/utils";

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
