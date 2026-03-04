'use client';

import { useState } from 'react';
import { z } from 'zod';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message should be at least 10 characters'),
  honeypot: z.string().optional()
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [values, setValues] = useState<ContactFormValues>({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMessage, setResponseMessage] = useState('');

  const handleChange = (field: keyof ContactFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setStatus('loading');

    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      setStatus('error');
      return;
    }

    try {
      const response = await api.post<{ success: boolean; message?: string }>('/api/contact', values);
      if (response?.success) {
        setStatus('success');
        setResponseMessage(response.message ?? 'Your message has been sent. We will be in touch soon.');
        setValues({ name: '', email: '', subject: '', message: '', honeypot: '' });
      } else {
        setStatus('error');
        setResponseMessage(response?.message ?? 'Unable to send message. Please try again.');
      }
    } catch (_error) {
      setStatus('error');
      setResponseMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Contact LensLight</h1>
        <p className="text-secondary">Share the details of your project, event, or campaign and we will respond within 48 hours.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6" aria-live="polite">
        <Input
          label="Name"
          value={values.name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange('name', event.target.value)}
          error={errors.name}
          placeholder="Your full name"
          required
        />
        <Input
          label="Email"
          type="email"
          value={values.email}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange('email', event.target.value)}
          error={errors.email}
          placeholder="you@example.com"
          required
        />
        <Input
          label="Subject"
          value={values.subject ?? ''}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange('subject', event.target.value)}
          error={errors.subject}
          placeholder="Portrait session, brand shoot, etc."
        />
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium">Message</label>
          <textarea
            id="message"
            value={values.message}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('message', event.target.value)}
            className="min-h-[140px] w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder="Tell us about your project, timing, and creative vision."
            required
          />
          {errors.message && <p className="text-sm text-error">{errors.message}</p>}
        </div>
        <input
          type="text"
          name="honeypot"
          value={values.honeypot ?? ''}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange('honeypot', event.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div className="flex items-center gap-4">
          <Button type="submit" variant="primary" size="lg" disabled={status === 'loading'}>
            {status === 'loading' ? 'Sending...' : 'Send message'}
          </Button>
          {status === 'loading' && <Spinner />}
        </div>

        {status !== 'idle' && responseMessage && (
          <p className={status === 'success' ? 'text-success' : 'text-error'}>{responseMessage}</p>
        )}
      </form>
    </div>
  );
}
