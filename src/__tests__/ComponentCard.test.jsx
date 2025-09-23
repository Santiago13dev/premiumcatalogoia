import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComponentCard from '../components/ComponentCard';

const mockComponent = {
  id: 'test-1',
  name: 'Test Component',
  type: 'model',
  description: 'Test description',
  tags: ['test', 'component'],
  image: 'https://example.com/image.jpg',
  usage: 'console.log("test")'
};

describe('ComponentCard Component', () => {
  test('renders component information', () => {
    render(<ComponentCard component={mockComponent} onSelect={() => {}} />);
    
    expect(screen.getByText('Test Component')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('#test')).toBeInTheDocument();
    expect(screen.getByText('#component')).toBeInTheDocument();
  });

  test('calls onSelect when button clicked', () => {
    const mockOnSelect = jest.fn();
    render(<ComponentCard component={mockComponent} onSelect={mockOnSelect} />);
    
    const button = screen.getByText('Ver detalles');
    fireEvent.click(button);
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockComponent);
  });

  test('handles image error with fallback', () => {
    render(<ComponentCard component={mockComponent} onSelect={() => {}} />);
    
    const image = screen.getByAltText('Test Component');
    fireEvent.error(image);
    
    expect(image.src).toContain('ui-avatars.com');
  });

  test('displays correct type icon and color', () => {
    render(<ComponentCard component={mockComponent} onSelect={() => {}} />);
    
    const typeElement = screen.getByText('model');
    expect(typeElement).toHaveClass('bg-purple-100');
  });

  test('shows hover effects', () => {
    const { container } = render(<ComponentCard component={mockComponent} onSelect={() => {}} />);
    
    const card = container.firstChild;
    fireEvent.mouseEnter(card);
    
    expect(card).toHaveClass('hover:-translate-y-2');
  });
});