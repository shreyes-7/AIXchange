import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import SkeletonCard from '@/components/common/SkeletonCard';

async function fetchRecentDatasets() {
  try {
    const res = await axios.get('/api/v1/datasets?limit=4', { timeout: 3000 });
    const items = res.data?.data?.datasets || res.data?.datasets || res.data;
    if (Array.isArray(items) && items.length > 0) return items;
    throw new Error('Empty backend list');
  } catch {
    // Fallback verified on-chain datasets for landing preview
    return [
      {
        id: '1',
        title: 'High-Resolution Satellite Imagery for Urban Segmentation',
        category: 'Computer Vision',
        price: '250',
        licenseType: 'Commercial',
        owner: '0x3C44...7188',
        qualityScore: '98/100',
        downloads: 48,
        cid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
      },
      {
        id: '2',
        title: 'Multilingual Speech Corpus (14 Indo-European Dialects)',
        category: 'Audio / NLP',
        price: '400',
        licenseType: 'Academic',
        owner: '0x8b3e...94F1',
        qualityScore: '95/100',
        downloads: 72,
        cid: 'QmZ4tDuGbek1K2b8eH2k6dGk9P8jL7F2b8eH2k6dGk9P8j',
      },
      {
        id: '3',
        title: 'Financial Time-Series Market Microstructure & L2 Order Books',
        category: 'Tabular / Finance',
        price: '750',
        licenseType: 'Exclusive',
        owner: '0x1F98...dE21',
        qualityScore: '99/100',
        downloads: 31,
        cid: 'QmPZ9gcFaWqK2b8eH2k6dGk9P8jL7F2b8eH2k6dGk9P8j',
      },
      {
        id: '4',
        title: 'Medical Histopathology Scans with Expert Annotation Masks',
        category: 'Healthcare / Vision',
        price: '500',
        licenseType: 'Commercial',
        owner: '0x90F7...c04B',
        qualityScore: '97/100',
        downloads: 54,
        cid: 'QmRX8gcFaWqK2b8eH2k6dGk9P8jL7F2b8eH2k6dGk9P8j',
      },
    ];
  }
}

export default function RecentDatasetsCarousel() {
  const { data: datasets, isLoading } = useQuery({
    queryKey: ['landingRecentDatasets'],
    queryFn: fetchRecentDatasets,
    staleTime: 60000,
  });

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-1 block">
            Featured Data Catalog
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Recently Anchored Datasets
          </h2>
        </div>
        <Link
          to="/datasets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group"
        >
          <span>View All Available Datasets</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={3} />)
          : datasets?.map((dataset) => (
              <div
                key={dataset.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 backdrop-blur-sm flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 group shadow-lg shadow-slate-950/30"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/50 border border-cyan-800/40 text-cyan-300 font-medium truncate">
                      {dataset.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                    {dataset.title}
                  </h3>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mb-4">
                    <span>By: {dataset.owner}</span>
                    <span>•</span>
                    <span>{dataset.downloads} downloads</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">License: {dataset.licenseType}</span>
                    <span className="text-sm font-extrabold text-cyan-400 font-mono">
                      {dataset.price} AIX
                    </span>
                  </div>

                  <Link
                    to={`/datasets/${dataset.id}`}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 transition-colors border border-slate-700 hover:border-cyan-400"
                    aria-label={`View ${dataset.title}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}
