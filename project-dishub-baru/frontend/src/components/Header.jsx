import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { label: 'Beranda', path: '/' },
  { label: 'Tentang', path: '/tentang' },
  { label: 'Rute', path: '/rute' },
  { label: 'Fasilitas', path: '/fasilitas' },
  { label: 'Galeri', path: '/galeri' },
  { label: 'Berita', path: '/berita' },
  { label: 'FAQ', path: '/faq' },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const solid = isScrolled || location.pathname !== '/';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,padding,border-color] duration-300 ease-out ${
        solid
          ? 'border-b border-slate-200/80 bg-white/95 py-2.5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] backdrop-blur-md'
          : 'border-b border-transparent py-4'
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between gap-6">

          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Trans Koetaradja beranda">
            <img
              src="/trans-logo.png"
              alt="Trans Koetaradja"
              className={`h-10 w-auto object-contain transition-all duration-300 ${solid ? '' : 'brightness-0 invert'}`}
            />
            <span className="leading-none">
              <span className={`block text-[17px] font-extrabold tracking-[-0.03em] transition-colors duration-300 ${solid ? 'text-slate-900' : 'text-white'}`}>
                Trans
              </span>
              <span className={`block text-[17px] font-extrabold tracking-[-0.03em] transition-colors duration-300 ${solid ? 'text-sky-600' : 'text-sky-300'}`}>
                Koetaradja
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navigasi utama">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative inline-flex items-center rounded-lg px-3.5 py-2 text-[13.5px] font-semibold transition-colors duration-200 ${
                    active
                      ? solid
                        ? 'bg-sky-50 text-sky-700'
                        : 'bg-white/20 text-white'
                      : solid
                      ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-white/85 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {item.label}
                  <span
                    className={`pointer-events-none absolute inset-x-3 -bottom-px h-[2px] origin-center rounded-full bg-current transition-transform duration-300 ease-out ${
                      active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-2.5 lg:flex">
            <a
              href="https://wa.me/628116712349"
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-lg px-3.5 py-2 text-[13.5px] font-semibold transition-colors duration-200 ${
                solid ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' : 'text-white/85 hover:bg-white/15 hover:text-white'
              }`}
            >
              Hubungi
            </a>
            <Link
              to="/download"
              className="rounded-xl bg-sky-500 px-5 py-2.5 text-[13.5px] font-bold text-white transition-all duration-200 hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            >
              Download App
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={isMobileMenuOpen}
            className={`rounded-lg p-2.5 transition-colors duration-200 lg:hidden ${
              solid ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/15'
            }`}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="mx-5 mt-2.5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 sm:mx-8">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    active ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="my-2 h-px bg-slate-100" />
            <a
              href="https://wa.me/628116712349"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Hubungi
            </a>
            <div className="p-2">
              <Link
                to="/download"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-xl bg-sky-500 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-sky-600"
              >
                Download App
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
