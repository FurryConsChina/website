import { EventScale } from "@/constants/event";

export enum DurationType {
  Passed = "passed", //already done.
  Now = "now", // in the duration of event.
  Next = "next", // not start yet but ongoing.
}

export type SelectedFilterType = {
  includePastEvents: boolean;
  eventScale: (typeof EventScale)[keyof typeof EventScale][];
};
