import { render, screen } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'
import HomePage from '@/app/page'

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => ({
    user: null,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    updateUser: jest.fn(),
  }),
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('HomePage', () => {
  const renderHomePage = () => {
    return render(
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    )
  }

  it('renders the hero banner with title', () => {
    renderHomePage()
    
    expect(screen.getByText('Welcome to Findamine')).toBeInTheDocument()
    expect(screen.getByText(/ultimate treasure hunting adventure game/)).toBeInTheDocument()
  })

  it('renders call-to-action buttons', () => {
    renderHomePage()
    
    expect(screen.getByText('Start Your Adventure')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('renders game description section', () => {
    renderHomePage()
    
    expect(screen.getByText('What is Findamine?')).toBeInTheDocument()
    expect(screen.getByText(/location-based game/)).toBeInTheDocument()
  })

  it('renders key features section', () => {
    renderHomePage()
    
    expect(screen.getByText('Why Choose Findamine?')).toBeInTheDocument()
    expect(screen.getByText('Create Your Own Games')).toBeInTheDocument()
    expect(screen.getByText('Win Exciting Prizes')).toBeInTheDocument()
    expect(screen.getByText('Join Local Groups')).toBeInTheDocument()
    expect(screen.getByText('Interactive Experience')).toBeInTheDocument()
  })

  it('renders how it works section', () => {
    renderHomePage()
    
    expect(screen.getByText('How It Works')).toBeInTheDocument()
    expect(screen.getByText('Create Account')).toBeInTheDocument()
    expect(screen.getByText('Join Games')).toBeInTheDocument()
    expect(screen.getByText('Start Hunting')).toBeInTheDocument()
  })

  it('renders final call-to-action section', () => {
    renderHomePage()
    
    expect(screen.getByText('Get Started Free')).toBeInTheDocument()
    expect(screen.getByText('Sign In to Continue')).toBeInTheDocument()
  })

  it('has correct navigation links', () => {
    renderHomePage()
    
    const startAdventureLink = screen.getByText('Start Your Adventure').closest('a')
    const signInLink = screen.getByText('Sign In').closest('a')
    
    expect(startAdventureLink).toHaveAttribute('href', '/register')
    expect(signInLink).toHaveAttribute('href', '/login')
  })
})
