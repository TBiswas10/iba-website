"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useDrag } from "@use-gesture/react";

/**
 * FINAL STABLE VERSION: Responsive Modal Gallery
 * Features: 
 * - Portal-based Fullscreen Modal
 * - Mobile Swipe Gestures
 * - Mobile Navigation Arrows
 * - Styled Grid with Borders & Rounded Corners
 */

type GalleryItem = {
  id: number;
  title: string;
  mediaUrl: string;
};

interface GalleryViewerProps {
  items: GalleryItem[];
}

export function GalleryViewer({ items }: GalleryViewerProps) {
  const [index, setIndex] = useState<number | null>(null);
  const [isShowing, setIsShowing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const openModal = (i: number) => {
    setIndex(i);
    setIsShowing(true);
  };

  const closeModal = () => {
    setIsShowing(false);
    setTimeout(() => setIndex(null), 300);
  };

  const next = useCallback((e?: any) => {
    e?.stopPropagation();
    if (index !== null && index < items.length - 1) setIndex(index + 1);
  }, [index, items.length]);

  const prev = useCallback((e?: any) => {
    e?.stopPropagation();
    if (index !== null && index > 0) setIndex(index - 1);
  }, [index]);

  // Swipe Gesture Handler
  const bind = useDrag(({ active, movement: [mx], direction: [xDir], distance: [d], cancel }) => {
    if (active && d > 50) {
      if (xDir > 0) prev();
      else next();
      cancel();
    }
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (index === null) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, next, prev]);

  useEffect(() => {
    if (index !== null && thumbRef.current) {
      const active = thumbRef.current.children[index] as HTMLElement;
      if (active) {
        active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [index]);

  const modalContent = index !== null && (
    <div 
      className={`modal ${isShowing ? 'show' : ''}`}
      onClick={closeModal}
      style={{ display: isShowing ? 'flex' : 'none' }}
    >
      <span className="close" onClick={closeModal}>&times;</span>

      {/* Nav Arrows - Optimized for all screens */}
      <button className="nav-btn prev" onClick={prev} style={{ opacity: index === 0 ? 0.1 : 0.8 }}>&#10094;</button>
      <button className="nav-btn next" onClick={next} style={{ opacity: index === items.length - 1 ? 0.1 : 0.8 }}>&#10095;</button>
      
      <div 
        {...bind()} 
        className="image-stage"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={items[index].mediaUrl} 
          alt={items[index].title} 
          className="modal-image"
          draggable={false}
        />
      </div>
      
      <div className="modal-ui" onClick={(e) => e.stopPropagation()}>
        <div className="info-row">
          <div className="caption">{items[index].title}</div>
          <a href={items[index].mediaUrl} download target="_blank" rel="noreferrer" className="download-btn">Download</a>
        </div>

        <div className="thumb-strip no-scrollbar" ref={thumbRef}>
          {items.map((item, i) => (
            <img 
              key={item.id}
              src={item.mediaUrl}
              className={`thumb-item ${index === i ? 'active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .modal {
          position: fixed;
          z-index: 99999;
          left: 0;
          top: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.3s ease;
          opacity: 0;
        }
        .modal.show { opacity: 1; }

        .image-stage {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          touch-action: none;
        }

        .modal-image {
          position: relative;
          width: auto;
          height: auto;
          max-width: 98vw;
          max-height: 98vh;
          border-radius: 4px;
          overflow: hidden;
          animation: zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          object-fit: contain;
          box-shadow: 0 0 50px rgba(0,0,0,0.8);
        }

        @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .modal-ui {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 24px;
          background: linear-gradient(transparent, rgba(0,0,0,0.9));
          z-index: 99999;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto 12px;
          width: 100%;
        }

        .caption { color: white; font-size: 20px; font-family: sans-serif; text-shadow: 0 2px 4px black; font-weight: 500; }
        
        .download-btn {
          color: white; text-decoration: none; font-size: 13px; font-weight: 600;
          padding: 10px 20px; background: rgba(255,255,255,0.15); border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1); transition: 0.2s;
        }
        .download-btn:hover { background: rgba(255,255,255,0.25); }

        .thumb-strip {
          display: flex; gap: 12px; overflow-x: auto; padding: 10px 0;
          justify-content: center; scroll-behavior: smooth;
        }
        .thumb-item {
          width: 64px; height: 64px; object-fit: cover; border-radius: 6px;
          cursor: pointer; opacity: 0.4; transition: 0.2s; border: 2px solid transparent;
        }
        .thumb-item.active { opacity: 1; border-color: #0d7f78; transform: scale(1.05); }

        .nav-btn {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.08); border: none; color: white; font-size: 40px;
          cursor: pointer; z-index: 100000; transition: 0.2s;
          border-radius: 50%; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.15); }
        .prev { left: 20px; }
        .next { right: 20px; }

        .close {
          position: absolute; top: 20px; right: 25px; color: white;
          font-size: 40px; font-weight: bold; cursor: pointer; z-index: 100001;
          background: rgba(255,255,255,0.1); width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center; border-radius: 50%;
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @media screen and (max-width: 1024px) {
          .nav-btn { width: 50px; height: 50px; font-size: 24px; }
          .prev { left: 10px; }
          .next { right: 10px; }
        }

        @media screen and (max-width: 768px) {
          .modal-image { max-width: 95vw; max-height: 70vh; }
          .caption { font-size: 16px; }
          .thumb-item { width: 50px; height: 50px; }
          .modal-ui { padding: 16px; }
          .nav-btn { width: 44px; height: 44px; font-size: 20px; background: rgba(0,0,0,0.3); }
        }
      `}</style>
    </div>
  );

  return (
    <div className="w-full">
      <div className="gallery">
        {items.map((item, i) => (
          <img
            key={item.id}
            src={item.mediaUrl}
            alt={item.title}
            className="gallery-item"
            onClick={() => openModal(i)}
          />
        ))}
      </div>

      {mounted && index !== null && createPortal(modalContent, document.body)}

      <style jsx>{`
        .gallery { display: flex; flex-wrap: wrap; justify-content: flex-start; padding: 0 15px; }
        .gallery-item {
          width: calc(25% - 20px); height: 220px; object-fit: cover;
          margin: 10px; cursor: pointer; transition: transform 0.5s ease;
          border-radius: 16px; 
          background-color: #eee;
          border: 1px solid rgba(16, 16, 16, 0.15);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        .gallery-item:hover { transform: scale(1.05); z-index: 1; }

        @media screen and (max-width: 1024px) { .gallery-item { width: calc(33.33% - 20px); } }
        @media screen and (max-width: 768px) {
          .gallery-item { width: calc(50% - 20px); height: 180px; }
        }
        @media screen and (max-width: 480px) {
          .gallery-item { width: calc(100% - 20px); height: 250px; }
        }
      `}</style>
    </div>
  );
}