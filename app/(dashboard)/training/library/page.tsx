import { auth } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { ProgramLibraryClient } from "./ProgramLibraryClient";

export const metadata = {
  title: "PROGRAM LIBRARY | BITMOVE",
};

export default async function ProgramLibraryPage() {
  const session = await auth();
  if (!session?.user?.id) return <div>Unauthorized Access.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-500">
      <div className="mb-8">
        <Link
          href="/training"
          className="inline-flex items-center gap-2 font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO TRAINING GROUND
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tighter text-white">
              PROGRAM LIBRARY
            </h1>
            <p className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant mt-2 border-l-2 border-primary pl-3">
              PILIH TEMPLATE PROGRAM LATIHAN. KUSTOMISASI. AKTIFKAN.
            </p>
          </div>
          <div className="hidden md:flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/30 shrink-0">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-surface-container border-l-4 border-secondary p-4">
          <p className="font-body text-sm text-on-surface-variant">
            <span className="text-secondary font-bold">💡 Cara pakai:</span>{" "}
            Pilih template yang sesuai → klik{" "}
            <span className="text-white font-semibold">GUNAKAN TEMPLATE</span> → template
            akan di-load ke Builder. Kamu bisa edit, tambah, atau hapus slot sebelum mengaktifkan program.
          </p>
        </div>
      </div>

      <ProgramLibraryClient />
    </div>
  );
}
