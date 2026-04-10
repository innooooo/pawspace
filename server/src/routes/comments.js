const router = require('express').Router({ mergeParams: true });
const { requireAuth } = require('../middleware/auth');
const {
  listComments,
  addComment,
  deleteComment,
  editComment,
} = require('../controllers/commentsController');

// Mounted at /api/pets/:id/comments and /api/comments
router.get('/', listComments);
router.post('/', requireAuth, addComment);
router.patch('/:commentId', requireAuth, editComment);
router.delete('/:commentId', requireAuth, deleteComment);

module.exports = router;