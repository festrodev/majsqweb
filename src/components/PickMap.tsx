"use client";

import { useEffect, useRef } from "react";
// maplibre-gl v6 ships named exports only — there is no default.
import { Map as MapLibreMap, Marker, Popup, LngLatBounds } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type MapPick = {
  short_id: string;
  title: string;
  venue_name: string | null;
  latitude: number | null;
  longitude: number | null;
  url: string;
};

/**
 * The three picks on a map.
 *
 * OpenStreetMap raster tiles, no API key — a fork has to be able to run this,
 * and a key that only Festro holds would make the repo undemonstrable to
 * anyone else.
 *
 * Picks without coordinates are NOT dropped: the catalog has real events whose
 * venue is still to be confirmed, and silently losing one from a set of three
 * would make the map disagree with the list underneath it. They simply get no
 * marker, and the list below the map is what carries them.
 */
export default function PickMap({ picks }: { picks: MapPick[] }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!container.current || map.current) return;

    const located = picks.filter(
      (p) => typeof p.latitude === "number" && typeof p.longitude === "number",
    );

    const instance = new MapLibreMap({
      container: container.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      // Montréal, used when nothing in the set has coordinates.
      center: [-73.5674, 45.5019],
      zoom: 12,
      attributionControl: { compact: true },
    });
    map.current = instance;

    instance.on("load", () => {
      picks.forEach((pick, index) => {
        if (typeof pick.latitude !== "number" || typeof pick.longitude !== "number") {
          return;
        }
        const el = document.createElement("a");
        el.href = pick.url;
        el.target = "_blank";
        el.rel = "noopener noreferrer";
        el.textContent = String(index + 1);
        el.setAttribute("aria-label", `${index + 1}. ${pick.title}`);
        el.style.cssText = [
          "display:grid",
          "place-items:center",
          "width:30px",
          "height:30px",
          "border-radius:999px",
          "background:var(--majsq-lamp)",
          "color:var(--majsq-lamp-ink)",
          "font-weight:700",
          "font-size:15px",
          "text-decoration:none",
          "box-shadow:0 2px 6px rgba(0,0,0,.35)",
          "cursor:pointer",
        ].join(";");

        new Marker({ element: el })
          .setLngLat([pick.longitude, pick.latitude])
          .setPopup(
            new Popup({ offset: 18, closeButton: false }).setHTML(
              `<strong>${escapeHtml(pick.title)}</strong><br/>${escapeHtml(
                pick.venue_name ?? "",
              )}`,
            ),
          )
          .addTo(instance);
      });

      // The container is sized by CSS that may not have settled when `load`
      // fires, so MapLibre can compute bounds against a stale viewport and
      // park a marker outside the frame. Resize first, then fit.
      instance.resize();

      if (located.length === 1) {
        instance.setCenter([located[0].longitude!, located[0].latitude!]);
        instance.setZoom(15);
      } else if (located.length > 1) {
        const bounds = new LngLatBounds();
        located.forEach((p) => bounds.extend([p.longitude!, p.latitude!]));
        instance.fitBounds(bounds, { padding: 64, maxZoom: 14, duration: 0 });
      }
    });

    return () => {
      instance.remove();
      map.current = null;
    };
  }, [picks]);

  return (
    <div
      ref={container}
      className="h-[320px] w-full overflow-hidden rounded-[var(--radius-card)] border border-line sm:h-[420px]"
    />
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
