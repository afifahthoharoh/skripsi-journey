import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Share } from 'lucide-react';

export const PWAInstallButton: React.FC<{ className?: string; compact?: boolean }> = ({
  className = '',
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If running in standalone mode (installed app), hide the install button
  if (isInstalled) {
    return null;
  }

  // Handle click for native install prompt or guide fallback
  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-2 px-3 py-2 bg-[#d4af37] hover:bg-[#c59b27] text-[#081c15] font-bold rounded-xl text-xs transition shadow-sm border border-[#e6cb78] ${className}`}
        title="Simpan ke Layar Utama HP / Laptop tanpa perlu buka browser"
      >
        <Smartphone className="w-4 h-4 shrink-0 text-[#081c15]" />
        <span>{compact ? 'Install App' : 'Simpan ke Layar Utama (App)'}</span>
      </button>

      {/* Manual Installation Guide Modal (for iOS or browsers without native auto-prompt) */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-emerald-100 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#2d6a4f]" />
                <h3 className="font-serif font-bold text-base text-[#081c15]">Cara Simpan Aplikasi</h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              {isIOS ? (
                <div className="space-y-2 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                  <p className="font-bold text-[#1b4332] flex items-center gap-1.5">
                    <Share className="w-4 h-4 text-[#2d6a4f]" /> Pengguna iPhone / iPad (Safari):
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
                    <li>
                      Tekan tombol <strong>Bagikan (Share)</strong> <Share className="w-3.5 h-3.5 inline text-slate-600" /> di bagian bawah browser Safari.
                    </li>
                    <li>
                      Gulir ke bawah lalu pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.
                    </li>
                    <li>
                      Tekan <strong>Tambah (Add)</strong> di sudut kanan atas.
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-2 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                  <p className="font-bold text-[#1b4332] flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-[#2d6a4f]" /> Android & Laptop (Chrome / Edge):
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
                    <li>
                      Tekan titik tiga <strong>(⋮)</strong> di sudut kanan atas browser.
                    </li>
                    <li>
                      Pilih <strong>"Install aplikasi"</strong> atau <strong>"Tambahkan ke layar utama"</strong>.
                    </li>
                    <li>Aplikasi akan muncul langsung di menu HP / Desktop kamu!</li>
                  </ol>
                </div>
              )}

              <p className="text-[11px] text-slate-500 italic">
                Setelah disimpan, kamu dan 2 teman sekelompokmu dapat membuka Skripsi Journey secara langsung seperti aplikasi HP tanpa repot buka browser!
              </p>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-[#2f3e33] hover:bg-[#1b4332] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 text-[#d4af37]" /> Mengerti, Mengerti!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
