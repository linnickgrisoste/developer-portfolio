import { stack } from "@/content/stack";
import { Marquee } from "./marquee";

const tools = stack.flatMap((group) => group.items.map((item) => item.name));

// Só os nomes vão para o cliente; a ficha completa (níveis e classes) fica no servidor.
export function StackMarquee() {
  return <Marquee tools={tools} />;
}
