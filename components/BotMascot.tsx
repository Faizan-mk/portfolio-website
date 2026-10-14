/* Cartoon robot mascot for the chat assistant: gold head, dark visor, blinking eyes that look around, glowing antenna,
   an optional waving hand and sparkles. Pure SVG, animated with CSS in globals.css. */
export default function BotMascot({
  size = 56,
  talking = false,
  wave = false,
  sparkle = false,
}: {
  size?: number;
  talking?: boolean;
  wave?: boolean;
  sparkle?: boolean;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className="bot-mascot overflow-visible">
      <defs>
        <linearGradient id="bot-head" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe6b0" />
          <stop offset="0.55" stopColor="#f5be62" />
          <stop offset="1" stopColor="#d99a3a" />
        </linearGradient>
        <radialGradient id="bot-glow">
          <stop offset="0" stopColor="#fff4d6" />
          <stop offset="1" stopColor="#f5be62" stopOpacity="0" />
        </radialGradient>
      </defs>

      {sparkle && (
        <g fill="#ffe6b0">
          <path className="bot-sparkle" style={{ animationDelay: "0s" }} d="M-2 14 l1.5 -4 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5z" />
          <path className="bot-sparkle" style={{ animationDelay: "0.8s" }} d="M62 8 l1 -3 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1z" />
          <path className="bot-sparkle" style={{ animationDelay: "1.6s" }} d="M58 58 l1 -3 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1z" />
        </g>
      )}

      <g className="bot-head-tilt">
        {/* antenna */}
        <line x1="32" y1="13" x2="32" y2="5" stroke="#d99a3a" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="5" r="7" fill="url(#bot-glow)" className="bot-antenna-glow" />
        <circle cx="32" cy="5" r="3" fill="#fff4d6" />

        {/* ears */}
        <rect x="4" y="27" width="6" height="14" rx="3" fill="#d99a3a" />
        <rect x="54" y="27" width="6" height="14" rx="3" fill="#d99a3a" />

        {/* head */}
        <rect x="8" y="13" width="48" height="42" rx="16" fill="url(#bot-head)" />
        <rect x="8" y="13" width="48" height="42" rx="16" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />

        {/* visor */}
        <rect x="14" y="22" width="36" height="24" rx="11" fill="#141210" />

        {/* eyes: outer group blinks, inner group looks around */}
        <g className="bot-eyes">
          <g className="bot-look">
            <ellipse cx="25" cy="32" rx="4" ry="5" fill="#ffe6b0" />
            <ellipse cx="39" cy="32" rx="4" ry="5" fill="#ffe6b0" />
            <circle cx="26.3" cy="30.2" r="1.3" fill="#fff" />
            <circle cx="40.3" cy="30.2" r="1.3" fill="#fff" />
          </g>
        </g>

        {/* mouth */}
        {talking ? (
          <ellipse cx="32" cy="41" rx="3.5" ry="2" fill="#f5be62" className="bot-mouth-talk" />
        ) : (
          <path d="M27 40 Q32 44 37 40" fill="none" stroke="#f5be62" strokeWidth="2" strokeLinecap="round" />
        )}

        {/* cheeks */}
        <circle cx="17" cy="47" r="2.6" fill="#ff9f7a" opacity="0.55" />
        <circle cx="47" cy="47" r="2.6" fill="#ff9f7a" opacity="0.55" />
      </g>

      {/* waving hand */}
      {wave && (
        <g className="bot-wave">
          <line x1="56" y1="50" x2="64" y2="40" stroke="#d99a3a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="65" cy="38" r="4.5" fill="url(#bot-head)" stroke="#d99a3a" strokeWidth="1" />
        </g>
      )}
    </svg>
  );
}
