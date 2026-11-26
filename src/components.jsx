import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ExternalLink } from 'lucide-react';
import { withFrame, ratioOf, isLandscape } from './utils';

export function Reveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function PlatformBadge({ platform, className = '' }) {
  if (!platform) return null;
  return (
    <span className={`glass-dark rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white ${className}`}>
      {platform}
    </span>
  );
}

/** Автовоспроизведение без звука, пока видео в зоне видимости. Кадр показывается целиком. */
export function AutoVideo({ src, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} src={withFrame(src)} muted loop playsInline preload="metadata" className={className} />;
}

/** Миниатюра ролика: контейнер повторяет реальные пропорции видео */
export function VideoThumb({ video, onOpen, className = '' }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(video)}
      style={{ aspectRatio: ratioOf(video.src) }}
      className={`group relative block w-full overflow-hidden rounded-3xl bg-line text-left outline-none transition-transform duration-500 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-accent ${className}`}
    >
      <video src={withFrame(video.src)} preload="metadata" playsInline muted className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <PlatformBadge platform={video.platform} className="absolute left-3 top-3" />
      <span className="glass-dark absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white transition-transform duration-500 group-hover:scale-110">
        <Play size={18} fill="currentColor" />
      </span>
      <span className="absolute inset-x-3 bottom-3 text-sm font-medium leading-snug text-white">{video.title}</span>
    </button>
  );
}

export function Overlay({ children, onClose, z = 'z-50', align = 'items-center' }) {
  return (
    <motion.div
      className={`fixed inset-0 ${z} flex ${align} justify-center bg-black/40 backdrop-blur-md`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      {children}
    </motion.div>
  );
}

export function CloseButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      aria-label="Закрыть"
      onClick={onClick}
      className={`glass flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 ${className}`}
    >
      <X size={20} />
    </button>
  );
}

export function RoleNote({ role, text }) {
  return (
    <div className="rounded-3xl bg-accent/45 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-fg/60">Чем этот проект полезен для роли «{role.label}»</p>
      <p className="mt-2 text-[15px] leading-relaxed">{text}</p>
    </div>
  );
}

export function PlayerModal({ video, onClose }) {
  return (
    <Overlay onClose={onClose} z="z-[60]">
      <motion.div
        className="relative flex max-h-[100dvh] w-full max-w-3xl flex-col items-center gap-4 p-4"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-medium text-white">
            {video.title} <PlatformBadge platform={video.platform} />
          </p>
          <CloseButton onClick={onClose} className="shrink-0" />
        </div>
        <video
          key={video.src}
          src={withFrame(video.src)}
          controls
          autoPlay
          playsInline
          className="max-h-[72dvh] w-auto max-w-full rounded-3xl bg-black shadow-2xl"
        />
        {video.link && (
          <a
            href={video.link}
            target="_blank"
            rel="noopener noreferrer"
            className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-transform hover:scale-105"
          >
            Смотреть оригинал <ExternalLink size={15} />
          </a>
        )}
      </motion.div>
    </Overlay>
  );
}

export function Lightbox({ images, index, onClose, onChange }) {
  const [zoom, setZoom] = useState(false);
  const img = images[index];
  const go = (d) => {
    setZoom(false);
    onChange((index + d + images.length) % images.length);
  };
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });
  return (
    <Overlay onClose={onClose} z="z-50">
      <motion.div
        className="relative flex h-[100dvh] w-full max-w-5xl flex-col p-4"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-white/90">
            {img.alt} <span className="text-white/50">· {index + 1} / {images.length}</span>
          </p>
          <div className="flex gap-2">
            <button type="button" aria-label={zoom ? 'Уменьшить' : 'Приблизить'} onClick={() => setZoom(!zoom)} className="glass flex h-11 w-11 items-center justify-center rounded-full">
              {zoom ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
            </button>
            <CloseButton onClick={onClose} />
          </div>
        </div>
        <div className={`relative min-h-0 flex-1 rounded-3xl ${zoom ? 'overflow-auto' : 'flex items-center justify-center overflow-hidden'}`}>
          <AnimatePresence mode="wait">
            <motion.img
              key={img.src}
              src={img.src}
              alt={img.alt}
              onClick={() => setZoom(!zoom)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={zoom ? { width: 'min(220vw, 1800px)', maxWidth: 'none', cursor: 'zoom-out' } : { cursor: 'zoom-in' }}
              className={zoom ? 'mx-auto block' : 'max-h-full max-w-full rounded-3xl object-contain'}
            />
          </AnimatePresence>
        </div>
        {images.length > 1 && (
          <>
            <button type="button" aria-label="Назад" onClick={() => go(-1)} className="glass absolute left-6 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full">
              <ChevronLeft size={22} />
            </button>
            <button type="button" aria-label="Вперёд" onClick={() => go(1)} className="glass absolute right-6 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full">
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </motion.div>
    </Overlay>
  );
}

export function CaseModal({ item, role, onClose, onVideo, onImage }) {
  return (
    <Overlay onClose={onClose} z="z-40" align="items-end md:items-center">
      <motion.div
        className="glass-strong relative max-h-[94dvh] w-full max-w-4xl overflow-y-auto rounded-t-[2rem] p-6 md:rounded-[2rem] md:p-10"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 240, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">{item.period} · {item.role}</p>
            <h3 className="font-display mt-2 text-3xl font-semibold leading-tight md:text-4xl">{item.title}</h3>
          </div>
          <CloseButton onClick={onClose} className="shrink-0" />
        </div>

        <RoleNote role={role} text={item.roleNotes[role.id]} />

        <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-fg/90">
          {item.story.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {item.metrics.map(([n, l]) => (
            <div key={l} className="rounded-3xl bg-accent/40 p-4">
              <p className="font-display text-2xl font-semibold md:text-3xl">{n}</p>
              <p className="mt-1 text-sm text-muted">{l}</p>
            </div>
          ))}
        </div>

        <h4 className="mt-10 mb-4 text-sm font-semibold uppercase tracking-wider text-muted">Ролики</h4>
        <div className="grid grid-cols-2 items-start gap-3 md:grid-cols-4">
          {item.videos.map((v) => (
            <VideoThumb key={v.src} video={v} onOpen={onVideo} className={isLandscape(v.src) ? 'col-span-2' : ''} />
          ))}
        </div>

        {item.gallery.length > 0 && (
          <>
            <h4 className="mt-10 mb-4 text-sm font-semibold uppercase tracking-wider text-muted">Статистика и посты. Нажмите, чтобы приблизить</h4>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
              {item.gallery.map((g, i) => (
                <button key={g.src} type="button" onClick={() => onImage(item.gallery, i)} className="group aspect-[3/4] overflow-hidden rounded-2xl bg-line outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  <img src={g.src} alt={g.alt} loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                </button>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </Overlay>
  );
}
