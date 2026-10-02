'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    // Disabled inside admin panel, on touch devices, or when prefers-reduced-motion is active
    if (
      isAdmin ||
      typeof window === 'undefined' ||
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Set initial positions
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    const onMouseMove = (e: MouseEvent) => {
      gsap.to(dot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power2.out',
      });

      gsap.to(ring, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: 'expo.out',
      });
    };

    const onMouseEnterInteractive = () => {
      gsap.to(ring, {
        scale: 2.5,
        backgroundColor: 'rgba(212, 175, 55, 0.12)',
        borderColor: '#D4AF37',
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(dot, {
        scale: 0.5,
        duration: 0.3,
      });
    };

    const onMouseLeaveInteractive = () => {
      gsap.to(ring, {
        scale: 1,
        backgroundColor: 'transparent',
        borderColor: 'rgba(212, 175, 55, 0.6)',
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(dot, {
        scale: 1,
        duration: 0.3,
      });
    };

    window.addEventListener('mousemove', onMouseMove);

    const attachHoverListeners = () => {
      const interactives = document.querySelectorAll<HTMLElement>(
        'a, button, input, select, textarea, [data-cursor-hover], .property-card'
      );
      interactives.forEach((el) => {
        el.addEventListener('mouseenter', onMouseEnterInteractive);
        el.addEventListener('mouseleave', onMouseLeaveInteractive);
      });
    };

    attachHoverListeners();

    const observer = new MutationObserver(() => {
      attachHoverListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      observer.disconnect();
    };
  }, [isAdmin]);

  if (isAdmin) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="wa-cursor-dot pointer-events-none hidden md:block"
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className="wa-cursor-ring pointer-events-none hidden md:block"
        aria-hidden="true"
      />
    </>
  );
}
