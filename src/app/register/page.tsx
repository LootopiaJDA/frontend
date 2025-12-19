'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/type';


export default function Register() {
    const [form, setForm] = useState({ email: '', firstName: '', lastName: '', userType: 'player' });
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: User = { ...form, id: `user_${Date.now()}`, userType: form.userType as 'player' | 'partner' };
        const res = await fetch('http://localhost:3001/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });
        if (res.ok) router.push('/auth/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form onSubmit={handleRegister} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Inscription</h1>
                <input type="text" placeholder="Prénom" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full mb-4 px-4 py-2 border rounded-lg" required />
                <input type="text" placeholder="Nom" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full mb-4 px-4 py-2 border rounded-lg" required />
                <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full mb-4 px-4 py-2 border rounded-lg" required />
                <select value={form.userType} onChange={e => setForm({ ...form, userType: e.target.value })} className="w-full mb-6 px-4 py-2 border rounded-lg">
                    <option value="player">Joueur</option>
                    <option value="partner">Partenaire</option>
                </select>
                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">S'inscrire</button>
            </form>
        </div>
    );
}
