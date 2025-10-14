// app/api/meeting/[meetingId]/status/route.js
// import { NextResponse } from 'next/server';
import api from '../../../../../utils/axios';

export async function GET(request, { params }) {
  try {
    const { meetingId } = params;
    
    const response = await api.get(`/meeting/${meetingId}/status`);
    
    return Response.json(response.data);
  } catch (error) {
    console.error('Error checking meeting status:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Error verificando estado';
    
    return Response.json({ error: message }, { status });
  }
}