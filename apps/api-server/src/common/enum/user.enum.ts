import { Enum, EnumType } from 'ts-jenum';

@Enum('text')
export class UserType extends EnumType<UserType>() {
  static readonly Admin = new UserType('ADMIN');
  static readonly User = new UserType('USER');

  private constructor(readonly text: string) {
    super();
  }
}
