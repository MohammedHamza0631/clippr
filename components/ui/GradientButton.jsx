import { cn } from '@/lib/utils'
import { useState } from 'react'

export default function GradientButton({ children, className, ...props }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const updatePosition = (e) => {
    if (!e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <button 
      onMouseMove={updatePosition}
      onMouseLeave={() => setPosition({ x: 0, y: 0 })}
      className={cn('group relative w-fit flex px-12 py-4 rounded-lg bg-zinc-950 overflow-hidden shadow-[0px_1px_4px_0px_rgba(255,255,255,0.1)_inset,0px_-1px_4px_0px_rgba(255,255,255,0.1)_inset] text-white transition-all duration-300 hover:scale-[1.02]', className)} 
      {...props}
    >
      {children}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(120px circle at ${position.x}px ${position.y}px, rgba(251,113,133,0.15), transparent 40%)`
        }}
      />
      <span className='absolute inset-x-0 bottom-px h-px mx-auto bg-gradient-to-r from-transparent via-rose-400 to-transparent transition-opacity duration-300 group-hover:opacity-80 animate-pulse-x'></span>
      <span className='absolute inset-x-0 bottom-px h-[4px] mx-auto bg-gradient-to-r from-transparent via-rose-400 to-transparent blur-lg transition-all duration-300 group-hover:opacity-80 animate-gradient-x  '></span>
    </button>
  )
}
