export const SPECIMEN_OUTCOMES = [
  "ACCEPTED",
  "ASCENDED",
  "CONSUMED",
  "REJECTED",
] as const;

export type SpecimenOutcome = (typeof SPECIMEN_OUTCOMES)[number];

export type CradleCompositionProps = {
  selfieSrc: string;
  specimenId: string;
  outcome: SpecimenOutcome;
};
