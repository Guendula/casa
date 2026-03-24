import { Link, useNavigate } from 'react-router-dom';
import { Search, User, PlusCircle, Heart, Home, LogOut, Menu, X, Bell, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import NotificationCenter from './NotificationCenter';
import LoginModal from './LoginModal';

interface HeaderProps {
  user: UserProfile | null;
}

export default function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-orange-600 p-1.5 rounded-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">
              Imobiliária<span className="text-orange-600">MZ</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">Início</Link>
            <Link to="/pesquisa?type=venda" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">Comprar</Link>
            <Link to="/pesquisa?type=aluguel_mensal" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">Alugar</Link>
            <Link to="/pesquisa?category=quarto" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">Quartos</Link>
            <Link to="/pesquisa?category=terreno" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">Terrenos</Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/publicar" 
              className="hidden sm:flex items-center space-x-1 bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-orange-700 transition-all shadow-md hover:shadow-lg"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Anunciar</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <NotificationCenter user={user} />
                <div className="relative group">
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <img 
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                      alt={user.displayName}
                      className="h-8 w-8 rounded-full border-2 border-orange-100"
                    />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-bold">
                        <LayoutDashboard className="h-4 w-4 mr-3" /> Painel Admin
                      </Link>
                    )}
                    <Link to="/perfil" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50">
                      <User className="h-4 w-4 mr-3 text-gray-400" /> Perfil
                    </Link>
                    <Link to="/meus-imoveis" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50">
                      <Home className="h-4 w-4 mr-3 text-gray-400" /> Meus Anúncios
                    </Link>
                    <Link to="/favoritos" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50">
                      <Heart className="h-4 w-4 mr-3 text-gray-400" /> Favoritos
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" /> Sair
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">Entrar</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-orange-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden bg-white border-t border-gray-100 transition-all duration-300 overflow-hidden",
        isMenuOpen ? "max-h-96 py-4" : "max-h-0"
      )}>
        <div className="px-4 space-y-4">
          <Link to="/" className="block text-base font-medium text-gray-700" onClick={() => setIsMenuOpen(false)}>Início</Link>
          <Link to="/pesquisa?type=venda" className="block text-base font-medium text-gray-700" onClick={() => setIsMenuOpen(false)}>Comprar</Link>
          <Link to="/pesquisa?type=aluguel_mensal" className="block text-base font-medium text-gray-700" onClick={() => setIsMenuOpen(false)}>Alugar</Link>
          <Link to="/pesquisa?category=quarto" className="block text-base font-medium text-gray-700" onClick={() => setIsMenuOpen(false)}>Quartos</Link>
          <Link to="/pesquisa?category=terreno" className="block text-base font-medium text-gray-700" onClick={() => setIsMenuOpen(false)}>Terrenos</Link>
          <Link to="/publicar" className="block text-base font-semibold text-orange-600" onClick={() => setIsMenuOpen(false)}>Anunciar Imóvel</Link>
        </div>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </header>
  );
}
