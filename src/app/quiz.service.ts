import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { catchError, map, tap, throwError } from 'rxjs';
import {
  ApiQuestion,
  Category,
  Difficulty,
  GroupedCategory,
  Question,
  Results,
} from './data.models';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private API_URL = 'https://opentdb.com/';
  private latestResults!: Results;

  readonly catId = signal<string | null>(null);
  readonly difficulty = signal<Difficulty>('Easy');
  readonly currentQuestions = signal<Question[]>([]);
  private canSwitch = signal(true);
  readonly canSwitchQuestion = this.canSwitch.asReadonly();
  readonly categories = signal<Category[]>([]);

  constructor(private http: HttpClient) {}

  readonly groupedCategory = computed(() => {
    const categories = this.categories();
    return categories.reduce((acc, cat) => {
      const parts = cat.name.split(':');
      const mainName = parts[0].trim();
      const subName = parts.length > 1 ? parts[1].trim() : mainName;

      if (!acc[mainName]) {
        acc[mainName] = [];
      }

      acc[mainName].push({ id: cat.id, name: subName });
      return acc;
    }, {} as GroupedCategory);
  });

  // getAllCategories(): Observable<GroupedCategory> {

  //   return this.http
  //     .get<{ trivia_categories: Category[] }>(this.API_URL + 'api_category.php')
  //     .pipe(
  //       map((res) => res.trivia_categories),
  //       map((categories) => {
  //         return categories.reduce((acc, cat) => {
  //           const parts = cat.name.split(':');
  //           const mainName = parts[0].trim();
  //           const subName = parts.length > 1 ? parts[1].trim() : mainName;

  //           if (!acc[mainName]) {
  //             acc[mainName] = [];
  //           }

  //           acc[mainName].push({ id: cat.id, name: subName });
  //           return acc;
  //         }, {} as GroupedCategory);
  //       }),
  //     );
  // }

  getCategories() {
    return this.http
      .get<{ trivia_categories: Category[] }>(this.API_URL + 'api_category.php')
      .pipe(tap((res) => this.categories.set(res.trivia_categories)))
      .subscribe();
  }

  createQuiz(categoryId: string, difficulty: Difficulty) {
    this.catId.set(categoryId);
    this.difficulty.set(difficulty);
    this.getQuestions(5)
      .pipe(tap((questions) => this.currentQuestions.set(questions)))
      .subscribe();
    this.canSwitch.set(true);
  }

  computeScore(questions: Question[], answers: string[]): void {
    let score = 0;
    questions.forEach((q, index) => {
      if (q.correct_answer == answers[index]) score++;
    });
    this.latestResults = { questions, answers, score };
  }

  getLatestResults(): Results {
    return this.latestResults;
  }

  switchQuestion(question: Question) {
    this.getQuestions(1).subscribe({
      next: (newQuestions) => {
        let index = this.currentQuestions().findIndex(
          (q) => q.question === question.question,
        );
        if (index > -1) {
          this.currentQuestions.update((questions) => {
            questions.splice(index, 1, newQuestions[0]);
            return [...questions];
          });
        }
      },
      error: (err) => {
        console.error('문제 교체 실패, 찬스를 되돏립니다');
        this.canSwitch.set(true);
      },
    });
    this.canSwitch.set(false);
  }

  getQuestions(amount = 5) {
    return this.http
      .get<{
        results: ApiQuestion[];
      }>(
        `${this.API_URL}/api.php?amount=${amount}&category=${this.catId()}&difficulty=${this.difficulty().toLowerCase()}&type=multiple`,
      )
      .pipe(
        map((res) => {
          const quiz: Question[] = res.results.map((q) => ({
            ...q,
            all_answers: [...q.incorrect_answers, q.correct_answer].sort(() =>
              Math.random() > 0.5 ? 1 : -1,
            ),
          }));
          return quiz;
        }),
        catchError((err) => {
          if (err.status === 429) {
            alert('요청이 너무 빠릅니다. 5초 뒤에 다시 시도해주세요');
          }
          return throwError(() => err);
        }),
      );
  }
}
