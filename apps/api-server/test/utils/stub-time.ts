import { ZonedDateTime, ZoneId } from '@js-joda/core';
import { Time } from '../../src/common/time/time';

export class StubTime implements Time {
  private readonly currentTime: ZonedDateTime;

  constructor(currentTime: ZonedDateTime) {
    this.currentTime = currentTime;
  }

  static of(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    zoneId: string = ZoneId.SYSTEM.id(),
  ) {
    return ZonedDateTime.of(
      year,
      month,
      day,
      hour,
      minute,
      second,
      0,
      ZoneId.of(zoneId),
    );
  }

  plusDays(days: number) {
    return this.currentTime.plusDays(days);
  }

  plusMonths(months: number) {
    return this.currentTime.plusMonths(months);
  }

  now(): ZonedDateTime {
    return this.currentTime;
  }

  toString(): string {
    return this.currentTime.toString();
  }
}
