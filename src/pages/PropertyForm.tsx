import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, updateDoc, doc, getDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Property, UserProfile, SavedSearch } from '../types';
import { toast } from 'sonner';
import { Camera, MapPin, Home, Building, LandPlot, Bed, Bath, Square, ArrowLeft, Loader2, Plus, X, Video, Image as ImageIcon, Trash2, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const propertySchema = z.object({
  title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres').max(100),
  description: z.string().min(20, 'A descrição deve ter pelo menos 20 caracteres'),
  price: z.number().min(1, 'O preço deve ser maior que zero'),
  type: z.enum(['venda', 'aluguel_mensal', 'aluguel_diario']),
  category: z.enum(['casa', 'quarto', 'terreno', 'escritorio']),
  city: z.string().min(1, 'Selecione uma cidade'),
  bedrooms: z.number().min(0).default(0),
  bathrooms: z.number().min(0).default(0),
  area: z.number().min(0).default(0),
  videoUrl: z.string().url('Insira um URL válido').optional().or(z.literal('')),
  status: z.enum(['active', 'sold', 'rented', 'pending']),
});

interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  type: 'venda' | 'aluguel_mensal' | 'aluguel_diario';
  category: 'casa' | 'quarto' | 'terreno' | 'escritorio';
  city: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  videoUrl?: string;
  status: 'active' | 'sold' | 'rented' | 'pending';
}

const CITIES = ['Maputo', 'Matola', 'Beira', 'Nampula', 'Tete', 'Quelimane', 'Pemba', 'Xai-Xai'];

interface PropertyFormProps {
  user: UserProfile | null;
  isEditing?: boolean;
}

