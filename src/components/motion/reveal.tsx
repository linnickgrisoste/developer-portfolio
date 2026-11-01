"use client";

import { motion } from "motion/react";
import { reveal } from "@/lib/motion";
import { useRevealGroup } from "./entrance";

type GroupTag = "div" | "ol" | "ul";
type ItemTag = "div" | "p" | "dl" | "li" | "h2";

export function RevealGroup({
  as = "div",
  className,
  children,
}: {
  as?: GroupTag;
  className?: string;
  children: React.ReactNode;
}) {
  const group = useRevealGroup();
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag {...group} className={className}>
      {children}
    </Tag>
  );
}

export function RevealItem({
  as = "div",
  className,
  children,
}: {
  as?: ItemTag;
  className?: string;
  children: React.ReactNode;
}) {
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag variants={reveal.item} className={className}>
      {children}
    </Tag>
  );
}
