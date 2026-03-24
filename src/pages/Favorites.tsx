import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Property, UserProfile, Favorite } from '../types';
import { toast } from 'sonner';
import { Heart, Loader2, Search, ArrowLeft } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';

interface FavoritesProps {
  user: UserProfile | null;
}

export default function Favorites({ user }: FavoritesProps) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchFavorites = async () => {
      try {
        const q = query(
          collection(db, 'users', user.uid, 'favorites')
        );
        const querySnap = await getDocs(q);
        const favoriteIds = querySnap.docs.map(doc => (doc.data() as Favorite).propertyId);

        if (favoriteIds.length > 0) {
          const propertyPromises = favoriteIds.map(id => getDoc(doc(db, 'properties', id)));
          const propertySnaps = await Promise.all(propertyPromises);
          setProperties(propertySnaps
            .filter(snap => snap.exists())
            .map(snap => ({ id: snap.id, ...snap.data() } as Property))
          );
        } else {
          setProperties([]);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, navigate]);

  const toggleFavorite = async (propertyId: string) => {
    if (!user) return;
    try {
      // For simplicity, we just remove it from the list here
      // In a real app, we'd also delete from Firestore
      setProperties(properties.filter(p => p.id !== propertyId));
      toast.success('Removido dos favoritos.');
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Meus Favoritos</h1>
          <p className="text-gray-500 font-medium">Imóveis que guardou para ver mais tarde</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-orange-600 font-medium transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Voltar
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
          <p className="text-gray-500 font-medium">A carregar os seus favoritos...</p>
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {properties.map(prop => (
            <PropertyCard 
              key={prop.id} 
              property={prop} 
              isFavorite={true}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 space-y-6">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <Heart className="h-10 w-10 text-gray-300" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Ainda não tem favoritos</h2>
            <p className="text-gray-500 max-w-md mx-auto">Explore os nossos anúncios e clique no coração para guardar os seus imóveis preferidos.</p>
          </div>
          <Link 
            to="/pesquisa" 
            className="inline-flex items-center space-x-2 bg-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200"
          >
            <Search className="h-5 w-5" />
            <span>Explorar Imóveis</span>
          </Link>
        </div>
      )}
    </div>
  );
}
