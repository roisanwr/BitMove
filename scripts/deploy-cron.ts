// Script untuk men-deploy ulang fungsi Cron handle_smart_global_reset ke database
// jalankan: npx tsx scripts/deploy-cron.ts

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log("🚀 Deploying updated handle_smart_global_reset...");

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION public.handle_smart_global_reset() RETURNS void AS $$
    BEGIN
        CREATE TEMP TABLE temp_users_to_reset ON COMMIT DROP AS
        SELECT id, streak_current, streak_max, last_active_date, timezone
        FROM public.profiles
        WHERE (now() AT TIME ZONE coalesce(timezone, 'Asia/Jakarta'))::date > last_reset_date;

        IF (SELECT count(*) FROM temp_users_to_reset) > 0 THEN
            
            -- A. Macro Punishment (-200) untuk Full Skip Day
            INSERT INTO public.point_logs (user_id, xp_change, points_change, source_type, description)
            SELECT u.id, 0, -200, 'punishment', 'Full Skip Day Penalty 😭'
            FROM temp_users_to_reset u
            WHERE u.last_active_date < ((now() AT TIME ZONE coalesce(u.timezone, 'Asia/Jakarta'))::date - 1);

            -- B. Micro Punishment (-50) untuk setiap Task "High" yang dilewatkan
            INSERT INTO public.point_logs (user_id, xp_change, points_change, source_type, description)
            SELECT t.user_id, 0, -50, 'punishment', 'Missed High Task: ' || t.title
            FROM public.tasks t
            JOIN temp_users_to_reset u ON u.id = t.user_id
            WHERE t.frequency = 'Daily' 
              AND t.priority = 'High' 
              AND t.is_completed = false;

            -- C. STREAK BONUS
            INSERT INTO public.point_logs (user_id, xp_change, points_change, source_type, description)
            SELECT u.id, 20, 5, 'streak_bonus', 'Daily Streak Kept! Great job!'
            FROM temp_users_to_reset u
            LEFT JOIN public.tasks t ON t.user_id = u.id AND t.frequency = 'Daily'
            GROUP BY u.id
            HAVING COUNT(t.id) > 0 AND (COUNT(CASE WHEN t.is_completed THEN 1 END)::float / COUNT(t.id)::float) >= 0.8;

            -- D. UPDATE Streak & last_reset_date
            UPDATE public.profiles p
            SET 
                streak_current = CASE 
                    WHEN p.last_active_date < ((now() AT TIME ZONE coalesce(p.timezone, 'Asia/Jakarta'))::date - 1) THEN 0
                    WHEN stats.total_tasks > 0 AND stats.completion_rate >= 0.8 THEN p.streak_current + 1 
                    WHEN stats.total_tasks > 0 AND stats.completion_rate < 0.8 THEN 0
                    ELSE p.streak_current END,
                streak_max = GREATEST(p.streak_max, CASE WHEN stats.total_tasks > 0 AND stats.completion_rate >= 0.8 THEN p.streak_current + 1 ELSE p.streak_current END),
                last_reset_date = (now() AT TIME ZONE coalesce(p.timezone, 'Asia/Jakarta'))::date
            FROM (
                SELECT u.id, 
                       COUNT(t.id) as total_tasks,
                       COALESCE((COUNT(CASE WHEN t.is_completed THEN 1 END)::float / NULLIF(COUNT(t.id), 0)::float), 0.0) as completion_rate
                FROM temp_users_to_reset u
                LEFT JOIN public.tasks t ON t.user_id = u.id AND t.frequency = 'Daily'
                GROUP BY u.id
            ) stats
            WHERE p.id = stats.id;

            -- E. Bersihkan Task Harian
            UPDATE public.tasks 
            SET is_completed = false, current_value = 0, last_completed_at = null
            WHERE frequency = 'Daily' AND user_id IN (SELECT id FROM temp_users_to_reset);

            -- F. HUKUMAN BOLOS TRAINING WORKOUT ⚔️
            INSERT INTO public.point_logs (user_id, xp_change, points_change, source_type, description)
            SELECT DISTINCT u.id, -150, -50, 'punishment', 'Missed Scheduled Workout! Pemalas! 😤'
            FROM temp_users_to_reset u
            JOIN public.training_programs tp ON tp.user_id = u.id AND tp.is_active = true
            JOIN public.program_schedules ps ON ps.program_id = tp.id
                AND ps.day_of_week = EXTRACT(ISODOW FROM (now() AT TIME ZONE coalesce(u.timezone, 'Asia/Jakarta'))::date - 1)
                AND ps.week_number = (
                    FLOOR(
                        EXTRACT(DAY FROM (
                            ((now() AT TIME ZONE coalesce(u.timezone, 'Asia/Jakarta'))::date - 1) - tp.start_date
                        ))::numeric / 7
                    )::int % tp.total_weeks
                ) + 1
            WHERE NOT EXISTS (
                SELECT 1 FROM public.workouts w
                WHERE w.user_id = u.id
                  AND w.status = 'completed'
                  AND (w.ended_at AT TIME ZONE coalesce(u.timezone, 'Asia/Jakarta'))::date = 
                      ((now() AT TIME ZONE coalesce(u.timezone, 'Asia/Jakarta'))::date - 1)
            );

        END IF;

        -- G. LOGIC MINGGUAN (RESET HARI SENIN)
        UPDATE public.tasks t
        SET is_completed = false, current_value = 0, last_completed_at = null
        FROM public.profiles p
        WHERE t.user_id = p.id 
          AND t.frequency = 'Weekly'
          AND EXTRACT(ISODOW FROM (now() AT TIME ZONE coalesce(p.timezone, 'Asia/Jakarta'))::date) = 1
          AND (now() AT TIME ZONE coalesce(p.timezone, 'Asia/Jakarta'))::date > p.last_weekly_reset;

        UPDATE public.profiles
        SET last_weekly_reset = (now() AT TIME ZONE coalesce(timezone, 'Asia/Jakarta'))::date
        WHERE EXTRACT(ISODOW FROM (now() AT TIME ZONE coalesce(timezone, 'Asia/Jakarta'))::date) = 1
          AND (now() AT TIME ZONE coalesce(timezone, 'Asia/Jakarta'))::date > last_weekly_reset;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  console.log("✅ Cron function updated successfully!");

  // Deploy cron schedule
  console.log("⏰ Scheduling hourly cron job...");
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
        BEGIN
            PERFORM cron.unschedule('hourly-smart-global-reset');
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
        PERFORM cron.schedule(
            'hourly-smart-global-reset',
            '0 * * * *',
            'SELECT public.handle_smart_global_reset()'
        );
    END $$;
  `);
  console.log("✅ Cron schedule registered: runs every hour at :00");

  // Verify
  const jobs = await prisma.$queryRawUnsafe(`SELECT jobid, jobname, schedule FROM cron.job WHERE jobname = 'hourly-smart-global-reset'`);
  console.log("📋 Registered cron jobs:", jobs);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