export default function PropertyForm({ user, isEditing = false }: PropertyFormProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: 'venda',
      category: 'casa',
      status: 'active',
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
    }
  });

  useEffect(() => {
    if (!user) {
      toast.error('Faça login para publicar um anúncio.');
      navigate('/');
      return;
    }

    if (isEditing && id) {
      const fetchProperty = async () => {
        try {
          const docSnap = await getDoc(doc(db, 'properties', id));
          if (docSnap.exists()) {
            const data = docSnap.data() as Property;
            if (data.ownerUid !== user.uid) {
              toast.error('Não tem permissão para editar este anúncio.');
              navigate('/');
              return;
            }
            setValue('title', data.title);
            setValue('description', data.description || '');
            setValue('price', data.price);
            setValue('type', data.type);
            setValue('category', data.category);
            setValue('city', data.city);
            setValue('bedrooms', data.bedrooms || 0);
            setValue('bathrooms', data.bathrooms || 0);
            setValue('area', data.area || 0);
            setValue('videoUrl', data.videoUrl || '');
            setValue('status', data.status || 'active');
            setImages(data.images || []);
          }
        } catch (error) {
          console.error('Error fetching property:', error);
        }
      };
      fetchProperty();
    }
  }, [id, isEditing, navigate, setValue, user]);

  const onSubmit = async (data: PropertyFormData) => {
    if (!user) return;
    if (images.length === 0) {
      toast.error('Adicione pelo menos uma imagem.');
      return;
    }

    setLoading(true);
    try {
      let finalVideoUrl = data.videoUrl || '';

      if (videoFile) {
        const storageRef = ref(storage, `properties/videos/${user.uid}_${Date.now()}_${videoFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, videoFile);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setVideoUploadProgress(progress);
            },
            (error) => {
              console.error('Video upload error:', error);
              toast.error('Erro ao carregar vídeo.');
              reject(error);
            },
            async () => {
              finalVideoUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(null);
            }
          );
        });
      }

      const propertyData = {
        ...data,
        videoUrl: finalVideoUrl,
        ownerUid: user.uid,
        ownerName: user.displayName,
        ownerPhoto: user.photoURL || '',
        images,
        updatedAt: serverTimestamp(),
      };

      if (isEditing && id) {
        await updateDoc(doc(db, 'properties', id), propertyData);
        toast.success('Anúncio atualizado com sucesso!');
      } else {
        const docRef = await addDoc(collection(db, 'properties'), {
          ...propertyData,
          createdAt: serverTimestamp(),
          isFeatured: false,
          isBoosted: false,
        });
        toast.success('Anúncio publicado com sucesso!');
        
        // Check saved searches and notify users
        checkSavedSearches(propertyData, docRef.id);
      }
      navigate('/meus-imoveis');
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Erro ao salvar anúncio.');
    } finally {
      setLoading(false);
    }
  };

  const checkSavedSearches = async (newProperty: any, propertyId: string) => {
    try {
      const savedSearchesSnap = await getDocs(collection(db, 'saved_searches'));
      const savedSearches = savedSearchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedSearch));

      for (const search of savedSearches) {
        // Don't notify the owner
        if (search.uid === user?.uid) continue;

        const { criteria } = search;
        let isMatch = true;

        if (criteria.type && criteria.type !== newProperty.type) isMatch = false;
        if (criteria.category && criteria.category !== newProperty.category) isMatch = false;
        if (criteria.city && criteria.city !== newProperty.city) isMatch = false;
        if (criteria.minPrice && newProperty.price < criteria.minPrice) isMatch = false;
        if (criteria.maxPrice && newProperty.price > criteria.maxPrice) isMatch = false;
        if (criteria.q && !newProperty.title.toLowerCase().includes(criteria.q.toLowerCase()) && !newProperty.description?.toLowerCase().includes(criteria.q.toLowerCase())) isMatch = false;

        if (isMatch) {
          await addDoc(collection(db, 'users', search.uid, 'notifications'), {
            uid: search.uid,
            title: 'Novo Imóvel Encontrado!',
            message: `Um novo imóvel correspondente à sua pesquisa "${search.name}" foi publicado: ${newProperty.title}`,
            link: `/imovel/${propertyId}`,
            isRead: false,
            createdAt: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      console.error('Error checking saved searches:', error);
    }
  };

  const addImage = () => {
    if (newImageUrl && !images.includes(newImageUrl)) {
      setImages([...images, newImageUrl]);
      setNewImageUrl('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (!images.includes(base64String)) {
          setImages(prev => [...prev, base64String]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (!images.includes(base64String)) {
          setImages(prev => [...prev, base64String]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const isMp4 = file.type === 'video/mp4';
    const isUnder20MB = file.size <= 20 * 1024 * 1024; // 20MB

    if (!isMp4) {
      toast.error('Apenas vídeos MP4 são permitidos.');
      return;
    }

    if (!isUnder20MB) {
      toast.error('O vídeo deve ter no máximo 20MB.');
      return;
    }

    setVideoFile(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-orange-600 font-medium transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Voltar
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {isEditing ? 'Editar Anúncio' : 'Publicar Novo Anúncio'}
        </h1>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Home className="h-5 w-5 mr-2 text-orange-600" /> Informações Básicas
          </h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 uppercase">Título do Anúncio</label>
              <input 
                {...register('title')}
                placeholder="Ex: Casa T3 na Sommerschield"
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase">Tipo de Negócio</label>
                <select 
                  {...register('type')}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all appearance-none"
                >
                  <option value="venda">Venda</option>
                  <option value="aluguel_mensal">Aluguel Mensal</option>
                  <option value="aluguel_diario">Aluguel Diário (Airbnb)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase">Categoria</label>
                <select 
                  {...register('category')}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all appearance-none"
                >
                  <option value="casa">Casa</option>
                  <option value="quarto">Quarto</option>
                  <option value="terreno">Terreno</option>
                  <option value="escritorio">Escritório</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase">Preço (MZN)</label>
                <input 
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase">Cidade</label>
                <select 
                  {...register('city')}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all appearance-none"
                >
                  <option value="">Selecione a cidade</option>
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase">Status do Imóvel</label>
                <select 
                  {...register('status')}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all appearance-none"
                >
                  <option value="active">Ativo</option>
                  <option value="sold">Vendido</option>
                  <option value="rented">Alugado</option>
                  <option value="pending">Pendente</option>
                </select>
                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase flex items-center">
                  <Bed className="h-4 w-4 mr-1" /> Quartos
                </label>
                <input 
                  type="number"
                  {...register('bedrooms', { valueAsNumber: true })}
                  placeholder="0"
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                />
                {errors.bedrooms && <p className="text-red-500 text-xs mt-1">{errors.bedrooms.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase flex items-center">
                  <Bath className="h-4 w-4 mr-1" /> Casas de Banho
                </label>
                <input 
                  type="number"
                  {...register('bathrooms', { valueAsNumber: true })}
                  placeholder="0"
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                />
                {errors.bathrooms && <p className="text-red-500 text-xs mt-1">{errors.bathrooms.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase flex items-center">
                  <Square className="h-4 w-4 mr-1" /> Área (m²)
                </label>
                <input 
                  type="number"
                  {...register('area', { valueAsNumber: true })}
                  placeholder="0"
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                />
                {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 uppercase">Descrição Detalhada</label>
              <textarea 
                {...register('description')}
                rows={6}
                placeholder="Descreva o imóvel, características, localização exata..."
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all resize-none"
              ></textarea>
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 uppercase">Vídeo do Imóvel (MP4, Máx 20MB)</label>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <input 
                    type="file" 
                    id="video-upload" 
                    accept="video/mp4" 
                    className="hidden" 
                    onChange={handleVideoSelect}
                  />
                  <label 
                    htmlFor="video-upload"
                    className="flex items-center justify-center bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all cursor-pointer border border-gray-200"
                  >
                    <Video className="h-5 w-5 mr-2 text-orange-600" /> 
                    {videoFile ? 'Trocar Vídeo' : 'Carregar Vídeo MP4'}
                  </label>
                  {videoFile && (
                    <div className="flex items-center text-sm text-green-600 font-bold">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> {videoFile.name}
                      <button 
                        type="button" 
                        onClick={() => setVideoFile(null)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {videoUploadProgress !== null && (
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div 
                      className="bg-orange-600 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${videoUploadProgress}%` }}
                    ></div>
                    <p className="text-[10px] text-gray-500 mt-1 font-bold uppercase">Carregando vídeo: {Math.round(videoUploadProgress)}%</p>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">OU</span>
                  </div>
                  <input 
                    {...register('videoUrl')}
                    placeholder="Cole o URL do YouTube ou Vimeo..."
                    className="w-full pl-12 p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
              {errors.videoUrl && <p className="text-red-500 text-xs mt-1">{errors.videoUrl.message}</p>}
              <p className="text-xs text-gray-400">Pode carregar um vídeo MP4 diretamente ou colar um link externo.</p>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Camera className="h-5 w-5 mr-2 text-orange-600" /> Fotos do Imóvel
          </h2>

          <div className="space-y-4">
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center space-y-4 transition-all",
                isDragging ? "border-orange-600 bg-orange-50 scale-[1.02]" : "border-gray-200 bg-gray-50 hover:border-orange-300"
              )}
            >
              <div className="p-4 bg-white rounded-full shadow-sm">
                <Upload className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">Arraste e solte as fotos aqui</p>
                <p className="text-sm text-gray-500">ou clique no botão abaixo para selecionar</p>
              </div>
              
              <div className="relative">
                <input 
                  type="file" 
                  id="file-upload" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="file-upload"
                  className="flex items-center justify-center bg-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-700 transition-all cursor-pointer shadow-lg hover:shadow-orange-200"
                >
                  <Camera className="h-5 w-5 mr-2" /> Selecionar do Dispositivo
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Ou cole o URL de uma imagem..."
                className="flex-grow p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              <button 
                type="button"
                onClick={addImage}
                className="bg-gray-900 text-white px-6 rounded-xl font-bold hover:bg-gray-800 transition-all"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button 
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {images.length === 0 && (
                <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 space-y-2">
                  <Camera className="h-8 w-8" />
                  <span className="text-xs font-bold">Sem fotos</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button 
            type="submit"
            disabled={loading}
            className="flex-grow bg-orange-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-orange-700 transition-all shadow-xl hover:shadow-orange-200 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : null}
            {isEditing ? 'Salvar Alterações' : 'Publicar Anúncio'}
          </button>
        </div>
      </form>
    </div>
  );
}
