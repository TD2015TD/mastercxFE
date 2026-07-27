// Priority Matrix: Impact x Urgency -> Priority (P1-P4).
// Mirrors the authoritative matrix in api/app/Models/Ticket.php::calculatePriority().
// Keep these two in sync — do not let a third, divergent copy of this matrix exist anywhere else.
const MATRIX = {
  Critical: { Low: 'P2', Medium: 'P1', High: 'P1', Critical: 'P1' },
  High: { Low: 'P3', Medium: 'P2', High: 'P2', Critical: 'P1' },
  Medium: { Low: 'P4', Medium: 'P3', High: 'P2', Critical: 'P2' },
  Low: { Low: 'P4', Medium: 'P4', High: 'P3', Critical: 'P3' },
};

/**
 * @param {string} urgency - 'Critical' | 'High' | 'Medium' | 'Low'
 * @param {string} impact - 'Critical' | 'High' | 'Medium' | 'Low'
 * @returns {string|null} Priority 'P1'-'P4', or null if urgency/impact aren't both set.
 */
export function calculatePriorityFromMatrix(urgency, impact) {
  if (!urgency || !impact) return null;
  return MATRIX[urgency]?.[impact] ?? 'P3';
}
