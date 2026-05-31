"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Zoom, Virtual } from "swiper/modules";
import "swiper/css";
import "swiper/css/zoom";

type GalleryItem = {
  id: number;
  title?: string | null;
  mediaUrl: string;
};

interface Props {
  items: GalleryItem[];
}

export default function GalleryViewerV2({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    const updateIsMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768);
    };
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  const open = (i: number) => {
    setOpenIndex(i);
    setActiveSlide(i);
    setTimeout(() => {
      if (swiperRef.current && swiperRef.current.swiper) {
        swiperRef.current.swiper.slideTo(i, 0);
      }
    }, 50);
  };

  const close = () => setOpenIndex(null);

  const goPrev = () => swiperRef.current?.swiper?.slidePrev();
  const goNext = () => swiperRef.current?.swiper?.slideNext();

  const currentItem = items[activeSlide] ?? items[openIndex ?? 0];

  const handleSave = async () => {
    if (!currentItem) return;

    try {
      setIsSaving(true);
      const response = await fetch(currentItem.mediaUrl);
      const blob = await response.blob();
      const safeTitle = (currentItem.title || "gallery-image").replace(/\s+/g, "-").toLowerCase();
      const filename = `${safeTitle}.jpg`;
      const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

      if (
        isMobileDevice &&
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ files: [file], title: currentItem.title || "Gallery photo" });
        return;
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to save image:", error);
      window.open(currentItem.mediaUrl, "_blank");
    } finally {
      setIsSaving(false);
    }
  };

  const modal = openIndex !== null && mounted && createPortal(
    <div className={`gv2-modal ${openIndex !== null ? 'show' : ''}`} onClick={close}>
      <div className="gv2-actions" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="gv2-icon-btn"
          onClick={handleSave}
          aria-label={isMobile ? "Share photo" : "Save photo"}
          title={isMobile ? "Share photo" : "Save photo"}
          disabled={isSaving || !currentItem}
        >
          {isSaving ? (
            <span className="gv2-saving-dot" aria-hidden="true" />
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 4v10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 10l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 20h14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <button type="button" className="gv2-close" onClick={close} aria-label="Close">×</button>
      </div>
      <div className="gv2-swiper-wrap" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={`gv2-nav gv2-nav-left ${activeSlide <= 0 ? 'disabled' : ''}`}
          onClick={goPrev}
          aria-label="Previous photo"
          disabled={activeSlide <= 0}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <Swiper
          modules={[Keyboard, Zoom, Virtual]}
          keyboard={{ enabled: true }}
          zoom={{ maxRatio: 3 }}
          spaceBetween={30}
          slidesPerView={1}
          initialSlide={openIndex}
          onSwiper={(s) => { swiperRef.current = { swiper: s }; setActiveSlide(s.activeIndex); }}
          onSlideChange={(s) => setActiveSlide(s.activeIndex)}
          virtual
          style={{ width: '100%', height: '100%' }}
        >
          {items.map((it, i) => (
            <SwiperSlide key={it.id} virtualIndex={i}>
              <div className="gv2-zoom-container swiper-zoom-container">
                <Image src={it.mediaUrl} alt={it.title || 'Photo'} fill className="gv2-img" unoptimized />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          className={`gv2-nav gv2-nav-right ${activeSlide >= items.length - 1 ? 'disabled' : ''}`}
          onClick={goNext}
          aria-label="Next photo"
          disabled={activeSlide >= items.length - 1}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="gv2-thumb-strip">
          {items.map((it, i) => (
            <button
              key={it.id}
              className={`gv2-thumb ${i === (swiperRef.current?.swiper?.realIndex ?? openIndex) ? 'active' : ''}`}
              onClick={() => swiperRef.current?.swiper?.slideTo(i)}
            >
              <Image src={it.mediaUrl} alt={it.title || 'thumb'} width={80} height={60} style={{objectFit:'cover'}} unoptimized />
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .gv2-modal { position: fixed; inset: 0; z-index: 120000; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.95); opacity:0; transition:opacity 160ms ease; }
        .gv2-modal.show { opacity:1 }
        .gv2-swiper-wrap { width: 100%; height: 100%; max-width: 1200px; max-height: 90vh; position:relative; }
        .gv2-actions { position:absolute; top:18px; right:20px; z-index:120001; display:flex; align-items:center; gap:10px; }
        .gv2-close { color:white; font-size:34px; cursor:pointer; background: rgba(255,255,255,0.06); width:46px; height:46px; display:flex; align-items:center; justify-content:center; border-radius:50%; border: 1px solid rgba(255,255,255,0.12); backdrop-filter: blur(14px); }
        .gv2-icon-btn {
          width: 46px;
          height: 46px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.08);
          color: white;
          backdrop-filter: blur(14px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.22);
          transition: transform 160ms ease, background 160ms ease, opacity 160ms ease;
        }
        .gv2-icon-btn svg { width: 20px; height: 20px; }
        .gv2-icon-btn:hover:not(:disabled), .gv2-close:hover { background: rgba(255,255,255,0.16); transform: scale(1.04); }
        .gv2-icon-btn:disabled { opacity: 0.6; cursor: default; }
        .gv2-icon-btn:focus-visible, .gv2-close:focus-visible, .gv2-nav:focus-visible { outline: 2px solid rgba(255,255,255,0.9); outline-offset: 3px; }
        .gv2-saving-dot { width: 14px; height: 14px; border-radius: 999px; border: 2px solid rgba(255,255,255,0.35); border-top-color: white; animation: gv2-spin 0.8s linear infinite; }
        @keyframes gv2-spin { to { transform: rotate(360deg); } }
        .gv2-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 120001;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(14px);
          color: white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.28);
          transition: transform 160ms ease, background 160ms ease, opacity 160ms ease, border-color 160ms ease;
        }
        .gv2-nav svg { width: 26px; height: 26px; }
        .gv2-nav:hover:not(:disabled) { background: rgba(255,255,255,0.2); transform: translateY(-50%) scale(1.04); border-color: rgba(255,255,255,0.28); }
        .gv2-nav:active:not(:disabled) { transform: translateY(-50%) scale(0.98); }
        .gv2-nav.disabled { opacity: 0.35; cursor: default; }
        .gv2-nav-left { left: 18px; }
        .gv2-nav-right { right: 18px; }
        .gv2-zoom-container { width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
        :global(.swiper-button-next),
        :global(.swiper-button-prev),
        :global(.swiper-pagination) {
          display: none !important;
        }
        :global(.swiper-pagination-bullet) {
          display: none !important;
        }
        :global(.swiper-slide) { display:flex; align-items:center; justify-content:center; }
        :global(.gv2-img) { object-fit:contain !important; }
        .gv2-thumb-strip { position:absolute; bottom:14px; left:0; right:0; display:flex; gap:8px; justify-content:center; z-index:120001; }
        .gv2-thumb { background:transparent; border:2px solid transparent; padding:2px; border-radius:6px; overflow:hidden; width:72px; height:54px; }
        .gv2-thumb.active { border-color: rgba(13,127,120,0.9); transform:scale(1.05); }
        @media (max-width:768px) { .gv2-swiper-wrap { max-width: 100%; max-height: 80vh; } .gv2-thumb { width:56px; height:40px; } .gv2-nav { width:48px; height:48px; } .gv2-nav svg { width:22px; height:22px; } .gv2-nav-left { left: 10px; } .gv2-nav-right { right: 10px; } .gv2-actions { top: 12px; right: 12px; gap: 8px; } .gv2-close, .gv2-icon-btn { width: 42px; height: 42px; } }
      `}</style>
    </div>, document.body
  );

  return (
    <div className="gv2-gallery">
      <div className="gv2-grid">
        {items.map((it, i) => (
          <div key={it.id} className="gv2-item" onClick={() => open(i)}>
            <Image src={it.mediaUrl} alt={it.title || 'Gallery image'} fill className="gv2-grid-img" unoptimized />
          </div>
        ))}
      </div>

      {modal}

      <style jsx>{`
        .gv2-grid { display:grid; grid-template-columns: repeat(4,1fr); gap:16px; }
        .gv2-item { position:relative; aspect-ratio:1/1; overflow:hidden; border-radius:12px; cursor:pointer; }
        :global(.gv2-grid-img) { object-fit:cover !important; }
        @media (max-width:1024px) { .gv2-grid { grid-template-columns: repeat(3,1fr); } }
        @media (max-width:768px) { .gv2-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width:480px) { .gv2-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
