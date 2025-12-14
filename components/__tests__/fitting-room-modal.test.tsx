import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FittingRoomModal } from '../fitting-room-modal'

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string }) => <img alt={alt} {...props} />
}))

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}))

describe('FittingRoomModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the Virtual Try-On button with catchy style', () => {
    render(<FittingRoomModal garmentUrl="https://example.com/garment.jpg" category="t-shirt" />)
    const button = screen.getByText('Virtual Try-On')
    expect(button).toBeInTheDocument()
    expect(button.closest('button')).toHaveClass('btn-tryon')
  })

  it('opens dialog when button is clicked', async () => {
    render(<FittingRoomModal garmentUrl="https://example.com/garment.jpg" category="t-shirt" />)
    
    fireEvent.click(screen.getByText('Virtual Try-On'))
    
    await waitFor(() => {
      expect(screen.getByText('Virtual Fitting Room')).toBeInTheDocument()
    })
  })

  it('shows upload instructions with file size info', async () => {
    render(<FittingRoomModal garmentUrl="https://example.com/garment.jpg" />)
    
    fireEvent.click(screen.getByText('Virtual Try-On'))
    
    await waitFor(() => {
      expect(screen.getByText('1. Upload your photo')).toBeInTheDocument()
      expect(screen.getByText('Click to upload image')).toBeInTheDocument()
      expect(screen.getByText('PNG, JPG up to 10MB')).toBeInTheDocument()
    })
  })

  it('has disabled Try On button when no image selected', async () => {
    render(<FittingRoomModal garmentUrl="https://example.com/garment.jpg" />)
    
    fireEvent.click(screen.getByText('Virtual Try-On'))
    
    await waitFor(() => {
      const tryOnButton = screen.getByText('Try On Now')
      expect(tryOnButton).toBeDisabled()
    })
  })

  it('has hidden file input for better UX', async () => {
    render(<FittingRoomModal garmentUrl="https://example.com/garment.jpg" />)
    
    fireEvent.click(screen.getByText('Virtual Try-On'))
    
    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toHaveClass('hidden')
    })
  })
})
