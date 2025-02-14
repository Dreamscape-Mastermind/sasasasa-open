export async function inviteTeamMember(eventId: string, memberData: any) {
  try {
      const token = localStorage.getItem('token');
      
      const invitedMember = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}/api/v1/events/${eventId}/invite`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
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
  const token = localStorage.getItem('token');
  const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}/api/v1/events/${eventId}/teams`, {
    method: "GET",  
    headers: {
          "Authorization": `Bearer ${token}`,
      }
  });
  if (!response.ok) {
      throw new Error(`Error fetching event team: ${response.status}`);
  }
  return response.json();
}

