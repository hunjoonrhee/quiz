import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Question } from '../data.models';
import { QuizService } from '../quiz.service';

import { DialogComponent } from '../dialog/dialog.component';
import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  imports: [QuestionComponent, DialogComponent],
})
export class QuizComponent {
  questions = input<Question[]>([]);

  userAnswers: string[] = new Array(5).fill('');
  quizService = inject(QuizService);
  router = inject(Router);

  onConfirm() {
    this.quizService.computeScore(this.questions(), this.userAnswers);
    this.router.navigateByUrl('/result');
  }

  allAnswered(): boolean {
    return this.userAnswers.every((ans) => ans != '');
  }

  onSwapClick(question: Question) {
    this.quizService.switchQuestion(question);
  }
}
