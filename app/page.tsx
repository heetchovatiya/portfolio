'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowRight, 
  Code, 
  Database, 
  Globe, 
  Mail, 
  MessageCircle, 
  User, 
  Briefcase,
  Star,
  ExternalLink,
  Github,
  ChevronRight,
  Check,
  X,
  Menu,
  Filter,
  Brain,
  Palette,
  Smartphone,
  Server
} from 'lucide-react';
import Chatbot from './components/Chatbot';

// Types
interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  image: string;
  liveUrl?: string;
  githubUrl?: string;
  details: {
    problem: string;
    solution: string;
    process: string[];
    results: string;
  };
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

// Sample data
const projects: Project[] = [
  {
    id: 1,
    title: "E-Commerce Platform",
    description: "Full-stack marketplace with real-time inventory management",
    category: "Full-Stack",
    technologies: ["React", "Node.js", "PostgreSQL", "Redis"],
    image: "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    details: {
      problem: "Client needed a scalable e-commerce solution with real-time inventory tracking and seamless user experience.",
      solution: "Built a modern full-stack application with microservices architecture, real-time updates, and optimized performance.",
      process: [
        "User research and requirement analysis",
        "System architecture design",
        "Database schema optimization",
        "Frontend development with React",
        "Backend API development",
        "Testing and deployment"
      ],
      results: "Achieved 40% faster load times and 25% increase in conversion rates. Successfully handles 10k+ concurrent users."
    }
  },
  {
    id: 2,
    title: "Data Analytics Dashboard",
    description: "Interactive visualization platform for business intelligence",
    category: "Data Analysis",
    technologies: ["Python", "D3.js", "React", "FastAPI"],
    image: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    details: {
      problem: "Company needed better insights from their data with interactive visualizations for decision making.",
      solution: "Created a comprehensive dashboard with real-time data processing and customizable visualizations.",
      process: [
        "Data source integration",
        "ETL pipeline development",
        "Interactive chart library creation",
        "User interface design",
        "Performance optimization",
        "User training and deployment"
      ],
      results: "Reduced report generation time by 75% and improved data-driven decision making across departments."
    }
  },
  {
    id: 3,
    title: "Mobile App UI/UX",
    description: "Modern interface design for fitness tracking application",
    category: "UI/UX",
    technologies: ["Figma", "React Native", "TypeScript"],
    image: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800",
    details: {
      problem: "Fitness app needed a complete UI overhaul to improve user engagement and retention.",
      solution: "Designed an intuitive, motivating interface with gamification elements and personalized experiences.",
      process: [
        "User journey mapping",
        "Wireframing and prototyping",
        "Visual design system creation",
        "Usability testing",
        "Responsive implementation",
        "A/B testing and optimization"
      ],
      results: "Increased user engagement by 60% and app store rating improved from 3.2 to 4.7 stars."
    }
  }
];

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "CTO",
    company: "TechStart Inc.",
    content: "Exceptional work on our platform. The attention to detail and technical expertise exceeded our expectations. Delivered on time and within budget.",
    rating: 5
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Product Manager",
    company: "DataCorp",
    content: "The analytics dashboard transformed how we understand our data. Intuitive design and powerful functionality make it indispensable for our team.",
    rating: 5
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Founder",
    company: "FitLife App",
    content: "The UI/UX redesign was exactly what we needed. User engagement skyrocketed and the app finally feels professional and polished.",
    rating: 5
  }
];

const skills = [
  { name: "Frontend Development", icon: Globe, description: "React, Next.js, TypeScript, Tailwind CSS" },
  { name: "Backend Development", icon: Server, description: "Node.js, Python, PostgreSQL, MongoDB" },
  { name: "UI/UX Design", icon: Palette, description: "Figma, Adobe Creative Suite, Design Systems" },
  { name: "Data Analysis", icon: Database, description: "Python, SQL, Machine Learning, Visualization" },
  { name: "Mobile Development", icon: Smartphone, description: "React Native, Flutter, iOS, Android" },
  { name: "AI Integration", icon: Brain, description: "OpenAI API, Machine Learning, Chatbots" }
];

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const WORKER_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;


