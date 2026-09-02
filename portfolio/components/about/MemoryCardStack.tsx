"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { MemoryCard } from "@/data/hobbies";

interface CardRotateProps {
  children: React.ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
  disableDrag?: boolean;
}

function CardRotate({
  children,
  onSendToBack,
  sensitivity,
  disableDrag = false,
}: CardRotateProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  function handleDragEnd(
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) {
    if (
      Math.abs(info.offset.x) > sensitivity ||
      Math.abs(info.offset.y) > sensitivity
    ) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  if (disableDrag) {
    return (
      <div className="absolute inset-0" style={{ x: 0, y: 0 }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

interface MemoryCardStackProps {
  cards: MemoryCard[];
  sensitivity?: number;
  sendToBackOnClick?: boolean;
  animationConfig?: { stiffness: number; damping: number };
}

export default function MemoryCardStack({
  cards = [],
  sensitivity = 100,
  sendToBackOnClick = true,
  animationConfig = { stiffness: 260, damping: 20 },
}: MemoryCardStackProps) {
  // Stack where the LAST element is the top card (rendered last in DOM order)
  const [stackCards, setStackCards] = useState<MemoryCard[]>(() => [...cards]);

  useEffect(() => {
    if (cards.length) {
      setStackCards([...cards]);
    }
  }, [cards]);

  const sendToBack = (id: string) => {
    setStackCards((prev) => {
      const next = [...prev];
      const index = next.findIndex((c) => c.id === id);
      if (index === -1) return prev;
      const [card] = next.splice(index, 1);
      next.unshift(card); // moves to index 0 (bottom of the visual DOM stack)
      return next;
    });
  };

  const total = stackCards.length;

  return (
    <div
      className="relative w-full h-full select-none"
      style={{ perspective: 600 }}
    >
      {stackCards.map((card, i) => {
        // depth from top card: 0 is top (last in array), 1 is underneath, etc.
        const depth = total - 1 - i;
        const isTop = depth === 0;

        // Fanned stack rotation and scale matching ReactBits & renlenon.vercel.app
        const rotZ = Math.min(26, depth * 4.2);
        const scaleVal = Math.max(0.78, 1 - depth * 0.04);
        const opacityVal = depth > 5 ? 0 : 1 - depth * 0.04;

        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={sensitivity}
            disableDrag={false}
          >
            <motion.div
              className="relative w-full h-full rounded-2xl sm:rounded-[22px] overflow-hidden shadow-2xl border-2 border-black/15 dark:border-white/20 bg-surface-card dark:bg-[#121214] will-change-transform"
              onClick={() => {
                if (sendToBackOnClick && isTop) {
                  sendToBack(card.id);
                }
              }}
              animate={{
                rotateZ: rotZ,
                scale: scaleVal,
                opacity: opacityVal,
                transformOrigin: "90% 90%",
              }}
              initial={false}
              transition={{
                type: "spring",
                stiffness: animationConfig.stiffness,
                damping: animationConfig.damping,
              }}
            >
              <Image
                src={card.image}
                alt={card.title}
                fill
                sizes="(max-width: 640px) 280px, 340px"
                className="object-cover pointer-events-none select-none"
                priority={depth <= 2}
              />
            </motion.div>
          </CardRotate>
        );
      })}
    </div>
  );
}
