'use client'
import React, { useState } from 'react';
import { Search, TrendingUp, Cpu, ShoppingBag, ChevronDown, ChevronUp, Layers, HelpCircle } from 'lucide-react';
import { PaidService } from '@/lib/types';

interface ServiceListProps {
  services: PaidService[];
  onTriggerService: (service: PaidService) => void;
}

export default function ServiceList({ services, onTriggerService }: ServiceListProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Dynamic Icon selector
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Search':
        return <Search className="h-3.5 w-3.5 text-blue-500" />;
      case 'TrendingUp':
        return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
      case 'Cpu':
        return <Cpu className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <ShoppingBag className="h-3.5 w-3.5 text-zinc-500" />;
    }
  };

  return (
    <div id="sidebar-services-card" className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-white dark:bg-zinc-950 shadow-sm transition-all">
      {/* Header collapsible */}
      <div 
        id="services-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none pb-2"
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Available APIs</span>
        </div>
        <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded transition-colors focus:outline-none">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && (
        <div id="services-card-content" className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex flex-col gap-2">
          <div className="text-[10px] text-zinc-400 leading-tight">
            Click on any paid service below to trigger a secure micro-payment call through our agent pipeline.
          </div>

          <div className="flex flex-col gap-2 mt-1">
            {services.map((service) => (
              <div
                key={service.id}
                id={`service-row-${service.id}`}
                onClick={() => onTriggerService(service)}
                className="group flex flex-col gap-1 p-2 rounded border border-zinc-150 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
              >
                {/* upper row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getIcon(service.icon)}
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-250 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                      {service.name}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {service.price} {service.pricingToken}
                  </span>
                </div>

                {/* description */}
                <p className="text-[10px] text-zinc-550 dark:text-zinc-400 leading-normal">
                  {service.description}
                </p>

                {/* provider and URL */}
                <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400 pt-0.5 border-t border-zinc-100 dark:border-zinc-900/50">
                  <span>by {service.provider}</span>
                  <span className="text-zinc-400 dark:text-zinc-500">{service.url}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
