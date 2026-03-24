import { Home, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-orange-600 p-1.5 rounded-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Imobiliária<span className="text-orange-600">MZ</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              A maior plataforma imobiliária de Moçambique. Conectando proprietários e inquilinos com confiança e facilidade em todo o país.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-orange-600 hover:text-white transition-all">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-orange-600 hover:text-white transition-all">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-orange-600 hover:text-white transition-all">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Links Rápidos</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/pesquisa?type=venda" className="hover:text-orange-500 transition-colors">Comprar Imóvel</Link></li>
              <li><Link to="/pesquisa?type=aluguel_mensal" className="hover:text-orange-500 transition-colors">Alugar Casa</Link></li>
              <li><Link to="/pesquisa?category=quarto" className="hover:text-orange-500 transition-colors">Alugar Quarto</Link></li>
              <li><Link to="/pesquisa?category=terreno" className="hover:text-orange-500 transition-colors">Terrenos</Link></li>
              <li><Link to="/publicar" className="hover:text-orange-500 transition-colors">Anunciar Imóvel</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-6">Suporte</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/ajuda" className="hover:text-orange-500 transition-colors">Centro de Ajuda</Link></li>
              <li><Link to="/termos" className="hover:text-orange-500 transition-colors">Termos de Serviço</Link></li>
              <li><Link to="/privacidade" className="hover:text-orange-500 transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/seguranca" className="hover:text-orange-500 transition-colors">Segurança</Link></li>
              <li><Link to="/denunciar" className="hover:text-orange-500 transition-colors">Denunciar Anúncio</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contacto</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-orange-600 shrink-0" />
                <span>Av. 24 de Julho, Maputo, Moçambique</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-600 shrink-0" />
                <span>+258 84 000 0000</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-600 shrink-0" />
                <span>contacto@imobiliariamz.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Imobiliária Moçambique. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
