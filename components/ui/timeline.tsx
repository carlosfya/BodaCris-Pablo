"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

export interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export function Timeline({
  data,
  heading = "Ruta del día",
  subheading = "Una guía sencilla para llegar, sin perderse.",
}: {
  data: TimelineEntry[];
  heading?: string;
  subheading?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setHeight(rect.height);
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <section
      className="w-full bg-transparent font-body md:px-10"
      ref={containerRef}
      aria-label={heading}
    >
      <div className="max-w-5xl mx-auto pt-10 pb-8 px-4 md:px-8">
        <h2 className="font-title text-wedding-green text-3xl md:text-5xl font-normal italic tracking-wide">
          {heading}
        </h2>
        <p className="mt-3 text-wedding-muted text-sm md:text-base max-w-md">
          {subheading}
        </p>
      </div>

      <div ref={ref} className="relative max-w-5xl mx-auto pb-14">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start pt-10 md:pt-28 md:gap-10">
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-32 self-start max-w-xs md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-wedding-bg flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-white border border-wedding-sand/40" />
              </div>
              <h3 className="hidden md:block font-title md:pl-20 text-4xl lg:text-5xl font-normal italic text-wedding-rose tracking-wide">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block font-title text-3xl mb-4 text-left font-normal italic text-wedding-rose tracking-wide">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}

        <div
          style={{ height: height + "px" }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-gradient-to-b from-transparent via-wedding-sand/35 to-transparent [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
          aria-hidden="true"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-wedding-gold via-wedding-rose to-transparent rounded-full"
          />
        </div>
      </div>
    </section>
  );
}