export default function Portfolio() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  type ChatMessage = { role: 'user' | 'assistant'; content: string; typing?: boolean };
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I\'m here to help you learn more about my work and experience. What would you like to know?' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  // Filter projects
  const filteredProjects = filterCategory === 'All' 
    ? projects 
    : projects.filter(project => project.category === filterCategory);

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];

  // Form validation
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
    
  //   if (!validateForm()) {
  //     return;
  //   }
    
  //   setIsLoading(true);
    
  //   // Simulate form submission
  //   await new Promise(resolve => setTimeout(resolve, 2000));
    
  //   // Reset form
  //   setFormData({ name: '', email: '', message: '' });
  //   setFormErrors({});
  //   setIsLoading(false);
    
  //   // Show success message (you could add a toast here)
  //   alert('Thank you for your message! I\'ll get back to you soon.');
  // };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setIsLoading(true);

  try {
    const res = await fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error('Failed to send message.');
    }

    // Optionally handle response here if your API returns a message
    // const data = await res.json();

    // Reset form
    setFormData({ name: '', email: '', message: '' });
    setFormErrors({});
    alert('Thank you for your message! I\'ll get back to you soon.');
  } catch (error) {
    alert('Sorry, something went wrong. Please try again later.');
  } finally {
    setIsLoading(false);
  }
};

// const handleChatSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   if (!currentMessage.trim() || isLoading) return;

//   const userMessage = currentMessage;
//   setCurrentMessage('');
//   setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
//   setIsLoading(true);

//   // Add a typing indicator for the assistant
//   setChatMessages(prev => [
//     ...prev,
//     { role: 'assistant', content: '•••', typing: true }
//   ]);

//   try {
//     if (!WORKER_URL) throw new Error('Worker URL not configured.');

//     const res = await fetch(WORKER_URL, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ message: userMessage }),
//     });

//     if (!res.ok) {
//       const errorData = await res.json();
//       throw new Error(errorData.error || 'Failed to get response');
//     }

//     const data = await res.json();

//     // Remove the typing indicator
//     setChatMessages(prev =>
//       prev.filter(msg => !(msg.role === 'assistant' && msg.typing))
//     );

