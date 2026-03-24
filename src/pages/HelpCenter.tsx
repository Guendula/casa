import { Search, ChevronRight, HelpCircle, Book, MessageSquare, ShieldCheck, Mail, Phone } from 'lucide-react';
import { useState } from 'react';

const FAQS = [
  {
    question: "Como posso publicar um anúncio?",
    answer: "Para publicar um anúncio, clique no botão 'Anunciar' no topo da página, preencha as informações do imóvel e clique em 'Publicar Anúncio'. Você precisará estar logado para completar esta ação."
  },
  {
    question: "É grátis anunciar na ImobiliáriaMZ?",
    answer: "Sim, a publicação básica de anúncios é gratuita. Oferecemos também opções de destaque para aumentar a visibilidade do seu imóvel."
  },
  {
    question: "Como entro em contacto com um proprietário?",
    answer: "Na página de detalhes de cada imóvel, encontrará os botões de contacto (WhatsApp e Telefone) do proprietário ou agente responsável."
  },
  {
    question: "O que é o 'Impulsionar Anúncio'?",
    answer: "O impulsionamento é um serviço que coloca o seu anúncio no topo dos resultados de pesquisa e na secção de destaques da página inicial por um período determinado."
  }
];

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Como podemos ajudar?</h1>
        <p className="text-gray-500 text-lg">Encontre respostas rápidas para as suas dúvidas ou entre em contacto connosco.</p>
        
        <div className="relative max-w-xl mx-auto mt-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Pesquise por ajuda..."
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center space-y-4">
          <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
            <Book className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="font-bold text-gray-900">Guia do Usuário</h3>
          <p className="text-sm text-gray-500">Aprenda a usar todas as funcionalidades da plataforma.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center space-y-4">
          <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900">Segurança</h3>
          <p className="text-sm text-gray-500">Dicas para realizar transações seguras.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center space-y-4">
          <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
            <MessageSquare className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-900">Suporte Direto</h3>
          <p className="text-sm text-gray-500">Fale com a nossa equipa de atendimento.</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Perguntas Frequentes</h2>
        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-2">
              <h4 className="font-bold text-gray-900 flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-orange-600" />
                {faq.question}
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed pl-7">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-orange-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Ainda precisa de ajuda?</h3>
          <p className="text-orange-100">A nossa equipa está disponível para o ajudar.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="mailto:suporte@imobiliariamz.com" className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-orange-50 transition-all">
            <Mail className="h-5 w-5 mr-2" /> Email
          </a>
          <a href="tel:+258840000000" className="bg-orange-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-orange-800 transition-all">
            <Phone className="h-5 w-5 mr-2" /> Ligar
          </a>
        </div>
      </div>
    </div>
  );
}
