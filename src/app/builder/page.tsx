import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BuilderShell } from "./BuilderShell";

export default async function BuilderPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return <BuilderShell />;
}
