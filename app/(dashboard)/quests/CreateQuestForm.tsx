"use client";

import { useTransition, useState } from "react";
import { createTask, createTaskFromLibrary } from "./actions";
import { Plus, X, BookOpen, PenSquare } from "lucide-react";
import type { task_library } from "@prisma/client";

type Props = {
  library: task_library[];
};

export function CreateQuestForm({ library }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"library" | "custom">("library");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAddFromLibrary = (libraryId: string) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await createTaskFromLibrary(libraryId);
      if (result?.error) {
        setFeedback(result.error);
      } else {
        setFeedback("✅ Directive berhasil ditambahkan!");
      }
    });
  };

  const handleCustomSubmit = async (formData: FormData) => {
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

  // Group library by category
  const grouped = library.reduce<Record<string, task_library[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-surface-container border-l-4 border-primary w-full max-w-lg animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-outline-variant/30 shrink-0">
            <h3 className="font-headline font-black uppercase text-xl text-primary tracking-widest">
              ASSIGN NEW DIRECTIVE
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex shrink-0 border-b border-outline-variant/30">
            <button
              onClick={() => setTab("library")}
              className={`flex-1 py-3 font-headline font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                tab === "library"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              DATABASE
            </button>
            <button
              onClick={() => setTab("custom")}
              className={`flex-1 py-3 font-headline font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                tab === "custom"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <PenSquare className="w-4 h-4" />
              CUSTOM
            </button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`px-6 pt-4 font-headline font-bold text-xs uppercase tracking-widest ${feedback.startsWith("✅") ? "text-primary" : "text-error"}`}>
              {feedback}
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-6">
            {tab === "library" ? (
              <div className="space-y-6">
                {library.length === 0 ? (
                  <p className="text-center text-on-surface-variant font-headline uppercase tracking-widest text-xs py-8">
                    Task Library masih kosong. Isi dulu dari Master Data!
                  </p>
                ) : (
                  Object.entries(grouped).map(([category, items]) => (
                    <div key={category}>
                      <div className="font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-3 border-b border-outline-variant/30 pb-1">
                        {category}
                      </div>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <button
                            key={item.id}
                            disabled={isPending}
                            onClick={() => handleAddFromLibrary(item.id)}
                            className="w-full flex items-center justify-between p-4 bg-surface-container-high border border-outline-variant/30 hover:border-primary hover:bg-surface-bright transition-all group text-left"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{item.icon_emoji || "📋"}</span>
                              <div>
                                <div className="font-headline font-black text-sm uppercase text-white">
                                  {item.title}
                                </div>
                                <div className="font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mt-0.5">
                                  {item.default_frequency} • {item.default_priority} Priority • Target: {item.default_target_value} {item.default_unit}
                                </div>
                              </div>
                            </div>
                            <Plus className="w-4 h-4 text-on-surface-variant group-hover:text-primary shrink-0 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <form action={handleCustomSubmit} className="space-y-4">
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
                      {Object.keys(grouped).length > 0 ? (
                        Object.keys(grouped).sort().map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))
                      ) : (
                        <>
                          <option value="Intellect">Intellect</option>
                          <option value="Vitality">Vitality</option>
                          <option value="Wealth">Wealth</option>
                          <option value="Charisma">Charisma</option>
                        </>
                      )}
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
                  className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 mt-2 hover:shadow-[0_0_15px_#8eff71] transition-all"
                >
                  INITIALIZE DIRECTIVE
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
