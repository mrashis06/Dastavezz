import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A0A0C 0%, #111116 100%)',
          position: 'relative',
        }}
      >
        {/* Ambient Glow */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 50%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Brand Container */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <svg width="110" height="110" viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="og-g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="40%" stopColor="#3B82F6" />
                <stop offset="75%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <path
              d="M 24 10 H 54 C 76 10, 90 26, 90 50 C 90 74, 76 90, 54 90 H 24 C 16.268 90, 10 83.732, 10 76 V 24 C 10 16.268, 16.268 10, 24 10 Z M 34 30 V 70 C 34 71.5, 35.5 73, 37 73 H 52 C 64.706 73, 73 63.706, 73 50 C 73 36.294, 64.706 27, 52 27 H 37 C 35.5 27, 34 28.5, 34 30 Z"
              fill="url(#og-g)"
              fillRule="evenodd"
            />
            <path d="M 34 27 L 46 27 C 42.5 33.5, 39 37, 34 40.5 Z" fill="#FFFFFF" />
            <rect x="41" y="42" width="18" height="3.5" rx="1.75" fill="#FFFFFF" />
            <rect x="41" y="49.5" width="22" height="3.5" rx="1.75" fill="#FFFFFF" />
            <rect x="41" y="57" width="13" height="3.5" rx="1.75" fill="#FFFFFF" />
          </svg>

          <span
            style={{
              fontSize: '84px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-2px',
            }}
          >
            Dastavezz
          </span>
        </div>

        {/* Tagline */}
        <span
          style={{
            marginTop: '20px',
            fontSize: '18px',
            fontWeight: 800,
            letterSpacing: '6px',
            color: '#3B82F6',
            textTransform: 'uppercase',
          }}
        >
          Smart Documents. Better Impact.
        </span>
      </div>
    ),
    { ...size }
  );
}
