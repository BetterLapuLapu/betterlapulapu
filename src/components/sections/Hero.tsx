import { useEffect, useRef, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import HeroIllustration from './HeroIllustration';

// How far down the sun drifts (in SVG units) while the statue scrolls up,
// so it reads as further away.
const SUN_DRIFT = 220;
// Share of the hero the statue's feet stop above, clear of the bottom fade.
const FEET_CLEARANCE = 0.1;

// Home page banner: a blue band with the title and site
// search, and the Lapu-Lapu statue sketch on the right.
export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<SVGSVGElement>(null);
  const sunRef = useRef<SVGGElement>(null);

  // The statue starts at half body and scrolls down to the feet as the hero
  // scrolls out of view.
  useEffect(() => {
    const hero = heroRef.current;
    const art = artRef.current;
    const sun = sunRef.current;
    if (!hero || !art || !sun) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const heroHeight = hero.offsetHeight;
      const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
      const travel =
        art.getBoundingClientRect().height - heroHeight * (1 - FEET_CLEARANCE);
      art.style.transform = `translate3d(0, ${-progress * travel}px, 0)`;
      sun.style.transform = `translateY(${progress * SUN_DRIFT}px)`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  // The search page reads the query from ?q= and loads the results itself.
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = String(new FormData(e.currentTarget).get('q') ?? '').trim();
    navigate(
      query ? `/search?${new URLSearchParams({ q: query })}` : '/search'
    );
  };

  return (
    <div
      ref={heroRef}
      className="relative overflow-hidden bg-primary-600 py-[30px] text-white tablet:pt-[50px] tablet:pb-[55px] lg:min-h-[520px]"
    >
      {/* Statue shown from the head down to the waist; the rest is revealed
          on scroll. The bottom edge fades out instead of cutting hard. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage: 'linear-gradient(to bottom, black 75%, transparent)',
        }}
      >
        <HeroIllustration
          ref={artRef}
          sunRef={sunRef}
          className="absolute top-0 -right-24 h-[175%] w-auto text-white opacity-20 will-change-transform md:right-0 lg:right-[max(4%,calc((100%-1140px)/2))] lg:opacity-60"
        />
      </div>
      <div className="width-container relative">
        <p className="type-lead mb-2.5">{t('hero.welcome')}</p>
        <h1 className="type-xl mb-[15px] tablet:mb-5">
          {import.meta.env.VITE_GOVERNMENT_NAME}
        </h1>
        <p className="type-lead max-w-[640px]">{t('hero.subtitle')}</p>

        <form
          role="search"
          className="mt-[30px] max-w-[640px] tablet:mt-[35px]"
          onSubmit={handleSearch}
        >
          <label htmlFor="hero-search" className="type-s mb-[5px] block">
            {t('hero.searchLabel')}
          </label>
          <div id="hero-search-hint" className="type-body mb-[15px]">
            {t('hero.searchPlaceholder')}
          </div>
          <div className="flex">
            <input
              id="hero-search"
              name="q"
              type="search"
              aria-describedby="hero-search-hint"
              className="type-body h-[50px] min-w-0 flex-1 rounded-none border-2 border-r-0 border-ink bg-white px-2.5 text-ink"
            />
            <button
              type="submit"
              aria-label={t('hero.searchLabel')}
              className="flex h-[50px] w-[50px] shrink-0 cursor-pointer items-center justify-center bg-go text-white hover:bg-go-hover"
            >
              <Search className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
