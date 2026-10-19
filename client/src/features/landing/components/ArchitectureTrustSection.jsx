import { HardDrive, Server, ShieldCheck, LockKeyhole, Cpu, Terminal } from 'lucide-react';

export default function ArchitectureTrustSection() {
  const pillars = [
    {
      title: 'Content-Addressed Storage',
      subtitle: 'InterPlanetary File System (IPFS)',
      description: 'Training datasets and neural weight tensors are stored off-chain on IPFS. CIDs provide cryptographic immutability, ensuring files cannot be altered once referenced.',
      icon: HardDrive,
      tag: 'Off-Chain Payloads',
    },
    {
      title: 'Smart Contract Consensus',
      subtitle: 'Ethereum / Hardhat Ledger',
      description: 'Asset ownership, access control bitmasks, provenance tuples, and royalty splits are verified and permanently recorded on-chain by audited Solidity contracts.',
      icon: Server,
      tag: 'On-Chain Registries',
    },
    {
      title: 'Confidential Container Enclaves',
      subtitle: 'Unprivileged Docker Runtimes',
      description: 'PyTorch workloads execute in isolated, non-root Linux containers with strict CPU/memory limits, ephemeral filesystems, and unprivileged user isolation (UID 1000).',
      icon: Terminal,
      tag: 'Secure Execution',
    },
    {
      title: 'Cryptographic Attestation',
      subtitle: 'EIP-191 & SHA-256 Hashes',
      description: 'All operations require EIP-191 personal cryptographic signatures from account keys, while model checkpoints are verified via deterministic SHA-256 weight checksums.',
      icon: LockKeyhole,
      tag: 'Cryptographic Proof',
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-white/[0.06]">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F1522] border border-white/10 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SECURITY &amp; SYSTEM INTEGRITY</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7FC] tracking-tight mb-3">
          Decentralized where it matters. High-performance where it counts.
        </h2>
        <p className="text-[#A1ACBF] text-sm sm:text-base font-sans">
          AIXchange strategically combines content-addressed decentralized storage, Ethereum consensus, and confidential containerized execution for enterprise-grade integrity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#0A0E16] border border-white/[0.08] hover:border-[#4F7DFF]/40 transition-all duration-200 flex flex-col justify-between shadow-lg shadow-black/40"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0F1522] border border-white/10 flex items-center justify-center text-[#40D9F2]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-[#737F93] px-2 py-0.5 rounded-full bg-[#0F1522] border border-white/10">
                    {item.tag}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-[#737F93] uppercase tracking-wider mb-1">
                  {item.subtitle}
                </div>
                <h3 className="text-base font-bold text-[#F4F7FC] mb-2">{item.title}</h3>
                <p className="text-xs text-[#A1ACBF] leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Architecture Verified</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
