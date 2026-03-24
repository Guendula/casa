import { Lock, Eye, ShieldCheck, Database } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Política de Privacidade</h1>
        <p className="text-gray-500 text-lg">Saiba como protegemos e utilizamos os seus dados pessoais.</p>
      </div>

      <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Database className="h-6 w-6 mr-3 text-orange-600" />
            1. Recolha de Informação
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Recolhemos informações quando se regista no nosso site, faz login na sua conta e publica anúncios. As informações recolhidas incluem o seu nome, endereço de e-mail e número de telefone.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Eye className="h-6 w-6 mr-3 text-orange-600" />
            2. Utilização da Informação
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Qualquer informação que recolhemos de si pode ser usada para:
          </p>
          <ul className="space-y-2 pl-9 list-disc text-gray-600">
            <li>Personalizar a sua experiência e responder às suas necessidades individuais.</li>
            <li>Melhorar o nosso site e os nossos serviços.</li>
            <li>Melhorar o atendimento ao cliente.</li>
            <li>Entrar em contacto via e-mail ou telefone.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Lock className="h-6 w-6 mr-3 text-orange-600" />
            3. Proteção de Dados
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Implementamos uma variedade de medidas de segurança para manter a segurança das suas informações pessoais. Usamos criptografia de ponta para proteger informações sensíveis transmitidas online.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <ShieldCheck className="h-6 w-6 mr-3 text-orange-600" />
            4. Divulgação a Terceiros
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Não vendemos, trocamos ou transferimos para terceiros as suas informações de identificação pessoal. Isto não inclui terceiros confiáveis que nos auxiliam na operação do nosso site ou na condução dos nossos negócios, desde que essas partes concordem em manter esta informação confidencial.
          </p>
        </div>

        <div className="pt-8 border-t border-gray-100 text-sm text-gray-400">
          Última atualização: 24 de Março de 2026
        </div>
      </div>
    </div>
  );
}
