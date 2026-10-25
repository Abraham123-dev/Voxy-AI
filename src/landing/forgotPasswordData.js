"use client";

import React from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Key,
  HelpCircle
} from 'lucide-react';

export const FORGOT_PASSWORD_CONTENT = {
  badge: {
    icon: <ShieldCheck size={14} className="text-voxy-primary" />,
    text: "Your security is our priority"
  },
  heading: (
    <>Recover your <br />
    <span className="text-voxy-primary">multilingual</span> <br />
    workspace.</>
  ),
  subheading: "Don't worry, it happens to the best of us. Enter your email and we'll send you a link to reset your password and get you back to your conversations.",
  features: [
    { 
      icon: <Mail size={20} className="text-voxy-primary" />, 
      title: "Secure Reset Link", 
      desc: "We'll send a one-time secure link to your verified email address." 
    },
    { 
      icon: <Key size={20} className="text-voxy-primary" />, 
      title: "2FA Verification", 
      desc: "If enabled, we'll guide you through your multi-factor authentication." 
    },
    { 
      icon: <HelpCircle size={20} className="text-voxy-primary" />, 
      title: "Help Center", 
      desc: "Still having trouble? Our multilingual support team is ready to assist." 
    }
  ],
  stats: [
    { value: "5 min", label: "Average recovery time" },
    { value: "24/7", label: "Support available" }
  ],
  form: {
    title: "Password Recovery",
    subheading: "Enter the email associated with your account.",
    button: "Send Reset Link",
    successTitle: "Check your email",
    successSubheading: "We've sent a password reset link to:"
  }
};
