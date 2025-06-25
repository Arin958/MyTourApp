import React, { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";
import { Phone, Envelope, MapTrifold, PaperPlaneTilt, Compass } from "phosphor-react";

export default function ContactPage() {
  const toast = useRef(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.current.show({ 
        severity: "warn", 
        summary: "Warning", 
        detail: "Please fill all fields", 
        life: 3000 
      });
      return;
    }

    // Simulate API submit
    setSubmitted(true);
    toast.current.show({ 
      severity: "success", 
      summary: "Success", 
      detail: "Message sent successfully!", 
      life: 3000 
    });

    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background with multiple layered images */}
      <div className="absolute inset-0 bg-black opacity-90 z-0"></div>
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1920')] bg-cover bg-center opacity-20 z-0"
        style={{ filter: "blur(1px)" }}
      ></div>
      <div 
        className="absolute -bottom-20 -left-20 w-96 h-96 bg-[url('https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=500')] bg-cover bg-center rounded-full opacity-30 z-0"
        style={{ filter: "blur(2px)" }}
      ></div>
      <div 
        className="absolute -top-20 -right-20 w-96 h-96 bg-[url('https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=500')] bg-cover bg-center rounded-full opacity-30 z-0"
        style={{ filter: "blur(2px)" }}
      ></div>

      <Toast ref={toast} position="top-right" />

      <div className="relative z-10 max-w-6xl w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 md:p-10 flex flex-col md:flex-row gap-8 border border-gray-700">
        {/* Contact Info - Left Panel */}
        <div className="md:w-1/2 space-y-8 p-4">
          <div className="flex items-center gap-3 mb-6">
            <Compass size={40} className="text-cyan-400" weight="duotone" />
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Get in Touch
            </h2>
          </div>
          
          <p className="text-gray-300 text-lg leading-relaxed">
            Have questions or want to plan your next adventure? We're here to help! 
            Reach out to us anytime and we'll get back to you promptly.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all">
              <MapTrifold size={28} className="mt-1 text-cyan-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-lg text-cyan-400">Our Location</h4>
                <p className="text-gray-300">123 Wanderlust Rd, Travel City, TC 12345</p>
                <div className="mt-3 rounded-lg overflow-hidden">
                  <img 
                    src="https://maps.googleapis.com/maps/api/staticmap?center=123+Wanderlust+Rd,Travel+City,TC&zoom=14&size=300x150&maptype=roadmap&markers=color:cyan%7C123+Wanderlust+Rd,Travel+City,TC&key=YOUR_API_KEY" 
                    alt="Map location" 
                    className="w-full h-auto border border-gray-700 rounded"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all">
              <Phone size={28} className="text-cyan-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-lg text-cyan-400">Call Us</h4>
                <p className="text-gray-300">+123 456 7890</p>
                <p className="text-gray-400 text-sm mt-1">Mon-Fri: 9am-6pm</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all">
              <Envelope size={28} className="text-cyan-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-lg text-cyan-400">Email Us</h4>
                <p className="text-gray-300">contact@wanderlust.com</p>
                <p className="text-gray-400 text-sm mt-1">Response within 24 hours</p>
              </div>
            </div>
          </div>

          <Divider className="border-gray-700" />

          <div className="flex items-center gap-4 mt-6">
            <img 
              src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=500" 
              alt="Travel team" 
              className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400"
            />
            <div>
              <p className="text-gray-300 italic">"We look forward to helping you discover amazing places!"</p>
              <p className="text-cyan-400 text-sm mt-1">— The Wanderlust Team</p>
            </div>
          </div>
        </div>

        {/* Contact Form - Right Panel */}
        <div className="md:w-1/2 p-6 bg-gray-800 bg-opacity-70 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3 mb-8">
            <PaperPlaneTilt size={32} className="text-cyan-400" weight="duotone" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Send Us a Message
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-gray-300 font-medium">
                Your Name
              </label>
              <InputText
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full p-inputtext-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-gray-300 font-medium">
                Email Address
              </label>
              <InputText
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full p-inputtext-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="message" className="text-gray-300 font-medium">
                Your Message
              </label>
              <InputTextarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                placeholder="Tell us about your travel plans or questions..."
                className="w-full p-inputtextarea-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400"
                required
              />
            </div>

            <Button
              label="Send Message"
              icon="pi pi-paper-plane"
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 border-0 text-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all"
            />
          </form>

          {submitted && (
            <Message
              severity="success"
              text="Thank you for contacting us! We will get back to you soon."
              className="mt-6 animate-fadein"
            />
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-4">Or connect with us on social media</p>
            <div className="flex justify-center gap-4">
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-cyan-600 rounded-full transition-colors">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-cyan-600 rounded-full transition-colors">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-cyan-600 rounded-full transition-colors">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="Instagram" className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}