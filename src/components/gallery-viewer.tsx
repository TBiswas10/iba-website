"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type GalleryItem = {
  id: number;
  title: string;
  mediaUrl: string;
};

interface GalleryViewerProps {
  items: GalleryItem[];
}

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

export function GalleryViewer({ items }: GalleryViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState(0);

  const currentItem = useMemo(() => items[activeIndex], [items, activeIndex]);

  const open = useCallback((index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
    setIsLoading(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const goTo = useCallback((index: number, newDirection: number) => {
    if (index >= 0 && index < items.length) {
      setDirection(newDirection);
      setActiveIndex(index);
      setIsLoading(true);
    }
  }, [items.length]);

  const next = useCallback(() => goTo(activeIndex + 1, 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1, -1), [activeIndex, goTo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, next, prev, close]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border-none p-0 bg-neutral-100 group shadow-sm hover:shadow-md transition-shadow"
            onClick={() => open(index)}
            aria-label={`View ${item.title}`}
          >
            <Image
              src={item.mediaUrl}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 p-2 rounded-full backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            onClick={close}
          >
            {/* Controls */}
            <div className="absolute top-4 right-4 z-[10001] flex items-center gap-2">
              <button
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                }}
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-8 z-[10000] pointer-events-none">
              <button
                className={`p-3 md:p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md pointer-events-auto ${activeIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                disabled={activeIndex === 0}
                aria-label="Previous photo"
              >
                <ChevronLeftIcon />
              </button>
              <button
                className={`p-3 md:p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md pointer-events-auto ${activeIndex === items.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                disabled={activeIndex === items.length - 1}
                aria-label="Next photo"
              >
                <ChevronRightIcon />
              </button>
            </div>

            {/* Image Container */}
            <div 
              className="relative w-full h-full max-w-6xl max-h-[80vh] flex items-center justify-center p-4 md:p-12 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = Math.abs(offset.x) > 50 && Math.abs(velocity.x) > 500;
                    if (swipe) {
                      if (offset.x > 0) prev();
                      else next();
                    }
                  }}
                  className="absolute inset-0 flex items-center justify-center p-4 md:p-12 cursor-grab active:cursor-grabbing"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                      </div>
                    )}
                    <Image
                      src={currentItem?.mediaUrl || ""}
                      alt={currentItem?.title || "Gallery image"}
                      fill
                      className="object-contain"
                      onLoad={() => setIsLoading(false)}
                      priority
                      draggable={false}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Info Bar */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-md text-white p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 z-[10001]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full text-white/70">
                  {activeIndex + 1} / {items.length}
                </span>
                <h3 className="text-lg font-semibold truncate max-w-[200px] md:max-w-md">
                  {currentItem?.title}
                </h3>
              </div>
              
              {currentItem && (
                <div className="flex items-center gap-3">
                  <a
                    href={currentItem.mediaUrl}
                    download
                    className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-teal-900/20 active:scale-95"
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DownloadIcon />
                    <span>Download</span>
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}