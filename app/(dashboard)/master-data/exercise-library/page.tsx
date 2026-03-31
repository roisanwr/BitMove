import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "EXERCISE LIBRARY | MASTER DATA | BITMOVE",
};

export default async function ExerciseLibraryPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch all exercises
  const exercises = await prisma.exercise_library.findMany({
    orderBy: [
      { target_muscle: "asc" },
      { name: "asc" }
    ]
  });

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tighter text-white">
            EXERCISE LIBRARY
          </h1>
          <p className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant mt-2 border-l-2 border-primary pl-3">
            MASTER DATA: PHYSICAL TRAINING MOVEMENT DATABASE.
          </p>
        </div>
        <button className="bg-primary hover:bg-white text-black font-headline font-black px-4 py-2 uppercase tracking-widest transition-colors text-xs shadow-[0_0_10px_rgba(142,255,113,0.3)] hover:shadow-none">
          + ADD NEW
        </button>
      </div>

      <div className="bg-surface-container border border-outline-variant/30 overflow-hidden">
        {exercises.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant font-headline uppercase tracking-widest text-sm border-b-2 border-primary border-dashed">
            NO EXERCISES FOUND IN THE LIBRARY.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-headline">
              <thead className="bg-surface-container-high border-b-2 border-outline-variant/50">
                <tr className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                  <th className="p-4 py-6 font-black w-24">Image</th>
                  <th className="p-4 py-6 font-black">Movement Name</th>
                  <th className="p-4 py-6 font-black">Target Muscle</th>
                  <th className="p-4 py-6 font-black">Scale Type</th>
                  <th className="p-4 py-6 font-black">Unit</th>
                  <th className="p-4 py-6 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold divide-y divide-outline-variant/20">
                {exercises.map((ex) => (
                  <tr key={ex.id} className="hover:bg-surface-bright transition-colors text-white">
                    <td className="p-4">
                      {ex.image_url ? (
                        <div className="w-12 h-12 bg-surface-container-highest border border-outline-variant overflow-hidden">
                          <img src={ex.image_url} alt={ex.name} className="w-full h-full object-cover grayscale opacity-80" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-surface-container-highest border border-outline-variant flex items-center justify-center text-on-surface-variant/50">
                          <span className="material-symbols-outlined text-xl">image</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 uppercase text-primary">
                      {ex.name}
                      {ex.is_archived && <span className="ml-2 text-[8px] bg-error/20 text-error px-1 py-0.5 uppercase tracking-tighter">Archived</span>}
                    </td>
                    <td className="p-4 text-[#ababab] uppercase">{ex.target_muscle || "-"}</td>
                    <td className="p-4 text-xs font-mono lowercase text-secondary">{ex.scale_type}</td>
                    <td className="p-4 text-xs lowercase text-on-surface-variant">{ex.measurement_unit}</td>
                    <td className="p-4 text-right">
                      <button className="text-[10px] text-on-surface-variant hover:text-white uppercase tracking-widest mr-3 transition-colors">Edit</button>
                      <button className="text-[10px] text-on-surface-variant hover:text-error uppercase tracking-widest transition-colors">Del</button>
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
