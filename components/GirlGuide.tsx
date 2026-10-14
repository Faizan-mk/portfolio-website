/* Full-body cartoon girl who stands beside the chat launcher and points down-right at it.
   Pure SVG; idle bounce, blinking, ponytail sway, pointing jab and foot tap are CSS animations in globals.css. */
const skin = "#f6cfa8";
const skinShade = "#e9b48a";
const hair = "#3b2417";
const line = "#2a1c14";

export default function GirlGuide({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 220" aria-hidden className={`girl-guide overflow-visible ${className}`}>
      <defs>
        <linearGradient id="girl-dress" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbd384" />
          <stop offset="1" stopColor="#e9a23e" />
        </linearGradient>
        <linearGradient id="girl-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a3624" />
          <stop offset="1" stopColor={hair} />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="68" cy="212" rx="34" ry="5" fill="#000" opacity="0.25" className="girl-shadow" />

      <g className="girl-body" stroke={line} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
        {/* legs */}
        <path d="M58 152 L57 196" fill="none" strokeWidth="13.4" />
        <path d="M58 152 L57 196" fill="none" stroke={skin} strokeWidth="9" />
        <g className="girl-foot">
          <path d="M77 152 L79 196" fill="none" strokeWidth="13.4" />
          <path d="M77 152 L79 196" fill="none" stroke={skin} strokeWidth="9" />
        </g>

        {/* socks + shoes */}
        <path d="M52 190 h10 v8 h-10z" fill="#fff" />
        <path d="M45 204 Q45 196 56 196 Q63 196 63 204 Z" fill="#2b2b33" />
        <path d="M45 204 h18" stroke="#fff" strokeWidth="1.6" />
        <g className="girl-foot">
          <path d="M74 190 h10 v8 h-10z" fill="#fff" />
          <path d="M73 204 Q73 196 80 196 Q91 196 91 204 Z" fill="#2b2b33" />
          <path d="M73 204 h18" stroke="#fff" strokeWidth="1.6" />
        </g>

        {/* back hair */}
        <path d="M40 58 Q38 100 50 104 L84 104 Q96 100 94 58 Z" fill="url(#girl-hair)" />

        {/* ponytail */}
        <g className="girl-pony">
          <path d="M90 40 Q118 44 112 82 Q108 98 98 102 Q106 80 92 58 Z" fill="url(#girl-hair)" />
        </g>

        {/* arm on hip (screen left) */}
        <path d="M51 100 Q36 112 40 126 Q44 136 52 134" fill="none" strokeWidth="12.4" />
        <path d="M51 100 Q36 112 40 126 Q44 136 52 134" fill="none" stroke={skin} strokeWidth="8" />
        <circle cx="53" cy="133" r="5" fill={skin} />

        {/* dress */}
        <path d="M52 94 Q67 89 82 94 L96 156 Q67 164 38 156 Z" fill="url(#girl-dress)" />
        <path d="M44 148 Q67 155 90 148" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.6" />
        <path d="M58 92 L67 104 L76 92" fill="#fff" />
        <circle cx="67" cy="115" r="2" fill="#fff" stroke="none" />
        <circle cx="67" cy="125" r="2" fill="#fff" stroke="none" />

        {/* puff sleeves */}
        <ellipse cx="51" cy="99" rx="8" ry="7" fill="url(#girl-dress)" />

        {/* pointing arm (screen right): shoulder -> elbow -> hand, aimed down-right at the launcher */}
        <g className="girl-point">
          <path d="M84 100 Q100 108 112 122" fill="none" strokeWidth="12.4" />
          <path d="M84 100 Q100 108 112 122" fill="none" stroke={skin} strokeWidth="8" />
          {/* index finger */}
          <path d="M116 128 L129 139" fill="none" strokeWidth="8.9" />
          <path d="M116 128 L129 139" fill="none" stroke={skin} strokeWidth="4.5" />
          <circle cx="114" cy="125" r="6" fill={skin} />
          <path d="M117 129 L119.5 131" stroke={skin} strokeWidth="4.5" />
          {/* thumb */}
          <path d="M110 128 Q109 133 113 133" fill="none" strokeWidth="1.6" />
        </g>
        <ellipse cx="83" cy="99" rx="8" ry="7" fill="url(#girl-dress)" />

        {/* neck */}
        <path d="M62 82 h10 v12 h-10z" fill={skinShade} />

        {/* head */}
        <g className="girl-head">
          <circle cx="67" cy="58" r="27" fill={skin} />
          {/* ears */}
          <circle cx="41" cy="62" r="4.5" fill={skin} />
          <circle cx="93" cy="62" r="4.5" fill={skin} />

          {/* bangs */}
          <path
            d="M39 60 Q36 28 67 28 Q98 28 95 60 Q90 46 80 42 Q76 50 66 50 Q70 44 68 40 Q58 50 46 50 Q42 54 39 60 Z"
            fill="url(#girl-hair)"
          />

          {/* bow */}
          <g className="girl-bow">
            <path d="M86 30 L78 22 L78 38 Z" fill="#ff6b6b" />
            <path d="M86 30 L94 22 L94 38 Z" fill="#ff6b6b" />
            <circle cx="86" cy="30" r="3" fill="#ff8f8f" />
          </g>

          {/* eyebrows */}
          <path d="M52 52 Q57 49 61 51" fill="none" strokeWidth="1.8" />
          <path d="M73 51 Q77 49 82 52" fill="none" strokeWidth="1.8" />

          {/* eyes: outer blinks, inner glances toward the button */}
          <g className="girl-eyes" stroke="none">
            <g className="girl-look">
              <ellipse cx="57" cy="61" rx="4" ry="5" fill={line} />
              <ellipse cx="77" cy="61" rx="4" ry="5" fill={line} />
              <circle cx="58.4" cy="59" r="1.5" fill="#fff" />
              <circle cx="78.4" cy="59" r="1.5" fill="#fff" />
            </g>
          </g>

          {/* lashes */}
          <path d="M52 58 l-2 -2 M82 58 l2 -2" strokeWidth="1.4" />

          {/* blush */}
          <ellipse cx="50" cy="70" rx="4.5" ry="2.8" fill="#ff8f8f" opacity="0.55" stroke="none" />
          <ellipse cx="84" cy="70" rx="4.5" ry="2.8" fill="#ff8f8f" opacity="0.55" stroke="none" />

          {/* open smile */}
          <path d="M60 70 Q67 79 74 70 Z" fill="#b33a3a" strokeWidth="1.8" />
          <path d="M63 74 Q67 77 71 74" fill="none" stroke="#ff8f8f" strokeWidth="1.6" />
        </g>
      </g>
    </svg>
  );
}
