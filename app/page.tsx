import Effects from "@/components/Effects";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";
import Cursor from "@/components/motion/Cursor";
import Marquee from "@/components/motion/Marquee";
import Preloader from "@/components/motion/Preloader";
import ScrollFX from "@/components/motion/ScrollFX";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Statement from "@/components/motion/Statement";
import {
  About, Achievements, Certifications, Experience, Process, Projects, Skills, Stats, Testimonials,
} from "@/components/Sections";

export default function Home() {
  return (
    <>
      <div aria-hidden className="aurora" />
      <SmoothScroll />
      <Preloader />
      <Cursor />
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Statement />
        <About />
        <Marquee />
        <Experience />
        <Skills />
        <Process />
        <Projects />
        <Certifications />
        <Testimonials />
        <Achievements />
      </main>
      <Footer />
      <Effects />
      <ChatWidget />
      <ScrollFX />
      <div aria-hidden className="grain" />
    </>
  );
}
