package ua.nure.apz.api;

public class UpdateDeviceRequest {
    private String name;

    public UpdateDeviceRequest(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
