import { AuthTokens, EventResponse, SingleEventResponse, StorageKey } from "@/utils/dataStructures";
import { getToken } from "@/utils/utils";

// Function to fetch events
export async function fetchEvents() {
    // Logic to fetch events from the database or an external API
    const events = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/events`, {});
    return events.json()
}


// Function to create an event
export async function createEvent(eventData) {
    try {
        const token = getToken();
        if (!token?.access) {
            throw new Error('No token found');
        }

        const formData = new FormData();
        Object.entries(eventData).forEach(([key, value]) => {
            if ((key === 'start_date' || key === 'end_date') && value) {
                formData.append(key, new Date(value as string).toISOString());
            } else {
                formData.append(key, value as string | Blob);
            }
        });

        const newEvent = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/events`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token?.access}`,
            },
            body: formData, 
        });

        if (!newEvent.ok) {
            throw new Error(`Response status: ${newEvent.status}`);
        }
        return newEvent.json()
    } catch (error) {
        console.error("Error:", error);
        throw error; // Re-throw the error to handle it in the calling code
    }
}

// Function to update an event
export async function updateEvent(eventId: string, eventData: any) {
    try {
        const token = getToken();
        if (!token?.access) {
            throw new Error('No token found');
        }
        
        const updatedEvent = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/events/${eventId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token.access}`,
            },
            body: (() => {
                const formData = new FormData();
                // Append event data
                for (const key in eventData) {
                    // Check if the key is 'end_date' and format it
                    if (key === 'start_date' ||key === 'end_date' && eventData[key]) {
                        const date = new Date(eventData[key]);
                        formData.append(key, date.toISOString()); // Format to ISO string
                    } else {
                        formData.append(key, eventData[key]);
                    }
                }
                return formData;
            })(),
        });
        
        if (!updatedEvent.ok) {
            throw new Error(`Response status: ${updatedEvent.status}`);
        }
        return updatedEvent.json();
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export async function fetchEvent(eventId: string) {

    const token = getToken();
    if (!token?.access) {
        throw new Error('No token found');
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/events/${eventId}`, {
      method: "GET",  
      headers: {
            "Authorization": `Bearer ${token.access}`,
        }
    });
    if (!response.ok) {
        console.log({response});
        throw new Error(`Error fetching event: ${response.status}`);
    }
    return await response.json() as SingleEventResponse;
}



export async function fetchEventById(eventId: string) {
    const token = getToken();
    if (!token?.access) {
        throw new Error('No token found');
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/events/${eventId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token.access}`,
            "Content-Type": "application/json",
        }
    });
    if (!response.ok) {
        throw new Error(`Error fetching event: ${response.status}`);
    }
    return await response.json() as SingleEventResponse;
}

export async function publishEvent(eventId: string) {

  const token = getToken();
  if (!token?.access) {
      throw new Error('No token found');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/events/${eventId}`, {
    method: "POST",  
    headers: {
          "Authorization": `Bearer ${token?.access}`,
      }
  });
  if (!response.ok) {
      throw new Error(`Error publishing event: ${response.status}`);
  }
  return response.json();
}
