import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegisterOption, setShowRegisterOption] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Login realizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erro ao fazer login com Google.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowRegisterOption(false);

    try {
      if (isLogin) {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          toast.success('Login realizado com sucesso!');
          onClose();
        } catch (error: any) {
          if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            setShowRegisterOption(true);
            toast.error('Credenciais inválidas. Se não tiver conta, pode registar-se abaixo.');
          } else {
            toast.error('Erro ao fazer login: ' + error.message);
          }
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
        toast.success('Conta criada com sucesso!');
        onClose();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="p-8 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">
                {isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
              </h2>
              <p className="text-gray-500">
                {isLogin ? 'Entre para gerir os seus imóveis' : 'Registe-se para começar a anunciar'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      type="text" 
                      required
                      placeholder="Seu nome"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="email" 
                    required
                    placeholder="seu@email.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Palavra-passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : null}
                {isLogin ? 'Entrar' : 'Criar Conta'}
              </button>

              {showRegisterOption && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-center space-y-3"
                >
                  <p className="text-sm text-orange-800 font-medium">Não encontramos uma conta com este email.</p>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setShowRegisterOption(false);
                    }}
                    className="text-orange-600 font-bold hover:underline"
                  >
                    Deseja criar uma conta agora?
                  </button>
                </motion.div>
              )}
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400">Ou continue com</span>
              </div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-3 px-4 py-4 border border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
              <span>Google</span>
            </button>

            <div className="text-center">
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setShowRegisterOption(false);
                }}
                className="text-gray-500 hover:text-orange-600 font-medium transition-colors"
              >
                {isLogin ? 'Não tem uma conta? Registe-se' : 'Já tem uma conta? Entre aqui'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
