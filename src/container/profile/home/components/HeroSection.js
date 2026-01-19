import logo from '../../../../assets/images/home/banner.png';

function HeroSection() {
  return (
    <div className=" px-[3%] pt-20 lg:pt-10 ">
      <div className="flex flex-col justify-between w-full rounded-[40px] bg-[linear-gradient(111deg,#22C55E_18%,#10B981_100%)] p-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-7xl md:text-5xl lg:text-4xl font-extrabold tracking-tight">
            AI Finance Co-Pilot for Consumer Brands
          </h1>
        </div>

        <div className="grid lg:grid-cols-1 grid-cols-2 lg:gap-6 lg-12 items-center rounded-[40px] bg-white p-5">
          {/* Left - Text + CTA */}
          <div className="space-y-8 p-5">
            <p className="text-xl font-medium text-gray-800 leading-relaxed">
              Understand numbers, boost profit margins, recover payments, and forecast inventory with an AI agent that
              works like your smartest finance analyst.
            </p>

            <p className="text-lg text-gray-700">
              Ask any question — get exact data & recommended actions.
              <br />
              From SKU-level margins to marketplace reconciliation — no more dashboard hunting.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                className="px-8 py-2 text-white font-semibold rounded-md
             bg-[linear-gradient(111deg,#22C55E_18%,#10B981_100%)]
             shadow-lg hover:opacity-90 transition"
              >
                Try The AI Co-Pilot
              </button>
              <button type="button" className="px-8 py-2 bg-white font-semibold rounded-md shadow-lg">
                Book A Demo
              </button>
            </div>
          </div>

          {/* Right - Chat Demo */}
          <div className="rounded-[40px] overflow-hidden">
            {/* Replace with GIF or MP4 from public folder */}
            <div className="w-full max-h-96 ">
              <img src={logo} alt="AI Finance Demo" className="w-full h-full rounded-[40px] object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
