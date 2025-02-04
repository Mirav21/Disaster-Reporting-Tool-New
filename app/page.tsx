import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Bolt,
  Globe,
  Heart,
  Users,
  Activity,
  ArrowRight,
  AlertTriangle,
  Check,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      title: "Real-Time Data Sharing",
      description:
        "Instant processing and sharing of critical disaster information with emergency responders.",
      icon: <Bolt className="h-6 w-6" />,
    },
    {
      title: "Guaranteed Anonymity",
      description:
        "Advanced privacy protocols ensure complete protection of reporter identities.",
      icon: <ShieldCheck className="h-6 w-6" />,
    },
    {
      title: "Nationwide Network",
      description:
        "Collaborative platform connecting communities and emergency services.",
      icon: <Globe className="h-6 w-6" />,
    },
  ];

  const impactStats = [
    {
      value: "100K+",
      label: "Reports Submitted",
      icon: <Activity className="h-8 w-8 text-green-600 dark:text-green-500" />,
    },
    {
      value: "50K+",
      label: "Lives Impacted",
      icon: <Heart className="h-8 w-8 text-green-600 dark:text-green-500" />,
    },
    {
      value: "500+",
      label: "Communities Supported",
      icon: <Users className="h-8 w-8 text-green-600 dark:text-green-500" />,
    },
  ];

  const emergencyTypes = [
    "Natural Disasters",
    "Infrastructure Damage",
    "Public Safety Threats",
    "Environmental Hazards",
    "Severe Weather Events",
    "Geological Hazards",
  ];

  const testimonials = [
    {
      quote:
        "This platform helped our community coordinate emergency responses during the recent floods.",
      author: "Emergency Response Coordinator",
      location: "Portland, OR",
    },
    {
      quote:
        "The anonymous reporting feature gave us crucial early warnings about developing situations.",
      author: "Local Police Chief",
      location: "Austin, TX",
    },
  ];

  return (
    <main className="relative min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 via-white to-green-50/20 dark:from-green-900/30 dark:via-black dark:to-green-700/20 opacity-70" />
      <div className="absolute inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="mx-auto max-w-6xl px-4 relative z-10">
        {/* Enhanced Hero Section */}
        <section className="pt-14 md:pt-2 lg:pt-3 text-center">
          <div className="inline-flex items-center gap-2 mt-5 mb-4 rounded-full border border-green-500/30 bg-green-50 dark:bg-green-500/10 px-4 py-2 text-sm text-green-800 dark:text-white animate-pulse">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            24/7 Emergency Response Network
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="block text-zinc-900 dark:text-white">
              Empower Communities
            </span>
            <span className="block bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-500 bg-clip-text text-transparent">
              Report. Act. Recover.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-zinc-600 dark:text-green-100 mb-5">
            Our platform bridges the gap between those experiencing disasters
            and those who can help. By providing anonymous, real-time reporting,
            we enable swift and effective emergency responses.
          </p>

          <div className="flex flex-col sm:flex-col items-center justify-center gap-4">
            <div className="">
              <Link href="/submit-report">
                <button className="group relative flex h-12 items-center justify-center gap-2 rounded-xl bg-green-600 px-20 md:text-md lg:text-md sm:text-lg text-white transition-all hover:bg-green-500">
                  Submit Report 🚨
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
            </div>
            <div className="flex flex-row gap-2">
              <Link href="/howitworks">
                <button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-100 dark:bg-white/5 px-8 md:text-sm lg:text-sm sm:text-lg text-zinc-900 dark:text-white ring-1 ring-inset ring-zinc-900/10 dark:ring-white/10 transition-all hover:bg-zinc-200 dark:hover:bg-white/10">
                  How it Works
                </button>
              </Link>
              <Link href="/auth/signin">
                <button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-100 dark:bg-white/5 px-8 md:text-sm lg:text-sm sm:text-lg text-zinc-900 dark:text-white ring-1 ring-inset ring-zinc-900/10 dark:ring-white/10 transition-all hover:bg-zinc-200 dark:hover:bg-white/10">
                  Login
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="mt-10">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl p-6 hover:bg-green-100 dark:hover:bg-green-500/20 transition-all cursor-pointer"
              >
                <div className="bg-green-100 dark:bg-green-500/20 rounded-xl md:pd-3 lg:pd-3 md:mb-4 lg:mb-4 inline-block group-hover:bg-green-200 dark:group-hover:bg-green-500/30 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-zinc-900 dark:text-green-100">
                  {feature.title}
                </h3>
                <p className="text-zinc-600 dark:text-green-200 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency Types Section */}
        <section className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-white">
            Types of Emergencies We Monitor
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {emergencyTypes.map((type, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-zinc-50 dark:bg-white/5 rounded-lg p-4"
              >
                <Check className="h-5 w-5 text-green-600 dark:text-green-500" />
                <span className="text-zinc-700 dark:text-green-100">
                  {type}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Enhanced Impact Stats */}
        <section className="mt-24 text-center">
          <h2 className="text-4xl font-bold mb-6 text-zinc-900 dark:text-white">
            Our Collective Impact
          </h2>
          <p className="max-w-2xl mx-auto text-zinc-600 dark:text-green-200 mb-12">
            Together, we&apos;re building a more resilient and responsive
            emergency support ecosystem.
          </p>

          <div className="grid md:grid-cols-3 m-8 md:m-0 lg:m-0 gap-6">
            {impactStats.map((stat, index) => (
              <div
                key={index}
                className="bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl p-3 md:p-8 lg:p-8 flex flex-col items-center hover:transform hover:scale-105 transition-all"
              >
                {stat.icon}
                <h3 className="text-4xl font-bold mt-4 bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-500 bg-clip-text text-transparent">
                  {stat.value}
                </h3>
                <p className="text-zinc-600 dark:text-green-200 mt-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mt-24">
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-zinc-100 dark:bg-white/5 rounded-2xl p-8 border border-zinc-200 dark:border-white/10"
              >
                <p className="text-lg text-zinc-700 dark:text-green-100 mb-4">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="text-sm text-zinc-600 dark:text-green-300">
                  <p className="font-semibold">{testimonial.author}</p>
                  <p>{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 text-center bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-500/10 dark:to-teal-500/10 rounded-2xl p-12 border border-green-200 dark:border-green-500/20">
          <h2 className="text-4xl font-bold mb-6 text-zinc-900 dark:text-white">
            Join Our Mission
          </h2>
          <p className="max-w-2xl mx-auto text-zinc-600 dark:text-green-200">
            Become a critical part of our disaster response network. Your
            commitment can save lives and help communities rebuild.
          </p>
        </section>

        {/* Trust Badge */}
        <div className="mt-24 mb-20 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-zinc-100 dark:bg-zinc-900 px-5 py-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Trusted by Law Enforcement Nationwide
          </div>
        </div>
      </div>
    </main>
  );
}
