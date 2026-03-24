import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserProfile, SavedSearch } from '../types';
import { toast } from 'sonner';
import { User, Mail, Phone, ShieldCheck, Camera, Loader2, Save, LogOut, ArrowRight, ShieldAlert, Bell, Trash2, Search as SearchIcon, CheckCircle2, X, Facebook, Instagram, Twitter, Linkedin, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';
import { signOut } from 'firebase/auth';
import { motion } from 'motion/react';

interface ProfileProps {
  user: UserProfile | null;
}

export default function Profile({ user }: ProfileProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    phoneNumber: user?.phoneNumber || '',
    socialMedia: {
      facebook: user?.socialMedia?.facebook || '',
      instagram: user?.socialMedia?.instagram || '',
      twitter: user?.socialMedia?.twitter || '',
      linkedin: user?.socialMedia?.linkedin || '',
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  
  // Phone Verification Simulation State
  const [isVerifying, setIsVerifying] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(user?.isVerified || false);

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      setFormData({
        displayName: user.displayName,
        phoneNumber: user.phoneNumber || '',
        socialMedia: {
          facebook: user.socialMedia?.facebook || '',
          instagram: user.socialMedia?.instagram || '',
          twitter: user.socialMedia?.twitter || '',
          linkedin: user.socialMedia?.linkedin || '',
        }
      });

      // Listen to saved searches
      const q = query(
        collection(db, 'saved_searches'),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setSavedSearches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedSearch)));
      });

      return () => unsubscribe();
    }
  }, [user, navigate]);

  const handleDeleteSearch = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'saved_searches', id));
      toast.success('Alerta de pesquisa removido.');
    } catch (error) {
      console.error('Error deleting search:', error);
      toast.error('Erro ao remover alerta.');
    }
  };

  const handleSendCode = () => {
    if (!formData.phoneNumber) {
      toast.error('Insira um número de telefone primeiro.');
      return;
    }
    
    setIsVerifying(true);
    // Simulate API call delay
    setTimeout(() => {
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(mockCode);
      setShowCodeInput(true);
      setIsVerifying(false);
      // In a real app, this would be sent via SMS
      toast.info(`[SIMULAÇÃO] Código enviado: ${mockCode}`, { duration: 10000 });
    }, 1500);
  };

  const handleVerifyCode = async () => {
    if (inputCode === verificationCode) {
      setLoading(true);
      try {
        if (user) {
          await updateDoc(doc(db, 'users', user.uid), {
            isVerified: true,
            updatedAt: serverTimestamp(),
          });
          setIsPhoneVerified(true);
          setShowCodeInput(false);
          toast.success('Telefone verificado com sucesso!');
        }
      } catch (error) {
        console.error('Error verifying phone:', error);
        toast.error('Erro ao atualizar estado de verificação.');
      } finally {
        setLoading(false);
      }
    } else {
      toast.error('Código incorreto. Tente novamente.');
    }
  };

  const validateSocialUrl = (url: string, platform: string) => {
    if (!url) return '';
    const regexes: Record<string, RegExp> = {
      facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.]+\/?$/,
      instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/,
      twitter: /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9._]+\/?$/,
      linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+\/?$/,
    };
    
    if (!regexes[platform].test(url)) {
      return `URL de ${platform.charAt(0).toUpperCase() + platform.slice(1)} inválida`;
    }
    return '';
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    // Validate all social media fields
    const newErrors: Record<string, string> = {};
    Object.entries(formData.socialMedia).forEach(([platform, url]) => {
      const error = validateSocialUrl(url, platform);
      if (error) newErrors[platform] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, corrija os erros nas redes sociais');
      setLoading(false);
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        socialMedia: formData.socialMedia,
        updatedAt: serverTimestamp(),
      });
      setErrors({});
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
      toast.success('Sessão terminada.');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao sair.');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Profile Sidebar */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center space-y-6">
            <div className="relative inline-block">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                alt={user.displayName}
                className="h-32 w-32 rounded-full border-4 border-orange-100 mx-auto"
              />
              <button className="absolute bottom-1 right-1 bg-orange-600 text-white p-2 rounded-full shadow-lg hover:bg-orange-700 transition-all">
                <Camera className="h-5 w-5" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.displayName}</h2>
              <p className="text-gray-500 font-medium">{user.email}</p>
            </div>
            <div className={cn(
              "inline-flex items-center px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider",
              user.isVerified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}>
              {user.isVerified ? (
                <><ShieldCheck className="h-4 w-4 mr-2" /> Conta Verificada</>
              ) : (
                <><ShieldAlert className="h-4 w-4 mr-2" /> Não Verificada</>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 space-y-2">
            {user.role === 'admin' && (
              <button 
                onClick={() => navigate('/admin')}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 transition-all group text-purple-700"
              >
                <div className="flex items-center">
                  <LayoutDashboard className="h-5 w-5 mr-3" />
                  <span className="font-bold">Painel de Admin</span>
                </div>
                <ArrowRight className="h-5 w-5 text-purple-400 group-hover:text-purple-700" />
              </button>
            )}
            <button 
              onClick={() => navigate('/meus-imoveis')}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-orange-50 transition-all group"
            >
              <span className="font-bold text-gray-700">Meus Anúncios</span>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600" />
            </button>
            <button 
              onClick={() => navigate('/favoritos')}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-orange-50 transition-all group"
            >
              <span className="font-bold text-gray-700">Favoritos</span>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600" />
            </button>
            <hr className="my-2 border-gray-100" />
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-red-50 transition-all group text-red-600"
            >
              <span className="font-bold">Sair da Conta</span>
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <div className="flex-grow w-full">
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Definições de Perfil</h1>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Email (Não editável)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="email" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl border border-gray-100 text-gray-500 cursor-not-allowed"
                    value={user.email}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Telemóvel</label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      type="tel" 
                      placeholder="+258 8X XXX XXXX"
                      className={cn(
                        "w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all",
                        isPhoneVerified && "border-green-200 bg-green-50"
                      )}
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      disabled={isPhoneVerified}
                    />
                    {isPhoneVerified && (
                      <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                    )}
                  </div>
                  {!isPhoneVerified && !showCodeInput && (
                    <button 
                      type="button"
                      onClick={handleSendCode}
                      disabled={isVerifying || !formData.phoneNumber}
                      className="bg-gray-900 text-white px-6 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                      {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verificar'}
                    </button>
                  )}
                </div>
                
                {showCodeInput && !isPhoneVerified && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-6 bg-orange-50 rounded-2xl border border-orange-100 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold text-orange-900">Insira o código de 6 dígitos</p>
                      <button 
                        type="button" 
                        onClick={() => setShowCodeInput(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="000000"
                        className="flex-grow p-4 bg-white rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:outline-none text-center text-2xl font-black tracking-widest"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                      />
                      <button 
                        type="button"
                        onClick={handleVerifyCode}
                        className="bg-orange-600 text-white px-8 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
                      >
                        Validar
                      </button>
                    </div>
                    <p className="text-xs text-orange-700">O código foi enviado para {formData.phoneNumber}</p>
                  </motion.div>
                )}
                <p className="text-xs text-gray-400">O seu número será usado para contactos de interessados.</p>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-6">
                <h3 className="text-lg font-bold text-gray-900">Redes Sociais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Facebook</label>
                    <div className="relative">
                      <Facebook className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5", errors.facebook ? "text-red-400" : "text-gray-400")} />
                      <input 
                        type="url" 
                        placeholder="https://facebook.com/seu-perfil"
                        className={cn(
                          "w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl border focus:ring-2 focus:outline-none transition-all",
                          errors.facebook ? "border-red-200 focus:ring-red-500" : "border-gray-100 focus:ring-orange-500"
                        )}
                        value={formData.socialMedia.facebook}
                        onChange={(e) => {
                          setFormData({ ...formData, socialMedia: { ...formData.socialMedia, facebook: e.target.value } });
                          if (errors.facebook) setErrors({ ...errors, facebook: '' });
                        }}
                      />
                    </div>
                    {errors.facebook && <p className="text-[10px] font-bold text-red-500 uppercase ml-1">{errors.facebook}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Instagram</label>
                    <div className="relative">
                      <Instagram className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5", errors.instagram ? "text-red-400" : "text-gray-400")} />
                      <input 
                        type="url" 
                        placeholder="https://instagram.com/seu-perfil"
                        className={cn(
                          "w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl border focus:ring-2 focus:outline-none transition-all",
                          errors.instagram ? "border-red-200 focus:ring-red-500" : "border-gray-100 focus:ring-orange-500"
                        )}
                        value={formData.socialMedia.instagram}
                        onChange={(e) => {
                          setFormData({ ...formData, socialMedia: { ...formData.socialMedia, instagram: e.target.value } });
                          if (errors.instagram) setErrors({ ...errors, instagram: '' });
                        }}
                      />
                    </div>
                    {errors.instagram && <p className="text-[10px] font-bold text-red-500 uppercase ml-1">{errors.instagram}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Twitter</label>
                    <div className="relative">
                      <Twitter className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5", errors.twitter ? "text-red-400" : "text-gray-400")} />
                      <input 
                        type="url" 
                        placeholder="https://twitter.com/seu-perfil"
                        className={cn(
                          "w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl border focus:ring-2 focus:outline-none transition-all",
                          errors.twitter ? "border-red-200 focus:ring-red-500" : "border-gray-100 focus:ring-orange-500"
                        )}
                        value={formData.socialMedia.twitter}
                        onChange={(e) => {
                          setFormData({ ...formData, socialMedia: { ...formData.socialMedia, twitter: e.target.value } });
                          if (errors.twitter) setErrors({ ...errors, twitter: '' });
                        }}
                      />
                    </div>
                    {errors.twitter && <p className="text-[10px] font-bold text-red-500 uppercase ml-1">{errors.twitter}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">LinkedIn</label>
                    <div className="relative">
                      <Linkedin className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5", errors.linkedin ? "text-red-400" : "text-gray-400")} />
                      <input 
                        type="url" 
                        placeholder="https://linkedin.com/in/seu-perfil"
                        className={cn(
                          "w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl border focus:ring-2 focus:outline-none transition-all",
                          errors.linkedin ? "border-red-200 focus:ring-red-500" : "border-gray-100 focus:ring-orange-500"
                        )}
                        value={formData.socialMedia.linkedin}
                        onChange={(e) => {
                          setFormData({ ...formData, socialMedia: { ...formData.socialMedia, linkedin: e.target.value } });
                          if (errors.linkedin) setErrors({ ...errors, linkedin: '' });
                        }}
                      />
                    </div>
                    {errors.linkedin && <p className="text-[10px] font-bold text-red-500 uppercase ml-1">{errors.linkedin}</p>}
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Save className="h-6 w-6 mr-2" />}
                Guardar Alterações
              </button>
            </form>
          </div>

          {/* Saved Searches Section */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 space-y-6 mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-orange-600" /> Alertas de Pesquisa
              </h2>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                {savedSearches.length} Ativos
              </span>
            </div>
            
            <p className="text-sm text-gray-500">
              Você receberá notificações quando novos imóveis corresponderem a estes critérios.
            </p>

            {savedSearches.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <SearchIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">Nenhum alerta de pesquisa configurado.</p>
                <button 
                  onClick={() => navigate('/pesquisa')}
                  className="mt-4 text-orange-600 text-sm font-bold hover:underline"
                >
                  Ir para Pesquisa
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedSearches.map((search) => (
                  <div key={search.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-orange-200 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {search.name}
                      </h4>
                      <button 
                        onClick={() => handleDeleteSearch(search.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {search.criteria.type && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-1 rounded-md border border-gray-100 text-gray-500">
                          {search.criteria.type}
                        </span>
                      )}
                      {search.criteria.city && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-1 rounded-md border border-gray-100 text-gray-500">
                          {search.criteria.city}
                        </span>
                      )}
                      {search.criteria.minPrice && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-1 rounded-md border border-gray-100 text-gray-500">
                          Min: {search.criteria.minPrice} MZN
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        const params = new URLSearchParams();
                        Object.entries(search.criteria).forEach(([key, value]) => {
                          if (value) params.set(key, String(value));
                        });
                        navigate(`/pesquisa?${params.toString()}`);
                      }}
                      className="mt-4 w-full text-center py-2 text-xs font-bold text-gray-600 hover:text-orange-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-orange-100"
                    >
                      Ver Resultados Atuais
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
