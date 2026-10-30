import { stack } from "@/content/stack";
import { Marquee } from "./marquee";

const tools = stack.flatMap((group) => group.items.map((item) => item.name));

// A faixa só precisa dos nomes; a ficha completa (níveis e classes) fica no servidor.
export function StackMarquee() {
  return <Marquee tools={tools} />;
}
