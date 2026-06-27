import { LandingHeader } from "@/components/landing/landing-header";
import { Hero } from "@/components/landing/hero";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { Features } from "@/components/landing/features";
import { SocialProof } from "@/components/landing/social-proof";
import { PreRegisterCta } from "@/components/landing/pre-register-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

/**
 * Public sales landing page — assembled top-to-bottom from the landing sections.
 * Server Component: the whole page is rendered statically on the server. Only the
 * waitlist form (`PreRegisterCta`) opts into "use client" as an interactive island.
 */
export function LandingView() {
  return (
    <>
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <ProblemSolution />
        <Features />
        <SocialProof />
        <PreRegisterCta />
      </main>
      <LandingFooter />
    </>
  );
}
