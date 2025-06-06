package ua.nure.apz.api;

import com.google.gson.annotations.SerializedName;

public class AnalyticsItem {
    @SerializedName("enable_count")
    private int enableCount;
    @SerializedName("total_enabled_time")
    private double totalEnabledTime;
    @SerializedName("average_enabled_time")
    private double averageEnabledTime;
    @SerializedName("electricity_consumption")
    private double electricityConsumption;
    @SerializedName("electricity_price")
    private double electricityPrice;

    public AnalyticsItem(int enableCount, double totalEnabledTime, double averageEnabledTime, double electricityConsumption, double electricityPrice) {
        this.enableCount = enableCount;
        this.totalEnabledTime = totalEnabledTime;
        this.averageEnabledTime = averageEnabledTime;
        this.electricityConsumption = electricityConsumption;
        this.electricityPrice = electricityPrice;
    }

    public int getEnableCount() {
        return enableCount;
    }

    public void setEnableCount(int enableCount) {
        this.enableCount = enableCount;
    }

    public double getTotalEnabledTime() {
        return totalEnabledTime;
    }

    public void setTotalEnabledTime(double totalEnabledTime) {
        this.totalEnabledTime = totalEnabledTime;
    }

    public double getAverageEnabledTime() {
        return averageEnabledTime;
    }

    public void setAverageEnabledTime(double averageEnabledTime) {
        this.averageEnabledTime = averageEnabledTime;
    }

    public double getElectricityConsumption() {
        return electricityConsumption;
    }

    public void setElectricityConsumption(double electricityConsumption) {
        this.electricityConsumption = electricityConsumption;
    }

    public double getElectricityPrice() {
        return electricityPrice;
    }

    public void setElectricityPrice(double electricityPrice) {
        this.electricityPrice = electricityPrice;
    }
}
