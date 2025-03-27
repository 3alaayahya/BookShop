using EXC6Server.BL;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace EXC6Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthorController : ControllerBase
    {
        // GET: api/Author/GetAllAuthors
        [HttpGet("GetAllAuthors")]
        public async Task<ActionResult<List<Author>>> GetAllAuthors()
        {
            try
            {
                List<Author> authors = await Author.GetAllAuthors();
                return Ok(authors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("AddAuthor")]
        public async Task<IActionResult> AddAuthor([FromBody] Author author)
        {
            try
            {
                if (author == null)
                {
                    return BadRequest("Author data is null.");
                }

                int rowsAffected = await Author.InsertAuthor(author.Name, author.Image,author.Description);
                if (rowsAffected > 0)
                {
                    return Ok("Author added successfully.");
                }
                else
                {
                    return BadRequest("Failed to add the author.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpPut("UpdateAuthor")]
        public async Task<IActionResult> UpdateAuthor([FromBody] Author author)
        {
            try
            {
                if (author == null)
                {
                    return BadRequest("Author data is null.");
                }

                int rowsAffected = await Author.UpdateAuthor(author.AuthorId, author.Name, author.Image, author.Description);
                if (rowsAffected > 0)
                {
                    return Ok("Author updated successfully.");
                }
                else
                {
                    return BadRequest("Failed to update the author.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }


        [HttpGet("GetBooksByAuthor/{authorName}")]
        public async Task<ActionResult<List<Book>>> GetBooksByAuthor(string authorName)
        {
            try
            {
                List<Book> books = await Author.GetBooksByAuthor(authorName);
                return Ok(books);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("GetAuthorByID/{id}")]
        public async Task<ActionResult<Author>> GetAuthorByID(int id)
        {
            try
            {
                Author author = await Author.GetAuthorByID(id);
                if (author == null)
                    return NotFound();
                return Ok(author);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("DeleteAuthorByID/{id}")]
        public async Task<IActionResult> DeleteAuthorByID(int id)
        {
            try
            {
                int rowsAffected = await Author.DeleteAuthorByID(id);
                if (rowsAffected > 0)
                {
                    return Ok("Author deleted successfully.");
                }
                else
                {
                    return NotFound("Author not found.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("GetUsersThatHaveThisAuthor/{authorName}")]
        public async Task<IActionResult> GetUsersThatHaveThisAuthor(string authorName)
        {
            Author author = new Author();
            var users = await author.GetUsersThatHaveThisAuthor(authorName);
            return Ok(users);
        }
    }
}
