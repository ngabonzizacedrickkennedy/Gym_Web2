import React, { useState } from 'react';
import { 
  CreditCard, 
  Truck, 
  Shield, 
  Check, 
  Edit,
  AlertCircle,
  Lock,
  Package,
  Star,
  ChevronRight,
  ChevronDown,
  Eye
} from 'lucide-react';

// Type definitions
type StepId = 'shipping' | 'payment' | 'review' | 'success';
type PaymentMethod = 'CREDIT_CARD' | 'PAYPAL' | 'DIGITAL_WALLET';
type SectionKey = 'shipping' | 'payment' | 'review';

interface ShippingData {
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes: string;
  useSameForBilling: boolean;
}

interface PaymentData {
  paymentMethod: PaymentMethod;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardHolderName: string;
  saveCard: boolean;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  inStock: boolean;
}

interface Step {
  id: StepId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Mock data based on your project structure
const mockCartItems: CartItem[] = [
  {
    id: 1,
    name: "Premium Whey Protein Powder",
    price: 49.99,
    quantity: 2,
    image: "/api/placeholder/80/80",
    category: "Supplements",
    inStock: true
  },
  {
    id: 2,
    name: "Organic Pre-Workout Mix",
    price: 34.99,
    quantity: 1,
    image: "/api/placeholder/80/80",
    category: "Supplements", 
    inStock: true
  },
  {
    id: 3,
    name: "Fitness Resistance Bands Set",
    price: 24.99,
    quantity: 1,
    image: "/api/placeholder/80/80",
    category: "Equipment",
    inStock: true
  }
];

const mockUser = {
  profile: {
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@example.com",
    phoneNumber: "+1-555-0123"
  }
};

export default function RealisticCheckoutPage() {
  const [currentStep, setCurrentStep] = useState<StepId>('shipping');
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);
  const [shippingData, setShippingData] = useState<ShippingData>({
    firstName: mockUser.profile.firstName,
    lastName: mockUser.profile.lastName,
    phone: mockUser.profile.phoneNumber,
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'RW',
    notes: '',
    useSameForBilling: true
  });
  const [paymentData, setPaymentData] = useState<PaymentData>({
    paymentMethod: 'CREDIT_CARD',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolderName: '',
    saveCard: false
  });
  const [showCvvHelper, setShowCvvHelper] = useState<boolean>(false);
  const [orderProcessing, setOrderProcessing] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    shipping: true,
    payment: false,
    review: false
  });

  const subtotal = mockCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const steps: Step[] = [
    { id: 'shipping', name: 'Shipping', icon: Truck },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'review', name: 'Review', icon: Eye },
    { id: 'success', name: 'Complete', icon: Check }
  ];

  const toggleSection = (section: SectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleStepComplete = (step: StepId) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleStepComplete('shipping');
    setCurrentStep('payment');
    setExpandedSections({ shipping: false, payment: true, review: false });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleStepComplete('payment');
    setCurrentStep('review');
    setExpandedSections({ shipping: false, payment: false, review: true });
  };

  const handlePlaceOrder = async () => {
    setOrderProcessing(true);
    // Simulate order processing
    setTimeout(() => {
      handleStepComplete('review');
      setCurrentStep('success');
      setOrderProcessing(false);
    }, 3000);
  };

  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const getStepStatus = (stepId: StepId): 'completed' | 'current' | 'upcoming' => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-6">Your order #SHP-2024-001234 has been confirmed and will be processed shortly.</p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                📧 A confirmation email has been sent to {mockUser.profile.email}
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Track Order
              </button>
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SheShape</span>
            </div>
            <div className="text-sm text-gray-600">
              <Shield className="inline h-4 w-4 mr-1" />
              Secure Checkout
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center ${index < steps.length - 1 ? 'pr-8' : ''}`}>
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                      ${status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                        status === 'current' ? 'border-blue-500 bg-blue-500 text-white' :
                        'border-gray-300 bg-white text-gray-500'}
                    `}>
                      {status === 'completed' ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`ml-3 text-sm font-medium ${
                      status === 'current' ? 'text-blue-600' :
                      status === 'completed' ? 'text-green-600' :
                      'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-5 w-5 text-gray-400 ml-8" />
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => toggleSection('shipping')}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full
                    ${completedSteps.includes('shipping') ? 'bg-green-100 text-green-600' :
                      currentStep === 'shipping' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-500'}
                  `}>
                    {completedSteps.includes('shipping') ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Truck className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      1. Shipping Address
                    </h3>
                    {completedSteps.includes('shipping') && (
                      <p className="text-sm text-gray-600">
                        {shippingData.firstName} {shippingData.lastName}, {shippingData.city}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {completedSteps.includes('shipping') && currentStep !== 'shipping' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentStep('shipping');
                        toggleSection('shipping');
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                  )}
                  <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${
                    expandedSections.shipping ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>

              {expandedSections.shipping && (
                <div className="px-6 pb-6 border-t">
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingData.firstName}
                          onChange={(e) => setShippingData({...shippingData, firstName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingData.lastName}
                          onChange={(e) => setShippingData({...shippingData, lastName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="123 Main Street"
                        value={shippingData.street}
                        onChange={(e) => setShippingData({...shippingData, street: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingData.city}
                          onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State/Province *
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingData.state}
                          onChange={(e) => setShippingData({...shippingData, state: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP/Postal Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingData.zipCode}
                          onChange={(e) => setShippingData({...shippingData, zipCode: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={shippingData.phone}
                        onChange={(e) => setShippingData({...shippingData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={shippingData.notes}
                        onChange={(e) => setShippingData({...shippingData, notes: e.target.value})}
                        placeholder="Special delivery instructions..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium transition-colors"
                    >
                      Continue to Payment
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => toggleSection('payment')}
                disabled={!completedSteps.includes('shipping')}
                className={`w-full p-6 flex items-center justify-between text-left ${
                  !completedSteps.includes('shipping') ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full
                    ${completedSteps.includes('payment') ? 'bg-green-100 text-green-600' :
                      currentStep === 'payment' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-500'}
                  `}>
                    {completedSteps.includes('payment') ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <CreditCard className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      2. Payment Method
                    </h3>
                    {completedSteps.includes('payment') && (
                      <p className="text-sm text-gray-600">
                        •••• •••• •••• {paymentData.cardNumber.slice(-4)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {completedSteps.includes('payment') && currentStep !== 'payment' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentStep('payment');
                        toggleSection('payment');
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                  )}
                  <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${
                    expandedSections.payment ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>

              {expandedSections.payment && completedSteps.includes('shipping') && (
                <div className="px-6 pb-6 border-t">
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <input
                          type="radio"
                          id="credit-card"
                          name="paymentMethod"
                          value="CREDIT_CARD"
                          checked={paymentData.paymentMethod === 'CREDIT_CARD'}
                          onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value as PaymentMethod})}
                          className="h-4 w-4 text-blue-600"
                        />
                        <label htmlFor="credit-card" className="flex-1 flex items-center space-x-2">
                          <CreditCard className="h-5 w-5 text-gray-600" />
                          <span className="font-medium">Credit or Debit Card</span>
                        </label>
                        <div className="flex space-x-2">
                          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
                          <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">M</div>
                          <div className="w-8 h-5 bg-blue-800 rounded text-white text-xs flex items-center justify-center font-bold">A</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <input
                          type="radio"
                          id="paypal"
                          name="paymentMethod"
                          value="PAYPAL"
                          checked={paymentData.paymentMethod === 'PAYPAL'}
                          onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value as PaymentMethod})}
                          className="h-4 w-4 text-blue-600"
                        />
                        <label htmlFor="paypal" className="flex-1 flex items-center space-x-2">
                          <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">P</span>
                          </div>
                          <span className="font-medium">PayPal</span>
                        </label>
                      </div>
                    </div>

                    {/* Credit Card Form */}
                    {paymentData.paymentMethod === 'CREDIT_CARD' && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cardholder Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={paymentData.cardHolderName}
                            onChange={(e) => setPaymentData({...paymentData, cardHolderName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={19}
                            placeholder="1234 5678 9012 3456"
                            value={paymentData.cardNumber}
                            onChange={(e) => setPaymentData({...paymentData, cardNumber: formatCardNumber(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Month *
                            </label>
                            <select
                              required
                              value={paymentData.expiryMonth}
                              onChange={(e) => setPaymentData({...paymentData, expiryMonth: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">MM</option>
                              {Array.from({length: 12}, (_, i) => (
                                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                  {String(i + 1).padStart(2, '0')}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Year *
                            </label>
                            <select
                              required
                              value={paymentData.expiryYear}
                              onChange={(e) => setPaymentData({...paymentData, expiryYear: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">YYYY</option>
                              {Array.from({length: 10}, (_, i) => (
                                <option key={2024 + i} value={2024 + i}>
                                  {2024 + i}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVV *
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                maxLength={4}
                                placeholder="123"
                                value={paymentData.cvv}
                                onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value.replace(/\D/g, '')})}
                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                type="button"
                                onMouseEnter={() => setShowCvvHelper(true)}
                                onMouseLeave={() => setShowCvvHelper(false)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                              >
                                <AlertCircle className="h-4 w-4" />
                              </button>
                              {showCvvHelper && (
                                <div className="absolute right-0 top-full mt-1 p-2 bg-gray-900 text-white text-xs rounded z-10 w-48">
                                  3-digit code on the back of your card (4 digits for Amex)
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="saveCard"
                            checked={paymentData.saveCard}
                            onChange={(e) => setPaymentData({...paymentData, saveCard: e.target.checked})}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                          <label htmlFor="saveCard" className="text-sm text-gray-700">
                            Save this card for future purchases
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                      <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Your payment is secure</p>
                        <p>We use 256-bit SSL encryption to protect your information.</p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium transition-colors"
                    >
                      Continue to Review
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Order Review */}
            <div className="bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => toggleSection('review')}
                disabled={!completedSteps.includes('payment')}
                className={`w-full p-6 flex items-center justify-between text-left ${
                  !completedSteps.includes('payment') ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full
                    ${currentStep === 'review' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}
                  `}>
                    <Eye className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      3. Review & Place Order
                    </h3>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${
                  expandedSections.review ? 'rotate-180' : ''
                }`} />
              </button>

              {expandedSections.review && completedSteps.includes('payment') && (
                <div className="px-6 pb-6 border-t">
                  <div className="space-y-6">
                    {/* Shipping Summary */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Shipping Address</h4>
                        <p className="text-sm text-gray-600">
                          {shippingData.firstName} {shippingData.lastName}<br />
                          {shippingData.street}<br />
                          {shippingData.city}, {shippingData.state} {shippingData.zipCode}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setCurrentStep('shipping');
                          setExpandedSections({ shipping: true, payment: false, review: false });
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Payment Summary */}
                    <div className="flex justify-between items-start border-t pt-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Payment Method</h4>
                        <p className="text-sm text-gray-600">
                          {paymentData.paymentMethod === 'CREDIT_CARD' ? 
                            `•••• •••• •••• ${paymentData.cardNumber.slice(-4)}` :
                            'PayPal'
                          }
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setCurrentStep('payment');
                          setExpandedSections({ shipping: false, payment: true, review: false });
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Order Items */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {mockCartItems.map((item) => (
                          <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                              <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Terms and Place Order */}
                    <div className="border-t pt-4">
                      <div className="flex items-start space-x-2 mb-4">
                        <input
                          type="checkbox"
                          id="terms"
                          required
                          className="h-4 w-4 text-blue-600 rounded mt-0.5"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-700">
                          I agree to the{' '}
                          <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                            Privacy Policy
                          </a>
                        </label>
                      </div>

                      <button
                        onClick={handlePlaceOrder}
                        disabled={orderProcessing}
                        className="w-full bg-orange-500 text-white py-4 px-4 rounded-md hover:bg-orange-600 font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {orderProcessing ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Processing Order...</span>
                          </div>
                        ) : (
                          `Place Order - ${total.toFixed(2)}`
                        )}
                      </button>

                      <p className="text-xs text-gray-600 text-center mt-2">
                        By placing this order, you agree to our terms and conditions
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border sticky top-8">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                {/* Items */}
                <div className="space-y-3 mb-4">
                  {mockCartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Promotions */}
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-800 font-medium">
                      FREE shipping on this order
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>100% Secure Checkout</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4 text-blue-500" />
                    <span>Free 2-day shipping</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Package className="h-4 w-4 text-orange-500" />
                    <span>30-day return policy</span>
                  </div>
                </div>

                {/* Customer Reviews */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">4.8/5</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    "Excellent products and fast shipping. Highly recommend!" - Sarah M.
                  </p>
                </div>

                {/* Help */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Need help?</p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Contact Customer Service
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}