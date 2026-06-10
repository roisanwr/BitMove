import { TemplateDefinition } from "./types";
import { pushPullLegs } from "./push-pull-legs";
import { fullBodyBeginner } from "./full-body";
import { hiitCardio, coreAndMobility } from "./hiit-cardio";

export const PROGRAM_TEMPLATES: TemplateDefinition[] = [
  fullBodyBeginner,
  pushPullLegs,
  hiitCardio,
  coreAndMobility,
];

export type { TemplateDefinition, TemplateSlot, TemplateCategory, TemplateDifficulty } from "./types";
