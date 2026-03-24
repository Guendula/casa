import { ShieldAlert, ShieldCheck, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Security() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Segurança na ImobiliáriaMZ</h1>
        <p className="text-gray-500 text-lg">A sua segurança é a nossa prioridade número um.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">O que fazemos por si</h2>
          <ul className="space-y-4">
            <li className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-gray-600 text-sm">Verificamos contas de utilizadores para prevenir fraudes.</span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-gray-600 text-sm">Monitorizamos anúncios suspeitos e removemos conteúdo impróprio.</span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-gray-600 text-sm">Protegemos os seus dados com criptografia avançada.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Dicas para si</h2>
          <ul className="space-y-4">
            <li className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <span className="text-gray-600 text-sm">Nunca envie dinheiro antes de visitar o imóvel pessoalmente.</span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <span className="text-gray-600 text-sm">Desconfie de preços excessivamente baixos ou propostas urgentes.</span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <span className="text-gray-600 text-sm">Marque visitas em locais públicos e acompanhado, se possível.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-red-50 p-10 rounded-3xl border border-red-100 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="bg-red-100 p-3 rounded-2xl">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-900">Denunciar Atividade Suspeita</h2>
        </div>
        <p className="text-red-800 leading-relaxed">
          Se encontrar um anúncio que pareça fraudulento ou um utilizador com comportamento suspeito, por favor utilize o botão "Denunciar Anúncio" na página do imóvel ou entre em contacto direto connosco.
        </p>
        <button className="bg-red-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200">
          Denunciar Agora
        </button>
      </div>
    </div>
  );
}
