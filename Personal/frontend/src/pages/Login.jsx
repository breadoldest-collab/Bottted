import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignInPage } from '../components/ui/sign-in';
import API from '../api/axios';

const sampleTestimonials = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "CXBot transformed our customer support response times by 80% overnight."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "The Gemini AI integration handles complex customer queries effortlessly."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80",
    name: "Elena Rostova",
    handle: "@elenacx",
    text: "Intuitive dashboard, live analytics, and zero-effort customer setup."
  }
];

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const res = await API.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('businessId', res.data.businessId);
      localStorage.setItem('businessName', res.data.businessName || '');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignInPage
      title={
        <span className="font-light tracking-tighter">
          Sign in to <span className="font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">CXBot</span>
        </span>
      }
      description="Access your AI support dashboard and manage real-time customer chats"
      heroImageSrc="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80"
      testimonials={sampleTestimonials}
      onSignIn={handleSignIn}
      onGoogleSignIn={() => alert('Google Sign-In integration ready')}
      onCreateAccount={() => navigate('/register')}
      onResetPassword={() => alert('Password reset link sent to your email')}
      errorMessage={error}
      isLoading={loading}
    />
  );
}
