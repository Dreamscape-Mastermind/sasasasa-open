import * as z from "zod";
import { useFormContext, useWatch } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LocationSearchMap from "./LocationSearchMap";

const formSchema = z.object({
  venue: z.string().min(2, {
    message: "Venue must be at least 2 characters",
  }),
  capacity: z.coerce.number().nonnegative("Capacity is required."),
});

export function EventVenueCapacityForm() {
  const { control, setValue } = useFormContext();
  const venueValue = useWatch({ control, name: "venue" });

  return (
    <>
      <FormField
        control={control}
        name="venue"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Venue</FormLabel>
            <FormControl>
              {/* <Input
                placeholder="Enter event Venue"
                {...field}
                className="bg-card rounded-lg "
              /> */}
            </FormControl>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />

      {/* Location Search Map for Venue Selection */}
      <div className="my-4">
        <LocationSearchMap
          initialName={venueValue}
          onSelect={(location) => {
            setValue("venue", location.name);
            console.log({location})
          }}
        />
      </div>

      <FormField
        control={control}
        name="capacity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Capacity
            </FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Enter maximum capacity"
                {...field}
                className="bg-card rounded-lg "
              />
            </FormControl>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />
      {/* Hidden fields for lat/lng if not already in the form UI */}
      <input type="hidden" {...control.register("venue_lat")} />
      <input type="hidden" {...control.register("venue_lng")} />
    </>
  );
}