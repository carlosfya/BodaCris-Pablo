import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/timeline.css";
import { TimelineWedding } from "@/components/timeline-wedding";

const el = document.getElementById("timeline-root");
if (el) {
  createRoot(el).render(
    <React.StrictMode>
      <TimelineWedding />
    </React.StrictMode>
  );
}
