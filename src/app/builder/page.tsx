import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default async function BuilderPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-neutral-800">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">
            Rig<span className="text-accent">Logic</span>
          </span>
        </Link>
        <UserButton />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Kit builder</h1>
        <p className="mt-4 max-w-md text-neutral-400">
          M1 scaffold complete. The kit builder ships in M2.
        </p>
      </main>
    </div>
  );
}
