import * as z from "zod";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { allTimezones, useTimezoneSelect } from "react-timezone-select";
import styles from '@/components/Datepicker.module.css';


const formSchema = z.object({
  start_date: z.date(),
  start_time: z.string().min(1, { message: "Start time is required" }),
  end_date: z.date(),
  end_time: z.string().min(1, { message: "End time is required" }),
  timezone: z.any(),
}).refine(
  (data) => {
    const startDateTime = combineDateTime(data.start_date, data.start_time);
    const endDateTime = combineDateTime(data.end_date, data.end_time);
    return endDateTime > startDateTime;
  },
  {
    message: "End date and time must be after start date and time",
    path: ["end_time"],
  }
);

function combineDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const datetime = new Date(date);
  datetime.setHours(hours, minutes);
  return datetime;
}

const labelStyle = "original";
const timezones = {
  ...allTimezones,
  "Europe/Berlin": "Frankfurt",
};

const CustomTimezoneSelect = ({ onChange, value }) => {
  const { options, parseTimezone } = useTimezoneSelect({
    labelStyle,
    timezones,
  });

  return (
    <select
      value={value}
      onChange={(e) => onChange(parseTimezone(e.currentTarget.value))}
      className="border rounded p-2 bg-card max-w-full w-full"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export function EventDateTimeForm() {
  const { control, setValue } = useFormContext();

  return (
    <div className="rounded-lg p-4 border mt-4">
      <div className="flex flex-col md:flex-row md:gap-8">
        <div className="flex items-center gap-3 flex-1">
          <FormField
            control={control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col flex-1">
                <FormLabel>
                  Start Date & Time
                </FormLabel>
                <DatePicker
                  selected={field.value}
                  onChange={(date) => {
                    field.onChange(date);
                    if (date) {
                      setValue(
                        "start_time",
                        format(date, "HH:mm")
                      );
                    }
                  }}
                  className="border bg-card rounded p-2 rounded-full w-full max-w-full sm:max-w-xs"
                  placeholderText="Start date and time"
                  dateFormat="MMM d, yyyy h:mm aa"
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  popperClassName={styles.customDatepicker}
                  withPortal={window.innerWidth < 290}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-3 flex-1">
          <FormField
            control={control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col flex-1">
                <FormLabel>
                  End Date & Time
                </FormLabel>
                <DatePicker
                  selected={field.value}
                  onChange={(date) => {
                    field.onChange(date);
                    if (date) {
                      setValue(
                        "end_time",
                        format(date, "HH:mm")
                      );
                    }
                  }}
                  className="border bg-card rounded p-2 rounded-full w-full max-w-full sm:max-w-xs"
                  placeholderText="End date and time"
                  dateFormat="MMM d, yyyy h:mm aa"
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  popperClassName={styles.customDatepicker}
                  withPortal={window.innerWidth < 290}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <FormField
          control={control}
          name="timezone"
          render={({ field }) => (
            <FormItem className="flex flex-col flex-1">
              <FormLabel>
                Timezone
              </FormLabel>
              <CustomTimezoneSelect
                value={field.value}
                onChange={(timezone) =>
                  field.onChange(timezone.value)
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}