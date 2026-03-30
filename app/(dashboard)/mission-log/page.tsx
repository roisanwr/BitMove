import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

export const metadata = {
  title: "MISSION LOG | BITMOVE",
};

export default async function MissionLogPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const logs = await prisma.point_logs.findMany({
    where: { user_id: session.user.id },
    orderBy: { created_at: "desc" },
    take: 100 // Limit to latest 100 logs
  });

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tighter text-white">
          MISSION LOG
        </h1>
        <p className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant mt-2 border-l-2 border-primary pl-3">
          TRANSACTION ARCHIVES: XP GAINS AND ASSET LIQUIDATION.
        </p>
      </div>

      <div className="bg-surface-container border border-outline-variant/30 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant font-headline uppercase tracking-widest text-sm border-b-2 border-primary border-dashed">
            NO TRANSACTION RECORDS FOUND.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-headline">
              <thead className="bg-surface-container-high border-b-2 border-outline-variant/50">
                <tr className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                  <th className="p-4 py-6 font-black">Timestamp</th>
                  <th className="p-4 py-6 font-black">Source</th>
                  <th className="p-4 py-6 font-black">Description</th>
                  <th className="p-4 py-6 font-black text-right">XP</th>
                  <th className="p-4 py-6 font-black text-right">Points</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold divide-y divide-outline-variant/20">
                {logs.map((log: any) => {
                  const xp = log.xp_change || 0;
                  const pts = log.points_change || 0;
                  
                  return (
                    <tr key={log.id} className="hover:bg-surface-bright transition-colors text-white">
                      <td className="p-4 text-xs text-on-surface-variant font-body">
                        {log.created_at ? format(new Date(log.created_at), "yyyy-MM-dd HH:mm") : "-"}
                      </td>
                      <td className="p-4 uppercase text-[#ababab]">{log.source_type}</td>
                      <td className="p-4">{log.description}</td>
                      <td className={`p-4 text-right ${xp > 0 ? "text-primary" : xp < 0 ? "text-error" : "text-on-surface-variant"}`}>
                        {xp > 0 ? `+${xp}` : xp}
                      </td>
                      <td className={`p-4 text-right ${pts > 0 ? "text-primary" : pts < 0 ? "text-error" : "text-on-surface-variant"}`}>
                        {pts > 0 ? `+${pts}` : pts}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
