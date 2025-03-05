
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JobFrequency } from "@/types/job";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface JobScheduleInputProps {
  frequency: JobFrequency;
  schedule: string;
  onScheduleChange: (schedule: string) => void;
}

const JobScheduleInput = ({ frequency, schedule, onScheduleChange }: JobScheduleInputProps) => {
  
  switch (frequency) {
    case "Daily":
      return (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="time" className="text-right">
            Time
          </Label>
          <Input
            id="time"
            type="time"
            value={schedule}
            onChange={(e) => onScheduleChange(e.target.value)}
            className="col-span-3"
          />
        </div>
      );
      
    case "Weekly":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="day" className="text-right">
              Day
            </Label>
            <Select 
              value={schedule.split(' ')[0] || "Monday"} 
              onValueChange={(day) => onScheduleChange(`${day} ${schedule.split(' ')[1] || "08:00"}`)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monday">Monday</SelectItem>
                <SelectItem value="Tuesday">Tuesday</SelectItem>
                <SelectItem value="Wednesday">Wednesday</SelectItem>
                <SelectItem value="Thursday">Thursday</SelectItem>
                <SelectItem value="Friday">Friday</SelectItem>
                <SelectItem value="Saturday">Saturday</SelectItem>
                <SelectItem value="Sunday">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weeklyTime" className="text-right">
              Time
            </Label>
            <Input
              id="weeklyTime"
              type="time"
              value={schedule.split(' ')[1] || "08:00"}
              onChange={(e) => onScheduleChange(`${schedule.split(' ')[0] || "Monday"} ${e.target.value}`)}
              className="col-span-3"
            />
          </div>
        </div>
      );
      
    case "Monthly":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="day" className="text-right">
              Day of Month
            </Label>
            <Select 
              value={schedule.split(' ')[0] || "1"} 
              onValueChange={(day) => onScheduleChange(`${day} ${schedule.split(' ')[1] || "08:00"}`)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="monthlyTime" className="text-right">
              Time
            </Label>
            <Input
              id="monthlyTime"
              type="time"
              value={schedule.split(' ')[1] || "08:00"}
              onChange={(e) => onScheduleChange(`${schedule.split(' ')[0] || "1"} ${e.target.value}`)}
              className="col-span-3"
            />
          </div>
        </div>
      );
      
    case "Once":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={schedule.split('T')[0] || new Date().toISOString().split('T')[0]}
              onChange={(e) => onScheduleChange(`${e.target.value}T${schedule.split('T')[1] || "08:00"}`)}
              className="col-span-3"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="onceTime" className="text-right">
              Time
            </Label>
            <Input
              id="onceTime"
              type="time"
              value={schedule.split('T')[1] || "08:00"}
              onChange={(e) => onScheduleChange(`${schedule.split('T')[0] || new Date().toISOString().split('T')[0]}T${e.target.value}`)}
              className="col-span-3"
            />
          </div>
        </div>
      );
      
    case "Hourly":
      return (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="minute" className="text-right">
            Minute
          </Label>
          <Select
            value={schedule || "0"}
            onValueChange={onScheduleChange}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select minute" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                <SelectItem key={minute} value={minute.toString()}>
                  {minute.toString().padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
      
    default:
      return null;
  }
};

export default JobScheduleInput;
