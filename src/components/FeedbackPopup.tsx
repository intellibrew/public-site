import { useState } from 'react';
import { motion } from 'framer-motion';
import { submitFeedback } from '../api_requests/feedback';

interface FeedbackPopupProps {
  onClose: () => void;
}

const FeedbackPopup = ({ onClose }: FeedbackPopupProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: '',
    company: '',
    phone: '',
    website: '' // Honeypot field
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    feedback: '',
    phone: '',
    form: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: '',
      email: '',
      feedback: '',
      phone: '',
      form: ''
    };

    // Honeypot check for span protection
    if (formData.website) {
      newErrors.form = 'Invalid submission';
      valid = false;
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name is too long (max 100 chars)';
      valid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    } else if (formData.email.length > 255) {
      newErrors.email = 'Email is too long';
      valid = false;
    }

    // Feedback validation
    if (!formData.feedback.trim()) {
      newErrors.feedback = 'Feedback is required';
      valid = false;
    } else if (formData.feedback.length > 2000) {
      newErrors.feedback = 'Feedback is too long (max 2000 chars)';
      valid = false;
    }

    // Phone validation
    if (formData.phone && !/^[\d\s+\-().]{10,20}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent rapid submissions
    if (Date.now() - lastSubmitTime < 5000) {
      setSubmitStatus('error');
      setErrors(prev => ({ ...prev, form: 'Please wait before submitting again' }));
      return;
    }

    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrors(prev => ({ ...prev, form: '' }));

    try {
      await submitFeedback(
        formData.name.trim(),
        formData.email.trim(),
        formData.feedback.trim(),
        formData.company.trim(),
        formData.phone.trim()
      );
      setSubmitStatus('success');
      setLastSubmitTime(Date.now());
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      setSubmitStatus('error');
      setErrors(prev => ({ ...prev, form: 'Failed to submit. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="bg-white text-gray-800 rounded-lg max-w-md w-full p-6 relative shadow-xl border-4 border-[#203a43]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-6 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          disabled={isSubmitting}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-[#203a43] border-b-2 border-[#203a43] pb-2">
          Send Us Feedback
        </h2>

        {submitStatus === 'success' ? (
          <div className="text-center py-8">
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
            <p>We've received your feedback at {formData.email}.</p>
            <p className="mt-2">We'll respond if needed.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot Field */}
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
            />

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.name 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-[#203a43]'
                }`}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-[#203a43]'
                }`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Company Field */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#203a43]"
                disabled={isSubmitting}
              />
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.phone 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-[#203a43]'
                }`}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Feedback Field */}
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                Feedback *
              </label>
              <textarea
                id="feedback"
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.feedback 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-[#203a43]'
                }`}
                disabled={isSubmitting}
              />
              {errors.feedback && (
                <p className="mt-1 text-sm text-red-500">{errors.feedback}</p>
              )}
            </div>

            {/* Form-level error */}
            {errors.form && (
              <div className="text-red-500 text-sm text-center">
                {errors.form}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-[#203a43] text-white hover:bg-[#2c5364] font-semibold px-4 py-2 rounded transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default FeedbackPopup;