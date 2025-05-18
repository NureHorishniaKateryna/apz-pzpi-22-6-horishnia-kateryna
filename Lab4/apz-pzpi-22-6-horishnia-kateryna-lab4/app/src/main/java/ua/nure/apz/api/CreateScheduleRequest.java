package ua.nure.apz.api;

import com.google.gson.annotations.SerializedName;

public class CreateScheduleRequest {
    @SerializedName("start_hour")
    private int start;
    @SerializedName("end_hour")
    private int end;

    public CreateScheduleRequest(int start, int end) {
        this.start = start;
        this.end = end;
    }

    public int getStart() {
        return start;
    }

    public void setStart(int start) {
        this.start = start;
    }

    public int getEnd() {
        return end;
    }

    public void setEnd(int end) {
        this.end = end;
    }
}
