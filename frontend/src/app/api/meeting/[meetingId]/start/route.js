// app/api/meeting/[meetingId]/start/route.js
// import { NextResponse } from 'next/server';
import api from '../../../../../utils/axios';

export async function POST(request, { params }) {
  try {
    const { meetingId } = params;
    
    const response = await api.post(`/meeting/${meetingId}/start`);
    
    return Response.json(response.data);
  } catch (error) {
    console.error('Error starting meeting:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'No se pudo iniciar la reunión';
    
    return Response.json({ error: message }, { status });
  }
}