package ua.nure.apz.api;

public class Device {
    private long id;
    private String name;
    private String apiKey;
    private DeviceConfiguration configuration;
    private long userId;

    public Device(long id, String name, String apiKey, DeviceConfiguration configuration, long userId) {
        this.id = id;
        this.name = name;
        this.apiKey = apiKey;
        this.configuration = configuration;
        this.userId = userId;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public DeviceConfiguration getConfiguration() {
        return configuration;
    }

    public void setConfiguration(DeviceConfiguration configuration) {
        this.configuration = configuration;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }
}
