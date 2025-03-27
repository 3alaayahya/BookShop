using EXC6Server.BL;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace EXC6Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly Review _review;

        public ReviewController()
        {
            _review = new Review();
        }

        [HttpPost("AddReview")]
        public async Task<IActionResult> AddReview([FromBody] Review review)
        {
            if (review == null)
                return BadRequest("Review cannot be null");
            int result = await _review.AddReview(review);
            if (result > 0)
                return Ok();
            else
                return StatusCode(StatusCodes.Status500InternalServerError);
        }

        [HttpGet("GetAllReviews")]
        public async Task<IActionResult> GetAllReviews()
        {
            var reviews = await _review.GetAllReviews();
            return Ok(reviews);
        }

        [HttpGet("GetReviewsForBook/{bookID}")]
        public async Task<IActionResult> GetReviewsForBook(int bookID)
        {
            var reviews = await _review.GetReviewsForBook(bookID);
            return Ok(reviews);
        }

        [HttpGet("GetReviewsByUser/{userID}")]
        public async Task<IActionResult> GetReviewsByUser(int userID)
        {
            var reviews = await _review.GetReviewsByUser(userID);
            return Ok(reviews);
        }

        [HttpGet("GetReviewComments/{reviewID}")]
        public async Task<IActionResult> GetReviewComments(int reviewID)
        {
            var comments = await _review.GetReviewComments(reviewID);
            return Ok(comments);
        }

        [HttpDelete("DeleteReview/{reviewID}")]
        public async Task<IActionResult> DeleteReview(int reviewID)
        {
            bool result = await _review.DeleteReview(reviewID);
            if (result)
                return Ok();
            else
                return StatusCode(StatusCodes.Status500InternalServerError);
        }

        [HttpPost("AddLike")]
        public async Task<IActionResult> AddLike([FromQuery] int userID, [FromQuery] int reviewID)
        {
            try
            {
                await _review.AddLike(userID, reviewID);
                return Ok("Like added successfully.");
            }
            catch (Exception ex)
            {
                // Handle exception
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("AddComment")]
        public async Task<IActionResult> AddComment([FromQuery] int userID, [FromQuery] int reviewID, [FromQuery] string comment)
        {
            try
            {
                await _review.AddComment(userID, reviewID, comment);
                return Ok("Comment added successfully.");
            }
            catch (Exception ex)
            {
                // Handle exception
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("GetReviewsILiked")]
        public async Task<IActionResult> GetReviewsILiked([FromQuery] int userID)
        {
            try
            {
                var reviews = await _review.GetReviewsILiked(userID);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                // Handle exception
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("RemoveLike")]
        public async Task<IActionResult> RemoveLike([FromQuery] int userID, [FromQuery] int reviewID)
        {
            try
            {
                await _review.RemoveLike(userID, reviewID);
                return Ok("Like removed successfully.");
            }
            catch (Exception ex)
            {
                // Handle exception
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("RemoveComment")]
        public async Task<IActionResult> RemoveComment(int userID, int reviewID, string commentText)
        {
            bool result = await _review.RemoveComment(userID, reviewID, commentText);
            if (result)
            {
                return Ok("Comment removed successfully.");
            }
            return BadRequest("Failed to remove comment.");
        }
    }
}
