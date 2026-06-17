const parseAvailable = (ticketsAvailable) => {
  if (ticketsAvailable === "" || ticketsAvailable == null) return null;
  const n = parseInt(ticketsAvailable, 10);
  if (Number.isNaN(n) || n < 0) return { error: "Tickets available must be a non-negative whole number" };
  return n;
};

const tierLabel = (tier, index) => tier.category?.trim() || `Tier ${index + 1}`;

/** Validate tier quantities against tickets_available for organizer forms */
export function getTicketTierValidation(ticketsAvailable, ticketPrices) {
  const availableParsed = parseAvailable(ticketsAvailable);
  if (availableParsed?.error) {
    return {
      isValid: false,
      ticketsAvailableError: availableParsed.error,
      tierErrors: {},
      summary: null,
      submitError: availableParsed.error,
    };
  }

  const available = availableParsed;
  const tierErrors = {};
  let totalTierQty = 0;
  const qtyTiers = [];

  ticketPrices.forEach((tier, index) => {
    if (tier.quantity === "" || tier.quantity == null) return;

    const qty = parseInt(tier.quantity, 10);
    const label = tierLabel(tier, index);

    if (Number.isNaN(qty)) {
      tierErrors[index] = "Enter a valid whole number for quantity.";
      return;
    }
    if (qty < 0) {
      tierErrors[index] = "Quantity cannot be negative.";
      return;
    }
    if (available == null) {
      tierErrors[index] = "Set total tickets available before assigning tier quantities.";
      return;
    }
    if (qty > available) {
      tierErrors[index] = `"${label}" quantity (${qty}) cannot exceed total tickets available (${available}).`;
      return;
    }

    qtyTiers.push({ index, qty, label });
    totalTierQty += qty;
  });

  let summary = null;
  let submitError = null;

  if (available != null && qtyTiers.length > 0) {
    const remaining = available - totalTierQty;
    if (remaining < 0) {
      const over = Math.abs(remaining);
      submitError = `Total tier quantities (${totalTierQty}) exceed tickets available (${available}) by ${over}. Reduce tier quantities or increase tickets available.`;
      summary = submitError;
      qtyTiers.forEach(({ index }) => {
        if (!tierErrors[index]) {
          tierErrors[index] = `Combined tier total exceeds event capacity by ${over} ticket${over === 1 ? "" : "s"}.`;
        }
      });
    } else {
      summary = `${totalTierQty} of ${available} tickets allocated across tiers (${remaining} unassigned).`;
    }
  }

  if (available != null && available > 0 && qtyTiers.length === 0) {
    summary = `${available} tickets available — assign quantities per tier (optional).`;
  }

  const ticketsAvailableError =
    available != null && totalTierQty > available
      ? `Tier quantities total ${totalTierQty}, which exceeds tickets available (${available}).`
      : null;

  const isValid =
    !ticketsAvailableError &&
    !submitError &&
    Object.keys(tierErrors).length === 0;

  return {
    isValid,
    tierErrors,
    summary,
    submitError,
    ticketsAvailableError,
    totalTierQty,
    ticketsAvailable: available,
    remaining: available != null ? available - totalTierQty : null,
  };
}
