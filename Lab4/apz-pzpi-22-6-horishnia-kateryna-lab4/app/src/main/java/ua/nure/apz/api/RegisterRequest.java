package ua.nure.apz.api;

public class RegisterRequest {
    public String email;
    public String password;
    public String first_name;
    public String last_name;

    public RegisterRequest(String email, String password, String firstName, String lastName) {
        this.email = email;
        this.password = password;
        this.first_name = firstName;
        this.last_name = lastName;
    }
}
