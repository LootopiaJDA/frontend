'use client';
import { useEffect, useState } from 'react';
import { Hunt, User } from '@/type';
import HuntCard from '@/components/HuntCard';

export default function PlayerDashboard() {
    const [hunts, setHunts] = useState<Hunt[]>([]);
    const [user, setUser] = useState<User | null>(null);


    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
    }, []);


    useEffect(() => {
        const fetchHunts = async () => {
            const res = await fetch('http://localhost:3001/hunts');
            const data: Hunt[] = await res.json();
            setHunts(data);
        };
        fetchHunts();
    }, []);

    console.log(hunts);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Bienvenue, {user?.firstName}</h1>
            <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hunts.map(hunt => (
                    <HuntCard key={hunt.id} hunt={hunt} />
                ))}
            </div>
        </div>
    );
}
