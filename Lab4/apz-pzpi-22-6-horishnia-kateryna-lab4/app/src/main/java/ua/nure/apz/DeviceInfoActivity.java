package ua.nure.apz;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Switch;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import ua.nure.apz.adapters.ReportAdapter;
import ua.nure.apz.api.ApiClient;
import ua.nure.apz.api.ApiService;
import ua.nure.apz.api.Device;
import ua.nure.apz.api.DeviceReport;
import ua.nure.apz.api.PaginatedResponse;
import ua.nure.apz.api.UpdateDeviceConfigRequest;
import ua.nure.apz.api.UpdateDeviceRequest;

public class DeviceInfoActivity extends AppCompatActivity {
    private EditText nameEditText, priceEditText, apiKeyTextView;
    private Switch autoSwitch;
    private Button manualToggleButton, saveButton, scheduleButton;
    private RecyclerView reportsRecyclerView;
    private ReportAdapter reportAdapter;

    private String authToken = null;
    private SharedPreferences prefs = null;
    private ApiService apiService;

    private long deviceId;
    private Device currentDevice;
    private boolean isLoading = false;
    private int page = 1;
    private int totalReports = Integer.MAX_VALUE;
    private final int PAGE_SIZE = 20;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_device_info);

        prefs = getSharedPreferences("apz", MODE_PRIVATE);
        authToken = prefs.getString("token", null);
        if(authToken == null) {
            startActivity(new Intent(DeviceInfoActivity.this, LoginActivity.class));
            finish();
        }

        nameEditText = findViewById(R.id.deviceName);
        priceEditText = findViewById(R.id.electricityPrice);
        apiKeyTextView = findViewById(R.id.apiKey);
        autoSwitch = findViewById(R.id.autoSwitch);
        manualToggleButton = findViewById(R.id.manualToggleButton);
        saveButton = findViewById(R.id.saveButton);
        scheduleButton = findViewById(R.id.scheduleButton);
        reportsRecyclerView = findViewById(R.id.reportsRecyclerView);

        reportsRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        reportAdapter = new ReportAdapter(new ArrayList<>());
        reportsRecyclerView.setAdapter(reportAdapter);

        deviceId = getIntent().getLongExtra("deviceId", -1);
        if (deviceId == -1) {
            finish();
            return;
        }

        apiService = ApiClient.getClient().create(ApiService.class);

        fetchDeviceInfo();
        loadReports();

        reportsRecyclerView.addOnScrollListener(new RecyclerView.OnScrollListener() {
            @Override
            public void onScrolled(@NonNull RecyclerView rv, int dx, int dy) {
                LinearLayoutManager lm = (LinearLayoutManager) rv.getLayoutManager();
                if (!isLoading && lm != null && lm.findLastVisibleItemPosition() >= reportAdapter.getItemCount() - 5) {
                    if (reportAdapter.getItemCount() < totalReports) {
                        page++;
                        loadReports();
                    }
                }
            }
        });

        manualToggleButton.setOnClickListener(v -> {
            if (currentDevice == null) {
                return;
            }

            apiService.updateDeviceConfig(authToken, deviceId, new UpdateDeviceConfigRequest(!currentDevice.getConfiguration().getEnabledManually(), null, null)).enqueue(new Callback<>() {
                @Override
                public void onResponse(@NonNull Call<Device> call, @NonNull Response<Device> response) {
                    currentDevice = response.body();
                    updateDeviceInfo();
                }

                @Override
                public void onFailure(@NonNull Call<Device> call, @NonNull Throwable t) {
                    Toast.makeText(DeviceInfoActivity.this, R.string.failed_to_update_state, Toast.LENGTH_SHORT).show();
                }
            });
        });

        saveButton.setOnClickListener(v -> {
            if (currentDevice != null) {
                String name = nameEditText.getText().toString();
                boolean enabledAuto = autoSwitch.isChecked();
                double price;
                try {
                    price = Double.parseDouble(priceEditText.getText().toString());
                } catch(Exception e) {
                    Toast.makeText(DeviceInfoActivity.this, R.string.invalid_electricity_price, Toast.LENGTH_SHORT).show();
                    return;
                }

                apiService.updateDevice(authToken, deviceId, new UpdateDeviceRequest(name)).enqueue(new Callback<>() {
                    @Override
                    public void onResponse(@NonNull Call<Device> call, @NonNull Response<Device> response) {
                        currentDevice = response.body();
                        updateDeviceInfo();
                        Toast.makeText(DeviceInfoActivity.this, R.string.name_saved, Toast.LENGTH_SHORT).show();
                    }

                    @Override
                    public void onFailure(@NonNull Call<Device> call, @NonNull Throwable t) {
                        Toast.makeText(DeviceInfoActivity.this, R.string.failed_to_save_name, Toast.LENGTH_SHORT).show();
                    }
                });

                apiService.updateDeviceConfig(authToken, deviceId, new UpdateDeviceConfigRequest(null, enabledAuto, price)).enqueue(new Callback<>() {
                    @Override
                    public void onResponse(@NonNull Call<Device> call, @NonNull Response<Device> response) {
                        currentDevice = response.body();
                        updateDeviceInfo();
                        Toast.makeText(DeviceInfoActivity.this, R.string.config_saved, Toast.LENGTH_SHORT).show();
                    }

                    @Override
                    public void onFailure(@NonNull Call<Device> call, @NonNull Throwable t) {
                        Toast.makeText(DeviceInfoActivity.this, R.string.failed_to_save_config, Toast.LENGTH_SHORT).show();
                    }
                });
            }
        });

        scheduleButton.setOnClickListener(v -> {
            Intent intent = new Intent(DeviceInfoActivity.this, DeviceScheduleActivity.class);
            intent.putExtra("deviceId", deviceId);
            startActivity(intent);
        });
    }

    private void updateDeviceInfo() {
        if(currentDevice == null) {
            return;
        }
        nameEditText.setText(currentDevice.getName());
        priceEditText.setText(String.valueOf(currentDevice.getConfiguration().getElectricityPrice()));
        apiKeyTextView.setText(currentDevice.getApiKey());
        autoSwitch.setChecked(currentDevice.getConfiguration().getEnabledAuto());
        if (currentDevice.getConfiguration().getEnabledManually()) {
            manualToggleButton.setText(R.string.turn_off);
        } else {
            manualToggleButton.setText(R.string.turn_on);
        }
    }

    private void fetchDeviceInfo() {
        apiService.getDevice(authToken, deviceId).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<Device> call, @NonNull Response<Device> response) {
                if (response.isSuccessful() && response.body() != null) {
                    currentDevice = response.body();
                    updateDeviceInfo();
                } else {
                    Toast.makeText(DeviceInfoActivity.this, R.string.failed_to_load_device, Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<Device> call, @NonNull Throwable t) {
                Toast.makeText(DeviceInfoActivity.this, R.string.network_error, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void loadReports() {
        isLoading = true;
        apiService.getReports(authToken, deviceId, page, PAGE_SIZE).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<PaginatedResponse<DeviceReport>> call, @NonNull Response<PaginatedResponse<DeviceReport>> response) {
                isLoading = false;
                if (response.isSuccessful() && response.body() != null) {
                    totalReports = response.body().count;
                    reportAdapter.addReports(response.body().result);
                }
            }

            @Override
            public void onFailure(@NonNull Call<PaginatedResponse<DeviceReport>> call, @NonNull Throwable t) {
                isLoading = false;
                Toast.makeText(DeviceInfoActivity.this, R.string.failed_to_load_reports, Toast.LENGTH_SHORT).show();
            }
        });
    }
}