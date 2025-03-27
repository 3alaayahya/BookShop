using Microsoft.Extensions.FileProviders;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (true)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseStaticFiles(new StaticFileOptions()
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), @"uploadedFiles")),
    RequestPath = new PathString("/Images")
});

app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

app.UseAuthorization();

app.MapControllers();

app.Run();
////using EXC6Server.BL;
////using Microsoft.Extensions.FileProviders;

////var builder = WebApplication.CreateBuilder(args);

////// Add services to the container.
////builder.Services.AddSingleton<ChatHandler>();
////builder.Services.AddControllers();
////builder.Services.AddEndpointsApiExplorer();
////builder.Services.AddSwaggerGen();

////var app = builder.Build();

////if (app.Environment.IsDevelopment())
////{
////    app.UseDeveloperExceptionPage();
////    app.UseSwagger();
////    app.UseSwaggerUI();
////}
////else
////{
////    app.UseExceptionHandler("/Home/Error");
////    app.UseHsts();
////}

////var webSocketOptions = new WebSocketOptions
////{
////    KeepAliveInterval = TimeSpan.FromMinutes(2),
////    ReceiveBufferSize = 4 * 1024
////};

////app.UseHttpsRedirection();
////app.UseStaticFiles(new StaticFileOptions
////{
////    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), @"uploadedFiles")),
////    RequestPath = new PathString("/Images")
////});
////app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

////app.UseWebSockets();

////app.UseWebSockets(webSocketOptions);
////app.UseMiddleware<ChatWebSocketMiddleware>();

////app.UseRouting();
////app.UseAuthorization();
////app.MapControllers();

////app.Run();


//using EXC6Server.BL;
//using Microsoft.Extensions.FileProviders;
//var builder = WebApplication.CreateBuilder(args);

//// Add services to the container.
//builder.Services.AddSingleton<ChatHandler>();
//builder.Services.AddControllers();
//// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

//var app = builder.Build();

//// Configure the HTTP request pipeline.
//if (true)
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

//if (app.Environment.IsDevelopment())
//{
//    app.UseDeveloperExceptionPage();
//}
//else
//{
//    app.UseExceptionHandler("/Home/Error");
//    app.UseHsts();
//}
//var webSocketOptions = new WebSocketOptions
//{
//    KeepAliveInterval = TimeSpan.FromMinutes(2),
//    ReceiveBufferSize = 4 * 1024
//};
//app.UseHttpsRedirection();
//app.UseRouting();
//app.UseAuthorization();
//app.UseWebSockets();
//app.UseWebSockets(webSocketOptions);
//app.UseMiddleware<ChatWebSocketMiddleware>();

//app.UseStaticFiles(new StaticFileOptions()
//{
//    FileProvider = new PhysicalFileProvider(
//        Path.Combine(Directory.GetCurrentDirectory(), @"uploadedFiles")),
//    RequestPath = new PathString("/Images")
//});

//app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

//app.UseAuthorization();

//app.MapControllers();

//app.Run();
//var builder = WebApplication.CreateBuilder(args);

//// Add services to the container.

//builder.Services.AddControllers();
//// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

//var app = builder.Build();

//// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

//app.UseHttpsRedirection();

//app.UseAuthorization();

//app.MapControllers();

//app.Run();
