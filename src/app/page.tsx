import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Trophy, Compass, BookOpen, Shield } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-emerald-50 to-amber-50" />
        <div className="absolute top-10 left-10 w-48 h-48 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="relative mx-auto max-w-4xl px-6 pt-16 pb-14 sm:pt-24 sm:pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-3 py-1 text-xs text-sky-700 shadow-sm mb-6 border border-sky-100">
            <Compass className="w-3.5 h-3.5" />
            GPS-Powered Learning Adventures
          </div>

          <div className="flex justify-center mb-2">
            <Image
              src="/logo-findamine.png"
              alt="findamine"
              width={280}
              height={70}
              priority
              className="h-auto"
            />
          </div>

          <p className="mt-4 text-lg sm:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            Turn any outdoor space into an interactive classroom. Create GPS scavenger hunts that make learning an adventure.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 transition-all hover:-translate-y-0.5"
            >
              Get Started Free
              <MapPin className="w-4 h-4" />
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-sky-300 hover:shadow-sm transition-all"
            >
              Browse Hunts
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Learning That Moves
        </h2>
        <p className="text-center text-gray-500 text-sm max-w-lg mx-auto mb-10">
          Built on research-backed pedagogy. Every hunt follows a proven 6-step learning cycle that turns exploration into deep understanding.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<MapPin className="w-5 h-5" />}
            title="GPS Scavenger Hunts"
            description="Navigate to real-world locations using a hot/cold GPS meter. Discover, explore, and learn at every stop."
            gradient="from-sky-500 to-blue-600"
          />
          <FeatureCard
            icon={<BookOpen className="w-5 h-5" />}
            title="6-Step Learning Cycle"
            description="Prime, Clue, Navigate, Challenge, Capture, Feedback. Research-backed flow that maximizes retention."
            gradient="from-emerald-500 to-teal-600"
          />
          <FeatureCard
            icon={<Users className="w-5 h-5" />}
            title="Team Collaboration"
            description="Cooperative scoring where every team member matters. Consensus voting, mentoring, and team chat."
            gradient="from-violet-500 to-purple-600"
          />
          <FeatureCard
            icon={<Trophy className="w-5 h-5" />}
            title="42 Badges to Earn"
            description="Learning mastery, physical activity, teamwork, creativity, and more. Growth mindset rewards that celebrate effort."
            gradient="from-amber-500 to-orange-600"
          />
          <FeatureCard
            icon={<Compass className="w-5 h-5" />}
            title="Age-Adaptive Design"
            description="The app transforms for every age group. Bright and playful for kids, sophisticated for teens, professional for adults."
            gradient="from-rose-500 to-pink-600"
          />
          <FeatureCard
            icon={<Shield className="w-5 h-5" />}
            title="Privacy-First for Kids"
            description="COPPA compliant. No data selling, ever. Parental controls, local-only photos for children, research-grade security."
            gradient="from-slate-500 to-gray-700"
          />
        </div>
      </section>

      {/* Stop Flow */}
      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            The findamine Stop Flow
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-sky-50 to-emerald-50 flex items-center justify-center text-xl">
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Step {s.step}</div>
                  <div className="font-semibold text-sm text-gray-900">{s.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-2xl px-6 py-14 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Ready to Explore?
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Teachers, parents, and learners of all ages. Free to start.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            Create Free Account
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-sky-300 transition-all"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-6 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
          <div className="font-bold text-gray-900">findamine</div>
          <div className="flex gap-6">
            <Link href="/browse" className="hover:text-gray-600">Browse Hunts</Link>
            <Link href="/register" className="hover:text-gray-600">Sign Up</Link>
            <Link href="/login" className="hover:text-gray-600">Sign In</Link>
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
    <div className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className={`inline-flex rounded-lg bg-gradient-to-br ${gradient} p-2 text-white shadow-sm mb-3`}>
        {icon}
      </div>
      <h3 className="font-semibold text-sm text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
