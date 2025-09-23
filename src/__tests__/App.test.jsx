import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

describe('App Component', () => {
  test('renders header with title', () => {
    render(<App />);
    const title = screen.getByText(/Catálogo IA Premium/i);
    expect(title).toBeInTheDocument();
  });

  test('filters components by type', async () => {
    render(<App />);
    
    // Click on Models filter
    const modelButton = screen.getByText('Modelos');
    fireEvent.click(modelButton);
    
    // Check that only model components are shown
    await waitFor(() => {
      const cards = screen.getAllByText(/model/i);
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  test('search functionality works', async () => {
    render(<App />);
    
    const searchInput = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(searchInput, { target: { value: 'GPT' } });
    
    await waitFor(() => {
      const results = screen.getByText(/GPT/i);
      expect(results).toBeInTheDocument();
    });
  });

  test('dark mode toggle works', () => {
    render(<App />);
    
    const darkModeButton = screen.getByRole('button', { name: /dark mode/i });
    fireEvent.click(darkModeButton);
    
    expect(document.documentElement).toHaveClass('dark');
  });

  test('modal opens when clicking on component', async () => {
    render(<App />);
    
    const detailButton = screen.getAllByText('Ver detalles')[0];
    fireEvent.click(detailButton);
    
    await waitFor(() => {
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });
  });
});