'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/lib/hooks/use-toast';
import { Product } from '@/types/product.types';

/**
 * Contact Page
 * 
 * Route: /contact
 * 
 * Features:
 * - Hero section with "GET IN TOUCH" title
 * - Contact information and map
 * - Multi-step product enquiry form
 * - Social media section
 * - Newsletter subscription footer
 * 
 * Design inspired by Chinatown Bakery contact page
 */

interface ContactInfo {
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  email: string;
  phoneNumbers: Array<{
    id: string;
    label: string;
    number: string;
  }>;
  socialMedia?: {
    instagram?: string;
  };
}

export default function ContactPage() {
  const { toast } = useToast();
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    productId: '',
    productName: '',
    quantity: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [isLoadingContact, setIsLoadingContact] = useState(true);

  // Fetch products and contact info on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoadingProducts(true);
        setIsLoadingContact(true);
        
        const [productsRes, contactRes] = await Promise.all([
          fetch('/api/products?active=true'),
          fetch('/api/content?key=contact_info')
        ]);
        
        if (productsRes.ok) {
          const data = await productsRes.json();
          if (data.success && data.data) {
            setProducts(data.data);
          }
        }
        
        if (contactRes.ok) {
          const data = await contactRes.json();
          if (data.success && data.data?.data) {
            setContactInfo(data.data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoadingProducts(false);
        setIsLoadingContact(false);
      }
    }

    fetchData();
  }, []);

  // Generate Google Maps embed URL from address

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNextStep = () => {
    if (formStep === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all contact details',
          variant: 'destructive',
        });
        return;
      }
    }
    setFormStep(formStep + 1);
  };

  const handlePrevStep = () => {
    setFormStep(formStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message) {
      toast({
        title: 'Missing Information',
        description: 'Please provide your message or inquiry',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Build items array
      const items = [];
      if (formData.productId && formData.quantity) {
        items.push({
          productId: formData.productId,
          quantity: parseInt(formData.quantity) || 1,
        });
      } else if (formData.productName === 'General Inquiry') {
        // For general inquiry, use a placeholder product or first available product
        const firstProduct = products[0];
        if (firstProduct) {
          items.push({
            productId: firstProduct._id,
            quantity: 1,
          });
        }
      }

      // If no items, we need at least one item for the API
      if (items.length === 0 && products.length > 0) {
        items.push({
          productId: products[0]._id,
          quantity: 1,
        });
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          items: items,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Inquiry Submitted',
          description: 'Thank you! We will get back to you soon.',
        });
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          productId: '',
          productName: '',
          quantity: '',
          message: '',
        });
        setFormStep(1);
      } else {
        throw new Error(data.error || 'Failed to submit inquiry');
      }
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      toast({
        title: 'Submission Failed',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[300px] bg-gradient-to-br from-slate-800 to-slate-700">
        <div className="absolute inset-0 flex items-center justify-start px-8 md:px-16">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">
              GET IN TOUCH
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
          </div>
        </div>
      </section>

      {/* Contact Info and Map Section */}
      <section className="w-full py-12 px-4 md:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Store Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
              <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                <svg
                  className="w-24 h-24 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {isLoadingContact ? (
                <>
                  <div className="h-24 bg-slate-200 animate-pulse rounded" />
                  <div className="h-24 bg-slate-200 animate-pulse rounded" />
                </>
              ) : contactInfo ? (
                <>
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg mb-1">Our Location</h3>
                      <p className="text-slate-600">
                        {contactInfo.address.street}<br />
                        {contactInfo.address.city}<br />
                        {contactInfo.address.state}<br />
                        {contactInfo.address.postalCode}
                      </p>
                    </div>
                  </div>

                  {/* Phone Numbers */}
                  {contactInfo.phoneNumbers && contactInfo.phoneNumbers.length > 0 && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-red-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">Call Us</h3>
                        <div className="space-y-1">
                          {contactInfo.phoneNumbers.map((phone) => (
                            <div key={phone.id}>
                              <a
                                href={`tel:${phone.number.replace(/\s/g, '')}`}
                                className="text-slate-600 hover:text-red-600 transition-colors text-lg"
                              >
                                {phone.number}
                              </a>
                              {phone.label && phone.label !== 'Phone' && (
                                <span className="text-sm text-slate-500 ml-2">({phone.label})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {contactInfo.email && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-red-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">Email Us</h3>
                        <a
                          href={`mailto:${contactInfo.email}`}
                          className="text-slate-600 hover:text-red-600 transition-colors"
                        >
                          {contactInfo.email}
                        </a>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-500">Contact information not available</p>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-xl bg-slate-100">
            {contactInfo ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${contactInfo.address.street}, ${contactInfo.address.city}, ${contactInfo.address.state} ${contactInfo.address.postalCode}, ${contactInfo.address.country}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex flex-col items-center justify-center">
                  <svg
                    className="w-24 h-24 text-slate-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div className="text-center px-4">
                    <p className="text-slate-700 font-semibold mb-2">
                      {contactInfo.address.street}
                    </p>
                    <p className="text-slate-600 text-sm mb-4">
                      {contactInfo.address.city}, {contactInfo.address.state} {contactInfo.address.postalCode}
                    </p>
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg group-hover:bg-red-700 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      <span className="font-medium">Open in Google Maps</span>
                    </div>
                  </div>
                </div>
              </a>
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                <p className="text-slate-500">Loading map...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Product Enquiry Form Section */}
      <section className="w-full py-16 px-4 md:px-8 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Product <span className="text-red-600">Enquiry</span>
            </h2>
            <p className="text-slate-600">
              Interested in our products? Fill out the form below and we'll get back to you
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${formStep >= 1 ? 'text-red-600' : 'text-slate-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${formStep >= 1 ? 'bg-red-600 text-white' : 'bg-slate-200'}`}>
                  1
                </div>
                <span className="hidden sm:inline font-medium">Contact</span>
              </div>
              <div className={`w-12 h-1 ${formStep >= 2 ? 'bg-red-600' : 'bg-slate-200'}`} />
              <div className={`flex items-center gap-2 ${formStep >= 2 ? 'text-red-600' : 'text-slate-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${formStep >= 2 ? 'bg-red-600 text-white' : 'bg-slate-200'}`}>
                  2
                </div>
                <span className="hidden sm:inline font-medium">Product</span>
              </div>
              <div className={`w-12 h-1 ${formStep >= 3 ? 'bg-red-600' : 'bg-slate-200'}`} />
              <div className={`flex items-center gap-2 ${formStep >= 3 ? 'text-red-600' : 'text-slate-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${formStep >= 3 ? 'bg-red-600 text-white' : 'bg-slate-200'}`}>
                  3
                </div>
                <span className="hidden sm:inline font-medium">Message</span>
              </div>
            </div>
          </div>

          <Card className="shadow-xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Contact Information */}
                {formStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+44 20 1234 5678"
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                    >
                      Next Step
                    </Button>
                  </div>
                )}

                {/* Step 2: Product Information */}
                {formStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="productInterest">Product of Interest</Label>
                      {isLoadingProducts ? (
                        <div className="h-10 bg-slate-100 animate-pulse rounded-md" />
                      ) : (
                        <Select
                          value={formData.productName}
                          onValueChange={(value) => {
                            // Find the selected product to get its ID
                            const selectedProduct = products.find(p => p.name === value);
                            setFormData({
                              ...formData,
                              productName: value,
                              productId: selectedProduct?._id || '',
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                            {products.map((product) => (
                              <SelectItem key={product._id} value={product.name}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="quantity">Estimated Quantity</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        placeholder="1"
                        min="1"
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        onClick={handlePrevStep}
                        variant="outline"
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                      >
                        Next Step
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Message */}
                {formStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="message">Your Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us about your inquiry..."
                        rows={6}
                        required
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        onClick={handlePrevStep}
                        variant="outline"
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="w-full py-16 px-4 md:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              LET'S GET <span className="text-red-600">SOCIAL</span>
            </h2>
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          </div>

          {/* Social Media Grid Placeholder */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center space-y-4">
            <Button
              variant="outline"
              size="lg"
              className="border-slate-300 hover:bg-slate-50"
            >
              Load More
            </Button>
            <div>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                <a 
                  href={contactInfo?.socialMedia?.instagram || "https://www.instagram.com/immaculate_360?igsh=NzFhbDJjeDczYWln"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Follow on Instagram
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="w-full py-16 px-4 md:px-8 bg-gradient-to-br from-slate-800 to-slate-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Subscribe to our newsletter
          </h2>
          <p className="text-slate-300 mb-8">
            Stay updated with our latest products and special offers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 px-4 py-3 rounded-md border border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Button
              size="lg"
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
            >
              OK
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
