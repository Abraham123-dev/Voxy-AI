/**
 * Order State Machine Transitions and Validation
 */

export const ALLOWED_STATUSES = ['draft', 'confirmed', 'paid', 'cancelled'];

export const VALID_TRANSITIONS = {
  draft: ['confirmed', 'paid', 'cancelled'],
  confirmed: ['paid', 'cancelled'],
  paid: ['cancelled'],
  cancelled: [],
};

/**
 * Checks whether an order can transition from currentStatus to newStatus
 */
export function canTransitionOrderStatus(currentStatus, newStatus) {
  if (!ALLOWED_STATUSES.includes(newStatus)) {
    return false;
  }
  if (currentStatus === newStatus) {
    return true;
  }
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}
