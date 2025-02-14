// Function to fetch events
export async function fetchEvents() {
    // Logic to fetch events from the database or an external API
    const events = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}/api/v1/events`, {});
    return events.json()
}

// Function to create an event
export async function createEvent(eventData) {
    try {
        // Retrieve the token from localStorage
        const token = localStorage.getItem('token');

        const newEvent = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}/api/v1/events`, {
            method: "POST", 
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`, // Add JWT token to the Authorization header
            },
            body: (() => {
                const formData = new FormData();
                // Append event data
                for (const key in eventData) {
                    // Check if the key is 'start or end_date' and format it
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
        if (!newEvent.ok) {
            throw new Error(`Response status: ${newEvent.status}`);
          }
        return newEvent.json()
      } catch (error) {
        console.error("Error:", error);
      }
}

// Function to update an event
export async function updateEvent(eventId: string, eventData: any) {
    try {
        const token = localStorage.getItem('token');
        
        const updatedEvent = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}/api/v1/events/${eventId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
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
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}/api/v1/events/${eventId}`, {
      method: "GET",  
      headers: {
            "Authorization": `Bearer ${token}`,
        }
    });
    if (!response.ok) {
        console.log({response});
        throw new Error(`Error fetching event: ${response.status}`);
    }
    return response.json();
}

export async function publishEvent(eventId: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}/api/v1/events/${eventId}`, {
    method: "POST",  
    headers: {
          "Authorization": `Bearer ${token}`,
      }
  });
  if (!response.ok) {
      throw new Error(`Error publishing event: ${response.status}`);
  }
  return response.json();
}
