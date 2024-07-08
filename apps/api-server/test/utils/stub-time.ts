import { LocalDateTime } from '@js-joda/core';
import { Time } from '../../src/common/time/time';

export class StubTime implements Time {
  private readonly currentTime: LocalDateTime;

  constructor(currentTime: LocalDateTime) {
    this.currentTime = currentTime;
  }

  static of(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
  ) {
    return LocalDateTime.of(year, month, day, hour, minute, second);
  }

  plusDays(days: number) {
    return this.currentTime.plusDays(days);
  }

  plusMonths(months: number) {
    return this.currentTime.plusMonths(months);
  }

  now(): LocalDateTime {
    return this.currentTime;
  }

  toString(): string {
    return this.currentTime.toString();
  }
}
