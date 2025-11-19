// src/components/Commentar.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db, commentsEnabled } from "../firebase-comment";
import {
  MessageCircle,
  UserCircle2,
  Loader2,
  AlertCircle,
  Send,
  Pin,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

interface CommentData {
  id: string;
  content: string;
  userName: string;
  isAdmin: boolean;
  isPinned: boolean;
  createdAt: Timestamp | null;
}

interface CommentProps {
  comment: CommentData;
  formatDate: (timestamp: Timestamp | null) => string;
}

const Comment = memo(({ comment, formatDate }: CommentProps) => (
  <div
    className={`px-4 pt-4 pb-2 rounded-xl border transition-all group hover:shadow-lg hover:-translate-y-0.5 ${comment.isPinned
      ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-400/50"
      : "bg-white/5 border-white/10 hover:bg-white/10"
      }`}
  >
    {comment.isPinned && (
      <div className="flex items-center gap-2 mb-2 px-2 py-1 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-medium w-fit">
        <Pin className="w-3 h-3" />
        <span>PINNED COMMENT</span>
      </div>
    )}

    <div className="flex items-start gap-3">
      <div
        className={`p-2 rounded-full text-indigo-400 group-hover:bg-indigo-500/30 transition-colors ${comment.isPinned ? "bg-indigo-500/40" : "bg-indigo-500/20"
          }`}
      >
        <UserCircle2 className="w-5 h-5" />
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-white truncate">
              {comment.userName}
            </h4>
            {comment.isAdmin && (
              <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                Admin
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-gray-300 text-sm break-words leading-relaxed relative bottom-2">
          {comment.content}
        </p>
      </div>
    </div>
  </div>
));

Comment.displayName = "Comment";

interface CommentFormProps {
  onSubmit: (data: { newComment: string; userName: string }) => void;
  isSubmitting: boolean;
}

const MIN_COMMENT_LENGTH = 10;
const MAX_COMMENT_LENGTH = 400;
const WARNING_THRESHOLD = 350;
const MAX_NAME_LENGTH = 50;

// Security: Sanitize input to prevent XSS
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML/script injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim();
};

// Validate input doesn't contain suspicious patterns
const isValidInput = (input: string): boolean => {
  const suspiciousPatterns = [
    /<script/i,
    /<iframe/i,
    /javascript:/i,
    /on\w+=/i,
    /eval\(/i,
    /fetch\(/i,
    /\.(key|token|password)/i,
    /collect-keys/i,
    /data:/i,
  ];
  return !suspiciousPatterns.some(pattern => pattern.test(input));
};

const CommentForm = memo(({ onSubmit, isSubmitting }: CommentFormProps) => {
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remainingChars = MAX_COMMENT_LENGTH - newComment.length;
  const isNearLimit = remainingChars <= (MAX_COMMENT_LENGTH - WARNING_THRESHOLD);
  const isTooShort = newComment.trim().length > 0 && newComment.trim().length < MIN_COMMENT_LENGTH;

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_COMMENT_LENGTH) {
      setNewComment(value);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedComment = newComment.trim();

      if (!trimmedComment || !userName.trim()) return;
      if (trimmedComment.length < MIN_COMMENT_LENGTH) return;

      onSubmit({ newComment: trimmedComment, userName: userName.trim() });
      setNewComment("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    },
    [newComment, userName, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2" data-aos="fade-up" data-aos-duration="1000">
        <label className="block text-sm font-medium text-white">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          required
        />
      </div>

      <div className="space-y-2" data-aos="fade-up" data-aos-duration="1200">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-white">
            Message <span className="text-red-400">*</span>
          </label>
          <span className={`text-xs font-medium transition-colors ${remainingChars < 0
              ? "text-red-400"
              : isNearLimit
                ? "text-yellow-400"
                : "text-gray-400"
            }`}>
            {remainingChars} / {MAX_COMMENT_LENGTH}
          </span>
        </div>
        <textarea
          ref={textareaRef}
          value={newComment}
          onChange={handleTextareaChange}
          placeholder="Write your message here..."
          className={`w-full p-4 rounded-xl bg-white/5 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none min-h-[120px] ${remainingChars < 0
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : isNearLimit
                ? "border-yellow-500/50 focus:border-yellow-500 focus:ring-yellow-500/20"
                : "border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20"
            }`}
          required
        />
        {isTooShort && (
          <p className="text-xs text-yellow-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Minimum {MIN_COMMENT_LENGTH} characters required
          </p>
        )}
        {remainingChars < 0 && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Comment exceeds maximum length
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isTooShort || remainingChars < 0}
        data-aos="fade-up"
        data-aos-duration="1000"
        className="relative w-full h-12 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl font-medium text-white overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-300" />
        <div className="relative flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Post Comment</span>
            </>
          )}
        </div>
      </button>
    </form>
  );
});

CommentForm.displayName = "CommentForm";

const Komentar = () => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    AOS.init({
      once: false,
      duration: 1000,
    });
  }, []);

  useEffect(() => {
    const commentsRef = collection(db, "portfolio-comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));

    return onSnapshot(q, (querySnapshot) => {
      const commentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CommentData[];

      const sortedComments = commentsData.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const aTime = a.createdAt?.toDate().getTime() ?? 0;
        const bTime = b.createdAt?.toDate().getTime() ?? 0;
        return bTime - aTime;
      });

      setComments(sortedComments);
    });
  }, []);

  const handleCommentSubmit = useCallback(async ({ newComment, userName }: { newComment: string; userName: string }) => {
    setError("");
    setIsSubmitting(true);

    try {
      if (!commentsEnabled) {
        throw new Error(
          "Firebase env not configured. Set NEXT_PUBLIC_FIREBASE_* vars in .env."
        );
      }
      await addDoc(collection(db, "portfolio-comments"), {
        content: newComment,
        userName,
        isAdmin: false,
        isPinned: false,
        createdAt: serverTimestamp(),
      });
    } catch (error: unknown) {
      const errorObj = error as Record<string, unknown>;
      const msg =
        errorObj?.code === "permission-denied"
          ? "Permission denied. Check Firestore rules and authenticated access."
          : (errorObj?.message as string)?.includes("env")
            ? "Komentar tidak tersedia: konfigurasi Firebase belum diatur."
            : "Failed to post comment. Please try again.";
      setError(msg);
      console.error("Error adding comment: ", error);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const formatDate = useCallback((timestamp: Timestamp | null) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }, []);

  const pinnedComments = comments.filter((comment) => comment.isPinned);

  return (
    <div
      className="w-full bg-gradient-to-b from-white/10 to-white/5 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <div
        className="p-6 border-b border-white/10"
        data-aos="fade-down"
        data-aos-duration="800"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20">
            <MessageCircle className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">
            Comments{" "}
            <span className="text-indigo-400">({comments.length})</span>
            {pinnedComments.length > 0 && (
              <span className="text-xs text-indigo-300 ml-2">
                • {pinnedComments.length} pinned
              </span>
            )}
          </h3>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {error && (
          <div
            className="flex items-center gap-2 p-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl"
            data-aos="fade-in"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div>
          <CommentForm
            onSubmit={handleCommentSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        <div
          className="space-y-4 h-[500px] overflow-y-auto custom-scrollbar"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          {comments.length === 0 ? (
            <div className="text-center py-8" data-aos="fade-in">
              <UserCircle2 className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-50" />
              <p className="text-gray-400">
                No comments yet. Start the conversation!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                formatDate={formatDate}
              />
            ))
          )}
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
      `}</style>
    </div>
  );
};

export default Komentar;