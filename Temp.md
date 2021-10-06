Link: https://stackoverflow.com/questions/39877165/handling-jwt-expiration-in-net-mvc-application
Link: https://www.codemag.com/Article/2105051/Implementing-JWT-Authentication-in-ASP.NET-Core-5

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
