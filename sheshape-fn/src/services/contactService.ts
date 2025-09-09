import { api } from '@/lib/api';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const contactService = {
  // Submit contact form
  async submitContactForm(data: ContactFormData): Promise<void> {
    await api.post('/api/contact', data);
  },
  
  // Get FAQ items 
  async getFAQs(): Promise<FAQ[]> {
    const response = await api.get('/api/faqs');
    return response.data;
  }
};