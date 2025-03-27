using EXC6Server.BL;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.Intrinsics.X86;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace EXC6Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        [HttpPost("AddUser")]
        public async Task<IActionResult> CreateUser([FromBody] User user)
        {
            if (user == null)
            {
                return BadRequest("User cannot be null.");
            }

            int result = await BL.User.InsertUser(user);
            if (result > 0)
            {
                return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
            }

            return StatusCode(500, "A problem occurred while handling your request.");
        }

        // GET api/user/{id}
        [HttpGet("GetUserByID/{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var users = await BL.User.GetAllUsers();
            var user = users.FirstOrDefault(u => u.Id == id);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // GET api/user
        [HttpGet("GetAllUsers")]
        public async Task<IActionResult> GetAllUsers()
        {
            List<User> users = await BL.User.GetAllUsers();
            return Ok(users);
        }

        // Endpoint to get books for a specific user
        [HttpGet("GetAllBooksForUser/{userId}")]
        public async Task<IActionResult> GetUserBooks(int userId)
        {
            try
            {
                var books = await BL.User.GetUserBooks(userId);
                if (books == null || books.Count == 0)
                {
                    return NotFound("No books found for this user.");
                }

                return Ok(books);
            }
            catch (Exception ex)
            {
                // Log the exception details (optional)
                // _logger.LogError(ex, "Error occurred while retrieving user books.");
                return StatusCode(500, "An unexpected error occurred.");
            }
        }

        // POST api/user/{userId}/books/{bookId}
        [HttpPost("AddBooksToUser/{userId}/{bookId}")]
        public async Task<bool> AddBookToUser(int userId, int bookId)
        {
            bool result = await new User { Id = userId }.AddMyBook(userId, bookId);
            if (result)
            {
                return true;
            }

            return false;
        }

        // DELETE api/user/{userId}/books/{bookId}
        [HttpDelete("RemoveBookFromUser/{userId}/{bookId}")]
        public async Task<bool> RemoveBookFromUser(int userId, int bookId)
        {
            int result = await new User { Id = userId }.DeleteUserBook(userId, bookId);
            if (result > 0)
            {
                return true;
            }

            return false;
        }

        // POST api/<UserController>/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            if (await user.RegisterAsync(user))
            {
                return Ok(new { message = "Registration successful." });
            }
            else
            {
                return BadRequest(new { message = "Registration failed. Email already in use." });
            }
        }



        // POST api/<UserController>/login
        [HttpPost("login")]
        public IActionResult Login(string email, string password)
        {
            var user = BL.User.Login(email, password);
            if (user != null)
            {
                return Ok(new { message = "Login successful.", user });
            }
            else
            {
                return Unauthorized(new { message = "Login failed. Invalid email or password." });
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout(int userId)
        {
            BL.User.Logout(userId).Wait();
            return Ok(new { message = "Logout successfully.", userId });
        }

        // PUT api/user
        [HttpPut("UpdateUser")]
        public async Task<IActionResult> UpdateUser([FromForm] User user, [FromForm] List<IFormFile> files)
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
                user.Image = url + string.Join(",", imageLinks);
            }

            if (user == null)
            {
                return BadRequest("User cannot be null.");
            }

            int result = await user.UpdateUser(user);
            if (result > 0)
            {
                return Ok();
            }

            return StatusCode(500, "A problem occurred while handling your request.");
        }

        [HttpDelete("DeleteUser/{userId}")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            try
            {
                int rowsAffected = await BL.User.DeleteUserByID(userId);

                if (rowsAffected > 0)
                {
                    return Ok(new { Message = "User deleted successfully." });
                }
                else
                {
                    return NotFound(new { Message = "User not found." });
                }
            }
            catch (Exception ex)
            {
                // Log the exception and return a generic error response
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, new { Message = "An error occurred while deleting the user." });
            }
        }

        [HttpPost("addBookRequest")]
        public async Task<IActionResult> AddBookRequest(int askerId, int ownerId, int bookId, string message)
        {
            int result = await BL.User.AddBookRequest(askerId, ownerId, bookId, message);
            return Ok(result);
        }

        [HttpDelete("RemoveBookRequest")]
        public async Task<IActionResult> RemoveBookRequest(int askerId, int ownerId, int bookId)
        {
            try
            {
                int result = await BL.User.RemoveBookRequest(askerId, ownerId, bookId);
                if (result > 0)
                {
                    return Ok(new { message = "Book request removed successfully." });
                }
                else
                {
                    return NotFound(new { message = "Book request not found." });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error: {ex.Message}" });
            }
        }


        [HttpGet("getAllRequests")]
        public async Task<IActionResult> GetAllRequests()
        {
            var requests = await BL.User.GetAllRequests();
            return Ok(requests);
        }

        [HttpGet("getMyBookRequests")]
        public async Task<IActionResult> GetMyBookRequests(int askerId)
        {
            var requests = await BL.User.GetMyBookRequests(askerId);
            return Ok(requests);
        }

        [HttpGet("ownerBookRequests")]
        public async Task<IActionResult> OwnerBookRequests(int ownerId)
        {
            var requests = await BL.User.OwnerBookRequests(ownerId);
            return Ok(requests);
        }

        [HttpPost("setBookAsReaded")]
        public async Task<IActionResult> SetBookAsReaded(int userId,int bookId, bool readed)
        {
            int result = await BL.User.SetBookAsReaded(userId,bookId, readed);
            return Ok(result);
        }

        [HttpPost("setBookWantToRead")]
        public async Task<IActionResult> SetBookWantToRead(int userId,int bookId, bool wantToRead)
        {
            int result = await BL.User.SetBookWantToRead(userId, bookId, wantToRead);
            return Ok(result);
        }

        [HttpPost("changeBookOwner")]
        public async Task<IActionResult> ChangeBookOwner(int askerId, int currentOwnerId, int bookId)
        {
            int result = await BL.User.ChangeBookOwner(askerId, currentOwnerId, bookId);
            return Ok(result);
        }

        [HttpGet("GetUsersBooks")]
        public async Task<IActionResult> GetUsersBooks()
        {
            try
            {
                var books = await BL.User.GetUsersBooks();
                return Ok(books);
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "An unexpected error occurred.");
            }
        }

        [HttpPost("AnswerRequest")]
        public async Task<IActionResult> AnswerRequest(int requestId, bool approved)
        {
            try
            {
                int result = await BL.User.AnswerRequest(requestId, approved);
                if (result > 0)
                {
                    return Ok(new { Message = "Request updated successfully." });
                }
                return BadRequest("Failed to update request.");
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "An unexpected error occurred.");
            }
        }

        [HttpGet("GetFriendsCount/{userID}")]
        public async Task<int> GetFriendsCount(int userID)
        {
            return await BL.User.GetFriendsCount(userID);
        }

        [HttpGet("GetAllUserFriends/{userID}")]
        public async Task<List<dynamic>> GetAllUserFriends(int userID)
        {
            return await BL.User.GetAllUserFriends(userID);
        }

        [HttpGet("GetAllUserFriendRequests/{userID}")]
        public async Task<List<dynamic>> GetAllUserFriendRequests(int userID)
        {
            return await BL.User.GetAllUserFriendRequests(userID);
        }

        [HttpGet("GetAllUserFriendRequestsSent/{userID}")]
        public async Task<List<dynamic>> GetAllUserFriendRequestsSent(int userID)
        {
            return await BL.User.GetAllUserFriendRequestsSent(userID);
        }

        [HttpPost("AcceptFriendRequest")]
        public async Task AcceptFriendRequest(int senderID, int receiverID)
        {
            await BL.User.AcceptFriendRequest(senderID, receiverID);
        }

        [HttpPost("DenyFriendRequest")]
        public async Task DenyFriendRequest(int senderID, int receiverID)
        {
            await BL.User.DenyFriendRequest(senderID, receiverID);
        }

        [HttpDelete("RemoveFriend")]
        public async Task RemoveFriend(int userID, int removedUserID)
        {
            await BL.User.RemoveFriend(userID, removedUserID);
        }

        [HttpDelete("CancelFriendRequest")]
        public async Task CancelFriendRequest(int senderID, int receiverID)
        {
            await BL.User.CancelFriendRequest(senderID, receiverID);
        }

        [HttpPost("SendFriendRequest")]
        public async Task SendFriendRequest(int senderID, int receiverID)
        {
            await BL.User.SendFriendRequest(senderID, receiverID);
        }

    }
}
