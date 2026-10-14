/* Full-body cartoon guy (short dark hair, light beard, beige kurta) who stands beside the chat launcher and
   points down-right at it. Pure SVG; idle bounce, blinking, glancing, pointing jab and foot tap are CSS
   animations in globals.css (.guide-*). */
const skin = "#ebbd92";
const skinShade = "#d9a376";
const hair = "#221813";
const line = "#2a1c14";
const pants = "#2e3446";

export default function GuideCharacter({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 220" aria-hidden className={`guide overflow-visible ${className}`}>
      <defs>
        <linearGradient id="guide-kurta" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0d9ae" />
          <stop offset="1" stopColor="#d2b07a" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="68" cy="212" rx="34" ry="5" fill="#000" opacity="0.25" className="guide-shadow" />

      <g className="guide-body" stroke={line} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
        {/* legs (trousers) */}
        <path d="M58 150 L56 196" fill="none" strokeWidth="15.4" />
        <path d="M58 150 L56 196" fill="none" stroke={pants} strokeWidth="11" />
        <g className="guide-foot">
          <path d="M77 150 L80 196" fill="none" strokeWidth="15.4" />
          <path d="M77 150 L80 196" fill="none" stroke={pants} strokeWidth="11" />
        </g>

        {/* sneakers */}
        <path d="M43 205 Q43 195 55 195 Q63 195 64 205 Z" fill="#f4f1ea" />
        <path d="M43 205 h21" stroke="#c9a873" strokeWidth="2.4" />
        <g className="guide-foot">
          <path d="M72 205 Q73 195 81 195 Q93 195 93 205 Z" fill="#f4f1ea" />
          <path d="M72 205 h21" stroke="#c9a873" strokeWidth="2.4" />
        </g>

        {/* arm on hip (screen left): kurta sleeve, then hand */}
        <path d="M51 100 Q36 112 40 126 Q44 134 50 133" fill="none" strokeWidth="13.4" />
        <path d="M51 100 Q36 112 40 126 Q44 134 50 133" fill="none" stroke="url(#guide-kurta)" strokeWidth="9" />
        <circle cx="53" cy="133" r="5" fill={skin} />

        {/* kurta */}
        <path d="M51 93 Q67 88 83 93 L93 166 Q67 172 41 166 Z" fill="url(#guide-kurta)" />
        <path d="M67 95 L67 128" fill="none" strokeWidth="1.6" />
        <circle cx="67" cy="106" r="1.6" fill={line} stroke="none" />
        <circle cx="67" cy="116" r="1.6" fill={line} stroke="none" />
        <path d="M46 158 Q67 163 88 158" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.4" />
        {/* band collar */}
        <path d="M58 92 Q67 97 76 92 L76 88 Q67 92 58 88 Z" fill="#f6e6c4" />

        {/* pointing arm (screen right): sleeve to wrist, hand, index finger aimed at the launcher */}
        <g className="guide-point">
          <path d="M83 99 Q99 107 110 120" fill="none" strokeWidth="13.4" />
          <path d="M83 99 Q99 107 110 120" fill="none" stroke="url(#guide-kurta)" strokeWidth="9" />
          <path d="M116 128 L129 139" fill="none" strokeWidth="8.9" />
          <path d="M116 128 L129 139" fill="none" stroke={skin} strokeWidth="4.5" />
          <circle cx="114" cy="125" r="6" fill={skin} />
          <path d="M117 129 L119.5 131" stroke={skin} strokeWidth="4.5" />
          <path d="M110 128 Q109 133 113 133" fill="none" strokeWidth="1.6" />
        </g>

        {/* neck */}
        <path d="M62 80 h10 v10 h-10z" fill={skinShade} />

        {/* head */}
        <g className="guide-head">
          {/* ears */}
          <circle cx="41" cy="60" r="4.5" fill={skin} />
          <circle cx="93" cy="60" r="4.5" fill={skin} />
          <circle cx="67" cy="57" r="26" fill={skin} />

          {/* beard along the jaw, with the chin showing through the smile area */}
          <path
            d="M42 58 Q43 84 67 87 Q91 84 92 58 Q89 72 81 76 Q74 72 67 73 Q60 72 53 76 Q45 72 42 58 Z"
            fill={hair}
            opacity="0.92"
          />

          {/* short hair with a small quiff */}
          <path
            d="M40 56 Q37 30 64 28 Q70 22 78 27 Q95 31 94 54 Q90 44 80 41 Q70 46 57 42 Q48 45 44 51 Q41 53 40 56 Z"
            fill={hair}
          />

          {/* eyebrows */}
          <path d="M51 50 Q56 47 61 49" fill="none" strokeWidth="2.6" />
          <path d="M73 49 Q78 47 83 50" fill="none" strokeWidth="2.6" />

          {/* eyes: outer blinks, inner glances toward the button */}
          <g className="guide-eyes" stroke="none">
            <g className="guide-look">
              <ellipse cx="56" cy="59" rx="3.6" ry="4.4" fill={line} />
              <ellipse cx="78" cy="59" rx="3.6" ry="4.4" fill={line} />
              <circle cx="57.3" cy="57.3" r="1.3" fill="#fff" />
              <circle cx="79.3" cy="57.3" r="1.3" fill="#fff" />
            </g>
          </g>

          {/* nose */}
          <path d="M66 62 Q64 67 68 67" fill="none" strokeWidth="1.6" />

          {/* moustache + open smile */}
          <path d="M58 72 Q63 69 67 71 Q71 69 76 72 Q71 73 67 72 Q63 73 58 72 Z" fill={hair} strokeWidth="1.2" />
          <path d="M60 74 Q67 81 74 74 Z" fill="#9b3a3a" strokeWidth="1.6" />
          <path d="M61.5 74.5 h11" stroke="#fff" strokeWidth="1.6" />
        </g>
      </g>
    </svg>
  );
}
