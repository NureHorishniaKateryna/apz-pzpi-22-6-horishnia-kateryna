package ua.nure.apz;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import java.text.DecimalFormat;
import java.text.NumberFormat;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import ua.nure.apz.api.AnalyticsItem;
import ua.nure.apz.api.AnalyticsResponse;
import ua.nure.apz.api.ApiClient;
import ua.nure.apz.api.ApiService;
import ua.nure.apz.api.Device;
import ua.nure.apz.components.AnalyticsCard;

public class DeviceAnalyticsActivity extends AppCompatActivity {
    private String authToken;
    private long deviceId;
    private ApiService apiService;

    private AnalyticsCard thisMonthCard;
    private AnalyticsCard last28DaysCard;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_device_analytics);

        thisMonthCard = findViewById(R.id.thisMonthCard);
        last28DaysCard = findViewById(R.id.last28DaysCard);

        thisMonthCard.setName("This month");
        last28DaysCard.setName("Last 28 days");

        SharedPreferences prefs = getSharedPreferences("apz", MODE_PRIVATE);
        authToken = prefs.getString("token", null);
        if(authToken == null) {
            startActivity(new Intent(DeviceAnalyticsActivity.this, LoginActivity.class));
            finish();
        }

        deviceId = getIntent().getLongExtra("deviceId", -1);
        if (deviceId == -1) {
            finish();
            return;
        }

        apiService = ApiClient.getClient().create(ApiService.class);

        fetchDeviceAnalytics();
    }

    private static final NumberFormat DOUBLE_FMT = new DecimalFormat("#0.00");

    private void setCardValues(AnalyticsCard card, AnalyticsItem item) {
        card.setEnableCount(String.valueOf(item.getEnableCount()));
        card.setTotalTime(DOUBLE_FMT.format(item.getTotalEnabledTime()));
        card.setAverageTime(DOUBLE_FMT.format(item.getAverageEnabledTime()));
        card.setElectricityConsumption(DOUBLE_FMT.format(item.getElectricityConsumption()));
        card.setElectricityPrice(DOUBLE_FMT.format(item.getElectricityPrice()));
    }

    private void setValues(AnalyticsResponse resp) {
        setCardValues(thisMonthCard, resp.getThisMonth());
        setCardValues(last28DaysCard, resp.getLast28Days());
    }

    private void fetchDeviceAnalytics() {
        apiService.getDeviceAnalytics(authToken, deviceId).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<AnalyticsResponse> call, @NonNull Response<AnalyticsResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    setValues(response.body());
                } else {
                    Toast.makeText(DeviceAnalyticsActivity.this, R.string.failed_to_load_analytics, Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<AnalyticsResponse> call, @NonNull Throwable t) {
                Toast.makeText(DeviceAnalyticsActivity.this, R.string.network_error, Toast.LENGTH_SHORT).show();
            }
        });
    }
}