package ua.nure.apz.components;

import android.content.Context;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;

public class AnalyticsText extends LinearLayout {
    private final TextView descriptionView;
    private final TextView valueView;

    public AnalyticsText(@NonNull Context context) {
        super(context);

        LayoutParams params = (LayoutParams)getLayoutParams();
        if(params == null)
            params = new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT);
        params.width = LayoutParams.MATCH_PARENT;
        params.height = LayoutParams.WRAP_CONTENT;
        setLayoutParams(params);
        setOrientation(HORIZONTAL);

        descriptionView = new TextView(context);
        params = (LayoutParams) descriptionView.getLayoutParams();
        if(params == null)
            params = new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        params.width = LayoutParams.WRAP_CONTENT;
        params.height = LayoutParams.WRAP_CONTENT;
        descriptionView.setLayoutParams(params);
        addView(descriptionView);

        valueView = new TextView(context);
        params = (LayoutParams)valueView.getLayoutParams();
        if(params == null)
            params = new LayoutParams(0, LayoutParams.WRAP_CONTENT);
        params.width = 0;
        params.weight = 1;
        params.height = LayoutParams.WRAP_CONTENT;
        valueView.setLayoutParams(params);
        valueView.setTextAlignment(TextView.TEXT_ALIGNMENT_VIEW_END);
        addView(valueView);
    }

    public void setDescription(String description) {
        descriptionView.setText(description);
    }

    public void setValue(String value) {
        valueView.setText(value);
    }
}
