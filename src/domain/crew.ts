// Crew status and sleep analysis.

import { CREW_SLEEP_BAD_HRS, CREW_SLEEP_WARN_HRS } from '../config';

export interface CrewMember {
  id: string;
  name: string;
  shift: string;
  onDuty: boolean;
  sleepHours: number;
}

export interface CrewAnalysis {
  onDuty: CrewMember[];
  offDuty: CrewMember[];
  shiftCounts: Record<string, number>;
  avgSleep: number;
  sleepClass: string;
}

export function analyzeCrew(members: CrewMember[]): CrewAnalysis {
  const onDuty: CrewMember[] = [];
  const offDuty: CrewMember[] = [];

  for (let i = 0; i < members.length; i++) {
    if (members[i].onDuty) {
      onDuty.push(members[i]);
    } else {
      offDuty.push(members[i]);
    }
  }

  const shiftCounts: Record<string, number> = {};
  for (let i = 0; i < members.length; i++) {
    const s = members[i].shift;
    shiftCounts[s] = (shiftCounts[s] || 0) + 1;
  }

  let totalSleep = 0;
  for (let i = 0; i < members.length; i++) {
    totalSleep += members[i].sleepHours;
  }
  const avgSleep = Math.round((totalSleep / members.length) * 10) / 10;

  let sleepClass = 'tile-ok';
  if (avgSleep < CREW_SLEEP_BAD_HRS) {
    sleepClass = 'tile-bad';
  } else if (avgSleep < CREW_SLEEP_WARN_HRS) {
    sleepClass = 'tile-warn';
  }

  return { onDuty, offDuty, shiftCounts, avgSleep, sleepClass };
}
