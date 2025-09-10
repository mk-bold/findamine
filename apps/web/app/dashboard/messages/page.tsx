'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, Heart, Send, Users, Globe, Gamepad2, Plus, Search, Filter, ChevronDown, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  likes: {
    id: string;
    userId: string;
  }[];
  _count: {
    likes: number;
  };
  scope: 'GLOBAL' | 'GAME' | 'TEAM';
  scopeId?: string; // gameId for GAME scope, teamId for TEAM scope
  scopeInfo?: {
    name: string; // game name or team name
  };
}

type MessageScope = 'all' | 'global' | 'game' | 'team';

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedScope, setSelectedScope] = useState<MessageScope>('all');
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [games, setGames] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    fetchMessages();
    fetchGames();
    fetchTeams();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [messages, selectedScope, selectedGame, selectedTeam, searchKeyword]);

  const fetchMessages = async () => {
    try {
      // Mock messages data with different scopes
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Just found the most amazing hidden treasure spot downtown! The view from up there is incredible 🏆',
          createdAt: '2024-01-15T14:30:00Z',
          author: {
            id: 'u1',
            firstName: 'Sarah',
            lastName: 'Mitchell',
            email: 'sarah@example.com',
          },
          likes: [
            { id: 'l1', userId: 'u2' },
            { id: 'l2', userId: 'u3' },
            { id: 'l3', userId: 'u4' },
            { id: 'l4', userId: 'u5' },
            { id: 'l5', userId: 'u6' },
          ],
          _count: { likes: 5 },
          scope: 'GLOBAL',
          scopeInfo: { name: 'Global Community' },
        },
        {
          id: '2',
          content: 'Anyone else struggling with the clue near the library? I think I\'m missing something obvious 🤔',
          createdAt: '2024-01-15T12:15:00Z',
          author: {
            id: 'u2',
            firstName: 'Alex',
            lastName: 'Chen',
            email: 'alex@example.com',
          },
          likes: [
            { id: 'l6', userId: 'u1' },
            { id: 'l7', userId: 'u3' },
          ],
          _count: { likes: 2 },
          scope: 'GAME',
          scopeId: 'g1',
          scopeInfo: { name: 'BYU Campus Adventure' },
        },
        {
          id: '3',
          content: 'Great teamwork everyone! We\'re in second place now. Let\'s keep pushing for that first place finish! 🚀',
          createdAt: '2024-01-15T11:45:00Z',
          author: {
            id: 'u3',
            firstName: 'Jordan',
            lastName: 'Davis',
            email: 'jordan@example.com',
          },
          likes: [
            { id: 'l8', userId: 'u4' },
            { id: 'l9', userId: 'u5' },
            { id: 'l10', userId: 'u6' },
            { id: 'l11', userId: 'u7' },
            { id: 'l12', userId: 'u8' },
            { id: 'l13', userId: 'u9' },
            { id: 'l14', userId: 'u10' },
            { id: 'l15', userId: 'u11' },
          ],
          _count: { likes: 8 },
          scope: 'TEAM',
          scopeId: 't1',
          scopeInfo: { name: 'The Treasure Hunters' },
        },
        {
          id: '4',
          content: 'New to Findamine and loving it! Any tips for beginners? The community here seems amazing 😊',
          createdAt: '2024-01-15T10:20:00Z',
          author: {
            id: 'u4',
            firstName: 'Emma',
            lastName: 'Wilson',
            email: 'emma@example.com',
          },
          likes: [
            { id: 'l16', userId: 'u1' },
            { id: 'l17', userId: 'u2' },
            { id: 'l18', userId: 'u3' },
          ],
          _count: { likes: 3 },
          scope: 'GLOBAL',
          scopeInfo: { name: 'Global Community' },
        },
        {
          id: '5',
          content: 'The weather is perfect for treasure hunting today! Who else is out exploring? ☀️',
          createdAt: '2024-01-15T09:15:00Z',
          author: {
            id: 'u5',
            firstName: 'Michael',
            lastName: 'Torres',
            email: 'michael@example.com',
          },
          likes: [
            { id: 'l19', userId: 'u1' },
            { id: 'l20', userId: 'u4' },
          ],
          _count: { likes: 2 },
          scope: 'GAME',
          scopeId: 'g2',
          scopeInfo: { name: 'Utah Valley Explorer' },
        },
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      // Mock games data for filter dropdown
      setGames([
        { id: 'g1', name: 'BYU Campus Adventure' },
        { id: 'g2', name: 'Utah Valley Explorer' },
      ]);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      // Mock teams data for filter dropdown
      setTeams([
        { id: 't1', name: 'The Treasure Hunters' },
        { id: 't2', name: 'Adventure Squad' },
      ]);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...messages];

    // Apply scope filter
    if (selectedScope !== 'all') {
      if (selectedScope === 'global') {
        filtered = filtered.filter(msg => msg.scope === 'GLOBAL');
      } else if (selectedScope === 'game') {
        if (selectedGame) {
          filtered = filtered.filter(msg => msg.scope === 'GAME' && msg.scopeId === selectedGame);
        } else {
          filtered = filtered.filter(msg => msg.scope === 'GAME');
        }
      } else if (selectedScope === 'team') {
        if (selectedTeam) {
          filtered = filtered.filter(msg => msg.scope === 'TEAM' && msg.scopeId === selectedTeam);
        } else {
          filtered = filtered.filter(msg => msg.scope === 'TEAM');
        }
      }
    }

    // Apply search filter
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(msg =>
        msg.content.toLowerCase().includes(keyword) ||
        msg.author.firstName?.toLowerCase().includes(keyword) ||
        msg.author.lastName?.toLowerCase().includes(keyword) ||
        msg.scopeInfo?.name.toLowerCase().includes(keyword)
      );
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredMessages(filtered);
  };

  const postMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setIsPosting(true);
      
      // Determine scope based on current filter
      let scope: 'GLOBAL' | 'GAME' | 'TEAM' = 'GLOBAL';
      let scopeId: string | undefined;
      let scopeInfo: { name: string } | undefined;

      if (selectedScope === 'game' && selectedGame) {
        scope = 'GAME';
        scopeId = selectedGame;
        scopeInfo = { name: games.find(g => g.id === selectedGame)?.name || 'Unknown Game' };
      } else if (selectedScope === 'team' && selectedTeam) {
        scope = 'TEAM';
        scopeId = selectedTeam;
        scopeInfo = { name: teams.find(t => t.id === selectedTeam)?.name || 'Unknown Team' };
      } else {
        scope = 'GLOBAL';
        scopeInfo = { name: 'Global Community' };
      }

      // Mock posting - in real app this would be an API call
      const newMsg: Message = {
        id: Date.now().toString(),
        content: newMessage,
        createdAt: new Date().toISOString(),
        author: {
          id: user?.id || 'current-user',
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email || 'user@example.com',
        },
        likes: [],
        _count: { likes: 0 },
        scope,
        scopeId,
        scopeInfo,
      };

      setMessages(prev => [newMsg, ...prev]);
      setNewMessage('');
      toast.success('Message posted successfully!');
    } catch (error) {
      console.error('Error posting message:', error);
      toast.error('Failed to post message');
    } finally {
      setIsPosting(false);
    }
  };

  const toggleLike = async (messageId: string) => {
    try {
      // Mock like toggle - in real app this would be an API call
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const userLiked = msg.likes.some(like => like.userId === user?.id);
          const newLikes = userLiked
            ? msg.likes.filter(like => like.userId !== user?.id)
            : [...msg.likes, { id: Date.now().toString(), userId: user?.id || 'current-user' }];
          
          return {
            ...msg,
            likes: newLikes,
            _count: { likes: newLikes.length },
          };
        }
        return msg;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'GLOBAL':
        return <Globe className="h-4 w-4" />;
      case 'GAME':
        return <Gamepad2 className="h-4 w-4" />;
      case 'TEAM':
        return <Users className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'GLOBAL':
        return 'text-blue-600 bg-blue-50';
      case 'GAME':
        return 'text-green-600 bg-green-50';
      case 'TEAM':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages & Chat</h1>
            <p className="mt-1 text-sm text-gray-500">Connect with the Findamine community.</p>
          </div>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages & Chat</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect with the Findamine community across games and teams.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Scope Filter */}
            <select
              value={selectedScope}
              onChange={(e) => {
                setSelectedScope(e.target.value as MessageScope);
                setSelectedGame('');
                setSelectedTeam('');
              }}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Messages</option>
              <option value="global">Global Community</option>
              <option value="game">Game Specific</option>
              <option value="team">Team/Group</option>
            </select>

            {/* Game Filter */}
            {selectedScope === 'game' && (
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Games</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
            )}

            {/* Team Filter */}
            {selectedScope === 'team' && (
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Teams</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Post New Message */}
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Share with the Community</h3>
          <div className="flex flex-col gap-4">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="What's on your mind? Share your treasure hunting adventures, tips, or questions..."
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {selectedScope === 'game' && selectedGame && (
                  <span className="inline-flex items-center gap-1">
                    <Gamepad2 className="h-4 w-4" />
                    Posting to: {games.find(g => g.id === selectedGame)?.name}
                  </span>
                )}
                {selectedScope === 'team' && selectedTeam && (
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Posting to: {teams.find(t => t.id === selectedTeam)?.name}
                  </span>
                )}
                {(selectedScope === 'all' || selectedScope === 'global' || (!selectedGame && !selectedTeam)) && (
                  <span className="inline-flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    Posting to: Global Community
                  </span>
                )}
              </div>
              <button
                onClick={postMessage}
                disabled={!newMessage.trim() || isPosting}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  newMessage.trim() && !isPosting
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="h-4 w-4 mr-2" />
                {isPosting ? 'Posting...' : 'Post Message'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      {filteredMessages.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {messages.length === 0 ? 'No messages yet' : 'No messages match your filters'}
          </h3>
          <p className="text-gray-600 mb-6">
            {messages.length === 0 
              ? "Be the first to share something with the community!"
              : "Try adjusting your filters to see more messages."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div key={message.id} className="card hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">
                        {message.author.firstName ? message.author.firstName[0] : message.author.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {message.author.firstName && message.author.lastName 
                          ? `${message.author.firstName} ${message.author.lastName}`
                          : message.author.email
                        }
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{formatDate(message.createdAt)}</span>
                        <span>•</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getScopeColor(message.scope)}`}>
                          {getScopeIcon(message.scope)}
                          {message.scopeInfo?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-gray-900 mb-4 leading-relaxed">
                  {message.content}
                </p>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleLike(message.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      message.likes.some(like => like.userId === user?.id)
                        ? 'text-red-600 bg-red-50 hover:bg-red-100'
                        : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${
                      message.likes.some(like => like.userId === user?.id) ? 'fill-current' : ''
                    }`} />
                    {message._count.likes}
                    {message._count.likes === 1 ? ' Like' : ' Likes'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}