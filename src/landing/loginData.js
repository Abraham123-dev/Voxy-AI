"use client";

import React from 'react';
import { 
  Sparkles,
  Zap,
  Globe,
  ShieldCheck
} from 'lucide-react';

export const LOGIN_CONTENT = {
  badge: {
    icon: <Sparkles size={14} className="text-voxy-primary" />,
    text: "Welcome back to the future of voice"
  },
  heading: (
    <>Log in to your <br />
    <span className="text-voxy-primary">multilingual</span> <br />
    workflow.</>
  ),
  subheading: "Continue where you left off. Manage conversations, review AI-generated replies, and bridge language gaps in seconds.",
  features: [
    { 
      icon: <Zap size={20} className="text-voxy-primary" />, 
      title: "Instant Transcriptions", 
      desc: "Turn voice notes into actionable text across local dialects." 
    },
    { 
      icon: <Globe size={20} className="text-voxy-primary" />, 
      title: "Regional Support", 
      desc: "Pidgin, Yoruba, and English processing at your fingertips." 
    },
    { 
      icon: <ShieldCheck size={20} className="text-voxy-primary" />, 
      title: "Enterprise Security", 
      desc: "Your data and customer conversations remain encrypted and private." 
    }
  ],
  stats: [
    { value: "99.9%", label: "Uptime reliability" },
    { value: "256-bit", label: "Data encryption" }
  ]
};
