import PublicShell from '@/layouts/PublicShell';
import ErrorBoundary from '@/components/feedback/ErrorBoundary';
import HeroSection from '@/features/landing/components/HeroSection';
import LiveStatsBanner from '@/features/landing/components/LiveStatsBanner';
import FeatureMatrix from '@/features/landing/components/FeatureMatrix';
import ProvenanceTeaser from '@/features/landing/components/ProvenanceTeaser';
import RecentDatasetsCarousel from '@/features/landing/components/RecentDatasetsCarousel';
import CallToActionCard from '@/features/landing/components/CallToActionCard';

export default function LandingPage() {
  return (
    <PublicShell>
      <div className="w-full flex flex-col items-center">
        <ErrorBoundary>
          <HeroSection />
        </ErrorBoundary>

        <ErrorBoundary>
          <LiveStatsBanner />
        </ErrorBoundary>

        <ErrorBoundary>
          <FeatureMatrix />
        </ErrorBoundary>

        <ErrorBoundary>
          <ProvenanceTeaser />
        </ErrorBoundary>

        <ErrorBoundary>
          <RecentDatasetsCarousel />
        </ErrorBoundary>

        <ErrorBoundary>
          <CallToActionCard />
        </ErrorBoundary>
      </div>
    </PublicShell>
  );
}
