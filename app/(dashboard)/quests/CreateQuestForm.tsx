"use client";

import { useActionState, useState } from "react";
import { createTask } from "./actions";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function CreateQuestForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createTask as any, null);

  // Close modal when successful logic would go here, but for simplicity, 
  // we could just close on form submit because data mutates optimistic/revalidates.
  const handleAction = async (formData: FormData) => {
    await createTask(formData);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 md:bottom-12 md:right-12 bg-primary text-black flex items-center gap-3 px-6 py-4 border-l-4 border-secondary shadow-[0_0_20px_rgba(142,255,113,0.3)] hover:shadow-[0_0_30px_rgba(142,255,113,0.6)] hover:-translate-y-1 transition-all z-40 group"
      >
        <Plus className="w-5 h-5 font-black group-hover:rotate-90 transition-transform duration-300" />
        <span className="font-headline font-black uppercase tracking-widest text-sm pt-0.5">NEW DIRECTIVE</span>
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-surface-container border-l-4 border-primary p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline font-black uppercase text-xl text-primary tracking-widest">ASSIGN NEW DIRECTIVE</h3>
            <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form action={handleAction} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-1">
                Directive Title
              </label>
              <input
                type="text"
                name="title"
                required
                className="w-full bg-surface-container-high border border-outline-variant/50 px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
                placeholder="E.g. Read 10 Pages of SECRETS.md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-1">
                  Category
                </label>
                <select name="category" className="w-full bg-surface-container-high border border-outline-variant/50 px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors appearance-none">
                  <option value="Training">Training</option>
                  <option value="Nutrition">Nutrition</option>
                  <option value="Intelligence">Intelligence (Study)</option>
                  <option value="Recovery">Recovery</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-1">
                  Frequency
                </label>
                <select name="frequency" className="w-full bg-surface-container-high border border-outline-variant/50 px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors appearance-none">
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="OneTime">One-Time</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-1">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Low", "Medium", "High"].map((p) => (
                  <label key={p} className="cursor-pointer">
                    <input type="radio" name="priority" value={p} className="peer sr-only" defaultChecked={p === "Medium"} />
                    <div className="text-center font-headline uppercase font-bold text-xs py-2 bg-surface-container-high border border-outline-variant/50 peer-checked:bg-primary/20 peer-checked:border-primary peer-checked:text-primary transition-colors">
                      {p}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 mt-6 hover:shadow-[0_0_15px_#8eff71] transition-all"
            >
              INITIALIZE DIRECTIVE
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
