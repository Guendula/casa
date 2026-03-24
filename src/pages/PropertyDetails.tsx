import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Property, UserProfile, Booking } from '../types';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { MapPin, Bed, Bath, Square, Calendar, User, Phone, MessageCircle, Share2, Heart, Star, ShieldCheck, ArrowLeft, CheckCircle2, Play, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface PropertyDetailsProps {
  user: UserProfile | null;
}

export default function PropertyDetails({ user }: PropertyDetailsProps) {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingDates, setBookingDates] = useState({ start: '', end: '' });
  const [isBooking, setIsBooking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'properties', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const propData = { id: docSnap.id, ...docSnap.data() } as Property;
          setProperty(propData);

          // Attempt to fetch full owner profile (only works if authenticated)
          try {
            const ownerSnap = await getDoc(doc(db, 'users', propData.ownerUid));
            if (ownerSnap.exists()) {
              setOwner(ownerSnap.data() as UserProfile);
            } else {
              // Fallback to denormalized data
              setOwner({
                uid: propData.ownerUid,
                displayName: propData.ownerName || 'Proprietário',
                photoURL: propData.ownerPhoto || '',
                email: '', // Not available publicly
              });
            }
          } catch (err) {
            console.warn('Could not fetch full owner profile, using denormalized data:', err);
            // Fallback to denormalized data
            setOwner({
              uid: propData.ownerUid,
              displayName: propData.ownerName || 'Proprietário',
              photoURL: propData.ownerPhoto || '',
              email: '', // Not available publicly
            });
          }
        } else {
          toast.error('Imóvel não encontrado.');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Erro ao carregar imóvel.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  const handleBooking = async () => {
    if (!user) {
      toast.error('Faça login para realizar uma reserva.');
      return;
    }
    if (!bookingDates.start || !bookingDates.end) {
      toast.error('Selecione as datas de início e fim.');
      return;
    }

    setIsBooking(true);
    try {
      const bookingData: Partial<Booking> = {
        propertyId: property!.id,
        tenantUid: user.uid,
        ownerUid: property!.ownerUid,
        startDate: new Date(bookingDates.start),
        endDate: new Date(bookingDates.end),
        totalAmount: property!.price * 1, // Simplified calculation
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      toast.success('Pedido de reserva enviado com sucesso!');
      setBookingDates({ start: '', end: '' });
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Erro ao processar reserva.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: property?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!property) return null;

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Status Banner */}
      {property.status && property.status !== 'active' && (
        <div className={cn(
          "p-4 rounded-2xl flex items-center justify-center space-x-3 text-white font-bold shadow-lg",
          property.status === 'sold' ? "bg-red-600" : 
          property.status === 'rented' ? "bg-orange-600" : "bg-gray-600"
        )}>
          <AlertCircle className="h-6 w-6" />
          <span className="text-lg">
            {property.status === 'sold' ? 'Este imóvel já foi VENDIDO' : 
             property.status === 'rented' ? 'Este imóvel já foi ALUGADO' : 'Este anúncio está PENDENTE'}
          </span>
        </div>
      )}

      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-orange-600 font-medium transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Voltar
        </button>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleShare}
            className="p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
            <Heart className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Title & Price */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
            property.type === 'venda' ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
          )}>
            {property.type.replace('_', ' ')}
          </span>
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {property.category}
          </span>
          {property.status && property.status !== 'active' && (
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
              property.status === 'sold' ? "bg-red-100 text-red-700" : 
              property.status === 'rented' ? "bg-purple-100 text-purple-700" : "bg-yellow-100 text-yellow-700"
            )}>
              {property.status === 'sold' ? 'Vendido' : property.status === 'rented' ? 'Alugado' : 'Pendente'}
            </span>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            {property.title}
          </h1>
          <div className="text-3xl font-black text-orange-600">
            {formatCurrency(property.price)}
            {property.type === 'aluguel_diario' && <span className="text-lg font-normal text-gray-500"> / noite</span>}
            {property.type === 'aluguel_mensal' && <span className="text-lg font-normal text-gray-500"> / mês</span>}
          </div>
        </div>
        <div className="flex items-center text-gray-500 font-medium">
          <MapPin className="h-5 w-5 mr-2 text-orange-600" />
          {property.city}, Moçambique
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-gray-100 shadow-inner">
            <img 
              src={property.images?.[activeImage] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'} 
              alt={property.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {property.images?.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={cn(
                  "w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border-4 transition-all",
                  activeImage === idx ? "border-orange-600 scale-105" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar: Contact & Booking */}
        <div className="space-y-6">
          {/* Owner Card */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 space-y-6">
            <div className="flex items-center space-x-4">
              <img 
                src={owner?.photoURL || `https://ui-avatars.com/api/?name=${owner?.displayName}`} 
                alt={owner?.displayName}
                className="h-14 w-14 rounded-full border-2 border-orange-100"
              />
              <div>
                <h3 className="font-bold text-gray-900">{owner?.displayName || 'Proprietário'}</h3>
                <div className="flex items-center text-xs text-green-600 font-bold">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Identidade Verificada
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a 
                href={`tel:${owner?.phoneNumber || ''}`}
                className="flex items-center justify-center space-x-2 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
              >
                <Phone className="h-4 w-4" />
                <span>Ligar</span>
              </a>
              <a 
                href={`https://wa.me/${owner?.phoneNumber?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Link 
                to={`/denunciar?id=${property.id}&title=${encodeURIComponent(property.title)}`}
                className="flex items-center justify-center space-x-2 text-sm text-gray-400 hover:text-red-600 transition-colors font-medium"
              >
                <AlertCircle className="h-4 w-4" />
                <span>Denunciar este anúncio</span>
              </Link>
            </div>
          </div>

          {/* Booking Widget (for daily rentals) */}
          {property.type === 'aluguel_diario' && (
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-orange-100 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">Reservar Agora</h3>
                <div className="flex items-center text-orange-600 font-bold">
                  <Star className="h-4 w-4 mr-1 fill-current" /> 4.8
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Check-in</label>
                    <input 
                      type="date" 
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      value={bookingDates.start}
                      onChange={(e) => setBookingDates({ ...bookingDates, start: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Check-out</label>
                    <input 
                      type="date" 
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      value={bookingDates.end}
                      onChange={(e) => setBookingDates({ ...bookingDates, end: e.target.value })}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleBooking}
                  disabled={isBooking}
                  className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200 disabled:opacity-50"
                >
                  {isBooking ? 'Processando...' : 'Solicitar Reserva'}
                </button>
                <p className="text-center text-xs text-gray-400">Não será cobrado nada agora</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details & Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Features Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                <Bed className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-gray-900">{property.bedrooms || 0} Quartos</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <Bath className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-gray-900">{property.bathrooms || 0} Casas de Banho</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                <Square className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-gray-900">{property.area || 0} m²</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-gray-900">Publicado em {formatDate(property.createdAt)}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Descrição</h2>
            <div className="prose prose-orange max-w-none text-gray-600 leading-relaxed">
              <ReactMarkdown>{property.description || 'Nenhuma descrição fornecida.'}</ReactMarkdown>
            </div>
          </div>

          {/* Video Player */}
          {property.videoUrl && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Play className="h-6 w-6 mr-2 text-orange-600" /> Vídeo do Imóvel
              </h2>
              <div className="aspect-video rounded-3xl overflow-hidden bg-black shadow-lg">
                {(property.videoUrl.includes('firebasestorage.googleapis.com') || property.videoUrl.endsWith('.mp4')) ? (
                  <video 
                    src={property.videoUrl} 
                    controls 
                    className="w-full h-full"
                  />
                ) : (
                  <iframe
                    src={getEmbedUrl(property.videoUrl)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Property Video"
                  ></iframe>
                )}
              </div>
            </div>
          )}

          {/* Features List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">O que este lugar oferece</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Segurança 24h', 'Estacionamento Privado', 'Ar Condicionado', 'Piscina', 'Água e Luz 24h', 'Cozinha Equipada'].map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-gray-700 font-medium">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
