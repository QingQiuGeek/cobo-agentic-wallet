'use client'
import { useState, useEffect } from 'react';
import { Search, TrendingUp, Cpu, ShoppingBag, ChevronDown, ChevronUp, Layers, Loader2, RefreshCw } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  url: string;
  description: string;
  provider: string;
  icon: string;
  price: string;
  pricingToken: string;
}

interface ServiceListProps {
  onTriggerService?: (service: Service) => void;
}

export default function ServiceList({ onTriggerService }: ServiceListProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState('');

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/services');
      const data = await response.json();
      if (data.success && data.services) {
        setServices(data.services);
        setSource(data.source || '');
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Search': return <Search className="h-3.5 w-3.5 text-blue-500" />;
      case 'TrendingUp': return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
      case 'Cpu': return <Cpu className="h-3.5 w-3.5 text-purple-500" />;
      default: return <ShoppingBag className="h-3.5 w-3.5 text-zinc-500" />;
    }
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-white dark:bg-zinc-950 shadow-sm transition-all">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none pb-2"
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Available APIs
          </span>
          <span className="text-[10px] text-zinc-400">x402 Bazaar</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); fetchServices(); }}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded transition-colors">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex flex-col gap-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-4 text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-xs">Discovering services...</span>
            </div>
          ) : services.length === 0 ? (
            <div className="text-xs text-zinc-400 text-center py-4">
              No services discovered
            </div>
          ) : (
            <>
              <div className="text-[10px] text-zinc-400 leading-tight">
                x402 paid services discovered from Bazaar. Click to trigger a micro-payment call.
              </div>
              <div className="flex flex-col gap-2 mt-1">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => onTriggerService?.(service)}
                    className="group flex flex-col gap-1 p-2 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {getIcon(service.icon)}
                        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                          {service.name}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {service.price} {service.pricingToken}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400 pt-0.5 border-t border-zinc-100 dark:border-zinc-800/50">
                      <span>by {service.provider}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
