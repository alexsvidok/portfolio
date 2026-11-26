import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { ArrowUpRight, ArrowDown, Send, Mail, Menu, X, MapPin, Briefcase, Plane, GraduationCap, Play } from 'lucide-react';
import { person, roles, roleList, navItems, cases, editing } from './data/content';
import { isLandscape } from './utils';
import { Reveal, AutoVideo, VideoThumb, PlayerModal, Lightbox, CaseModal, RoleNote, PlatformBadge } from './components';

const getInitialRole = () => {
  const r = new URLSearchParams(window.location.search).get('role');
  return roles[r] ? r : 'producer';
};

const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function App() {
  const [roleId, setRoleId] = useState(getInitialRole);
  const [openCase, setOpenCase] = useState(null);
  const [player, setPlayer] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const role = roles[roleId];

  const changeRole = (id) => {
    setRoleId(id);
    const url = new URL(window.location.href);
    url.searchParams.set('role', id);
    window.history.replaceState(null, '', url);
  };

  const orderedCases = useMemo(() => role.order.map((id) => cases[id]), [role]);

  useEffect(() => {
    document.body.style.overflow = openCase || player || lightbox ? 'hidden' : '';
  }, [openCase, player, lightbox]);

  useEffect(() => {
    const h = (e) => {
      if (e.key !== 'Escape') return;
      if (player) setPlayer(null);
      else if (lightbox) setLightbox(null);
      else if (openCase) setOpenCase(null);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [player, lightbox, openCase]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative overflow-x-clip">
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-accent/50 blur-[120px]" />
          <div className="absolute top-[60vh] -right-40 h-[420px] w-[420px] rounded-full bg-accent/30 blur-[120px]" />
        </div>

        <Header roleId={roleId} />

        <main>
          <Home />
          <About />
          <Roles role={role} roleId={roleId} onChange={changeRole} />
          <Principles role={role} />

          <section id="projects" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <Reveal>
              <h2 className="font-display text-4xl font-semibold md:text-5xl">Проекты</h2>
              <p className="mt-4 max-w-xl text-lg text-muted">
                Порядок и пояснения подстроены под роль «{role.label}». Нажмите на ролик, чтобы посмотреть со звуком, или откройте кейс целиком.
              </p>
            </Reveal>
            <motion.div layout className="mt-12 grid gap-6 md:grid-cols-2">
              {orderedCases.map((c) => (
                <CaseCard key={c.id} item={c} role={role} onOpen={() => setOpenCase(c)} onVideo={setPlayer} />
              ))}
            </motion.div>
          </section>

          <Editing onVideo={setPlayer} />
        </main>

        <Footer />

        <AnimatePresence>
          {openCase && (
            <CaseModal
              key="case"
              item={openCase}
              role={role}
              onClose={() => setOpenCase(null)}
              onVideo={setPlayer}
              onImage={(images, index) => setLightbox({ images, index })}
            />
          )}
          {lightbox && (
            <Lightbox
              key="lb"
              images={lightbox.images}
              index={lightbox.index}
              onClose={() => setLightbox(null)}
              onChange={(index) => setLightbox({ ...lightbox, index })}
            />
          )}
          {player && <PlayerModal key="player" video={player} onClose={() => setPlayer(null)} />}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

function Header({ roleId }) {
  const [open, setOpen] = useState(false);
  const items = navItems.filter((i) => !i.hideFor?.includes(roleId));
  const go = (id) => {
    setOpen(false);
    scrollToId(id);
  };
  return (
    <header className="fixed inset-x-0 top-0 z-30 px-3 pt-[max(14px,env(safe-area-inset-top))]">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2 md:px-5 md:py-2.5">
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          {items.map((i) => (
            <a key={i.id} href={`#${i.id}`} onClick={(e) => { e.preventDefault(); go(i.id); }} className="transition-colors hover:text-fg">
              {i.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Связаться со мной</span>
          <a href={`https://t.me/${person.telegram}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-black transition-transform hover:scale-105 active:scale-95">
            <Send size={14} /> Написать
          </a>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="glass-strong mx-auto mt-2 max-w-6xl rounded-[1.75rem] p-2 md:hidden"
          >
            {items.map((i, idx) => (
              <motion.button
                key={i.id}
                type="button"
                onClick={() => go(i.id)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="block w-full rounded-2xl px-4 py-3 text-left text-[17px] font-medium transition-colors active:bg-accent/40"
              >
                {i.label}
              </motion.button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function Home() {
  return (
    <section id="home" className="mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-center px-5 pb-16 pt-32 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="glass h-32 w-32 overflow-hidden rounded-full p-1.5 md:h-36 md:w-36 shadow-lg">
        <div className="h-full w-full overflow-hidden rounded-full">
          <img src={person.avatar} alt={person.short} className="h-full w-full scale-125 object-cover object-[center_20%]" />
        </div>
      </motion.div>
      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-8 text-sm font-medium text-muted">
        Личное портфолио Александра
      </motion.p>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="font-display mt-4 text-[2.75rem] font-semibold leading-[1.08] tracking-tight md:text-7xl">
        Здесь мои проекты, видео, цифры и то, как я работаю
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 max-w-xl text-lg text-muted">
        Листайте вниз: сначала расскажу, кто я, потом покажу, чем могу быть полезен.
      </motion.p>
      <motion.button
        type="button"
        onClick={() => scrollToId('about')}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="glass mt-10 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium transition-transform hover:scale-105 active:scale-95"
      >
        Познакомиться <ArrowDown size={16} className="animate-bounce" />
      </motion.button>
    </section>
  );
}

function About() {
  const chips = [
    [MapPin, `${person.age} лет, ${person.city}`],
    [Briefcase, 'Ищу удалённую работу, фулл-тайм 5/2'],
    [Plane, 'Готов к оплачиваемым командировкам'],
  ];
  return (
    <section id="about" className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-2 md:gap-16 md:py-28">
      <Reveal>
        <div className="mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[2.5rem] bg-line shadow-2xl shadow-black/10">
          <img src={person.about} alt={person.short} loading="lazy" className="h-full w-full object-cover object-top" />
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="text-sm font-medium text-muted">Кто я такой</p>
        <h2 className="font-display mt-2 text-4xl font-semibold md:text-5xl">Привет, я Александр</h2>
        <ul className="mt-6 flex flex-col gap-2">
          {chips.map(([Icon, t]) => (
            <li key={t} className="glass inline-flex w-fit items-center gap-2.5 rounded-full px-4 py-2 text-sm">
              <Icon size={15} /> {t}
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-fg/85">
          <p>С 2017 года мне интересны блогинг и видео. Ещё со школы я пробовал разные форматы: от роликов на YouTube и сериалов в Minecraft с кастингом актёров до съёмок настоящих видео и режиссуры.</p>
          <p>Люблю кино, насмотренность, визуал, моду и дизайн. Два года ходил в частную художественную арт-студию и готовился поступать на дизайн.</p>
          <p>В итоге выучился на маркетолога, и это изменило взгляд на видео: теперь я смотрю на него не только глазами режиссёра, но и через удержание, досмотры и поведение аудитории.</p>
          <p>С нейросетями (Gemini, Claude, ChatGPT, Antigravity) работаю активно, как с инструментом, который ускоряет рутину. Но вкус и смысл всегда остаются за человеком.</p>
        </div>
        <div className="glass mt-8 flex items-start gap-4 rounded-3xl p-5">
          <GraduationCap className="mt-1 shrink-0" size={24} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Моё образование</p>
            <p className="font-display mt-1 text-2xl font-semibold">Маркетинговая деятельность</p>
            <p className="mt-1 text-sm text-muted">Минский политехнический колледж, выпуск 2026</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Roles({ role, roleId, onChange }) {
  return (
    <section id="roles" className="mx-auto max-w-5xl px-5 py-20 md:py-28">
      <Reveal>
        <h2 className="font-display text-4xl font-semibold md:text-5xl">Вакансии, которые я рассматриваю</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted">Нажмите на ту, в которой я вам интересен как специалист.</p>
      </Reveal>

      <Reveal className="mt-8">
        <div role="tablist" aria-label="Выбор вакансии" className="glass grid grid-cols-2 gap-1 rounded-[1.75rem] p-1.5 md:grid-cols-4">
          {roleList.map((r) => (
            <button
              key={r.id}
              role="tab"
              aria-selected={roleId === r.id}
              onClick={() => onChange(r.id)}
              className="relative rounded-full px-4 py-3 text-[13px] font-medium leading-tight transition-colors md:text-sm"
            >
              {roleId === r.id && (
                <motion.span layoutId="role-pill" className="absolute inset-0 rounded-full bg-accent shadow-sm" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
              )}
              <span className={`relative ${roleId === r.id ? 'text-black' : 'text-muted'}`}>{r.label}</span>
            </button>
          ))}
        </div>
      </Reveal>

      <AnimatePresence mode="wait">
        <motion.div
          key={roleId}
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="glass mt-6 rounded-[2rem] p-7 md:p-10"
        >
          <p className="text-sm font-medium text-muted">Уровень: {role.level}</p>
          <h3 className="font-display mt-3 text-3xl font-semibold leading-tight md:text-4xl">{role.title}</h3>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fg/85">{role.text}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {role.skills.map((s) => (
              <li key={s} className="rounded-full bg-accent/60 px-4 py-2 text-sm font-medium">{s}</li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

/* Волнистые S-образные стрелки-соединители. Рисуются при скролле. */
const arrowProps = {
  fill: 'none',
  stroke: '#F5D77A',
  strokeOpacity: 0.9,
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};
const drawWave = {
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: { once: true, amount: 0.5 },
  transition: { duration: 0.65, ease: 'easeOut' },
};
const drawTip = {
  ...drawWave,
  transition: { duration: 0.25, ease: 'easeOut', delay: 0.5 },
};

function HorizontalArrow({ flip = false, className = '' }) {
  return (
    <svg
      viewBox="0 0 56 20"
      className={`h-5 w-14 overflow-visible ${className}`}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden
    >
      <motion.path d="M 3 10 C 12 1, 20 1, 28 10 C 36 19, 44 10, 51 10" {...arrowProps} {...drawWave} />
      <motion.path d="M 46 5 L 52 10 L 46 15" {...arrowProps} {...drawTip} />
    </svg>
  );
}

function VerticalArrow({ className = '' }) {
  return (
    <svg viewBox="0 0 24 56" className={`h-[52px] w-6 overflow-visible ${className}`} aria-hidden>
      <motion.path d="M 12 3 C 1.2 12, 1.2 20, 12 28 C 22.8 36, 12 44, 12 51" {...arrowProps} {...drawWave} />
      <motion.path d="M 6 45 L 12 52 L 18 45" {...arrowProps} {...drawTip} />
    </svg>
  );
}

/* Сетка змейкой: карточки и ячейки со стрелками в одной сетке, стрелки всегда вне карточек */
const cells = [
  { type: 'card', n: 0, pos: 'md:col-start-1 md:row-start-1' },
  { type: 'arrow', dir: 'right', pos: 'md:col-start-2 md:row-start-1' },
  { type: 'card', n: 1, pos: 'md:col-start-3 md:row-start-1' },
  { type: 'arrow', dir: 'right', pos: 'md:col-start-4 md:row-start-1' },
  { type: 'card', n: 2, pos: 'md:col-start-5 md:row-start-1' },
  { type: 'arrow', dir: 'down', pos: 'md:col-start-5 md:row-start-2' },
  { type: 'card', n: 3, pos: 'md:col-start-5 md:row-start-3' },
  { type: 'arrow', dir: 'left', pos: 'md:col-start-4 md:row-start-3' },
  { type: 'card', n: 4, pos: 'md:col-start-3 md:row-start-3' },
  { type: 'arrow', dir: 'left', pos: 'md:col-start-2 md:row-start-3' },
  { type: 'card', n: 5, pos: 'md:col-start-1 md:row-start-3' },
];

function Principles({ role }) {
  return (
    <section id="principles" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <Reveal>
        <h2 className="font-display text-4xl font-semibold md:text-5xl">Принцип работы</h2>
        <p className="mt-4 max-w-xl text-lg text-muted">{role.principlesSubtitle}</p>
      </Reveal>

      <AnimatePresence mode="wait">
        <motion.div
          key={role.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
          className="mt-14 grid grid-cols-1 md:grid-cols-[1fr_56px_1fr_56px_1fr] md:grid-rows-[auto_56px_auto]"
        >
          {cells.map((c, idx) => {
            if (c.type === 'card') {
              const p = role.principles[c.n];
              return (
                <div key={`c${c.n}`} className={`glass rounded-[2rem] p-6 md:p-7 ${c.pos}`}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-display text-lg font-semibold text-black">{c.n + 1}</span>
                  <h3 className="font-display mt-4 text-xl font-semibold leading-snug md:text-2xl">{p.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-fg/80">{p.text}</p>
                </div>
              );
            }
            return (
              <div key={`a${idx}`} className={`flex h-14 items-center justify-center ${c.pos}`}>
                <VerticalArrow className="md:hidden" />
                <span className="hidden md:block">
                  {c.dir === 'down' ? <VerticalArrow /> : <HorizontalArrow flip={c.dir === 'left'} />}
                </span>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
function CaseCard({ item, role, onOpen, onVideo }) {
  const cover = item.videos[0];
  const land = isLandscape(cover.src);
  return (
    <motion.article layout transition={{ type: 'spring', stiffness: 260, damping: 32 }} className="glass flex flex-col justify-between overflow-hidden rounded-[2rem]">
      <div className="flex h-full flex-col justify-between">
        <button
          type="button"
          onClick={() => onVideo(cover)}
          aria-label={`Смотреть: ${cover.title}`}
          className={`group relative block w-full overflow-hidden bg-gradient-to-b from-accent/25 to-line ${land ? 'aspect-video' : 'h-[20rem] sm:h-[24rem] md:h-[26rem]'}`}
        >
          <AutoVideo src={cover.src} className="h-full w-full object-contain" />
          <PlatformBadge platform={cover.platform} className="absolute left-4 top-4" />
          <span className="glass-dark absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full text-white transition-transform group-hover:scale-110">
            <Play size={16} fill="currentColor" />
          </span>
        </button>
        <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
          <div>
            <p className="text-sm text-muted">{item.period} · {item.role}</p>
            <h3 className="font-display mt-2 text-2xl font-semibold leading-tight md:text-3xl">{item.title}</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-fg/80">{item.summary}</p>
            <div className="mt-5">
              <RoleNote role={role} text={item.roleNotes[role.id]} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {item.metrics.slice(0, 3).map(([n, l]) => (
                <span key={l} className="rounded-full bg-accent/50 px-3 py-1.5 text-sm"><b className="font-semibold">{n}</b> <span className="text-muted">{l}</span></span>
              ))}
            </div>
          </div>
          <button type="button" onClick={onOpen} className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-medium transition-transform hover:translate-x-1">
            Открыть кейс <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function Editing({ onVideo }) {
  return (
    <section id="editing" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <Reveal>
        <h2 className="font-display text-4xl font-semibold md:text-5xl">Как я ещё умею монтировать</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Кроме разговорных роликов я собираю динамичные монтажи с графикой, цветом и эффектами. Каждый ролик показан в своём формате, можно кликнуть и посмотреть.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {editing.tools.map((t) => <li key={t} className="rounded-full bg-accent/60 px-4 py-2 text-sm font-medium">{t}</li>)}
        </ul>
      </Reveal>

      <div className="mt-10 columns-2 gap-4 md:columns-3">
        {editing.videos.map((v, i) => (
          <Reveal key={v.src} delay={(i % 3) * 0.06} className="mb-4 break-inside-avoid">
            <VideoThumb video={v} onOpen={onVideo} />
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">Ещё примеры монтажа в TikTok</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {editing.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-transform hover:scale-105">
              {l.label} <ArrowUpRight size={14} />
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  const items = [
    [Send, 'Telegram', `@${person.telegram}`, `https://t.me/${person.telegram}`],
    [Mail, 'Email', person.email, `mailto:${person.email}`],
  ];
  return (
    <footer id="contacts" className="mx-auto max-w-6xl px-5 pb-12 pt-10">
      <Reveal>
        <div className="glass rounded-[2.5rem] p-8 md:p-14">
          <h2 className="font-display text-4xl font-semibold md:text-5xl">Давайте сделаем что-нибудь вместе</h2>
          <p className="mt-4 max-w-lg text-lg text-muted">Проще всего написать в Telegram. Отвечаю быстро.</p>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {items.map(([Icon, label, value, href]) => (
              <a
                key={label}
                href={href}
                {...(href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                className="group rounded-3xl bg-accent/50 p-5 transition-transform hover:-translate-y-1"
              >
                <Icon size={20} />
                <p className="mt-4 text-sm text-muted">{label}</p>
                <p className="mt-1 break-all font-medium">{value}</p>
              </a>
            ))}
          </div>
        </div>
      </Reveal>
      <p className="mt-8 text-center text-sm text-muted">© 2026 {person.name}</p>
    </footer>
  );
}
