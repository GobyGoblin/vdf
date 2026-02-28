import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    CheckCircle2,
    Shield,
    Crown,
    CreditCard,
    Lock,
    Building2,
    Users,
    Zap,
    Briefcase
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { quotesAPI, QuoteRequest, QuoteOption } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';

const EmployerQuotePayment = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [request, setRequest] = useState<QuoteRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [cardName, setCardName] = useState('');
    const { toast } = useToast();

    // Use window dimensions for confetti
    const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        window.addEventListener('resize', () => {
            setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
        });
        return () => window.removeEventListener('resize', () => { });
    }, []);

    useEffect(() => {
        if (id) loadData(id);
    }, [id]);

    const loadData = async (requestId: string) => {
        try {
            setLoading(true);
            const data = await quotesAPI.getById(requestId);
            setRequest(data.request || data);

            // Check if it already has a selected option, if not, redirect back
            const selectedOpt = (data.request || data)?.options?.find((o: QuoteOption) => o.selected);
            if (!selectedOpt) {
                toast({
                    title: 'No Option Selected',
                    description: 'Please select an offer option before proceeding to payment.',
                    variant: 'destructive',
                });
                navigate(`/employer/quotes/${requestId}`);
            }
        } catch (error) {
            console.error('Failed to load quote details:', error);
            toast({
                title: 'Error',
                description: 'Failed to load checkout details.',
                variant: 'destructive',
            });
            navigate('/employer/quotes');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessingPayment(true);

        // Simulate real payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            if (id) {
                await quotesAPI.updateStatus(id, 'paid');
            }
            setPaymentSuccess(true);
            toast({
                title: 'Payment Successful! 🎉',
                description: 'Your payment was processed securely. Invoice has been sent to your email.',
            });

            // Automatic redirect after showing success animation
            setTimeout(() => {
                navigate(`/employer/quotes/${id}/receipt`);
            }, 4000);
        } catch (error) {
            console.error('Failed to update status to paid:', error);
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

    if (loading) {
        return (
            <DashboardLayout role="employer">
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full"
                    />
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Initializing Secure Checkout...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!request) return null;

    const selectedOption = request.options?.find(o => o.selected);
    if (!selectedOption) return null;

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
                            Thank you. Your order for <strong>{request.candidate?.fullName}</strong> has been confirmed.
                        </p>
                        <div className="pt-6 border-t border-border mt-6">
                            <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">Redirecting to your receipt...</p>
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
                <Link to={`/employer/quotes/${id}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-gold transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Quote Options
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
                                            <>Pay {selectedOption.costEstimate}</>
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
                                    <Crown className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground">{selectedOption.name} Package</h4>
                                    <p className="text-muted-foreground text-sm mt-1">Placement for {request.candidate?.fullName}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Charge Breakdown</h4>
                                <div className="space-y-3">
                                    {selectedOption.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center group">
                                            <div className="text-sm font-medium text-foreground">{item.label}</div>
                                            <div className="text-sm font-mono text-muted-foreground">€{item.amount.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border/50">
                                <div className="flex justify-between items-end">
                                    <div className="text-sm font-black uppercase tracking-widest text-muted-foreground">Total to Pay</div>
                                    <div className="text-3xl font-display font-bold text-navy">{selectedOption.costEstimate}</div>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="flex gap-3 text-sm text-muted-foreground font-medium">
                                    <Shield className="w-5 h-5 text-success shrink-0" />
                                    <p>Includes complete visa handling, compliance, and legal setup.</p>
                                </div>
                                <div className="flex gap-3 text-sm text-muted-foreground font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                                    <p>6-Month satisfaction guarantee. Free replacement if it's not a fit.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default EmployerQuotePayment;
