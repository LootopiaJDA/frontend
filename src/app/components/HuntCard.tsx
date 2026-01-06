'use client';
import { Hunt } from '@/type';
import Link from 'next/link';


interface Props {
    hunt: Hunt;
}

export default function HuntCard({ hunt }: Props) {
    return (
        <Link href={`/hunts/${hunt.slug}`} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden flex flex-col">
            <div className="relative h-56">
                <img src={hunt.coverImage} alt={hunt.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {hunt.featured && <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-1 rounded-full shadow">⭐ Recommandé</span>}
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{hunt.title}</h2>
                <p className="text-gray-600 text-sm line-clamp-3">{hunt.description}</p>
            </div>
        </Link>
    );
}
