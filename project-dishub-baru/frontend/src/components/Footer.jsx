import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Clock3, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { settingsAPI } from '@/lib/api';

const quickLinks = [
  { label: 'Beranda', to: '/' },
  { label: 'Tentang Kami', to: '/tentang' },
  { label: 'Rute & Koridor', to: '/rute' },
  { label: 'Fasilitas', to: '/fasilitas' },
  { label: 'Galeri', to: '/galeri' },
  { label: 'Berita', to: '/berita' },
  { label: 'FAQ', to: '/faq' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [contact, setContact] = useState(null);
  const [social, setSocial] = useState(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([settingsAPI.getContact(), settingsAPI.getSocialMedia()])
      .then(([contactRes, socialRes]) => {
        if (!mounted) return;
        setContact(contactRes.data);
        setSocial(socialRes.data);
      })
      .catch((error) => console.error('Failed to fetch footer data:', error));
    return () => { mounted = false; };
  }, []);

  const address = contact?.address || 'Jl. T. Panglima Nyak Makam No. 12, Banda Aceh, Aceh 23116';
  const phone = contact?.phone || '+62 811 6712349';
  const email = contact?.email || 'info@transkutaradja.acehprov.go.id';
  const hours = contact?.operational_hours || '06:00 - 18:00 WIB (Setiap Hari)';
  const whatsapp = social?.whatsapp || `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;
  const socials = [
    { label: 'Facebook', href: social?.facebook, icon: Facebook },
    { label: 'Instagram', href: social?.instagram, icon: Instagram },
    { label: 'X', href: social?.twitter, icon: Twitter },
    { label: 'WhatsApp', href: whatsapp, icon: MessageCircle },
  ].filter((item) => item.href);

  return (
    <footer className="relative overflow-hidden bg-[#091321] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-8 lg:px-10 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_0.8fr_1.35fr_1fr] lg:gap-14">
          <section className="max-w-sm">
            <Link to="/" className="group inline-flex items-center gap-3.5" aria-label="Trans Koetaradja beranda">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-400/10 p-2 transition-colors group-hover:border-sky-300/40 group-hover:bg-sky-400/15">
                <img src="/trans-logo.png" alt="" className="h-full w-full object-contain brightness-0 invert" />
              </span>
              <span className="leading-none">
                <span className="block text-[17px] font-extrabold tracking-[-0.03em] text-white">Trans</span>
                <span className="block text-[17px] font-extrabold tracking-[-0.03em] text-sky-300">Koetaradja</span>
              </span>
            </Link>
            <p className="mt-5 text-[14px] font-semibold leading-6 text-slate-100">
              Transportasi publik modern, nyaman, dan 100% gratis untuk seluruh warga Aceh.
            </p>
            <p className="mt-3 max-w-xs text-[13px] leading-6 text-slate-300">
              Layanan mobilitas terpadu yang dikelola oleh Dinas Perhubungan Aceh dan disubsidi penuh APBA Pemerintah Aceh.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Layanan publik Aceh
            </div>
          </section>

          <nav aria-label="Menu cepat">
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">Navigasi</p>
            <ul className="grid grid-cols-2 gap-x-5 gap-y-3 lg:grid-cols-1">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="group inline-flex items-center gap-2 text-[13px] font-medium text-slate-300 transition-colors hover:text-white">
                    <span className="h-px w-0 bg-sky-300 transition-all duration-200 group-hover:w-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section>
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">Kontak kami</p>
            <div className="space-y-4 text-[13px] leading-5 text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="mt-[2px] h-[17px] w-[17px] shrink-0 text-sky-300" strokeWidth={1.8} />
                <span>{address}</span>
              </div>
              <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-3 transition-colors hover:text-white">
                <Phone className="h-[17px] w-[17px] shrink-0 text-sky-300" strokeWidth={1.8} />
                <span>{phone}</span>
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-3 break-all transition-colors hover:text-white">
                <Mail className="h-[17px] w-[17px] shrink-0 text-sky-300" strokeWidth={1.8} />
                <span>{email}</span>
              </a>
              <div className="flex items-center gap-3">
                <Clock3 className="h-[17px] w-[17px] shrink-0 text-sky-300" strokeWidth={1.8} />
                <span>{hours}</span>
              </div>
            </div>
          </section>

          <section>
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">Ikuti kami</p>
            <p className="max-w-xs text-[13px] leading-6 text-slate-300">Dapatkan informasi rute, jadwal, dan kabar terbaru Trans Koetaradja.</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {socials.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.08] text-slate-200 transition-all hover:-translate-y-0.5 hover:border-sky-300/60 hover:bg-sky-300/20 hover:text-white">
                  <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
                </a>
              ))}
            </div>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-6 flex w-full items-center justify-between gap-3 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-3 text-[13px] font-semibold text-slate-100 transition-all hover:border-sky-300/50 hover:bg-sky-300/15 hover:text-white">
              <span className="flex items-center gap-2.5">
                <MessageCircle className="h-[17px] w-[17px] text-sky-300" strokeWidth={1.8} />
                Layanan Aspirasi
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
            </a>
          </section>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Trans Koetaradja · Dinas Perhubungan Aceh</p>
          <p className="font-medium text-slate-300">Didukung oleh <span className="text-sky-300">APBA Pemerintah Aceh</span></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
