import Link from 'next/link';
import { InstallPrompt } from './InstallPrompt';

export default function Page() {
  return (
    <div className="flex h-screen bg-white">
      <div className="w-screen h-screen flex flex-col justify-center items-center">
        <div className="flex space-x-3">
          <Link
            href="/protected"
            className="text-stone-400 underline hover:text-stone-200 transition-all"
          >
            Login Page
          </Link>
          <InstallPrompt/>
        </div>
      </div>
    </div>
  );
}
