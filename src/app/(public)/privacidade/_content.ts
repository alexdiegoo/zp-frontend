/**
 * Editable values for the privacy policy page.
 *
 * These are the only fields the business/legal team needs to change to keep the
 * policy current — the page structure references them, so updating a value here
 * updates the rendered page with no structural change. Replace the placeholder
 * values below with the final legal-approved details.
 */

type PolicyMetadata = {
  /** Legal name of the data controller (the entity responsible for the data). */
  controller: string;
  /** Privacy contact channel (e.g. an email address). */
  contactChannel: string;
  /** Human-readable pt-BR date the policy took effect / was last updated. */
  effectiveDate: string;
  /** Data-deletion request details (instructions-based, per feature scope). */
  dataDeletion: {
    /** Where a deletion request is sent. */
    channel: string;
    /** Expected time to handle a deletion request. */
    timeframe: string;
  };
};

export const POLICY_METADATA = {
  controller: "ZapBlast Tecnologia Ltda.",
  contactChannel: "contato@zapblast.online",
  effectiveDate: "13 de julho de 2026",
  dataDeletion: {
    channel: "contato@zapblast.online",
    timeframe: "até 30 (trinta) dias corridos",
  },
} satisfies PolicyMetadata;
