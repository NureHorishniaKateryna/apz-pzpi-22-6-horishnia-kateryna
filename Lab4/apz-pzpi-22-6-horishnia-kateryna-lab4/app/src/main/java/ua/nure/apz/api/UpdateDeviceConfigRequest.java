package ua.nure.apz.api;

import com.google.gson.annotations.SerializedName;

public class UpdateDeviceConfigRequest {
    @SerializedName("enabled_manually")
    private Boolean enabledManually;
    @SerializedName("enabled_auto")
    private Boolean enabledAuto;
    @SerializedName("electricity_price")
    private Double electricityPrice;

    public UpdateDeviceConfigRequest(Boolean enabledManually, Boolean enabledAuto, Double electricityPrice) {
        this.enabledManually = enabledManually;
        this.enabledAuto = enabledAuto;
        this.electricityPrice = electricityPrice;
    }

    public Boolean isEnabledManually() {
        return enabledManually;
    }

    public void setEnabledManually(Boolean enabledManually) {
        this.enabledManually = enabledManually;
    }

    public Boolean isEnabledAuto() {
        return enabledAuto;
    }

    public void setEnabledAuto(Boolean enabledAuto) {
        this.enabledAuto = enabledAuto;
    }

    public Double getElectricityPrice() {
        return electricityPrice;
    }

    public void setElectricityPrice(Double electricityPrice) {
        this.electricityPrice = electricityPrice;
    }
}
