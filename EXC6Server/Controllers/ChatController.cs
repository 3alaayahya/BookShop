using EXC6Server.BL;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace EXC6Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        // GET: api/<ChatController>
        [HttpGet("GetAllMessagesBetweenUsers/{userId1}/{userId2}")]
        public async Task<IActionResult> GetAllMessagesBetweenUsers(int userId1, int userId2)
        {
            var messages = await BL.Chat.GetAllMessagesBetweenUsers(userId1, userId2);
            return Ok(messages);
        }

        [HttpPost("SendMessage")]
        public async Task<IActionResult> SendMessage([FromQuery] int senderId, [FromQuery] int receiverId, [FromQuery] string messageText)
        {
            try
            {
                await BL.Chat.SendMessage(senderId, receiverId, messageText);
                return Ok(new { Success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        [HttpDelete("DeleteMessage/{messageId}")]
        public async Task<IActionResult> DeleteMessage(int messageId, int userId)
        {
            await BL.Chat.DeleteMessage(messageId, userId);
            return Ok();
        }
    }
    public class ChatWebSocketMiddleware
    {
        private readonly RequestDelegate _next;

        public ChatWebSocketMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context, ChatHandler chatHandler)
        {
            if (context.WebSockets.IsWebSocketRequest && context.Request.Path == "/ws/chat")
            {
                var socket = await context.WebSockets.AcceptWebSocketAsync();
                await chatHandler.HandleWebSocketAsync(socket, context);
            }
            else
            {
                await _next(context);
            }
        }

    }
}
