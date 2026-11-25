import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div>
      <p className="text-[13px] font-medium text-ink-muted">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Halaman tidak ditemukan</h1>
      <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-ink-muted">
        Alamat yang kamu buka tidak ada. Kembali ke Beranda untuk melanjutkan.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-control bg-accent px-4 text-sm font-semibold text-paper"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
