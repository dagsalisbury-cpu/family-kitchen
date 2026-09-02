"use client";

import { useEffect, useState, useRef } from "react";

export default function WanderingAvatar() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [facingLeft, setFacingLeft] = useState(false);
  const [action, setAction] = useState<'idle' | 'walking' | 'thinking' | 'inspecting'>('idle');
  const [speech, setSpeech] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial placement in the center
    setPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    let timeoutId: NodeJS.Timeout;

    const performAction = () => {
      const actions = ['walking', 'walking', 'inspecting', 'idle', 'thinking'];
      const nextAction = actions[Math.floor(Math.random() * actions.length)] as any;
      setAction(nextAction);
      setSpeech(null);

      if (nextAction === 'walking') {
        // Walk to a random spot
        const nextX = Math.max(50, Math.floor(Math.random() * (window.innerWidth - 100)));
        const nextY = Math.max(50, Math.floor(Math.random() * (window.innerHeight - 100)));
        
        setPos(prev => {
          setFacingLeft(nextX < prev.x);
          return { x: nextX, y: nextY };
        });

        timeoutId = setTimeout(performAction, 4000);
      } 
      else if (nextAction === 'inspecting') {
        // Find an interactive element (cards, slots, buttons) and walk to it
        const elements = Array.from(document.querySelectorAll('.rounded-2xl, button, .bg-white'));
        if (elements.length > 0) {
          const randomEl = elements[Math.floor(Math.random() * elements.length)];
          const rect = randomEl.getBoundingClientRect();
          
          // Move to the top-right or top-left corner of the element
          const nextX = Math.random() > 0.5 ? rect.left - 20 : rect.right;
          const nextY = rect.top - 10;
          
          setPos(prev => {
            setFacingLeft(nextX < prev.x);
            return { x: nextX, y: nextY };
          });
          
          setTimeout(() => setSpeech(Math.random() > 0.5 ? 'Looks good!' : 'Hmm...'), 3000);
          timeoutId = setTimeout(performAction, 6000);
        } else {
          timeoutId = setTimeout(performAction, 1000);
        }
      }
      else if (nextAction === 'thinking') {
        const thoughts = ['Checking the list...', 'Need more snacks...', 'Aisle 4, right?', 'Got to get the bread!', 'Where are the beans...'];
        setSpeech(thoughts[Math.floor(Math.random() * thoughts.length)]);
        timeoutId = setTimeout(performAction, 3000);
      }
      else {
        // Idle
        timeoutId = setTimeout(performAction, 2000);
      }
    };

    timeoutId = setTimeout(performAction, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Avoid rendering until mounted to avoid SSR hydration mismatch with window.innerWidth
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed z-[100] pointer-events-none flex flex-col items-center justify-end"
      style={{
        left: 0, top: 0,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: action === 'walking' || action === 'inspecting' ? 'transform 3.5s ease-in-out' : 'transform 0s'
      }}
    >
      {/* Speech Bubble */}
      {speech && (
        <div className="absolute bottom-full mb-2 bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-900 text-[10px] px-3 py-1.5 rounded-xl rounded-br-none shadow-lg font-bold text-indigo-900 dark:text-indigo-100 whitespace-nowrap animate-bounce pointer-events-auto">
          {speech}
        </div>
      )}

      {/* Pixel Character */}
      <div 
        className={`pointer-events-auto cursor-help ${action === 'walking' || action === 'inspecting' ? 'animate-bounce' : ''}`}
        style={{
          transform: `scaleX(${facingLeft ? -1 : 1})`,
          transition: 'transform 0.2s'
        }}
        onClick={() => setSpeech("Hey! I'm helping!")}
      >
        <svg width="48" height="48" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" className="drop-shadow-md">
          {/* Person */}
          <rect x="2" y="2" width="3" height="3" fill="#fcd34d" />
          <rect x="4" y="3" width="1" height="1" fill="#000" />
          <rect x="1" y="1" width="4" height="1" fill="#78350f" />
          <rect x="1" y="2" width="1" height="2" fill="#78350f" />
          <rect x="2" y="5" width="3" height="4" fill="#6366f1" />
          <rect x="3" y="6" width="4" height="1" fill="#6366f1" />
          <rect x="7" y="6" width="1" height="1" fill="#fcd34d" />
          <rect x="2" y="9" width="1" height="3" fill="#1e1b4b" />
          <rect x="4" y="9" width="1" height="3" fill="#1e1b4b" />
          <rect x="1" y="12" width="2" height="1" fill="#000" />
          <rect x="4" y="12" width="2" height="1" fill="#000" />

          {/* Shopping Trolley */}
          <rect x="8" y="6" width="1" height="4" fill="#94a3b8" />
          <rect x="9" y="4" width="6" height="1" fill="#cbd5e1" />
          <rect x="9" y="8" width="5" height="1" fill="#cbd5e1" />
          <rect x="14" y="4" width="1" height="4" fill="#cbd5e1" />
          <rect x="9" y="4" width="1" height="5" fill="#cbd5e1" />
          <rect x="10" y="6" width="4" height="1" fill="#cbd5e1" />
          <rect x="11" y="4" width="1" height="4" fill="#cbd5e1" />
          <rect x="13" y="4" width="1" height="4" fill="#cbd5e1" />
          <rect x="8" y="10" width="6" height="1" fill="#94a3b8" />
          <rect x="9" y="11" width="2" height="2" fill="#334155" />
          <rect x="12" y="11" width="2" height="2" fill="#334155" />
        </svg>
      </div>
    </div>
  );
}
