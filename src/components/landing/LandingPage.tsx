import React from 'react';
import { 
  Smartphone, 
  MessageSquare, 
  Percent, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  QrCode, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  UtensilsCrossed, 
  Clock,
  Store,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { loginAsDemo } = useAuth();

  const handleDemoClick = () => {
    onNavigate('/burgerhouse');
  };

  const handleAdminDemoClick = () => {
    loginAsDemo('burgerhouse');
    onNavigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-1.5">
                Menu<span className="text-emerald-400">Zap</span>
              </span>
              <span className="text-[10px] block text-emerald-400 font-semibold tracking-wider uppercase -mt-1">
                Cardápio & WhatsApp
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#como-funciona" className="hover:text-emerald-400 transition">Como Funciona</a>
            <a href="#beneficios" className="hover:text-emerald-400 transition">Benefícios</a>
            <a href="#demonstracao" className="hover:text-emerald-400 transition">Demonstração</a>
            <a href="#faq" className="hover:text-emerald-400 transition">Perguntas</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/login')}
              className="text-sm font-semibold text-slate-200 hover:text-white px-3.5 py-2 rounded-lg hover:bg-slate-800/60 transition"
            >
              Entrar
            </button>
            <button
              onClick={() => onNavigate('/cadastro')}
              className="text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <span>Começar agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sem taxas sobre suas vendas • 100% Mobile</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white leading-tight"
            >
              Seu cardápio. Seus pedidos.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                Direto no WhatsApp.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed font-normal"
            >
              Crie seu cardápio digital profissional, receba pedidos organizados e aumente suas vendas sem precisar de um aplicativo de delivery caro e complicado.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5"
            >
              <button
                onClick={() => onNavigate('/cadastro')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base transition duration-200 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Criar cardápio grátis</span>
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleDemoClick}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-700 font-semibold text-base transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span>Ver cardápio ao vivo (Demo)</span>
              </button>
            </motion.div>

            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Pronto em 3 minutos
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> QR Code incluso
              </span>
            </div>
          </div>

          {/* Interactive Mockup / Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-14 max-w-4xl mx-auto rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-3 sm:p-5 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-slate-500">menuzap.com/burgerhouse</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Online & Aberto
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4">
              {/* Left Column: Menu Preview */}
              <div className="md:col-span-7 bg-slate-950/70 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=100&h=100&q=80"
                      alt="Burger House"
                      className="w-12 h-12 rounded-full object-cover border border-emerald-500/40"
                    />
                    <div>
                      <h4 className="font-bold text-white text-base">Burger House</h4>
                      <p className="text-xs text-slate-400">Hambúrgueres Artesanais na Brasa</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=80&h=80&q=80"
                          alt="Burger"
                          className="w-11 h-11 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">Classic Burger</p>
                          <p className="text-[11px] text-slate-400">160g artesanal, queijo prato...</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400">R$ 24,90</span>
                        <div className="text-[10px] text-slate-400 font-medium">+ Adicionar</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=80&h=80&q=80"
                          alt="Bacon"
                          className="w-11 h-11 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">Bacon Burger Especial</p>
                          <p className="text-[11px] text-slate-400">Cheddar inglês, bacon crocante...</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400">R$ 27,90</span>
                        <div className="text-[10px] text-slate-400 font-medium">+ Adicionar</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Carrinho: <span className="text-white font-bold">2 itens</span>
                  </div>
                  <button
                    onClick={handleDemoClick}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition flex items-center gap-1"
                  >
                    <span>Testar como Cliente</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Right Column: WhatsApp Output Preview */}
              <div className="md:col-span-5 bg-[#0b141a] rounded-xl p-3.5 border border-emerald-900/30 flex flex-col justify-between text-xs">
                <div className="bg-[#1f2c34] p-2 rounded-lg text-emerald-400 font-medium text-[11px] flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Mensagem gerada automaticamente:</span>
                </div>
                
                <div className="bg-[#111b21] p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 space-y-1 leading-relaxed">
                  <p className="text-emerald-400 font-bold">🍔 PEDIDO #1024</p>
                  <p>• 2x Bacon Burger — R$ 55,80</p>
                  <p className="text-slate-400">  └ + 2x Bacon Extra (R$ 10,00)</p>
                  <p>• 1x Coca-Cola 2L — R$ 14,00</p>
                  <p className="border-t border-slate-700/60 pt-1 mt-1 font-bold text-white">💰 TOTAL: R$ 79,80</p>
                  <p className="text-amber-300">💳 Pix • 🚗 Delivery</p>
                  <p className="text-slate-400">📍 Rua das Flores, 342 - Centro</p>
                </div>

                <div className="mt-3">
                  <button
                    onClick={handleAdminDemoClick}
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Store className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Acessar Painel do Restaurante</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visual Step-by-Step Flow */}
      <section id="como-funciona" className="py-20 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Passo a Passo</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mt-2">
              Como funciona o MenuZap?
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Um fluxo direto e sem atritos tanto para você quanto para o seu cliente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: '1',
                title: 'Cliente acessa',
                desc: 'Abre o link exclusivo ou escaneia o QR Code na mesa ou nas redes sociais.',
                icon: Smartphone,
              },
              {
                step: '2',
                title: 'Escolhe produtos',
                desc: 'Navega por fotos atraentes, variações, adicionais e combos com total facilidade.',
                icon: UtensilsCrossed,
              },
              {
                step: '3',
                title: 'Monta o pedido',
                desc: 'Define ponto da carne, observações, complementos e confere o carrinho.',
                icon: Layers,
              },
              {
                step: '4',
                title: 'Escolhe pagamento',
                desc: 'Informa se vai pagar no Pix, Cartão ou Dinheiro (com cálculo de troco).',
                icon: ShieldCheck,
              },
              {
                step: '5',
                title: 'Chega no WhatsApp',
                desc: 'O pedido chega formatado, completo e pronto para ir para a cozinha!',
                icon: MessageSquare,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-emerald-500/40 transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black font-display text-slate-700 group-hover:text-emerald-500/40 transition">
                      0{item.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Vantagens Reais</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mt-2">
              Por que escolher o MenuZap?
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Tudo o que seu estabelecimento precisa para vender mais sem intermediários.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Percent,
                title: 'Sem comissão por pedido',
                desc: 'Chega de pagar 27% para aplicativos de delivery. O faturamento do seu restaurante é 100% seu.',
              },
              {
                icon: MessageSquare,
                title: 'Pedidos organizados no WhatsApp',
                desc: 'Acabe com o troca-troca de mensagens confusas. Receba endereço, adicionais e forma de pagamento em uma mensagem padronizada.',
              },
              {
                icon: Smartphone,
                title: '100% Mobile & Sem Login para Clientes',
                desc: 'Seu cliente não precisa baixar app nem criar senha. Clicou no link, já está pedindo em segundos.',
              },
              {
                icon: Zap,
                title: 'Fácil e Instantâneo de Atualizar',
                desc: 'Acabou um ingrediente? Pause o produto em 1 toque. Altere preços e crie promoções em tempo real.',
              },
              {
                icon: Sparkles,
                title: 'Identidade Visual & Personalização',
                desc: 'Seu logo, fotos de alta qualidade, cores da sua marca e temas modernos (Moderno, Premium, Elegante).',
              },
              {
                icon: QrCode,
                title: 'QR Code Exclusivo para Mesas & Balcão',
                desc: 'Gere e baixe seu QR Code para imprimir em displays de mesa, panfletos, embalagens e fachadas.',
              },
            ].map((b, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                  <b.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{b.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demonstracao" className="py-20 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/30 relative overflow-hidden">
            <div className="relative z-10">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider inline-block mb-4">
                Experimente Agora
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mb-4">
                Teste o cardápio da Burger House
              </h2>
              <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base mb-8">
                Veja exatamente como seu cliente vai interagir, selecionar burgers, adicionar adicionais e finalizar pelo WhatsApp.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleDemoClick}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-5 h-5" />
                  <span>Abrir Cardápio Público</span>
                </button>
                <button
                  onClick={handleAdminDemoClick}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-base transition border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Store className="w-5 h-5 text-emerald-400" />
                  <span>Acessar Painel de Controle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Dúvidas Frequentes</span>
            <h2 className="text-3xl font-bold font-display text-white mt-2">
              Perguntas e Respostas
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Preciso de CNPJ ou máquina especial para usar?',
                a: 'Não! Qualquer pessoa, restaurante, lanchonete ou confeitaria pode usar com seu próprio WhatsApp e chave Pix ou máquina de cartão atual.',
              },
              {
                q: 'O cliente precisa baixar algum aplicativo?',
                a: 'Não! O cardápio abre direto no navegador do celular do cliente através do link ou QR Code.',
              },
              {
                q: 'Como recebo o dinheiro das vendas?',
                a: 'O cliente escolhe pagar via Pix, Cartão ou Dinheiro e acerta diretamente com você, sem retenção de valores e sem taxas percentuais.',
              },
              {
                q: 'Posso colocar fotos reais dos meus pratos?',
                a: 'Sim! Você pode cadastrar fotos, descrições detalhadas, tamanhos, adicionais e preços promocionais com facilidade.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                <h3 className="font-bold text-white text-base mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-900 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-slate-200">MenuZap</span>
            <span>— A plataforma de cardápios inteligentes</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <button onClick={() => onNavigate('/login')} className="hover:text-emerald-400 transition">Login</button>
            <button onClick={() => onNavigate('/cadastro')} className="hover:text-emerald-400 transition">Cadastro</button>
            <button onClick={handleDemoClick} className="hover:text-emerald-400 transition">Demo Burger House</button>
          </div>

          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} MenuZap. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};
