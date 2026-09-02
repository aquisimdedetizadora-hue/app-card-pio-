import React, { useState } from 'react';
import { MapPin, Loader2, AlertCircle, CheckCircle2, RefreshCw, Compass } from 'lucide-react';
import { getAddressFromCurrentLocation, GeocodedAddress, LocationServiceError } from '../../services/locationService';

interface AddressLocationPickerProps {
  onAddressFound: (address: GeocodedAddress) => void;
  primaryColor?: string;
}

export const AddressLocationPicker: React.FC<AddressLocationPickerProps> = ({
  onAddressFound,
  primaryColor = '#10B981',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [foundSummary, setFoundSummary] = useState<string | null>(null);

  const handleGetLocation = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep('Obtendo sua localização...');

    try {
      const address = await getAddressFromCurrentLocation((step) => {
        setLoadingStep(step);
      });

      const summaryParts = [
        address.street ? (address.number ? `${address.street}, ${address.number}` : address.street) : '',
        address.neighborhood || '',
        address.city ? (address.state ? `${address.city} - ${address.state}` : address.city) : '',
      ].filter(Boolean);

      setFoundSummary(summaryParts.join(' • ') || 'Endereço aproximado encontrado');
      onAddressFound(address);
    } catch (err: any) {
      const locationErr = err as LocationServiceError;
      setErrorMessage(
        locationErr?.message ||
        'Não foi possível obter sua localização automaticamente. Você pode preencher os campos manualmente.'
      );
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 sm:p-4 space-y-3 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <Compass className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Usar minha localização</span>
            <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Rápido
            </span>
          </h4>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
            Preencha seu endereço automaticamente usando o GPS do seu celular.
          </p>
        </div>
      </div>

      {/* Action Button / Loading state */}
      <div>
        {isLoading ? (
          <div className="w-full py-3 px-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 shadow-inner">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>{loadingStep || 'Obtendo sua localização...'}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGetLocation}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <MapPin className="w-4 h-4 fill-slate-950" />
            <span>Usar minha localização</span>
          </button>
        )}
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[11px] leading-relaxed">{errorMessage}</p>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Tentar novamente</span>
              </button>
              <span className="text-slate-500 text-[11px]">ou preencha abaixo ⬇️</span>
            </div>
          </div>
        </div>
      )}

      {/* Success preview */}
      {foundSummary && !isLoading && !errorMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-white flex items-center justify-between">
              <span>📍 Localização encontrada</span>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-normal cursor-pointer"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Atualizar
              </button>
            </p>
            <p className="text-[11px] text-emerald-300/90 mt-0.5 truncate">{foundSummary}</p>
            <p className="text-[10px] text-slate-400 mt-1">
              ⚠️ Confira e complete o número ou complemento abaixo antes de finalizar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
