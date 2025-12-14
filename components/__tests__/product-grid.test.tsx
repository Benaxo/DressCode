import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductGrid } from '../product-grid'

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string }) => <img alt={alt} {...props} />
}))

vi.mock('@/sanity/lib/image', () => ({
  urlForImage: () => ({
    width: () => ({ height: () => ({ url: () => 'https://example.com/image.jpg' }) }),
    url: () => 'https://example.com/image.jpg'
  })
}))

vi.mock('use-shopping-cart', () => ({
  formatCurrencyString: ({ value }: { value: number }) => `$${(value / 100).toFixed(2)}`
}))

const mockProducts = [
  {
    _id: '1',
    name: 'Test Product',
    slug: 'test-product',
    price: 2999,
    currency: 'USD',
    images: [{ _key: 'img1', asset: { _ref: 'ref1' } }],
    categories: ['t-shirt'],
    sizes: ['s', 'm', 'l']
  }
]

describe('ProductGrid', () => {
  it('renders empty state when no products', () => {
    render(<ProductGrid products={[]} />)
    expect(screen.getByText('No products found')).toBeInTheDocument()
  })

  it('renders products with correct structure', () => {
    render(<ProductGrid products={mockProducts as any} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
  })

  it('shows "Try it with AI!" overlay on hover', () => {
    render(<ProductGrid products={mockProducts as any} />)
    expect(screen.getByText('Try it with AI!')).toBeInTheDocument()
  })

  it('renders product links with correct href', () => {
    render(<ProductGrid products={mockProducts as any} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/products/test-product')
  })

  it('uses aspect-square for uniform image sizing', () => {
    const { container } = render(<ProductGrid products={mockProducts as any} />)
    const imageContainer = container.querySelector('.aspect-square')
    expect(imageContainer).toBeInTheDocument()
  })
})
