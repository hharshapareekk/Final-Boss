'use client'

import { feedbackAPI, sessionAPI } from '@/lib/adminApi'
import {
  MessageSquare,
  Star,
  ThumbsDown,
  ThumbsUp,
  Users
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface StatCard {
  title: string
  value: string | number
  change: string
  icon: any
  color: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<StatCard[]>([])
  const [recentFeedback, setRecentFeedback] = useState<any[]>([])
  const [sessionMap, setSessionMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const [feedbackRes, sessions] = await Promise.all([
          feedbackAPI.getAll({ limit: 1000 }),
          sessionAPI.getSessions()
        ])
        const feedbacks = feedbackRes.data.data
        // Build sessionId -> name map
        const sessionMap: Record<string, string> = {}
        let sessionArr: any[] = [];
        const sess: any = sessions;
        if (Array.isArray(sess)) {
          sessionArr = sess;
        } else if (sess && Array.isArray(sess.sessions)) {
          sessionArr = sess.sessions;
        }
        sessionArr.forEach((s: any) => {
          sessionMap[s._id] = s.name
        })
        setSessionMap(sessionMap)
        // Filter out feedbacks with missing sessions
        const filteredFeedbacks = feedbacks.filter((f: any) => sessionMap[f.sessionId]);
        // Compute stats based on all valid feedbacks
        const total = filteredFeedbacks.length
        const positive = filteredFeedbacks.filter((f: any) => typeof f.rating === 'number' && f.rating >= 4).length
        const neutral = filteredFeedbacks.filter((f: any) => typeof f.rating === 'number' && f.rating === 3).length
        const negative = filteredFeedbacks.filter((f: any) => typeof f.rating === 'number' && f.rating > 0 && f.rating <= 2).length
        const avgRatingArr = filteredFeedbacks.filter((f: any) => typeof f.rating === 'number' && f.rating > 0)
        const avgRating = avgRatingArr.length > 0
          ? (avgRatingArr.reduce((sum: number, f: any) => sum + (f.rating || 0), 0) / avgRatingArr.length).toFixed(2)
          : 'N/A'
        setStats([
          {
            title: 'Total Feedbacks',
            value: total,
            change: '',
            icon: MessageSquare,
            color: 'bg-blue-500'
          },
          {
            title: 'Positive Reviews',
            value: positive,
            change: '',
            icon: ThumbsUp,
            color: 'bg-green-500'
          },
          {
            title: 'Neutral Reviews',
            value: neutral,
            change: '',
            icon: Star,
            color: 'bg-gray-400'
          },
          {
            title: 'Negative Reviews',
            value: negative,
            change: '',
            icon: ThumbsDown,
            color: 'bg-red-500'
          },
          {
            title: 'Average Rating',
            value: avgRating,
            change: '',
            icon: Star,
            color: 'bg-yellow-500'
          }
        ])
        // Sort by createdAt descending for recent feedback and limit to 8
        const sorted = [...filteredFeedbacks].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setRecentFeedback(sorted.slice(0, 8))
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch feedback')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">Error: {error}</div>

  return (
    <div className="space-y-6 text-black">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Dashboard</h1>
          <p className="text-black mt-2">Overview of your feedback portal</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Total Feedbacks</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentFeedback.map((feedback, idx) => (
            <div key={feedback._id || idx} className="px-6 py-6 flex flex-col md:flex-row md:items-start gap-6 bg-gray-50 rounded-xl shadow-sm my-4">
              {/* User & Session Info */}
              <div className="flex flex-col items-center md:items-start md:w-1/4">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-700 mb-2">
                  {feedback.email?.[0]?.toUpperCase() || <Users className="w-7 h-7 text-blue-700" />}
                </div>
                <div className="text-center md:text-left">
                  <div className="text-base font-semibold text-gray-900">{feedback.email}</div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(feedback.createdAt).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                </div>
                {/* Only show star rating here, not below */}
                <div className="mt-2 flex items-center gap-1">
                  {feedback.rating === 0 ? (
                    <span className="text-red-600 font-bold">MISSED SESSION</span>
                  ) : (
                    [...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-7 h-7 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} font-bold`} />
                    ))
                  )}
                </div>
              </div>
              {/* Feedback Content */}
              <div className="flex-1">
                <div className="mb-2">
                  <span className="font-bold text-blue-700">Session:</span> <span className="font-semibold text-gray-800">{sessionMap[feedback.sessionId] || 'Deleted Session'}</span>
                </div>
                <div className="mb-2">
                  <span className="font-bold text-gray-700">Answers:</span>
                  <div className="mt-2 space-y-3">
                    {feedback.rating === 0 && feedback.message ? (
                      (() => {
                        // Try to split the message into reason and interest
                        const [reasonPart, interestPart] = feedback.message.split('|').map((s: string) => s.trim());
                        return (
                          <div className="space-y-1">
                            {reasonPart && (
                              <div><span className="font-semibold text-red-600">Reason for missing:</span> <span className="text-gray-800">{reasonPart.replace('Reason for missing:', '').trim()}</span></div>
                            )}
                            {interestPart && (
                              <div><span className="font-semibold text-red-600">Interest in future sessions:</span> <span className="text-gray-800">{interestPart.replace('Interest in future sessions:', '').trim()}</span></div>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      feedback.answers && typeof feedback.answers === 'object' &&
                      (Array.isArray(feedback.answers.positive) || Array.isArray(feedback.answers.negative)) &&
                      ([...(feedback.answers.positive || []), ...(feedback.answers.negative || [])].length > 0 ? (
                        <ul className="space-y-4 ml-2">
                          {[...(feedback.answers.positive || []), ...(feedback.answers.negative || [])].map((qa: any, i: number) => (
                            <li key={i} className="mb-2">
                              <div className="font-semibold text-gray-800 mb-1">{qa.question}</div>
                              <div className="text-gray-700 ml-2">{qa.answer}</div>
                            </li>
                          ))}
                        </ul>
                      ) : null)
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}