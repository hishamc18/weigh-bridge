import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Shop } from '@/models/Shop';
import Header from '@/components/Header';
import BillForm from '@/components/bill/BillForm';

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  await connectDB();
  const shops = await Shop.find().sort({ createdAt: 1 }).lean();

  const shopData = shops.map((s) => ({
    _id: s._id.toString(),
    title: s.title,
    location: s.location,
    weight: s.weight,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 md:px-6 py-8 max-w-6xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-lg font-bold tracking-tight mt-1">Create Bill</h2>
        </div>

        {shopData.length === 0 ? (
          <div className="border border-black p-8 text-center">
            <p className="text-sm text-neutral-500">No shops found.</p>
            <p className="text-xs text-neutral-400 mt-1">
              Go to Dashboard → Shops to add a shop first.
            </p>
          </div>
        ) : (
          <BillForm shops={shopData} />
        )}
      </main>
    </div>
  );
}