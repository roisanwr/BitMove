import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "TIER REWARDS | MASTER DATA | BITMOVE",
};

export default async function TierRewardsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch all tier rewards
  const rewards = await prisma.tier_rewards.findMany({
    orderBy: { tier: "asc" }
  });

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tighter text-white">
            TIER REWARDS
          </h1>
          <p className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant mt-2 border-l-2 border-primary pl-3">
            MASTER DATA: BASE XP AND POINTS ALLOCATED PER TIER DEFEATED.
          </p>
        </div>
        <button className="bg-primary hover:bg-white text-black font-headline font-black px-4 py-2 uppercase tracking-widest transition-colors text-xs shadow-[0_0_10px_rgba(142,255,113,0.3)] hover:shadow-none">
          + ADD NEW
        </button>
      </div>

      <div className="bg-surface-container border border-outline-variant/30 overflow-hidden">
        {rewards.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant font-headline uppercase tracking-widest text-sm border-b-2 border-primary border-dashed">
            NO TIER REWARDS RECORDED.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-headline">
              <thead className="bg-surface-container-high border-b-2 border-outline-variant/50">
                <tr className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                  <th className="p-4 py-6 font-black w-24">Tier</th>
                  <th className="p-4 py-6 font-black">XP Reward</th>
                  <th className="p-4 py-6 font-black">Points Reward</th>
                  <th className="p-4 py-6 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold divide-y divide-outline-variant/20">
                {rewards.map((reward) => (
                  <tr key={reward.tier} className="hover:bg-surface-bright transition-colors text-white">
                    <td className="p-4 font-black">
                      <span className={`px-2 py-1 rounded-sm ${
                        reward.tier === 'SS' ? 'bg-[#ffcc00]/20 text-[#ffcc00]' :
                        reward.tier === 'S'  ? 'bg-error/20 text-error' :
                        reward.tier === 'A'  ? 'bg-[#ff8800]/20 text-[#ff8800]' :
                        reward.tier === 'B'  ? 'bg-primary/20 text-primary' :
                        reward.tier === 'C'  ? 'bg-secondary/20 text-secondary' :
                        'bg-surface-container-higher text-on-surface'
                      }`}>
                        {reward.tier}
                      </span>
                    </td>
                    <td className="p-4 text-primary">+{reward.xp_reward.toLocaleString('id-ID')} XP</td>
                    <td className="p-4 text-secondary">+{reward.points_reward.toLocaleString('id-ID')} PTS</td>
                    <td className="p-4 text-right">
                      <button className="text-[10px] text-on-surface-variant hover:text-white uppercase tracking-widest transition-colors">Edit</button>
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
