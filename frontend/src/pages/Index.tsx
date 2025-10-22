import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PrimaryCTA } from "@/components/PrimaryCTA";
import { SubjectCard } from "@/components/SubjectCard";
import { FeatureCard } from "@/components/FeatureCard";
import { ChatDock } from "@/components/ChatDock";
import { Button } from "@/components/ui/button";
import { 
  Microscope, 
  Calculator, 
  Users, 
  ScanLine, 
  FileQuestion, 
  TrendingUp, 
  Search, 
  Download,
  ChevronDown
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const subjects = [
    {
      title: "Sci-Chat",
      subtitle: "Get instant answers to biology, chemistry, physics, and earth science questions with detailed explanations.",
      icon: Microscope,
    },
    {
      title: "Cal-Chat", 
      subtitle: "Solve complex mathematical problems with step-by-step solutions from algebra to calculus.",
      icon: Calculator,
    },
    {
      title: "Socio-Bot",
      subtitle: "Explore history, geography, economics, and social studies with comprehensive insights.",
      icon: Users,
    },
  ];

  const features = [
    {
      title: "OCR from PDF/Image",
      description: "Upload documents and images to extract text and get instant answers from your materials.",
      icon: ScanLine,
    },
    {
      title: "MCQ Mode",
      description: "Practice with multiple-choice questions tailored to your learning level and subject.",
      icon: FileQuestion,
    },
    {
      title: "Math Steps",
      description: "Get detailed step-by-step solutions for mathematical problems with clear explanations.",
      icon: TrendingUp,
    },
    {
      title: "Smart Retrieval",
      description: "Access curated knowledge from trusted educational sources and textbooks.",
      icon: Search,
    },
    {
      title: "Export Options",
      description: "Download your chat history in markdown or JSON format for future reference.",
      icon: Download,
    },
  ];

  const faqs = [
    {
      question: "What subjects does STEM Bot cover?",
      answer: "STEM Bot covers Science (Biology, Chemistry, Physics, Earth Science), Mathematics (Algebra through Calculus), and Social Sciences (History, Geography, Economics, Civics)."
    },
    {
      question: "Can I upload my own study materials?",
      answer: "Yes! STEM Bot features OCR technology that can read text from PDFs and images, allowing you to get answers directly from your textbooks and notes."
    },
    {
      question: "Is STEM Bot free to use?",
      answer: "STEM Bot is designed to be accessible to all students. Check our pricing page for current plans and free tier limitations."
    },
    {
      question: "How accurate are the answers?",
      answer: "STEM Bot uses advanced AI trained on educational content and verified sources. However, we always recommend double-checking important information and using it as a study aid."
    },
    {
      question: "Can I download my chat history?",
      answer: "Absolutely! You can export your conversations in markdown or JSON format to keep track of your learning progress."
    }
  ];

  const handleScrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(135deg, rgb(147, 51, 234), rgb(236, 72, 153))' }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'linear-gradient(135deg, rgb(236, 72, 153), rgb(251, 146, 60))' }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Animated badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block"
            >
              <div className="glass-light border border-glass-border rounded-full px-4 py-2 text-sm text-secondary">
                ✨ Powered by Advanced AI & Machine Learning
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold text-primary leading-tight">
              Your AI-Powered
              <span className="gradient-brand bg-clip-text text-transparent block mt-2"> STEM Companion </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-secondary max-w-3xl mx-auto leading-relaxed">
              Get instant, accurate answers for Science, Math, and Social Science questions. 
              Upload documents, solve problems step-by-step, and accelerate your learning journey.
            </p>
            
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <PrimaryCTA onClick={() => setIsChatOpen(true)}>
                Start Learning Now
              </PrimaryCTA>
              <Button variant="outline" size="lg" className="group">
                Watch Demo
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="pt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {[
                { label: 'Subjects', value: '10+' },
                { label: 'Students', value: '50K+' },
                { label: 'Accuracy', value: '99%' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold gradient-brand bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Subject Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-block glass-light border border-glass-border rounded-full px-4 py-1.5 text-sm text-accent mb-4">
              🎯 Choose Your Domain
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Specialized AI Assistants
            </h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Each bot is trained on domain-specific knowledge to provide the most accurate answers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {subjects.map((subject, index) => (
              <SubjectCard
                key={subject.title}
                title={subject.title}
                subtitle={subject.subtitle}
                icon={subject.icon}
                onClick={handleScrollToFeatures}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass-light rounded-3xl border border-glass-border p-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-block glass-medium border border-glass-border rounded-full px-4 py-1.5 text-sm text-accent mb-4">
              ⚡ Advanced Capabilities
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Powerful features designed to enhance your learning experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-block glass-light border border-glass-border rounded-full px-4 py-1.5 text-sm text-accent mb-4">
              ❓ Got Questions?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-secondary">
              Everything you need to know about STEM Bot
            </p>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <AccordionItem 
                  value={`item-${index}`}
                  className="glass-light rounded-2xl border border-glass-border px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="text-primary font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-secondary leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
      
      {/* Chat Dock */}
      <ChatDock isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default Index;
