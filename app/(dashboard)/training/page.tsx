import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Play, Activity } from "lucide-react";
import { ActiveWorkoutUI } from "./ActiveWorkoutUI";

export const metadata = {
  title: "TRAINING GROUND | BITMOVE",
};

export default async function TrainingPage() {
  const session = await auth();
  if (!session?.user?.id) return <div>Unauthorized Access.</div>;

  // Check if there is an active workout
  const activeWorkout = await prisma.workouts.findFirst({
    where: { 
      user_id: session.user.id,
      status: "in_progress" 
    },
    include: {
      workout_exercises: {
        include: {
          exercises: true,
          sets: { orderBy: { set_number: "asc" } }
        }
      }
    }
  });

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tighter text-white">
          TRAINING GROUND
        </h1>
        <p className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant mt-2 border-l-2 border-secondary pl-3">
          PHYSICAL CONDITIONING MODULE. START WORKOUT TO EARN XP.
        </p>
      </div>

      {activeWorkout ? (
        <ActiveWorkoutUI workout={activeWorkout} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface-container p-8 border-t-4 border-secondary relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="w-48 h-48" />
            </div>
            
            <h2 className="font-headline font-black uppercase text-2xl text-secondary mb-4 z-10 relative">
              INITIATE NEW SESSION
            </h2>
            <p className="font-body text-sm text-on-surface-variant mb-8 z-10 relative">
              Deploy your physical avatar into the training simulation. Log sets, lift weights, and conquer difficulty tiers to accumulate raw XP power.
            </p>
            
            <form action={async () => {
              "use server";
              const s = await auth();
              if(s?.user?.id) {
                await prisma.workouts.create({
                  data: {
                    user_id: s.user.id,
                    status: "in_progress"
                  }
                });
              }
            }}>
              <button className="w-full bg-secondary text-black font-headline font-black py-4 uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-[0_0_20px_#d575ff] transition-all z-10 relative glitch-effect">
                <Play className="w-5 h-5 fill-current" />
                START WORKOUT
              </button>
            </form>
          </div>

          <div className="bg-surface-container-low p-8 border border-outline-variant/30">
            <h3 className="font-headline font-bold text-sm uppercase text-on-surface-variant mb-4">
              RECENT SESSIONS
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-highest border-l-2 border-outline-variant opacity-70">
                <p className="font-headline text-xs uppercase tracking-widest text-on-surface-variant text-center">
                  NO RECENT ARCHIVES FOUND
                </p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-outline-variant/20">
              <Link href="/training/library" className="font-headline text-xs text-secondary hover:text-white uppercase tracking-widest flex items-center justify-between">
                <span>View Exercise Library</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
