"use client";
import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-grey-600 mb-4">Financial Management</h1>
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      onClick={() => router.push('/upload')}>
        Upload Bank Statement
      </button>
    </main>
  );
}
