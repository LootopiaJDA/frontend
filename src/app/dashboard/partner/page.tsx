'use client';
import { useEffect, useState } from 'react';

import { Hunt, User } from '@/type';
import HuntForm from '@/components/HuntForm';

export default function PartnerDashboard() {
    const [hunts, setHunts] = useState<Hunt[]>([]);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));

        const fetchHunts = async () => {
            const res = await fetch('http://localhost:3001/hunts');
            const data: Hunt[] = await res.json();
            if (user?.id) setHunts(data.filter(h => h.partnerId === user.id));
        };
        fetchHunts();
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">{user?.organizationName}</h1>
            <div className="max-w-7xl mx-auto mb-8">
                <HuntForm partnerId={user?.id} onHuntCreated={(hunt) => setHunts([...hunts, hunt])} />
            </div>
            <div className="max-w-7xl mx-auto grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
                {hunts.map(hunt => (
                    <div key={hunt.id} className="bg-white rounded-xl shadow p-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">{hunt.title}</h2>
                            <p className="text-gray-500">{hunt.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
