"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, MapPin, Github, Linkedin, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.footer 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="border-t border-gray-900 bg-black text-gray-400"
    >
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-16">
          
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-2xl font-black tracking-tight">
              <span className="text-[#2e8673]">MENA</span>
              <span className="text-white"> Club</span>
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              Building a unified platform for youth to lead through volunteering and professional growth.
            </p>
            <div className="flex space-x-4 pt-2">
              <SocialIcon icon={<Instagram size={18} />} href="https://www.instagram.com/mena.club/" />
              <SocialIcon icon={<Linkedin size={18} />} href="https://www.linkedin.com/company/menaclub/" />
            </div>
          </motion.div>

          {/* Quick Links */}
          <FooterGroup title="Quick Links">
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/events">Upcoming Events</FooterLink>
            <FooterLink href="/announcements">Announcements</FooterLink>
            <FooterLink href="/contact">Support</FooterLink>
          </FooterGroup>

          {/* Get Involved */}
          <FooterGroup title="Get Involved">
            <FooterLink href="/register">Join as Member</FooterLink>
            <FooterLink href="/register">Volunteer Openings</FooterLink>
            <FooterLink href="/contact">Partner With Us</FooterLink>
          </FooterGroup>

          {/* Contact Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 hover:text-blue-400 transition-colors cursor-pointer">
                <Mail size={16} className="text-blue-500" />
                <span>info@menaclub.org</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-blue-500 shrink-0" />
                <span>Nablus, Palestine</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-gray-600">
          <p>© 2026 MENA Club. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

// Sub-components
function FooterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="space-y-4">
      <h4 className="text-sm font-bold uppercase tracking-widest text-white">{title}</h4>
      <div className="flex flex-col space-y-2 text-sm">
        {children}
      </div>
    </motion.div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <motion.span 
        whileHover={{ x: 5, color: "#60a5fa" }}
        className="block transition-colors cursor-pointer"
      >
        {children}
      </motion.span>
    </Link>
  );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <motion.a 
      href={href}
      whileHover={{ y: -3, color: "#fff" }}
      className="p-2 bg-gray-900 rounded-full hover:bg-blue-600 transition-all duration-300 text-gray-400 inline-block"
    >
      {icon}
    </motion.a>
  );
}