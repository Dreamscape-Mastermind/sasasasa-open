import { getToken } from "@/utils/utils";

export async function inviteTeamMember(eventId: string, memberData: any) {
  try {
      const token = getToken();
      if (!token?.access) {
        throw new Error('No token found');
      }
      
      const invitedMember = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/events/${eventId}/invite`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token?.access}`,
          },
          body: JSON.stringify({ ...memberData }),
      });
      
      if (!invitedMember.ok) {
          throw new Error(`Response status: ${invitedMember.status}`);
      }
      return invitedMember.json();
  } catch (error) {
      console.error("Error:", error);
      throw error;
  }
}

export async function fetchEventTeamMembers(eventId: string) {
  const token = getToken();
  if (!token?.access) {
    throw new Error('No token found');
  }
  const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/events/${eventId}/teams`, {
    method: "GET",  
    headers: {
          "Authorization": `Bearer ${token?.access}`,
      }
  });
  if (!response.ok) {
      throw new Error(`Error fetching event team: ${response.status}`);
  }
  return response.json();
}

