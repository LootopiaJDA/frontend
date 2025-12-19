'use client';
import { Hunt } from '@/type';
import { useState } from 'react';


interface Props {
    partnerId?: string;
    onHuntCreated: (hunt: Hunt) => void;
}

export default function HuntForm({ partnerId, onHuntCreated }: Props) {
    const [form, setForm] = useState({ title: '', description: '', coverImage: '', category: 'tourisme' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newHunt: Hunt = { ...form, id: `hunt_${Date.now()}`, partnerId: partnerId!, status: 'active', featured: false } as Hunt;
        const res = await fetch('http://localhost:3001/hunts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newHunt)
        });
        if (res.ok) onHuntCreated(newHunt);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
            <h2 className="text-xl font-bold">Créer une nouvelle chasse</h2>
            <input type="text" placeholder="Titre" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
            <input type="text" placeholder="Image URL" value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option value="tourisme">Tourisme</option>
                <option value="culture">Culture</option>
                <option value="nature">Nature</option>
                <option value="gastronomie">Gastronomie</option>
            </select>
            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">Créer</button>
        </form>
    );
}