//     setChatMessages(prev => [
//       ...prev,
//       { role: 'assistant', content: data.response }
//     ]);
//   } catch (err: any) {
//     // Remove the typing indicator
//     setChatMessages(prev =>
//       prev.filter(msg => !(msg.role === 'assistant' && msg.typing))
//     );
//     setChatMessages(prev => [
//       ...prev,
//       { role: 'assistant', content: `Sorry, I couldn't get a response. ${err?.message || ''}` }
//     ]);
//   } finally {
//     setIsLoading(false);
//   }
// };
  // Add scroll effect for navbar
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF8] text-[#333333]">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#FDFBF8]/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold text-[#333333]">
              Portfolio
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              {['About', 'Services', 'Portfolio', 'Testimonials', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="text-[#666666] hover:text-[#8B5CF6] transition-colors duration-200 font-medium"
                >
                  {item}
                </button>
              ))}
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-[#666666] hover:text-[#8B5CF6] transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
          
 
        </div>
      </nav>
      {/* // ...inside your main Portfolio function *outside* the <nav> but *inside* the outer <div> return: */}

{isMenuOpen && (
  <div
    className="
      fixed inset-0 z-[9999] md:hidden
      bg-white
      w-full h-full
      flex flex-col
      pt-[64px] /* adjust if your navbar height is different */
      animate-fade-in-fast
      shadow-2xl
    "
    style={{
      background: '#fff',
      opacity: 1,
      pointerEvents: 'auto'
    }}
  >
    <div className="flex flex-col space-y-2 w-full px-8">
      {['About', 'Services', 'Portfolio', 'Testimonials', 'Contact'].map((item) => (
        <button
          key={item}
          onClick={() => scrollToSection(item.toLowerCase())}
          className="w-full text-left py-4 px-3 text-xl text-[#333333] font-semibold rounded hover:bg-[#F6F3EF] transition-colors duration-150"
        >
          {item}
        </button>
      ))}
    </div>
    <button
      onClick={() => setIsMenuOpen(false)}
      className="absolute top-4 right-4 text-3xl text-[#8B5CF6] bg-white bg-opacity-90 rounded-full shadow-md w-12 h-12 flex items-center justify-center"
      aria-label="Close menu"
    >
      <X size={32} />
    </button>
  </div>
)}
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Crafting Digital
                <span className="block text-[#8B5CF6]">Experiences</span>
              </h1>
            </div>
            <div className="animate-fade-in-up animation-delay-200">
              <p className="text-xl md:text-2xl text-[#666666] mb-8 max-w-3xl mx-auto leading-relaxed">
                I design and develop exceptional web applications that combine beautiful interfaces 
                with powerful functionality, turning your vision into reality.
              </p>
            </div>
            <div className="animate-fade-in-up animation-delay-400">
              <Button 
                onClick={() => scrollToSection('portfolio')}
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-8 py-4 text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Explore My Work
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F6F3EF]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                My Story
              </h2>
              <div className="space-y-6 text-lg text-[#666666] leading-relaxed">
                <p>
                  I'm a passionate full-stack developer with a unique blend of technical expertise 
                  and design sensibility. My journey began with a fascination for how technology 
                  can solve real-world problems and create meaningful user experiences.
                </p>
                <p>
                  Over the years, I've worked with startups and established companies, helping them 
                  build scalable web applications, optimize their data processes, and create 
                  interfaces that users love. I believe in the power of clean code, thoughtful 
                  design, and collaborative problem-solving.
                </p>
                <p>
                  When I'm not coding, you'll find me exploring new technologies, contributing to 
                  open-source projects, or mentoring aspiring developers. I'm always excited to 
                  take on new challenges and push the boundaries of what's possible.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-80 h-80 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-full flex items-center justify-center shadow-2xl">
                <User size={120} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What I Do
            </h2>
            <p className="text-xl text-[#666666] max-w-3xl mx-auto">
              I offer a comprehensive range of services to help bring your digital vision to life
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skill) => {
              const IconComponent = skill.icon;
              return (
                <Card key={skill.name} className="group hover:shadow-lg transition-all duration-300 border-[#EDEAE5] hover:border-[#8B5CF6] bg-white">
                  <CardHeader>
                    <div className="w-12 h-12 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#8B5CF6] transition-colors duration-300">
                      <IconComponent className="text-[#8B5CF6] group-hover:text-white transition-colors duration-300" size={24} />
                    </div>
                    <CardTitle className="text-xl font-bold">{skill.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-[#666666]">
                      {skill.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F6F3EF]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Featured Work
            </h2>
            <p className="text-xl text-[#666666] max-w-3xl mx-auto">
              A showcase of projects that demonstrate my skills and approach to problem-solving
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={filterCategory === category ? "default" : "outline"}
                onClick={() => setFilterCategory(category)}
                className={`rounded-full px-6 py-2 transition-all duration-300 ${
                  filterCategory === category 
                    ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white' 
                    : 'border-[#EDEAE5] text-[#666666] hover:border-[#8B5CF6] hover:text-[#8B5CF6]'
                }`}
              >
                <Filter size={16} className="mr-2" />
                {category}
              </Button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-[#EDEAE5] bg-white">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="border-[#8B5CF6] text-[#8B5CF6]">
                      {project.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-[#8B5CF6] transition-colors">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-[#666666]">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="bg-[#F6F3EF] text-[#666666] text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={() => setSelectedProject(project)}
                    className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full transition-all duration-300"
                  >
                    View Details
                    <ChevronRight size={16} className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Client Love
            </h2>
            <p className="text-xl text-[#666666] max-w-3xl mx-auto">
              What my clients say about working with me
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-lg transition-all duration-300 border-[#EDEAE5] bg-white">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#8B5CF6] text-[#8B5CF6]" />
                    ))}
                  </div>
                  <CardDescription className="text-[#666666] italic text-lg leading-relaxed">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-t border-[#EDEAE5] pt-4">
                    <p className="font-semibold text-[#333333]">{testimonial.name}</p>
                    <p className="text-[#666666]">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F6F3EF]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Let's Work Together
            </h2>
            <p className="text-xl text-[#666666] max-w-3xl mx-auto">
              Ready to bring your project to life? I'd love to hear about your vision and discuss how we can make it reality.
            </p>
          </div>

          <Card className="border-[#EDEAE5] bg-white shadow-lg">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#333333] mb-2">
                      Name
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`border-[#EDEAE5] focus:border-[#8B5CF6] focus:ring-[#8B5CF6] ${
                        formErrors.name ? 'border-red-500' : ''
                      }`}
                      placeholder="Your full name"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333333] mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`border-[#EDEAE5] focus:border-[#8B5CF6] focus:ring-[#8B5CF6] ${
                        formErrors.email ? 'border-red-500' : ''
                      }`}
                      placeholder="your@email.com"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    Message
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className={`border-[#EDEAE5] focus:border-[#8B5CF6] focus:ring-[#8B5CF6] min-h-[120px] ${
                      formErrors.message ? 'border-red-500' : ''
                    }`}
                    placeholder="Tell me about your project..."
                  />
                  {formErrors.message && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-4 text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Mail className="ml-2" size={20} />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-[#333333] text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Let's Connect</h3>
            <p className="text-gray-300 mb-6">
              I'm always interested in new opportunities and interesting projects.
            </p>
            <div className="flex justify-center space-x-6">
              <Button variant="outline" size="sm" className="border-gray-500 text-gray-300 hover:bg-white hover:text-[#333333]">
                <Github size={16} className="mr-2" />
                GitHub
              </Button>
              <Button variant="outline" size="sm" className="border-gray-500 text-gray-300 hover:bg-white hover:text-[#333333]">
                <Mail size={16} className="mr-2" />
                Email
              </Button>
            </div>
          </div>
          <div className="border-t border-gray-600 pt-8">
            <p className="text-gray-400">
              © 2024 Portfolio. Crafted with care and attention to detail.
            </p>
          </div>
        </div>
      </footer>

      {/* Project Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          {selectedProject && (
            <>
              <DialogHeader>
                <div className="aspect-video overflow-hidden rounded-lg mb-6">
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <DialogTitle className="text-3xl font-bold text-[#333333]">
                  {selectedProject.title}
                </DialogTitle>
                <DialogDescription className="text-lg text-[#666666]">
                  {selectedProject.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-8">
                {/* Technologies */}
                <div>
                  <h4 className="text-xl font-semibold mb-4 text-[#333333]">Technologies Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech) => (
                      <Badge key={tech} className="bg-[#8B5CF6] text-white">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Problem */}
                <div>
                  <h4 className="text-xl font-semibold mb-4 text-[#333333]">The Challenge</h4>
                  <p className="text-[#666666] leading-relaxed">{selectedProject.details.problem}</p>
                </div>

                {/* Solution */}
                <div>
                  <h4 className="text-xl font-semibold mb-4 text-[#333333]">My Solution</h4>
                  <p className="text-[#666666] leading-relaxed">{selectedProject.details.solution}</p>
                </div>

                {/* Process */}
                <div>
                  <h4 className="text-xl font-semibold mb-4 text-[#333333]">Development Process</h4>
                  <div className="space-y-3">
                    {selectedProject.details.process.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-[#8B5CF6] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-[#666666]">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Results */}
                <div>
                  <h4 className="text-xl font-semibold mb-4 text-[#333333]">Results & Impact</h4>
                  <p className="text-[#666666] leading-relaxed">{selectedProject.details.results}</p>
                </div>

                {/* Links */}
                <div className="flex space-x-4 pt-6 border-t border-[#EDEAE5]">
                  {selectedProject.liveUrl && (
                    <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white">
                      <ExternalLink size={16} className="mr-2" />
                      View Live Site
                    </Button>
                  )}
                  {selectedProject.githubUrl && (
                    <Button variant="outline" className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white">
                      <Github size={16} className="mr-2" />
                      View Code
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

  {/* --- Your Chatbot Component --- */}
      {/* It will float at the bottom-right due to its internal CSS */}
      <Chatbot />
      {/* --- End Chatbot Component --- */}
    </div>
  );
}