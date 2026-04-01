import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * API Fallback untuk trigger reset harian secara manual atau via external cron.
 * 
 * Penggunaan:
 * - GET /api/cron/reset?secret=YOUR_SECRET
 * 
 * Bisa dipanggil oleh:
 * - Vercel Cron
 * - External cron service (cron-job.org, etc.)
 * - Manual trigger dari admin
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Simple secret-based auth — ganti dengan AUTH_SECRET dari .env
  const expectedSecret = process.env.AUTH_SECRET;
  if (!secret || secret !== expectedSecret) {
    return NextResponse.json(
      { error: "Unauthorized. Provide ?secret=YOUR_SECRET" },
      { status: 401 }
    );
  }

  try {
    // Panggil fungsi reset yang sudah ada di database
    await prisma.$executeRawUnsafe(
      `SELECT public.handle_smart_global_reset()`
    );

    return NextResponse.json({
      success: true,
      message: "Daily reset executed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Cron reset API failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
