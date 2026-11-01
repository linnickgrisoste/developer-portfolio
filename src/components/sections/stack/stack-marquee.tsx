import { stack } from "@/content/stack";
import { Marquee } from "./marquee";

const tools = stack.flatMap((group) => group.items.map((item) => item.name));

export function StackMarquee() {
  return <Marquee tools={tools} />;
}
