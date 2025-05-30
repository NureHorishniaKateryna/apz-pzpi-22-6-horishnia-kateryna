package ua.nure.apz.api;

import com.google.gson.annotations.SerializedName;

public class SendFcmTokenRequest {
    @SerializedName("fcm_token")
    private String fcmToken;

    public SendFcmTokenRequest(String fcmToken) {
        this.fcmToken = fcmToken;
    }

    public String getFcmToken() {
        return fcmToken;
    }

    public void setFcmToken(String fcmToken) {
        this.fcmToken = fcmToken;
    }
}
