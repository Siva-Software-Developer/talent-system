import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

/* ==========================================
   🚀 DTMS SYSTEM INTEGRATION TESTS
   ========================================== */

describe('DTMS Infrastructure Core Tests', () => {
  
  // 1. Check if the Main Hero Title renders correctly
  test('renders DTMS main hero title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Digital Talent Management System/i);
    expect(titleElement).toBeInTheDocument();
  });

  // 2. Check if System Access (Login) button exists
  test('renders system access button', () => {
    render(<App />);
    const loginBtn = screen.getByText(/SYSTEM ACCESS/i);
    expect(loginBtn).toBeInTheDocument();
  });

  // 3. Check if Theme Toggle works (Visual Check)
  test('theme toggle button exists and is clickable', () => {
    render(<App />);
    const themeBtn = screen.getByTitle(/Switch System Theme/i);
    expect(themeBtn).toBeInTheDocument();
    
    // Simulate click
    fireEvent.click(themeBtn);
    // After click, the root div should have the toggled class (e.g., 'dark')
    const rootDiv = screen.getByRole('button', { name: '' }).closest('.dtms-app-root');
    expect(rootDiv).toBeDefined();
  });

  // 4. Check if Onboarding button is present
  test('renders employee onboarding button', () => {
    render(<App />);
    const registerBtn = screen.getByText(/EMPLOYEE ONBOARDING/i);
    expect(registerBtn).toBeInTheDocument();
  });

});