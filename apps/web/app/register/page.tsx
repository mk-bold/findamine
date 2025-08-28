'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, User, UserCheck, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface LocationData {
  country: string;
  state?: string;
  minAge: number;
  locationDisplay: string;
}

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [gamerTag, setGamerTag] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isOldEnough, setIsOldEnough] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  // Load user's location on component mount
  useEffect(() => {
    const loadLocation = async () => {
      try {
        setIsLoadingLocation(true);
        const response = await fetch('/api/geo-location');
        if (response.ok) {
          const data = await response.json();
          setLocationData(data);
        } else {
          // Fallback to default location
          setLocationData({
            country: 'US',
            state: 'CA',
            minAge: 13,
            locationDisplay: 'California, United States'
          });
        }
      } catch (error) {
        console.error('Failed to load location:', error);
        // Fallback to default location
        setLocationData({
          country: 'US',
          state: 'CA',
          minAge: 13,
          locationDisplay: 'California, United States'
        });
      } finally {
        setIsLoadingLocation(false);
      }
    };

    loadLocation();
  }, []);

  // Check age when date of birth changes
  useEffect(() => {
    if (dateOfBirth && locationData) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      let calculatedAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge = age - 1;
      }
      
      setIsOldEnough(calculatedAge >= locationData.minAge);
    }
  }, [dateOfBirth, locationData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !firstName || !lastName || !dateOfBirth) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!agreedToTerms) {
      toast.error('You must agree to the terms of use');
      return;
    }

    if (!isOldEnough) {
      toast.error('You are not old enough to use this app');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          gamerTag: gamerTag || undefined,
          password,
          firstName,
          lastName,
          dateOfBirth,
          country: locationData?.country,
          state: locationData?.state,
          agreedToTerms: true,
          termsVersion: '1.0',
        }),
      });

      if (response.ok) {
        toast.success('Registration successful! Please sign in.');
        router.push('/login');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = !isOldEnough || isSubmitting;
  const canProceed = isOldEnough && !isSubmitting;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <UserCheck className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Join Findamine
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to start playing
          </p>
        </div>

        {/* Location and Age Requirement Notice */}
        {locationData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-blue-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Location: {locationData.locationDisplay}
                </p>
                <p className="text-sm text-blue-700">
                  Minimum age: {locationData.minAge} years old
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  <strong>Note:</strong> The minimum age to play Findamine is 13 years old in most locations, but may be higher in your area.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Age Warning */}
        {dateOfBirth && !isOldEnough && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Age Requirement Not Met
                </p>
                <p className="text-sm text-red-700">
                  You must be at least {locationData?.minAge} years old to use Findamine in {locationData?.locationDisplay}.
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Date of Birth - First and Always Enabled */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-yellow-800 mb-3">Step 1: Verify Your Age</h3>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              {dateOfBirth && (
                <div className="mt-2">
                  {isOldEnough ? (
                    <div className="flex items-center text-green-600">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">✓ Age requirement met! You can now fill out the rest of the form.</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">✗ You must be at least {locationData?.minAge || 13} years old to use Findamine in {locationData?.locationDisplay}.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>



          {/* Form Instructions */}
          {!dateOfBirth && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Please enter your date of birth above to verify your age before continuing with registration.
                </p>
              </div>
            </div>
          )}

          {canProceed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-center">
                <p className="text-sm text-green-700 font-medium">
                  ✓ Age verified! You can now complete your registration below.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="Enter your email"
                  disabled={isFormDisabled}
                />
              </div>
            </div>

            {/* Gamer Tag */}
            <div>
              <label htmlFor="gamerTag" className="block text-sm font-medium text-gray-700">
                Gamer Tag (Username)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="gamerTag"
                  name="gamerTag"
                  type="text"
                  autoComplete="username"
                  value={gamerTag}
                  onChange={(e) => setGamerTag(e.target.value)}
                  className="input pl-10"
                  placeholder="Choose a gamer tag (optional)"
                  disabled={isFormDisabled}
                />
              </div>
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input"
                placeholder="First name"
                disabled={isFormDisabled}
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input"
                placeholder="Last name"
                disabled={isFormDisabled}
              />
            </div>

            {/* Privacy Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Privacy Note:</span> Your real name will not be displayed in the game. 
                    Only your gamer tag will be visible to other players. Your real name is used solely for account management.
                  </p>
                </div>
              </div>
            </div>



            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10 pl-10"
                  placeholder="Create a password"
                  disabled={isFormDisabled}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isFormDisabled}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pr-10 pl-10"
                  placeholder="Confirm your password"
                  disabled={isFormDisabled}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isFormDisabled}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Legal Agreements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Legal Agreements</h3>
            


            {/* Terms of Use */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="termsAgreement"
                  name="termsAgreement"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  disabled={isFormDisabled}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="termsAgreement" className="font-medium text-gray-700">
                  I agree to the <Link href="/terms" className="text-primary-600 hover:text-primary-500 underline" target="_blank">Terms of Use</Link>
                </label>
                <p className="text-gray-500">
                  You must read and agree to our terms of use to continue.
                </p>
              </div>
            </div>

            {/* Privacy Policy Link */}
            <div className="text-sm text-gray-600">
              <p>
                By continuing, you acknowledge that you have read our{' '}
                <Link href="/privacy" className="text-primary-600 hover:text-primary-500 underline" target="_blank">Privacy Policy</Link>
                {' '}and understand how your data will be used.
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isFormDisabled || !agreedToTerms}
              className="btn-primary w-full py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : !isOldEnough ? (
                'Complete Age Verification First'
              ) : !agreedToTerms ? (
                'Agree to Terms to Continue'
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              <Link href="/" className="font-medium text-primary-600 hover:text-primary-500">
                ← Back to Home
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
