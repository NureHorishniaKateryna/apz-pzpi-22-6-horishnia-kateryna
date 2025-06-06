package ua.nure.apz.api;

import com.google.gson.annotations.SerializedName;

public class AnalyticsResponse {
    @SerializedName("this_month")
    private AnalyticsItem thisMonth;
    @SerializedName("last_28_days")
    private AnalyticsItem last28Days;

    public AnalyticsResponse(AnalyticsItem thisMonth, AnalyticsItem last28Days) {
        this.thisMonth = thisMonth;
        this.last28Days = last28Days;
    }

    public AnalyticsItem getThisMonth() {
        return thisMonth;
    }

    public void setThisMonth(AnalyticsItem thisMonth) {
        this.thisMonth = thisMonth;
    }

    public AnalyticsItem getLast28Days() {
        return last28Days;
    }

    public void setLast28Days(AnalyticsItem last28Days) {
        this.last28Days = last28Days;
    }
}
