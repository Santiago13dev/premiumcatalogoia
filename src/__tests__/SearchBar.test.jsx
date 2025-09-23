import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBar from '../components/SearchBar';

describe('SearchBar Component', () => {
  const mockOnSearch = jest.fn();
  const mockOnTypeFilter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders search input and filter buttons', () => {
    render(
      <SearchBar 
        onSearch={mockOnSearch}
        onTypeFilter={mockOnTypeFilter}
        filterType=""
        tagSearch=""
      />
    );
    
    expect(screen.getByPlaceholderText(/Buscar/i)).toBeInTheDocument();
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Modelos')).toBeInTheDocument();
    expect(screen.getByText('Datasets')).toBeInTheDocument();
    expect(screen.getByText('Prompts')).toBeInTheDocument();
  });

  test('calls onSearch when typing', async () => {
    render(
      <SearchBar 
        onSearch={mockOnSearch}
        onTypeFilter={mockOnTypeFilter}
        filterType=""
        tagSearch=""
      />
    );
    
    const input = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(input, { target: { value: 'test search' } });
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test search');
    });
  });

  test('calls onTypeFilter when clicking filter button', () => {
    render(
      <SearchBar 
        onSearch={mockOnSearch}
        onTypeFilter={mockOnTypeFilter}
        filterType=""
        tagSearch=""
      />
    );
    
    const modelButton = screen.getByText('Modelos');
    fireEvent.click(modelButton);
    
    expect(mockOnTypeFilter).toHaveBeenCalledWith('model');
  });

  test('shows active filter state', () => {
    render(
      <SearchBar 
        onSearch={mockOnSearch}
        onTypeFilter={mockOnTypeFilter}
        filterType="model"
        tagSearch=""
      />
    );
    
    const modelButton = screen.getByText('Modelos');
    expect(modelButton).toHaveClass('bg-indigo-600');
  });

  test('clear button works', () => {
    render(
      <SearchBar 
        onSearch={mockOnSearch}
        onTypeFilter={mockOnTypeFilter}
        filterType="model"
        tagSearch="test"
      />
    );
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith('');
    expect(mockOnTypeFilter).toHaveBeenCalledWith('');
  });

  test('advanced search panel toggles', () => {
    render(
      <SearchBar 
        onSearch={mockOnSearch}
        onTypeFilter={mockOnTypeFilter}
        filterType=""
        tagSearch=""
      />
    );
    
    const advancedButton = screen.getByRole('button', { name: /advanced/i });
    fireEvent.click(advancedButton);
    
    expect(screen.getByText(/Filtros avanzados/i)).toBeInTheDocument();
  });
});