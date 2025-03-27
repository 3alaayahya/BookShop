using EXC6Server.BL;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace EXC6Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuestionController : ControllerBase
    {
        [HttpGet("CreateAndGetQuiz/{userId}")]
        public async Task<IActionResult> CreateQuiz(int userId)
        {
            try
            {
                var questions = await Question.CreateQuizAndGetQuestions(userId);
                return Ok(questions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetQuizsForUser/{userId}")]
        public async Task<IActionResult> GetQuizzesForUser(int userId)
        {
            var quizzes = await Question.GetQuizzesForUser(userId);
            return Ok(quizzes);
        }

        [HttpPost("AddQuiz")]
        public async Task<IActionResult> AddQuiz([FromBody] QuizDTO quiz)
        {
            int result = await Question.AddQuiz(quiz.UserID, quiz.Grade, quiz.Question1, quiz.Question2, quiz.Question3, quiz.Question4, quiz.Question5,quiz.UserAnswer1, quiz.UserAnswer2, quiz.UserAnswer3, quiz.UserAnswer4, quiz.UserAnswer5);
            return Ok(result);
        }

        [HttpPost("AddQuestion")]
        public async Task<IActionResult> AddQuestion([FromBody] Question question)
        {
            if (question == null)
            {
                return BadRequest("Invalid question data.");
            }

            int questionId = await Question.AddQuestion(question);
            return Ok(questionId); // Return the ID of the newly added question
        }

    }
    public class QuizDTO
    {
        public int UserID { get; set; }
        public int Grade { get; set; }
        public int Question1 { get; set; }
        public int Question2 { get; set; }
        public int Question3 { get; set; }
        public int Question4 { get; set; }
        public int Question5 { get; set; }
        public string UserAnswer1 { get; set; }
        public string UserAnswer2 { get; set; }
        public string UserAnswer3 { get; set; }
        public string UserAnswer4 { get; set; }
        public string UserAnswer5 { get; set; }

    }
}
