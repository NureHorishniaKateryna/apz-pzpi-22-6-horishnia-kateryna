package ua.nure.apz.api;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.PATCH;
import retrofit2.http.POST;
import retrofit2.http.Path;
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

    @GET("/api/devices/{deviceId}")
    Call<Device> getDevice(@Header("Token") String authToken, @Path("deviceId") long deviceId);

    @PATCH("/api/devices/{deviceId}")
    Call<Device> updateDevice(@Header("Token") String authToken, @Path("deviceId") long deviceId, @Body UpdateDeviceRequest body);

    @PATCH("/api/devices/{deviceId}/config")
    Call<Device> updateDeviceConfig(@Header("Token") String authToken, @Path("deviceId") long deviceId, @Body UpdateDeviceConfigRequest body);

    @GET("/api/devices/{deviceId}/reports")
    Call<PaginatedResponse<DeviceReport>> getReports(@Header("Token") String authToken, @Path("deviceId") long deviceId, @Query("page") int page, @Query("page_size") int pageSize);

    @GET("/api/devices/{deviceId}/schedule")
    Call<List<ScheduleItem>> getSchedule(@Header("Token") String authToken, @Path("deviceId") long deviceId);

    @POST("/api/devices/{deviceId}/schedule")
    Call<ScheduleItem> addSchedule(@Header("Token") String authToken, @Path("deviceId") long deviceId, @Body CreateScheduleRequest schedule);

    @DELETE("/api/devices/{deviceId}/schedule/{scheduleId}")
    Call<Void> deleteSchedule(@Header("Token") String authToken, @Path("deviceId") long deviceId, @Path("scheduleId") long scheduleId);
}
