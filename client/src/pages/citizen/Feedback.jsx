import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { MdStar, MdStarBorder, MdFeedback } from 'react-icons/md';

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error('Please select a rating');
    
    setTimeout(() => {
      setSubmitted(true);
      toast.success('Feedback submitted successfully');
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto w-full bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-12 text-center min-w-0">
        <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6 shrink-0">
          <MdFeedback size={40} />
        </div>
        <h2 className="text-2xl font-bold text-secondary mb-4 block w-full">Thank You!</h2>
        <p className="text-muted mb-8 mx-auto block w-full">Your feedback helps us improve our municipality services and serve you better in the future.</p>
        <button 
          onClick={() => {setSubmitted(false); setRating(0); setComment('');}}
          className="px-6 py-2 border border-border text-secondary font-medium rounded-[var(--radius-btn)] hover:bg-surface transition-colors"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full min-w-0">
      <h1 className="text-2xl font-bold text-secondary mb-6 block w-full">Post-Service Feedback</h1>
      
      <div className="bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-8 min-w-0 w-full">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-8 text-center w-full">
            <h3 className="text-lg font-semibold text-secondary mb-4 block w-full">How would you rate your experience today?</h3>
            <div className="flex justify-center space-x-2 w-full">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-4xl transition-colors focus:outline-none ${
                    star <= (hover || rating) ? 'text-warning' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  {star <= (hover || rating) ? <MdStar /> : <MdStarBorder />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6 w-full text-left">
            <label className="block text-sm font-medium text-secondary mb-2 w-full">Additional Comments (Optional)</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4" 
              className="w-full p-4 border border-border rounded-[var(--radius-input)] focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none bg-white"
              placeholder="Tell us what you liked or what we could improve..."
            ></textarea>
          </div>
          
          <button 
            type="submit"
            className="w-full py-3 bg-primary text-white font-bold rounded-[var(--radius-btn)] hover:bg-primary/90 transition-colors shadow-md"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
