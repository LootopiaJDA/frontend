'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/type';


export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3001/users');
            const users: User[] = await res.json();
            const user = users.find(u => u.email === email);
            if (!user) return setError('Utilisateur non trouvé');
            localStorage.setItem('user', JSON.stringify(user));
            router.push(user.userType === 'player' ? '/dashboard/player' : '/dashboard/partner');
        } catch (err) {
            setError('Erreur connexion');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Connexion</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mb-4 px-4 py-2 border rounded-lg" required />
                <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="w-full mb-6 px-4 py-2 border rounded-lg" required />
                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">Se connecter</button>
            </form>
        </div>
    );
}
