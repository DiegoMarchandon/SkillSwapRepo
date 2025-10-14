// app/api/meeting/[meetingId]/route.js
// import { NextResponse } from 'next/server';
import api from '../../../../utils/axios';

export async function GET(request, { params }) {
  try {
    const { meetingId } = params;
    
   // Usamos el axios configurado que ya incluye el token
   const response = await api.get(`/meeting/${meetingId}`);

   return Response.json(response.data);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Meeting no encontrada';
    
    return Response.json({ error: message }, { status });
  }
}