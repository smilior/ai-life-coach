"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  OnboardingProgressSimple,
  ValueQuestion,
  useOnboarding,
  getValueAnswer,
  VALUE_QUESTIONS,
} from "@/components/features/onboarding";

export default function ValuesPage() {
  const router = useRouter();
  const { data, setValueAnswer, goToStep } = useOnboarding();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    goToStep(2);
  }, [goToStep]);

  const currentQuestion = VALUE_QUESTIONS[currentQuestionIndex];
  const currentAnswer = getValueAnswer(data.valueAnswers, currentQuestionIndex);

  const handleAnswerChange = (value: string) => {
    setValueAnswer(currentQuestionIndex, value);
  };

  const handleNext = () => {
    if (currentQuestionIndex < VALUE_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // All questions answered, go to motivation
      router.push("/onboarding/motivation");
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      // First question, go back to purpose
      router.push("/onboarding/purpose");
    }
  };

  return (
    <>
      {/* Progress Header */}
      <header className="p-4">
        <OnboardingProgressSimple currentStep={2} />
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col px-4 pb-8">
        <div className="mx-auto w-full max-w-md flex-1">
          {/* Header */}
          <div className="mb-6 space-y-2">
            <h1 className="text-xl font-bold tracking-tight">
              価値観インタビュー
            </h1>
            <p className="text-sm text-muted-foreground">
              あなたをより深く理解するための質問です。
              <br />
              じっくり考えて、自由にお答えください。
            </p>
          </div>

          {/* Question Component */}
          <ValueQuestion
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={VALUE_QUESTIONS.length}
            question={currentQuestion.question}
            placeholder={currentQuestion.placeholder}
            value={currentAnswer}
            onChange={handleAnswerChange}
            onNext={handleNext}
            onPrev={handlePrev}
            canGoNext={currentAnswer.trim().length > 0}
            canGoPrev={true}
            isLastQuestion={currentQuestionIndex === VALUE_QUESTIONS.length - 1}
          />
        </div>
      </main>
    </>
  );
}
