package ua.nure.apz.api;

public class DeviceConfiguration {
    private boolean enabledManually;
    private boolean enabledAuto;
    private long electricityPrice;

    public DeviceConfiguration(boolean enabledManually, boolean enabledAuto, long electricityPrice) {
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

    public long getElectricityPrice() {
        return electricityPrice;
    }
    public void setElectricityPrice(long value) {
        electricityPrice = value;
    }
}
