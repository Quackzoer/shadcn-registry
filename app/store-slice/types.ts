/**
 * Domain types for the store-slice demo.
 *
 * Kept separate from the store so the example shows the intended split: this
 * file holds what the app is *about* (entities, and the signatures of the
 * derived reads and custom logic you want), while `store.ts` holds only the
 * wiring — and the wiring is almost entirely generated.
 */

/** Stands in for a row type returned by a real query hook. */
export interface CrmMeta {
  id: number;
  name: string;
  crmSystem: 'hubspot' | 'salesforce' | 'airtable';
  configuration: Record<string, unknown>;
}

export interface SurveyMeta {
  id: number;
  title: string;
}

/**
 * Derived reads. Declared as an interface rather than inferred, because a
 * slice whose getters read the whole store cannot also have its type inferred
 * *from* the store — see the "circularity rule" in the README.
 *
 * Note what is NOT declared here: no state keys, no initial values, no
 * setters. Only the signatures of functions you were going to write anyway.
 */
export interface CrmGetters {
  /** The CRM system, upper-cased for display. */
  systemLabel: () => string | undefined;
  /** Reads across slices — crm plus survey — in a single typed getter. */
  configurationForSurvey: () => Record<string, unknown> | undefined;
}

/** Custom logic — anything beyond a plain field write. */
export interface CrmActions {
  /** Promotes the currently selected list member to be the main entity. */
  adoptSelectedAsMain: () => void;
}
