import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, Send, CheckCircle, Loader2, Info } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'sonner';

const REPORT_REASONS = [
  "Anúncio fraudulento / Burlas",
  "Imóvel já vendido ou alugado",
  "Informações incorretas ou enganosas",
  "Fotos impróprias ou ofensivas",
  "Preço irrealista",
  "Outro motivo"
];

export default function ReportAd() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const propertyId = searchParams.get('id');
  const propertyTitle = searchParams.get('title');

  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Por favor, selecione um motivo.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'reports'), {
        propertyId: propertyId || 'general',
        propertyTitle: propertyTitle || 'Geral',
        reason,
        description,
        reporterUid: auth.currentUser?.uid || 'anonymous',
        reporterEmail: auth.currentUser?.email || 'anonymous',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setSubmitted(true);
      toast.success('Denúncia enviada com sucesso!');
    } catch (error) {
      console.error('Error reporting ad:', error);
      toast.error('Erro ao enviar denúncia.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-8">
        <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Obrigado pela sua denúncia</h2>
          <p className="text-gray-500 text-lg">A nossa equipa irá analisar o anúncio e tomar as medidas necessárias.</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Denunciar Anúncio</h1>
        <p className="text-gray-500 text-lg">Ajude-nos a manter a plataforma segura e confiável.</p>
      </div>

      {propertyTitle && (
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start space-x-4">
          <Info className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-blue-900">Denunciando o imóvel:</h4>
            <p className="text-blue-800">{propertyTitle}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm space-y-8">
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700 uppercase">Motivo da Denúncia</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`p-4 rounded-xl border text-left transition-all font-medium ${
                  reason === r 
                    ? "bg-orange-50 border-orange-600 text-orange-600 shadow-sm" 
                    : "bg-gray-50 border-gray-100 text-gray-600 hover:border-orange-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700 uppercase">Descrição Adicional (Opcional)</label>
          <textarea 
            rows={4}
            placeholder="Forneça mais detalhes sobre o problema..."
            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl hover:shadow-red-200 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
          <span>Enviar Denúncia</span>
        </button>
      </form>
    </div>
  );
}
