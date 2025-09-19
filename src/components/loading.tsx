
export function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative h-24 w-24">
        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>
            {`
              .house-path {
                stroke: hsl(var(--primary));
                stroke-width: 4;
                fill: transparent;
                stroke-dasharray: 500;
                stroke-dashoffset: 500;
                animation: draw 2s ease-in-out forwards;
              }
              .dot {
                fill: hsl(var(--primary));
                animation: blink 1s infinite;
              }
              .dot1 { animation-delay: 0s; }
              .dot2 { animation-delay: 0.2s; }
              .dot3 { animation-delay: 0.4s; }

              @keyframes draw {
                to {
                  stroke-dashoffset: 0;
                }
              }
              @keyframes blink {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
              }
            `}
          </style>
          {/* House Roof */}
          <path
            className="house-path"
            d="M50 10 L10 40 L90 40 Z"
          />
          {/* House Body */}
          <path
            className="house-path"
            d="M20 40 V 90 H 80 V 40"
          />
          {/* Door */}
           <path
            className="house-path"
            d="M45 90 V 60 H 55 V 90"
          />
        </svg>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>Loading</span>
        <div className="flex gap-1">
            <span className="dot dot1">.</span>
            <span className="dot dot2">.</span>
            <span className="dot dot3">.</span>
        </div>
      </div>
    </div>
  );
}
