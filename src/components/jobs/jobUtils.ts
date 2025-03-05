
import { format } from "date-fns";
import { Job } from "@/types/job";

export const getScheduleDisplay = (job: Job): string => {
  switch (job.frequency) {
    case "Once":
      return `Once on ${format(new Date(job.schedule), "PPP 'at' p")}`;
    case "Hourly":
      return "Every hour";
    case "Daily":
      return `Daily at ${job.schedule}`;
    case "Weekly":
      return `Weekly on ${job.schedule}`;
    case "Monthly":
      return `Monthly on day ${job.schedule.split(' ')[0]} at ${job.schedule.split(' ')[1]}`;
    default:
      return job.schedule;
  }
};
