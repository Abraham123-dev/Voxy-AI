"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to handle password validation logic.
 * Ensures high cohesion by encapsulating validation rules.
 */
export const usePasswordValidation = () => {
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const validatePassword = (value) => {
    // More inclusive regex for special characters
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    const isValid = passwordRegex.test(value);
    setIsPasswordValid(isValid);

    if (!value) {
      setPasswordError('');
    } else if (isValid) {
      setPasswordError('');
    } else {
      // Show requirements as soon as they start typing if it's not valid yet
      setPasswordError('Must be at least 8 characters, include uppercase, lowercase, number, and special character.');
    }
  };

  return { passwordError, isPasswordValid, validatePassword };
};
