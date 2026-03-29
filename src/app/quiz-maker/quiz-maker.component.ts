import { AsyncPipe, KeyValuePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category, Difficulty, GroupedCategory } from '../data.models';
import { QuizService } from '../quiz.service';
import { QuizComponent } from '../quiz/quiz.component';

@Component({
  selector: 'app-quiz-maker',
  imports: [FormsModule, QuizComponent, AsyncPipe, KeyValuePipe],
  templateUrl: './quiz-maker.component.html',
  styleUrls: ['./quiz-maker.component.css'],
})
export class QuizMakerComponent implements OnInit {
  readonly quizService = inject(QuizService);

  selectedMainKey = signal<string>('');
  selectedSubId = signal<string>('');
  selectedDifficulty = signal<Difficulty>('');

  ngOnInit(): void {
    this.quizService.getCategories();
    this.quizService.currentQuestions.set([]);
  }

  onMainCategoryChange() {
    this.selectedSubId.set('');
    this.quizService.currentQuestions.set([]);
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

    this.quizService.createQuiz(finalCategoryId, difficulty);
  }

  hasSubCategories(subCategories: Category[], mainKey: string) {
    if (!subCategories) return false;
    if (subCategories.length === 1 && subCategories[0].name === mainKey) {
      return false;
    }
    return true;
  }
}
