package ua.nure.apz;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.InputType;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
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
import ua.nure.apz.api.CreateDeviceRequest;
import ua.nure.apz.api.Device;
import ua.nure.apz.api.PaginatedResponse;

public class MainActivity extends AppCompatActivity {
    private final int PAGE_SIZE = 25;

    private String authToken = null;
    private SharedPreferences prefs = null;

    private RecyclerView recyclerView;
    private DeviceAdapter adapter;
    private ApiService apiService;
    private boolean isLoading = false;
    private int page = 1;
    private int totalCount = Integer.MAX_VALUE;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences("apz", MODE_PRIVATE);
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

        apiService = ApiClient.getClient().create(ApiService.class);
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
        apiService.getDevices(authToken, page, PAGE_SIZE).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<PaginatedResponse<Device>> call, @NonNull Response<PaginatedResponse<Device>> response) {
                isLoading = false;
                if (response.isSuccessful() && response.body() != null) {
                    totalCount = response.body().count;
                    adapter.addDevices(response.body().result);
                } else {
                    Toast.makeText(MainActivity.this, getString(R.string.failed_to_load_devices), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<PaginatedResponse<Device>> call, @NonNull Throwable t) {
                isLoading = false;
                Toast.makeText(MainActivity.this, getString(R.string.network_error), Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == R.id.action_logout) {
            prefs.edit().remove("token").apply();
            startActivity(new Intent(MainActivity.this, LoginActivity.class));
            finish();
            return true;
        } else if (item.getItemId() == R.id.action_create_device) {
            createDevice();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    private void createDevice() {
        AlertDialog.Builder dialog = new AlertDialog.Builder(MainActivity.this);
        dialog.setTitle(R.string.create_device);

        LinearLayout layout = new LinearLayout(MainActivity.this);
        layout.setOrientation(LinearLayout.VERTICAL);

        EditText nameText = new EditText(MainActivity.this);
        nameText.setHint(R.string.name);
        layout.addView(nameText);

        EditText priceText = new EditText(MainActivity.this);
        priceText.setHint(R.string.electricity_price);
        priceText.setInputType(InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_FLAG_DECIMAL);
        layout.addView(priceText);

        dialog.setView(layout);

        dialog.setPositiveButton(R.string.create, (di, _a) -> {
            String name = nameText.getText().toString();
            if(name.isEmpty()) {
                Toast.makeText(MainActivity.this, "Name is required", Toast.LENGTH_SHORT).show();
                return;
            }
            double price;
            try {
                price = Double.parseDouble(priceText.getText().toString());
            } catch(Exception e) {
                Toast.makeText(MainActivity.this, "Invalid electricity price", Toast.LENGTH_SHORT).show();
                return;
            }

            apiService.createDevice(authToken, new CreateDeviceRequest(name, price)).enqueue(new Callback<>() {
                @Override
                public void onResponse(@NonNull Call<Device> call, @NonNull Response<Device> response) {
                    isLoading = false;
                    if (response.isSuccessful() && response.body() != null) {
                        adapter.addDevice(0, response.body());
                    } else {
                        Toast.makeText(MainActivity.this, getString(R.string.failed_to_create_device), Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(@NonNull Call<Device> call, @NonNull Throwable t) {
                    isLoading = false;
                    Toast.makeText(MainActivity.this, getString(R.string.network_error), Toast.LENGTH_SHORT).show();
                }
            });
        });
        dialog.setNegativeButton(R.string.cancel, (di, _a) -> {
            di.dismiss();
        });

        dialog.show();
    }
}