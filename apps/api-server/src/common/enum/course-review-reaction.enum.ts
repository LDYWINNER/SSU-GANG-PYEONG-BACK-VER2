import { Enum, EnumType } from 'ts-jenum';

@Enum('text')
export class CourseReviewReactionType extends EnumType<CourseReviewReactionType>() {
  // 🤫
  static readonly Like = new CourseReviewReactionType('LIKE');
  static readonly Disagree = new CourseReviewReactionType('DISAGREE');
  static readonly Happy = new CourseReviewReactionType('HAPPY');
  static readonly Sad = new CourseReviewReactionType('SAD');
  static readonly Fire = new CourseReviewReactionType('FIRE');
  static readonly Clap = new CourseReviewReactionType('CLAP');
  static readonly Wow = new CourseReviewReactionType('WOW');
  static readonly Heart = new CourseReviewReactionType('HEART');

  static readonly BookMark = new CourseReviewReactionType('BOOK_MARK');

  private constructor(readonly text: string) {
    super();
  }
}

export const CourseReviewReactionTypeValues = Object.values(
  CourseReviewReactionType,
).map((e) => e.text);
