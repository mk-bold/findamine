import Link from "next/link";
import { MapPin, Users, Trophy, Compass, BookOpen, Shield } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-emerald-400 to-amber-300 opacity-10" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-36 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-4 py-1.5 text-sm text-sky-700 shadow-sm mb-8 border border-sky-100">
            <Compass className="w-4 h-4" />
            GPS-Powered Learning Adventures
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-sky-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
              Findamine
            </span>
          </h1>

          <p className="mt-6 text-xl sm:text-2xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Turn any outdoor space into an interactive classroom. Create GPS scavenger hunts that make learning an adventure.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 transition-all hover:-translate-y-0.5"
            >
              Get Started Free
              <MapPin className="w-5 h-5" />
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-[var(--color-border)] bg-white/80 backdrop-blur px-8 py-4 text-lg font-semibold text-[var(--color-text)] hover:border-sky-300 hover:shadow-md transition-all"
            >
              Browse Hunts
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-[var(--color-text)] mb-4">
          Learning That Moves
        </h2>
        <p className="text-center text-[var(--color-text-secondary)] max-w-xl mx-auto mb-16">
          Built on research-backed pedagogy. Every hunt follows a proven 6-step learning cycle that turns exploration into deep understanding.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<MapPin className="w-7 h-7" />}
            title="GPS Scavenger Hunts"
            description="Navigate to real-world locations using a hot/cold GPS meter. Discover, explore, and learn at every stop."
            gradient="from-sky-500 to-blue-600"
          />
          <FeatureCard
            icon={<BookOpen className="w-7 h-7" />}
            title="6-Step Learning Cycle"
            description="Prime, Clue, Navigate, Challenge, Capture, Feedback. Research-backed flow that maximizes retention."
            gradient="from-emerald-500 to-teal-600"
          />
          <FeatureCard
            icon={<Users className="w-7 h-7" />}
            title="Team Collaboration"
            description="Cooperative scoring where every team member matters. Consensus voting, mentoring, and team chat."
            gradient="from-violet-500 to-purple-600"
          />
          <FeatureCard
            icon={<Trophy className="w-7 h-7" />}
            title="42 Badges to Earn"
            description="Learning mastery, physical activity, teamwork, creativity, and more. Growth mindset rewards that celebrate effort."
            gradient="from-amber-500 to-orange-600"
          />
          <FeatureCard
            icon={<Compass className="w-7 h-7" />}
            title="Age-Adaptive Design"
            description="The app transforms for every age group. Bright and playful for kids, sophisticated for teens, professional for adults."
            gradient="from-rose-500 to-pink-600"
          />
          <FeatureCard
            icon={<Shield className="w-7 h-7" />}
            title="Privacy-First for Kids"
            description="COPPA compliant. No data selling, ever. Parental controls, local-only photos for children, research-grade security."
            gradient="from-slate-500 to-gray-700"
          />
        </div>
      </section>

      {/* Stop Flow */}
      <section className="bg-white/60 backdrop-blur py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold text-center text-[var(--color-text)] mb-16">
            The Findamine Stop Flow
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { step: "1", icon: "📖", name: "Prime", desc: "Review a concept before you explore" },
              { step: "2", icon: "🔍", name: "Clue", desc: "Decode the clue to find your next location" },
              { step: "3", icon: "🧭", name: "Navigate", desc: "Walk there using the hot/cold GPS meter" },
              { step: "4", icon: "🧩", name: "Challenge", desc: "Solve a location-based challenge" },
              { step: "5", icon: "📸", name: "Capture", desc: "Take a geo-selfie to prove you were there" },
              { step: "6", icon: "⭐", name: "Feedback", desc: "Get personalized growth mindset feedback" },
            ].map((s) => (
              <div
                key={s.step}
                className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center text-2xl">
                  {s.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Step {s.step}</div>
                  <div className="font-bold text-[var(--color-text)]">{s.name}</div>
                  <div className="text-sm text-[var(--color-text-secondary)] mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">
          Ready to Explore?
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-8">
          Teachers, parents, and learners of all ages. Free to start.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 px-8 py-4 text-lg font-bold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Create Free Account
          </Link>
          <Link
            href="/login"
            className="rounded-2xl border-2 border-[var(--color-border)] bg-white px-8 py-4 text-lg font-semibold text-[var(--color-text)] hover:border-sky-300 transition-all"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-white/50 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--color-text-secondary)]">
          <div className="font-bold text-[var(--color-text)]">Findamine</div>
          <div className="flex gap-6">
            <Link href="/browse" className="hover:text-[var(--color-text)]">Browse Hunts</Link>
            <Link href="/register" className="hover:text-[var(--color-text)]">Sign Up</Link>
            <Link href="/login" className="hover:text-[var(--color-text)]">Sign In</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className={`inline-flex rounded-xl bg-gradient-to-br ${gradient} p-3 text-white shadow-sm mb-4`}>
        {icon}
      </div>
      <h3 className="font-bold text-lg text-[var(--color-text)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{description}</p>
    </div>
  );
}
