package ua.nure.apz.api;

import com.google.gson.annotations.SerializedName;

public class CreateDeviceRequest {
    private String name;
    @SerializedName("electricity_price")
    private double electricityPrice;

    public CreateDeviceRequest(String name, double electricityPrice) {
        this.name = name;
        this.electricityPrice = electricityPrice;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getElectricityPrice() {
        return electricityPrice;
    }

    public void setElectricityPrice(double electricityPrice) {
        this.electricityPrice = electricityPrice;
    }
}
