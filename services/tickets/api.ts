// Function to fetch events
export async function fetchTickets(eventId: string) {
  // Logic to fetch events from the database or an external API

  try {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('token');

    const tickets = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}/api/v1/events/${eventId}/ticket-types`, {
        method: "GET", 
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Add JWT token to the Authorization header
        }
    });
    if (!tickets.ok) {
        throw new Error(`Response status: ${tickets.status}`);
      }
    return tickets.json()
  } catch (error) {
    console.error("Error:", error);
  }
}

// Function to create an event
export async function createTickets(eventId, ticketData) {
  try {
      // Retrieve the token from localStorage
      const token = localStorage.getItem('token');

      const newTicket = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}/api/v1/events/${eventId}/ticket-types`, {
          method: "POST", 
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Add JWT token to the Authorization header
          },
          body: JSON.stringify({ ...ticketData }),
      });
      if (!newTicket.ok) {
          throw new Error(`Response status: ${newTicket.status}`);
        }
      return newTicket.json()
    } catch (error) {
      console.error("Error:", error);
    }
}

// Function to update an event
export async function updateTicket(eventId: string , ticketId: string , ticketData: any) {
  try {
      const token = localStorage.getItem('token');
      
      const updatedTicket = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}/api/v1/events/${eventId}/ticket-types/${ticketId}`, {
          method: "PATCH",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ ...ticketData }),
      });
      
      if (!updatedTicket.ok) {
          throw new Error(`Response status: ${updatedTicket.status}`);
      }
      return updatedTicket.json();
  } catch (error) {
      console.error("Error:", error);
      throw error;
  }
}

// Function to update an event
export async function deleteTicket(eventId: string , ticketId: string) {
  try {
      const token = localStorage.getItem('token');
      
      const deletedTicket = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}/api/v1/events/${eventId}/ticket-types/${ticketId}`, {
          method: "DELETE",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
          }
      });
      
      if (!deletedTicket.ok) {
          throw new Error(`Response status: ${deletedTicket.status}`);
      }
      return deletedTicket;
  } catch (error) {
      console.error("Error:", error);
      throw error;
  }
}
