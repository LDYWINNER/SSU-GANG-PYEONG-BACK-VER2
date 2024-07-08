import { Time } from './time';
import { ZonedDateTime, ZoneId } from '@js-joda/core';

export class JodaTime implements Time {
  now(): ZonedDateTime {
    return ZonedDateTime.now(ZoneId.SYSTEM);
  }
}
