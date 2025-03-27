using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Dynamic;
using System.Reflection.PortableExecutable;
using System.Runtime.Intrinsics.X86;
using System.Threading.Tasks;
using EXC6Server.BL;
using Microsoft.Extensions.Configuration;

public class DBservices
{
    private readonly string connectionString;

    public DBservices()
    {
        IConfigurationRoot configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json").Build();
        connectionString = configuration.GetConnectionString("myProjDB");
    }

    private SqlConnection Connect()
    {
        SqlConnection con = new SqlConnection(connectionString);
        con.Open();
        return con;
    }
    public async Task<int> InsertBook(Book book)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = new SqlCommand("AddBook", con);
                cmd.CommandType = CommandType.StoredProcedure;

                // Add parameters required by the stored procedure
                cmd.Parameters.AddWithValue("@Name", book.Name);
                cmd.Parameters.AddWithValue("@AuthorName", book.AuthorName);
                cmd.Parameters.AddWithValue("@PublishDate", string.IsNullOrEmpty(book.PublishDate) ? (object)DBNull.Value : DateTime.Parse(book.PublishDate));
                cmd.Parameters.AddWithValue("@PageCount", book.PageCount);
                cmd.Parameters.AddWithValue("@Categories", book.Categories);
                cmd.Parameters.AddWithValue("@Language", book.Language);
                cmd.Parameters.AddWithValue("@Image", string.IsNullOrEmpty(book.Image) ? (object)DBNull.Value : book.Image);
                cmd.Parameters.AddWithValue("@Description", book.Description);  
                cmd.Parameters.AddWithValue("@webReaderLink", book.WebReaderLink);
                cmd.Parameters.AddWithValue("@Price", book.Price);
                cmd.Parameters.AddWithValue("@Rating", book.Rating);
                cmd.Parameters.AddWithValue("@IsDigital", book.IsDigital);
                cmd.Parameters.AddWithValue("@IsActive", book.IsActive);

