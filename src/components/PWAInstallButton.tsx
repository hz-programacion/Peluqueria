import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, WifiOff, CheckCircle2 } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';
import { useStudio } from '../context/StudioContext';
import { RetroRiverCrestBadge } from './RetroPaperBanda';

interface PWAInstallButtonProps {
  variant?: 'header' | 'drawer' | 'footer';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { config } = useStudio();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Automatically suppress when already running as an installed standalone PWA
  if (isInstalled) {
    return null;
  }

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowGuideModal(true);
      }
      return;
    }
    setShowGuideModal(true);
  };

  const buttonClasses =
    variant === 'drawer'
      ? 'w-full py-2.5 px-4 rounded border border-[#9E2A2B]/50 bg-[#FAF6EE] hover:border-[#9E2A2B] text-[#181512] font-mono text-xs uppercase tracking-[0.14em] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer'
      : variant === 'footer'
        ? 'inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-[#9E2A2B] bg-[#FAF6EE] hover:bg-[#9E2A2B] hover:text-[#FAF6EE] text-xs font-mono font-semibold text-[#9E2A2B] transition-colors shadow-2xs cursor-pointer'
        : 'hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded border border-[#C8BBA4] bg-[#FAF6EE] hover:border-[#9E2A2B] text-[11px] font-mono font-semibold uppercase tracking-[0.12em] text-[#181512] hover:text-[#9E2A2B] transition-colors cursor-pointer shrink-0';

  return (
    <>
      <button
        type="button"
        onClick={handleTriggerInstall}
        data-testid={`pwa-install-btn-${variant}`}
        title={`Instalar acceso directo a ${config.studioTitle || 'Rodrigo Cutsss'}`}
        className={buttonClasses}
      >
        <Download className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0" />
        <span>Instalar App</span>
      </button>

      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#181512]/75 backdrop-blur-xs p-4"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border-2 border-[#C5B79F] bg-[#FAF6EE] text-[#181512] p-6 sm:p-7 shadow-[0_24px_60px_rgba(24,21,18,0.3)] relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle top River Plate carmine rule */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#9E2A2B]" />

            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#D8CCB8]">
              <div className="flex items-center gap-3">
                <RetroRiverCrestBadge size="md" />
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#9E2A2B] font-semibold block">
                    Acceso Directo Oficial · PWA
                  </span>
                  <h3
                    id="pwa-guide-modal-title"
                    className="font-display text-xl sm:text-2xl font-bold text-[#181512] leading-tight"
                  >
                    Instalá {config.studioTitle || 'Rodrigo Cutsss'} en tu Celular
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="Cerrar guía de instalación"
                className="w-8 h-8 rounded border border-[#C8BBA4] bg-[#F3ECE0] hover:border-[#9E2A2B] flex items-center justify-center text-[#181512] cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs sm:text-sm text-[#4F463B]">
              <p className="leading-relaxed">
                Agregá el escudo de <strong className="text-[#181512]">{config.studioTitle}</strong>{' '}
                a tu pantalla de inicio para reservar turnos en 3 toques, consultar tu ticket aún
                sin señal y ver la carta actualizada.
              </p>

              {isInstallable && (
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await install();
                    if (ok) setShowGuideModal(false);
                  }}
                  className="w-full py-3 px-4 rounded bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] font-mono text-xs uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-2 shadow-[0_3px_0_#5E1516] cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar Aplicación Ahora</span>
                </button>
              )}

              <div className="space-y-3">
                {/* iOS Safari Instructions */}
                <div
                  className={`p-3.5 rounded-lg border ${
                    isIOS
                      ? 'border-[#9E2A2B] bg-[#9E2A2B]/[0.06]'
                      : 'border-[#D8CCB8] bg-[#F3ECE0]/70'
                  }`}
                >
                  <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#181512] mb-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>En iPhone / iPad (Safari):</span>
                  </div>
                  <ol className="space-y-1.5 text-xs text-[#4F463B] list-decimal list-inside">
                    <li>
                      Tocá el botón <strong className="text-[#181512]">Compartir</strong>{' '}
                      <Share className="w-3 h-3 inline text-[#9E2A2B]" /> en la barra inferior de
                      Safari.
                    </li>
                    <li>
                      Deslizá hacia abajo y elegí{' '}
                      <strong className="text-[#181512]">“Agregar a Inicio”</strong>{' '}
                      <PlusSquare className="w-3 h-3 inline text-[#9E2A2B]" />.
                    </li>
                  </ol>
                </div>

                {/* Android / Chrome / Desktop Instructions */}
                <div
                  className={`p-3.5 rounded-lg border ${
                    !isIOS
                      ? 'border-[#9E2A2B] bg-[#9E2A2B]/[0.06]'
                      : 'border-[#D8CCB8] bg-[#F3ECE0]/70'
                  }`}
                >
                  <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#181512] mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>En Android / Chrome / Computadora:</span>
                  </div>
                  <ol className="space-y-1.5 text-xs text-[#4F463B] list-decimal list-inside">
                    <li>
                      Tocá el menú del navegador <strong className="text-[#181512]">(⋮)</strong>{' '}
                      arriba a la derecha o el ícono de descarga en la barra de direcciones.
                    </li>
                    <li>
                      Seleccioná{' '}
                      <strong className="text-[#181512]">“Instalar aplicación”</strong> o{' '}
                      <strong className="text-[#181512]">“Agregar a la pantalla principal”</strong>.
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#D8CCB8] flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 rounded border border-[#C8BBA4] bg-[#F3ECE0] hover:border-[#9E2A2B] font-mono text-xs font-semibold text-[#181512] cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      data-testid="pwa-offline-indicator"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-lg border border-[#9E2A2B] bg-[#181512] px-3.5 py-2 text-xs font-mono font-semibold text-[#FAF6EE] shadow-xl"
    >
      <WifiOff className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0" />
      <span>Modo sin conexión · Mostrando datos guardados de Rodrigo Cutsss</span>
    </div>
  );
};
