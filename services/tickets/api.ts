import { getToken } from "@/utils/utils";
import { TicketResponse, SingleTicketResponse } from "@/utils/dataStructures";

// Function to fetch events
export async function fetchTickets(eventId: string): Promise<TicketResponse> {
  try {
    const token = getToken();
    if (!token?.access) {
      throw new Error('No token found');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/events/${eventId}/ticket-types`, {
        method: "GET", 
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token?.access}`,
        }
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw error; // Re-throw to allow caller to handle the error
  }
}

// Function to create an event
export async function createTickets(eventId: string, ticketData: any): Promise<SingleTicketResponse> {
  try {
    const token = getToken();
    if (!token?.access) {
      throw new Error('No token found');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/events/${eventId}/ticket-types`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token?.access}`,
        },
        body: JSON.stringify(ticketData),
    });
    
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw error; // Re-throw to allow caller to handle the error
  }
}

// Function to update an event
export async function updateTicket(eventId: string , ticketId: string , ticketData: any) {
  try {
      const token = getToken();
      if (!token?.access) {
        throw new Error('No token found');
      }
      
      const updatedTicket = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/events/${eventId}/ticket-types/${ticketId}`, {
          method: "PATCH",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token?.access}`,
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
      const token = getToken();
      if (!token?.access) {
        throw new Error('No token found');
      }
      
      const deletedTicket = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/events/${eventId}/ticket-types/${ticketId}`, {
          method: "DELETE",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token?.access}`,
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
