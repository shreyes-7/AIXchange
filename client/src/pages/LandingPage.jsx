import PublicShell from '@/layouts/PublicShell';
import ErrorBoundary from '@/components/feedback/ErrorBoundary';
import HeroSection from '@/features/landing/components/HeroSection';
import LiveStatsBanner from '@/features/landing/components/LiveStatsBanner';
import MarketplacePreview from '@/features/landing/components/MarketplacePreview';
import HowItWorks from '@/features/landing/components/HowItWorks';
import PlatformFeatures from '@/features/landing/components/PlatformFeatures';
import ProvenanceShowcase from '@/features/landing/components/ProvenanceShowcase';
import TokenEconomySection from '@/features/landing/components/TokenEconomySection';
import ArchitectureTrustSection from '@/features/landing/components/ArchitectureTrustSection';
import DeveloperCTA from '@/features/landing/components/DeveloperCTA';

export default function LandingPage() {
  return (
    <PublicShell>
      <div className="w-full flex flex-col items-center">
        {/* 1. Video-Backed Hero Section */}
        <ErrorBoundary>
          <HeroSection />
        </ErrorBoundary>

        {/* 2. Real Telemetry & On-Chain Metrics */}
        <ErrorBoundary>
          <LiveStatsBanner />
        </ErrorBoundary>

        {/* 3. Marketplace Preview with Real Datasets & Models */}
        <ErrorBoundary>
          <MarketplacePreview />
        </ErrorBoundary>

        {/* 4. How AIXchange Works (4-Step Workflow) */}
        <ErrorBoundary>
          <HowItWorks />
        </ErrorBoundary>

        {/* 5. Core Differentiators & Platform Features */}
        <ErrorBoundary>
          <PlatformFeatures />
        </ErrorBoundary>

        {/* 6. Dedicated Cryptographic Provenance Section */}
        <ErrorBoundary>
          <ProvenanceShowcase />
        </ErrorBoundary>

        {/* 7. AIX Token Economy & Value Flow */}
        <ErrorBoundary>
          <TokenEconomySection />
        </ErrorBoundary>

        {/* 8. Architecture, Trust & Security Pillars */}
        <ErrorBoundary>
          <ArchitectureTrustSection />
        </ErrorBoundary>

        {/* 9. Developer Call-To-Action & CLI Sandbox Launcher */}
        <ErrorBoundary>
          <DeveloperCTA />
        </ErrorBoundary>
      </div>
    </PublicShell>
  );
}
