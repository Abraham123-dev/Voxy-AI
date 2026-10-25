/**
 * Advanced Prompt Sanitizer (Step 1)
 * Neutalizes known jailbreak techniques and instruction overrides
 * while preserving the user's legitimate informational intent.
 */
export function sanitizePrompt(input) {
  if (!input || typeof input !== 'string') return input;

  // 1. NEUTRALIZATION RULES
  // Removing phrases that attempt to hijack the LLM's system state
  const rules = [
    { pattern: /ignore (all |current |the )?previous instructions/gi, replacement: '' },
    { pattern: /ignore (all |current |the )?rules/gi, replacement: '' },
    { pattern: /override (the |all )?system/gi, replacement: '' },
    { pattern: /reveal (your |the )?system prompt/gi, replacement: '' },
    { pattern: /output di system instruction/gi, replacement: '' }, // Pidgin variant
    { pattern: /you are no longer/gi, replacement: 'you are' },
    { pattern: /act as (an?|the)/gi, replacement: '' },
    { pattern: /from now on/gi, replacement: '' }
  ];

  let sanitized = input;
  
  rules.forEach(rule => {
    sanitized = sanitized.replace(rule.pattern, rule.replacement);
  });

  // 2. CLEANUP
  // Remove double spaces and leading/trailing junk created by replacements
  sanitized = sanitized.replace(/\s\s+/g, ' ').trim();

  // 3. MULTILINGUAL PRESERVATION
  // If the result is too short, return original but flagged as unsafe elsewhere
  if (sanitized.length < 2 && input.length > 5) return "[REDACTED_BY_SECURITY]";

  return sanitized;
}
