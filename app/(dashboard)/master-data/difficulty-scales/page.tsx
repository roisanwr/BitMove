import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "DIFFICULTY SCALES | MASTER DATA | BITMOVE",
};

export default async function DifficultyScalesPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch all difficulty scales
  const scales = await prisma.difficulty_scales.findMany({
    orderBy: [
      { scale_type: "asc" },
      { tier: "asc" }
    ]
  });

  // Group by scale_type
  const groupedScales = scales.reduce((acc: any, scale) => {
    if (!acc[scale.scale_type]) {
      acc[scale.scale_type] = [];
    }
    acc[scale.scale_type].push(scale);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tighter text-white">
            DIFFICULTY SCALES
          </h1>
          <p className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant mt-2 border-l-2 border-primary pl-3">
            MASTER DATA: BASE TARGET VALUES PER MEASUREMENT TYPE AND TIER.
          </p>
        </div>
        <button className="bg-primary hover:bg-white text-black font-headline font-black px-4 py-2 uppercase tracking-widest transition-colors text-xs shadow-[0_0_10px_rgba(142,255,113,0.3)] hover:shadow-none">
          + ADD NEW
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(groupedScales).length === 0 ? (
          <div className="col-span-full p-12 text-center text-on-surface-variant font-headline uppercase tracking-widest text-sm border-b-2 border-primary border-dashed bg-surface-container">
            NO DIFFICULTY SCALES RECORDED.
          </div>
        ) : (
          Object.entries(groupedScales).map(([scaleType, items]: [string, any]) => (
            <div key={scaleType} className="bg-surface-container border border-outline-variant/30 overflow-hidden">
              <div className="bg-surface-container-high border-b-2 border-outline-variant/50 p-4">
                <h2 className="font-headline font-black text-xl text-primary uppercase tracking-widest">
                  {scaleType.replace("_", " ")}
                </h2>
              </div>
              <table className="w-full text-left font-headline">
                <thead className="bg-surface-container-high/50 border-b border-outline-variant/30">
                  <tr className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                    <th className="p-4 py-3 font-black">Tier Rank</th>
                    <th className="p-4 py-3 font-black">Target Base Value</th>
                    <th className="p-4 py-3 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold divide-y divide-outline-variant/20">
                  {items.map((item: any) => (
                    <tr key={`${item.scale_type}-${item.tier}`} className="hover:bg-surface-bright transition-colors text-white">
                      <td className="p-4 text-xs font-black">
                        <span className={`px-2 py-1 rounded-sm ${
                          item.tier === 'SS' ? 'bg-[#ffcc00]/20 text-[#ffcc00]' :
                          item.tier === 'S'  ? 'bg-error/20 text-error' :
                          item.tier === 'A'  ? 'bg-[#ff8800]/20 text-[#ff8800]' :
                          item.tier === 'B'  ? 'bg-primary/20 text-primary' :
                          item.tier === 'C'  ? 'bg-secondary/20 text-secondary' :
                          'bg-surface-container-higher text-on-surface'
                        }`}>
                          {item.tier}
                        </span>
                      </td>
                      <td className="p-4 text-[#ababab]">{item.target_value}</td>
                      <td className="p-4 text-right">
                        <button className="text-[10px] text-on-surface-variant hover:text-white uppercase tracking-widest transition-colors">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
