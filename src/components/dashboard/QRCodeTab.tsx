import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Download, 
  Copy, 
  Share2, 
  Printer, 
  Smartphone, 
  ExternalLink,
  Sparkles,
  Layers,
  Store,
  MessageSquare
} from 'lucide-react';
import QRCode from 'qrcode';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { getRestaurantPublicUrl, getRestaurantWhatsAppShareUrl } from '../../services/restaurantUrl';

export const QRCodeTab: React.FC = () => {
  const { currentRestaurant } = useAuth();
  const { showToast } = useToast();

  const [tableNumber, setTableNumber] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const baseUrl = getRestaurantPublicUrl(currentRestaurant);
  const fullUrl = getRestaurantPublicUrl(currentRestaurant, { tableNumber });

  useEffect(() => {
    if (fullUrl) {
      QRCode.toDataURL(fullUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error(err));
    }
  }, [fullUrl]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qrcode-${currentRestaurant?.settings.slug || 'cardapio'}${tableNumber ? `-mesa-${tableNumber}` : ''}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('💾 Imagem do QR Code baixada com sucesso!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    showToast('📋 Link do cardápio copiado com sucesso!');
  };

  const handleShare = () => {
    if (!currentRestaurant) return;
    const shareData = {
      title: `${currentRestaurant.settings.name} — Cardápio Digital`,
      text: `Acesse o cardápio digital do ${currentRestaurant.settings.name}:`,
      url: fullUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => handleCopyLink());
    } else {
      handleCopyLink();
    }
  };

  const handleShareWhatsApp = () => {
    if (!currentRestaurant) return;
    const shareUrl = getRestaurantWhatsAppShareUrl(currentRestaurant, { tableNumber });
    window.open(shareUrl, '_blank');
  };

  const handlePrintTableCard = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printableHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Placa de Mesa - ${currentRestaurant?.settings.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background-color: #f1f5f9;
            }
            .card {
              width: 320px;
              background: #ffffff;
              border: 2px solid #e2e8f0;
              border-radius: 24px;
              padding: 32px 24px;
              text-align: center;
              box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            }
            .logo-wrap {
              margin-bottom: 12px;
            }
            .restaurant-name {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              margin: 0 0 6px 0;
            }
            .tagline {
              font-size: 12px;
              color: #64748b;
              margin: 0 0 20px 0;
            }
            .qr-wrapper {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              padding: 16px;
              display: inline-block;
              margin-bottom: 20px;
            }
            .qr-wrapper img {
              width: 200px;
              height: 200px;
              display: block;
            }
            .scan-title {
              font-size: 16px;
              font-weight: 700;
              color: #059669;
              margin: 0 0 4px 0;
            }
            .scan-desc {
              font-size: 11px;
              color: #64748b;
              margin: 0;
            }
            .table-badge {
              display: inline-block;
              margin-top: 16px;
              padding: 6px 14px;
              background: #020617;
              color: #ffffff;
              border-radius: 20px;
              font-weight: 700;
              font-size: 12px;
            }
            @media print {
              body { background: transparent; }
              .card { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1 class="restaurant-name">${currentRestaurant?.settings.name}</h1>
            <p class="tagline">Cardápio Digital & Pedidos</p>

            <div class="qr-wrapper">
              <img src="${qrDataUrl}" alt="QR Code" />
            </div>

            <h2 class="scan-title">Escaneie com a câmera</h2>
            <p class="scan-desc">Acesse nosso cardápio completo e envie seu pedido diretamente pelo WhatsApp!</p>

            ${tableNumber ? `<div class="table-badge">MESA ${tableNumber}</div>` : ''}
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printableHtml);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <span>Gerador de QR Code do Cardápio</span>
          </h2>
          <p className="text-xs text-slate-400">
            Gere e imprima QR codes para mesas, balcão, cartões de visita e redes sociais.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
            title="Compartilhar no WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleShare}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            title="Compartilhar Cardápio"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Compartilhar</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" />
            <span>Copiar Link</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar PNG</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Code Controls */}
        <div className="lg:col-span-6 space-y-5">
          {/* Table Customizer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Personalizar QR Code para Mesa Específica</span>
            </h3>
            <p className="text-xs text-slate-400">
              Se você inserir um número de mesa, o cardápio já abrirá com a mesa pré-preenchida para o cliente!
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Número da Mesa (opcional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ex: 01, 15, Balcão..."
                  value={tableNumber}
                  onChange={e => setTableNumber(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                {tableNumber && (
                  <button
                    onClick={() => setTableNumber('')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400 block mb-1">Link de Destino:</span>
              <p className="font-mono text-emerald-400 break-all text-[11px]">{fullUrl}</p>
            </div>
          </div>

          {/* Print Ready Card Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Imprimir Display de Mesa Pronto</span>
            </h3>
            <p className="text-xs text-slate-400">
              Gere uma arte pronta para impressão com a logo, instruções de escaneamento e identificação do seu restaurante.
            </p>

            <button
              onClick={handlePrintTableCard}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Imprimir Placa para Mesa (A5 / Display)</span>
            </button>
          </div>
        </div>

        {/* Right Column: QR Code Visual Preview Card */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
            {/* Header info */}
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-3">
              <Store className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold font-display text-white">
              {currentRestaurant?.settings.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-6">
              Aponte a câmera para pedir
            </p>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-slate-800 mb-5">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 sm:w-56 sm:h-56 object-contain" />
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-xs text-slate-400">
                  Gerando QR Code...
                </div>
              )}
            </div>

            {tableNumber && (
              <span className="px-4 py-1.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-4">
                MESA {tableNumber}
              </span>
            )}

            <div className="w-full flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Salvar Imagem</span>
              </button>
              <button
                onClick={handlePrintTableCard}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                title="Imprimir"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
