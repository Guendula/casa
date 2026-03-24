import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Property, UserProfile, PropertyStatus } from '../types';
import { toast } from 'sonner';
import { Home, PlusCircle, Loader2 } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import BoostModal from '../components/BoostModal';

interface MyPropertiesProps {
  user: UserProfile | null;
}

export default function MyProperties({ user }: MyPropertiesProps) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [boostModal, setBoostModal] = useState<{ isOpen: boolean; propertyId: string; propertyTitle: string }>({
    isOpen: false,
    propertyId: '',
    propertyTitle: '',
  });

  const fetchMyProperties = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'properties'),
        where('ownerUid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnap = await getDocs(q);
      setProperties(querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property)));
    } catch (error) {
      console.error('Error fetching my properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchMyProperties();
  }, [user, navigate]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja apagar este anúncio?')) return;

    try {
      await deleteDoc(doc(db, 'properties', id));
      setProperties(properties.filter(p => p.id !== id));
      toast.success('Anúncio apagado com sucesso!');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Erro ao apagar anúncio.');
    }
  };

  const handleStatusChange = async (id: string, status: PropertyStatus) => {
    try {
      await updateDoc(doc(db, 'properties', id), { status });
      setProperties(properties.map(p => p.id === id ? { ...p, status } : p));
      toast.success(`Status atualizado para ${status === 'sold' ? 'Vendido' : status === 'rented' ? 'Alugado' : 'Ativo'}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status.');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Meus Anúncios</h1>
          <p className="text-gray-500 font-medium">Gerencie os seus imóveis publicados</p>
        </div>
        <Link 
          to="/publicar" 
          className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Novo Anúncio</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
          <p className="text-gray-500 font-medium">A carregar os seus anúncios...</p>
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map(prop => (
            <PropertyCard 
              key={prop.id}
              property={prop}
              onEdit={(id) => navigate(`/editar/${id}`)}
              onDelete={handleDelete}
              onBoost={(id) => setBoostModal({ isOpen: true, propertyId: id, propertyTitle: prop.title })}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 space-y-6">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <Home className="h-10 w-10 text-gray-300" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Ainda não tem anúncios</h2>
            <p className="text-gray-500 max-w-md mx-auto">Comece a vender ou alugar os seus imóveis hoje mesmo na maior plataforma de Moçambique.</p>
          </div>
          <Link 
            to="/publicar" 
            className="inline-flex items-center space-x-2 bg-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Publicar Primeiro Anúncio</span>
          </Link>
        </div>
      )}

      <BoostModal 
        isOpen={boostModal.isOpen}
        onClose={() => setBoostModal({ ...boostModal, isOpen: false })}
        propertyId={boostModal.propertyId}
        propertyTitle={boostModal.propertyTitle}
        onSuccess={fetchMyProperties}
      />
    </div>
  );
}
