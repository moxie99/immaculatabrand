'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';
import { Trash2, Plus } from 'lucide-react';

/**
 * ContactInfoEditor Component
 * 
 * Manages contact information (address, email, phone numbers) that can be used across the app.
 * Stores data in the Content collection with structured format.
 * 
 * Features:
 * - Edit business address
 * - Edit email address
 * - Add/edit/delete multiple phone numbers
 * - Auto-save functionality
 */

interface PhoneNumber {
  id: string;
  label: string;
  number: string;
}

interface ContactInfo {
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  email: string;
  phoneNumbers: PhoneNumber[];
}

export function ContactInfoEditor() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United Kingdom',
    },
    email: '',
    phoneNumbers: [],
  });

  // Fetch existing contact info
  useEffect(() => {
    async function fetchContactInfo() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/content?key=contact_info');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.data) {
            setContactInfo(data.data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch contact info:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchContactInfo();
  }, []);

  const handleAddressChange = (field: keyof ContactInfo['address'], value: string) => {
    setContactInfo({
      ...contactInfo,
      address: {
        ...contactInfo.address,
        [field]: value,
      },
    });
  };

  const handleEmailChange = (value: string) => {
    setContactInfo({
      ...contactInfo,
      email: value,
    });
  };

  const handleAddPhoneNumber = () => {
    const newPhone: PhoneNumber = {
      id: Date.now().toString(),
      label: 'Phone',
      number: '',
    };
    setContactInfo({
      ...contactInfo,
      phoneNumbers: [...contactInfo.phoneNumbers, newPhone],
    });
  };

  const handlePhoneNumberChange = (id: string, field: 'label' | 'number', value: string) => {
    setContactInfo({
      ...contactInfo,
      phoneNumbers: contactInfo.phoneNumbers.map((phone) =>
        phone.id === id ? { ...phone, [field]: value } : phone
      ),
    });
  };

  const handleDeletePhoneNumber = (id: string) => {
    setContactInfo({
      ...contactInfo,
      phoneNumbers: contactInfo.phoneNumbers.filter((phone) => phone.id !== id),
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'contact_info',
          title: 'Contact Information',
          data: contactInfo,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Contact Information Saved',
          description: 'Your changes have been saved successfully.',
        });
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Failed to save contact info:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save contact information. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 animate-pulse rounded w-1/3" />
        <div className="h-64 bg-slate-200 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Business Address */}
      <Card>
        <CardHeader>
          <CardTitle>Business Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={contactInfo.address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              placeholder="123 Main Street"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={contactInfo.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="London"
              />
            </div>
            <div>
              <Label htmlFor="state">State/County</Label>
              <Input
                id="state"
                value={contactInfo.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                placeholder="Greater London"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={contactInfo.address.postalCode}
                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                placeholder="SW1A 1AA"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={contactInfo.address.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                placeholder="United Kingdom"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Address */}
      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="email">Business Email</Label>
            <Input
              id="email"
              type="email"
              value={contactInfo.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="info@example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Phone Numbers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Phone Numbers</CardTitle>
          <Button
            type="button"
            onClick={handleAddPhoneNumber}
            size="sm"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Phone
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {contactInfo.phoneNumbers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No phone numbers added yet. Click "Add Phone" to add one.
            </p>
          ) : (
            contactInfo.phoneNumbers.map((phone) => (
              <div key={phone.id} className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor={`phone-label-${phone.id}`}>Label</Label>
                  <Input
                    id={`phone-label-${phone.id}`}
                    value={phone.label}
                    onChange={(e) =>
                      handlePhoneNumberChange(phone.id, 'label', e.target.value)
                    }
                    placeholder="e.g., Main, Mobile, Fax"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`phone-number-${phone.id}`}>Number</Label>
                  <Input
                    id={`phone-number-${phone.id}`}
                    type="tel"
                    value={phone.number}
                    onChange={(e) =>
                      handlePhoneNumberChange(phone.id, 'number', e.target.value)
                    }
                    placeholder="+44 20 1234 5678"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => handleDeletePhoneNumber(phone.id)}
                  size="icon"
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className="min-w-[150px]"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
