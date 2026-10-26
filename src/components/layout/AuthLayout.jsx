"use client";

import React from 'react';
import Link from 'next/link';

export const AuthBranding = ({ logoSrc = "/favicon.jpg", brandName = "VOXY", children }) => (
  <div className="hidden lg:flex flex-1 p-8 lg:p-16 xl:p-24 flex-col justify-center max-w-3xl mx-auto lg:mx-0">
    <div className="mb-12">
      <Link href="/" className="flex items-center gap-2.5 group relative z-50 mb-8 inline-flex">
        <img src={logoSrc} alt={`${brandName} Logo`} className="w-5 h-5 rounded-full flex-shrink-0 transition-transform group-hover:scale-110 object-cover" />
        <span className="font-sans font-bold text-[20px] tracking-tight text-voxy-text">{brandName}</span>
      </Link>
      {children}
    </div>
  </div>
);

export const MobileAuthHeader = ({ logoSrc = "/favicon.jpg", brandName = "VOXY" }) => (
  <div className="lg:hidden flex items-center gap-2.5 mb-8">
    <img src={logoSrc} alt={`${brandName} Logo`} className="w-5 h-5 rounded-full flex-shrink-0 object-cover" />
    <span className="font-sans font-bold text-[18px] tracking-tight text-voxy-text">{brandName}</span>
  </div>
);

export const AuthAlternativeAction = ({ message, actionLabel, actionHref }) => (
  <div className="text-center text-sm text-voxy-muted border-t border-voxy-border pt-6">
    {message}{' '}
    <Link href={actionHref} className="text-voxy-primary hover:underline font-medium">
      {actionLabel}
    </Link>
  </div>
);
