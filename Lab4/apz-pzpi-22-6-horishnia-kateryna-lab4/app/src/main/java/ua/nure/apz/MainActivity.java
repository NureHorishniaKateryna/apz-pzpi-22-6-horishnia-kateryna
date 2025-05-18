package ua.nure.apz;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import ua.nure.apz.adapters.DeviceAdapter;
import ua.nure.apz.api.ApiClient;
import ua.nure.apz.api.ApiService;
import ua.nure.apz.api.Device;
import ua.nure.apz.api.PaginatedResponse;

public class MainActivity extends AppCompatActivity {
    private final int PAGE_SIZE = 25;

    private String authToken = null;

    private RecyclerView recyclerView;
    private DeviceAdapter adapter;
    private ApiService deviceService;
    private boolean isLoading = false;
    private int page = 1;
    private int totalCount = Integer.MAX_VALUE;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        SharedPreferences prefs = getSharedPreferences("apz", MODE_PRIVATE);
        authToken = prefs.getString("token", null);
        if(authToken == null) {
            startActivity(new Intent(MainActivity.this, LoginActivity.class));
            finish();
        }

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        recyclerView = findViewById(R.id.recyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new DeviceAdapter(new ArrayList<>());
        recyclerView.setAdapter(adapter);

        deviceService = ApiClient.getClient().create(ApiService.class);
        loadDevices();

        recyclerView.addOnScrollListener(new RecyclerView.OnScrollListener() {
            @Override
            public void onScrolled(@NonNull RecyclerView rv, int dx, int dy) {
                super.onScrolled(rv, dx, dy);
                LinearLayoutManager lm = (LinearLayoutManager) rv.getLayoutManager();
                if (!isLoading && lm != null && lm.findLastVisibleItemPosition() >= adapter.getItemCount() - 5) {
                    if (adapter.getItemCount() < totalCount) {
                        page++;
                        loadDevices();
                    }
                }
            }
        });
    }

    private void loadDevices() {
        isLoading = true;
        deviceService.getDevices(authToken, page, PAGE_SIZE).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<PaginatedResponse<Device>> call, @NonNull Response<PaginatedResponse<Device>> response) {
                isLoading = false;
                if (response.isSuccessful() && response.body() != null) {
                    totalCount = response.body().count;
                    adapter.addDevices(response.body().result);
                } else {
                    Toast.makeText(MainActivity.this, "Load failed", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<PaginatedResponse<Device>> call, @NonNull Throwable t) {
                isLoading = false;
                Toast.makeText(MainActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }
}