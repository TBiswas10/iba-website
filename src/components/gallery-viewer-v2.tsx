"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard, Zoom, Virtual } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
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
  const swiperRef = useRef<any>(null);

  useEffect(() => setMounted(true), []);

  const open = (i: number) => {
    setOpenIndex(i);
    setTimeout(() => {
      if (swiperRef.current && swiperRef.current.swiper) {
        swiperRef.current.swiper.slideTo(i, 0);
      }
    }, 50);
  };

  const close = () => setOpenIndex(null);

  const modal = openIndex !== null && mounted && createPortal(
    <div className={`gv2-modal ${openIndex !== null ? 'show' : ''}`} onClick={close}>
      <div className="gv2-close" onClick={close} aria-label="Close">×</div>
      <div className="gv2-swiper-wrap" onClick={(e) => e.stopPropagation()}>
        <Swiper
          modules={[Navigation, Pagination, Keyboard, Zoom, Virtual]}
          navigation
          pagination={{ clickable: true }}
          keyboard={{ enabled: true }}
          zoom={{ maxRatio: 3 }}
          spaceBetween={30}
          slidesPerView={1}
          initialSlide={openIndex}
          onSwiper={(s) => { swiperRef.current = { swiper: s }; }}
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
        .gv2-close { position:absolute; top:18px; right:20px; z-index:120001; color:white; font-size:34px; cursor:pointer; background: rgba(255,255,255,0.06); width:46px; height:46px; display:flex; align-items:center; justify-content:center; border-radius:50%; }
        .gv2-zoom-container { width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
        :global(.swiper-slide) { display:flex; align-items:center; justify-content:center; }
        :global(.gv2-img) { object-fit:contain !important; }
        .gv2-thumb-strip { position:absolute; bottom:14px; left:0; right:0; display:flex; gap:8px; justify-content:center; z-index:120001; }
        .gv2-thumb { background:transparent; border:2px solid transparent; padding:2px; border-radius:6px; overflow:hidden; width:72px; height:54px; }
        .gv2-thumb.active { border-color: rgba(13,127,120,0.9); transform:scale(1.05); }
        @media (max-width:768px) { .gv2-swiper-wrap { max-width: 100%; max-height: 80vh; } .gv2-thumb { width:56px; height:40px; } }
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
