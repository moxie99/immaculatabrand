import { ProductForm } from './ProductForm';
import { Product } from '@/types/product.types';

export default function ProductFormExample() {
  const mockProduct: Product = {
    _id: '1',
    name: 'Chocolate Truffles',
    slug: 'chocolate-truffles',
    category: 'confectionary',
    description: 'Handmade chocolate truffles with rich cocoa flavor',
    price: 12.99,
    currency: 'GBP',
    images: ['https://example.com/truffles.jpg'],
    preparationSteps: [
      {
        stepNumber: 1,
        title: 'Melt the chocolate',
        description: 'Melt dark chocolate in a double boiler',
        duration: '5 minutes',
      },
      {
        stepNumber: 2,
        title: 'Mix ingredients',
        description: 'Combine melted chocolate with cream and butter',
        duration: '3 minutes',
      },
    ],
    nutritionInfo: {
      servingSize: '100g',
      calories: 450,
      protein: '5g',
      carbs: '45g',
      fat: '28g',
    },
    isFeatured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const handleSubmit = async (data: any) => {
    console.log('Form submitted:', data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert('Product saved successfully!');
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Product Form Examples</h1>

      <div className="space-y-12">
        {/* Create Mode */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Create New Product</h2>
          <ProductForm onSubmit={handleSubmit} />
        </section>

        {/* Edit Mode */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Edit Existing Product</h2>
          <ProductForm product={mockProduct} onSubmit={handleSubmit} />
        </section>

        {/* Loading State */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Loading State</h2>
          <ProductForm onSubmit={handleSubmit} isLoading={true} />
        </section>
      </div>
    </div>
  );
}
