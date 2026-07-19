import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="40%" stopColor="#3B82F6" />
              <stop offset="75%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <path
            d="M 24 10 H 54 C 76 10, 90 26, 90 50 C 90 74, 76 90, 54 90 H 24 C 16.268 90, 10 83.732, 10 76 V 24 C 10 16.268, 16.268 10, 24 10 Z M 34 30 V 70 C 34 71.5, 35.5 73, 37 73 H 52 C 64.706 73, 73 63.706, 73 50 C 73 36.294, 64.706 27, 52 27 H 37 C 35.5 27, 34 28.5, 34 30 Z"
            fill="url(#g)"
            fillRule="evenodd"
          />
          <path d="M 34 27 L 46 27 C 42.5 33.5, 39 37, 34 40.5 Z" fill="#FFFFFF" />
          <rect x="41" y="42" width="18" height="3.5" rx="1.75" fill="#FFFFFF" />
          <rect x="41" y="49.5" width="22" height="3.5" rx="1.75" fill="#FFFFFF" />
          <rect x="41" y="57" width="13" height="3.5" rx="1.75" fill="#FFFFFF" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
