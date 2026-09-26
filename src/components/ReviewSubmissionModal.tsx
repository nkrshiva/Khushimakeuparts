import React, { useState } from 'react';
import { X, Star, Sparkles, Upload, CheckCircle2, AlertCircle, Camera, Heart } from 'lucide-react';
import { mediaService } from '../services/media/MediaService';
import { useSiteContent } from '../context/ContentContext';
import { ReviewSubmissionItem } from '../types';

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({ isOpen, onClose }) => {
  const { content, addPendingReview } = useSiteContent();
  const brand = content.brand;

  const [clientName, setClientName] = useState('');
  const [ceremony, setCeremony] = useState('Royal Bridal Wedding');
  const [eventDate, setEventDate] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  // Handle Photo File Upload via MediaService
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!mediaService.isAvailable()) {
      setError('Storage is unavailable. You may paste an image URL instead.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const downloadUrl = await mediaService.uploadReviewPhoto(file, (progress) => {
        setUploadProgress(progress);
      });
      setPhotoUrl(downloadUrl);
    } catch {
      setError('Failed to upload photo. You can paste an image URL directly.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clientName.trim() || !reviewText.trim()) {
      setError('Please provide your name and your review experience.');
      return;
    }

    setIsSubmitting(true);

    const newSubmission: ReviewSubmissionItem = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      clientName: clientName.trim(),
      ceremony,
      eventDate: eventDate.trim() || 'Recent Wedding',
      rating,
      reviewText: reviewText.trim(),
      photoUrl: photoUrl.trim() || undefined,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    try {
      const success = await addPendingReview(newSubmission);
      if (success) {
        setIsSubmitting(false);
        setIsSubmitted(true);
      } else {
        throw new Error('Could not submit your review. Please try again.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Failed to submit review. Please try again.');
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setClientName('');
    setReviewText('');
    setPhotoUrl('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#1d0e15] border border-[#b89758]/40 shadow-2xl p-6 sm:p-8 text-[#fcecee] max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-[#b89758] flex items-center justify-center text-white shadow-xl shadow-emerald-900/40 animate-bounce">
              <Heart className="w-8 h-8 fill-current text-white" />
            </div>

            <span className="text-[10px] text-[#fed488] uppercase tracking-[0.25em] font-semibold">
              Review Submitted
            </span>
            <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium">
              Thank You, Beautiful Bride! ✨
            </h3>
            <p className="text-xs sm:text-sm text-[#dfc3c9] max-w-sm leading-relaxed">
              Your lovely words and wedding photo have been received with love. Once verified by {brand.founder || 'the studio'}, your review will be proudly featured on our real brides lookbook!
            </p>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="mt-4 px-8 py-3 rounded-full bg-gradient-to-r from-[#6c2e3e] to-[#b89758] text-white text-xs font-semibold uppercase tracking-wider shadow-lg hover:opacity-95 transition-opacity cursor-pointer border border-[#fed488]/40"
            >
              Return to Website
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6c2e3e] to-[#b89758] flex items-center justify-center mb-3 shadow-lg">
                <Sparkles className="w-6 h-6 text-[#fed488]" />
              </div>

              <span className="text-[10px] text-[#fed488] uppercase tracking-[0.25em] font-semibold">
                Real Brides Community
              </span>
              <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium mt-1">
                Share Your Bridal Experience
              </h3>
              <p className="text-xs text-[#dfc3c9] mt-1 max-w-sm leading-relaxed">
                Were you glammed by {brand.name}? Share your feedback and wedding day photos to inspire future brides.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Star Rating Selector */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/30 border border-white/10 mb-2">
                <span className="text-[11px] text-[#fed488] uppercase tracking-wider font-semibold mb-2">
                  Your Overall Rating
                </span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Bride Name */}
                <div>
                  <label className="text-[11px] text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Pooja Verma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white focus:outline-none focus:border-[#fed488]"
                  />
                </div>

                {/* Ceremony Type */}
                <div>
                  <label className="text-[11px] text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Ceremony / Look
                  </label>
                  <select
                    value={ceremony}
                    onChange={(e) => setCeremony(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white focus:outline-none focus:border-[#fed488] cursor-pointer"
                  >
                    <option value="Royal Bihari Bride" className="bg-[#1d0e15] text-white">Royal Bihari Bride</option>
                    <option value="Engagement & Ring Ceremony" className="bg-[#1d0e15] text-white">Engagement Ceremony</option>
                    <option value="Haldi & Sangeet" className="bg-[#1d0e15] text-white">Haldi &amp; Sangeet</option>
                    <option value="Cocktail Reception" className="bg-[#1d0e15] text-white">Cocktail Reception</option>
                    <option value="Party Glamour" className="bg-[#1d0e15] text-white">Party &amp; Guest Glam</option>
                  </select>
                </div>
              </div>

              {/* Event Date / Month */}
              <div>
                <label className="text-[11px] text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                  Wedding / Ceremony Date or Month
                </label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="e.g. February 2026 or 24 Nov 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white focus:outline-none focus:border-[#fed488]"
                />
              </div>

              {/* Review Experience Text */}
              <div>
                <label className="text-[11px] text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                  Your Experience / Review *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us how you felt, how long the makeup stayed fresh, compliments you received..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white focus:outline-none focus:border-[#fed488] resize-none"
                />
              </div>

              {/* Photo Upload or URL */}
              <div>
                <label className="text-[11px] text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                  Upload Wedding Photo / Selfie (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-dashed border-[#b89758]/50 hover:border-[#fed488] text-xs text-[#dfc3c9] flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    <Camera className="w-4 h-4 text-[#fed488]" />
                    <span>{isUploading ? `Uploading ${uploadProgress}%...` : photoUrl ? '✓ Photo Attached' : 'Choose Photo / Selfie'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>

                  {photoUrl && (
                    <img
                      src={photoUrl}
                      alt="Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-[#fed488]/40 shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6c2e3e] to-[#b89758] hover:opacity-95 text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-lg shadow-[#6c2e3e]/40 flex items-center justify-center gap-2 cursor-pointer border border-[#fed488]/40 mt-2"
              >
                <Heart className="w-4 h-4 text-[#fed488] fill-current" />
                <span>{isSubmitting ? 'Submitting Review...' : 'Submit Bride Review'}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