                // Execute the command asynchronously and read the number of rows affected
                int rowsAffected = 0;
                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        rowsAffected = reader.GetInt32(0); // Read the row count from the result set
                    }
                }

                return rowsAffected;
            }
        }
        catch (Exception ex)
        {
            // Log the exception details
            Console.WriteLine($"Error: {ex.Message}");
            throw; // Re-throw the exception if needed
        }
    }

    public async Task<List<Book>> GetAllBooks()
    {
        List<Book> books = new List<Book>();

        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("GetAllBooks", con);

                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        Book book = new Book
                        {
                            Id = reader.GetInt32(reader.GetOrdinal("id")),
                            Name = reader.GetString(reader.GetOrdinal("Name")),
                            AuthorName = reader.IsDBNull(reader.GetOrdinal("AuthorName")) ? null : reader.GetString(reader.GetOrdinal("AuthorName")),
                            PublishDate = reader.IsDBNull(reader.GetOrdinal("PublishDate")) ? null : reader.GetDateTime(reader.GetOrdinal("PublishDate")).ToString(),
                            PageCount = reader.IsDBNull(reader.GetOrdinal("PageCount")) ? 0 : reader.GetInt32(reader.GetOrdinal("PageCount")),
                            Categories = reader.IsDBNull(reader.GetOrdinal("Categories")) ? null : reader.GetString(reader.GetOrdinal("Categories")),
                            Language = reader.IsDBNull(reader.GetOrdinal("Language")) ? null : reader.GetString(reader.GetOrdinal("Language")),
                            Image = reader.IsDBNull(reader.GetOrdinal("Image")) ? null : reader.GetString(reader.GetOrdinal("Image")),
                            Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description")),
                            WebReaderLink = reader.IsDBNull(reader.GetOrdinal("WebReaderLink")) ? null : reader.GetString(reader.GetOrdinal("WebReaderLink")),
                            Price = reader.GetDecimal(reader.GetOrdinal("Price")),
                            Rating = reader.GetDecimal(reader.GetOrdinal("rating")),
                            IsDigital = reader.IsDBNull(reader.GetOrdinal("IsDigital")) ? false : reader.GetBoolean(reader.GetOrdinal("IsDigital")),
                            IsActive = reader.IsDBNull(reader.GetOrdinal("IsActive")) ? false : reader.GetBoolean(reader.GetOrdinal("IsActive")),
                            IsOwned = reader.IsDBNull(reader.GetOrdinal("isOwned")) ? false : reader.GetBoolean(reader.GetOrdinal("isOwned"))

                        };
                        books.Add(book);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            // Log the exception details
            Console.WriteLine($"Error: {ex.Message}");
            throw; // Re-throw the exception if needed
        }

        return books;
    }

    public async Task<List<Book>> GetTop3OnlineBooks()
    {
        List<Book> books = new List<Book>();

        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("GetTop3OnlineBooks", con);

                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        Book book = new Book
                        {
                            Id = reader.GetInt32(reader.GetOrdinal("id")),
                            Name = reader.GetString(reader.GetOrdinal("Name")),
                            AuthorName = reader.IsDBNull(reader.GetOrdinal("AuthorName")) ? null : reader.GetString(reader.GetOrdinal("AuthorName")),
                            PublishDate = reader.IsDBNull(reader.GetOrdinal("PublishDate")) ? null : reader.GetDateTime(reader.GetOrdinal("PublishDate")).ToString(),
                            PageCount = reader.IsDBNull(reader.GetOrdinal("PageCount")) ? 0 : reader.GetInt32(reader.GetOrdinal("PageCount")),
                            Categories = reader.IsDBNull(reader.GetOrdinal("Categories")) ? null : reader.GetString(reader.GetOrdinal("Categories")),
                            Language = reader.IsDBNull(reader.GetOrdinal("Language")) ? null : reader.GetString(reader.GetOrdinal("Language")),
                            Image = reader.IsDBNull(reader.GetOrdinal("Image")) ? null : reader.GetString(reader.GetOrdinal("Image")),
                            Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description")),
                            WebReaderLink = reader.IsDBNull(reader.GetOrdinal("WebReaderLink")) ? null : reader.GetString(reader.GetOrdinal("WebReaderLink")),
                            Price = reader.GetDecimal(reader.GetOrdinal("Price")),
                            Rating = reader.GetDecimal(reader.GetOrdinal("rating")),
                            IsDigital = reader.IsDBNull(reader.GetOrdinal("IsDigital")) ? false : reader.GetBoolean(reader.GetOrdinal("IsDigital")),
                            IsActive = reader.IsDBNull(reader.GetOrdinal("IsActive")) ? false : reader.GetBoolean(reader.GetOrdinal("IsActive")),
                            IsOwned = reader.IsDBNull(reader.GetOrdinal("isOwned")) ? false : reader.GetBoolean(reader.GetOrdinal("isOwned"))
                        };
                        books.Add(book);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }

        return books;
    }

    public async Task<Book> GetBookByID(int id)
    {
        Book book = null;

        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("GetBookByID", con);
                cmd.Parameters.AddWithValue("@BookID", id);

                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        book = new Book
                        {
                            Id = reader.GetInt32(reader.GetOrdinal("id")),
                            Name = reader.GetString(reader.GetOrdinal("Name")),
                            AuthorName = reader.IsDBNull(reader.GetOrdinal("AuthorName")) ? null : reader.GetString(reader.GetOrdinal("AuthorName")),
                            PublishDate = reader.IsDBNull(reader.GetOrdinal("PublishDate")) ? null : reader.GetDateTime(reader.GetOrdinal("PublishDate")).ToString(),
                            PageCount = reader.IsDBNull(reader.GetOrdinal("PageCount")) ? 0 : reader.GetInt32(reader.GetOrdinal("PageCount")),
                            Categories = reader.IsDBNull(reader.GetOrdinal("Categories")) ? null : reader.GetString(reader.GetOrdinal("Categories")),
                            Language = reader.IsDBNull(reader.GetOrdinal("Language")) ? null : reader.GetString(reader.GetOrdinal("Language")),
                            Image = reader.IsDBNull(reader.GetOrdinal("Image")) ? null : reader.GetString(reader.GetOrdinal("Image")),
                            Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description")),
                            WebReaderLink = reader.IsDBNull(reader.GetOrdinal("WebReaderLink")) ? null : reader.GetString(reader.GetOrdinal("WebReaderLink")),
                            Price = reader.GetDecimal(reader.GetOrdinal("Price")),
                            Rating = reader.GetDecimal(reader.GetOrdinal("rating")),
                            IsDigital = reader.IsDBNull(reader.GetOrdinal("IsDigital")) ? false : reader.GetBoolean(reader.GetOrdinal("IsDigital")),
                            IsActive = reader.IsDBNull(reader.GetOrdinal("IsActive")) ? false : reader.GetBoolean(reader.GetOrdinal("IsActive"))
                        };
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }

        return book;
    }

    public async Task<int> DeleteBookByID(int id)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("DeleteBookByID", con);
                cmd.Parameters.AddWithValue("@BookID", id);

                return await cmd.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }

    public async Task<int> UpdateBookByID(Book book)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("UpdateBookByID", con);
                cmd.Parameters.AddWithValue("@BookID", book.Id);
                cmd.Parameters.AddWithValue("@Name", book.Name);
                cmd.Parameters.AddWithValue("@AuthorName", string.IsNullOrEmpty(book.AuthorName) ? (object)DBNull.Value : book.AuthorName);
                cmd.Parameters.AddWithValue("@PublishDate", string.IsNullOrEmpty(book.PublishDate) ? (object)DBNull.Value : DateTime.Parse(book.PublishDate));
                cmd.Parameters.AddWithValue("@PageCount", book.PageCount == 0 ? (object)DBNull.Value : book.PageCount);
                cmd.Parameters.AddWithValue("@Categories", string.IsNullOrEmpty(book.Categories) ? (object)DBNull.Value : book.Categories);
                cmd.Parameters.AddWithValue("@Language", string.IsNullOrEmpty(book.Language) ? (object)DBNull.Value : book.Language);
                cmd.Parameters.AddWithValue("@Image", string.IsNullOrEmpty(book.Image) ? (object)DBNull.Value : book.Image);
                cmd.Parameters.AddWithValue("@Description", string.IsNullOrEmpty(book.Description) ? (object)DBNull.Value : book.Description);
                cmd.Parameters.AddWithValue("@WebReaderLink", string.IsNullOrEmpty(book.WebReaderLink) ? (object)DBNull.Value : book.WebReaderLink);
                cmd.Parameters.AddWithValue("@Price", book.Price);
                cmd.Parameters.AddWithValue("@Rating", book.Rating);
                cmd.Parameters.AddWithValue("@IsDigital", book.IsDigital);
                cmd.Parameters.AddWithValue("@IsActive", book.IsActive);

                return await cmd.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }

    public async Task<int> SetActiveBook(int bookId, bool isActive)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("SetActiveBook", con);
                cmd.Parameters.AddWithValue("@BookId", bookId);
                cmd.Parameters.AddWithValue("@IsActive", isActive);

                // Execute the command asynchronously and return the number of rows affected
                return await cmd.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }

    public async Task<List<Author>> GetAllAuthors()
    {
        List<Author> authors = new List<Author>();

        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("GetAllAuthors", con);

                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        Author author = new Author
                        {
                            AuthorId = reader.GetInt32(reader.GetOrdinal("AuthorId")),
                            Name = reader.IsDBNull(reader.GetOrdinal("Name")) ? null : reader.GetString(reader.GetOrdinal("Name")),
                            Image = reader.IsDBNull(reader.GetOrdinal("Image")) ? null : reader.GetString(reader.GetOrdinal("Image")),
                            Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description"))
                        };
                        authors.Add(author);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }

        return authors;
    }

    public async Task<int> InsertAuthor(string name, string image, string description)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("InsertAuthor", con);
                cmd.Parameters.AddWithValue("@Name", name);
                cmd.Parameters.AddWithValue("@Image", (object)image ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Description", (object)description ?? DBNull.Value);

                return await cmd.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }

    public async Task<int> UpdateAuthor(int authorId, string name, string image, string description)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("UpdateAuthor", con);
                cmd.Parameters.AddWithValue("@AuthorId", authorId);
                cmd.Parameters.AddWithValue("@Name", name);
                cmd.Parameters.AddWithValue("@Image", (object)image ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Description", (object)description ?? DBNull.Value);

                return await cmd.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }


    public async Task<List<Book>> GetBooksByAuthor(string authorName)
    {
        List<Book> books = new List<Book>();

        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("GetBooksByAuthor", con);
                cmd.Parameters.AddWithValue("@AuthorName", authorName);

                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        Book book = new Book
                        {
                            Id = reader.GetInt32(reader.GetOrdinal("id")),
                            Name = reader.GetString(reader.GetOrdinal("Name")),
                            AuthorName = reader.IsDBNull(reader.GetOrdinal("AuthorName")) ? null : reader.GetString(reader.GetOrdinal("AuthorName")),
                            PublishDate = reader.IsDBNull(reader.GetOrdinal("PublishDate")) ? null : reader.GetDateTime(reader.GetOrdinal("PublishDate")).ToString(),
                            PageCount = reader.IsDBNull(reader.GetOrdinal("PageCount")) ? 0 : reader.GetInt32(reader.GetOrdinal("PageCount")),
                            Categories = reader.IsDBNull(reader.GetOrdinal("Categories")) ? null : reader.GetString(reader.GetOrdinal("Categories")),
                            Language = reader.IsDBNull(reader.GetOrdinal("Language")) ? null : reader.GetString(reader.GetOrdinal("Language")),
                            Image = reader.IsDBNull(reader.GetOrdinal("Image")) ? null : reader.GetString(reader.GetOrdinal("Image")),
                            Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description")),
                            WebReaderLink = reader.IsDBNull(reader.GetOrdinal("WebReaderLink")) ? null : reader.GetString(reader.GetOrdinal("WebReaderLink")),
                            Price = reader.GetDecimal(reader.GetOrdinal("Price")),
                            Rating = reader.GetDecimal(reader.GetOrdinal("Rating")),
                            IsDigital = reader.IsDBNull(reader.GetOrdinal("IsDigital")) ? false : reader.GetBoolean(reader.GetOrdinal("IsDigital")),
                            IsActive = reader.IsDBNull(reader.GetOrdinal("IsActive")) ? false : reader.GetBoolean(reader.GetOrdinal("IsActive"))
                        };
                        books.Add(book);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }

        return books;
    }

    public async Task<Author> GetAuthorByID(int authorId)
    {
        Author author = null;

        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("GetAuthorByID", con);
                cmd.Parameters.AddWithValue("@AuthorId", authorId);

                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        author = new Author
                        {
                            AuthorId = reader.GetInt32(reader.GetOrdinal("AuthorId")),
                            Name = reader.IsDBNull(reader.GetOrdinal("Name")) ? null : reader.GetString(reader.GetOrdinal("Name")),
                            Image = reader.IsDBNull(reader.GetOrdinal("Image")) ? null : reader.GetString(reader.GetOrdinal("Image")),
                            Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description"))
                        };
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }

        return author;
    }

    public async Task<int> DeleteAuthorByID(int authorId)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("DeleteAuthorByID", con);
                cmd.Parameters.AddWithValue("@AuthorId", authorId);

                return await cmd.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }

    public async Task<int> InsertUser(User user)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("InsertUser2", con);
                cmd.Parameters.AddWithValue("@ID", user.Id);
                cmd.Parameters.AddWithValue("@Name", user.Name);
                cmd.Parameters.AddWithValue("@Email", user.Email);
                cmd.Parameters.AddWithValue("@Password", user.Password);
                cmd.Parameters.AddWithValue("@Image", string.IsNullOrEmpty(user.Image) ? (object)DBNull.Value : user.Image);
                cmd.Parameters.AddWithValue("@IsAdmin", user.IsAdmin);
                cmd.Parameters.AddWithValue("@IsActive", user.IsActive);

                return await cmd.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }

    public async Task<List<User>> ReadUsers()
    {
        List<User> users = new List<User>();

        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("ReadUsers2", con);

                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        User user = new User
                        {
                            Id = reader.GetInt32(reader.GetOrdinal("id")),
                            Name = reader.IsDBNull(reader.GetOrdinal("name")) ? null : reader.GetString(reader.GetOrdinal("name")),
                            Email = reader.IsDBNull(reader.GetOrdinal("email")) ? null : reader.GetString(reader.GetOrdinal("email")),
                            Password = reader.IsDBNull(reader.GetOrdinal("password")) ? null : reader.GetString(reader.GetOrdinal("password")),
                            Image = reader.IsDBNull(reader.GetOrdinal("Image")) ? null : reader.GetString(reader.GetOrdinal("Image")),
                            IsAdmin = reader.GetBoolean(reader.GetOrdinal("isAdmin")),
                            IsActive = reader.GetBoolean(reader.GetOrdinal("isActive"))
                        };
                        users.Add(user);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }

        return users;
    }

    public async Task<bool> AddMyBook(int userId, int bookId)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("AddMyBook", con);
                cmd.Parameters.AddWithValue("@UserID", userId);
                cmd.Parameters.AddWithValue("@BookID", bookId);

                int rowsAffected = await cmd.ExecuteNonQueryAsync();

                // If rowsAffected is 0, the stored procedure did not execute as expected
                // This typically means the RAISERROR was triggered
                return rowsAffected > 0;
            }
        }
        catch (SqlException ex)
        {
            // Handle errors related to the stored procedure
            if (ex.Number == 50000) // Custom error number for RAISERROR
            {
                // Log the specific error message from RAISERROR
                Console.WriteLine($"Stored Procedure Error: {ex.Message}");
                return false;
            }
            // Handle other SQL exceptions or re-throw
            Console.WriteLine($"SQL Error: {ex.Message}");
            throw;
        }
        catch (Exception ex)
        {
            // Handle other general exceptions
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }


    public async Task<int> DeleteUserBook(int userId, int bookId)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("DeleteUserBook", con);
                cmd.Parameters.AddWithValue("@UserID", userId);
                cmd.Parameters.AddWithValue("@BookID", bookId);

                return await cmd.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }

    public async Task<List<dynamic>> GetUserBooks(int userId)
    {
        List<dynamic> books = new List<dynamic>();

        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("GetUserBooks", con);
                cmd.Parameters.AddWithValue("@UserId", userId);

                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        var book = new
                        {
                            Id = reader.GetInt32(reader.GetOrdinal("Id")),
                            Name = reader.GetString(reader.GetOrdinal("Name")),
                            AuthorName = reader.IsDBNull(reader.GetOrdinal("AuthorName")) ? null : reader.GetString(reader.GetOrdinal("AuthorName")),
                            PublishDate = reader.IsDBNull(reader.GetOrdinal("PublishDate")) ? null : reader.GetDateTime(reader.GetOrdinal("PublishDate")).ToString(),
                            PageCount = reader.IsDBNull(reader.GetOrdinal("PageCount")) ? 0 : reader.GetInt32(reader.GetOrdinal("PageCount")),
                            Categories = reader.IsDBNull(reader.GetOrdinal("Categories")) ? null : reader.GetString(reader.GetOrdinal("Categories")),
                            Language = reader.IsDBNull(reader.GetOrdinal("Language")) ? null : reader.GetString(reader.GetOrdinal("Language")),
                            Image = reader.IsDBNull(reader.GetOrdinal("Image")) ? null : reader.GetString(reader.GetOrdinal("Image")),
                            Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description")),
                            WebReaderLink = reader.IsDBNull(reader.GetOrdinal("WebReaderLink")) ? null : reader.GetString(reader.GetOrdinal("WebReaderLink")),
                            Price = reader.GetDecimal(reader.GetOrdinal("Price")),
                            Rating = reader.GetDecimal(reader.GetOrdinal("Rating")),
                            IsDigital = reader.IsDBNull(reader.GetOrdinal("IsDigital")) ? false : reader.GetBoolean(reader.GetOrdinal("IsDigital")),
                            IsActive = reader.IsDBNull(reader.GetOrdinal("IsActive")) ? false : reader.GetBoolean(reader.GetOrdinal("IsActive")),
                            Readed = reader.IsDBNull(reader.GetOrdinal("Readed")) ? false : reader.GetBoolean(reader.GetOrdinal("Readed")),
                            WantToRead = reader.IsDBNull(reader.GetOrdinal("WantToRead")) ? false : reader.GetBoolean(reader.GetOrdinal("WantToRead")),
                            Bought = reader.IsDBNull(reader.GetOrdinal("Bought")) ? false : reader.GetBoolean(reader.GetOrdinal("Bought"))
                        };
                        books.Add(book);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }

        return books;
    }


    public async Task<int> UpdateUser(User user)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("UpdateUser", con);
                cmd.Parameters.AddWithValue("@Id", user.Id);
                cmd.Parameters.AddWithValue("@Name", user.Name);
                cmd.Parameters.AddWithValue("@Email", user.Email);
                cmd.Parameters.AddWithValue("@Password", user.Password);
                cmd.Parameters.AddWithValue("@Image", string.IsNullOrEmpty(user.Image) ? (object)DBNull.Value : user.Image);
                cmd.Parameters.AddWithValue("@IsAdmin", user.IsAdmin);
                cmd.Parameters.AddWithValue("@IsActive", user.IsActive);

                return await cmd.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }

    public async Task<int> DeleteUserByID(int userId)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("DeleteUserByID", con);
                cmd.Parameters.AddWithValue("@UserId", userId);

                return await cmd.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }

    // Login User
    public async Task<User> LoginUser(string email, string password)
    {
        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = CreateCommandWithStoredProcedure("LoginUser2", con);
            cmd.Parameters.AddWithValue("@email", email);
            cmd.Parameters.AddWithValue("@password", password);
            SqlDataReader reader = await cmd.ExecuteReaderAsync();

            if (reader.Read())
            {
                User user = new User
                {
                    Id = reader.GetInt32(reader.GetOrdinal("id")),
                    Name = reader.GetString(reader.GetOrdinal("name")),
                    Email = reader.GetString(reader.GetOrdinal("email")),
                    Password = reader.GetString(reader.GetOrdinal("password")),
                    Image = reader.GetString(reader.GetOrdinal("Image")),
                    IsAdmin = reader.GetBoolean(reader.GetOrdinal("isAdmin")),
                    IsActive = true // Set user as active upon login
                };
                return user;
            }

            return null;
        }
    }

    // Logout User
    public async Task<bool> LogoutUser(int userId)
    {
        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = CreateCommandWithStoredProcedure("LogoutUser2", con);
            cmd.Parameters.AddWithValue("@userId", userId);

            int rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }
    }

    // Register User
    public async Task<bool> RegisterUser(int id,string name, string email, string password, string image)
    {
        int rowsAffected;
        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = CreateCommandWithStoredProcedure("RegisterUser2", con);
            cmd.Parameters.AddWithValue("@id", id);
            cmd.Parameters.AddWithValue("@name", name);
            cmd.Parameters.AddWithValue("@email", email);
            cmd.Parameters.AddWithValue("@password", password);
            cmd.Parameters.AddWithValue("@Image", image);

            rowsAffected = await cmd.ExecuteNonQueryAsync();
        }

        // If any rows were affected, consider it as successful registration
        return rowsAffected > 0;
    }

    public async Task<User> GetBookOwner(int bookId)
    {
        User owner = null;
        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = CreateCommandWithStoredProcedure("GetBookOwner", con);
            cmd.Parameters.AddWithValue("@BookId", bookId);

            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
            {
                if (reader.Read())
                {
                    owner = new User
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("id")),
                        Name = reader.GetString(reader.GetOrdinal("name")),
                        Email = reader.GetString(reader.GetOrdinal("email")),
                        Password = reader.GetString(reader.GetOrdinal("password")),
                        Image = reader.GetString(reader.GetOrdinal("Image")),
                        IsAdmin = reader.GetBoolean(reader.GetOrdinal("isAdmin")),
                        IsActive = reader.GetBoolean(reader.GetOrdinal("isActive"))
                    };
                }
            }
        }
        return owner;
    }

    // AddBookRequest Procedure
    public async Task<int> AddBookRequest(int askerId, int ownerId, int bookId, string message)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = new SqlCommand("AddBookRequest", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@AskerId", askerId);
                cmd.Parameters.AddWithValue("@OwnerId", ownerId);
                cmd.Parameters.AddWithValue("@BookId", bookId);
                cmd.Parameters.AddWithValue("@Message", message);

                return await cmd.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }

    // GetAllRequests Procedure
    public async Task<List<dynamic>> GetAllRequests()
    {
        List<dynamic> requests = new List<dynamic>();

        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = new SqlCommand("GetAllRequests", con);
                cmd.CommandType = CommandType.StoredProcedure;

                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        dynamic request = new ExpandoObject();
                        var requestDict = (IDictionary<string, object>)request;

                        for (int i = 0; i < reader.FieldCount; i++)
                        {
                            requestDict[reader.GetName(i)] = reader.GetValue(i);
                        }

                        requests.Add(request);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }

        return requests;
    }

    // GetMyBookRequests Procedure
    public async Task<List<dynamic>> GetMyBookRequests(int askerId)
    {
        List<dynamic> requests = new List<dynamic>();

        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = new SqlCommand("GetMyBookRequests", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@AskerId", askerId);

                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        dynamic request = new ExpandoObject();
                        var requestDict = (IDictionary<string, object>)request;

                        for (int i = 0; i < reader.FieldCount; i++)
                        {
                            requestDict[reader.GetName(i)] = reader.GetValue(i);
                        }

                        requests.Add(request);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }

        return requests;
    }

    // OwnerBookRequests Procedure
    public async Task<List<dynamic>> OwnerBookRequests(int ownerId)
    {
        List<dynamic> requests = new List<dynamic>();

        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = new SqlCommand("OwnerBookRequests", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@OwnerId", ownerId);

                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        dynamic request = new ExpandoObject();
                        var requestDict = (IDictionary<string, object>)request;

                        for (int i = 0; i < reader.FieldCount; i++)
                        {
                            requestDict[reader.GetName(i)] = reader.GetValue(i);
                        }

                        requests.Add(request);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }

        return requests;
    }

    // SetBookAsReaded Procedure
    public async Task<int> SetBookAsReaded(int userId, int bookId, bool readed)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = new SqlCommand("SetBookAsReaded", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@UserId", userId);
                cmd.Parameters.AddWithValue("@BookId", bookId);
                cmd.Parameters.AddWithValue("@Readed", readed);

                return await cmd.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }

    // SetBookWantToRead Procedure
    public async Task<int> SetBookWantToRead(int userId, int bookId, bool wantToRead)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = new SqlCommand("SetBookWantToRead", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@UserId", userId);
                cmd.Parameters.AddWithValue("@BookId", bookId);
                cmd.Parameters.AddWithValue("@WantToRead", wantToRead);

                return await cmd.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }

    // ChangeBookOwner Procedure
    public async Task<int> ChangeBookOwner(int askerId, int currentOwnerId, int bookId)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = new SqlCommand("ChangeBookOwner", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@AskerId", askerId);
                cmd.Parameters.AddWithValue("@CurrentOwnerId", currentOwnerId);
                cmd.Parameters.AddWithValue("@BookId", bookId);

                return await cmd.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }

    // GetUsersBooks Procedure
    public async Task<List<dynamic>> GetUsersBooks()
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = new SqlCommand("GetUsersBooks", con);
                cmd.CommandType = CommandType.StoredProcedure;

                List<dynamic> result = new List<dynamic>();
                con.Open();
                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        dynamic row = new ExpandoObject();
                        var rowDict = (IDictionary<string, object>)row;

                        for (int i = 0; i < reader.FieldCount; i++)
                        {
                            rowDict[reader.GetName(i)] = reader.GetValue(i);
                        }

                        result.Add(row);
                    }
                }

                return result;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }

    // AnswerRequest Procedure
    public async Task<int> AnswerRequest(int requestId, bool approved)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = new SqlCommand("AnswerRequest", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@RequestId", requestId);
                cmd.Parameters.AddWithValue("@Approved", approved);

                return await cmd.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }
    public async Task<int> RemoveBookRequest(int askerId, int ownerId, int bookId)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = new SqlCommand("RemoveBookRequest", con);
                cmd.CommandType = CommandType.StoredProcedure;

                // Add parameters required by the stored procedure
                cmd.Parameters.AddWithValue("@AskerId", askerId);
                cmd.Parameters.AddWithValue("@OwnerId", ownerId);
                cmd.Parameters.AddWithValue("@BookId", bookId);

                // Execute the command asynchronously and get the number of rows affected
                int rowsAffected = await cmd.ExecuteNonQueryAsync();
                return rowsAffected;
            }
        }
        catch (Exception ex)
        {
            // Log the exception details
            Console.WriteLine($"Error: {ex.Message}");
            throw; // Re-throw the exception if needed
        }
    }

    public async Task<List<User>> GetUsersThatHaveThisBook(int bookId)
    {
        List<User> users = new List<User>();

        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("UsersThatHaveThisBook", con);
                cmd.Parameters.AddWithValue("@BookId", bookId);

                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        User user = new User
                        {
                            Id = reader.GetInt32(reader.GetOrdinal("id")),
                            Name = reader.GetString(reader.GetOrdinal("name")),
                            Email = reader.GetString(reader.GetOrdinal("email")),
                            Image = reader.IsDBNull(reader.GetOrdinal("Image")) ? null : reader.GetString(reader.GetOrdinal("Image"))
                        };
                        users.Add(user);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }

        return users;
    }

    public async Task<List<User>> GetUsersThatHaveThisAuthor(string authorName)
    {
        List<User> users = new List<User>();

        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = CreateCommandWithStoredProcedure("UsersThatHaveThisAuthor", con);
                cmd.Parameters.AddWithValue("@AuthorName", authorName);

                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        User user = new User
                        {
                            Id = reader.GetInt32(reader.GetOrdinal("id")),
                            Name = reader.GetString(reader.GetOrdinal("name")),
                            Email = reader.GetString(reader.GetOrdinal("email")),
                            Image = reader.IsDBNull(reader.GetOrdinal("Image")) ? null : reader.GetString(reader.GetOrdinal("Image"))
                        };
                        users.Add(user);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }

        return users;
    }

    public async Task<int> AddQuiz(int userId, int grade, int question1, int question2, int question3, int question4, int question5, string answer1, string answer2, string answer3, string answer4, string answer5)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = new SqlCommand("addQuiz", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@UserID", userId);
                cmd.Parameters.AddWithValue("@Grade", grade);
                cmd.Parameters.AddWithValue("@Question1", question1);
                cmd.Parameters.AddWithValue("@Question2", question2);
                cmd.Parameters.AddWithValue("@Question3", question3);
                cmd.Parameters.AddWithValue("@Question4", question4);
                cmd.Parameters.AddWithValue("@Question5", question5);
                cmd.Parameters.AddWithValue("@Answer1", answer1);
                cmd.Parameters.AddWithValue("@Answer2", answer2);
                cmd.Parameters.AddWithValue("@Answer3", answer3);
                cmd.Parameters.AddWithValue("@Answer4", answer4);
                cmd.Parameters.AddWithValue("@Answer5", answer5);

                return await cmd.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }


    public async Task<List<dynamic>> GetQuizzesForUser(int userId)
    {
        List<dynamic> quizzes = new List<dynamic>();

        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = new SqlCommand("getQuizsForUser", con);
                cmd.CommandType = CommandType.StoredProcedure;

                // Add the UserID parameter
                cmd.Parameters.AddWithValue("@UserID", userId);

                // Execute the stored procedure
                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        dynamic quiz = new ExpandoObject();
                        var quizDict = (IDictionary<string, object>)quiz;

                        // Read basic quiz information
                        quizDict["UserID"] = reader.IsDBNull(reader.GetOrdinal("UserID")) ? (int?)null : Convert.ToInt32(reader["UserID"]);
                        quizDict["QuizID"] = reader.IsDBNull(reader.GetOrdinal("QuizID")) ? (int?)null : Convert.ToInt32(reader["QuizID"]);
                        quizDict["QuizDate"] = reader.IsDBNull(reader.GetOrdinal("QuizDate")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("QuizDate"));
                        quizDict["Grade"] = reader.IsDBNull(reader.GetOrdinal("Grade")) ? (int?)null : Convert.ToInt32(reader["Grade"]);

                        // Read questions and answers
                        quizDict["Question1"] = new
                        {
                            Text = reader.IsDBNull(reader.GetOrdinal("Question1")) ? null : reader.GetString(reader.GetOrdinal("Question1")),
                            CorrectAnswer = reader.IsDBNull(reader.GetOrdinal("CorrectAnswer1")) ? null : reader.GetString(reader.GetOrdinal("CorrectAnswer1")),
                            IncorrectAnswer1 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer1_1")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer1_1")),
                            IncorrectAnswer2 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer1_2")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer1_2")),
                            IncorrectAnswer3 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer1_3")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer1_3")),
                            UserAnswer = reader.IsDBNull(reader.GetOrdinal("UserAnswer1")) ? null : reader.GetString(reader.GetOrdinal("UserAnswer1")),
                        };

                        quizDict["Question2"] = new
                        {
                            Text = reader.IsDBNull(reader.GetOrdinal("Question2")) ? null : reader.GetString(reader.GetOrdinal("Question2")),
                            CorrectAnswer = reader.IsDBNull(reader.GetOrdinal("CorrectAnswer2")) ? null : reader.GetString(reader.GetOrdinal("CorrectAnswer2")),
                            IncorrectAnswer1 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer2_1")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer2_1")),
                            IncorrectAnswer2 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer2_2")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer2_2")),
                            IncorrectAnswer3 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer2_3")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer2_3")),
                            UserAnswer = reader.IsDBNull(reader.GetOrdinal("UserAnswer2")) ? null : reader.GetString(reader.GetOrdinal("UserAnswer2")),
                        };

                        quizDict["Question3"] = new
                        {
                            Text = reader.IsDBNull(reader.GetOrdinal("Question3")) ? null : reader.GetString(reader.GetOrdinal("Question3")),
                            CorrectAnswer = reader.IsDBNull(reader.GetOrdinal("CorrectAnswer3")) ? null : reader.GetString(reader.GetOrdinal("CorrectAnswer3")),
                            IncorrectAnswer1 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer3_1")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer3_1")),
                            IncorrectAnswer2 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer3_2")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer3_2")),
                            IncorrectAnswer3 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer3_3")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer3_3")),
                            UserAnswer = reader.IsDBNull(reader.GetOrdinal("UserAnswer3")) ? null : reader.GetString(reader.GetOrdinal("UserAnswer3")),
                        };

                        quizDict["Question4"] = new
                        {
                            Text = reader.IsDBNull(reader.GetOrdinal("Question4")) ? null : reader.GetString(reader.GetOrdinal("Question4")),
                            CorrectAnswer = reader.IsDBNull(reader.GetOrdinal("CorrectAnswer4")) ? null : reader.GetString(reader.GetOrdinal("CorrectAnswer4")),
                            IncorrectAnswer1 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer4_1")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer4_1")),
                            IncorrectAnswer2 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer4_2")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer4_2")),
                            IncorrectAnswer3 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer4_3")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer4_3")),
                            UserAnswer = reader.IsDBNull(reader.GetOrdinal("UserAnswer4")) ? null : reader.GetString(reader.GetOrdinal("UserAnswer4")),
                        };

                        quizDict["Question5"] = new
                        {
                            Text = reader.IsDBNull(reader.GetOrdinal("Question5")) ? null : reader.GetString(reader.GetOrdinal("Question5")),
                            CorrectAnswer = reader.IsDBNull(reader.GetOrdinal("CorrectAnswer5")) ? null : reader.GetString(reader.GetOrdinal("CorrectAnswer5")),
                            IncorrectAnswer1 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer5_1")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer5_1")),
                            IncorrectAnswer2 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer5_2")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer5_2")),
                            IncorrectAnswer3 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer5_3")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer5_3")),
                            UserAnswer = reader.IsDBNull(reader.GetOrdinal("UserAnswer5")) ? null : reader.GetString(reader.GetOrdinal("UserAnswer5")),
                        };

                        quizzes.Add(quiz);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }

        return quizzes;
    }

    public async Task<int> InsertQuestion(Question question)
    {
        int questionId = 0;

        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = new SqlCommand("InsertQuestion", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Question", question.QuestionText);
                cmd.Parameters.AddWithValue("@CorrectAnswer", question.CorrectAnswer);
                cmd.Parameters.AddWithValue("@IncorrectAnswer1", question.IncorrectAnswer1);
                cmd.Parameters.AddWithValue("@IncorrectAnswer2", question.IncorrectAnswer2);
                cmd.Parameters.AddWithValue("@IncorrectAnswer3", question.IncorrectAnswer3);

                SqlParameter outputIdParam = new SqlParameter("@QuestionID", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };
                cmd.Parameters.Add(outputIdParam);

                await cmd.ExecuteNonQueryAsync();

                questionId = (int)outputIdParam.Value;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }

        return questionId;
    }

    public async Task<List<dynamic>> CreateQuizAndGetQuestions(int userId)
    {
        List<dynamic> questions = new List<dynamic>();

        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = new SqlCommand("CreateQuestionForUser", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@UserID", userId);

                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        dynamic question = new ExpandoObject();
                        question.QuestionText = reader.IsDBNull(reader.GetOrdinal("Question")) ? null : reader.GetString(reader.GetOrdinal("Question"));
                        question.CorrectAnswer = reader.IsDBNull(reader.GetOrdinal("CorrectAnswer")) ? null : reader.GetString(reader.GetOrdinal("CorrectAnswer"));
                        question.IncorrectAnswer1 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer1")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer1"));
                        question.IncorrectAnswer2 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer2")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer2"));
                        question.IncorrectAnswer3 = reader.IsDBNull(reader.GetOrdinal("IncorrectAnswer3")) ? null : reader.GetString(reader.GetOrdinal("IncorrectAnswer3"));

                        questions.Add(question);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in CreateQuizAndGetQuestions: {ex.Message}");
            throw;
        }

        return questions;
    }

    public async Task<int> AddReview(Review review)
    {
        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("AddReview", con);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@UserID", review.UserID);
            cmd.Parameters.AddWithValue("@BookID", review.BookID);
            cmd.Parameters.AddWithValue("@Caption", review.Caption);
            cmd.Parameters.AddWithValue("@Rating", review.Rating);

            return await cmd.ExecuteNonQueryAsync();
        }
    }

    public async Task<List<dynamic>> GetAllReviews()
    {
        List<dynamic> reviews = new List<dynamic>();

        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("GetAllReviews", con);
            cmd.CommandType = CommandType.StoredProcedure;

            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    var review = new
                    {
                        ReviewID = reader.GetInt32(reader.GetOrdinal("ReviewID")),
                        UserID = reader.GetInt32(reader.GetOrdinal("UserID")),
                        UserName = reader.IsDBNull(reader.GetOrdinal("UserName")) ? null : reader.GetString(reader.GetOrdinal("UserName")),
                        UserEmail = reader.IsDBNull(reader.GetOrdinal("UserEmail")) ? null : reader.GetString(reader.GetOrdinal("UserEmail")),
                        UserImage = reader.IsDBNull(reader.GetOrdinal("UserImage")) ? null : reader.GetString(reader.GetOrdinal("UserImage")),
                        BookID = reader.GetInt32(reader.GetOrdinal("BookID")),
                        BookName = reader.IsDBNull(reader.GetOrdinal("BookName")) ? null : reader.GetString(reader.GetOrdinal("BookName")),
                        AuthorName = reader.IsDBNull(reader.GetOrdinal("AuthorName")) ? null : reader.GetString(reader.GetOrdinal("AuthorName")),
                        BookImage = reader.IsDBNull(reader.GetOrdinal("BookImage")) ? null : reader.GetString(reader.GetOrdinal("BookImage")),
                        BookPrice = reader.GetDecimal(reader.GetOrdinal("price")),
                        BookRating = reader.GetDecimal(reader.GetOrdinal("BookRating")),
                        IsDigital = reader.GetBoolean(reader.GetOrdinal("IsDigital")),
                        IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                        ReviewDate = reader.GetDateTime(reader.GetOrdinal("ReviewDate")),
                        Caption = reader.IsDBNull(reader.GetOrdinal("Caption")) ? null : reader.GetString(reader.GetOrdinal("Caption")),
                        Rating = reader.GetByte(reader.GetOrdinal("Rating")), // Adjusted for TINYINT
                        LikeCount = reader.GetInt32(reader.GetOrdinal("LikeCount")),
                        CommentCount = reader.GetInt32(reader.GetOrdinal("CommentCount"))
                    };
                    reviews.Add(review);
                }
            }
        }

        return reviews;
    }


    public async Task<List<dynamic>> GetReviewsForBook(int bookID)
    {
        List<dynamic> reviews = new List<dynamic>();

        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("GetReviewsForBook", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@BookID", bookID);

            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    var review = new
                    {
                        ReviewID = reader.GetInt32(reader.GetOrdinal("ReviewID")),
                        UserID = reader.GetInt32(reader.GetOrdinal("UserID")),
                        UserName = reader.IsDBNull(reader.GetOrdinal("UserName")) ? null : reader.GetString(reader.GetOrdinal("UserName")),
                        UserEmail = reader.IsDBNull(reader.GetOrdinal("UserEmail")) ? null : reader.GetString(reader.GetOrdinal("UserEmail")),
                        UserImage = reader.IsDBNull(reader.GetOrdinal("UserImage")) ? null : reader.GetString(reader.GetOrdinal("UserImage")),
                        BookID = reader.GetInt32(reader.GetOrdinal("BookID")),
                        BookName = reader.IsDBNull(reader.GetOrdinal("BookName")) ? null : reader.GetString(reader.GetOrdinal("BookName")),
                        AuthorName = reader.IsDBNull(reader.GetOrdinal("AuthorName")) ? null : reader.GetString(reader.GetOrdinal("AuthorName")),
                        BookImage = reader.IsDBNull(reader.GetOrdinal("BookImage")) ? null : reader.GetString(reader.GetOrdinal("BookImage")),
                        BookPrice = reader.GetDecimal(reader.GetOrdinal("price")),
                        BookRating = reader.GetDecimal(reader.GetOrdinal("BookRating")),
                        IsDigital = reader.GetBoolean(reader.GetOrdinal("IsDigital")),
                        IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                        ReviewDate = reader.GetDateTime(reader.GetOrdinal("ReviewDate")),
                        Caption = reader.IsDBNull(reader.GetOrdinal("Caption")) ? null : reader.GetString(reader.GetOrdinal("Caption")),
                        Rating = reader.GetByte(reader.GetOrdinal("Rating")), // Adjusted for TINYINT
                        LikeCount = reader.GetInt32(reader.GetOrdinal("LikeCount")),
                        CommentCount = reader.GetInt32(reader.GetOrdinal("CommentCount"))
                    };
                    reviews.Add(review);
                }
            }
        }

        return reviews;
    }

    public async Task<List<dynamic>> GetReviewsByUser(int userID)
    {
        List<dynamic> reviews = new List<dynamic>();

        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("GetReviewsByUser", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UserID", userID);

            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    var review = new
                    {
                        ReviewID = reader.GetInt32(reader.GetOrdinal("ReviewID")),
                        UserID = reader.GetInt32(reader.GetOrdinal("UserID")),
                        UserName = reader.IsDBNull(reader.GetOrdinal("UserName")) ? null : reader.GetString(reader.GetOrdinal("UserName")),
                        UserEmail = reader.IsDBNull(reader.GetOrdinal("UserEmail")) ? null : reader.GetString(reader.GetOrdinal("UserEmail")),
                        UserImage = reader.IsDBNull(reader.GetOrdinal("UserImage")) ? null : reader.GetString(reader.GetOrdinal("UserImage")),
                        BookID = reader.GetInt32(reader.GetOrdinal("BookID")),
                        BookName = reader.IsDBNull(reader.GetOrdinal("BookName")) ? null : reader.GetString(reader.GetOrdinal("BookName")),
                        AuthorName = reader.IsDBNull(reader.GetOrdinal("AuthorName")) ? null : reader.GetString(reader.GetOrdinal("AuthorName")),
                        BookImage = reader.IsDBNull(reader.GetOrdinal("BookImage")) ? null : reader.GetString(reader.GetOrdinal("BookImage")),
                        BookPrice = reader.GetDecimal(reader.GetOrdinal("price")),
                        BookRating = reader.GetDecimal(reader.GetOrdinal("BookRating")),
                        IsDigital = reader.GetBoolean(reader.GetOrdinal("IsDigital")),
                        IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                        ReviewDate = reader.GetDateTime(reader.GetOrdinal("ReviewDate")),
                        Caption = reader.IsDBNull(reader.GetOrdinal("Caption")) ? null : reader.GetString(reader.GetOrdinal("Caption")),
                        Rating = reader.GetByte(reader.GetOrdinal("Rating")), // Adjusted for TINYINT
                        LikeCount = reader.GetInt32(reader.GetOrdinal("LikeCount")),
                        CommentCount = reader.GetInt32(reader.GetOrdinal("CommentCount"))
                    };
                    reviews.Add(review);
                }
            }
        }

        return reviews;
    }

    public async Task<List<ReviewComment>> GetReviewComments(int reviewID)
    {
        List<ReviewComment> comments = new List<ReviewComment>();

        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("GetReviewComments", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@ReviewID", reviewID);

            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    ReviewComment comment = new ReviewComment
                    {
                        CommentID = reader.GetInt32(reader.GetOrdinal("CommentID")),
                        ReviewID = reader.GetInt32(reader.GetOrdinal("ReviewID")),
                        UserID = reader.GetInt32(reader.GetOrdinal("UserID")),
                        UserName = reader.GetString(reader.GetOrdinal("UserName")),
                        UserEmail = reader.GetString(reader.GetOrdinal("UserEmail")),
                        UserImage = reader.GetString(reader.GetOrdinal("UserImage")),
                        CommentDate = reader.GetDateTime(reader.GetOrdinal("CommentDate")),
                        CommentText = reader.GetString(reader.GetOrdinal("CommentText"))
                    };
                    comments.Add(comment);
                }
            }
        }

        return comments;
    }

    public async Task<bool> DeleteReview(int reviewID)
    {
        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("DeleteReview", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@ReviewID", reviewID);

            int rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }
    }

    public async Task AddLike(int userID, int reviewID)
    {
        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("AddLike", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UserID", userID);
            cmd.Parameters.AddWithValue("@ReviewID", reviewID);

            await cmd.ExecuteNonQueryAsync();
        }
    }

    public async Task AddComment(int userID, int reviewID, string comment)
    {
        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("AddComment", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UserID", userID);
            cmd.Parameters.AddWithValue("@ReviewID", reviewID);
            cmd.Parameters.AddWithValue("@Comment", comment);

            await cmd.ExecuteNonQueryAsync();
        }
    }
    public async Task<List<dynamic>> GetReviewsILiked(int userID)
    {
        List<dynamic> reviews = new List<dynamic>();

        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("GetReviewsILiked", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UserID", userID);

            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    var review = new
                    {
                        ReviewID = reader.GetInt32(reader.GetOrdinal("ReviewID")),
                        UserID = reader.GetInt32(reader.GetOrdinal("UserID")),
                        UserName = reader.IsDBNull(reader.GetOrdinal("UserName")) ? null : reader.GetString(reader.GetOrdinal("UserName")),
                        UserEmail = reader.IsDBNull(reader.GetOrdinal("UserEmail")) ? null : reader.GetString(reader.GetOrdinal("UserEmail")),
                        UserImage = reader.IsDBNull(reader.GetOrdinal("UserImage")) ? null : reader.GetString(reader.GetOrdinal("UserImage")),
                        BookID = reader.GetInt32(reader.GetOrdinal("BookID")),
                        BookName = reader.IsDBNull(reader.GetOrdinal("BookName")) ? null : reader.GetString(reader.GetOrdinal("BookName")),
                        AuthorName = reader.IsDBNull(reader.GetOrdinal("AuthorName")) ? null : reader.GetString(reader.GetOrdinal("AuthorName")),
                        BookImage = reader.IsDBNull(reader.GetOrdinal("BookImage")) ? null : reader.GetString(reader.GetOrdinal("BookImage")),
                        BookPrice = reader.GetDecimal(reader.GetOrdinal("price")),
                        BookRating = reader.GetDecimal(reader.GetOrdinal("BookRating")),
                        IsDigital = reader.GetBoolean(reader.GetOrdinal("IsDigital")),
                        IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                        ReviewDate = reader.GetDateTime(reader.GetOrdinal("ReviewDate")),
                        Caption = reader.IsDBNull(reader.GetOrdinal("Caption")) ? null : reader.GetString(reader.GetOrdinal("Caption")),
                        Rating = reader.GetByte(reader.GetOrdinal("Rating")), // Adjusted for TINYINT
                        LikeCount = reader.GetInt32(reader.GetOrdinal("LikeCount")),
                        CommentCount = reader.GetInt32(reader.GetOrdinal("CommentCount"))
                    };
                    reviews.Add(review);
                }
            }
        }

        return reviews;
    }

    public async Task RemoveLike(int userID, int reviewID)
    {
        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("RemoveLike", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UserID", userID);
            cmd.Parameters.AddWithValue("@ReviewID", reviewID);

            await cmd.ExecuteNonQueryAsync();
        }
    }

    public async Task<bool> RemoveComment(int userID, int reviewID, string commentText)
    {
        try
        {
            using (SqlConnection con = Connect())
            {
                SqlCommand cmd = new SqlCommand("RemoveComment", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@UserID", userID);
                cmd.Parameters.AddWithValue("@ReviewID", reviewID);
                cmd.Parameters.AddWithValue("@CommentText", commentText);

                await cmd.ExecuteNonQueryAsync();
            }
            return true;
        }
        catch (Exception ex)
        {
            // Log exception or handle error
            return false;
        }
    }

    public async Task<int> GetFriendsCount(int userID)
    {
        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("GetFriendsCount", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UserID", userID);

            return (int)await cmd.ExecuteScalarAsync();
        }
    }

    public async Task<List<dynamic>> GetAllUserFriends(int userID)
    {
        List<dynamic> friends = new List<dynamic>();

        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("GetAllUserFriends", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UserID", userID);

            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    var friend = new
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("id")),
                        Name = reader.GetString(reader.GetOrdinal("name")),
                        Email = reader.GetString(reader.GetOrdinal("email")),
                        Image = reader.IsDBNull(reader.GetOrdinal("Image")) ? null : reader.GetString(reader.GetOrdinal("Image")),
                        IsActive = reader.GetBoolean(reader.GetOrdinal("isActive")),
                        FriendsCount = reader.GetInt32(reader.GetOrdinal("FriendsCount"))
                    };
                    friends.Add(friend);
                }
            }
        }

        return friends;
    }

    public async Task<List<dynamic>> GetAllUserFriendRequests(int userID)
    {
        List<dynamic> friendRequests = new List<dynamic>();

        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("GetAllUserFriendRequests", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UserID", userID);

            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    var request = new
                    {
                        RequestID = reader.GetInt32(reader.GetOrdinal("RequestID")),
                        SenderID = reader.GetInt32(reader.GetOrdinal("SenderID")),
                        ReceiverID = reader.GetInt32(reader.GetOrdinal("ReceiverID")),
                        RequestDate = reader.GetDateTime(reader.GetOrdinal("RequestDate")),
                        Status = reader.GetString(reader.GetOrdinal("Status")),
                        SenderUserID = reader.GetInt32(reader.GetOrdinal("SenderUserID")),
                        SenderName = reader.GetString(reader.GetOrdinal("SenderName")),
                        SenderEmail = reader.GetString(reader.GetOrdinal("SenderEmail")),
                        SenderImage = reader.IsDBNull(reader.GetOrdinal("SenderImage")) ? null : reader.GetString(reader.GetOrdinal("SenderImage")),
                        SenderIsActive = reader.GetBoolean(reader.GetOrdinal("SenderIsActive"))
                    };
                    friendRequests.Add(request);
                }
            }
        }

        return friendRequests;
    }


    public async Task<List<dynamic>> GetAllUserFriendRequestsSent(int userID)
    {
        List<dynamic> friendRequestsSent = new List<dynamic>();

        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("GetAllUserFriendRequestsSent", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UserID", userID);

            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    var requestSent = new
                    {
                        RequestID = reader.GetInt32(reader.GetOrdinal("RequestID")),
                        SenderID = reader.GetInt32(reader.GetOrdinal("SenderID")),
                        ReceiverID = reader.GetInt32(reader.GetOrdinal("ReceiverID")),
                        RequestDate = reader.GetDateTime(reader.GetOrdinal("RequestDate")),
                        Status = reader.GetString(reader.GetOrdinal("Status")),
                        ReceiverUserID = reader.GetInt32(reader.GetOrdinal("ReceiverUserID")),
                        ReceiverName = reader.GetString(reader.GetOrdinal("ReceiverName")),
                        ReceiverEmail = reader.GetString(reader.GetOrdinal("ReceiverEmail")),
                        ReceiverImage = reader.IsDBNull(reader.GetOrdinal("ReceiverImage")) ? null : reader.GetString(reader.GetOrdinal("ReceiverImage")),
                        ReceiverIsActive = reader.GetBoolean(reader.GetOrdinal("ReceiverIsActive"))
                    };
                    friendRequestsSent.Add(requestSent);
                }
            }
        }

        return friendRequestsSent;
    }


    public async Task AcceptFriendRequest(int senderID, int receiverID)
    {
        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("AcceptFriendRequest", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@SenderID", senderID);
            cmd.Parameters.AddWithValue("@ReceiverID", receiverID);

            await cmd.ExecuteNonQueryAsync();
        }
    }

    public async Task DenyFriendRequest(int senderID, int receiverID)
    {
        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("DenyFriendRequest", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@SenderID", senderID);
            cmd.Parameters.AddWithValue("@ReceiverID", receiverID);

            await cmd.ExecuteNonQueryAsync();
        }
    }

    public async Task RemoveFriend(int userID, int removedUserID)
    {
        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("RemoveFriend", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UserID", userID);
            cmd.Parameters.AddWithValue("@RemovedUserID", removedUserID);

            await cmd.ExecuteNonQueryAsync();
        }
    }

    public async Task CancelFriendRequest(int senderID, int receiverID)
    {
        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("CancelFriendRequest", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@SenderID", senderID);
            cmd.Parameters.AddWithValue("@ReceiverID", receiverID);

            await cmd.ExecuteNonQueryAsync();
        }
    }

    public async Task SendFriendRequest(int senderID, int receiverID)
    {
        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("SendFriendRequest", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@SenderID", senderID);
            cmd.Parameters.AddWithValue("@ReceiverID", receiverID);

            await cmd.ExecuteNonQueryAsync();
        }
    }

    public async Task<List<dynamic>> GetAllMessagesBetweenUsers(int userId1, int userId2)
{
        List<dynamic> messages = new List<dynamic>();

        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("GetAllMessagesBetweenUsers", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UserId1", userId1);
            cmd.Parameters.AddWithValue("@UserId2", userId2);

            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    var message = new
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("Id")),
                        SenderId = reader.GetInt32(reader.GetOrdinal("SenderId")),
                        ReceiverId = reader.GetInt32(reader.GetOrdinal("ReceiverId")),
                        MessageText = reader.GetString(reader.GetOrdinal("MessageText")),
                        SentAt = reader.GetDateTime(reader.GetOrdinal("SentAt"))
                    };
                    messages.Add(message);
                }
            }
        }

        return messages;
    }

    public async Task SendMessage(int senderId, int receiverId, string messageText)
    {
        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("SendMessage", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@SenderId", senderId);
            cmd.Parameters.AddWithValue("@ReceiverId", receiverId);
            cmd.Parameters.AddWithValue("@MessageText", messageText);

            await cmd.ExecuteNonQueryAsync();
        }
    }

    public async Task DeleteMessage(int messageId, int userId)
    {
        using (SqlConnection con = Connect())
        {
            SqlCommand cmd = new SqlCommand("DeleteMessage", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@MessageId", messageId);
            cmd.Parameters.AddWithValue("@UserId", userId);

            await cmd.ExecuteNonQueryAsync();
        }
    }

    private SqlCommand CreateCommandWithStoredProcedure(string spName, SqlConnection con)
    {
        SqlCommand cmd = new SqlCommand
        {
            Connection = con,
            CommandText = spName,
            CommandTimeout = 10,
            CommandType = CommandType.StoredProcedure
        };

        return cmd;
    }
}