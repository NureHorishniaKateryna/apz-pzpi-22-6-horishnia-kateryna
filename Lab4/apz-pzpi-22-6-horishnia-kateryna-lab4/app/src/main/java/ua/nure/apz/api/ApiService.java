package ua.nure.apz.api;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Query;

public interface ApiService {
    @POST("/api/auth/login")
    Call<AuthResponse> login(@Body LoginRequest request);

    @POST("/api/auth/register")
    Call<AuthResponse> register(@Body RegisterRequest request);

    @GET("/api/devices")
    Call<PaginatedResponse<Device>> getDevices(@Header("Token") String authToken, @Query("page") int page, @Query("page_size") int pageSize);

    @POST("/api/devices")
    Call<Device> createDevice(@Header("Token") String authToken, @Body CreateDeviceRequest body);
}
