import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { LookbookItem } from '../data/studioData';
import { X, ArrowRight, Sparkles, Scissors, Clock, Sliders } from 'lucide-react';

export const LookbookPage: React.FC = () => {
  const { lookbook, navigateTo, toggleSelectService, setSelectedServiceIds, services, setIsStyleFinderOpen } = useStudio();
  const [activeFilter, setActiveFilter] = useState<string>('Todos');
  const [inspectedItem, setInspectedItem] = useState<LookbookItem | null>(null);

  const categories = ['Todos', 'Skin Fades', 'Tapers & Caída', 'Texturizados', 'Platinados & Buzz', 'Barba & Perfilado'];

  const filteredItems = activeFilter === 'Todos'
    ? lookbook
    : lookbook.filter((item) => item.category === activeFilter);

  const handleBookFromLookbook = (serviceName: string) => {
    const matched = services.find((s) => 
      s.name.toLowerCase().includes(serviceName.toLowerCase()) || 
      serviceName.toLowerCase().includes(s.name.toLowerCase())
    );
    if (matched) {
      setSelectedServiceIds([matched.id]);
    } else if (services.length > 0) {
      setSelectedServiceIds([services[0].id]);
    }
    setInspectedItem(null);
    navigateTo('booking');
  };

  return (
    <div className="py-8 md:py-16 max-w-[1360px] mx-auto px-4 sm:px-6 space-y-12">
      
      {/* Title & Filter Intro */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#222432]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#D4FF00] font-bold block mb-1">
            PORTFOLIO URBANO · FOTOS REALES
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Lookbook &amp; Cortes de Autor
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <p className="text-xs font-mono text-zinc-400 max-w-[42ch]">
            Cada foto incluye ficha técnica con número de guías, shaver utilizado, tijera y producto de fijación diario.
          </p>
          <button
            onClick={() => setIsStyleFinderOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#181A24] border border-[#2D3040] text-xs font-semibold text-zinc-200 hover:border-[#D4FF00] hover:text-[#D4FF00] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span>Asesor de Corte</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
              activeFilter === cat
                ? 'bg-[#D4FF00] text-black shadow-md'
                : 'bg-[#14151E] border border-[#232532] text-zinc-400 hover:text-white hover:border-zinc-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Men's Street Cuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <article
            key={item.id}
            onClick={() => setInspectedItem(item)}
            className="group relative rounded-xl overflow-hidden border border-[#232532] bg-[#12131A] h-[440px] cursor-pointer flex flex-col justify-end transition-all hover:border-zinc-500"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
            />
            
            <div className="relative z-10 bg-gradient-to-t from-black/95 via-black/55 to-transparent p-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#D4FF00]">
                <span className="font-bold">{item.category}</span>
                <span className="text-zinc-400">{item.executionTime}</span>
              </div>
              <h2 className="font-display text-2xl text-white font-bold leading-snug">
                {item.title}
              </h2>
              <p className="text-xs text-zinc-300 font-mono">
                {item.guardSpec}
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="truncate max-w-[24ch]">{item.productApplied}</span>
                <span className="text-[#D4FF00] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Ver Ficha &rarr;
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Inspection Modal */}
      {inspectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-4xl bg-[#12131A] text-white border border-[#2B2D3D] rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* Image Column */}
            <div className="md:col-span-6 bg-black min-h-[300px]">
              <img
                src={inspectedItem.imageUrl}
                alt={inspectedItem.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Technical Sheet Column */}
            <div className="md:col-span-6 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#222432]">
                  <span className="font-mono text-xs font-bold text-[#D4FF00]">
                    FICHA TÉCNICA · {inspectedItem.category.toUpperCase()}
                  </span>
                  <button
                    onClick={() => setInspectedItem(null)}
                    className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5"
                    aria-label="Cerrar modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-3">
                  {inspectedItem.title}
                </h3>

                <div className="space-y-3.5 text-xs font-mono">
                  <div className="pb-2.5 border-b border-[#20222D]">
                    <span className="text-zinc-500 uppercase block text-[10px] mb-0.5">Servicio Correspondiente</span>
                    <span className="text-sm font-bold text-white">{inspectedItem.servicePerformed}</span>
                  </div>

                  <div className="pb-2.5 border-b border-[#20222D]">
                    <span className="text-zinc-500 uppercase block text-[10px] mb-0.5">Graduación de Guías &amp; Navaja</span>
                    <span className="text-zinc-200">{inspectedItem.guardSpec}</span>
                  </div>

                  <div className="pb-2.5 border-b border-[#20222D]">
                    <span className="text-zinc-500 uppercase block text-[10px] mb-0.5">Herramientas en Sillón</span>
                    <span className="text-zinc-200">{inspectedItem.toolsUsed}</span>
                  </div>

                  <div className="pb-2.5 border-b border-[#20222D]">
                    <span className="text-zinc-500 uppercase block text-[10px] mb-0.5">Producto de Styling Recomendado</span>
                    <span className="text-[#D4FF00] font-semibold">{inspectedItem.productApplied}</span>
                  </div>

                  <div>
                    <span className="text-zinc-500 uppercase block text-[10px] mb-0.5">Criterio del Barbero</span>
                    <p className="text-zinc-300 font-sans leading-relaxed text-xs">
                      {inspectedItem.authorNote}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#222432] flex items-center justify-between gap-3">
                <button
                  onClick={() => setInspectedItem(null)}
                  className="px-4 py-2.5 text-xs font-mono border border-[#2B2D3D] rounded-xl text-zinc-400 hover:text-white"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => handleBookFromLookbook(inspectedItem.servicePerformed)}
                  className="flex-1 py-2.5 text-xs font-mono font-black uppercase tracking-wider bg-[#D4FF00] text-black rounded-xl hover:bg-[#bde400] transition-colors text-center"
                >
                  Quiero este corte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
