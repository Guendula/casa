import { useState } from 'react';
import { X, Zap, ShieldCheck, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';

interface BoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  onSuccess: () => void;
}

export default function BoostModal({ isOpen, onClose, propertyId, propertyTitle, onSuccess }: BoostModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'emola'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('840000000'); // Pre-configured mock number

  const handleBoost = async () => {
    setLoading(true);
    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      await updateDoc(doc(db, 'properties', propertyId), {
        isBoosted: true,
        boostedAt: serverTimestamp(),
      });

      setStep('success');
      toast.success('Anúncio impulsionado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Error boosting property:', error);
      toast.error('Erro ao processar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {step === 'info' && (
            <div className="p-8 space-y-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Zap className="h-8 w-8 text-purple-600 fill-current" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Impulsionar Anúncio</h2>
                <p className="text-gray-500 font-medium">Destaque o seu imóvel "{propertyTitle}" e venda até 3x mais rápido.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <div className="bg-white p-2 rounded-xl shadow-sm">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-900">Visibilidade Máxima</h4>
                    <p className="text-sm text-purple-700">O seu anúncio aparecerá no topo das pesquisas e na página inicial.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <div className="bg-white p-2 rounded-xl shadow-sm">
                    <ShieldCheck className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-orange-900">Selo de Destaque</h4>
                    <p className="text-sm text-orange-700">Um selo visual exclusivo para atrair mais cliques e confiança.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Custo do Serviço</p>
                  <p className="text-2xl font-black text-gray-900">500,00 MZN <span className="text-sm font-normal text-gray-500">/ 7 dias</span></p>
                </div>
                <button 
                  onClick={() => setStep('payment')}
                  className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Pagamento Móvel</h2>
                <p className="text-gray-500 font-medium">Escolha o seu método de pagamento preferido.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setPaymentMethod('mpesa')}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all flex flex-col items-center space-y-2",
                    paymentMethod === 'mpesa' ? "border-red-500 bg-red-50" : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-black text-xl italic">M</div>
                  <span className="font-bold text-gray-900">M-Pesa</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('emola')}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all flex flex-col items-center space-y-2",
                    paymentMethod === 'emola' ? "border-orange-500 bg-orange-50" : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-xl italic">e</div>
                  <span className="font-bold text-gray-900">e-Mola</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Número de Telefone</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="tel" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all font-bold"
                  />
                </div>
                <p className="text-xs text-gray-400">Receberá um pedido de confirmação no seu telemóvel.</p>
              </div>

              <div className="pt-4 space-y-3">
                <button 
                  onClick={handleBoost}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <><Loader2 className="h-6 w-6 animate-spin mr-2" /> Processando...</>
                  ) : (
                    'Confirmar Pagamento'
                  )}
                </button>
                <button 
                  onClick={() => setStep('info')}
                  className="w-full text-gray-500 font-bold py-2 hover:text-gray-700 transition-colors"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="p-12 text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Pagamento Confirmado!</h2>
                <p className="text-gray-500 font-medium">O seu anúncio já está a ser impulsionado e terá visibilidade máxima por 7 dias.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg"
              >
                Concluir
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
