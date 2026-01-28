"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type PurposeType = "performance" | "mental" | "change";

export interface ValueAnswer {
  questionIndex: number;
  answer: string;
}

export interface OnboardingData {
  purpose: PurposeType | null;
  valueAnswers: ValueAnswer[];
  motivation: string;
}

interface OnboardingContextType {
  data: OnboardingData;
  currentStep: number;
  setPurpose: (purpose: PurposeType) => void;
  setValueAnswer: (questionIndex: number, answer: string) => void;
  setMotivation: (motivation: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  isStepComplete: (step: number) => boolean;
  resetOnboarding: () => void;
}

const defaultData: OnboardingData = {
  purpose: null,
  valueAnswers: [],
  motivation: "",
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export const ONBOARDING_STEPS = [
  { id: "welcome", path: "/onboarding/welcome", label: "ようこそ" },
  { id: "purpose", path: "/onboarding/purpose", label: "目的設定" },
  { id: "values", path: "/onboarding/values", label: "価値観" },
  { id: "motivation", path: "/onboarding/motivation", label: "動機" },
  { id: "complete", path: "/onboarding/complete", label: "完了" },
] as const;

export const VALUE_QUESTIONS = [
  {
    id: 1,
    question: "最近、時間を忘れて夢中になったことは何ですか？",
    placeholder: "例：趣味、仕事のプロジェクト、学習など...",
  },
  {
    id: 2,
    question: "理想の1日を想像してください。どんな1日を過ごしていますか？",
    placeholder: "朝起きてから夜寝るまで、理想の過ごし方を教えてください...",
  },
  {
    id: 3,
    question: "もし制約がなければ、何に挑戦したいですか？",
    placeholder: "お金や時間の制約がなければ...",
  },
  {
    id: 4,
    question: "あなたが大切にしている価値観を3つ教えてください。",
    placeholder: "例：誠実さ、成長、家族、自由、創造性など...",
  },
  {
    id: 5,
    question: "3ヶ月後、「やってよかった」と思える変化は何ですか？",
    placeholder: "達成したい具体的な変化を教えてください...",
  },
] as const;

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [currentStep, setCurrentStep] = useState(0);

  const setPurpose = useCallback((purpose: PurposeType) => {
    setData((prev) => ({ ...prev, purpose }));
  }, []);

  const setValueAnswer = useCallback((questionIndex: number, answer: string) => {
    setData((prev) => {
      const existingIndex = prev.valueAnswers.findIndex(
        (va) => va.questionIndex === questionIndex
      );
      const newAnswers =
        existingIndex >= 0
          ? prev.valueAnswers.map((va, i) =>
              i === existingIndex ? { questionIndex, answer } : va
            )
          : [...prev.valueAnswers, { questionIndex, answer }];
      return { ...prev, valueAnswers: newAnswers };
    });
  }, []);

  const setMotivation = useCallback((motivation: string) => {
    setData((prev) => ({ ...prev, motivation }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, ONBOARDING_STEPS.length - 1));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, ONBOARDING_STEPS.length - 1)));
  }, []);

  const isStepComplete = useCallback(
    (step: number): boolean => {
      switch (step) {
        case 0: // welcome
          return true;
        case 1: // purpose
          return data.purpose !== null;
        case 2: // values
          return data.valueAnswers.length === VALUE_QUESTIONS.length;
        case 3: // motivation
          return data.motivation.trim().length > 0;
        case 4: // complete
          return true;
        default:
          return false;
      }
    },
    [data]
  );

  const resetOnboarding = useCallback(() => {
    setData(defaultData);
    setCurrentStep(0);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        data,
        currentStep,
        setPurpose,
        setValueAnswer,
        setMotivation,
        nextStep,
        prevStep,
        goToStep,
        isStepComplete,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}

export function getValueAnswer(
  valueAnswers: ValueAnswer[],
  questionIndex: number
): string {
  const answer = valueAnswers.find((va) => va.questionIndex === questionIndex);
  return answer?.answer || "";
}
