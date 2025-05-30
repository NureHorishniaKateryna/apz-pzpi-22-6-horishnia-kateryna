package ua.nure.apz;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.gson.Gson;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import ua.nure.apz.api.ApiClient;
import ua.nure.apz.api.ApiService;
import ua.nure.apz.api.AuthResponse;
import ua.nure.apz.api.RegisterRequest;

public class RegisterActivity extends AppCompatActivity {
    private EditText emailField, passwordField, firstNameField, lastNameField;
    private Button registerButton;
    private TextView statusText, loginInsteadText;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_register);

        emailField = findViewById(R.id.emailInput);
        passwordField = findViewById(R.id.passwordInput);
        firstNameField = findViewById(R.id.firstNameInput);
        lastNameField = findViewById(R.id.lastNameInput);
        registerButton = findViewById(R.id.registerButton);
        statusText = findViewById(R.id.statusText);
        loginInsteadText = findViewById(R.id.goToLogin);

        apiService = ApiClient.getClient().create(ApiService.class);

        registerButton.setOnClickListener(v -> register());

        loginInsteadText.setOnClickListener(v -> {
            startActivity(new Intent(RegisterActivity.this, LoginActivity.class));
            finish();
        });
    }

    private void register() {
        String email = emailField.getText().toString();
        String password = passwordField.getText().toString();
        String firstName = firstNameField.getText().toString();
        String lastName = lastNameField.getText().toString();

        RegisterRequest request = new RegisterRequest(email, password, firstName, lastName);

        apiService.register(request).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<AuthResponse> call, @NonNull Response<AuthResponse> response) {
                if (response.isSuccessful()) {
                    SharedPreferences prefs = getSharedPreferences("apz", MODE_PRIVATE);
                    prefs.edit().putString("token", response.body().token).apply();

                    startActivity(new Intent(RegisterActivity.this, MainActivity.class));
                    finish();
                } else {
                    try {
                        AuthResponse error = new Gson().fromJson(response.errorBody().string(), AuthResponse.class);
                        statusText.setText(String.format(getString(R.string.error_fmt), error.error));
                    } catch (Exception e) {
                        statusText.setText(R.string.failed_to_parse_error);
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<AuthResponse> call, @NonNull Throwable t) {
                statusText.setText(String.format(getString(R.string.network_error_fmt), t.getMessage()));
            }
        });
    }
}