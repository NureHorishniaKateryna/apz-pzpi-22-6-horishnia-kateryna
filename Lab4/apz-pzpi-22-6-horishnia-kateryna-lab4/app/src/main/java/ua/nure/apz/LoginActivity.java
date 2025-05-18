package ua.nure.apz;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.gson.Gson;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import ua.nure.apz.api.ApiClient;
import ua.nure.apz.api.ApiService;
import ua.nure.apz.api.AuthResponse;
import ua.nure.apz.api.LoginRequest;

public class LoginActivity extends AppCompatActivity {
    private EditText emailField, passwordField;
    private Button loginButton;
    private TextView statusText, registerInsteadText;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_login);

        emailField = findViewById(R.id.emailInput);
        passwordField = findViewById(R.id.passwordInput);
        loginButton = findViewById(R.id.loginButton);
        statusText = findViewById(R.id.statusText);
        registerInsteadText = findViewById(R.id.goToRegister);

        apiService = ApiClient.getClient().create(ApiService.class);

        loginButton.setOnClickListener(v -> login());

        registerInsteadText.setOnClickListener(v -> {
            startActivity(new Intent(LoginActivity.this, RegisterActivity.class));
            finish();
        });
    }

    private void login() {
        String email = emailField.getText().toString();
        String password = passwordField.getText().toString();
        LoginRequest request = new LoginRequest(email, password);

        apiService.login(request).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<AuthResponse> call, @NonNull Response<AuthResponse> response) {
                if (response.isSuccessful()) {
                    SharedPreferences prefs = getSharedPreferences("apz", MODE_PRIVATE);
                    prefs.edit().putString("token", response.body().token).apply();

                    startActivity(new Intent(LoginActivity.this, MainActivity.class));
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
                statusText.setText(String.format(getString(R.string.network_error), t.getMessage()));
            }
        });
    }
}