import type { Skin } from "@/lib/skins";

/** Dibujo de frente del personaje del Mundo con una skin (sin 3D, para la Tienda). */
export default function SkinPreview({ skin, className }: { skin: Skin; className?: string }) {
  const a = skin.accessory;
  return (
    <svg viewBox="0 0 120 160" className={className} aria-hidden="true">
      <ellipse cx="60" cy="148" rx="30" ry="6" fill="#000" opacity="0.2" />
      {a === "capa" && <path d="M42 78 L78 78 L92 142 L28 142 Z" fill={skin.accent} />}
      {skin.pack && <rect x="33" y="82" width="54" height="36" rx="8" fill={skin.pack} />}
      <rect x="38" y="72" width="44" height="68" rx="22" fill={skin.body} />
      {a === "astronauta" && <rect x="40" y="72" width="40" height="7" rx="3.5" fill="#cbd5e1" />}
      {a === "capa" && <circle cx="60" cy="77" r="3.5" fill="#facc15" />}
      {a === "orejas" && (
        <g>
          <polygon points="39,40 45,14 58,32" fill={skin.accent} />
          <polygon points="81,40 75,14 62,32" fill={skin.accent} />
        </g>
      )}
      <circle cx="60" cy="50" r="22" fill={skin.head} />
      <rect x="43" y="44" width="34" height="11" rx="4" fill="#0f172a" />
      <rect x="45.5" y="46.5" width="29" height="6" rx="3" fill={skin.visor} opacity="0.95" />
      {a === "sombrero" && (
        <g>
          <ellipse cx="60" cy="32" rx="35" ry="5.5" fill={skin.accent} />
          <rect x="45" y="13" width="30" height="20" rx="5" fill={skin.accent} />
          <rect x="45" y="26" width="30" height="4" fill="#000" opacity="0.25" />
        </g>
      )}
      {a === "antena" && (
        <g>
          <line x1="60" y1="29" x2="60" y2="11" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="60" cy="9" r="10" fill={skin.accent} opacity="0.3" />
          <circle cx="60" cy="9" r="5" fill={skin.accent} />
        </g>
      )}
      {a === "vincha" && (
        <g>
          <rect x="37.5" y="34" width="45" height="7" rx="3" fill={skin.accent} />
          <path d="M82 37 L98 44 M82 39 L95 54" stroke={skin.accent} strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
      {a === "astronauta" && (
        <g>
          <circle cx="60" cy="50" r="29" fill={skin.accent} opacity="0.3" stroke="#e2e8f0" strokeWidth="2" />
          <ellipse cx="49" cy="36" rx="7" ry="3.5" fill="#fff" opacity="0.6" transform="rotate(-25 49 36)" />
        </g>
      )}
      {a === "mago" && (
        <g>
          <polygon points="42,32 78,32 68,2" fill={skin.accent} />
          <ellipse cx="60" cy="32" rx="32" ry="5" fill={skin.accent} />
          <polygon
            points="68,0 70,5 75,5 71,8 72.5,13 68,10 63.5,13 65,8 61,5 66,5"
            fill="#facc15"
          />
        </g>
      )}
      {a === "corona" && (
        <polygon
          points="42,33 42,17 50,26 55,12 60,23 65,12 70,26 78,17 78,33"
          fill={skin.accent}
          stroke="#a16207"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
