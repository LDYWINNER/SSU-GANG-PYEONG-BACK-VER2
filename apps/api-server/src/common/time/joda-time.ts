import { Injectable } from '@nestjs/common';
import { Time } from './time';
import { ZonedDateTime, ZoneId } from '@js-joda/core';

@Injectable()
export class JodaTime implements Time {
  now(): ZonedDateTime {
    return ZonedDateTime.now(ZoneId.SYSTEM);
  }
}
