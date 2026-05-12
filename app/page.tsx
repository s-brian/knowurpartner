import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center px-6 py-16">
      <h1 className="text-4xl font-bold">Partner Quiz</h1>
      <p className="mt-4 text-lg text-gray-700">
        Answer ten reflective questions and generate a simple relationship report
        with labels, narrative notes, and a partner cheat sheet.
      </p>
      <Link
        href="/quiz"
        className="mt-8 rounded bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
      >
        Start quiz
      </Link>
    </main>
  );
}
