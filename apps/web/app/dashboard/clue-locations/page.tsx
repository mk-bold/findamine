'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Map,
  List,
  Globe,
  Clock,
  Star,
  Target,
  Camera,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ClueLocation {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  photoUrl?: string;
  hints: string[];
  solution?: string;
  points: number;
  radius: number;
  isActive: boolean;
  gameIds: string[];
  createdBy: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  stats: {
    timesUsed: number;
    averageFindTime: number;
    successRate: number;
    averageRating: number;
  };
}

interface ClueLocationForm {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  hints: string[];
  solution: string;
  points: number;
  radius: number;
}

export default function ClueLocationsPage() {
  const { user } = useAuth();
  const [clueLocations, setClueLocations] = useState<ClueLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClue, setEditingClue] = useState<ClueLocation | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [selectedClue, setSelectedClue] = useState<ClueLocation | null>(null);

  const [formData, setFormData] = useState<ClueLocationForm>({
    name: '',
    description: '',
    latitude: 0,
    longitude: 0,
    address: '',
    difficulty: 'medium',
    category: '',
    hints: [''],
    solution: '',
    points: 10,
    radius: 50,
  });

  useEffect(() => {
    fetchClueLocations();
  }, []);

  const fetchClueLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clue-locations', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setClueLocations(data);
      } else {
        // Mock data for development
        setClueLocations([
          {
            id: '1',
            name: 'Downtown Clock Tower',
            description: 'Historic clock tower in the heart of downtown',
            latitude: 40.7589,
            longitude: -73.9851,
            address: '123 Main St, Downtown',
            difficulty: 'easy',
            category: 'Historical',
            photoUrl: undefined,
            hints: ['Look for the time', 'Its face tells a story'],
            solution: 'The large clock face on the tower',
            points: 10,
            radius: 25,
            isActive: true,
            gameIds: ['game1', 'game2'],
            createdBy: {
              id: 'user1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
            },
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z',
            stats: {
              timesUsed: 23,
              averageFindTime: 12.5,
              successRate: 85.2,
              averageRating: 4.2,
            },
          },
          {
            id: '2',
            name: 'Park Statue Mystery',
            description: 'Bronze statue with hidden inscription',
            latitude: 40.7614,
            longitude: -73.9776,
            address: 'Central Park, Statue Garden',
            difficulty: 'medium',
            category: 'Art & Culture',
            photoUrl: undefined,
            hints: ['Made of bronze', 'Check the base', 'Latin inscription'],
            solution: 'The inscription reads "Tempus Fugit"',
            points: 15,
            radius: 30,
            isActive: true,
            gameIds: ['game1', 'game3'],
            createdBy: {
              id: 'user2',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane@example.com',
            },
            createdAt: '2024-01-10T14:30:00Z',
            updatedAt: '2024-01-12T09:15:00Z',
            stats: {
              timesUsed: 18,
              averageFindTime: 18.3,
              successRate: 72.1,
              averageRating: 4.0,
            },
          },
          {
            id: '3',
            name: 'Street Art Hunt',
            description: 'Colorful mural with hidden message',
            latitude: 40.7505,
            longitude: -73.9934,
            address: '456 Art District Ave',
            difficulty: 'hard',
            category: 'Street Art',
            photoUrl: undefined,
            hints: ['Colors tell a story', 'Third panel from left', 'Look for numbers'],
            solution: 'The hidden numbers in the mural: 1847',
            points: 25,
            radius: 20,
            isActive: true,
            gameIds: ['game2', 'game4'],
            createdBy: {
              id: 'user1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
            },
            createdAt: '2024-01-08T16:45:00Z',
            updatedAt: '2024-01-08T16:45:00Z',
            stats: {
              timesUsed: 12,
              averageFindTime: 22.1,
              successRate: 58.3,
              averageRating: 4.5,
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching clue locations:', error);
      toast.error('Failed to load clue locations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingClue 
        ? `/api/clue-locations/${editingClue.id}` 
        : '/api/clue-locations';
      
      const method = editingClue ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (editingClue) {
          setClueLocations(prev => prev.map(clue => clue.id === editingClue.id ? data : clue));
          toast.success('Clue location updated successfully');
        } else {
          setClueLocations(prev => [data, ...prev]);
          toast.success('Clue location created successfully');
        }
        resetForm();
      } else {
        toast.error('Failed to save clue location');
      }
    } catch (error) {
      console.error('Error saving clue location:', error);
      toast.error('Failed to save clue location');
    }
  };

  const handleEdit = (clue: ClueLocation) => {
    setEditingClue(clue);
    setFormData({
      name: clue.name,
      description: clue.description,
      latitude: clue.latitude,
      longitude: clue.longitude,
      address: clue.address,
      difficulty: clue.difficulty,
      category: clue.category,
      hints: clue.hints,
      solution: clue.solution || '',
      points: clue.points,
      radius: clue.radius,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this clue location?')) return;
    
    try {
      const response = await fetch(`/api/clue-locations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        setClueLocations(prev => prev.filter(clue => clue.id !== id));
        toast.success('Clue location deleted successfully');
      } else {
        toast.error('Failed to delete clue location');
      }
    } catch (error) {
      console.error('Error deleting clue location:', error);
      toast.error('Failed to delete clue location');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      latitude: 0,
      longitude: 0,
      address: '',
      difficulty: 'medium',
      category: '',
      hints: [''],
      solution: '',
      points: 10,
      radius: 50,
    });
    setEditingClue(null);
    setShowForm(false);
  };

  const addHint = () => {
    setFormData(prev => ({
      ...prev,
      hints: [...prev.hints, '']
    }));
  };

  const removeHint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== index)
    }));
  };

  const updateHint = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      hints: prev.hints.map((hint, i) => i === index ? value : hint)
    }));
  };

  const filteredClues = clueLocations.filter(clue => {
    const matchesSearch = clue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clue.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || clue.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || clue.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = [...new Set(clueLocations.map(clue => clue.category))];
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clue locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clue Locations</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and organize clue locations for your games
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {viewMode === 'list' ? <Map className="h-4 w-4 mr-2" /> : <List className="h-4 w-4 mr-2" />}
            {viewMode === 'list' ? 'Map View' : 'List View'}
          </button>
          <button
            onClick={fetchClueLocations}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredClues.length} of {clueLocations.length} locations</span>
          <div className="flex items-center space-x-2">
            <button className="text-blue-600 hover:text-blue-800">
              <Download className="h-4 w-4 mr-1 inline" />
              Export
            </button>
            <button className="text-blue-600 hover:text-blue-800">
              <Upload className="h-4 w-4 mr-1 inline" />
              Import
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        /* List View */
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredClues.map((clue) => (
              <li key={clue.id}>
                <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <MapPin className="h-10 w-10 text-blue-600" />
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{clue.name}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(clue.difficulty)}`}>
                            {clue.difficulty}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {clue.points} pts
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{clue.description}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-400 space-x-4">
                        <span>{clue.address}</span>
                        <span>{clue.category}</span>
                        <span>Used {clue.stats.timesUsed} times</span>
                        <span>{clue.stats.successRate.toFixed(1)}% success rate</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedClue(clue)}
                      className="text-gray-400 hover:text-gray-600"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(clue)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(clue.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        /* Map View */
        <div className="bg-white shadow rounded-lg p-6">
          <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Interactive map would be displayed here</p>
              <p className="text-sm text-gray-500 mt-2">
                Showing {filteredClues.length} clue locations on the map
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingClue ? 'Edit Clue Location' : 'Add New Clue Location'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Points</label>
                    <input
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                      min="1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Radius (meters)</label>
                    <input
                      type="number"
                      value={formData.radius}
                      onChange={(e) => setFormData(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                      min="1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hints</label>
                  {formData.hints.map((hint, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={hint}
                        onChange={(e) => updateHint(index, e.target.value)}
                        placeholder={`Hint ${index + 1}`}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      {formData.hints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHint(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addHint}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Another Hint
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Solution</label>
                  <input
                    type="text"
                    value={formData.solution}
                    onChange={(e) => setFormData(prev => ({ ...prev, solution: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingClue ? 'Update Location' : 'Create Location'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {selectedClue && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{selectedClue.name}</h3>
              <button
                onClick={() => setSelectedClue(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Category</p>
                  <p>{selectedClue.category}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Difficulty</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(selectedClue.difficulty)}`}>
                    {selectedClue.difficulty}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Points</p>
                  <p>{selectedClue.points}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Radius</p>
                  <p>{selectedClue.radius}m</p>
                </div>
              </div>
              
              <div>
                <p className="font-medium text-gray-700 mb-2">Description</p>
                <p className="text-gray-600">{selectedClue.description}</p>
              </div>
              
              <div>
                <p className="font-medium text-gray-700 mb-2">Address</p>
                <p className="text-gray-600">{selectedClue.address}</p>
              </div>
              
              <div>
                <p className="font-medium text-gray-700 mb-2">Hints</p>
                <ul className="list-disc list-inside text-gray-600">
                  {selectedClue.hints.map((hint, index) => (
                    <li key={index}>{hint}</li>
                  ))}
                </ul>
              </div>
              
              {selectedClue.solution && (
                <div>
                  <p className="font-medium text-gray-700 mb-2">Solution</p>
                  <p className="text-gray-600">{selectedClue.solution}</p>
                </div>
              )}
              
              <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{selectedClue.stats.timesUsed}</p>
                  <p className="text-xs text-gray-500">Times Used</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{selectedClue.stats.averageFindTime.toFixed(1)}min</p>
                  <p className="text-xs text-gray-500">Avg Find Time</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{selectedClue.stats.successRate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{selectedClue.stats.averageRating.toFixed(1)}/5</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}