package ua.nure.apz;

import android.app.TimePickerDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import ua.nure.apz.adapters.ScheduleAdapter;
import ua.nure.apz.api.ApiClient;
import ua.nure.apz.api.ApiService;
import ua.nure.apz.api.CreateScheduleRequest;
import ua.nure.apz.api.ScheduleItem;

public class DeviceScheduleActivity extends AppCompatActivity {
    private RecyclerView recyclerView;
    private ScheduleAdapter adapter;
    private List<ScheduleItem> scheduleItems = new ArrayList<>();
    private Button addButton;

    private ApiService apiService;
    private long deviceId;
    private String authToken = null;
    private SharedPreferences prefs = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_device_schedule);

        prefs = getSharedPreferences("apz", MODE_PRIVATE);
        authToken = prefs.getString("token", null);
        if(authToken == null) {
            startActivity(new Intent(DeviceScheduleActivity.this, LoginActivity.class));
            finish();
        }

        recyclerView = findViewById(R.id.scheduleRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ScheduleAdapter(scheduleItems, this::deleteScheduleItem, this);
        recyclerView.setAdapter(adapter);

        addButton = findViewById(R.id.addScheduleButton);
        deviceId = getIntent().getLongExtra("deviceId", -1);
        if (deviceId == -1) {
            finish();
            return;
        }

        apiService = ApiClient.getClient().create(ApiService.class);

        loadSchedule();

        addButton.setOnClickListener(v -> showAddScheduleDialog());
    }

    private void loadSchedule() {
        apiService.getSchedule(authToken, deviceId).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<List<ScheduleItem>> call, @NonNull Response<List<ScheduleItem>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    scheduleItems.clear();
                    scheduleItems.addAll(response.body());
                    adapter.notifyDataSetChanged();
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<ScheduleItem>> call, @NonNull Throwable t) {
                Toast.makeText(DeviceScheduleActivity.this, R.string.failed_to_load_schedule, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showAddScheduleDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle(R.string.add_schedule);

        int[] time = new int[2];

        LinearLayout layout = new LinearLayout(DeviceScheduleActivity.this);
        layout.setOrientation(LinearLayout.VERTICAL);

        Button startTimeButton = new Button(DeviceScheduleActivity.this);
        startTimeButton.setText(String.format(getString(R.string.start_time_fmt), 0, 0));
        layout.addView(startTimeButton);

        Button endTimeButton = new Button(DeviceScheduleActivity.this);
        endTimeButton.setText(String.format(getString(R.string.end_time_fmt), 0, 0));
        layout.addView(endTimeButton);

        builder.setView(layout);

        startTimeButton.setOnClickListener(v -> {
            new TimePickerDialog(DeviceScheduleActivity.this, (picker, hour, minute) -> {
                time[0] = hour * 3600 + minute * 60;
                ((Button)v).setText(String.format(getString(R.string.start_time_fmt), hour, minute));
            }, 0, 0, true).show();
        });

        endTimeButton.setOnClickListener(v -> {
            new TimePickerDialog(DeviceScheduleActivity.this, (picker, hour, minute) -> {
                time[1] = hour * 3600 + minute * 60;
                ((Button)v).setText(String.format(getString(R.string.end_time_fmt), hour, minute));
            }, 0, 0, true).show();
        });

        builder.setPositiveButton(R.string.add, (dialog, which) -> {
            CreateScheduleRequest newItem = new CreateScheduleRequest(time[0]/3600, time[1]/3600);

            apiService.addSchedule(authToken, deviceId, newItem).enqueue(new Callback<>() {
                @Override
                public void onResponse(@NonNull Call<ScheduleItem> call, @NonNull Response<ScheduleItem> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        scheduleItems.add(response.body());
                        adapter.notifyItemInserted(scheduleItems.size() - 1);
                    } else {
                        Toast.makeText(DeviceScheduleActivity.this, R.string.add_failed, Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(@NonNull Call<ScheduleItem> call, @NonNull Throwable t) {
                    Toast.makeText(DeviceScheduleActivity.this, R.string.add_failed, Toast.LENGTH_SHORT).show();
                }
            });
        });

        builder.setNegativeButton(R.string.cancel, null);
        builder.show();
    }

    private void deleteScheduleItem(long scheduleId, int position) {
        apiService.deleteSchedule(authToken, deviceId, scheduleId).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<Void> call, @NonNull Response<Void> response) {
                if (response.isSuccessful()) {
                    scheduleItems.remove(position);
                    adapter.notifyItemRemoved(position);
                }
            }

            @Override
            public void onFailure(@NonNull Call<Void> call, @NonNull Throwable t) {
                Toast.makeText(DeviceScheduleActivity.this, R.string.delete_failed, Toast.LENGTH_SHORT).show();
            }
        });
    }
}