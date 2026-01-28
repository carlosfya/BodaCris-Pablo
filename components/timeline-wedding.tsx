import React from "react";
import { Timeline, type TimelineEntry } from "@/components/ui/timeline";

function StopCard({
  title,
  subtitle,
  imageSrc,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  subtitle: string;
  imageSrc: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="w-full max-w-xl">
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm shadow-soft border border-wedding-sand/20 p-5 md:p-7">
        <div className="flex items-center gap-4">
          <div className="shrink-0 h-16 w-16 md:h-20 md:w-20 rounded-full p-[3px] bg-gradient-to-br from-wedding-gold/40 to-wedding-rose/30">
            <div className="h-full w-full rounded-full overflow-hidden border border-white/70">
              <img
                src={imageSrc}
                alt={title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="min-w-0">
            <p className="font-title text-wedding-ink text-xl md:text-2xl tracking-[0.12em] uppercase">
              {title}
            </p>
            <p className="mt-1 text-wedding-muted text-sm md:text-base">
              {subtitle}
            </p>
          </div>
        </div>

        {(primaryHref || secondaryHref) && (
          <div className="mt-4 flex flex-col gap-2">
            {primaryHref && primaryLabel && (
              <a
                className="inline-flex w-fit text-wedding-muted hover:text-wedding-green transition-colors border-b border-wedding-sand/30 hover:border-wedding-green"
                href={primaryHref}
                target={primaryHref.startsWith("http") ? "_blank" : undefined}
                rel={primaryHref.startsWith("http") ? "noopener" : undefined}
              >
                {primaryLabel}
              </a>
            )}
            {secondaryHref && secondaryLabel && (
              <a
                className="inline-flex w-fit text-wedding-muted/80 hover:text-wedding-green transition-colors"
                href={secondaryHref}
                target={secondaryHref.startsWith("http") ? "_blank" : undefined}
                rel={secondaryHref.startsWith("http") ? "noopener" : undefined}
              >
                {secondaryLabel}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function TimelineWedding() {
  const data: TimelineEntry[] = [
    {
      title: "12:20",
      content: (
        <StopCard
          title="Autobuses"
          subtitle="Salida hacia la ceremonia"
          imageSrc="/images/image1.png"
          primaryHref="/confirmar.html"
          primaryLabel="Confirmar aquí si lo necesitas"
          secondaryHref="https://maps.google.com"
          secondaryLabel="Ver punto de recogida"
        />
      ),
    },
    {
      title: "13:00",
      content: (
        <StopCard
          title="Ceremonia"
          subtitle="Iglesia de San Pedro"
          imageSrc="/images/image2.png"
          primaryHref="https://maps.google.com/?q=Iglesia+San+Pedro+Madrid"
          primaryLabel="Abrir en Google Maps"
        />
      ),
    },
    {
      title: "14:15",
      content: (
        <StopCard
          title="Celebración"
          subtitle="Finca El Olivar"
          imageSrc="/images/image3.png"
          primaryHref="https://maps.google.com/?q=Finca+El+Olivar+Pozuelo"
          primaryLabel="Abrir en Google Maps"
        />
      ),
    },
    {
      title: "01:00",
      content: (
        <StopCard
          title="Vuelta"
          subtitle="Regreso en autobús"
          imageSrc="/images/image4.png"
          primaryHref="#"
          primaryLabel="Autobús de regreso a Madrid"
        />
      ),
    },
  ];

  return (
    <div className="min-h-[60vh] w-full bg-gradient-to-b from-wedding-bg via-wedding-bg2 to-wedding-bg">
      <Timeline
        data={data}
        heading="Cómo llegar"
        subheading="Autobuses, ceremonia, celebración… y vuelta. Todo en orden y a tiempo."
      />
    </div>
  );
}
