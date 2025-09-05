const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validateRequest, reviewSchema } = require('../middleware/validation');

// Create a review
router.post('/', auth, validateRequest(reviewSchema), async (req, res) => {
  try {
    const { rideId, rating, comment, tags, isAnonymous } = req.body;
    
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    // Determine reviewer and reviewee
    const isRider = ride.rider.toString() === req.user._id.toString();
    const reviewer = req.user._id;
    const reviewee = isRider ? ride.driver : ride.rider;
    const reviewerModel = isRider ? 'User' : 'Driver';
    const revieweeModel = isRider ? 'Driver' : 'User';

    // Check if review already exists
    const existingReview = await Review.findOne({ ride: rideId, reviewer });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Review already exists for this ride' });
    }

    const review = new Review({
      ride: rideId,
      reviewer,
      reviewerModel,
      reviewee,
      revieweeModel,
      rating,
      comment,
      tags,
      isAnonymous
    });

    await review.save();

    // Update average rating for reviewee
    const reviews = await Review.find({ reviewee, isPublic: true });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const count = reviews.length;

    if (revieweeModel === 'User') {
      await User.findByIdAndUpdate(reviewee, { rating: { average: avgRating, count } });
    } else {
      await Driver.findByIdAndUpdate(reviewee, { rating: { average: avgRating, count } });
    }

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get reviews for a user/driver
router.get('/:model/:id', async (req, res) => {
  try {
    const { model, id } = req.params;
    const reviews = await Review.find({ 
      reviewee: id, 
      revieweeModel: model.charAt(0).toUpperCase() + model.slice(1),
      isPublic: true 
    })
    .populate('reviewer', 'firstName lastName profilePicture')
    .populate('ride', 'pickup dropoff')
    .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark review as helpful
router.put('/:reviewId/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const userId = req.user._id.toString();
    const helpfulIndex = review.helpful.users.findIndex(id => id.toString() === userId);

    if (helpfulIndex === -1) {
      review.helpful.users.push(req.user._id);
      review.helpful.count += 1;
    } else {
      review.helpful.users.splice(helpfulIndex, 1);
      review.helpful.count -= 1;
    }

    await review.save();
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
