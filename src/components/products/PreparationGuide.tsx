'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PreparationStep } from '@/types/product.types';

/**
 * PreparationGuide Component Props
 */
export interface PreparationGuideProps {
  steps: PreparationStep[];
  className?: string;
}

/**
 * PreparationGuide Component
 * 
 * Displays step-by-step preparation instructions for products.
 * 
 * Features:
 * - Displays each step with numbering (1, 2, 3, etc.)
 * - Shows step title, description, and optional duration
 * - Displays step images if available using Next.js Image component
 * - Implements expandable/collapsible functionality for each step
 * - Responsive design that works well on mobile
 * - Handles empty steps array gracefully
 * - Uses Shadcn components for consistent styling
 * 
 * Requirements: Design - Product Components
 */
export default function PreparationGuide({ steps, className = '' }: PreparationGuideProps) {
  // Handle empty steps array
  if (!steps || steps.length === 0) {
    return null;
  }

  // Track which steps are expanded (all expanded by default)
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(
    new Set(steps.map((_, index) => index))
  );

  // Toggle step expansion
  const toggleStep = (index: number) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Expand all steps
  const expandAll = () => {
    setExpandedSteps(new Set(steps.map((_, index) => index)));
  };

  // Collapse all steps
  const collapseAll = () => {
    setExpandedSteps(new Set());
  };

  return (
    <div className={className}>
      {/* Header with expand/collapse controls */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Preparation Guide</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="text-xs"
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="text-xs"
          >
            Collapse All
          </Button>
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isExpanded = expandedSteps.has(index);
          
          return (
            <Card key={index} className="overflow-hidden">
              {/* Step header - always visible, clickable */}
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleStep(index)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Step number badge */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {step.stepNumber}
                    </div>
                    
                    {/* Step title and duration */}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg">
                        {step.title}
                      </CardTitle>
                      {step.duration && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Duration: {step.duration}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expand/collapse icon */}
                  <div className="flex-shrink-0">
                    <svg
                      className={`w-5 h-5 text-muted-foreground transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </CardHeader>

              {/* Step content - collapsible */}
              {isExpanded && (
                <CardContent className="pt-0 pb-6">
                  {/* Step image if available */}
                  {step.imageUrl && (
                    <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={step.imageUrl}
                        alt={`Step ${step.stepNumber}: ${step.title}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px"
                      />
                    </div>
                  )}

                  {/* Step description */}
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground whitespace-pre-wrap">
                      {step.description}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
