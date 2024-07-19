import { Enum, EnumType } from 'ts-jenum';

@Enum('text')
export class BoardType extends EnumType<BoardType>() {
  static readonly All = new BoardType('ALL');
  static readonly Free = new BoardType('FREE');
  static readonly Course = new BoardType('COURSE');
  static readonly CourseRegister = new BoardType('COURSE_REGISTER');
  static readonly Secret = new BoardType('SECRET');
  static readonly Freshmen = new BoardType('FRESHMEN');
  static readonly Promotion = new BoardType('PROMOTION');
  static readonly Club = new BoardType('CLUB');
  static readonly Sbu = new BoardType('SBU');

  private constructor(readonly text: string) {
    super();
  }

  getDescription(): string {
    switch (this) {
      case BoardType.All:
        return 'All boards';
      case BoardType.Free:
        return 'Free discussion board';
      case BoardType.Course:
        return 'Course-related board';
      case BoardType.CourseRegister:
        return 'Course registration board';
      case BoardType.Secret:
        return 'Secret board';
      case BoardType.Freshmen:
        return 'Freshmen board';
      case BoardType.Promotion:
        return 'Promotion board';
      case BoardType.Club:
        return 'Club activities board';
      case BoardType.Sbu:
        return 'SBU board';
      default:
        return 'Unknown board type';
    }
  }
}

export const BoardTypeValues = Object.values(BoardType).map((e) => e.text);
