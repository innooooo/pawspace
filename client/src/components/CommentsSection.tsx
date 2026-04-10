import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../api'
import { Avatar } from './Avatar'
import { useAuth } from '../hooks/useAuth'

interface Comment {
  id: string
  pet_id: string
  user_id: string
  parent_id: string | null
  body: string
  created_at: string
  updated_at: string
  author_name: string
  author_avatar: string | null
  replies: Comment[]
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

interface CommentItemProps {
  comment: Comment
  petId: string
  onDelete: (id: string) => void
  onReplyAdded: (reply: Comment, parentId: string) => void
  depth?: number
}

function CommentItem({ comment, petId, onDelete, onReplyAdded, depth = 0 }: CommentItemProps) {
  const { user, token } = useAuth()
  const [replying, setReplying] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [replyErr, setReplyErr] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isOwn = user?.id === comment.user_id

  const submitReply = async () => {
    if (!replyBody.trim()) return
    setReplyLoading(true)
    setReplyErr(null)
    try {
      const res = await api.post(`/api/pets/${petId}/comments`, {
        body: replyBody.trim(),
        parent_id: comment.id,
      })
      onReplyAdded(res.data.data.comment, comment.id)
      setReplyBody('')
      setReplying(false)
    } catch (e) {
      setReplyErr(getErrorMessage(e))
    } finally {
      setReplyLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return
    setDeleting(true)
    try {
      await api.delete(`/api/comments/${comment.id}`)
      onDelete(comment.id)
    } catch (e) {
      alert(getErrorMessage(e))
      setDeleting(false)
    }
  }

  return (
    <div className={`flex gap-3 ${depth > 0 ? 'ml-8 mt-3' : ''}`}>
      <div className="shrink-0 mt-0.5">
        <Avatar name={comment.author_name} avatarUrl={comment.author_avatar} size={32} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-stone-50 dark:bg-gray-800 rounded-2xl px-3 py-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">
              {comment.author_name}
            </span>
            <span className="text-xs text-stone-400">{timeAgo(comment.created_at)}</span>
            {comment.created_at !== comment.updated_at && (
              <span className="text-xs text-stone-400 italic">(edited)</span>
            )}
          </div>
          <p className="text-sm text-stone-700 dark:text-stone-200 mt-0.5 whitespace-pre-wrap break-words">
            {comment.body}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-1 px-1">
          {token && depth === 0 && (
            <button
              type="button"
              onClick={() => setReplying((r) => !r)}
              className="text-xs font-semibold text-stone-500 hover:text-amber-700 dark:text-stone-400"
            >
              Reply
            </button>
          )}
          {isOwn && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs font-semibold text-stone-400 hover:text-red-600 dark:text-stone-500"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>

        {/* Reply box */}
        {replying && (
          <div className="mt-2 flex gap-2">
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write a reply…"
              rows={2}
              maxLength={1000}
              className="flex-1 text-sm border border-stone-300 dark:border-gray-600 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={submitReply}
                disabled={replyLoading || !replyBody.trim()}
                className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
              >
                {replyLoading ? '…' : 'Send'}
              </button>
              <button
                type="button"
                onClick={() => { setReplying(false); setReplyBody('') }}
                className="px-3 py-1.5 text-xs text-stone-500 rounded-xl hover:bg-stone-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {replyErr && <p className="text-xs text-red-600 mt-1">{replyErr}</p>}

        {/* Nested replies */}
        {comment.replies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            petId={petId}
            onDelete={onDelete}
            onReplyAdded={onReplyAdded}
            depth={depth + 1}
          />
        ))}
      </div>
    </div>
  )
}

export function CommentsSection({ petId }: { petId: string }) {
  const { user, token } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    try {
      const res = await api.get(`/api/pets/${petId}/comments`)
      setComments(res.data.data.comments)
    } catch (e) {
      // non-fatal
    } finally {
      setLoading(false)
    }
  }, [petId])

  useEffect(() => { fetchComments() }, [fetchComments])

  const submitComment = async () => {
    if (!body.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await api.post(`/api/pets/${petId}/comments`, { body: body.trim() })
      setComments((prev) => [...prev, res.data.data.comment])
      setBody('')
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (deletedId: string) => {
    setComments((prev) =>
      prev
        .filter((c) => c.id !== deletedId)
        .map((c) => ({ ...c, replies: c.replies.filter((r) => r.id !== deletedId) }))
    )
  }

  const handleReplyAdded = (reply: Comment, parentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId ? { ...c, replies: [...c.replies, reply] } : c
      )
    )
  }

  const totalCount = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0)

  return (
    <section className="border-t border-stone-200 dark:border-gray-700 pt-6 space-y-4">
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
        Comments {totalCount > 0 && <span className="text-stone-400 font-normal text-base">({totalCount})</span>}
      </h2>

      {/* Comment input */}
      {token && user ? (
        <div className="flex gap-3">
          <div className="shrink-0 mt-0.5">
            <Avatar name={user.name} avatarUrl={user.avatar_url} size={32} />
          </div>
          <div className="flex-1 space-y-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a comment…"
              rows={2}
              maxLength={1000}
              className="w-full text-sm border border-stone-300 dark:border-gray-600 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 dark:bg-gray-700 dark:text-white"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="button"
              onClick={submitComment}
              disabled={submitting || !body.trim()}
              className="min-h-[40px] px-4 bg-amber-500 text-white text-sm font-semibold rounded-xl disabled:opacity-50 active:bg-amber-600"
            >
              {submitting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-stone-500 dark:text-stone-400">
          <Link to="/login" className="font-semibold text-amber-700 underline">Log in</Link> to leave a comment.
        </p>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-stone-200 rounded w-1/4" />
                <div className="h-10 bg-stone-100 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-4">
          No comments yet. Be the first to say something 🐾
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              petId={petId}
              onDelete={handleDelete}
              onReplyAdded={handleReplyAdded}
            />
          ))}
        </div>
      )}
    </section>
  )
}