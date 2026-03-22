import { AsyncPipe, KeyValuePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, of, Subject, switchMap } from 'rxjs';
import {
  Category,
  Difficulty,
  GroupedCategory,
  Question,
} from '../data.models';
import { QuizService } from '../quiz.service';
import { QuizComponent } from '../quiz/quiz.component';

@Component({
  selector: 'app-quiz-maker',
  imports: [FormsModule, QuizComponent, AsyncPipe, KeyValuePipe],
  templateUrl: './quiz-maker.component.html',
  styleUrls: ['./quiz-maker.component.css'],
})
export class QuizMakerComponent {
  categories$: Observable<GroupedCategory>;
  private createQuizTrigger$ = new Subject<{
    categoryId: string;
    difficulty: Difficulty;
  } | null>();
  questions$: Observable<Question[] | null> = this.createQuizTrigger$.pipe(
    switchMap((params) => {
      if (!params) return of(null);
      return this.quizService.createQuiz(params.categoryId, params.difficulty);
    }),
  );

  selectedMainKey = signal<string>('');
  selectedSubId = signal<string>('');
  selectedDifficulty = signal<Difficulty>('');

  resetQuiz() {
    this.createQuizTrigger$.next(null);
  }

  onMainCategoryChange() {
    this.selectedSubId.set('');
    this.resetQuiz();
  }

  constructor(protected quizService: QuizService) {
    this.categories$ = quizService.getAllCategories();
  }

  createQuiz(categories: GroupedCategory): void {
    const mainKey = this.selectedMainKey();
    const subId = this.selectedSubId();
    const difficulty = this.selectedDifficulty();

    if (!mainKey || !difficulty) {
      console.error('카테고리와 난이도를 모두 선택해야 합니다.');
      return;
    }

    const finalCategoryId = subId
      ? subId
      : categories[mainKey][0].id.toString();

    this.createQuizTrigger$.next({ categoryId: finalCategoryId, difficulty });
  }

  hasSubCategories(subCategories: Category[], mainKey: string) {
    if (!subCategories) return false;
    if (subCategories.length === 1 && subCategories[0].name === mainKey) {
      return false;
    }
    return true;
  }
}
