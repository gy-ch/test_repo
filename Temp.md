> Link: https://stackoverflow.com/questions/39877165/handling-jwt-expiration-in-net-mvc-application
> 
> Link: https://www.codemag.com/Article/2105051/Implementing-JWT-Authentication-in-ASP.NET-Core-5

```
public string Test()
{
    UserDTO validUser = userRepository.GetUser(new UserModel() { UserName = "stephensmith", Password = "stephen123" });
    string generatedToken = tokenService.BuildToken(configuration["Jwt:Key"], configuration["Jwt:Issuer"], validUser);

    JwtSecurityTokenHandler jwtSecurityTokenHandler = new JwtSecurityTokenHandler();
    JwtSecurityToken jwtSecurityToken = jwtSecurityTokenHandler.ReadJwtToken(generatedToken);
    DateTime expDate = jwtSecurityToken.ValidTo;
    DateTime generateDate = jwtSecurityToken.ValidFrom;
    return $"{DateTime.UtcNow} until {expDate.ToUniversalTime()}";
}
```
> https://bootstrapious.com/p/bootstrap-sidebar

```
IEnumerable<string> roleList = new List<string>()
{
    "Participant",
    "Panel",
    "Facilitator",
    "Administrator"
};

foreach(string role in roleList)
{
    bool result = roleManager.RoleExistsAsync(role).Result;
    if(!result)
    {
        roleManager.CreateAsync(new IdentityRole(role));
    }
}
```

```
services.AddIdentity<IdentityUser, IdentityRole>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<iTasmiWebIdentityDbContext>();
```
