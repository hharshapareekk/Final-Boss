'use client'

import { feedbackAPI } from '@/lib/adminApi'
import { Dialog } from '@headlessui/react'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Star
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface Feedback {
  _id: string;
  session: { name: string };
  user: { name: string; email: string; };
  rating: number;
  message: string;
  submittedAt?: string;
  createdAt?: string;
  status: 'pending' | 'in-progress' | 'resolved'
}

export default function FeedbackList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newFeedback, setNewFeedback] = useState({
    name: '',
    email: '',
    rating: 5,
    message: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'pending',
    category: 'Service',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [ratingFilter, setRatingFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [dateSortOrder, setDateSortOrder] = useState<'asc' | 'desc' | null>(null)
  const [viewedFeedback, setViewedFeedback] = useState<any | null>(null)

  const fetchFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await feedbackAPI.getAll();
      setFeedback(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const filteredFeedback = feedback
    .filter(item => {
      const sessionName = item.session?.name || '';
      const matchesSearch = sessionName.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesRating = true;
      if (ratingFilter === '5') matchesRating = item.rating === 5;
      else if (ratingFilter === '4') matchesRating = item.rating === 4;
      else if (ratingFilter === '3') matchesRating = item.rating === 3;
      else if (ratingFilter === 'below3') matchesRating = item.rating < 3;
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      if (dateSortOrder) {
        // Sort by date
        const dateA = new Date(a.createdAt || a.submittedAt || 0).getTime();
        const dateB = new Date(b.createdAt || b.submittedAt || 0).getTime();
        return dateSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      // Default: sort by rating
      return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
    })
    .slice(0, 10); // Limit to most recent 10 reviews

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green" />
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="space-y-6 text-black">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Feedback Management</h1>
          <p className="text-black mt-2">Manage and respond to customer feedback</p>
        </div>
      </div>

      {/* Modal for new feedback */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6 z-20">
            <Dialog.Title className="text-lg font-bold mb-4">Add New Feedback</Dialog.Title>
            <form
              onSubmit={async e => {
                e.preventDefault()
                setLoading(true)
                setError('')
                try {
                  await feedbackAPI.create(newFeedback)
                  setIsModalOpen(false)
                  setNewFeedback({
                    name: '',
                    email: '',
                    rating: 5,
                    message: '',
                    date: new Date().toISOString().slice(0, 10),
                    status: 'pending',
                    category: 'Service',
                  })
                  fetchFeedback();
                } catch (err: any) {
                  setError(err.response?.data?.message || 'Failed to submit feedback')
                } finally {
                  setLoading(false)
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input type="text" className="w-full border px-3 py-2 rounded" required value={newFeedback.name} onChange={e => setNewFeedback(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input type="email" className="w-full border px-3 py-2 rounded" required value={newFeedback.email} onChange={e => setNewFeedback(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium">Rating</label>
                <select className="w-full border px-3 py-2 rounded" value={newFeedback.rating} onChange={e => setNewFeedback(f => ({ ...f, rating: Number(e.target.value) }))}>
                  {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Category</label>
                <select className="w-full border px-3 py-2 rounded" value={newFeedback.category} onChange={e => setNewFeedback(f => ({ ...f, category: e.target.value }))}>
                  <option value="Service">Service</option>
                  <option value="Product">Product</option>
                  <option value="Support">Support</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Status</label>
                <select className="w-full border px-3 py-2 rounded" value={newFeedback.status} onChange={e => setNewFeedback(f => ({ ...f, status: e.target.value as any }))}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In-progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Message</label>
                <textarea className="w-full border px-3 py-2 rounded" required value={newFeedback.message} onChange={e => setNewFeedback(f => ({ ...f, message: e.target.value }))} />
              </div>
              {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
              <div className="flex justify-end">
                <button type="button" className="mr-2 px-4 py-2 rounded bg-gray-200" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading ? 'Adding...' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 text-black">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-black">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by session name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
            />
          </div>
          <button
            className={`px-4 py-2 rounded-lg border border-gray-300 flex items-center justify-center ${dateSortOrder ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-black'}`}
            onClick={() => setDateSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
            type="button"
            title="Sort by date"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0-5l-4-4-4 4" /></svg>
            {dateSortOrder === 'asc' ? 'Oldest' : 'Newest'}
          </button>
          <select
            value={ratingFilter}
            onChange={e => setRatingFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="below3">Below 3</option>
          </select>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
            onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
            type="button"
            title="Sort by rating"
          >
            <Star className="w-4 h-4 mr-1 text-yellow-500" />
            {sortOrder === 'asc' ? 'Low-High' : 'High-Low'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden text-black">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Session</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredFeedback.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-black">{item.user.name}</div>
                      <div className="text-sm text-black">{item.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-black">{item.session.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {item.rating === 0 ? (
                      <span className="text-red-600 font-bold">MISSED SESSION</span>
                    ) : (
                      <>
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="ml-1 text-sm text-black">{item.rating}</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-black">{
                    (() => {
                      const dateStr = item.createdAt || item.submittedAt;
                      if (!dateStr) return 'N/A';
                      const dateObj = new Date(dateStr);
                      if (isNaN(dateObj.getTime())) return 'N/A';
                      return dateObj.toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
                    })()
                  }</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-primary-600 hover:text-primary-900 mr-4" onClick={() => setViewedFeedback(item)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Feedback Details Modal */}
      <Dialog open={!!viewedFeedback} onClose={() => setViewedFeedback(null)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto p-6 z-50 text-black">
            <Dialog.Title className="text-lg font-bold mb-4">Feedback Details</Dialog.Title>
            {viewedFeedback && (
              <div className="space-y-2">
                <div><span className="font-semibold">User Email:</span> {viewedFeedback.user?.email}</div>
                <div><span className="font-semibold">Session:</span> {viewedFeedback.session?.name}</div>
                <div><span className="font-semibold">Rating:</span> {viewedFeedback.rating === 0 ? <span className="text-red-600 font-bold ml-1">MISSED SESSION</span> : viewedFeedback.rating}</div>
                <div><span className="font-semibold">Date:</span> {
                  (() => {
                    const dateStr = viewedFeedback.createdAt || viewedFeedback.submittedAt;
                    if (!dateStr) return 'N/A';
                    const dateObj = new Date(dateStr);
                    if (isNaN(dateObj.getTime())) return 'N/A';
                    return dateObj.toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
                  })()
                }</div>
                {viewedFeedback.rating === 0 && viewedFeedback.message ? (
                  (() => {
                    const [reasonPart, interestPart] = viewedFeedback.message.split('|').map((s: string) => s.trim());
                    return (
                      <div className="space-y-1 mt-2">
                        {reasonPart && (
                          <div><span className="font-semibold text-red-600">Reason for missing:</span> <span className="text-gray-800">{reasonPart.replace('Reason for missing:', '').trim()}</span></div>
                        )}
                        {interestPart && (
                          <div><span className="font-semibold text-red-600">Interest in future sessions:</span> <span className="text-gray-800">{interestPart.replace('Interest in future sessions:', '').trim()}</span></div>
                        )}
                      </div>
                    );
                  })()
                ) : viewedFeedback.answers && (
                  <div>
                    <div className="font-semibold mt-2">Answers:</div>
                    <ul className="list-disc ml-6 mt-1">
                      {Object.entries(viewedFeedback.answers).flatMap(([cat, arr]: any) =>
                        Array.isArray(arr) ? arr.map((qa: any, i: number) => (
                          <li key={cat + i} className="mb-1">
                            <span className="font-semibold">{qa.question}:</span> {qa.answer}
                          </li>
                        )) : []
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setViewedFeedback(null)}>Close</button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
} 