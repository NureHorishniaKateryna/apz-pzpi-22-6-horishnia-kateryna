package ua.nure.apz.api;

import com.google.gson.annotations.SerializedName;

public class DeviceConfiguration {
    @SerializedName("enabled_manually")
    private boolean enabledManually;
    @SerializedName("enabled_auto")
    private boolean enabledAuto;
    @SerializedName("electricity_price")
    private double electricityPrice;

    public DeviceConfiguration(boolean enabledManually, boolean enabledAuto, double electricityPrice) {
        this.enabledManually = enabledManually;
        this.enabledAuto = enabledAuto;
        this.electricityPrice = electricityPrice;
    }

    public boolean getEnabledManually() {
        return enabledManually;
    }
    public void setEnabledManually(boolean value) {
        enabledManually = value;
    }

    public boolean getEnabledAuto() {
        return enabledAuto;
    }
    public void setEnabledAuto(boolean value) {
        enabledAuto = value;
    }

    public double getElectricityPrice() {
        return electricityPrice;
    }
    public void setElectricityPrice(double value) {
        electricityPrice = value;
    }
}
