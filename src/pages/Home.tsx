import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Home as HomeIcon, MapPin, Building, LandPlot, Bed, ArrowRight, Star, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, limit, getDocs, orderBy, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import { Property } from '../types';
import PropertyCard from '../components/PropertyCard';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const CATEGORIES = [
  { id: 'casa', name: 'Casas', icon: HomeIcon, color: 'bg-blue-100 text-blue-600' },
  { id: 'quarto', name: 'Quartos', icon: Bed, color: 'bg-orange-100 text-orange-600' },
  { id: 'terreno', name: 'Terrenos', icon: LandPlot, color: 'bg-green-100 text-green-600' },
  { id: 'escritorio', name: 'Escritórios', icon: Building, color: 'bg-purple-100 text-purple-600' },
];

const CITIES = ['Maputo', 'Matola', 'Beira', 'Nampula', 'Tete', 'Quelimane', 'Pemba', 'Xai-Xai'];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [recentLoadingMore, setRecentLoadingMore] = useState(false);
  const [recentLastDoc, setRecentLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [recentHasMore, setRecentHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastRecentElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || recentLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && recentHasMore) {
        fetchRecentProperties(true);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, recentLoadingMore, recentHasMore]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          fetchFeaturedProperties(),
          fetchRecentProperties()
        ]);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const pageSize = 8;
      const featuredQuery = query(
        collection(db, 'properties'),
        where('isFeatured', '==', true),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      const featuredSnap = await getDocs(featuredQuery);
      const newProperties = featuredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      setFeaturedProperties(newProperties);
    } catch (error) {
      console.error('Error fetching featured properties:', error);
    }
  };

  const fetchRecentProperties = async (isLoadMore = false) => {
    if (isLoadMore) setRecentLoadingMore(true);
    
    try {
      const pageSize = 8;
      let recentQuery = query(
        collection(db, 'properties'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      if (isLoadMore && recentLastDoc) {
        recentQuery = query(recentQuery, startAfter(recentLastDoc));
      }

      const recentSnap = await getDocs(recentQuery);
      const lastVisible = recentSnap.docs[recentSnap.docs.length - 1];
      setRecentLastDoc(lastVisible || null);
      setRecentHasMore(recentSnap.docs.length === pageSize);

      const newProperties = recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      
      if (isLoadMore) {
        setRecentProperties(prev => [...prev, ...newProperties]);
      } else {
        setRecentProperties(newProperties);
      }
    } catch (error) {
      console.error('Error fetching recent properties:', error);
    } finally {
      setRecentLoadingMore(false);
    }
  };

  const loadMoreRecent = () => {
    if (recentLoadingMore || !recentHasMore) return;
    fetchRecentProperties(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('q', searchTerm);
    if (selectedCity) params.append('city', selectedCity);
    navigate(`/pesquisa?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80" 
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl w-full px-4 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
              Encontre o seu próximo lar em <span className="text-orange-500">Moçambique</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
              A maior plataforma de compra, venda e aluguel de imóveis do país. Simples, rápido e seguro.
            </p>
          </motion.div>

          <motion.form 
            onSubmit={handleSearch}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-2"
          >
            <div className="flex-grow w-full flex items-center px-4 border-b md:border-b-0 md:border-r border-gray-100">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <input 
                type="text" 
                placeholder="O que procura? (ex: Casa T3, Terreno...)"
                className="w-full py-4 focus:outline-none text-gray-700 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48 flex items-center px-4">
              <MapPin className="h-5 w-5 text-gray-400 mr-3" />
              <select 
                className="w-full py-4 focus:outline-none text-gray-700 font-medium bg-transparent appearance-none cursor-pointer"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">Todas Cidades</option>
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <button 
              type="submit"
              className="w-full md:w-auto bg-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200"
            >
              Pesquisar
            </button>
          </motion.form>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Categorias Populares</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/pesquisa?category=${cat.id}`}
              className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all text-center"
            >
              <div className={cn("w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", cat.color)}>
                <cat.icon className="h-7 w-7" />
              </div>
              <span className="font-bold text-gray-800">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <section className="bg-orange-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-600 p-2 rounded-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Imóveis em Destaque</h2>
                  <p className="text-gray-600 text-sm">As melhores oportunidades selecionadas para si</p>
                </div>
              </div>
              <Link to="/pesquisa?featured=true" className="text-orange-600 font-bold flex items-center hover:underline">
                Ver todos <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProperties.map(prop => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Properties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Adicionados Recentemente</h2>
              <p className="text-gray-600 text-sm">Novas listagens publicadas hoje</p>
            </div>
          </div>
          <Link to="/pesquisa" className="text-blue-600 font-bold flex items-center hover:underline">
            Ver todos <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentProperties.map((prop, index) => {
                if (recentProperties.length === index + 1) {
                  return (
                    <div ref={lastRecentElementRef} key={prop.id}>
                      <PropertyCard property={prop} />
                    </div>
                  );
                } else {
                  return <PropertyCard key={prop.id} property={prop} />;
                }
              })}
            </div>

            {recentLoadingMore && (
              <div className="flex justify-center">
                <div className="flex items-center space-x-2 text-orange-600 font-bold">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>A carregar mais recentes...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Stats / Why Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="text-4xl font-extrabold text-orange-500">10k+</div>
              <div className="text-lg font-medium text-gray-300">Imóveis Listados</div>
            </div>
            <div className="space-y-4">
              <div className="text-4xl font-extrabold text-orange-500">50k+</div>
              <div className="text-lg font-medium text-gray-300">Usuários Mensais</div>
            </div>
            <div className="space-y-4">
              <div className="text-4xl font-extrabold text-orange-500">100%</div>
              <div className="text-lg font-medium text-gray-300">Seguro e Verificado</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white space-y-4 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold">Quer vender ou alugar o seu imóvel?</h2>
            <p className="text-orange-100 text-lg">Publique o seu anúncio em menos de 2 minutos e alcance milhares de interessados em todo o país.</p>
          </div>
          <Link 
            to="/publicar" 
            className="bg-white text-orange-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-orange-50 transition-all shadow-xl hover:scale-105"
          >
            Anunciar Agora
          </Link>
        </div>
      </section>
    </div>
  );
}
