
import { JobFrequency } from "@/types/job";
import { addHours, addDays, addMonths, setHours, setMinutes } from "date-fns";

// Calculate next run time based on frequency and schedule
export const calculateNextRun = (frequency: JobFrequency, schedule: string): string => {
  const now = new Date();
  
  switch (frequency) {
    case "Once":
      return schedule; // For one-time jobs, the schedule is the exact date/time
      
    case "Hourly":
      // Schedule next run at the next hour
      return addHours(now, 1).toISOString();
      
    case "Daily":
      // Parse the time (e.g., "08:30") and set it for tomorrow
      try {
        const [hours, minutes] = schedule.split(":").map(Number);
        let nextRun = new Date(now);
        nextRun = setHours(nextRun, hours);
        nextRun = setMinutes(nextRun, minutes);
        
        // If the time has already passed today, schedule for tomorrow
        if (nextRun <= now) {
          nextRun = addDays(nextRun, 1);
        }
        
        return nextRun.toISOString();
      } catch (error) {
        console.error("Error calculating daily schedule:", error);
        return addDays(now, 1).toISOString();
      }
      
    case "Weekly":
      // Parse the day and time (e.g., "Monday 08:30")
      try {
        const [day, time] = schedule.split(" ");
        const [hours, minutes] = time.split(":").map(Number);
        
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = now.getDay();
        const targetDay = daysOfWeek.indexOf(day);
        
        // Calculate days until the next occurrence of the target day
        let daysUntilTarget = targetDay - today;
        if (daysUntilTarget <= 0) {
          daysUntilTarget += 7;
        }
        
        let nextRun = addDays(now, daysUntilTarget);
        nextRun = setHours(nextRun, hours);
        nextRun = setMinutes(nextRun, minutes);
        
        return nextRun.toISOString();
      } catch (error) {
        console.error("Error calculating weekly schedule:", error);
        return addDays(now, 7).toISOString();
      }
      
    case "Monthly":
      // Parse the day of month and time (e.g., "15 08:30")
      try {
        const [dayOfMonth, time] = schedule.split(" ");
        const [hours, minutes] = time.split(":").map(Number);
        
        // Create date for the next occurrence of the specified day of month
        let nextRun = new Date(now.getFullYear(), now.getMonth(), parseInt(dayOfMonth));
        
        // If that day has already passed this month, move to next month
        if (nextRun <= now) {
          nextRun = new Date(now.getFullYear(), now.getMonth() + 1, parseInt(dayOfMonth));
        }
        
        nextRun = setHours(nextRun, hours);
        nextRun = setMinutes(nextRun, minutes);
        
        return nextRun.toISOString();
      } catch (error) {
        console.error("Error calculating monthly schedule:", error);
        return addMonths(now, 1).toISOString();
      }
      
    default:
      return now.toISOString();
  }
};
