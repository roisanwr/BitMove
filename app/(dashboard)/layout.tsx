import { DashboardShell } from "@/components/layout/DashboardShell";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let streak = 0;
  if (session?.user?.id) {
    const profile = await prisma.profiles.findUnique({
      where: { id: session.user.id },
      select: { streak_current: true }
    });
    streak = profile?.streak_current || 0;
  }

  return <DashboardShell streak={streak}>{children}</DashboardShell>;
}
