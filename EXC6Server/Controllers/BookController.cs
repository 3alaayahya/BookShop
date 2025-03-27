using EXC6Server.BL;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace EXC6Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        // GET: api/<BookController>
        [HttpGet("GetAllBooks")]
        public async Task<ActionResult<List<Book>>> GetAllBooks()
        {
            Book book = new Book();
            List<Book> books = await book.GetAllBooks();
            return Ok(books);
        }

        [HttpGet("top3onlinebooks")]
        public async Task<IActionResult> GetTop3OnlineBooks()
        {
            Book book = new Book();
            List<Book> books = await book.GetTop3OnlineBooks();

            if (books == null || books.Count == 0)
            {
                return NotFound("No books found.");
            }

            return Ok(books);
        }


        [HttpPost]
        [Route("AddBook")]
        public async Task<IActionResult> AddBook([FromForm] Book book, [FromForm] List<IFormFile> files)
        {
            List<string> imageLinks = new List<string>();

            string path = System.IO.Directory.GetCurrentDirectory();

            long size = files.Sum(f => f.Length);

            foreach (var formFile in files)
            {
                if (formFile.Length > 0)
                {
                    var filePath = Path.Combine(path, "uploadedFiles/" + formFile.FileName);

                    using (var stream = System.IO.File.Create(filePath))
                    {
                        await formFile.CopyToAsync(stream);
                    }
                    imageLinks.Add(formFile.FileName);
                }
            }
            if (imageLinks.Any())
            {
                string url = "https://proj.ruppin.ac.il/cgroup88/test2/tar1/Images/";
                book.Image = url + string.Join(",", imageLinks);
            }
            try
            {
                if (book == null)
                {
                    return BadRequest("Book data is null.");
                }

                // Use the Insert method to add the book
                bool result = await book.Insert();
                if (result)
                {
                    return Ok("Book added successfully.");
                }
                else
                {
                    return BadRequest("Failed to add the book.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }
        //[HttpPost]
        //[Route("AddBook")]
        //public async Task<IActionResult> AddBook([FromBody] Book book)
        //{
        //    try
        //    {
        //        if (book == null)
        //        {
        //            return BadRequest("Book data is null.");
        //        }

        //        // Use the Insert method to add the book
        //        bool result = await book.Insert();
        //        if (result)
        //        {
        //            return Ok("Book added successfully.");
        //        }
        //        else
        //        {
        //            return BadRequest("Failed to add the book.");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest("Error: " + ex.Message);
        //    }
        //}


        [HttpGet("GetBookByID/{id}")]
        public async Task<ActionResult<Book>> GetBookByID(int id)
        {
            try
            {
                Book book = await Book.GetBookByID(id);
                if (book == null)
                    return NotFound();
                return Ok(book);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("DeleteBookByID/{id}")]
        public async Task<ActionResult<int>> DeleteBookByID(int id)
        {
            try
            {
                int rowsAffected = await Book.DeleteBookByID(id);
                if (rowsAffected == 0)
                    return NotFound();
                return Ok(rowsAffected);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("UpdateBookByID/{id}")]
        public async Task<ActionResult<int>> UpdateBookByID(int id, [FromForm] Book book, [FromForm] List<IFormFile> files)
        {
            List<string> imageLinks = new List<string>();

            string path = System.IO.Directory.GetCurrentDirectory();

            long size = files.Sum(f => f.Length);

            foreach (var formFile in files)
            {
                if (formFile.Length > 0)
                {
                    var filePath = Path.Combine(path, "uploadedFiles/" + formFile.FileName);

                    using (var stream = System.IO.File.Create(filePath))
                    {
                        await formFile.CopyToAsync(stream);
                    }
                    imageLinks.Add(formFile.FileName);
                }
            }
            if (imageLinks.Any())
            {
                string url = "https://proj.ruppin.ac.il/cgroup88/test2/tar1/Images/";
                book.Image = url + string.Join(",", imageLinks);
            }
            try
            {
                book.Id = id;
                int rowsAffected = await Book.UpdateBookByID(book);
                if (rowsAffected == 0)
                    return NotFound();
                return Ok(rowsAffected);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("SetActive/{id}")]
        public async Task<IActionResult> SetActive(int id, [FromBody] bool isActive)
        {
            try
            {
                Book book = await Book.GetBookByID(id);
                if (book == null)
                    return NotFound();

                bool result = await book.SetActive(isActive);
                if (result)
                {
                    return Ok("Book status updated successfully.");
                }
                else
                {
                    return BadRequest("Failed to update the book status.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("getBookOwner/{bookId}")]
        public async Task<IActionResult> GetBookOwner(int bookId)
        {
            Book book = new Book();
            User owner = await book.GetBookOwner(bookId);

            return Ok(owner);
        }

        [HttpGet("GetUsersThatHaveThisBook/{bookId}")]
        public async Task<IActionResult> GetUsersThatHaveThisBook(int bookId)
        {
            Book book = new Book();
            var users = await book.GetUsersThatHaveThisBook(bookId);
            return Ok(users);
        }

    }
}
