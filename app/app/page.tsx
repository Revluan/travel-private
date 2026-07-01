import { auth } from "@clerk/nextjs/server";

export default async function AppPage() {
  const { userId } = await auth();
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">已登录</h1>
      <p className="text-sm text-neutral-600">
        Clerk userId: <code className="font-mono">{userId}</code>
      </p>
    </div>
  );
}
