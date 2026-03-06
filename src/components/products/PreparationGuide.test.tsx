/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PreparationGuide from './PreparationGuide';
import type { PreparationStep } from '@/types/product.types';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('PreparationGuide', () => {
  const mockSteps: PreparationStep[] = [
    {
      stepNumber: 1,
      title: 'Prepare ingredients',
      description: 'Gather all necessary ingredients and measure them out.',
      duration: '10 minutes',
    },
    {
      stepNumber: 2,
      title: 'Mix dry ingredients',
      description: 'Combine flour, sugar, and baking powder in a large bowl.',
      imageUrl: 'https://res.cloudinary.com/test/image/upload/step2.jpg',
      duration: '5 minutes',
    },
    {
      stepNumber: 3,
      title: 'Add wet ingredients',
      description: 'Pour in milk and eggs, then mix until smooth.',
    },
  ];

  describe('Rendering', () => {
    it('should render preparation guide with all steps', () => {
      render(<PreparationGuide steps={mockSteps} />);

      expect(screen.getByText('Preparation Guide')).toBeTruthy();
      expect(screen.getByText('Prepare ingredients')).toBeTruthy();
      expect(screen.getByText('Mix dry ingredients')).toBeTruthy();
      expect(screen.getByText('Add wet ingredients')).toBeTruthy();
    });

    it('should display step numbers correctly', () => {
      render(<PreparationGuide steps={mockSteps} />);

      expect(screen.getByText('1')).toBeTruthy();
      expect(screen.getByText('2')).toBeTruthy();
      expect(screen.getByText('3')).toBeTruthy();
    });

    it('should display step durations when provided', () => {
      render(<PreparationGuide steps={mockSteps} />);

      expect(screen.getByText('Duration: 10 minutes')).toBeTruthy();
      expect(screen.getByText('Duration: 5 minutes')).toBeTruthy();
    });

    it('should display step descriptions when expanded', () => {
      render(<PreparationGuide steps={mockSteps} />);

      expect(screen.getByText('Gather all necessary ingredients and measure them out.')).toBeTruthy();
      expect(screen.getByText('Combine flour, sugar, and baking powder in a large bowl.')).toBeTruthy();
      expect(screen.getByText('Pour in milk and eggs, then mix until smooth.')).toBeTruthy();
    });

    it('should render step images when imageUrl is provided', () => {
      render(<PreparationGuide steps={mockSteps} />);

      const images = screen.getAllByRole('img');
      const stepImage = images.find(img => 
        img.getAttribute('alt') === 'Step 2: Mix dry ingredients'
      );
      
      expect(stepImage).toBeTruthy();
    });

    it('should not render when steps array is empty', () => {
      const { container } = render(<PreparationGuide steps={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render when steps is undefined', () => {
      const { container } = render(<PreparationGuide steps={undefined as any} />);
      expect(container.firstChild).toBeNull();
    });

    it('should apply custom className when provided', () => {
      const { container } = render(
        <PreparationGuide steps={mockSteps} className="custom-class" />
      );
      expect(container.firstChild?.className).toContain('custom-class');
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('should render all steps expanded by default', () => {
      render(<PreparationGuide steps={mockSteps} />);

      // All descriptions should be visible
      expect(screen.getByText('Gather all necessary ingredients and measure them out.')).toBeTruthy();
      expect(screen.getByText('Combine flour, sugar, and baking powder in a large bowl.')).toBeTruthy();
      expect(screen.getByText('Pour in milk and eggs, then mix until smooth.')).toBeTruthy();
    });

    it('should collapse a step when clicked', () => {
      render(<PreparationGuide steps={mockSteps} />);

      const firstStepHeader = screen.getByText('Prepare ingredients').closest('div[class*="cursor-pointer"]');
      
      // Click to collapse
      fireEvent.click(firstStepHeader!);

      // Description should not be visible
      expect(screen.queryByText('Gather all necessary ingredients and measure them out.')).toBeNull();
    });

    it('should expand a collapsed step when clicked again', () => {
      render(<PreparationGuide steps={mockSteps} />);

      const firstStepHeader = screen.getByText('Prepare ingredients').closest('div[class*="cursor-pointer"]');
      
      // Click to collapse
      fireEvent.click(firstStepHeader!);
      expect(screen.queryByText('Gather all necessary ingredients and measure them out.')).toBeNull();

      // Click to expand
      fireEvent.click(firstStepHeader!);
      expect(screen.getByText('Gather all necessary ingredients and measure them out.')).toBeTruthy();
    });

    it('should collapse all steps when "Collapse All" button is clicked', () => {
      render(<PreparationGuide steps={mockSteps} />);

      const collapseAllButton = screen.getByText('Collapse All');
      fireEvent.click(collapseAllButton);

      // All descriptions should not be visible
      expect(screen.queryByText('Gather all necessary ingredients and measure them out.')).toBeNull();
      expect(screen.queryByText('Combine flour, sugar, and baking powder in a large bowl.')).toBeNull();
      expect(screen.queryByText('Pour in milk and eggs, then mix until smooth.')).toBeNull();
    });

    it('should expand all steps when "Expand All" button is clicked', () => {
      render(<PreparationGuide steps={mockSteps} />);

      // First collapse all
      const collapseAllButton = screen.getByText('Collapse All');
      fireEvent.click(collapseAllButton);

      // Then expand all
      const expandAllButton = screen.getByText('Expand All');
      fireEvent.click(expandAllButton);

      // All descriptions should be visible
      expect(screen.getByText('Gather all necessary ingredients and measure them out.')).toBeTruthy();
      expect(screen.getByText('Combine flour, sugar, and baking powder in a large bowl.')).toBeTruthy();
      expect(screen.getByText('Pour in milk and eggs, then mix until smooth.')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for step images', () => {
      render(<PreparationGuide steps={mockSteps} />);

      const images = screen.getAllByRole('img');
      const stepImage = images.find(img => 
        img.getAttribute('alt') === 'Step 2: Mix dry ingredients'
      );
      
      expect(stepImage?.getAttribute('alt')).toBe('Step 2: Mix dry ingredients');
    });

    it('should render expand/collapse buttons', () => {
      render(<PreparationGuide steps={mockSteps} />);

      expect(screen.getByText('Expand All')).toBeTruthy();
      expect(screen.getByText('Collapse All')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle steps without duration', () => {
      const stepsWithoutDuration: PreparationStep[] = [
        {
          stepNumber: 1,
          title: 'Step without duration',
          description: 'This step has no duration specified.',
        },
      ];

      render(<PreparationGuide steps={stepsWithoutDuration} />);

      expect(screen.getByText('Step without duration')).toBeTruthy();
      expect(screen.queryByText(/Duration:/)).toBeNull();
    });

    it('should handle steps without images', () => {
      const stepsWithoutImages: PreparationStep[] = [
        {
          stepNumber: 1,
          title: 'Step without image',
          description: 'This step has no image.',
        },
      ];

      render(<PreparationGuide steps={stepsWithoutImages} />);

      expect(screen.getByText('Step without image')).toBeTruthy();
      // Should not render any images (no img elements)
      const images = screen.queryAllByRole('img');
      expect(images.length).toBe(0);
    });

    it('should handle single step', () => {
      const singleStep: PreparationStep[] = [
        {
          stepNumber: 1,
          title: 'Only step',
          description: 'This is the only step.',
        },
      ];

      render(<PreparationGuide steps={singleStep} />);

      expect(screen.getByText('Only step')).toBeTruthy();
      expect(screen.getByText('This is the only step.')).toBeTruthy();
    });

    it('should handle long descriptions with whitespace', () => {
      const stepsWithLongDescription: PreparationStep[] = [
        {
          stepNumber: 1,
          title: 'Step with long description',
          description: 'Line 1\nLine 2\nLine 3',
        },
      ];

      render(<PreparationGuide steps={stepsWithLongDescription} />);

      // Use getAllByText to get all matching elements, then find the <p> tag
      const descriptions = screen.getAllByText((content, element) => {
        return element?.textContent === 'Line 1\nLine 2\nLine 3';
      });
      const description = descriptions.find(el => el.tagName === 'P');
      
      expect(description).toBeTruthy();
      expect(description?.className).toContain('whitespace-pre-wrap');
    });
  });
});
