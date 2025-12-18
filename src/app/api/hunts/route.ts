import { NextResponse } from 'next/server';

const JSON_SERVER_URL = 'http://localhost:3001';

export async function GET() {
    try {
        const res = await fetch(`${JSON_SERVER_URL}/hunts`, {
            cache: 'no-store'
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch hunts' },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}
