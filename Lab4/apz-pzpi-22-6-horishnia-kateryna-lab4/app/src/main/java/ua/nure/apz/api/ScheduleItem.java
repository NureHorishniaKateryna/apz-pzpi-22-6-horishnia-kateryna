package ua.nure.apz.api;

import com.google.gson.annotations.SerializedName;

public class ScheduleItem {
    private long id;
    @SerializedName("start_hour")
    private int start;
    @SerializedName("end_hour")
    private int end;

    public ScheduleItem(long id, int start, int end) {
        this.id = id;
        this.start = start;
        this.end = end;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
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
