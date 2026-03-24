import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import { Property } from '../types';
import PropertyCard from '../components/PropertyCard';
import { Search, Filter, SlidersHorizontal, MapPin, Building, LandPlot, Bed, X, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import SaveSearchButton from '../components/SaveSearchButton';

const CITIES = ['Maputo', 'Matola', 'Beira', 'Nampula', 'Tete', 'Quelimane', 'Pemba', 'Xai-Xai'];
const CATEGORIES = [
  { id: 'casa', name: 'Casas', icon: Building },
  { id: 'quarto', name: 'Quartos', icon: Bed },
  { id: 'terreno', name: 'Terrenos', icon: LandPlot },
  { id: 'escritorio', name: 'Escritórios', icon: Building },
];

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastPropertyElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchProperties(true);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  // Filter states
  const [type, setType] = useState(searchParams.get('type') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'recent');

  useEffect(() => {
    fetchProperties();
  }, [searchParams, type, category, city, minPrice, maxPrice, sortBy]);

  const fetchProperties = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setProperties([]);
      setLastDoc(null);
    }

    try {
      const pageSize = 24;
      let q = query(
        collection(db, 'properties'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      if (isLoadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      // Apply filters
      if (type) q = query(q, where('type', '==', type));
      if (category) q = query(q, where('category', '==', category));
      if (city) q = query(q, where('city', '==', city));

      const querySnap = await getDocs(q);
      const lastVisible = querySnap.docs[querySnap.docs.length - 1];
      setLastDoc(lastVisible || null);
      setHasMore(querySnap.docs.length === pageSize);

      let results = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));

      // Client-side filtering for price
      if (minPrice) results = results.filter(p => p.price >= Number(minPrice));
      if (maxPrice) results = results.filter(p => p.price <= Number(maxPrice));

      // Client-side sorting
      if (sortBy === 'price_asc') {
        results.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
        results.sort((a, b) => b.price - a.price);
      }

      // Search term filtering
      const searchTerm = searchParams.get('q')?.toLowerCase();
      if (searchTerm) {
        results = results.filter(p => 
          p.title.toLowerCase().includes(searchTerm) || 
          p.description?.toLowerCase().includes(searchTerm)
        );
      }

      if (isLoadMore) {
        setProperties(prev => [...prev, ...results]);
      } else {
        setProperties(results);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    fetchProperties(true);
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    if (type) params.set('type', type); else params.delete('type');
    if (category) params.set('category', category); else params.delete('category');
    if (city) params.set('city', city); else params.delete('city');
    if (minPrice) params.set('minPrice', minPrice); else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice); else params.delete('maxPrice');
    if (sortBy) params.set('sortBy', sortBy); else params.delete('sortBy');
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setType('');
    setCategory('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('recent');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Resultados da Pesquisa
          </h1>
          <p className="text-gray-500 font-medium">
            {properties.length} {properties.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative hidden sm:block">
            <select 
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                const params = new URLSearchParams(searchParams);
                params.set('sortBy', e.target.value);
                setSearchParams(params);
              }}
              className="appearance-none bg-white border border-gray-200 text-gray-700 px-6 py-3 pr-10 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 hover:border-orange-200 transition-all cursor-pointer"
            >
              <option value="recent">Mais Recentes</option>
              <option value="price_asc">Preço: Menor para Maior</option>
              <option value="price_desc">Preço: Maior para Menor</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all border",
              showFilters ? "bg-orange-600 text-white border-orange-600" : "bg-white text-gray-700 border-gray-200 hover:border-orange-200"
            )}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span>Filtros</span>
          </button>

          <SaveSearchButton 
            criteria={{
              q: searchParams.get('q') || undefined,
              type: type || undefined,
              category: category || undefined,
              city: city || undefined,
              minPrice: minPrice ? Number(minPrice) : undefined,
              maxPrice: maxPrice ? Number(maxPrice) : undefined,
            }} 
          />
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="">Todos</option>
                  <option value="venda">Venda</option>
                  <option value="aluguel_mensal">Aluguel Mensal</option>
                  <option value="aluguel_diario">Aluguel Diário</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Categoria</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="">Todas</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Cidade</label>
                <select 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="">Todas</option>
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Preço Mínimo</label>
                <input 
                  type="number" 
                  value={minPrice} 
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="MZN"
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Preço Máximo</label>
                <input 
                  type="number" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="MZN"
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2 sm:hidden">
                <label className="text-xs font-bold text-gray-500 uppercase">Ordenar por</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="recent">Mais Recentes</option>
                  <option value="price_asc">Preço: Menor para Maior</option>
                  <option value="price_desc">Preço: Maior para Menor</option>
                </select>
              </div>

              <div className="md:col-span-3 lg:col-span-5 flex justify-end space-x-4 pt-4 border-t border-gray-50">
                <button 
                  onClick={clearFilters}
                  className="px-6 py-3 text-gray-500 font-bold hover:text-red-600 transition-colors"
                >
                  Limpar Tudo
                </button>
                <button 
                  onClick={applyFilters}
                  className="bg-orange-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
          <p className="text-gray-500 font-medium">A carregar imóveis...</p>
        </div>
      ) : properties.length > 0 ? (
        <div className="space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {properties.map((prop, index) => {
              if (properties.length === index + 1) {
                return (
                  <div ref={lastPropertyElementRef} key={prop.id}>
                    <PropertyCard property={prop} />
                  </div>
                );
              } else {
                return <PropertyCard key={prop.id} property={prop} />;
              }
            })}
          </div>

          {loadingMore && (
            <div className="flex justify-center pt-8">
              <div className="flex items-center space-x-2 text-orange-600 font-bold">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>A carregar mais imóveis...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 space-y-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Nenhum imóvel encontrado</h2>
            <p className="text-gray-500 max-w-md mx-auto">Tente ajustar os seus filtros ou pesquisar por outros termos para encontrar o que procura.</p>
          </div>
          <button 
            onClick={clearFilters}
            className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all"
          >
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
}
