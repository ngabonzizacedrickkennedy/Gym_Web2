// src/components/programs/ProgramEnrollment.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {Label} from "@/components/ui/label"
import {
  CheckCircle,
  CreditCard,
  Shield,
  Calendar,
  Users,
  Star,
  Clock,
  Award
} from 'lucide-react';
import { GymProgram } from '@/types/models';
import { programService } from '@/services/programService';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-toastify';

interface ProgramEnrollmentProps {
  program: GymProgram;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ProgramEnrollment({ 
  program, 
  trigger,
  onSuccess 
}: ProgramEnrollmentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDurationLabel = (days: number) => {
    if (days <= 7) return `${days} day${days > 1 ? 's' : ''}`;
    if (days <= 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`;
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.info('Please log in to enroll in this program');
      router.push('/login');
      setIsOpen(false);
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    try {
      setIsEnrolling(true);
      setStep('payment');

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      await programService.purchaseProgram(program.id);
      
      setStep('success');
      toast.success('Successfully enrolled in program!');
      
      // Auto redirect after success
      setTimeout(() => {
        setIsOpen(false);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/dashboard/my-programs');
        }
      }, 2000);

    } catch (err) {
      console.error('Error enrolling in program:', err);
      toast.error('Failed to enroll in program. Please try again.');
      setStep('details');
    } finally {
      setIsEnrolling(false);
    }
  };

  const resetDialog = () => {
    setStep('details');
    setAgreedToTerms(false);
    setIsEnrolling(false);
  };

  const renderDetailsStep = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Program Summary */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{program.title}</CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getDifficultyColor(program.difficultyLevel)}>
                  {program.difficultyLevel}
                </Badge>
                <div className="flex items-center text-yellow-500">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs ml-1">4.8</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(program.price)}
              </div>
              <div className="text-xs text-neutral-600">One-time payment</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Calendar className="h-4 w-4 text-primary mx-auto mb-1" />
              <div className="text-sm font-medium">{getDurationLabel(program.durationDays)}</div>
              <div className="text-xs text-neutral-600">Duration</div>
            </div>
            <div>
              <Clock className="h-4 w-4 text-secondary mx-auto mb-1" />
              <div className="text-sm font-medium">{program.totalSessions || 0}</div>
              <div className="text-xs text-neutral-600">Sessions</div>
            </div>
            <div>
              <Users className="h-4 w-4 text-accent1 mx-auto mb-1" />
              <div className="text-sm font-medium">{program.enrolledCount || 0}</div>
              <div className="text-xs text-neutral-600">Students</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Included */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">What&apos;s Included</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            'Complete video workout library',
            'Detailed exercise instructions',
            'Progress tracking tools',
            'Mobile app access',
            'Community support',
            'Lifetime updates',
            '30-day money-back guarantee'
          ].map((feature, index) => (
            <div key={index} className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Terms Agreement */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          checked={agreedToTerms}
          onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
        />
        <Label htmlFor="terms" className="text-sm text-neutral-600 leading-relaxed">
          I agree to the{' '}
          <a href="/terms" className="text-primary hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
          . I understand this is a one-time payment for lifetime access to this program.
        </Label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setIsOpen(false)}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleEnroll}
          disabled={!agreedToTerms || isEnrolling}
          className="flex-1"
        >
          {isEnrolling ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Enroll Now
            </>
          )}
        </Button>
      </div>

      {/* Security Notice */}
      <div className="flex items-center justify-center text-xs text-neutral-500">
        <Shield className="h-3 w-3 mr-1" />
        Secure payment powered by Stripe
      </div>
    </motion.div>
  );

  const renderPaymentStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center py-8"
    >
      <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <LoadingSpinner size="lg" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
      <p className="text-neutral-600 mb-4">
        Please wait while we process your enrollment...
      </p>
      <div className="text-sm text-neutral-500">
        Do not close this window
      </div>
    </motion.div>
  );

  const renderSuccessStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center py-8"
    >
      <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Enrollment Successful!</h3>
      <p className="text-neutral-600 mb-4">
        Welcome to <strong>{program.title}</strong>! You now have lifetime access to all program content.
      </p>
      <div className="bg-neutral-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center text-sm text-neutral-600">
          <Award className="h-4 w-4 mr-2 text-primary" />
          Redirecting to your programs dashboard...
        </div>
      </div>
    </motion.div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetDialog();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            Enroll Now
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'details' && 'Enroll in Program'}
            {step === 'payment' && 'Processing Payment'}
            {step === 'success' && 'Enrollment Complete'}
          </DialogTitle>
          {step === 'details' && (
            <DialogDescription>
              Review the program details and complete your enrollment.
            </DialogDescription>
          )}
        </DialogHeader>

        {step === 'details' && renderDetailsStep()}
        {step === 'payment' && renderPaymentStep()}
        {step === 'success' && renderSuccessStep()}
      </DialogContent>
    </Dialog>
  );
}