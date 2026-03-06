import React from 'react';
import PreparationGuide from './PreparationGuide';
import type { PreparationStep } from '@/types/product.types';

/**
 * PreparationGuide Component Examples
 * 
 * This file demonstrates various use cases of the PreparationGuide component.
 */

// Example 1: Basic preparation guide with multiple steps
export function BasicPreparationGuide() {
  const steps: PreparationStep[] = [
    {
      stepNumber: 1,
      title: 'Prepare the ingredients',
      description: 'Gather all necessary ingredients: flour, sugar, eggs, butter, and vanilla extract. Measure them out according to the recipe.',
      duration: '10 minutes',
    },
    {
      stepNumber: 2,
      title: 'Mix dry ingredients',
      description: 'In a large bowl, combine the flour, sugar, and baking powder. Whisk together until well combined.',
      duration: '5 minutes',
    },
    {
      stepNumber: 3,
      title: 'Add wet ingredients',
      description: 'Create a well in the center of the dry ingredients. Add eggs, melted butter, and vanilla extract. Mix until just combined.',
      duration: '5 minutes',
    },
    {
      stepNumber: 4,
      title: 'Bake',
      description: 'Pour the batter into a greased baking pan. Bake at 350°F (175°C) for 25-30 minutes or until a toothpick inserted in the center comes out clean.',
      duration: '30 minutes',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Basic Preparation Guide</h1>
      <PreparationGuide steps={steps} />
    </div>
  );
}

// Example 2: Preparation guide with images
export function PreparationGuideWithImages() {
  const steps: PreparationStep[] = [
    {
      stepNumber: 1,
      title: 'Clean the fish',
      description: 'Rinse the fish thoroughly under cold water. Remove scales and internal organs. Pat dry with paper towels.',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      duration: '15 minutes',
    },
    {
      stepNumber: 2,
      title: 'Season the fish',
      description: 'Rub the fish with a mixture of salt, pepper, garlic powder, and lemon juice. Let it marinate for at least 30 minutes.',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      duration: '5 minutes (plus 30 minutes marinating)',
    },
    {
      stepNumber: 3,
      title: 'Smoke the fish',
      description: 'Place the fish in a smoker at 225°F (107°C). Smoke for 2-3 hours until the internal temperature reaches 145°F (63°C).',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      duration: '2-3 hours',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Preparation Guide with Images</h1>
      <PreparationGuide steps={steps} />
    </div>
  );
}

// Example 3: Simple preparation guide without durations
export function SimplePreparationGuide() {
  const steps: PreparationStep[] = [
    {
      stepNumber: 1,
      title: 'Soak the plantain',
      description: 'Peel and slice the plantain. Soak in salted water for 10 minutes.',
    },
    {
      stepNumber: 2,
      title: 'Fry the plantain',
      description: 'Heat oil in a pan. Fry the plantain slices until golden brown on both sides.',
    },
    {
      stepNumber: 3,
      title: 'Serve',
      description: 'Drain on paper towels and serve hot with your favorite dipping sauce.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Simple Preparation Guide</h1>
      <PreparationGuide steps={steps} />
    </div>
  );
}

// Example 4: Single step preparation
export function SingleStepPreparation() {
  const steps: PreparationStep[] = [
    {
      stepNumber: 1,
      title: 'Ready to eat',
      description: 'This product is ready to eat straight from the package. Simply open and enjoy!',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Single Step Preparation</h1>
      <PreparationGuide steps={steps} />
    </div>
  );
}

// Example 5: Empty preparation guide (should not render)
export function EmptyPreparationGuide() {
  const steps: PreparationStep[] = [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Empty Preparation Guide</h1>
      <p className="text-muted-foreground mb-4">
        When there are no preparation steps, the component should not render anything:
      </p>
      <PreparationGuide steps={steps} />
      <p className="text-muted-foreground mt-4">
        (Nothing should appear above this text)
      </p>
    </div>
  );
}

// Example 6: Preparation guide with custom styling
export function CustomStyledPreparationGuide() {
  const steps: PreparationStep[] = [
    {
      stepNumber: 1,
      title: 'Prepare ingredients',
      description: 'Gather all ingredients needed for the recipe.',
      duration: '5 minutes',
    },
    {
      stepNumber: 2,
      title: 'Cook',
      description: 'Follow the cooking instructions carefully.',
      duration: '20 minutes',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-50">
      <h1 className="text-3xl font-bold mb-6">Custom Styled Preparation Guide</h1>
      <PreparationGuide steps={steps} className="bg-white rounded-lg shadow-lg p-6" />
    </div>
  );
}

// Example 7: Complex preparation with detailed steps
export function ComplexPreparationGuide() {
  const steps: PreparationStep[] = [
    {
      stepNumber: 1,
      title: 'Prepare the dough',
      description: `Mix flour, water, yeast, and salt in a large bowl.
Knead the dough for 10 minutes until smooth and elastic.
Cover with a damp cloth and let it rise in a warm place for 1 hour.`,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      duration: '1 hour 15 minutes',
    },
    {
      stepNumber: 2,
      title: 'Shape the dough',
      description: `Punch down the risen dough to release air bubbles.
Divide into equal portions and shape into desired forms.
Place on a greased baking sheet, leaving space between each piece.`,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      duration: '15 minutes',
    },
    {
      stepNumber: 3,
      title: 'Second rise',
      description: `Cover the shaped dough with a clean kitchen towel.
Let it rise again for 30-45 minutes until doubled in size.
Preheat your oven to 375°F (190°C) during this time.`,
      duration: '45 minutes',
    },
    {
      stepNumber: 4,
      title: 'Bake',
      description: `Brush the tops with egg wash for a golden finish.
Bake in the preheated oven for 20-25 minutes.
The bread should be golden brown and sound hollow when tapped.`,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      duration: '25 minutes',
    },
    {
      stepNumber: 5,
      title: 'Cool and serve',
      description: `Remove from the oven and transfer to a wire rack.
Let cool for at least 10 minutes before slicing.
Serve warm with butter or your favorite spread.`,
      duration: '10 minutes',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Complex Preparation Guide</h1>
      <PreparationGuide steps={steps} />
    </div>
  );
}

// Default export with all examples
export default function PreparationGuideExamples() {
  return (
    <div className="space-y-12 pb-12">
      <BasicPreparationGuide />
      <hr className="my-12" />
      <PreparationGuideWithImages />
      <hr className="my-12" />
      <SimplePreparationGuide />
      <hr className="my-12" />
      <SingleStepPreparation />
      <hr className="my-12" />
      <EmptyPreparationGuide />
      <hr className="my-12" />
      <CustomStyledPreparationGuide />
      <hr className="my-12" />
      <ComplexPreparationGuide />
    </div>
  );
}
