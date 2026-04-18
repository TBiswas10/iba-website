"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useDrag } from "@use-gesture/react";
import Image from "next/image";

/**
 * FINAL STABLE VERSION: Responsive Modal Gallery
 * Fix: Corrected "Download" vs "Save/Share" logic for mobile/desktop.
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Proper Mobile Detection
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      setMounted(false);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const openModal = (i: number) => {
    setIndex(i);
    setIsShowing(true);
  };

  const closeModal = useCallback(() => {
    setIsShowing(false);
    setTimeout(() => setIndex(null), 300);
  }, []);

  const next = useCallback((e?: any) => {
    if (e?.stopPropagation) e.stopPropagation();
    setIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : prev));
  }, [items.length]);

  const prev = useCallback((e?: any) => {
    if (e?.stopPropagation) e.stopPropagation();
    setIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  // Native Save/Share Logic
  const handleAction = async (e: React.MouseEvent, url: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsProcessing(true);
      const response = await fetch(url);
      const blob = await response.blob();
      const filename = `${title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      
      // If mobile and share is supported, use native share sheet
      if (isMobile && navigator.share) {
        try {
          const file = new File([blob], filename, { type: blob.type });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: title,
            });
            return;
          }
        } catch (sError) {
          console.log("Share failed, falling back to download", sError);
        }
      }

      // Desktop or Mobile Fallback: Direct Download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.body.appendChild(document.createElement('a'));
      link.href = blobUrl;
      link.download = filename;
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
    } catch (error) {
      console.error("Action failed:", error);
      window.open(url, '_blank');
    } finally {
      setIsProcessing(false);
    }
  };

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
  }, [index, next, prev, closeModal]);

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

      <button className="nav-btn prev" onClick={prev} style={{ opacity: index === 0 ? 0.1 : 0.8 }}>&#10094;</button>
      <button className="nav-btn next" onClick={next} style={{ opacity: index === items.length - 1 ? 0.1 : 0.8 }}>&#10095;</button>
      
      <div 
        {...(bind() as any)} 
        className="image-stage"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-image-container">
          <Image 
            src={items[index].mediaUrl} 
            alt={items[index].title || "Gallery image"} 
            fill
            className="modal-image"
            draggable={false}
            unoptimized
          />
        </div>
      </div>
      
      <div className="modal-ui" onClick={(e) => e.stopPropagation()}>
        <div className="info-row">
          <div className="caption">{items[index].title}</div>
          <button 
            onClick={(e) => handleAction(e, items[index].mediaUrl, items[index].title)}
            className="action-btn"
            disabled={isProcessing}
          >
            {isProcessing ? '...' : (isMobile ? 'Save Image' : 'Download')}
          </button>
        </div>

        <div className="thumb-strip no-scrollbar" ref={thumbRef}>
          {items.map((item, i) => (
            <div 
              key={item.id} 
              className={`thumb-item-wrapper ${index === i ? 'active' : ''}`}
              onClick={() => setIndex(i)}
            >
              <Image 
                src={item.mediaUrl}
                alt={item.title || "Thumbnail"}
                fill
                className="thumb-image"
                unoptimized
              />
            </div>
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

        .modal-image-container {
          position: relative;
          width: 98vw;
          height: 98vh;
          max-width: 98vw;
          max-height: 98vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        :global(.modal-image) {
          object-fit: contain !important;
          border-radius: 4px;
          filter: drop-shadow(0 0 50px rgba(0,0,0,0.8));
          animation: zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
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
        
        .action-btn {
          color: white; border: none; font-size: 13px; font-weight: 600;
          padding: 10px 20px; background: rgba(255,255,255,0.15); border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1); transition: 0.2s;
          cursor: pointer;
        }
        .action-btn:hover:not(:disabled) { background: rgba(255,255,255,0.25); }
        .action-btn:disabled { opacity: 0.5; cursor: default; }

        .thumb-strip {
          display: flex; gap: 12px; overflow-x: auto; padding: 10px 0;
          justify-content: center; scroll-behavior: smooth;
        }
        .thumb-item-wrapper {
          position: relative;
          width: 64px; height: 64px; border-radius: 6px;
          cursor: pointer; opacity: 0.4; transition: 0.2s; border: 2px solid transparent;
          overflow: hidden;
          flex-shrink: 0;
        }
        :global(.thumb-image) {
          object-fit: cover !important;
        }
        .thumb-item-wrapper.active { opacity: 1; border-color: #0d7f78; transform: scale(1.05); }

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
          .modal-image-container { max-width: 95vw; max-height: 70vh; }
          .caption { font-size: 16px; }
          .thumb-item-wrapper { width: 50px; height: 50px; }
          .modal-ui { padding: 16px; }
          .nav-btn { width: 44px; height: 44px; font-size: 20px; background: rgba(0,0,0,0.3); }
        }
      `}</style>
    </div>
  );

  return (
    <div className="gallery-container">
      <div className="gallery-grid">
        {items.map((item, i) => (
          <div 
            key={item.id} 
            className="gallery-item-wrapper"
            onClick={() => openModal(i)}
          >
            <Image
              src={item.mediaUrl}
              alt={item.title || "Gallery image"}
              fill
              className="gallery-image"
              unoptimized
            />
          </div>
        ))}
      </div>

      {mounted && index !== null && createPortal(modalContent, document.body)}

      <style jsx>{`
        .gallery-container {
          width: 100%;
          padding: 10px 15px;
        }
        
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .gallery-item-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          min-height: 200px;
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border-radius: 16px; 
          background-color: #f0f0f0;
          border: 1px solid rgba(16, 16, 16, 0.15);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        :global(.gallery-image) {
          object-fit: cover !important;
        }

        .gallery-item-wrapper:hover {
          transform: scale(1.05);
          z-index: 10;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
        }

        @media screen and (max-width: 1024px) {
          .gallery-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media screen and (max-width: 768px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .gallery-item-wrapper { min-height: 150px; }
        }

        @media screen and (max-width: 480px) {
          .gallery-grid { grid-template-columns: 1fr; }
          .gallery-item-wrapper { aspect-ratio: 16 / 9; }
        }
      `}</style>
    </div>
  );
}