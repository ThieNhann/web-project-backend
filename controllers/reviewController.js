import db from '../config/db.js';

// Post review
export const postReview = async (req, res) => {
    const { game_id, rating, comment } = req.body;
    
    if (!game_id || !rating || rating < 1 || rating > 5) {          // Chưa biết nên validate sao nên cứ tạm thế này nhé
        return res.status(400).json({ message: 'Invalid review.' });
    }

    try {
        const [id] = await db('reviews').insert({
            user_id: req.user.userId,
            game_id,
            rating,
            comment
        }).returning('id');

        res.status(201).json({ success: true, review_id: id });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error sending review.' });
    }
};

// Lấy tất cả đánh giá của một game
export const getGameReviews = async (req, res) => {
    const { gameId } = req.params;                                  // URL
    try {
        const reviews = await db('reviews')
            .join('users', 'reviews.user_id', 'users.id')
            .where('game_id', gameId)
            .select('reviews.*', 'users.username', 'users.avatar_url')
            .orderBy('created_at', 'desc');

        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching reviews.' });
    }
};

export const deleteReview = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    try {
        const review = await db('reviews')
            .where({ id })
            .first();

        if (!review) {
            return res.status(404).json({ success: false, message: 'No reviews found.' });
        }

        if (review.user_id !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to delete this review.' 
            });
        }

        await db('reviews').where({ id }).del();

        res.json({ success: true, message: 'Deleted review successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Lấy tất cả đánh giá của user đang đăng nhập
export const getMyReviews = async (req, res) => {
    try {
        const userId = req.user.userId; 

        const myReviews = await db('reviews')
            .join('games', 'reviews.game_id', 'games.id')
            .where('reviews.user_id', userId)
            .select(
                'reviews.id',
                'reviews.rating',
                'reviews.comment',
                'reviews.created_at',
                'games.name as game_name',
                'games.code as game_code'
            )
            .orderBy('reviews.created_at', 'desc');

        res.json({
            success: true,
            data: myReviews
        });
    } catch (error) {
        console.error('Error fetching my reviews:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error.' 
        });
    }
};