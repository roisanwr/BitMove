import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "TASK LIBRARY | MASTER DATA | BITMOVE",
};

export default async function TaskLibraryPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch all tasks ordered by category, then title
  const tasks = await prisma.task_library.findMany({
    orderBy: [
      { category: "asc" },
      { title: "asc" }
    ]
  });

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tighter text-white">
            TASK LIBRARY
          </h1>
          <p className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant mt-2 border-l-2 border-primary pl-3">
            MASTER DATA: DEFAULT TASKS AND QUEST TEMPLATES.
          </p>
        </div>
        <button className="bg-primary hover:bg-white text-black font-headline font-black px-4 py-2 uppercase tracking-widest transition-colors text-xs shadow-[0_0_10px_rgba(142,255,113,0.3)] hover:shadow-none">
          + ADD NEW
        </button>
      </div>

      <div className="bg-surface-container border border-outline-variant/30 overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant font-headline uppercase tracking-widest text-sm border-b-2 border-primary border-dashed">
            NO TASKS FOUND IN THE LIBRARY.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-headline">
              <thead className="bg-surface-container-high border-b-2 border-outline-variant/50">
                <tr className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                  <th className="p-4 py-6 font-black w-14 text-center">Icon</th>
                  <th className="p-4 py-6 font-black">Title</th>
                  <th className="p-4 py-6 font-black">Category</th>
                  <th className="p-4 py-6 font-black text-center">Priority</th>
                  <th className="p-4 py-6 font-black text-center">Freq.</th>
                  <th className="p-4 py-6 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold divide-y divide-outline-variant/20">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-bright transition-colors text-white">
                    <td className="p-4 text-center text-xl">{t.icon_emoji || "📋"}</td>
                    <td className="p-4 uppercase text-primary">{t.title}</td>
                    <td className="p-4 text-[#ababab] uppercase">{t.category}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 text-[9px] tracking-widest uppercase ${
                        t.default_priority === 'High' ? 'bg-error/20 text-error' : 
                        t.default_priority === 'Medium' ? 'bg-secondary/20 text-secondary' : 
                        'bg-surface-container-higher text-on-surface'
                      }`}>
                        {t.default_priority}
                      </span>
                    </td>
                    <td className="p-4 text-center text-xs uppercase text-on-surface-variant">
                      {t.default_frequency}
                    </td>
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
