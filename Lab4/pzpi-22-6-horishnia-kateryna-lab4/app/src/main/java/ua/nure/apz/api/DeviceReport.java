package ua.nure.apz.api;

import com.google.gson.annotations.SerializedName;

public class DeviceReport {
    private long time;
    private boolean enabled;
    @SerializedName("enabled_for")
    private long enabledFor;

    public DeviceReport(long time, boolean enabled, long enabledFor) {
        this.time = time;
        this.enabled = enabled;
        this.enabledFor = enabledFor;
    }

    public long getTime() {
        return time;
    }

    public void setTime(long time) {
        this.time = time;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public long getEnabledFor() {
        return enabledFor;
    }

    public void setEnabledFor(long enabledFor) {
        this.enabledFor = enabledFor;
    }
}
