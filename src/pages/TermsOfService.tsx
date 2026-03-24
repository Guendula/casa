import { Shield, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Termos de Serviço</h1>
        <p className="text-gray-500 text-lg">Leia atentamente os termos de utilização da nossa plataforma.</p>
      </div>

      <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="h-6 w-6 mr-3 text-orange-600" />
            1. Aceitação dos Termos
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Ao aceder e utilizar a ImobiliáriaMZ, você concorda em cumprir e estar vinculado aos seguintes termos e condições de utilização. Se não concordar com qualquer parte destes termos, não deverá utilizar os nossos serviços.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="h-6 w-6 mr-3 text-orange-600" />
            2. Utilização do Serviço
          </h2>
          <p className="text-gray-600 leading-relaxed">
            A ImobiliáriaMZ é uma plataforma de classificados imobiliários. Não somos proprietários, agentes ou intermediários nas transações realizadas entre os utilizadores. A responsabilidade pela veracidade das informações nos anúncios é inteiramente do anunciante.
          </p>
          <ul className="space-y-2 pl-9 list-disc text-gray-600">
            <li>Você deve ter pelo menos 18 anos para criar uma conta.</li>
            <li>É proibido publicar conteúdo ilegal, ofensivo ou enganoso.</li>
            <li>Reservamo-nos o direito de remover qualquer anúncio que viole as nossas políticas.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <CheckCircle className="h-6 w-6 mr-3 text-orange-600" />
            3. Responsabilidades do Usuário
          </h2>
          <p className="text-gray-600 leading-relaxed">
            O utilizador é responsável por manter a confidencialidade da sua conta e palavra-passe. Qualquer atividade realizada através da sua conta será da sua inteira responsabilidade.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <AlertCircle className="h-6 w-6 mr-3 text-orange-600" />
            4. Limitação de Responsabilidade
          </h2>
          <p className="text-gray-600 leading-relaxed">
            A ImobiliáriaMZ não se responsabiliza por quaisquer danos diretos, indiretos ou consequentes resultantes da utilização ou incapacidade de utilizar o serviço, ou de qualquer transação realizada entre utilizadores da plataforma.
          </p>
        </div>

        <div className="pt-8 border-t border-gray-100 text-sm text-gray-400">
          Última atualização: 24 de Março de 2026
        </div>
      </div>
    </div>
  );
}
