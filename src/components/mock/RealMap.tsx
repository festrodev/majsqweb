"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { picks, type Locale } from "./data";

export default function RealMap({ selected, onSelect, locale }: { selected: string; onSelect: (id: string) => void; locale: Locale }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!container.current) return;
    let instance: maplibregl.Map;
    try {
      instance = new maplibregl.Map({
        container: container.current,
        center: [-73.574, 45.525], zoom: 13, maxZoom: 19, attributionControl: false,
        style: { version: 8, sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, maxzoom: 19 } }, layers: [{ id: "osm", type: "raster", source: "osm" }] },
      });
    } catch {
      // Report a synchronous WebGL initialization failure to the user.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(true); setLoading(false); return;
    }
    map.current = instance;
    instance.on("load", () => setLoading(false));
    instance.on("error", () => { setError(true); setLoading(false); });
    instance.on("idle", () => { if (instance.areTilesLoaded()) setError(false); });
    instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-left");
    markers.current = picks.map((pick, index) => {
      const button = document.createElement("button");
      button.className = "real-marker";
      button.textContent = String(index + 1);
      button.setAttribute("aria-label", `${pick.name} · ${pick.venue}`);
      button.addEventListener("click", () => onSelect(pick.id));
      return new maplibregl.Marker({ element: button }).setLngLat([pick.longitude, pick.latitude]).addTo(instance);
    });
    const fit = () => {
      instance.resize();
      const width = container.current?.clientWidth ?? 0;
      const desktop = width > 1150;
      instance.fitBounds([[-73.59, 45.514], [-73.565, 45.53]], { padding: { left: desktop ? 330 : 45, right: desktop ? 590 : 45, top: 160, bottom: 220 }, maxZoom: 14, duration: 0 });
    };
    const observer = new ResizeObserver(fit);
    observer.observe(container.current);
    fit();
    return () => { observer.disconnect(); markers.current.forEach(marker => marker.remove()); markers.current = []; instance.remove(); map.current = null; };
  }, [onSelect]);
  useEffect(() => {
    markers.current.forEach((marker, index) => {
      const active = picks[index].id === selected;
      marker.getElement().classList.toggle("active", active);
      marker.getElement().setAttribute("aria-pressed", String(active));
    });
    const pick = picks.find(p => p.id === selected);
    if (pick && map.current) map.current.easeTo({ center: [pick.longitude, pick.latitude], duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 600 });
  }, [selected]);
  return <div className="real-map-layer"><div className="real-map" ref={container} aria-label={locale === "fr" ? "Carte interactive de Montréal" : "Interactive map of Montréal"}/><div className="map-attribution">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a></div>{(loading || error) && <div className="map-network-status" role="status">{error ? (locale === "fr" ? "Carte indisponible. Vérifie ta connexion Internet." : "Map unavailable. Check your internet connection.") : (locale === "fr" ? "Chargement de la carte…" : "Loading map…")}</div>}</div>;
}
