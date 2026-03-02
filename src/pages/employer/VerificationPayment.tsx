import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    CheckCircle2,
    Shield,
    CreditCard,
    Lock,
    Zap,
    Crown
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { useToast } from '@/hooks/use-toast';
import { authAPI, profilesAPI } from '@/lib/api';
import Confetti from 'react-confetti';
import { cn } from '@/lib/utils';

const EmployerVerificationPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Expect state from navigate('/employer/verification-payment', { state: { plan: 'express', companyData: {...} } })
    const planId = location.state?.plan || 'express';
    const companyData = location.state?.companyData || null;

    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [cardName, setCardName] = useState('');

    const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        window.addEventListener('resize', () => {
            setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
        });

        const loadProfile = async () => {
            try {
                const { user } = await authAPI.getMe();
                setUserProfile(user);
            } catch (error) {
                console.error("Could not load user profile");
            }
        };
        loadProfile();

        return () => window.removeEventListener('resize', () => { });
    }, []);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessingPayment(true);

        // Simulate real payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            if (userProfile?.id && companyData) {
                await profilesAPI.updateEmployerProfile(userProfile.id, {
                    ...companyData,
                    verificationStatus: 'pending',
                    verificationPlan: planId
                });
            } else if (userProfile?.id) {
                await profilesAPI.updateEmployerProfile(userProfile.id, {
                    verificationStatus: 'pending',
                    verificationPlan: planId
                });
            }

            setPaymentSuccess(true);
            toast({
                title: 'Payment Successful! 🎉',
                description: 'Your verification is now prioritized. Our staff will review your profile shortly.',
            });

            // Automatic redirect after showing success animation
            setTimeout(() => {
                navigate(`/employer/dashboard`);
            }, 4000);
        } catch (error) {
            console.error('Failed to submit verification:', error);
            toast({
                title: 'Payment Failed',
                description: 'There was an issue processing your payment. Please try again.',
                variant: 'destructive',
            });
            setProcessingPayment(false);
        }
    };

    // Format card number with spaces
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
        setCardNumber(formatted);
    };

    // Format expiry date as MM/YY
    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        setExpiry(value);
    };

    if (paymentSuccess) {
        return (
            <DashboardLayout role="employer">
                <Confetti
                    width={windowDimension.width}
                    height={windowDimension.height}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.15}
                />
                <div className="min-h-[70vh] flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="max-w-md w-full text-center space-y-6 bg-white p-12 rounded-[3rem] shadow-2xl border-2 border-success/20"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle2 className="w-12 h-12" />
                        </motion.div>
                        <h2 className="text-4xl font-display font-bold text-foreground">Payment Successful!</h2>
                        <p className="text-muted-foreground text-lg">
                            Thank you. Your Express Verification has been unlocked.
                        </p>
                        <div className="pt-6 border-t border-border mt-6">
                            <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">Redirecting to your dashboard...</p>
                            <motion.div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 3.8, ease: "linear" }}
                                    className="h-full bg-gold rounded-full"
                                />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="employer">
            <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
                {/* Back Button */}
                <Link to="/employer/onboarding" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-gold transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Verification Plan
                </Link>

                <div className="grid lg:grid-cols-5 gap-10 items-start">

                    {/* Left Column - Checkout Form */}
                    <div className="lg:col-span-3 space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight mb-4">
                                Secure <span className="text-gold">Checkout</span>
                            </h1>
                            <p className="text-muted-foreground text-lg flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Payment is processed securely via Stripe.
                            </p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-border/50 relative overflow-hidden"
                        >
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-navy/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <h3 className="text-xl font-bold font-display flex items-center gap-3 mb-8 relative z-10">
                                <div className="p-2 bg-navy rounded-xl text-white">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                Payment Details
                            </h3>

                            <form onSubmit={handlePayment} className="space-y-6 relative z-10">
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2 transition-colors focus-within:text-navy">Cardholder Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full bg-secondary/50 border-2 border-border rounded-2xl px-5 py-4 outline-none focus:border-gold focus:bg-white transition-all text-base placeholder:text-muted-foreground/40 font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Card Number</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type="text"
                                                value={cardNumber}
                                                onChange={handleCardNumberChange}
                                                placeholder="0000 0000 0000 0000"
                                                className="w-full bg-secondary/50 border-2 border-border rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-gold focus:bg-white transition-all font-mono text-base placeholder:text-muted-foreground/40"
                                            />
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Expiry Date</label>
                                            <input
                                                required
                                                type="text"
                                                value={expiry}
                                                onChange={handleExpiryChange}
                                                placeholder="MM/YY"
                                                className="w-full bg-secondary/50 border-2 border-border rounded-2xl px-5 py-4 outline-none focus:border-gold focus:bg-white transition-all font-mono text-base placeholder:text-muted-foreground/40"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">CVC</label>
                                            <input
                                                required
                                                type="text"
                                                maxLength={4}
                                                value={cvc}
                                                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                                                placeholder="123"
                                                className="w-full bg-secondary/50 border-2 border-border rounded-2xl px-5 py-4 outline-none focus:border-gold focus:bg-white transition-all font-mono text-base placeholder:text-muted-foreground/40"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <button
                                        type="submit"
                                        disabled={processingPayment || !cardName || cardNumber.length < 18 || expiry.length < 5 || cvc.length < 3}
                                        className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-navy text-white font-black uppercase tracking-widest text-sm hover:shadow-2xl hover:shadow-navy/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100"
                                    >
                                        {processingPayment ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                />
                                                Processing Securely...
                                            </>
                                        ) : (
                                            <>Pay €99.00</>
                                        )}
                                    </button>
                                    <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5 font-medium">
                                        <Shield className="w-3.5 h-3.5" /> 256-bit SSL encryption. We do not store your card details.
                                    </p>
                                </div>
                            </form>
                        </motion.div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-secondary/30 rounded-[2.5rem] p-8 border border-border sticky top-8"
                        >
                            <h3 className="text-xl font-bold font-display mb-6">Order Summary</h3>

                            <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-border shadow-sm mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground">Express Verification</h4>
                                    <p className="text-muted-foreground text-sm mt-1">Priority review by our Staff</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Charge Breakdown</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center group">
                                        <div className="text-sm font-medium text-foreground">Priority Processing Fee</div>
                                        <div className="text-sm font-mono text-muted-foreground">€83.19</div>
                                    </div>
                                    <div className="flex justify-between items-center group">
                                        <div className="text-sm font-medium text-foreground">Tax (19%)</div>
                                        <div className="text-sm font-mono text-muted-foreground">€15.81</div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border/50">
                                <div className="flex justify-between items-end">
                                    <div className="text-sm font-black uppercase tracking-widest text-muted-foreground">Total to Pay</div>
                                    <div className="text-3xl font-display font-bold text-navy">€99.00</div>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="flex gap-3 text-sm text-muted-foreground font-medium">
                                    <Shield className="w-5 h-5 text-success shrink-0" />
                                    <p>Accelerated KYC & Legal Entity Review</p>
                                </div>
                                <div className="flex gap-3 text-sm text-muted-foreground font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                                    <p>100% Refundable if application is rejected.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default EmployerVerificationPayment;
