import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchDatasets } from '@/services/api/datasetApi.service';
import { fetchModels } from '@/services/api/modelApi.service';
import {
  Database,
  Layers,
  ArrowRight,
  ShieldCheck,
  Tag,
  Key,
  Cpu,
  FileCode2,
} from 'lucide-react';

export default function MarketplacePreview() {
  const [activeTab, setActiveTab] = useState('datasets'); // 'datasets' | 'models'

  const { data: datasetsData, isLoading: loadingDatasets } = useQuery({
    queryKey: ['landingMarketplaceDatasets'],
    queryFn: () => fetchDatasets({ limit: 4 }),
    staleTime: 60000,
  });

  const { data: modelsData, isLoading: loadingModels } = useQuery({
    queryKey: ['landingMarketplaceModels'],
    queryFn: () => fetchModels({ limit: 4 }),
    staleTime: 60000,
  });

  const datasets = Array.isArray(datasetsData?.data?.datasets)
    ? datasetsData.data.datasets
    : Array.isArray(datasetsData?.data)
    ? datasetsData.data
    : [];

  const models = Array.isArray(modelsData?.data?.models)
    ? modelsData.data.models
    : Array.isArray(modelsData?.data)
    ? modelsData.data
    : [];

  const isLoading = activeTab === 'datasets' ? loadingDatasets : loadingModels;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-white/[0.06]">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F1522] border border-white/10 text-xs font-mono text-[#40D9F2] uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#40D9F2]" />
            <span>EXPLORE THE ECOSYSTEM</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7FC] tracking-tight mb-3">
            Everything you need to build with AI.
          </h2>
          <p className="text-[#A1ACBF] text-sm sm:text-base max-w-2xl font-sans">
            Discover datasets and models, evaluate their details, and access the assets that power your next AI project.
          </p>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0A0E16] border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('datasets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'datasets'
                ? 'bg-[#0F1522] text-[#F4F7FC] border border-white/10 shadow-sm'
                : 'text-[#A1ACBF] hover:text-[#F4F7FC]'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-[#40D9F2]" />
            <span>AI Datasets</span>
            {datasets.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#3976F6]/20 text-[#40D9F2]">
                {datasets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('models')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'models'
                ? 'bg-[#0F1522] text-[#F4F7FC] border border-white/10 shadow-sm'
                : 'text-[#A1ACBF] hover:text-[#F4F7FC]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#4F7DFF]" />
            <span>AI Models</span>
            {models.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#4F7DFF]/20 text-[#818CF8]">
                {models.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Asset Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[#0A0E16] border border-white/10 animate-pulse space-y-4"
            >
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-6 bg-slate-800 rounded w-3/4" />
              <div className="h-16 bg-slate-800 rounded w-full" />
              <div className="h-4 bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : activeTab === 'datasets' ? (
        datasets.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0A0E16] border border-white/10">
            <Database className="w-8 h-8 text-[#737F93] mx-auto mb-3" />
            <p className="text-[#A1ACBF] text-sm">No datasets registered in catalog yet.</p>
            <Link
              to="/datasets/register"
              className="inline-block mt-4 text-xs font-semibold text-[#40D9F2] hover:underline"
            >
              Register First Dataset &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {datasets.slice(0, 4).map((dataset) => {
              const id = dataset._id || dataset.blockchain?.datasetId || dataset.id;
              const title = dataset.title || `Dataset #${dataset.blockchain?.datasetId || '1'}`;
              const category = dataset.category || 'General Telemetry';
              const license = dataset.license || 'Academic';
              const owner = dataset.blockchain?.owner
                ? `${dataset.blockchain.owner.slice(0, 6)}...${dataset.blockchain.owner.slice(-4)}`
                : '0xf39F...2266';
              const royaltyBps = dataset.royaltyBps || 250;
              const royaltyPct = (royaltyBps / 100).toFixed(2);

              return (
                <div
                  key={id}
                  className="p-6 rounded-2xl bg-[#0A0E16] border border-white/[0.08] hover:border-[#4F7DFF]/40 transition-all duration-200 flex flex-col justify-between group shadow-lg shadow-black/40"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0F1522] text-[#40D9F2] border border-white/10 uppercase tracking-wider truncate max-w-[140px]">
                        {category}
                      </span>
                      <span className="text-[10px] font-mono text-[#737F93]">
                        {royaltyPct}% Royalty
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#F4F7FC] group-hover:text-[#40D9F2] transition-colors line-clamp-1">
                      {title}
                    </h3>

                    <p className="text-xs text-[#A1ACBF] line-clamp-2 leading-relaxed">
                      {dataset.description || 'Verified on-chain dataset with immutable IPFS payload.'}
                    </p>

                    <div className="pt-3 border-t border-white/[0.06] space-y-1.5 text-[11px] font-mono text-[#737F93]">
                      <div className="flex items-center justify-between">
                        <span>License:</span>
                        <span className="text-[#A1ACBF] truncate max-w-[120px]">{license}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Owner:</span>
                        <span className="text-[#A1ACBF]">{owner}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-[#F4F7FC]">
                      AIX Licensed
                    </span>
                    <Link
                      to={`/datasets/${id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#40D9F2] hover:text-white transition-colors"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : models.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0A0E16] border border-white/10">
          <Layers className="w-8 h-8 text-[#737F93] mx-auto mb-3" />
          <p className="text-[#A1ACBF] text-sm">No models anchored yet.</p>
          <Link
            to="/models/register"
            className="inline-block mt-4 text-xs font-semibold text-[#4F7DFF] hover:underline"
          >
            Register AI Model &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {models.slice(0, 4).map((model) => {
            const id = model._id || model.blockchainModelId;
            const name = model.name || `Model #${model.blockchainModelId || '1'}`;
            const framework = model.framework || 'PyTorch';
            const owner = model.ownerWallet
              ? `${model.ownerWallet.slice(0, 6)}...${model.ownerWallet.slice(-4)}`
              : '0xf39F...2266';
            const hash = model.versions?.[0]?.modelHash || 'e3b0c44298fc1c149af...';

            return (
              <div
                key={id}
                className="p-6 rounded-2xl bg-[#0A0E16] border border-white/[0.08] hover:border-[#4F7DFF]/40 transition-all duration-200 flex flex-col justify-between group shadow-lg shadow-black/40"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0F1522] text-[#818CF8] border border-white/10 uppercase tracking-wider">
                      {framework}
                    </span>
                    <span className="text-[10px] font-mono text-[#737F93]">
                      v{model.currentVersion || 1}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F4F7FC] group-hover:text-[#818CF8] transition-colors line-clamp-1">
                    {name}
                  </h3>

                  <p className="text-xs text-[#A1ACBF] line-clamp-2 leading-relaxed">
                    {model.description || 'Deep learning neural network weights validated with cryptographic checksum.'}
                  </p>

                  <div className="pt-3 border-t border-white/[0.06] space-y-1.5 text-[11px] font-mono text-[#737F93]">
                    <div className="flex items-center justify-between">
                      <span>Owner:</span>
                      <span className="text-[#A1ACBF]">{owner}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Digest:</span>
                      <span className="text-[#A1ACBF]">{hash.slice(0, 8)}...</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#F4F7FC]">
                    SHA-256 Anchored
                  </span>
                  <Link
                    to={`/models/${id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#818CF8] hover:text-white transition-colors"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Link to Full Catalog */}
      <div className="mt-10 flex justify-center">
        <Link
          to={activeTab === 'datasets' ? '/datasets' : '/models'}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F1522] hover:bg-[#0A0E16] text-[#F4F7FC] text-xs font-semibold border border-white/10 hover:border-white/20 transition-all shadow-sm"
        >
          <span>View Full {activeTab === 'datasets' ? 'Dataset Catalog' : 'Model Marketplace'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#40D9F2]" />
        </Link>
      </div>
    </section>
  );
}
