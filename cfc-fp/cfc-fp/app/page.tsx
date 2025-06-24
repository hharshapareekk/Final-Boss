"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleFeedbackClick = () => {
    router.push("/feedback");
  };

  const programs = [
    {
      name: "School Kit",
      description:
        "We provide complete school kits including notebooks, uniforms, and stationery to underprivileged children.",
      icon: "📚",
      stats: "10,000+ kits delivered",
    },
    {
      name: "Kishori Vikas",
      description:
        "Empowerment program for adolescent girls focusing on education, health, and life skills.",
      icon: "👧",
      stats: "2,000+ girls mentored",
    },
    {
      name: "Seva Kiran",
      description:
        "Community service initiatives supporting elderly care and disability assistance programs.",
      icon: "🤝",
      stats: "500+ families helped monthly",
    },
    {
      name: "Samutkarsh",
      description:
        "Comprehensive rural development including water conservation and organic farming training.",
      icon: "🌱",
      stats: "20+ villages transformed",
    },
    {
      name: "Skill Development",
      description:
        "Vocational training in trades like electrician, plumbing, and computer skills for employability.",
      icon: "💻",
      stats: "1,200+ individuals trained",
    },
    {
      name: "Urban Forestation",
      description:
        "Creating green spaces in cities through community-led tree plantation and maintenance.",
      icon: "🌳",
      stats: "5,000+ trees planted",
    },
  ];

  return (
    <div className="relative min-h-screen bg-white">
      {/* Elegant Header */}
      <header className="bg-[#19486a] text-white shadow-lg py-4 w-full sticky top-0 z-50 flex items-center justify-between px-8">
        <div className="flex items-center">
          <img src="/images/logo.png" alt="Logo" className="h-10 w-10 mr-3" />
          <span className="text-2xl font-bold">Seva Sahayog</span>
        </div>
        {/* (You can keep other header content here) */}
      </header>
      {/* Admin Button - now below the header */}
      <div className="flex justify-end w-full" style={{ position: 'relative', zIndex: 100 }}>
        <div className="mt-8 mr-12">
          <Link href="/login">
            <button className="bg-[#19486a] text-white font-extrabold text-xl px-10 py-4 rounded-2xl shadow-lg border-4 border-blue-300 hover:bg-blue-600 hover:text-white transition-all duration-200">
              Admin
            </button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto py-16 px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#19486a] mb-6 leading-tight">
            Empowering Communities Through{" "}
            <span className="text-[#f97316]">Action</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join us in creating sustainable change through education,
            environment, and empowerment initiatives.
          </p>
          <button
            onClick={handleFeedbackClick}
            className="bg-[#19486a] hover:bg-[#123456] text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center mx-auto space-x-2"
          >
            <span>Share Your Experience</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </button>
        </section>

        {/* Flipping Cards Section */}
        <section className="max-w-7xl mx-auto py-12 px-6">
          <h2 className="text-3xl font-bold text-center text-[#19486a] mb-12 relative">
            Our Initiatives
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-[#f97316] rounded-full"></span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div
                key={index}
                className="flip-card h-72 w-full cursor-pointer group perspective-1000"
              >
                <div className="flip-card-inner relative w-full h-full transition-transform duration-500 transform-style-preserve-3d">
                  {/* Front of Card */}
                  <div className="flip-card-front absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center border-2 border-transparent group-hover:border-[#19486a] transition-all">
                    <span className="text-4xl mb-3">{program.icon}</span>
                    <h3 className="text-xl font-bold text-[#19486a] text-center">
                      {program.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-2">
                      Hover to learn more
                    </p>
                  </div>

                  {/* Back of Card */}
                  <div className="flip-card-back absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg p-6 transform-rotate-y-180 border-2 border-[#19486a]">
                    <h3 className="text-lg font-bold text-[#19486a] mb-3">
                      {program.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {program.description}
                    </p>
                    <div className="mt-auto bg-[#19486a]/10 px-3 py-2 rounded-md">
                      <p className="text-[#19486a] text-xs font-semibold">
                        {program.stats}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Custom Styles for Flip Cards */}
      <style jsx global>{`
        .flip-card {
          perspective: 1000px;
        }
        .flip-card-inner {
          transition: transform 2s;
          transform-style: preserve-3d;
        }
        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front,
        .flip-card-back {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
