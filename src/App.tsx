import {
  Upload,
  Network,
  TrendingUp,
  Layout,
  Settings,
  Link,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, easeOut } from "framer-motion";
import logo from "./landingLogo.png";
import emo from "./emoEnergy.jpeg"
import oneAI from "./oneAI.jpeg"
import NeoFab from "./logo512.png"

const fadeUpInitial = { opacity: 0, y: 60, scale: 0.95 };
const fadeUpTarget = (i = 0) => ({
  opacity: 1,
  y: 0,
  scale: 1,
  transition: {
    delay: i * 0.25,
    duration: 0.8,
    ease: easeOut,
  },
});

const LandingPage = () => {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const navigate = useNavigate();

  const handleAboutClick = () => {
    setShowAboutModal(true);
  };

  const handleCloseModal = () => {
    setShowAboutModal(false);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 text-sm sm:text-base">

      {/* About Us */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="bg-white text-gray-800 rounded-lg max-w-4xl w-full p-8 relative shadow-xl border-4 border-[#203a43]"
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-6 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              &times;
            </button>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Logo Section */}
              <div className="w-full md:w-1/3 flex items-center justify-center">
                <div className="overflow-hidden rounded-lg border-2 border-gray-200 p-4 bg-gray-50">
                  <img
                    src={NeoFab}
                    alt="NeoFab Logo"
                    className="w-full h-auto max-h-64 object-contain"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="w-full md:w-2/3">
                <h2 className="text-2xl font-bold mb-6 text-[#203a43] border-b-2 border-[#203a43] pb-2">
                  About NeoFab
                </h2>
                <div className="space-y-4 text-sm sm:text-base leading-relaxed">
                  <p>
                    NeoFabAI is an end-to-end software solution for modern manufacturers looking to scale quickly and efficiently. Founded by three entrepreneurs with backgrounds in engineering, AI and management, NeoFabAI represents a revolution in manufacturing planning and execution.
                  </p>
                  <p>
                    Our platform allows companies to upload their designs and drawings to instantly generate full-scale factory layouts and detailed execution plans. This innovation reduces the time and cost of scaling production, making it a game-changer for startups and established manufacturers alike.
                  </p>
                  <p>
                    What sets NeoFabAI apart is its comprehensive approach - we support manufacturers from start to finish with plans, suppliers, layouts and even become the Manufacturing Execution System (MES) once the factory is operational, creating a continuous improvement cycle.
                  </p>
                  <p className="font-semibold text-[#203a43]">
                    What a team of 5 would take 4 weeks to accomplish, NeoFabAI can deliver in just 30 minutes - with higher precision and greater detail.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
        {/* Navigation */}
        <nav className="z-20 relative flex flex-wrap sm:flex-nowrap items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto">
          <div className="text-2xl sm:text-3xl font-bold">NeoFab</div>
          <div className="flex flex-wrap items-center gap-4 mt-2 sm:mt-0 text-sm sm:text-base">
            <a
              href="#"
              onClick={handleAboutClick}
              className="hover:text-white/80 cursor-pointer"
            >
              About Us
            </a>

            <button
              className="ml-8 bg-white text-[#203a43] hover:bg-white/90 font-semibold px-4 py-2 rounded"
              onClick={handleLoginClick}
            >
              Log In
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 min-h-[90vh] lg:min-h-[80vh] flex items-start lg:items-center pt-10 lg:pt-0">
          <div className="px-4 sm:px-6 max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Text */}
              <motion.div
                className="text-center lg:text-left"
                initial={fadeUpInitial}
                whileInView={fadeUpTarget(0)}
                viewport={{ once: false, amount: 0.3 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-14 lg:mb-16">
                  The Future of<br />Manufacturing
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-slate-100 mb-12 lg:mb-14 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  NeoFabAI instantly transforms your designs into scalable factory layouts, accelerating manufacturing growth for innovators.
                </p>
                <button
                  className="bg-white text-[#203a43] hover:bg-white/90 px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-semibold rounded"
                  onClick={handleLoginClick}>
                  Get Started
                </button>
              </motion.div>

              {/* Logo/Image */}
              <motion.div
                className="flex justify-center lg:justify-end"
                initial={fadeUpInitial}
                whileInView={fadeUpTarget(1)}
                viewport={{ once: false, amount: 0.3 }}
              >
                <img
                  src={logo}
                  alt="NeoFab Logo"
                  className="w-48 sm:w-64 lg:w-[340px] h-auto object-contain"
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0] z-0">
          <svg
            className="relative block w-full h-[120px] sm:h-[150px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              d="M0,160 C360,320 1080,0 1440,160 L1440,320 L0,320 Z"
            />
          </svg>
        </div>
      </div>

      {/* How it works */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold mb-10 sm:mb-14"
            initial={fadeUpInitial}
            whileInView={fadeUpTarget(0)}
            viewport={{ once: false, amount: 0.3 }}
          >
            How it works
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {[
              { icon: <Upload />, title: "Input Design", text: "Upload a part design or process diagram" },
              { icon: <Network />, title: "Generate workflow", text: "Let the AI analyze and create a workflow" },
              { icon: <TrendingUp />, title: "Improve production", text: "Get recommendations for optimization" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={fadeUpInitial}
                whileInView={fadeUpTarget(i)}
                viewport={{ once: false, amount: 0.3 }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-[#203a43]">
                  {item.icon}
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-normal px-4">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="py-12 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-sm sm:text-md font-medium text-gray-600 mb-6 sm:mb-8">
            Trusted by
          </h3>

          {/* Logos */}
          <div className="flex flex-wrap justify-center items-center gap-y-6 gap-x-10 mb-8">
            {[
              {
                name: "Emo Energy",
                href: "https://www.emoenergy.in",
                src: emo,
              }
            ].map((company, i) => (
              <motion.a
                key={company.name}
                href={company.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.25, duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.5 }}
                className="flex flex-col items-center group w-[120px] sm:w-[140px]"
              >
                <img
                  src={company.src}
                  alt={company.name}
                  className="h-16 sm:h-20 w-auto object-contain rounded-md shadow group-hover:scale-105 transition-transform duration-300"
                />
                <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-[#203a43] transition-colors">
                  {company.name}
                </span>
              </motion.a>
            ))}
          </div>

        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold mb-10 sm:mb-14"
            initial={fadeUpInitial}
            whileInView={fadeUpTarget(0)}
            viewport={{ once: false, amount: 0.3 }}
          >
            Key Features
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {[
              { icon: <Layout />, title: "Factory Layout", text: "Generate a complete production layout for your design" },
              { icon: <Settings />, title: "Process Optimization", text: "Enhance processes with AI-driven suggestions" },
              { icon: <Link />, title: "Supply integration", text: "Connect with suppliers to source machines and parts" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={fadeUpInitial}
                whileInView={fadeUpTarget(i)}
                viewport={{ once: false, amount: 0.3 }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-[#203a43]">
                  {item.icon}
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-normal px-4">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us */}
      <section className="bg-[#203a43] text-white py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold mb-6"
            initial={fadeUpInitial}
            whileInView={fadeUpTarget(0)}
            viewport={{ once: true }}
          >
            Contact Us
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg mb-10 text-white/80"
            initial={fadeUpInitial}
            whileInView={fadeUpTarget(0.2)}
            viewport={{ once: true }}
          >
            Interested in transforming your manufacturing process? Let’s talk about how NeoFab can work for you.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left text-white/90">
            {/* Email */}
            <motion.div
              initial={fadeUpInitial}
              whileInView={fadeUpTarget(0.3)}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-2">Email</h4>
              <p>
                <a href="mailto:hello@neofab.ai" className="hover:underline">
                  hello@neofab.ai
                </a>
              </p>
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={fadeUpInitial}
              whileInView={fadeUpTarget(0.4)}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-2">Phone</h4>
              <p>
                <a href="tel:+919820889677" className="hover:underline">
                  +91 98208 89677
                </a>
              </p>
            </motion.div>

            {/* Address */}
            <motion.div
              initial={fadeUpInitial}
              whileInView={fadeUpTarget(0.5)}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-2">Address</h4>
              <p>
                NeoFabAI<br />
                130 Boren Ave<br />
                Seattle, WA 98109
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer / Copyright */}
      <footer className="bg-gray-100 text-center py-4 text-sm text-gray-600">
        © {new Date().getFullYear()} NeoFabAI. All rights reserved.
      </footer>

    </div>
  );
};

export default LandingPage;
