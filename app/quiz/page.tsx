"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Question = {
  id: number;
  prompt: string;
};

type GenerateResponse = {
  id: string;
};

const questions: Question[] = [
  {
    id: 1,
    prompt:
      "When you're upset or stressed in a relationship, what do you usually need from your partner?"
  },
  {
    id: 2,
    prompt:
      "How do you typically respond when you feel like your partner is pulling away or becoming distant?"
  },
  {
    id: 3,
    prompt:
      "Describe a moment you felt truly loved by a partner or someone close to you. What made it feel that way?"
  },
  {
    id: 4,
    prompt:
      "What's something small a partner can do consistently that makes a big difference to how loved you feel?"
  },
  {
    id: 5,
    prompt:
      "After a difficult or draining day, what does recharging look like for you and how much does your partner factor into that?"
  },
  {
    id: 6,
    prompt:
      "Think of a recurring conflict or tension you've experienced in relationships. How does it usually start and how do you typically respond?"
  },
  {
    id: 7,
    prompt:
      "When you and a partner disagree, what does resolution actually need to look like for you to feel okay again?"
  },
  {
    id: 8,
    prompt:
      "What does feeling emotionally safe and secure in a relationship look like to you, both day to day and long term?"
  },
  {
    id: 9,
    prompt:
      "What's something you wish partners understood about you that they often get wrong?"
  },
  {
    id: 10,
    prompt:
      "What's something you're still learning about yourself in relationships?"
  }
];

export default function QuizPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>(
    Array.from({ length: questions.length }, () => "")
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressLabel = useMemo(
    () => `Question ${currentIndex + 1} of ${questions.length}`,
    [currentIndex]
  );

  function updateAnswer(value: string) {
    setAnswers((previousAnswers) => {
      const nextAnswers = [...previousAnswers];
      nextAnswers[currentIndex] = value;
      return nextAnswers;
    });
  }

  function goBack() {
    setError(null);
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }

  function goNext() {
    setError(null);
    setCurrentIndex((index) => Math.min(index + 1, questions.length - 1));
  }

  async function submitAnswers() {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ answers })
      });

      if (!response.ok) {
        throw new Error("Unable to generate report.");
      }

      const data = (await response.json()) as GenerateResponse;
      router.push(`/report/${data.id}`);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-600">{progressLabel}</p>
        <div className="mt-3 h-2 w-full rounded bg-gray-200">
          <div
            className="h-2 rounded bg-black"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`
            }}
          />
        </div>
      </div>

      <section className="flex flex-1 flex-col">
        <h1 className="text-2xl font-semibold">{currentQuestion.prompt}</h1>
        <textarea
          value={answers[currentIndex]}
          onChange={(event) => updateAnswer(event.target.value)}
          className="mt-6 min-h-48 w-full rounded border border-gray-300 p-4 text-base outline-none focus:border-black"
          placeholder="Write your answer..."
        />

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={currentIndex === 0 || isSubmitting}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>

          {isLastQuestion ? (
            <button
              type="button"
              onClick={submitAnswers}
              disabled={isSubmitting}
              className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={isSubmitting}
              className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
