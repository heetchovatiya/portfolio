// app/components/Chatbot.tsx

import React, { useState, useRef, useEffect, FormEvent } from 'react';

// Adjust these import paths based on your actual project structure for Shadcn UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // IMPORTANT: Ensure this component exists in your Shadcn UI setup

// Icons from lucide-react (install if you haven't: npm install lucide-react)
import { Brain, Code, X, ArrowRight, Loader2, CheckCircle, XCircle } from 'lucide-react';

const CONTACT_FORM_TRIGGER_PHRASE = "**Ready to discuss your project? Please share your contact information (email/phone) and a brief overview of your needs. We'll connect with you promptly for a tailored discussion.**";

const WORKER_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;
const RENDER_BACKEND_URL = process.env.NEXT_PUBLIC_RENDER_BACKEND_URL; // Your Render backend URL

interface Message {
  role: 'user' | 'assistant';
  content: string;
  typing?: boolean; // Used for the typing indicator
}

export default function Chatbot() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For chat messages loading state

  // --- Contact Form States ---
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [projectOverview, setProjectOverview] = useState('');
  const [formSending, setFormSending] = useState(false); // For contact form submission loading state
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // --- Initial greeting state ---
  const [hasChatOpenedBefore, setHasChatOpenedBefore] = useState(false);

  // --- Refs for scrolling and click outside ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null); // Ref for the entire chat window

  // Auto-scroll to the bottom of the chat or contact form whenever messages or state change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isLoading, showContactForm]);

  // Effect to add the initial greeting message when chat is opened for the first time
  useEffect(() => {
    if (isChatOpen && !hasChatOpenedBefore) {
      setChatMessages([
        { role: 'assistant', content: "Hi! I'm here to help you learn more about my work and experience. What would you like to know?" }
      ]);
      setHasChatOpenedBefore(true);
    }
  }, [isChatOpen, hasChatOpenedBefore]);

  // --- Click outside to close chat functionality ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // If the chat is open AND the click happened outside the chat window element
      if (isChatOpen && chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsChatOpen(false); // Close the chat
      }
    }

    // Add event listener when chat is open
    if (isChatOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up the event listener when component unmounts or chat closes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChatOpen]);

  const handleChatSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!currentMessage.trim() || isLoading) return;

    const userMessageContent = currentMessage;
    setCurrentMessage('');
    // --- CORRECTED LINE: prevL -> prev ---
    setChatMessages(prev => [...prev, { role: 'user', content: userMessageContent }]);
    setIsLoading(true);

    const typingIndicator: Message = { role: 'assistant', content: '•••', typing: true };
    setChatMessages(prev => [...prev, typingIndicator]);

    try {
      if (!WORKER_URL) {
        throw new Error('Cloudflare Worker URL is not configured.');
      }

      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessageContent }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to get response from bot.');
      }

      const data = await res.json();
      const botResponseContent = data.response;

      setChatMessages(prev =>
        prev.filter(msg => !(msg.role === 'assistant' && msg.typing))
      );

      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: botResponseContent }
      ]);

      if (botResponseContent.includes(CONTACT_FORM_TRIGGER_PHRASE)) {
        setShowContactForm(true);
        setFormSuccess(null);
        setFormError(null);
      }

    } catch (err: any) {
      setChatMessages(prev =>
        prev.filter(msg => !(msg.role === 'assistant' && msg.typing))
      );
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Oops! I couldn't get a response. Error: ${err?.message || 'Please try again.'}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleContactFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormSending(true);
    setFormError(null);
    setFormSuccess(null);

    const lastUserQuery = chatMessages.filter(msg => msg.role === 'user').pop()?.content || '';
    const lastBotResponse = chatMessages.filter(msg => msg.role === 'assistant' && !msg.typing).pop()?.content || '';

    try {
      if (!RENDER_BACKEND_URL) {
        throw new Error('Render Backend URL is not configured. Please check your .env.local file.');
      }

      const response = await fetch(`${RENDER_BACKEND_URL}/api/chatbot-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          project: projectOverview,
          userQuery: lastUserQuery,
          botResponse: lastBotResponse,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send your information.');
      }

      setFormSuccess("Awesome! We've received your details and will be in touch soon for a tailored discussion.");
      setContactName('');
      setContactEmail('');
      setProjectOverview('');

    } catch (err: any) {
      setFormError(`Failed to send details: ${err?.message || 'Please try again.'}`);
    } finally {
      setFormSending(false);
    }
  };


  return (
    // Outer container for the fixed chatbot position - also made responsive
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:bottom-6 md:right-6 md:left-auto md:transform-none z-50">
      {!isChatOpen ? (
        // Chat open button - also made responsive
        <Button
          onClick={() => setIsChatOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative group overflow-hidden"
          style={{
            boxShadow: "0 10px 30px rgba(99, 102, 241, 0.4)",
          }}
        >
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse-fast" title="Online"></span>
          <Brain size={30} className="mx-auto transition-transform duration-300 group-hover:scale-110" />
          <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-sm"></span>
        </Button>
      ) : (
        // Main Chat Window - significantly modified for responsiveness
        <Card
          ref={chatRef}
          className="
            w-[calc(100vw-2rem)] /* Full width minus 1rem padding on each side for mobile */
            h-[80vh] /* Taller on mobile to fill screen more */
            max-h-[calc(100vh-2rem)] /* Ensures it doesn't exceed screen height on mobile */
            rounded-2xl /* Slightly less rounded for mobile */
            bg-gray-50 shadow-2xl border border-gray-200 overflow-hidden animate-scale-in-fade flex flex-col
            
            /* Medium screens (md) and up */
            md:w-full /* Let it take full width up to its max-w */
            md:max-w-[400px] /* Original desktop/tablet max width */
            md:h-[75vh] md:max-h-[560px] /* Original desktop height */
            md:rounded-3xl /* Original desktop rounding */
          "
        >
        {/* Note: Positioning for md screens is handled by the parent div className="... md:bottom-6 md:right-6 md:left-auto md:transform-none" */}
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-t-2xl md:rounded-t-3xl shadow-md">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-white">
                  <Code size={24} />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse-fast" title="Online"></span>
              </div>
              <div>
                <div className="font-bold text-lg">AI Engineer</div>
                <div className="text-xs text-indigo-100 opacity-90 font-mono">Online</div>
              </div>
            </div>
            {/* --- X Button to Close Chat --- */}
            <Button
              onClick={() => setIsChatOpen(false)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Chat message display area */}
          <div className="flex-1 flex flex-col min-h-0"> {/* min-h-0 is crucial for flex-item scrolling */}
            <div className="flex-1 px-4 py-5 overflow-y-auto space-y-4 custom-scroll bg-white min-h-0"> {/* min-h-0 and overflow-y-auto */}
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-entrance`}
                >
                  <div
                    className={`
                      rounded-xl px-4 py-2.5 max-w-[85%] shadow-sm text-base leading-snug
                      ${message.role === 'user'
                        ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-medium rounded-br-none'
                        : 'bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-none'}
                      ${message.role === 'assistant' && message.typing ? 'typing-dots' : ''}
                    `}
                    style={message.role === 'assistant' && !message.typing ? { fontFamily: "Fira Mono, monospace" } : {}}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {showContactForm ? (
              <form onSubmit={handleContactFormSubmit} className="p-4 border-t border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Let's Discuss Your Project!</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="contactName" className="sr-only">Your Name</label>
                    <Input
                      id="contactName"
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your Name"
                      className="border-gray-300 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-base text-gray-800 placeholder-gray-500"
                      disabled={formSending}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="sr-only">Your Email / Phone</label>
                    <Input
                      id="contactEmail"
                      type="text"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Your Email or Phone"
                      className="border-gray-300 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-base text-gray-800 placeholder-gray-500"
                      disabled={formSending}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="projectOverview" className="sr-only">Project Overview</label>
                    <Textarea
                      id="projectOverview"
                      value={projectOverview}
                      onChange={(e) => setProjectOverview(e.target.value)}
                      placeholder="Briefly describe your project..."
                      rows={4}
                      className="w-full border-gray-300 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-base text-gray-800 placeholder-gray-500 resize-y min-h-[90px]"
                      disabled={formSending}
                      required
                    ></Textarea>
                  </div>
                  <Button
                    type="submit"
                    disabled={formSending}
                    className="w-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-lg shadow-md hover:scale-[1.005] transition-transform duration-200 flex items-center justify-center py-2.5 font-semibold"
                  >
                    {formSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      'Submit Details'
                    )}
                  </Button>
                  {formSuccess && (
                    <div className="flex items-center text-sm text-green-600 mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="mr-2 h-4 w-4" /> {formSuccess}
                    </div>
                  )}
                  {formError && (
                    <div className="flex items-center text-sm text-red-600 mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
                      <XCircle className="mr-2 h-4 w-4" /> {formError}
                    </div>
                  )}
                </div>
              </form>
            ) : (
              <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-3">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 border-gray-300 focus:border-indigo-500 rounded-full px-4 py-2.5 text-base text-gray-800 placeholder-gray-500"
                    autoFocus
                    disabled={isLoading}
                    maxLength={500}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !currentMessage.trim()}
                    className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-full shadow hover:scale-105 transition-transform duration-200"
                    title="Send"
                    size="icon"
                  >
                    <ArrowRight size={20} />
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}