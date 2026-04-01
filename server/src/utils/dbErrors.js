/**
 * Map PostgreSQL errors to safe client messages (no raw DB text).
 */

function mapPgError(err) {
  const code = err && err.code;

  if (code === '23505') {
    const constraint = err.constraint || '';
    if (constraint.includes('email') || err.detail?.includes('email')) {
      return { status: 409, message: 'An account with this email already exists.' };
    }
    if (constraint.includes('phone') || err.detail?.includes('phone')) {
      return { status: 409, message: 'This phone number is already registered.' };
    }
    if (
      constraint.includes('adoption_interests_one_per_adopter_pet') ||
      err.detail?.includes('adoption_interests')
    ) {
      return { status: 409, message: 'You have already expressed interest in this pet.' };
    }
    if (
      constraint.includes('pet_likes_one_per_user_pet') ||
      err.detail?.includes('pet_likes')
    ) {
      return { status: 409, message: 'You have already liked this pet.' };
    }
    if (constraint.includes('pet_photos_one_primary')) {
      return { status: 409, message: 'Another photo is already set as primary for this pet.' };
    }
    return { status: 409, message: 'This action conflicts with existing data.' };
  }

  if (code === '23503') {
    return { status: 400, message: 'Related record was not found or is invalid.' };
  }

  if (code === '23514') {
    return { status: 400, message: 'One or more values are not allowed.' };
  }

  if (code === '22P02') {
    return { status: 400, message: 'Invalid ID format.' };
  }

  const msg = String(err.message || '');
  if (msg.includes('Owner cannot create adoption interest on own pet')) {
    return { status: 400, message: 'You cannot express interest in your own pet listing.' };
  }

  return { status: 500, message: 'Something went wrong. Please try again.' };
}

module.exports = { mapPgError };
