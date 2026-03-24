import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Property, UserProfile, PropertyStatus } from '../types';
import { toast } from 'sonner';
import { 
  Users, 
  Home, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Loader2, 
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  user: UserProfile | null;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'properties' | 'users'>('properties');
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    setLoading(true);
    
    // Listen to properties
    const qProps = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
    const unsubProps = onSnapshot(qProps, (snapshot) => {
      setProperties(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property)));
      if (activeTab === 'properties') setLoading(false);
    });

    // Listen to users
    const qUsers = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
      if (activeTab === 'users') setLoading(false);
    });

    return () => {
      unsubProps();
      unsubUsers();
    };
  }, [user, navigate, activeTab]);

  const handleToggleBoost = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'properties', id), { isBoosted: !currentStatus });
      toast.success(currentStatus ? 'Impulsionamento removido' : 'Imóvel impulsionado');
    } catch (error) {
      toast.error('Erro ao atualizar impulsionamento');
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'properties', id), { isFeatured: !currentStatus });
      toast.success(currentStatus ? 'Destaque removido' : 'Imóvel destacado');
    } catch (error) {
      toast.error('Erro ao atualizar destaque');
    }
  };

  const handleUpdateStatus = async (id: string, status: PropertyStatus) => {
    try {
      await updateDoc(doc(db, 'properties', id), { status });
      toast.success(`Status atualizado para ${status}`);
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja apagar este imóvel permanentemente?')) return;
    try {
      await deleteDoc(doc(db, 'properties', id));
      toast.success('Imóvel apagado');
    } catch (error) {
      toast.error('Erro ao apagar imóvel');
    }
  };

  const handleToggleAdmin = async (uid: string, currentRole: string) => {
    if (uid === user?.uid) {
      toast.error('Você não pode remover seu próprio acesso de admin');
      return;
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      toast.success(`Usuário agora é ${newRole}`);
    } catch (error) {
      toast.error('Erro ao atualizar cargo');
    }
  };

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Home className="h-6 w-6 text-orange-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Total Imóveis</p>
            <h3 className="text-3xl font-black text-gray-900">{properties.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <Activity className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Total Usuários</p>
            <h3 className="text-3xl font-black text-gray-900">{users.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">Premium</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Impulsionados</p>
            <h3 className="text-3xl font-black text-gray-900">{properties.filter(p => p.isBoosted).length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-100 rounded-xl">
              <ShieldCheck className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Seguro</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Ativos</p>
            <h3 className="text-3xl font-black text-gray-900">{properties.filter(p => p.status === 'active').length}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        {/* Tabs and Search */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex bg-gray-50 p-1 rounded-2xl">
            <button 
              onClick={() => setActiveTab('properties')}
              className={cn(
                "px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center",
                activeTab === 'properties' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Home className="h-4 w-4 mr-2" />
              Imóveis
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={cn(
                "px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center",
                activeTab === 'users' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </button>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder={activeTab === 'properties' ? "Pesquisar imóveis..." : "Pesquisar usuários..."}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
              <p className="text-gray-500 font-medium">Carregando dados...</p>
            </div>
          ) : activeTab === 'properties' ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Imóvel</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Localização</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Preço</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Destaques</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={prop.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'} 
                          alt="" 
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{prop.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{prop.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{prop.city}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{formatCurrency(prop.price)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={prop.status || 'active'}
                        onChange={(e) => handleUpdateStatus(prop.id, e.target.value as PropertyStatus)}
                        className={cn(
                          "text-xs font-bold px-3 py-1.5 rounded-full border-none focus:ring-2 focus:ring-orange-500",
                          prop.status === 'active' ? "bg-green-100 text-green-700" :
                          prop.status === 'sold' ? "bg-red-100 text-red-700" :
                          prop.status === 'rented' ? "bg-purple-100 text-purple-700" :
                          "bg-yellow-100 text-yellow-700"
                        )}
                      >
                        <option value="active">Ativo</option>
                        <option value="sold">Vendido</option>
                        <option value="rented">Alugado</option>
                        <option value="pending">Pendente</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleToggleBoost(prop.id, !!prop.isBoosted)}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            prop.isBoosted ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-400 hover:bg-purple-50 hover:text-purple-400"
                          )}
                          title="Impulsionar"
                        >
                          <Zap className="h-4 w-4 fill-current" />
                        </button>
                        <button 
                          onClick={() => handleToggleFeatured(prop.id, !!prop.isFeatured)}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            prop.isFeatured ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400 hover:bg-orange-50 hover:text-orange-400"
                          )}
                          title="Destacar"
                        >
                          <ShieldCheck className="h-4 w-4 fill-current" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => navigate(`/imovel/${prop.id}`)}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                        >
                          <ArrowUpRight className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProperty(prop.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cargo</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}`} 
                          alt="" 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <p className="font-bold text-gray-900">{u.displayName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        u.role === 'admin' ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
                      )}>
                        {u.role === 'admin' ? <ShieldCheck className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
                        {u.role || 'user'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.isVerified ? (
                        <span className="flex items-center text-xs font-bold text-green-600">
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Verificado
                        </span>
                      ) : (
                        <span className="flex items-center text-xs font-bold text-gray-400">
                          <XCircle className="h-4 w-4 mr-1" /> Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleToggleAdmin(u.uid, u.role || 'user')}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                            u.role === 'admin' ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                          )}
                        >
                          {u.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
