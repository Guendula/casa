import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Heart, Star, Zap, Edit2, Trash2, CheckCircle2, Home } from 'lucide-react';
import { Property, PropertyStatus } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { useState } from 'react';
import { motion } from 'motion/react';

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onBoost?: (id: string) => void;
  onStatusChange?: (id: string, status: PropertyStatus) => void;
}

export default function PropertyCard({ 
  property, 
  isFavorite = false, 
  onToggleFavorite,
  onEdit,
  onDelete,
  onBoost,
  onStatusChange
}: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const typeLabel = {
    venda: 'Venda',
    aluguel_mensal: 'Aluguel Mensal',
    aluguel_diario: 'Aluguel Diário',
  }[property.type];

  const typeColor = {
    venda: 'bg-blue-100 text-blue-700',
    aluguel_mensal: 'bg-green-100 text-green-700',
    aluguel_diario: 'bg-orange-100 text-orange-700',
  }[property.type];

  const statusLabel = {
    active: 'Ativo',
    sold: 'Vendido',
    rented: 'Alugado',
    pending: 'Pendente',
  }[property.status || 'active'];

  const statusColor = {
    active: 'bg-green-500 text-white',
    sold: 'bg-red-500 text-white',
    rented: 'bg-purple-500 text-white',
    pending: 'bg-yellow-500 text-gray-900',
  }[property.status || 'active'];

  return (
    <motion.div 
      className={cn(
        "group bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1",
        property.isBoosted 
          ? "border-purple-500 ring-2 ring-purple-100 shadow-purple-100 bg-gradient-to-br from-purple-50/60 to-white hover:shadow-purple-200/50" 
          : "border-gray-100"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/imovel/${property.id}`} className="block relative aspect-[4/3] overflow-hidden">
        <img 
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'} 
          alt={property.title}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500",
            isHovered ? "scale-110" : "scale-100"
          )}
          referrerPolicy="no-referrer"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <span className={cn("px-3 py-1 rounded-full text-xs font-bold shadow-sm border", typeColor, property.isBoosted ? "border-purple-200" : "border-transparent")}>
              {typeLabel}
            </span>
            {property.status && property.status !== 'active' && (
              <span className={cn("px-3 py-1 rounded-full text-xs font-bold shadow-sm border", statusColor, property.isBoosted ? "border-purple-200" : "border-transparent")}>
                {statusLabel}
              </span>
            )}
            {property.isBoosted && (
              <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm animate-pulse border border-purple-400">
                <Zap className="h-3 w-3 mr-1 fill-current" /> Impulsionado
              </span>
            )}
          </div>
          {property.isFeatured && (
            <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm w-fit border border-orange-400">
              <Star className="h-3 w-3 mr-1 fill-current animate-pulse" /> Destaque
            </span>
          )}
        </div>

        {/* Top Actions Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          {onToggleFavorite && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite?.(property.id);
              }}
              className={cn(
                "p-2 rounded-full backdrop-blur-md transition-all shadow-sm",
                isFavorite ? "bg-red-500 text-white" : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
              )}
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
            </button>
          )}

          {/* Management Actions (Hover only) */}
          {(onEdit || onDelete || onBoost) && (
            <div className={cn(
              "flex flex-col gap-2 transition-all duration-300",
              isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
            )}>
              {onBoost && !property.isBoosted && (
                <button 
                  onClick={(e) => { e.preventDefault(); onBoost(property.id); }}
                  className="p-2 bg-purple-600 rounded-full shadow-sm text-white hover:bg-purple-700 transition-colors"
                  title="Impulsionar"
                >
                  <Zap className="h-4 w-4" />
                </button>
              )}
              {onEdit && (
                <button 
                  onClick={(e) => { e.preventDefault(); onEdit(property.id); }}
                  className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm text-gray-600 hover:text-orange-600 transition-colors"
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={(e) => { e.preventDefault(); onDelete(property.id); }}
                  className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm text-gray-600 hover:text-red-600 transition-colors"
                  title="Apagar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              {onStatusChange && (
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={(e) => { e.preventDefault(); onStatusChange(property.id, property.status === 'sold' ? 'active' : 'sold'); }}
                    className={cn(
                      "p-2 rounded-full shadow-sm transition-colors",
                      property.status === 'sold' ? "bg-red-600 text-white" : "bg-white/90 backdrop-blur-md text-gray-600 hover:text-red-600"
                    )}
                    title={property.status === 'sold' ? "Marcar como Ativo" : "Marcar como Vendido"}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.preventDefault(); onStatusChange(property.id, property.status === 'rented' ? 'active' : 'rented'); }}
                    className={cn(
                      "p-2 rounded-full shadow-sm transition-colors",
                      property.status === 'rented' ? "bg-orange-600 text-white" : "bg-white/90 backdrop-blur-md text-gray-600 hover:text-orange-600"
                    )}
                    title={property.status === 'rented' ? "Marcar como Ativo" : "Marcar como Alugado"}
                  >
                    <Home className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Price Overlay */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t to-transparent",
          property.isBoosted ? "from-purple-900/80" : "from-black/70"
        )}>
          <div className="text-white font-bold text-xl flex items-center gap-2">
            {property.isBoosted && <Zap className="h-4 w-4 text-purple-300 fill-current" />}
            {formatCurrency(property.price)}
            {property.type === 'aluguel_diario' && <span className="text-sm font-normal text-gray-300"> / noite</span>}
            {property.type === 'aluguel_mensal' && <span className="text-sm font-normal text-gray-300"> / mês</span>}
          </div>
        </div>
      </Link>

      <div className="p-5 space-y-3">
        <div className="flex items-center text-gray-500 text-xs font-medium uppercase tracking-wider">
          <MapPin className={cn("h-3 w-3 mr-1", property.isBoosted ? "text-purple-500" : "text-orange-500")} />
          {property.city}
        </div>
        
        <Link to={`/imovel/${property.id}`}>
          <h3 className={cn(
            "text-lg font-bold line-clamp-1 transition-colors flex items-center gap-2",
            property.isBoosted ? "text-purple-900 hover:text-purple-700" : "text-gray-900 hover:text-orange-600"
          )}>
            {property.isBoosted && <Zap className="h-4 w-4 text-purple-600 fill-current shrink-0" />}
            {property.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-gray-600 text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center" title="Quartos">
              <Bed className={cn("h-4 w-4 mr-1", property.isBoosted ? "text-purple-400" : "text-gray-400")} />
              <span>{property.bedrooms || 0}</span>
            </div>
            <div className="flex items-center" title="Casas de Banho">
              <Bath className={cn("h-4 w-4 mr-1", property.isBoosted ? "text-purple-400" : "text-gray-400")} />
              <span>{property.bathrooms || 0}</span>
            </div>
            <div className="flex items-center" title="Área">
              <Square className={cn("h-4 w-4 mr-1", property.isBoosted ? "text-purple-400" : "text-gray-400")} />
              <span>{property.area || 0}m²</span>
            </div>
          </div>
        </div>

        {/* Management Actions Footer */}
        {(onEdit || onDelete || onBoost || onStatusChange) && (
          <div className="pt-4 mt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
            {onBoost && !property.isBoosted && (
              <button 
                onClick={(e) => { e.preventDefault(); onBoost(property.id); }}
                className="col-span-2 flex items-center justify-center space-x-2 bg-purple-600 text-white py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-sm mb-1"
              >
                <Zap className="h-4 w-4 fill-current animate-pulse" />
                <span>Impulsionar Anúncio</span>
              </button>
            )}
            {onEdit && (
              <button 
                onClick={(e) => { e.preventDefault(); onEdit(property.id); }}
                className="flex items-center justify-center space-x-2 bg-gray-50 text-gray-700 py-2 rounded-xl font-bold hover:bg-gray-100 transition-all border border-gray-100"
              >
                <Edit2 className="h-4 w-4" />
                <span>Editar</span>
              </button>
            )}
            {onDelete && (
              <button 
                onClick={(e) => { e.preventDefault(); onDelete(property.id); }}
                className="flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-2 rounded-xl font-bold hover:bg-red-100 transition-all border border-red-100"
              >
                <Trash2 className="h-4 w-4" />
                <span>Apagar</span>
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
