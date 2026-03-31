import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "LEVEL RULES | MASTER DATA | BITMOVE",
};

export default async function LevelRulesPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch all level rules ordered by level
  const levelRules = await prisma.level_rules.findMany({
    orderBy: { level: "asc" }
  });

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tighter text-white">
          LEVEL RULES
        </h1>
        <p className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant mt-2 border-l-2 border-primary pl-3">
          MASTER DATA: XP REQUIREMENTS AND LEVEL TITLES.
        </p>
      </div>

      <div className="bg-surface-container border border-outline-variant/30 overflow-hidden">
        {levelRules.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant font-headline uppercase tracking-widest text-sm border-b-2 border-primary border-dashed">
            NO LEVEL RULES RECORDED.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-headline">
              <thead className="bg-surface-container-high border-b-2 border-outline-variant/50">
                <tr className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                  <th className="p-4 py-6 font-black w-24">Level</th>
                  <th className="p-4 py-6 font-black">Min XP Required</th>
                  <th className="p-4 py-6 font-black">Rank Title</th>
                  <th className="p-4 py-6 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold divide-y divide-outline-variant/20">
                {levelRules.map((rule) => (
                  <tr key={rule.level} className="hover:bg-surface-bright transition-colors text-white">
                    <td className="p-4 text-primary">{rule.level}</td>
                    <td className="p-4">{rule.min_xp.toLocaleString('id-ID')} XP</td>
                    <td className="p-4 text-[#ababab] uppercase">{rule.title || "-"}</td>
                    <td className="p-4 text-right">
                      <button className="text-xs text-on-surface-variant hover:text-white uppercase tracking-widest">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
