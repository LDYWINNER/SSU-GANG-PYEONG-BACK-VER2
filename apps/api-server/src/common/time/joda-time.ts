import { Time } from './time';
import { LocalDateTime } from '@js-joda/core';

export class JodaTime implements Time {
  now(): LocalDateTime {
    return LocalDateTime.now();
  }
}
