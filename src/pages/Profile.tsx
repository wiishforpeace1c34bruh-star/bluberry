import { useParams, useNavigate } from 'react-router-dom';
import { UserProfileCard } from '@/components/profile/UserProfileCard';
import { ArrowLeft } from 'lucide-react';

export default function Profile() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    if (!userId) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-muted-foreground">User ID not provided</h1>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 btn-primary px-6 py-2 rounded-xl"
                >
                    Go Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto animate-fade-in">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
            </button>

            <div className="max-w-xl mx-auto">
                <UserProfileCard userId={userId} />
            </div>
        </div>
    );
}
